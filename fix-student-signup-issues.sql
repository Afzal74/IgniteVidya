-- Fix student signup issues
-- 1. Fix RLS policies for student tables
-- 2. Create missing student profile for existing user

-- First, let's disable RLS temporarily to fix the data
ALTER TABLE student_profiles DISABLE ROW LEVEL SECURITY;
ALTER TABLE student_progress DISABLE ROW LEVEL SECURITY;
ALTER TABLE student_quiz_results DISABLE ROW LEVEL SECURITY;
ALTER TABLE student_achievements DISABLE ROW LEVEL SECURITY;
ALTER TABLE student_activities DISABLE ROW LEVEL SECURITY;

-- Check if the user exists in auth.users and create student profile
DO $$
DECLARE
    user_record RECORD;
    student_exists BOOLEAN;
BEGIN
    -- Find the user with email cusoraigmmmail@gmail.com
    SELECT id, email INTO user_record 
    FROM auth.users 
    WHERE email = 'cusoraigmmmail@gmail.com' 
    LIMIT 1;
    
    IF user_record.id IS NOT NULL THEN
        RAISE NOTICE 'Found user: % with ID: %', user_record.email, user_record.id;
        
        -- Check if student profile already exists
        SELECT EXISTS(
            SELECT 1 FROM student_profiles 
            WHERE user_id = user_record.id OR email = user_record.email
        ) INTO student_exists;
        
        IF NOT student_exists THEN
            -- Create student profile based on the signup form data shown in image
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
                date_of_birth
            ) VALUES (
                user_record.id,
                'cusoraigmmmail@gmail.com',
                'Afzal',
                'Basheer',
                6,
                'A',
                '1',
                'Moodlakatte Institute of Technology',
                'appuafzal777@gmail.com',
                '8073925730',
                '2004-04-30'
            );
            
            RAISE NOTICE 'Created student profile for: %', user_record.email;
            
            -- Generate initial data for the student
            PERFORM generate_complete_student_data(user_record.id, 6);
            
            RAISE NOTICE 'Generated initial data for student';
        ELSE
            RAISE NOTICE 'Student profile already exists for: %', user_record.email;
        END IF;
    ELSE
        RAISE NOTICE 'User not found with email: cusoraigmmmail@gmail.com';
    END IF;
END $$;

-- Now create proper RLS policies that actually work
-- Policy for student_profiles
CREATE POLICY "Students can view own profile" ON student_profiles
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Students can update own profile" ON student_profiles
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Allow student profile creation" ON student_profiles
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Policy for student_progress
CREATE POLICY "Students can view own progress" ON student_progress
    FOR SELECT USING (auth.uid() = student_id);

CREATE POLICY "Students can insert own progress" ON student_progress
    FOR INSERT WITH CHECK (auth.uid() = student_id);

CREATE POLICY "Students can update own progress" ON student_progress
    FOR UPDATE USING (auth.uid() = student_id);

-- Policy for student_quiz_results
CREATE POLICY "Students can view own quiz results" ON student_quiz_results
    FOR SELECT USING (auth.uid() = student_id);

CREATE POLICY "Students can insert own quiz results" ON student_quiz_results
    FOR INSERT WITH CHECK (auth.uid() = student_id);

-- Policy for student_achievements
CREATE POLICY "Students can view own achievements" ON student_achievements
    FOR SELECT USING (auth.uid() = student_id);

CREATE POLICY "Students can insert own achievements" ON student_achievements
    FOR INSERT WITH CHECK (auth.uid() = student_id);

-- Policy for student_activities (if exists)
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'student_activities') THEN
        EXECUTE 'CREATE POLICY "Students can view own activities" ON student_activities
            FOR SELECT USING (auth.uid() = student_id)';
        
        EXECUTE 'CREATE POLICY "Students can insert own activities" ON student_activities
            FOR INSERT WITH CHECK (auth.uid() = student_id)';
            
        RAISE NOTICE 'Created policies for student_activities table';
    END IF;
END $$;

-- Re-enable RLS with proper policies
ALTER TABLE student_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE student_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE student_quiz_results ENABLE ROW LEVEL SECURITY;
ALTER TABLE student_achievements ENABLE ROW LEVEL SECURITY;

-- Enable RLS for student_activities if it exists
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'student_activities') THEN
        EXECUTE 'ALTER TABLE student_activities ENABLE ROW LEVEL SECURITY';
        RAISE NOTICE 'Enabled RLS for student_activities table';
    END IF;
END $$;

-- Verify the student profile was created
SELECT 
    user_id,
    email,
    first_name,
    last_name,
    grade,
    school_name,
    created_at
FROM student_profiles 
WHERE email = 'cusoraigmmmail@gmail.com';

RAISE NOTICE 'Student signup issues fixed! User should now be able to login.';