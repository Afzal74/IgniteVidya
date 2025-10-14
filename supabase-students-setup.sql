-- Create students table
CREATE TABLE IF NOT EXISTS students (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  teacher_id UUID REFERENCES teacher_profiles(user_id) ON DELETE CASCADE NOT NULL,
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  roll_number TEXT NOT NULL,
  grade TEXT NOT NULL,
  email TEXT,
  parent_contact TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE students ENABLE ROW LEVEL SECURITY;

-- Create policy to allow teachers to view their own students
CREATE POLICY "Teachers can view own students"
  ON students
  FOR SELECT
  USING (auth.uid() = teacher_id);

-- Create policy to allow teachers to insert students
CREATE POLICY "Teachers can add students"
  ON students
  FOR INSERT
  WITH CHECK (auth.uid() = teacher_id);

-- Create policy to allow teachers to update their students
CREATE POLICY "Teachers can update own students"
  ON students
  FOR UPDATE
  USING (auth.uid() = teacher_id);

-- Create policy to allow teachers to delete their students
CREATE POLICY "Teachers can delete own students"
  ON students
  FOR DELETE
  USING (auth.uid() = teacher_id);

-- Create indexes for faster queries
CREATE INDEX IF NOT EXISTS students_teacher_id_idx ON students(teacher_id);
CREATE INDEX IF NOT EXISTS students_roll_number_idx ON students(roll_number);
CREATE INDEX IF NOT EXISTS students_grade_idx ON students(grade);

-- Create unique constraint for roll number per teacher
CREATE UNIQUE INDEX IF NOT EXISTS students_teacher_roll_unique ON students(teacher_id, roll_number);
