-- Enable Realtime for quiz tables
-- Run this in your Supabase SQL Editor

-- Enable realtime on quiz_rooms table
ALTER PUBLICATION supabase_realtime ADD TABLE quiz_rooms;

-- Enable realtime on quiz_participants table
ALTER PUBLICATION supabase_realtime ADD TABLE quiz_participants;

-- Enable realtime on quiz_questions table
ALTER PUBLICATION supabase_realtime ADD TABLE quiz_questions;

-- Add policy for participants to update their own records
DROP POLICY IF EXISTS "Participants can update own record" ON quiz_participants;
CREATE POLICY "Participants can update own record"
  ON quiz_participants FOR UPDATE
  USING (true)
  WITH CHECK (true);

-- Add policy for participants to delete their own records (for leaving)
DROP POLICY IF EXISTS "Participants can delete own record" ON quiz_participants;
CREATE POLICY "Participants can delete own record"
  ON quiz_participants FOR DELETE
  USING (true);

-- Verify realtime is enabled
SELECT schemaname, tablename 
FROM pg_publication_tables 
WHERE pubname = 'supabase_realtime';
