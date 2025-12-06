-- FIX MISSING PROFILES - Create profiles for existing users

-- First, let's see which users are missing profiles
DO $$
DECLARE
    missing_count INTEGER;
    user_record RECORD;
    profile_result JSON;
    success_count INTEGER := 0;
    error_count INTEGER := 0;
BEGIN
    -- Count users without profiles
    SELECT COUNT(*) INTO missing_count
    FROM auth.users u
    LEFT JOIN student_profiles sp ON u.id = sp.user_id
    WHERE sp.user_id IS NULL 
      AND u.email IS NOT NULL
      AND u.email_confirmed_at IS NOT NULL;
    
    RAISE NOTICE 'Found % users without student profiles', missing_count;
    
    -- Create profiles for all missing users
    FOR user_record IN 
        SELECT u.id, u.email, u.raw_user_meta_data
        FROM auth.users u
        LEFT JOIN student_profiles sp ON u.id = sp.user_id
        WHERE sp.user_id IS NULL 
          AND u.email IS NOT NULL
          AND u.email_confirmed_at IS NOT NULL
    LOOP
        BEGIN
            -- Extract metadata if available
            DECLARE
                first_name TEXT := COALESCE(user_record.raw_user_meta_data->>'first_name', 'Student');
                last_name TEXT := COALESCE(user_record.raw_user_meta_data->>'last_name', 'User');
                grade_val INTEGER := COALESCE((user_record.raw_user_meta_data->>'grade')::INTEGER, 6);
                school_name TEXT := COALESCE(user_record.raw_user_meta_data->>'school_name', 'School');
                section_val TEXT := COALESCE(user_record.raw_user_meta_data->>'section', 'A');
                roll_number TEXT := COALESCE(user_record.raw_user_meta_data->>'roll_number', '001');
                phone_number TEXT := user_record.raw_user_meta_data->>'phone_number';
                parent_email TEXT := user_record.raw_user_meta_data->>'parent_email';
                date_of_birth DATE := (user_record.raw_user_meta_data->>'date_of_birth')::DATE;
            BEGIN
                -- Call the function to create profile
                SELECT create_student_with_safe_achievements(
                    user_record.id,
                    user_record.email,
                    first_name,
                    last_name,
                    grade_val,
                    school_name,
                    section_val,
                    roll_number,
                    phone_number,
                    parent_email,
                    date_of_birth
                ) INTO profile_result;
                
                IF profile_result->>'success' = 'true' THEN
                    success_count := success_count + 1;
                    RAISE NOTICE 'Created profile for user: % (email: %)', user_record.id, user_record.email;
                ELSE
                    error_count := error_count + 1;
                    RAISE NOTICE 'Failed to create profile for user: % - Error: %', user_record.email, profile_result->>'error';
                END IF;
            EXCEPTION WHEN OTHERS THEN
                error_count := error_count + 1;
                RAISE NOTICE 'Exception creating profile for user: % - Error: %', user_record.email, SQLERRM;
            END;
        END;
    END LOOP;
    
    RAISE NOTICE 'Profile creation complete: % successful, % errors', success_count, error_count;
    
    -- Verify the results
    SELECT COUNT(*) INTO missing_count
    FROM auth.users u
    LEFT JOIN student_profiles sp ON u.id = sp.user_id
    WHERE sp.user_id IS NULL 
      AND u.email IS NOT NULL
      AND u.email_confirmed_at IS NOT NULL;
    
    RAISE NOTICE 'Users still missing profiles after fix: %', missing_count;
END $$;

-- Also create a simple manual function to create profile for specific user
CREATE OR REPLACE FUNCTION create_profile_for_user(user_email TEXT)
RETURNS JSON
SECURITY DEFINER
LANGUAGE plpgsql
AS $$
DECLARE
    user_record RECORD;
    result JSON;
BEGIN
    -- Find the user
    SELECT id, email, raw_user_meta_data
    INTO user_record
    FROM auth.users
    WHERE email = user_email
    LIMIT 1;
    
    IF user_record.id IS NULL THEN
        RETURN json_build_object('success', false, 'error', 'User not found');
    END IF;
    
    -- Create profile using the main function
    SELECT create_student_with_safe_achievements(
        user_record.id,
        user_record.email,
        COALESCE(user_record.raw_user_meta_data->>'first_name', 'Student'),
        COALESCE(user_record.raw_user_meta_data->>'last_name', 'User'),
        COALESCE((user_record.raw_user_meta_data->>'grade')::INTEGER, 6),
        COALESCE(user_record.raw_user_meta_data->>'school_name', 'School'),
        COALESCE(user_record.raw_user_meta_data->>'section', 'A'),
        COALESCE(user_record.raw_user_meta_data->>'roll_number', '001'),
        user_record.raw_user_meta_data->>'phone_number',
        user_record.raw_user_meta_data->>'parent_email',
        (user_record.raw_user_meta_data->>'date_of_birth')::DATE
    ) INTO result;
    
    RETURN result;
END;
$$;

GRANT EXECUTE ON FUNCTION create_profile_for_user TO authenticated, anon;