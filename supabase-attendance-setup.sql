-- Create attendance table
CREATE TABLE IF NOT EXISTS attendance (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  teacher_id UUID REFERENCES teacher_profiles(user_id) ON DELETE CASCADE NOT NULL,
  student_id UUID REFERENCES students(id) ON DELETE CASCADE NOT NULL,
  date DATE NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('present', 'absent', 'late', 'excused')),
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE attendance ENABLE ROW LEVEL SECURITY;

-- Create policy to allow teachers to view their students' attendance
CREATE POLICY "Teachers can view own students attendance"
  ON attendance
  FOR SELECT
  USING (auth.uid() = teacher_id);

-- Create policy to allow teachers to mark attendance
CREATE POLICY "Teachers can mark attendance"
  ON attendance
  FOR INSERT
  WITH CHECK (auth.uid() = teacher_id);

-- Create policy to allow teachers to update attendance
CREATE POLICY "Teachers can update attendance"
  ON attendance
  FOR UPDATE
  USING (auth.uid() = teacher_id);

-- Create policy to allow teachers to delete attendance
CREATE POLICY "Teachers can delete attendance"
  ON attendance
  FOR DELETE
  USING (auth.uid() = teacher_id);

-- Create indexes for faster queries
CREATE INDEX IF NOT EXISTS attendance_teacher_id_idx ON attendance(teacher_id);
CREATE INDEX IF NOT EXISTS attendance_student_id_idx ON attendance(student_id);
CREATE INDEX IF NOT EXISTS attendance_date_idx ON attendance(date);

-- Create unique constraint to prevent duplicate attendance entries
CREATE UNIQUE INDEX IF NOT EXISTS attendance_student_date_unique ON attendance(student_id, date);
