# Real-Time Quiz Flow Diagram

## How Real-Time Updates Work

```
┌─────────────────────────────────────────────────────────────────┐
│                     SUPABASE DATABASE                            │
│                                                                  │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐         │
│  │ quiz_rooms   │  │quiz_participants│ │quiz_questions│         │
│  └──────┬───────┘  └──────┬─────────┘  └──────┬───────┘         │
│         │                 │                    │                 │
│         └─────────────────┴────────────────────┘                 │
│                           │                                      │
│                  ┌────────▼────────┐                            │
│                  │ supabase_realtime│                            │
│                  │   publication    │                            │
│                  └────────┬────────┘                            │
└───────────────────────────┼─────────────────────────────────────┘
                            │
                            │ WebSocket Connection
                            │
        ┌───────────────────┼───────────────────┐
        │                   │                   │
        ▼                   ▼                   ▼
┌───────────────┐   ┌───────────────┐   ┌───────────────┐
│   TEACHER     │   │   STUDENT 1   │   │   STUDENT 2   │
│   Browser     │   │   Browser     │   │   Browser     │
│               │   │               │   │               │
│ ┌───────────┐ │   │ ┌───────────┐ │   │ ┌───────────┐ │
│ │  Lobby    │ │   │ │  Lobby    │ │   │ │  Lobby    │ │
│ │  Page     │ │   │ │  Page     │ │   │ │  Page     │ │
│ └───────────┘ │   │ └───────────┘ │   │ └───────────┘ │
│               │   │               │   │               │
│ 🟢 Connected  │   │ 🟢 Connected  │   │ 🟢 Connected  │
└───────────────┘   └───────────────┘   └───────────────┘
```

## Event Flow Example: Student Joins

```
1. Student 2 Joins Quiz
   │
   ├─► INSERT into quiz_participants
   │   (student_name: "Bob", room_id: "abc123")
   │
   ▼
2. Supabase Realtime Detects Change
   │
   ├─► Publishes event to supabase_realtime
   │
   ▼
3. WebSocket Broadcasts to All Subscribers
   │
   ├─────────────┬─────────────┐
   │             │             │
   ▼             ▼             ▼
Teacher      Student 1     Student 2
Receives     Receives      Receives
Event        Event         Event
   │             │             │
   ▼             ▼             ▼
Updates      Updates       Updates
UI           UI            UI
(Shows Bob)  (Shows Bob)   (Shows self)
```

## Subscription Setup

```typescript
// Both Teacher and Student Lobby Pages

┌─────────────────────────────────────────────┐
│ 1. Page Loads                               │
│    ├─► Fetch initial room data              │
│    └─► Fetch initial participants           │
└─────────────────────────────────────────────┘
                    │
                    ▼
┌─────────────────────────────────────────────┐
│ 2. Subscribe to Real-Time Channel           │
│    ├─► Listen to quiz_participants changes  │
│    └─► Listen to quiz_rooms changes         │
└─────────────────────────────────────────────┘
                    │
                    ▼
┌─────────────────────────────────────────────┐
│ 3. On Event Received                        │
│    ├─► Log to console                       │
│    ├─► Fetch updated data                   │
│    └─► Update UI                            │
└─────────────────────────────────────────────┘
                    │
                    ▼
┌─────────────────────────────────────────────┐
│ 4. On Page Unload                           │
│    └─► Unsubscribe from channel             │
└─────────────────────────────────────────────┘
```

## Status Indicator States

```
┌──────────────────────────────────────────────────────┐
│                                                      │
│  🟡 CONNECTING                                       │
│     ├─► Initial state when page loads               │
│     └─► Attempting to establish WebSocket           │
│                                                      │
│  🟢 SUBSCRIBED                                       │
│     ├─► Successfully connected                       │
│     ├─► Receiving real-time updates                 │
│     └─► Auto-hides after 5 seconds                  │
│                                                      │
│  🔴 CHANNEL_ERROR / TIMED_OUT                        │
│     ├─► Connection failed                            │
│     ├─► Check Supabase status                        │
│     └─► Run realtime-fix.sql                         │
│                                                      │
└──────────────────────────────────────────────────────┘
```

## Data Flow: Teacher Starts Quiz

```
Teacher Clicks "Start Quiz"
        │
        ▼
UPDATE quiz_rooms
SET status = 'active'
WHERE id = roomId
        │
        ▼
Realtime Event Published
        │
        ├─────────────┬─────────────┐
        │             │             │
        ▼             ▼             ▼
    Teacher      Student 1     Student 2
        │             │             │
        ▼             ▼             ▼
  Navigate to   Navigate to   Navigate to
  /control      /play         /play
```

## Console Log Flow

```
Page Load:
├─► "🔍 Testing Supabase connection..."
├─► "✅ Database query successful"
├─► "🔌 Setting up realtime subscription..."
└─► "📊 Subscription status: SUBSCRIBED"

Student Joins:
├─► "📡 Realtime event received: INSERT"
├─► "Participant change: { eventType: 'INSERT', ... }"
└─► "🔄 Refreshed participants (3 total)"

Teacher Starts:
├─► "📡 Realtime event received: UPDATE"
├─► "Room update: { status: 'active' }"
└─► "Redirecting to play page..."
```

## Architecture Overview

```
┌─────────────────────────────────────────────────────┐
│                   FRONTEND                          │
│                                                     │
│  ┌─────────────────┐      ┌─────────────────┐     │
│  │ Teacher Lobby   │      │ Student Lobby   │     │
│  │                 │      │                 │     │
│  │ - View students │      │ - View students │     │
│  │ - Start quiz    │      │ - Wait for start│     │
│  │ - Real-time sub │      │ - Real-time sub │     │
│  └────────┬────────┘      └────────┬────────┘     │
│           │                        │              │
└───────────┼────────────────────────┼──────────────┘
            │                        │
            └────────────┬───────────┘
                         │
                         │ Supabase Client
                         │ (WebSocket + REST)
                         │
┌────────────────────────┼──────────────────────────┐
│                        │                          │
│                   SUPABASE                        │
│                        │                          │
│  ┌─────────────────────▼─────────────────────┐   │
│  │         PostgreSQL Database               │   │
│  │                                            │   │
│  │  - quiz_rooms                              │   │
│  │  - quiz_participants                       │   │
│  │  - quiz_questions                          │   │
│  │                                            │   │
│  │  RLS Policies:                             │   │
│  │  ✓ Teachers can manage own quizzes        │   │
│  │  ✓ Students can view and join             │   │
│  │  ✓ Anyone can view participants           │   │
│  └────────────────────────────────────────────┘   │
│                        │                          │
│  ┌─────────────────────▼─────────────────────┐   │
│  │      Realtime Publication                 │   │
│  │                                            │   │
│  │  Enabled for:                              │   │
│  │  ✓ quiz_rooms                              │   │
│  │  ✓ quiz_participants                       │   │
│  │  ✓ quiz_questions                          │   │
│  └────────────────────────────────────────────┘   │
│                                                   │
└───────────────────────────────────────────────────┘
```

## Troubleshooting Flow

```
Real-time not working?
        │
        ▼
Check Status Indicator
        │
        ├─► 🟢 Connected?
        │   └─► Working! No action needed
        │
        ├─► 🟡 Connecting?
        │   └─► Wait 5 seconds, should turn green
        │
        └─► 🔴 Error?
            │
            ▼
    Run supabase-realtime-fix.sql
            │
            ▼
    Restart dev server
            │
            ▼
    Clear browser cache
            │
            ▼
    Check browser console
            │
            ├─► "SUBSCRIBED"? ✅ Fixed!
            │
            └─► Still errors?
                └─► Check REALTIME_TROUBLESHOOTING.md
```

## Performance Considerations

```
Free Tier:
├─► Latency: 1-2 seconds
├─► Max connections: 200
└─► Good for: Testing, small classes

Paid Tier:
├─► Latency: <500ms
├─► Max connections: 500+
└─► Good for: Production, large classes

Optimization Tips:
├─► Use specific filters (room_id=eq.xxx)
├─► Unsubscribe when leaving page
├─► Batch updates when possible
└─► Monitor connection count
```
