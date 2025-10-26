-- Update script for existing content tables
-- Run this if you already have the tables created and need to add new columns

-- Add new columns to notes table if they don't exist
DO $$ 
BEGIN
  -- Add semester column
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name='notes' AND column_name='semester') THEN
    ALTER TABLE notes ADD COLUMN semester INTEGER;
  END IF;

  -- Add class column
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name='notes' AND column_name='class') THEN
    ALTER TABLE notes ADD COLUMN class TEXT;
  END IF;

  -- Add cover_image_url column
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name='notes' AND column_name='cover_image_url') THEN
    ALTER TABLE notes ADD COLUMN cover_image_url TEXT;
  END IF;

  -- Add description column
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name='notes' AND column_name='description') THEN
    ALTER TABLE notes ADD COLUMN description TEXT;
  END IF;

  -- Add tags column
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name='notes' AND column_name='tags') THEN
    ALTER TABLE notes ADD COLUMN tags TEXT[] DEFAULT '{}';
  END IF;

  -- Add download_count column
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name='notes' AND column_name='download_count') THEN
    ALTER TABLE notes ADD COLUMN download_count INTEGER DEFAULT 0;
  END IF;

  -- Add view_count column
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name='notes' AND column_name='view_count') THEN
    ALTER TABLE notes ADD COLUMN view_count INTEGER DEFAULT 0;
  END IF;

  -- Add file_size column
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name='notes' AND column_name='file_size') THEN
    ALTER TABLE notes ADD COLUMN file_size TEXT;
  END IF;

  -- Add page_count column
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name='notes' AND column_name='page_count') THEN
    ALTER TABLE notes ADD COLUMN page_count INTEGER;
  END IF;
END $$;

-- Add new columns to question_papers table if they don't exist
DO $$ 
BEGIN
  -- Add exam_type column
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name='question_papers' AND column_name='exam_type') THEN
    ALTER TABLE question_papers ADD COLUMN exam_type TEXT;
  END IF;

  -- Add thumbnail_url column
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name='question_papers' AND column_name='thumbnail_url') THEN
    ALTER TABLE question_papers ADD COLUMN thumbnail_url TEXT;
  END IF;

  -- Add description column
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name='question_papers' AND column_name='description') THEN
    ALTER TABLE question_papers ADD COLUMN description TEXT;
  END IF;

  -- Add tags column
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name='question_papers' AND column_name='tags') THEN
    ALTER TABLE question_papers ADD COLUMN tags TEXT[] DEFAULT '{}';
  END IF;

  -- Add download_count column
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name='question_papers' AND column_name='download_count') THEN
    ALTER TABLE question_papers ADD COLUMN download_count INTEGER DEFAULT 0;
  END IF;

  -- Add view_count column
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name='question_papers' AND column_name='view_count') THEN
    ALTER TABLE question_papers ADD COLUMN view_count INTEGER DEFAULT 0;
  END IF;

  -- Add file_size column
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name='question_papers' AND column_name='file_size') THEN
    ALTER TABLE question_papers ADD COLUMN file_size TEXT;
  END IF;
END $$;

-- Add new columns to lab_programs table if they don't exist
DO $$ 
BEGIN
  -- Add language column
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name='lab_programs' AND column_name='language') THEN
    ALTER TABLE lab_programs ADD COLUMN language TEXT;
  END IF;

  -- Add difficulty column
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name='lab_programs' AND column_name='difficulty') THEN
    ALTER TABLE lab_programs ADD COLUMN difficulty TEXT;
  END IF;

  -- Add thumbnail_url column
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name='lab_programs' AND column_name='thumbnail_url') THEN
    ALTER TABLE lab_programs ADD COLUMN thumbnail_url TEXT;
  END IF;

  -- Add tags column
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name='lab_programs' AND column_name='tags') THEN
    ALTER TABLE lab_programs ADD COLUMN tags TEXT[] DEFAULT '{}';
  END IF;

  -- Add view_count column
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name='lab_programs' AND column_name='view_count') THEN
    ALTER TABLE lab_programs ADD COLUMN view_count INTEGER DEFAULT 0;
  END IF;
END $$;

-- Add new columns to projects table if they don't exist
DO $$ 
BEGIN
  -- Add thumbnail_url column
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name='projects' AND column_name='thumbnail_url') THEN
    ALTER TABLE projects ADD COLUMN thumbnail_url TEXT;
  END IF;

  -- Add cover_image_url column
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name='projects' AND column_name='cover_image_url') THEN
    ALTER TABLE projects ADD COLUMN cover_image_url TEXT;
  END IF;

  -- Add tech_stack column
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name='projects' AND column_name='tech_stack') THEN
    ALTER TABLE projects ADD COLUMN tech_stack TEXT[] DEFAULT '{}';
  END IF;

  -- Add features column
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name='projects' AND column_name='features') THEN
    ALTER TABLE projects ADD COLUMN features TEXT[] DEFAULT '{}';
  END IF;

  -- Add view_count column
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name='projects' AND column_name='view_count') THEN
    ALTER TABLE projects ADD COLUMN view_count INTEGER DEFAULT 0;
  END IF;

  -- Add star_count column
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name='projects' AND column_name='star_count') THEN
    ALTER TABLE projects ADD COLUMN star_count INTEGER DEFAULT 0;
  END IF;
END $$;

-- Create new indexes for the new columns
CREATE INDEX IF NOT EXISTS notes_semester_idx ON notes(semester);
CREATE INDEX IF NOT EXISTS notes_download_count_idx ON notes(download_count DESC);
CREATE INDEX IF NOT EXISTS notes_view_count_idx ON notes(view_count DESC);
CREATE INDEX IF NOT EXISTS notes_tags_idx ON notes USING GIN(tags);

CREATE INDEX IF NOT EXISTS question_papers_exam_type_idx ON question_papers(exam_type);
CREATE INDEX IF NOT EXISTS question_papers_download_count_idx ON question_papers(download_count DESC);
CREATE INDEX IF NOT EXISTS question_papers_tags_idx ON question_papers USING GIN(tags);

CREATE INDEX IF NOT EXISTS lab_programs_language_idx ON lab_programs(language);
CREATE INDEX IF NOT EXISTS lab_programs_difficulty_idx ON lab_programs(difficulty);
CREATE INDEX IF NOT EXISTS lab_programs_tags_idx ON lab_programs USING GIN(tags);

CREATE INDEX IF NOT EXISTS projects_star_count_idx ON projects(star_count DESC);
CREATE INDEX IF NOT EXISTS projects_view_count_idx ON projects(view_count DESC);
CREATE INDEX IF NOT EXISTS projects_tech_stack_idx ON projects USING GIN(tech_stack);

-- Success message
DO $$
BEGIN
  RAISE NOTICE 'Content tables updated successfully with new columns and indexes!';
END $$;
