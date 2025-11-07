-- Fix the student_progress table to add unique constraint
-- This will allow ON CONFLICT to work properly

-- Add unique constraint on (student_id, subject)
ALTER TABLE student_progress 
ADD CONSTRAINT student_progress_student_subject_unique 
UNIQUE (student_id, subject);

-- Verify the constraint was added
SELECT conname, contype 
FROM pg_constraint 
WHERE conrelid = 'student_progress'::regclass 
  AND contype = 'u';

SELECT 'Unique constraint added successfully' as status;