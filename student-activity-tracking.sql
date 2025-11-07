-- Student Activity Tracking for Streak Calendar
-- This creates tables and functions to track daily learning activities

-- Create student_daily_activities table
CREATE TABLE IF NOT EXISTS student_daily_activities (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    student_id UUID NOT NULL,
    activity_date DATE NOT NULL,
    lessons_completed INTEGER DEFAULT 0,
    time_spent_minutes INTEGER DEFAULT 0,
    quizzes_completed INTEGER DEFAULT 0,
    subjects_studied TEXT[] DEFAULT '{}',
    activity_level INTEGER DEFAULT 0 CHECK (activity_level >= 0 AND activity_level <= 4),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    UNIQUE(student_id, activity_date)
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_student_daily_activities_student_date 
ON student_daily_activities(student_id, activity_date DESC);

CREATE INDEX IF NOT EXISTS idx_student_daily_activities_date 
ON student_daily_activities(activity_date DESC);

-- Function to record daily activity
CREATE OR REPLACE FUNCTION record_student_activity(
    p_student_id UUID,
    p_activity_date DATE DEFAULT CURRENT_DATE,
    p_lessons_completed INTEGER DEFAULT 0,
    p_time_spent_minutes INTEGER DEFAULT 0,
    p_quizzes_completed INTEGER DEFAULT 0,
    p_subjects_studied TEXT[] DEFAULT '{}'
)
RETURNS VOID AS $$
DECLARE
    activity_level INTEGER;
BEGIN
    -- Calculate activity level based on engagement
    activity_level := 0;
    
    IF p_lessons_completed > 0 OR p_time_spent_minutes > 0 OR p_quizzes_completed > 0 THEN
        activity_level := 1;
        
        IF p_time_spent_minutes > 30 OR p_lessons_completed > 1 THEN
            activity_level := 2;
        END IF;
        
        IF p_time_spent_minutes > 60 OR p_lessons_completed > 2 THEN
            activity_level := 3;
        END IF;
        
        IF p_time_spent_minutes > 90 OR p_lessons_completed > 3 THEN
            activity_level := 4;
        END IF;
    END IF;
    
    -- Insert or update daily activity
    INSERT INTO student_daily_activities (
        student_id, 
        activity_date, 
        lessons_completed, 
        time_spent_minutes, 
        quizzes_completed, 
        subjects_studied, 
        activity_level,
        updated_at
    ) VALUES (
        p_student_id, 
        p_activity_date, 
        p_lessons_completed, 
        p_time_spent_minutes, 
        p_quizzes_completed, 
        p_subjects_studied, 
        activity_level,
        NOW()
    )
    ON CONFLICT (student_id, activity_date) 
    DO UPDATE SET
        lessons_completed = student_daily_activities.lessons_completed + EXCLUDED.lessons_completed,
        time_spent_minutes = student_daily_activities.time_spent_minutes + EXCLUDED.time_spent_minutes,
        quizzes_completed = student_daily_activities.quizzes_completed + EXCLUDED.quizzes_completed,
        subjects_studied = array(SELECT DISTINCT unnest(student_daily_activities.subjects_studied || EXCLUDED.subjects_studied)),
        activity_level = GREATEST(
            student_daily_activities.activity_level,
            CASE 
                WHEN (student_daily_activities.lessons_completed + EXCLUDED.lessons_completed) > 3 
                     OR (student_daily_activities.time_spent_minutes + EXCLUDED.time_spent_minutes) > 90 THEN 4
                WHEN (student_daily_activities.lessons_completed + EXCLUDED.lessons_completed) > 2 
                     OR (student_daily_activities.time_spent_minutes + EXCLUDED.time_spent_minutes) > 60 THEN 3
                WHEN (student_daily_activities.lessons_completed + EXCLUDED.lessons_completed) > 1 
                     OR (student_daily_activities.time_spent_minutes + EXCLUDED.time_spent_minutes) > 30 THEN 2
                WHEN (student_daily_activities.lessons_completed + EXCLUDED.lessons_completed) > 0 
                     OR (student_daily_activities.time_spent_minutes + EXCLUDED.time_spent_minutes) > 0 
                     OR (student_daily_activities.quizzes_completed + EXCLUDED.quizzes_completed) > 0 THEN 1
                ELSE 0
            END
        ),
        updated_at = NOW();
        
    RAISE NOTICE 'Activity recorded for student % on %', p_student_id, p_activity_date;
END;
$$ LANGUAGE plpgsql;

-- Function to get student activity data for calendar
CREATE OR REPLACE FUNCTION get_student_activity_calendar(
    p_student_id UUID,
    p_days_back INTEGER DEFAULT 365
)
RETURNS TABLE (
    activity_date DATE,
    lessons_completed INTEGER,
    time_spent_minutes INTEGER,
    quizzes_completed INTEGER,
    subjects_studied TEXT[],
    activity_level INTEGER
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        sda.activity_date,
        sda.lessons_completed,
        sda.time_spent_minutes,
        sda.quizzes_completed,
        sda.subjects_studied,
        sda.activity_level
    FROM student_daily_activities sda
    WHERE sda.student_id = p_student_id
      AND sda.activity_date >= CURRENT_DATE - INTERVAL '1 day' * p_days_back
    ORDER BY sda.activity_date DESC;
END;
$$ LANGUAGE plpgsql;

-- Function to calculate current streak
CREATE OR REPLACE FUNCTION get_student_current_streak(p_student_id UUID)
RETURNS INTEGER AS $$
DECLARE
    current_streak INTEGER := 0;
    check_date DATE := CURRENT_DATE;
    has_activity BOOLEAN;
BEGIN
    LOOP
        SELECT EXISTS(
            SELECT 1 FROM student_daily_activities 
            WHERE student_id = p_student_id 
              AND activity_date = check_date 
              AND activity_level > 0
        ) INTO has_activity;
        
        IF has_activity THEN
            current_streak := current_streak + 1;
            check_date := check_date - INTERVAL '1 day';
        ELSE
            EXIT;
        END IF;
    END LOOP;
    
    RETURN current_streak;
END;
$$ LANGUAGE plpgsql;

-- Function to calculate longest streak
CREATE OR REPLACE FUNCTION get_student_longest_streak(p_student_id UUID)
RETURNS INTEGER AS $$
DECLARE
    longest_streak INTEGER := 0;
    current_streak INTEGER := 0;
    activity_record RECORD;
    last_date DATE := NULL;
BEGIN
    FOR activity_record IN 
        SELECT activity_date 
        FROM student_daily_activities 
        WHERE student_id = p_student_id 
          AND activity_level > 0 
        ORDER BY activity_date ASC
    LOOP
        IF last_date IS NULL OR activity_record.activity_date = last_date + INTERVAL '1 day' THEN
            current_streak := current_streak + 1;
            longest_streak := GREATEST(longest_streak, current_streak);
        ELSE
            current_streak := 1;
        END IF;
        
        last_date := activity_record.activity_date;
    END LOOP;
    
    RETURN longest_streak;
END;
$$ LANGUAGE plpgsql;

-- Function to get streak stats
CREATE OR REPLACE FUNCTION get_student_streak_stats(p_student_id UUID)
RETURNS TABLE (
    current_streak INTEGER,
    longest_streak INTEGER,
    total_active_days INTEGER,
    this_week_days INTEGER,
    this_month_days INTEGER
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        get_student_current_streak(p_student_id),
        get_student_longest_streak(p_student_id),
        (SELECT COUNT(*)::INTEGER FROM student_daily_activities 
         WHERE student_id = p_student_id AND activity_level > 0),
        (SELECT COUNT(*)::INTEGER FROM student_daily_activities 
         WHERE student_id = p_student_id 
           AND activity_level > 0 
           AND activity_date >= CURRENT_DATE - INTERVAL '7 days'),
        (SELECT COUNT(*)::INTEGER FROM student_daily_activities 
         WHERE student_id = p_student_id 
           AND activity_level > 0 
           AND activity_date >= CURRENT_DATE - INTERVAL '30 days');
END;
$$ LANGUAGE plpgsql;

-- Update the existing helper functions to record activity
CREATE OR REPLACE FUNCTION add_student_quiz_result_with_activity(
    student_user_id UUID,
    quiz_title TEXT,
    subject_name TEXT,
    score INTEGER,
    total_questions INTEGER,
    time_spent INTEGER,
    difficulty TEXT DEFAULT 'medium'
)
RETURNS VOID AS $$
DECLARE
    score_percentage DECIMAL;
BEGIN
    -- Insert the quiz result
    INSERT INTO student_quiz_results (student_id, quiz_title, subject, score, total_questions, time_spent, difficulty)
    VALUES (student_user_id, quiz_title, subject_name, score, total_questions, time_spent, difficulty);
    
    -- Record daily activity
    PERFORM record_student_activity(
        student_user_id,
        CURRENT_DATE,
        0, -- lessons_completed
        time_spent,
        1, -- quizzes_completed
        ARRAY[subject_name]
    );
    
    -- Calculate score percentage
    score_percentage := (score::DECIMAL / total_questions::DECIMAL) * 100;
    
    -- Update student progress based on quiz performance
    PERFORM update_student_lesson_progress(student_user_id, subject_name, score_percentage);
    
    -- Check for achievements
    PERFORM check_and_award_achievements(student_user_id);
    
    RAISE NOTICE 'Added quiz result and recorded activity for %: % (%/%)', student_user_id, quiz_title, score, total_questions;
END;
$$ LANGUAGE plpgsql;

-- Generate sample activity data for existing students
CREATE OR REPLACE FUNCTION generate_sample_activity_data(p_student_id UUID)
RETURNS VOID AS $$
DECLARE
    activity_date DATE;
    days_back INTEGER := 365;
    activity_chance DECIMAL;
    lessons INTEGER;
    time_minutes INTEGER;
    quizzes INTEGER;
    subjects TEXT[];
BEGIN
    -- Generate activity for the past year
    FOR i IN 0..days_back LOOP
        activity_date := CURRENT_DATE - INTERVAL '1 day' * i;
        
        -- Higher activity chance for recent days and weekdays
        activity_chance := CASE 
            WHEN i < 30 THEN 0.8  -- Recent month
            WHEN EXTRACT(DOW FROM activity_date) IN (0, 6) THEN 0.3  -- Weekends
            ELSE 0.6  -- Regular weekdays
        END;
        
        IF random() < activity_chance THEN
            lessons := floor(random() * 4)::INTEGER + 1;  -- 1-4 lessons
            time_minutes := floor(random() * 90)::INTEGER + 15;  -- 15-105 minutes
            quizzes := floor(random() * 2)::INTEGER;  -- 0-1 quizzes
            
            subjects := ARRAY(
                SELECT subject_name 
                FROM unnest(ARRAY['Mathematics', 'Physics', 'Chemistry', 'English', 'Science']) AS subject_name
                ORDER BY random()
                LIMIT (floor(random() * 3)::INTEGER + 1)
            );
            
            PERFORM record_student_activity(
                p_student_id,
                activity_date,
                lessons,
                time_minutes,
                quizzes,
                subjects
            );
        END IF;
    END LOOP;
    
    RAISE NOTICE 'Generated sample activity data for student: %', p_student_id;
END;
$$ LANGUAGE plpgsql;

-- Success message
DO $$
BEGIN
    RAISE NOTICE 'Student activity tracking system created successfully!';
    RAISE NOTICE 'Use record_student_activity() to log daily activities';
    RAISE NOTICE 'Use get_student_activity_calendar() to get calendar data';
    RAISE NOTICE 'Use get_student_streak_stats() to get streak information';
END $$;