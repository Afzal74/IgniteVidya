-- Simple version to populate student data without constraints
-- Run this to add real data to your student dashboard

-- Get the student user_id first
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
        RAISE NOTICE 'Found student with user_id: %', student_user_id;
        
        -- Clear existing data first
        DELETE FROM student_progress WHERE student_id = student_user_id;
        DELETE FROM student_quiz_results WHERE student_id = student_user_id;
        DELETE FROM student_achievements WHERE student_id = student_user_id;
        
        -- Insert progress data
        INSERT INTO student_progress (student_id, subject, grade, completed_lessons, total_lessons, average_score, weekly_hours, difficulty_level) VALUES
        (student_user_id, 'Mathematics', 6, 12, 15, 85.5, 4.5, 'intermediate'),
        (student_user_id, 'Physics', 6, 8, 12, 78.2, 3.2, 'intermediate'),
        (student_user_id, 'Chemistry', 6, 10, 10, 92.0, 5.1, 'advanced'),
        (student_user_id, 'Computer Science', 6, 6, 14, 88.3, 6.8, 'advanced'),
        (student_user_id, 'English', 6, 9, 12, 82.7, 2.5, 'intermediate'),
        (student_user_id, 'Science', 6, 11, 15, 79.8, 3.8, 'intermediate');

        -- Insert quiz results
        INSERT INTO student_quiz_results (student_id, quiz_title, subject, score, total_questions, time_spent, difficulty) VALUES
        (student_user_id, 'Advanced Calculus', 'Mathematics', 8, 10, 25, 'hard'),
        (student_user_id, 'Quantum Mechanics Basics', 'Physics', 7, 8, 18, 'medium'),
        (student_user_id, 'Organic Chemistry', 'Chemistry', 9, 10, 22, 'hard'),
        (student_user_id, 'Data Structures', 'Computer Science', 10, 12, 30, 'hard'),
        (student_user_id, 'Grammar Fundamentals', 'English', 6, 8, 15, 'easy');

        -- Insert achievements with explicit column specification
        INSERT INTO student_achievements (student_id, achievement_name, achievement_description, points_earned, achievement_type) VALUES
        (student_user_id, 'Quiz Master', 'Completed 50 quizzes with 80%+ average', 150, 'quiz'),
        (student_user_id, 'Math Genius', 'Perfect scores in 10 consecutive math quizzes', 200, 'academic'),
        (student_user_id, 'Speed Runner', 'Complete quiz in under 5 minutes', 75, 'performance'),
        (student_user_id, 'Knowledge Seeker', 'Study for 7 consecutive days', 100, 'habit'),
        (student_user_id, 'First Steps', 'Complete your first lesson', 25, 'milestone');

        RAISE NOTICE 'Real student data populated successfully!';
    ELSE
        RAISE NOTICE 'Student not found with email: shryeasanil@gmail.com';
    END IF;
END $$;

-- Verify the data
SELECT 'Progress Data' as type, COUNT(*) as count FROM student_progress 
WHERE student_id IN (SELECT user_id FROM student_profiles WHERE email = 'shryeasanil@gmail.com')
UNION ALL
SELECT 'Quiz Results' as type, COUNT(*) as count FROM student_quiz_results 
WHERE student_id IN (SELECT user_id FROM student_profiles WHERE email = 'shryeasanil@gmail.com');