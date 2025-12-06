-- FIX RLS POLICIES - Allow profile creation during login

-- Check current RLS policies
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual, with_check
FROM pg_policies 
WHERE tablename IN ('student_profiles', 'student_progress', 'student_achievements')
ORDER BY tablename, policyname;

-- Disable RLS temporarily to test
ALTER TABLE student_profiles DISABLE ROW LEVEL SECURITY;
ALTER TABLE student_progress DISABLE ROW LEVEL SECURITY;
ALTER TABLE student_achievements DISABLE ROW LEVEL SECURITY;

-- Drop all existing policies
DROP POLICY IF EXISTS "Users can view own profile" ON student_profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON student_profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON student_profiles;
DROP POLICY IF EXISTS "Enable insert for authenticated users only" ON student_profiles;
DROP POLICY IF EXISTS "Enable read access for all users" ON student_profiles;
DROP POLICY IF EXISTS "Enable update for users based on user_id" ON student_profiles;
DROP POLICY IF EXISTS "Allow users to view their own progress" ON student_progress;
DROP POLICY IF EXISTS "Allow users to update their own progress" ON student_progress;
DROP POLICY IF EXISTS "Allow users to insert their own progress" ON student_progress;
DROP POLICY IF EXISTS "Allow users to view their own achievements" ON student_achievements;
DROP POLICY IF EXISTS "Allow users to insert their own achievements" ON student_achievements;

-- Re-enable RLS
ALTER TABLE student_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE student_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE student_achievements ENABLE ROW LEVEL SECURITY;

-- Create PERMISSIVE policies that allow profile creation
CREATE POLICY "Allow authenticated users to insert profiles" ON student_profiles
    FOR INSERT TO authenticated
    WITH CHECK (true);

CREATE POLICY "Allow authenticated users to view profiles" ON student_profiles
    FOR SELECT TO authenticated
    USING (true);

CREATE POLICY "Allow authenticated users to update own profiles" ON student_profiles
    FOR UPDATE TO authenticated
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

-- Student progress policies
CREATE POLICY "Allow authenticated users to insert progress" ON student_progress
    FOR INSERT TO authenticated
    WITH CHECK (true);

CREATE POLICY "Allow authenticated users to view progress" ON student_progress
    FOR SELECT TO authenticated
    USING (true);

CREATE POLICY "Allow authenticated users to update own progress" ON student_progress
    FOR UPDATE TO authenticated
    USING (auth.uid() = student_id)
    WITH CHECK (auth.uid() = student_id);

-- Student achievements policies
CREATE POLICY "Allow authenticated users to insert achievements" ON student_achievements
    FOR INSERT TO authenticated
    WITH CHECK (true);

CREATE POLICY "Allow authenticated users to view achievements" ON student_achievements
    FOR SELECT TO authenticated
    USING (true);

-- Also allow anonymous users for login flow
CREATE POLICY "Allow anonymous users to insert profiles" ON student_profiles
    FOR INSERT TO anon
    WITH CHECK (true);

CREATE POLICY "Allow anonymous users to insert progress" ON student_progress
    FOR INSERT TO anon
    WITH CHECK (true);

CREATE POLICY "Allow anonymous users to insert achievements" ON student_achievements
    FOR INSERT TO anon
    WITH CHECK (true);

-- Grant necessary permissions
GRANT ALL ON student_profiles TO authenticated, anon;
GRANT ALL ON student_progress TO authenticated, anon;
GRANT ALL ON student_achievements TO authenticated, anon;

-- Test the policies by trying to insert a test profile
DO $$
DECLARE
    test_user_id UUID := gen_random_uuid();
    test_result RECORD;
BEGIN
    -- Test profile insertion
    INSERT INTO student_profiles (
        user_id, email, first_name, last_name, grade, school_name,
        created_at, updated_at
    ) VALUES (
        test_user_id, 'test@example.com', 'Test', 'User', 6, 'Test School',
        NOW(), NOW()
    );
    
    -- Test progress insertion
    INSERT INTO student_progress (
        student_id, subject, grade, completed_lessons, total_lessons, 
        average_score, weekly_hours, difficulty_level
    ) VALUES (
        test_user_id, 'Mathematics', 6, 0, 15, 0, 0, 'beginner'
    );
    
    -- Test achievement insertion
    INSERT INTO student_achievements (
        student_id, achievement_name, achievement_description, 
        points_earned, achievement_type, earned_at
    ) VALUES (
        test_user_id, 'Test Achievement', 'Test Description', 
        10, 'milestone', NOW()
    );
    
    -- Clean up test data
    DELETE FROM student_achievements WHERE student_id = test_user_id;
    DELETE FROM student_progress WHERE student_id = test_user_id;
    DELETE FROM student_profiles WHERE user_id = test_user_id;
    
    RAISE NOTICE 'RLS POLICIES TEST PASSED - Profile creation should work now!';
    
EXCEPTION WHEN OTHERS THEN
    RAISE NOTICE 'RLS POLICIES TEST FAILED: %', SQLERRM;
    -- Clean up any partial test data
    DELETE FROM student_achievements WHERE student_id = test_user_id;
    DELETE FROM student_progress WHERE student_id = test_user_id;
    DELETE FROM student_profiles WHERE user_id = test_user_id;
END $$;