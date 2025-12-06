-- QUICK AUTO LOGIN FIX - Simple version without complex formatting

-- Create the login profile creation function
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
    default_grade INTEGER := 6;
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
    
    -- Extract name from email
    user_name := split_part(p_email, '@', 1);
    
    -- Create new profile
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
        INITCAP(user_name),
        'User',
        default_grade,
        'School',
        NOW(), 
        NOW()
    ) RETURNING id INTO profile_id;
    
    -- Create initial data
    IF NOT EXISTS (SELECT 1 FROM student_progress WHERE student_id = p_user_id) THEN
        INSERT INTO student_progress (student_id, subject, grade, completed_lessons, total_lessons, average_score, weekly_hours, difficulty_level) VALUES
        (p_user_id, 'Mathematics', default_grade, 0, 15, 0, 0, 'beginner'),
        (p_user_id, 'Science', default_grade, 0, 12, 0, 0, 'beginner'),
        (p_user_id, 'English', default_grade, 0, 12, 0, 0, 'beginner');
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM student_achievements WHERE student_id = p_user_id AND achievement_name = 'Welcome!') THEN
        INSERT INTO student_achievements (student_id, achievement_name, achievement_description, points_earned, achievement_type) VALUES
        (p_user_id, 'Welcome!', 'Successfully joined the learning platform', 10, 'milestone');
    END IF;
    
    -- Confirm email
    UPDATE auth.users
    SET email_confirmed_at = NOW(), updated_at = NOW()
    WHERE id = p_user_id;
    
    result := json_build_object('success', true, 'profile_id', profile_id, 'action', 'created');
    RETURN result;
    
EXCEPTION WHEN OTHERS THEN
    result := json_build_object('success', false, 'error', SQLERRM);
    RETURN result;
END;
$$;

-- Grant permissions
GRANT EXECUTE ON FUNCTION create_profile_on_login TO authenticated, anon;

-- Fix existing users
DO $$
DECLARE
    user_record RECORD;
    fixed_count INTEGER := 0;
    profile_result JSON;
BEGIN
    FOR user_record IN 
        SELECT u.id, u.email
        FROM auth.users u
        WHERE u.id NOT IN (SELECT user_id FROM student_profiles WHERE user_id IS NOT NULL)
          AND u.email IS NOT NULL
    LOOP
        SELECT create_profile_on_login(user_record.id, user_record.email) INTO profile_result;
        
        IF profile_result->>'success' = 'true' THEN
            fixed_count := fixed_count + 1;
        END IF;
    END LOOP;
    
    RAISE NOTICE 'Created profiles for % users', fixed_count;
END $$;

-- Simple verification
DO $$
DECLARE
    total_users INTEGER;
    users_with_profiles INTEGER;
BEGIN
    SELECT COUNT(*) INTO total_users FROM auth.users WHERE email IS NOT NULL;
    SELECT COUNT(DISTINCT user_id) INTO users_with_profiles FROM student_profiles WHERE user_id IS NOT NULL;
    
    RAISE NOTICE 'Total users: %', total_users;
    RAISE NOTICE 'Users with profiles: %', users_with_profiles;
    RAISE NOTICE 'AUTO LOGIN PROFILE CREATION READY!';
END $$;