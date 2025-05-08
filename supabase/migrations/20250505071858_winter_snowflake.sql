/*
  # Update user table column comments and policies

  1. Changes
    - Add descriptive comments to username and email columns
    - Update existing policies with superuser access

  2. Security
    - Ensure policies handle superuser access correctly
*/

-- Update column comments to reflect UI labels
COMMENT ON COLUMN public.users.username IS 'Display Name';
COMMENT ON COLUMN public.users.email IS 'Email';

-- Drop existing policies to avoid conflicts
DROP POLICY IF EXISTS "Allow public registration" ON public.users;
DROP POLICY IF EXISTS "Superusers can manage all users" ON public.users;
DROP POLICY IF EXISTS "Users can read their profile" ON public.users;

-- Add new policies for user management
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
