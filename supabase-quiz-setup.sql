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

-- Enable Row Level Security
ALTER TABLE quiz_rooms ENABLE ROW LEVEL SECURITY;
ALTER TABLE quiz_questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE quiz_participants ENABLE ROW LEVEL SECURITY;

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

-- Create indexes
CREATE INDEX IF NOT EXISTS quiz_rooms_teacher_id_idx ON quiz_rooms(teacher_id);
CREATE INDEX IF NOT EXISTS quiz_rooms_room_code_idx ON quiz_rooms(room_code);
CREATE INDEX IF NOT EXISTS quiz_questions_room_id_idx ON quiz_questions(room_id);
CREATE INDEX IF NOT EXISTS quiz_participants_room_id_idx ON quiz_participants(room_id);
