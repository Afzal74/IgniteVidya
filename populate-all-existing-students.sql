-- Populate data for all existing students
-- Run this to generate dynamic data for students who already exist

DO $$
DECLARE
    student_record RECORD;
    student_count INTEGER := 0;
BEGIN
    -- Loop through all existing student profiles
    FOR student_record IN 
        SELECT user_id, grade, full_name, email 
        FROM student_profiles 
    LOOP
        RAISE NOTICE 'Generating data for student: % (%) - Grade %', 
            student_record.full_name, 
            student_record.email, 
            student_record.grade;
        
        -- Generate complete data for this student
        PERFORM generate_complete_student_data(student_record.user_id, student_record.grade);
        
        student_count := student_count + 1;
    END LOOP;
    
    IF student_count = 0 THEN
        RAISE NOTICE 'No existing students found. Data will be auto-generated when students sign up.';
    ELSE
        RAISE NOTICE 'Generated dynamic data for % existing students!', student_count;
    END IF;
    
    -- Show summary
    RAISE NOTICE '=== DATA SUMMARY ===';
    RAISE NOTICE 'Total Progress Records: %', (SELECT COUNT(*) FROM student_progress);
    RAISE NOTICE 'Total Quiz Results: %', (SELECT COUNT(*) FROM student_quiz_results);
    RAISE NOTICE 'Total Achievements: %', (SELECT COUNT(*) FROM student_achievements);
END $$;