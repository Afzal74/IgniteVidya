# Fix: Teacher Profile Foreign Key Error

## The Error
```
Error creating quiz: insert or update on table "quiz_rooms" violates foreign key constraint "quiz_rooms_teacher_id_fkey"
```

## What This Means
The `teacher_profiles` table either:
1. Doesn't exist in your database, OR
2. Doesn't have your teacher account in it

## Quick Fix (5 minutes)

### Step 1: Run Complete Database Setup

1. Open Supabase Dashboard: https://app.supabase.com
2. Go to **SQL Editor** → **New Query**
3. Copy and paste the entire contents of `supabase-complete-setup.sql`
4. Click **Run** ▶️
5. Wait for success message

This will:
- ✅ Create `teacher_profiles` table if missing
- ✅ Create all quiz tables
- ✅ Set up RLS policies
- ✅ Enable realtime
- ✅ Create indexes

### Step 2: Sign Up as Teacher Again

1. Go to: http://localhost:3000/teacher/login
2. Click **"Don't have an account? Sign Up"**
3. Fill in all fields:
   - First Name
   - Last Name
   - School Name
   - Role (select from dropdown)
   - Phone Number
   - Email
   - Password
4. Click **"Sign Up"**
5. You should see: "Account created successfully!"

### Step 3: Sign In

1. Enter your email and password
2. Click **"Sign In"**
3. You should be redirected to teacher dashboard

### Step 4: Test Quiz Creation

1. Go to: `/teacher/quiz/create`
2. Fill in quiz details
3. Add questions
4. Click **"Create Quiz"**
5. Should work now! ✅

## Alternative: Check if Teacher Profile Exists

Run this query in Supabase SQL Editor:

```sql
-- Check if you have a teacher profile
SELECT * FROM teacher_profiles WHERE email = 'your-email@example.com';

-- If empty, your profile doesn't exist
-- If you see a row, check the user_id matches your auth user
```

## If You Already Have an Account

If you already signed up but the profile wasn't created:

### Option 1: Create Profile Manually

```sql
-- Get your user ID from auth
SELECT id, email FROM auth.users WHERE email = 'your-email@example.com';

-- Insert teacher profile (replace YOUR_USER_ID with the ID from above)
INSERT INTO teacher_profiles (user_id, email, first_name, last_name, school_name, role, phone_number)
VALUES (
  'YOUR_USER_ID',
  'your-email@example.com',
  'Your First Name',
  'Your Last Name',
  'Your School',
  'class_teacher',
  '+91 1234567890'
);
```

### Option 2: Sign Up with New Email

1. Use a different email address
2. Complete signup process
3. This will create the profile automatically

## Verify It's Fixed

### Check 1: Profile Exists
```sql
SELECT * FROM teacher_profiles;
-- Should show at least one row (your profile)
```

### Check 2: Can Create Quiz
1. Go to `/teacher/quiz/create`
2. Create a test quiz
3. Should work without errors

### Check 3: Foreign Key Works
```sql
-- This should return your teacher profile
SELECT tp.*, u.email 
FROM teacher_profiles tp
JOIN auth.users u ON tp.user_id = u.id
WHERE u.email = 'your-email@example.com';
```

## Common Issues

### Issue: "teacher_profiles table does not exist"
**Solution:** Run `supabase-complete-setup.sql`

### Issue: "duplicate key value violates unique constraint"
**Solution:** You already have a profile, just sign in (don't sign up again)

### Issue: "permission denied for table teacher_profiles"
**Solution:** RLS policies not set up correctly, run `supabase-complete-setup.sql`

### Issue: Still getting foreign key error after setup
**Solution:** 
1. Sign out completely
2. Clear browser cache
3. Sign in again
4. Try creating quiz

## What the Complete Setup Does

The `supabase-complete-setup.sql` file:

1. **Creates teacher_profiles table** with all required columns
2. **Creates students table** for student records
3. **Creates quiz tables** (rooms, questions, participants)
4. **Sets up RLS policies** for security
5. **Enables realtime** for live updates
6. **Creates indexes** for performance
7. **Verifies everything** is set up correctly

## Success Checklist

- [ ] Ran `supabase-complete-setup.sql` in Supabase
- [ ] Saw success message in SQL Editor
- [ ] Signed up as teacher (or verified profile exists)
- [ ] Signed in successfully
- [ ] Can access teacher dashboard
- [ ] Can create quiz without errors
- [ ] Quiz room code is generated

## Next Steps After Fix

1. **Test Quiz Creation**
   - Create a test quiz
   - Note the room code
   - Go to lobby page

2. **Test Realtime**
   - Visit `/quiz/test-realtime`
   - Verify realtime is enabled

3. **Test Full Flow**
   - Teacher creates quiz
   - Students join
   - Everyone sees updates in real-time

## Files to Use

- **`supabase-complete-setup.sql`** - Run this to fix everything
- **`START_HERE_REALTIME.md`** - After fixing, set up realtime
- **`QUICK_FIX_REALTIME.md`** - Quick realtime reference

## Still Having Issues?

1. Check Supabase project is not paused
2. Verify environment variables in `.env.local`:
   ```
   NEXT_PUBLIC_SUPABASE_URL=your_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_key
   ```
3. Restart dev server after database changes
4. Clear browser cache and localStorage
5. Check browser console for specific errors

## Summary

The error happens because the `quiz_rooms` table tries to reference `teacher_profiles.user_id`, but either:
- The table doesn't exist
- Your teacher profile wasn't created during signup

**Solution:** Run `supabase-complete-setup.sql` to create all tables and set everything up properly.

---

**Quick Command:**
1. Open Supabase SQL Editor
2. Paste contents of `supabase-complete-setup.sql`
3. Click Run
4. Sign up as teacher
5. Create quiz ✅
