"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";
import {
  GamepadIcon,
  Users,
  Plus,
  ArrowRight,
  Copy,
  Settings,
  Crown,
  Clock,
  Brain,
  Trophy,
  Zap,
  Shield,
  Target,
  User,
  LogOut,
  Home,
  Gamepad2,
  Globe,
  BookOpen,
  FlaskConical,
  Code,
  UserPlus,
  Play,
  Loader2,
} from "lucide-react";

type Screen = "home" | "create" | "join" | "lobby";
type GameMode = "classic" | "speed" | "survival" | "team";
type Difficulty = "easy" | "medium" | "hard" | "mixed";

interface Player {
  id: string;
  name: string;
  avatar: string;
  isHost: boolean;
  isReady: boolean;
  score?: number;
}

interface Room {
  id: string;
  name: string;
  code: string;
  host: string;
  players: Player[];
  maxPlayers: number;
  gameMode: GameMode;
  difficulty: Difficulty;
  questionCount: number;
  timeLimit: number;
  isPrivate: boolean;
  createdAt: Date;
}

export default function QuizPage() {
  const router = useRouter();
  const [currentScreen, setCurrentScreen] = useState<Screen>("home");
  // Students can only join rooms, not create them
  const tabletMode = "join";
  const [playerName, setPlayerName] = useState("");
  const [roomCode, setRoomCode] = useState("");
  const [currentRoom, setCurrentRoom] = useState<Room | null>(null);
  const [isHost, setIsHost] = useState(false);
  const [joining, setJoining] = useState(false);
  const [error, setError] = useState("");

  // Room settings (when creating)
  const [roomName, setRoomName] = useState("");
  const [gameMode, setGameMode] = useState<GameMode>("classic");
  const [difficulty, setDifficulty] = useState<Difficulty>("medium");
  const [selectedCategory, setSelectedCategory] =
    useState<string>("mathematics");
  const [questionCount, setQuestionCount] = useState(10);
  const [timeLimit, setTimeLimit] = useState(30);
  const [maxPlayers, setMaxPlayers] = useState(6);
  const [isPrivateRoom, setIsPrivateRoom] = useState(false);

  // Sample players for demo
  const samplePlayers: Player[] = [
    {
      id: "1",
      name: "Alex",
      avatar: "🎯",
      isHost: true,
      isReady: true,
    },
    {
      id: "2",
      name: "Sarah",
      avatar: "🚀",
      isHost: false,
      isReady: true,
    },
    {
      id: "3",
      name: "Mike",
      avatar: "⚡",
      isHost: false,
      isReady: false,
    },
    {
      id: "4",
      name: "Emma",
      avatar: "🎨",
      isHost: false,
      isReady: true,
    },
  ];

  const generateRoomCode = () => {
    return Math.random().toString(36).substring(2, 8).toUpperCase();
  };

  const createRoom = () => {
    if (!roomName.trim() || !playerName.trim()) return;

    const newRoom: Room = {
      id: Math.random().toString(36).substring(2),
      name: roomName,
      code: generateRoomCode(),
      host: playerName,
      players: [
        {
          id: "host",
          name: playerName,
          avatar: "👑",
          isHost: true,
          isReady: true,
        },
        ...samplePlayers.slice(1),
      ],
      maxPlayers,
      gameMode,
      difficulty,
      questionCount,
      timeLimit,
      isPrivate: isPrivateRoom,
      createdAt: new Date(),
    };

    setCurrentRoom(newRoom);
    setIsHost(true);
    setCurrentScreen("lobby");
  };

  const joinRoom = async () => {
    if (!roomCode.trim() || !playerName.trim()) {
      setError("Please enter both room code and your name");
      return;
    }

    setJoining(true);
    setError("");

    try {
      // Find the room by code
      const { data: room, error: roomError } = await supabase
        .from('quiz_rooms')
        .select('*')
        .eq('room_code', roomCode.toUpperCase())
        .single();

      if (roomError || !room) {
        setError("Room not found. Please check the code and try again.");
        setJoining(false);
        return;
      }

      // Check if room is still waiting (not started or completed)
      if (room.status !== 'waiting') {
        setError("This quiz has already started or ended.");
        setJoining(false);
        return;
      }

      // Check if room is full
      const { data: participants } = await supabase
        .from('quiz_participants')
        .select('id')
        .eq('room_id', room.id);

      if (participants && participants.length >= room.max_players) {
        setError("This room is full.");
        setJoining(false);
        return;
      }

      // Join the room
      const { data: participant, error: joinError } = await supabase
        .from('quiz_participants')
        .insert({
          room_id: room.id,
          student_name: playerName.trim(),
          score: 0,
          answers_submitted: 0
        })
        .select()
        .single();

      if (joinError) {
        setError("Failed to join room. Please try again.");
        setJoining(false);
        return;
      }

      // Store participant info in localStorage
      localStorage.setItem('quiz_participant_id', participant.id);
      localStorage.setItem('quiz_participant_name', playerName.trim());
      localStorage.setItem('quiz_room_id', room.id);

      // Redirect to student lobby
      router.push(`/quiz/lobby/${room.id}`);
    } catch (err: any) {
      setError("An error occurred. Please try again.");
      console.error(err);
    } finally {
      setJoining(false);
    }
  };

  const copyRoomCode = () => {
    if (currentRoom) {
      navigator.clipboard.writeText(currentRoom.code);
      // You could add a toast notification here
    }
  };

  const leaveRoom = () => {
    setCurrentRoom(null);
    setIsHost(false);
    setCurrentScreen("home");
  };

  const getGameModeIcon = (mode: GameMode) => {
    switch (mode) {
      case "classic":
        return <Brain className="h-5 w-5" />;
      case "speed":
        return <Zap className="h-5 w-5" />;
      case "survival":
        return <Shield className="h-5 w-5" />;
      case "team":
        return <Users className="h-5 w-5" />;
    }
  };

  const getDifficultyColor = (diff: Difficulty) => {
    switch (diff) {
      case "easy":
        return "text-green-600 bg-green-50 border-green-200 dark:bg-green-900/20 dark:text-green-400";
      case "medium":
        return "text-yellow-600 bg-yellow-50 border-yellow-200 dark:bg-yellow-900/20 dark:text-yellow-400";
      case "hard":
        return "text-red-600 bg-red-50 border-red-200 dark:bg-red-900/20 dark:text-red-400";
      case "mixed":
        return "text-purple-600 bg-purple-50 border-purple-200 dark:bg-purple-900/20 dark:text-purple-400";
    }
  };

  const renderHomeScreen = () => (
    <div className="max-w-6xl mx-auto">
      {/* Back Button */}
      <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.5 }}
        className="pt-16 px-4"
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
        className="text-center mb-6 pt-4 md:pt-6"
      >
        <div className="mb-8 px-4 md:px-8">
          <div className="mb-4">
            <span className="px-4 py-2 rounded-full bg-purple-500/20 border border-purple-500/30 text-purple-300 text-sm font-semibold">
              STEM-Based Real-Time Quiz
            </span>
          </div>
          <h1 className="text-3xl md:text-4xl font-bold leading-tight text-white">
            Ready for Your Quiz?
          </h1>
        </div>
      </motion.div>

      {/* Simple Join Interface */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.3 }}
        className="max-w-xl mx-auto"
      >
        <div className="bg-gray-800/90 backdrop-blur-sm rounded-2xl p-10 md:p-12 border border-gray-700 shadow-2xl">
          <h2 className="text-2xl font-bold text-white mb-6 text-center">
            Join Quiz Room
          </h2>

          <div className="space-y-5">
            {/* Room Code */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Room Code
              </label>
              <Input
                value={roomCode}
                onChange={(e) => setRoomCode(e.target.value.toUpperCase())}
                placeholder="ABC123"
                className="bg-gray-700 border-2 border-gray-600 text-white placeholder-gray-400 rounded-lg h-12 text-center text-xl font-mono tracking-widest focus:border-purple-500 transition-colors"
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
                className="bg-gray-700 border-2 border-gray-600 text-white placeholder-gray-400 rounded-lg h-12 focus:border-purple-500 transition-colors"
                maxLength={20}
              />
            </div>

            {/* Info Box */}
            <div className="bg-purple-500/10 border border-purple-500/30 rounded-lg p-4">
              <p className="text-gray-300 text-sm text-center">
                Get the room code from your teacher to join the quiz
              </p>
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
              className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white py-3 rounded-lg text-lg font-semibold shadow-lg hover:shadow-xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {joining ? (
                <>
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  Joining...
                </>
              ) : (
                <>
                  <Play className="mr-2 h-5 w-5" />
                  Join Room
                </>
              )}
            </Button>
          </div>
        </div>
      </motion.div>

      {/* How to Play Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.5 }}
        className="max-w-3xl mx-auto mt-8 px-4"
      >
        <h3 className="text-xl font-bold text-white mb-4 text-center">How to Play</h3>
        <div className="grid md:grid-cols-3 gap-4">
          <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-gray-700 text-center">
            <div className="w-12 h-12 rounded-full bg-purple-500/20 border border-purple-500/30 flex items-center justify-center mx-auto mb-3">
              <span className="text-2xl">1️⃣</span>
            </div>
            <h4 className="text-white font-semibold mb-2">Get Room Code</h4>
            <p className="text-gray-400 text-sm">Your teacher will share a 6-character room code</p>
          </div>
          
          <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-gray-700 text-center">
            <div className="w-12 h-12 rounded-full bg-purple-500/20 border border-purple-500/30 flex items-center justify-center mx-auto mb-3">
              <span className="text-2xl">2️⃣</span>
            </div>
            <h4 className="text-white font-semibold mb-2">Join & Wait</h4>
            <p className="text-gray-400 text-sm">Enter the code and wait for your teacher to start</p>
          </div>
          
          <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-gray-700 text-center">
            <div className="w-12 h-12 rounded-full bg-purple-500/20 border border-purple-500/30 flex items-center justify-center mx-auto mb-3">
              <span className="text-2xl">3️⃣</span>
            </div>
            <h4 className="text-white font-semibold mb-2">Answer & Win</h4>
            <p className="text-gray-400 text-sm">Answer questions quickly to earn points and top the leaderboard</p>
          </div>
        </div>
      </motion.div>
    </div>
  );

  const renderCreateScreen = () => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="max-w-2xl mx-auto"
    >
      <div className="bg-gray-800/90 backdrop-blur-sm rounded-2xl p-8 border border-gray-700 shadow-2xl">
        <h1 className="text-3xl font-bold text-white mb-8">
          Create a New Quiz Room
        </h1>

        <div className="space-y-6">
          {/* Your Name */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Your Name
            </label>
            <Input
              value={playerName}
              onChange={(e) => setPlayerName(e.target.value)}
              placeholder="Enter your name"
              className="bg-gray-700 border-2 border-purple-500 text-white placeholder-gray-400 rounded-lg h-12"
              maxLength={20}
            />
          </div>

          {/* Add Bots Slider */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Add Bots (0-15)
            </label>
            <div className="flex items-center gap-4">
              <input
                type="range"
                min="0"
                max="15"
                value={maxPlayers - 1}
                onChange={(e) => setMaxPlayers(parseInt(e.target.value) + 1)}
                className="flex-1 h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer slider"
                style={{
                  background: `linear-gradient(to right, #8b5cf6 0%, #8b5cf6 ${
                    ((maxPlayers - 1) / 15) * 100
                  }%, #374151 ${((maxPlayers - 1) / 15) * 100}%, #374151 100%)`,
                }}
              />
              <span className="text-2xl font-bold text-purple-400 min-w-[2rem]">
                {maxPlayers - 1}
              </span>
            </div>
            <p className="text-sm text-gray-400 mt-1">
              {maxPlayers - 1} bots will join
            </p>
          </div>

          {/* Number of Rounds */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Number of Rounds
            </label>
            <div className="relative">
              <select
                value={questionCount}
                onChange={(e) => setQuestionCount(parseInt(e.target.value))}
                className="w-full bg-gray-700 border-gray-600 text-white rounded-lg h-12 appearance-none px-4 pr-10"
              >
                <option value={5}>5</option>
                <option value={10}>10</option>
                <option value={15}>15</option>
                <option value={20}>20</option>
              </select>
              <div className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400">
                ▼
              </div>
            </div>
            <p className="text-sm text-gray-400 mt-1">
              {questionCount} questions per game
            </p>
          </div>

          {/* Select Difficulty */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-3">
              Select Difficulty
            </label>
            <div className="grid grid-cols-3 gap-3">
              {[
                {
                  id: "easy",
                  label: "Easy",
                  time: "30s per question",
                  icon: "🛡️",
                  selected: difficulty === "easy",
                },
                {
                  id: "medium",
                  label: "Average",
                  time: "20s per question",
                  icon: "⚡",
                  selected: difficulty === "medium",
                },
                {
                  id: "hard",
                  label: "Hard",
                  time: "15s per question",
                  icon: "🏆",
                  selected: difficulty === "hard",
                },
              ].map((diff) => (
                <button
                  key={diff.id}
                  onClick={() => setDifficulty(diff.id as Difficulty)}
                  className={`p-4 rounded-lg border-2 text-center transition-all ${
                    diff.selected
                      ? "border-orange-500 bg-orange-500/20"
                      : "border-gray-600 bg-gray-700/50 hover:border-gray-500"
                  }`}
                >
                  <div className="text-2xl mb-1">{diff.icon}</div>
                  <div className="text-white font-medium text-sm">
                    {diff.label}
                  </div>
                  <div className="text-gray-400 text-xs mt-1">{diff.time}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Select Category */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-3">
              Select Category (20s per question)
            </label>
            <div className="grid grid-cols-3 gap-3 mb-3">
              {[
                { id: "all", label: "All", icon: "🏆", selected: true },
                {
                  id: "english",
                  label: "English",
                  icon: "📚",
                  selected: false,
                },
                {
                  id: "science",
                  label: "Science",
                  icon: "🔬",
                  selected: false,
                },
              ].map((cat) => (
                <button
                  key={cat.id}
                  className={`p-3 rounded-lg border-2 text-center transition-all ${
                    cat.selected
                      ? "border-purple-500 bg-purple-500/20"
                      : "border-gray-600 bg-gray-700/50 hover:border-gray-500"
                  }`}
                >
                  <div className="text-lg mb-1">{cat.icon}</div>
                  <div className="text-white font-medium text-sm">
                    {cat.label}
                  </div>
                </button>
              ))}
            </div>
            <div className="grid grid-cols-2 gap-3">
              {[
                { id: "social", label: "Social", icon: "🌍", selected: false },
                { id: "cs", label: "CS", icon: "💻", selected: false },
              ].map((cat) => (
                <button
                  key={cat.id}
                  className={`p-3 rounded-lg border-2 text-center transition-all ${
                    cat.selected
                      ? "border-purple-500 bg-purple-500/20"
                      : "border-gray-600 bg-gray-700/50 hover:border-gray-500"
                  }`}
                >
                  <div className="text-lg mb-1">{cat.icon}</div>
                  <div className="text-white font-medium text-sm">
                    {cat.label}
                  </div>
                </button>
              ))}
            </div>
          </div>

          <Button
            onClick={createRoom}
            disabled={!playerName.trim()}
            className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white py-4 rounded-xl text-lg font-semibold shadow-lg hover:shadow-xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Create Room
          </Button>
        </div>
      </div>
    </motion.div>
  );

  const renderJoinScreen = () => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="max-w-md mx-auto"
    >
      <div className="mb-8">
        <Button
          onClick={() => setCurrentScreen("home")}
          variant="outline"
          className="mb-4"
        >
          <Home className="h-4 w-4 mr-2" />
          Back to Home
        </Button>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2 text-center">
          Join Room
        </h1>
        <p className="text-gray-600 dark:text-gray-400 text-center">
          Enter the room code to join the game
        </p>
      </div>

      <Card className="p-8 shadow-xl border-0 bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm">
        <div className="space-y-6">
          <div className="text-center">
            <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-cyan-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <Users className="h-8 w-8 text-white" />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Room Code
            </label>
            <Input
              value={roomCode}
              onChange={(e) => setRoomCode(e.target.value.toUpperCase())}
              placeholder="Enter 6-digit code..."
              className="text-center text-2xl font-mono tracking-widest"
              maxLength={6}
            />
          </div>

          <Button
            onClick={joinRoom}
            disabled={roomCode.length !== 6}
            className="w-full bg-gradient-to-r from-blue-500 to-cyan-600 hover:from-blue-600 hover:to-cyan-700 text-white font-medium py-3"
          >
            Join Room
            <ArrowRight className="h-4 w-4 ml-2" />
          </Button>

          <div className="text-center">
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Don't have a room code? Ask your friend to share it!
            </p>
          </div>
        </div>
      </Card>
    </motion.div>
  );

  const renderLobbyScreen = () => {
    if (!currentRoom) return null;

    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        className="max-w-4xl mx-auto"
      >
        <div className="text-center mb-8">
          {/* Quiz Verse Branding */}
          <div className="mb-6">
            <h1 className="text-3xl font-bold mb-2">
              <span className="text-pink-500">Quiz</span>
              <span className="text-purple-400"> Verse</span>
            </h1>
          </div>

          {/* Game Lobby Title */}
          <h2 className="text-4xl font-bold text-white mb-4">Game Lobby</h2>

          {/* Room Code */}
          <div className="inline-flex items-center gap-2 bg-gray-700/80 px-4 py-2 rounded-lg mb-4">
            <span className="text-gray-300 text-sm">Room Code:</span>
            <code className="text-xl font-mono font-bold text-white tracking-wider">
              {currentRoom.code}
            </code>
          </div>

          {/* Game Mode and Subject Pills */}
          <div className="flex justify-center gap-3 mb-8">
            <Badge className="bg-orange-500/20 text-orange-400 border border-orange-500/30 px-3 py-1">
              Average Mode
            </Badge>
            <Badge className="bg-purple-500/20 text-purple-400 border border-purple-500/30 px-3 py-1">
              All Subjects
            </Badge>
          </div>
        </div>

        <div className="bg-gray-800/90 backdrop-blur-sm rounded-2xl p-8 border border-gray-700 shadow-2xl">
          {/* Players Section */}
          <div className="mb-8">
            <h3 className="text-2xl font-bold text-white mb-6">Players (3)</h3>

            <div className="space-y-4">
              {[
                {
                  name: "sad",
                  isHost: true,
                  avatar: "⚡",
                  color: "from-purple-500 to-pink-500",
                },
                {
                  name: "BrainBot0",
                  isHost: false,
                  avatar: "🚀",
                  color: "from-purple-500 to-pink-500",
                },
                {
                  name: "QuizQueen1",
                  isHost: false,
                  avatar: "⚡",
                  color: "from-purple-500 to-pink-500",
                },
              ].map((player, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="flex items-center gap-4 bg-gray-700/50 rounded-xl p-4 border border-gray-600"
                >
                  <div
                    className={`w-12 h-12 rounded-full bg-gradient-to-br ${player.color} flex items-center justify-center text-white text-lg font-bold`}
                  >
                    {player.avatar}
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-white font-medium text-lg">
                      {player.name}
                    </span>
                    {player.isHost && (
                      <Badge className="bg-orange-500/20 text-orange-400 border border-orange-500/30 px-2 py-1 text-xs">
                        Host
                      </Badge>
                    )}
                  </div>
                </motion.div>
              ))}
            </div>
          </div>

          {/* Question Time Settings */}
          <div className="mb-8">
            <h3 className="text-xl font-bold text-white mb-4">Question Time</h3>
            <div className="flex gap-4">
              {[
                { value: "5s", selected: false },
                { value: "10s", selected: true },
                { value: "15s", selected: false },
              ].map((option, index) => (
                <button
                  key={index}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg border-2 transition-all ${
                    option.selected
                      ? "border-purple-500 bg-purple-500/20 text-purple-400"
                      : "border-gray-600 text-gray-400 hover:border-gray-500"
                  }`}
                >
                  <div
                    className={`w-3 h-3 rounded-full border-2 ${
                      option.selected
                        ? "border-purple-500 bg-purple-500"
                        : "border-gray-500"
                    }`}
                  ></div>
                  <span className="text-white font-medium">{option.value}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="space-y-4">
            <Button className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white py-4 rounded-xl text-lg font-semibold shadow-lg hover:shadow-xl transition-all duration-300">
              <Play className="mr-2 h-5 w-5" />
              Start Game
            </Button>

            <Button
              onClick={leaveRoom}
              variant="outline"
              className="w-full border-2 border-gray-600 text-gray-300 hover:bg-gray-700 py-4 rounded-xl text-lg font-semibold transition-all duration-300"
            >
              Leave Lobby
            </Button>
          </div>
        </div>
      </motion.div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-900 py-8 px-4">
      <AnimatePresence mode="wait">
        {currentScreen === "home" && renderHomeScreen()}
        {currentScreen === "create" && renderCreateScreen()}
        {currentScreen === "join" && renderJoinScreen()}
        {currentScreen === "lobby" && renderLobbyScreen()}
      </AnimatePresence>
    </div>
  );
}
