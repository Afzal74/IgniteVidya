'use client'

import { useEffect, useState, useRef, useCallback } from 'react'
import { supabase } from '@/lib/supabase'
import { useRouter, useParams } from 'next/navigation'
import { Button } from '@/components/ui/button'
import {
  Users, Mic, MicOff, Video, VideoOff, PhoneOff, Hand,
  Maximize, Minimize, Copy, UserX, ScreenShare, ScreenShareOff, AlertCircle
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
    { urls: 'stun:stun3.l.google.com:19302' },
  ]
}

export default function TeacherLiveClassRoomPage() {
  const params = useParams()
  const roomId = params.roomId as string
  const router = useRouter()
  const myId = useRef(`teacher-${roomId}-${Date.now()}`)
  
  const [room, setRoom] = useState<any>(null)
  const [participants, setParticipants] = useState<Participant[]>([])
  const [loading, setLoading] = useState(true)
  
  const [isAudioEnabled, setIsAudioEnabled] = useState(false)
  const [isVideoEnabled, setIsVideoEnabled] = useState(false)
  const [isScreenSharing, setIsScreenSharing] = useState(false)
  const [localStream, setLocalStream] = useState<MediaStream | null>(null)
  const [screenStream, setScreenStream] = useState<MediaStream | null>(null)
  const [remoteStreams, setRemoteStreams] = useState<Map<string, MediaStream>>(new Map())
  const [mediaError, setMediaError] = useState<string | null>(null)
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [showParticipants, setShowParticipants] = useState(true)
  const [activeSpeaker, setActiveSpeaker] = useState<string | null>(null)
  const [speakingUsers, setSpeakingUsers] = useState<Set<string>>(new Set())

  const localVideoRef = useRef<HTMLVideoElement>(null)
  const audioContextRef = useRef<AudioContext | null>(null)
  const audioAnalyzersRef = useRef<Map<string, { analyzer: AnalyserNode; source: MediaStreamAudioSourceNode }>>(new Map())
  const containerRef = useRef<HTMLDivElement>(null)
  const peerConnections = useRef<Map<string, RTCPeerConnection>>(new Map())
  const localStreamRef = useRef<MediaStream | null>(null)
  const screenStreamRef = useRef<MediaStream | null>(null)
  const channelRef = useRef<any>(null)
  const pendingCandidates = useRef<Map<string, RTCIceCandidateInit[]>>(new Map())

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
    const stream = screenStreamRef.current || localStreamRef.current
    if (stream) {
      stream.getTracks().forEach(track => {
        console.log('Adding track to peer:', track.kind)
        pc.addTrack(track, stream)
      })
    }
    
    // Handle incoming tracks
    pc.ontrack = (event) => {
      console.log('Received track from:', oderId, event.track.kind)
      setRemoteStreams(prev => {
        const newMap = new Map(prev)
        newMap.set(oderId, event.streams[0])
        return newMap
      })
    }
    
    // Handle ICE candidates
    pc.onicecandidate = (event) => {
      if (event.candidate) {
        console.log('Sending ICE candidate to:', oderId)
        channelRef.current?.send({
          type: 'broadcast',
          event: 'webrtc-ice',
          payload: { from: myId.current, to: oderId, candidate: event.candidate.toJSON() }
        })
      }
    }
    
    pc.oniceconnectionstatechange = () => {
      console.log('ICE state for', oderId, ':', pc.iceConnectionState)
      if (pc.iceConnectionState === 'failed' || pc.iceConnectionState === 'disconnected') {
        // Try to restart ICE
        pc.restartIce()
      }
    }
    
    pc.onconnectionstatechange = () => {
      console.log('Connection state for', oderId, ':', pc.connectionState)
      if (pc.connectionState === 'failed') {
        setRemoteStreams(prev => {
          const newMap = new Map(prev)
          newMap.delete(oderId)
          return newMap
        })
      }
    }
    
    peerConnections.current.set(oderId, pc)
    return pc
  }, [])

  // Send offer to a peer
  const sendOffer = useCallback(async (oderId: string) => {
    // Check if we already have a working connection
    const existingPc = peerConnections.current.get(oderId)
    if (existingPc) {
      const state = existingPc.connectionState
      const sigState = existingPc.signalingState
      console.log('Existing connection for:', oderId, 'connection:', state, 'signaling:', sigState)
      
      // If connected or connecting, don't create new offer
      if (state === 'connected' || state === 'connecting' || sigState === 'have-local-offer') {
        console.log('Skipping offer - connection in progress or established')
        return
      }
      
      // Close failed/disconnected connection before creating new one
      if (state === 'failed' || state === 'disconnected' || state === 'closed') {
        existingPc.close()
        peerConnections.current.delete(oderId)
      }
    }
    
    console.log('Sending offer to:', oderId)
    const pc = createPeerConnection(oderId)
    
    try {
      const offer = await pc.createOffer({
        offerToReceiveAudio: true,
        offerToReceiveVideo: true
      })
      await pc.setLocalDescription(offer)
      
      channelRef.current?.send({
        type: 'broadcast',
        event: 'webrtc-offer',
        payload: { from: myId.current, to: oderId, sdp: offer.sdp }
      })
      console.log('Offer sent to:', oderId)
    } catch (err) {
      console.error('Error sending offer:', err)
    }
  }, [createPeerConnection])

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
      
      // Add any pending ICE candidates
      const pending = pendingCandidates.current.get(from) || []
      for (const candidate of pending) {
        await pc.addIceCandidate(candidate)
      }
      pendingCandidates.current.delete(from)
      
      const answer = await pc.createAnswer()
      await pc.setLocalDescription(answer)
      
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
    console.log('Received answer from:', from, 'current connections:', Array.from(peerConnections.current.keys()))
    const pc = peerConnections.current.get(from)
    
    if (!pc) {
      console.log('No peer connection found for:', from)
      return
    }
    
    console.log('Signaling state:', pc.signalingState)
    
    if (pc.signalingState === 'have-local-offer') {
      try {
        await pc.setRemoteDescription({ type: 'answer', sdp })
        
        // Add any pending ICE candidates
        const pending = pendingCandidates.current.get(from) || []
        for (const candidate of pending) {
          await pc.addIceCandidate(candidate)
        }
        pendingCandidates.current.delete(from)
        console.log('Answer set successfully for:', from)
      } catch (err) {
        console.error('Error handling answer:', err)
      }
    } else if (pc.signalingState === 'stable') {
      console.log('Connection already stable, ignoring duplicate answer from:', from)
    } else {
      console.log('Unexpected signaling state:', pc.signalingState, 'for:', from)
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
      // Store for later
      const pending = pendingCandidates.current.get(from) || []
      pending.push(candidate)
      pendingCandidates.current.set(from, pending)
    }
  }, [])

  // Initialize media
  const initMedia = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { width: { ideal: 640 }, height: { ideal: 480 } },
        audio: true
      })
      setLocalStream(stream)
      localStreamRef.current = stream
      setIsVideoEnabled(true)
      setIsAudioEnabled(true)
      
      if (localVideoRef.current) {
        localVideoRef.current.srcObject = stream
      }
      return stream
    } catch (err: any) {
      console.error('Media error:', err)
      setMediaError(err.name === 'NotReadableError' 
        ? 'Camera busy. Close other apps.' 
        : 'Could not access camera/mic')
      return null
    }
  }, [])

  // Setup WebRTC signaling
  useEffect(() => {
    if (!roomId) return

    const setup = async () => {
      await initMedia()
      
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
        .on('broadcast', { event: 'user-join' }, ({ payload }) => {
          console.log('User joined:', payload.oderId)
          // Don't send offer to ourselves
          if (payload.oderId === myId.current) return
          // Teacher sends offer to new user after a short delay
          setTimeout(() => sendOffer(payload.oderId), 500)
        })
        .on('broadcast', { event: 'user-leave' }, ({ payload }) => {
          console.log('User left:', payload.oderId)
          peerConnections.current.get(payload.oderId)?.close()
          peerConnections.current.delete(payload.oderId)
          setRemoteStreams(prev => {
            const newMap = new Map(prev)
            newMap.delete(payload.oderId)
            return newMap
          })
        })
        .on('broadcast', { event: 'request-connection' }, ({ payload }) => {
          // Student is requesting connection (e.g., after refresh)
          console.log('Connection requested by:', payload.oderId)
          if (payload.oderId === myId.current) return
          setTimeout(() => sendOffer(payload.oderId), 300)
        })
        .on('broadcast', { event: 'video-toggle' }, ({ payload }) => {
          // Remote user toggled their video - force refresh the stream display
          console.log('Video toggle from:', payload.oderId, 'enabled:', payload.videoEnabled)
          // Force re-render by creating new Map reference
          setRemoteStreams(prev => {
            const newMap = new Map(prev)
            return newMap
          })
        })
        .subscribe(async (status) => {
          console.log('Channel status:', status)
          if (status === 'SUBSCRIBED') {
            // Announce teacher presence
            channel.send({
              type: 'broadcast',
              event: 'teacher-ready',
              payload: { oderId: myId.current }
            })
            
            // Also fetch existing participants and try to connect to them
            // This handles the case when teacher refreshes
            const { data: existingParticipants } = await supabase
              .from('live_class_participants')
              .select('id')
              .eq('room_id', roomId)
              .is('left_at', null)
            
            if (existingParticipants && existingParticipants.length > 0) {
              console.log('Found existing participants:', existingParticipants.length)
              // Send offers to all existing participants after a short delay
              setTimeout(() => {
                existingParticipants.forEach(p => {
                  sendOffer(p.id)
                })
              }, 1000)
            }
            
            // Periodically announce presence for late joiners
            const announceInterval = setInterval(() => {
              channel.send({
                type: 'broadcast',
                event: 'teacher-ready',
                payload: { oderId: myId.current }
              })
            }, 5000)
            
            // Store interval for cleanup
            ;(channel as any)._announceInterval = announceInterval
          }
        })
      
      channelRef.current = channel
    }
    
    setup()
    fetchRoomData()
    
    return () => {
      // Cleanup
      peerConnections.current.forEach(pc => pc.close())
      peerConnections.current.clear()
      localStreamRef.current?.getTracks().forEach(t => t.stop())
      screenStreamRef.current?.getTracks().forEach(t => t.stop())
      if (channelRef.current) {
        // Clear announce interval
        if ((channelRef.current as any)._announceInterval) {
          clearInterval((channelRef.current as any)._announceInterval)
        }
        channelRef.current.send({
          type: 'broadcast',
          event: 'teacher-leave',
          payload: { oderId: myId.current }
        })
        supabase.removeChannel(channelRef.current)
      }
    }
  }, [roomId, initMedia, handleOffer, handleAnswer, handleIceCandidate, sendOffer])

  // Subscribe to participant DB changes
  useEffect(() => {
    if (!roomId) return
    const ch = supabase.channel(`db-${roomId}`)
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'live_class_participants',
        filter: `room_id=eq.${roomId}`
      }, () => fetchParticipants())
      .subscribe()
    return () => { supabase.removeChannel(ch) }
  }, [roomId])

  // Voice activity detection for local stream (teacher)
  useEffect(() => {
    if (!localStream || !isAudioEnabled) {
      setSpeakingUsers(prev => {
        const next = new Set(prev)
        next.delete('teacher')
        return next
      })
      return
    }

    if (!audioContextRef.current) {
      audioContextRef.current = new AudioContext()
    }
    const audioContext = audioContextRef.current

    const analyzer = audioContext.createAnalyser()
    analyzer.fftSize = 256
    analyzer.smoothingTimeConstant = 0.5
    
    const source = audioContext.createMediaStreamSource(localStream)
    source.connect(analyzer)
    
    const dataArray = new Uint8Array(analyzer.frequencyBinCount)
    let animationId: number
    
    const checkAudio = () => {
      analyzer.getByteFrequencyData(dataArray)
      const average = dataArray.reduce((a, b) => a + b, 0) / dataArray.length
      const isSpeaking = average > 15
      
      setSpeakingUsers(prev => {
        const next = new Set(prev)
        if (isSpeaking) {
          next.add('teacher')
          setActiveSpeaker('teacher')
        } else {
          next.delete('teacher')
        }
        return next
      })
      
      animationId = requestAnimationFrame(checkAudio)
    }
    checkAudio()
    
    return () => {
      cancelAnimationFrame(animationId)
      source.disconnect()
    }
  }, [localStream, isAudioEnabled])

  // Voice activity detection for remote streams
  useEffect(() => {
    if (!audioContextRef.current) {
      audioContextRef.current = new AudioContext()
    }
    const audioContext = audioContextRef.current
    
    // Clean up old analyzers for streams that no longer exist
    audioAnalyzersRef.current.forEach((value, oderId) => {
      if (!remoteStreams.has(oderId)) {
        value.source.disconnect()
        audioAnalyzersRef.current.delete(oderId)
      }
    })
    
    // Set up analyzers for new streams
    remoteStreams.forEach((stream, oderId) => {
      if (audioAnalyzersRef.current.has(oderId)) return
      
      const audioTracks = stream.getAudioTracks()
      if (audioTracks.length === 0) return
      
      try {
        const analyzer = audioContext.createAnalyser()
        analyzer.fftSize = 256
        analyzer.smoothingTimeConstant = 0.5
        
        const source = audioContext.createMediaStreamSource(stream)
        source.connect(analyzer)
        
        audioAnalyzersRef.current.set(oderId, { analyzer, source })
      } catch (e) {
        console.error('Error setting up audio analyzer for', oderId, e)
      }
    })
    
    // Check all remote streams for voice activity
    const dataArrays: Record<string, Uint8Array> = {}
    audioAnalyzersRef.current.forEach((value, oderId) => {
      dataArrays[oderId] = new Uint8Array(value.analyzer.frequencyBinCount)
    })
    
    let animationId: number
    const checkAllAudio = () => {
      let loudestUser: string | null = null
      let loudestLevel = 15 // Minimum threshold
      
      audioAnalyzersRef.current.forEach((value, oderId) => {
        const dataArray = dataArrays[oderId]
        if (!dataArray) return
        
        value.analyzer.getByteFrequencyData(dataArray as Uint8Array<ArrayBuffer>)
        const average = Array.from(dataArray).reduce((a, b) => a + b, 0) / dataArray.length
        
        setSpeakingUsers(prev => {
          const next = new Set(prev)
          if (average > 15) {
            next.add(oderId)
            if (average > loudestLevel) {
              loudestLevel = average
              loudestUser = oderId
            }
          } else {
            next.delete(oderId)
          }
          return next
        })
      })
      
      if (loudestUser) {
        setActiveSpeaker(loudestUser)
      }
      
      animationId = requestAnimationFrame(checkAllAudio)
    }
    
    if (audioAnalyzersRef.current.size > 0) {
      checkAllAudio()
    }
    
    return () => {
      cancelAnimationFrame(animationId)
    }
  }, [remoteStreams])

  const fetchRoomData = async () => {
    const { data } = await supabase.from('live_class_rooms').select('*').eq('id', roomId).single()
    if (data) { setRoom(data); fetchParticipants() }
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

  const toggleAudio = () => {
    if (localStreamRef.current) {
      const enabled = !isAudioEnabled
      localStreamRef.current.getAudioTracks().forEach(t => { t.enabled = enabled })
      setIsAudioEnabled(enabled)
    }
  }

  const toggleVideo = async () => {
    if (isVideoEnabled && localStreamRef.current) {
      // Stop and remove video tracks
      localStreamRef.current.getVideoTracks().forEach(t => { 
        t.stop()
        localStreamRef.current?.removeTrack(t) 
      })
      // Replace with null in peer connections (keeps sender for later)
      peerConnections.current.forEach(pc => {
        const sender = pc.getSenders().find(s => s.track?.kind === 'video')
        if (sender) sender.replaceTrack(null)
      })
      setIsVideoEnabled(false)
      // Notify others
      channelRef.current?.send({
        type: 'broadcast',
        event: 'video-toggle',
        payload: { oderId: myId.current, videoEnabled: false }
      })
    } else {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true })
        const track = stream.getVideoTracks()[0]
        localStreamRef.current?.addTrack(track)
        setLocalStream(localStreamRef.current)
        setIsVideoEnabled(true)
        // Update track in all peer connections
        peerConnections.current.forEach(pc => {
          // Find video sender (even if track is null)
          const sender = pc.getSenders().find(s => s.track?.kind === 'video' || (s.track === null))
          if (sender) {
            sender.replaceTrack(track)
          } else {
            pc.addTrack(track, localStreamRef.current!)
          }
        })
        // Notify others
        channelRef.current?.send({
          type: 'broadcast',
          event: 'video-toggle',
          payload: { oderId: myId.current, videoEnabled: true }
        })
      } catch (e) {
        setMediaError('Could not enable camera')
      }
    }
  }

  const toggleScreenShare = async () => {
    if (!isScreenSharing) {
      try {
        const stream = await navigator.mediaDevices.getDisplayMedia({ video: true })
        setScreenStream(stream)
        screenStreamRef.current = stream
        setIsScreenSharing(true)
        
        const screenTrack = stream.getVideoTracks()[0]
        // Replace video track in all connections
        peerConnections.current.forEach(pc => {
          const sender = pc.getSenders().find(s => s.track?.kind === 'video')
          if (sender) sender.replaceTrack(screenTrack)
        })
        
        screenTrack.onended = () => {
          setScreenStream(null)
          screenStreamRef.current = null
          setIsScreenSharing(false)
          // Restore camera
          const camTrack = localStreamRef.current?.getVideoTracks()[0]
          if (camTrack) {
            peerConnections.current.forEach(pc => {
              const sender = pc.getSenders().find(s => s.track?.kind === 'video')
              if (sender) sender.replaceTrack(camTrack)
            })
          }
        }
      } catch (e) {
        console.error('Screen share error:', e)
      }
    } else {
      screenStreamRef.current?.getTracks().forEach(t => t.stop())
      setScreenStream(null)
      screenStreamRef.current = null
      setIsScreenSharing(false)
      const camTrack = localStreamRef.current?.getVideoTracks()[0]
      if (camTrack) {
        peerConnections.current.forEach(pc => {
          const sender = pc.getSenders().find(s => s.track?.kind === 'video')
          if (sender) sender.replaceTrack(camTrack)
        })
      }
    }
  }

  const endClass = async () => {
    if (!confirm('End class?')) return
    channelRef.current?.send({ type: 'broadcast', event: 'class-end', payload: {} })
    peerConnections.current.forEach(pc => pc.close())
    localStreamRef.current?.getTracks().forEach(t => t.stop())
    screenStreamRef.current?.getTracks().forEach(t => t.stop())
    await supabase.from('live_class_rooms').update({ status: 'ended', ended_at: new Date().toISOString() }).eq('id', roomId)
    router.push('/teacher/live-class')
  }

  const removeParticipant = async (id: string) => {
    await supabase.from('live_class_participants').update({ left_at: new Date().toISOString() }).eq('id', id)
  }

  const lowerHand = async (id: string) => {
    await supabase.from('live_class_participants').update({ is_hand_raised: false }).eq('id', id)
  }

  const copyCode = () => room && navigator.clipboard.writeText(room.room_code)
  const toggleFullscreen = () => {
    if (!document.fullscreenElement) { containerRef.current?.requestFullscreen(); setIsFullscreen(true) }
    else { document.exitFullscreen(); setIsFullscreen(false) }
  }

  const getColor = (i: number) => ['from-blue-500 to-cyan-500', 'from-purple-500 to-pink-500', 'from-green-500 to-emerald-500', 'from-orange-500 to-red-500'][i % 4]
  const raisedHands = participants.filter(p => p.is_hand_raised)

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-[#0f0f23]" style={{ fontFamily: '"Press Start 2P", cursive' }}>
      <div className="text-center bg-[#1a1a3e] border-4 border-[#00ff41] p-8">
        <div className="text-4xl mb-4 animate-pulse">📡</div>
        <p className="text-xs text-[#00ff41]">CONNECTING...</p>
      </div>
    </div>
  )
  if (!room) return (
    <div className="min-h-screen flex items-center justify-center bg-[#0f0f23]" style={{ fontFamily: '"Press Start 2P", cursive' }}>
      <div className="text-center bg-[#1a1a3e] border-4 border-[#ff0000] p-8">
        <div className="text-4xl mb-4">❌</div>
        <p className="text-xs text-[#ff0000]">CLASS NOT FOUND</p>
      </div>
    </div>
  )

  // Build video grid - use streamId as part of key to force re-render on stream change
  const teacherStreamId = (isScreenSharing ? screenStream?.id : localStream?.id) || 'no-stream'
  const allVideos: Array<{ id: string; name: string; stream: MediaStream | null; isLocal: boolean; isTeacher: boolean; isHandRaised?: boolean; streamKey: string; isSpeaking: boolean; isActiveSpeaker: boolean }> = [
    { id: 'teacher', name: 'You (Host)', stream: isScreenSharing ? screenStream : localStream, isLocal: true, isTeacher: true, isHandRaised: false, streamKey: `teacher-${teacherStreamId}`, isSpeaking: speakingUsers.has('teacher'), isActiveSpeaker: activeSpeaker === 'teacher' },
    ...Array.from(remoteStreams.entries()).map(([oderId, stream]) => {
      const p = participants.find(x => x.id === oderId)
      return { id: oderId, name: p?.student_name || 'Student', stream, isLocal: false, isTeacher: false, isHandRaised: p?.is_hand_raised, streamKey: `${oderId}-${stream?.id || 'no-stream'}`, isSpeaking: speakingUsers.has(oderId), isActiveSpeaker: activeSpeaker === oderId }
    })
  ]
  
  // Sort to put active speaker first (if not teacher)
  const sortedVideos = [...allVideos].sort((a, b) => {
    if (a.isActiveSpeaker && !a.isTeacher) return -1
    if (b.isActiveSpeaker && !b.isTeacher) return 1
    if (a.isTeacher) return -1
    if (b.isTeacher) return 1
    return 0
  })

  return (
    <div ref={containerRef} className="h-screen pt-16 bg-[#0f0f23] flex flex-col relative overflow-hidden" style={{ fontFamily: '"Press Start 2P", cursive' }}>
      {/* Pixel Grid Background */}
      <div className="fixed inset-0 top-16 opacity-5 pointer-events-none" style={{
        backgroundImage: `linear-gradient(0deg, transparent 24%, rgba(0, 255, 65, .1) 25%, rgba(0, 255, 65, .1) 26%, transparent 27%, transparent 74%, rgba(0, 255, 65, .1) 75%, rgba(0, 255, 65, .1) 76%, transparent 77%, transparent),
        linear-gradient(90deg, transparent 24%, rgba(0, 255, 65, .1) 25%, rgba(0, 255, 65, .1) 26%, transparent 27%, transparent 74%, rgba(0, 255, 65, .1) 75%, rgba(0, 255, 65, .1) 76%, transparent 77%, transparent)`,
        backgroundSize: '50px 50px'
      }} />
      
      {/* Header - Compact */}
      <div className="bg-[#1a1a3e] border-b-2 border-[#00ff41] px-3 py-1.5 flex items-center justify-between relative z-10 flex-shrink-0">
        <div className="flex items-center gap-2">
          <h1 className="text-[#00ff41] text-[8px] sm:text-[10px] font-bold truncate max-w-[150px]">{room.room_name}</h1>
          <span className="px-1 py-0.5 bg-[#ff0000] border border-[#ff0000] text-white text-[6px] animate-pulse">● LIVE</span>
          <button onClick={copyCode} className="flex items-center gap-1 bg-[#0f0f23] border border-[#00d4ff] px-1.5 py-0.5 text-[#00d4ff] text-[6px] hover:bg-[#00d4ff] hover:text-[#0f0f23] transition-colors">
            <Copy className="h-2 w-2" />{room.room_code}
          </button>
        </div>
        <div className="flex items-center gap-1">
          {raisedHands.length > 0 && <div className="px-1 py-0.5 bg-[#ff00ff] border border-[#ff00ff] text-white text-[6px] animate-pulse"><Hand className="h-2 w-2 inline mr-0.5" />{raisedHands.length}</div>}
          <button onClick={() => setShowParticipants(!showParticipants)} className="flex items-center gap-0.5 bg-[#0f0f23] border border-[#00d4ff] px-1.5 py-0.5 text-[#00d4ff] text-[6px] hover:bg-[#00d4ff] hover:text-[#0f0f23] transition-colors">
            <Users className="h-2 w-2" />{participants.length}
          </button>
          <button onClick={toggleFullscreen} className="bg-[#0f0f23] border border-[#00d4ff] p-0.5 text-[#00d4ff] hover:bg-[#00d4ff] hover:text-[#0f0f23] transition-colors">
            {isFullscreen ? <Minimize className="h-2 w-2" /> : <Maximize className="h-2 w-2" />}
          </button>
        </div>
      </div>

      {mediaError && (
        <div className="bg-[#1a1a3e] border-b-2 border-[#ff00ff] px-3 py-1 flex items-center gap-2 text-[#ff00ff] text-[8px] relative z-10 flex-shrink-0">
          <AlertCircle className="h-3 w-3" />{mediaError}
        </div>
      )}

      <div className="flex-1 flex overflow-hidden relative z-10">
        {/* Main Layout: Mobile = column, Desktop = row with students on left */}
        <div className="flex-1 p-2 flex flex-col md:flex-row gap-2">
          {/* Host (Teacher) - Large video - Shows first on mobile */}
          <div className="flex-1 flex items-center justify-center order-1 md:order-2">
            {sortedVideos.filter(v => v.isTeacher).map((v) => (
              <HostVideoTile 
                key={v.streamKey} 
                stream={v.stream} 
                name={v.name} 
                isLocal={v.isLocal}
                isSpeaking={v.isSpeaking}
                isActiveSpeaker={v.isActiveSpeaker}
              />
            ))}
          </div>
          
          {/* Students - Below on mobile, left column on desktop */}
          {sortedVideos.filter(v => !v.isTeacher).length > 0 && (
            <div className="flex flex-row md:flex-col gap-2 w-full md:w-32 lg:w-40 flex-shrink-0 order-2 md:order-1 overflow-x-auto md:overflow-x-visible pb-1 md:pb-0">
              {sortedVideos.filter(v => !v.isTeacher).map((v, i) => (
                <StudentThumbnail 
                  key={v.streamKey} 
                  stream={v.stream} 
                  name={v.name} 
                  colorIndex={i} 
                  isHandRaised={v.isHandRaised}
                  isSpeaking={v.isSpeaking}
                  isActiveSpeaker={v.isActiveSpeaker}
                  onRemove={() => removeParticipant(v.id)}
                />
              ))}
            </div>
          )}
        </div>

        {/* Participants Sidebar - Hidden on mobile */}
        <AnimatePresence>
          {showParticipants && (
            <motion.div initial={{ width: 0 }} animate={{ width: 200 }} exit={{ width: 0 }} className="hidden md:block bg-[#1a1a3e] border-l-4 border-[#00d4ff] overflow-hidden">
              <div className="p-2 h-full flex flex-col w-[200px]">
                <h3 className="text-[#00ff41] text-[8px] font-bold mb-2"><Users className="h-3 w-3 inline mr-1" />STUDENTS ({participants.length})</h3>
                {raisedHands.length > 0 && (
                  <div className="mb-2">
                    <h4 className="text-[#ff00ff] text-[6px] mb-1"><Hand className="h-2 w-2 inline mr-1" />HANDS UP</h4>
                    {raisedHands.map((p) => (
                      <div key={p.id} className="p-1 bg-[#0f0f23] border border-[#ff00ff] flex items-center justify-between mb-1">
                        <span className="text-[#ff00ff] text-[6px] truncate">{p.student_name}</span>
                        <button onClick={() => lowerHand(p.id)} className="text-[#ff00ff] hover:text-white"><Hand className="h-2 w-2" /></button>
                      </div>
                    ))}
                  </div>
                )}
                <div className="flex-1 overflow-y-auto space-y-1">
                  {participants.map((p, idx) => (
                    <div key={p.id} className={`p-1 bg-[#0f0f23] border border-[#00d4ff] flex items-center justify-between group ${speakingUsers.has(p.id) ? 'border-[#00ff41] shadow-[0_0_5px_#00ff41]' : ''}`}>
                      <div className="flex items-center gap-1 flex-1 min-w-0">
                        <div className="w-5 h-5 bg-[#1a1a3e] border border-[#ff00ff] flex items-center justify-center text-[#ff00ff] text-[6px] font-bold flex-shrink-0">{p.student_name[0]}</div>
                        <div className="min-w-0 flex-1">
                          <p className="text-[#00ff41] text-[6px] truncate">{p.student_name}</p>
                          <div className="flex gap-1">
                            {p.is_audio_enabled ? <Mic className="h-2 w-2 text-[#00ff41]" /> : <MicOff className="h-2 w-2 text-[#444]" />}
                            {p.is_video_enabled ? <Video className="h-2 w-2 text-[#00ff41]" /> : <VideoOff className="h-2 w-2 text-[#444]" />}
                            {speakingUsers.has(p.id) && <span className="text-[5px] text-[#ffff00]">🔊</span>}
                          </div>
                        </div>
                      </div>
                      <button onClick={() => removeParticipant(p.id)} className="opacity-0 group-hover:opacity-100 text-[#ff0000] flex-shrink-0"><UserX className="h-3 w-3" /></button>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Control Bar - Mobile responsive */}
      <div className="bg-[#1a1a3e] border-t-2 md:border-t-4 border-[#00ff41] px-2 md:px-4 py-1.5 md:py-2 relative z-10 flex-shrink-0">
        <div className="flex items-center justify-center gap-1.5 md:gap-2">
          <button onClick={toggleAudio} className={`w-9 h-9 md:w-10 md:h-10 border-2 flex items-center justify-center transition-colors ${isAudioEnabled ? 'bg-[#0f0f23] border-[#00ff41] text-[#00ff41] hover:bg-[#00ff41] hover:text-[#0f0f23]' : 'bg-[#ff0000] border-[#ff0000] text-white'}`}>
            {isAudioEnabled ? <Mic className="h-3.5 w-3.5 md:h-4 md:w-4" /> : <MicOff className="h-3.5 w-3.5 md:h-4 md:w-4" />}
          </button>
          <button onClick={toggleVideo} className={`w-9 h-9 md:w-10 md:h-10 border-2 flex items-center justify-center transition-colors ${isVideoEnabled ? 'bg-[#0f0f23] border-[#00ff41] text-[#00ff41] hover:bg-[#00ff41] hover:text-[#0f0f23]' : 'bg-[#ff0000] border-[#ff0000] text-white'}`}>
            {isVideoEnabled ? <Video className="h-3.5 w-3.5 md:h-4 md:w-4" /> : <VideoOff className="h-3.5 w-3.5 md:h-4 md:w-4" />}
          </button>
          <button onClick={toggleScreenShare} className={`hidden md:flex w-10 h-10 border-2 items-center justify-center transition-colors ${isScreenSharing ? 'bg-[#00d4ff] border-[#00d4ff] text-[#0f0f23]' : 'bg-[#0f0f23] border-[#00d4ff] text-[#00d4ff] hover:bg-[#00d4ff] hover:text-[#0f0f23]'}`}>
            {isScreenSharing ? <ScreenShareOff className="h-4 w-4" /> : <ScreenShare className="h-4 w-4" />}
          </button>
          <div className="w-0.5 h-5 md:h-6 bg-[#00ff41] mx-0.5 md:mx-1" />
          <button onClick={endClass} className="px-2 md:px-3 h-9 md:h-10 bg-[#ff0000] border-2 border-[#ff0000] text-white text-[7px] md:text-[8px] font-bold flex items-center gap-0.5 md:gap-1 hover:bg-[#0f0f23] hover:text-[#ff0000] transition-colors">
            <PhoneOff className="h-3.5 w-3.5 md:h-4 md:w-4" />END
          </button>
        </div>
      </div>
    </div>
  )
}

function VideoTile({ stream, name, isLocal, colorIndex, isTeacher, isHandRaised, isSpeaking, isActiveSpeaker }: {
  stream: MediaStream | null
  name: string
  isLocal: boolean
  colorIndex: number
  isTeacher?: boolean
  isHandRaised?: boolean
  isSpeaking?: boolean
  isActiveSpeaker?: boolean
}) {
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
      
      if (!hasActiveTrack) {
        setShowVideo(false)
        return
      }
      
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

  const pixelColors = ['border-[#00d4ff]', 'border-[#ff00ff]', 'border-[#00ff41]', 'border-[#ff6600]']
  const avatarColors = ['bg-[#00d4ff]', 'bg-[#ff00ff]', 'bg-[#00ff41]', 'bg-[#ff6600]']
  
  // Active speaker gets special styling
  const speakingBorder = isActiveSpeaker ? 'border-[#ffff00] shadow-[0_0_20px_#ffff00,0_0_40px_#ffff00]' : isSpeaking ? 'border-[#00ff41] shadow-[0_0_10px_#00ff41]' : pixelColors[colorIndex % 4]
  const speakingScale = isActiveSpeaker ? 'col-span-2 row-span-2' : ''

  return (
    <div className={`bg-[#1a1a3e] border-4 ${speakingBorder} overflow-hidden relative aspect-video transition-all duration-300 ${speakingScale}`} style={{ imageRendering: 'auto' }}>
      <video 
        ref={videoRef} 
        autoPlay 
        playsInline 
        muted={isLocal} 
        className={`w-full h-full object-cover ${showVideo ? '' : 'hidden'}`} 
      />
      {!showVideo && (
        <div className="w-full h-full flex items-center justify-center bg-[#0f0f23]">
          <div className={`w-16 h-16 sm:w-20 sm:h-20 ${avatarColors[colorIndex % 4]} border-4 border-[#1a1a3e] flex items-center justify-center text-[#0f0f23] text-2xl sm:text-3xl font-bold ${isSpeaking ? 'animate-pulse' : ''}`}>
            {name[0]?.toUpperCase() || '?'}
          </div>
        </div>
      )}
      {/* Speaking indicator */}
      {isSpeaking && (
        <div className="absolute top-2 left-2 flex items-center gap-1">
          <div className="flex gap-0.5">
            <div className="w-1 h-3 bg-[#00ff41] animate-pulse" style={{ animationDelay: '0ms' }} />
            <div className="w-1 h-4 bg-[#00ff41] animate-pulse" style={{ animationDelay: '150ms' }} />
            <div className="w-1 h-2 bg-[#00ff41] animate-pulse" style={{ animationDelay: '300ms' }} />
            <div className="w-1 h-5 bg-[#00ff41] animate-pulse" style={{ animationDelay: '100ms' }} />
          </div>
          {isActiveSpeaker && <span className="text-[8px] text-[#ffff00] ml-1">SPEAKING</span>}
        </div>
      )}
      <div className="absolute bottom-2 left-2 px-2 py-1 bg-[#0f0f23] border-2 border-[#00ff41] text-[#00ff41] text-[8px] sm:text-[10px] flex items-center gap-1">
        {isTeacher && <span>👑</span>}{name}
      </div>
      {isHandRaised && (
        <div className="absolute top-2 right-2 w-8 h-8 bg-[#ff00ff] border-2 border-[#ff00ff] flex items-center justify-center animate-bounce">
          <Hand className="h-4 w-4 text-white" />
        </div>
      )}
    </div>
  )
}

// Large Host Video Tile (center of screen)
function HostVideoTile({ stream, name, isLocal, isSpeaking, isActiveSpeaker }: {
  stream: MediaStream | null
  name: string
  isLocal: boolean
  isSpeaking?: boolean
  isActiveSpeaker?: boolean
}) {
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
      const hasActiveTrack = tracks.length > 0 && tracks.some(t => t.enabled && t.readyState === 'live' && !t.muted)
      const hasVideoDimensions = video.videoWidth > 0 && video.videoHeight > 0
      setShowVideo(hasActiveTrack && hasVideoDimensions)
    }
    
    setTimeout(checkVideoTracks, 100)
    video.addEventListener('playing', () => setTimeout(checkVideoTracks, 50))
    video.addEventListener('loadeddata', checkVideoTracks)
    const interval = setInterval(checkVideoTracks, 300)
    
    return () => clearInterval(interval)
  }, [stream])

  return (
    <div className={`w-full max-w-4xl aspect-video bg-[#1a1a3e] border-2 md:border-4 ${isSpeaking ? 'border-[#00ff41] shadow-[0_0_20px_#00ff41]' : 'border-[#ffff00]'} overflow-hidden relative transition-all duration-300`}>
      <video 
        ref={videoRef} 
        autoPlay 
        playsInline 
        muted={isLocal} 
        className={`w-full h-full object-cover ${showVideo ? '' : 'hidden'}`} 
      />
      {!showVideo && (
        <div className="w-full h-full flex flex-col items-center justify-center bg-[#0f0f23]">
          <div className={`w-16 h-16 md:w-24 md:h-24 bg-[#ffff00] border-2 md:border-4 border-[#1a1a3e] flex items-center justify-center text-[#0f0f23] text-2xl md:text-4xl font-bold ${isSpeaking ? 'animate-pulse' : ''}`}>
            👑
          </div>
          <p className="text-[#ffff00] text-xs md:text-sm mt-2 md:mt-4">{name}</p>
        </div>
      )}
      {/* Speaking indicator */}
      {isSpeaking && (
        <div className="absolute top-2 md:top-3 left-2 md:left-3 flex items-center gap-1 md:gap-2 bg-[#0f0f23]/80 px-1.5 md:px-2 py-0.5 md:py-1 border border-[#00ff41]">
          <div className="flex gap-0.5">
            <div className="w-0.5 md:w-1 h-3 md:h-4 bg-[#00ff41] animate-pulse" style={{ animationDelay: '0ms' }} />
            <div className="w-0.5 md:w-1 h-4 md:h-6 bg-[#00ff41] animate-pulse" style={{ animationDelay: '150ms' }} />
            <div className="w-0.5 md:w-1 h-2 md:h-3 bg-[#00ff41] animate-pulse" style={{ animationDelay: '300ms' }} />
            <div className="w-0.5 md:w-1 h-3 md:h-5 bg-[#00ff41] animate-pulse" style={{ animationDelay: '100ms' }} />
          </div>
          <span className="text-[6px] md:text-[8px] text-[#00ff41]">LIVE</span>
        </div>
      )}
      <div className="absolute bottom-2 md:bottom-3 left-2 md:left-3 px-2 md:px-3 py-0.5 md:py-1 bg-[#0f0f23] border md:border-2 border-[#ffff00] text-[#ffff00] text-[8px] md:text-[10px] flex items-center gap-1 md:gap-2">
        <span>👑</span>{name}
      </div>
    </div>
  )
}

// Small Student Thumbnail (top strip)
function StudentThumbnail({ stream, name, colorIndex, isHandRaised, isSpeaking, isActiveSpeaker, onRemove }: {
  stream: MediaStream | null
  name: string
  colorIndex: number
  isHandRaised?: boolean
  isSpeaking?: boolean
  isActiveSpeaker?: boolean
  onRemove: () => void
}) {
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
      const hasActiveTrack = tracks.length > 0 && tracks.some(t => t.enabled && t.readyState === 'live' && !t.muted)
      const hasVideoDimensions = video.videoWidth > 0 && video.videoHeight > 0
      setShowVideo(hasActiveTrack && hasVideoDimensions)
    }
    
    setTimeout(checkVideoTracks, 100)
    video.addEventListener('playing', () => setTimeout(checkVideoTracks, 50))
    video.addEventListener('loadeddata', checkVideoTracks)
    const interval = setInterval(checkVideoTracks, 300)
    
    return () => clearInterval(interval)
  }, [stream])

  const pixelColors = ['border-[#00d4ff]', 'border-[#ff00ff]', 'border-[#00ff41]', 'border-[#ff6600]']
  const avatarColors = ['bg-[#00d4ff]', 'bg-[#ff00ff]', 'bg-[#00ff41]', 'bg-[#ff6600]']
  const borderColor = isActiveSpeaker ? 'border-[#ffff00] shadow-[0_0_10px_#ffff00]' : isSpeaking ? 'border-[#00ff41] shadow-[0_0_5px_#00ff41]' : pixelColors[colorIndex % 4]

  return (
    <div className={`relative w-24 md:w-full aspect-video flex-shrink-0 bg-[#1a1a3e] border-2 ${borderColor} overflow-hidden group transition-all duration-200`}>
      <video 
        ref={videoRef} 
        autoPlay 
        playsInline 
        className={`w-full h-full object-cover ${showVideo ? '' : 'hidden'}`} 
      />
      {!showVideo && (
        <div className="w-full h-full flex items-center justify-center bg-[#0f0f23]">
          <div className={`w-8 h-8 md:w-12 md:h-12 ${avatarColors[colorIndex % 4]} border-2 border-[#1a1a3e] flex items-center justify-center text-[#0f0f23] text-sm md:text-lg font-bold ${isSpeaking ? 'animate-pulse' : ''}`}>
            {name[0]?.toUpperCase() || '?'}
          </div>
        </div>
      )}
      {/* Speaking indicator */}
      {isSpeaking && (
        <div className="absolute top-0.5 md:top-1 left-0.5 md:left-1 flex gap-0.5">
          <div className="w-0.5 md:w-1 h-2 md:h-3 bg-[#00ff41] animate-pulse" />
          <div className="w-0.5 md:w-1 h-3 md:h-4 bg-[#00ff41] animate-pulse" style={{ animationDelay: '100ms' }} />
          <div className="w-0.5 md:w-1 h-1.5 md:h-2 bg-[#00ff41] animate-pulse" style={{ animationDelay: '200ms' }} />
        </div>
      )}
      {/* Name label */}
      <div className="absolute bottom-0 left-0 right-0 px-1 py-0.5 bg-[#0f0f23]/80 text-[6px] md:text-[8px] text-[#00ff41] truncate">
        {name}
      </div>
      {/* Hand raised */}
      {isHandRaised && (
        <div className="absolute top-0.5 md:top-1 right-0.5 md:right-1 w-4 md:w-5 h-4 md:h-5 bg-[#ff00ff] flex items-center justify-center animate-bounce">
          <Hand className="h-2 md:h-3 w-2 md:w-3 text-white" />
        </div>
      )}
      {/* Remove button on hover - desktop only */}
      <button 
        onClick={onRemove}
        className="absolute top-0.5 right-0.5 w-4 h-4 bg-[#ff0000] items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hidden md:group-hover:flex"
      >
        <UserX className="h-2 w-2 text-white" />
      </button>
    </div>
  )
}
