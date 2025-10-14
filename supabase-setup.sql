-- Add missing columns to existing teacher_profiles table (if they don't exist)
DO $$ 
BEGIN
  -- Add first_name if it doesn't exist
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name='teacher_profiles' AND column_name='first_name') THEN
    ALTER TABLE teacher_profiles ADD COLUMN first_name TEXT;
  END IF;

  -- Add last_name if it doesn't exist
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name='teacher_profiles' AND column_name='last_name') THEN
    ALTER TABLE teacher_profiles ADD COLUMN last_name TEXT;
  END IF;

  -- Add school_name if it doesn't exist
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name='teacher_profiles' AND column_name='school_name') THEN
    ALTER TABLE teacher_profiles ADD COLUMN school_name TEXT;
  END IF;

  -- Add role if it doesn't exist
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name='teacher_profiles' AND column_name='role') THEN
    ALTER TABLE teacher_profiles ADD COLUMN role TEXT;
  END IF;

  -- Add phone_number if it doesn't exist
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name='teacher_profiles' AND column_name='phone_number') THEN
    ALTER TABLE teacher_profiles ADD COLUMN phone_number TEXT;
  END IF;

  -- Add email if it doesn't exist
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name='teacher_profiles' AND column_name='email') THEN
    ALTER TABLE teacher_profiles ADD COLUMN email TEXT;
  END IF;
END $$;

-- Drop existing insert policy if it exists
DROP POLICY IF EXISTS "Allow insert during signup" ON teacher_profiles;

-- Create a more permissive insert policy for signup
CREATE POLICY "Allow insert during signup"
  ON teacher_profiles
  FOR INSERT
  WITH CHECK (true);

-- Create indexes if they don't exist
CREATE INDEX IF NOT EXISTS teacher_profiles_user_id_idx ON teacher_profiles(user_id);
CREATE INDEX IF NOT EXISTS teacher_profiles_email_idx ON teacher_profiles(email);
CREATE INDEX IF NOT EXISTS teacher_profiles_school_name_idx ON teacher_profiles(school_name);
