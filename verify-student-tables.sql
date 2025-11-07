-- Quick verification query to check if student tables exist
-- Run this in Supabase SQL Editor after running the main setup

-- Check if student_profiles table exists and show its structure
SELECT 
    column_name, 
    data_type, 
    is_nullable
FROM information_schema.columns 
WHERE table_name = 'student_profiles' 
    AND table_schema = 'public'
ORDER BY ordinal_position;

-- Check if the table has any data
SELECT COUNT(*) as student_count FROM student_profiles;

-- List all student-related tables
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
    AND table_name LIKE '%student%'
ORDER BY table_name;