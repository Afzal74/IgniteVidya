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

  const localVideoRef = useRef<HTMLVideoElement>(null)
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

  if (loading) return <div className="min-h-screen flex items-center justify-center bg-gray-900"><div className="h-12 w-12 animate-spin rounded-full border-4 border-blue-500 border-t-transparent" /></div>
  if (!room) return <div className="min-h-screen flex items-center justify-center bg-gray-900"><p className="text-zinc-400">Class not found</p></div>

  // Build video grid - use streamId as part of key to force re-render on stream change
  const teacherStreamId = (isScreenSharing ? screenStream?.id : localStream?.id) || 'no-stream'
  const allVideos: Array<{ id: string; name: string; stream: MediaStream | null; isLocal: boolean; isTeacher: boolean; isHandRaised?: boolean; streamKey: string }> = [
    { id: 'teacher', name: 'You (Host)', stream: isScreenSharing ? screenStream : localStream, isLocal: true, isTeacher: true, isHandRaised: false, streamKey: `teacher-${teacherStreamId}` },
    ...Array.from(remoteStreams.entries()).map(([oderId, stream]) => {
      const p = participants.find(x => x.id === oderId)
      return { id: oderId, name: p?.student_name || 'Student', stream, isLocal: false, isTeacher: false, isHandRaised: p?.is_hand_raised, streamKey: `${oderId}-${stream?.id || 'no-stream'}` }
    })
  ]

  return (
    <div ref={containerRef} className="min-h-screen bg-gray-900 flex flex-col">
      <div className="bg-gray-800 border-b border-gray-700 px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <h1 className="text-white font-semibold">{room.room_name}</h1>
          <span className="px-2 py-1 rounded bg-red-500/20 text-red-400 text-xs animate-pulse">● LIVE</span>
          <Button variant="ghost" size="sm" onClick={copyCode} className="text-gray-400 hover:text-white">
            <Copy className="h-4 w-4 mr-2" />{room.room_code}
          </Button>
        </div>
        <div className="flex items-center gap-2">
          {raisedHands.length > 0 && <div className="px-3 py-1 rounded-full bg-yellow-500/20 text-yellow-400 text-sm animate-pulse"><Hand className="h-4 w-4 inline mr-2" />{raisedHands.length}</div>}
          <Button variant="ghost" size="sm" onClick={() => setShowParticipants(!showParticipants)} className="text-gray-400 hover:text-white">
            <Users className="h-4 w-4 mr-2" />{participants.length}
          </Button>
          <Button variant="ghost" size="sm" onClick={toggleFullscreen} className="text-gray-400 hover:text-white">
            {isFullscreen ? <Minimize className="h-4 w-4" /> : <Maximize className="h-4 w-4" />}
          </Button>
        </div>
      </div>

      {mediaError && (
        <div className="bg-yellow-500/20 border-b border-yellow-500/30 px-4 py-2 flex items-center gap-2 text-yellow-400 text-sm">
          <AlertCircle className="h-4 w-4" />{mediaError}
        </div>
      )}

      <div className="flex-1 flex overflow-hidden">
        <div className="flex-1 p-4">
          <div className={`grid gap-2 h-full ${allVideos.length <= 1 ? 'grid-cols-1' : allVideos.length <= 2 ? 'grid-cols-2' : allVideos.length <= 4 ? 'grid-cols-2' : 'grid-cols-3'}`}>
            {allVideos.map((v, i) => (
              <VideoTile key={v.streamKey} stream={v.stream} name={v.name} isLocal={v.isLocal} colorIndex={i} isTeacher={v.isTeacher} isHandRaised={v.isHandRaised} />
            ))}
          </div>
        </div>

        <AnimatePresence>
          {showParticipants && (
            <motion.div initial={{ width: 0 }} animate={{ width: 280 }} exit={{ width: 0 }} className="bg-gray-800 border-l border-gray-700 overflow-hidden">
              <div className="p-4 h-full flex flex-col w-[280px]">
                <h3 className="text-white font-semibold mb-4"><Users className="h-4 w-4 inline mr-2" />Participants ({participants.length})</h3>
                {raisedHands.length > 0 && (
                  <div className="mb-4">
                    <h4 className="text-yellow-400 text-sm mb-2"><Hand className="h-4 w-4 inline mr-2" />Raised Hands</h4>
                    {raisedHands.map((p) => (
                      <div key={p.id} className="p-2 rounded bg-yellow-500/10 border border-yellow-500/30 flex items-center justify-between mb-2">
                        <span className="text-white text-sm">{p.student_name}</span>
                        <Button size="sm" variant="ghost" onClick={() => lowerHand(p.id)} className="h-6 w-6 p-0 text-yellow-400"><Hand className="h-3 w-3" /></Button>
                      </div>
                    ))}
                  </div>
                )}
                <div className="flex-1 overflow-y-auto space-y-2">
                  {participants.map((p, idx) => (
                    <div key={p.id} className="p-3 rounded-lg bg-gray-700/50 flex items-center justify-between group">
                      <div className="flex items-center gap-3">
                        <div className={`w-8 h-8 rounded-full bg-gradient-to-br ${getColor(idx)} flex items-center justify-center text-white text-sm font-bold`}>{p.student_name[0]}</div>
                        <div>
                          <p className="text-white text-sm">{p.student_name}</p>
                          <div className="flex gap-2 mt-1">
                            {p.is_audio_enabled ? <Mic className="h-3 w-3 text-green-400" /> : <MicOff className="h-3 w-3 text-gray-500" />}
                            {p.is_video_enabled ? <Video className="h-3 w-3 text-green-400" /> : <VideoOff className="h-3 w-3 text-gray-500" />}
                          </div>
                        </div>
                      </div>
                      <Button size="sm" variant="ghost" onClick={() => removeParticipant(p.id)} className="opacity-0 group-hover:opacity-100 h-8 w-8 p-0 text-red-400"><UserX className="h-4 w-4" /></Button>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <div className="bg-gray-800 border-t border-gray-700 px-4 py-4">
        <div className="flex items-center justify-center gap-4">
          <Button onClick={toggleAudio} className={`rounded-full w-12 h-12 ${isAudioEnabled ? 'bg-gray-700' : 'bg-red-600'}`}>
            {isAudioEnabled ? <Mic className="h-5 w-5" /> : <MicOff className="h-5 w-5" />}
          </Button>
          <Button onClick={toggleVideo} className={`rounded-full w-12 h-12 ${isVideoEnabled ? 'bg-gray-700' : 'bg-red-600'}`}>
            {isVideoEnabled ? <Video className="h-5 w-5" /> : <VideoOff className="h-5 w-5" />}
          </Button>
          <Button onClick={toggleScreenShare} className={`rounded-full w-12 h-12 ${isScreenSharing ? 'bg-blue-600' : 'bg-gray-700'}`}>
            {isScreenSharing ? <ScreenShareOff className="h-5 w-5" /> : <ScreenShare className="h-5 w-5" />}
          </Button>
          <div className="w-px h-8 bg-gray-700 mx-2" />
          <Button onClick={endClass} className="rounded-full px-6 h-12 bg-red-600"><PhoneOff className="h-5 w-5 mr-2" />End</Button>
        </div>
      </div>
    </div>
  )
}

function VideoTile({ stream, name, isLocal, colorIndex, isTeacher, isHandRaised }: {
  stream: MediaStream | null
  name: string
  isLocal: boolean
  colorIndex: number
  isTeacher?: boolean
  isHandRaised?: boolean
}) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const [showVideo, setShowVideo] = useState(false)

  useEffect(() => {
    const video = videoRef.current
    if (!video || !stream) {
      setShowVideo(false)
      return
    }

    // Set the stream
    video.srcObject = stream
    
    // Check video tracks - more robust check
    const checkVideoTracks = () => {
      const tracks = stream.getVideoTracks()
      // Check if any track is enabled AND live (not ended/muted)
      const hasActiveTrack = tracks.length > 0 && tracks.some(t => {
        const isActive = t.enabled && t.readyState === 'live' && !t.muted
        return isActive
      })
      
      // For remote streams, we MUST have an active track to show video
      // The video element might show black even with videoWidth > 0
      if (!hasActiveTrack) {
        setShowVideo(false)
        return
      }
      
      // Also verify video element has actual dimensions
      const hasVideoDimensions = video.videoWidth > 0 && video.videoHeight > 0
      setShowVideo(hasActiveTrack && hasVideoDimensions)
    }
    
    // Initial check after a short delay to let video load
    setTimeout(checkVideoTracks, 100)
    
    // Listen for video events
    const handlePlaying = () => {
      setTimeout(checkVideoTracks, 50)
    }
    const handleEnded = () => setShowVideo(false)
    const handleLoadedData = () => checkVideoTracks()
    const handleEmptied = () => setShowVideo(false)
    
    video.addEventListener('playing', handlePlaying)
    video.addEventListener('ended', handleEnded)
    video.addEventListener('loadeddata', handleLoadedData)
    video.addEventListener('emptied', handleEmptied)
    
    // Stream track event listeners
    const handleTrackChange = () => {
      setTimeout(checkVideoTracks, 50)
    }
    stream.addEventListener('addtrack', handleTrackChange)
    stream.addEventListener('removetrack', handleTrackChange)
    
    // Track event listeners for each video track
    const setupTrackListeners = () => {
      stream.getVideoTracks().forEach(track => {
        track.onended = checkVideoTracks
        track.onmute = checkVideoTracks
        track.onunmute = checkVideoTracks
      })
    }
    setupTrackListeners()
    
    // Periodic check - important for remote streams where track events may not fire
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

  const colors = ['from-blue-600 to-cyan-600', 'from-purple-500 to-pink-500', 'from-green-500 to-emerald-500', 'from-orange-500 to-red-500']

  return (
    <div className="bg-gray-800 rounded-xl overflow-hidden relative aspect-video">
      <video 
        ref={videoRef} 
        autoPlay 
        playsInline 
        muted={isLocal} 
        className={`w-full h-full object-cover ${showVideo ? '' : 'hidden'}`} 
      />
      {!showVideo && (
        <div className="w-full h-full flex items-center justify-center">
          <div className={`w-20 h-20 rounded-full bg-gradient-to-br ${colors[colorIndex % 4]} flex items-center justify-center text-white text-3xl font-bold`}>
            {name[0]?.toUpperCase() || '?'}
          </div>
        </div>
      )}
      <div className="absolute bottom-3 left-3 px-2 py-1 bg-black/60 rounded text-white text-sm flex items-center gap-2">
        {isTeacher && <span className="text-yellow-400">👑</span>}{name}
      </div>
      {isHandRaised && <div className="absolute top-3 right-3 w-8 h-8 bg-yellow-500 rounded-full flex items-center justify-center animate-bounce"><Hand className="h-4 w-4 text-white" /></div>}
    </div>
  )
}
