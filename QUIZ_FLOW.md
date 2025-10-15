# Quiz System Flow

## Overview
The quiz system allows teachers to create quiz rooms and students to join them using a room code.

## Teacher Flow

1. **Login**: Teacher logs in at `/teacher/login`
2. **Create Quiz**: Navigate to `/teacher/quiz/create`
   - Set room name, category, difficulty
   - Configure time limit and max players
   - Add custom questions with 4 options each
   - Click "Create Quiz" to generate a room code
3. **Lobby**: Automatically redirected to `/teacher/quiz/lobby/[roomId]`
   - View the generated room code
   - See students joining in real-time
   - Wait for students to join
   - Click "Start Quiz" when ready
4. **Control**: Quiz starts and teacher can monitor progress

## Student Flow

1. **Join Page**: Student visits `/quiz`
   - Enter the room code provided by teacher
   - Enter their name
   - Select subject category (optional)
   - Click "Join Room"
2. **Lobby**: Redirected to `/quiz/lobby/[roomId]`
   - See other students who have joined
   - Wait for teacher to start the quiz
   - Real-time updates when new students join
3. **Play**: When teacher starts, automatically redirected to `/quiz/play/[roomId]`
   - Answer questions within time limit
   - See score updates in real-time

## Database Tables

### quiz_rooms
- Stores quiz room information
- Contains room_code, settings, and status
- Status: 'waiting' | 'active' | 'completed'

### quiz_questions
- Stores questions for each room
- Multiple choice with 4 options (A, B, C, D)
- Points and order number

### quiz_participants
- Tracks students in each room
- Stores name, score, and answers submitted
- Real-time updates via Supabase subscriptions

## Real-time Features

- Students see new participants join in real-time
- Teacher sees students join in real-time
- Quiz automatically starts for all students when teacher clicks "Start"
- Uses Supabase real-time subscriptions

## Security

- Teachers must be authenticated to create quizzes
- Students can join without authentication (using name only)
- RLS policies ensure teachers can only manage their own quizzes
- Students can view rooms and questions but not modify them
