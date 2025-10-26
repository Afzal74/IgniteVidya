-- Create quiz_answers table to track individual student answers
CREATE TABLE IF NOT EXISTS quiz_answers (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  participant_id UUID REFERENCES quiz_participants(id) ON DELETE CASCADE NOT NULL,
  question_id UUID REFERENCES quiz_questions(id) ON DELETE CASCADE NOT NULL,
  selected_answer TEXT CHECK (selected_answer IN ('A', 'B', 'C', 'D')) NOT NULL,
  is_correct BOOLEAN NOT NULL,
  time_taken INTEGER, -- Time taken to answer in seconds
  answered_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE quiz_answers ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Teachers can view quiz answers" ON quiz_answers;
DROP POLICY IF EXISTS "Students can view own answers" ON quiz_answers;
DROP POLICY IF EXISTS "Anyone can submit answers" ON quiz_answers;

-- Policies for quiz_answers
-- Teachers can view all answers for their quiz rooms
CREATE POLICY "Teachers can view quiz answers"
  ON quiz_answers FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM quiz_participants
    JOIN quiz_rooms ON quiz_participants.room_id = quiz_rooms.id
    WHERE quiz_participants.id = quiz_answers.participant_id
    AND quiz_rooms.teacher_id = auth.uid()
  ));

-- Students can view their own answers
CREATE POLICY "Students can view own answers"
  ON quiz_answers FOR SELECT
  USING (participant_id IN (
    SELECT id FROM quiz_participants
    WHERE id = participant_id
  ));

-- Anyone can submit answers (students don't need authentication)
CREATE POLICY "Anyone can submit answers"
  ON quiz_answers FOR INSERT
  WITH CHECK (true);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS quiz_answers_participant_id_idx ON quiz_answers(participant_id);
CREATE INDEX IF NOT EXISTS quiz_answers_question_id_idx ON quiz_answers(question_id);
CREATE INDEX IF NOT EXISTS quiz_answers_answered_at_idx ON quiz_answers(answered_at);

-- Create unique constraint to prevent duplicate answers
CREATE UNIQUE INDEX IF NOT EXISTS quiz_answers_participant_question_unique 
  ON quiz_answers(participant_id, question_id);

-- Create a function to update participant score when answer is submitted
CREATE OR REPLACE FUNCTION update_participant_score()
RETURNS TRIGGER AS $$
BEGIN
  -- Update the participant's score and answers_submitted count
  UPDATE quiz_participants
  SET 
    score = score + CASE WHEN NEW.is_correct THEN 10 ELSE 0 END,
    answers_submitted = answers_submitted + 1
  WHERE id = NEW.participant_id;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to automatically update score
DROP TRIGGER IF EXISTS update_score_on_answer ON quiz_answers;
CREATE TRIGGER update_score_on_answer
  AFTER INSERT ON quiz_answers
  FOR EACH ROW
  EXECUTE FUNCTION update_participant_score();

-- Create a view for quiz results summary
CREATE OR REPLACE VIEW quiz_results_summary AS
SELECT 
  qr.id as room_id,
  qr.room_name,
  qr.room_code,
  qp.id as participant_id,
  qp.student_name,
  qp.score,
  qp.answers_submitted,
  COUNT(qa.id) as total_answers,
  SUM(CASE WHEN qa.is_correct THEN 1 ELSE 0 END) as correct_answers,
  AVG(qa.time_taken) as avg_time_per_question
FROM quiz_rooms qr
JOIN quiz_participants qp ON qp.room_id = qr.id
LEFT JOIN quiz_answers qa ON qa.participant_id = qp.id
GROUP BY qr.id, qr.room_name, qr.room_code, qp.id, qp.student_name, qp.score, qp.answers_submitted;

-- Grant access to the view
GRANT SELECT ON quiz_results_summary TO authenticated, anon;
