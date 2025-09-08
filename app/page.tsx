"use client"

import { useState, useEffect, useRef } from "react"
import {
  Search,
  BookOpen,
  Play,
  Brain,
  Target,
  Star,
  Calculator,
  Lightbulb,
  ArrowRight,
  Sparkles,
  Github,
  Linkedin,
  Users,
  Zap,
  Shield,
  Crown,
  Rocket,
  Atom,
  Microscope,
  Beaker,
  Gamepad2,
} from "lucide-react"
import { Input } from "@/components/ui/input"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { motion } from "framer-motion"

export default function HomePage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [mounted, setMounted] = useState(false)
  const [filteredContent, setFilteredContent] = useState<any[]>([])
  const [currentImageIndex, setCurrentImageIndex] = useState(0)
  const [onlineUsers, setOnlineUsers] = useState(1247)
  const [currentQuote, setCurrentQuote] = useState(0)

  const searchInputRef = useRef<HTMLInputElement>(null)

  // Inspirational quotes for STEM learning
  const quotes = [
    "Equal learning for all - IgniteVidya",
    "Science is the poetry of reality - Richard Dawkins",
    "The future belongs to those who learn more skills - Alvin Toffler",
    "Education is the most powerful weapon to change the world - Nelson Mandela",
    "STEM education creates critical thinkers - Unknown",
    "Innovation distinguishes between a leader and a follower - Steve Jobs"
  ]

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    if (searchQuery.trim()) {
      const filteredGrades = grades.filter((grade) => grade.grade.toLowerCase().includes(searchQuery.toLowerCase()))
      const filteredShortcuts = shortcuts.filter(
        (shortcut) =>
          shortcut.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          shortcut.description.toLowerCase().includes(searchQuery.toLowerCase()),
      )
      setFilteredContent([...filteredGrades, ...filteredShortcuts])
    } else {
      setFilteredContent([])
    }
  }, [searchQuery])

  // Remove image slider effect - keeping for potential future use
  // const heroImages = [
  //   "/placeholder.svg?height=400&width=800&text=STEM-Students-Learning",
  //   "/placeholder.svg?height=400&width=800&text=Science-Experiments",
  //   "/placeholder.svg?height=400&width=800&text=Math-Problem-Solving",
  //   "/placeholder.svg?height=400&width=800&text=Technology-Innovation",
  //   "/placeholder.svg?height=400&width=800&text=Engineering-Projects",
  // ]

  // useEffect(() => {
  //   const interval = setInterval(() => {
  //     setCurrentImageIndex((prev) => (prev + 1) % heroImages.length)
  //   }, 2000)
  //   return () => clearInterval(interval)
  // }, [])

  // Quote rotation effect
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentQuote((prev) => (prev + 1) % quotes.length)
    }, 4000)
    return () => clearInterval(interval)
  }, [])

  // Simulate online users count
  useEffect(() => {
    const interval = setInterval(() => {
      setOnlineUsers((prev) => prev + Math.floor(Math.random() * 10) - 5)
    }, 5000)
    return () => clearInterval(interval)
  }, [])

  useEffect(() => {
    // Auto-focus search bar when component mounts
    if (mounted && searchInputRef.current) {
      searchInputRef.current.focus()
    }
  }, [mounted])


  const educationLevels = [
    {
      level: "Higher Primary",
      grades: ["6th", "7th"],
      gradeCount: 2,
      theme: "Foundation Builder",
      description: "Build strong STEM foundations",
      icon: Rocket,
      color: "blue",
      href: "/level/higher-primary"
    },
    {
      level: "High School",
      grades: ["8th", "9th", "10th"],
      gradeCount: 3,
      theme: "Knowledge Explorer",
      description: "Explore advanced concepts",
      icon: Microscope,
      color: "green",
      href: "/level/high-school"
    },
    {
      level: "Higher Secondary",
      grades: ["11th", "12th"],
      gradeCount: 2,
      theme: "Future Leader",
      description: "Master specialized subjects",
      icon: Crown,
      color: "purple",
      href: "/level/higher-secondary"
    },
  ]

  // Keep the original grades data for search functionality
  const grades = [
    {
      grade: "6th",
      subjects: 6,
      theme: "Explorer",
      description: "Begin your STEM adventure",
      icon: Rocket,
      color: "blue"
    },
    {
      grade: "7th",
      subjects: 7,
      theme: "Discoverer",
      description: "Discover the wonders of science",
      icon: Microscope,
      color: "green"
    },
    {
      grade: "8th",
      subjects: 8,
      theme: "Innovator",
      description: "Innovate with technology",
      icon: Atom,
      color: "purple"
    },
    {
      grade: "9th",
      subjects: 9,
      theme: "Creator",
      description: "Create amazing projects",
      icon: Beaker,
      color: "orange"
    },
    {
      grade: "10th",
      subjects: 10,
      theme: "Builder",
      description: "Build your future",
      icon: Target,
      color: "indigo"
    },
    {
      grade: "11th",
      subjects: 11,
      theme: "Scientist",
      description: "Master scientific concepts",
      icon: Brain,
      color: "teal"
    },
    {
      grade: "12th",
      subjects: 12,
      theme: "Leader",
      description: "Lead the STEM revolution",
      icon: Crown,
      color: "violet"
    },
  ]

  const shortcuts = [
    { title: "Notes", icon: BookOpen, href: "/notes", description: "Study materials" },
    { title: "STEM Games", icon: Gamepad2, href: "/games", description: "Interactive learning" },
    { title: "Lectures", icon: Play, href: "/lectures", description: "Video lessons" },
    { title: "AI Tutor", icon: Brain, href: "/ai-tutor", description: "Smart learning" },
    { title: "Quiz", icon: Target, href: "/quiz", description: "Test yourself" },
    { title: "Dashboard", icon: Star, href: "/dashboard", description: "Track progress" },
  ]

  const handleGetStarted = () => {
    const gradeSection = document.getElementById("grade-section")
    if (gradeSection) {
      gradeSection.scrollIntoView({ behavior: "smooth" })
    }
  }

  if (!mounted) return null

  return (
    <div className="min-h-screen bg-white dark:bg-black relative overflow-hidden">
      {/* Global Animated Background Elements */}
      <div className="fixed inset-0 pointer-events-none">
        {/* Animated Grid */}
        <div className="absolute inset-0 opacity-30 dark:opacity-10">
          <div className="h-full w-full bg-[linear-gradient(rgba(59,130,246,0.3)_1px,transparent_1px),linear-gradient(90deg,rgba(59,130,246,0.3)_1px,transparent_1px)] dark:bg-[linear-gradient(rgba(59,130,246,0.1)_1px,transparent_1px),linear-gradient(90deg,rgba(59,130,246,0.1)_1px,transparent_1px)] bg-[size:20px_20px] animate-pulse" />
        </div>
        
        {/* Floating Geometric Shapes */}
        {[...Array(8)].map((_, i) => {
          const initialX = Math.random() * 1200
          const initialY = Math.random() * 800
          const duration = Math.random() * 15 + 10
          const delay = Math.random() * 10
          
          return (
            <motion.div
              key={`bg-shape-${i}`}
            className={`absolute w-2 h-2 ${
              i % 3 === 0 ? 'bg-blue-400/60 dark:bg-blue-400/20' : 
              i % 3 === 1 ? 'bg-green-400/60 dark:bg-green-400/20' : 'bg-purple-400/60 dark:bg-purple-400/20'
            } ${
              i % 2 === 0 ? 'rounded-full' : 'rotate-45'
            }`}
              initial={{
                x: initialX,
                y: initialY,
              }}
              animate={{
                y: [initialY, initialY - 200, initialY],
                x: [initialX, initialX + (Math.random() * 200 - 100), initialX],
                rotate: [0, 360],
                opacity: [0.2, 0.6, 0.2],
              }}
              transition={{
                duration,
                repeat: Infinity,
                ease: "easeInOut",
                delay,
              }}
            />
          )
        })}
      </div>
      {/* Pixel Font Styles */}
      <style jsx>{`
        .pixel-font {
          image-rendering: pixelated;
          image-rendering: -moz-crisp-edges;
          image-rendering: crisp-edges;
          text-shadow: 
            1px 1px 0px rgba(59, 130, 246, 0.3),
            2px 2px 0px rgba(59, 130, 246, 0.2),
            3px 3px 0px rgba(59, 130, 246, 0.1);
        }
        .pixel-text {
          image-rendering: pixelated;
          image-rendering: -moz-crisp-edges;
          image-rendering: crisp-edges;
          text-shadow: 1px 1px 0px rgba(59, 130, 246, 0.2);
        }
        .pixel-badge {
          image-rendering: pixelated;
          image-rendering: -moz-crisp-edges;
          image-rendering: crisp-edges;
          text-shadow: 0.5px 0.5px 0px rgba(0, 255, 255, 0.3);
        }
        
      `}</style>
      {/* Hero Section */}
      <section className="relative pt-20 md:pt-24 pb-8 md:pb-16 px-2 md:px-4 overflow-hidden">
        {/* Animated Background */}
        <div className="absolute inset-0 bg-gradient-to-br from-blue-50/30 via-white to-purple-50/30 dark:from-gray-900/50 dark:via-black dark:to-purple-900/50" />
        
        {/* Floating Particles */}
        <div className="absolute inset-0 overflow-hidden">
          {[...Array(20)].map((_, i) => {
            const initialX = Math.random() * 1200
            const initialY = Math.random() * 800
            const duration = Math.random() * 10 + 10
            const delay = Math.random() * 5
            const moveX = Math.random() * 100 - 50
            
            return (
              <motion.div
                key={`particle-${i}`}
                className="absolute w-1 h-1 bg-blue-400/70 dark:bg-blue-400/30 rounded-full"
                initial={{
                  x: initialX,
                  y: initialY,
                }}
                animate={{
                  y: [initialY, initialY - 100, initialY],
                  x: [initialX, initialX + moveX, initialX],
                  opacity: [0.3, 0.8, 0.3],
                }}
                transition={{
                  duration,
                  repeat: Infinity,
                  ease: "easeInOut",
                  delay,
                }}
              />
            )
          })}
        </div>
        
        {/* Gradient Orbs */}
        <div className="absolute inset-0">
          <motion.div
            className="absolute top-1/4 left-1/4 w-64 h-64 bg-gradient-to-r from-blue-400/25 to-purple-400/25 dark:from-blue-400/10 dark:to-purple-400/10 rounded-full blur-3xl"
            animate={{
              scale: [1, 1.2, 1],
              x: [0, 50, 0],
              y: [0, -30, 0],
            }}
            transition={{
              duration: 8,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          />
          <motion.div
            className="absolute top-3/4 right-1/4 w-48 h-48 bg-gradient-to-r from-green-400/25 to-blue-400/25 dark:from-green-400/10 dark:to-blue-400/10 rounded-full blur-3xl"
            animate={{
              scale: [1, 1.3, 1],
              x: [0, -40, 0],
              y: [0, 20, 0],
            }}
            transition={{
              duration: 6,
              repeat: Infinity,
              ease: "easeInOut",
              delay: 2,
            }}
          />
          <motion.div
            className="absolute top-1/2 right-1/3 w-32 h-32 bg-gradient-to-r from-purple-400/35 to-pink-400/35 dark:from-purple-400/10 dark:to-pink-400/10 rounded-full blur-2xl"
            animate={{
              scale: [1, 1.4, 1],
              rotate: [0, 180, 360],
            }}
            transition={{
              duration: 12,
              repeat: Infinity,
              ease: "linear",
              delay: 4,
            }}
          />
        </div>
        
        {/* Mesh Gradient Overlay */}
        <div className="absolute inset-0 opacity-40 dark:opacity-30">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_80%,_rgba(120,119,198,0.4),_transparent_50%),radial-gradient(circle_at_80%_20%,_rgba(255,119,198,0.4),_transparent_50%),radial-gradient(circle_at_40%_40%,_rgba(120,219,255,0.4),_transparent_50%)] dark:bg-[radial-gradient(circle_at_20%_80%,_rgba(120,119,198,0.3),_transparent_50%),radial-gradient(circle_at_80%_20%,_rgba(255,119,198,0.3),_transparent_50%),radial-gradient(circle_at_40%_40%,_rgba(120,219,255,0.3),_transparent_50%)] animate-pulse" />
        </div>

        <div className="relative z-10 max-w-6xl mx-auto text-center">
          {/* Online Users Badge */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 mb-2"
          >
            <div className="w-1 h-1 bg-green-500 rounded-full animate-pulse" />
            <Users className="h-2 w-2 text-zinc-600 dark:text-zinc-400" />
            <span className="text-xs text-zinc-600 dark:text-zinc-400 font-medium">
              {onlineUsers.toLocaleString()} online
            </span>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="mb-4 md:mb-6"
          >
            <div className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 mb-2">
              <Sparkles className="h-2 w-2 text-zinc-600 dark:text-zinc-400" />
              <span className="text-xs text-zinc-600 dark:text-zinc-400 font-medium">
                Your Academic Companion
              </span>
            </div>

            <h1 className="text-3xl md:text-5xl lg:text-7xl font-bold tracking-wider mb-3 md:mb-4 font-mono pixel-font">
              <span className="text-black dark:text-white">IGNITE</span>
              <span className="text-zinc-400 dark:text-zinc-600">VIDYA</span>
            </h1>

            <p className="text-sm md:text-lg text-zinc-600 dark:text-zinc-400 max-w-2xl mx-auto leading-relaxed px-2">
              Equal learning for all. Interactive STEM education for grades 6-12 with gamification, AI tutoring, and personalized learning paths.
            </p>

            {/* Rotating Quotes */}
            <motion.div
              key={currentQuote}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.5 }}
              className="mt-4 md:mt-6"
            >
              <p className="text-sm md:text-base text-zinc-500 dark:text-zinc-500 italic max-w-xl mx-auto px-2">
                "{quotes[currentQuote]}"
              </p>
            </motion.div>
          </motion.div>

          {/* Search Bar */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="relative max-w-2xl mx-auto mb-6 md:mb-12"
          >
            <div className="relative">
              <Search className="absolute left-2 md:left-3 top-1/2 transform -translate-y-1/2 text-zinc-400 h-3 w-3 md:h-4 md:w-4" />
              <Input
                ref={searchInputRef}
                type="text"
                placeholder="Search subjects, notes, lectures..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-8 md:pl-10 py-2 md:py-3 text-sm md:text-base rounded-lg md:rounded-xl border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 focus:border-black dark:focus:border-white transition-colors"
              />
            </div>
            {searchQuery && filteredContent.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="absolute top-full left-0 right-0 mt-1 md:mt-2 bg-white dark:bg-black border border-zinc-200 dark:border-zinc-800 rounded-lg md:rounded-xl shadow-2xl z-10 max-h-48 md:max-h-64 overflow-y-auto"
              >
                {filteredContent.map((item, index) => (
                  <div
                    key={index}
                    className="p-2 md:p-3 hover:bg-zinc-50 dark:hover:bg-zinc-950 cursor-pointer border-b border-zinc-100 dark:border-zinc-900 last:border-b-0"
                    onClick={() => {
                      if ("grade" in item) {
                        window.location.href = `/grade/${item.grade.replace(/[^0-9]/g, '')}`
                      } else {
                        window.location.href = item.href
                      }
                      setSearchQuery("")
                    }}
                  >
                    <div className="font-medium text-black dark:text-white text-xs md:text-sm">
                      {"grade" in item ? `Grade ${item.grade}` : item.title}
                    </div>
                    <div className="text-xs text-zinc-600 dark:text-zinc-400">
                      {"subjects" in item ? `${item.subjects} subjects` : item.description}
                    </div>
                  </div>
                ))}
              </motion.div>
            )}
          </motion.div>
        </div>
      </section>

      {/* Grade Cards */}
      <section id="grade-section" className="py-6 md:py-12 px-2 md:px-4 pt-20">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="text-center mb-4 md:mb-8"
          >
            <h2 className="text-lg md:text-2xl font-bold text-black dark:text-white mb-1 md:mb-2">
              Choose Your Education Level
            </h2>
            <p className="text-xs md:text-sm text-zinc-600 dark:text-zinc-400">
              Select your education level to access appropriate STEM resources
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
            {educationLevels.map((level, index) => (
              <motion.div
                key={level.level}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.1 * index }}
              >
                <Link href={level.href}>
                  <Card className="group relative overflow-hidden border-zinc-200 dark:border-zinc-800 hover:border-blue-500 dark:hover:border-blue-400 transition-all duration-300 cursor-pointer h-40 md:h-48 bg-gradient-to-br from-white to-zinc-100 dark:from-zinc-900 dark:to-black shadow-lg hover:shadow-xl">
                    {/* Shiny Overlay Effect */}
                    <div className="absolute inset-0 bg-gradient-to-br from-transparent via-white/20 to-transparent dark:via-white/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                    
                    {/* Subtle Pattern */}
                    <div className="absolute inset-0 opacity-5 dark:opacity-10">
                      <div className="w-full h-full bg-[radial-gradient(circle_at_1px_1px,rgba(0,0,0,0.1)_1px,transparent_0)] dark:bg-[radial-gradient(circle_at_1px_1px,rgba(255,255,255,0.1)_1px,transparent_0)] bg-[length:8px_8px]" />
                    </div>

                    <div className="relative p-4 md:p-6 text-center h-full flex flex-col justify-center">
                      {/* Hero Badge with Icon - Enhanced Shiny Effect */}
                      <div className={`w-12 h-12 md:w-16 md:h-16 rounded-xl bg-gradient-to-br ${level.color === 'blue' ? 'from-blue-500 to-blue-700 dark:from-blue-400 dark:to-blue-600' : level.color === 'green' ? 'from-green-500 to-green-700 dark:from-green-400 dark:to-green-600' : 'from-purple-500 to-purple-700 dark:from-purple-400 dark:to-purple-600'} flex items-center justify-center mx-auto mb-3 md:mb-4 group-hover:scale-110 transition-transform shadow-lg group-hover:shadow-xl`}>
                        <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-transparent via-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                        <level.icon className="text-white dark:text-black h-6 w-6 md:h-8 md:w-8 relative z-10" />
                      </div>
                      
                      <h3 className="font-bold text-black dark:text-white mb-2 text-sm md:text-lg group-hover:text-zinc-800 dark:group-hover:text-zinc-200 transition-colors">
                        {level.level}
                      </h3>
                      
                      <div className="flex justify-center gap-1 mb-2">
                        {level.grades.map((grade, gradeIndex) => (
                          <span key={gradeIndex} className={`text-xs px-2 py-1 rounded-full ${level.color === 'blue' ? 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300' : level.color === 'green' ? 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300' : 'bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-300'}`}>
                            Class {grade}
                          </span>
                        ))}
                      </div>
                      
                      <p className="text-xs md:text-sm text-zinc-600 dark:text-zinc-400 group-hover:text-zinc-700 dark:group-hover:text-zinc-300 transition-colors mb-1">
                        {level.description}
                      </p>
                      
                      <p className="text-xs text-zinc-500 dark:text-zinc-500 font-medium">
                        {level.theme}
                      </p>
                    </div>
                  </Card>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Quick Access */}
      <section className="py-6 md:py-12 px-2 md:px-4 bg-zinc-50 dark:bg-zinc-950 pt-20">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.6 }}
            className="text-center mb-4 md:mb-8"
          >
            <h2 className="text-lg md:text-2xl font-bold text-black dark:text-white mb-1 md:mb-2">Quick Access</h2>
            <p className="text-xs md:text-sm text-zinc-600 dark:text-zinc-400">Jump straight to what you need</p>
          </motion.div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-2 md:gap-3">
            {shortcuts.map((shortcut, index) => (
              <motion.div
                key={shortcut.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.1 * index }}
              >
                <Link href={shortcut.href}>
                  <Card className="group border-zinc-200 dark:border-zinc-800 hover:border-black dark:hover:border-white transition-all duration-300 cursor-pointer h-full">
                    <div className="p-2 md:p-4 text-center">
                      <div className="w-6 h-6 md:w-10 md:h-10 rounded-lg bg-zinc-100 dark:bg-zinc-900 flex items-center justify-center mx-auto mb-1 md:mb-2 group-hover:bg-black dark:group-hover:bg-white transition-colors">
                        <shortcut.icon className="h-3 w-3 md:h-5 md:w-5 text-zinc-600 dark:text-zinc-400 group-hover:text-white dark:group-hover:text-black transition-colors" />
                      </div>
                      <h3 className="font-semibold text-black dark:text-white mb-0.5 text-xs md:text-sm">
                        {shortcut.title}
                      </h3>
                      <p className="text-xs text-zinc-600 dark:text-zinc-400">{shortcut.description}</p>
                    </div>
                  </Card>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Latest News Section */}
      <section className="py-6 md:py-12 px-2 md:px-4 pt-20">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.7 }}
            className="text-center mb-6 md:mb-8"
          >
            <h2 className="text-lg md:text-2xl font-bold text-black dark:text-white mb-1 md:mb-2">Latest News</h2>
            <p className="text-xs md:text-sm text-zinc-600 dark:text-zinc-400 mb-4">
              Stay updated with the latest from IgniteVidya
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
            {/* News Item 1 */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
            >
              <Card className="group cursor-pointer overflow-hidden border-zinc-200 dark:border-zinc-800 hover:border-blue-500 dark:hover:border-blue-400 transition-all duration-300 h-full">
                <div className="p-4 md:p-6 relative">
                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 group-hover:bg-blue-400 transition-colors" />
                    <div className="flex-1">
                      <h3 className="font-semibold text-black dark:text-white text-sm md:text-base mb-2 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                        New AI Tutor Features Released
                      </h3>
                      <p className="text-xs md:text-sm text-zinc-600 dark:text-zinc-400 mb-3 line-clamp-3">
                        Enhanced AI tutoring capabilities with personalized learning paths and real-time problem solving assistance.
                      </p>
                      <div className="flex items-center justify-between text-xs text-zinc-500 dark:text-zinc-500">
                        <span>2 days ago</span>
                        <span className="text-blue-600 dark:text-blue-400">Technology</span>
                      </div>
                    </div>
                  </div>
                </div>
              </Card>
            </motion.div>

            {/* News Item 2 */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              <Card className="group cursor-pointer overflow-hidden border-zinc-200 dark:border-zinc-800 hover:border-green-500 dark:hover:border-green-400 transition-all duration-300 h-full">
                <div className="p-4 md:p-6 relative">
                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-green-500 rounded-full mt-2 group-hover:bg-green-400 transition-colors" />
                    <div className="flex-1">
                      <h3 className="font-semibold text-black dark:text-white text-sm md:text-base mb-2 group-hover:text-green-600 dark:group-hover:text-green-400 transition-colors">
                        New Science Lab Simulations
                      </h3>
                      <p className="text-xs md:text-sm text-zinc-600 dark:text-zinc-400 mb-3 line-clamp-3">
                        Interactive virtual laboratory experiments for chemistry and physics now available for all grade levels.
                      </p>
                      <div className="flex items-center justify-between text-xs text-zinc-500 dark:text-zinc-500">
                        <span>5 days ago</span>
                        <span className="text-green-600 dark:text-green-400">Science</span>
                      </div>
                    </div>
                  </div>
                </div>
              </Card>
            </motion.div>

            {/* News Item 3 */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
            >
              <Card className="group cursor-pointer overflow-hidden border-zinc-200 dark:border-zinc-800 hover:border-purple-500 dark:hover:border-purple-400 transition-all duration-300 h-full">
                <div className="p-4 md:p-6 relative">
                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-purple-500 rounded-full mt-2 group-hover:bg-purple-400 transition-colors" />
                    <div className="flex-1">
                      <h3 className="font-semibold text-black dark:text-white text-sm md:text-base mb-2 group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors">
                        Mathematics Competition Winners
                      </h3>
                      <p className="text-xs md:text-sm text-zinc-600 dark:text-zinc-400 mb-3 line-clamp-3">
                        Congratulations to our students who excelled in the National Mathematics Olympiad using IgniteVidya.
                      </p>
                      <div className="flex items-center justify-between text-xs text-zinc-500 dark:text-zinc-500">
                        <span>1 week ago</span>
                        <span className="text-purple-600 dark:text-purple-400">Mathematics</span>
                      </div>
                    </div>
                  </div>
                </div>
              </Card>
            </motion.div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-6 md:py-12 px-2 md:px-4 pt-20">
        <div className="max-w-4xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.8 }}
          >
            <h2 className="text-lg md:text-3xl font-bold text-black dark:text-white mb-2 md:mb-4 font-mono tracking-wide pixel-font">
              READY TO IGNITE YOUR STEM JOURNEY?
            </h2>
            <p className="text-sm md:text-lg text-zinc-600 dark:text-zinc-400 mb-4 md:mb-6 max-w-2xl mx-auto px-2 font-mono tracking-wide pixel-text">
              JOIN THOUSANDS OF STUDENTS WHO ARE ALREADY USING IGNITEVIDYA TO MASTER STEM SUBJECTS THROUGH INTERACTIVE LEARNING.
            </p>
            <Button
              onClick={handleGetStarted}
              size="lg"
              className="bg-black dark:bg-white text-white dark:text-black hover:bg-zinc-800 dark:hover:bg-zinc-200 rounded-lg px-4 md:px-6 py-2 md:py-3 text-sm md:text-base font-mono font-bold tracking-widest pixel-text"
            >
              GET STARTED
              <ArrowRight className="ml-1 md:ml-2 h-3 w-3 md:h-4 md:w-4" />
            </Button>
          </motion.div>
        </div>
      </section>

      {/* Author Section */}
      <section className="py-6 md:py-12 px-2 md:px-4 bg-zinc-50 dark:bg-zinc-950 border-t border-zinc-200 dark:border-zinc-800 pt-20">
        <div className="max-w-4xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 1.0 }}
            className="space-y-3 md:space-y-4"
          >
            <div className="flex flex-col md:flex-row items-center justify-center gap-3 md:gap-4">
              <div className="w-12 h-12 md:w-16 md:h-16 rounded-full overflow-hidden border-2 border-zinc-200 dark:border-zinc-800 bg-white dark:bg-gray-800 flex items-center justify-center">
                <img 
                  src="/ignitevidya-logo.png" 
                  alt="IgniteVidya Logo" 
                  className="w-8 h-8 md:w-12 md:h-12 object-contain"
                  onError={(e) => {
                    // Fallback to icon if image fails to load
                    e.currentTarget.style.display = 'none';
                    e.currentTarget.nextElementSibling?.classList.remove('hidden');
                  }}
                />
                <Brain className="h-6 w-6 md:h-8 md:w-8 text-blue-600 dark:text-blue-400 hidden" />
              </div>
              <div className="text-center md:text-left">
                <h3 className="text-sm md:text-lg font-bold text-black dark:text-white">IgniteVidya</h3>
                <p className="text-xs md:text-sm text-zinc-600 dark:text-zinc-400">STEM Education Platform</p>
                <p className="text-xs text-zinc-500 dark:text-zinc-500">Equal learning for all</p>
              </div>
            </div>

            <p className="text-xs md:text-sm text-zinc-600 dark:text-zinc-400 max-w-2xl mx-auto px-2">
              IgniteVidya was created to democratize STEM education and make quality learning accessible to every student, 
              regardless of their background or location.
            </p>

            <div className="flex justify-center gap-2 md:gap-3">
              <Button
                variant="outline"
                size="sm"
                className="rounded-lg border-zinc-200 dark:border-zinc-800 bg-transparent text-xs px-2 py-1 md:px-3 md:py-2"
                onClick={() => window.open('https://www.linkedin.com/company/ignitevidya', '_blank')}
              >
                <Linkedin className="h-2.5 w-2.5 md:h-3 md:w-3 mr-1" />
                LinkedIn
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="rounded-lg border-zinc-200 dark:border-zinc-800 bg-transparent text-xs px-2 py-1 md:px-3 md:py-2"
                onClick={() => window.open('https://github.com/ignitevidya', '_blank')}
              >
                <Github className="h-2.5 w-2.5 md:h-3 md:w-3 mr-1" />
                GitHub
              </Button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Copyright Footer */}
      <footer className="py-3 md:py-6 px-2 md:px-4 border-t border-zinc-200 dark:border-zinc-800 mb-20">
        <div className="max-w-6xl mx-auto text-center">
          <p className="text-xs text-zinc-600 dark:text-zinc-400">
             2024 IgniteVidya. Created by <span className="font-semibold text-black dark:text-white">IgniteVidya Team</span>. All
            rights reserved.
          </p>
        </div>
      </footer>
    </div>
  )
}
