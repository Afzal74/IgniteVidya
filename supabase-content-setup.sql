-- Create notes table
CREATE TABLE IF NOT EXISTS notes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  subject_name TEXT NOT NULL,
  subject_code TEXT NOT NULL,
  scheme TEXT NOT NULL,
  semester INTEGER, -- Semester number (1-8 for engineering, etc.)
  class TEXT, -- Class/Grade (e.g., "10", "11", "12" for school)
  file_url TEXT, -- PDF or document URL
  thumbnail_url TEXT, -- Thumbnail image for the note card
  cover_image_url TEXT, -- Cover image for detailed view
  uploaded_by TEXT,
  description TEXT, -- Brief description of the notes
  tags TEXT[] DEFAULT '{}', -- Tags for categorization (e.g., ["calculus", "derivatives"])
  download_count INTEGER DEFAULT 0, -- Track number of downloads
  view_count INTEGER DEFAULT 0, -- Track number of views
  file_size TEXT, -- File size (e.g., "2.5 MB")
  page_count INTEGER, -- Number of pages in the document
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create notes_comments table
CREATE TABLE IF NOT EXISTS notes_comments (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  note_id UUID REFERENCES notes(id) ON DELETE CASCADE NOT NULL,
  text TEXT NOT NULL,
  author TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create question_papers table
CREATE TABLE IF NOT EXISTS question_papers (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  subject_code TEXT NOT NULL,
  subject_name TEXT NOT NULL,
  year INTEGER NOT NULL, -- Exam year
  semester INTEGER NOT NULL,
  branch TEXT NOT NULL, -- Branch/Stream (e.g., "CSE", "ECE", "Science")
  exam_type TEXT, -- Type of exam (e.g., "Mid-term", "Final", "Board")
  file_url TEXT NOT NULL,
  thumbnail_url TEXT, -- Thumbnail for the paper card
  uploaded_by TEXT,
  description TEXT, -- Brief description
  tags TEXT[] DEFAULT '{}', -- Tags for categorization
  download_count INTEGER DEFAULT 0,
  view_count INTEGER DEFAULT 0,
  file_size TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create question_papers_comments table
CREATE TABLE IF NOT EXISTS question_papers_comments (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  paper_id UUID REFERENCES question_papers(id) ON DELETE CASCADE NOT NULL,
  text TEXT NOT NULL,
  author TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create lab_programs table
CREATE TABLE IF NOT EXISTS lab_programs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  lab_title TEXT NOT NULL,
  program_number INTEGER NOT NULL,
  description TEXT NOT NULL,
  code TEXT NOT NULL,
  expected_output TEXT NOT NULL,
  semester INTEGER NOT NULL,
  language TEXT, -- Programming language (e.g., "Python", "C", "Java")
  difficulty TEXT, -- Difficulty level (e.g., "Easy", "Medium", "Hard")
  thumbnail_url TEXT, -- Thumbnail for the program card
  tags TEXT[] DEFAULT '{}', -- Tags (e.g., ["arrays", "sorting", "recursion"])
  view_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create projects table
CREATE TABLE IF NOT EXISTS projects (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  domain TEXT NOT NULL, -- Domain (e.g., "Web Development", "AI/ML", "IoT")
  github_url TEXT NOT NULL,
  source_url TEXT, -- Additional source/demo URL
  thumbnail_url TEXT, -- Project thumbnail/screenshot
  cover_image_url TEXT, -- Cover image for detailed view
  tags TEXT[] DEFAULT '{}', -- Technology tags (e.g., ["React", "Node.js", "MongoDB"])
  difficulty TEXT, -- Difficulty level
  tech_stack TEXT[], -- Technologies used
  features TEXT[], -- Key features list
  view_count INTEGER DEFAULT 0,
  star_count INTEGER DEFAULT 0, -- GitHub stars or user favorites
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE notes_comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE question_papers ENABLE ROW LEVEL SECURITY;
ALTER TABLE question_papers_comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE lab_programs ENABLE ROW LEVEL SECURITY;
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Anyone can view notes" ON notes;
DROP POLICY IF EXISTS "Authenticated users can add notes" ON notes;
DROP POLICY IF EXISTS "Authenticated users can update notes" ON notes;
DROP POLICY IF EXISTS "Authenticated users can delete notes" ON notes;

-- Create policies for notes (public read, authenticated write)
CREATE POLICY "Anyone can view notes"
  ON notes FOR SELECT
  USING (true);

CREATE POLICY "Authenticated users can add notes"
  ON notes FOR INSERT
  WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can update notes"
  ON notes FOR UPDATE
  USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can delete notes"
  ON notes FOR DELETE
  USING (auth.role() = 'authenticated');

-- Drop existing policies for notes_comments
DROP POLICY IF EXISTS "Anyone can view notes comments" ON notes_comments;
DROP POLICY IF EXISTS "Anyone can add notes comments" ON notes_comments;

-- Create policies for notes_comments
CREATE POLICY "Anyone can view notes comments"
  ON notes_comments FOR SELECT
  USING (true);

CREATE POLICY "Anyone can add notes comments"
  ON notes_comments FOR INSERT
  WITH CHECK (true);

-- Drop existing policies for question_papers
DROP POLICY IF EXISTS "Anyone can view question papers" ON question_papers;
DROP POLICY IF EXISTS "Authenticated users can add question papers" ON question_papers;
DROP POLICY IF EXISTS "Authenticated users can update question papers" ON question_papers;
DROP POLICY IF EXISTS "Authenticated users can delete question papers" ON question_papers;

-- Create policies for question_papers (public read, authenticated write)
CREATE POLICY "Anyone can view question papers"
  ON question_papers FOR SELECT
  USING (true);

CREATE POLICY "Authenticated users can add question papers"
  ON question_papers FOR INSERT
  WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can update question papers"
  ON question_papers FOR UPDATE
  USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can delete question papers"
  ON question_papers FOR DELETE
  USING (auth.role() = 'authenticated');

-- Drop existing policies for question_papers_comments
DROP POLICY IF EXISTS "Anyone can view question papers comments" ON question_papers_comments;
DROP POLICY IF EXISTS "Anyone can add question papers comments" ON question_papers_comments;

-- Create policies for question_papers_comments
CREATE POLICY "Anyone can view question papers comments"
  ON question_papers_comments FOR SELECT
  USING (true);

CREATE POLICY "Anyone can add question papers comments"
  ON question_papers_comments FOR INSERT
  WITH CHECK (true);

-- Drop existing policies for lab_programs
DROP POLICY IF EXISTS "Anyone can view lab programs" ON lab_programs;
DROP POLICY IF EXISTS "Authenticated users can add lab programs" ON lab_programs;
DROP POLICY IF EXISTS "Authenticated users can update lab programs" ON lab_programs;
DROP POLICY IF EXISTS "Authenticated users can delete lab programs" ON lab_programs;

-- Create policies for lab_programs (public read, authenticated write)
CREATE POLICY "Anyone can view lab programs"
  ON lab_programs FOR SELECT
  USING (true);

CREATE POLICY "Authenticated users can add lab programs"
  ON lab_programs FOR INSERT
  WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can update lab programs"
  ON lab_programs FOR UPDATE
  USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can delete lab programs"
  ON lab_programs FOR DELETE
  USING (auth.role() = 'authenticated');

-- Drop existing policies for projects
DROP POLICY IF EXISTS "Anyone can view projects" ON projects;
DROP POLICY IF EXISTS "Authenticated users can add projects" ON projects;
DROP POLICY IF EXISTS "Authenticated users can update projects" ON projects;
DROP POLICY IF EXISTS "Authenticated users can delete projects" ON projects;

-- Create policies for projects (public read, authenticated write)
CREATE POLICY "Anyone can view projects"
  ON projects FOR SELECT
  USING (true);

CREATE POLICY "Authenticated users can add projects"
  ON projects FOR INSERT
  WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can update projects"
  ON projects FOR UPDATE
  USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can delete projects"
  ON projects FOR DELETE
  USING (auth.role() = 'authenticated');

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS notes_subject_code_idx ON notes(subject_code);
CREATE INDEX IF NOT EXISTS notes_class_idx ON notes(class);
CREATE INDEX IF NOT EXISTS notes_semester_idx ON notes(semester);
CREATE INDEX IF NOT EXISTS notes_scheme_idx ON notes(scheme);
CREATE INDEX IF NOT EXISTS notes_created_at_idx ON notes(created_at DESC);
CREATE INDEX IF NOT EXISTS notes_download_count_idx ON notes(download_count DESC);
CREATE INDEX IF NOT EXISTS notes_view_count_idx ON notes(view_count DESC);
CREATE INDEX IF NOT EXISTS notes_tags_idx ON notes USING GIN(tags);
CREATE INDEX IF NOT EXISTS notes_comments_note_id_idx ON notes_comments(note_id);

CREATE INDEX IF NOT EXISTS question_papers_subject_code_idx ON question_papers(subject_code);
CREATE INDEX IF NOT EXISTS question_papers_semester_idx ON question_papers(semester);
CREATE INDEX IF NOT EXISTS question_papers_year_idx ON question_papers(year);
CREATE INDEX IF NOT EXISTS question_papers_branch_idx ON question_papers(branch);
CREATE INDEX IF NOT EXISTS question_papers_exam_type_idx ON question_papers(exam_type);
CREATE INDEX IF NOT EXISTS question_papers_created_at_idx ON question_papers(created_at DESC);
CREATE INDEX IF NOT EXISTS question_papers_download_count_idx ON question_papers(download_count DESC);
CREATE INDEX IF NOT EXISTS question_papers_tags_idx ON question_papers USING GIN(tags);
CREATE INDEX IF NOT EXISTS question_papers_comments_paper_id_idx ON question_papers_comments(paper_id);

CREATE INDEX IF NOT EXISTS lab_programs_semester_idx ON lab_programs(semester);
CREATE INDEX IF NOT EXISTS lab_programs_program_number_idx ON lab_programs(program_number);
CREATE INDEX IF NOT EXISTS lab_programs_language_idx ON lab_programs(language);
CREATE INDEX IF NOT EXISTS lab_programs_difficulty_idx ON lab_programs(difficulty);
CREATE INDEX IF NOT EXISTS lab_programs_created_at_idx ON lab_programs(created_at DESC);
CREATE INDEX IF NOT EXISTS lab_programs_tags_idx ON lab_programs USING GIN(tags);

CREATE INDEX IF NOT EXISTS projects_domain_idx ON projects(domain);
CREATE INDEX IF NOT EXISTS projects_difficulty_idx ON projects(difficulty);
CREATE INDEX IF NOT EXISTS projects_created_at_idx ON projects(created_at DESC);
CREATE INDEX IF NOT EXISTS projects_star_count_idx ON projects(star_count DESC);
CREATE INDEX IF NOT EXISTS projects_view_count_idx ON projects(view_count DESC);
CREATE INDEX IF NOT EXISTS projects_tags_idx ON projects USING GIN(tags);
CREATE INDEX IF NOT EXISTS projects_tech_stack_idx ON projects USING GIN(tech_stack);

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for updated_at
CREATE TRIGGER update_notes_updated_at
  BEFORE UPDATE ON notes
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_question_papers_updated_at
  BEFORE UPDATE ON question_papers
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_lab_programs_updated_at
  BEFORE UPDATE ON lab_programs
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_projects_updated_at
  BEFORE UPDATE ON projects
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
