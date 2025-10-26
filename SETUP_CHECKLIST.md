# 🚀 Complete Quiz System Setup Checklist

## Current Issue
❌ **Error:** "insert or update on table 'quiz_rooms' violates foreign key constraint"

## Solution: Complete Database Setup

### ✅ Step 1: Run Database Setup (5 minutes)

1. **Open Supabase Dashboard**
   - [ ] Go to https://app.supabase.com
   - [ ] Select your project
   - [ ] Click **SQL Editor** in sidebar
   - [ ] Click **New Query**

2. **Run Setup Script**
   - [ ] Open file: `supabase-complete-setup.sql`
   - [ ] Copy ALL contents (Ctrl+A, Ctrl+C)
   - [ ] Paste into Supabase SQL Editor
   - [ ] Click **Run** button (or press Ctrl+Enter)
   - [ ] Wait for completion (should take 5-10 seconds)

3. **Verify Success**
   - [ ] Check for success messages in output
   - [ ] Should see: "✅ Database setup complete!"
   - [ ] Should see table names listed
   - [ ] Should see realtime tables listed

### ✅ Step 2: Create Teacher Account (3 minutes)

1. **Sign Up**
   - [ ] Go to: http://localhost:3000/teacher/login
   - [ ] Click **"Don't have an account? Sign Up"**
   - [ ] Fill in all fields:
     - [ ] First Name: _____________
     - [ ] Last Name: _____________
     - [ ] School Name: _____________
     - [ ] Role: (select from dropdown)
     - [ ] Phone Number: _____________
     - [ ] Email: _____________
     - [ ] Password: _____________ (min 6 characters)
   - [ ] Click **"Sign Up"**
   - [ ] Wait for: "Account created successfully!"

2. **Sign In**
   - [ ] Enter your email
   - [ ] Enter your password
   - [ ] Click **"Sign In"**
   - [ ] Should redirect to teacher dashboard

### ✅ Step 3: Test Quiz Creation (3 minutes)

1. **Create Test Quiz**
   - [ ] Go to: `/teacher/quiz/create`
   - [ ] Fill in quiz details:
     - [ ] Room Name: "Test Quiz"
     - [ ] Category: "Mathematics"
     - [ ] Difficulty: "Medium"
     - [ ] Time per Question: 30 seconds
     - [ ] Max Players: 10
   
2. **Add Questions**
   - [ ] Add Question 1:
     - [ ] Question: "What is 2 + 2?"
     - [ ] Option A: "3"
     - [ ] Option B: "4" (mark as correct)
     - [ ] Option C: "5"
     - [ ] Option D: "6"
   - [ ] Add Question 2:
     - [ ] Question: "What is 5 × 3?"
     - [ ] Option A: "8"
     - [ ] Option B: "12"
     - [ ] Option C: "15" (mark as correct)
     - [ ] Option D: "18"

3. **Create Quiz**
   - [ ] Click **"Create Quiz"**
   - [ ] Should see room code (e.g., "ABC123")
   - [ ] Should redirect to lobby page
   - [ ] **NO ERRORS!** ✅

### ✅ Step 4: Test Real-Time (5 minutes)

1. **Check Test Page**
   - [ ] Go to: http://localhost:3000/quiz/test-realtime
   - [ ] Should see: "Realtime: ✅ Enabled"
   - [ ] Should see: 🟢 "Live Updates Active"
   - [ ] Click "Test Insert" button
   - [ ] Should see: "📡 Realtime event received"

2. **Test with Actual Quiz**
   - [ ] Teacher stays on lobby page
   - [ ] Open new browser window (incognito)
   - [ ] Student goes to: `/quiz`
   - [ ] Student enters room code
   - [ ] Student enters name: "Alice"
   - [ ] Student clicks "Join Room"
   - [ ] **Check teacher's window:** Alice should appear immediately
   - [ ] Open another browser window
   - [ ] Another student joins as "Bob"
   - [ ] **Check all windows:** Both students visible everywhere

3. **Test Quiz Start**
   - [ ] Teacher clicks "Start Quiz"
   - [ ] All student windows should redirect immediately
   - [ ] No manual refresh needed

## Troubleshooting

### If Database Setup Fails

**Error: "relation already exists"**
- ✅ This is OK! It means tables already exist
- Continue to next step

**Error: "permission denied"**
- Check you're using the correct Supabase project
- Verify you have admin access

**Error: "syntax error"**
- Make sure you copied the ENTIRE file
- Check no characters were cut off

### If Teacher Signup Fails

**Error: "User already registered"**
- Just sign in instead (don't sign up again)

**Error: "Failed to create teacher profile"**
- Run the database setup again
- Make sure `teacher_profiles` table exists

**Error: "Invalid email or password"**
- Password must be at least 6 characters
- Email must be valid format

### If Quiz Creation Still Fails

**Error: "violates foreign key constraint"**
- Sign out completely
- Clear browser cache (Ctrl+Shift+R)
- Sign in again
- Try creating quiz again

**Error: "permission denied"**
- Make sure you're signed in as teacher
- Check RLS policies were created (run setup again)

**No room code generated**
- Check browser console (F12) for errors
- Verify all quiz fields are filled in

## Verification Queries

Run these in Supabase SQL Editor to verify setup:

### Check Tables Exist
```sql
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
  AND table_name IN ('teacher_profiles', 'quiz_rooms', 'quiz_questions', 'quiz_participants')
ORDER BY table_name;
```
**Expected:** 4 rows

### Check Your Teacher Profile
```sql
SELECT * FROM teacher_profiles;
```
**Expected:** At least 1 row (your profile)

### Check Realtime Enabled
```sql
SELECT tablename 
FROM pg_publication_tables 
WHERE pubname = 'supabase_realtime'
  AND tablename LIKE 'quiz%';
```
**Expected:** 3 rows (quiz_rooms, quiz_participants, quiz_questions)

### Check RLS Policies
```sql
SELECT tablename, policyname 
FROM pg_policies 
WHERE tablename IN ('teacher_profiles', 'quiz_rooms', 'quiz_questions', 'quiz_participants')
ORDER BY tablename, policyname;
```
**Expected:** Multiple rows showing policies

## Success Criteria

You're all set when:

- ✅ Database setup completed without errors
- ✅ Teacher account created successfully
- ✅ Can sign in to teacher dashboard
- ✅ Can create quiz without errors
- ✅ Room code is generated
- ✅ Lobby page loads correctly
- ✅ Test page shows realtime enabled
- ✅ Students can join and appear in real-time
- ✅ Teacher can start quiz
- ✅ Students redirect when quiz starts

## Files Reference

| File | Purpose |
|------|---------|
| `supabase-complete-setup.sql` | Complete database setup (RUN THIS FIRST!) |
| `FIX_TEACHER_PROFILE_ERROR.md` | Detailed fix for foreign key error |
| `START_HERE_REALTIME.md` | Quick realtime setup |
| `QUICK_FIX_REALTIME.md` | Realtime quick reference |
| `REALTIME_TROUBLESHOOTING.md` | Realtime issues |
| `SETUP_CHECKLIST.md` | This file |

## Quick Command Summary

```bash
# 1. Run supabase-complete-setup.sql in Supabase SQL Editor

# 2. Restart dev server
npm run dev

# 3. Sign up at
http://localhost:3000/teacher/login

# 4. Create quiz at
http://localhost:3000/teacher/quiz/create

# 5. Test realtime at
http://localhost:3000/quiz/test-realtime
```

## Timeline

- **Database Setup:** 5 minutes
- **Teacher Signup:** 3 minutes
- **Quiz Creation:** 3 minutes
- **Realtime Testing:** 5 minutes
- **Total:** ~15 minutes

## Next Steps After Setup

1. **Create Real Quizzes**
   - Add more questions
   - Test different categories
   - Try different difficulty levels

2. **Test with Students**
   - Share room codes
   - Monitor real-time updates
   - Check performance

3. **Monitor System**
   - Check Supabase Dashboard → Logs
   - Monitor realtime connections
   - Watch for errors

## Support

If you're still stuck after following this checklist:

1. Check `FIX_TEACHER_PROFILE_ERROR.md` for detailed troubleshooting
2. Review browser console (F12) for specific errors
3. Check Supabase Dashboard → Logs for server errors
4. Verify environment variables in `.env.local`

---

**Start Here:** Run `supabase-complete-setup.sql` in Supabase SQL Editor!
