-- Add missing columns to existing student_profiles table
-- Run this if you want to keep existing data

-- Add first_name column if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'student_profiles' AND column_name = 'first_name') THEN
        ALTER TABLE student_profiles ADD COLUMN first_name TEXT NOT NULL DEFAULT '';
    END IF;
END $$;

-- Add last_name column if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'student_profiles' AND column_name = 'last_name') THEN
        ALTER TABLE student_profiles ADD COLUMN last_name TEXT NOT NULL DEFAULT '';
    END IF;
END $$;

-- Add other missing columns
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'student_profiles' AND column_name = 'grade') THEN
        ALTER TABLE student_profiles ADD COLUMN grade INTEGER NOT NULL DEFAULT 1;
    END IF;
END $$;

-- Verify columns were added
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'student_profiles' 
  AND table_schema = 'public'
ORDER BY ordinal_position;