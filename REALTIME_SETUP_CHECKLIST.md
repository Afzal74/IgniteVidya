# ✅ Real-Time Setup Checklist

Use this checklist to enable real-time updates for your quiz system.

## Prerequisites
- [ ] Supabase project is set up
- [ ] Environment variables configured in `.env.local`
- [ ] Quiz tables exist in database
- [ ] Dev server is running

## Step 1: Enable Realtime in Database (5 minutes)

### 1.1 Open Supabase SQL Editor
- [ ] Go to https://app.supabase.com
- [ ] Select your project
- [ ] Click **SQL Editor** in sidebar
- [ ] Click **New Query**

### 1.2 Run the SQL Script
- [ ] Copy contents from `supabase-realtime-fix.sql`
- [ ] Paste into SQL Editor
- [ ] Click **Run** (or press Ctrl+Enter)
- [ ] Verify you see 3 rows returned (quiz_rooms, quiz_participants, quiz_questions)

### 1.3 Verify Realtime is Enabled
- [ ] Go to **Database** → **Replication** in Supabase Dashboard
- [ ] Find `supabase_realtime` publication
- [ ] Confirm it includes: quiz_rooms, quiz_participants, quiz_questions

## Step 2: Restart Development Server (1 minute)

- [ ] Stop your dev server (press Ctrl+C in terminal)
- [ ] Start it again: `npm run dev` or `pnpm dev`
- [ ] Wait for "Ready" message
- [ ] Open http://localhost:3000

## Step 3: Test Real-Time Connection (3 minutes)

### 3.1 Use Test Page
- [ ] Navigate to: http://localhost:3000/quiz/test-realtime
- [ ] Check status shows: **"Realtime: ✅ Enabled"**
- [ ] Check indicator shows: **🟢 "Live Updates Active"**
- [ ] Click **"Test Insert"** button
- [ ] Look for **"📡 Realtime event received"** in logs

### 3.2 Test with Multiple Windows
- [ ] Open test page in 2 browser windows side-by-side
- [ ] Click "Test Insert" in window 1
- [ ] Verify logs update in window 2 immediately
- [ ] Try clicking in window 2, verify window 1 updates

## Step 4: Test with Actual Quiz (5 minutes)

### 4.1 Teacher Setup
- [ ] Login as teacher at `/teacher/login`
- [ ] Navigate to `/teacher/quiz/create`
- [ ] Create a test quiz with 2-3 questions
- [ ] Note the room code (e.g., "ABC123")
- [ ] Stay on the lobby page
- [ ] Check for 🟢 "Live Updates Active" indicator (top right)
- [ ] Open browser console (F12)
- [ ] Verify you see: "Subscription status: SUBSCRIBED"

### 4.2 Student 1 Joins
- [ ] Open new browser window (or incognito)
- [ ] Navigate to `/quiz`
- [ ] Enter the room code
- [ ] Enter name: "Alice"
- [ ] Click "Join Room"
- [ ] Check for 🟢 "Live Updates Active" indicator
- [ ] Open browser console (F12)
- [ ] Verify you see: "Subscription status: SUBSCRIBED"

### 4.3 Verify Real-Time Updates
- [ ] Check teacher's window
- [ ] Verify "Alice" appears immediately (no refresh needed)
- [ ] Verify participant count shows "1"
- [ ] Check teacher's console for: "Participant change: INSERT"

### 4.4 Student 2 Joins
- [ ] Open another browser window
- [ ] Navigate to `/quiz`
- [ ] Enter same room code
- [ ] Enter name: "Bob"
- [ ] Click "Join Room"

### 4.5 Verify Multi-User Real-Time
- [ ] Check teacher's window: Should show Alice AND Bob
- [ ] Check Alice's window: Should show Alice (You) AND Bob
- [ ] Check Bob's window: Should show Alice AND Bob (You)
- [ ] All updates should be instant (no refresh needed)

### 4.6 Test Quiz Start
- [ ] As teacher, click "Start Quiz" button
- [ ] Verify Alice's window redirects immediately
- [ ] Verify Bob's window redirects immediately
- [ ] Check console for: "Room update: status changed to active"

## Step 5: Verify Console Logs (2 minutes)

### Expected Logs on Page Load:
- [ ] "Subscription status: CONNECTING"
- [ ] "Subscription status: SUBSCRIBED"
- [ ] "Successfully subscribed to real-time updates"

### Expected Logs When Student Joins:
- [ ] "Participant change: { eventType: 'INSERT', ... }"
- [ ] Participant data logged

### Expected Logs When Teacher Starts:
- [ ] "Room update: { status: 'active', ... }"

## Step 6: Test Edge Cases (Optional, 3 minutes)

### 6.1 Test Student Leaving
- [ ] As one student, click "Leave Room"
- [ ] Verify they're removed from all other windows immediately
- [ ] Verify participant count decreases

### 6.2 Test Connection Recovery
- [ ] Disconnect internet briefly
- [ ] Verify indicator shows 🔴 "Connection Lost"
- [ ] Reconnect internet
- [ ] Verify indicator returns to 🟢 "Live Updates Active"

### 6.3 Test with Maximum Students
- [ ] Open 5-10 browser windows
- [ ] Join with different names
- [ ] Verify all appear in real-time
- [ ] Check performance is acceptable

## Troubleshooting Checklist

If real-time is not working, check these:

### Database Issues
- [ ] Ran `supabase-realtime-fix.sql` successfully
- [ ] Verified realtime publication includes quiz tables
- [ ] RLS policies are correctly set up
- [ ] Supabase project is not paused

### Connection Issues
- [ ] Dev server was restarted after SQL changes
- [ ] Browser cache was cleared (Ctrl+Shift+R)
- [ ] No firewall blocking WebSocket connections
- [ ] No browser extensions blocking connections

### Code Issues
- [ ] Environment variables are correct in `.env.local`
- [ ] Supabase URL and anon key are valid
- [ ] No JavaScript errors in console
- [ ] Latest code changes are deployed

### Network Issues
- [ ] Internet connection is stable
- [ ] Not behind restrictive corporate proxy
- [ ] WebSocket connections are allowed
- [ ] Supabase region is accessible

## Success Criteria

You've successfully enabled real-time when:

- ✅ Test page shows "Realtime: ✅ Enabled"
- ✅ 🟢 "Live Updates Active" indicator appears
- ✅ Console shows "SUBSCRIBED" status
- ✅ Students appear instantly on teacher's screen
- ✅ Multiple students see each other in real-time
- ✅ Teacher starting quiz redirects all students immediately
- ✅ No manual refresh needed for any updates
- ✅ No errors in browser console

## Common Issues & Quick Fixes

| Issue | Quick Fix |
|-------|-----------|
| 🔴 Connection Lost | Run SQL script, restart server |
| No console logs | Hard refresh (Ctrl+Shift+R) |
| CHANNEL_ERROR | Check Supabase project status |
| Students don't appear | Verify RLS policies |
| Delayed updates (1-2s) | Normal for free tier |
| WebSocket blocked | Check firewall/proxy |

## Next Steps After Setup

Once real-time is working:

1. **Test with Real Class**
   - [ ] Test with actual students
   - [ ] Monitor for connection issues
   - [ ] Check performance with full class

2. **Monitor Performance**
   - [ ] Check Supabase Dashboard → Logs → Realtime
   - [ ] Monitor connection count
   - [ ] Check for any errors

3. **Optimize if Needed**
   - [ ] Consider upgrading Supabase plan for better performance
   - [ ] Add error recovery mechanisms
   - [ ] Implement connection retry logic

4. **Document for Team**
   - [ ] Share setup instructions with team
   - [ ] Document any custom configurations
   - [ ] Create runbook for common issues

## Support Resources

If you need help:

1. **Documentation**
   - `QUICK_FIX_REALTIME.md` - Quick reference
   - `QUIZ_REALTIME_SETUP.md` - Detailed setup
   - `REALTIME_TROUBLESHOOTING.md` - Troubleshooting guide
   - `REALTIME_FLOW_DIAGRAM.md` - Architecture diagrams

2. **Test Tools**
   - `/quiz/test-realtime` - Interactive test page
   - Browser console (F12) - Debug logs
   - Supabase Dashboard → Logs - Server logs

3. **Community**
   - Supabase Discord: https://discord.supabase.com
   - Supabase Docs: https://supabase.com/docs/guides/realtime

## Completion

Date completed: _______________

Tested by: _______________

Notes:
_________________________________
_________________________________
_________________________________

✅ Real-time quiz system is now fully operational!
