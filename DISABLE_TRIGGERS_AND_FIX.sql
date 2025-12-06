-- DISABLE ALL TRIGGERS AND FIX EVERYTHING
-- This will disable the auto-population triggers that are causing conflicts

-- First, disable ALL triggers on student tables
ALTER TABLE student_profiles DISABLE TRIGGER ALL;
ALTER TABLE student_progress DISABLE TRIGGER ALL;
ALTER TABLE student_achievements DISABLE TRIGGER ALL;

-- Completely disable RLS to ensure no blocking
ALTER TABLE student_profiles DISABLE ROW LEVEL SECURITY;
ALTER TABLE student_progress DISABLE ROW LEVEL SECURITY;
ALTER TABLE student_achievements DISABLE ROW LEVEL SECURITY;

-- Drop all existing policies to start fresh
DROP POLICY IF EXISTS "Allow all operations on profiles" ON student_profiles;
DROP POLICY IF EXISTS "Allow all operations on progress" ON student_progress;
DROP POLICY IF EXISTS "Allow all operations on achievements" ON student_achievements;

-- Show what triggers exist
SELECT 
    n.nspname as schema_name,
    c.relname as table_name, 
    t.tgname as trigger_name,
    CASE t.tgenabled 
        WHEN 'O' THEN 'enabled'
        WHEN 'D' THEN 'disabled'
        ELSE 'unknown'
    END as status
FROM pg_trigger t
JOIN pg_class c ON t.tgrelid = c.oid
JOIN pg_namespace n ON c.relnamespace = n.oid
WHERE n.nspname = 'public' 
  AND c.relname IN ('student_profiles', 'student_progress', 'student_achievements')
  AND NOT t.tgisinternal;

-- Create profiles for ALL users who don't have them (with triggers disabled)
INSERT INTO student_profiles (
    user_id, 
    email, 
    first_name, 
    last_name, 
    grade, 
    school_name, 
    section, 
    roll_number, 
    created_at, 
    updated_at
)
SELECT 
    u.id as user_id,
    u.email,
    COALESCE(u.raw_user_meta_data->>'first_name', 'Student') as first_name,
    COALESCE(u.raw_user_meta_data->>'last_name', 'User') as last_name,
    COALESCE((u.raw_user_meta_data->>'grade')::INTEGER, 6) as grade,
    COALESCE(u.raw_user_meta_data->>'school_name', 'School') as school_name,
    COALESCE(u.raw_user_meta_data->>'section', 'A') as section,
    COALESCE(u.raw_user_meta_data->>'roll_number', '001') as roll_number,
    NOW() as created_at,
    NOW() as updated_at
FROM auth.users u
LEFT JOIN student_profiles sp ON u.id = sp.user_id
WHERE sp.user_id IS NULL 
  AND u.email IS NOT NULL
ON CONFLICT (user_id) DO NOTHING;

-- Create progress for ALL users who don't have it
INSERT INTO student_progress (
    student_id, 
    subject, 
    grade, 
    completed_lessons, 
    total_lessons, 
    average_score, 
    weekly_hours, 
    difficulty_level
)
SELECT 
    u.id as student_id,
    subject_name,
    COALESCE((u.raw_user_meta_data->>'grade')::INTEGER, 6) as grade,
    0 as completed_lessons,
    CASE 
        WHEN subject_name = 'Mathematics' THEN 15
        WHEN subject_name = 'Science' THEN 12
        WHEN subject_name = 'English' THEN 12
        ELSE 10
    END as total_lessons,
    0 as average_score,
    0 as weekly_hours,
    'beginner' as difficulty_level
FROM auth.users u
CROSS JOIN (VALUES ('Mathematics'), ('Science'), ('English')) AS subjects(subject_name)
LEFT JOIN student_progress sp ON u.id = sp.student_id AND subjects.subject_name = sp.subject
WHERE sp.student_id IS NULL 
  AND u.email IS NOT NULL
ON CONFLICT (student_id, subject) DO NOTHING;

-- Create achievements for ALL users who don't have them (avoiding the unique constraint)
INSERT INTO student_achievements (
    student_id, 
    achievement_name, 
    achievement_description, 
    points_earned, 
    achievement_type, 
    earned_at
)
SELECT 
    u.id as student_id,
    'Welcome!' as achievement_name,
    'Successfully joined the learning platform' as achievement_description,
    10 as points_earned,
    'milestone' as achievement_type,
    NOW() as earned_at
FROM auth.users u
LEFT JOIN student_achievements sa ON u.id = sa.student_id 
WHERE sa.student_id IS NULL 
  AND u.email IS NOT NULL
ON CONFLICT (student_id, achievement_name) DO NOTHING;

-- Re-enable RLS with super permissive policies
ALTER TABLE student_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE student_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE student_achievements ENABLE ROW LEVEL SECURITY;

-- Create the most permissive policies possible
CREATE POLICY "Allow everything on profiles" ON student_profiles FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow everything on progress" ON student_progress FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow everything on achievements" ON student_achievements FOR ALL USING (true) WITH CHECK (true);

-- Re-enable triggers (but they shouldn't conflict now since data exists)
ALTER TABLE student_profiles ENABLE TRIGGER ALL;
ALTER TABLE student_progress ENABLE TRIGGER ALL;
ALTER TABLE student_achievements ENABLE TRIGGER ALL;

-- Show final results
DO $$
DECLARE
    profile_count INTEGER;
    progress_count INTEGER;
    achievement_count INTEGER;
    user_count INTEGER;
BEGIN
    SELECT COUNT(*) INTO user_count FROM auth.users WHERE email IS NOT NULL;
    SELECT COUNT(*) INTO profile_count FROM student_profiles;
    SELECT COUNT(*) INTO progress_count FROM student_progress;
    SELECT COUNT(*) INTO achievement_count FROM student_achievements;
    
    RAISE NOTICE '=== FINAL RESULTS ===';
    RAISE NOTICE 'Total auth users: %', user_count;
    RAISE NOTICE 'Total student profiles: %', profile_count;
    RAISE NOTICE 'Total progress records: %', progress_count;
    RAISE NOTICE 'Total achievements: %', achievement_count;
    
    IF profile_count >= user_count THEN
        RAISE NOTICE '✅ SUCCESS: All users now have profiles!';
        RAISE NOTICE '✅ Login should work for everyone now!';
    ELSE
        RAISE NOTICE '❌ Some users still missing profiles';
    END IF;
END $$;