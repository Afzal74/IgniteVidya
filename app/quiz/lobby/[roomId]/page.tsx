'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { useRouter, useParams } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Users, Clock, Trophy, ArrowLeft, Loader2, CheckCircle } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

export default function StudentLobbyPage() {
  const params = useParams()
  const roomId = params.roomId as string
  const router = useRouter()
  const [room, setRoom] = useState<any>(null)
  const [participants, setParticipants] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [participantName, setParticipantName] = useState('')

  useEffect(() => {
    // Get participant name from localStorage
    const name = localStorage.getItem('quiz_participant_name')
    if (name) {
      setParticipantName(name)
    }

    fetchRoomData()
    
    // Subscribe to real-time updates
    const channel = supabase
      .channel(`student-room-${roomId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'quiz_participants',
          filter: `room_id=eq.${roomId}`
        },
        () => {
          fetchParticipants()
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'quiz_rooms',
          filter: `id=eq.${roomId}`
        },
        (payload) => {
          // Check if quiz has started
          if (payload.new.status === 'active') {
            router.push(`/quiz/play/${roomId}`)
          }
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [roomId])

  const fetchRoomData = async () => {
    const { data: roomData } = await supabase
      .from('quiz_rooms')
      .select('*')
      .eq('id', roomId)
      .single()

    if (roomData) {
      setRoom(roomData)
      
      // If quiz already started, redirect
      if (roomData.status === 'active') {
        router.push(`/quiz/play/${roomId}`)
        return
      }
      
      fetchParticipants()
    }
    setLoading(false)
  }

  const fetchParticipants = async () => {
    const { data } = await supabase
      .from('quiz_participants')
      .select('*')
      .eq('room_id', roomId)
      .order('joined_at', { ascending: true })

    if (data) {
      setParticipants(data)
    }
  }

  const leaveRoom = async () => {
    const participantId = localStorage.getItem('quiz_participant_id')
    if (participantId) {
      await supabase
        .from('quiz_participants')
        .delete()
        .eq('id', participantId)
      
      localStorage.removeItem('quiz_participant_id')
      localStorage.removeItem('quiz_participant_name')
      localStorage.removeItem('quiz_room_id')
    }
    router.push('/quiz')
  }

  const getAvatarColor = (index: number) => {
    const colors = [
      'from-blue-500 to-cyan-500',
      'from-purple-500 to-pink-500',
      'from-green-500 to-emerald-500',
      'from-orange-500 to-red-500',
      'from-indigo-500 to-purple-500',
      'from-yellow-500 to-orange-500',
    ]
    return colors[index % colors.length]
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-50 via-blue-50 to-cyan-50 dark:from-gray-900 dark:via-purple-900/20 dark:to-blue-900/20">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin text-purple-600 mx-auto mb-4" />
          <p className="text-zinc-600 dark:text-zinc-400">Loading room...</p>
        </div>
      </div>
    )
  }

  if (!room) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-50 via-blue-50 to-cyan-50 dark:from-gray-900 dark:via-purple-900/20 dark:to-blue-900/20">
        <div className="text-center">
          <p className="text-zinc-600 dark:text-zinc-400 mb-4">Room not found</p>
          <Button onClick={() => router.push('/quiz')}>
            Back to Join
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-cyan-50 dark:from-gray-900 dark:via-purple-900/20 dark:to-blue-900/20 relative overflow-hidden">
      {/* Animated Background Elements */}
      <div className="fixed inset-0 pointer-events-none">
        {[...Array(20)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-2 h-2 bg-blue-400/30 rounded-full"
            initial={{
              x: typeof window !== 'undefined' ? Math.random() * window.innerWidth : 0,
              y: typeof window !== 'undefined' ? Math.random() * window.innerHeight : 0,
            }}
            animate={{
              y: typeof window !== 'undefined' ? [null, Math.random() * window.innerHeight] : 0,
              x: typeof window !== 'undefined' ? [null, Math.random() * window.innerWidth] : 0,
            }}
            transition={{
              duration: Math.random() * 10 + 10,
              repeat: Infinity,
              ease: "linear"
            }}
          />
        ))}
      </div>

      <div className="relative z-10 pt-24 pb-12 px-4 md:px-8">
        <div className="max-w-6xl mx-auto">
          <Button
            variant="outline"
            onClick={leaveRoom}
            className="mb-6"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Leave Room
          </Button>

          {/* Room Header */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-8"
          >
            <h1 className="text-4xl md:text-5xl font-bold text-black dark:text-white mb-4">
              {room.room_name}
            </h1>
            <div className="flex items-center justify-center gap-4 flex-wrap">
              <span className="px-4 py-2 rounded-full bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 font-semibold">
                {room.category}
              </span>
              <span className="px-4 py-2 rounded-full bg-purple-100 dark:bg-purple-900 text-purple-700 dark:text-purple-300 font-semibold">
                {room.difficulty}
              </span>
              <span className="px-4 py-2 rounded-full bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300 font-semibold">
                {room.question_count} Questions
              </span>
            </div>
          </motion.div>

          {/* Waiting Message */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="mb-8"
          >
            <Card className="border-2 border-purple-200 dark:border-purple-800 bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-950 dark:to-pink-950 shadow-xl">
              <CardContent className="p-8 text-center">
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                  className="inline-block mb-4"
                >
                  <Loader2 className="h-16 w-16 text-purple-600 dark:text-purple-400" />
                </motion.div>
                <h2 className="text-2xl font-bold text-black dark:text-white mb-2">
                  Waiting for Teacher to Start...
                </h2>
                <p className="text-zinc-600 dark:text-zinc-400">
                  Your teacher will start the quiz when everyone is ready
                </p>
              </CardContent>
            </Card>
          </motion.div>

          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <Card className="border-zinc-200 dark:border-zinc-800 bg-white/80 dark:bg-black/80 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-sm text-zinc-600 dark:text-zinc-400 flex items-center gap-2">
                  <Users className="h-4 w-4" />
                  Students Joined
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-4xl font-bold text-black dark:text-white">
                  {participants.length}
                </p>
                <p className="text-sm text-zinc-600 dark:text-zinc-400 mt-1">
                  / {room.max_players} max
                </p>
              </CardContent>
            </Card>

            <Card className="border-zinc-200 dark:border-zinc-800 bg-white/80 dark:bg-black/80 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-sm text-zinc-600 dark:text-zinc-400 flex items-center gap-2">
                  <Clock className="h-4 w-4" />
                  Time per Question
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-4xl font-bold text-black dark:text-white">
                  {room.time_limit}s
                </p>
              </CardContent>
            </Card>

            <Card className="border-zinc-200 dark:border-zinc-800 bg-white/80 dark:bg-black/80 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-sm text-zinc-600 dark:text-zinc-400 flex items-center gap-2">
                  <Trophy className="h-4 w-4" />
                  Total Points
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-4xl font-bold text-black dark:text-white">
                  {room.question_count * 10}
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Participants Grid */}
          <Card className="border-zinc-200 dark:border-zinc-800 bg-white/80 dark:bg-black/80 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="text-black dark:text-white flex items-center gap-2">
                <Users className="h-5 w-5" />
                Students in Room
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                <AnimatePresence>
                  {participants.map((participant, index) => (
                    <motion.div
                      key={participant.id}
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.8 }}
                      transition={{ delay: index * 0.1 }}
                      className="relative"
                    >
                      <Card className={`border-2 ${participant.student_name === participantName ? 'border-purple-500 dark:border-purple-400' : 'border-zinc-200 dark:border-zinc-800'} hover:shadow-lg transition-shadow`}>
                        <CardContent className="p-4 text-center">
                          <div className={`w-16 h-16 rounded-full bg-gradient-to-br ${getAvatarColor(index)} mx-auto mb-3 flex items-center justify-center text-white text-2xl font-bold shadow-lg`}>
                            {participant.student_name[0].toUpperCase()}
                          </div>
                          <p className="font-semibold text-black dark:text-white truncate">
                            {participant.student_name}
                            {participant.student_name === participantName && (
                              <span className="text-purple-600 dark:text-purple-400 text-xs ml-1">(You)</span>
                            )}
                          </p>
                          <p className="text-xs text-zinc-500 dark:text-zinc-500 mt-1">
                            Ready
                          </p>
                        </CardContent>
                      </Card>
                      <motion.div
                        className="absolute -top-2 -right-2 w-6 h-6 bg-green-500 rounded-full flex items-center justify-center"
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ delay: index * 0.1 + 0.2 }}
                      >
                        <CheckCircle className="h-4 w-4 text-white" />
                      </motion.div>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
