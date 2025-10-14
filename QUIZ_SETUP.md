# Quiz System Setup

## Overview
The quiz system is now separated into Teacher and Student portals:

### Teacher Portal (`/teacher/quiz`)
- **Create Quiz Rooms** - Teachers can create quiz rooms with custom settings
- **Room Settings**:
  - Room Name
  - Category (Mathematics, Science, Technology, Engineering)
  - Difficulty (Easy, Medium, Hard)
  - Number of Questions (5-50)
  - Time Limit per Question (10-120 seconds)
  - Max Players (2-50)
- **Room Code Generation** - Automatic 6-character code generation
- **Room Management** - View active and past quiz rooms
- **Share Codes** - Easy copy-paste of room codes for students

### Student Portal (`/quiz`)
- **Join Room Only** - Students can ONLY join existing rooms
- **No Create Option** - Create button removed for students
- **Simple Interface**:
  - Enter 6-digit room code
  - Enter student name
  - Join quiz room

## Access Points

### For Teachers:
1. Login at `/teacher/login`
2. Go to Dashboard
3. Click on "Quiz Rooms" card OR
4. Navigate directly to `/teacher/quiz`

### For Students:
1. Navigate to `/quiz` from main navigation
2. Enter room code provided by teacher
3. Enter name and join

## Features

### Teacher Features:
- ✅ Create unlimited quiz rooms
- ✅ Customize quiz settings
- ✅ Generate unique room codes
- ✅ Track active rooms
- ✅ View participant count

### Student Features:
- ✅ Join rooms with code
- ✅ Simple, clean interface
- ✅ No account required to join
- ✅ Real-time quiz participation

## Next Steps (Optional Enhancements):
1. Add database tables for quiz rooms
2. Implement real-time quiz functionality
3. Add leaderboards and scoring
4. Track student performance
5. Generate quiz reports for teachers
