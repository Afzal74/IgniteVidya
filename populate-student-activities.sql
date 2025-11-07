-- Populate sample activity data for all existing students
-- Run this to generate realistic activity patterns for the streak calendar

DO $$
DECLARE
    student_record RECORD;
    student_count INTEGER := 0;
BEGIN
    -- Loop through all existing student profiles
    FOR student_record IN 
        SELECT user_id, first_name, last_name, email 
        FROM student_profiles 
    LOOP
        RAISE NOTICE 'Generating activity data for student: % % (%)', 
            student_record.first_name, 
            student_record.last_name,
            student_record.email;
        
        -- Generate sample activity data for this student
        PERFORM generate_sample_activity_data(student_record.user_id);
        
        student_count := student_count + 1;
    END LOOP;
    
    IF student_count = 0 THEN
        RAISE NOTICE 'No existing students found. Activity data will be recorded when students use the platform.';
    ELSE
        RAISE NOTICE 'Generated activity data for % existing students!', student_count;
    END IF;
    
    -- Show summary
    RAISE NOTICE '=== ACTIVITY DATA SUMMARY ===';
    RAISE NOTICE 'Total Activity Records: %', (SELECT COUNT(*) FROM student_daily_activities);
    RAISE NOTICE 'Students with Activity: %', (SELECT COUNT(DISTINCT student_id) FROM student_daily_activities);
    RAISE NOTICE 'Average Activities per Student: %', 
        (SELECT ROUND(COUNT(*)::DECIMAL / NULLIF(COUNT(DISTINCT student_id), 0), 2) FROM student_daily_activities);
END $$;