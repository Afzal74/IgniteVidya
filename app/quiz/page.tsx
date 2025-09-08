"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
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
  Play
} from "lucide-react"

type Screen = "home" | "create" | "join" | "lobby"
type GameMode = "classic" | "speed" | "survival" | "team"
type Difficulty = "easy" | "medium" | "hard" | "mixed"

interface Player {
  id: string
  name: string
  avatar: string
  isHost: boolean
  isReady: boolean
  score?: number
}

interface Room {
  id: string
  name: string
  code: string
  host: string
  players: Player[]
  maxPlayers: number
  gameMode: GameMode
  difficulty: Difficulty
  questionCount: number
  timeLimit: number
  isPrivate: boolean
  createdAt: Date
}

export default function QuizPage() {
  const [currentScreen, setCurrentScreen] = useState<Screen>("home")
  const [tabletMode, setTabletMode] = useState<"join" | "create">("join")
  const [playerName, setPlayerName] = useState("")
  const [roomCode, setRoomCode] = useState("")
  const [currentRoom, setCurrentRoom] = useState<Room | null>(null)
  const [isHost, setIsHost] = useState(false)
  
  // Room settings (when creating)
  const [roomName, setRoomName] = useState("")
  const [gameMode, setGameMode] = useState<GameMode>("classic")
  const [difficulty, setDifficulty] = useState<Difficulty>("medium")
  const [selectedCategory, setSelectedCategory] = useState<string>("mathematics")
  const [questionCount, setQuestionCount] = useState(10)
  const [timeLimit, setTimeLimit] = useState(30)
  const [maxPlayers, setMaxPlayers] = useState(6)
  const [isPrivateRoom, setIsPrivateRoom] = useState(false)

  // Sample players for demo
  const samplePlayers: Player[] = [
    {
      id: "1",
      name: "Alex",
      avatar: "🎯",
      isHost: true,
      isReady: true
    },
    {
      id: "2", 
      name: "Sarah",
      avatar: "🚀",
      isHost: false,
      isReady: true
    },
    {
      id: "3",
      name: "Mike",
      avatar: "⚡",
      isHost: false,
      isReady: false
    },
    {
      id: "4",
      name: "Emma",
      avatar: "🎨",
      isHost: false,
      isReady: true
    }
  ]

  const generateRoomCode = () => {
    return Math.random().toString(36).substring(2, 8).toUpperCase()
  }

  const createRoom = () => {
    if (!roomName.trim() || !playerName.trim()) return
    
    const newRoom: Room = {
      id: Math.random().toString(36).substring(2),
      name: roomName,
      code: generateRoomCode(),
      host: playerName,
      players: [{
        id: "host",
        name: playerName,
        avatar: "👑",
        isHost: true,
        isReady: true
      }, ...samplePlayers.slice(1)],
      maxPlayers,
      gameMode,
      difficulty,
      questionCount,
      timeLimit,
      isPrivate: isPrivateRoom,
      createdAt: new Date()
    }
    
    setCurrentRoom(newRoom)
    setIsHost(true)
    setCurrentScreen("lobby")
  }

  const joinRoom = () => {
    if (!roomCode.trim() || !playerName.trim()) return
    
    // Simulate joining a room
    const mockRoom: Room = {
      id: "mock",
      name: "Mathematics Championship",
      code: roomCode.toUpperCase(),
      host: "Alex",
      players: [...samplePlayers, {
        id: "player",
        name: playerName,
        avatar: "🎮",
        isHost: false,
        isReady: false
      }],
      maxPlayers: 6,
      gameMode: "classic",
      difficulty: "medium",
      questionCount: 15,
      timeLimit: 30,
      isPrivate: false,
      createdAt: new Date()
    }
    
    setCurrentRoom(mockRoom)
    setIsHost(false)
    setCurrentScreen("lobby")
  }

  const copyRoomCode = () => {
    if (currentRoom) {
      navigator.clipboard.writeText(currentRoom.code)
      // You could add a toast notification here
    }
  }

  const leaveRoom = () => {
    setCurrentRoom(null)
    setIsHost(false)
    setCurrentScreen("home")
  }

  const getGameModeIcon = (mode: GameMode) => {
    switch (mode) {
      case "classic": return <Brain className="h-5 w-5" />
      case "speed": return <Zap className="h-5 w-5" />
      case "survival": return <Shield className="h-5 w-5" />
      case "team": return <Users className="h-5 w-5" />
    }
  }

  const getDifficultyColor = (diff: Difficulty) => {
    switch (diff) {
      case "easy": return "text-green-600 bg-green-50 border-green-200 dark:bg-green-900/20 dark:text-green-400"
      case "medium": return "text-yellow-600 bg-yellow-50 border-yellow-200 dark:bg-yellow-900/20 dark:text-yellow-400"
      case "hard": return "text-red-600 bg-red-50 border-red-200 dark:bg-red-900/20 dark:text-red-400"
      case "mixed": return "text-purple-600 bg-purple-50 border-purple-200 dark:bg-purple-900/20 dark:text-purple-400"
    }
  }

  const renderHomeScreen = () => (
    <div className="max-w-6xl mx-auto">
      {/* Hero Section */}
      <motion.div
        initial={{ opacity: 0, y: -30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="text-center mb-8 pt-16 md:pt-20"
      >
        <div className="mb-12 px-4 md:px-8">
          <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold leading-tight mb-6 tracking-tight">
            <span className="text-white drop-shadow-lg font-bold">Challenge Your </span>
            <span className="bg-gradient-to-r from-pink-500 via-purple-500 to-blue-500 bg-clip-text text-transparent drop-shadow-xl font-bold tracking-wide">STEM Knowledge</span>
            <br className="block md:hidden" />
            <span className="text-white drop-shadow-lg font-bold"> in Real-Time </span>
            <span className="bg-gradient-to-r from-cyan-400 via-purple-500 to-pink-500 bg-clip-text text-transparent drop-shadow-xl font-bold tracking-wide">Quizzes</span>
          </h1>
          <p className="text-sm md:text-base lg:text-lg text-gray-300 leading-relaxed max-w-3xl mx-auto font-medium px-4">
            Master Science, Technology, Engineering & Mathematics through exciting multiplayer quiz battles. 
            Join thousands of students advancing their STEM education!
          </p>
        </div>
        
        <div className="flex justify-center gap-4 mb-16">
          <Button 
            onClick={() => setTabletMode("create")}
            size="lg"
            className={`px-6 md:px-8 py-3 md:py-4 rounded-xl text-base md:text-lg font-semibold shadow-lg hover:shadow-xl transition-all duration-300 ${tabletMode === 'create' ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white' : 'bg-gray-800 text-gray-200 hover:bg-gray-700'}`}
          >
            <UserPlus className="mr-2 h-4 w-4 md:h-5 md:w-5" />
            Create Room
          </Button>
          
          <Button 
            onClick={() => setTabletMode("join")}
            size="lg"
            variant="outline"
            className={`border-2 px-6 md:px-8 py-3 md:py-4 rounded-xl text-base md:text-lg font-semibold transition-all duration-300 ${tabletMode === 'join' ? 'border-purple-500 text-white bg-gray-800' : 'border-gray-600 text-white hover:bg-gray-800'}`}
          >
            <ArrowRight className="mr-2 h-4 w-4 md:h-5 md:w-5" />
            Join Room
          </Button>
        </div>
        
        <div className="flex justify-center items-center gap-8">
          <div className="flex items-center gap-2 text-gray-400">
            <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
            <span className="text-sm">Interactive STEM Learning</span>
          </div>
          <div className="text-blue-400 text-sm font-medium">
            25,000+ STEM students online
          </div>
        </div>
      </motion.div>
      
      {/* Tablet-Style Join Room Interface */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.3 }}
        className="max-w-4xl mx-auto"
      >
        {/* Tablet Frame */}
        <div className="relative">
          {/* Tablet Bezel */}
          <div className="bg-gray-800 p-4 md:p-6 rounded-3xl shadow-2xl border border-gray-700">
            {/* Screen */}
            <div className="bg-gray-900 rounded-2xl p-6 md:p-8 border border-gray-600 min-h-[500px] max-h-[70vh] overflow-y-auto">
              {/* Status Bar */}
              <div className="flex items-center justify-between mb-6 pb-4 border-b border-gray-700">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                  <span className="text-xs text-gray-400">IgniteVidya STEM Quiz Portal</span>
                </div>
                <div className="flex items-center gap-1">
                  <div className="w-4 h-2 bg-gray-600 rounded-sm"></div>
                  <div className="w-6 h-3 border border-gray-600 rounded-sm">
                    <div className="w-4 h-full bg-green-500 rounded-sm"></div>
                  </div>
                </div>
              </div>
              
              <h2 className="text-2xl md:text-3xl font-bold text-white mb-8 text-center">
                {tabletMode === 'join' ? 'Join a STEM Quiz Room' : 'Create a New Quiz Room'}
              </h2>
              
              {tabletMode === 'join' ? (
              <div className="grid md:grid-cols-2 gap-8">
                {/* Left Column */}
                <div className="space-y-6">
                  {/* Room Code */}
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-3">Room Code</label>
                    <Input
                      value={roomCode}
                      onChange={(e) => setRoomCode(e.target.value.toUpperCase())}
                      placeholder="Enter 6-digit code"
                      className="bg-gray-800 border-2 border-gray-600 text-white placeholder-gray-400 rounded-xl h-14 text-center text-lg font-mono tracking-wider focus:border-purple-500 transition-colors"
                      maxLength={6}
                    />
                    <p className="text-xs text-gray-400 mt-2">Enter a 6-character room code (e.g. ABC123)</p>
                  </div>
                  
                  {/* Your Name */}
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-3">Your Name</label>
                    <Input
                      value={playerName}
                      onChange={(e) => setPlayerName(e.target.value)}
                      placeholder="Enter your name"
                      className="bg-gray-800 border-2 border-gray-600 text-white placeholder-gray-400 rounded-xl h-14 focus:border-purple-500 transition-colors"
                      maxLength={20}
                    />
                  </div>
                  
                  {/* Select Difficulty */}
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-3">Select Difficulty</label>
                    <div className="grid grid-cols-3 gap-3">
                      {[
                        { id: 'easy', label: 'Easy', time: '45s', icon: '🎯', color: 'green', selected: difficulty === 'easy' },
                        { id: 'medium', label: 'Medium', time: '30s', icon: '⚡', color: 'yellow', selected: difficulty === 'medium' },
                        { id: 'hard', label: 'Hard', time: '20s', icon: '🚀', color: 'red', selected: difficulty === 'hard' }
                      ].map((diff) => (
                        <button
                          key={diff.id}
                          onClick={() => setDifficulty(diff.id as Difficulty)}
                          className={`p-4 rounded-xl border-2 text-center transition-all hover:scale-105 ${
                            diff.selected
                              ? diff.color === 'green' ? 'border-green-500 bg-green-500/20 shadow-green-500/25'
                              : diff.color === 'yellow' ? 'border-yellow-500 bg-yellow-500/20 shadow-yellow-500/25'
                              : 'border-red-500 bg-red-500/20 shadow-red-500/25'
                              : 'border-gray-600 bg-gray-800/50 hover:border-gray-500'
                          } shadow-lg`}
                        >
                          <div className="text-2xl mb-2">{diff.icon}</div>
                          <div className="text-white font-semibold text-sm">{diff.label}</div>
                          <div className="text-gray-400 text-xs mt-1">{diff.time} per Q</div>
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
                
                {/* Right Column */}
                <div className="space-y-6">
                  {/* STEM Categories */}
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-3">
                      STEM Subject Categories
                    </label>
                    <div className="grid grid-cols-2 gap-3">
                      {[
                        { id: 'mathematics', label: 'Mathematics', icon: '📐' },
                        { id: 'physics', label: 'Physics', icon: '⚛️' },
                        { id: 'chemistry', label: 'Chemistry', icon: '🧪' },
                        { id: 'biology', label: 'Biology', icon: '🧬' },
                        { id: 'engineering', label: 'Engineering', icon: '⚙️' },
                        { id: 'technology', label: 'Technology', icon: '💻' }
                      ].map((cat) => {
                        const selected = selectedCategory === cat.id
                        return (
                          <button
                            type="button"
                            key={cat.id}
                            onClick={() => setSelectedCategory(cat.id)}
                            aria-pressed={selected}
                            className={`p-4 rounded-xl border-2 text-center transition-all hover:scale-105 ${
                              selected
                                ? 'border-blue-500 bg-blue-500/20 shadow-blue-500/25'
                                : 'border-gray-600 bg-gray-800/50 hover:border-gray-500'
                            } shadow-lg`}
                          >
                            <div className="text-xl mb-2">{cat.icon}</div>
                            <div className="text-white font-medium text-xs">{cat.label}</div>
                          </button>
                        )
                      })}
                    </div>
                  </div>
                  
                  {/* Additional Settings */}
                  <div className="bg-gray-800/50 rounded-xl p-4 border border-gray-700">
                    <h4 className="text-white font-medium mb-3">Quiz Settings</h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between text-gray-300">
                        <span>Questions per Round:</span>
                        <span className="text-white font-medium">15-20</span>
                      </div>
                      <div className="flex justify-between text-gray-300">
                        <span>Max Players:</span>
                        <span className="text-white font-medium">8</span>
                      </div>
                      <div className="flex justify-between text-gray-300">
                        <span>Real-time Scoring:</span>
                        <span className="text-green-400 font-medium">✓ Enabled</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              ) : (
              <div className="space-y-6">
                {/* Creator name */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Your Name</label>
                  <Input
                    value={playerName}
                    onChange={(e) => setPlayerName(e.target.value)}
                    placeholder="Enter your name"
                    className="bg-gray-800 border-2 border-gray-600 text-white placeholder-gray-400 rounded-xl h-12 focus:border-purple-500 transition-colors"
                  />
                </div>
                
                {/* Room name */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Room Name</label>
                  <Input
                    value={roomName}
                    onChange={(e) => setRoomName(e.target.value)}
                    placeholder="e.g. Physics Wizards"
                    className="bg-gray-800 border-2 border-gray-600 text-white placeholder-gray-400 rounded-xl h-12 focus:border-purple-500 transition-colors"
                  />
                </div>
                
                {/* Settings grid */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Difficulty</label>
                    <div className="grid grid-cols-3 gap-2">
                      {['easy','medium','hard'].map((d) => (
                        <button key={d} onClick={() => setDifficulty(d as Difficulty)}
                          className={`p-2 rounded-lg border-2 text-center transition-all text-xs ${
                            difficulty===d ? 'border-purple-500 bg-purple-500/20 text-purple-300' : 'border-gray-600 bg-gray-800/50 hover:border-gray-500 text-gray-300'
                          }`}
                        >
                          <div className="font-semibold capitalize">{d}</div>
                        </button>
                      ))}
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Max Players</label>
                    <div className="flex items-center gap-3 bg-gray-800 border-2 border-gray-600 rounded-xl px-3 py-2">
                      <input 
                        type="range" 
                        min={2} 
                        max={10} 
                        value={maxPlayers} 
                        onChange={(e)=>setMaxPlayers(parseInt(e.target.value))} 
                        className="flex-1 h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer slider"
                        style={{
                          background: `linear-gradient(to right, #8b5cf6 0%, #8b5cf6 ${((maxPlayers - 2) / 8) * 100}%, #374151 ${((maxPlayers - 2) / 8) * 100}%, #374151 100%)`
                        }}
                      />
                      <span className="text-white font-bold text-lg min-w-[1.5rem] text-center">{maxPlayers}</span>
                    </div>
                  </div>
                </div>
                
                {/* STEM Categories for Create Mode */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">STEM Subject</label>
                  <div className="grid grid-cols-3 gap-2">
                    {[
                      { id: 'mathematics', label: 'Math', icon: '📐' },
                      { id: 'physics', label: 'Physics', icon: '⚛️' },
                      { id: 'chemistry', label: 'Chemistry', icon: '🧪' },
                      { id: 'biology', label: 'Biology', icon: '🧬' },
                      { id: 'engineering', label: 'Engineering', icon: '⚙️' },
                      { id: 'technology', label: 'Tech', icon: '💻' }
                    ].map((cat) => {
                      const selected = selectedCategory === cat.id
                      return (
                        <button
                          type="button"
                          key={cat.id}
                          onClick={() => setSelectedCategory(cat.id)}
                          className={`p-2 rounded-lg border-2 text-center transition-all text-xs ${
                            selected
                              ? 'border-blue-500 bg-blue-500/20 text-blue-300'
                              : 'border-gray-600 bg-gray-800/50 hover:border-gray-500 text-gray-300'
                          }`}
                        >
                          <div className="text-sm mb-1">{cat.icon}</div>
                          <div className="font-medium">{cat.label}</div>
                        </button>
                      )
                    })}
                  </div>
                </div>
              </div>
              )}
              
              {/* Action Button */}
              <div className="mt-8 pt-6 border-t border-gray-700">
                {tabletMode === 'join' ? (
                  <Button onClick={joinRoom} disabled={!roomCode.trim() || !playerName.trim()} className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white py-4 rounded-xl text-lg font-semibold shadow-lg hover:shadow-xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed h-14">
                    <Play className="mr-2 h-5 w-5" />
                    Join {selectedCategory.charAt(0).toUpperCase() + selectedCategory.slice(1)} Room
                  </Button>
                ) : (
                  <Button onClick={createRoom} disabled={!roomName.trim() || !playerName.trim()} className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white py-4 rounded-xl text-lg font-semibold shadow-lg hover:shadow-xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed h-14">
                    <Play className="mr-2 h-5 w-5" />
                    Create Room
                  </Button>
                )}
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  )

  const renderCreateScreen = () => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="max-w-2xl mx-auto"
    >
      <div className="bg-gray-800/90 backdrop-blur-sm rounded-2xl p-8 border border-gray-700 shadow-2xl">
        <h1 className="text-3xl font-bold text-white mb-8">Create a New Quiz Room</h1>
        
        <div className="space-y-6">
          {/* Your Name */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Your Name</label>
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
            <label className="block text-sm font-medium text-gray-300 mb-2">Add Bots (0-15)</label>
            <div className="flex items-center gap-4">
              <input
                type="range"
                min="0"
                max="15"
                value={maxPlayers - 1}
                onChange={(e) => setMaxPlayers(parseInt(e.target.value) + 1)}
                className="flex-1 h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer slider"
                style={{
                  background: `linear-gradient(to right, #8b5cf6 0%, #8b5cf6 ${((maxPlayers - 1) / 15) * 100}%, #374151 ${((maxPlayers - 1) / 15) * 100}%, #374151 100%)`
                }}
              />
              <span className="text-2xl font-bold text-purple-400 min-w-[2rem]">{maxPlayers - 1}</span>
            </div>
            <p className="text-sm text-gray-400 mt-1">{maxPlayers - 1} bots will join</p>
          </div>
          
          {/* Number of Rounds */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Number of Rounds</label>
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
            <p className="text-sm text-gray-400 mt-1">{questionCount} questions per game</p>
          </div>
          
          {/* Select Difficulty */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-3">Select Difficulty</label>
            <div className="grid grid-cols-3 gap-3">
              {[
                { id: 'easy', label: 'Easy', time: '30s per question', icon: '🛡️', selected: difficulty === 'easy' },
                { id: 'medium', label: 'Average', time: '20s per question', icon: '⚡', selected: difficulty === 'medium' },
                { id: 'hard', label: 'Hard', time: '15s per question', icon: '🏆', selected: difficulty === 'hard' }
              ].map((diff) => (
                <button
                  key={diff.id}
                  onClick={() => setDifficulty(diff.id as Difficulty)}
                  className={`p-4 rounded-lg border-2 text-center transition-all ${
                    diff.selected
                      ? 'border-orange-500 bg-orange-500/20'
                      : 'border-gray-600 bg-gray-700/50 hover:border-gray-500'
                  }`}
                >
                  <div className="text-2xl mb-1">{diff.icon}</div>
                  <div className="text-white font-medium text-sm">{diff.label}</div>
                  <div className="text-gray-400 text-xs mt-1">{diff.time}</div>
                </button>
              ))}
            </div>
          </div>
          
          {/* Select Category */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-3">Select Category (20s per question)</label>
            <div className="grid grid-cols-3 gap-3 mb-3">
              {[
                { id: 'all', label: 'All', icon: '🏆', selected: true },
                { id: 'english', label: 'English', icon: '📚', selected: false },
                { id: 'science', label: 'Science', icon: '🔬', selected: false }
              ].map((cat) => (
                <button
                  key={cat.id}
                  className={`p-3 rounded-lg border-2 text-center transition-all ${
                    cat.selected
                      ? 'border-purple-500 bg-purple-500/20'
                      : 'border-gray-600 bg-gray-700/50 hover:border-gray-500'
                  }`}
                >
                  <div className="text-lg mb-1">{cat.icon}</div>
                  <div className="text-white font-medium text-sm">{cat.label}</div>
                </button>
              ))}
            </div>
            <div className="grid grid-cols-2 gap-3">
              {[
                { id: 'social', label: 'Social', icon: '🌍', selected: false },
                { id: 'cs', label: 'CS', icon: '💻', selected: false }
              ].map((cat) => (
                <button
                  key={cat.id}
                  className={`p-3 rounded-lg border-2 text-center transition-all ${
                    cat.selected
                      ? 'border-purple-500 bg-purple-500/20'
                      : 'border-gray-600 bg-gray-700/50 hover:border-gray-500'
                  }`}
                >
                  <div className="text-lg mb-1">{cat.icon}</div>
                  <div className="text-white font-medium text-sm">{cat.label}</div>
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
  )

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
  )

  const renderLobbyScreen = () => {
    if (!currentRoom) return null

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
                { name: 'sad', isHost: true, avatar: '⚡', color: 'from-purple-500 to-pink-500' },
                { name: 'BrainBot0', isHost: false, avatar: '🚀', color: 'from-purple-500 to-pink-500' },
                { name: 'QuizQueen1', isHost: false, avatar: '⚡', color: 'from-purple-500 to-pink-500' }
              ].map((player, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="flex items-center gap-4 bg-gray-700/50 rounded-xl p-4 border border-gray-600"
                >
                  <div className={`w-12 h-12 rounded-full bg-gradient-to-br ${player.color} flex items-center justify-center text-white text-lg font-bold`}>
                    {player.avatar}
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-white font-medium text-lg">{player.name}</span>
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
                { value: '5s', selected: false },
                { value: '10s', selected: true },
                { value: '15s', selected: false }
              ].map((option, index) => (
                <button
                  key={index}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg border-2 transition-all ${
                    option.selected
                      ? 'border-purple-500 bg-purple-500/20 text-purple-400'
                      : 'border-gray-600 text-gray-400 hover:border-gray-500'
                  }`}
                >
                  <div className={`w-3 h-3 rounded-full border-2 ${
                    option.selected
                      ? 'border-purple-500 bg-purple-500'
                      : 'border-gray-500'
                  }`}></div>
                  <span className="text-white font-medium">{option.value}</span>
                </button>
              ))}
            </div>
          </div>
          
          {/* Action Buttons */}
          <div className="space-y-4">
            <Button 
              className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white py-4 rounded-xl text-lg font-semibold shadow-lg hover:shadow-xl transition-all duration-300"
            >
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
    )
  }

  return (
    <div className="min-h-screen bg-gray-900 py-8 px-4">
      <AnimatePresence mode="wait">
        {currentScreen === "home" && renderHomeScreen()}
        {currentScreen === "create" && renderCreateScreen()}
        {currentScreen === "join" && renderJoinScreen()}
        {currentScreen === "lobby" && renderLobbyScreen()}
      </AnimatePresence>
    </div>
  )
}
