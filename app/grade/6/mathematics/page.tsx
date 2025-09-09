"use client"

import { useState, useEffect } from "react"
import { ArrowLeft, Calculator, BookOpen, Play, Brain, Target, Star, Gamepad2, Clock, Hash, Shapes, Ruler, PieChart, BarChart3, Globe } from "lucide-react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { motion } from "framer-motion"

export default function Grade6MathematicsPage() {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  const resources = [
    { name: "Study Notes", description: "Comprehensive mathematics notes", color: "green", type: "notes", href: "/notes/grade/6/mathematics" },
    { name: "Video Lectures", description: "Expert-taught lessons", color: "purple", type: "lectures", href: "/lectures/grade/6/mathematics" },
    { name: "Practice Worksheets", description: "Printable exercise sheets", color: "orange", type: "worksheets", href: "/worksheets/grade/6/mathematics" },
    { name: "Quiz & Tests", description: "Assess your understanding", color: "indigo", type: "quiz", href: "/quiz/grade/6/mathematics" },
    { name: "AI Math Tutor", description: "Personalized learning assistant", color: "emerald", type: "ai", href: "/ai-tutor/grade/6/mathematics" }
  ]

  const quickAccess = [
    { title: "Calculator", icon: Calculator, href: "/calculator", description: "Math tools" },
    { title: "Notes", icon: BookOpen, href: "/notes?grade=6&subject=mathematics", description: "Study materials" },
    { title: "Videos", icon: Play, href: "/lectures?grade=6&subject=mathematics", description: "Video lessons" },
    { title: "AI Help", icon: Brain, href: "/ai-tutor?grade=6&subject=mathematics", description: "Smart learning" },
    { title: "Quiz", icon: Target, href: "/quiz?grade=6&subject=mathematics", description: "Test yourself" }
  ]

  const mathTopics = [
    {
      name: "Number Comparison",
      description: "Interactive drag & drop learning",
      icon: Gamepad2,
      status: "available",
      href: "/grade/6/mathematics/comparison-game"
    },
    { 
      name: "Knowing Our Numbers", 
      description: "Large numbers, estimation, Roman numerals", 
      icon: Hash, 
      status: "progressing",
      href: "#coming-soon"
    },
    { 
      name: "Playing with Numbers", 
      description: "Factors, multiples, prime and composite numbers", 
      icon: Target, 
      status: "progressing",
      href: "#coming-soon"
    },
    { 
      name: "Whole Numbers", 
      description: "Properties, number line, operations", 
      icon: Calculator, 
      status: "progressing",
      href: "#coming-soon"
    },
    { 
      name: "Negative Numbers and Integers", 
      description: "Introduction to integers, addition and subtraction", 
      icon: Hash, 
      status: "progressing",
      href: "#coming-soon"
    },
    { 
      name: "Fractions", 
      description: "Types, comparison, operations", 
      icon: PieChart, 
      status: "progressing",
      href: "#coming-soon"
    },
    { 
      name: "Decimals", 
      description: "Place value, addition, subtraction", 
      icon: Calculator, 
      status: "progressing",
      href: "#coming-soon"
    },
    { 
      name: "Introduction to Algebra", 
      description: "Variables, expressions, simple equations", 
      icon: BookOpen, 
      status: "progressing",
      href: "#coming-soon"
    },
    { 
      name: "Ratio and Proportion", 
      description: "Concept, unitary method", 
      icon: BarChart3, 
      status: "progressing",
      href: "#coming-soon"
    },
    { 
      name: "Basic Geometrical Ideas", 
      description: "Points, lines, angles, curves", 
      icon: Shapes, 
      status: "progressing",
      href: "#coming-soon"
    },
    { 
      name: "Understanding Elementary Shapes", 
      description: "2D and 3D shapes, measuring angles", 
      icon: Globe, 
      status: "progressing",
      href: "#coming-soon"
    },
    { 
      name: "Symmetry", 
      description: "Line of symmetry, reflection", 
      icon: Shapes, 
      status: "progressing",
      href: "#coming-soon"
    },
    { 
      name: "Practical Geometry", 
      description: "Using ruler and compass, constructing angles and shapes", 
      icon: Ruler, 
      status: "progressing",
      href: "#coming-soon"
    },
    { 
      name: "Mensuration", 
      description: "Perimeter and area of simple shapes", 
      icon: Ruler, 
      status: "progressing",
      href: "#coming-soon"
    },
    { 
      name: "Data Handling", 
      description: "Pictographs, bar graphs, organizing data", 
      icon: BarChart3, 
      status: "progressing",
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
            <div className="w-16 h-16 md:w-20 md:h-20 rounded-xl bg-gradient-to-br from-blue-500 to-blue-700 dark:from-blue-400 dark:to-blue-600 flex items-center justify-center mx-auto mb-4 shadow-lg">
              <Calculator className="text-white dark:text-black h-8 w-8 md:h-10 md:w-10" />
            </div>
            <h1 className="text-2xl md:text-4xl font-bold text-black dark:text-white mb-2">
              Mathematics - Class 6
            </h1>
            <p className="text-sm md:text-lg text-zinc-600 dark:text-zinc-400 mb-4">
              Numbers, Algebra, Geometry • Interactive Learning Resources
            </p>
            <div className="flex justify-center gap-2">
              <span className="text-xs px-3 py-1 rounded-full bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300">
                Interactive Games
              </span>
              <span className="text-xs px-3 py-1 rounded-full bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300">
                Study Materials
              </span>
              <span className="text-xs px-3 py-1 rounded-full bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-300">
                AI-Powered
              </span>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Mathematics Topics & Games */}
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
            {mathTopics.map((topic, index) => {
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
                            <IconComponent className="text-white h-5 w-5 md:h-6 md:w-6" />
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
                          <IconComponent className="text-white h-5 w-5 md:h-6 md:w-6" />
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
              Comprehensive study materials and tools to support your learning
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
                          <IconComponent className="text-white dark:text-black h-5 w-5 md:h-6 md:w-6" />
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
            transition={{ delay: 0.6 }}
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
                transition={{ duration: 0.5, delay: 0.7 + 0.1 * index }}
              >
                <Link href={item.href}>
                  <Card className="group border-zinc-200 dark:border-zinc-800 hover:border-black dark:hover:border-white transition-all duration-300 cursor-pointer h-20">
                    <div className="p-3 text-center h-full flex flex-col justify-center">
                      <div className="w-8 h-8 rounded-lg bg-zinc-100 dark:bg-zinc-900 flex items-center justify-center mx-auto mb-1 group-hover:bg-black dark:group-hover:bg-white transition-colors">
                        <item.icon className="h-4 w-4 text-zinc-600 dark:text-zinc-400 group-hover:text-white dark:group-hover:text-black transition-colors" />
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
