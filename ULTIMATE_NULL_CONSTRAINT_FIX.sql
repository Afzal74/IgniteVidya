-- ULTIMATE NULL CONSTRAINT FIX
-- This will fix ALL NULL constraint issues permanently

-- Step 1: First, set a proper default for achievement_type column
ALTER TABLE student_achievements ALTER COLUMN achievement_type SET DEFAULT 'milestone';

-- Step 2: Update ALL existing NULL values
UPDATE student_achievements 
SET achievement_type = 'milestone' 
WHERE achievement_type IS NULL;

-- Step 3: Drop and recreate the function with BULLETPROOF achievement insertion
DROP FUNCTION IF EXISTS create_student_with_safe_achievements(UUID, TEXT, TEXT, TEXT, INTEGER, TEXT, TEXT, TEXT, TEXT, TEXT, DATE);

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
    
    -- Create profile with ALL the parameters
    INSERT INTO student_profiles (
        user_id, email, first_name, last_name, grade, school_name, 
        section, roll_number, phone_number, parent_email, date_of_birth,
        created_at, updated_at
    ) VALUES (
        p_user_id, p_email, p_first_name, p_last_name, p_grade, p_school_name,
        p_section, p_roll_number, p_phone_number, p_parent_email, p_date_of_birth,
        NOW(), NOW()
    ) RETURNING id INTO profile_id;
    
    -- Create progress data
    IF NOT EXISTS (SELECT 1 FROM student_progress WHERE student_id = p_user_id) THEN
        INSERT INTO student_progress (student_id, subject, grade, completed_lessons, total_lessons, average_score, weekly_hours, difficulty_level) VALUES
        (p_user_id, 'Mathematics', p_grade, 0, 15, 0, 0, 'beginner'),
        (p_user_id, 'Science', p_grade, 0, 12, 0, 0, 'beginner'),
        (p_user_id, 'English', p_grade, 0, 12, 0, 0, 'beginner');
    END IF;
    
    -- BULLETPROOF achievement creation - ALWAYS include achievement_type
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
    UPDATE auth.users SET email_confirmed_at = NOW(), updated_at = NOW() WHERE id = p_user_id;
    
    result := json_build_object('success', true, 'profile_id', profile_id, 'action', 'created');
    RETURN result;
    
EXCEPTION WHEN OTHERS THEN
    result := json_build_object('success', false, 'error', SQLERRM, 'detail', SQLSTATE);
    RETURN result;
END;
$$;

-- Step 4: Create backward compatibility version
CREATE OR REPLACE FUNCTION create_student_with_safe_achievements(
    p_user_id UUID,
    p_email TEXT
)
RETURNS JSON
SECURITY DEFINER
LANGUAGE plpgsql
AS $$
BEGIN
    RETURN create_student_with_safe_achievements(
        p_user_id, p_email, 'Student', 'User', 6, 'School', 'A', '001', NULL, NULL, NULL
    );
END;
$$;

-- Step 5: Grant permissions
GRANT EXECUTE ON FUNCTION create_student_with_safe_achievements TO authenticated, anon;
GRANT EXECUTE ON FUNCTION create_student_with_safe_achievements(UUID, TEXT) TO authenticated, anon;

-- Step 6: Fix ALL problematic functions that might insert achievements without achievement_type
DROP FUNCTION IF EXISTS add_student_achievement(UUID, TEXT, TEXT, TEXT, INTEGER, TEXT);

CREATE OR REPLACE FUNCTION add_student_achievement(
    p_student_id UUID,
    p_title TEXT,
    p_description TEXT,
    p_icon TEXT,
    p_points INTEGER,
    p_rarity TEXT
)
RETURNS VOID
SECURITY DEFINER
LANGUAGE plpgsql
AS $$
BEGIN
    -- Always use achievement_name and achievement_type (never NULL)
    INSERT INTO student_achievements (
        student_id, 
        achievement_name, 
        achievement_description, 
        points_earned, 
        achievement_type,
        earned_at
    ) VALUES (
        p_student_id, 
        p_title, 
        p_description, 
        p_points, 
        COALESCE(p_rarity, 'milestone'),  -- Convert rarity to achievement_type
        NOW()
    )
    ON CONFLICT (student_id, achievement_name) DO NOTHING;
END;
$$;

GRANT EXECUTE ON FUNCTION add_student_achievement TO authenticated, anon;

-- Step 7: Create a trigger to prevent ANY NULL achievement_type insertions
CREATE OR REPLACE FUNCTION prevent_null_achievement_type()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
    -- If achievement_type is NULL, set it to 'milestone'
    IF NEW.achievement_type IS NULL THEN
        NEW.achievement_type := 'milestone';
    END IF;
    
    -- If achievement_name is NULL but we have other title columns, use them
    IF NEW.achievement_name IS NULL THEN
        -- Check if there are other title-like columns and use them
        IF TG_TABLE_NAME = 'student_achievements' THEN
            NEW.achievement_name := COALESCE(NEW.achievement_name, 'Achievement');
        END IF;
    END IF;
    
    RETURN NEW;
END;
$$;

-- Apply the trigger
DROP TRIGGER IF EXISTS ensure_achievement_type_not_null ON student_achievements;
CREATE TRIGGER ensure_achievement_type_not_null
    BEFORE INSERT OR UPDATE ON student_achievements
    FOR EACH ROW
    EXECUTE FUNCTION prevent_null_achievement_type();

-- Step 8: Final verification and cleanup
DO $$
DECLARE
    null_count INTEGER;
BEGIN
    -- Check for any remaining NULL values
    SELECT COUNT(*) INTO null_count
    FROM student_achievements
    WHERE achievement_type IS NULL;
    
    IF null_count > 0 THEN
        -- Fix any remaining NULL values
        UPDATE student_achievements 
        SET achievement_type = 'milestone' 
        WHERE achievement_type IS NULL;
        
        RAISE NOTICE 'Fixed % remaining NULL achievement_type values', null_count;
    ELSE
        RAISE NOTICE 'No NULL achievement_type values found - all good!';
    END IF;
    
    RAISE NOTICE 'ULTIMATE NULL CONSTRAINT FIX COMPLETE!';
    RAISE NOTICE 'All future achievement insertions will be protected against NULL values';
END $$;