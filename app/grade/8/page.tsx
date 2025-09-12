"use client"

import { useState, useEffect } from "react"
import { ArrowLeft, BookOpen, Play, Brain, Target, Star } from "lucide-react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { motion } from "framer-motion"

export default function Grade8Page() {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  const subjects = [
    { name: "Mathematics", description: "Numbers, Algebra, Geometry", color: "blue" },
    { name: "Science", description: "Physics, Chemistry, Biology", color: "green" },
    { name: "English", description: "Reading, Writing, Grammar", color: "purple" },
    { name: "Social Studies", description: "History, Geography, Civics", color: "orange" },
    { name: "Computer Science", description: "Programming, Technology", color: "indigo" },
    { name: "Environmental Studies", description: "Nature, Ecology", color: "emerald" }
  ]

  const quickAccess = [
    { title: "Notes", icon: BookOpen, href: "/notes?grade=8", description: "Study materials" },
    { title: "Lectures", icon: Play, href: "/lectures?grade=8", description: "Video lessons" },
    { title: "AI Tutor", icon: Brain, href: "/ai-tutor?grade=8", description: "Smart learning" },
    { title: "Quiz", icon: Target, href: "/quiz?grade=8", description: "Test yourself" },
    { title: "Progress", icon: Star, href: "/dashboard?grade=8", description: "Track learning" }
  ]

  if (!mounted) return null

  return (
    <div className="min-h-screen bg-white dark:bg-black">
      {/* Header */}
      <section className="pt-20 md:pt-24 pb-8 px-2 md:px-4">
        <div className="max-w-6xl mx-auto">
          {/* Back Button */}
          <Link href="/level/high-school">
            <Button variant="ghost" className="mb-6 text-zinc-600 dark:text-zinc-400 hover:text-black dark:hover:text-white">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to High School
            </Button>
          </Link>

          {/* Page Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-8 md:mb-12"
          >
            <img 
              src="/8th.png" 
              alt="Class 8th" 
              className="w-36 h-36 md:w-44 md:h-44 lg:w-52 lg:h-52 xl:w-60 xl:h-60 object-contain mx-auto mb-4 drop-shadow-2xl"
            />
            <p className="text-sm md:text-lg text-zinc-600 dark:text-zinc-400 mb-4">
              Innovator • High School • Innovate with technology
            </p>
            <div className="flex justify-center gap-2">
              <span className="text-xs px-3 py-1 rounded-full bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-300">
                6 Subjects
              </span>
              <span className="text-xs px-3 py-1 rounded-full bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300">
                NCERT Curriculum
              </span>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Subjects Grid */}
      <section className="py-8 px-2 md:px-4">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-center mb-6 md:mb-8"
          >
            <h2 className="text-lg md:text-2xl font-bold text-black dark:text-white mb-2">
              Choose a Subject
            </h2>
            <p className="text-sm md:text-base text-zinc-600 dark:text-zinc-400">
              Select a subject to access study materials and resources
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6 mb-12">
            {subjects.map((subject, index) => (
              <motion.div
                key={subject.name}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.1 * index }}
              >
                <Link href="#">
                  <Card className="group border-zinc-200 dark:border-zinc-800 hover:border-blue-500 dark:hover:border-blue-400 transition-all duration-300 cursor-pointer h-32 bg-gradient-to-br from-white to-zinc-100 dark:from-zinc-900 dark:to-black shadow-lg hover:shadow-xl">
                    <div className="p-4 md:p-6 h-full flex flex-col justify-center">
                      <h3 className="font-bold text-black dark:text-white mb-2 text-lg group-hover:text-zinc-800 dark:group-hover:text-zinc-200 transition-colors">
                        {subject.name}
                      </h3>
                      <p className="text-sm text-zinc-600 dark:text-zinc-400 group-hover:text-zinc-700 dark:group-hover:text-zinc-300 transition-colors">
                        {subject.description}
                      </p>
                      <div className="mt-2">
                        <span className="text-xs px-2 py-1 rounded-full bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300">
                          Coming Soon
                        </span>
                      </div>
                    </div>
                  </Card>
                </Link>
              </motion.div>
            ))}
          </div>

          {/* Quick Access */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="text-center mb-6"
          >
            <h3 className="text-lg font-bold text-black dark:text-white mb-4">
              Quick Access
            </h3>
          </motion.div>

          <div className="grid grid-cols-2 md:grid-cols-5 gap-3 md:gap-4">
            {quickAccess.map((item, index) => (
              <motion.div
                key={item.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.5 + 0.1 * index }}
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