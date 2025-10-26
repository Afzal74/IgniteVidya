-- Add image support to quiz questions
-- Run this in your Supabase SQL Editor

-- Add image_url column to quiz_questions table
ALTER TABLE quiz_questions 
ADD COLUMN IF NOT EXISTS image_url TEXT;

-- Create storage bucket for quiz images
INSERT INTO storage.buckets (id, name, public)
VALUES ('quiz-images', 'quiz-images', true)
ON CONFLICT (id) DO NOTHING;

-- Set up storage policies for quiz images
DROP POLICY IF EXISTS "Anyone can view quiz images" ON storage.objects;
CREATE POLICY "Anyone can view quiz images"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'quiz-images');

DROP POLICY IF EXISTS "Teachers can upload quiz images" ON storage.objects;
CREATE POLICY "Teachers can upload quiz images"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'quiz-images' 
    AND auth.role() = 'authenticated'
  );

DROP POLICY IF EXISTS "Teachers can update quiz images" ON storage.objects;
CREATE POLICY "Teachers can update quiz images"
  ON storage.objects FOR UPDATE
  USING (bucket_id = 'quiz-images' AND auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Teachers can delete quiz images" ON storage.objects;
CREATE POLICY "Teachers can delete quiz images"
  ON storage.objects FOR DELETE
  USING (bucket_id = 'quiz-images' AND auth.role() = 'authenticated');

-- Verify the column was added
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'quiz_questions' 
  AND column_name = 'image_url';

-- Success message
DO $$
BEGIN
  RAISE NOTICE '✅ Image support added to quiz questions!';
  RAISE NOTICE '✅ Storage bucket created: quiz-images';
  RAISE NOTICE '✅ Storage policies configured';
  RAISE NOTICE '';
  RAISE NOTICE 'Teachers can now upload images when creating quizzes!';
END $$;
