-- Check what columns actually exist in student_profiles table
-- Run this to see the real table structure

SELECT column_name, data_type, is_nullable
FROM information_schema.columns 
WHERE table_name = 'student_profiles' 
  AND table_schema = 'public'
ORDER BY ordinal_position;

-- Also check if the table exists at all
SELECT EXISTS (
   SELECT FROM information_schema.tables 
   WHERE table_schema = 'public' 
   AND table_name = 'student_profiles'
) as table_exists;