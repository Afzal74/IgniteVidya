'use client'

import { useEffect, useState, useRef, useCallback } from 'react'
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

const ICE_SERVERS = {
  iceServers: [
    { urls: 'stun:stun.l.google.com:19302' },
    { urls: 'stun:stun1.l.google.com:19302' },
    { urls: 'stun:stun2.l.google.com:19302' },
  ]
}

export default function LiveClassRoomPage() {
  const params = useParams()
  const roomId = params.roomId as string
  const router = useRouter()
  const myId = useRef('')
  
  const [room, setRoom] = useState<any>(null)
  const [participants, setParticipants] = useState<Participant[]>([])
  const [loading, setLoading] = useState(true)
  const [participantName, setParticipantName] = useState('')
  const [participantId, setParticipantId] = useState('')
  
  const [isAudioEnabled, setIsAudioEnabled] = useState(false)
  const [isVideoEnabled, setIsVideoEnabled] = useState(false)
  const [isHandRaised, setIsHandRaised] = useState(false)
  const [localStream, setLocalStream] = useState<MediaStream | null>(null)
  const [remoteStreams, setRemoteStreams] = useState<Map<string, MediaStream>>(new Map())
  const [teacherStream, setTeacherStream] = useState<MediaStream | null>(null)
  const [mediaError, setMediaError] = useState<string | null>(null)
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [showParticipants, setShowParticipants] = useState(true)
  
  const localVideoRef = useRef<HTMLVideoElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const localStreamRef = useRef<MediaStream | null>(null)
  const peerConnections = useRef<Map<string, RTCPeerConnection>>(new Map())
  const channelRef = useRef<any>(null)
  const pendingCandidates = useRef<Map<string, RTCIceCandidateInit[]>>(new Map())

  // Keep ref in sync
  useEffect(() => {
    localStreamRef.current = localStream
  }, [localStream])

  // Create peer connection for a remote user
  const createPeerConnection = useCallback((oderId: string): RTCPeerConnection => {
    console.log('Creating peer connection for:', oderId)
    
    // Close existing connection if any (but only if not working)
    const existing = peerConnections.current.get(oderId)
    if (existing) {
      if (existing.connectionState === 'connected') {
        console.log('Returning existing connected peer for:', oderId)
        return existing
      }
      existing.close()
      peerConnections.current.delete(oderId)
    }
    
    const pc = new RTCPeerConnection(ICE_SERVERS)
    
    // Add local tracks
    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach(track => {
        console.log('Adding track to peer:', track.kind)
        pc.addTrack(track, localStreamRef.current!)
      })
    }
    
    // Handle incoming tracks
    pc.ontrack = (event) => {
      console.log('Received track from:', oderId, event.track.kind)
      if (oderId.startsWith('teacher-')) {
        setTeacherStream(event.streams[0])
      } else {
        setRemoteStreams(prev => {
          const newMap = new Map(prev)
          newMap.set(oderId, event.streams[0])
          return newMap
        })
      }
    }
    
    // Handle ICE candidates
    pc.onicecandidate = (event) => {
      if (event.candidate) {
        channelRef.current?.send({
          type: 'broadcast',
          event: 'webrtc-ice',
          payload: { from: myId.current, to: oderId, candidate: event.candidate.toJSON() }
        })
      }
    }
    
    pc.oniceconnectionstatechange = () => {
      console.log('ICE state for', oderId, ':', pc.iceConnectionState)
      if (pc.iceConnectionState === 'failed') {
        pc.restartIce()
      }
    }
    
    pc.onconnectionstatechange = () => {
      console.log('Connection state for', oderId, ':', pc.connectionState)
      if (pc.connectionState === 'failed') {
        if (oderId.startsWith('teacher-')) {
          setTeacherStream(null)
        } else {
          setRemoteStreams(prev => {
            const newMap = new Map(prev)
            newMap.delete(oderId)
            return newMap
          })
        }
      }
    }
    
    peerConnections.current.set(oderId, pc)
    return pc
  }, [])

  // Handle incoming offer
  const handleOffer = useCallback(async (from: string, sdp: string) => {
    console.log('Received offer from:', from)
    
    // Check if we already have a stable connection
    const existingPc = peerConnections.current.get(from)
    if (existingPc && existingPc.signalingState === 'stable' && existingPc.connectionState === 'connected') {
      console.log('Already connected to:', from, 'ignoring offer')
      return
    }
    
    const pc = createPeerConnection(from)
    
    try {
      await pc.setRemoteDescription({ type: 'offer', sdp })
      
      const pending = pendingCandidates.current.get(from) || []
      for (const candidate of pending) {
        await pc.addIceCandidate(candidate)
      }
      pendingCandidates.current.delete(from)
      
      const answer = await pc.createAnswer()
      await pc.setLocalDescription(answer)
      
      console.log('Sending answer to:', from)
      channelRef.current?.send({
        type: 'broadcast',
        event: 'webrtc-answer',
        payload: { from: myId.current, to: from, sdp: answer.sdp }
      })
    } catch (err) {
      console.error('Error handling offer:', err)
    }
  }, [createPeerConnection])

  // Handle incoming answer
  const handleAnswer = useCallback(async (from: string, sdp: string) => {
    console.log('Received answer from:', from)
    const pc = peerConnections.current.get(from)
    
    if (!pc) {
      console.log('No peer connection for:', from)
      return
    }
    
    console.log('Signaling state:', pc.signalingState)
    
    if (pc.signalingState === 'have-local-offer') {
      try {
        await pc.setRemoteDescription({ type: 'answer', sdp })
        
        const pending = pendingCandidates.current.get(from) || []
        for (const candidate of pending) {
          await pc.addIceCandidate(candidate)
        }
        pendingCandidates.current.delete(from)
        console.log('Answer set successfully')
      } catch (err) {
        console.error('Error handling answer:', err)
      }
    } else if (pc.signalingState === 'stable') {
      console.log('Already stable, ignoring duplicate answer')
    }
  }, [])

  // Handle incoming ICE candidate
  const handleIceCandidate = useCallback(async (from: string, candidate: RTCIceCandidateInit) => {
    const pc = peerConnections.current.get(from)
    
    if (pc && pc.remoteDescription) {
      try {
        await pc.addIceCandidate(candidate)
      } catch (err) {
        console.error('Error adding ICE candidate:', err)
      }
    } else {
      const pending = pendingCandidates.current.get(from) || []
      pending.push(candidate)
      pendingCandidates.current.set(from, pending)
    }
  }, [])

  useEffect(() => {
    const name = localStorage.getItem('live_class_participant_name')
    const id = localStorage.getItem('live_class_participant_id')
    if (name) setParticipantName(name)
    if (id) {
      setParticipantId(id)
      myId.current = id
    }
    
    fetchRoomData()
    initMedia()
    
    return () => {
      localStreamRef.current?.getTracks().forEach(t => t.stop())
      peerConnections.current.forEach(pc => pc.close())
      peerConnections.current.clear()
      if (channelRef.current) {
        channelRef.current.send({
          type: 'broadcast',
          event: 'user-leave',
          payload: { oderId: myId.current }
        })
        supabase.removeChannel(channelRef.current)
      }
    }
  }, [])

  // Setup WebRTC signaling channel
  useEffect(() => {
    if (!roomId || !participantId) return

    const channel = supabase.channel(`webrtc-room-${roomId}`, {
      config: { broadcast: { self: false } }
    })
    
    channel
      .on('broadcast', { event: 'webrtc-offer' }, ({ payload }) => {
        if (payload.to === myId.current) {
          handleOffer(payload.from, payload.sdp)
        }
      })
      .on('broadcast', { event: 'webrtc-answer' }, ({ payload }) => {
        if (payload.to === myId.current) {
          handleAnswer(payload.from, payload.sdp)
        }
      })
      .on('broadcast', { event: 'webrtc-ice' }, ({ payload }) => {
        if (payload.to === myId.current) {
          handleIceCandidate(payload.from, payload.candidate)
        }
      })
      .on('broadcast', { event: 'teacher-ready' }, ({ payload }) => {
        console.log('Teacher is ready:', payload.oderId)
        // Check if we have a working connection to ANY teacher
        let hasWorkingTeacherConnection = false
        peerConnections.current.forEach((pc, id) => {
          if (id.startsWith('teacher-') && (pc.connectionState === 'connected' || pc.connectionState === 'connecting')) {
            hasWorkingTeacherConnection = true
          }
        })
        
        if (!hasWorkingTeacherConnection) {
          console.log('No working teacher connection, requesting connection')
          // Clear any old teacher connections
          peerConnections.current.forEach((pc, id) => {
            if (id.startsWith('teacher-')) {
              pc.close()
              peerConnections.current.delete(id)
            }
          })
          setTeacherStream(null)
          
          // Request connection from the new teacher
          channel.send({
            type: 'broadcast',
            event: 'request-connection',
            payload: { oderId: myId.current }
          })
        }
      })
      .on('broadcast', { event: 'teacher-leave' }, () => {
        console.log('Teacher left')
        setTeacherStream(null)
        // Clear teacher peer connection
        peerConnections.current.forEach((pc, id) => {
          if (id.startsWith('teacher-')) {
            pc.close()
            peerConnections.current.delete(id)
          }
        })
      })
      .on('broadcast', { event: 'class-end' }, () => {
        alert('The class has ended.')
        router.push('/live-class')
      })
      .on('broadcast', { event: 'video-toggle' }, ({ payload }) => {
        // Remote user toggled their video - force refresh
        console.log('Video toggle from:', payload.oderId, 'enabled:', payload.videoEnabled)
        if (payload.oderId.startsWith('teacher-')) {
          setTeacherStream(prev => prev ? new MediaStream(prev.getTracks()) : null)
        } else {
          setRemoteStreams(prev => new Map(prev))
        }
      })
      .subscribe((status) => {
        console.log('WebRTC channel status:', status)
        if (status === 'SUBSCRIBED') {
          // Announce presence to teacher
          channel.send({
            type: 'broadcast',
            event: 'user-join',
            payload: { oderId: myId.current }
          })
        }
      })
    
    channelRef.current = channel
    
    return () => {
      supabase.removeChannel(channel)
    }
  }, [roomId, participantId, handleOffer, handleAnswer, handleIceCandidate, router])

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
      }, (payload: any) => {
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
        // Replace video track with null in peer connections (keeps sender for later)
        peerConnections.current.forEach(pc => {
          const sender = pc.getSenders().find(s => s.track?.kind === 'video')
          if (sender) {
            sender.replaceTrack(null)
          }
        })
      }
      setIsVideoEnabled(false)
      if (participantId) {
        await supabase.from('live_class_participants').update({ is_video_enabled: false }).eq('id', participantId)
      }
      // Notify others that video is off
      channelRef.current?.send({
        type: 'broadcast',
        event: 'video-toggle',
        payload: { oderId: myId.current, videoEnabled: false }
      })
    } else {
      // Turn ON - get new video stream
      try {
        const videoStream = await navigator.mediaDevices.getUserMedia({ 
          video: { width: { ideal: 640 }, height: { ideal: 480 } } 
        })
        const videoTrack = videoStream.getVideoTracks()[0]
        
        if (localStream) {
          localStream.addTrack(videoTrack)
          // Add video track to peer connections
          peerConnections.current.forEach(pc => {
            // Find any video sender (even if track is null)
            const videoSender = pc.getSenders().find(s => s.track?.kind === 'video' || !s.track)
            if (videoSender && videoSender.track === null) {
              // Sender exists but has no track - replace with new track
              videoSender.replaceTrack(videoTrack)
            } else if (videoSender && videoSender.track?.kind === 'video') {
              // Sender has a video track - replace it
              videoSender.replaceTrack(videoTrack)
            } else {
              // No video sender - add new track
              pc.addTrack(videoTrack, localStream)
            }
          })
        } else {
          setLocalStream(videoStream)
        }
        setIsVideoEnabled(true)
        if (participantId) {
          await supabase.from('live_class_participants').update({ is_video_enabled: true }).eq('id', participantId)
        }
        // Notify others that video is on
        channelRef.current?.send({
          type: 'broadcast',
          event: 'video-toggle',
          payload: { oderId: myId.current, videoEnabled: true }
        })
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
    // Cleanup WebRTC
    peerConnections.current.forEach(pc => pc.close())
    peerConnections.current.clear()
    localStream?.getTracks().forEach(t => t.stop())
    
    // Announce leaving
    channelRef.current?.send({
      type: 'broadcast',
      event: 'user-leave',
      payload: { oderId: myId.current }
    })
    
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
            {/* Teacher Video */}
            <TeacherVideoTile stream={teacherStream} />

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

            {/* Other Students with remote streams */}
            {otherParticipants.map((p, i) => {
              const remoteStream = remoteStreams.get(p.id)
              return (
                <div key={p.id} className="bg-gray-800 rounded-xl overflow-hidden relative aspect-video">
                  {remoteStream ? (
                    <video 
                      ref={(el) => {
                        if (el && remoteStream) {
                          el.srcObject = remoteStream
                        }
                      }}
                      autoPlay 
                      playsInline 
                      className="w-full h-full object-cover" 
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <div className={`w-16 h-16 rounded-full bg-gradient-to-br ${getColor(i)} flex items-center justify-center text-white text-2xl font-bold`}>
                        {p.student_name[0].toUpperCase()}
                      </div>
                    </div>
                  )}
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
              )
            })}
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

// Teacher video tile with proper stream handling
function TeacherVideoTile({ stream }: { stream: MediaStream | null }) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const [showVideo, setShowVideo] = useState(false)

  useEffect(() => {
    const video = videoRef.current
    if (!video || !stream) {
      setShowVideo(false)
      return
    }

    video.srcObject = stream
    
    const checkVideoTracks = () => {
      const tracks = stream.getVideoTracks()
      const hasActiveTrack = tracks.length > 0 && tracks.some(t => {
        return t.enabled && t.readyState === 'live' && !t.muted
      })
      
      // Must have active track to show video
      if (!hasActiveTrack) {
        setShowVideo(false)
        return
      }
      
      // Also verify video element has actual dimensions
      const hasVideoDimensions = video.videoWidth > 0 && video.videoHeight > 0
      setShowVideo(hasActiveTrack && hasVideoDimensions)
    }
    
    setTimeout(checkVideoTracks, 100)
    
    const handlePlaying = () => setTimeout(checkVideoTracks, 50)
    const handleEnded = () => setShowVideo(false)
    const handleLoadedData = () => checkVideoTracks()
    const handleEmptied = () => setShowVideo(false)
    
    video.addEventListener('playing', handlePlaying)
    video.addEventListener('ended', handleEnded)
    video.addEventListener('loadeddata', handleLoadedData)
    video.addEventListener('emptied', handleEmptied)
    
    const handleTrackChange = () => setTimeout(checkVideoTracks, 50)
    stream.addEventListener('addtrack', handleTrackChange)
    stream.addEventListener('removetrack', handleTrackChange)
    
    stream.getVideoTracks().forEach(track => {
      track.onended = checkVideoTracks
      track.onmute = checkVideoTracks
      track.onunmute = checkVideoTracks
    })
    
    const interval = setInterval(checkVideoTracks, 300)
    
    return () => {
      clearInterval(interval)
      video.removeEventListener('playing', handlePlaying)
      video.removeEventListener('ended', handleEnded)
      video.removeEventListener('loadeddata', handleLoadedData)
      video.removeEventListener('emptied', handleEmptied)
      stream.removeEventListener('addtrack', handleTrackChange)
      stream.removeEventListener('removetrack', handleTrackChange)
      stream.getVideoTracks().forEach(track => {
        track.onended = null
        track.onmute = null
        track.onunmute = null
      })
    }
  }, [stream])

  return (
    <div className="bg-gray-800 rounded-xl overflow-hidden relative lg:col-span-2 aspect-video">
      <video 
        ref={videoRef} 
        autoPlay 
        playsInline 
        className={`w-full h-full object-cover ${showVideo ? '' : 'hidden'}`} 
      />
      {!showVideo && (
        <div className="w-full h-full flex flex-col items-center justify-center">
          <div className="w-32 h-32 rounded-full bg-gradient-to-br from-blue-600 to-cyan-600 flex items-center justify-center text-white text-5xl font-bold mb-4">
            T
          </div>
          <p className="text-white text-lg font-medium">Teacher</p>
          <p className="text-gray-400 text-sm">{stream ? 'Video paused' : 'Waiting for video...'}</p>
        </div>
      )}
      <div className="absolute bottom-4 left-4 px-3 py-1.5 bg-black/60 rounded-lg text-white text-sm flex items-center gap-2">
        <span className="text-yellow-400">👑</span>
        Teacher (Host)
      </div>
    </div>
  )
}
