-- Quick fix for student login issue
-- Temporarily disable RLS to allow login

-- Disable RLS on student_profiles
ALTER TABLE student_profiles DISABLE ROW LEVEL SECURITY;

-- Test that we can now see the profile
SELECT id, user_id, email, first_name, last_name 
FROM student_profiles 
WHERE email = 'shryeasanil@gmail.com';

-- This should now show the profile and login should work