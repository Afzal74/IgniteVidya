-- Debug student profile lookup
-- Run this to see what's in the database

-- Check all student profiles
SELECT id, user_id, email, first_name, last_name 
FROM student_profiles 
ORDER BY created_at DESC;

-- Check if RLS is blocking the query
-- Try to find the specific profile
SELECT id, user_id, email, first_name, last_name 
FROM student_profiles 
WHERE email = 'shryeasanil@gmail.com';

-- Check auth.users table to see the user_id
SELECT id, email, email_confirmed_at, created_at
FROM auth.users 
WHERE email = 'shryeasanil@gmail.com';

-- Check RLS policies on student_profiles
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual
FROM pg_policies 
WHERE tablename = 'student_profiles';