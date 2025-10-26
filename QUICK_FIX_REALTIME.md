# 🚀 Quick Fix: Enable Real-Time Updates

## The Problem
Students and teachers don't see updates in real-time during quiz.

## The Fix (2 Minutes)

### 1️⃣ Run This SQL in Supabase
1. Open https://app.supabase.com
2. Go to SQL Editor
3. Paste and run:

```sql
ALTER PUBLICATION supabase_realtime ADD TABLE quiz_rooms;
ALTER PUBLICATION supabase_realtime ADD TABLE quiz_participants;
ALTER PUBLICATION supabase_realtime ADD TABLE quiz_questions;
```

### 2️⃣ Restart Your Server
```bash
# Press Ctrl+C to stop, then:
npm run dev
```

### 3️⃣ Test It
Go to: http://localhost:3000/quiz/test-realtime

Look for: ✅ **"Realtime: Enabled"**

## Done! 🎉

Now test with a real quiz:
- Teacher creates quiz
- Students join
- Everyone sees updates instantly!

## Still Not Working?

Read: `QUIZ_REALTIME_SETUP.md` for detailed instructions

## What Changed?

✅ Enabled Supabase Realtime for quiz tables
✅ Added visual connection indicator (🟢 top right)
✅ Added console logging for debugging
✅ Created test page at `/quiz/test-realtime`

## Files to Check

- `supabase-realtime-fix.sql` - The SQL you need to run
- `QUIZ_REALTIME_SETUP.md` - Detailed setup guide
- `REALTIME_TROUBLESHOOTING.md` - If you have issues
