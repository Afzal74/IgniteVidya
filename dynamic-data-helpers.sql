-- Helper functions for dynamic data management

-- Function to update student progress when they complete a lesson
CREATE OR REPLACE FUNCTION update_student_lesson_progress(
    student_user_id UUID,
    subject_name TEXT,
    lesson_score DECIMAL DEFAULT NULL
)
RETURNS VOID AS $$
DECLARE
    current_progress RECORD;
    new_average DECIMAL;
BEGIN
    -- Get current progress for this subject
    SELECT * INTO current_progress 
    FROM student_progress 
    WHERE student_id = student_user_id AND subject = subject_name;
    
    IF current_progress IS NULL THEN
        -- Create new progress record if doesn't exist
        INSERT INTO student_progress (student_id, subject, grade, completed_lessons, total_lessons, average_score, weekly_hours, difficulty_level)
        VALUES (student_user_id, subject_name, 6, 1, 20, COALESCE(lesson_score, 75.0), 1.0, 'intermediate');
        
        RAISE NOTICE 'Created new progress record for % in %', student_user_id, subject_name;
    ELSE
        -- Update existing progress
        IF lesson_score IS NOT NULL THEN
            -- Calculate new average score
            new_average := ((current_progress.average_score * current_progress.completed_lessons) + lesson_score) / (current_progress.completed_lessons + 1);
        ELSE
            new_average := current_progress.average_score;
        END IF;
        
        UPDATE student_progress 
        SET 
            completed_lessons = completed_lessons + 1,
            average_score = new_average,
            updated_at = NOW()
        WHERE student_id = student_user_id AND subject = subject_name;
        
        RAISE NOTICE 'Updated progress for % in %: % lessons completed', student_user_id, subject_name, current_progress.completed_lessons + 1;
    END IF;
END;
$$ LANGUAGE plpgsql;

-- Function to add a new quiz result and update progress
CREATE OR REPLACE FUNCTION add_student_quiz_result(
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
    
    -- Calculate score percentage
    score_percentage := (score::DECIMAL / total_questions::DECIMAL) * 100;
    
    -- Update student progress based on quiz performance
    PERFORM update_student_lesson_progress(student_user_id, subject_name, score_percentage);
    
    -- Check for achievements
    PERFORM check_and_award_achievements(student_user_id);
    
    RAISE NOTICE 'Added quiz result for %: % (%/%)', student_user_id, quiz_title, score, total_questions;
END;
$$ LANGUAGE plpgsql;

-- Function to check and award achievements
CREATE OR REPLACE FUNCTION check_and_award_achievements(student_user_id UUID)
RETURNS VOID AS $$
DECLARE
    quiz_count INTEGER;
    perfect_scores INTEGER;
    avg_score DECIMAL;
    subjects_count INTEGER;
    streak_days INTEGER;
BEGIN
    -- Check Quiz Master achievement (50+ quizzes with 80%+ average)
    SELECT COUNT(*), AVG((score::DECIMAL / total_questions::DECIMAL) * 100) 
    INTO quiz_count, avg_score
    FROM student_quiz_results 
    WHERE student_id = student_user_id;
    
    IF quiz_count >= 50 AND avg_score >= 80 AND NOT EXISTS (
        SELECT 1 FROM student_achievements 
        WHERE student_id = student_user_id AND achievement_name = 'Quiz Master'
    ) THEN
        INSERT INTO student_achievements (student_id, achievement_name, achievement_description, achievement_type, points_earned)
        VALUES (student_user_id, 'Quiz Master', 'Completed 50 quizzes with 80%+ average', 'quiz', 150);
        RAISE NOTICE 'Achievement unlocked: Quiz Master!';
    END IF;
    
    -- Check Perfect Scores achievement (100% on 5 different subjects)
    SELECT COUNT(DISTINCT subject) INTO perfect_scores
    FROM student_quiz_results 
    WHERE student_id = student_user_id 
    AND (score::DECIMAL / total_questions::DECIMAL) = 1.0;
    
    IF perfect_scores >= 5 AND NOT EXISTS (
        SELECT 1 FROM student_achievements 
        WHERE student_id = student_user_id AND achievement_name = 'Perfectionist'
    ) THEN
        INSERT INTO student_achievements (student_id, achievement_name, achievement_description, achievement_type, points_earned)
        VALUES (student_user_id, 'Perfectionist', 'Score 100% on 5 different subjects', 'academic', 175);
        RAISE NOTICE 'Achievement unlocked: Perfectionist!';
    END IF;
    
    -- Check Subject Explorer achievement (8+ different subjects)
    SELECT COUNT(DISTINCT subject) INTO subjects_count
    FROM student_progress 
    WHERE student_id = student_user_id;
    
    IF subjects_count >= 8 AND NOT EXISTS (
        SELECT 1 FROM student_achievements 
        WHERE student_id = student_user_id AND achievement_name = 'Subject Explorer'
    ) THEN
        INSERT INTO student_achievements (student_id, achievement_name, achievement_description, achievement_type, points_earned)
        VALUES (student_user_id, 'Subject Explorer', 'Try lessons in 8 different subjects', 'milestone', 125);
        RAISE NOTICE 'Achievement unlocked: Subject Explorer!';
    END IF;
    
    -- Award First Steps achievement if it's their first quiz/lesson
    IF quiz_count = 1 AND NOT EXISTS (
        SELECT 1 FROM student_achievements 
        WHERE student_id = student_user_id AND achievement_name = 'First Steps'
    ) THEN
        INSERT INTO student_achievements (student_id, achievement_name, achievement_description, achievement_type, points_earned)
        VALUES (student_user_id, 'First Steps', 'Complete your first lesson', 'milestone', 25);
        RAISE NOTICE 'Achievement unlocked: First Steps!';
    END IF;
END;
$$ LANGUAGE plpgsql;

-- Function to get student dashboard data
CREATE OR REPLACE FUNCTION get_student_dashboard_data(student_user_id UUID)
RETURNS JSON AS $$
DECLARE
    result JSON;
BEGIN
    SELECT json_build_object(
        'progress', (
            SELECT json_agg(
                json_build_object(
                    'subject', subject,
                    'grade', grade,
                    'completed_lessons', completed_lessons,
                    'total_lessons', total_lessons,
                    'average_score', average_score,
                    'weekly_hours', weekly_hours,
                    'difficulty_level', difficulty_level
                )
            )
            FROM student_progress 
            WHERE student_id = student_user_id
        ),
        'quiz_results', (
            SELECT json_agg(
                json_build_object(
                    'quiz_title', quiz_title,
                    'subject', subject,
                    'score', score,
                    'total_questions', total_questions,
                    'time_spent', time_spent,
                    'difficulty', difficulty,
                    'completed_at', completed_at
                )
            )
            FROM student_quiz_results 
            WHERE student_id = student_user_id
            ORDER BY completed_at DESC
            LIMIT 10
        ),
        'achievements', (
            SELECT json_agg(
                json_build_object(
                    'achievement_name', achievement_name,
                    'achievement_description', achievement_description,
                    'achievement_type', achievement_type,
                    'points_earned', points_earned,
                    'earned_at', earned_at
                )
            )
            FROM student_achievements 
            WHERE student_id = student_user_id
            ORDER BY earned_at DESC
        ),
        'total_points', (
            SELECT COALESCE(SUM(points_earned), 0)
            FROM student_achievements 
            WHERE student_id = student_user_id
        )
    ) INTO result;
    
    RETURN result;
END;
$$ LANGUAGE plpgsql;

RAISE NOTICE 'Dynamic data helper functions created successfully!';