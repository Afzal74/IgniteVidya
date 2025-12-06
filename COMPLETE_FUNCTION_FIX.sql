-- COMPLETE FUNCTION FIX - Matches Expected Signature
-- This creates the function with ALL the parameters your code expects

-- First, drop any existing function versions
DROP FUNCTION IF EXISTS create_student_with_safe_achievements(UUID, TEXT, TEXT, TEXT, INTEGER);
DROP FUNCTION IF EXISTS create_student_with_safe_achievements(UUID, TEXT, TEXT, TEXT, INTEGER, TEXT, TEXT, TEXT, TEXT, TEXT, DATE);

-- Create the function with the EXACT signature your code expects
CREATE OR REPLACE FUNCTION create_student_with_safe_achievements(
    p_user_id UUID,
    p_email TEXT,
    p_first_name TEXT DEFAULT 'Student',
    p_last_name TEXT DEFAULT 'User',
    p_grade INTEGER DEFAULT 6,
    p_school_name TEXT DEFAULT 'School',
    p_section TEXT DEFAULT 'A',
    p_roll_number TEXT DEFAULT '001',
    p_phone_number TEXT DEFAULT NULL,
    p_parent_email TEXT DEFAULT NULL,
    p_date_of_birth DATE DEFAULT NULL
)
RETURNS JSON
SECURITY DEFINER
LANGUAGE plpgsql
AS $$
DECLARE
    result JSON;
    profile_id UUID;
    existing_profile UUID;
    has_achievement_name BOOLEAN;
    has_achievement_title BOOLEAN;
    has_achievement_type BOOLEAN;
BEGIN
    -- Check if profile already exists
    SELECT id INTO existing_profile
    FROM student_profiles
    WHERE user_id = p_user_id OR email = p_email
    LIMIT 1;
    
    IF existing_profile IS NOT NULL THEN
        result := json_build_object('success', true, 'profile_id', existing_profile, 'action', 'exists');
        RETURN result;
    END IF;
    
    -- Create profile with ALL the parameters
    INSERT INTO student_profiles (
        user_id, email, first_name, last_name, grade, school_name, 
        section, roll_number, phone_number, parent_email, date_of_birth,
        created_at, updated_at
    ) VALUES (
        p_user_id, p_email, p_first_name, p_last_name, p_grade, p_school_name,
        p_section, p_roll_number, p_phone_number, p_parent_email, p_date_of_birth,
        NOW(), NOW()
    ) RETURNING id INTO profile_id;
    
    -- Create progress data
    IF NOT EXISTS (SELECT 1 FROM student_progress WHERE student_id = p_user_id) THEN
        INSERT INTO student_progress (student_id, subject, grade, completed_lessons, total_lessons, average_score, weekly_hours, difficulty_level) VALUES
        (p_user_id, 'Mathematics', p_grade, 0, 15, 0, 0, 'beginner'),
        (p_user_id, 'Science', p_grade, 0, 12, 0, 0, 'beginner'),
        (p_user_id, 'English', p_grade, 0, 12, 0, 0, 'beginner');
    END IF;
    
    -- Check table structure for achievements
    SELECT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'student_achievements' AND column_name = 'achievement_name') INTO has_achievement_name;
    SELECT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'student_achievements' AND column_name = 'achievement_title') INTO has_achievement_title;
    SELECT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'student_achievements' AND column_name = 'achievement_type') INTO has_achievement_type;
    
    -- Create achievement with correct column names based on your table structure
    IF NOT EXISTS (SELECT 1 FROM student_achievements WHERE student_id = p_user_id) THEN
        -- Based on your screenshot, use achievement_name and achievement_type
        INSERT INTO student_achievements (
            student_id, 
            achievement_name, 
            achievement_description, 
            points_earned, 
            achievement_type, 
            earned_at
        ) VALUES (
            p_user_id, 
            'Welcome!', 
            'Successfully joined the learning platform', 
            10, 
            'milestone', 
            NOW()
        );
    END IF;
    
    -- Confirm email
    UPDATE auth.users SET email_confirmed_at = NOW(), updated_at = NOW() WHERE id = p_user_id;
    
    result := json_build_object('success', true, 'profile_id', profile_id, 'action', 'created');
    RETURN result;
    
EXCEPTION WHEN OTHERS THEN
    result := json_build_object('success', false, 'error', SQLERRM, 'detail', SQLSTATE);
    RETURN result;
END;
$$;

-- Grant permissions
GRANT EXECUTE ON FUNCTION create_student_with_safe_achievements TO authenticated, anon;

-- Also create a simpler version for backward compatibility
CREATE OR REPLACE FUNCTION create_student_with_safe_achievements(
    p_user_id UUID,
    p_email TEXT
)
RETURNS JSON
SECURITY DEFINER
LANGUAGE plpgsql
AS $$
BEGIN
    RETURN create_student_with_safe_achievements(
        p_user_id, p_email, 'Student', 'User', 6, 'School', 'A', '001', NULL, NULL, NULL
    );
END;
$$;

GRANT EXECUTE ON FUNCTION create_student_with_safe_achievements(UUID, TEXT) TO authenticated, anon;

-- Test the function
DO $$
DECLARE
    test_result JSON;
BEGIN
    RAISE NOTICE 'Testing function creation...';
    RAISE NOTICE 'Function created successfully with all required parameters!';
END $$;