# Quiz Real-Time Updates Troubleshooting Guide

## Issue
Quiz participants and room status are not updating in real-time for both students and teachers.

## Solution Steps

### 1. Enable Realtime in Supabase Database

Run the SQL script `supabase-realtime-fix.sql` in your Supabase SQL Editor:

```sql
-- Enable realtime on quiz tables
ALTER PUBLICATION supabase_realtime ADD TABLE quiz_rooms;
ALTER PUBLICATION supabase_realtime ADD TABLE quiz_participants;
ALTER PUBLICATION supabase_realtime ADD TABLE quiz_questions;
```

### 2. Verify Realtime is Enabled

In Supabase Dashboard:
1. Go to **Database** → **Replication**
2. Check that `supabase_realtime` publication includes:
   - `quiz_rooms`
   - `quiz_participants`
   - `quiz_questions`

Or run this query in SQL Editor:
```sql
SELECT schemaname, tablename 
FROM pg_publication_tables 
WHERE pubname = 'supabase_realtime';
```

### 3. Check RLS Policies

Make sure these policies exist (already in `supabase-realtime-fix.sql`):
- Participants can update their own records
- Participants can delete their own records (for leaving)
- Anyone can view participants
- Students can view rooms

### 4. Test Real-Time Connection

Open browser console (F12) on both teacher and student pages. You should see:
```
Subscription status: SUBSCRIBED
Successfully subscribed to real-time updates
```

When a student joins, you should see:
```
Participant change: { eventType: 'INSERT', new: {...}, old: null }
```

### 5. Common Issues and Fixes

#### Issue: "Subscription status: CHANNEL_ERROR"
**Solution:**
- Check your Supabase project is not paused
- Verify `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` in `.env.local`
- Restart your Next.js dev server

#### Issue: No console logs appearing
**Solution:**
- Clear browser cache and localStorage
- Hard refresh (Ctrl+Shift+R or Cmd+Shift+R)
- Check browser console for WebSocket errors

#### Issue: "WebSocket connection failed"
**Solution:**
- Check if your network/firewall blocks WebSocket connections
- Try disabling browser extensions (especially ad blockers)
- Check if you're behind a corporate proxy

#### Issue: Updates work but with delay
**Solution:**
- This is normal for free Supabase tier (can have 1-2 second delay)
- Upgrade to paid tier for better performance
- Check your internet connection

### 6. Manual Testing Steps

#### Test Teacher Side:
1. Open `/teacher/quiz/lobby/[roomId]` in one browser
2. Open browser console (F12)
3. Look for "Successfully subscribed to real-time updates"
4. Keep this window open

#### Test Student Side:
1. Open `/quiz` in another browser/incognito window
2. Join the room with the code
3. Check console for subscription success
4. You should see yourself appear in the teacher's window immediately

#### Test Multiple Students:
1. Open 2-3 more browser windows/tabs
2. Join with different names
3. All students should appear in real-time on:
   - Teacher's lobby page
   - All student lobby pages

### 7. Alternative: Force Polling (Fallback)

If real-time still doesn't work, you can add polling as a fallback:

```typescript
// Add this to both lobby pages
useEffect(() => {
  // Fallback polling every 3 seconds
  const pollInterval = setInterval(() => {
    fetchParticipants()
  }, 3000)

  return () => clearInterval(pollInterval)
}, [])
```

### 8. Check Supabase Project Status

1. Go to Supabase Dashboard
2. Check **Project Settings** → **General**
3. Ensure project is not paused
4. Check **Database** → **Connection pooling** is enabled

### 9. Verify Environment Variables

In `.env.local`:
```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

Restart dev server after changing:
```bash
# Stop server (Ctrl+C)
npm run dev
# or
pnpm dev
```

### 10. Test with Supabase Realtime Inspector

1. Go to Supabase Dashboard
2. Navigate to **Database** → **Realtime**
3. Enable inspector for `quiz_participants` table
4. Join a quiz room
5. Watch for INSERT events in the inspector

## Expected Behavior

### When Student Joins:
- ✅ Student appears immediately on teacher's lobby
- ✅ Student appears on all other students' lobbies
- ✅ Participant count updates in real-time
- ✅ Console shows: "Participant change: INSERT"

### When Student Leaves:
- ✅ Student disappears from all lobbies
- ✅ Participant count decreases
- ✅ Console shows: "Participant change: DELETE"

### When Teacher Starts Quiz:
- ✅ All students redirect to play page immediately
- ✅ Room status changes to "active"
- ✅ Console shows: "Room update: status changed to active"

## Still Not Working?

If you've tried everything above and it still doesn't work:

1. **Check Supabase Logs:**
   - Go to Supabase Dashboard → **Logs** → **Realtime**
   - Look for connection errors

2. **Test with Simple Query:**
   ```typescript
   // Add this to test basic connectivity
   const testConnection = async () => {
     const { data, error } = await supabase
       .from('quiz_participants')
       .select('*')
       .limit(1)
     console.log('Test query:', { data, error })
   }
   ```

3. **Contact Support:**
   - If on paid plan, contact Supabase support
   - Share console logs and error messages
   - Mention you're using real-time subscriptions

## Quick Fix Summary

1. Run `supabase-realtime-fix.sql` in Supabase SQL Editor
2. Verify realtime is enabled in Database → Replication
3. Restart your Next.js dev server
4. Clear browser cache and test again
5. Check browser console for subscription status
6. Test with multiple browser windows

The updated code now includes:
- Better error handling
- Console logging for debugging
- Proper channel configuration
- Subscription status monitoring
