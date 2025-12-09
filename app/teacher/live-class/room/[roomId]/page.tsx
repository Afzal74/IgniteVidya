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
  Copy,
  UserX,
  ScreenShare,
  ScreenShareOff,
  AlertCircle,
  MessageCircle,
  Send,
  X,
  BarChart3,
  Check,
  Pencil,
  Eraser,
  Trash2,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

// Speech Recognition API types
declare global {
  interface Window {
    SpeechRecognition: typeof SpeechRecognition;
    webkitSpeechRecognition: typeof SpeechRecognition;
  }
}

interface SpeechRecognition extends EventTarget {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  start(): void;
  stop(): void;
  onresult: (event: SpeechRecognitionEvent) => void;
  onerror: (event: SpeechRecognitionErrorEvent) => void;
  onend: () => void;
}

interface SpeechRecognitionEvent {
  resultIndex: number;
  results: SpeechRecognitionResultList;
}

interface SpeechRecognitionResultList {
  length: number;
  item(index: number): SpeechRecognitionResult;
  [index: number]: SpeechRecognitionResult;
}

interface SpeechRecognitionResult {
  length: number;
  item(index: number): SpeechRecognitionAlternative;
  [index: number]: SpeechRecognitionAlternative;
  isFinal: boolean;
}

interface SpeechRecognitionAlternative {
  transcript: string;
  confidence: number;
}

interface SpeechRecognitionErrorEvent {
  error: string;
  message: string;
}

declare var SpeechRecognition: {
  prototype: SpeechRecognition;
  new (): SpeechRecognition;
};

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
    { urls: "stun:stun3.l.google.com:19302" },
  ],
};

export default function TeacherLiveClassRoomPage() {
  const params = useParams();
  const roomId = params.roomId as string;
  const router = useRouter();
  const myId = useRef(`teacher-${roomId}-${Date.now()}`);

  const [room, setRoom] = useState<any>(null);
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [loading, setLoading] = useState(true);

  const [isAudioEnabled, setIsAudioEnabled] = useState(false);
  const [isVideoEnabled, setIsVideoEnabled] = useState(false);
  const [isScreenSharing, setIsScreenSharing] = useState(false);
  const [localStream, setLocalStream] = useState<MediaStream | null>(null);
  const [screenStream, setScreenStream] = useState<MediaStream | null>(null);
  const [remoteStreams, setRemoteStreams] = useState<Map<string, MediaStream>>(
    new Map()
  );
  const [mediaError, setMediaError] = useState<string | null>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showParticipants, setShowParticipants] = useState(true);
  const [activeSpeaker, setActiveSpeaker] = useState<string | null>(null);
  const [speakingUsers, setSpeakingUsers] = useState<Set<string>>(new Set());
  const [spotlightUser, setSpotlightUser] = useState<string | null>(null); // Double-click to spotlight

  // Chat state
  const [showChat, setShowChat] = useState(false);
  const [chatMessages, setChatMessages] = useState<
    Array<{
      id: string;
      sender: string;
      senderName: string;
      message: string;
      timestamp: number;
      isTeacher?: boolean;
    }>
  >([]);
  const [chatInput, setChatInput] = useState("");
  const [unreadCount, setUnreadCount] = useState(0);
  const chatEndRef = useRef<HTMLDivElement>(null);

  // Direct Message (DM) state
  const [dmTarget, setDmTarget] = useState<{ id: string; name: string } | null>(
    null
  );
  const [dmMessages, setDmMessages] = useState<
    Record<
      string,
      Array<{
        id: string;
        sender: string;
        senderName: string;
        message: string;
        timestamp: number;
        isTeacher?: boolean;
      }>
    >
  >({});
  const [dmInput, setDmInput] = useState("");
  const [dmUnreadCounts, setDmUnreadCounts] = useState<Record<string, number>>(
    {}
  );
  const dmEndRef = useRef<HTMLDivElement>(null);

  // Subtitle state
  const [subtitlesEnabled, setSubtitlesEnabled] = useState(false);
  const [currentSubtitle, setCurrentSubtitle] = useState("");
  const [subtitleLanguage, setSubtitleLanguage] = useState("en-US");
  const recognitionRef = useRef<SpeechRecognition | null>(null);
  const [isRecognitionSupported, setIsRecognitionSupported] = useState(false);
  const subtitleTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Live Reactions state
  const [floatingReactions, setFloatingReactions] = useState<
    Array<{ id: string; emoji: string; x: number; senderName: string }>
  >([]);

  // Whiteboard state
  const [showWhiteboard, setShowWhiteboard] = useState(false);
  const [isDrawing, setIsDrawing] = useState(false);
  const [brushColor, setBrushColor] = useState("#ff0000");
  const [brushSize, setBrushSize] = useState(3);
  const [isEraser, setIsEraser] = useState(false);
  const whiteboardRef = useRef<HTMLCanvasElement>(null);
  const whiteboardCtxRef = useRef<CanvasRenderingContext2D | null>(null);

  // Background blur state
  const [isBlurEnabled, setIsBlurEnabled] = useState(false);
  const [blurIntensity, setBlurIntensity] = useState(10); // 0-20

  // Poll state
  const [showPoll, setShowPoll] = useState(false);
  const [activePoll, setActivePoll] = useState<{
    id: string;
    question: string;
    options: string[];
    votes: Record<string, string>; // oderId -> option
    isActive: boolean;
  } | null>(null);
  const [pollQuestion, setPollQuestion] = useState("");
  const [pollOptions, setPollOptions] = useState(["", ""]);

  // Quick Quiz state (in chat)
  const [showQuizForm, setShowQuizForm] = useState(false);
  const [quizQuestion, setQuizQuestion] = useState("");
  const [quizOptions, setQuizOptions] = useState(["", "", "", ""]);
  const [quizCorrectAnswer, setQuizCorrectAnswer] = useState(0);
  const [quizTimer, setQuizTimer] = useState(30);
  const [activeQuiz, setActiveQuiz] = useState<{
    id: string;
    question: string;
    options: string[];
    correctAnswer: number;
    timeLeft: number;
    answers: Record<string, { answer: number; name: string; time: number }>;
    isActive: boolean;
    questionNumber: number;
    totalQuestions: number;
  } | null>(null);

  // Quiz Stack state - queue of questions to ask
  const [quizStack, setQuizStack] = useState<
    Array<{
      id: string;
      question: string;
      options: string[];
      correctAnswer: number;
      timer: number;
    }>
  >([]);
  const [showLeaderboardBreak, setShowLeaderboardBreak] = useState(false);
  const [quizSessionActive, setQuizSessionActive] = useState(false);

  // Leaderboard state (accumulates across quizzes)
  const [leaderboard, setLeaderboard] = useState<
    Record<string, { name: string; points: number; correct: number }>
  >({});

  const localVideoRef = useRef<HTMLVideoElement>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const audioAnalyzersRef = useRef<
    Map<string, { analyzer: AnalyserNode; source: MediaStreamAudioSourceNode }>
  >(new Map());
  const containerRef = useRef<HTMLDivElement>(null);
  const peerConnections = useRef<Map<string, RTCPeerConnection>>(new Map());
  const localStreamRef = useRef<MediaStream | null>(null);
  const screenStreamRef = useRef<MediaStream | null>(null);
  const channelRef = useRef<any>(null);
  const pendingCandidates = useRef<Map<string, RTCIceCandidateInit[]>>(
    new Map()
  );

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
      const stream = screenStreamRef.current || localStreamRef.current;
      if (stream) {
        stream.getTracks().forEach((track) => {
          console.log("Adding track to peer:", track.kind);
          pc.addTrack(track, stream);
        });
      }

      // Handle incoming tracks
      pc.ontrack = (event) => {
        console.log("Received track from:", oderId, event.track.kind);
        setRemoteStreams((prev) => {
          const newMap = new Map(prev);
          newMap.set(oderId, event.streams[0]);
          return newMap;
        });
      };

      // Handle ICE candidates
      pc.onicecandidate = (event) => {
        if (event.candidate) {
          console.log("Sending ICE candidate to:", oderId);
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
        if (
          pc.iceConnectionState === "failed" ||
          pc.iceConnectionState === "disconnected"
        ) {
          // Try to restart ICE
          pc.restartIce();
        }
      };

      pc.onconnectionstatechange = () => {
        console.log("Connection state for", oderId, ":", pc.connectionState);
        if (pc.connectionState === "failed") {
          setRemoteStreams((prev) => {
            const newMap = new Map(prev);
            newMap.delete(oderId);
            return newMap;
          });
        }
      };

      peerConnections.current.set(oderId, pc);
      return pc;
    },
    []
  );

  // Send offer to a peer
  const sendOffer = useCallback(
    async (oderId: string) => {
      // Check if we already have a working connection
      const existingPc = peerConnections.current.get(oderId);
      if (existingPc) {
        const state = existingPc.connectionState;
        const sigState = existingPc.signalingState;
        console.log(
          "Existing connection for:",
          oderId,
          "connection:",
          state,
          "signaling:",
          sigState
        );

        // If connected or connecting, don't create new offer
        if (
          state === "connected" ||
          state === "connecting" ||
          sigState === "have-local-offer"
        ) {
          console.log("Skipping offer - connection in progress or established");
          return;
        }

        // Close failed/disconnected connection before creating new one
        if (
          state === "failed" ||
          state === "disconnected" ||
          state === "closed"
        ) {
          existingPc.close();
          peerConnections.current.delete(oderId);
        }
      }

      console.log("Sending offer to:", oderId);
      const pc = createPeerConnection(oderId);

      try {
        const offer = await pc.createOffer({
          offerToReceiveAudio: true,
          offerToReceiveVideo: true,
        });
        await pc.setLocalDescription(offer);

        channelRef.current?.send({
          type: "broadcast",
          event: "webrtc-offer",
          payload: { from: myId.current, to: oderId, sdp: offer.sdp },
        });
        console.log("Offer sent to:", oderId);
      } catch (err) {
        console.error("Error sending offer:", err);
      }
    },
    [createPeerConnection]
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

        // Add any pending ICE candidates
        const pending = pendingCandidates.current.get(from) || [];
        for (const candidate of pending) {
          await pc.addIceCandidate(candidate);
        }
        pendingCandidates.current.delete(from);

        const answer = await pc.createAnswer();
        await pc.setLocalDescription(answer);

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
    if (pc.signalingState !== "have-local-offer") return;

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
        // Store for later
        const pending = pendingCandidates.current.get(from) || [];
        pending.push(candidate);
        pendingCandidates.current.set(from, pending);
      }
    },
    []
  );

  // Initialize media
  const initMedia = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { width: { ideal: 640 }, height: { ideal: 480 } },
        audio: true,
      });
      setLocalStream(stream);
      localStreamRef.current = stream;
      setIsVideoEnabled(true);
      setIsAudioEnabled(true);

      if (localVideoRef.current) {
        localVideoRef.current.srcObject = stream;
      }
      return stream;
    } catch (err: any) {
      console.error("Media error:", err);
      setMediaError(
        err.name === "NotReadableError"
          ? "Camera busy. Close other apps."
          : "Could not access camera/mic"
      );
      return null;
    }
  }, []);

  // Setup WebRTC signaling
  useEffect(() => {
    if (!roomId) return;

    const setup = async () => {
      await initMedia();

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
        .on("broadcast", { event: "user-join" }, ({ payload }) => {
          console.log("User joined:", payload.oderId);
          // Don't send offer to ourselves
          if (payload.oderId === myId.current) return;
          // Teacher sends offer to new user after a short delay
          setTimeout(() => sendOffer(payload.oderId), 500);
        })
        .on("broadcast", { event: "user-leave" }, ({ payload }) => {
          console.log("User left:", payload.oderId);
          peerConnections.current.get(payload.oderId)?.close();
          peerConnections.current.delete(payload.oderId);
          setRemoteStreams((prev) => {
            const newMap = new Map(prev);
            newMap.delete(payload.oderId);
            return newMap;
          });
        })
        .on("broadcast", { event: "request-connection" }, ({ payload }) => {
          // Student is requesting connection (e.g., after refresh)
          console.log("Connection requested by:", payload.oderId);
          if (payload.oderId === myId.current) return;
          setTimeout(() => sendOffer(payload.oderId), 300);
        })
        .on("broadcast", { event: "video-toggle" }, ({ payload }) => {
          // Remote user toggled their video - force refresh the stream display
          console.log(
            "Video toggle from:",
            payload.oderId,
            "enabled:",
            payload.videoEnabled
          );
          // Force re-render by creating new Map reference
          setRemoteStreams((prev) => {
            const newMap = new Map(prev);
            return newMap;
          });
        })
        .on("broadcast", { event: "chat-message" }, ({ payload }) => {
          // Received chat message
          setChatMessages((prev) => [...prev, payload]);
          setUnreadCount((prev) => prev + 1);
        })
        .on("broadcast", { event: "dm-message" }, ({ payload }) => {
          // Received direct message from student (not from teacher - those are added locally)
          if (
            (payload.to === myId.current || payload.to === "teacher") &&
            payload.sender !== "teacher"
          ) {
            const senderId = payload.sender;
            setDmMessages((prev) => {
              const existing = prev[senderId] || [];
              // Prevent duplicates
              if (existing.some((m) => m.id === payload.id)) return prev;
              return {
                ...prev,
                [senderId]: [...existing, payload],
              };
            });
            // Increment unread if not currently viewing this DM
            setDmUnreadCounts((prev) => ({
              ...prev,
              [senderId]: (prev[senderId] || 0) + 1,
            }));
          }
        })
        .on("broadcast", { event: "poll-vote" }, ({ payload }) => {
          // Student voted on poll
          setActivePoll((prev) => {
            if (!prev || prev.id !== payload.pollId) return prev;
            return {
              ...prev,
              votes: { ...prev.votes, [payload.oderId]: payload.option },
            };
          });
        })
        .on("broadcast", { event: "quiz-answer" }, ({ payload }) => {
          // Student answered quiz
          setActiveQuiz((prev) => {
            if (!prev || prev.id !== payload.quizId || !prev.isActive)
              return prev;
            if (prev.answers[payload.oderId]) return prev; // Already answered
            return {
              ...prev,
              answers: {
                ...prev.answers,
                [payload.oderId]: {
                  answer: payload.answer,
                  name: payload.name,
                  time: payload.time,
                },
              },
            };
          });
        })
        .on("broadcast", { event: "reaction" }, ({ payload }) => {
          // Student sent a reaction
          const reactionId = `${payload.senderId}-${Date.now()}`;
          const newReaction = {
            id: reactionId,
            emoji: payload.emoji,
            x: Math.random() * 80 + 10, // Random x position (10-90%)
            senderName: payload.senderName,
          };
          setFloatingReactions((prev) => [...prev, newReaction]);
          // Remove after animation
          setTimeout(() => {
            setFloatingReactions((prev) =>
              prev.filter((r) => r.id !== reactionId)
            );
          }, 3000);
        })
        .subscribe(async (status) => {
          console.log("Channel status:", status);
          if (status === "SUBSCRIBED") {
            // Announce teacher presence
            channel.send({
              type: "broadcast",
              event: "teacher-ready",
              payload: { oderId: myId.current },
            });

            // Also fetch existing participants and try to connect to them
            // This handles the case when teacher refreshes
            const { data: existingParticipants } = await supabase
              .from("live_class_participants")
              .select("id")
              .eq("room_id", roomId)
              .is("left_at", null);

            if (existingParticipants && existingParticipants.length > 0) {
              console.log(
                "Found existing participants:",
                existingParticipants.length
              );
              // Send offers to all existing participants after a short delay
              setTimeout(() => {
                existingParticipants.forEach((p) => {
                  sendOffer(p.id);
                });
              }, 1000);
            }

            // Periodically announce presence for late joiners
            const announceInterval = setInterval(() => {
              channel.send({
                type: "broadcast",
                event: "teacher-ready",
                payload: { oderId: myId.current },
              });
            }, 5000);

            // Store interval for cleanup
            (channel as any)._announceInterval = announceInterval;
          }
        });

      channelRef.current = channel;
    };

    setup();
    fetchRoomData();

    // Stop camera on page close/refresh
    const stopAllMedia = () => {
      localStreamRef.current?.getTracks().forEach((t) => t.stop());
      screenStreamRef.current?.getTracks().forEach((t) => t.stop());
    };
    window.addEventListener("beforeunload", stopAllMedia);
    window.addEventListener("pagehide", stopAllMedia);

    return () => {
      window.removeEventListener("beforeunload", stopAllMedia);
      window.removeEventListener("pagehide", stopAllMedia);
      // Stop all media tracks (turns off camera light)
      localStreamRef.current?.getTracks().forEach((t) => t.stop());
      screenStreamRef.current?.getTracks().forEach((t) => t.stop());
      // Close all peer connections
      peerConnections.current.forEach((pc) => pc.close());
      peerConnections.current.clear();
      // Notify and cleanup channel
      if (channelRef.current) {
        if ((channelRef.current as any)._announceInterval) {
          clearInterval((channelRef.current as any)._announceInterval);
        }
        channelRef.current.send({
          type: "broadcast",
          event: "teacher-leave",
          payload: { oderId: myId.current },
        });
        supabase.removeChannel(channelRef.current);
      }
    };
  }, [
    roomId,
    initMedia,
    handleOffer,
    handleAnswer,
    handleIceCandidate,
    sendOffer,
  ]);

  // Subscribe to participant DB changes
  useEffect(() => {
    if (!roomId) return;
    const ch = supabase
      .channel(`db-${roomId}`)
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
      .subscribe();
    return () => {
      supabase.removeChannel(ch);
    };
  }, [roomId]);

  // Voice activity detection for local stream (teacher)
  useEffect(() => {
    if (!localStream || !isAudioEnabled) {
      setSpeakingUsers((prev) => {
        const next = new Set(prev);
        next.delete("teacher");
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
          next.add("teacher");
          setActiveSpeaker("teacher");
        } else {
          next.delete("teacher");
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
  }, [localStream, isAudioEnabled]);

  // Voice activity detection for remote streams
  useEffect(() => {
    if (!audioContextRef.current) {
      audioContextRef.current = new AudioContext();
    }
    const audioContext = audioContextRef.current;

    // Clean up old analyzers for streams that no longer exist
    audioAnalyzersRef.current.forEach((value, oderId) => {
      if (!remoteStreams.has(oderId)) {
        value.source.disconnect();
        audioAnalyzersRef.current.delete(oderId);
      }
    });

    // Set up analyzers for new streams
    remoteStreams.forEach((stream, oderId) => {
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

    // Check all remote streams for voice activity
    const dataArrays: Record<string, Uint8Array> = {};
    audioAnalyzersRef.current.forEach((value, oderId) => {
      dataArrays[oderId] = new Uint8Array(value.analyzer.frequencyBinCount);
    });

    let animationId: number;
    const checkAllAudio = () => {
      let loudestUser: string | null = null;
      let loudestLevel = 15; // Minimum threshold

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
  }, [remoteStreams]);

  const fetchRoomData = async () => {
    const { data } = await supabase
      .from("live_class_rooms")
      .select("*")
      .eq("id", roomId)
      .single();
    if (data) {
      setRoom(data);
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

  const toggleAudio = () => {
    if (localStreamRef.current) {
      const enabled = !isAudioEnabled;
      localStreamRef.current.getAudioTracks().forEach((t) => {
        t.enabled = enabled;
      });
      setIsAudioEnabled(enabled);
    }
  };

  const toggleVideo = async () => {
    if (isVideoEnabled && localStreamRef.current) {
      // Stop and remove video tracks
      localStreamRef.current.getVideoTracks().forEach((t) => {
        t.stop();
        localStreamRef.current?.removeTrack(t);
      });
      // Replace with null in peer connections (keeps sender for later)
      peerConnections.current.forEach((pc) => {
        const sender = pc.getSenders().find((s) => s.track?.kind === "video");
        if (sender) sender.replaceTrack(null);
      });
      setIsVideoEnabled(false);
      // Notify others
      channelRef.current?.send({
        type: "broadcast",
        event: "video-toggle",
        payload: { oderId: myId.current, videoEnabled: false },
      });
    } else {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: true,
        });
        const track = stream.getVideoTracks()[0];
        localStreamRef.current?.addTrack(track);
        setLocalStream(localStreamRef.current);
        setIsVideoEnabled(true);
        // Update track in all peer connections
        peerConnections.current.forEach((pc) => {
          // Find video sender (even if track is null)
          const sender = pc
            .getSenders()
            .find((s) => s.track?.kind === "video" || s.track === null);
          if (sender) {
            sender.replaceTrack(track);
          } else {
            pc.addTrack(track, localStreamRef.current!);
          }
        });
        // Notify others
        channelRef.current?.send({
          type: "broadcast",
          event: "video-toggle",
          payload: { oderId: myId.current, videoEnabled: true },
        });
      } catch (e) {
        setMediaError("Could not enable camera");
      }
    }
  };

  const toggleScreenShare = async () => {
    if (!isScreenSharing) {
      try {
        const stream = await navigator.mediaDevices.getDisplayMedia({
          video: true,
        });
        setScreenStream(stream);
        screenStreamRef.current = stream;
        setIsScreenSharing(true);

        const screenTrack = stream.getVideoTracks()[0];
        // Replace video track in all connections
        peerConnections.current.forEach((pc) => {
          const sender = pc.getSenders().find((s) => s.track?.kind === "video");
          if (sender) sender.replaceTrack(screenTrack);
        });

        screenTrack.onended = () => {
          setScreenStream(null);
          screenStreamRef.current = null;
          setIsScreenSharing(false);
          // Restore camera
          const camTrack = localStreamRef.current?.getVideoTracks()[0];
          if (camTrack) {
            peerConnections.current.forEach((pc) => {
              const sender = pc
                .getSenders()
                .find((s) => s.track?.kind === "video");
              if (sender) sender.replaceTrack(camTrack);
            });
          }
        };
      } catch (e) {
        console.error("Screen share error:", e);
      }
    } else {
      screenStreamRef.current?.getTracks().forEach((t) => t.stop());
      setScreenStream(null);
      screenStreamRef.current = null;
      setIsScreenSharing(false);
      const camTrack = localStreamRef.current?.getVideoTracks()[0];
      if (camTrack) {
        peerConnections.current.forEach((pc) => {
          const sender = pc.getSenders().find((s) => s.track?.kind === "video");
          if (sender) sender.replaceTrack(camTrack);
        });
      }
    }
  };

  // Subtitle functions
  const initializeSpeechRecognition = () => {
    if (typeof window !== "undefined") {
      const SpeechRecognition =
        window.SpeechRecognition || window.webkitSpeechRecognition;
      if (SpeechRecognition) {
        setIsRecognitionSupported(true);
        const recognition = new SpeechRecognition();
        recognition.continuous = true;
        recognition.interimResults = true;
        recognition.lang = subtitleLanguage;

        recognition.onresult = (event) => {
          let finalTranscript = "";
          let interimTranscript = "";

          for (let i = event.resultIndex; i < event.results.length; i++) {
            const transcript = event.results[i][0].transcript;
            if (event.results[i].isFinal) {
              finalTranscript += transcript;
            } else {
              interimTranscript += transcript;
            }
          }

          const currentText = finalTranscript || interimTranscript;
          if (currentText.trim()) {
            setCurrentSubtitle(currentText);
            // Broadcast to students
            channelRef.current?.send({
              type: "broadcast",
              event: "subtitle-update",
              payload: { text: currentText },
            });

            // Clear existing timeout
            if (subtitleTimeoutRef.current) {
              clearTimeout(subtitleTimeoutRef.current);
            }

            // Auto-hide subtitles after 2 seconds of silence (faster clear)
            subtitleTimeoutRef.current = setTimeout(() => {
              setCurrentSubtitle("");
              channelRef.current?.send({
                type: "broadcast",
                event: "subtitle-clear",
                payload: {},
              });
            }, 2000);
          }
        };

        recognition.onerror = (event) => {
          // Ignore "no-speech" errors - this is normal when user is silent
          if (event.error === "no-speech" || event.error === "aborted") {
            return; // Silent ignore - not an actual error
          }
          console.error("Speech recognition error:", event.error);
          if (event.error === "not-allowed") {
            setMediaError("Microphone permission denied for subtitles");
          } else if (event.error === "network") {
            setMediaError("Network error - check your connection");
          }
        };

        recognition.onend = () => {
          // Auto-restart if subtitles are still enabled
          if (subtitlesEnabled && recognitionRef.current) {
            setTimeout(() => {
              try {
                recognitionRef.current?.start();
              } catch (e) {
                console.log("Recognition restart failed:", e);
              }
            }, 100);
          }
        };

        recognitionRef.current = recognition;
      } else {
        setIsRecognitionSupported(false);
      }
    }
  };

  const endClass = async () => {
    if (!confirm("End class?")) return;

    // Clear video element first
    if (localVideoRef.current) {
      localVideoRef.current.srcObject = null;
    }

    // Stop all media tracks (turns off camera light)
    localStreamRef.current?.getTracks().forEach((t) => t.stop());
    screenStreamRef.current?.getTracks().forEach((t) => t.stop());
    setLocalStream(null);
    setScreenStream(null);
    localStreamRef.current = null;
    screenStreamRef.current = null;

    // Notify and cleanup
    channelRef.current?.send({
      type: "broadcast",
      event: "class-end",
      payload: {},
    });
    peerConnections.current.forEach((pc) => pc.close());
    peerConnections.current.clear();

    await supabase
      .from("live_class_rooms")
      .update({ status: "ended", ended_at: new Date().toISOString() })
      .eq("id", roomId);
    router.push("/teacher/live-class");
  };

  const removeParticipant = async (id: string) => {
    await supabase
      .from("live_class_participants")
      .update({ left_at: new Date().toISOString() })
      .eq("id", id);
  };

  const lowerHand = async (id: string) => {
    await supabase
      .from("live_class_participants")
      .update({ is_hand_raised: false })
      .eq("id", id);
  };

  const copyCode = () => room && navigator.clipboard.writeText(room.room_code);
  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      containerRef.current?.requestFullscreen();
      setIsFullscreen(true);
    } else {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  };

  const getColor = (i: number) =>
    [
      "from-blue-500 to-cyan-500",
      "from-purple-500 to-pink-500",
      "from-green-500 to-emerald-500",
      "from-orange-500 to-red-500",
    ][i % 4];
  const raisedHands = participants.filter((p) => p.is_hand_raised);

  // Send chat message
  const sendChatMessage = () => {
    if (!chatInput.trim() || !channelRef.current) return;
    const msg = {
      id: `teacher-${Date.now()}`,
      sender: "teacher",
      senderName: "Teacher",
      message: chatInput.trim(),
      timestamp: Date.now(),
      isTeacher: true,
    };
    channelRef.current.send({
      type: "broadcast",
      event: "chat-message",
      payload: msg,
    });
    setChatMessages((prev) => [...prev, msg]);
    setChatInput("");
  };

  // Direct Message functions
  const openDm = (studentId: string, studentName: string) => {
    setDmTarget({ id: studentId, name: studentName });
    // Clear unread count for this student
    setDmUnreadCounts((prev) => ({ ...prev, [studentId]: 0 }));
  };

  const closeDm = () => {
    setDmTarget(null);
    setDmInput("");
  };

  const sendDmMessage = () => {
    if (!dmInput.trim() || !channelRef.current || !dmTarget) return;
    const msg = {
      id: `dm-teacher-${Date.now()}`,
      sender: "teacher",
      senderName: "Teacher",
      to: dmTarget.id,
      toName: dmTarget.name,
      message: dmInput.trim(),
      timestamp: Date.now(),
      isTeacher: true,
    };
    channelRef.current.send({
      type: "broadcast",
      event: "dm-message",
      payload: msg,
    });
    // Add to local DM messages
    setDmMessages((prev) => ({
      ...prev,
      [dmTarget.id]: [...(prev[dmTarget.id] || []), msg],
    }));
    setDmInput("");
  };

  // Get total DM unread count
  const totalDmUnread = Object.values(dmUnreadCounts).reduce(
    (a, b) => a + b,
    0
  );

  // Whiteboard functions
  const initWhiteboard = useCallback(() => {
    const canvas = whiteboardRef.current;
    if (!canvas) return;
    
    canvas.width = canvas.offsetWidth;
    canvas.height = canvas.offsetHeight;
    
    const ctx = canvas.getContext("2d");
    if (ctx) {
      ctx.lineCap = "round";
      ctx.lineJoin = "round";
      ctx.strokeStyle = brushColor;
      ctx.lineWidth = brushSize;
      whiteboardCtxRef.current = ctx;
      
      // Fill with white background
      ctx.fillStyle = "#ffffff";
      ctx.fillRect(0, 0, canvas.width, canvas.height);
    }
  }, [brushColor, brushSize]);

  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    const canvas = whiteboardRef.current;
    const ctx = whiteboardCtxRef.current;
    if (!canvas || !ctx) return;

    setIsDrawing(true);
    
    const rect = canvas.getBoundingClientRect();
    let x, y;
    
    if ('touches' in e) {
      x = e.touches[0].clientX - rect.left;
      y = e.touches[0].clientY - rect.top;
    } else {
      x = e.clientX - rect.left;
      y = e.clientY - rect.top;
    }

    ctx.beginPath();
    ctx.moveTo(x, y);
    
    // Broadcast start point
    channelRef.current?.send({
      type: "broadcast",
      event: "whiteboard-draw",
      payload: { type: "start", x, y, color: isEraser ? "#ffffff" : brushColor, size: isEraser ? brushSize * 3 : brushSize },
    });
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;
    
    const canvas = whiteboardRef.current;
    const ctx = whiteboardCtxRef.current;
    if (!canvas || !ctx) return;

    const rect = canvas.getBoundingClientRect();
    let x, y;
    
    if ('touches' in e) {
      e.preventDefault();
      x = e.touches[0].clientX - rect.left;
      y = e.touches[0].clientY - rect.top;
    } else {
      x = e.clientX - rect.left;
      y = e.clientY - rect.top;
    }

    ctx.strokeStyle = isEraser ? "#ffffff" : brushColor;
    ctx.lineWidth = isEraser ? brushSize * 3 : brushSize;
    ctx.lineTo(x, y);
    ctx.stroke();
    
    // Broadcast draw point
    channelRef.current?.send({
      type: "broadcast",
      event: "whiteboard-draw",
      payload: { type: "draw", x, y, color: isEraser ? "#ffffff" : brushColor, size: isEraser ? brushSize * 3 : brushSize },
    });
  };

  const stopDrawing = () => {
    if (isDrawing) {
      setIsDrawing(false);
      channelRef.current?.send({
        type: "broadcast",
        event: "whiteboard-draw",
        payload: { type: "end" },
      });
    }
  };

  const clearWhiteboard = () => {
    const canvas = whiteboardRef.current;
    const ctx = whiteboardCtxRef.current;
    if (!canvas || !ctx) return;
    
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Broadcast clear
    channelRef.current?.send({
      type: "broadcast",
      event: "whiteboard-clear",
      payload: {},
    });
  };

  // Initialize whiteboard when shown
  useEffect(() => {
    if (showWhiteboard) {
      setTimeout(initWhiteboard, 100);
    }
  }, [showWhiteboard, initWhiteboard]);

  // Subtitle functions
  useEffect(() => {
    // Check if speech recognition is supported
    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;
    setIsRecognitionSupported(!!SpeechRecognition);
  }, []);

  const toggleSubtitles = () => {
    if (!isRecognitionSupported) {
      setMediaError(
        "Speech recognition not supported in this browser. Try Chrome or Edge."
      );
      return;
    }

    if (!subtitlesEnabled) {
      // Start subtitles
      if (!recognitionRef.current) {
        initializeSpeechRecognition();
      }

      try {
        recognitionRef.current?.start();
        setSubtitlesEnabled(true);
        setCurrentSubtitle("");
      } catch (e) {
        console.error("Failed to start speech recognition:", e);
        setMediaError("Failed to start speech recognition");
      }
    } else {
      // Stop subtitles
      recognitionRef.current?.stop();
      setSubtitlesEnabled(false);
      setCurrentSubtitle("");
      // Clear subtitles for students
      channelRef.current?.send({
        type: "broadcast",
        event: "subtitle-clear",
        payload: {},
      });
    }
  };

  // Poll functions
  const createPoll = () => {
    if (!pollQuestion.trim() || pollOptions.filter((o) => o.trim()).length < 2)
      return;
    const poll = {
      id: `poll-${Date.now()}`,
      question: pollQuestion.trim(),
      options: pollOptions.filter((o) => o.trim()),
      votes: {},
      isActive: true,
    };
    setActivePoll(poll);
    channelRef.current?.send({
      type: "broadcast",
      event: "poll-start",
      payload: poll,
    });
    setPollQuestion("");
    setPollOptions(["", ""]);
  };

  const endPoll = () => {
    if (!activePoll) return;
    channelRef.current?.send({
      type: "broadcast",
      event: "poll-end",
      payload: { pollId: activePoll.id },
    });
    setActivePoll((prev) => (prev ? { ...prev, isActive: false } : null));
  };

  const clearPoll = () => {
    setActivePoll(null);
  };

  // Quiz Stack functions

  // Add question to stack
  const addToQuizStack = () => {
    const validOptions = quizOptions.filter((o) => o.trim());
    if (!quizQuestion.trim() || validOptions.length < 2) return;
    const newQuestion = {
      id: `q-${Date.now()}`,
      question: quizQuestion.trim(),
      options: validOptions,
      correctAnswer: quizCorrectAnswer,
      timer: quizTimer,
    };
    setQuizStack((prev) => [...prev, newQuestion]);
    setQuizQuestion("");
    setQuizOptions(["", "", "", ""]);
    setQuizCorrectAnswer(0);
  };

  // Remove question from stack
  const removeFromQuizStack = (id: string) => {
    setQuizStack((prev) => prev.filter((q) => q.id !== id));
  };

  // Start the quiz session (runs through all questions in stack)
  const startQuizSession = () => {
    if (quizStack.length === 0) return;
    setQuizSessionActive(true);
    setLeaderboard({}); // Reset leaderboard for new session
    startNextQuestion(0);
  };

  // Start a specific question from the stack
  const startNextQuestion = (index: number) => {
    if (index >= quizStack.length) {
      // All questions done - show final leaderboard
      setQuizSessionActive(false);
      setShowLeaderboardBreak(true);
      channelRef.current?.send({
        type: "broadcast",
        event: "quiz-session-end",
        payload: { message: "Quiz Complete!" },
      });
      return;
    }

    const q = quizStack[index];
    const quiz = {
      id: `quiz-${Date.now()}`,
      question: q.question,
      options: q.options,
      correctAnswer: q.correctAnswer,
      timeLeft: q.timer,
      answers: {},
      isActive: true,
      questionNumber: index + 1,
      totalQuestions: quizStack.length,
    };
    setActiveQuiz(quiz);
    setShowLeaderboardBreak(false);
    channelRef.current?.send({
      type: "broadcast",
      event: "quiz-start",
      payload: {
        ...quiz,
        correctAnswer: undefined,
        questionNumber: index + 1,
        totalQuestions: quizStack.length,
      },
    });
  };

  // Current question index based on activeQuiz
  const currentQuestionIndex = activeQuiz
    ? (activeQuiz.questionNumber || 1) - 1
    : -1;

  const endQuiz = () => {
    if (!activeQuiz) return;

    // Calculate points for correct answers (100 points per second remaining)
    const questionResults: Array<{
      oderId: string;
      name: string;
      points: number;
    }> = [];
    Object.entries(activeQuiz.answers).forEach(([oderId, data]) => {
      if (data.answer === activeQuiz.correctAnswer) {
        const points = data.time * 100; // 100 points per second remaining
        questionResults.push({ oderId, name: data.name, points });
        // Update cumulative leaderboard
        setLeaderboard((prev) => ({
          ...prev,
          [oderId]: {
            name: data.name,
            points: (prev[oderId]?.points || 0) + points,
            correct: (prev[oderId]?.correct || 0) + 1,
          },
        }));
      }
    });

    // Get updated cumulative leaderboard for display
    // We need to calculate it here since setState is async
    const updatedLeaderboard = { ...leaderboard };
    questionResults.forEach((r) => {
      updatedLeaderboard[r.oderId] = {
        name: r.name,
        points: (updatedLeaderboard[r.oderId]?.points || 0) + r.points,
        correct: (updatedLeaderboard[r.oderId]?.correct || 0) + 1,
      };
    });

    // Sort cumulative leaderboard
    const sortedCumulative = Object.entries(updatedLeaderboard)
      .map(([id, data]) => ({
        oderId: id,
        name: data.name,
        points: data.points,
      }))
      .sort((a, b) => b.points - a.points);

    const top5 = sortedCumulative.slice(0, 5);
    const isLastQuestion =
      activeQuiz.questionNumber === activeQuiz.totalQuestions;

    channelRef.current?.send({
      type: "broadcast",
      event: "quiz-end",
      payload: {
        quizId: activeQuiz.id,
        correctAnswer: activeQuiz.correctAnswer,
        leaderboard: top5,
        fullLeaderboard: sortedCumulative,
        totalParticipants: Object.keys(activeQuiz.answers).length,
        questionNumber: activeQuiz.questionNumber,
        totalQuestions: activeQuiz.totalQuestions,
        isLastQuestion,
      },
    });

    setActiveQuiz((prev) => (prev ? { ...prev, isActive: false } : null));

    // Show leaderboard break before next question
    if (quizSessionActive && !isLastQuestion) {
      setShowLeaderboardBreak(true);
    }
  };

  // Continue to next question after leaderboard break
  const continueToNextQuestion = () => {
    if (!activeQuiz) return;
    setShowLeaderboardBreak(false);
    setActiveQuiz(null);
    startNextQuestion(activeQuiz.questionNumber || 0);
  };

  // Clear quiz and reset all quiz-related state
  const clearQuiz = () => {
    setActiveQuiz(null);
    setShowLeaderboardBreak(false);
    setQuizSessionActive(false);
    // Don't clear the stack - teacher might want to run it again
  };

  // End quiz session early
  const endQuizSession = () => {
    setQuizSessionActive(false);
    setActiveQuiz(null);
    setShowLeaderboardBreak(false);
    channelRef.current?.send({
      type: "broadcast",
      event: "quiz-session-end",
      payload: { message: "Quiz ended by teacher" },
    });
  };

  // Clear quiz stack
  const clearQuizStack = () => {
    setQuizStack([]);
    setQuizSessionActive(false);
  };

  // Get sorted leaderboard for display
  const sortedLeaderboard = Object.entries(leaderboard)
    .map(([id, data]) => ({ id, ...data }))
    .sort((a, b) => b.points - a.points)
    .slice(0, 5);

  // Quiz timer
  useEffect(() => {
    if (!activeQuiz?.isActive || activeQuiz.timeLeft <= 0) return;
    const timer = setInterval(() => {
      setActiveQuiz((prev) => {
        if (!prev || !prev.isActive) return prev;
        if (prev.timeLeft <= 1) {
          endQuiz();
          return { ...prev, timeLeft: 0, isActive: false };
        }
        return { ...prev, timeLeft: prev.timeLeft - 1 };
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [activeQuiz?.isActive, activeQuiz?.id]);

  // Auto-scroll chat and reset unread when chat is opened
  useEffect(() => {
    if (showChat) {
      setUnreadCount(0);
      chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [showChat, chatMessages]);

  // Initialize speech recognition on mount
  useEffect(() => {
    initializeSpeechRecognition();
    return () => {
      // Cleanup on unmount
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
      if (subtitleTimeoutRef.current) {
        clearTimeout(subtitleTimeoutRef.current);
      }
    };
  }, []);

  // Update recognition language when changed
  useEffect(() => {
    if (recognitionRef.current) {
      recognitionRef.current.lang = subtitleLanguage;
    }
  }, [subtitleLanguage]);

  if (loading)
    return (
      <div
        className="min-h-screen flex items-center justify-center bg-[#0f0f23]"
        style={{ fontFamily: '"Press Start 2P", cursive' }}
      >
        <div className="text-center bg-[#1a1a3e] border-4 border-[#00ff41] p-8">
          <div className="text-4xl mb-4 animate-pulse">📡</div>
          <p className="text-xs text-[#00ff41]">CONNECTING...</p>
        </div>
      </div>
    );
  if (!room)
    return (
      <div
        className="min-h-screen flex items-center justify-center bg-[#0f0f23]"
        style={{ fontFamily: '"Press Start 2P", cursive' }}
      >
        <div className="text-center bg-[#1a1a3e] border-4 border-[#ff0000] p-8">
          <div className="text-4xl mb-4">❌</div>
          <p className="text-xs text-[#ff0000]">CLASS NOT FOUND</p>
        </div>
      </div>
    );

  // Build video grid - use streamId as part of key to force re-render on stream change
  const teacherStreamId =
    (isScreenSharing ? screenStream?.id : localStream?.id) || "no-stream";
  const allVideos: Array<{
    id: string;
    name: string;
    stream: MediaStream | null;
    isLocal: boolean;
    isTeacher: boolean;
    isHandRaised?: boolean;
    streamKey: string;
    isSpeaking: boolean;
    isActiveSpeaker: boolean;
  }> = [
    {
      id: "teacher",
      name: "You (Host)",
      stream: isScreenSharing ? screenStream : localStream,
      isLocal: true,
      isTeacher: true,
      isHandRaised: false,
      streamKey: `teacher-${teacherStreamId}`,
      isSpeaking: speakingUsers.has("teacher"),
      isActiveSpeaker: activeSpeaker === "teacher",
    },
    ...Array.from(remoteStreams.entries()).map(([oderId, stream]) => {
      const p = participants.find((x) => x.id === oderId);
      return {
        id: oderId,
        name: p?.student_name || "Student",
        stream,
        isLocal: false,
        isTeacher: false,
        isHandRaised: p?.is_hand_raised,
        streamKey: `${oderId}-${stream?.id || "no-stream"}`,
        isSpeaking: speakingUsers.has(oderId),
        isActiveSpeaker: activeSpeaker === oderId,
      };
    }),
  ];

  // Sort to put active speaker first (if not teacher)
  const sortedVideos = [...allVideos].sort((a, b) => {
    if (a.isActiveSpeaker && !a.isTeacher) return -1;
    if (b.isActiveSpeaker && !b.isTeacher) return 1;
    if (a.isTeacher) return -1;
    if (b.isTeacher) return 1;
    return 0;
  });

  return (
    <div
      ref={containerRef}
      className="h-screen pt-16 bg-[#0f0f23] flex flex-col relative overflow-hidden"
      style={{ fontFamily: '"Press Start 2P", cursive' }}
    >
      {/* Pixel Grid Background */}
      <div
        className="fixed inset-0 top-16 opacity-5 pointer-events-none"
        style={{
          backgroundImage: `linear-gradient(0deg, transparent 24%, rgba(0, 255, 65, .1) 25%, rgba(0, 255, 65, .1) 26%, transparent 27%, transparent 74%, rgba(0, 255, 65, .1) 75%, rgba(0, 255, 65, .1) 76%, transparent 77%, transparent),
        linear-gradient(90deg, transparent 24%, rgba(0, 255, 65, .1) 25%, rgba(0, 255, 65, .1) 26%, transparent 27%, transparent 74%, rgba(0, 255, 65, .1) 75%, rgba(0, 255, 65, .1) 76%, transparent 77%, transparent)`,
          backgroundSize: "50px 50px",
        }}
      />

      {/* Floating Reactions Overlay */}
      <div className="fixed inset-0 top-16 pointer-events-none z-50 overflow-hidden">
        <AnimatePresence>
          {floatingReactions.map((reaction) => (
            <motion.div
              key={reaction.id}
              initial={{ y: "100vh", opacity: 1, scale: 0.5 }}
              animate={{
                y: "-100vh",
                opacity: [1, 1, 0],
                scale: [0.5, 1.2, 1],
              }}
              exit={{ opacity: 0 }}
              transition={{ duration: 3, ease: "easeOut" }}
              className="absolute bottom-0"
              style={{ left: `${reaction.x}%` }}
            >
              <div className="flex flex-col items-center">
                <span className="text-3xl md:text-4xl drop-shadow-lg">
                  {reaction.emoji}
                </span>
                <span className="text-[8px] text-white bg-black/50 px-1 rounded mt-1">
                  {reaction.senderName}
                </span>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* Header - Compact */}
      <div className="bg-[#1a1a3e] border-b-2 border-[#00ff41] px-3 py-1.5 flex items-center justify-between relative z-10 flex-shrink-0">
        <div className="flex items-center gap-2">
          <h1 className="text-[#00ff41] text-[8px] sm:text-[10px] font-bold truncate max-w-[150px]">
            {room.room_name}
          </h1>
          <span className="px-1 py-0.5 bg-[#ff0000] border border-[#ff0000] text-white text-[6px] animate-pulse">
            ● LIVE
          </span>
          <button
            onClick={copyCode}
            className="flex items-center gap-1 bg-[#0f0f23] border border-[#00d4ff] px-1.5 py-0.5 text-[#00d4ff] text-[6px] hover:bg-[#00d4ff] hover:text-[#0f0f23] transition-colors"
          >
            <Copy className="h-2 w-2" />
            {room.room_code}
          </button>
        </div>
        <div className="flex items-center gap-1">
          {raisedHands.length > 0 && (
            <div className="px-1 py-0.5 bg-[#ff00ff] border border-[#ff00ff] text-white text-[6px] animate-pulse">
              <Hand className="h-2 w-2 inline mr-0.5" />
              {raisedHands.length}
            </div>
          )}
          <button
            onClick={() => {
              setShowChat(!showChat);
              if (!showChat) setUnreadCount(0);
            }}
            className="relative bg-[#0f0f23] border border-[#00d4ff] p-0.5 text-[#00d4ff] hover:bg-[#00d4ff] hover:text-[#0f0f23] transition-colors"
          >
            <MessageCircle className="h-2 w-2" />
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 w-3 h-3 bg-[#ff0000] rounded-full text-[6px] text-white flex items-center justify-center">
                {unreadCount > 9 ? "9+" : unreadCount}
              </span>
            )}
          </button>
          <button
            onClick={() => setShowParticipants(!showParticipants)}
            className="flex items-center gap-0.5 bg-[#0f0f23] border border-[#00d4ff] px-1.5 py-0.5 text-[#00d4ff] text-[6px] hover:bg-[#00d4ff] hover:text-[#0f0f23] transition-colors"
          >
            <Users className="h-2 w-2" />
            {participants.length}
          </button>
          <button
            onClick={toggleFullscreen}
            className="bg-[#0f0f23] border border-[#00d4ff] p-0.5 text-[#00d4ff] hover:bg-[#00d4ff] hover:text-[#0f0f23] transition-colors"
          >
            {isFullscreen ? (
              <Minimize className="h-2 w-2" />
            ) : (
              <Maximize className="h-2 w-2" />
            )}
          </button>
        </div>
      </div>

      {mediaError && (
        <div className="bg-[#1a1a3e] border-b-2 border-[#ff00ff] px-3 py-1 flex items-center gap-2 text-[#ff00ff] text-[8px] relative z-10 flex-shrink-0">
          <AlertCircle className="h-3 w-3" />
          {mediaError}
        </div>
      )}

      <div className="flex-1 flex overflow-hidden relative z-10">
        {/* Main Layout: Mobile = column, Desktop = row with students on left */}
        <div className="flex-1 p-1 md:p-2 flex flex-col md:flex-row gap-1 md:gap-2">
          {/* Main Video - Host or Spotlighted user */}
          <div className="flex-1 flex items-center justify-center order-1 md:order-2 min-h-0">
            {spotlightUser
              ? // Show spotlighted student
                (() => {
                  const spotlightedVideo = sortedVideos.find(
                    (v) => v.id === spotlightUser
                  );
                  if (!spotlightedVideo) return null;
                  return (
                    <SpotlightVideoTile
                      key={spotlightedVideo.streamKey}
                      stream={spotlightedVideo.stream}
                      name={spotlightedVideo.name}
                      isSpeaking={spotlightedVideo.isSpeaking}
                      onDoubleClick={() => setSpotlightUser(null)}
                    />
                  );
                })()
              : // Show host (teacher)
                sortedVideos
                  .filter((v) => v.isTeacher)
                  .map((v) => (
                    <HostVideoTile
                      key={v.streamKey}
                      stream={v.stream}
                      name={v.name}
                      isLocal={v.isLocal}
                      isSpeaking={v.isSpeaking}
                      isActiveSpeaker={v.isActiveSpeaker}
                      subtitlesEnabled={subtitlesEnabled}
                      currentSubtitle={currentSubtitle}
                      isBlurEnabled={isBlurEnabled}
                    />
                  ))}
          </div>

          {/* Thumbnails - Host (if spotlighted) + Students */}
          <div className="flex flex-row md:flex-col gap-1 md:gap-2 h-24 md:h-auto md:w-32 lg:w-40 flex-shrink-0 order-2 md:order-1 overflow-x-auto md:overflow-x-visible">
            {/* Show host thumbnail when someone else is spotlighted */}
            {spotlightUser &&
              sortedVideos
                .filter((v) => v.isTeacher)
                .map((v) => (
                  <StudentThumbnail
                    key={v.streamKey}
                    stream={v.stream}
                    name={v.name + " (Host)"}
                    colorIndex={99}
                    isHandRaised={false}
                    isSpeaking={v.isSpeaking}
                    isActiveSpeaker={v.isActiveSpeaker}
                    isSpotlighted={false}
                    onDoubleClick={() => setSpotlightUser(null)}
                    onRemove={() => {}}
                  />
                ))}
            {/* Students */}
            {sortedVideos
              .filter((v) => !v.isTeacher)
              .map((v, i) => (
                <StudentThumbnail
                  key={v.streamKey}
                  stream={v.stream}
                  name={v.name}
                  colorIndex={i}
                  isHandRaised={v.isHandRaised}
                  isSpeaking={v.isSpeaking}
                  isActiveSpeaker={v.isActiveSpeaker}
                  isSpotlighted={spotlightUser === v.id}
                  onDoubleClick={() =>
                    setSpotlightUser(spotlightUser === v.id ? null : v.id)
                  }
                  onRemove={() => removeParticipant(v.id)}
                />
              ))}
          </div>
        </div>

        {/* Participants Sidebar - Hidden on mobile */}
        <AnimatePresence>
          {showParticipants && (
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: 200 }}
              exit={{ width: 0 }}
              className="hidden md:block bg-[#1a1a3e] border-l-4 border-[#00d4ff] overflow-hidden"
            >
              <div className="p-2 h-full flex flex-col w-[200px]">
                <h3 className="text-[#00ff41] text-[8px] font-bold mb-2">
                  <Users className="h-3 w-3 inline mr-1" />
                  STUDENTS ({participants.length})
                </h3>
                {raisedHands.length > 0 && (
                  <div className="mb-2">
                    <h4 className="text-[#ff00ff] text-[6px] mb-1">
                      <Hand className="h-2 w-2 inline mr-1" />
                      HANDS UP
                    </h4>
                    {raisedHands.map((p) => (
                      <div
                        key={p.id}
                        className="p-1 bg-[#0f0f23] border border-[#ff00ff] flex items-center justify-between mb-1"
                      >
                        <span className="text-[#ff00ff] text-[6px] truncate">
                          {p.student_name}
                        </span>
                        <button
                          onClick={() => lowerHand(p.id)}
                          className="text-[#ff00ff] hover:text-white"
                        >
                          <Hand className="h-2 w-2" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
                <div className="flex-1 overflow-y-auto space-y-1">
                  {participants.map((p, idx) => (
                    <div
                      key={p.id}
                      className={`p-1 bg-[#0f0f23] border border-[#00d4ff] flex items-center justify-between group ${
                        speakingUsers.has(p.id)
                          ? "border-[#00ff41] shadow-[0_0_5px_#00ff41]"
                          : ""
                      }`}
                    >
                      <div className="flex items-center gap-1 flex-1 min-w-0">
                        <div className="w-5 h-5 bg-[#1a1a3e] border border-[#ff00ff] flex items-center justify-center text-[#ff00ff] text-[6px] font-bold flex-shrink-0">
                          {p.student_name[0]}
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="text-[#00ff41] text-[6px] truncate">
                            {p.student_name}
                          </p>
                          <div className="flex gap-1">
                            {p.is_audio_enabled ? (
                              <Mic className="h-2 w-2 text-[#00ff41]" />
                            ) : (
                              <MicOff className="h-2 w-2 text-[#444]" />
                            )}
                            {p.is_video_enabled ? (
                              <Video className="h-2 w-2 text-[#00ff41]" />
                            ) : (
                              <VideoOff className="h-2 w-2 text-[#444]" />
                            )}
                            {speakingUsers.has(p.id) && (
                              <span className="text-[5px] text-[#ffff00]">
                                🔊
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-0.5">
                        {/* DM Button */}
                        <button
                          onClick={() => {
                            openDm(p.id, p.student_name);
                            setShowChat(true);
                          }}
                          className="relative text-[#00d4ff] hover:text-white"
                        >
                          <MessageCircle className="h-3 w-3" />
                          {dmUnreadCounts[p.id] > 0 && (
                            <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-[#ff0000] rounded-full text-[5px] text-white flex items-center justify-center">
                              {dmUnreadCounts[p.id]}
                            </span>
                          )}
                        </button>
                        <button
                          onClick={() => removeParticipant(p.id)}
                          className="opacity-0 group-hover:opacity-100 text-[#ff0000] flex-shrink-0"
                        >
                          <UserX className="h-3 w-3" />
                        </button>
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
              className="bg-[#1a1a3e] border-l-4 border-[#00d4ff] flex flex-col overflow-hidden"
            >
              {/* DM View */}
              {dmTarget ? (
                <>
                  <div className="p-2 border-b-2 border-[#ff00ff] flex items-center justify-between bg-[#ff00ff]/10">
                    <div className="flex items-center gap-1">
                      <button
                        onClick={closeDm}
                        className="text-[#ff00ff] hover:text-white"
                      >
                        ←
                      </button>
                      <h3 className="text-[#ff00ff] text-[8px] font-bold">
                        💬 DM: {dmTarget.name}
                      </h3>
                    </div>
                    <button
                      onClick={() => {
                        closeDm();
                        setShowChat(false);
                      }}
                      className="text-[#00d4ff] hover:text-white"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                  <div className="flex-1 overflow-y-auto p-2 space-y-2 min-h-0">
                    {(dmMessages[dmTarget.id] || []).length === 0 ? (
                      <p className="text-[#444] text-[8px] text-center py-4">
                        Start a private conversation
                      </p>
                    ) : (
                      (dmMessages[dmTarget.id] || []).map((msg) => (
                        <div
                          key={msg.id}
                          className={`p-2 border ${
                            msg.isTeacher
                              ? "bg-[#00ff41]/10 border-[#00ff41] ml-4"
                              : "bg-[#ff00ff]/10 border-[#ff00ff] mr-4"
                          }`}
                        >
                          <div className="flex items-center gap-1 mb-0.5">
                            <span
                              className={`text-[7px] font-bold ${
                                msg.isTeacher
                                  ? "text-[#00ff41]"
                                  : "text-[#ff00ff]"
                              }`}
                            >
                              {msg.isTeacher ? "👑 You" : msg.senderName}
                            </span>
                            <span className="text-[6px] text-[#666]">
                              {new Date(msg.timestamp).toLocaleTimeString([], {
                                hour: "2-digit",
                                minute: "2-digit",
                              })}
                            </span>
                          </div>
                          <p className="text-white text-[8px] break-words">
                            {msg.message}
                          </p>
                        </div>
                      ))
                    )}
                    <div ref={dmEndRef} />
                  </div>
                  <div className="p-2 border-t-2 border-[#ff00ff]">
                    <div className="flex gap-1">
                      <input
                        type="text"
                        value={dmInput}
                        onChange={(e) => setDmInput(e.target.value)}
                        onKeyDown={(e) => e.key === "Enter" && sendDmMessage()}
                        placeholder={`Message ${dmTarget.name}...`}
                        className="flex-1 bg-[#0f0f23] text-white text-[8px] px-2 py-1.5 border-2 border-[#ff00ff] focus:border-[#00ff41] focus:outline-none"
                      />
                      <button
                        onClick={sendDmMessage}
                        className="px-2 py-1 bg-[#ff00ff] border-2 border-[#ff00ff] text-white hover:bg-[#0f0f23] transition-colors"
                      >
                        <Send className="h-3 w-3" />
                      </button>
                    </div>
                  </div>
                </>
              ) : (
                <>
                  <div className="p-2 border-b-2 border-[#00d4ff] flex items-center justify-between">
                    <h3 className="text-[#00ff41] text-[8px] font-bold flex items-center gap-1">
                      <MessageCircle className="h-3 w-3" /> CHAT
                      {totalDmUnread > 0 && (
                        <span className="ml-1 px-1 py-0.5 bg-[#ff0000] text-white text-[5px] rounded">
                          {totalDmUnread} DM
                        </span>
                      )}
                    </h3>
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => {
                          setShowPoll(!showPoll);
                          setShowQuizForm(false);
                        }}
                        className={`px-1.5 py-0.5 border text-[6px] ${
                          showPoll || activePoll
                            ? "bg-[#ff00ff] border-[#ff00ff] text-white"
                            : "border-[#ff00ff] text-[#ff00ff] hover:bg-[#ff00ff] hover:text-white"
                        }`}
                      >
                        📊 POLL
                      </button>
                      <button
                        onClick={() => {
                          setShowQuizForm(!showQuizForm);
                          setShowPoll(false);
                        }}
                        className={`px-1.5 py-0.5 border text-[6px] ${
                          showQuizForm || activeQuiz
                            ? "bg-[#ffff00] border-[#ffff00] text-[#0f0f23]"
                            : "border-[#ffff00] text-[#ffff00] hover:bg-[#ffff00] hover:text-[#0f0f23]"
                        }`}
                      >
                        🎯 QUIZ
                      </button>
                      <button
                        onClick={() => setShowChat(false)}
                        className="text-[#00d4ff] hover:text-white"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                  </div>

                  {/* Active Poll Display (inside chat) */}
                  {activePoll && (
                    <div className="p-2 border-b-2 border-[#ff00ff] bg-[#ff00ff]/10">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-[#ff00ff] text-[7px] font-bold">
                          📊 LIVE POLL
                        </span>
                        {activePoll.isActive && (
                          <span className="w-2 h-2 bg-[#ff00ff] rounded-full animate-pulse" />
                        )}
                      </div>
                      <p className="text-white text-[8px] mb-2">
                        {activePoll.question}
                      </p>
                      <div className="space-y-1 mb-2">
                        {activePoll.options.map((opt, i) => {
                          const voteCount = Object.values(
                            activePoll.votes
                          ).filter((v) => v === opt).length;
                          const totalVotes = Object.keys(
                            activePoll.votes
                          ).length;
                          const percent =
                            totalVotes > 0
                              ? Math.round((voteCount / totalVotes) * 100)
                              : 0;
                          return (
                            <div key={i} className="mb-1">
                              <div className="flex justify-between text-[7px] text-white mb-0.5">
                                <span>{opt}</span>
                                <span>
                                  {voteCount} ({percent}%)
                                </span>
                              </div>
                              <div className="h-2 bg-[#0f0f23] border border-[#ff00ff]">
                                <div
                                  className="h-full bg-[#ff00ff] transition-all"
                                  style={{ width: `${percent}%` }}
                                />
                              </div>
                            </div>
                          );
                        })}
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-[6px] text-[#666]">
                          {Object.keys(activePoll.votes).length} votes
                        </span>
                        {activePoll.isActive ? (
                          <button
                            onClick={endPoll}
                            className="px-2 py-0.5 bg-[#ff0000] border border-[#ff0000] text-white text-[6px]"
                          >
                            END
                          </button>
                        ) : (
                          <button
                            onClick={clearPoll}
                            className="px-2 py-0.5 bg-[#00d4ff] border border-[#00d4ff] text-[#0f0f23] text-[6px]"
                          >
                            CLEAR
                          </button>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Poll Form (inside chat) */}
                  {showPoll && !activePoll && (
                    <div className="p-2 border-b-2 border-[#ff00ff] bg-[#0f0f23] space-y-2">
                      <input
                        type="text"
                        value={pollQuestion}
                        onChange={(e) => setPollQuestion(e.target.value)}
                        placeholder="Poll question..."
                        className="w-full bg-[#1a1a3e] text-white text-[8px] px-2 py-1 border border-[#ff00ff] focus:outline-none"
                      />
                      {pollOptions.map((opt, i) => (
                        <div key={i} className="flex gap-1 items-center">
                          <input
                            type="text"
                            value={opt}
                            onChange={(e) => {
                              const n = [...pollOptions];
                              n[i] = e.target.value;
                              setPollOptions(n);
                            }}
                            placeholder={`Option ${i + 1}`}
                            className="flex-1 bg-[#1a1a3e] text-white text-[7px] px-2 py-0.5 border border-[#444] focus:border-[#ff00ff] focus:outline-none"
                          />
                          {pollOptions.length > 2 && (
                            <button
                              onClick={() =>
                                setPollOptions(
                                  pollOptions.filter((_, idx) => idx !== i)
                                )
                              }
                              className="text-[#ff0000] text-[8px]"
                            >
                              ✕
                            </button>
                          )}
                        </div>
                      ))}
                      {pollOptions.length < 5 && (
                        <button
                          onClick={() => setPollOptions([...pollOptions, ""])}
                          className="w-full px-2 py-0.5 border border-dashed border-[#ff00ff] text-[#ff00ff] text-[6px] hover:bg-[#ff00ff]/10"
                        >
                          + ADD OPTION
                        </button>
                      )}
                      <button
                        onClick={createPoll}
                        disabled={
                          !pollQuestion.trim() ||
                          pollOptions.filter((o) => o.trim()).length < 2
                        }
                        className="w-full px-2 py-1 bg-[#ff00ff] border-2 border-[#ff00ff] text-white text-[7px] font-bold disabled:opacity-50"
                      >
                        🚀 START POLL
                      </button>
                    </div>
                  )}

                  {/* Active Quiz Display */}
                  {activeQuiz && (
                    <div className="p-2 border-b-2 border-[#ffff00] bg-[#ffff00]/10">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-[#ffff00] text-[7px] font-bold">
                          🎯 Q{activeQuiz.questionNumber}/
                          {activeQuiz.totalQuestions}
                        </span>
                        <span
                          className={`text-[8px] font-bold ${
                            activeQuiz.timeLeft <= 5
                              ? "text-[#ff0000] animate-pulse"
                              : "text-[#00ff41]"
                          }`}
                        >
                          {activeQuiz.timeLeft}s
                        </span>
                      </div>
                      <p className="text-white text-[8px] mb-2">
                        {activeQuiz.question}
                      </p>
                      <div className="space-y-1 mb-2">
                        {activeQuiz.options.map((opt, i) => {
                          const answerCount = Object.values(
                            activeQuiz.answers
                          ).filter((a) => a.answer === i).length;
                          const isCorrect = i === activeQuiz.correctAnswer;
                          return (
                            <div
                              key={i}
                              className={`p-1 border text-[7px] flex justify-between ${
                                !activeQuiz.isActive && isCorrect
                                  ? "border-[#00ff41] bg-[#00ff41]/20 text-[#00ff41]"
                                  : "border-[#444] text-white"
                              }`}
                            >
                              <span>
                                {isCorrect && !activeQuiz.isActive ? "✓ " : ""}
                                {opt}
                              </span>
                              <span>{answerCount}</span>
                            </div>
                          );
                        })}
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-[6px] text-[#666]">
                          {Object.keys(activeQuiz.answers).length} answered
                        </span>
                        {activeQuiz.isActive ? (
                          <button
                            onClick={endQuiz}
                            className="px-2 py-0.5 bg-[#ff0000] border border-[#ff0000] text-white text-[6px]"
                          >
                            END
                          </button>
                        ) : showLeaderboardBreak &&
                          activeQuiz.questionNumber <
                            activeQuiz.totalQuestions ? (
                          <button
                            onClick={continueToNextQuestion}
                            className="px-2 py-0.5 bg-[#00ff41] border border-[#00ff41] text-[#0f0f23] text-[6px] animate-pulse"
                          >
                            NEXT ▶
                          </button>
                        ) : (
                          <button
                            onClick={clearQuiz}
                            className="px-2 py-0.5 bg-[#00d4ff] border border-[#00d4ff] text-[#0f0f23] text-[6px]"
                          >
                            CLEAR
                          </button>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Leaderboard */}
                  {sortedLeaderboard.length > 0 && (
                    <div className="p-2 border-b-2 border-[#00ff41] bg-[#00ff41]/5">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-[#00ff41] text-[7px] font-bold">
                          🏆 LEADERBOARD
                        </span>
                        <button
                          onClick={() => setLeaderboard({})}
                          className="text-[5px] text-[#666] hover:text-white"
                        >
                          RESET
                        </button>
                      </div>
                      <div className="space-y-1">
                        {sortedLeaderboard.map((entry, i) => (
                          <div
                            key={entry.id}
                            className={`flex items-center justify-between p-1 border ${
                              i === 0
                                ? "border-[#ffff00] bg-[#ffff00]/10"
                                : i === 1
                                ? "border-[#c0c0c0] bg-[#c0c0c0]/10"
                                : i === 2
                                ? "border-[#cd7f32] bg-[#cd7f32]/10"
                                : "border-[#444]"
                            }`}
                          >
                            <div className="flex items-center gap-1">
                              <span className="text-[8px]">
                                {i === 0
                                  ? "🥇"
                                  : i === 1
                                  ? "🥈"
                                  : i === 2
                                  ? "🥉"
                                  : `${i + 1}.`}
                              </span>
                              <span className="text-white text-[7px] truncate max-w-[80px]">
                                {entry.name}
                              </span>
                            </div>
                            <div className="text-right">
                              <span className="text-[#00ff41] text-[7px] font-bold">
                                {entry.points.toLocaleString()}
                              </span>
                              <span className="text-[5px] text-[#666] ml-1">
                                ({entry.correct}✓)
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Quiz Form - Stack Based */}
                  {showQuizForm && !activeQuiz && !quizSessionActive && (
                    <div className="p-2 border-b-2 border-[#ffff00] bg-[#0f0f23] space-y-2 max-h-[50vh] overflow-y-auto">
                      {/* Quiz Stack Display */}
                      {quizStack.length > 0 && (
                        <div className="p-1 bg-[#1a1a3e] border border-[#ffff00]">
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-[#ffff00] text-[6px] font-bold">
                              📋 QUIZ STACK ({quizStack.length})
                            </span>
                            <button
                              onClick={clearQuizStack}
                              className="text-[5px] text-[#ff0000] hover:text-white"
                            >
                              CLEAR ALL
                            </button>
                          </div>
                          <div className="space-y-1 max-h-24 overflow-y-auto">
                            {quizStack.map((q, i) => (
                              <div
                                key={q.id}
                                className="flex items-center gap-1 p-1 bg-[#0f0f23] border border-[#444]"
                              >
                                <span className="text-[#ffff00] text-[6px] font-bold w-4">
                                  {i + 1}.
                                </span>
                                <span className="text-white text-[6px] flex-1 truncate">
                                  {q.question}
                                </span>
                                <span className="text-[5px] text-[#666]">
                                  {q.timer}s
                                </span>
                                <button
                                  onClick={() => removeFromQuizStack(q.id)}
                                  className="text-[#ff0000] text-[6px]"
                                >
                                  ✕
                                </button>
                              </div>
                            ))}
                          </div>
                          <button
                            onClick={startQuizSession}
                            className="w-full mt-2 px-2 py-1.5 bg-[#00ff41] border-2 border-[#00ff41] text-[#0f0f23] text-[7px] font-bold"
                          >
                            🚀 START QUIZ SESSION ({quizStack.length} questions)
                          </button>
                        </div>
                      )}

                      {/* Add Question Form */}
                      <p className="text-[6px] text-[#666]">
                        Add questions to stack:
                      </p>
                      <input
                        type="text"
                        value={quizQuestion}
                        onChange={(e) => setQuizQuestion(e.target.value)}
                        placeholder="Question..."
                        className="w-full bg-[#1a1a3e] text-white text-[8px] px-2 py-1 border border-[#ffff00] focus:outline-none"
                      />

                      {quizOptions.map((opt, i) => (
                        <div key={i} className="flex gap-1 items-center">
                          <button
                            onClick={() => setQuizCorrectAnswer(i)}
                            className={`w-4 h-4 border flex items-center justify-center text-[8px] ${
                              quizCorrectAnswer === i
                                ? "bg-[#00ff41] border-[#00ff41] text-[#0f0f23]"
                                : "border-[#444] text-[#444]"
                            }`}
                          >
                            {quizCorrectAnswer === i ? "✓" : i + 1}
                          </button>
                          <input
                            type="text"
                            value={opt}
                            onChange={(e) => {
                              const n = [...quizOptions];
                              n[i] = e.target.value;
                              setQuizOptions(n);
                            }}
                            placeholder={`Option ${i + 1}`}
                            className="flex-1 bg-[#1a1a3e] text-white text-[7px] px-2 py-0.5 border border-[#444] focus:border-[#ffff00] focus:outline-none"
                          />
                        </div>
                      ))}
                      <div className="flex items-center gap-2">
                        <span className="text-[6px] text-[#666]">Timer:</span>
                        <input
                          type="number"
                          value={quizTimer}
                          onChange={(e) =>
                            setQuizTimer(
                              Math.max(
                                5,
                                Math.min(120, parseInt(e.target.value) || 30)
                              )
                            )
                          }
                          className="w-12 bg-[#1a1a3e] text-white text-[8px] px-1 py-0.5 border border-[#444] text-center"
                        />
                        <span className="text-[6px] text-[#666]">sec</span>
                      </div>
                      <button
                        onClick={addToQuizStack}
                        disabled={
                          !quizQuestion.trim() ||
                          quizOptions.filter((o) => o.trim()).length < 2
                        }
                        className="w-full px-2 py-1 bg-[#ffff00] border-2 border-[#ffff00] text-[#0f0f23] text-[7px] font-bold disabled:opacity-50"
                      >
                        + ADD TO STACK
                      </button>
                    </div>
                  )}

                  <div className="flex-1 overflow-y-auto p-2 space-y-2 min-h-0">
                    {chatMessages.length === 0 ? (
                      <p className="text-[#444] text-[8px] text-center py-4">
                        NO MESSAGES YET
                      </p>
                    ) : (
                      chatMessages.map((msg) => (
                        <div
                          key={msg.id}
                          className={`p-2 border ${
                            msg.isTeacher
                              ? "bg-[#00ff41]/10 border-[#00ff41] ml-4"
                              : "bg-[#0f0f23] border-[#00d4ff] mr-4"
                          }`}
                        >
                          <div className="flex items-center gap-1 mb-0.5">
                            <span
                              className={`text-[7px] font-bold ${
                                msg.isTeacher
                                  ? "text-[#00ff41]"
                                  : "text-[#00d4ff]"
                              }`}
                            >
                              {msg.isTeacher ? "👑 " : ""}
                              {msg.senderName}
                              {msg.isTeacher ? " (You)" : ""}
                            </span>
                            <span className="text-[6px] text-[#666]">
                              {new Date(msg.timestamp).toLocaleTimeString([], {
                                hour: "2-digit",
                                minute: "2-digit",
                              })}
                            </span>
                          </div>
                          <p className="text-white text-[8px] break-words">
                            {msg.message}
                          </p>
                        </div>
                      ))
                    )}
                    <div ref={chatEndRef} />
                  </div>
                  <div className="p-2 border-t-2 border-[#00d4ff]">
                    <div className="flex gap-1">
                      <input
                        type="text"
                        value={chatInput}
                        onChange={(e) => setChatInput(e.target.value)}
                        onKeyDown={(e) =>
                          e.key === "Enter" && sendChatMessage()
                        }
                        placeholder="Type message..."
                        className="flex-1 bg-[#0f0f23] text-white text-[8px] px-2 py-1.5 border-2 border-[#00d4ff] focus:border-[#00ff41] focus:outline-none"
                      />
                      <button
                        onClick={sendChatMessage}
                        className="px-2 py-1 bg-[#00ff41] border-2 border-[#00ff41] text-[#0f0f23] hover:bg-[#0f0f23] hover:text-[#00ff41] transition-colors"
                      >
                        <Send className="h-3 w-3" />
                      </button>
                    </div>
                  </div>
                </>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Whiteboard Modal */}
      <AnimatePresence>
        {showWhiteboard && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.9 }}
              className="bg-[#1a1a3e] border-4 border-[#ffff00] rounded-lg w-full max-w-4xl max-h-[80vh] flex flex-col"
            >
              {/* Whiteboard Header */}
              <div className="flex items-center justify-between p-2 border-b-2 border-[#ffff00]">
                <h3 className="text-[#ffff00] text-[10px] font-bold flex items-center gap-2">
                  <Pencil className="h-4 w-4" /> WHITEBOARD
                </h3>
                <div className="flex items-center gap-2">
                  {/* Color Picker */}
                  <div className="flex gap-1">
                    {["#ff0000", "#00ff00", "#0000ff", "#ffff00", "#ff00ff", "#00ffff", "#ffffff", "#000000"].map((color) => (
                      <button
                        key={color}
                        onClick={() => { setBrushColor(color); setIsEraser(false); }}
                        className={`w-5 h-5 rounded border-2 ${brushColor === color && !isEraser ? "border-white" : "border-transparent"}`}
                        style={{ backgroundColor: color }}
                      />
                    ))}
                  </div>
                  {/* Brush Size */}
                  <select
                    value={brushSize}
                    onChange={(e) => setBrushSize(Number(e.target.value))}
                    className="bg-[#0f0f23] text-white text-[8px] px-1 py-0.5 border border-[#ffff00]"
                  >
                    <option value={2}>Thin</option>
                    <option value={5}>Medium</option>
                    <option value={10}>Thick</option>
                  </select>
                  {/* Eraser */}
                  <button
                    onClick={() => setIsEraser(!isEraser)}
                    className={`p-1 border-2 ${isEraser ? "bg-[#ffff00] border-[#ffff00] text-[#0f0f23]" : "border-[#ffff00] text-[#ffff00]"}`}
                  >
                    <Eraser className="h-4 w-4" />
                  </button>
                  {/* Clear */}
                  <button
                    onClick={clearWhiteboard}
                    className="p-1 border-2 border-[#ff0000] text-[#ff0000] hover:bg-[#ff0000] hover:text-white"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                  {/* Close */}
                  <button
                    onClick={() => setShowWhiteboard(false)}
                    className="p-1 border-2 border-[#00d4ff] text-[#00d4ff] hover:bg-[#00d4ff] hover:text-[#0f0f23]"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              </div>
              {/* Canvas */}
              <div className="flex-1 p-2 min-h-[400px]">
                <canvas
                  ref={whiteboardRef}
                  onMouseDown={startDrawing}
                  onMouseMove={draw}
                  onMouseUp={stopDrawing}
                  onMouseLeave={stopDrawing}
                  onTouchStart={startDrawing}
                  onTouchMove={draw}
                  onTouchEnd={stopDrawing}
                  className="w-full h-full bg-white rounded cursor-crosshair touch-none"
                  style={{ minHeight: "400px" }}
                />
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Control Bar - Mobile responsive */}
      <div className="bg-[#1a1a3e] border-t-2 md:border-t-4 border-[#00ff41] px-2 md:px-4 py-1.5 md:py-2 relative z-10 flex-shrink-0">
        <div className="flex items-center justify-center gap-1.5 md:gap-2">
          <button
            onClick={toggleAudio}
            className={`w-9 h-9 md:w-10 md:h-10 border-2 flex items-center justify-center transition-colors ${
              isAudioEnabled
                ? "bg-[#0f0f23] border-[#00ff41] text-[#00ff41] hover:bg-[#00ff41] hover:text-[#0f0f23]"
                : "bg-[#ff0000] border-[#ff0000] text-white"
            }`}
          >
            {isAudioEnabled ? (
              <Mic className="h-3.5 w-3.5 md:h-4 md:w-4" />
            ) : (
              <MicOff className="h-3.5 w-3.5 md:h-4 md:w-4" />
            )}
          </button>
          <button
            onClick={toggleVideo}
            className={`w-9 h-9 md:w-10 md:h-10 border-2 flex items-center justify-center transition-colors ${
              isVideoEnabled
                ? "bg-[#0f0f23] border-[#00ff41] text-[#00ff41] hover:bg-[#00ff41] hover:text-[#0f0f23]"
                : "bg-[#ff0000] border-[#ff0000] text-white"
            }`}
          >
            {isVideoEnabled ? (
              <Video className="h-3.5 w-3.5 md:h-4 md:w-4" />
            ) : (
              <VideoOff className="h-3.5 w-3.5 md:h-4 md:w-4" />
            )}
          </button>
          <button
            onClick={toggleScreenShare}
            className={`hidden md:flex w-10 h-10 border-2 items-center justify-center transition-colors ${
              isScreenSharing
                ? "bg-[#00d4ff] border-[#00d4ff] text-[#0f0f23]"
                : "bg-[#0f0f23] border-[#00d4ff] text-[#00d4ff] hover:bg-[#00d4ff] hover:text-[#0f0f23]"
            }`}
          >
            {isScreenSharing ? (
              <ScreenShareOff className="h-4 w-4" />
            ) : (
              <ScreenShare className="h-4 w-4" />
            )}
          </button>
          {/* Subtitle Button */}
          <button
            onClick={toggleSubtitles}
            disabled={!isRecognitionSupported}
            className={`w-9 h-9 md:w-10 md:h-10 border-2 flex items-center justify-center transition-colors ${
              subtitlesEnabled
                ? "bg-[#ff00ff] border-[#ff00ff] text-white"
                : isRecognitionSupported
                ? "bg-[#0f0f23] border-[#ff00ff] text-[#ff00ff] hover:bg-[#ff00ff] hover:text-[#0f0f23]"
                : "bg-[#444] border-[#444] text-[#666] cursor-not-allowed"
            }`}
            title={
              !isRecognitionSupported
                ? "Speech recognition not supported"
                : subtitlesEnabled
                ? "Stop subtitles"
                : "Start subtitles"
            }
          >
            <span className="text-[10px] md:text-[12px] font-bold">CC</span>
          </button>
          {/* Whiteboard Button */}
          <button
            onClick={() => {
              const newState = !showWhiteboard;
              setShowWhiteboard(newState);
              // Broadcast whiteboard visibility to students
              channelRef.current?.send({
                type: "broadcast",
                event: newState ? "whiteboard-open" : "whiteboard-close",
                payload: {},
              });
            }}
            className={`w-9 h-9 md:w-10 md:h-10 border-2 flex items-center justify-center transition-colors ${
              showWhiteboard
                ? "bg-[#ffff00] border-[#ffff00] text-[#0f0f23]"
                : "bg-[#0f0f23] border-[#ffff00] text-[#ffff00] hover:bg-[#ffff00] hover:text-[#0f0f23]"
            }`}
            title={showWhiteboard ? "Close whiteboard" : "Open whiteboard"}
          >
            <Pencil className="h-3.5 w-3.5 md:h-4 md:w-4" />
          </button>
          {/* Background Blur Button */}
          <button
            onClick={() => setIsBlurEnabled(!isBlurEnabled)}
            className={`w-9 h-9 md:w-10 md:h-10 border-2 flex items-center justify-center transition-colors ${
              isBlurEnabled
                ? "bg-[#00d4ff] border-[#00d4ff] text-[#0f0f23]"
                : "bg-[#0f0f23] border-[#00d4ff] text-[#00d4ff] hover:bg-[#00d4ff] hover:text-[#0f0f23]"
            }`}
            title={isBlurEnabled ? "Disable blur" : "Enable background blur"}
          >
            <span className="text-[10px] md:text-[12px] font-bold">BG</span>
          </button>
          <div className="w-0.5 h-5 md:h-6 bg-[#00ff41] mx-0.5 md:mx-1" />
          <button
            onClick={endClass}
            className="px-2 md:px-3 h-9 md:h-10 bg-[#ff0000] border-2 border-[#ff0000] text-white text-[7px] md:text-[8px] font-bold flex items-center gap-0.5 md:gap-1 hover:bg-[#0f0f23] hover:text-[#ff0000] transition-colors"
          >
            <PhoneOff className="h-3.5 w-3.5 md:h-4 md:w-4" />
            END
          </button>
        </div>
      </div>
    </div>
  );
}

function VideoTile({
  stream,
  name,
  isLocal,
  colorIndex,
  isTeacher,
  isHandRaised,
  isSpeaking,
  isActiveSpeaker,
}: {
  stream: MediaStream | null;
  name: string;
  isLocal: boolean;
  colorIndex: number;
  isTeacher?: boolean;
  isHandRaised?: boolean;
  isSpeaking?: boolean;
  isActiveSpeaker?: boolean;
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
        tracks.some((t) => {
          return t.enabled && t.readyState === "live" && !t.muted;
        });

      if (!hasActiveTrack) {
        setShowVideo(false);
        return;
      }

      const hasVideoDimensions = video.videoWidth > 0 && video.videoHeight > 0;
      setShowVideo(hasActiveTrack && hasVideoDimensions);
    };

    setTimeout(checkVideoTracks, 100);

    const handlePlaying = () => setTimeout(checkVideoTracks, 50);
    const handleEnded = () => setShowVideo(false);
    const handleLoadedData = () => checkVideoTracks();
    const handleEmptied = () => setShowVideo(false);

    video.addEventListener("playing", handlePlaying);
    video.addEventListener("ended", handleEnded);
    video.addEventListener("loadeddata", handleLoadedData);
    video.addEventListener("emptied", handleEmptied);

    const handleTrackChange = () => setTimeout(checkVideoTracks, 50);
    stream.addEventListener("addtrack", handleTrackChange);
    stream.addEventListener("removetrack", handleTrackChange);

    stream.getVideoTracks().forEach((track) => {
      track.onended = checkVideoTracks;
      track.onmute = checkVideoTracks;
      track.onunmute = checkVideoTracks;
    });

    const interval = setInterval(checkVideoTracks, 300);

    return () => {
      clearInterval(interval);
      video.removeEventListener("playing", handlePlaying);
      video.removeEventListener("ended", handleEnded);
      video.removeEventListener("loadeddata", handleLoadedData);
      video.removeEventListener("emptied", handleEmptied);
      stream.removeEventListener("addtrack", handleTrackChange);
      stream.removeEventListener("removetrack", handleTrackChange);
      stream.getVideoTracks().forEach((track) => {
        track.onended = null;
        track.onmute = null;
        track.onunmute = null;
      });
    };
  }, [stream]);

  const pixelColors = [
    "border-[#00d4ff]",
    "border-[#ff00ff]",
    "border-[#00ff41]",
    "border-[#ff6600]",
  ];
  const avatarColors = [
    "bg-[#00d4ff]",
    "bg-[#ff00ff]",
    "bg-[#00ff41]",
    "bg-[#ff6600]",
  ];

  // Active speaker gets special styling
  const speakingBorder = isActiveSpeaker
    ? "border-[#ffff00] shadow-[0_0_20px_#ffff00,0_0_40px_#ffff00]"
    : isSpeaking
    ? "border-[#00ff41] shadow-[0_0_10px_#00ff41]"
    : pixelColors[colorIndex % 4];
  const speakingScale = isActiveSpeaker ? "col-span-2 row-span-2" : "";

  return (
    <div
      className={`bg-[#1a1a3e] border-4 ${speakingBorder} overflow-hidden relative aspect-video transition-all duration-300 ${speakingScale}`}
      style={{ imageRendering: "auto" }}
    >
      <video
        ref={videoRef}
        autoPlay
        playsInline
        muted={isLocal}
        className={`w-full h-full object-cover ${showVideo ? "" : "hidden"}`}
      />
      {!showVideo && (
        <div className="w-full h-full flex items-center justify-center bg-[#0f0f23]">
          <div
            className={`w-16 h-16 sm:w-20 sm:h-20 ${
              avatarColors[colorIndex % 4]
            } border-4 border-[#1a1a3e] flex items-center justify-center text-[#0f0f23] text-2xl sm:text-3xl font-bold ${
              isSpeaking ? "animate-pulse" : ""
            }`}
          >
            {name[0]?.toUpperCase() || "?"}
          </div>
        </div>
      )}
      {/* Speaking indicator */}
      {isSpeaking && (
        <div className="absolute top-2 left-2 flex items-center gap-1">
          <div className="flex gap-0.5">
            <div
              className="w-1 h-3 bg-[#00ff41] animate-pulse"
              style={{ animationDelay: "0ms" }}
            />
            <div
              className="w-1 h-4 bg-[#00ff41] animate-pulse"
              style={{ animationDelay: "150ms" }}
            />
            <div
              className="w-1 h-2 bg-[#00ff41] animate-pulse"
              style={{ animationDelay: "300ms" }}
            />
            <div
              className="w-1 h-5 bg-[#00ff41] animate-pulse"
              style={{ animationDelay: "100ms" }}
            />
          </div>
          {isActiveSpeaker && (
            <span className="text-[8px] text-[#ffff00] ml-1">SPEAKING</span>
          )}
        </div>
      )}
      <div className="absolute bottom-2 left-2 px-2 py-1 bg-[#0f0f23] border-2 border-[#00ff41] text-[#00ff41] text-[8px] sm:text-[10px] flex items-center gap-1">
        {isTeacher && <span>👑</span>}
        {name}
      </div>
      {isHandRaised && (
        <div className="absolute top-2 right-2 w-8 h-8 bg-[#ff00ff] border-2 border-[#ff00ff] flex items-center justify-center animate-bounce">
          <Hand className="h-4 w-4 text-white" />
        </div>
      )}
    </div>
  );
}

// Large Host Video Tile (center of screen)
function HostVideoTile({
  stream,
  name,
  isLocal,
  isSpeaking,
  isActiveSpeaker,
  subtitlesEnabled,
  currentSubtitle,
  isBlurEnabled,
}: {
  stream: MediaStream | null;
  name: string;
  isLocal: boolean;
  isSpeaking?: boolean;
  isActiveSpeaker?: boolean;
  subtitlesEnabled?: boolean;
  currentSubtitle?: string;
  isBlurEnabled?: boolean;
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
      className={`w-full max-w-4xl aspect-video bg-[#1a1a3e] border-2 md:border-4 ${
        isSpeaking
          ? "border-[#00ff41] shadow-[0_0_20px_#00ff41]"
          : "border-[#ffff00]"
      } overflow-hidden relative transition-all duration-300`}
    >
      {/* Video with optional blur effect */}
      <div className="w-full h-full relative">
        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted={isLocal}
          className={`w-full h-full object-cover ${showVideo ? "" : "hidden"}`}
          style={isBlurEnabled ? { filter: "blur(10px)", transform: "scale(1.1)" } : {}}
        />
        {/* Overlay for blur effect - shows person without blur */}
        {isBlurEnabled && showVideo && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div className="w-[60%] h-[80%] rounded-full overflow-hidden" style={{ boxShadow: "0 0 60px 30px rgba(0,0,0,0.5)" }}>
              {/* This creates a "spotlight" effect on the person */}
            </div>
          </div>
        )}
      </div>
      {!showVideo && (
        <div className="w-full h-full flex flex-col items-center justify-center bg-[#0f0f23]">
          <div
            className={`w-16 h-16 md:w-24 md:h-24 bg-[#ffff00] border-2 md:border-4 border-[#1a1a3e] flex items-center justify-center text-[#0f0f23] text-2xl md:text-4xl font-bold ${
              isSpeaking ? "animate-pulse" : ""
            }`}
          >
            👑
          </div>
          <p className="text-[#ffff00] text-xs md:text-sm mt-2 md:mt-4">
            {name}
          </p>
        </div>
      )}
      {/* Blur indicator */}
      {isBlurEnabled && showVideo && (
        <div className="absolute top-2 right-2 px-1.5 py-0.5 bg-[#00d4ff]/80 text-[#0f0f23] text-[8px] font-bold rounded">
          BG BLUR
        </div>
      )}
      {/* Speaking indicator */}
      {isSpeaking && (
        <div className="absolute top-2 md:top-3 left-2 md:left-3 flex items-center gap-1 md:gap-2 bg-[#0f0f23]/80 px-1.5 md:px-2 py-0.5 md:py-1 border border-[#00ff41]">
          <div className="flex gap-0.5">
            <div
              className="w-0.5 md:w-1 h-3 md:h-4 bg-[#00ff41] animate-pulse"
              style={{ animationDelay: "0ms" }}
            />
            <div
              className="w-0.5 md:w-1 h-4 md:h-6 bg-[#00ff41] animate-pulse"
              style={{ animationDelay: "150ms" }}
            />
            <div
              className="w-0.5 md:w-1 h-2 md:h-3 bg-[#00ff41] animate-pulse"
              style={{ animationDelay: "300ms" }}
            />
            <div
              className="w-0.5 md:w-1 h-3 md:h-5 bg-[#00ff41] animate-pulse"
              style={{ animationDelay: "100ms" }}
            />
          </div>
          <span className="text-[6px] md:text-[8px] text-[#00ff41]">LIVE</span>
        </div>
      )}
      <div className="absolute bottom-2 md:bottom-3 left-2 md:left-3 px-2 md:px-3 py-0.5 md:py-1 bg-[#0f0f23] border md:border-2 border-[#ffff00] text-[#ffff00] text-[8px] md:text-[10px] flex items-center gap-1 md:gap-2">
        <span>👑</span>
        {name}
      </div>

      {/* Subtitle Overlay - Small and Unobtrusive */}
      {subtitlesEnabled && currentSubtitle && (
        <div className="absolute bottom-8 md:bottom-12 left-1/2 transform -translate-x-1/2 bg-black/70 text-white px-3 py-1 rounded-full border border-[#ff00ff]/50 max-w-[80%] transition-opacity duration-300">
          <p className="text-[10px] md:text-xs text-center truncate">
            {currentSubtitle}
          </p>
        </div>
      )}
    </div>
  );
}

// Spotlight Video Tile (for spotlighted student in center)
function SpotlightVideoTile({
  stream,
  name,
  isSpeaking,
  onDoubleClick,
}: {
  stream: MediaStream | null;
  name: string;
  isSpeaking?: boolean;
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
      className={`w-full h-full max-h-[70vh] md:max-h-none md:max-w-4xl aspect-video bg-[#1a1a3e] border-2 md:border-4 cursor-pointer ${
        isSpeaking
          ? "border-[#00ff41] shadow-[0_0_20px_#00ff41]"
          : "border-[#00d4ff]"
      } overflow-hidden relative transition-all duration-300`}
    >
      <video
        ref={videoRef}
        autoPlay
        playsInline
        className={`w-full h-full object-cover ${showVideo ? "" : "hidden"}`}
      />
      {!showVideo && (
        <div className="w-full h-full flex flex-col items-center justify-center bg-[#0f0f23]">
          <div
            className={`w-20 h-20 md:w-24 md:h-24 bg-[#00d4ff] border-2 md:border-4 border-[#1a1a3e] flex items-center justify-center text-[#0f0f23] text-2xl md:text-3xl font-bold ${
              isSpeaking ? "animate-pulse" : ""
            }`}
          >
            {name[0]?.toUpperCase() || "?"}
          </div>
          <p className="text-[#00d4ff] text-sm md:text-sm mt-2 md:mt-4">
            {name}
          </p>
        </div>
      )}
      {isSpeaking && (
        <div className="absolute top-2 md:top-3 left-2 md:left-3 flex items-center gap-1 md:gap-2 bg-[#0f0f23]/80 px-1.5 md:px-2 py-0.5 md:py-1 border border-[#00ff41]">
          <div className="flex gap-0.5">
            <div className="w-0.5 md:w-1 h-3 md:h-4 bg-[#00ff41] animate-pulse" />
            <div
              className="w-0.5 md:w-1 h-4 md:h-6 bg-[#00ff41] animate-pulse"
              style={{ animationDelay: "150ms" }}
            />
            <div
              className="w-0.5 md:w-1 h-2 md:h-3 bg-[#00ff41] animate-pulse"
              style={{ animationDelay: "300ms" }}
            />
          </div>
          <span className="text-[6px] md:text-[8px] text-[#00ff41]">
            SPEAKING
          </span>
        </div>
      )}
      <div className="absolute bottom-2 md:bottom-3 left-2 md:left-3 px-2 md:px-3 py-0.5 md:py-1 bg-[#0f0f23] border md:border-2 border-[#00d4ff] text-[#00d4ff] text-[8px] md:text-[10px] flex items-center gap-1 md:gap-2">
        🔍 {name} (Spotlight)
      </div>
      <div className="absolute top-2 right-2 px-1.5 py-0.5 bg-[#0f0f23]/80 border border-[#ff00ff] text-[#ff00ff] text-[6px] md:text-[8px]">
        Double-click to exit
      </div>
    </div>
  );
}

// Student Thumbnail (side strip)
function StudentThumbnail({
  stream,
  name,
  colorIndex,
  isHandRaised,
  isSpeaking,
  isActiveSpeaker,
  isSpotlighted,
  onDoubleClick,
  onRemove,
}: {
  stream: MediaStream | null;
  name: string;
  colorIndex: number;
  isHandRaised?: boolean;
  isSpeaking?: boolean;
  isActiveSpeaker?: boolean;
  isSpotlighted?: boolean;
  onDoubleClick?: () => void;
  onRemove: () => void;
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

  const pixelColors = [
    "border-[#00d4ff]",
    "border-[#ff00ff]",
    "border-[#00ff41]",
    "border-[#ff6600]",
  ];
  const avatarColors = [
    "bg-[#00d4ff]",
    "bg-[#ff00ff]",
    "bg-[#00ff41]",
    "bg-[#ff6600]",
  ];
  const borderColor = isSpotlighted
    ? "border-[#ff00ff] shadow-[0_0_10px_#ff00ff]"
    : isActiveSpeaker
    ? "border-[#ffff00] shadow-[0_0_10px_#ffff00]"
    : isSpeaking
    ? "border-[#00ff41] shadow-[0_0_5px_#00ff41]"
    : pixelColors[colorIndex % 4];

  return (
    <div
      onDoubleClick={onDoubleClick}
      className={`relative w-32 h-full md:w-full md:h-auto aspect-video flex-shrink-0 bg-[#1a1a3e] border-2 ${borderColor} overflow-hidden group transition-all duration-200 cursor-pointer`}
    >
      <video
        ref={videoRef}
        autoPlay
        playsInline
        className={`w-full h-full object-cover ${showVideo ? "" : "hidden"}`}
      />
      {!showVideo && (
        <div className="w-full h-full flex items-center justify-center bg-[#0f0f23]">
          <div
            className={`w-10 h-10 md:w-12 md:h-12 ${
              avatarColors[colorIndex % 4]
            } border-2 border-[#1a1a3e] flex items-center justify-center text-[#0f0f23] text-base md:text-lg font-bold ${
              isSpeaking ? "animate-pulse" : ""
            }`}
          >
            {name[0]?.toUpperCase() || "?"}
          </div>
        </div>
      )}
      {/* Speaking indicator */}
      {isSpeaking && (
        <div className="absolute top-1 left-1 flex gap-0.5">
          <div className="w-1 h-2 md:h-3 bg-[#00ff41] animate-pulse" />
          <div
            className="w-1 h-3 md:h-4 bg-[#00ff41] animate-pulse"
            style={{ animationDelay: "100ms" }}
          />
          <div
            className="w-1 h-1.5 md:h-2 bg-[#00ff41] animate-pulse"
            style={{ animationDelay: "200ms" }}
          />
        </div>
      )}
      {/* Spotlight indicator */}
      {isSpotlighted && (
        <div className="absolute top-1 left-1 px-1 py-0.5 bg-[#ff00ff] text-white text-[6px]">
          🔍
        </div>
      )}
      {/* Name label */}
      <div className="absolute bottom-0 left-0 right-0 px-1 py-0.5 bg-[#0f0f23]/80 text-[8px] md:text-[8px] text-[#00ff41] truncate">
        {name}
      </div>
      {/* Hand raised */}
      {isHandRaised && (
        <div className="absolute top-1 right-1 w-5 h-5 bg-[#ff00ff] flex items-center justify-center animate-bounce">
          <Hand className="h-3 w-3 text-white" />
        </div>
      )}
      {/* Remove button on hover - desktop only */}
      <button
        onClick={(e) => {
          e.stopPropagation();
          onRemove();
        }}
        className="absolute top-0.5 right-0.5 w-4 h-4 bg-[#ff0000] items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hidden md:group-hover:flex"
      >
        <UserX className="h-2 w-2 text-white" />
      </button>
      {/* Double-click hint on hover */}
      <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center pointer-events-none">
        <span className="text-[6px] md:text-[8px] text-white">
          Double-click to spotlight
        </span>
      </div>
    </div>
  );
}
