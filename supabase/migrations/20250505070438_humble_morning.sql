/*
  # Update users table and policies

  1. Changes
    - Add new insert policy for public registration
    - Add new policy for superusers to manage all users
    - Add policy for users to read their own data
*/

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
