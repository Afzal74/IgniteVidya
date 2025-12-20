// Quick script to fix the role conflict for appuafzal777@gmail.com
// Run this in your browser console or as a Node.js script

const fixRoleConflict = async () => {
  console.log("🔍 Checking for role conflicts...");
  
  // You'll need to run this SQL in your Supabase SQL editor:
  const sqlToRun = `
-- Check current conflict
SELECT 
    'Current conflict:' as info,
    s.user_id as student_user_id,
    t.user_id as teacher_user_id,
    s.email as student_email,
    t.email as teacher_email
FROM student_profiles s
FULL OUTER JOIN teacher_profiles t ON s.email = t.email
WHERE COALESCE(s.email, t.email) = 'appuafzal777@gmail.com';

-- Option 1: Keep teacher role (recommended for your case)
-- Remove student profile and related data
DELETE FROM student_achievements WHERE student_id IN (
    SELECT user_id FROM student_profiles WHERE email = 'appuafzal777@gmail.com'
);

DELETE FROM student_progress WHERE student_id IN (
    SELECT user_id FROM student_profiles WHERE email = 'appuafzal777@gmail.com'
);

DELETE FROM student_quiz_results WHERE student_id IN (
    SELECT user_id FROM student_profiles WHERE email = 'appuafzal777@gmail.com'
);

DELETE FROM student_activities WHERE student_id IN (
    SELECT user_id FROM student_profiles WHERE email = 'appuafzal777@gmail.com'
);

DELETE FROM student_profiles WHERE email = 'appuafzal777@gmail.com';

-- Verify the fix
SELECT 
    'After cleanup:' as status,
    COUNT(CASE WHEN s.email IS NOT NULL THEN 1 END) as student_profiles,
    COUNT(CASE WHEN t.email IS NOT NULL THEN 1 END) as teacher_profiles
FROM student_profiles s
FULL OUTER JOIN teacher_profiles t ON s.email = t.email
WHERE COALESCE(s.email, t.email) = 'appuafzal777@gmail.com';
  `;

  console.log("📋 Copy and run this SQL in your Supabase SQL editor:");
  console.log(sqlToRun);
  
  console.log("\n✅ After running the SQL:");
  console.log("1. The student profile for appuafzal777@gmail.com will be removed");
  console.log("2. Only the teacher profile will remain");
  console.log("3. You can then login as teacher without conflicts");
  console.log("4. The navigation will show only teacher options");
};

// Alternative: If you want to keep student role instead
const keepStudentRole = () => {
  const sqlToRun = `
-- Keep student role, remove teacher profile
DELETE FROM teacher_profiles WHERE email = 'appuafzal777@gmail.com';

-- Verify
SELECT 
    'After cleanup:' as status,
    COUNT(CASE WHEN s.email IS NOT NULL THEN 1 END) as student_profiles,
    COUNT(CASE WHEN t.email IS NOT NULL THEN 1 END) as teacher_profiles
FROM student_profiles s
FULL OUTER JOIN teacher_profiles t ON s.email = t.email
WHERE COALESCE(s.email, t.email) = 'appuafzal777@gmail.com';
  `;

  console.log("📋 To keep student role instead, run this SQL:");
  console.log(sqlToRun);
};

// Run the fix
fixRoleConflict();

console.log("\n🔄 Alternative options:");
console.log("- To keep student role instead, call: keepStudentRole()");
console.log("- To see both options, check the quick-role-conflict-fix.sql file");

// Export for use in browser console
if (typeof window !== 'undefined') {
  window.fixRoleConflict = fixRoleConflict;
  window.keepStudentRole = keepStudentRole;
}