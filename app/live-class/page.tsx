'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'
import {
  Video,
  Users,
  ArrowRight,
  Play,
  Loader2,
  Mic,
  Camera,
  Home,
} from 'lucide-react'

export default function LiveClassPage() {
  const router = useRouter()
  const [playerName, setPlayerName] = useState('')
  const [roomCode, setRoomCode] = useState('')
  const [joining, setJoining] = useState(false)
  const [error, setError] = useState('')

  const joinRoom = async () => {
    if (!roomCode.trim() || !playerName.trim()) {
      setError('Please enter both room code and your name')
      return
    }

    setJoining(true)
    setError('')

    try {
      // Find the room by code
      const { data: room, error: roomError } = await supabase
        .from('live_class_rooms')
        .select('*')
        .eq('room_code', roomCode.toUpperCase())
        .single()

      if (roomError || !room) {
        setError('Room not found. Please check the code and try again.')
        setJoining(false)
        return
      }

      // Check if room has ended
      if (room.status === 'ended') {
        setError('This class has already ended.')
        setJoining(false)
        return
      }

      // Check if room is full
      const { data: participants } = await supabase
        .from('live_class_participants')
        .select('id')
        .eq('room_id', room.id)
        .is('left_at', null)

      if (participants && participants.length >= room.max_participants) {
        setError('This class is full.')
        setJoining(false)
        return
      }

      // Join the room
      const { data: participant, error: joinError } = await supabase
        .from('live_class_participants')
        .insert({
          room_id: room.id,
          student_name: playerName.trim(),
          is_audio_enabled: false,
          is_video_enabled: false,
        })
        .select()
        .single()

      if (joinError) {
        setError('Failed to join class. Please try again.')
        setJoining(false)
        return
      }

      // Store participant info in localStorage
      localStorage.setItem('live_class_participant_id', participant.id)
      localStorage.setItem('live_class_participant_name', playerName.trim())
      localStorage.setItem('live_class_room_id', room.id)

      // Redirect to class lobby or room
      if (room.status === 'waiting') {
        router.push(`/live-class/lobby/${room.id}`)
      } else {
        router.push(`/live-class/room/${room.id}`)
      }
    } catch (err: any) {
      setError('An error occurred. Please try again.')
      console.error(err)
    } finally {
      setJoining(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-900 py-8 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Back Button */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
          className="pt-8 md:pt-16 px-4"
        >
          <Button
            variant="outline"
            size="sm"
            onClick={() => router.push('/')}
            className="border-gray-700 hover:bg-gray-800"
          >
            <ArrowRight className="h-3 w-3 mr-1 rotate-180" />
            Back
          </Button>
        </motion.div>

        {/* Hero Section */}
        <motion.div
          initial={{ opacity: 0, y: -30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center mb-4 md:mb-6 pt-2 md:pt-6"
        >
          <div className="mb-6 md:mb-8 px-4 md:px-8">
            <div className="mb-3 md:mb-4">
              <span className="px-3 py-1.5 md:px-4 md:py-2 rounded-full bg-blue-500/20 border border-blue-500/30 text-blue-300 text-xs md:text-sm font-semibold">
                Real-Time Video Classes
              </span>
            </div>
            <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold leading-tight text-white">
              Join Live Class
            </h1>
          </div>
        </motion.div>

        {/* Join Interface */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.3 }}
          className="max-w-xl mx-auto px-4"
        >
          <div className="bg-gray-800/90 backdrop-blur-sm rounded-2xl p-6 md:p-10 lg:p-12 border border-gray-700 shadow-2xl">
            <div className="flex items-center justify-center mb-6">
              <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-cyan-600 rounded-2xl flex items-center justify-center">
                <Video className="h-8 w-8 text-white" />
              </div>
            </div>
            
            <h2 className="text-xl md:text-2xl font-bold text-white mb-5 md:mb-6 text-center">
              Enter Class Room
            </h2>

            <div className="space-y-4 md:space-y-5">
              {/* Room Code */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Class Code
                </label>
                <Input
                  value={roomCode}
                  onChange={(e) => setRoomCode(e.target.value.toUpperCase())}
                  placeholder="ABC123"
                  className="bg-gray-700 border-2 border-gray-600 text-white placeholder-gray-400 rounded-lg h-12 text-center text-xl font-mono tracking-widest focus:border-blue-500 transition-colors"
                  maxLength={6}
                />
              </div>

              {/* Your Name */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Your Name
                </label>
                <Input
                  value={playerName}
                  onChange={(e) => setPlayerName(e.target.value)}
                  placeholder="Enter your name"
                  className="bg-gray-700 border-2 border-gray-600 text-white placeholder-gray-400 rounded-lg h-12 focus:border-blue-500 transition-colors"
                  maxLength={20}
                />
              </div>

              {/* Info Box */}
              <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-4">
                <div className="flex items-center gap-3 text-gray-300 text-sm">
                  <div className="flex gap-2">
                    <Mic className="h-4 w-4 text-blue-400" />
                    <Camera className="h-4 w-4 text-blue-400" />
                  </div>
                  <p>You'll be asked for camera & mic permissions when joining</p>
                </div>
              </div>

              {/* Error Message */}
              {error && (
                <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-lg">
                  <p className="text-red-400 text-sm text-center">{error}</p>
                </div>
              )}

              {/* Join Button */}
              <Button
                onClick={joinRoom}
                disabled={!roomCode.trim() || !playerName.trim() || joining}
                className="w-full bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white py-3 rounded-lg text-lg font-semibold shadow-lg hover:shadow-xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {joining ? (
                  <>
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                    Joining...
                  </>
                ) : (
                  <>
                    <Play className="mr-2 h-5 w-5" />
                    Join Class
                  </>
                )}
              </Button>
            </div>
          </div>
        </motion.div>

        {/* How it Works Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.5 }}
          className="max-w-3xl mx-auto mt-6 md:mt-8 px-4 pb-8"
        >
          <h3 className="text-lg md:text-xl font-bold text-white mb-4 text-center">
            How it Works
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 md:gap-4">
            <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-4 md:p-6 border border-gray-700 text-center">
              <div className="w-10 h-10 md:w-12 md:h-12 rounded-full bg-blue-500/20 border border-blue-500/30 flex items-center justify-center mx-auto mb-2 md:mb-3">
                <span className="text-xl md:text-2xl">1️⃣</span>
              </div>
              <h4 className="text-white font-semibold mb-1.5 md:mb-2 text-sm md:text-base">
                Get Class Code
              </h4>
              <p className="text-gray-400 text-xs md:text-sm">
                Your teacher will share a 6-character class code
              </p>
            </div>

            <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-4 md:p-6 border border-gray-700 text-center">
              <div className="w-10 h-10 md:w-12 md:h-12 rounded-full bg-blue-500/20 border border-blue-500/30 flex items-center justify-center mx-auto mb-2 md:mb-3">
                <span className="text-xl md:text-2xl">2️⃣</span>
              </div>
              <h4 className="text-white font-semibold mb-1.5 md:mb-2 text-sm md:text-base">
                Allow Permissions
              </h4>
              <p className="text-gray-400 text-xs md:text-sm">
                Enable your camera and microphone when prompted
              </p>
            </div>

            <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-4 md:p-6 border border-gray-700 text-center">
              <div className="w-10 h-10 md:w-12 md:h-12 rounded-full bg-blue-500/20 border border-blue-500/30 flex items-center justify-center mx-auto mb-2 md:mb-3">
                <span className="text-xl md:text-2xl">3️⃣</span>
              </div>
              <h4 className="text-white font-semibold mb-1.5 md:mb-2 text-sm md:text-base">
                Join & Learn
              </h4>
              <p className="text-gray-400 text-xs md:text-sm">
                Participate in the live class with your teacher and classmates
              </p>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  )
}
