-- Student Authentication Setup for Supabase
-- Run this in your Supabase SQL Editor

-- ============================================
-- 1. CREATE STUDENT_PROFILES TABLE
-- ============================================

-- Create student_profiles table
CREATE TABLE IF NOT EXISTS student_profiles (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE NOT NULL,
  email TEXT UNIQUE NOT NULL,
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  grade INTEGER NOT NULL CHECK (grade >= 1 AND grade <= 12),
  section TEXT,
  roll_number TEXT,
  school_name TEXT,
  parent_email TEXT,
  phone_number TEXT,
  date_of_birth DATE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS on student_profiles
ALTER TABLE student_profiles ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Students can view own profile" ON student_profiles;
DROP POLICY IF EXISTS "Students can update own profile" ON student_profiles;
DROP POLICY IF EXISTS "Allow student insert during signup" ON student_profiles;

-- Create policies for student_profiles
CREATE POLICY "Students can view own profile"
  ON student_profiles FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Students can update own profile"
  ON student_profiles FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Allow student insert during signup"
  ON student_profiles FOR INSERT
  WITH CHECK (true);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS student_profiles_user_id_idx ON student_profiles(user_id);
CREATE INDEX IF NOT EXISTS student_profiles_email_idx ON student_profiles(email);
CREATE INDEX IF NOT EXISTS student_profiles_grade_idx ON student_profiles(grade);
CREATE INDEX IF NOT EXISTS student_profiles_school_name_idx ON student_profiles(school_name);

-- ============================================
-- 2. CREATE STUDENT PROGRESS TRACKING TABLES
-- ============================================

-- Create student_progress table for tracking academic progress
CREATE TABLE IF NOT EXISTS student_progress (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  student_id UUID REFERENCES student_profiles(user_id) ON DELETE CASCADE NOT NULL,
  subject TEXT NOT NULL,
  grade INTEGER NOT NULL,
  completed_lessons INTEGER DEFAULT 0,
  total_lessons INTEGER DEFAULT 0,
  average_score DECIMAL(5,2) DEFAULT 0.00,
  weekly_hours DECIMAL(4,2) DEFAULT 0.00,
  last_activity TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  difficulty_level TEXT DEFAULT 'beginner' CHECK (difficulty_level IN ('beginner', 'intermediate', 'advanced')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS on student_progress
ALTER TABLE student_progress ENABLE ROW LEVEL SECURITY;

-- Create policies for student_progress
DROP POLICY IF EXISTS "Students can view own progress" ON student_progress;
DROP POLICY IF EXISTS "Students can update own progress" ON student_progress;

CREATE POLICY "Students can view own progress"
  ON student_progress FOR SELECT
  USING (auth.uid() = student_id);

CREATE POLICY "Students can update own progress"
  ON student_progress FOR ALL
  USING (auth.uid() = student_id);

-- Create student_achievements table
CREATE TABLE IF NOT EXISTS student_achievements (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  student_id UUID REFERENCES student_profiles(user_id) ON DELETE CASCADE NOT NULL,
  achievement_title TEXT NOT NULL,
  achievement_description TEXT NOT NULL,
  achievement_icon TEXT NOT NULL,
  points INTEGER DEFAULT 0,
  rarity TEXT DEFAULT 'common' CHECK (rarity IN ('common', 'rare', 'epic', 'legendary')),
  earned_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS on student_achievements
ALTER TABLE student_achievements ENABLE ROW LEVEL SECURITY;

-- Create policies for student_achievements
DROP POLICY IF EXISTS "Students can view own achievements" ON student_achievements;
DROP POLICY IF EXISTS "Students can manage own achievements" ON student_achievements;

CREATE POLICY "Students can view own achievements"
  ON student_achievements FOR SELECT
  USING (auth.uid() = student_id);

CREATE POLICY "Students can manage own achievements"
  ON student_achievements FOR ALL
  USING (auth.uid() = student_id);

-- Create student_quiz_results table
CREATE TABLE IF NOT EXISTS student_quiz_results (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  student_id UUID REFERENCES student_profiles(user_id) ON DELETE CASCADE NOT NULL,
  quiz_title TEXT NOT NULL,
  subject TEXT NOT NULL,
  score INTEGER NOT NULL,
  total_questions INTEGER NOT NULL,
  time_spent INTEGER DEFAULT 0, -- in minutes
  difficulty TEXT DEFAULT 'easy' CHECK (difficulty IN ('easy', 'medium', 'hard')),
  completed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS on student_quiz_results
ALTER TABLE student_quiz_results ENABLE ROW LEVEL SECURITY;

-- Create policies for student_quiz_results
DROP POLICY IF EXISTS "Students can view own quiz results" ON student_quiz_results;
DROP POLICY IF EXISTS "Students can manage own quiz results" ON student_quiz_results;

CREATE POLICY "Students can view own quiz results"
  ON student_quiz_results FOR SELECT
  USING (auth.uid() = student_id);

CREATE POLICY "Students can manage own quiz results"
  ON student_quiz_results FOR ALL
  USING (auth.uid() = student_id);

-- ============================================
-- 3. CREATE INDEXES FOR PERFORMANCE
-- ============================================

CREATE INDEX IF NOT EXISTS student_progress_student_id_idx ON student_progress(student_id);
CREATE INDEX IF NOT EXISTS student_progress_subject_idx ON student_progress(subject);
CREATE INDEX IF NOT EXISTS student_achievements_student_id_idx ON student_achievements(student_id);
CREATE INDEX IF NOT EXISTS student_quiz_results_student_id_idx ON student_quiz_results(student_id);
CREATE INDEX IF NOT EXISTS student_quiz_results_subject_idx ON student_quiz_results(subject);

-- ============================================
-- 4. UPDATE EXISTING STUDENTS TABLE (if needed)
-- ============================================

-- Add user_id column to existing students table if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'students' AND column_name = 'user_id') THEN
        ALTER TABLE students ADD COLUMN user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL;
        CREATE INDEX IF NOT EXISTS students_user_id_idx ON students(user_id);
    END IF;
END $$;

-- ============================================
-- 5. CREATE HELPER FUNCTIONS
-- ============================================

-- Function to get student profile with progress summary
CREATE OR REPLACE FUNCTION get_student_dashboard_data(student_user_id UUID)
RETURNS JSON AS $$
DECLARE
    result JSON;
BEGIN
    SELECT json_build_object(
        'profile', (
            SELECT row_to_json(sp) 
            FROM student_profiles sp 
            WHERE sp.user_id = student_user_id
        ),
        'progress', (
            SELECT json_agg(row_to_json(prog))
            FROM student_progress prog
            WHERE prog.student_id = student_user_id
        ),
        'achievements', (
            SELECT json_agg(row_to_json(ach))
            FROM student_achievements ach
            WHERE ach.student_id = student_user_id
            ORDER BY ach.earned_date DESC
            LIMIT 10
        ),
        'recent_quizzes', (
            SELECT json_agg(row_to_json(quiz))
            FROM student_quiz_results quiz
            WHERE quiz.student_id = student_user_id
            ORDER BY quiz.completed_at DESC
            LIMIT 5
        )
    ) INTO result;
    
    RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- 6. INSERT SAMPLE DATA FOR TESTING
-- ============================================

-- Note: This will only work after a student signs up
-- You can run this manually after creating a student account

-- ============================================
-- 7. ENABLE REALTIME (if needed)
-- ============================================

-- Enable realtime on student tables
DO $$
BEGIN
  -- Add student_profiles to realtime
  BEGIN
    ALTER PUBLICATION supabase_realtime ADD TABLE student_profiles;
  EXCEPTION WHEN duplicate_object THEN
    NULL; -- Already added, ignore
  END;
  
  -- Add student_progress to realtime
  BEGIN
    ALTER PUBLICATION supabase_realtime ADD TABLE student_progress;
  EXCEPTION WHEN duplicate_object THEN
    NULL; -- Already added, ignore
  END;
  
  -- Add student_achievements to realtime
  BEGIN
    ALTER PUBLICATION supabase_realtime ADD TABLE student_achievements;
  EXCEPTION WHEN duplicate_object THEN
    NULL; -- Already added, ignore
  END;
END $$;

-- ============================================
-- 8. VERIFY SETUP
-- ============================================

-- Check if student tables exist
SELECT 
  table_name,
  (SELECT COUNT(*) FROM information_schema.columns WHERE table_name = t.table_name) as column_count
FROM information_schema.tables t
WHERE table_schema = 'public' 
  AND table_name IN ('student_profiles', 'student_progress', 'student_achievements', 'student_quiz_results')
ORDER BY table_name;

-- Success message
DO $$
BEGIN
  RAISE NOTICE '✅ Student authentication setup complete!';
  RAISE NOTICE '✅ Student tables created';
  RAISE NOTICE '✅ RLS policies applied';
  RAISE NOTICE '✅ Helper functions created';
  RAISE NOTICE '';
  RAISE NOTICE 'Next steps:';
  RAISE NOTICE '1. Create student login page';
  RAISE NOTICE '2. Add authentication middleware';
  RAISE NOTICE '3. Test student signup flow';
END $$;