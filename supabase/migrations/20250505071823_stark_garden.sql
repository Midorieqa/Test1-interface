/*
  # Update user management policies and labels

  1. Changes
    - Add policies for user management
    - Update column comments to reflect UI labels

  2. Security
    - Allow public registration
    - Enable superuser management
    - Allow users to read their own profile
*/

-- Update column comments to reflect UI labels
COMMENT ON COLUMN public.users.username IS 'Display Name';
COMMENT ON COLUMN public.users.email IS 'Email';

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

-- Add policy for users to read their own profile
CREATE POLICY "Users can read their profile" ON public.users
  FOR SELECT
  TO authenticated
  USING (
    auth.uid() = id OR superuser = true
  );
