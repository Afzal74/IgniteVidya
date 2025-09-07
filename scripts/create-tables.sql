-- Create notes table
CREATE TABLE IF NOT EXISTS notes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  subject_name VARCHAR(255) NOT NULL,
  subject_code VARCHAR(20) NOT NULL,
  scheme VARCHAR(20) NOT NULL,
  semester INTEGER NOT NULL CHECK (semester >= 1 AND semester <= 8),
  file_url TEXT NOT NULL,
  uploaded_by VARCHAR(255) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create comments table
CREATE TABLE IF NOT EXISTS comments (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  note_id UUID REFERENCES notes(id) ON DELETE CASCADE,
  text TEXT NOT NULL,
  author VARCHAR(255) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create question_papers table
CREATE TABLE IF NOT EXISTS question_papers (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  subject_code VARCHAR(20) NOT NULL,
  subject_name VARCHAR(255) NOT NULL,
  year INTEGER NOT NULL,
  semester INTEGER NOT NULL CHECK (semester >= 1 AND semester <= 8),
  branch VARCHAR(50) NOT NULL,
  file_url TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create lab_programs table
CREATE TABLE IF NOT EXISTS lab_programs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  lab_title VARCHAR(255) NOT NULL,
  program_number INTEGER NOT NULL,
  description TEXT NOT NULL,
  code TEXT NOT NULL,
  expected_output TEXT,
  semester INTEGER NOT NULL CHECK (semester >= 1 AND semester <= 8),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create projects table
CREATE TABLE IF NOT EXISTS projects (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  description TEXT NOT NULL,
  domain VARCHAR(100) NOT NULL,
  github_url TEXT,
  source_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_notes_semester ON notes(semester);
CREATE INDEX IF NOT EXISTS idx_notes_scheme ON notes(scheme);
CREATE INDEX IF NOT EXISTS idx_question_papers_semester ON question_papers(semester);
CREATE INDEX IF NOT EXISTS idx_question_papers_year ON question_papers(year);
CREATE INDEX IF NOT EXISTS idx_lab_programs_semester ON lab_programs(semester);
