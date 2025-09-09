"use client"

import { useState, useEffect } from "react"
import { ArrowLeft, Atom, Flask, Leaf, Telescope, BookOpen, Play, Brain, Target, Star, Gamepad2, Clock, Zap, Calculator } from "lucide-react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { motion } from "framer-motion"

// Safe icon renderer to prevent undefined component errors
const SafeIcon = ({ IconComponent, className }: { IconComponent: any, className: string }) => {
  if (!IconComponent || typeof IconComponent !== 'function') {
    return <BookOpen className={className} />
  }
  return <IconComponent className={className} />
}

export default function Grade6SciencePage() {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  const resources = [
    { name: "Study Notes", description: "Comprehensive science notes", color: "green", type: "notes", href: "/notes/grade/6/science" },
    { name: "Video Lectures", description: "Expert-taught lessons", color: "purple", type: "lectures", href: "/lectures/grade/6/science" },
    { name: "Practice Worksheets", description: "Printable exercise sheets", color: "orange", type: "worksheets", href: "/worksheets/grade/6/science" },
    { name: "Quiz & Tests", description: "Assess your understanding", color: "indigo", type: "quiz", href: "/quiz/grade/6/science" },
    { name: "AI Science Tutor", description: "Personalized learning assistant", color: "emerald", type: "ai", href: "/ai-tutor/grade/6/science" }
  ]

  const quickAccess = [
    { title: "Calculator", icon: Calculator, href: "/calculator", description: "Math tools" },
    { title: "Notes", icon: BookOpen, href: "/notes?grade=6&subject=science", description: "Study materials" },
    { title: "Videos", icon: Play, href: "/lectures?grade=6&subject=science", description: "Video lessons" },
    { title: "AI Help", icon: Brain, href: "/ai-tutor?grade=6&subject=science", description: "Smart learning" },
    { title: "Quiz", icon: Target, href: "/quiz?grade=6&subject=science", description: "Test yourself" }
  ]

  const scienceTopics = [
    // Physics Topics
    {
      name: "Exploring Magnets",
      description: "Interactive magnetic field exploration",
      icon: Zap,
      status: "available",
      category: "Physics",
      href: "/grade/6/science/magnets-game"
    },
    {
      name: "Measurement of Length and Motion",
      description: "Units, motion types, speed",
      icon: Target,
      status: "progressing",
      category: "Physics",
      href: "#coming-soon"
    },
    {
      name: "Temperature and its Measurement",
      description: "Thermometers, heat, Celsius/Fahrenheit",
      icon: Calculator,
      status: "progressing",
      category: "Physics",
      href: "#coming-soon"
    },
    
    // Chemistry Topics
    {
      name: "Material Around Us",
      description: "Solids, liquids, gases, physical properties",
      icon: Flask,
      status: "progressing",
      category: "Chemistry",
      href: "#coming-soon"
    },
    {
      name: "Methods of Separation in Everyday Life",
      description: "Filtration, evaporation, magnetic separation",
      icon: Flask,
      status: "progressing",
      category: "Chemistry",
      href: "#coming-soon"
    },
    {
      name: "A Journey through States of Water",
      description: "Evaporation, condensation, water cycle",
      icon: Flask,
      status: "progressing",
      category: "Chemistry",
      href: "#coming-soon"
    },
    
    // Biology Topics
    {
      name: "Diversity in Living World",
      description: "Classification, ecosystems",
      icon: Leaf,
      status: "progressing",
      category: "Biology",
      href: "#coming-soon"
    },
    {
      name: "Mindful Eating: A Path to a Healthy Body",
      description: "Nutrition, balanced diet",
      icon: Star,
      status: "progressing",
      category: "Biology",
      href: "#coming-soon"
    },
    {
      name: "Living Creatures: Exploring Their Characteristics",
      description: "Growth, reproduction, stimuli",
      icon: BookOpen,
      status: "progressing",
      category: "Biology",
      href: "#coming-soon"
    },
    {
      name: "Nature's Treasures",
      description: "Natural resources, conservation",
      icon: Leaf,
      status: "progressing",
      category: "Biology",
      href: "#coming-soon"
    },
    
    // General Science Topics
    {
      name: "The Wonderful World of Science",
      description: "Introduction to scientific thinking",
      icon: Atom,
      status: "progressing",
      category: "General Science",
      href: "#coming-soon"
    },
    {
      name: "Beyond Earth",
      description: "Space science, astronomy",
      icon: Telescope,
      status: "progressing",
      category: "General Science",
      href: "#coming-soon"
    }
  ]

  const getColorClasses = (color: string) => {
    switch (color) {
      case "blue": return "from-blue-500 to-blue-700 dark:from-blue-400 dark:to-blue-600"
      case "green": return "from-green-500 to-green-700 dark:from-green-400 dark:to-green-600"
      case "purple": return "from-purple-500 to-purple-700 dark:from-purple-400 dark:to-purple-600"
      case "orange": return "from-orange-500 to-orange-700 dark:from-orange-400 dark:to-orange-600"
      case "indigo": return "from-indigo-500 to-indigo-700 dark:from-indigo-400 dark:to-indigo-600"
      case "emerald": return "from-emerald-500 to-emerald-700 dark:from-emerald-400 dark:to-emerald-600"
      default: return "from-gray-500 to-gray-700 dark:from-gray-400 dark:to-gray-600"
    }
  }

  const getIcon = (type: string) => {
    switch (type) {
      case "game": return Gamepad2
      case "notes": return BookOpen
      case "lectures": return Play
      case "worksheets": return Target
      case "quiz": return Star
      case "ai": return Brain
      default: return BookOpen
    }
  }

  const getCategoryColor = (category: string) => {
    switch (category) {
      case "Physics": return "from-blue-400 to-blue-600 dark:from-blue-500 dark:to-blue-700"
      case "Chemistry": return "from-green-400 to-green-600 dark:from-green-500 dark:to-green-700"
      case "Biology": return "from-emerald-400 to-emerald-600 dark:from-emerald-500 dark:to-emerald-700"
      case "General Science": return "from-purple-400 to-purple-600 dark:from-purple-500 dark:to-purple-700"
      default: return "from-yellow-400 to-yellow-600 dark:from-yellow-500 dark:to-yellow-700"
    }
  }

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case "Physics": return "⚛️"
      case "Chemistry": return "🧪"
      case "Biology": return "🌿"
      case "General Science": return "🌌"
      default: return "🔬"
    }
  }

  if (!mounted) return null

  return (
    <div className="min-h-screen bg-white dark:bg-black">
      {/* Header */}
      <section className="pt-20 md:pt-24 pb-8 px-2 md:px-4">
        <div className="max-w-6xl mx-auto">
          {/* Back Button */}
          <Link href="/grade/6">
            <Button variant="ghost" className="mb-6 text-zinc-600 dark:text-zinc-400 hover:text-black dark:hover:text-white">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Class 6
            </Button>
          </Link>

          {/* Page Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-8 md:mb-12"
          >
            <div className="w-16 h-16 md:w-20 md:h-20 rounded-xl bg-gradient-to-br from-green-500 to-blue-700 dark:from-green-400 dark:to-blue-600 flex items-center justify-center mx-auto mb-4 shadow-lg">
              <Atom className="text-white dark:text-black h-8 w-8 md:h-10 md:w-10" />
            </div>
            <h1 className="text-2xl md:text-4xl font-bold text-black dark:text-white mb-2">
              Science - Class 6
            </h1>
            <p className="text-sm md:text-lg text-zinc-600 dark:text-zinc-400 mb-4">
              Physics, Chemistry, Biology • Interactive Learning Resources
            </p>
            <div className="flex justify-center gap-2 flex-wrap">
              <span className="text-xs px-3 py-1 rounded-full bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300">
                ⚛️ Physics
              </span>
              <span className="text-xs px-3 py-1 rounded-full bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300">
                🧪 Chemistry
              </span>
              <span className="text-xs px-3 py-1 rounded-full bg-emerald-100 text-emerald-700 dark:bg-emerald-900 dark:text-emerald-300">
                🌿 Biology
              </span>
              <span className="text-xs px-3 py-1 rounded-full bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-300">
                🌌 General Science
              </span>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Science Topics & Games */}
      <section className="py-8 px-2 md:px-4">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-center mb-6 md:mb-8"
          >
            <h2 className="text-lg md:text-2xl font-bold text-black dark:text-white mb-2">
              Interactive Games & Topics
            </h2>
            <p className="text-sm md:text-base text-zinc-600 dark:text-zinc-400 mb-4">
              Complete curriculum coverage with interactive games and activities
            </p>
            <div className="flex justify-center items-center gap-4 text-xs">
              <div className="flex items-center gap-1">
                <div className="w-2 h-2 rounded-full bg-green-500"></div>
                <span className="text-green-700 dark:text-green-400">Available</span>
              </div>
              <div className="flex items-center gap-1">
                <div className="w-2 h-2 rounded-full bg-yellow-500"></div>
                <span className="text-yellow-700 dark:text-yellow-400">Coming Soon</span>
              </div>
            </div>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 mb-12">
            {scienceTopics.map((topic, index) => {
              const IconComponent = topic.icon
              const isAvailable = topic.status === "available"
              return (
                <motion.div
                  key={topic.name}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.1 * index }}
                >
                  {isAvailable ? (
                    <Link href={topic.href}>
                      <Card className="group relative overflow-hidden border-zinc-200 dark:border-zinc-800 hover:border-green-500 dark:hover:border-green-400 transition-all duration-300 cursor-pointer h-36 bg-gradient-to-br from-white to-green-50 dark:from-zinc-900 dark:to-green-950/20 shadow-lg hover:shadow-xl">
                        {/* Available Badge */}
                        <div className="absolute top-2 right-2">
                          <span className="text-xs px-2 py-1 rounded-full bg-green-500 text-white font-medium">
                            Available
                          </span>
                        </div>
                        
                        {/* Shiny Overlay Effect */}
                        <div className="absolute inset-0 bg-gradient-to-br from-transparent via-white/20 to-transparent dark:via-white/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                        
                        <div className="relative p-4 md:p-6 h-full flex flex-col justify-center">
                          {/* Icon */}
                          <div className="w-10 h-10 md:w-12 md:h-12 rounded-lg bg-gradient-to-br from-green-500 to-green-700 dark:from-green-400 dark:to-green-600 flex items-center justify-center mx-auto mb-3 group-hover:scale-110 transition-transform shadow-lg group-hover:shadow-xl">
<SafeIcon IconComponent={topic.icon} className="text-white h-5 w-5 md:h-6 md:w-6" />
                          </div>
                          
                          <h3 className="font-bold text-black dark:text-white mb-2 text-center text-sm md:text-base group-hover:text-zinc-800 dark:group-hover:text-zinc-200 transition-colors">
                            {topic.name}
                          </h3>
                          
                          <p className="text-xs md:text-sm text-zinc-600 dark:text-zinc-400 group-hover:text-zinc-700 dark:group-hover:text-zinc-300 transition-colors text-center">
                            {topic.description}
                          </p>
                        </div>
                      </Card>
                    </Link>
                  ) : (
                    <Card className="group relative overflow-hidden border-zinc-200 dark:border-zinc-800 transition-all duration-300 cursor-not-allowed h-36 bg-gradient-to-br from-white to-yellow-50 dark:from-zinc-900 dark:to-yellow-950/20 opacity-75">
                      {/* Coming Soon Badge */}
                      <div className="absolute top-2 right-2">
                        <div className="flex items-center gap-1">
                          <Clock className="h-3 w-3 text-yellow-600 dark:text-yellow-400" />
                          <span className="text-xs px-2 py-1 rounded-full bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300 font-medium">
                            Coming Soon
                          </span>
                        </div>
                      </div>
                      
                      <div className="relative p-4 md:p-6 h-full flex flex-col justify-center">
                        {/* Icon */}
                        <div className="w-10 h-10 md:w-12 md:h-12 rounded-lg bg-gradient-to-br from-yellow-400 to-yellow-600 dark:from-yellow-500 dark:to-yellow-700 flex items-center justify-center mx-auto mb-3 shadow-md">
<SafeIcon IconComponent={topic.icon} className="text-white h-5 w-5 md:h-6 md:w-6" />
                        </div>
                        
                        <h3 className="font-bold text-black dark:text-white mb-2 text-center text-sm md:text-base">
                          {topic.name}
                        </h3>
                        
                        <p className="text-xs md:text-sm text-zinc-600 dark:text-zinc-400 text-center">
                          {topic.description}
                        </p>
                      </div>
                    </Card>
                  )}
                </motion.div>
              )
            })}
          </div>
        </div>
      </section>

      {/* Learning Resources */}
      <section className="py-8 px-2 md:px-4 bg-zinc-50 dark:bg-zinc-900">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="text-center mb-6 md:mb-8"
          >
            <h2 className="text-lg md:text-2xl font-bold text-black dark:text-white mb-2">
              Learning Resources
            </h2>
            <p className="text-sm md:text-base text-zinc-600 dark:text-zinc-400">
              Comprehensive study materials and tools to support your science learning
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6 mb-12">
            {resources.map((resource, index) => {
              const IconComponent = getIcon(resource.type)
              return (
                <motion.div
                  key={resource.name}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.5 + 0.1 * index }}
                >
                  <Link href={resource.href}>
                    <Card className="group relative overflow-hidden border-zinc-200 dark:border-zinc-800 hover:border-blue-500 dark:hover:border-blue-400 transition-all duration-300 cursor-pointer h-36 bg-gradient-to-br from-white to-zinc-100 dark:from-zinc-900 dark:to-black shadow-lg hover:shadow-xl">
                      {/* Shiny Overlay Effect */}
                      <div className="absolute inset-0 bg-gradient-to-br from-transparent via-white/20 to-transparent dark:via-white/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                      
                      <div className="relative p-4 md:p-6 h-full flex flex-col justify-center">
                        {/* Icon */}
                        <div className={`w-10 h-10 md:w-12 md:h-12 rounded-lg bg-gradient-to-br ${getColorClasses(resource.color)} flex items-center justify-center mx-auto mb-3 group-hover:scale-110 transition-transform shadow-lg group-hover:shadow-xl`}>
<SafeIcon IconComponent={IconComponent} className="text-white dark:text-black h-5 w-5 md:h-6 md:w-6" />
                        </div>
                        
                        <h3 className="font-bold text-black dark:text-white mb-2 text-center text-sm md:text-base group-hover:text-zinc-800 dark:group-hover:text-zinc-200 transition-colors">
                          {resource.name}
                        </h3>
                        
                        <p className="text-xs md:text-sm text-zinc-600 dark:text-zinc-400 group-hover:text-zinc-700 dark:group-hover:text-zinc-300 transition-colors text-center">
                          {resource.description}
                        </p>
                      </div>
                    </Card>
                  </Link>
                </motion.div>
              )
            })}
          </div>

          {/* Quick Access */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8 }}
            className="text-center mb-6"
          >
            <h3 className="text-lg font-bold text-black dark:text-white mb-4">
              Quick Tools
            </h3>
          </motion.div>

          <div className="grid grid-cols-2 md:grid-cols-5 gap-3 md:gap-4">
            {quickAccess.map((item, index) => (
              <motion.div
                key={item.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.9 + 0.1 * index }}
              >
                <Link href={item.href}>
                  <Card className="group border-zinc-200 dark:border-zinc-800 hover:border-black dark:hover:border-white transition-all duration-300 cursor-pointer h-20">
                    <div className="p-3 text-center h-full flex flex-col justify-center">
                      <div className="w-8 h-8 rounded-lg bg-zinc-100 dark:bg-zinc-900 flex items-center justify-center mx-auto mb-1 group-hover:bg-black dark:group-hover:bg-white transition-colors">
<SafeIcon IconComponent={item.icon} className="h-4 w-4 text-zinc-600 dark:text-zinc-400 group-hover:text-white dark:group-hover:text-black transition-colors" />
                      </div>
                      <h4 className="font-semibold text-black dark:text-white text-xs">
                        {item.title}
                      </h4>
                    </div>
                  </Card>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
    </div>
  )
}
