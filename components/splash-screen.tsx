"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { Calculator, BookOpen, Laptop, Microscope, Atom, Ruler, PenTool, Cpu } from "lucide-react"

interface SplashScreenProps {
  onComplete?: () => void
}

export default function SplashScreen({ onComplete }: SplashScreenProps) {
  const [isVisible, setIsVisible] = useState(true)
  const [progress, setProgress] = useState(0)

  const handleSkip = () => {
    setIsVisible(false)
    onComplete?.()
  }

  useEffect(() => {
    // Simulate loading progress from 0 to 100
    let currentProgress = 0
    const interval = setInterval(() => {
      currentProgress += 1
      setProgress(currentProgress)
      
      if (currentProgress >= 100) {
        clearInterval(interval)
        setTimeout(() => {
          setIsVisible(false)
          onComplete?.()
        }, 800)
      }
    }, 30) // Slower progress for better visibility

    return () => clearInterval(interval)
  }, [onComplete])

  // Skip splash screen on key press
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.key === 'Enter' || e.key === ' ' || e.key === 'Escape') {
        handleSkip()
      }
    }
    
    document.addEventListener('keydown', handleKeyPress)
    return () => document.removeEventListener('keydown', handleKeyPress)
  }, [onComplete])

  // STEM letters with random positions
  const stemLetters = [
    { letter: "S", color: "from-cyan-400 to-blue-500", x: "15%", y: "20%", delay: 0 },
    { letter: "T", color: "from-purple-400 to-pink-500", x: "75%", y: "30%", delay: 0.5 },
    { letter: "E", color: "from-green-400 to-emerald-500", x: "25%", y: "70%", delay: 1.0 },
    { letter: "M", color: "from-orange-400 to-red-500", x: "70%", y: "65%", delay: 1.5 },
  ]

  // Educational equipment icons
  const educationIcons = [
    // Math equipment
    { icon: Calculator, color: "text-blue-400", x: "8%", y: "15%", delay: 0.2 },
    { icon: Ruler, color: "text-blue-300", x: "85%", y: "75%", delay: 1.8 },
    
    // English/Language
    { icon: BookOpen, color: "text-green-400", x: "10%", y: "80%", delay: 0.8 },
    { icon: PenTool, color: "text-green-300", x: "88%", y: "15%", delay: 1.3 },
    
    // Technology
    { icon: Laptop, color: "text-purple-400", x: "12%", y: "45%", delay: 1.1 },
    { icon: Cpu, color: "text-purple-300", x: "82%", y: "50%", delay: 0.5 },
    
    // Science
    { icon: Microscope, color: "text-cyan-400", x: "15%", y: "60%", delay: 1.5 },
    { icon: Atom, color: "text-cyan-300", x: "80%", y: "35%", delay: 0.3 },
  ]

  if (!isVisible) return null

  return (
    <div 
      className="fixed inset-0 z-50 bg-gradient-to-br from-slate-900 via-gray-900 to-black cursor-pointer overflow-hidden"
      onClick={handleSkip}
    >
      {/* Pixel Font Styles */}
      <style jsx>{`
        .pixel-font {
          image-rendering: pixelated;
          image-rendering: -moz-crisp-edges;
          image-rendering: crisp-edges;
          text-shadow: 
            1px 1px 0px rgba(0,255,255,0.3),
            2px 2px 0px rgba(0,255,255,0.2),
            3px 3px 0px rgba(0,255,255,0.1);
        }
        .pixel-text {
          image-rendering: pixelated;
          image-rendering: -moz-crisp-edges;
          image-rendering: crisp-edges;
          text-shadow: 1px 1px 0px rgba(0,255,255,0.2);
        }
      `}</style>

      {/* Complete Computer Setup - Centered and Properly Sized */}
      <div className="flex items-center justify-center min-h-screen p-8">
        <motion.div
          className="relative max-w-6xl w-full"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1 }}
        >
          {/* Monitor Container */}
          <div className="relative bg-gradient-to-b from-gray-700 to-gray-900 p-4 rounded-t-3xl shadow-2xl">
            {/* Monitor Brand Strip */}
            <div className="absolute top-1 left-1/2 transform -translate-x-1/2">
              <div className="bg-gray-700 px-4 py-1 rounded-full border border-gray-600">
                <span className="text-xs text-gray-300 font-mono tracking-widest pixel-text">VTU QUANTUM DISPLAY</span>
              </div>
            </div>
            
            {/* Screen Bezel */}
            <div className="bg-black p-4 rounded-2xl mt-6 relative overflow-hidden shadow-inner">
              {/* Screen Reflection */}
              <div className="absolute inset-0 bg-gradient-to-br from-white/5 via-transparent to-transparent rounded-2xl" />
              
              {/* Active Screen */}
              <div className="relative bg-gray-900 rounded-xl overflow-hidden h-[70vh] border border-gray-700/50 shadow-2xl">
                {/* Screen Glow */}
                <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 via-transparent to-purple-500/5 rounded-xl" />
                
                {/* Random STEM Letters */}
                {stemLetters.map(({ letter, color, x, y, delay }) => (
                  <motion.div
                    key={letter}
                    className={`absolute text-6xl md:text-8xl font-bold bg-gradient-to-r ${color} bg-clip-text text-transparent select-none`}
                    style={{ left: x, top: y }}
                    animate={{
                      opacity: [0.2, 1, 0.2],
                      scale: [0.8, 1.2, 0.8],
                    }}
                    transition={{
                      duration: 3,
                      repeat: Infinity,
                      delay: delay,
                    }}
                  >
                    {letter}
                  </motion.div>
                ))}
                
                {/* Educational Equipment Icons */}
                {educationIcons.map(({ icon: Icon, color, x, y, delay }, index) => (
                  <motion.div
                    key={`icon-${index}`}
                    className={`absolute ${color} opacity-60`}
                    style={{ left: x, top: y }}
                    animate={{
                      y: [0, -15, 0],
                      rotate: [0, 10, -10, 0],
                      opacity: [0.4, 0.8, 0.4],
                      scale: [0.9, 1.1, 0.9],
                    }}
                    transition={{
                      duration: 4 + index * 0.3,
                      repeat: Infinity,
                      delay: delay,
                    }}
                  >
                    <Icon className="h-6 w-6 md:h-8 md:w-8 drop-shadow-lg" />
                  </motion.div>
                ))}
                
                {/* Center Content Area */}
                <div className="absolute inset-0 flex flex-col items-center justify-center z-10">
                  {/* Logo */}
                  <motion.div
                    className="text-center mb-12"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 1, delay: 0.5 }}
                  >
                    {/* VTU Logo Image */}
                    <div className="mb-3">
                      <img 
                        src="/vtu-logo.png" 
                        alt="VTU Logo" 
                        className="w-48 h-48 md:w-56 md:h-56 mx-auto object-contain"
                      />
                    </div>
                    
                    {/* Small IgniteVidya Text */}
                    <div className="text-center">
                      <h2 className="text-2xl font-bold text-white mb-2 font-mono tracking-wider pixel-font">
                        <span className="bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent">
                          IGNITE
                        </span>
                        <span className="bg-gradient-to-r from-purple-400 to-pink-500 bg-clip-text text-transparent">
                          VIDYA
                        </span>
                      </h2>
                      <p className="text-sm text-cyan-200 mb-1 font-mono tracking-wide pixel-text">EQUAL LEARNING FOR ALL</p>
                      <p className="text-xs text-purple-200 font-mono tracking-widest pixel-text">STEM EDUCATION PLATFORM</p>
                    </div>
                  </motion.div>
                  
                  {/* Loading Section */}
                  <motion.div
                    className="w-80 md:w-96 text-center"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 1, duration: 0.8 }}
                  >
                    <div className="flex justify-between text-sm text-cyan-200 mb-3 font-mono tracking-wider pixel-text">
                      <span>LOADING...</span>
                      <span className="text-green-400">{progress}%</span>
                    </div>
                    <div className="w-full bg-gray-800 rounded-full h-3 border border-gray-600">
                      <motion.div
                        className="bg-gradient-to-r from-cyan-400 to-purple-500 h-full rounded-full"
                        initial={{ width: 0 }}
                        animate={{ width: `${progress}%` }}
                        transition={{ duration: 0.3 }}
                      />
                    </div>
                    <motion.p
                      className="text-sm text-cyan-300 mt-4 opacity-70 font-mono tracking-wide pixel-text"
                      animate={{ opacity: [0.5, 1, 0.5] }}
                      transition={{ duration: 1.5, repeat: Infinity }}
                    >
                      {'>'} CLICK ANYWHERE TO CONTINUE
                    </motion.p>
                  </motion.div>
                </div>
                
                {/* Scan Line Effect */}
                <motion.div
                  className="absolute inset-x-0 h-1 bg-gradient-to-r from-transparent via-cyan-400/50 to-transparent"
                  animate={{ y: ['-4px', '100%'] }}
                  transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
                />
              </div>
            </div>
          </div>
          
          {/* Monitor Stand and Base */}
          <div className="flex flex-col items-center">
            {/* Stand Neck */}
            <div className="w-8 h-16 bg-gradient-to-b from-gray-600 to-gray-700 rounded-b-lg shadow-lg" />
            
            {/* Stand Base */}
            <div className="w-64 h-8 bg-gradient-to-b from-gray-700 to-gray-800 rounded-full shadow-xl relative">
              {/* Base Details */}
              <div className="absolute inset-x-0 top-1 h-1 bg-gradient-to-r from-transparent via-gray-500 to-transparent rounded-full" />
              <div className="absolute bottom-1 left-1/2 transform -translate-x-1/2 w-20 h-1 bg-gray-600 rounded-full" />
            </div>
            
            {/* Brand Label on Base */}
            <div className="mt-3">
              <span className="text-xs text-gray-500 font-mono tracking-widest pixel-text">QUANTUM SERIES PRO</span>
            </div>
          </div>
        </motion.div>
      </div>

    </div>
  )
}
