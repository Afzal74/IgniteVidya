'use client'

import { useEffect, useState, useRef } from 'react'
import { supabase } from '@/lib/supabase'
import { useRouter, useParams } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Users, ArrowLeft, Loader2, CheckCircle, Video, Mic, MicOff, VideoOff } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

export default function LiveClassLobbyPage() {
  const params = useParams()
  const roomId = params.roomId as string
  const router = useRouter()
  
  const [room, setRoom] = useState<any>(null)
  const [participants, setParticipants] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [participantName, setParticipantName] = useState('')
  const [realtimeStatus, setRealtimeStatus] = useState<string>('CONNECTING')
  
  // Media states
  const [isAudioEnabled, setIsAudioEnabled] = useState(false)
  const [isVideoEnabled, setIsVideoEnabled] = useState(false)
  const [mediaStream, setMediaStream] = useState<MediaStream | null>(null)
  const [permissionError, setPermissionError] = useState('')
  
  const videoRef = useRef<HTMLVideoElement>(null)

  useEffect(() => {
    const name = localStorage.getItem('live_class_participant_name')
    if (name) setParticipantName(name)

    fetchRoomData()
    
    const channel = supabase
      .channel(`live-class-lobby-${roomId}`)
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'live_class_participants',
        filter: `room_id=eq.${roomId}`
      }, () => fetchParticipants())
      .on('postgres_changes', {
        event: 'UPDATE',
        schema: 'public',
        table: 'live_class_rooms',
        filter: `id=eq.${roomId}`
      }, (payload) => {
        if (payload.new.status === 'live') {
          router.push(`/live-class/room/${roomId}`)
        }
      })
      .subscribe((status) => setRealtimeStatus(status))

    return () => {
      supabase.removeChannel(channel)
      if (mediaStream) {
        mediaStream.getTracks().forEach(track => track.stop())
      }
    }
  }, [roomId, router])

  useEffect(() => {
    if (videoRef.current && mediaStream) {
      videoRef.current.srcObject = mediaStream
    }
  }, [mediaStream])

  const fetchRoomData = async () => {
    const { data: roomData } = await supabase
      .from('live_class_rooms')
      .select('*')
      .eq('id', roomId)
      .single()

    if (roomData) {
      setRoom(roomData)
      if (roomData.status === 'live') {
        router.push(`/live-class/room/${roomId}`)
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

  const toggleAudio = async () => {
    try {
      if (!isAudioEnabled) {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
        if (mediaStream) {
          stream.getAudioTracks().forEach(track => mediaStream.addTrack(track))
        } else {
          setMediaStream(stream)
        }
        setIsAudioEnabled(true)
        updateParticipantMedia(true, isVideoEnabled)
      } else {
        mediaStream?.getAudioTracks().forEach(track => {
          track.stop()
          mediaStream.removeTrack(track)
        })
        setIsAudioEnabled(false)
        updateParticipantMedia(false, isVideoEnabled)
      }
      setPermissionError('')
    } catch (err) {
      setPermissionError('Microphone access denied. Please allow microphone access.')
    }
  }

  const toggleVideo = async () => {
    try {
      if (!isVideoEnabled) {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true })
        if (mediaStream) {
          stream.getVideoTracks().forEach(track => mediaStream.addTrack(track))
          setMediaStream(new MediaStream([...mediaStream.getTracks(), ...stream.getVideoTracks()]))
        } else {
          setMediaStream(stream)
        }
        setIsVideoEnabled(true)
        updateParticipantMedia(isAudioEnabled, true)
      } else {
        mediaStream?.getVideoTracks().forEach(track => {
          track.stop()
          mediaStream.removeTrack(track)
        })
        setIsVideoEnabled(false)
        updateParticipantMedia(isAudioEnabled, false)
      }
      setPermissionError('')
    } catch (err) {
      setPermissionError('Camera access denied. Please allow camera access.')
    }
  }

  const updateParticipantMedia = async (audio: boolean, video: boolean) => {
    const participantId = localStorage.getItem('live_class_participant_id')
    if (participantId) {
      await supabase
        .from('live_class_participants')
        .update({ is_audio_enabled: audio, is_video_enabled: video })
        .eq('id', participantId)
    }
  }

  const leaveRoom = async () => {
    const participantId = localStorage.getItem('live_class_participant_id')
    if (participantId) {
      await supabase
        .from('live_class_participants')
        .update({ left_at: new Date().toISOString() })
        .eq('id', participantId)
      
      localStorage.removeItem('live_class_participant_id')
      localStorage.removeItem('live_class_participant_name')
      localStorage.removeItem('live_class_room_id')
    }
    
    if (mediaStream) {
      mediaStream.getTracks().forEach(track => track.stop())
    }
    
    router.push('/live-class')
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
          <Button onClick={() => router.push('/live-class')}>Back to Join</Button>
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
        <div className="max-w-6xl mx-auto">
          <Button variant="outline" onClick={leaveRoom} className="mb-6 border-gray-700 hover:bg-gray-800">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Leave Class
          </Button>

          {/* Room Header */}
          <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-8">
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">{room.room_name}</h1>
            <div className="flex items-center justify-center gap-4 flex-wrap">
              <span className="px-4 py-2 rounded-full bg-blue-500/20 text-blue-300 font-semibold">{room.subject}</span>
              <span className="px-4 py-2 rounded-full bg-gray-700 text-gray-300 font-mono">Code: {room.room_code}</span>
            </div>
          </motion.div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Video Preview */}
            <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
              <Card className="border-gray-700 bg-gray-800/80 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="text-white flex items-center gap-2">
                    <Video className="h-5 w-5" />
                    Your Preview
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="aspect-video bg-gray-900 rounded-lg overflow-hidden mb-4 relative">
                    {isVideoEnabled ? (
                      <video ref={videoRef} autoPlay muted playsInline className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <div className="w-24 h-24 rounded-full bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center text-white text-4xl font-bold">
                          {participantName[0]?.toUpperCase() || '?'}
                        </div>
                      </div>
                    )}
                    <div className="absolute bottom-3 left-3 px-2 py-1 bg-black/50 rounded text-white text-sm">
                      {participantName} (You)
                    </div>
                  </div>

                  {permissionError && (
                    <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-lg mb-4">
                      <p className="text-red-400 text-sm">{permissionError}</p>
                    </div>
                  )}

                  <div className="flex justify-center gap-4">
                    <Button
                      onClick={toggleAudio}
                      className={`rounded-full w-14 h-14 ${isAudioEnabled ? 'bg-blue-600 hover:bg-blue-700' : 'bg-red-600 hover:bg-red-700'}`}
                    >
                      {isAudioEnabled ? <Mic className="h-6 w-6" /> : <MicOff className="h-6 w-6" />}
                    </Button>
                    <Button
                      onClick={toggleVideo}
                      className={`rounded-full w-14 h-14 ${isVideoEnabled ? 'bg-blue-600 hover:bg-blue-700' : 'bg-red-600 hover:bg-red-700'}`}
                    >
                      {isVideoEnabled ? <Video className="h-6 w-6" /> : <VideoOff className="h-6 w-6" />}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* Waiting & Participants */}
            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-6">
              <Card className="border-2 border-blue-500/30 bg-gradient-to-br from-blue-950 to-cyan-950">
                <CardContent className="p-8 text-center">
                  <motion.div animate={{ rotate: 360 }} transition={{ duration: 2, repeat: Infinity, ease: "linear" }} className="inline-block mb-4">
                    <Loader2 className="h-16 w-16 text-blue-400" />
                  </motion.div>
                  <h2 className="text-2xl font-bold text-white mb-2">Waiting for Teacher...</h2>
                  <p className="text-zinc-400">The class will start when your teacher begins the session</p>
                </CardContent>
              </Card>

              <Card className="border-gray-700 bg-gray-800/80 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="text-white flex items-center gap-2">
                    <Users className="h-5 w-5" />
                    Students Waiting ({participants.length})
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-3 max-h-64 overflow-y-auto">
                    <AnimatePresence>
                      {participants.map((p, i) => (
                        <motion.div
                          key={p.id}
                          initial={{ opacity: 0, scale: 0.8 }}
                          animate={{ opacity: 1, scale: 1 }}
                          className={`p-3 rounded-lg border ${p.student_name === participantName ? 'border-blue-500 bg-blue-500/10' : 'border-gray-700 bg-gray-900/50'}`}
                        >
                          <div className="flex items-center gap-2">
                            <div className={`w-8 h-8 rounded-full bg-gradient-to-br ${getAvatarColor(i)} flex items-center justify-center text-white text-sm font-bold`}>
                              {p.student_name[0].toUpperCase()}
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-white text-sm truncate">{p.student_name}</p>
                              <div className="flex gap-1">
                                {p.is_audio_enabled && <Mic className="h-3 w-3 text-green-400" />}
                                {p.is_video_enabled && <Video className="h-3 w-3 text-green-400" />}
                              </div>
                            </div>
                          </div>
                        </motion.div>
                      ))}
                    </AnimatePresence>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  )
}
