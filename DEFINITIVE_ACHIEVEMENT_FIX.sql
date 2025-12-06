-- DEFINITIVE ACHIEVEMENT FIX
-- This will fix all column name inconsistencies and NULL issues

-- Step 1: Check current table structure
DO $$
DECLARE
    col_record RECORD;
    has_achievement_name BOOLEAN := FALSE;
    has_achievement_title BOOLEAN := FALSE;
    has_achievement_type BOOLEAN := FALSE;
    has_achievement_icon BOOLEAN := FALSE;
BEGIN
    RAISE NOTICE '=== CHECKING TABLE STRUCTURE ===';
    
    FOR col_record IN 
        SELECT column_name, data_type, is_nullable, column_default
        FROM information_schema.columns 
        WHERE table_name = 'student_achievements' 
        ORDER BY ordinal_position
    LOOP
        RAISE NOTICE 'Column: % | Type: % | Nullable: %', 
            col_record.column_name, 
            col_record.data_type, 
            col_record.is_nullable;
            
        IF col_record.column_name = 'achievement_name' THEN
            has_achievement_name := TRUE;
        END IF;
        IF col_record.column_name = 'achievement_title' THEN
            has_achievement_title := TRUE;
        END IF;
        IF col_record.column_name = 'achievement_type' THEN
            has_achievement_type := TRUE;
        END IF;
        IF col_record.column_name = 'achievement_icon' THEN
            has_achievement_icon := TRUE;
        END IF;
    END LOOP;
    
    RAISE NOTICE 'Has achievement_name: %', has_achievement_name;
    RAISE NOTICE 'Has achievement_title: %', has_achievement_title;
    RAISE NOTICE 'Has achievement_type: %', has_achievement_type;
    RAISE NOTICE 'Has achievement_icon: %', has_achievement_icon;
END $$;

-- Step 2: Standardize the table structure
-- If we have both achievement_name and achievement_title, keep achievement_name
DO $$
BEGIN
    -- Check if we need to migrate from achievement_title to achievement_name
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'student_achievements' AND column_name = 'achievement_title') 
       AND EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'student_achievements' AND column_name = 'achievement_name') THEN
        
        -- Copy data from achievement_title to achievement_name if achievement_name is NULL
        UPDATE student_achievements 
        SET achievement_name = achievement_title 
        WHERE achievement_name IS NULL AND achievement_title IS NOT NULL;
        
        RAISE NOTICE 'Migrated data from achievement_title to achievement_name';
    END IF;
    
    -- Ensure achievement_type column exists and has default
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'student_achievements' AND column_name = 'achievement_type') THEN
        -- Set default value for achievement_type
        ALTER TABLE student_achievements ALTER COLUMN achievement_type SET DEFAULT 'milestone';
        
        -- Update all NULL values
        UPDATE student_achievements SET achievement_type = 'milestone' WHERE achievement_type IS NULL;
        
        RAISE NOTICE 'Fixed achievement_type column';
    END IF;
END $$;

-- Step 3: Create a completely safe function that works with any table structure
CREATE OR REPLACE FUNCTION create_student_with_safe_achievements(
    p_user_id UUID,
    p_email TEXT,
    p_first_name TEXT DEFAULT 'Student',
    p_last_name TEXT DEFAULT 'User',
    p_grade INTEGER DEFAULT 6
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
    insert_sql TEXT;
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
    
    -- Create profile
    INSERT INTO student_profiles (
        user_id, email, first_name, last_name, grade, school_name, created_at, updated_at
    ) VALUES (
        p_user_id, p_email, p_first_name, p_last_name, p_grade, 'School', NOW(), NOW()
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
    
    -- Create achievement with correct column names
    IF NOT EXISTS (SELECT 1 FROM student_achievements WHERE student_id = p_user_id) THEN
        IF has_achievement_name AND has_achievement_type THEN
            -- Use achievement_name and achievement_type
            INSERT INTO student_achievements (student_id, achievement_name, achievement_description, points_earned, achievement_type, earned_at) VALUES
            (p_user_id, 'Welcome!', 'Successfully joined the learning platform', 10, 'milestone', NOW());
        ELSIF has_achievement_title AND NOT has_achievement_type THEN
            -- Use achievement_title without achievement_type
            INSERT INTO student_achievements (student_id, achievement_title, achievement_description, achievement_icon, points, rarity, earned_date) VALUES
            (p_user_id, 'Welcome!', 'Successfully joined the learning platform', '🎓', 10, 'common', NOW());
        ELSE
            -- Fallback - try basic insert
            INSERT INTO student_achievements (student_id) VALUES (p_user_id);
        END IF;
    END IF;
    
    -- Confirm email
    UPDATE auth.users SET email_confirmed_at = NOW(), updated_at = NOW() WHERE id = p_user_id;
    
    result := json_build_object('success', true, 'profile_id', profile_id, 'action', 'created');
    RETURN result;
    
EXCEPTION WHEN OTHERS THEN
    result := json_build_object('success', false, 'error', SQLERRM);
    RETURN result;
END;
$$;

-- Step 4: Grant permissions
GRANT EXECUTE ON FUNCTION create_student_with_safe_achievements TO authenticated, anon;

-- Step 5: Fix all existing users
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
        SELECT create_student_with_safe_achievements(user_record.id, user_record.email) INTO profile_result;
        
        IF profile_result->>'success' = 'true' THEN
            fixed_count := fixed_count + 1;
        END IF;
    END LOOP;
    
    RAISE NOTICE 'Fixed % users with safe achievement creation', fixed_count;
END $$;

RAISE NOTICE 'DEFINITIVE ACHIEVEMENT FIX COMPLETE!';