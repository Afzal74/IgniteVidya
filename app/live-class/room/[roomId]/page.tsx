'use client'

import { useEffect, useState, useRef } from 'react'
import { supabase } from '@/lib/supabase'
import { useRouter, useParams } from 'next/navigation'
import { Button } from '@/components/ui/button'
import {
  Users, Mic, MicOff, Video, VideoOff, PhoneOff, Hand,
  Maximize, Minimize, AlertCircle
} from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

interface Participant {
  id: string
  student_name: string
  is_audio_enabled: boolean
  is_video_enabled: boolean
  is_hand_raised: boolean
}

export default function LiveClassRoomPage() {
  const params = useParams()
  const roomId = params.roomId as string
  const router = useRouter()
  
  const [room, setRoom] = useState<any>(null)
  const [participants, setParticipants] = useState<Participant[]>([])
  const [loading, setLoading] = useState(true)
  const [participantName, setParticipantName] = useState('')
  const [participantId, setParticipantId] = useState('')
  
  const [isAudioEnabled, setIsAudioEnabled] = useState(false)
  const [isVideoEnabled, setIsVideoEnabled] = useState(false)
  const [isHandRaised, setIsHandRaised] = useState(false)
  const [localStream, setLocalStream] = useState<MediaStream | null>(null)
  const [mediaError, setMediaError] = useState<string | null>(null)
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [showParticipants, setShowParticipants] = useState(true)
  
  const localVideoRef = useRef<HTMLVideoElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const localStreamRef = useRef<MediaStream | null>(null)

  // Keep ref in sync
  useEffect(() => {
    localStreamRef.current = localStream
  }, [localStream])

  useEffect(() => {
    const name = localStorage.getItem('live_class_participant_name')
    const id = localStorage.getItem('live_class_participant_id')
    if (name) setParticipantName(name)
    if (id) setParticipantId(id)
    
    fetchRoomData()
    initMedia()
    
    return () => {
      // Use ref to get current value in cleanup
      localStreamRef.current?.getTracks().forEach(t => t.stop())
    }
  }, [])

  // Subscribe to room and participant changes
  useEffect(() => {
    if (!roomId) return
    const ch = supabase.channel(`student-room-${roomId}`)
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
        if (payload.new.status === 'ended') {
          alert('The class has ended.')
          router.push('/live-class')
        }
        setRoom(payload.new)
      })
      .subscribe()
    return () => { supabase.removeChannel(ch) }
  }, [roomId, router])

  const initMedia = async () => {
    setMediaError(null)
    
    // Stop any existing streams first
    if (localStream) {
      localStream.getTracks().forEach(t => t.stop())
      setLocalStream(null)
    }
    
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { 
          width: { ideal: 640 }, 
          height: { ideal: 480 },
          facingMode: 'user'
        }, 
        audio: true 
      })
      setLocalStream(stream)
      setIsVideoEnabled(true)
      setIsAudioEnabled(true)
      if (localVideoRef.current) {
        localVideoRef.current.srcObject = stream
      }
      const id = localStorage.getItem('live_class_participant_id')
      if (id) {
        await supabase.from('live_class_participants').update({ is_video_enabled: true, is_audio_enabled: true }).eq('id', id)
      }
    } catch (err: any) {
      console.error('Media error:', err.name, err.message)
      
      if (err.name === 'NotReadableError') {
        // Camera busy - try audio only
        try {
          const audioStream = await navigator.mediaDevices.getUserMedia({ audio: true })
          setLocalStream(audioStream)
          setIsAudioEnabled(true)
          setMediaError('Camera busy (another app/tab). Audio only. Close other apps and Retry for video.')
          const id = localStorage.getItem('live_class_participant_id')
          if (id) {
            await supabase.from('live_class_participants').update({ is_audio_enabled: true }).eq('id', id)
          }
          return
        } catch {
          setMediaError('Camera busy. Close other browser tabs/apps, then Retry.')
        }
        return
      } else if (err.name === 'NotAllowedError') {
        setMediaError('Permission denied. Click camera icon in address bar to allow.')
        return
      } else if (err.name === 'NotFoundError') {
        setMediaError('No camera found. You can still join with audio.')
      } else {
        try {
          const audioStream = await navigator.mediaDevices.getUserMedia({ audio: true })
          setLocalStream(audioStream)
          setIsAudioEnabled(true)
          setMediaError('Camera not available. Audio only.')
          const id = localStorage.getItem('live_class_participant_id')
          if (id) {
            await supabase.from('live_class_participants').update({ is_audio_enabled: true }).eq('id', id)
          }
        } catch (audioErr) {
          setMediaError('Could not access camera or microphone.')
        }
      }
    }
  }

  const fetchRoomData = async () => {
    const { data } = await supabase.from('live_class_rooms').select('*').eq('id', roomId).single()
    if (data) { 
      setRoom(data)
      if (data.status === 'ended') { router.push('/live-class'); return }
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
      .order('joined_at')
    if (data) setParticipants(data)
  }

  const toggleAudio = async () => {
    if (localStream) {
      const enabled = !isAudioEnabled
      localStream.getAudioTracks().forEach(t => { t.enabled = enabled })
      setIsAudioEnabled(enabled)
      if (participantId) {
        await supabase.from('live_class_participants').update({ is_audio_enabled: enabled }).eq('id', participantId)
      }
    }
  }

  const toggleVideo = async () => {
    if (isVideoEnabled) {
      // Turn OFF - STOP the video track completely (turns off camera light)
      if (localStream) {
        localStream.getVideoTracks().forEach(t => {
          t.stop()
          localStream.removeTrack(t)
        })
      }
      setIsVideoEnabled(false)
      if (participantId) {
        await supabase.from('live_class_participants').update({ is_video_enabled: false }).eq('id', participantId)
      }
    } else {
      // Turn ON - get new video stream
      try {
        const videoStream = await navigator.mediaDevices.getUserMedia({ 
          video: { width: { ideal: 640 }, height: { ideal: 480 } } 
        })
        const videoTrack = videoStream.getVideoTracks()[0]
        
        if (localStream) {
          localStream.addTrack(videoTrack)
        } else {
          setLocalStream(videoStream)
        }
        setIsVideoEnabled(true)
        if (participantId) {
          await supabase.from('live_class_participants').update({ is_video_enabled: true }).eq('id', participantId)
        }
      } catch (e: any) {
        if (e.name === 'NotReadableError') {
          setMediaError('Camera is busy. Close other apps using it.')
        } else {
          setMediaError('Could not enable camera')
        }
      }
    }
  }

  const toggleHandRaise = async () => {
    const raised = !isHandRaised
    setIsHandRaised(raised)
    if (participantId) {
      await supabase.from('live_class_participants').update({ is_hand_raised: raised }).eq('id', participantId)
    }
  }

  const leaveClass = async () => {
    localStream?.getTracks().forEach(t => t.stop())
    if (participantId) {
      await supabase.from('live_class_participants').update({ left_at: new Date().toISOString() }).eq('id', participantId)
      localStorage.removeItem('live_class_participant_id')
      localStorage.removeItem('live_class_participant_name')
    }
    router.push('/live-class')
  }

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) { containerRef.current?.requestFullscreen(); setIsFullscreen(true) }
    else { document.exitFullscreen(); setIsFullscreen(false) }
  }

  const retryMedia = () => {
    localStream?.getTracks().forEach(t => t.stop())
    setLocalStream(null)
    setIsVideoEnabled(false)
    setIsAudioEnabled(false)
    initMedia()
  }

  const getColor = (i: number) => ['from-blue-500 to-cyan-500', 'from-purple-500 to-pink-500', 'from-green-500 to-emerald-500', 'from-orange-500 to-red-500'][i % 4]

  if (loading) return <div className="min-h-screen flex items-center justify-center bg-gray-900"><div className="h-12 w-12 animate-spin rounded-full border-4 border-blue-500 border-t-transparent" /></div>
  if (!room) return <div className="min-h-screen flex items-center justify-center bg-gray-900"><p className="text-zinc-400">Class not found</p></div>

  const otherParticipants = participants.filter(p => p.id !== participantId)

  return (
    <div ref={containerRef} className="min-h-screen bg-gray-900 flex flex-col">
      {/* Header */}
      <div className="bg-gray-800 border-b border-gray-700 px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <h1 className="text-white font-semibold">{room.room_name}</h1>
          <span className="px-2 py-1 rounded bg-red-500/20 text-red-400 text-xs animate-pulse">● LIVE</span>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="sm" onClick={() => setShowParticipants(!showParticipants)} className="text-gray-400 hover:text-white">
            <Users className="h-4 w-4 mr-2" />{participants.length}
          </Button>
          <Button variant="ghost" size="sm" onClick={toggleFullscreen} className="text-gray-400 hover:text-white">
            {isFullscreen ? <Minimize className="h-4 w-4" /> : <Maximize className="h-4 w-4" />}
          </Button>
        </div>
      </div>

      {/* Media Error */}
      {mediaError && (
        <div className="bg-yellow-500/20 border-b border-yellow-500/30 px-4 py-2 flex items-center justify-between">
          <div className="flex items-center gap-2 text-yellow-400 text-sm">
            <AlertCircle className="h-4 w-4" />{mediaError}
          </div>
          <Button size="sm" variant="outline" onClick={retryMedia} className="text-yellow-400 border-yellow-500/50">Retry</Button>
        </div>
      )}

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden">
        <div className="flex-1 p-4">
          <div className="grid gap-4 h-full grid-cols-1 lg:grid-cols-2">
            {/* Teacher Placeholder (Large) - Note: Real video streaming requires WebRTC service */}
            <div className="bg-gray-800 rounded-xl overflow-hidden relative lg:col-span-2 aspect-video">
              <div className="w-full h-full flex flex-col items-center justify-center">
                <div className="w-32 h-32 rounded-full bg-gradient-to-br from-blue-600 to-cyan-600 flex items-center justify-center text-white text-5xl font-bold mb-4">
                  T
                </div>
                <p className="text-white text-lg font-medium">Teacher</p>
                <p className="text-gray-400 text-sm">Live class in session</p>
                <p className="text-gray-500 text-xs mt-2 max-w-md text-center px-4">
                  Note: Video streaming between participants requires a WebRTC service (Twilio, Agora, etc.)
                </p>
              </div>
              <div className="absolute bottom-4 left-4 px-3 py-1.5 bg-black/60 rounded-lg text-white text-sm flex items-center gap-2">
                <span className="text-yellow-400">👑</span>
                Teacher (Host)
              </div>
            </div>

            {/* Your Video */}
            <div className="bg-gray-800 rounded-xl overflow-hidden relative aspect-video">
              {isVideoEnabled && localStream && localStream.getVideoTracks().length > 0 ? (
                <video 
                  key={`video-${isVideoEnabled}`}
                  ref={(el) => {
                    if (el && localStream) {
                      el.srcObject = localStream
                    }
                  }}
                  autoPlay 
                  playsInline 
                  muted 
                  className="w-full h-full object-cover scale-x-[-1]" 
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <div className="w-20 h-20 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white text-3xl font-bold">
                    {participantName[0]?.toUpperCase() || '?'}
                  </div>
                </div>
              )}
              <div className="absolute bottom-3 left-3 px-2 py-1 bg-black/60 rounded text-white text-sm flex items-center gap-2">
                {isAudioEnabled ? <Mic className="h-3 w-3 text-green-400" /> : <MicOff className="h-3 w-3 text-red-400" />}
                {participantName} (You)
              </div>
              {isHandRaised && (
                <div className="absolute top-3 right-3 w-8 h-8 bg-yellow-500 rounded-full flex items-center justify-center animate-bounce">
                  <Hand className="h-4 w-4 text-white" />
                </div>
              )}
            </div>

            {/* Other Students */}
            {otherParticipants.map((p, i) => (
              <div key={p.id} className="bg-gray-800 rounded-xl overflow-hidden relative aspect-video">
                <div className="w-full h-full flex items-center justify-center">
                  <div className={`w-16 h-16 rounded-full bg-gradient-to-br ${getColor(i)} flex items-center justify-center text-white text-2xl font-bold`}>
                    {p.student_name[0].toUpperCase()}
                  </div>
                </div>
                <div className="absolute bottom-3 left-3 px-2 py-1 bg-black/60 rounded text-white text-sm flex items-center gap-2">
                  {p.is_audio_enabled ? <Mic className="h-3 w-3 text-green-400" /> : <MicOff className="h-3 w-3 text-red-400" />}
                  {p.student_name}
                </div>
                {p.is_hand_raised && (
                  <div className="absolute top-3 right-3 w-6 h-6 bg-yellow-500 rounded-full flex items-center justify-center animate-bounce">
                    <Hand className="h-3 w-3 text-white" />
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Sidebar */}
        <AnimatePresence>
          {showParticipants && (
            <motion.div initial={{ width: 0 }} animate={{ width: 280 }} exit={{ width: 0 }} className="bg-gray-800 border-l border-gray-700 overflow-hidden">
              <div className="p-4 h-full flex flex-col w-[280px]">
                <h3 className="text-white font-semibold mb-4"><Users className="h-4 w-4 inline mr-2" />Participants ({participants.length})</h3>
                <div className="flex-1 overflow-y-auto space-y-2">
                  {participants.map((p, i) => (
                    <div key={p.id} className={`p-3 rounded-lg ${p.id === participantId ? 'bg-blue-500/20 border border-blue-500/30' : 'bg-gray-700/50'}`}>
                      <div className="flex items-center gap-3">
                        <div className={`w-8 h-8 rounded-full bg-gradient-to-br ${getColor(i)} flex items-center justify-center text-white text-sm font-bold relative`}>
                          {p.student_name[0].toUpperCase()}
                          {p.is_hand_raised && <div className="absolute -top-1 -right-1 w-4 h-4 bg-yellow-500 rounded-full flex items-center justify-center"><Hand className="h-2 w-2 text-white" /></div>}
                        </div>
                        <div>
                          <p className="text-white text-sm">{p.student_name}{p.id === participantId && <span className="text-blue-400 ml-1">(You)</span>}</p>
                          <div className="flex gap-2 mt-1">
                            {p.is_audio_enabled ? <Mic className="h-3 w-3 text-green-400" /> : <MicOff className="h-3 w-3 text-gray-500" />}
                            {p.is_video_enabled ? <Video className="h-3 w-3 text-green-400" /> : <VideoOff className="h-3 w-3 text-gray-500" />}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Controls */}
      <div className="bg-gray-800 border-t border-gray-700 px-4 py-4">
        <div className="flex items-center justify-center gap-4">
          <Button onClick={toggleAudio} className={`rounded-full w-12 h-12 ${isAudioEnabled ? 'bg-gray-700 hover:bg-gray-600' : 'bg-red-600 hover:bg-red-700'}`}>
            {isAudioEnabled ? <Mic className="h-5 w-5" /> : <MicOff className="h-5 w-5" />}
          </Button>
          <Button onClick={toggleVideo} className={`rounded-full w-12 h-12 ${isVideoEnabled ? 'bg-gray-700 hover:bg-gray-600' : 'bg-red-600 hover:bg-red-700'}`}>
            {isVideoEnabled ? <Video className="h-5 w-5" /> : <VideoOff className="h-5 w-5" />}
          </Button>
          <Button onClick={toggleHandRaise} className={`rounded-full w-12 h-12 ${isHandRaised ? 'bg-yellow-600 hover:bg-yellow-700' : 'bg-gray-700 hover:bg-gray-600'}`}>
            <Hand className="h-5 w-5" />
          </Button>
          <div className="w-px h-8 bg-gray-700 mx-2" />
          <Button onClick={leaveClass} className="rounded-full w-12 h-12 bg-red-600 hover:bg-red-700">
            <PhoneOff className="h-5 w-5" />
          </Button>
        </div>
      </div>
    </div>
  )
}
