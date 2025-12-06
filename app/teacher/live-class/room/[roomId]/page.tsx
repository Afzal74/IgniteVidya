"use client";

import { useEffect, useState, useRef } from "react";
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
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface Participant {
  id: string;
  student_name: string;
  is_audio_enabled: boolean;
  is_video_enabled: boolean;
  is_hand_raised: boolean;
}

export default function TeacherLiveClassRoomPage() {
  const params = useParams();
  const roomId = params.roomId as string;
  const router = useRouter();

  const [room, setRoom] = useState<any>(null);
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [loading, setLoading] = useState(true);

  const [isAudioEnabled, setIsAudioEnabled] = useState(false);
  const [isVideoEnabled, setIsVideoEnabled] = useState(false);
  const [isScreenSharing, setIsScreenSharing] = useState(false);
  const [localStream, setLocalStream] = useState<MediaStream | null>(null);
  const [screenStream, setScreenStream] = useState<MediaStream | null>(null);
  const [mediaError, setMediaError] = useState<string | null>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showParticipants, setShowParticipants] = useState(true);

  const localVideoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const localStreamRef = useRef<MediaStream | null>(null);
  const screenStreamRef = useRef<MediaStream | null>(null);

  // Keep refs in sync with state
  useEffect(() => {
    localStreamRef.current = localStream;
  }, [localStream]);

  useEffect(() => {
    screenStreamRef.current = screenStream;
  }, [screenStream]);

  // Initialize media on mount
  useEffect(() => {
    fetchRoomData();
    initMedia();

    return () => {
      // Use refs to get current values in cleanup
      console.log("Cleanup: stopping all tracks");
      if (localStreamRef.current) {
        localStreamRef.current.getTracks().forEach((t) => {
          console.log("Cleanup stopping:", t.kind, t.label);
          t.stop();
        });
      }
      if (screenStreamRef.current) {
        screenStreamRef.current.getTracks().forEach((t) => t.stop());
      }
    };
  }, []);

  // Subscribe to participant changes
  useEffect(() => {
    if (!roomId) return;
    const ch = supabase
      .channel(`teacher-room-${roomId}`)
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

  const initMedia = async () => {
    setMediaError(null);

    // First, stop any existing streams to release the camera
    if (localStream) {
      localStream.getTracks().forEach((t) => t.stop());
      setLocalStream(null);
    }

    try {
      // First try video + audio with lower resolution for better compatibility
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
    } catch (err: any) {
      console.error("Media error:", err.name, err.message);

      if (err.name === "NotReadableError") {
        // Camera is busy - try audio only
        try {
          const audioStream = await navigator.mediaDevices.getUserMedia({
            audio: true,
          });
          setLocalStream(audioStream);
          setIsAudioEnabled(true);
          setMediaError(
            "Camera busy (used by another app/tab). Audio only mode. Close other apps and click Retry for video."
          );
          return;
        } catch {
          setMediaError(
            "Camera is busy. Close other browser tabs/apps using the camera, then click Retry."
          );
        }
        return;
      } else if (err.name === "NotAllowedError") {
        setMediaError(
          "Permission denied. Click the camera icon in your browser's address bar to allow access."
        );
        return;
      } else if (err.name === "NotFoundError") {
        setMediaError(
          "No camera found. You can still participate with audio only."
        );
      } else {
        // Try audio only as fallback
        try {
          const audioStream = await navigator.mediaDevices.getUserMedia({
            audio: true,
          });
          setLocalStream(audioStream);
          setIsAudioEnabled(true);
          setMediaError("Camera not available. Audio only mode.");
        } catch (audioErr) {
          setMediaError(
            "Could not access camera or microphone. Please check permissions and try again."
          );
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
    if (localStream) {
      const enabled = !isAudioEnabled;
      localStream.getAudioTracks().forEach((t) => {
        t.enabled = enabled;
      });
      setIsAudioEnabled(enabled);
    }
  };

  const toggleVideo = async () => {
    if (isVideoEnabled) {
      // Turn OFF - STOP the video track completely (turns off camera light)
      if (localStream) {
        const videoTracks = localStream.getVideoTracks();
        console.log("Stopping video tracks:", videoTracks.length);
        videoTracks.forEach((t) => {
          console.log("Stopping track:", t.label, t.readyState);
          t.stop();
          localStream.removeTrack(t);
        });
      }
      setIsVideoEnabled(false);
    } else {
      // Turn ON - get new video stream
      try {
        const videoStream = await navigator.mediaDevices.getUserMedia({
          video: { width: { ideal: 640 }, height: { ideal: 480 } },
        });
        const videoTrack = videoStream.getVideoTracks()[0];
        console.log("Got new video track:", videoTrack.label);

        if (localStream) {
          localStream.addTrack(videoTrack);
        } else {
          setLocalStream(videoStream);
        }
        setIsVideoEnabled(true);
      } catch (e: any) {
        console.error("Video toggle error:", e);
        if (e.name === "NotReadableError") {
          setMediaError("Camera is busy. Close other apps using it.");
        } else {
          setMediaError("Could not enable camera");
        }
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
        setIsScreenSharing(true);
        stream.getVideoTracks()[0].onended = () => {
          setScreenStream(null);
          setIsScreenSharing(false);
        };
      } catch (e) {
        console.error("Screen share error:", e);
      }
    } else {
      screenStream?.getTracks().forEach((t) => t.stop());
      setScreenStream(null);
      setIsScreenSharing(false);
    }
  };

  const stopAllMedia = () => {
    console.log("Stopping all media...");
    if (localStream) {
      localStream.getTracks().forEach((t) => {
        console.log("Stopping:", t.kind, t.label);
        t.stop();
      });
      setLocalStream(null);
    }
    if (screenStream) {
      screenStream.getTracks().forEach((t) => t.stop());
      setScreenStream(null);
    }
    setIsVideoEnabled(false);
    setIsAudioEnabled(false);
    setIsScreenSharing(false);
  };

  const endClass = async () => {
    if (!confirm("End class for everyone?")) return;
    stopAllMedia();
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

  const copyCode = () => {
    if (room) navigator.clipboard.writeText(room.room_code);
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
  const raisedHands = participants.filter((p) => p.is_hand_raised);

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

  return (
    <div ref={containerRef} className="min-h-screen bg-gray-900 flex flex-col">
      {/* Header */}
      <div className="bg-gray-800 border-b border-gray-700 px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <h1 className="text-white font-semibold">{room.room_name}</h1>
          <span className="px-2 py-1 rounded bg-red-500/20 text-red-400 text-xs animate-pulse">
            ● LIVE
          </span>
          <Button
            variant="ghost"
            size="sm"
            onClick={copyCode}
            className="text-gray-400 hover:text-white"
          >
            <Copy className="h-4 w-4 mr-2" />
            {room.room_code}
          </Button>
        </div>
        <div className="flex items-center gap-2">
          {raisedHands.length > 0 && (
            <div className="px-3 py-1 rounded-full bg-yellow-500/20 text-yellow-400 text-sm animate-pulse">
              <Hand className="h-4 w-4 inline mr-2" />
              {raisedHands.length}
            </div>
          )}
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowParticipants(!showParticipants)}
            className="text-gray-400 hover:text-white"
          >
            <Users className="h-4 w-4 mr-2" />
            {participants.length}
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={toggleFullscreen}
            className="text-gray-400 hover:text-white"
          >
            {isFullscreen ? (
              <Minimize className="h-4 w-4" />
            ) : (
              <Maximize className="h-4 w-4" />
            )}
          </Button>
        </div>
      </div>

      {/* Media Error Banner */}
      {mediaError && (
        <div className="bg-yellow-500/20 border-b border-yellow-500/30 px-4 py-2 flex items-center justify-between">
          <div className="flex items-center gap-2 text-yellow-400 text-sm">
            <AlertCircle className="h-4 w-4" />
            {mediaError}
          </div>
          <Button
            size="sm"
            variant="outline"
            onClick={retryMedia}
            className="text-yellow-400 border-yellow-500/50"
          >
            Retry
          </Button>
        </div>
      )}

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Video Area */}
        <div className="flex-1 p-4">
          <div className="grid gap-4 h-full grid-cols-1 lg:grid-cols-2">
            {/* Teacher Video (Large) */}
            <div className="bg-gray-800 rounded-xl overflow-hidden relative lg:col-span-2 aspect-video">
              {isScreenSharing && screenStream ? (
                <video
                  key="screen"
                  autoPlay
                  playsInline
                  muted
                  ref={(el) => {
                    if (el) el.srcObject = screenStream;
                  }}
                  className="w-full h-full object-contain bg-black"
                />
              ) : isVideoEnabled &&
                localStream &&
                localStream.getVideoTracks().length > 0 ? (
                <video
                  key={`video-${isVideoEnabled}`}
                  ref={(el) => {
                    if (el && localStream) {
                      el.srcObject = localStream;
                    }
                  }}
                  autoPlay
                  playsInline
                  muted
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex flex-col items-center justify-center">
                  <div className="w-32 h-32 rounded-full bg-gradient-to-br from-blue-600 to-cyan-600 flex items-center justify-center text-white text-5xl font-bold mb-4">
                    T
                  </div>
                  <p className="text-gray-400">Camera is off</p>
                </div>
              )}
              <div className="absolute bottom-4 left-4 px-3 py-1.5 bg-black/60 rounded-lg text-white text-sm flex items-center gap-2">
                <span className="text-yellow-400">👑</span>
                You (Host)
                {isScreenSharing && (
                  <span className="text-blue-400 ml-2">• Sharing Screen</span>
                )}
              </div>
              {/* Small self-view when screen sharing */}
              {isScreenSharing && isVideoEnabled && localStream && (
                <div className="absolute bottom-4 right-4 w-48 aspect-video bg-gray-900 rounded-lg overflow-hidden border-2 border-gray-700">
                  <video
                    ref={localVideoRef}
                    autoPlay
                    playsInline
                    muted
                    className="w-full h-full object-cover"
                  />
                </div>
              )}
            </div>

            {/* Student Tiles */}
            {participants.map((p, i) => (
              <div
                key={p.id}
                className="bg-gray-800 rounded-xl overflow-hidden relative aspect-video"
              >
                <div className="w-full h-full flex items-center justify-center">
                  <div
                    className={`w-20 h-20 rounded-full bg-gradient-to-br ${getColor(
                      i
                    )} flex items-center justify-center text-white text-3xl font-bold`}
                  >
                    {p.student_name[0].toUpperCase()}
                  </div>
                </div>
                <div className="absolute bottom-3 left-3 px-2 py-1 bg-black/60 rounded text-white text-sm flex items-center gap-2">
                  {p.is_audio_enabled ? (
                    <Mic className="h-3 w-3 text-green-400" />
                  ) : (
                    <MicOff className="h-3 w-3 text-red-400" />
                  )}
                  {p.student_name}
                </div>
                {p.is_hand_raised && (
                  <div
                    className="absolute top-3 right-3 w-8 h-8 bg-yellow-500 rounded-full flex items-center justify-center animate-bounce cursor-pointer"
                    onClick={() => lowerHand(p.id)}
                  >
                    <Hand className="h-4 w-4 text-white" />
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Participants Sidebar */}
        <AnimatePresence>
          {showParticipants && (
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: 300 }}
              exit={{ width: 0 }}
              className="bg-gray-800 border-l border-gray-700 overflow-hidden"
            >
              <div className="p-4 h-full flex flex-col w-[300px]">
                <h3 className="text-white font-semibold mb-4">
                  <Users className="h-4 w-4 inline mr-2" />
                  Participants ({participants.length})
                </h3>

                {raisedHands.length > 0 && (
                  <div className="mb-4">
                    <h4 className="text-yellow-400 text-sm font-medium mb-2">
                      <Hand className="h-4 w-4 inline mr-2" />
                      Raised Hands
                    </h4>
                    {raisedHands.map((p, i) => (
                      <div
                        key={p.id}
                        className="p-2 rounded-lg bg-yellow-500/10 border border-yellow-500/30 flex items-center justify-between mb-2"
                      >
                        <div className="flex items-center gap-2">
                          <div
                            className={`w-6 h-6 rounded-full bg-gradient-to-br ${getColor(
                              i
                            )} flex items-center justify-center text-white text-xs font-bold`}
                          >
                            {p.student_name[0]}
                          </div>
                          <span className="text-white text-sm">
                            {p.student_name}
                          </span>
                        </div>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => lowerHand(p.id)}
                          className="h-6 w-6 p-0 text-yellow-400"
                        >
                          <Hand className="h-3 w-3" />
                        </Button>
                      </div>
                    ))}
                  </div>
                )}

                <div className="flex-1 overflow-y-auto space-y-2">
                  {participants.length === 0 ? (
                    <p className="text-gray-500 text-sm text-center py-8">
                      No students have joined yet
                    </p>
                  ) : (
                    participants.map((p, i) => (
                      <div
                        key={p.id}
                        className="p-3 rounded-lg bg-gray-700/50 flex items-center justify-between group"
                      >
                        <div className="flex items-center gap-3">
                          <div
                            className={`w-8 h-8 rounded-full bg-gradient-to-br ${getColor(
                              i
                            )} flex items-center justify-center text-white text-sm font-bold`}
                          >
                            {p.student_name[0]}
                          </div>
                          <div>
                            <p className="text-white text-sm">
                              {p.student_name}
                            </p>
                            <div className="flex gap-2 mt-1">
                              {p.is_audio_enabled ? (
                                <Mic className="h-3 w-3 text-green-400" />
                              ) : (
                                <MicOff className="h-3 w-3 text-gray-500" />
                              )}
                              {p.is_video_enabled ? (
                                <Video className="h-3 w-3 text-green-400" />
                              ) : (
                                <VideoOff className="h-3 w-3 text-gray-500" />
                              )}
                            </div>
                          </div>
                        </div>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => removeParticipant(p.id)}
                          className="opacity-0 group-hover:opacity-100 h-8 w-8 p-0 text-red-400"
                        >
                          <UserX className="h-4 w-4" />
                        </Button>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Controls */}
      <div className="bg-gray-800 border-t border-gray-700 px-4 py-4">
        <div className="flex items-center justify-center gap-4">
          <Button
            onClick={toggleAudio}
            className={`rounded-full w-12 h-12 ${
              isAudioEnabled
                ? "bg-gray-700 hover:bg-gray-600"
                : "bg-red-600 hover:bg-red-700"
            }`}
          >
            {isAudioEnabled ? (
              <Mic className="h-5 w-5" />
            ) : (
              <MicOff className="h-5 w-5" />
            )}
          </Button>
          <Button
            onClick={toggleVideo}
            className={`rounded-full w-12 h-12 ${
              isVideoEnabled
                ? "bg-gray-700 hover:bg-gray-600"
                : "bg-red-600 hover:bg-red-700"
            }`}
          >
            {isVideoEnabled ? (
              <Video className="h-5 w-5" />
            ) : (
              <VideoOff className="h-5 w-5" />
            )}
          </Button>
          <Button
            onClick={toggleScreenShare}
            className={`rounded-full w-12 h-12 ${
              isScreenSharing
                ? "bg-blue-600 hover:bg-blue-700"
                : "bg-gray-700 hover:bg-gray-600"
            }`}
          >
            {isScreenSharing ? (
              <ScreenShareOff className="h-5 w-5" />
            ) : (
              <ScreenShare className="h-5 w-5" />
            )}
          </Button>
          <div className="w-px h-8 bg-gray-700 mx-2" />
          <Button
            onClick={endClass}
            className="rounded-full px-6 h-12 bg-red-600 hover:bg-red-700"
          >
            <PhoneOff className="h-5 w-5 mr-2" />
            End
          </Button>
        </div>
      </div>
    </div>
  );
}
