-- SIMPLE WORKING FIX - No complex constraints, just working code
-- This removes all the problematic ON CONFLICT clauses

-- Step 1: Fix any existing NULL achievement_type values
UPDATE student_achievements 
SET achievement_type = 'milestone' 
WHERE achievement_type IS NULL;

-- Step 2: Create simple working function without ON CONFLICT
CREATE OR REPLACE FUNCTION create_student_profile_simple(
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
        -- Update existing profile
        UPDATE student_profiles SET
            user_id = p_user_id,
            email = p_email,
            first_name = p_first_name,
            last_name = p_last_name,
            grade = p_grade,
            section = p_section,
            roll_number = p_roll_number,
            school_name = p_school_name,
            parent_email = p_parent_email,
            phone_number = p_phone_number,
            date_of_birth = p_date_of_birth,
            updated_at = NOW()
        WHERE id = existing_profile
        RETURNING id INTO profile_id;
        
        result := json_build_object('success', true, 'profile_id', profile_id, 'action', 'updated');
    ELSE
        -- Create new profile
        INSERT INTO student_profiles (
            user_id, email, first_name, last_name, grade, section, roll_number,
            school_name, parent_email, phone_number, date_of_birth, created_at, updated_at
        ) VALUES (
            p_user_id, p_email, p_first_name, p_last_name, p_grade, p_section, p_roll_number,
            p_school_name, p_parent_email, p_phone_number, p_date_of_birth, NOW(), NOW()
        ) RETURNING id INTO profile_id;
        
        -- Create initial progress data (only if doesn't exist)
        IF NOT EXISTS (SELECT 1 FROM student_progress WHERE student_id = p_user_id) THEN
            INSERT INTO student_progress (student_id, subject, grade, completed_lessons, total_lessons, average_score, weekly_hours, difficulty_level) VALUES
            (p_user_id, 'Mathematics', p_grade, 0, 15, 0, 0, 'beginner'),
            (p_user_id, 'Science', p_grade, 0, 12, 0, 0, 'beginner'),
            (p_user_id, 'English', p_grade, 0, 12, 0, 0, 'beginner');
        END IF;
        
        -- Create welcome achievement (only if doesn't exist)
        IF NOT EXISTS (SELECT 1 FROM student_achievements WHERE student_id = p_user_id AND achievement_name = 'Welcome!') THEN
            INSERT INTO student_achievements (student_id, achievement_name, achievement_description, points_earned, achievement_type) VALUES
            (p_user_id, 'Welcome!', 'Successfully joined the learning platform', 10, 'milestone');
        END IF;
        
        result := json_build_object('success', true, 'profile_id', profile_id, 'action', 'created');
    END IF;
    
    RETURN result;
    
EXCEPTION WHEN OTHERS THEN
    result := json_build_object('success', false, 'error', SQLERRM);
    RETURN result;
END;
$$;

-- Step 3: Create simple email confirmation function
CREATE OR REPLACE FUNCTION confirm_student_email(p_email TEXT)
RETURNS JSON
SECURITY DEFINER
LANGUAGE plpgsql
AS $$
DECLARE
    user_id UUID;
    result JSON;
BEGIN
    -- Find the user by email
    SELECT id INTO user_id
    FROM auth.users
    WHERE email = p_email
    LIMIT 1;
    
    IF user_id IS NOT NULL THEN
        -- Update the user to mark email as confirmed
        UPDATE auth.users
        SET 
            email_confirmed_at = NOW(),
            updated_at = NOW()
        WHERE id = user_id;
        
        result := json_build_object(
            'success', true,
            'message', 'Email confirmed successfully',
            'user_id', user_id
        );
    ELSE
        result := json_build_object(
            'success', false,
            'message', 'User not found with email: ' || p_email
        );
    END IF;
    
    RETURN result;
    
EXCEPTION WHEN OTHERS THEN
    result := json_build_object(
        'success', false,
        'error', SQLERRM
    );
    RETURN result;
END;
$$;

-- Step 4: Grant permissions
GRANT EXECUTE ON FUNCTION create_student_profile_simple TO authenticated, anon;
GRANT EXECUTE ON FUNCTION confirm_student_email TO authenticated, anon;

-- Step 5: Fix the specific problematic user
DO $$
DECLARE
    user_id_val UUID;
BEGIN
    -- Get the user ID for cusoraigmmmail@gmail.com
    SELECT id INTO user_id_val 
    FROM auth.users 
    WHERE email = 'cusoraigmmmail@gmail.com' 
    LIMIT 1;
    
    IF user_id_val IS NOT NULL THEN
        -- Confirm their email
        UPDATE auth.users
        SET 
            email_confirmed_at = NOW(),
            updated_at = NOW()
        WHERE id = user_id_val;
        
        -- Fix any achievements missing achievement_type
        UPDATE student_achievements 
        SET achievement_type = 'milestone' 
        WHERE student_id = user_id_val AND achievement_type IS NULL;
        
        -- Ensure they have a proper welcome achievement (check first)
        IF NOT EXISTS (SELECT 1 FROM student_achievements WHERE student_id = user_id_val AND achievement_name = 'Welcome!') THEN
            INSERT INTO student_achievements (student_id, achievement_name, achievement_description, points_earned, achievement_type) VALUES
            (user_id_val, 'Welcome!', 'Successfully joined the learning platform', 10, 'milestone');
        END IF;
        
        RAISE NOTICE 'Fixed user cusoraigmmmail@gmail.com - email confirmed and achievements updated';
    ELSE
        RAISE NOTICE 'User cusoraigmmmail@gmail.com not found';
    END IF;
END $$;

-- Step 6: Final verification
DO $$
DECLARE
    null_achievement_types INTEGER;
    confirmed_user BOOLEAN;
BEGIN
    SELECT COUNT(*) INTO null_achievement_types 
    FROM student_achievements 
    WHERE achievement_type IS NULL;
    
    SELECT EXISTS(
        SELECT 1 FROM auth.users 
        WHERE email = 'cusoraigmmmail@gmail.com' 
        AND email_confirmed_at IS NOT NULL
    ) INTO confirmed_user;
    
    RAISE NOTICE '=== SIMPLE FIX VERIFICATION ===';
    RAISE NOTICE 'Achievements with NULL type: %', null_achievement_types;
    RAISE NOTICE 'cusoraigmmmail@gmail.com email confirmed: %', confirmed_user;
    
    IF null_achievement_types = 0 AND confirmed_user THEN
        RAISE NOTICE 'SUCCESS: All issues fixed!';
        RAISE NOTICE 'User should now be able to signup and login without errors.';
    ELSE
        RAISE NOTICE 'Some issues may remain. Check the values above.';
    END IF;
END $$;