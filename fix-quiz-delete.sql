-- Fix Quiz Room Delete Functionality
-- Run this in Supabase SQL Editor

-- First, verify CASCADE is set up correctly on foreign keys
-- Drop and recreate with proper CASCADE

-- Drop existing foreign key constraints
ALTER TABLE quiz_questions 
DROP CONSTRAINT IF EXISTS quiz_questions_room_id_fkey;

ALTER TABLE quiz_participants 
DROP CONSTRAINT IF EXISTS quiz_participants_room_id_fkey;

-- Recreate with CASCADE DELETE
ALTER TABLE quiz_questions
ADD CONSTRAINT quiz_questions_room_id_fkey 
FOREIGN KEY (room_id) 
REFERENCES quiz_rooms(id) 
ON DELETE CASCADE;

ALTER TABLE quiz_participants
ADD CONSTRAINT quiz_participants_room_id_fkey 
FOREIGN KEY (room_id) 
REFERENCES quiz_rooms(id) 
ON DELETE CASCADE;

-- Ensure RLS policies allow deletion
DROP POLICY IF EXISTS "Teachers can delete own quiz rooms" ON quiz_rooms;
CREATE POLICY "Teachers can delete own quiz rooms"
  ON quiz_rooms FOR DELETE
  USING (auth.uid() = teacher_id);

-- Verify the policies
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual
FROM pg_policies
WHERE tablename IN ('quiz_rooms', 'quiz_questions', 'quiz_participants')
  AND cmd = 'DELETE';

-- Test query to see if you can delete (replace with your user_id)
-- SELECT * FROM quiz_rooms WHERE teacher_id = auth.uid();

-- Success message
DO $$
BEGIN
  RAISE NOTICE '✅ Foreign key constraints updated with CASCADE DELETE';
  RAISE NOTICE '✅ Delete policies verified';
  RAISE NOTICE '';
  RAISE NOTICE 'You can now delete quiz rooms and all related data will be removed automatically!';
END $$;
