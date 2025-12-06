-- FINAL COMPLETE FIX FOR ALL STUDENT ISSUES
-- This fixes achievement_type errors and handles email confirmation

-- Step 1: Check and fix the student_achievements table structure
DO $$
BEGIN
    -- Check if achievement_type column exists and is required
    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'student_achievements' 
        AND column_name = 'achievement_type' 
        AND is_nullable = 'NO'
    ) THEN
        RAISE NOTICE 'achievement_type column exists and is required';
        
        -- Update any existing records that have NULL achievement_type
        UPDATE student_achievements 
        SET achievement_type = 'milestone' 
        WHERE achievement_type IS NULL;
        
        RAISE NOTICE 'Updated existing NULL achievement_type values';
    END IF;
END $$;

-- Step 2: Fix the universal function to include achievement_type
CREATE OR REPLACE FUNCTION create_student_profile_universal(
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
        
        -- Create initial data only for new profiles
        INSERT INTO student_progress (student_id, subject, grade, completed_lessons, total_lessons, average_score, weekly_hours, difficulty_level) VALUES
        (p_user_id, 'Mathematics', p_grade, 0, 15, 0, 0, 'beginner'),
        (p_user_id, 'Science', p_grade, 0, 12, 0, 0, 'beginner'),
        (p_user_id, 'English', p_grade, 0, 12, 0, 0, 'beginner')
        ON CONFLICT (student_id, subject) DO NOTHING;
        
        -- Create welcome achievement with achievement_type
        INSERT INTO student_achievements (student_id, achievement_name, achievement_description, points_earned, achievement_type) VALUES
        (p_user_id, 'Welcome!', 'Successfully joined the learning platform', 10, 'milestone')
        ON CONFLICT (student_id, achievement_name) DO NOTHING;
        
        result := json_build_object('success', true, 'profile_id', profile_id, 'action', 'created');
    END IF;
    
    RETURN result;
    
EXCEPTION WHEN OTHERS THEN
    result := json_build_object('success', false, 'error', SQLERRM);
    RETURN result;
END;
$$;

-- Step 3: Fix the signup trigger to include achievement_type
CREATE OR REPLACE FUNCTION handle_student_signup()
RETURNS TRIGGER
SECURITY DEFINER
LANGUAGE plpgsql
AS $$
DECLARE
    user_email TEXT;
    user_metadata JSONB;
BEGIN
    -- Get user email and metadata
    user_email := NEW.email;
    user_metadata := COALESCE(NEW.raw_user_meta_data, '{}'::jsonb);
    
    -- Only proceed if this looks like a student signup (not a teacher)
    IF user_metadata->>'user_type' = 'student' OR user_metadata->>'userType' = 'student' THEN
        -- Create student profile with metadata
        INSERT INTO student_profiles (
            user_id,
            email,
            first_name,
            last_name,
            grade,
            section,
            roll_number,
            school_name,
            parent_email,
            phone_number,
            date_of_birth,
            created_at,
            updated_at
        ) VALUES (
            NEW.id,
            user_email,
            COALESCE(user_metadata->>'first_name', user_metadata->>'firstName', 'Student'),
            COALESCE(user_metadata->>'last_name', user_metadata->>'lastName', 'User'),
            COALESCE((user_metadata->>'grade')::INTEGER, 6),
            user_metadata->>'section',
            user_metadata->>'roll_number',
            COALESCE(user_metadata->>'school_name', user_metadata->>'schoolName', 'School'),
            user_metadata->>'parent_email',
            user_metadata->>'phone_number',
            CASE 
                WHEN user_metadata->>'date_of_birth' IS NOT NULL 
                THEN (user_metadata->>'date_of_birth')::DATE 
                ELSE NULL 
            END,
            NOW(),
            NOW()
        );
        
        -- Create initial progress data
        INSERT INTO student_progress (student_id, subject, grade, completed_lessons, total_lessons, average_score, weekly_hours, difficulty_level) VALUES
        (NEW.id, 'Mathematics', COALESCE((user_metadata->>'grade')::INTEGER, 6), 0, 15, 0, 0, 'beginner'),
        (NEW.id, 'Science', COALESCE((user_metadata->>'grade')::INTEGER, 6), 0, 12, 0, 0, 'beginner'),
        (NEW.id, 'English', COALESCE((user_metadata->>'grade')::INTEGER, 6), 0, 12, 0, 0, 'beginner');
        
        -- Give welcome achievement with achievement_type
        INSERT INTO student_achievements (student_id, achievement_name, achievement_description, points_earned, achievement_type) VALUES
        (NEW.id, 'Welcome!', 'Successfully joined the learning platform', 10, 'milestone');
        
    END IF;
    
    RETURN NEW;
    
EXCEPTION WHEN OTHERS THEN
    -- Log error but don't fail the signup
    RAISE WARNING 'Failed to create student profile for %: %', user_email, SQLERRM;
    RETURN NEW;
END;
$$;

-- Step 4: Fix existing users function to include achievement_type
CREATE OR REPLACE FUNCTION fix_existing_users_without_profiles()
RETURNS TEXT
SECURITY DEFINER
LANGUAGE plpgsql
AS $$
DECLARE
    user_record RECORD;
    fixed_count INTEGER := 0;
    total_count INTEGER := 0;
BEGIN
    -- Find all auth users who don't have student or teacher profiles
    FOR user_record IN 
        SELECT u.id, u.email, u.raw_user_meta_data
        FROM auth.users u
        WHERE u.id NOT IN (SELECT user_id FROM student_profiles WHERE user_id IS NOT NULL)
          AND u.id NOT IN (SELECT user_id FROM teacher_profiles WHERE user_id IS NOT NULL)
          AND u.email IS NOT NULL
    LOOP
        total_count := total_count + 1;
        
        BEGIN
            -- Try to create student profile for users without profiles
            INSERT INTO student_profiles (
                user_id,
                email,
                first_name,
                last_name,
                grade,
                section,
                roll_number,
                school_name,
                parent_email,
                phone_number,
                created_at,
                updated_at
            ) VALUES (
                user_record.id,
                user_record.email,
                COALESCE(user_record.raw_user_meta_data->>'first_name', 'Student'),
                COALESCE(user_record.raw_user_meta_data->>'last_name', 'User'),
                COALESCE((user_record.raw_user_meta_data->>'grade')::INTEGER, 6),
                user_record.raw_user_meta_data->>'section',
                user_record.raw_user_meta_data->>'roll_number',
                COALESCE(user_record.raw_user_meta_data->>'school_name', 'School'),
                user_record.raw_user_meta_data->>'parent_email',
                user_record.raw_user_meta_data->>'phone_number',
                NOW(),
                NOW()
            );
            
            -- Create initial data
            INSERT INTO student_progress (student_id, subject, grade, completed_lessons, total_lessons, average_score, weekly_hours, difficulty_level) VALUES
            (user_record.id, 'Mathematics', COALESCE((user_record.raw_user_meta_data->>'grade')::INTEGER, 6), 0, 15, 0, 0, 'beginner'),
            (user_record.id, 'Science', COALESCE((user_record.raw_user_meta_data->>'grade')::INTEGER, 6), 0, 12, 0, 0, 'beginner'),
            (user_record.id, 'English', COALESCE((user_record.raw_user_meta_data->>'grade')::INTEGER, 6), 0, 12, 0, 0, 'beginner');
            
            -- Create achievement with achievement_type
            INSERT INTO student_achievements (student_id, achievement_name, achievement_description, points_earned, achievement_type) VALUES
            (user_record.id, 'Welcome!', 'Successfully joined the learning platform', 10, 'milestone');
            
            fixed_count := fixed_count + 1;
            
        EXCEPTION WHEN OTHERS THEN
            -- Skip users that can't be fixed
            CONTINUE;
        END;
    END LOOP;
    
    RETURN format('Fixed %s out of %s users without profiles', fixed_count, total_count);
END;
$$;

-- Step 5: Create a function to handle email confirmation bypass for development
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

-- Step 6: Grant permissions
GRANT EXECUTE ON FUNCTION create_student_profile_universal TO authenticated, anon;
GRANT EXECUTE ON FUNCTION fix_existing_users_without_profiles TO authenticated;
GRANT EXECUTE ON FUNCTION confirm_student_email TO authenticated, anon;

-- Step 7: Fix the specific user that's having issues
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
        
        -- Ensure they have a proper welcome achievement
        INSERT INTO student_achievements (student_id, achievement_name, achievement_description, points_earned, achievement_type) VALUES
        (user_id_val, 'Welcome!', 'Successfully joined the learning platform', 10, 'milestone')
        ON CONFLICT (student_id, achievement_name) DO NOTHING;
        
        RAISE NOTICE 'Fixed user cusoraigmmmail@gmail.com - email confirmed and achievements updated';
    ELSE
        RAISE NOTICE 'User cusoraigmmmail@gmail.com not found';
    END IF;
END $$;

-- Step 8: Run the existing user fix again to ensure all users are properly set up
SELECT fix_existing_users_without_profiles();

-- Step 9: Final verification
DO $$
DECLARE
    confirmed_users INTEGER;
    users_with_achievements INTEGER;
    null_achievement_types INTEGER;
BEGIN
    SELECT COUNT(*) INTO confirmed_users 
    FROM auth.users 
    WHERE email_confirmed_at IS NOT NULL;
    
    SELECT COUNT(DISTINCT student_id) INTO users_with_achievements 
    FROM student_achievements;
    
    SELECT COUNT(*) INTO null_achievement_types 
    FROM student_achievements 
    WHERE achievement_type IS NULL;
    
    RAISE NOTICE '=== FINAL VERIFICATION ===';
    RAISE NOTICE 'Users with confirmed emails: %', confirmed_users;
    RAISE NOTICE 'Users with achievements: %', users_with_achievements;
    RAISE NOTICE 'Achievements with NULL type: %', null_achievement_types;
    
    IF null_achievement_types = 0 THEN
        RAISE NOTICE 'SUCCESS: All achievement_type issues fixed!';
    ELSE
        RAISE NOTICE 'WARNING: % achievements still have NULL type', null_achievement_types;
    END IF;
    
    RAISE NOTICE 'FINAL COMPLETE FIX APPLIED!';
    RAISE NOTICE 'Users should now be able to signup and login without issues.';
END $$;