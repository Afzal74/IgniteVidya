-- Live Classes Setup for IgniteVidya
-- Similar to quiz rooms but for video/audio live classes

-- Create live_class_rooms table
CREATE TABLE IF NOT EXISTS live_class_rooms (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  teacher_id UUID REFERENCES teacher_profiles(user_id) ON DELETE CASCADE NOT NULL,
  room_code TEXT UNIQUE NOT NULL,
  room_name TEXT NOT NULL,
  subject TEXT NOT NULL,
  description TEXT,
  max_participants INTEGER DEFAULT 50,
  status TEXT NOT NULL DEFAULT 'waiting' CHECK (status IN ('waiting', 'live', 'ended')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  started_at TIMESTAMP WITH TIME ZONE,
  ended_at TIMESTAMP WITH TIME ZONE
);

-- Create live_class_participants table
CREATE TABLE IF NOT EXISTS live_class_participants (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  room_id UUID REFERENCES live_class_rooms(id) ON DELETE CASCADE NOT NULL,
  student_id UUID REFERENCES students(id) ON DELETE CASCADE,
  student_name TEXT NOT NULL,
  is_audio_enabled BOOLEAN DEFAULT false,
  is_video_enabled BOOLEAN DEFAULT false,
  is_hand_raised BOOLEAN DEFAULT false,
  joined_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  left_at TIMESTAMP WITH TIME ZONE
);

-- Enable Row Level Security
ALTER TABLE live_class_rooms ENABLE ROW LEVEL SECURITY;
ALTER TABLE live_class_participants ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Teachers can view own live class rooms" ON live_class_rooms;
DROP POLICY IF EXISTS "Anyone can view live class rooms by code" ON live_class_rooms;
DROP POLICY IF EXISTS "Teachers can create live class rooms" ON live_class_rooms;
DROP POLICY IF EXISTS "Teachers can update own live class rooms" ON live_class_rooms;
DROP POLICY IF EXISTS "Teachers can delete own live class rooms" ON live_class_rooms;
DROP POLICY IF EXISTS "Anyone can view live class participants" ON live_class_participants;
DROP POLICY IF EXISTS "Anyone can join live class" ON live_class_participants;
DROP POLICY IF EXISTS "Participants can update own status" ON live_class_participants;

-- Policies for live_class_rooms
CREATE POLICY "Teachers can view own live class rooms"
  ON live_class_rooms FOR SELECT
  USING (auth.uid() = teacher_id);

CREATE POLICY "Anyone can view live class rooms by code"
  ON live_class_rooms FOR SELECT
  USING (true);

CREATE POLICY "Teachers can create live class rooms"
  ON live_class_rooms FOR INSERT
  WITH CHECK (auth.uid() = teacher_id);

CREATE POLICY "Teachers can update own live class rooms"
  ON live_class_rooms FOR UPDATE
  USING (auth.uid() = teacher_id);

CREATE POLICY "Teachers can delete own live class rooms"
  ON live_class_rooms FOR DELETE
  USING (auth.uid() = teacher_id);

-- Policies for live_class_participants
CREATE POLICY "Anyone can view live class participants"
  ON live_class_participants FOR SELECT
  USING (true);

CREATE POLICY "Anyone can join live class"
  ON live_class_participants FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Participants can update own status"
  ON live_class_participants FOR UPDATE
  USING (true);

CREATE POLICY "Participants can leave"
  ON live_class_participants FOR DELETE
  USING (true);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS live_class_rooms_teacher_id_idx ON live_class_rooms(teacher_id);
CREATE INDEX IF NOT EXISTS live_class_rooms_room_code_idx ON live_class_rooms(room_code);
CREATE INDEX IF NOT EXISTS live_class_rooms_status_idx ON live_class_rooms(status);
CREATE INDEX IF NOT EXISTS live_class_participants_room_id_idx ON live_class_participants(room_id);

-- Enable realtime for live updates
ALTER PUBLICATION supabase_realtime ADD TABLE live_class_rooms;
ALTER PUBLICATION supabase_realtime ADD TABLE live_class_participants;
