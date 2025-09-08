"use client"

import { useState, useEffect, useRef } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Volume2, VolumeX, Play, Pause, Music } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useTheme } from "next-themes"

interface Song {
  id: number
  title: string
  filename: string
  color: string
  gradient: string
}

interface AudioManagerProps {
  autoPlay?: boolean
  showControls?: boolean
  className?: string
}

const songs: Song[] = [
  {
    id: 1,
    title: "Theme 1",
    filename: "Whispers of the Enchanted.mp3",
    color: "from-purple-400 to-pink-500",
    gradient: "bg-gradient-to-r from-purple-400 to-pink-500"
  },
  {
    id: 2,
    title: "Theme 2",
    filename: "Battle Cries of the Lost.mp3",
    color: "from-red-400 to-orange-500",
    gradient: "bg-gradient-to-r from-red-400 to-orange-500"
  },
  {
    id: 3,
    title: "Theme 3",
    filename: "Stardust Reverie.mp3",
    color: "from-blue-400 to-cyan-500",
    gradient: "bg-gradient-to-r from-blue-400 to-cyan-500"
  },
  {
    id: 4,
    title: "Theme 4",
    filename: "Whispers of the Wild.mp3",
    color: "from-green-400 to-emerald-500",
    gradient: "bg-gradient-to-r from-green-400 to-emerald-500"
  }
]

export default function AudioManager({ 
  autoPlay = true, 
  showControls = true,
  className = ""
}: AudioManagerProps) {
  const [isMuted, setIsMuted] = useState(false)
  const [isPlaying, setIsPlaying] = useState(false)
  const [isLoaded, setIsLoaded] = useState(false)
  const [showTooltip, setShowTooltip] = useState(false)
  const [currentSong, setCurrentSong] = useState(0)
  const [isExpanded, setIsExpanded] = useState(false)
  const audioRef = useRef<HTMLAudioElement>(null)
  const { theme } = useTheme()

  useEffect(() => {
    const audio = audioRef.current
    if (!audio) return

    const handleCanPlay = () => {
      setIsLoaded(true)
      if (autoPlay) {
        // Try to play with user gesture
        const playPromise = audio.play()
        if (playPromise !== undefined) {
          playPromise
            .then(() => {
              setIsPlaying(true)
            })
            .catch((error) => {
              // Auto-play was prevented, which is normal
              console.log("Auto-play prevented:", error)
              setIsPlaying(false)
            })
        }
      }
    }

    const handlePlay = () => setIsPlaying(true)
    const handlePause = () => setIsPlaying(false)
    const handleEnded = () => {
      // Loop the audio
      audio.currentTime = 0
      audio.play()
    }

    audio.addEventListener('canplay', handleCanPlay)
    audio.addEventListener('play', handlePlay)
    audio.addEventListener('pause', handlePause)
    audio.addEventListener('ended', handleEnded)

    return () => {
      audio.removeEventListener('canplay', handleCanPlay)
      audio.removeEventListener('play', handlePlay)
      audio.removeEventListener('pause', handlePause)
      audio.removeEventListener('ended', handleEnded)
    }
  }, [autoPlay, currentSong])

  const toggleMute = () => {
    const audio = audioRef.current
    if (!audio) return

    const newMutedState = !isMuted
    setIsMuted(newMutedState)
    audio.muted = newMutedState
    
    // Show feedback
    setShowTooltip(true)
    setTimeout(() => setShowTooltip(false), 1500)
  }

  const togglePlayPause = () => {
    const audio = audioRef.current
    if (!audio) return

    if (isPlaying) {
      audio.pause()
    } else {
      audio.play()
    }
  }

  const selectSong = (songIndex: number) => {
    if (songIndex === currentSong) return
    
    const audio = audioRef.current
    if (audio) {
      const wasPlaying = isPlaying
      
      // Immediately stop current audio and update state
      audio.pause()
      audio.currentTime = 0
      setIsPlaying(false)  // ← Important: immediately set playing state to false
      
      // Change to new song
      setCurrentSong(songIndex)
      
      // If music was playing, start the new song after audio element updates
      if (wasPlaying) {
        setTimeout(() => {
          const newAudio = audioRef.current
          if (newAudio) {
            const playPromise = newAudio.play()
            if (playPromise !== undefined) {
              playPromise
                .then(() => {
                  setIsPlaying(true)  // ← Update state when new song actually starts
                })
                .catch(() => {
                  setIsPlaying(false)
                })
            }
          }
        }, 150)
      }
    }
  }

  if (!showControls) return (
    <audio 
      ref={audioRef}
      loop
      muted={isMuted}
      preload="auto"
    >
      <source src="/Whispers of the Enchanted.mp3" type="audio/mpeg" />
    </audio>
  )

  return (
    <div className={`fixed top-16 right-2 sm:top-20 sm:right-4 z-40 ${className}`}>
      {/* Hidden Audio Element */}
      <audio 
        ref={audioRef}
        loop
        muted={isMuted}
        preload="auto"
        className="hidden"
        key={currentSong}
      >
        <source src={`/${songs[currentSong].filename}`} type="audio/mpeg" />
        Your browser does not support the audio element.
      </audio>

      {/* Circular Music Selector */}
      <motion.div
        initial={{ opacity: 0, x: 100 }}
        animate={{ opacity: isLoaded ? 1 : 0, x: isLoaded ? 0 : 100 }}
        transition={{ duration: 0.5, delay: 1 }}
        className="relative"
      >
        {/* Compact View */}
        {!isExpanded && (
          <motion.div 
            className={`
              ${theme === 'dark' ? 'bg-black/80 border-gray-600/50' : 'bg-white/90 border-gray-300/50'} 
              backdrop-blur-sm border rounded-full p-1.5 sm:p-2 cursor-pointer shadow-lg hover:shadow-xl
              transition-colors duration-200
            `}
            onClick={() => setIsExpanded(true)}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <div className="flex items-center gap-1.5 sm:gap-2">
              {/* Current Song Indicator */}
              <div className={`w-4 h-4 sm:w-5 sm:h-5 rounded-full ${songs[currentSong].gradient} flex items-center justify-center shadow-md`}>
                <Music className="h-2 w-2 sm:h-2.5 sm:w-2.5 text-white" />
              </div>
              
              {/* Sound Waves */}
              {!isMuted && isPlaying && (
                <div className="flex items-center gap-0.5">
                  {[1, 2, 3].map((i) => (
                    <motion.div
                      key={i}
                      className="w-0.5 bg-gradient-to-t from-cyan-400 to-purple-500 rounded-full"
                      animate={{
                        height: [2, 5, 2],
                        opacity: [0.4, 1, 0.4]
                      }}
                      transition={{
                        duration: 1.5,
                        repeat: Infinity,
                        delay: i * 0.1
                      }}
                    />
                  ))}
                </div>
              )}
            </div>
          </motion.div>
        )}

        {/* Expanded View */}
        <AnimatePresence>
          {isExpanded && (
            <motion.div
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0, opacity: 0 }}
              transition={{ type: "spring", stiffness: 300, damping: 25 }}
              className={`
                ${theme === 'dark' ? 'bg-black/90 border-gray-600/50' : 'bg-white/95 border-gray-300/50'} 
                backdrop-blur-sm border rounded-2xl p-3 sm:p-4 min-w-56 sm:min-w-64 max-w-72
                transition-colors duration-200
              `}
            >
              {/* Header */}
              <div className="flex items-center justify-between mb-3 sm:mb-4">
                <h3 className={`${theme === 'dark' ? 'text-white' : 'text-gray-900'} font-medium text-sm`}>
                  Select Study Music
                </h3>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsExpanded(false)}
                  className={`h-6 w-6 p-0 transition-colors ${
                    theme === 'dark' 
                      ? 'text-gray-400 hover:text-white' 
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  ×
                </Button>
              </div>

              {/* Song Selection Circles */}
              <div className="grid grid-cols-2 gap-3 sm:gap-4 mb-3 sm:mb-4">
                {songs.map((song, index) => (
                  <motion.div
                    key={song.id}
                    className={`relative cursor-pointer group flex flex-col items-center`}
                    onClick={() => selectSong(index)}
                    whileHover={{ scale: 1.08 }}
                    whileTap={{ scale: 0.92 }}
                  >
                    <div className={`
                      w-10 h-10 sm:w-12 sm:h-12 rounded-full ${song.gradient} flex items-center justify-center shadow-lg
                      ${currentSong === index ? (
                        theme === 'dark' 
                          ? 'ring-2 ring-white ring-offset-2 ring-offset-black/90 shadow-xl' 
                          : 'ring-2 ring-gray-900 ring-offset-2 ring-offset-white shadow-xl'
                      ) : 'shadow-md hover:shadow-lg'}
                      transition-all duration-300
                    `}>
                      <Music className={`h-3.5 w-3.5 sm:h-4 sm:w-4 text-white ${currentSong === index && isPlaying ? 'animate-pulse' : ''}`} />
                    </div>
                    
                    {/* Song Title */}
                    <div className={`text-xs text-center mt-1.5 sm:mt-2 ${
                      theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
                    }`}>
                      <div className="font-medium">
                        {song.title}
                      </div>
                    </div>

                    {/* Playing Indicator */}
                    {currentSong === index && isPlaying && !isMuted && (
                      <motion.div 
                        className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 sm:w-3 sm:h-3 bg-green-400 rounded-full flex items-center justify-center shadow-md"
                        animate={{ scale: [1, 1.3, 1] }}
                        transition={{ duration: 1.2, repeat: Infinity }}
                      >
                        <div className="w-1 h-1 sm:w-1.5 sm:h-1.5 bg-white rounded-full" />
                      </motion.div>
                    )}
                  </motion.div>
                ))}
              </div>

              {/* Controls */}
              <div className="flex items-center justify-center gap-2 sm:gap-3">
                {/* Play/Pause Button */}
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={togglePlayPause}
                  className={`h-9 w-9 sm:h-10 sm:w-10 p-0 rounded-full transition-colors ${
                    theme === 'dark' 
                      ? 'text-gray-300 hover:text-white hover:bg-gray-700/50' 
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-200/50'
                  }`}
                  title={isPlaying ? "Pause music" : "Play music"}
                >
                  <motion.div
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    {isPlaying ? (
                      <Pause className="h-4 w-4 sm:h-5 sm:w-5" />
                    ) : (
                      <Play className="h-4 w-4 sm:h-5 sm:w-5" />
                    )}
                  </motion.div>
                </Button>

                {/* Mute/Unmute Button */}
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={toggleMute}
                  className={`h-9 w-9 sm:h-10 sm:w-10 p-0 rounded-full relative transition-colors ${
                    theme === 'dark' 
                      ? 'text-gray-300 hover:text-white hover:bg-gray-700/50' 
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-200/50'
                  }`}
                  title={isMuted ? "Unmute music" : "Mute music"}
                >
                  <motion.div
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.95 }}
                    animate={{ 
                      rotate: isMuted ? [0, -10, 10, -10, 0] : 0 
                    }}
                    transition={{ duration: 0.5 }}
                  >
                    {isMuted ? (
                      <VolumeX className="h-4 w-4 sm:h-5 sm:w-5 text-red-400" />
                    ) : (
                      <Volume2 className="h-4 w-4 sm:h-5 sm:w-5" />
                    )}
                  </motion.div>
                </Button>
              </div>

              {/* Current Song Info */}
              <div className={`text-center mt-3 pt-3 border-t ${
                theme === 'dark' ? 'border-gray-700' : 'border-gray-300'
              }`}>
                <div className={`text-xs font-medium ${
                  theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
                }`}>
                  {songs[currentSong].title}
                </div>
                <div className={`text-xs mt-1 ${
                  theme === 'dark' ? 'text-gray-500' : 'text-gray-500'
                }`}>
                  {isPlaying && !isMuted ? "♪ Now Playing" : isMuted ? "🔇 Muted" : "⏸ Paused"}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Tooltip */}
        <AnimatePresence>
          {showTooltip && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
              className={`absolute top-full right-0 mt-2 px-2 sm:px-3 py-1 text-xs rounded border whitespace-nowrap shadow-lg ${
                theme === 'dark'
                  ? 'bg-black/90 text-white border-gray-600'
                  : 'bg-white/90 text-gray-900 border-gray-300'
              }`}
            >
              {isMuted ? "🔇 Music muted" : "🔊 Music playing"}
              <div className={`absolute -top-1 right-2 sm:right-3 w-2 h-2 border-l border-t transform rotate-45 ${
                theme === 'dark'
                  ? 'bg-black/90 border-gray-600'
                  : 'bg-white/90 border-gray-300'
              }`} />
            </motion.div>
          )}
        </AnimatePresence>

        {/* Pulsing Ring Effect */}
        <AnimatePresence>
          {isPlaying && !isMuted && (
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ 
                scale: [1, 1.3, 1],
                opacity: [0.5, 0, 0.5]
              }}
              exit={{ scale: 0.8, opacity: 0 }}
              transition={{ 
                duration: 2,
                repeat: Infinity,
                ease: "easeInOut"
              }}
              className="absolute inset-0 rounded-lg border-2 border-gradient-to-r from-cyan-400 to-purple-500 pointer-events-none"
              style={{
                background: 'linear-gradient(45deg, rgba(34, 197, 94, 0.1), rgba(168, 85, 247, 0.1))'
              }}
            />
          )}
        </AnimatePresence>
      </motion.div>

      {/* Mini Visualizer (Optional) */}
      {isPlaying && !isMuted && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.6 }}
          exit={{ opacity: 0 }}
          className="fixed top-2 right-2 sm:top-4 sm:right-4 flex items-end gap-0.5 sm:gap-1 pointer-events-none z-30"
        >
          {[...Array(4)].map((_, i) => (
            <motion.div
              key={i}
              className="w-0.5 sm:w-1 bg-gradient-to-t from-cyan-400 via-purple-500 to-pink-400 rounded-full"
              animate={{
                height: [3, 8 + Math.random() * 6, 3],
                opacity: [0.3, 1, 0.3]
              }}
              transition={{
                duration: 1 + Math.random() * 0.5,
                repeat: Infinity,
                delay: i * 0.1
              }}
            />
          ))}
        </motion.div>
      )}
    </div>
  )
}
