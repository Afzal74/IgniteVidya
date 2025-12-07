"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import { supabase } from "@/lib/supabase";
import { useRouter, useParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Users,
  Mic,
  MicOff,
  Video,
  VideoOff,
  PhoneOff,
  Hand,
  Maximize,
  Minimize,
  AlertCircle,
  MessageCircle,
  Send,
  X,
  BarChart3,
  Check,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface Participant {
  id: string;
  student_name: string;
  is_audio_enabled: boolean;
  is_video_enabled: boolean;
  is_hand_raised: boolean;
}

const ICE_SERVERS = {
  iceServers: [
    { urls: "stun:stun.l.google.com:19302" },
    { urls: "stun:stun1.l.google.com:19302" },
    { urls: "stun:stun2.l.google.com:19302" },
  ],
};

export default function LiveClassRoomPage() {
  const params = useParams();
  const roomId = params.roomId as string;
  const router = useRouter();
  const myId = useRef("");

  const [room, setRoom] = useState<any>(null);
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [loading, setLoading] = useState(true);
  const [participantName, setParticipantName] = useState("");
  const [participantId, setParticipantId] = useState("");

  const [isAudioEnabled, setIsAudioEnabled] = useState(false);
  const [isVideoEnabled, setIsVideoEnabled] = useState(false);
  const [isHandRaised, setIsHandRaised] = useState(false);
  const [localStream, setLocalStream] = useState<MediaStream | null>(null);
  const [remoteStreams, setRemoteStreams] = useState<Map<string, MediaStream>>(
    new Map()
  );
  const [teacherStream, setTeacherStream] = useState<MediaStream | null>(null);
  const [mediaError, setMediaError] = useState<string | null>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showParticipants, setShowParticipants] = useState(true);
  const [activeSpeaker, setActiveSpeaker] = useState<string | null>(null);
  const [spotlightUser, setSpotlightUser] = useState<string | null>(null); // Double-click to spotlight
  const [speakingUsers, setSpeakingUsers] = useState<Set<string>>(new Set());
  
  // Chat state
  const [showChat, setShowChat] = useState(false);
  const [chatMessages, setChatMessages] = useState<Array<{id: string; sender: string; senderName: string; message: string; timestamp: number; isTeacher?: boolean}>>([]);
  const [chatInput, setChatInput] = useState("");
  const [unreadCount, setUnreadCount] = useState(0);
  const chatEndRef = useRef<HTMLDivElement>(null);

  // Poll state
  const [activePoll, setActivePoll] = useState<{
    id: string;
    question: string;
    options: string[];
    votes: Record<string, string>;
    isActive: boolean;
    myVote?: string;
  } | null>(null);
  const [showPollNotification, setShowPollNotification] = useState(false);

  const localVideoRef = useRef<HTMLVideoElement>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const audioAnalyzersRef = useRef<
    Map<string, { analyzer: AnalyserNode; source: MediaStreamAudioSourceNode }>
  >(new Map());
  const containerRef = useRef<HTMLDivElement>(null);
  const localStreamRef = useRef<MediaStream | null>(null);
  const peerConnections = useRef<Map<string, RTCPeerConnection>>(new Map());
  const channelRef = useRef<any>(null);
  const pendingCandidates = useRef<Map<string, RTCIceCandidateInit[]>>(
    new Map()
  );

  // Keep ref in sync
  useEffect(() => {
    localStreamRef.current = localStream;
  }, [localStream]);

  // Create peer connection for a remote user
  const createPeerConnection = useCallback(
    (oderId: string): RTCPeerConnection => {
      console.log("Creating peer connection for:", oderId);

      // Close existing connection if any (but only if not working)
      const existing = peerConnections.current.get(oderId);
      if (existing) {
        if (existing.connectionState === "connected") {
          console.log("Returning existing connected peer for:", oderId);
          return existing;
        }
        existing.close();
        peerConnections.current.delete(oderId);
      }

      const pc = new RTCPeerConnection(ICE_SERVERS);

      // Add local tracks
      if (localStreamRef.current) {
        localStreamRef.current.getTracks().forEach((track) => {
          console.log("Adding track to peer:", track.kind);
          pc.addTrack(track, localStreamRef.current!);
        });
      }

      // Handle incoming tracks
      pc.ontrack = (event) => {
        console.log("Received track from:", oderId, event.track.kind);
        if (oderId.startsWith("teacher-")) {
          setTeacherStream(event.streams[0]);
        } else {
          setRemoteStreams((prev) => {
            const newMap = new Map(prev);
            newMap.set(oderId, event.streams[0]);
            return newMap;
          });
        }
      };

      // Handle ICE candidates
      pc.onicecandidate = (event) => {
        if (event.candidate) {
          channelRef.current?.send({
            type: "broadcast",
            event: "webrtc-ice",
            payload: {
              from: myId.current,
              to: oderId,
              candidate: event.candidate.toJSON(),
            },
          });
        }
      };

      pc.oniceconnectionstatechange = () => {
        console.log("ICE state for", oderId, ":", pc.iceConnectionState);
        if (pc.iceConnectionState === "failed") {
          pc.restartIce();
        }
      };

      pc.onconnectionstatechange = () => {
        console.log("Connection state for", oderId, ":", pc.connectionState);
        if (pc.connectionState === "failed") {
          if (oderId.startsWith("teacher-")) {
            setTeacherStream(null);
          } else {
            setRemoteStreams((prev) => {
              const newMap = new Map(prev);
              newMap.delete(oderId);
              return newMap;
            });
          }
        }
      };

      peerConnections.current.set(oderId, pc);
      return pc;
    },
    []
  );

  // Handle incoming offer
  const handleOffer = useCallback(
    async (from: string, sdp: string) => {
      console.log("Received offer from:", from);

      // Check if we already have a stable connection
      const existingPc = peerConnections.current.get(from);
      if (
        existingPc &&
        existingPc.signalingState === "stable" &&
        existingPc.connectionState === "connected"
      ) {
        console.log("Already connected to:", from, "ignoring offer");
        return;
      }

      const pc = createPeerConnection(from);

      try {
        await pc.setRemoteDescription({ type: "offer", sdp });

        const pending = pendingCandidates.current.get(from) || [];
        for (const candidate of pending) {
          await pc.addIceCandidate(candidate);
        }
        pendingCandidates.current.delete(from);

        const answer = await pc.createAnswer();
        await pc.setLocalDescription(answer);

        console.log("Sending answer to:", from);
        channelRef.current?.send({
          type: "broadcast",
          event: "webrtc-answer",
          payload: { from: myId.current, to: from, sdp: answer.sdp },
        });
      } catch (err) {
        console.error("Error handling offer:", err);
      }
    },
    [createPeerConnection]
  );

  // Handle incoming answer
  const handleAnswer = useCallback(async (from: string, sdp: string) => {
    const pc = peerConnections.current.get(from);
    if (!pc) return;

    // Only set answer if we're waiting for one
    if (pc.signalingState !== "have-local-offer") {
      return;
    }

    try {
      await pc.setRemoteDescription({ type: "answer", sdp });
      const pending = pendingCandidates.current.get(from) || [];
      for (const candidate of pending) {
        await pc.addIceCandidate(candidate);
      }
      pendingCandidates.current.delete(from);
    } catch {
      // Silently ignore - connection may have changed state
    }
  }, []);

  // Handle incoming ICE candidate
  const handleIceCandidate = useCallback(
    async (from: string, candidate: RTCIceCandidateInit) => {
      const pc = peerConnections.current.get(from);

      if (pc && pc.remoteDescription) {
        try {
          await pc.addIceCandidate(candidate);
        } catch (err) {
          console.error("Error adding ICE candidate:", err);
        }
      } else {
        const pending = pendingCandidates.current.get(from) || [];
        pending.push(candidate);
        pendingCandidates.current.set(from, pending);
      }
    },
    []
  );

  useEffect(() => {
    const name = localStorage.getItem("live_class_participant_name");
    const id = localStorage.getItem("live_class_participant_id");
    if (name) setParticipantName(name);
    if (id) {
      setParticipantId(id);
      myId.current = id;
    }

    fetchRoomData();
    initMedia();

    // Stop camera on page close/refresh
    const stopAllMedia = () => {
      localStreamRef.current?.getTracks().forEach((t) => t.stop());
    };
    window.addEventListener("beforeunload", stopAllMedia);
    window.addEventListener("pagehide", stopAllMedia);

    return () => {
      window.removeEventListener("beforeunload", stopAllMedia);
      window.removeEventListener("pagehide", stopAllMedia);
      // Stop all media tracks (turns off camera light)
      localStreamRef.current?.getTracks().forEach((t) => t.stop());
      // Close all peer connections
      peerConnections.current.forEach((pc) => pc.close());
      peerConnections.current.clear();
      // Notify and cleanup channel
      if (channelRef.current) {
        channelRef.current.send({
          type: "broadcast",
          event: "user-leave",
          payload: { oderId: myId.current },
        });
        supabase.removeChannel(channelRef.current);
      }
    };
  }, []);

  // Setup WebRTC signaling channel
  useEffect(() => {
    if (!roomId || !participantId) return;

    const channel = supabase.channel(`webrtc-room-${roomId}`, {
      config: { broadcast: { self: false } },
    });

    channel
      .on("broadcast", { event: "webrtc-offer" }, ({ payload }) => {
        if (payload.to === myId.current) {
          handleOffer(payload.from, payload.sdp);
        }
      })
      .on("broadcast", { event: "webrtc-answer" }, ({ payload }) => {
        if (payload.to === myId.current) {
          handleAnswer(payload.from, payload.sdp);
        }
      })
      .on("broadcast", { event: "webrtc-ice" }, ({ payload }) => {
        if (payload.to === myId.current) {
          handleIceCandidate(payload.from, payload.candidate);
        }
      })
      .on("broadcast", { event: "teacher-ready" }, ({ payload }) => {
        console.log("Teacher is ready:", payload.oderId);
        // Check if we have a working connection to ANY teacher
        let hasWorkingTeacherConnection = false;
        peerConnections.current.forEach((pc, id) => {
          if (
            id.startsWith("teacher-") &&
            (pc.connectionState === "connected" ||
              pc.connectionState === "connecting")
          ) {
            hasWorkingTeacherConnection = true;
          }
        });

        if (!hasWorkingTeacherConnection) {
          console.log("No working teacher connection, requesting connection");
          // Clear any old teacher connections
          peerConnections.current.forEach((pc, id) => {
            if (id.startsWith("teacher-")) {
              pc.close();
              peerConnections.current.delete(id);
            }
          });
          setTeacherStream(null);

          // Request connection from the new teacher
          channel.send({
            type: "broadcast",
            event: "request-connection",
            payload: { oderId: myId.current },
          });
        }
      })
      .on("broadcast", { event: "teacher-leave" }, () => {
        console.log("Teacher left");
        setTeacherStream(null);
        // Clear teacher peer connection
        peerConnections.current.forEach((pc, id) => {
          if (id.startsWith("teacher-")) {
            pc.close();
            peerConnections.current.delete(id);
          }
        });
      })
      .on("broadcast", { event: "class-end" }, () => {
        alert("The class has ended.");
        router.push("/live-class");
      })
      .on("broadcast", { event: "video-toggle" }, ({ payload }) => {
        // Remote user toggled their video - force refresh
        console.log(
          "Video toggle from:",
          payload.oderId,
          "enabled:",
          payload.videoEnabled
        );
        if (payload.oderId.startsWith("teacher-")) {
          setTeacherStream((prev) =>
            prev ? new MediaStream(prev.getTracks()) : null
          );
        } else {
          setRemoteStreams((prev) => new Map(prev));
        }
      })
      .on("broadcast", { event: "chat-message" }, ({ payload }) => {
        // Received chat message
        setChatMessages((prev) => [...prev, payload]);
        setUnreadCount((prev) => prev + 1);
      })
      .on("broadcast", { event: "poll-start" }, ({ payload }) => {
        // Teacher started a poll
        setActivePoll({ ...payload, myVote: undefined });
        setShowPollNotification(true);
      })
      .on("broadcast", { event: "poll-end" }, ({ payload }) => {
        // Teacher ended the poll
        setActivePoll((prev) => prev && prev.id === payload.pollId ? { ...prev, isActive: false } : prev);
      })
      .on("broadcast", { event: "poll-vote" }, ({ payload }) => {
        // Someone voted (update vote count)
        setActivePoll((prev) => {
          if (!prev || prev.id !== payload.pollId) return prev;
          return { ...prev, votes: { ...prev.votes, [payload.oderId]: payload.option } };
        });
      })
      .subscribe((status) => {
        console.log("WebRTC channel status:", status);
        if (status === "SUBSCRIBED") {
          // Announce presence to teacher
          channel.send({
            type: "broadcast",
            event: "user-join",
            payload: { oderId: myId.current },
          });
        }
      });

    channelRef.current = channel;

    return () => {
      supabase.removeChannel(channel);
    };
  }, [
    roomId,
    participantId,
    handleOffer,
    handleAnswer,
    handleIceCandidate,
    router,
  ]);

  // Subscribe to room and participant changes
  useEffect(() => {
    if (!roomId) return;
    const ch = supabase
      .channel(`student-room-${roomId}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "live_class_participants",
          filter: `room_id=eq.${roomId}`,
        },
        () => fetchParticipants()
      )
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "live_class_rooms",
          filter: `id=eq.${roomId}`,
        },
        (payload: any) => {
          if (payload.new.status === "ended") {
            alert("The class has ended.");
            router.push("/live-class");
          }
          setRoom(payload.new);
        }
      )
      .subscribe();
    return () => {
      supabase.removeChannel(ch);
    };
  }, [roomId, router]);

  // Voice activity detection for local stream (student)
  useEffect(() => {
    if (!localStream || !isAudioEnabled) {
      setSpeakingUsers((prev) => {
        const next = new Set(prev);
        next.delete(participantId);
        return next;
      });
      return;
    }

    if (!audioContextRef.current) {
      audioContextRef.current = new AudioContext();
    }
    const audioContext = audioContextRef.current;

    const analyzer = audioContext.createAnalyser();
    analyzer.fftSize = 256;
    analyzer.smoothingTimeConstant = 0.5;

    const source = audioContext.createMediaStreamSource(localStream);
    source.connect(analyzer);

    const dataArray = new Uint8Array(analyzer.frequencyBinCount);
    let animationId: number;

    const checkAudio = () => {
      analyzer.getByteFrequencyData(dataArray);
      const average = dataArray.reduce((a, b) => a + b, 0) / dataArray.length;
      const isSpeaking = average > 15;

      setSpeakingUsers((prev) => {
        const next = new Set(prev);
        if (isSpeaking) {
          next.add(participantId);
          setActiveSpeaker(participantId);
        } else {
          next.delete(participantId);
        }
        return next;
      });

      animationId = requestAnimationFrame(checkAudio);
    };
    checkAudio();

    return () => {
      cancelAnimationFrame(animationId);
      source.disconnect();
    };
  }, [localStream, isAudioEnabled, participantId]);

  // Voice activity detection for teacher and remote streams
  useEffect(() => {
    if (!audioContextRef.current) {
      audioContextRef.current = new AudioContext();
    }
    const audioContext = audioContextRef.current;

    // Combine teacher stream and remote streams for analysis
    const allStreams = new Map<string, MediaStream>();
    if (teacherStream) {
      allStreams.set("teacher", teacherStream);
    }
    remoteStreams.forEach((stream, id) => {
      allStreams.set(id, stream);
    });

    // Clean up old analyzers
    audioAnalyzersRef.current.forEach((value, oderId) => {
      if (!allStreams.has(oderId)) {
        value.source.disconnect();
        audioAnalyzersRef.current.delete(oderId);
      }
    });

    // Set up analyzers for new streams
    allStreams.forEach((stream, oderId) => {
      if (audioAnalyzersRef.current.has(oderId)) return;

      const audioTracks = stream.getAudioTracks();
      if (audioTracks.length === 0) return;

      try {
        const analyzer = audioContext.createAnalyser();
        analyzer.fftSize = 256;
        analyzer.smoothingTimeConstant = 0.5;

        const source = audioContext.createMediaStreamSource(stream);
        source.connect(analyzer);

        audioAnalyzersRef.current.set(oderId, { analyzer, source });
      } catch (e) {
        console.error("Error setting up audio analyzer for", oderId, e);
      }
    });

    const dataArrays: Record<string, Uint8Array> = {};
    audioAnalyzersRef.current.forEach((value, oderId) => {
      dataArrays[oderId] = new Uint8Array(value.analyzer.frequencyBinCount);
    });

    let animationId: number;
    const checkAllAudio = () => {
      let loudestUser: string | null = null;
      let loudestLevel = 15;

      audioAnalyzersRef.current.forEach((value, oderId) => {
        const dataArray = dataArrays[oderId];
        if (!dataArray) return;

        value.analyzer.getByteFrequencyData(
          dataArray as Uint8Array<ArrayBuffer>
        );
        const average =
          Array.from(dataArray).reduce((a, b) => a + b, 0) / dataArray.length;

        setSpeakingUsers((prev) => {
          const next = new Set(prev);
          if (average > 15) {
            next.add(oderId);
            if (average > loudestLevel) {
              loudestLevel = average;
              loudestUser = oderId;
            }
          } else {
            next.delete(oderId);
          }
          return next;
        });
      });

      if (loudestUser) {
        setActiveSpeaker(loudestUser);
      }

      animationId = requestAnimationFrame(checkAllAudio);
    };

    if (audioAnalyzersRef.current.size > 0) {
      checkAllAudio();
    }

    return () => {
      cancelAnimationFrame(animationId);
    };
  }, [teacherStream, remoteStreams]);

  const initMedia = async () => {
    setMediaError(null);

    // Stop any existing streams first
    if (localStream) {
      localStream.getTracks().forEach((t) => t.stop());
      setLocalStream(null);
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          width: { ideal: 640 },
          height: { ideal: 480 },
          facingMode: "user",
        },
        audio: true,
      });
      setLocalStream(stream);
      setIsVideoEnabled(true);
      setIsAudioEnabled(true);
      if (localVideoRef.current) {
        localVideoRef.current.srcObject = stream;
      }
      const id = localStorage.getItem("live_class_participant_id");
      if (id) {
        await supabase
          .from("live_class_participants")
          .update({ is_video_enabled: true, is_audio_enabled: true })
          .eq("id", id);
      }
    } catch (err: any) {
      console.error("Media error:", err.name, err.message);

      if (err.name === "NotReadableError") {
        // Camera busy - try audio only
        try {
          const audioStream = await navigator.mediaDevices.getUserMedia({
            audio: true,
          });
          setLocalStream(audioStream);
          setIsAudioEnabled(true);
          setMediaError(
            "Camera busy (another app/tab). Audio only. Close other apps and Retry for video."
          );
          const id = localStorage.getItem("live_class_participant_id");
          if (id) {
            await supabase
              .from("live_class_participants")
              .update({ is_audio_enabled: true })
              .eq("id", id);
          }
          return;
        } catch {
          setMediaError(
            "Camera busy. Close other browser tabs/apps, then Retry."
          );
        }
        return;
      } else if (err.name === "NotAllowedError") {
        setMediaError(
          "Permission denied. Click camera icon in address bar to allow."
        );
        return;
      } else if (err.name === "NotFoundError") {
        setMediaError("No camera found. You can still join with audio.");
      } else {
        try {
          const audioStream = await navigator.mediaDevices.getUserMedia({
            audio: true,
          });
          setLocalStream(audioStream);
          setIsAudioEnabled(true);
          setMediaError("Camera not available. Audio only.");
          const id = localStorage.getItem("live_class_participant_id");
          if (id) {
            await supabase
              .from("live_class_participants")
              .update({ is_audio_enabled: true })
              .eq("id", id);
          }
        } catch (audioErr) {
          setMediaError("Could not access camera or microphone.");
        }
      }
    }
  };

  const fetchRoomData = async () => {
    const { data } = await supabase
      .from("live_class_rooms")
      .select("*")
      .eq("id", roomId)
      .single();
    if (data) {
      setRoom(data);
      if (data.status === "ended") {
        router.push("/live-class");
        return;
      }
      fetchParticipants();
    }
    setLoading(false);
  };

  const fetchParticipants = async () => {
    const { data } = await supabase
      .from("live_class_participants")
      .select("*")
      .eq("room_id", roomId)
      .is("left_at", null)
      .order("joined_at");
    if (data) setParticipants(data);
  };

  const toggleAudio = async () => {
    if (localStream) {
      const enabled = !isAudioEnabled;
      localStream.getAudioTracks().forEach((t) => {
        t.enabled = enabled;
      });
      setIsAudioEnabled(enabled);
      if (participantId) {
        await supabase
          .from("live_class_participants")
          .update({ is_audio_enabled: enabled })
          .eq("id", participantId);
      }
    }
  };

  const toggleVideo = async () => {
    if (isVideoEnabled) {
      // Turn OFF - STOP the video track completely (turns off camera light)
      if (localStream) {
        localStream.getVideoTracks().forEach((t) => {
          t.stop();
          localStream.removeTrack(t);
        });
        // Replace video track with null in peer connections (keeps sender for later)
        peerConnections.current.forEach((pc) => {
          const sender = pc.getSenders().find((s) => s.track?.kind === "video");
          if (sender) {
            sender.replaceTrack(null);
          }
        });
      }
      setIsVideoEnabled(false);
      if (participantId) {
        await supabase
          .from("live_class_participants")
          .update({ is_video_enabled: false })
          .eq("id", participantId);
      }
      // Notify others that video is off
      channelRef.current?.send({
        type: "broadcast",
        event: "video-toggle",
        payload: { oderId: myId.current, videoEnabled: false },
      });
    } else {
      // Turn ON - get new video stream
      try {
        const videoStream = await navigator.mediaDevices.getUserMedia({
          video: { width: { ideal: 640 }, height: { ideal: 480 } },
        });
        const videoTrack = videoStream.getVideoTracks()[0];

        if (localStream) {
          // Stop the temporary stream container (we only need the track)
          videoStream.getVideoTracks().forEach((t) => {
            if (t !== videoTrack) t.stop();
          });
          localStream.addTrack(videoTrack);
          // Add video track to peer connections
          peerConnections.current.forEach((pc) => {
            const videoSender = pc
              .getSenders()
              .find((s) => s.track?.kind === "video" || !s.track);
            if (videoSender && videoSender.track === null) {
              videoSender.replaceTrack(videoTrack);
            } else if (videoSender && videoSender.track?.kind === "video") {
              videoSender.replaceTrack(videoTrack);
            } else {
              pc.addTrack(videoTrack, localStream);
            }
          });
        } else {
          setLocalStream(videoStream);
          localStreamRef.current = videoStream;
        }
        setIsVideoEnabled(true);
        if (participantId) {
          await supabase
            .from("live_class_participants")
            .update({ is_video_enabled: true })
            .eq("id", participantId);
        }
        channelRef.current?.send({
          type: "broadcast",
          event: "video-toggle",
          payload: { oderId: myId.current, videoEnabled: true },
        });
      } catch (e: any) {
        if (e.name === "NotReadableError") {
          setMediaError("Camera is busy. Close other apps using it.");
        } else {
          setMediaError("Could not enable camera");
        }
      }
    }
  };

  const toggleHandRaise = async () => {
    const raised = !isHandRaised;
    setIsHandRaised(raised);
    if (participantId) {
      await supabase
        .from("live_class_participants")
        .update({ is_hand_raised: raised })
        .eq("id", participantId);
    }
  };

  const leaveClass = async () => {
    // Clear video element first
    if (localVideoRef.current) {
      localVideoRef.current.srcObject = null;
    }

    // Stop all media tracks (turns off camera light)
    localStream?.getTracks().forEach((t) => t.stop());
    localStreamRef.current?.getTracks().forEach((t) => t.stop());
    setLocalStream(null);
    localStreamRef.current = null;

    // Cleanup WebRTC
    peerConnections.current.forEach((pc) => pc.close());
    peerConnections.current.clear();

    // Announce leaving
    channelRef.current?.send({
      type: "broadcast",
      event: "user-leave",
      payload: { oderId: myId.current },
    });

    if (participantId) {
      await supabase
        .from("live_class_participants")
        .update({ left_at: new Date().toISOString() })
        .eq("id", participantId);
      localStorage.removeItem("live_class_participant_id");
      localStorage.removeItem("live_class_participant_name");
    }
    router.push("/live-class");
  };

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      containerRef.current?.requestFullscreen();
      setIsFullscreen(true);
    } else {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  };

  const retryMedia = () => {
    localStream?.getTracks().forEach((t) => t.stop());
    setLocalStream(null);
    setIsVideoEnabled(false);
    setIsAudioEnabled(false);
    initMedia();
  };

  const getColor = (i: number) =>
    [
      "from-blue-500 to-cyan-500",
      "from-purple-500 to-pink-500",
      "from-green-500 to-emerald-500",
      "from-orange-500 to-red-500",
    ][i % 4];

  // Send chat message
  const sendChatMessage = () => {
    if (!chatInput.trim() || !channelRef.current) return;
    const msg = {
      id: `${participantId}-${Date.now()}`,
      sender: participantId,
      senderName: participantName || "Student",
      message: chatInput.trim(),
      timestamp: Date.now(),
      isTeacher: false,
    };
    channelRef.current.send({
      type: "broadcast",
      event: "chat-message",
      payload: msg,
    });
    setChatMessages((prev) => [...prev, msg]);
    setChatInput("");
  };

  // Auto-scroll chat and reset unread when chat is opened
  useEffect(() => {
    if (showChat) {
      setUnreadCount(0);
      chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [showChat, chatMessages]);

  // Vote on poll
  const votePoll = (option: string) => {
    if (!activePoll || !activePoll.isActive || activePoll.myVote) return;
    channelRef.current?.send({
      type: "broadcast",
      event: "poll-vote",
      payload: { pollId: activePoll.id, oderId: participantId, option },
    });
    setActivePoll((prev) => prev ? { ...prev, myVote: option, votes: { ...prev.votes, [participantId]: option } } : null);
    setShowPollNotification(false);
  };

  if (loading)
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-900">
        <div className="h-12 w-12 animate-spin rounded-full border-4 border-blue-500 border-t-transparent" />
      </div>
    );
  if (!room)
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-900">
        <p className="text-zinc-400">Class not found</p>
      </div>
    );

  const otherParticipants = participants.filter((p) => p.id !== participantId);

  return (
    <div
      ref={containerRef}
      className="h-screen pt-16 bg-gray-900 flex flex-col overflow-hidden"
    >
      {/* Header - Compact */}
      <div className="bg-gray-800 border-b border-gray-700 px-3 py-2 flex items-center justify-between flex-shrink-0">
        <div className="flex items-center gap-2">
          <h1 className="text-white text-sm font-semibold truncate max-w-[200px]">
            {room.room_name}
          </h1>
          <span className="px-1.5 py-0.5 rounded bg-red-500/20 text-red-400 text-[10px] animate-pulse">
            ● LIVE
          </span>
        </div>
        <div className="flex items-center gap-1">
          {activePoll && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowPollNotification(true)}
              className={`h-7 px-2 relative ${activePoll.isActive && !activePoll.myVote ? 'text-pink-400 animate-pulse' : 'text-gray-400 hover:text-white'}`}
            >
              <BarChart3 className="h-3 w-3" />
              {activePoll.isActive && !activePoll.myVote && <span className="absolute -top-1 -right-1 w-2 h-2 bg-pink-500 rounded-full" />}
            </Button>
          )}
          <Button
            variant="ghost"
            size="sm"
            onClick={() => { setShowChat(!showChat); if (!showChat) setUnreadCount(0); }}
            className="text-gray-400 hover:text-white h-7 px-2 relative"
          >
            <MessageCircle className="h-3 w-3" />
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full text-[8px] text-white flex items-center justify-center">
                {unreadCount > 9 ? "9+" : unreadCount}
              </span>
            )}
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowParticipants(!showParticipants)}
            className="text-gray-400 hover:text-white h-7 px-2"
          >
            <Users className="h-3 w-3 mr-1" />
            {participants.length + 1}
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={toggleFullscreen}
            className="text-gray-400 hover:text-white h-7 px-2"
          >
            {isFullscreen ? (
              <Minimize className="h-3 w-3" />
            ) : (
              <Maximize className="h-3 w-3" />
            )}
          </Button>
        </div>
      </div>

      {/* Media Error */}
      {mediaError && (
        <div className="bg-yellow-500/20 border-b border-yellow-500/30 px-3 py-1 flex items-center justify-between flex-shrink-0">
          <div className="flex items-center gap-2 text-yellow-400 text-xs">
            <AlertCircle className="h-3 w-3" />
            {mediaError}
          </div>
          <Button
            size="sm"
            variant="outline"
            onClick={retryMedia}
            className="text-yellow-400 border-yellow-500/50 h-6 text-xs"
          >
            Retry
          </Button>
        </div>
      )}

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden">
        <div className="flex-1 p-1 md:p-2 flex flex-col md:flex-row gap-1 md:gap-2">
          {/* Main Video - Teacher or Spotlighted user */}
          <div className="flex-1 flex items-center justify-center order-1 md:order-2 min-h-0">
            {spotlightUser ? (
              // Show spotlighted student
              (() => {
                const spotlightedStream =
                  spotlightUser === participantId
                    ? localStream
                    : remoteStreams.get(spotlightUser);
                const spotlightedName =
                  spotlightUser === participantId
                    ? participantName
                    : otherParticipants.find((p) => p.id === spotlightUser)
                        ?.student_name || "Student";
                return (
                  <SpotlightVideoTile
                    stream={spotlightedStream || null}
                    name={spotlightedName}
                    isSpeaking={speakingUsers.has(spotlightUser)}
                    isLocal={spotlightUser === participantId}
                    onDoubleClick={() => setSpotlightUser(null)}
                  />
                );
              })()
            ) : (
              <TeacherVideoTile
                stream={teacherStream}
                isSpeaking={speakingUsers.has("teacher")}
                isActiveSpeaker={activeSpeaker === "teacher"}
                onDoubleClick={() => {}}
              />
            )}
          </div>

          {/* Thumbnails - Teacher (if spotlighted) + Students */}
          <div className="flex flex-row md:flex-col gap-2 md:gap-2 h-28 md:h-auto md:w-36 lg:w-44 flex-shrink-0 order-2 md:order-1 overflow-x-auto md:overflow-x-visible md:overflow-y-auto p-1">
            {/* Show teacher thumbnail when someone else is spotlighted */}
            {spotlightUser && (
              <div
                onDoubleClick={() => setSpotlightUser(null)}
                className="relative w-40 h-full md:w-full md:h-auto aspect-video flex-shrink-0 bg-gray-800 rounded-lg overflow-hidden cursor-pointer ring-2 ring-yellow-400"
              >
                <TeacherThumbnail
                  stream={teacherStream}
                  isSpeaking={speakingUsers.has("teacher")}
                />
                <div className="absolute bottom-0 left-0 right-0 px-1 py-0.5 bg-black/70 text-[8px] text-yellow-400 truncate">
                  👑 Teacher
                </div>
              </div>
            )}
            {/* Your Video */}
            <div
              onDoubleClick={() =>
                setSpotlightUser(
                  spotlightUser === participantId ? null : participantId
                )
              }
              className={`relative w-40 h-full md:w-full md:h-auto aspect-video flex-shrink-0 bg-gray-800 rounded-lg overflow-hidden transition-all duration-200 cursor-pointer group ${
                spotlightUser === participantId
                  ? "ring-2 ring-pink-500 shadow-[0_0_10px_rgba(236,72,153,0.5)]"
                  : speakingUsers.has(participantId)
                  ? "ring-2 ring-green-400 shadow-[0_0_8px_rgba(74,222,128,0.4)]"
                  : "ring-2 ring-blue-500"
              }`}
            >
              {isVideoEnabled &&
              localStream &&
              localStream.getVideoTracks().length > 0 ? (
                <video
                  key={`video-${isVideoEnabled}`}
                  ref={(el) => {
                    if (el && localStream) el.srcObject = localStream;
                  }}
                  autoPlay
                  playsInline
                  muted
                  className="w-full h-full object-cover scale-x-[-1]"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <div
                    className={`w-12 h-12 md:w-14 md:h-14 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white text-lg md:text-xl font-bold ${
                      speakingUsers.has(participantId) ? "animate-pulse" : ""
                    }`}
                  >
                    {participantName[0]?.toUpperCase() || "?"}
                  </div>
                </div>
              )}
              {speakingUsers.has(participantId) && (
                <div className="absolute top-0.5 md:top-1 left-0.5 md:left-1 flex gap-0.5">
                  <div className="w-0.5 md:w-1 h-2 md:h-3 bg-green-400 animate-pulse" />
                  <div
                    className="w-0.5 md:w-1 h-3 md:h-4 bg-green-400 animate-pulse"
                    style={{ animationDelay: "100ms" }}
                  />
                  <div
                    className="w-0.5 md:w-1 h-1.5 md:h-2 bg-green-400 animate-pulse"
                    style={{ animationDelay: "200ms" }}
                  />
                </div>
              )}
              <div className="absolute bottom-0 left-0 right-0 px-1 py-0.5 bg-black/70 text-[8px] md:text-[10px] text-white truncate flex items-center gap-1">
                {isAudioEnabled ? (
                  <Mic className="h-2 w-2 md:h-2.5 md:w-2.5 text-green-400" />
                ) : (
                  <MicOff className="h-2 w-2 md:h-2.5 md:w-2.5 text-red-400" />
                )}
                You
              </div>
              {isHandRaised && (
                <div className="absolute top-0.5 md:top-1 right-0.5 md:right-1 w-4 md:w-5 h-4 md:h-5 bg-yellow-500 rounded-full flex items-center justify-center animate-bounce">
                  <Hand className="h-2 md:h-3 w-2 md:w-3 text-white" />
                </div>
              )}
            </div>

            {/* Other Students thumbnails */}
            {otherParticipants.map((p, i) => {
              const remoteStream = remoteStreams.get(p.id);
              const isSpeaking = speakingUsers.has(p.id);
              return (
                <StudentThumbnailView
                  key={p.id}
                  stream={remoteStream}
                  name={p.student_name}
                  colorIndex={i}
                  isHandRaised={p.is_hand_raised}
                  isSpeaking={isSpeaking}
                  isActiveSpeaker={activeSpeaker === p.id}
                  isAudioEnabled={p.is_audio_enabled}
                />
              );
            })}
          </div>
        </div>

        {/* Sidebar - Hidden on mobile */}
        <AnimatePresence>
          {showParticipants && (
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: 180 }}
              exit={{ width: 0 }}
              className="hidden md:block bg-gray-800 border-l border-gray-700 overflow-hidden"
            >
              <div className="p-2 h-full flex flex-col w-[180px]">
                <h3 className="text-white text-xs font-semibold mb-2">
                  <Users className="h-3 w-3 inline mr-1" />
                  Class ({participants.length + 1})
                </h3>
                <div className="flex-1 overflow-y-auto space-y-1">
                  {/* Teacher entry */}
                  <div
                    className={`p-1.5 rounded bg-yellow-500/20 border border-yellow-500/30 ${
                      speakingUsers.has("teacher")
                        ? "ring-1 ring-green-400"
                        : ""
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded-full bg-yellow-500 flex items-center justify-center text-white text-xs font-bold">
                        👑
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-yellow-400 text-[10px] truncate">
                          Teacher
                        </p>
                        {speakingUsers.has("teacher") && (
                          <span className="text-[8px] text-green-400">
                            🔊 Speaking
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  {/* Students */}
                  {participants.map((p, i) => (
                    <div
                      key={p.id}
                      className={`p-1.5 rounded ${
                        p.id === participantId
                          ? "bg-blue-500/20 border border-blue-500/30"
                          : "bg-gray-700/50"
                      } ${
                        speakingUsers.has(p.id) ? "ring-1 ring-green-400" : ""
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <div
                          className={`w-6 h-6 rounded-full bg-gradient-to-br ${getColor(
                            i
                          )} flex items-center justify-center text-white text-[10px] font-bold relative`}
                        >
                          {p.student_name[0].toUpperCase()}
                          {p.is_hand_raised && (
                            <div className="absolute -top-0.5 -right-0.5 w-3 h-3 bg-yellow-500 rounded-full flex items-center justify-center">
                              <Hand className="h-1.5 w-1.5 text-white" />
                            </div>
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-white text-[10px] truncate">
                            {p.student_name}
                            {p.id === participantId && (
                              <span className="text-blue-400 ml-0.5">
                                (You)
                              </span>
                            )}
                          </p>
                          <div className="flex gap-1 items-center">
                            {p.is_audio_enabled ? (
                              <Mic className="h-2 w-2 text-green-400" />
                            ) : (
                              <MicOff className="h-2 w-2 text-gray-500" />
                            )}
                            {p.is_video_enabled ? (
                              <Video className="h-2 w-2 text-green-400" />
                            ) : (
                              <VideoOff className="h-2 w-2 text-gray-500" />
                            )}
                            {speakingUsers.has(p.id) && (
                              <span className="text-[8px] text-green-400">
                                🔊
                              </span>
                            )}
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

        {/* Chat Panel */}
        <AnimatePresence>
          {showChat && (
            <motion.div
              initial={{ width: 0, opacity: 0 }}
              animate={{ width: 280, opacity: 1 }}
              exit={{ width: 0, opacity: 0 }}
              className="bg-gray-800 border-l border-gray-700 flex flex-col overflow-hidden"
            >
              <div className="p-2 border-b border-gray-700 flex items-center justify-between">
                <h3 className="text-white text-xs font-semibold flex items-center gap-1">
                  <MessageCircle className="h-3 w-3" /> Chat
                </h3>
                <button onClick={() => setShowChat(false)} className="text-gray-400 hover:text-white">
                  <X className="h-4 w-4" />
                </button>
              </div>
              <div className="flex-1 overflow-y-auto p-2 space-y-2 min-h-0">
                {chatMessages.length === 0 ? (
                  <p className="text-gray-500 text-xs text-center py-4">No messages yet</p>
                ) : (
                  chatMessages.map((msg) => (
                    <div
                      key={msg.id}
                      className={`p-2 rounded-lg ${
                        msg.sender === participantId
                          ? "bg-blue-600/30 ml-4"
                          : msg.isTeacher
                          ? "bg-yellow-600/30 mr-4"
                          : "bg-gray-700/50 mr-4"
                      }`}
                    >
                      <div className="flex items-center gap-1 mb-0.5">
                        <span className={`text-[10px] font-semibold ${msg.isTeacher ? "text-yellow-400" : msg.sender === participantId ? "text-blue-400" : "text-gray-300"}`}>
                          {msg.isTeacher ? "👑 " : ""}{msg.senderName}{msg.sender === participantId ? " (You)" : ""}
                        </span>
                        <span className="text-[8px] text-gray-500">
                          {new Date(msg.timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                        </span>
                      </div>
                      <p className="text-white text-xs break-words">{msg.message}</p>
                    </div>
                  ))
                )}
                <div ref={chatEndRef} />
              </div>
              <div className="p-2 border-t border-gray-700">
                <div className="flex gap-1">
                  <input
                    type="text"
                    value={chatInput}
                    onChange={(e) => setChatInput(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && sendChatMessage()}
                    placeholder="Type a message..."
                    className="flex-1 bg-gray-700 text-white text-xs px-2 py-1.5 rounded border border-gray-600 focus:border-blue-500 focus:outline-none"
                  />
                  <Button size="sm" onClick={sendChatMessage} className="h-7 w-7 p-0 bg-blue-600 hover:bg-blue-700">
                    <Send className="h-3 w-3" />
                  </Button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Poll Modal */}
      <AnimatePresence>
        {showPollNotification && activePoll && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4"
            onClick={() => !activePoll.isActive && setShowPollNotification(false)}
          >
            <motion.div
              onClick={(e) => e.stopPropagation()}
              className="bg-gray-800 border-2 border-pink-500 rounded-xl p-4 w-full max-w-sm shadow-[0_0_30px_rgba(236,72,153,0.3)]"
            >
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-pink-400 font-bold flex items-center gap-2">
                  <BarChart3 className="h-5 w-5" /> Poll
                </h3>
                <button onClick={() => setShowPollNotification(false)} className="text-gray-400 hover:text-white">
                  <X className="h-5 w-5" />
                </button>
              </div>
              <p className="text-white font-medium mb-4">{activePoll.question}</p>
              <div className="space-y-2">
                {activePoll.options.map((opt, i) => {
                  const voteCount = Object.values(activePoll.votes).filter(v => v === opt).length;
                  const totalVotes = Object.keys(activePoll.votes).length;
                  const percent = totalVotes > 0 ? Math.round((voteCount / totalVotes) * 100) : 0;
                  const isMyVote = activePoll.myVote === opt;
                  return (
                    <button
                      key={i}
                      onClick={() => votePoll(opt)}
                      disabled={!activePoll.isActive || !!activePoll.myVote}
                      className={`w-full p-3 rounded-lg border-2 text-left transition-all ${
                        isMyVote
                          ? "border-green-500 bg-green-500/20"
                          : activePoll.myVote
                          ? "border-gray-600 bg-gray-700/50"
                          : "border-gray-600 hover:border-pink-500 hover:bg-pink-500/10"
                      } ${!activePoll.isActive || activePoll.myVote ? "cursor-default" : "cursor-pointer"}`}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-white text-sm flex items-center gap-2">
                          {isMyVote && <Check className="h-4 w-4 text-green-400" />}
                          {opt}
                        </span>
                        {(activePoll.myVote || !activePoll.isActive) && (
                          <span className="text-gray-400 text-xs">{voteCount} ({percent}%)</span>
                        )}
                      </div>
                      {(activePoll.myVote || !activePoll.isActive) && (
                        <div className="h-1.5 bg-gray-700 rounded-full overflow-hidden">
                          <div className={`h-full transition-all ${isMyVote ? "bg-green-500" : "bg-pink-500"}`} style={{ width: `${percent}%` }} />
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>
              {activePoll.myVote && activePoll.isActive && (
                <p className="text-green-400 text-xs text-center mt-3">✓ You voted for "{activePoll.myVote}"</p>
              )}
              {!activePoll.isActive && (
                <p className="text-gray-400 text-xs text-center mt-3">Poll has ended</p>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Controls - Mobile responsive */}
      <div className="bg-gray-800 border-t border-gray-700 px-2 md:px-4 py-1.5 md:py-2">
        <div className="flex items-center justify-center gap-2 md:gap-3">
          <Button
            onClick={toggleAudio}
            size="sm"
            className={`rounded-full w-9 h-9 md:w-10 md:h-10 ${
              isAudioEnabled
                ? "bg-gray-700 hover:bg-gray-600"
                : "bg-red-600 hover:bg-red-700"
            }`}
          >
            {isAudioEnabled ? (
              <Mic className="h-3.5 w-3.5 md:h-4 md:w-4" />
            ) : (
              <MicOff className="h-3.5 w-3.5 md:h-4 md:w-4" />
            )}
          </Button>
          <Button
            onClick={toggleVideo}
            size="sm"
            className={`rounded-full w-9 h-9 md:w-10 md:h-10 ${
              isVideoEnabled
                ? "bg-gray-700 hover:bg-gray-600"
                : "bg-red-600 hover:bg-red-700"
            }`}
          >
            {isVideoEnabled ? (
              <Video className="h-3.5 w-3.5 md:h-4 md:w-4" />
            ) : (
              <VideoOff className="h-3.5 w-3.5 md:h-4 md:w-4" />
            )}
          </Button>
          <Button
            onClick={toggleHandRaise}
            size="sm"
            className={`rounded-full w-9 h-9 md:w-10 md:h-10 ${
              isHandRaised
                ? "bg-yellow-600 hover:bg-yellow-700"
                : "bg-gray-700 hover:bg-gray-600"
            }`}
          >
            <Hand className="h-3.5 w-3.5 md:h-4 md:w-4" />
          </Button>
          <div className="w-px h-5 md:h-6 bg-gray-700 mx-0.5 md:mx-1" />
          <Button
            onClick={leaveClass}
            size="sm"
            className="rounded-full w-9 h-9 md:w-10 md:h-10 bg-red-600 hover:bg-red-700"
          >
            <PhoneOff className="h-3.5 w-3.5 md:h-4 md:w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}

// Teacher video tile - Large center display
function TeacherVideoTile({
  stream,
  isSpeaking,
  isActiveSpeaker,
  onDoubleClick,
}: {
  stream: MediaStream | null;
  isSpeaking?: boolean;
  isActiveSpeaker?: boolean;
  onDoubleClick?: () => void;
}) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [showVideo, setShowVideo] = useState(false);

  useEffect(() => {
    const video = videoRef.current;
    if (!video || !stream) {
      setShowVideo(false);
      return;
    }
    video.srcObject = stream;

    const checkVideoTracks = () => {
      const tracks = stream.getVideoTracks();
      const hasActiveTrack =
        tracks.length > 0 &&
        tracks.some((t) => t.enabled && t.readyState === "live" && !t.muted);
      const hasVideoDimensions = video.videoWidth > 0 && video.videoHeight > 0;
      setShowVideo(hasActiveTrack && hasVideoDimensions);
    };

    setTimeout(checkVideoTracks, 100);
    video.addEventListener("playing", () => setTimeout(checkVideoTracks, 50));
    video.addEventListener("loadeddata", checkVideoTracks);
    const interval = setInterval(checkVideoTracks, 300);

    return () => clearInterval(interval);
  }, [stream]);

  return (
    <div
      onDoubleClick={onDoubleClick}
      className={`w-full max-w-4xl aspect-video bg-gray-800 rounded-lg md:rounded-xl overflow-hidden relative transition-all duration-300 cursor-pointer ${
        isSpeaking
          ? "ring-2 md:ring-4 ring-green-400 shadow-[0_0_20px_rgba(74,222,128,0.5)] md:shadow-[0_0_30px_rgba(74,222,128,0.5)]"
          : "ring-1 md:ring-2 ring-yellow-400"
      }`}
    >
      <video
        ref={videoRef}
        autoPlay
        playsInline
        className={`w-full h-full object-cover ${showVideo ? "" : "hidden"}`}
      />
      {!showVideo && (
        <div className="w-full h-full flex flex-col items-center justify-center bg-gray-900">
          <div
            className={`w-16 h-16 md:w-24 md:h-24 rounded-full bg-gradient-to-br from-yellow-500 to-orange-500 flex items-center justify-center text-2xl md:text-4xl mb-2 md:mb-3 ${
              isSpeaking ? "animate-pulse" : ""
            }`}
          >
            👑
          </div>
          <p className="text-yellow-400 text-sm md:text-lg font-medium">
            Teacher
          </p>
          <p className="text-gray-500 text-xs md:text-sm">
            {stream ? "Video paused" : "Waiting..."}
          </p>
        </div>
      )}
      {/* Speaking indicator */}
      {isSpeaking && (
        <div className="absolute top-2 md:top-3 left-2 md:left-3 flex items-center gap-1 md:gap-2 bg-black/70 px-1.5 md:px-2 py-0.5 md:py-1 rounded">
          <div className="flex gap-0.5">
            <div
              className="w-0.5 md:w-1 h-3 md:h-4 bg-green-400 animate-pulse"
              style={{ animationDelay: "0ms" }}
            />
            <div
              className="w-0.5 md:w-1 h-4 md:h-6 bg-green-400 animate-pulse"
              style={{ animationDelay: "150ms" }}
            />
            <div
              className="w-0.5 md:w-1 h-2 md:h-3 bg-green-400 animate-pulse"
              style={{ animationDelay: "300ms" }}
            />
            <div
              className="w-0.5 md:w-1 h-3 md:h-5 bg-green-400 animate-pulse"
              style={{ animationDelay: "100ms" }}
            />
          </div>
          <span className="text-[10px] md:text-xs text-green-400">LIVE</span>
        </div>
      )}
      <div className="absolute bottom-2 md:bottom-3 left-2 md:left-3 px-1.5 md:px-2 py-0.5 md:py-1 bg-black/70 rounded text-white text-xs md:text-sm flex items-center gap-1 md:gap-2">
        <span className="text-yellow-400">👑</span>Teacher (Host)
      </div>
    </div>
  );
}

// Small student thumbnail for the top strip
function StudentThumbnailView({
  stream,
  name,
  colorIndex,
  isHandRaised,
  isSpeaking,
  isActiveSpeaker,
  isAudioEnabled,
}: {
  stream: MediaStream | undefined;
  name: string;
  colorIndex: number;
  isHandRaised?: boolean;
  isSpeaking?: boolean;
  isActiveSpeaker?: boolean;
  isAudioEnabled?: boolean;
}) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [showVideo, setShowVideo] = useState(false);

  useEffect(() => {
    const video = videoRef.current;
    if (!video || !stream) {
      setShowVideo(false);
      return;
    }
    video.srcObject = stream;

    const checkVideoTracks = () => {
      const tracks = stream.getVideoTracks();
      const hasActiveTrack =
        tracks.length > 0 &&
        tracks.some((t) => t.enabled && t.readyState === "live" && !t.muted);
      const hasVideoDimensions = video.videoWidth > 0 && video.videoHeight > 0;
      setShowVideo(hasActiveTrack && hasVideoDimensions);
    };

    setTimeout(checkVideoTracks, 100);
    video.addEventListener("playing", () => setTimeout(checkVideoTracks, 50));
    video.addEventListener("loadeddata", checkVideoTracks);
    const interval = setInterval(checkVideoTracks, 300);

    return () => clearInterval(interval);
  }, [stream]);

  const colors = [
    "from-blue-500 to-cyan-500",
    "from-purple-500 to-pink-500",
    "from-green-500 to-emerald-500",
    "from-orange-500 to-red-500",
  ];

  return (
    <div
      className={`relative w-40 h-full md:w-full md:h-auto aspect-video flex-shrink-0 bg-gray-800 rounded-lg overflow-hidden transition-all duration-200 ${
        isActiveSpeaker
          ? "ring-2 ring-yellow-400 shadow-[0_0_10px_rgba(250,204,21,0.5)]"
          : isSpeaking
          ? "ring-2 ring-green-400 shadow-[0_0_8px_rgba(74,222,128,0.4)]"
          : "ring-2 ring-gray-600"
      }`}
    >
      <video
        ref={videoRef}
        autoPlay
        playsInline
        className={`w-full h-full object-cover ${showVideo ? "" : "hidden"}`}
      />
      {!showVideo && (
        <div className="w-full h-full flex items-center justify-center">
          <div
            className={`w-12 h-12 md:w-14 md:h-14 rounded-full bg-gradient-to-br ${
              colors[colorIndex % 4]
            } flex items-center justify-center text-white text-lg md:text-xl font-bold ${
              isSpeaking ? "animate-pulse" : ""
            }`}
          >
            {name[0]?.toUpperCase() || "?"}
          </div>
        </div>
      )}
      {/* Speaking indicator */}
      {isSpeaking && (
        <div className="absolute top-0.5 md:top-1 left-0.5 md:left-1 flex gap-0.5">
          <div className="w-0.5 md:w-1 h-2 md:h-3 bg-green-400 animate-pulse" />
          <div
            className="w-0.5 md:w-1 h-3 md:h-4 bg-green-400 animate-pulse"
            style={{ animationDelay: "100ms" }}
          />
          <div
            className="w-0.5 md:w-1 h-1.5 md:h-2 bg-green-400 animate-pulse"
            style={{ animationDelay: "200ms" }}
          />
        </div>
      )}
      {/* Name label */}
      <div className="absolute bottom-0 left-0 right-0 px-1 py-0.5 bg-black/70 text-[8px] md:text-[10px] text-white truncate flex items-center gap-1">
        {isAudioEnabled ? (
          <Mic className="h-2 w-2 md:h-2.5 md:w-2.5 text-green-400" />
        ) : (
          <MicOff className="h-2 w-2 md:h-2.5 md:w-2.5 text-red-400" />
        )}
        {name}
      </div>
      {/* Hand raised */}
      {isHandRaised && (
        <div className="absolute top-0.5 md:top-1 right-0.5 md:right-1 w-4 md:w-5 h-4 md:h-5 bg-yellow-500 rounded-full flex items-center justify-center animate-bounce">
          <Hand className="h-2 md:h-3 w-2 md:w-3 text-white" />
        </div>
      )}
    </div>
  );
}

// Spotlight Video Tile for student room
function SpotlightVideoTile({
  stream,
  name,
  isSpeaking,
  isLocal,
  onDoubleClick,
}: {
  stream: MediaStream | null;
  name: string;
  isSpeaking?: boolean;
  isLocal?: boolean;
  onDoubleClick: () => void;
}) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [showVideo, setShowVideo] = useState(false);

  useEffect(() => {
    const video = videoRef.current;
    if (!video || !stream) {
      setShowVideo(false);
      return;
    }
    video.srcObject = stream;
    const checkVideoTracks = () => {
      const tracks = stream.getVideoTracks();
      const hasActiveTrack =
        tracks.length > 0 &&
        tracks.some((t) => t.enabled && t.readyState === "live" && !t.muted);
      const hasVideoDimensions = video.videoWidth > 0 && video.videoHeight > 0;
      setShowVideo(hasActiveTrack && hasVideoDimensions);
    };
    setTimeout(checkVideoTracks, 100);
    video.addEventListener("playing", () => setTimeout(checkVideoTracks, 50));
    video.addEventListener("loadeddata", checkVideoTracks);
    const interval = setInterval(checkVideoTracks, 300);
    return () => clearInterval(interval);
  }, [stream]);

  return (
    <div
      onDoubleClick={onDoubleClick}
      className={`w-full h-full max-h-[70vh] md:max-h-none md:max-w-4xl aspect-video bg-gray-800 rounded-lg md:rounded-xl overflow-hidden relative transition-all duration-300 cursor-pointer ${
        isSpeaking
          ? "ring-2 md:ring-4 ring-green-400 shadow-[0_0_20px_rgba(74,222,128,0.5)]"
          : "ring-2 ring-pink-500"
      }`}
    >
      <video
        ref={videoRef}
        autoPlay
        playsInline
        muted={isLocal}
        className={`w-full h-full object-cover ${
          isLocal ? "scale-x-[-1]" : ""
        } ${showVideo ? "" : "hidden"}`}
      />
      {!showVideo && (
        <div className="w-full h-full flex flex-col items-center justify-center bg-gray-900">
          <div
            className={`w-20 h-20 md:w-24 md:h-24 rounded-full bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center text-2xl md:text-3xl mb-2 md:mb-3 ${
              isSpeaking ? "animate-pulse" : ""
            }`}
          >
            {name[0]?.toUpperCase() || "?"}
          </div>
          <p className="text-blue-400 text-base md:text-lg font-medium">
            {name}
          </p>
        </div>
      )}
      {isSpeaking && (
        <div className="absolute top-2 md:top-3 left-2 md:left-3 flex items-center gap-1 md:gap-2 bg-black/70 px-1.5 md:px-2 py-0.5 md:py-1 rounded">
          <div className="flex gap-0.5">
            <div className="w-0.5 md:w-1 h-3 md:h-4 bg-green-400 animate-pulse" />
            <div
              className="w-0.5 md:w-1 h-4 md:h-6 bg-green-400 animate-pulse"
              style={{ animationDelay: "150ms" }}
            />
            <div
              className="w-0.5 md:w-1 h-2 md:h-3 bg-green-400 animate-pulse"
              style={{ animationDelay: "300ms" }}
            />
          </div>
          <span className="text-[10px] md:text-xs text-green-400">
            SPEAKING
          </span>
        </div>
      )}
      <div className="absolute bottom-2 md:bottom-3 left-2 md:left-3 px-1.5 md:px-2 py-0.5 md:py-1 bg-black/70 rounded text-white text-xs md:text-sm flex items-center gap-1 md:gap-2">
        🔍 {name} (Spotlight)
      </div>
      <div className="absolute top-2 right-2 px-1.5 py-0.5 bg-black/70 rounded border border-pink-500 text-pink-400 text-[8px] md:text-[10px]">
        Double-click to exit
      </div>
    </div>
  );
}

// Teacher Thumbnail for when teacher is not in spotlight
function TeacherThumbnail({
  stream,
  isSpeaking,
}: {
  stream: MediaStream | null;
  isSpeaking?: boolean;
}) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [showVideo, setShowVideo] = useState(false);

  useEffect(() => {
    const video = videoRef.current;
    if (!video || !stream) {
      setShowVideo(false);
      return;
    }
    video.srcObject = stream;
    const checkVideoTracks = () => {
      const tracks = stream.getVideoTracks();
      const hasActiveTrack =
        tracks.length > 0 &&
        tracks.some((t) => t.enabled && t.readyState === "live" && !t.muted);
      const hasVideoDimensions = video.videoWidth > 0 && video.videoHeight > 0;
      setShowVideo(hasActiveTrack && hasVideoDimensions);
    };
    setTimeout(checkVideoTracks, 100);
    video.addEventListener("playing", () => setTimeout(checkVideoTracks, 50));
    video.addEventListener("loadeddata", checkVideoTracks);
    const interval = setInterval(checkVideoTracks, 300);
    return () => clearInterval(interval);
  }, [stream]);

  return (
    <>
      <video
        ref={videoRef}
        autoPlay
        playsInline
        className={`w-full h-full object-cover ${showVideo ? "" : "hidden"}`}
      />
      {!showVideo && (
        <div className="w-full h-full flex items-center justify-center">
          <div
            className={`w-10 h-10 md:w-12 md:h-12 rounded-full bg-gradient-to-br from-yellow-500 to-orange-500 flex items-center justify-center text-base md:text-lg ${
              isSpeaking ? "animate-pulse" : ""
            }`}
          >
            👑
          </div>
        </div>
      )}
      {isSpeaking && (
        <div className="absolute top-1 left-1 flex gap-0.5">
          <div className="w-1 h-2 md:h-3 bg-green-400 animate-pulse" />
          <div
            className="w-1 h-3 md:h-4 bg-green-400 animate-pulse"
            style={{ animationDelay: "100ms" }}
          />
          <div
            className="w-1 h-1.5 md:h-2 bg-green-400 animate-pulse"
            style={{ animationDelay: "200ms" }}
          />
        </div>
      )}
    </>
  );
}
