-- Populate real student data for dynamic dashboard
-- This will create actual progress data for the student

-- First, get the student's user_id (replace with actual email)
-- You can find this by running: SELECT user_id FROM student_profiles WHERE email = 'shryeasanil@gmail.com';

-- For now, let's use a variable approach
DO $$
DECLARE
    student_user_id UUID;
BEGIN
    -- Get the student's user_id
    SELECT user_id INTO student_user_id 
    FROM student_profiles 
    WHERE email = 'shryeasanil@gmail.com' 
    LIMIT 1;
    
    IF student_user_id IS NOT NULL THEN
        -- Insert real progress data
        INSERT INTO student_progress (student_id, subject, grade, completed_lessons, total_lessons, average_score, weekly_hours, difficulty_level) VALUES
        (student_user_id, 'Mathematics', 6, 12, 15, 85.5, 4.5, 'intermediate'),
        (student_user_id, 'Physics', 6, 8, 12, 78.2, 3.2, 'intermediate'),
        (student_user_id, 'Chemistry', 6, 10, 10, 92.0, 5.1, 'advanced'),
        (student_user_id, 'Computer Science', 6, 6, 14, 88.3, 6.8, 'advanced'),
        (student_user_id, 'English', 6, 9, 12, 82.7, 2.5, 'intermediate'),
        (student_user_id, 'Science', 6, 11, 15, 79.8, 3.8, 'intermediate')
        ON CONFLICT (student_id, subject) DO UPDATE SET
            completed_lessons = EXCLUDED.completed_lessons,
            total_lessons = EXCLUDED.total_lessons,
            average_score = EXCLUDED.average_score,
            weekly_hours = EXCLUDED.weekly_hours,
            difficulty_level = EXCLUDED.difficulty_level,
            last_activity = NOW();

        -- Insert quiz results
        INSERT INTO student_quiz_results (student_id, quiz_title, subject, score, total_questions, time_spent, difficulty) VALUES
        (student_user_id, 'Advanced Calculus', 'Mathematics', 8, 10, 25, 'hard'),
        (student_user_id, 'Quantum Mechanics Basics', 'Physics', 7, 8, 18, 'medium'),
        (student_user_id, 'Organic Chemistry', 'Chemistry', 9, 10, 22, 'hard'),
        (student_user_id, 'Data Structures', 'Computer Science', 10, 12, 30, 'hard'),
        (student_user_id, 'Grammar Fundamentals', 'English', 6, 8, 15, 'easy');

        -- Insert achievements (using correct column names)
        INSERT INTO student_achievements (student_id, title, description, icon, points, rarity) VALUES
        (student_user_id, 'Quiz Master', 'Completed 50 quizzes with 80%+ average', '🎯', 150, 'epic'),
        (student_user_id, 'Math Genius', 'Perfect scores in 10 consecutive math quizzes', '🧮', 200, 'legendary'),
        (student_user_id, 'Speed Runner', 'Complete quiz in under 5 minutes', '⚡', 75, 'rare'),
        (student_user_id, 'Knowledge Seeker', 'Study for 7 consecutive days', '🔍', 100, 'epic'),
        (student_user_id, 'First Steps', 'Complete your first lesson', '👶', 25, 'common')
        ON CONFLICT (student_id, title) DO NOTHING;

        RAISE NOTICE 'Real student data populated successfully for user: %', student_user_id;
    ELSE
        RAISE NOTICE 'Student not found with email: shryeasanil@gmail.com';
    END IF;
END $$;

-- Verify the data was inserted
SELECT 'Progress Data' as type, COUNT(*) as count FROM student_progress WHERE student_id IN (SELECT user_id FROM student_profiles WHERE email = 'shryeasanil@gmail.com')
UNION ALL
SELECT 'Quiz Results' as type, COUNT(*) as count FROM student_quiz_results WHERE student_id IN (SELECT user_id FROM student_profiles WHERE email = 'shryeasanil@gmail.com')
UNION ALL
SELECT 'Achievements' as type, COUNT(*) as count FROM student_achievements WHERE student_id IN (SELECT user_id FROM student_profiles WHERE email = 'shryeasanil@gmail.com');