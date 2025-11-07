-- Force refresh Supabase schema cache
-- Run this in SQL Editor

-- This will force Supabase to reload the schema
SELECT pg_notify('pgrst', 'reload schema');

-- Check if the table is accessible and show structure
SELECT column_name, data_type, is_nullable
FROM information_schema.columns 
WHERE table_name = 'student_profiles' 
  AND table_schema = 'public'
ORDER BY ordinal_position;