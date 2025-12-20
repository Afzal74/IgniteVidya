-- Fix Role Conflicts: Clean up users who have both student and teacher profiles
-- This script identifies and helps resolve role conflicts

-- First, let's identify users with role conflicts
SELECT 
    COALESCE(s.user_id, t.user_id) as user_id,
    COALESCE(s.email, t.email) as email,
    s.id as student_profile_id,
    t.id as teacher_profile_id,
    s.first_name as student_name,
    t.first_name as teacher_name
FROM student_profiles s
FULL OUTER JOIN teacher_profiles t ON s.user_id = t.user_id
WHERE s.user_id IS NOT NULL AND t.user_id IS NOT NULL;

-- Create a function to resolve role conflicts
CREATE OR REPLACE FUNCTION resolve_role_conflict(
    p_user_id UUID,
    p_keep_role TEXT -- 'student' or 'teacher'
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    -- Validate input
    IF p_keep_role NOT IN ('student', 'teacher') THEN
        RAISE EXCEPTION 'Invalid role. Must be either student or teacher';
    END IF;

    -- Check if user actually has both profiles
    IF NOT EXISTS (
        SELECT 1 FROM student_profiles WHERE user_id = p_user_id
    ) OR NOT EXISTS (
        SELECT 1 FROM teacher_profiles WHERE user_id = p_user_id
    ) THEN
        RAISE EXCEPTION 'User does not have role conflict';
    END IF;

    IF p_keep_role = 'student' THEN
        -- Remove teacher profile
        DELETE FROM teacher_profiles WHERE user_id = p_user_id;
        
        RAISE NOTICE 'Removed teacher profile for user %', p_user_id;
    ELSE
        -- Remove student profile and all related data
        DELETE FROM student_achievements WHERE student_id = p_user_id;
        DELETE FROM student_progress WHERE student_id = p_user_id;
        DELETE FROM student_quiz_results WHERE student_id = p_user_id;
        DELETE FROM student_activities WHERE student_id = p_user_id;
        DELETE FROM student_profiles WHERE user_id = p_user_id;
        
        RAISE NOTICE 'Removed student profile and data for user %', p_user_id;
    END IF;

    RETURN TRUE;
EXCEPTION
    WHEN OTHERS THEN
        RAISE EXCEPTION 'Error resolving role conflict: %', SQLERRM;
        RETURN FALSE;
END;
$$;

-- Create a function to prevent role conflicts during profile creation
CREATE OR REPLACE FUNCTION prevent_role_conflict()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
    -- Check if user already has a profile in the other table
    IF TG_TABLE_NAME = 'student_profiles' THEN
        IF EXISTS (SELECT 1 FROM teacher_profiles WHERE user_id = NEW.user_id) THEN
            RAISE EXCEPTION 'User already has a teacher profile. Cannot create student profile.';
        END IF;
    ELSIF TG_TABLE_NAME = 'teacher_profiles' THEN
        IF EXISTS (SELECT 1 FROM student_profiles WHERE user_id = NEW.user_id) THEN
            RAISE EXCEPTION 'User already has a student profile. Cannot create teacher profile.';
        END IF;
    END IF;
    
    RETURN NEW;
END;
$$;

-- Create triggers to prevent future role conflicts
DROP TRIGGER IF EXISTS prevent_student_role_conflict ON student_profiles;
CREATE TRIGGER prevent_student_role_conflict
    BEFORE INSERT ON student_profiles
    FOR EACH ROW
    EXECUTE FUNCTION prevent_role_conflict();

DROP TRIGGER IF EXISTS prevent_teacher_role_conflict ON teacher_profiles;
CREATE TRIGGER prevent_teacher_role_conflict
    BEFORE INSERT ON teacher_profiles
    FOR EACH ROW
    EXECUTE FUNCTION prevent_role_conflict();

-- Example usage to resolve conflicts (uncomment and modify as needed):
-- To keep student role for a specific user:
-- SELECT resolve_role_conflict('user-uuid-here', 'student');

-- To keep teacher role for a specific user:
-- SELECT resolve_role_conflict('user-uuid-here', 'teacher');

-- Check for any remaining conflicts after cleanup
SELECT 
    'Role conflicts remaining:' as status,
    COUNT(*) as count
FROM (
    SELECT s.user_id
    FROM student_profiles s
    INNER JOIN teacher_profiles t ON s.user_id = t.user_id
) conflicts;