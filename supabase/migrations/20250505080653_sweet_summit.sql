/*
  # Fix users table and policies

  1. Changes
    - Drop existing users table if it exists
    - Create new users table with correct structure
    - Set up appropriate RLS policies
    - Add trigger for handling new user registration

  2. Security
    - Enable RLS
    - Add policies for user access control
*/

-- Drop existing table and related objects
DROP TABLE IF EXISTS public.users CASCADE;

-- Create new users table
CREATE TABLE public.users (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  username text UNIQUE NOT NULL,
  email text UNIQUE NOT NULL,
  password_hash text NOT NULL,
  superuser boolean DEFAULT false,
  configuration jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Allow public registration" ON public.users
  FOR INSERT
  TO public
  WITH CHECK (true);

CREATE POLICY "Users can read own data" ON public.users
  FOR SELECT
  TO authenticated
  USING (auth.uid() = id OR superuser = true);

CREATE POLICY "Users can update own data" ON public.users
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- Function to handle new user registration
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.users (id, email, username, password_hash)
  VALUES (
    new.id,
    new.email,
    COALESCE(new.raw_user_meta_data->>'username', new.email),
    'MANAGED_BY_SUPABASE_AUTH'
  );
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Drop existing trigger if it exists
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- Create trigger for new user registration
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();
