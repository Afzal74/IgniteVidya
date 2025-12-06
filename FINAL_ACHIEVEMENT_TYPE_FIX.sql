-- FINAL ACHIEVEMENT TYPE FIX
-- This will permanently fix all achievement_type NULL issues

-- Step 1: First, let's see what the actual table structure looks like
DO $$
DECLARE
    col_info RECORD;
BEGIN
    RAISE NOTICE '=== STUDENT_ACHIEVEMENTS TABLE STRUCTURE ===';
    FOR col_info IN 
        SELECT column_name, data_type, is_nullable, column_default
        FROM information_schema.columns 
        WHERE table_name = 'student_achievements' 
        ORDER BY ordinal_position
    LOOP
        RAISE NOTICE 'Column: % | Type: % | Nullable: % | Default: %', 
            col_info.column_name, 
            col_info.data_type, 
            col_info.is_nullable, 
            COALESCE(col_info.column_default, 'NULL');
    END LOOP;
END $$;

-- Step 2: Fix the achievement_type column to have a default value
ALTER TABLE student_achievements 
ALTER COLUMN achievement_type SET DEFAULT 'milestone';

-- Step 3: Update all existing NULL values
UPDATE student_achievements 
SET achievement_type = 'milestone' 
WHERE achievement_type IS NULL;

-- Step 4: Check if there are any remaining NULL values
DO $$
DECLARE
    null_count INTEGER;
BEGIN
    SELECT COUNT(*) INTO null_count 
    FROM student_achievements 
    WHERE achievement_type IS NULL;
    
    RAISE NOTICE 'Remaining NULL achievement_type values: %', null_count;
END $$;

-- Step 5: Create a completely safe function that ALWAYS includes achievement_type
CREATE OR REPLACE FUNCTION create_safe_student_profile(
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
    user_name := COALESCE(split_part(p_email, '@', 1), 'Student');
    
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
    
    -- Create initial progress data (check first)
    IF NOT EXISTS (SELECT 1 FROM student_progress WHERE student_id = p_user_id) THEN
        INSERT INTO student_progress (student_id, subject, grade, completed_lessons, total_lessons, average_score, weekly_hours, difficulty_level) VALUES
        (p_user_id, 'Mathematics', default_grade, 0, 15, 0, 0, 'beginner'),
        (p_user_id, 'Science', default_grade, 0, 12, 0, 0, 'beginner'),
        (p_user_id, 'English', default_grade, 0, 12, 0, 0, 'beginner');
    END IF;
    
    -- Create achievement with EXPLICIT achievement_type (check first)
    IF NOT EXISTS (SELECT 1 FROM student_achievements WHERE student_id = p_user_id) THEN
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

-- Step 6: Also fix the signup function to be completely safe
CREATE OR REPLACE FUNCTION create_student_profile_safe_signup(
    p_user_id UUID,
    p_email TEXT,
    p_first_name TEXT,
    p_last_name TEXT,
    p_grade INTEGER,
    p_section TEXT DEFAULT NULL,
    p_roll_number TEXT DEFAULT NULL,
    p_school_name TEXT DEFAULT NULL,
    p_parent_email TEXT DEFAULT NULL,
    p_phone_number TEXT DEFAULT NULL,
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
    
    -- Create new profile
    INSERT INTO student_profiles (
        user_id, email, first_name, last_name, grade, section, roll_number,
        school_name, parent_email, phone_number, date_of_birth, created_at, updated_at
    ) VALUES (
        p_user_id, p_email, p_first_name, p_last_name, p_grade, p_section, p_roll_number,
        p_school_name, p_parent_email, p_phone_number, p_date_of_birth, NOW(), NOW()
    ) RETURNING id INTO profile_id;
    
    -- Create initial progress data (check first)
    IF NOT EXISTS (SELECT 1 FROM student_progress WHERE student_id = p_user_id) THEN
        INSERT INTO student_progress (student_id, subject, grade, completed_lessons, total_lessons, average_score, weekly_hours, difficulty_level) VALUES
        (p_user_id, 'Mathematics', p_grade, 0, 15, 0, 0, 'beginner'),
        (p_user_id, 'Science', p_grade, 0, 12, 0, 0, 'beginner'),
        (p_user_id, 'English', p_grade, 0, 12, 0, 0, 'beginner');
    END IF;
    
    -- Create achievement with EXPLICIT achievement_type (check first)
    IF NOT EXISTS (SELECT 1 FROM student_achievements WHERE student_id = p_user_id) THEN
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

-- Step 7: Grant permissions
GRANT EXECUTE ON FUNCTION create_safe_student_profile TO authenticated, anon;
GRANT EXECUTE ON FUNCTION create_student_profile_safe_signup TO authenticated, anon;

-- Step 8: Fix all existing users
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
        SELECT create_safe_student_profile(user_record.id, user_record.email) INTO profile_result;
        
        IF profile_result->>'success' = 'true' THEN
            fixed_count := fixed_count + 1;
        END IF;
    END LOOP;
    
    RAISE NOTICE 'Created profiles for % users', fixed_count;
END $$;

-- Step 9: Final verification
DO $$
DECLARE
    null_achievements INTEGER;
    total_achievements INTEGER;
    total_users INTEGER;
    users_with_profiles INTEGER;
BEGIN
    SELECT COUNT(*) INTO null_achievements FROM student_achievements WHERE achievement_type IS NULL;
    SELECT COUNT(*) INTO total_achievements FROM student_achievements;
    SELECT COUNT(*) INTO total_users FROM auth.users WHERE email IS NOT NULL;
    SELECT COUNT(DISTINCT user_id) INTO users_with_profiles FROM student_profiles WHERE user_id IS NOT NULL;
    
    RAISE NOTICE '=== FINAL VERIFICATION ===';
    RAISE NOTICE 'Total users: %', total_users;
    RAISE NOTICE 'Users with profiles: %', users_with_profiles;
    RAISE NOTICE 'Total achievements: %', total_achievements;
    RAISE NOTICE 'NULL achievement_type values: %', null_achievements;
    
    IF null_achievements = 0 THEN
        RAISE NOTICE 'SUCCESS: All achievement_type issues fixed!';
    ELSE
        RAISE NOTICE 'WARNING: Still have % NULL achievement_type values', null_achievements;
    END IF;
    
    RAISE NOTICE 'FINAL ACHIEVEMENT TYPE FIX COMPLETE!';
END $$;