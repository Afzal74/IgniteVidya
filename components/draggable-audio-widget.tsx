"use client"

import { useState, useEffect, useRef } from "react"
import { motion } from "framer-motion"
import { Volume2, VolumeX, Play, Pause, Move } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useTheme } from "next-themes"

interface DraggableAudioWidgetProps {
  className?: string
  initialX?: number
  initialY?: number
}

export default function DraggableAudioWidget({ 
  className = "",
  initialX = 50,
  initialY = 50
}: DraggableAudioWidgetProps) {
  const [isMuted, setIsMuted] = useState(false)
  const [isPlaying, setIsPlaying] = useState(false)
  const [position, setPosition] = useState({ x: initialX, y: initialY })
  const [isDragging, setIsDragging] = useState(false)
  
  const audioRef = useRef<HTMLAudioElement>(null)
  const { theme } = useTheme()
  const [mounted, setMounted] = useState(false)

  // Handle hydration
  useEffect(() => {
    setMounted(true)
    
    // Auto-start audio after mounting
    setTimeout(() => {
      const audio = audioRef.current
      if (audio) {
        audio.play().catch(() => {
          // Auto-play prevented, that's fine
        })
      }
    }, 1000)
  }, [])

  useEffect(() => {
    const audio = audioRef.current
    if (!audio) return

    const handlePlay = () => setIsPlaying(true)
    const handlePause = () => setIsPlaying(false)
    const handleEnded = () => {
      audio.currentTime = 0
      audio.play()
    }

    audio.addEventListener('play', handlePlay)
    audio.addEventListener('pause', handlePause)
    audio.addEventListener('ended', handleEnded)

    return () => {
      audio.removeEventListener('play', handlePlay)
      audio.removeEventListener('pause', handlePause)
      audio.removeEventListener('ended', handleEnded)
    }
  }, [mounted])

  const toggleMute = () => {
    const audio = audioRef.current
    if (!audio) return

    const newMutedState = !isMuted
    setIsMuted(newMutedState)
    audio.muted = newMutedState
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

  const handleDrag = (event: any, info: any) => {
    const newX = Math.max(0, Math.min(window.innerWidth - 200, info.point.x - 100))
    const newY = Math.max(0, Math.min(window.innerHeight - 100, info.point.y - 50))
    setPosition({ x: newX, y: newY })
  }

  if (!mounted) return null

  const isDark = theme === 'dark'

  return (
    <>
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

      {/* Draggable Widget */}
      <motion.div
        drag
        dragMomentum={false}
        dragElastic={0.1}
        onDrag={handleDrag}
        onDragStart={() => setIsDragging(true)}
        onDragEnd={() => setIsDragging(false)}
        style={{
          position: 'fixed',
          left: position.x,
          top: position.y,
          zIndex: 9999
        }}
        className={`select-none cursor-move ${className}`}
        whileHover={{ scale: 1.02 }}
        whileDrag={{ scale: 1.05, rotate: 2 }}
        transition={{ type: "spring", stiffness: 300, damping: 30 }}
      >
        <div className={`
          relative rounded-2xl border backdrop-blur-md shadow-2xl overflow-hidden p-3
          ${isDark 
            ? 'bg-black/90 border-gray-600/50 shadow-black/50' 
            : 'bg-white/90 border-gray-300/50 shadow-black/20'
          }
        `}>
          
          {/* Theme Label */}
          <div className={`
            absolute -top-2 left-3 px-2 py-0.5 rounded-full text-xs font-medium
            ${isDark 
              ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white' 
              : 'bg-gradient-to-r from-blue-500 to-cyan-500 text-white'
            }
          `}>
            Theme 1
          </div>

          {/* Drag Handle */}
          <div 
            className={`
              absolute top-1 right-1 p-1 rounded-full cursor-move
              ${isDark ? 'hover:bg-gray-700/50' : 'hover:bg-gray-100/50'}
            `}
          >
            <Move className={`h-3 w-3 ${isDark ? 'text-gray-400' : 'text-gray-500'}`} />
          </div>

          {/* Audio Controls */}
          <div className="flex items-center gap-3">
              {/* Play/Pause Button */}
              <Button
                variant="ghost"
                size="sm"
                onClick={togglePlayPause}
                className={`
                  h-10 w-10 p-0 rounded-full transition-all duration-200
                  ${isDark 
                    ? 'text-gray-300 hover:text-white hover:bg-gray-700/50' 
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100/50'
                  }
                `}
              >
                <motion.div
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.95 }}
                >
                  {isPlaying ? (
                    <Pause className="h-5 w-5" />
                  ) : (
                    <Play className="h-5 w-5" />
                  )}
                </motion.div>
              </Button>

              {/* Mute/Unmute Button */}
              <Button
                variant="ghost"
                size="sm"
                onClick={toggleMute}
                className={`
                  h-10 w-10 p-0 rounded-full relative transition-all duration-200
                  ${isDark 
                    ? 'text-gray-300 hover:text-white hover:bg-gray-700/50' 
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100/50'
                  }
                `}
              >
                <motion.div
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.95 }}
                  animate={{ 
                    rotate: isMuted ? [0, -10, 10, -10, 0] : 0 
                  }}
                  transition={{ duration: 0.3 }}
                >
                  {isMuted ? (
                    <VolumeX className="h-5 w-5 text-red-500" />
                  ) : (
                    <Volume2 className="h-5 w-5" />
                  )}
                </motion.div>

                {/* Sound Waves Animation */}
                {!isMuted && isPlaying && (
                  <div className="absolute -right-1 top-2">
                    <motion.div className="flex items-center gap-0.5">
                      {[1, 2, 3].map((i) => (
                        <motion.div
                          key={i}
                          className={`
                            w-0.5 rounded-full
                            ${isDark 
                              ? 'bg-gradient-to-t from-cyan-400 to-purple-500' 
                              : 'bg-gradient-to-t from-blue-400 to-indigo-500'
                            }
                          `}
                          animate={{
                            height: [2, 6, 2],
                            opacity: [0.4, 1, 0.4]
                          }}
                          transition={{
                            duration: 1.2,
                            repeat: Infinity,
                            delay: i * 0.1
                          }}
                        />
                      ))}
                    </motion.div>
                  </div>
                )}
              </Button>

          </div>

          {/* Pulsing Ring Effect when Active */}
          {isPlaying && !isMuted && (
            <motion.div
              className={`
                absolute inset-0 rounded-2xl border-2 pointer-events-none
                ${isDark 
                  ? 'border-gradient-to-r from-cyan-400 to-purple-500' 
                  : 'border-gradient-to-r from-blue-400 to-indigo-500'
                }
              `}
              animate={{ 
                scale: [1, 1.05, 1],
                opacity: [0.5, 0, 0.5]
              }}
              transition={{ 
                duration: 2,
                repeat: Infinity,
                ease: "easeInOut"
              }}
            />
          )}
        </div>
      </motion.div>
    </>
  )
}
