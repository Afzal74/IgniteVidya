-- Test the student profile creation function
-- Run this in Supabase SQL Editor to test

-- Test with sample data (using proper UUID format)
SELECT create_student_profile(
  '550e8400-e29b-41d4-a716-446655440000'::UUID,  -- Valid UUID format
  'test@example.com',
  'Test',
  'User',
  8,
  'A',
  '1',
  'Test School',
  'parent@example.com',
  '+1234567890',
  '2010-01-01'::DATE
);

-- This should return: {"success": true, "message": "Student profile created successfully"}

-- Clean up test data after testing (optional)
-- DELETE FROM student_profiles WHERE email = 'test@example.com';