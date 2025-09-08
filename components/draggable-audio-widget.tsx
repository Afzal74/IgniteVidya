"use client"

import { useState, useEffect, useRef } from "react"
import { motion, useDragControls, PanInfo } from "framer-motion"
import { Volume2, VolumeX, Play, Pause, Move, Settings } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useTheme } from "next-themes"
import { useWidgetPosition } from "@/hooks/use-widget-position"

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
  const [isLoaded, setIsLoaded] = useState(false)
  const [isExpanded, setIsExpanded] = useState(false)
  const [isDragging, setIsDragging] = useState(false)
  const [showSettings, setShowSettings] = useState(false)
  
  const audioRef = useRef<HTMLAudioElement>(null)
  const dragControls = useDragControls()
  const { theme } = useTheme()
  const [mounted, setMounted] = useState(false)
  
  // Use persistent position hook
  const { position, updatePosition } = useWidgetPosition('audio-theme1', {
    x: initialX,
    y: initialY
  })

  // Handle hydration
  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    const audio = audioRef.current
    if (!audio) return

    // Load audio
    audio.load()

    const handleCanPlay = () => {
      setIsLoaded(true)
      // Try to play with user gesture
      const playPromise = audio.play()
      if (playPromise !== undefined) {
        playPromise
          .then(() => {
            setIsPlaying(true)
          })
          .catch((error) => {
            console.log("Auto-play prevented:", error)
            setIsPlaying(false)
          })
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
  }, [])

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

  const handleDragEnd = (event: any, info: PanInfo) => {
    setIsDragging(false)
    const newX = Math.max(0, Math.min(window.innerWidth - 200, position.x + info.offset.x))
    const newY = Math.max(0, Math.min(window.innerHeight - 100, position.y + info.offset.y))
    updatePosition({ x: newX, y: newY })
  }

  const startDrag = (event: React.PointerEvent) => {
    setIsDragging(true)
    dragControls.start(event)
  }

  if (!mounted || !isLoaded) return null

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
        dragControls={dragControls}
        dragMomentum={false}
        dragElastic={0.1}
        onDragStart={() => setIsDragging(true)}
        onDragEnd={handleDragEnd}
        style={{
          position: 'fixed',
          left: position.x,
          top: position.y,
          zIndex: 9999
        }}
        className={`select-none cursor-move ${className}`}
        whileHover={{ scale: 1.02 }}
        whileDrag={{ scale: 1.05, rotate: isDragging ? 2 : 0 }}
        animate={{ 
          scale: isDragging ? 1.05 : 1,
          rotate: isDragging ? 2 : 0
        }}
        transition={{ type: "spring", stiffness: 300, damping: 30 }}
      >
        <div className={`
          relative rounded-2xl border backdrop-blur-md shadow-2xl overflow-hidden
          ${isDark 
            ? 'bg-black/90 border-gray-600/50 shadow-black/50' 
            : 'bg-white/90 border-gray-300/50 shadow-black/20'
          }
          ${isExpanded ? 'p-4' : 'p-3'}
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
            onPointerDown={startDrag}
          >
            <Move className={`h-3 w-3 ${isDark ? 'text-gray-400' : 'text-gray-500'}`} />
          </div>

          {/* Compact View */}
          {!isExpanded && (
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

              {/* Expand Button */}
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsExpanded(true)}
                className={`
                  h-8 w-8 p-0 rounded-full transition-all duration-200
                  ${isDark 
                    ? 'text-gray-400 hover:text-gray-300 hover:bg-gray-700/50' 
                    : 'text-gray-500 hover:text-gray-600 hover:bg-gray-100/50'
                  }
                `}
              >
                <Settings className="h-4 w-4" />
              </Button>
            </div>
          )}

          {/* Expanded View */}
          {isExpanded && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="space-y-3 min-w-48"
            >
              {/* Header */}
              <div className="flex items-center justify-between">
                <h3 className={`
                  font-semibold text-sm
                  ${isDark ? 'text-white' : 'text-gray-900'}
                `}>
                  Music Player
                </h3>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsExpanded(false)}
                  className={`
                    h-6 w-6 p-0 rounded-full
                    ${isDark 
                      ? 'text-gray-400 hover:text-gray-300' 
                      : 'text-gray-500 hover:text-gray-600'
                    }
                  `}
                >
                  ×
                </Button>
              </div>

              {/* Music Info */}
              <div className={`
                text-xs space-y-1
                ${isDark ? 'text-gray-300' : 'text-gray-600'}
              `}>
                <div className="font-medium">Whispers of the Enchanted</div>
                <div className="flex items-center gap-2">
                  <div className={`
                    w-2 h-2 rounded-full
                    ${isPlaying 
                      ? (isDark ? 'bg-green-400' : 'bg-green-500') 
                      : (isDark ? 'bg-gray-500' : 'bg-gray-400')
                    }
                  `} />
                  {isPlaying ? "Now Playing" : "Paused"}
                </div>
              </div>

              {/* Controls */}
              <div className="flex items-center justify-center gap-3">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={togglePlayPause}
                  className={`
                    h-12 w-12 p-0 rounded-full
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
                      <Pause className="h-6 w-6" />
                    ) : (
                      <Play className="h-6 w-6" />
                    )}
                  </motion.div>
                </Button>

                <Button
                  variant="ghost"
                  size="sm"
                  onClick={toggleMute}
                  className={`
                    h-12 w-12 p-0 rounded-full relative
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
                    {isMuted ? (
                      <VolumeX className="h-6 w-6 text-red-500" />
                    ) : (
                      <Volume2 className="h-6 w-6" />
                    )}
                  </motion.div>
                </Button>
              </div>

              {/* Visualizer */}
              {!isMuted && isPlaying && (
                <div className="flex items-end justify-center gap-1 h-8">
                  {[...Array(8)].map((_, i) => (
                    <motion.div
                      key={i}
                      className={`
                        w-1 rounded-full
                        ${isDark 
                          ? 'bg-gradient-to-t from-cyan-400 via-purple-500 to-pink-400' 
                          : 'bg-gradient-to-t from-blue-400 via-indigo-500 to-purple-400'
                        }
                      `}
                      animate={{
                        height: [4, 12 + Math.random() * 8, 4],
                        opacity: [0.3, 1, 0.3]
                      }}
                      transition={{
                        duration: 0.8 + Math.random() * 0.4,
                        repeat: Infinity,
                        delay: i * 0.1
                      }}
                    />
                  ))}
                </div>
              )}
            </motion.div>
          )}

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
