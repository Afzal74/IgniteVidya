# Quiz System Testing Guide

## Prerequisites
1. Supabase project is set up
2. Environment variables are configured in `.env.local`
3. SQL setup has been run (`supabase-quiz-setup.sql`)
4. Teacher account exists

## Step-by-Step Testing

### Step 1: Verify Database Setup
1. Open Supabase Dashboard
2. Go to Table Editor
3. Verify these tables exist:
   - `quiz_rooms`
   - `quiz_questions`
   - `quiz_participants`

### Step 2: Test Teacher Quiz Creation
1. Navigate to `/teacher/login`
2. Login with teacher credentials
3. Navigate to `/teacher/quiz/create`
4. Fill in the form:
   - Room Name: "Test Math Quiz"
   - Category: "Mathematics"
   - Difficulty: "Medium"
   - Time per Question: 30 seconds
   - Max Players: 10
5. Add at least 2 questions:
   ```
   Question 1: What is 2 + 2?
   A: 3
   B: 4 (correct)
   C: 5
   D: 6
   
   Question 2: What is 5 × 3?
   A: 8
   B: 12
   C: 15 (correct)
   D: 18
   ```
6. Click "Create Quiz"
7. **Expected**: Alert shows room code (e.g., "ABC123")
8. **Expected**: Redirected to `/teacher/quiz/lobby/[roomId]`
9. **Note the room code** for next steps

### Step 3: Test Student Join (First Student)
1. Open a new browser window or incognito mode
2. Navigate to `/quiz`
3. Enter the room code from Step 2
4. Enter name: "Alice"
5. Click "Join Room"
6. **Expected**: Redirected to `/quiz/lobby/[roomId]`
7. **Expected**: See "Waiting for Teacher to Start..." message
8. **Expected**: See "Alice" in the participants list with "(You)" label

### Step 4: Verify Real-time Updates (Teacher Side)
1. Go back to teacher's browser (lobby page)
2. **Expected**: See "Alice" appear in the participants list
3. **Expected**: Participant count shows "1"

### Step 5: Test Multiple Students Joining
1. Open another browser window/tab
2. Navigate to `/quiz`
3. Enter the same room code
4. Enter name: "Bob"
5. Click "Join Room"
6. **Expected**: See both "Alice" and "Bob" in participants
7. Repeat with "Charlie" in another window
8. **Expected**: All three students visible in all windows

### Step 6: Verify Real-time Sync
1. Check teacher's lobby page
2. **Expected**: See all 3 students (Alice, Bob, Charlie)
3. **Expected**: "Start Quiz" button is enabled
4. Check each student's lobby page
5. **Expected**: All students see all other students

### Step 7: Test Room Validation
1. Open new browser window
2. Navigate to `/quiz`
3. Enter invalid room code: "XXXXXX"
4. Enter name: "Test"
5. Click "Join Room"
6. **Expected**: Error message "Room not found. Please check the code and try again."

### Step 8: Test Full Room
1. In Supabase, manually set `max_players` to 3 for the test room
2. Try to join with a 4th student
3. **Expected**: Error message "This room is full."

### Step 9: Test Leave Room
1. As one of the students (e.g., Bob), click "Leave Room"
2. **Expected**: Redirected to `/quiz`
3. Check teacher's lobby
4. **Expected**: Bob is removed from participants list
5. Check other students' lobbies
6. **Expected**: Bob is removed in real-time

### Step 10: Test Quiz Start (Partial - Play page not yet built)
1. As teacher, click "Start Quiz"
2. **Expected**: All students are redirected to `/quiz/play/[roomId]`
3. **Note**: This will show 404 until the play page is implemented

## Common Issues & Solutions

### Issue: "Room not found" even with correct code
**Solution**: 
- Check Supabase RLS policies are applied
- Verify `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` in `.env.local`
- Check browser console for errors

### Issue: Students not appearing in real-time
**Solution**:
- Verify Supabase Realtime is enabled for the tables
- Check browser console for subscription errors
- Ensure you're not blocking WebSocket connections

### Issue: Can't create quiz as teacher
**Solution**:
- Verify teacher is logged in (check auth state)
- Check teacher_profiles table has entry for the user
- Verify RLS policies allow teacher to insert

### Issue: Join button disabled
**Solution**:
- Ensure both room code AND name are filled in
- Room code must be exactly 6 characters
- Check for any error messages displayed

## Database Verification Queries

Run these in Supabase SQL Editor to verify data:

```sql
-- Check created rooms
SELECT * FROM quiz_rooms ORDER BY created_at DESC LIMIT 5;

-- Check questions for a room
SELECT * FROM quiz_questions WHERE room_id = 'YOUR_ROOM_ID' ORDER BY order_number;

-- Check participants in a room
SELECT * FROM quiz_participants WHERE room_id = 'YOUR_ROOM_ID' ORDER BY joined_at;

-- Check room by code
SELECT * FROM quiz_rooms WHERE room_code = 'ABC123';
```

## Success Criteria

✅ Teacher can create quiz and get room code
✅ Students can join with valid room code
✅ Students see each other in real-time
✅ Teacher sees students join in real-time
✅ Invalid room codes show error
✅ Full rooms prevent new joins
✅ Students can leave room
✅ Teacher can start quiz (redirects students)

## Next: Implement Quiz Play Page

Once all tests pass, the next step is to build:
- `/quiz/play/[roomId]` - Student quiz interface
- `/teacher/quiz/control/[roomId]` - Teacher control panel
