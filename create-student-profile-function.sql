-- Create a database function to handle student profile creation
-- This bypasses the schema cache issue
-- Run this in Supabase SQL Editor

CREATE OR REPLACE FUNCTION create_student_profile(
  p_user_id UUID,
  p_email TEXT,
  p_first_name TEXT,
  p_last_name TEXT,
  p_grade INTEGER,
  p_section TEXT DEFAULT NULL,
  p_roll_number TEXT DEFAULT NULL,
  p_school_name TEXT DEFAULT NULL,
  p_parent_email TEXT DEFAULT NULL,
  p_phone_number TEXT DEFAULT NULL,
  p_date_of_birth DATE DEFAULT NULL
)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  result JSON;
BEGIN
  -- Insert into student_profiles table
  INSERT INTO student_profiles (
    user_id,
    email,
    first_name,
    last_name,
    grade,
    section,
    roll_number,
    school_name,
    parent_email,
    phone_number,
    date_of_birth
  ) VALUES (
    p_user_id,
    p_email,
    p_first_name,
    p_last_name,
    p_grade,
    p_section,
    p_roll_number,
    p_school_name,
    p_parent_email,
    p_phone_number,
    p_date_of_birth
  );

  -- Return success
  SELECT json_build_object(
    'success', true,
    'message', 'Student profile created successfully'
  ) INTO result;

  RETURN result;

EXCEPTION WHEN OTHERS THEN
  -- Return error
  SELECT json_build_object(
    'success', false,
    'error', SQLERRM
  ) INTO result;

  RETURN result;
END;
$$;

-- Grant execute permission
GRANT EXECUTE ON FUNCTION create_student_profile TO authenticated;

-- Test the function (optional)
SELECT 'Function created successfully' as status;