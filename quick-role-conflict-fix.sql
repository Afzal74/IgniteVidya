-- Quick fix for the current role conflict issue
-- This will identify and resolve the specific conflict for appuafzal777@gmail.com

-- First, let's see what we're dealing with
SELECT 
    'Current conflict for appuafzal777@gmail.com:' as info,
    s.user_id as student_user_id,
    t.user_id as teacher_user_id,
    s.id as student_profile_id,
    t.id as teacher_profile_id
FROM student_profiles s
FULL OUTER JOIN teacher_profiles t ON s.email = t.email
WHERE COALESCE(s.email, t.email) = 'appuafzal777@gmail.com';

-- Option 1: Keep teacher role, remove student profile
-- Uncomment the following lines if you want to keep the teacher role:

/*
-- Remove student data first
DELETE FROM student_achievements WHERE student_id IN (
    SELECT user_id FROM student_profiles WHERE email = 'appuafzal777@gmail.com'
);

DELETE FROM student_progress WHERE student_id IN (
    SELECT user_id FROM student_profiles WHERE email = 'appuafzal777@gmail.com'
);

DELETE FROM student_quiz_results WHERE student_id IN (
    SELECT user_id FROM student_profiles WHERE email = 'appuafzal777@gmail.com'
);

DELETE FROM student_activities WHERE student_id IN (
    SELECT user_id FROM student_profiles WHERE email = 'appuafzal777@gmail.com'
);

-- Remove student profile
DELETE FROM student_profiles WHERE email = 'appuafzal777@gmail.com';
*/

-- Option 2: Keep student role, remove teacher profile
-- Uncomment the following line if you want to keep the student role:

/*
DELETE FROM teacher_profiles WHERE email = 'appuafzal777@gmail.com';
*/

-- After running one of the above options, verify the fix:
SELECT 
    'After cleanup:' as status,
    COUNT(CASE WHEN s.email IS NOT NULL THEN 1 END) as student_profiles,
    COUNT(CASE WHEN t.email IS NOT NULL THEN 1 END) as teacher_profiles
FROM student_profiles s
FULL OUTER JOIN teacher_profiles t ON s.email = t.email
WHERE COALESCE(s.email, t.email) = 'appuafzal777@gmail.com';

-- Also check for any other role conflicts in the system
SELECT 
    'Other role conflicts in system:' as info,
    COUNT(*) as conflict_count
FROM (
    SELECT s.user_id
    FROM student_profiles s
    INNER JOIN teacher_profiles t ON s.user_id = t.user_id
    WHERE s.email != 'appuafzal777@gmail.com'
) other_conflicts;