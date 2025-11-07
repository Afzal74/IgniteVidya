-- Fix RLS policy for student profiles (run after login works)

-- Re-enable RLS
ALTER TABLE student_profiles ENABLE ROW LEVEL SECURITY;

-- Drop old policies
DROP POLICY IF EXISTS "Students can view own profile" ON student_profiles;
DROP POLICY IF EXISTS "Students can update own profile" ON student_profiles;

-- Create better policies that work with login
CREATE POLICY "Students can view own profile"
  ON student_profiles FOR SELECT
  USING (auth.uid() = user_id OR auth.email() = email);

CREATE POLICY "Students can update own profile"
  ON student_profiles FOR UPDATE
  USING (auth.uid() = user_id OR auth.email() = email);

-- Keep the insert policy as is
-- (it's already working for signup)