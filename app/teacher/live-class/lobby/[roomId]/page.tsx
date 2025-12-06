'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { useRouter, useParams } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Users, Copy, ArrowLeft, Play, Loader2, Video, Mic } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

interface Participant {
  id: string
  student_name: string
  is_audio_enabled: boolean
  is_video_enabled: boolean
  joined_at: string
}

export default function TeacherLiveClassLobbyPage() {
  const params = useParams()
  const roomId = params.roomId as string
  const router = useRouter()
  
  const [room, setRoom] = useState<any>(null)
  const [participants, setParticipants] = useState<Participant[]>([])
  const [loading, setLoading] = useState(true)
  const [starting, setStarting] = useState(false)
  const [realtimeStatus, setRealtimeStatus] = useState<string>('CONNECTING')

  useEffect(() => {
    fetchRoomData()
    
    const channel = supabase
      .channel(`teacher-lobby-${roomId}`)
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'live_class_participants',
        filter: `room_id=eq.${roomId}`
      }, () => fetchParticipants())
      .subscribe((status) => setRealtimeStatus(status))

    return () => {
      supabase.removeChannel(channel)
    }
  }, [roomId])

  const fetchRoomData = async () => {
    const { data: roomData } = await supabase
      .from('live_class_rooms')
      .select('*')
      .eq('id', roomId)
      .single()

    if (roomData) {
      setRoom(roomData)
      if (roomData.status === 'live') {
        router.push(`/teacher/live-class/room/${roomId}`)
        return
      }
      fetchParticipants()
    }
    setLoading(false)
  }

  const fetchParticipants = async () => {
    const { data } = await supabase
      .from('live_class_participants')
      .select('*')
      .eq('room_id', roomId)
      .is('left_at', null)
      .order('joined_at', { ascending: true })

    if (data) setParticipants(data)
  }

  const copyRoomCode = () => {
    if (room) {
      navigator.clipboard.writeText(room.room_code)
    }
  }

  const startClass = async () => {
    setStarting(true)
    await supabase
      .from('live_class_rooms')
      .update({ status: 'live', started_at: new Date().toISOString() })
      .eq('id', roomId)
    
    router.push(`/teacher/live-class/room/${roomId}`)
  }

  const cancelClass = async () => {
    if (confirm('Are you sure you want to cancel this class?')) {
      await supabase
        .from('live_class_rooms')
        .delete()
        .eq('id', roomId)
      
      router.push('/teacher/live-class')
    }
  }

  const getAvatarColor = (index: number) => {
    const colors = [
      'from-blue-500 to-cyan-500',
      'from-purple-500 to-pink-500',
      'from-green-500 to-emerald-500',
      'from-orange-500 to-red-500',
    ]
    return colors[index % colors.length]
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-900 via-gray-900 to-cyan-900">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin text-blue-500 mx-auto mb-4" />
          <p className="text-zinc-400">Loading class...</p>
        </div>
      </div>
    )
  }

  if (!room) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-900 via-gray-900 to-cyan-900">
        <div className="text-center">
          <p className="text-zinc-400 mb-4">Class not found</p>
          <Button onClick={() => router.push('/teacher/live-class')}>Back</Button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 via-gray-900 to-cyan-900 relative overflow-hidden">
      {/* Status Indicator */}
      <div className="fixed top-4 right-4 z-50">
        <div className={`px-3 py-1 rounded-full text-xs font-medium ${
          realtimeStatus === 'SUBSCRIBED' ? 'bg-green-500/20 text-green-400' : 'bg-yellow-500/20 text-yellow-400'
        }`}>
          {realtimeStatus === 'SUBSCRIBED' ? '● Connected' : '○ Connecting...'}
        </div>
      </div>

      <div className="relative z-10 pt-24 pb-12 px-4 md:px-8">
        <div className="max-w-4xl mx-auto">
          <Button variant="outline" onClick={() => router.push('/teacher/live-class')} className="mb-6 border-gray-700 hover:bg-gray-800">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Classes
          </Button>

          {/* Room Header */}
          <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-8">
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">{room.room_name}</h1>
            <div className="flex items-center justify-center gap-4 flex-wrap mb-6">
              <span className="px-4 py-2 rounded-full bg-blue-500/20 text-blue-300 font-semibold">{room.subject}</span>
              <Button variant="outline" onClick={copyRoomCode} className="border-gray-600 hover:bg-gray-800">
                <Copy className="h-4 w-4 mr-2" />
                <span className="font-mono font-bold">{room.room_code}</span>
              </Button>
            </div>
            <p className="text-gray-400">Share this code with your students to let them join</p>
          </motion.div>

          {/* Waiting Card */}
          <Card className="border-gray-700 bg-gray-800/80 backdrop-blur-sm mb-8">
            <CardContent className="p-8 text-center">
              <div className="w-20 h-20 rounded-full bg-blue-500/20 border-2 border-blue-500/30 flex items-center justify-center mx-auto mb-4">
                <Users className="h-10 w-10 text-blue-400" />
              </div>
              <h2 className="text-2xl font-bold text-white mb-2">
                {participants.length} Student{participants.length !== 1 ? 's' : ''} Waiting
              </h2>
              <p className="text-gray-400 mb-6">Students are ready to join your class</p>
              
              <div className="flex justify-center gap-4">
                <Button
                  onClick={startClass}
                  disabled={starting}
                  className="bg-green-600 hover:bg-green-700 text-white px-8"
                >
                  {starting ? (
                    <>
                      <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                      Starting...
                    </>
                  ) : (
                    <>
                      <Play className="h-5 w-5 mr-2" />
                      Start Class
                    </>
                  )}
                </Button>
                <Button variant="outline" onClick={cancelClass} className="border-red-500/50 text-red-400 hover:bg-red-500/10">
                  Cancel Class
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Participants List */}
          <Card className="border-gray-700 bg-gray-800/80 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <Users className="h-5 w-5" />
                Students in Waiting Room ({participants.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              {participants.length === 0 ? (
                <div className="text-center py-12">
                  <Users className="h-16 w-16 text-gray-600 mx-auto mb-4" />
                  <p className="text-gray-400">No students have joined yet</p>
                  <p className="text-gray-500 text-sm mt-2">Share the room code with your students</p>
                </div>
              ) : (
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                  <AnimatePresence>
                    {participants.map((p, i) => (
                      <motion.div
                        key={p.id}
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.8 }}
                        className="p-4 rounded-xl border border-gray-700 bg-gray-900/50 text-center"
                      >
                        <div className={`w-12 h-12 rounded-full bg-gradient-to-br ${getAvatarColor(i)} flex items-center justify-center text-white text-lg font-bold mx-auto mb-3`}>
                          {p.student_name[0].toUpperCase()}
                        </div>
                        <p className="text-white font-medium truncate">{p.student_name}</p>
                        <div className="flex justify-center gap-2 mt-2">
                          {p.is_audio_enabled && <Mic className="h-4 w-4 text-green-400" />}
                          {p.is_video_enabled && <Video className="h-4 w-4 text-green-400" />}
                        </div>
                        <p className="text-gray-500 text-xs mt-2">
                          Joined {new Date(p.joined_at).toLocaleTimeString()}
                        </p>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
