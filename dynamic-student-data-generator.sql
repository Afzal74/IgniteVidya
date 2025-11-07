-- Dynamic Student Data Generator
-- This creates functions to generate realistic data for any student

-- Function to generate random progress data for a student
CREATE OR REPLACE FUNCTION generate_student_progress(student_user_id UUID, student_grade INTEGER DEFAULT 6)
RETURNS VOID AS $$
DECLARE
    subjects TEXT[] := ARRAY['Mathematics', 'Physics', 'Chemistry', 'Computer Science', 'English', 'Science', 'Biology', 'History', 'Geography'];
    subject_name TEXT;
    completed_lessons INTEGER;
    total_lessons INTEGER;
    avg_score DECIMAL;
    weekly_hrs DECIMAL;
    difficulty_levels TEXT[] := ARRAY['beginner', 'intermediate', 'advanced'];
    difficulty TEXT;
BEGIN
    -- Clear existing progress data
    DELETE FROM student_progress WHERE student_id = student_user_id;
    
    -- Generate progress for 4-6 random subjects
    FOR i IN 1..(4 + floor(random() * 3)::INTEGER) LOOP
        subject_name := subjects[1 + floor(random() * array_length(subjects, 1))::INTEGER];
        
        -- Skip if subject already exists for this student
        IF EXISTS (SELECT 1 FROM student_progress WHERE student_id = student_user_id AND subject = subject_name) THEN
            CONTINUE;
        END IF;
        
        total_lessons := 10 + floor(random() * 10)::INTEGER; -- 10-20 lessons
        completed_lessons := floor(random() * total_lessons)::INTEGER; -- 0 to total_lessons
        avg_score := 60 + (random() * 35); -- 60-95% average score
        weekly_hrs := 1 + (random() * 6); -- 1-7 hours per week
        difficulty := difficulty_levels[1 + floor(random() * 3)::INTEGER];
        
        INSERT INTO student_progress (student_id, subject, grade, completed_lessons, total_lessons, average_score, weekly_hours, difficulty_level)
        VALUES (student_user_id, subject_name, student_grade, completed_lessons, total_lessons, avg_score, weekly_hrs, difficulty);
    END LOOP;
    
    RAISE NOTICE 'Generated progress data for student: %', student_user_id;
END;
$$ LANGUAGE plpgsql;

-- Function to generate quiz results for a student
CREATE OR REPLACE FUNCTION generate_student_quiz_results(student_user_id UUID)
RETURNS VOID AS $$
DECLARE
    quiz_titles TEXT[] := ARRAY[
        'Basic Algebra', 'Advanced Calculus', 'Geometry Fundamentals', 'Statistics Quiz',
        'Quantum Mechanics', 'Classical Physics', 'Thermodynamics', 'Optics',
        'Organic Chemistry', 'Inorganic Chemistry', 'Chemical Bonding', 'Periodic Table',
        'Data Structures', 'Algorithms', 'Programming Logic', 'Database Design',
        'Grammar Test', 'Literature Analysis', 'Creative Writing', 'Vocabulary',
        'Cell Biology', 'Genetics', 'Evolution', 'Ecology',
        'World History', 'Ancient Civilizations', 'Modern History',
        'Physical Geography', 'Human Geography', 'Climate Studies'
    ];
    subjects TEXT[] := ARRAY['Mathematics', 'Physics', 'Chemistry', 'Computer Science', 'English', 'Science', 'Biology', 'History', 'Geography'];
    difficulties TEXT[] := ARRAY['easy', 'medium', 'hard'];
    
    quiz_title TEXT;
    subject_name TEXT;
    score INTEGER;
    total_questions INTEGER;
    time_spent INTEGER;
    difficulty TEXT;
BEGIN
    -- Clear existing quiz results
    DELETE FROM student_quiz_results WHERE student_id = student_user_id;
    
    -- Generate 5-15 quiz results
    FOR i IN 1..(5 + floor(random() * 11)::INTEGER) LOOP
        quiz_title := quiz_titles[1 + floor(random() * array_length(quiz_titles, 1))::INTEGER];
        subject_name := subjects[1 + floor(random() * array_length(subjects, 1))::INTEGER];
        total_questions := 5 + floor(random() * 16)::INTEGER; -- 5-20 questions
        score := floor(random() * (total_questions + 1))::INTEGER; -- 0 to total_questions
        time_spent := 5 + floor(random() * 46)::INTEGER; -- 5-50 minutes
        difficulty := difficulties[1 + floor(random() * 3)::INTEGER];
        
        INSERT INTO student_quiz_results (student_id, quiz_title, subject, score, total_questions, time_spent, difficulty)
        VALUES (student_user_id, quiz_title, subject_name, score, total_questions, time_spent, difficulty);
    END LOOP;
    
    RAISE NOTICE 'Generated quiz results for student: %', student_user_id;
END;
$$ LANGUAGE plpgsql;

-- Function to generate achievements for a student
CREATE OR REPLACE FUNCTION generate_student_achievements(student_user_id UUID)
RETURNS VOID AS $$
DECLARE
    achievement_data RECORD;
    achievements_list TEXT[][] := ARRAY[
        ARRAY['Quiz Master', 'Completed 50 quizzes with 80%+ average', 'quiz', '150'],
        ARRAY['Math Genius', 'Perfect scores in 10 consecutive math quizzes', 'academic', '200'],
        ARRAY['Speed Runner', 'Complete quiz in under 5 minutes', 'performance', '75'],
        ARRAY['Knowledge Seeker', 'Study for 7 consecutive days', 'habit', '100'],
        ARRAY['First Steps', 'Complete your first lesson', 'milestone', '25'],
        ARRAY['Perfectionist', 'Score 100% on 5 different subjects', 'academic', '175'],
        ARRAY['Night Owl', 'Study after 10 PM for a week', 'habit', '50'],
        ARRAY['Early Bird', 'Complete lessons before 8 AM', 'habit', '60'],
        ARRAY['Consistent Learner', 'Study every day for a month', 'habit', '300'],
        ARRAY['Subject Explorer', 'Try lessons in 8 different subjects', 'milestone', '125'],
        ARRAY['Quick Thinker', 'Answer 10 questions in under 30 seconds each', 'performance', '90'],
        ARRAY['Improvement Champion', 'Increase average score by 20%', 'academic', '180'],
        ARRAY['Helping Hand', 'Help 5 classmates with their studies', 'social', '85'],
        ARRAY['Challenge Accepted', 'Complete 10 hard difficulty quizzes', 'performance', '220'],
        ARRAY['Streak Master', 'Maintain 15-day learning streak', 'habit', '250']
    ];
    num_achievements INTEGER;
    selected_achievement TEXT[];
BEGIN
    -- Clear existing achievements
    DELETE FROM student_achievements WHERE student_id = student_user_id;
    
    -- Generate 3-8 random achievements
    num_achievements := 3 + floor(random() * 6)::INTEGER;
    
    FOR i IN 1..num_achievements LOOP
        selected_achievement := achievements_list[1 + floor(random() * array_length(achievements_list, 1))::INTEGER];
        
        -- Skip if achievement already exists for this student
        IF EXISTS (SELECT 1 FROM student_achievements WHERE student_id = student_user_id AND achievement_name = selected_achievement[1]) THEN
            CONTINUE;
        END IF;
        
        INSERT INTO student_achievements (student_id, achievement_name, achievement_description, achievement_type, points_earned)
        VALUES (
            student_user_id, 
            selected_achievement[1], 
            selected_achievement[2], 
            selected_achievement[3], 
            selected_achievement[4]::INTEGER
        );
    END LOOP;
    
    RAISE NOTICE 'Generated achievements for student: %', student_user_id;
END;
$$ LANGUAGE plpgsql;

-- Main function to generate all data for a student
CREATE OR REPLACE FUNCTION generate_complete_student_data(student_user_id UUID, student_grade INTEGER DEFAULT 6)
RETURNS VOID AS $$
BEGIN
    -- Generate all types of data
    PERFORM generate_student_progress(student_user_id, student_grade);
    PERFORM generate_student_quiz_results(student_user_id);
    PERFORM generate_student_achievements(student_user_id);
    
    RAISE NOTICE 'Complete student data generated for: %', student_user_id;
END;
$$ LANGUAGE plpgsql;

-- Function to auto-generate data for any student on first login
CREATE OR REPLACE FUNCTION auto_populate_new_student_data()
RETURNS TRIGGER AS $$
BEGIN
    -- Generate data for newly created student profile
    PERFORM generate_complete_student_data(NEW.user_id, NEW.grade);
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to auto-populate data for new students
DROP TRIGGER IF EXISTS auto_populate_student_data_trigger ON student_profiles;
CREATE TRIGGER auto_populate_student_data_trigger
    AFTER INSERT ON student_profiles
    FOR EACH ROW
    EXECUTE FUNCTION auto_populate_new_student_data();

-- Success message
DO $$
BEGIN
    RAISE NOTICE 'Dynamic student data generator functions created successfully!';
END $$;