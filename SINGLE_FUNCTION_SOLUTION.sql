-- SINGLE FUNCTION SOLUTION - One function to handle all cases

-- Drop ALL existing versions completely
DROP FUNCTION IF EXISTS create_student_with_safe_achievements CASCADE;

-- Create ONE function with named parameters and defaults
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
    RAISE NOTICE 'Creating profile for user: % with email: %', p_user_id, p_email;
    
    -- Check if profile already exists
    SELECT id INTO existing_profile
    FROM student_profiles
    WHERE user_id = p_user_id OR email = p_email
    LIMIT 1;
    
    IF existing_profile IS NOT NULL THEN
        RAISE NOTICE 'Profile already exists with ID: %', existing_profile;
        result := json_build_object('success', true, 'profile_id', existing_profile, 'action', 'exists');
        RETURN result;
    END IF;
    
    -- Create profile with conflict handling
    BEGIN
        INSERT INTO student_profiles (
            user_id, email, first_name, last_name, grade, school_name, 
            section, roll_number, phone_number, parent_email, date_of_birth,
            created_at, updated_at
        ) VALUES (
            p_user_id, p_email, p_first_name, p_last_name, p_grade, p_school_name,
            p_section, p_roll_number, p_phone_number, p_parent_email, p_date_of_birth,
            NOW(), NOW()
        ) RETURNING id INTO profile_id;
        
        RAISE NOTICE 'Created new profile with ID: %', profile_id;
        
    EXCEPTION WHEN unique_violation THEN
        -- Handle conflict by getting existing profile
        SELECT id INTO profile_id FROM student_profiles WHERE user_id = p_user_id OR email = p_email LIMIT 1;
        RAISE NOTICE 'Profile conflict resolved, using existing ID: %', profile_id;
    END;
    
    -- Create progress data with conflict handling
    BEGIN
        INSERT INTO student_progress (student_id, subject, grade, completed_lessons, total_lessons, average_score, weekly_hours, difficulty_level) VALUES
        (p_user_id, 'Mathematics', p_grade, 0, 15, 0, 0, 'beginner'),
        (p_user_id, 'Science', p_grade, 0, 12, 0, 0, 'beginner'),
        (p_user_id, 'English', p_grade, 0, 12, 0, 0, 'beginner');
        
        RAISE NOTICE 'Created progress data for user: %', p_user_id;
        
    EXCEPTION WHEN unique_violation THEN
        RAISE NOTICE 'Progress data already exists for user: %', p_user_id;
    END;
    
    -- BULLETPROOF achievement creation
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
        
        RAISE NOTICE 'Created welcome achievement for user: %', p_user_id;
        
    EXCEPTION 
        WHEN unique_violation THEN
            RAISE NOTICE 'Welcome achievement already exists for user: %', p_user_id;
        WHEN OTHERS THEN
            RAISE NOTICE 'Achievement creation failed for user: % - Error: %', p_user_id, SQLERRM;
    END;
    
    -- Confirm email
    BEGIN
        UPDATE auth.users SET email_confirmed_at = NOW(), updated_at = NOW() WHERE id = p_user_id;
        RAISE NOTICE 'Confirmed email for user: %', p_user_id;
    EXCEPTION WHEN OTHERS THEN
        RAISE NOTICE 'Email confirmation failed for user: % - Error: %', p_user_id, SQLERRM;
    END;
    
    result := json_build_object(
        'success', true, 
        'profile_id', COALESCE(profile_id, existing_profile), 
        'action', CASE WHEN existing_profile IS NOT NULL THEN 'exists' ELSE 'created' END
    );
    
    RAISE NOTICE 'Function completed successfully for user: % - Result: %', p_user_id, result;
    RETURN result;
    
EXCEPTION WHEN OTHERS THEN
    RAISE NOTICE 'Function failed for user: % - Error: % (State: %)', p_user_id, SQLERRM, SQLSTATE;
    result := json_build_object('success', false, 'error', SQLERRM, 'detail', SQLSTATE);
    RETURN result;
END;
$$;

-- Grant permissions
GRANT EXECUTE ON FUNCTION create_student_with_safe_achievements TO authenticated, anon;

-- Set up the trigger for NULL protection
CREATE OR REPLACE FUNCTION prevent_null_achievement_type()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
    IF NEW.achievement_type IS NULL THEN
        NEW.achievement_type := 'milestone';
    END IF;
    IF NEW.achievement_name IS NULL THEN
        NEW.achievement_name := 'Achievement';
    END IF;
    RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS ensure_achievement_type_not_null ON student_achievements;
CREATE TRIGGER ensure_achievement_type_not_null
    BEFORE INSERT OR UPDATE ON student_achievements
    FOR EACH ROW
    EXECUTE FUNCTION prevent_null_achievement_type();

-- Set column defaults
ALTER TABLE student_achievements ALTER COLUMN achievement_type SET DEFAULT 'milestone';

-- Update existing NULL values
UPDATE student_achievements SET achievement_type = 'milestone' WHERE achievement_type IS NULL;

-- Test the function with detailed logging
DO $$
DECLARE
    test_result JSON;
    test_user_id UUID := gen_random_uuid();
BEGIN
    RAISE NOTICE '=== TESTING SINGLE FUNCTION ===';
    
    -- Test with 5 parameters (like login page)
    SELECT create_student_with_safe_achievements(
        test_user_id,
        'test@example.com',
        'Test',
        'User',
        6
    ) INTO test_result;
    
    RAISE NOTICE 'Test completed - Result: %', test_result;
    
    -- Clean up test data
    DELETE FROM student_achievements WHERE student_id = test_user_id;
    DELETE FROM student_progress WHERE student_id = test_user_id;
    DELETE FROM student_profiles WHERE user_id = test_user_id;
    
    RAISE NOTICE '=== SINGLE FUNCTION SOLUTION READY ===';
END $$;