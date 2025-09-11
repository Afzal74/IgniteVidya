"use client"

import { useState, useEffect } from "react"
import { ArrowLeft, Globe, Play, Brain, Target, Star, Gamepad2, Clock, Map, Users, Building, Landmark, Calendar, TreePine } from "lucide-react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { motion } from "framer-motion"

export default function Grade6SocialStudiesPage() {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  const resources = [
    { name: "Study Notes", description: "Comprehensive social studies notes", color: "green", type: "notes", href: "/notes/grade/6/social-studies" },
    { name: "Video Lectures", description: "Expert-taught lessons", color: "purple", type: "lectures", href: "/lectures/grade/6/social-studies" },
    { name: "Practice Worksheets", description: "Maps and timeline exercises", color: "orange", type: "worksheets", href: "/worksheets/grade/6/social-studies" },
    { name: "Quiz & Tests", description: "Assess your understanding", color: "indigo", type: "quiz", href: "/quiz/grade/6/social-studies" },
    { name: "AI Social Studies Tutor", description: "Personalized learning assistant", color: "emerald", type: "ai", href: "/ai-tutor/grade/6/social-studies" }
  ]

  const quickAccess = [
    { title: "Atlas", icon: Map, href: "/atlas", description: "World maps" },
    { title: "Notes", icon: Globe, href: "/notes?grade=6&subject=social-studies", description: "Study materials" },
    { title: "Videos", icon: Play, href: "/lectures?grade=6&subject=social-studies", description: "Video lessons" },
    { title: "AI Help", icon: Brain, href: "/ai-tutor?grade=6&subject=social-studies", description: "Smart learning" },
    { title: "Quiz", icon: Target, href: "/quiz?grade=6&subject=social-studies", description: "Test yourself" }
  ]

  const socialStudiesTopics = [
    {
      name: "What, Where, How and When?",
      description: "Introduction to history and sources",
      icon: Calendar,
      status: "progressing",
      href: "#coming-soon"
    },
    {
      name: "From Hunting-Gathering to Growing Food",
      description: "Early human settlements and agriculture",
      icon: TreePine,
      status: "progressing",
      href: "#coming-soon"
    },
    {
      name: "In the Earliest Cities",
      description: "Harappan civilization",
      icon: Building,
      status: "progressing",
      href: "#coming-soon"
    },
    {
      name: "What Books and Burials Tell Us",
      description: "Vedic period and early societies",
      icon: Landmark,
      status: "progressing",
      href: "#coming-soon"
    },
    {
      name: "Kingdoms, Kings and an Early Republic",
      description: "Mahajanapadas and early political systems",
      icon: Users,
      status: "progressing",
      href: "#coming-soon"
    }
  ]

  const getColorClasses = (color) => {
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

  const getIcon = (type) => {
    switch (type) {
      case "game": return Gamepad2
      case "notes": return Globe
      case "lectures": return Play
      case "worksheets": return Target
      case "quiz": return Star
      case "ai": return Brain
      default: return Globe
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
            <div className="w-16 h-16 md:w-20 md:h-20 rounded-xl bg-gradient-to-br from-orange-500 to-orange-700 dark:from-orange-400 dark:to-orange-600 flex items-center justify-center mx-auto mb-4 shadow-lg">
              <Globe className="text-white dark:text-black h-8 w-8 md:h-10 md:w-10" />
            </div>
            <h1 className="text-2xl md:text-4xl font-bold text-black dark:text-white mb-2">
              Social Studies - Class 6
            </h1>
            <p className="text-sm md:text-lg text-zinc-600 dark:text-zinc-400 mb-4">
              History, Geography, Civics • Interactive Learning Resources
            </p>
            <div className="flex justify-center gap-2 flex-wrap px-2">
              <span className="text-xs px-3 py-1 rounded-full bg-orange-100 text-orange-700 dark:bg-orange-900 dark:text-orange-300">
                NCERT Curriculum
              </span>
              <span className="text-xs px-3 py-1 rounded-full bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300">
                Study Materials
              </span>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Social Studies Topics */}
      <section className="py-8 px-2 md:px-4">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-center mb-6 md:mb-8"
          >
            <h2 className="text-lg md:text-2xl font-bold text-black dark:text-white mb-2">
              NCERT Social Studies Chapters
            </h2>
            <p className="text-sm md:text-base text-zinc-600 dark:text-zinc-400 mb-4">
              History, Geography, and Civics - Complete curriculum coverage
            </p>
          </motion.div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 md:gap-4 mb-8 md:mb-12">
            {socialStudiesTopics.map((topic, index) => {
              const IconComponent = topic.icon
              return (
                <motion.div
                  key={topic.name}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.1 * index }}
                >
                  <Card className="group relative overflow-hidden border-zinc-200 dark:border-zinc-800 transition-all duration-300 cursor-not-allowed h-32 sm:h-36 bg-gradient-to-br from-white to-yellow-50 dark:from-zinc-900 dark:to-yellow-950/20 opacity-75">
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
                      <div className="w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 rounded-lg bg-gradient-to-br from-orange-400 to-orange-600 dark:from-orange-500 dark:to-orange-700 flex items-center justify-center mx-auto mb-2 sm:mb-3 shadow-md">
                        <IconComponent className="text-white h-4 w-4 sm:h-5 sm:w-5 md:h-6 md:w-6" />
                      </div>
                      
                      <h3 className="font-bold text-black dark:text-white mb-2 text-center text-sm md:text-base">
                        {topic.name}
                      </h3>
                      
                      <p className="text-xs md:text-sm text-zinc-600 dark:text-zinc-400 text-center">
                        {topic.description}
                      </p>
                    </div>
                  </Card>
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

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6 mb-8 md:mb-12">
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
                    <Card className="group relative overflow-hidden border-zinc-200 dark:border-zinc-800 hover:border-orange-500 dark:hover:border-orange-400 transition-all duration-300 cursor-pointer h-32 sm:h-36 bg-gradient-to-br from-white to-zinc-100 dark:from-zinc-900 dark:to-black shadow-lg hover:shadow-xl">
                      <div className="relative p-4 md:p-6 h-full flex flex-col justify-center">
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