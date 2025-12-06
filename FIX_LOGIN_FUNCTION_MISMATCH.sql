-- FIX LOGIN FUNCTION MISMATCH - Create overloaded functions for different calling patterns

-- Drop all existing versions first
DROP FUNCTION IF EXISTS create_student_with_safe_achievements(UUID, TEXT);
DROP FUNCTION IF EXISTS create_student_with_safe_achievements(UUID, TEXT, TEXT);
DROP FUNCTION IF EXISTS create_student_with_safe_achievements(UUID, TEXT, TEXT, TEXT);
DROP FUNCTION IF EXISTS create_student_with_safe_achievements(UUID, TEXT, TEXT, TEXT, INTEGER);
DROP FUNCTION IF EXISTS create_student_with_safe_achievements(UUID, TEXT, TEXT, TEXT, INTEGER, TEXT);
DROP FUNCTION IF EXISTS create_student_with_safe_achievements(UUID, TEXT, TEXT, TEXT, INTEGER, TEXT, TEXT);
DROP FUNCTION IF EXISTS create_student_with_safe_achievements(UUID, TEXT, TEXT, TEXT, INTEGER, TEXT, TEXT, TEXT);
DROP FUNCTION IF EXISTS create_student_with_safe_achievements(UUID, TEXT, TEXT, TEXT, INTEGER, TEXT, TEXT, TEXT, TEXT);
DROP FUNCTION IF EXISTS create_student_with_safe_achievements(UUID, TEXT, TEXT, TEXT, INTEGER, TEXT, TEXT, TEXT, TEXT, TEXT);
DROP FUNCTION IF EXISTS create_student_with_safe_achievements(UUID, TEXT, TEXT, TEXT, INTEGER, TEXT, TEXT, TEXT, TEXT, TEXT, DATE);

-- Create the MAIN function with all parameters
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
    
    -- Create profile with conflict handling
    INSERT INTO student_profiles (
        user_id, email, first_name, last_name, grade, school_name, 
        section, roll_number, phone_number, parent_email, date_of_birth,
        created_at, updated_at
    ) VALUES (
        p_user_id, p_email, p_first_name, p_last_name, p_grade, p_school_name,
        p_section, p_roll_number, p_phone_number, p_parent_email, p_date_of_birth,
        NOW(), NOW()
    ) 
    ON CONFLICT (user_id) DO UPDATE SET
        email = EXCLUDED.email,
        first_name = EXCLUDED.first_name,
        last_name = EXCLUDED.last_name,
        updated_at = NOW()
    RETURNING id INTO profile_id;
    
    -- Create progress data with conflict handling
    INSERT INTO student_progress (student_id, subject, grade, completed_lessons, total_lessons, average_score, weekly_hours, difficulty_level) VALUES
    (p_user_id, 'Mathematics', p_grade, 0, 15, 0, 0, 'beginner'),
    (p_user_id, 'Science', p_grade, 0, 12, 0, 0, 'beginner'),
    (p_user_id, 'English', p_grade, 0, 12, 0, 0, 'beginner')
    ON CONFLICT (student_id, subject) DO NOTHING;
    
    -- BULLETPROOF achievement creation with exception handling
    BEGIN
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
    EXCEPTION 
        WHEN unique_violation THEN
            -- Achievement already exists, that's fine
            NULL;
        WHEN OTHERS THEN
            -- Log the error but don't fail the whole function
            RAISE NOTICE 'Achievement creation failed: %', SQLERRM;
    END;
    
    -- Confirm email
    UPDATE auth.users SET email_confirmed_at = NOW(), updated_at = NOW() WHERE id = p_user_id;
    
    result := json_build_object('success', true, 'profile_id', COALESCE(profile_id, existing_profile), 'action', 'created');
    RETURN result;
    
EXCEPTION WHEN OTHERS THEN
    result := json_build_object('success', false, 'error', SQLERRM, 'detail', SQLSTATE);
    RETURN result;
END;
$$;

-- Create the SIMPLE function that matches the login page call (5 parameters)
CREATE OR REPLACE FUNCTION create_student_with_safe_achievements(
    p_user_id UUID,
    p_email TEXT,
    p_first_name TEXT,
    p_last_name TEXT,
    p_grade INTEGER
)
RETURNS JSON
SECURITY DEFINER
LANGUAGE plpgsql
AS $$
BEGIN
    -- Call the main function with defaults for missing parameters
    RETURN create_student_with_safe_achievements(
        p_user_id, 
        p_email, 
        p_first_name, 
        p_last_name, 
        p_grade,
        'School',  -- p_school_name
        'A',       -- p_section
        '001',     -- p_roll_number
        NULL,      -- p_phone_number
        NULL,      -- p_parent_email
        NULL       -- p_date_of_birth
    );
END;
$$;

-- Grant permissions to both functions
GRANT EXECUTE ON FUNCTION create_student_with_safe_achievements(UUID, TEXT, TEXT, TEXT, INTEGER, TEXT, TEXT, TEXT, TEXT, TEXT, DATE) TO authenticated, anon;
GRANT EXECUTE ON FUNCTION create_student_with_safe_achievements(UUID, TEXT, TEXT, TEXT, INTEGER) TO authenticated, anon;

-- Test the function that the login page is calling
DO $$
DECLARE
    test_result JSON;
BEGIN
    RAISE NOTICE 'Testing 5-parameter function (matches login page call)...';
    
    -- This should work without errors
    SELECT create_student_with_safe_achievements(
        gen_random_uuid(),
        'test@example.com',
        'Test',
        'User',
        6
    ) INTO test_result;
    
    RAISE NOTICE 'Test result: %', test_result;
    RAISE NOTICE 'Function overloading setup complete!';
END $$;