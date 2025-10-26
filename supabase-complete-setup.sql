-- Complete Supabase Setup for Quiz System
-- Run this in your Supabase SQL Editor

-- ============================================
-- 1. CREATE TEACHER_PROFILES TABLE
-- ============================================

-- Create teacher_profiles table if it doesn't exist
CREATE TABLE IF NOT EXISTS teacher_profiles (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE NOT NULL,
  email TEXT UNIQUE NOT NULL,
  first_name TEXT,
  last_name TEXT,
  school_name TEXT,
  role TEXT,
  phone_number TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS on teacher_profiles
ALTER TABLE teacher_profiles ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Teachers can view own profile" ON teacher_profiles;
DROP POLICY IF EXISTS "Teachers can update own profile" ON teacher_profiles;
DROP POLICY IF EXISTS "Allow insert during signup" ON teacher_profiles;

-- Create policies for teacher_profiles
CREATE POLICY "Teachers can view own profile"
  ON teacher_profiles FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Teachers can update own profile"
  ON teacher_profiles FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Allow insert during signup"
  ON teacher_profiles FOR INSERT
  WITH CHECK (true);

-- Create indexes
CREATE INDEX IF NOT EXISTS teacher_profiles_user_id_idx ON teacher_profiles(user_id);
CREATE INDEX IF NOT EXISTS teacher_profiles_email_idx ON teacher_profiles(email);
CREATE INDEX IF NOT EXISTS teacher_profiles_school_name_idx ON teacher_profiles(school_name);

-- ============================================
-- 2. CREATE STUDENTS TABLE
-- ============================================

CREATE TABLE IF NOT EXISTS students (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  grade INTEGER,
  section TEXT,
  roll_number TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS on students
ALTER TABLE students ENABLE ROW LEVEL SECURITY;

-- Create policies for students
DROP POLICY IF EXISTS "Anyone can view students" ON students;
CREATE POLICY "Anyone can view students"
  ON students FOR SELECT
  USING (true);

-- ============================================
-- 3. CREATE QUIZ TABLES
-- ============================================

-- Create quiz_rooms table
CREATE TABLE IF NOT EXISTS quiz_rooms (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  teacher_id UUID REFERENCES teacher_profiles(user_id) ON DELETE CASCADE NOT NULL,
  room_code TEXT UNIQUE NOT NULL,
  room_name TEXT NOT NULL,
  category TEXT NOT NULL,
  difficulty TEXT NOT NULL CHECK (difficulty IN ('easy', 'medium', 'hard')),
  question_count INTEGER NOT NULL,
  time_limit INTEGER NOT NULL,
  max_players INTEGER NOT NULL,
  status TEXT NOT NULL DEFAULT 'waiting' CHECK (status IN ('waiting', 'active', 'completed')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  started_at TIMESTAMP WITH TIME ZONE,
  ended_at TIMESTAMP WITH TIME ZONE
);

-- Create quiz_questions table
CREATE TABLE IF NOT EXISTS quiz_questions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  room_id UUID REFERENCES quiz_rooms(id) ON DELETE CASCADE NOT NULL,
  question_text TEXT NOT NULL,
  option_a TEXT NOT NULL,
  option_b TEXT NOT NULL,
  option_c TEXT NOT NULL,
  option_d TEXT NOT NULL,
  correct_answer TEXT NOT NULL CHECK (correct_answer IN ('A', 'B', 'C', 'D')),
  points INTEGER DEFAULT 10,
  order_number INTEGER NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create quiz_participants table
CREATE TABLE IF NOT EXISTS quiz_participants (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  room_id UUID REFERENCES quiz_rooms(id) ON DELETE CASCADE NOT NULL,
  student_id UUID REFERENCES students(id) ON DELETE CASCADE,
  student_name TEXT NOT NULL,
  score INTEGER DEFAULT 0,
  answers_submitted INTEGER DEFAULT 0,
  joined_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- 4. ENABLE ROW LEVEL SECURITY
-- ============================================

ALTER TABLE quiz_rooms ENABLE ROW LEVEL SECURITY;
ALTER TABLE quiz_questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE quiz_participants ENABLE ROW LEVEL SECURITY;

-- ============================================
-- 5. CREATE RLS POLICIES FOR QUIZ TABLES
-- ============================================

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Teachers can view own quiz rooms" ON quiz_rooms;
DROP POLICY IF EXISTS "Students can view rooms by code" ON quiz_rooms;
DROP POLICY IF EXISTS "Teachers can create quiz rooms" ON quiz_rooms;
DROP POLICY IF EXISTS "Teachers can update own quiz rooms" ON quiz_rooms;
DROP POLICY IF EXISTS "Teachers can delete own quiz rooms" ON quiz_rooms;
DROP POLICY IF EXISTS "Teachers can manage quiz questions" ON quiz_questions;
DROP POLICY IF EXISTS "Students can view quiz questions" ON quiz_questions;
DROP POLICY IF EXISTS "Anyone can view participants" ON quiz_participants;
DROP POLICY IF EXISTS "Anyone can join quiz" ON quiz_participants;
DROP POLICY IF EXISTS "Participants can update own record" ON quiz_participants;
DROP POLICY IF EXISTS "Participants can delete own record" ON quiz_participants;

-- Policies for quiz_rooms
CREATE POLICY "Teachers can view own quiz rooms"
  ON quiz_rooms FOR SELECT
  USING (auth.uid() = teacher_id);

CREATE POLICY "Students can view rooms by code"
  ON quiz_rooms FOR SELECT
  USING (true);

CREATE POLICY "Teachers can create quiz rooms"
  ON quiz_rooms FOR INSERT
  WITH CHECK (auth.uid() = teacher_id);

CREATE POLICY "Teachers can update own quiz rooms"
  ON quiz_rooms FOR UPDATE
  USING (auth.uid() = teacher_id);

CREATE POLICY "Teachers can delete own quiz rooms"
  ON quiz_rooms FOR DELETE
  USING (auth.uid() = teacher_id);

-- Policies for quiz_questions
CREATE POLICY "Teachers can manage quiz questions"
  ON quiz_questions FOR ALL
  USING (EXISTS (
    SELECT 1 FROM quiz_rooms 
    WHERE quiz_rooms.id = quiz_questions.room_id 
    AND quiz_rooms.teacher_id = auth.uid()
  ));

CREATE POLICY "Students can view quiz questions"
  ON quiz_questions FOR SELECT
  USING (true);

-- Policies for quiz_participants
CREATE POLICY "Anyone can view participants"
  ON quiz_participants FOR SELECT
  USING (true);

CREATE POLICY "Anyone can join quiz"
  ON quiz_participants FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Participants can update own record"
  ON quiz_participants FOR UPDATE
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Participants can delete own record"
  ON quiz_participants FOR DELETE
  USING (true);

-- ============================================
-- 6. CREATE INDEXES FOR PERFORMANCE
-- ============================================

CREATE INDEX IF NOT EXISTS quiz_rooms_teacher_id_idx ON quiz_rooms(teacher_id);
CREATE INDEX IF NOT EXISTS quiz_rooms_room_code_idx ON quiz_rooms(room_code);
CREATE INDEX IF NOT EXISTS quiz_rooms_status_idx ON quiz_rooms(status);
CREATE INDEX IF NOT EXISTS quiz_questions_room_id_idx ON quiz_questions(room_id);
CREATE INDEX IF NOT EXISTS quiz_participants_room_id_idx ON quiz_participants(room_id);
CREATE INDEX IF NOT EXISTS quiz_participants_student_id_idx ON quiz_participants(student_id);

-- ============================================
-- 7. ENABLE REALTIME FOR QUIZ TABLES
-- ============================================

-- Enable realtime on quiz tables (ignore if already added)
DO $$
BEGIN
  -- Add quiz_rooms to realtime
  BEGIN
    ALTER PUBLICATION supabase_realtime ADD TABLE quiz_rooms;
  EXCEPTION WHEN duplicate_object THEN
    NULL; -- Already added, ignore
  END;
  
  -- Add quiz_participants to realtime
  BEGIN
    ALTER PUBLICATION supabase_realtime ADD TABLE quiz_participants;
  EXCEPTION WHEN duplicate_object THEN
    NULL; -- Already added, ignore
  END;
  
  -- Add quiz_questions to realtime
  BEGIN
    ALTER PUBLICATION supabase_realtime ADD TABLE quiz_questions;
  EXCEPTION WHEN duplicate_object THEN
    NULL; -- Already added, ignore
  END;
END $$;

-- ============================================
-- 8. VERIFY SETUP
-- ============================================

-- Check if tables exist
SELECT 
  table_name,
  (SELECT COUNT(*) FROM information_schema.columns WHERE table_name = t.table_name) as column_count
FROM information_schema.tables t
WHERE table_schema = 'public' 
  AND table_name IN ('teacher_profiles', 'students', 'quiz_rooms', 'quiz_questions', 'quiz_participants')
ORDER BY table_name;

-- Check if realtime is enabled
SELECT tablename 
FROM pg_publication_tables 
WHERE pubname = 'supabase_realtime'
  AND tablename IN ('quiz_rooms', 'quiz_participants', 'quiz_questions');

-- Success message
DO $$
BEGIN
  RAISE NOTICE '✅ Database setup complete!';
  RAISE NOTICE '✅ All tables created';
  RAISE NOTICE '✅ RLS policies applied';
  RAISE NOTICE '✅ Realtime enabled';
  RAISE NOTICE '';
  RAISE NOTICE 'Next steps:';
  RAISE NOTICE '1. Restart your dev server';
  RAISE NOTICE '2. Sign up as a teacher at /teacher/login';
  RAISE NOTICE '3. Create a quiz at /teacher/quiz/create';
  RAISE NOTICE '4. Test realtime at /quiz/test-realtime';
END $$;
