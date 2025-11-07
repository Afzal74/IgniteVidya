-- Functions to dynamically update student progress
-- These will be called when students complete lessons, quizzes, etc.

-- Function to update lesson progress
CREATE OR REPLACE FUNCTION update_lesson_progress(
    p_student_id UUID,
    p_subject TEXT,
    p_lessons_completed INTEGER DEFAULT 1
)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    result JSON;
BEGIN
    -- Update or insert progress
    INSERT INTO student_progress (student_id, subject, grade, completed_lessons, total_lessons, average_score, weekly_hours, difficulty_level)
    VALUES (p_student_id, p_subject, 6, p_lessons_completed, 15, 0, 0, 'beginner')
    ON CONFLICT (student_id, subject) 
    DO UPDATE SET 
        completed_lessons = student_progress.completed_lessons + p_lessons_completed,
        last_activity = NOW(),
        updated_at = NOW();

    -- Return updated progress
    SELECT json_build_object(
        'success', true,
        'message', 'Lesson progress updated',
        'subject', p_subject,
        'completed_lessons', completed_lessons
    ) INTO result
    FROM student_progress 
    WHERE student_id = p_student_id AND subject = p_subject;

    RETURN result;
END;
$$;

-- Function to add quiz result and update average score
CREATE OR REPLACE FUNCTION add_quiz_result(
    p_student_id UUID,
    p_quiz_title TEXT,
    p_subject TEXT,
    p_score INTEGER,
    p_total_questions INTEGER,
    p_time_spent INTEGER DEFAULT 0,
    p_difficulty TEXT DEFAULT 'medium'
)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    result JSON;
    new_average DECIMAL;
BEGIN
    -- Insert quiz result
    INSERT INTO student_quiz_results (student_id, quiz_title, subject, score, total_questions, time_spent, difficulty)
    VALUES (p_student_id, p_quiz_title, p_subject, p_score, p_total_questions, p_time_spent, p_difficulty);

    -- Calculate new average score for the subject
    SELECT AVG((score::DECIMAL / total_questions) * 100) INTO new_average
    FROM student_quiz_results 
    WHERE student_id = p_student_id AND subject = p_subject;

    -- Update progress with new average
    INSERT INTO student_progress (student_id, subject, grade, completed_lessons, total_lessons, average_score, weekly_hours, difficulty_level)
    VALUES (p_student_id, p_subject, 6, 0, 15, new_average, 0, 'beginner')
    ON CONFLICT (student_id, subject) 
    DO UPDATE SET 
        average_score = new_average,
        last_activity = NOW(),
        updated_at = NOW();

    -- Return result
    SELECT json_build_object(
        'success', true,
        'message', 'Quiz result added and average updated',
        'subject', p_subject,
        'score', p_score,
        'new_average', new_average
    ) INTO result;

    RETURN result;
END;
$$;

-- Function to award achievement
CREATE OR REPLACE FUNCTION award_achievement(
    p_student_id UUID,
    p_title TEXT,
    p_description TEXT,
    p_icon TEXT,
    p_points INTEGER DEFAULT 50,
    p_rarity TEXT DEFAULT 'common'
)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    result JSON;
BEGIN
    -- Insert achievement (ignore if already exists)
    INSERT INTO student_achievements (student_id, achievement_title, achievement_description, achievement_icon, points, rarity)
    VALUES (p_student_id, p_title, p_description, p_icon, p_points, p_rarity)
    ON CONFLICT (student_id, achievement_title) DO NOTHING;

    -- Return result
    SELECT json_build_object(
        'success', true,
        'message', 'Achievement awarded',
        'title', p_title,
        'points', p_points
    ) INTO result;

    RETURN result;
END;
$$;

-- Grant permissions
GRANT EXECUTE ON FUNCTION update_lesson_progress TO authenticated;
GRANT EXECUTE ON FUNCTION add_quiz_result TO authenticated;
GRANT EXECUTE ON FUNCTION award_achievement TO authenticated;

SELECT 'Dynamic progress functions created successfully' as status;