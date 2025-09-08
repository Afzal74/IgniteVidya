"use client"

import { useState, useEffect, useRef } from "react"
import { motion } from "framer-motion"
import { Volume2, VolumeX } from "lucide-react"
import { Button } from "@/components/ui/button"

interface AudioControlProps {
  className?: string
}

export default function AudioControl({ className = "" }: AudioControlProps) {
  const [isMuted, setIsMuted] = useState(false)
  const [isPlaying, setIsPlaying] = useState(false)
  const audioRef = useRef<HTMLAudioElement>(null)

  useEffect(() => {
    const audio = audioRef.current
    if (!audio) return

    const handlePlay = () => setIsPlaying(true)
    const handlePause = () => setIsPlaying(false)
    
    audio.addEventListener('play', handlePlay)
    audio.addEventListener('pause', handlePause)

    return () => {
      audio.removeEventListener('play', handlePlay)
      audio.removeEventListener('pause', handlePause)
    }
  }, [])

  const toggleMute = () => {
    const audio = audioRef.current
    if (!audio) return

    const newMutedState = !isMuted
    setIsMuted(newMutedState)
    audio.muted = newMutedState
  }

  return (
    <div className={`${className}`}>
      {/* Hidden Audio Element */}
      <audio 
        ref={audioRef}
        loop
        muted={isMuted}
        preload="auto"
        className="hidden"
      >
        <source src="/Whispers of the Enchanted.mp3" type="audio/mpeg" />
      </audio>

      {/* Compact Audio Control */}
      <Button
        variant="ghost"
        size="icon"
        onClick={toggleMute}
        className="rounded-xl relative group"
        title={isMuted ? "Unmute music" : "Mute music"}
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

        {/* Mini Sound Waves Animation */}
        {!isMuted && isPlaying && (
          <div className="absolute -top-1 -right-1">
            <motion.div className="flex items-center gap-0.5">
              {[1, 2].map((i) => (
                <motion.div
                  key={i}
                  className="w-0.5 bg-gradient-to-t from-cyan-400 to-purple-500 rounded-full"
                  animate={{
                    height: [1, 4, 1],
                    opacity: [0.4, 1, 0.4]
                  }}
                  transition={{
                    duration: 1,
                    repeat: Infinity,
                    delay: i * 0.2
                  }}
                />
              ))}
            </motion.div>
          </div>
        )}

        {/* Tooltip on hover */}
        <div className="absolute top-full right-0 mt-2 px-2 py-1 bg-black/90 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-10">
          {isMuted ? "🔇 Music off" : "🔊 Music on"}
        </div>
      </Button>
    </div>
  )
}
