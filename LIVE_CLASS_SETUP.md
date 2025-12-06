# Live Class Feature Setup Guide

This guide explains how to set up and use the Live Class feature in IgniteVidya, which allows teachers to conduct real-time video classes with students.

## Features

- **Real-time Video Classes**: Teachers can host live video sessions
- **Room Code System**: Students join using a 6-character code (similar to quiz rooms)
- **Audio/Video Controls**: Both teachers and students can toggle their camera and microphone
- **Hand Raise**: Students can raise their hand to get teacher's attention
- **Screen Sharing**: Teachers can share their screen during the class
- **Participant Management**: Teachers can see all participants and remove if needed
- **Real-time Updates**: Participant list updates in real-time using Supabase

## Database Setup

Run the following SQL in your Supabase SQL Editor:

```sql
-- See supabase-live-class-setup.sql for the complete setup
```

Or run the `supabase-live-class-setup.sql` file directly in Supabase.

## How It Works

### For Teachers

1. Go to `/teacher/live-class` (or navigate from Teacher Dashboard)
2. Click "Create Class" and fill in:
   - Class Name
   - Subject
   - Description (optional)
   - Max Students
3. Copy the generated room code and share with students
4. Click "Start Class" when ready
5. In the live room:
   - Toggle your camera/microphone
   - Share your screen
   - See raised hands from students
   - Remove participants if needed
   - End class when done

### For Students

1. Go to `/live-class`
2. Enter the room code provided by teacher
3. Enter your name
4. Allow camera/microphone permissions when prompted
5. Wait in the lobby until teacher starts the class
6. In the live room:
   - Toggle your camera/microphone
   - Raise hand to get teacher's attention
   - Leave class when done

## File Structure

```
app/
├── live-class/
│   ├── page.tsx                    # Student join page
│   ├── lobby/
│   │   └── [roomId]/
│   │       └── page.tsx            # Student waiting lobby
│   └── room/
│       └── [roomId]/
│           └── page.tsx            # Student live room
├── teacher/
│   └── live-class/
│       ├── page.tsx                # Teacher class management
│       └── room/
│           └── [roomId]/
│               └── page.tsx        # Teacher live room (host view)
```

## Routes

| Route | Description |
|-------|-------------|
| `/live-class` | Student join page |
| `/live-class/lobby/[roomId]` | Student waiting lobby |
| `/live-class/room/[roomId]` | Student live room |
| `/teacher/live-class` | Teacher class management |
| `/teacher/live-class/room/[roomId]` | Teacher host view |

## Database Tables

### live_class_rooms
- `id` - UUID primary key
- `teacher_id` - Reference to teacher
- `room_code` - 6-character unique code
- `room_name` - Class name
- `subject` - Subject category
- `description` - Optional description
- `max_participants` - Maximum students allowed
- `status` - 'waiting', 'live', or 'ended'
- `created_at`, `started_at`, `ended_at` - Timestamps

### live_class_participants
- `id` - UUID primary key
- `room_id` - Reference to room
- `student_id` - Optional reference to student account
- `student_name` - Display name
- `is_audio_enabled` - Microphone status
- `is_video_enabled` - Camera status
- `is_hand_raised` - Hand raise status
- `joined_at`, `left_at` - Timestamps

## Important Notes

1. **Browser Permissions**: Users must allow camera/microphone access
2. **HTTPS Required**: WebRTC features require HTTPS in production
3. **Real-time**: Uses Supabase Realtime for live updates
4. **No Actual Video Streaming**: This implementation shows the UI and local video preview. For actual peer-to-peer video streaming, you would need to integrate WebRTC with a signaling server or use a service like:
   - Twilio Video
   - Agora
   - Daily.co
   - LiveKit

## Future Enhancements

- [ ] Actual WebRTC peer-to-peer video streaming
- [ ] Chat functionality
- [ ] Recording capability
- [ ] Breakout rooms
- [ ] Whiteboard integration
- [ ] Polls and Q&A
- [ ] Attendance tracking

## Troubleshooting

### Camera/Microphone not working
- Check browser permissions
- Ensure HTTPS is being used
- Try a different browser

### Students can't join
- Verify the room code is correct
- Check if the room status is 'waiting' or 'live'
- Ensure the room isn't full

### Real-time updates not working
- Check Supabase Realtime is enabled
- Verify the tables are added to the realtime publication
- Check browser console for errors
