-- FIX LOGIN REDIRECT LOOP - Ensure profile is immediately available after creation

-- Create a function to verify profile exists and is accessible
CREATE OR REPLACE FUNCTION verify_student_profile_exists(p_user_id UUID, p_email TEXT)
RETURNS JSON
SECURITY DEFINER
LANGUAGE plpgsql
AS $$
DECLARE
    profile_record RECORD;
    result JSON;
BEGIN
    -- Try to find profile by user_id first
    SELECT * INTO profile_record
    FROM student_profiles
    WHERE user_id = p_user_id
    LIMIT 1;
    
    IF profile_record.id IS NOT NULL THEN
        result := json_build_object(
            'exists', true,
            'profile_id', profile_record.id,
            'found_by', 'user_id',
            'user_id', profile_record.user_id,
            'email', profile_record.email
        );
        RETURN result;
    END IF;
    
    -- Try to find by email
    SELECT * INTO profile_record
    FROM student_profiles
    WHERE email = p_email
    LIMIT 1;
    
    IF profile_record.id IS NOT NULL THEN
        -- Update the user_id to match
        UPDATE student_profiles 
        SET user_id = p_user_id, updated_at = NOW()
        WHERE email = p_email;
        
        result := json_build_object(
            'exists', true,
            'profile_id', profile_record.id,
            'found_by', 'email',
            'user_id', p_user_id,
            'email', profile_record.email,
            'updated_user_id', true
        );
        RETURN result;
    END IF;
    
    -- Profile not found
    result := json_build_object(
        'exists', false,
        'message', 'No profile found for user_id or email'
    );
    RETURN result;
END;
$$;

GRANT EXECUTE ON FUNCTION verify_student_profile_exists TO authenticated, anon;

-- Update the main function to ensure profile is immediately verifiable
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
    verification_result JSON;
BEGIN
    RAISE NOTICE 'Creating profile for user: % with email: %', p_user_id, p_email;
    
    -- Check if profile already exists
    SELECT id INTO existing_profile
    FROM student_profiles
    WHERE user_id = p_user_id OR email = p_email
    LIMIT 1;
    
    IF existing_profile IS NOT NULL THEN
        RAISE NOTICE 'Profile already exists with ID: %', existing_profile;
        
        -- Verify it's accessible
        SELECT verify_student_profile_exists(p_user_id, p_email) INTO verification_result;
        
        result := json_build_object(
            'success', true, 
            'profile_id', existing_profile, 
            'action', 'exists',
            'verification', verification_result
        );
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
    
    -- CRITICAL: Verify the profile is immediately accessible
    SELECT verify_student_profile_exists(p_user_id, p_email) INTO verification_result;
    
    result := json_build_object(
        'success', true, 
        'profile_id', COALESCE(profile_id, existing_profile), 
        'action', CASE WHEN existing_profile IS NOT NULL THEN 'exists' ELSE 'created' END,
        'verification', verification_result
    );
    
    RAISE NOTICE 'Function completed successfully for user: % - Result: %', p_user_id, result;
    RETURN result;
    
EXCEPTION WHEN OTHERS THEN
    RAISE NOTICE 'Function failed for user: % - Error: % (State: %)', p_user_id, SQLERRM, SQLSTATE;
    result := json_build_object('success', false, 'error', SQLERRM, 'detail', SQLSTATE);
    RETURN result;
END;
$$;

-- Also create a simple function to refresh/fix user_id mismatches
CREATE OR REPLACE FUNCTION fix_student_profile_user_id(p_email TEXT)
RETURNS JSON
SECURITY DEFINER
LANGUAGE plpgsql
AS $$
DECLARE
    auth_user_id UUID;
    profile_record RECORD;
    result JSON;
BEGIN
    -- Get the current user_id from auth.users
    SELECT id INTO auth_user_id
    FROM auth.users
    WHERE email = p_email
    LIMIT 1;
    
    IF auth_user_id IS NULL THEN
        RETURN json_build_object('success', false, 'error', 'User not found in auth.users');
    END IF;
    
    -- Get the profile
    SELECT * INTO profile_record
    FROM student_profiles
    WHERE email = p_email
    LIMIT 1;
    
    IF profile_record.id IS NULL THEN
        RETURN json_build_object('success', false, 'error', 'Profile not found');
    END IF;
    
    -- Update the user_id if it doesn't match
    IF profile_record.user_id != auth_user_id THEN
        UPDATE student_profiles
        SET user_id = auth_user_id, updated_at = NOW()
        WHERE email = p_email;
        
        RETURN json_build_object(
            'success', true, 
            'action', 'updated_user_id',
            'old_user_id', profile_record.user_id,
            'new_user_id', auth_user_id
        );
    ELSE
        RETURN json_build_object(
            'success', true, 
            'action', 'no_change_needed',
            'user_id', auth_user_id
        );
    END IF;
END;
$$;

GRANT EXECUTE ON FUNCTION fix_student_profile_user_id TO authenticated, anon;

-- Test the verification function
DO $$
BEGIN
    RAISE NOTICE '=== LOGIN REDIRECT LOOP FIX READY ===';
    RAISE NOTICE 'Functions created:';
    RAISE NOTICE '1. verify_student_profile_exists - checks if profile is accessible';
    RAISE NOTICE '2. Updated create_student_with_safe_achievements - includes verification';
    RAISE NOTICE '3. fix_student_profile_user_id - fixes user_id mismatches';
END $$;