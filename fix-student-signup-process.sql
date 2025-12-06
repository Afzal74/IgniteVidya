-- Fix the student signup process to handle RLS properly
-- This creates a function that can be called from the application

-- Create a function to handle student signup that bypasses RLS issues
CREATE OR REPLACE FUNCTION create_student_profile(
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
SECURITY DEFINER -- This allows the function to bypass RLS
LANGUAGE plpgsql
AS $$
DECLARE
    result JSON;
    profile_id UUID;
BEGIN
    -- Insert the student profile
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
        p_user_id,
        p_email,
        p_first_name,
        p_last_name,
        p_grade,
        p_section,
        p_roll_number,
        p_school_name,
        p_parent_email,
        p_phone_number,
        p_date_of_birth,
        NOW(),
        NOW()
    ) RETURNING id INTO profile_id;
    
    -- Create initial sample data for the student
    INSERT INTO student_progress (student_id, subject, grade, completed_lessons, total_lessons, average_score, weekly_hours, difficulty_level) VALUES
    (p_user_id, 'Mathematics', p_grade, 0, 15, 0, 0, 'beginner'),
    (p_user_id, 'Science', p_grade, 0, 12, 0, 0, 'beginner'),
    (p_user_id, 'English', p_grade, 0, 12, 0, 0, 'beginner');
    
    -- Give them a welcome achievement
    INSERT INTO student_achievements (student_id, achievement_name, achievement_description, points_earned, achievement_type) VALUES
    (p_user_id, 'Welcome!', 'Successfully created your student account', 10, 'milestone');
    
    -- Return success result
    result := json_build_object(
        'success', true,
        'profile_id', profile_id,
        'message', 'Student profile created successfully'
    );
    
    RETURN result;
    
EXCEPTION WHEN OTHERS THEN
    -- Return error result
    result := json_build_object(
        'success', false,
        'error', SQLERRM,
        'message', 'Failed to create student profile'
    );
    
    RETURN result;
END;
$$;

-- Create a function to get student profile that bypasses RLS
CREATE OR REPLACE FUNCTION get_student_profile(p_user_id UUID)
RETURNS JSON
SECURITY DEFINER
LANGUAGE plpgsql
AS $$
DECLARE
    result JSON;
    profile_data RECORD;
BEGIN
    -- Get the student profile
    SELECT * INTO profile_data
    FROM student_profiles
    WHERE user_id = p_user_id
    LIMIT 1;
    
    IF profile_data IS NOT NULL THEN
        result := json_build_object(
            'success', true,
            'profile', row_to_json(profile_data)
        );
    ELSE
        result := json_build_object(
            'success', false,
            'message', 'No student profile found'
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

-- Grant execute permissions to authenticated users
GRANT EXECUTE ON FUNCTION create_student_profile TO authenticated;
GRANT EXECUTE ON FUNCTION get_student_profile TO authenticated;

-- Also create a trigger to automatically create initial data when a student profile is created
CREATE OR REPLACE FUNCTION auto_create_student_data()
RETURNS TRIGGER
SECURITY DEFINER
LANGUAGE plpgsql
AS $$
BEGIN
    -- Only create data if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM student_progress WHERE student_id = NEW.user_id) THEN
        -- Create initial progress data
        INSERT INTO student_progress (student_id, subject, grade, completed_lessons, total_lessons, average_score, weekly_hours, difficulty_level) VALUES
        (NEW.user_id, 'Mathematics', NEW.grade, 0, 15, 0, 0, 'beginner'),
        (NEW.user_id, 'Science', NEW.grade, 0, 12, 0, 0, 'beginner'),
        (NEW.user_id, 'English', NEW.grade, 0, 12, 0, 0, 'beginner');
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM student_achievements WHERE student_id = NEW.user_id) THEN
        -- Give welcome achievement
        INSERT INTO student_achievements (student_id, achievement_name, achievement_description, points_earned, achievement_type) VALUES
        (NEW.user_id, 'Welcome!', 'Successfully created your student account', 10, 'milestone');
    END IF;
    
    RETURN NEW;
END;
$$;

-- Create the trigger
DROP TRIGGER IF EXISTS auto_create_student_data_trigger ON student_profiles;
CREATE TRIGGER auto_create_student_data_trigger
    AFTER INSERT ON student_profiles
    FOR EACH ROW
    EXECUTE FUNCTION auto_create_student_data();

RAISE NOTICE 'Student signup process functions created successfully!';