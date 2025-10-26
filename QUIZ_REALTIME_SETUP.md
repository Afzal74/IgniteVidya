# Quiz Real-Time Setup Guide

## Quick Fix (5 minutes)

Your quiz system has real-time code already implemented, but Supabase Realtime needs to be enabled for the tables.

### Step 1: Enable Realtime in Supabase (REQUIRED)

1. Go to your Supabase Dashboard: https://app.supabase.com
2. Select your project
3. Go to **SQL Editor**
4. Click **New Query**
5. Copy and paste this SQL:

```sql
-- Enable Realtime for quiz tables
ALTER PUBLICATION supabase_realtime ADD TABLE quiz_rooms;
ALTER PUBLICATION supabase_realtime ADD TABLE quiz_participants;
ALTER PUBLICATION supabase_realtime ADD TABLE quiz_questions;

-- Add missing policies for participants
DROP POLICY IF EXISTS "Participants can update own record" ON quiz_participants;
CREATE POLICY "Participants can update own record"
  ON quiz_participants FOR UPDATE
  USING (true)
  WITH CHECK (true);

DROP POLICY IF EXISTS "Participants can delete own record" ON quiz_participants;
CREATE POLICY "Participants can delete own record"
  ON quiz_participants FOR DELETE
  USING (true);

-- Verify realtime is enabled
SELECT tablename 
FROM pg_publication_tables 
WHERE pubname = 'supabase_realtime'
AND tablename IN ('quiz_rooms', 'quiz_participants', 'quiz_questions');
```

6. Click **Run** (or press Ctrl+Enter)
7. You should see 3 rows returned showing the tables are now enabled

### Step 2: Restart Your Dev Server

```bash
# Stop your server (Ctrl+C)
# Then restart:
npm run dev
# or
pnpm dev
```

### Step 3: Test Real-Time

#### Option A: Use Test Page (Recommended)
1. Navigate to: http://localhost:3000/quiz/test-realtime
2. Check if "Realtime: ✅ Enabled" appears
3. Click "Test Insert" button
4. Look for "📡 Realtime event received" in the logs
5. Open the page in another browser window
6. Click "Test Insert" in one window
7. Watch the other window for real-time updates

#### Option B: Test with Actual Quiz
1. **Teacher:** Create a quiz at `/teacher/quiz/create`
2. **Teacher:** Note the room code
3. **Teacher:** Stay on the lobby page
4. **Student:** Open `/quiz` in another browser/incognito
5. **Student:** Join with the room code
6. **Expected:** Student appears immediately on teacher's screen
7. **Test Multiple:** Join with 2-3 more students
8. **Expected:** All students see each other in real-time

### Step 4: Verify in Browser Console

Open browser console (F12) on both teacher and student lobby pages.

You should see:
```
Subscription status: SUBSCRIBED
Successfully subscribed to real-time updates
```

When a student joins:
```
Participant change: { eventType: 'INSERT', new: {...} }
```

## What Was Fixed

### Code Changes:
1. ✅ Added better error handling to real-time subscriptions
2. ✅ Added console logging for debugging
3. ✅ Added subscription status monitoring
4. ✅ Improved channel configuration

### Files Updated:
- `app/teacher/quiz/lobby/[roomId]/page.tsx` - Better real-time handling
- `app/quiz/lobby/[roomId]/page.tsx` - Better real-time handling

### Files Created:
- `supabase-realtime-fix.sql` - SQL to enable realtime
- `app/quiz/test-realtime/page.tsx` - Test page for debugging
- `REALTIME_TROUBLESHOOTING.md` - Detailed troubleshooting guide
- `QUIZ_REALTIME_SETUP.md` - This file

## Common Issues

### Issue: "Subscription status: CHANNEL_ERROR"
**Fix:** 
- Make sure you ran the SQL script above
- Restart your dev server
- Clear browser cache

### Issue: "Subscription status: TIMED_OUT"
**Fix:**
- Check your internet connection
- Verify Supabase project is not paused
- Check if firewall/proxy blocks WebSockets

### Issue: No logs in console
**Fix:**
- Hard refresh browser (Ctrl+Shift+R)
- Clear localStorage
- Check browser console for errors

### Issue: Updates work but delayed
**Fix:**
- This is normal for free tier (1-2 second delay)
- Check your internet speed
- Consider upgrading Supabase plan

## Verify Realtime is Enabled

Run this in Supabase SQL Editor:
```sql
SELECT tablename 
FROM pg_publication_tables 
WHERE pubname = 'supabase_realtime';
```

Should return at least:
- quiz_rooms
- quiz_participants
- quiz_questions

## Alternative: Check in Supabase Dashboard

1. Go to **Database** → **Replication**
2. Find `supabase_realtime` publication
3. Verify it includes your quiz tables
4. If not, click **Edit** and add them

## Still Not Working?

1. Check `REALTIME_TROUBLESHOOTING.md` for detailed debugging
2. Visit the test page: `/quiz/test-realtime`
3. Check Supabase logs: Dashboard → Logs → Realtime
4. Verify environment variables in `.env.local`

## Success Checklist

- [ ] Ran SQL script in Supabase
- [ ] Verified 3 tables returned from verification query
- [ ] Restarted dev server
- [ ] Tested with `/quiz/test-realtime` page
- [ ] Saw "Realtime: ✅ Enabled"
- [ ] Tested with actual quiz (teacher + students)
- [ ] Students appear in real-time on teacher's screen
- [ ] Multiple students see each other in real-time
- [ ] Console shows "SUBSCRIBED" status
- [ ] Console shows realtime events when students join

Once all checkboxes are ✅, your real-time quiz system is working!
