# 🎓 Live Class System

A real-time, interactive virtual classroom built with Next.js, Supabase, and WebRTC.

![Live Class Banner](https://img.shields.io/badge/WebRTC-Powered-blue?style=for-the-badge)
![Supabase](https://img.shields.io/badge/Supabase-Realtime-green?style=for-the-badge)
![Next.js](https://img.shields.io/badge/Next.js-14-black?style=for-the-badge)

---

## ✨ Features Overview

### 🎥 Video Conferencing

- **Peer-to-peer WebRTC** connections for low-latency video/audio
- **Screen sharing** for presentations and demos
- **Adaptive video quality** with multiple STUN servers
- **Camera/mic toggle** with proper hardware cleanup
- **Mobile responsive** layout with optimized thumbnails

### 🎯 Spotlight System

- **Double-click to spotlight** any participant
- Visual indicator with pulsing border animation
- Works for both teacher and students
- Easy toggle on/off

### 💬 Live Chat

- **Real-time messaging** via Supabase broadcast
- **Unread message badges** when chat is minimized
- **Teacher vs Student** message styling
- Auto-scroll to latest messages
- Timestamps for all messages

### 📊 Interactive Polls

- Teacher creates polls with multiple options
- **Real-time vote counting** and visualization
- Progress bars showing vote distribution
- Results visible to all participants
- Integrated directly into chat panel

### 🧠 Quick Quizzes

- **Timed questions** with countdown timer
- Multiple choice answers
- **Speed-based scoring** (100 points × seconds remaining)
- Instant feedback on correct/incorrect
- Integrated into chat for seamless experience

### 🏆 Leaderboard

- **Persistent scoring** across multiple quizzes
- Top 5 students displayed with medals (🥇🥈🥉)
- Points accumulate throughout the session
- Encourages engagement and competition

### 🖐️ Hand Raise

- Students can raise/lower hand
- Teacher sees raised hands with visual indicator
- One-click to lower student's hand

---

## 🏗️ System Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                        LIVE CLASS SYSTEM                         │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  ┌──────────────┐         ┌──────────────┐                      │
│  │   Teacher    │◄───────►│   Students   │                      │
│  │    Room      │  WebRTC │    Room      │                      │
│  └──────┬───────┘         └──────┬───────┘                      │
│         │                        │                               │
│         └────────┬───────────────┘                               │
│                  │                                               │
│         ┌────────▼────────┐                                      │
│         │    Supabase     │                                      │
│         │   ┌──────────┐  │                                      │
│         │   │ Realtime │  │  ◄── Signaling, Chat, Polls, Quiz   │
│         │   │ Broadcast│  │                                      │
│         │   └──────────┘  │                                      │
│         │   ┌──────────┐  │                                      │
│         │   │ Postgres │  │  ◄── Room & Participant Data        │
│         │   │ Changes  │  │                                      │
│         │   └──────────┘  │                                      │
│         └─────────────────┘                                      │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

---

## 📁 File Structure

```
app/
├── live-class/
│   ├── page.tsx                    # Student: Join class page
│   ├── lobby/[roomId]/page.tsx     # Student: Pre-join lobby
│   └── room/[roomId]/page.tsx      # Student: Live classroom (2190 lines)
│
├── teacher/
│   └── live-class/
│       ├── page.tsx                # Teacher: Create/manage classes
│       ├── lobby/[roomId]/page.tsx # Teacher: Pre-start lobby
│       └── room/[roomId]/page.tsx  # Teacher: Live classroom (2157 lines)
│
└── lib/
    └── supabase.ts                 # Supabase client configuration
```

---

## 🔄 WebRTC Flow

```
┌─────────┐                              ┌─────────┐
│ Teacher │                              │ Student │
└────┬────┘                              └────┬────┘
     │                                        │
     │  1. Teacher joins room                 │
     │  ─────────────────────►                │
     │  Broadcasts "teacher-ready"            │
     │                                        │
     │                    2. Student joins    │
     │                ◄─────────────────────  │
     │                Sends "user-join"       │
     │                                        │
     │  3. Create Offer                       │
     │  ─────────────────────►                │
     │  Send SDP offer                        │
     │                                        │
     │                    4. Create Answer    │
     │                ◄─────────────────────  │
     │                Send SDP answer         │
     │                                        │
     │  5. Exchange ICE Candidates            │
     │  ◄────────────────────►                │
     │                                        │
     │  6. P2P Connection Established! 🎉     │
     │  ════════════════════════════════      │
     │       Video/Audio Streaming            │
     │                                        │
```

---

## 💬 Real-time Communication Channels

### Broadcast Events

| Event           | Direction         | Purpose                     |
| --------------- | ----------------- | --------------------------- |
| `teacher-ready` | Teacher → All     | Announce teacher presence   |
| `user-join`     | Student → All     | Student joined notification |
| `user-leave`    | Any → All         | Participant left            |
| `webrtc-offer`  | Teacher → Student | SDP offer for connection    |
| `webrtc-answer` | Student → Teacher | SDP answer response         |
| `webrtc-ice`    | Any → Any         | ICE candidate exchange      |
| `video-toggle`  | Any → All         | Camera on/off notification  |
| `chat-message`  | Any → All         | Chat message broadcast      |
| `poll-start`    | Teacher → All     | New poll created            |
| `poll-vote`     | Student → All     | Vote submitted              |
| `poll-end`      | Teacher → All     | Poll closed                 |
| `quiz-start`    | Teacher → All     | Quiz question sent          |
| `quiz-answer`   | Student → Teacher | Answer submitted            |
| `quiz-end`      | Teacher → All     | Quiz ended with results     |
| `class-end`     | Teacher → All     | Class session ended         |

---

## 🎨 UI Components

### Teacher Room Features

```tsx
// Main video area with spotlight support
<div className="main-video-area">
  {spotlightUser ? (
    <SpotlightedParticipant />  // Double-clicked user
  ) : teacherStream ? (
    <TeacherVideo />            // Default: teacher's stream
  ) : (
    <LocalPreview />            // Fallback: own camera
  )}
</div>

// Participant thumbnails with speaking indicators
<div className="thumbnails-grid">
  {participants.map(p => (
    <ParticipantThumbnail
      onDoubleClick={() => spotlight(p.id)}
      isSpeaking={speakingUsers.has(p.id)}
      isSpotlighted={spotlightUser === p.id}
    />
  ))}
</div>

// Control bar
<div className="controls">
  <MicToggle />
  <VideoToggle />
  <ScreenShare />
  <ChatToggle badge={unreadCount} />
  <ParticipantsToggle />
  <EndClass />
</div>
```

### Student Room Features

```tsx
// Similar layout with student-specific features
<div className="student-room">
  <MainVideoArea /> // Teacher or spotlighted user
  <ThumbnailsGrid /> // Other participants
  <ControlBar>
    <MicToggle />
    <VideoToggle />
    <HandRaise /> // Student-only feature
    <ChatToggle />
    <LeaveClass />
  </ControlBar>
</div>
```

---

## 🗳️ Poll System

### Creating a Poll (Teacher)

```tsx
const createPoll = () => {
  const poll = {
    id: `poll-${Date.now()}`,
    question: pollQuestion,
    options: pollOptions.filter((o) => o.trim()),
    votes: {},
    isActive: true,
  };

  // Broadcast to all students
  channel.send({
    type: "broadcast",
    event: "poll-start",
    payload: poll,
  });

  setActivePoll(poll);
};
```

### Poll UI

```
┌─────────────────────────────────────┐
│  📊 Poll                            │
│  ─────────────────────────────────  │
│  What is the capital of France?     │
│                                     │
│  ○ London      ████░░░░░░░░  25%   │
│  ● Paris       ████████████  75%   │
│  ○ Berlin      ░░░░░░░░░░░░   0%   │
│                                     │
│  4 votes                            │
│                     [End Poll]      │
└─────────────────────────────────────┘
```

---

## 🧠 Quiz System

### Quiz Flow

```
Teacher                          Students
   │                                │
   │  1. Create Quiz Question       │
   │  ──────────────────────────►   │
   │     question, options,         │
   │     correctAnswer, timer       │
   │                                │
   │                    2. Timer    │
   │                    starts      │
   │                    ⏱️ 30s      │
   │                                │
   │         3. Submit Answer       │
   │  ◄──────────────────────────   │
   │     answer, timestamp          │
   │                                │
   │  4. End Quiz                   │
   │  ──────────────────────────►   │
   │     correctAnswer,             │
   │     leaderboard                │
   │                                │
```

### Quiz Stack System

Teachers can create multiple questions and run them as a session:

```
┌─────────────────────────────────────┐
│  �  QUIZ STACK (3)      [CLEAR ALL] │
│  ─────────────────────────────────  │
│  1. What is 2+2?           30s  [✕] │
│  2. Capital of France?     20s  [✕] │
│  3. Largest planet?        25s  [✕] │
│  ─────────────────────────────────  │
│  [🚀 START QUIZ SESSION]            │
└─────────────────────────────────────┘
```

### Quiz Session Flow

```
┌──────────────────────────────────────────────────────┐
│                    QUIZ SESSION                       │
├──────────────────────────────────────────────────────┤
│                                                       │
│  Q1 → Timer → End → Leaderboard → [NEXT ▶]           │
│                         ↓                             │
│  Q2 → Timer → End → Leaderboard → [NEXT ▶]           │
│                         ↓                             │
│  Q3 → Timer → End → Final Leaderboard 🎉             │
│                                                       │
│  Points accumulate across all questions!              │
│                                                       │
└──────────────────────────────────────────────────────┘
```

### Scoring Algorithm

```typescript
// Points = 100 × seconds remaining
const calculatePoints = (timeLeft: number, isCorrect: boolean) => {
  if (!isCorrect) return 0;
  return 100 * timeLeft; // Max 3000 points for 30s quiz
};

// Example:
// Answer in 5 seconds (25s left) = 2500 points
// Answer in 20 seconds (10s left) = 1000 points
// Wrong answer = 0 points
```

### Cumulative Leaderboard

Points accumulate across all questions in a session:

```
After Q1:                    After Q2:                    After Q3 (Final):
┌─────────────────────┐     ┌─────────────────────┐     ┌─────────────────────┐
│ 🥇 Alice   2,500    │     │ 🥇 Alice   4,800    │     │ 🥇 Alice   7,200    │
│ � Bobi     2,200    │     │ 🥈 Charlie 4,500    │     │ 🥈 Bob     6,800    │
│ � CBharlie 1,800    │     │ 🥉 Bob     4,200    │     │ 🥉 Charlie 6,300    │
│ ⏳ Next Q...        │     │ ⏳ Next Q...        │     │ 🎉 Quiz Complete!   │
└─────────────────────┘     └─────────────────────┘     └─────────────────────┘
```

Student sees top 5 + their own rank (if not in top 5):

```
┌─────────────────────────────────────┐
│  🏆 Leaderboard                     │
│  ─────────────────────────────────  │
│  🥇 Alice         7,200 pts         │
│  🥈 Bob           6,800 pts         │
│  � Clharlie       6,300 pts         │
│  4. David         5,500 pts         │
│  5. Eve           4,000 pts         │
│  ─────────────────────────────────  │
│  #8 You           2,500 pts         │
│  ─────────────────────────────────  │
│  ⏳ Waiting for Q3/3...             │
└─────────────────────────────────────┘
```

---

## 🔊 Voice Activity Detection

Real-time speaking indicators using Web Audio API:

```typescript
// Create audio analyzer for each stream
const setupVoiceDetection = (stream: MediaStream, userId: string) => {
  const audioContext = new AudioContext();
  const analyzer = audioContext.createAnalyser();
  analyzer.fftSize = 256;
  analyzer.smoothingTimeConstant = 0.5;

  const source = audioContext.createMediaStreamSource(stream);
  source.connect(analyzer);

  const checkAudio = () => {
    const dataArray = new Uint8Array(analyzer.frequencyBinCount);
    analyzer.getByteFrequencyData(dataArray);

    const average = dataArray.reduce((a, b) => a + b) / dataArray.length;
    const isSpeaking = average > 15; // Threshold

    setSpeakingUsers((prev) => {
      const next = new Set(prev);
      isSpeaking ? next.add(userId) : next.delete(userId);
      return next;
    });

    requestAnimationFrame(checkAudio);
  };

  checkAudio();
};
```

---

## 📱 Mobile Responsiveness

### Breakpoints

| Screen              | Thumbnails  | Avatar      | Layout         |
| ------------------- | ----------- | ----------- | -------------- |
| Mobile (<640px)     | `w-32 h-24` | `w-10 h-10` | Vertical stack |
| Tablet (640-1024px) | `w-36 h-28` | `w-12 h-12` | 2-column grid  |
| Desktop (>1024px)   | `w-40 h-32` | `w-14 h-14` | Sidebar layout |

### Responsive Grid

```tsx
<div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2">
  {participants.map((p) => (
    <div className="w-32 h-24 sm:w-36 sm:h-28 md:w-40 md:h-32">
      <ParticipantVideo participant={p} />
    </div>
  ))}
</div>
```

---

## 🛡️ Error Handling

### WebRTC Connection Recovery

```typescript
// Handle ICE connection failures
pc.oniceconnectionstatechange = () => {
  if (pc.iceConnectionState === "failed") {
    pc.restartIce(); // Attempt recovery
  }
};

// Handle duplicate/late answers gracefully
const handleAnswer = async (from: string, sdp: string) => {
  const pc = peerConnections.current.get(from);
  if (!pc || pc.signalingState !== "have-local-offer") return;

  try {
    await pc.setRemoteDescription({ type: "answer", sdp });
  } catch {
    // Silently ignore - connection state changed
  }
};
```

### Media Cleanup

```typescript
// Ensure camera light turns off on page leave
useEffect(() => {
  const stopAllMedia = () => {
    localStreamRef.current?.getTracks().forEach((t) => t.stop());
    screenStreamRef.current?.getTracks().forEach((t) => t.stop());
  };

  window.addEventListener("beforeunload", stopAllMedia);
  window.addEventListener("pagehide", stopAllMedia);

  return () => {
    window.removeEventListener("beforeunload", stopAllMedia);
    window.removeEventListener("pagehide", stopAllMedia);
    stopAllMedia();
  };
}, []);
```

---

## 🗄️ Database Schema

```sql
-- Rooms table
CREATE TABLE live_class_rooms (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  room_code VARCHAR(6) UNIQUE NOT NULL,
  teacher_id UUID REFERENCES teachers(id),
  title VARCHAR(255) NOT NULL,
  subject VARCHAR(100),
  status VARCHAR(20) DEFAULT 'waiting',  -- waiting, live, ended
  created_at TIMESTAMPTZ DEFAULT NOW(),
  started_at TIMESTAMPTZ,
  ended_at TIMESTAMPTZ
);

-- Participants table
CREATE TABLE live_class_participants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  room_id UUID REFERENCES live_class_rooms(id),
  student_name VARCHAR(255) NOT NULL,
  is_audio_enabled BOOLEAN DEFAULT false,
  is_video_enabled BOOLEAN DEFAULT false,
  is_hand_raised BOOLEAN DEFAULT false,
  joined_at TIMESTAMPTZ DEFAULT NOW(),
  left_at TIMESTAMPTZ
);
```

---

## 🚀 Getting Started

### Prerequisites

- Node.js 18+
- Supabase project with Realtime enabled
- HTTPS for WebRTC (use ngrok for local dev)

### Environment Variables

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
```

### Running Locally

```bash
# Install dependencies
pnpm install

# Run development server
pnpm dev

# For WebRTC testing, use ngrok
ngrok http 3000
```

---

## 🎯 Future Enhancements

- [ ] Breakout rooms for group discussions
- [ ] Recording and playback
- [ ] Virtual backgrounds
- [ ] Whiteboard collaboration
- [ ] Attendance tracking
- [ ] Integration with LMS
- [ ] End-to-end encryption
- [ ] TURN server for better connectivity

---

## 📄 License

MIT License - Feel free to use and modify!

---

<div align="center">

**Built with ❤️ for Education**

_Making virtual classrooms interactive and engaging_

</div>
