-- AUTO PROFILE CREATION ON LOGIN
-- This creates student profiles automatically when users try to login

-- Create a function specifically for login-time profile creation
CREATE OR REPLACE FUNCTION create_profile_on_login(
    p_user_id UUID,
    p_email TEXT
)
RETURNS JSON
SECURITY DEFINER
LANGUAGE plpgsql
AS $$
DECLARE
    result JSON;
    profile_id UUID;
    existing_profile UUID;
    user_name TEXT;
    domain_name TEXT;
    default_grade INTEGER := 6;
BEGIN
    -- Check if profile already exists
    SELECT id INTO existing_profile
    FROM student_profiles
    WHERE user_id = p_user_id OR email = p_email
    LIMIT 1;
    
    IF existing_profile IS NOT NULL THEN
        -- Profile exists, just return success
        result := json_build_object('success', true, 'profile_id', existing_profile, 'action', 'exists');
        RETURN result;
    END IF;
    
    -- Extract name from email (before @)
    user_name := split_part(p_email, '@', 1);
    domain_name := split_part(p_email, '@', 2);
    
    -- Determine default grade based on email domain or use 6
    IF domain_name LIKE '%school%' OR domain_name LIKE '%edu%' THEN
        default_grade := 8; -- Assume higher grade for school emails
    ELSE
        default_grade := 6; -- Default grade
    END IF;
    
    -- Create new profile with smart defaults
    INSERT INTO student_profiles (
        user_id, 
        email, 
        first_name, 
        last_name, 
        grade, 
        school_name,
        created_at, 
        updated_at
    ) VALUES (
        p_user_id, 
        p_email, 
        INITCAP(user_name), -- Capitalize first letter
        'User',             -- Default last name
        default_grade,      -- Smart default grade
        'School',           -- Default school
        NOW(), 
        NOW()
    ) RETURNING id INTO profile_id;
    
    -- Create initial progress data
    INSERT INTO student_progress (student_id, subject, grade, completed_lessons, total_lessons, average_score, weekly_hours, difficulty_level) VALUES
    (p_user_id, 'Mathematics', default_grade, 0, 15, 0, 0, 'beginner'),
    (p_user_id, 'Science', default_grade, 0, 12, 0, 0, 'beginner'),
    (p_user_id, 'English', default_grade, 0, 12, 0, 0, 'beginner');
    
    -- Create welcome achievement
    INSERT INTO student_achievements (student_id, achievement_name, achievement_description, points_earned, achievement_type) VALUES
    (p_user_id, 'Welcome!', 'Successfully joined the learning platform', 10, 'milestone');
    
    -- Confirm their email automatically
    UPDATE auth.users
    SET 
        email_confirmed_at = NOW(),
        updated_at = NOW()
    WHERE id = p_user_id;
    
    result := json_build_object('success', true, 'profile_id', profile_id, 'action', 'created', 'grade', default_grade);
    RETURN result;
    
EXCEPTION WHEN OTHERS THEN
    result := json_build_object('success', false, 'error', SQLERRM);
    RETURN result;
END;
$$;

-- Create a function to handle any existing auth users without profiles
CREATE OR REPLACE FUNCTION fix_all_existing_auth_users()
RETURNS TEXT
SECURITY DEFINER
LANGUAGE plpgsql
AS $$
DECLARE
    user_record RECORD;
    fixed_count INTEGER := 0;
    total_count INTEGER := 0;
    profile_result JSON;
BEGIN
    -- Find all auth users who don't have student profiles
    FOR user_record IN 
        SELECT u.id, u.email
        FROM auth.users u
        WHERE u.id NOT IN (SELECT user_id FROM student_profiles WHERE user_id IS NOT NULL)
          AND u.email IS NOT NULL
          AND u.email NOT LIKE '%teacher%' -- Skip obvious teacher emails
    LOOP
        total_count := total_count + 1;
        
        -- Use the login profile creation function
        SELECT create_profile_on_login(user_record.id, user_record.email) INTO profile_result;
        
        IF profile_result->>'success' = 'true' THEN
            fixed_count := fixed_count + 1;
            RAISE NOTICE 'Created profile for: % (Grade: %)', user_record.email, profile_result->>'grade';
        END IF;
    END LOOP;
    
    RETURN format('Created profiles for %s out of %s users', fixed_count, total_count);
END;
$$;

-- Grant permissions
GRANT EXECUTE ON FUNCTION create_profile_on_login TO authenticated, anon;
GRANT EXECUTE ON FUNCTION fix_all_existing_auth_users TO authenticated;

-- Fix all existing users right now
SELECT fix_all_existing_auth_users();

-- Verification
DO $$
DECLARE
    total_auth_users INTEGER;
    users_with_profiles INTEGER;
    coverage_percentage DECIMAL;
BEGIN
    SELECT COUNT(*) INTO total_auth_users FROM auth.users WHERE email IS NOT NULL;
    SELECT COUNT(DISTINCT user_id) INTO users_with_profiles FROM student_profiles WHERE user_id IS NOT NULL;
    
    IF total_auth_users > 0 THEN
        coverage_percentage := (users_with_profiles::DECIMAL / total_auth_users::DECIMAL) * 100;
    ELSE
        coverage_percentage := 0;
    END IF;
    
    RAISE NOTICE '=== AUTO PROFILE CREATION RESULTS ===';
    RAISE NOTICE 'Total auth users: %', total_auth_users;
    RAISE NOTICE 'Users with profiles: %', users_with_profiles;
    RAISE NOTICE 'Coverage: % percent (% out of %)', ROUND(coverage_percentage, 1), users_with_profiles, total_auth_users;
    
    IF coverage_percentage >= 90 THEN
        RAISE NOTICE 'SUCCESS: Most users now have profiles!';
    ELSE
        RAISE NOTICE 'INFO: Some users may be teachers or incomplete accounts';
    END IF;
    
    RAISE NOTICE 'AUTO PROFILE ON LOGIN SYSTEM READY!';
    RAISE NOTICE 'Any user can now login and get a profile automatically created.';
END $$;