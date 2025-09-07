"use client"

import { useState, useEffect, useRef } from "react"
import {
  Search,
  BookOpen,
  FileText,
  Code,
  Calculator,
  Lightbulb,
  ArrowRight,
  Sparkles,
  Github,
  Linkedin,
  Users,
  Zap,
  Shield,
  Star,
  Crown,
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

  const searchInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    if (searchQuery.trim()) {
      const filteredSemesters = semesters.filter((sem) => sem.sem.toLowerCase().includes(searchQuery.toLowerCase()))
      const filteredShortcuts = shortcuts.filter(
        (shortcut) =>
          shortcut.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          shortcut.description.toLowerCase().includes(searchQuery.toLowerCase()),
      )
      setFilteredContent([...filteredSemesters, ...filteredShortcuts])
    } else {
      setFilteredContent([])
    }
  }, [searchQuery])

  // Image slider effect
  const heroImages = [
    "/placeholder.svg?height=400&width=800&text=VTU-Students-Studying",
    "/placeholder.svg?height=400&width=800&text=Engineering-Campus",
    "/placeholder.svg?height=400&width=800&text=Code-Programming",
    "/placeholder.svg?height=400&width=800&text=Academic-Success",
    "/placeholder.svg?height=400&width=800&text=VTU-Library",
  ]

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentImageIndex((prev) => (prev + 1) % heroImages.length)
    }, 2000)
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

  const semesters = [
    {
      sem: "1st",
      subjects: 8,
      hero: "Spider-Man",
      bgImage: "https://images.unsplash.com/photo-1635805737707-575885ab0820?w=400&h=300&fit=crop&crop=center",
      heroColor: "from-red-500 to-blue-600",
      description: "Begin your superhero journey with fundamentals",
      icon: Zap
    },
    {
      sem: "2nd",
      subjects: 8,
      hero: "Batman",
      bgImage: "https://images.unsplash.com/photo-1635805737707-575885ab0820?w=400&h=300&fit=crop&crop=center",
      heroColor: "from-gray-800 to-yellow-500",
      description: "Master the art of engineering like the Dark Knight",
      icon: Shield
    },
    {
      sem: "3rd",
      subjects: 9,
      hero: "Superman",
      bgImage: "https://images.unsplash.com/photo-1635805737707-575885ab0820?w=400&h=300&fit=crop&crop=center",
      heroColor: "from-blue-600 to-red-500",
      description: "Unleash your superpowers in advanced subjects",
      icon: Star
    },
    {
      sem: "4th",
      subjects: 9,
      hero: "Iron Man",
      bgImage: "https://images.unsplash.com/photo-1635805737707-575885ab0820?w=400&h=300&fit=crop&crop=center",
      heroColor: "from-red-600 to-yellow-500",
      description: "Build your tech empire with innovation",
      icon: Crown
    },
    {
      sem: "5th",
      subjects: 8,
      hero: "Captain America",
      bgImage: "https://images.unsplash.com/photo-1635805737707-575885ab0820?w=400&h=300&fit=crop&crop=center",
      heroColor: "from-blue-700 to-red-600",
      description: "Lead with courage and strategic thinking",
      icon: Shield
    },
    {
      sem: "6th",
      subjects: 8,
      hero: "Thor",
      bgImage: "https://images.unsplash.com/photo-1635805737707-575885ab0820?w=400&h=300&fit=crop&crop=center",
      heroColor: "from-blue-500 to-yellow-400",
      description: "Channel the power of thunder and lightning",
      icon: Zap
    },
    {
      sem: "7th",
      subjects: 7,
      hero: "Wonder Woman",
      bgImage: "https://images.unsplash.com/photo-1635805737707-575885ab0820?w=400&h=300&fit=crop&crop=center",
      heroColor: "from-red-600 to-gold-500",
      description: "Embrace wisdom and warrior spirit",
      icon: Star
    },
    {
      sem: "8th",
      subjects: 6,
      hero: "Flash",
      bgImage: "https://images.unsplash.com/photo-1635805737707-575885ab0820?w=400&h=300&fit=crop&crop=center",
      heroColor: "from-red-500 to-yellow-400",
      description: "Speed through your final semester",
      icon: Zap
    },
  ]

  const shortcuts = [
    { title: "Notes", icon: BookOpen, href: "/notes", description: "Study materials" },
    { title: "Question Papers", icon: FileText, href: "/question-papers", description: "Previous papers" },
    { title: "Lab Programs", icon: Code, href: "/lab-programs", description: "Code solutions" },
    { title: "CGPA Calculator", icon: Calculator, href: "/calculator", description: "Grade calculator" },
    { title: "Project Ideas", icon: Lightbulb, href: "/projects", description: "Project concepts" },
  ]

  const handleGetStarted = () => {
    const semesterSection = document.getElementById("semester-section")
    if (semesterSection) {
      semesterSection.scrollIntoView({ behavior: "smooth" })
    }
  }

  if (!mounted) return null

  return (
    <div className="min-h-screen bg-white dark:bg-black">
      {/* Hero Section with Image Slider */}
      <section className="relative pt-20 md:pt-24 pb-8 md:pb-16 px-2 md:px-4 overflow-hidden">
        {/* Background Image Slider */}
        <div className="absolute inset-0 z-0">
          {heroImages.map((image, index) => (
            <div
              key={index}
              className={`absolute inset-0 bg-cover bg-center transition-opacity duration-1000 ${
                index === currentImageIndex ? "opacity-5" : "opacity-0"
              }`}
              style={{ backgroundImage: `url(${image})` }}
            />
          ))}
          <div className="absolute inset-0 bg-white/90 dark:bg-black/90" />
        </div>

        <div className="relative z-10 max-w-6xl mx-auto text-center">
          {/* Online Users Badge */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-1 md:gap-2 px-2 md:px-3 py-1 rounded-full border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 mb-3 md:mb-4"
          >
            <div className="w-1.5 h-1.5 md:w-2 md:h-2 bg-green-500 rounded-full animate-pulse" />
            <Users className="h-2.5 w-2.5 md:h-3 md:w-3 text-zinc-600 dark:text-zinc-400" />
            <span className="text-xs md:text-sm text-zinc-600 dark:text-zinc-400 font-medium">
              {onlineUsers.toLocaleString()} online
            </span>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="mb-4 md:mb-6"
          >
            <div className="inline-flex items-center gap-1 md:gap-2 px-2 md:px-3 py-1 rounded-full border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 mb-3 md:mb-4">
              <Sparkles className="h-2.5 w-2.5 md:h-3 md:w-3 text-zinc-600 dark:text-zinc-400" />
              <span className="text-xs md:text-sm text-zinc-600 dark:text-zinc-400 font-medium">
                Your Academic Companion
              </span>
            </div>

            <h1 className="text-3xl md:text-5xl lg:text-7xl font-bold tracking-tight mb-3 md:mb-4">
              <span className="text-black dark:text-white">VTU</span>
              <span className="text-zinc-400 dark:text-zinc-600"> Vault</span>
            </h1>

            <p className="text-sm md:text-lg text-zinc-600 dark:text-zinc-400 max-w-2xl mx-auto leading-relaxed px-2">
              Everything you need for VTU academics. Notes, question papers, lab programs, and tools — all in one place.
            </p>
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
                placeholder="Search subjects, notes, papers..."
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
                      if ("sem" in item) {
                        window.location.href = `/semester/${item.sem.replace(/\D/g, "")}`
                      } else {
                        window.location.href = item.href
                      }
                      setSearchQuery("")
                    }}
                  >
                    <div className="font-medium text-black dark:text-white text-xs md:text-sm">
                      {"sem" in item ? `${item.sem} Semester` : item.title}
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

      {/* Semester Cards */}
      <section id="semester-section" className="py-6 md:py-12 px-2 md:px-4 pt-20">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="text-center mb-4 md:mb-8"
          >
            <h2 className="text-lg md:text-2xl font-bold text-black dark:text-white mb-1 md:mb-2">
              Choose Your Semester
            </h2>
            <p className="text-xs md:text-sm text-zinc-600 dark:text-zinc-400">
              Select your semester to access relevant resources
            </p>
          </motion.div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-2 md:gap-3">
            {semesters.map((semester, index) => (
              <motion.div
                key={semester.sem}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.1 * index }}
              >
                <Link href={`/semester/${semester.sem.replace(/\D/g, "")}`}>
                  <Card className="group relative overflow-hidden border-zinc-200 dark:border-zinc-800 hover:border-black dark:hover:border-white transition-all duration-300 cursor-pointer h-24 md:h-32 bg-gradient-to-br from-white to-zinc-100 dark:from-zinc-900 dark:to-black shadow-lg hover:shadow-xl">
                    {/* Shiny Overlay Effect */}
                    <div className="absolute inset-0 bg-gradient-to-br from-transparent via-white/20 to-transparent dark:via-white/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                    
                    {/* Subtle Pattern */}
                    <div className="absolute inset-0 opacity-5 dark:opacity-10">
                      <div className="w-full h-full bg-[radial-gradient(circle_at_1px_1px,rgba(0,0,0,0.1)_1px,transparent_0)] dark:bg-[radial-gradient(circle_at_1px_1px,rgba(255,255,255,0.1)_1px,transparent_0)] bg-[length:8px_8px]" />
                    </div>

                    <div className="relative p-2 md:p-4 text-center h-full flex flex-col justify-center">
                      {/* Hero Badge with Icon - Enhanced Shiny Effect */}
                      <div className="w-6 h-6 md:w-10 md:h-10 rounded-lg bg-gradient-to-br from-black to-zinc-800 dark:from-white dark:to-zinc-200 flex items-center justify-center mx-auto mb-1 md:mb-2 group-hover:scale-110 transition-transform shadow-lg group-hover:shadow-xl">
                        <div className="absolute inset-0 rounded-lg bg-gradient-to-br from-transparent via-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                        <semester.icon className="text-white dark:text-black h-3 w-3 md:h-5 md:w-5 relative z-10" />
                      </div>
                      <h3 className="font-bold text-black dark:text-white mb-0.5 text-xs md:text-sm group-hover:text-zinc-800 dark:group-hover:text-zinc-200 transition-colors">
                        {semester.sem} Sem
                      </h3>
                      <p className="text-xs text-zinc-600 dark:text-zinc-400 group-hover:text-zinc-700 dark:group-hover:text-zinc-300 transition-colors">{semester.subjects} Subjects</p>
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

      {/* CTA Section */}
      <section className="py-6 md:py-12 px-2 md:px-4 pt-20">
        <div className="max-w-4xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.8 }}
          >
            <h2 className="text-lg md:text-3xl font-bold text-black dark:text-white mb-2 md:mb-4">
              Ready to excel in your academics?
            </h2>
            <p className="text-sm md:text-lg text-zinc-600 dark:text-zinc-400 mb-4 md:mb-6 max-w-2xl mx-auto px-2">
              Join thousands of VTU students who are already using VTU Vault to boost their academic performance.
            </p>
            <Button
              onClick={handleGetStarted}
              size="lg"
              className="bg-black dark:bg-white text-white dark:text-black hover:bg-zinc-800 dark:hover:bg-zinc-200 rounded-lg px-4 md:px-6 py-2 md:py-3 text-sm md:text-base font-medium"
            >
              Get Started
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
              <div className="w-12 h-12 md:w-16 md:h-16 rounded-full overflow-hidden border-2 border-zinc-200 dark:border-zinc-800">
                <img src="/h2.png" alt="Afzal Basheer" className="w-full h-full object-cover" />
              </div>
              <div className="text-center md:text-left">
                <h3 className="text-sm md:text-lg font-bold text-black dark:text-white">Afzal Basheer</h3>
                <p className="text-xs md:text-sm text-zinc-600 dark:text-zinc-400">CS Student & Developer</p>
                <p className="text-xs text-zinc-500 dark:text-zinc-500">Building tools for VTU community</p>
              </div>
            </div>

            <p className="text-xs md:text-sm text-zinc-600 dark:text-zinc-400 max-w-2xl mx-auto px-2">
              VTU Vault was created to bridge the gap between students and academic resources. Every feature is designed
              with the VTU student experience in mind.
            </p>

            <div className="flex justify-center gap-2 md:gap-3">
              <Button
                variant="outline"
                size="sm"
                className="rounded-lg border-zinc-200 dark:border-zinc-800 bg-transparent text-xs px-2 py-1 md:px-3 md:py-2"
                onClick={() => window.open('https://www.linkedin.com/in/afzal-basheer-127878264', '_blank')}
              >
                <Linkedin className="h-2.5 w-2.5 md:h-3 md:w-3 mr-1" />
                LinkedIn
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="rounded-lg border-zinc-200 dark:border-zinc-800 bg-transparent text-xs px-2 py-1 md:px-3 md:py-2"
                onClick={() => window.open('https://github.com/Afzal74', '_blank')}
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
            © 2024 VTU Vault. Created by <span className="font-semibold text-black dark:text-white">Afzal</span>. All
            rights reserved.
          </p>
        </div>
      </footer>
    </div>
  )
}
