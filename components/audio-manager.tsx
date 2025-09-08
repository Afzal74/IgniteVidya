"use client"

import { useState, useEffect, useRef } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Volume2, VolumeX, Play, Pause } from "lucide-react"
import { Button } from "@/components/ui/button"

interface AudioManagerProps {
  autoPlay?: boolean
  showControls?: boolean
  className?: string
}

export default function AudioManager({ 
  autoPlay = true, 
  showControls = true,
  className = ""
}: AudioManagerProps) {
  const [isMuted, setIsMuted] = useState(false)
  const [isPlaying, setIsPlaying] = useState(false)
  const [isLoaded, setIsLoaded] = useState(false)
  const [showTooltip, setShowTooltip] = useState(false)
  const audioRef = useRef<HTMLAudioElement>(null)

  useEffect(() => {
    const audio = audioRef.current
    if (!audio) return

    // Load audio
    audio.load()

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
  }, [autoPlay])

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
    <div className={`fixed top-20 right-4 z-40 ${className}`}>
      {/* Hidden Audio Element */}
      <audio 
        ref={audioRef}
        loop
        muted={isMuted}
        preload="auto"
        className="hidden"
      >
        <source src="/Whispers of the Enchanted.mp3" type="audio/mpeg" />
        Your browser does not support the audio element.
      </audio>

      {/* Audio Controls */}
      <motion.div
        initial={{ opacity: 0, x: 100 }}
        animate={{ opacity: isLoaded ? 1 : 0, x: isLoaded ? 0 : 100 }}
        transition={{ duration: 0.5, delay: 1 }}
        className="relative"
      >
        <div className="flex items-center gap-2 bg-black/80 backdrop-blur-sm border border-gray-600/50 rounded-lg p-2">
          {/* Play/Pause Button */}
          <Button
            variant="ghost"
            size="sm"
            onClick={togglePlayPause}
            className="h-8 w-8 p-0 text-gray-300 hover:text-white hover:bg-gray-700/50"
            title={isPlaying ? "Pause music" : "Play music"}
          >
            <motion.div
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
            >
              {isPlaying ? (
                <Pause className="h-4 w-4" />
              ) : (
                <Play className="h-4 w-4" />
              )}
            </motion.div>
          </Button>

          {/* Mute/Unmute Button */}
          <Button
            variant="ghost"
            size="sm"
            onClick={toggleMute}
            className="h-8 w-8 p-0 text-gray-300 hover:text-white hover:bg-gray-700/50 relative"
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
                <VolumeX className="h-4 w-4 text-red-400" />
              ) : (
                <Volume2 className="h-4 w-4" />
              )}
            </motion.div>

            {/* Sound Waves Animation */}
            {!isMuted && isPlaying && (
              <div className="absolute -right-1 top-1/2 transform -translate-y-1/2">
                <motion.div className="flex items-center gap-1">
                  {[1, 2, 3].map((i) => (
                    <motion.div
                      key={i}
                      className="w-0.5 bg-gradient-to-t from-cyan-400 to-purple-500 rounded-full"
                      animate={{
                        height: [2, 8, 2],
                        opacity: [0.4, 1, 0.4]
                      }}
                      transition={{
                        duration: 1.5,
                        repeat: Infinity,
                        delay: i * 0.1
                      }}
                    />
                  ))}
                </motion.div>
              </div>
            )}
          </Button>

          {/* Music Info */}
          <div className="hidden sm:block text-xs text-gray-300 ml-2 max-w-32">
            <div className="truncate font-medium">Background Music</div>
            <div className="truncate text-gray-500">
              {isPlaying ? "♪ Playing..." : "⏸ Paused"}
            </div>
          </div>
        </div>

        {/* Tooltip */}
        <AnimatePresence>
          {showTooltip && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
              className="absolute top-full right-0 mt-2 px-3 py-1 bg-black/90 text-white text-xs rounded border border-gray-600 whitespace-nowrap"
            >
              {isMuted ? "🔇 Music muted" : "🔊 Music playing"}
              <div className="absolute -top-1 right-3 w-2 h-2 bg-black/90 border-l border-t border-gray-600 transform rotate-45" />
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
          className="fixed top-4 right-4 flex items-end gap-1 pointer-events-none z-30"
        >
          {[...Array(5)].map((_, i) => (
            <motion.div
              key={i}
              className="w-1 bg-gradient-to-t from-cyan-400 via-purple-500 to-pink-400 rounded-full"
              animate={{
                height: [4, 12 + Math.random() * 8, 4],
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
