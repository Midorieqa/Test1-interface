/*
  # Update user profile system

  1. Changes
    - Add descriptive column comments
    - Update RLS policies for better access control
    - Drop existing policies to avoid conflicts

  2. Security
    - Ensure proper RLS policies for user access
    - Allow public registration
    - Enable superuser management
*/

-- Update column comments to reflect UI labels
COMMENT ON COLUMN public.users.username IS 'Display Name';
COMMENT ON COLUMN public.users.email IS 'Email';

-- Drop existing policies to avoid conflicts
DROP POLICY IF EXISTS "Allow public registration" ON public.users;
DROP POLICY IF EXISTS "Superusers can manage all users" ON public.users;
DROP POLICY IF EXISTS "Users can read their profile" ON public.users;
DROP POLICY IF EXISTS "Users can read own data" ON public.users;
DROP POLICY IF EXISTS "Users can update own data" ON public.users;

-- Add comprehensive policies for user management
CREATE POLICY "Allow public registration" ON public.users
  FOR INSERT
  TO public
  WITH CHECK (true);

CREATE POLICY "Superusers can manage all users" ON public.users
  FOR ALL
  TO authenticated
  USING (superuser = true)
  WITH CHECK (superuser = true);

CREATE POLICY "Users can read their profile" ON public.users
  FOR SELECT
  TO authenticated
  USING (
    auth.uid() = id OR superuser = true
  );

CREATE POLICY "Users can update their own profile" ON public.users
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);
