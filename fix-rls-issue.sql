-- Temporarily disable RLS on student_profiles to test login
-- This will help us debug if RLS is the issue

-- Disable RLS temporarily
ALTER TABLE student_profiles DISABLE ROW LEVEL SECURITY;

-- Test query - this should now work
SELECT id, user_id, email, first_name, last_name 
FROM student_profiles 
WHERE email = 'shryeasanil@gmail.com';

-- Re-enable RLS after testing (run this after login works)
-- ALTER TABLE student_profiles ENABLE ROW LEVEL SECURITY;