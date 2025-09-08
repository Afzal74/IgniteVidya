"use client"

import { useState, useEffect } from "react"
import { ArrowLeft, Beaker, BookOpen, Play, Brain, Target, Star } from "lucide-react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { motion } from "framer-motion"

export default function Grade9Page() {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  const subjects = [
    { name: "Mathematics", description: "Coordinate Geometry, Trigonometry", color: "blue" },
    { name: "Physics", description: "Laws of Motion, Gravitation", color: "purple" },
    { name: "Chemistry", description: "Atomic Structure, Chemical Bonding", color: "green" },
    { name: "Biology", description: "Life Sciences, Human Body", color: "emerald" },
    { name: "English", description: "Literature Analysis, Writing", color: "indigo" },
    { name: "Social Studies", description: "World History, Economics", color: "orange" },
    { name: "Computer Science", description: "Object-Oriented Programming", color: "cyan" },
    { name: "Hindi", description: "Classical Literature", color: "rose" },
    { name: "Environmental Science", description: "Ecology, Sustainability", color: "teal" }
  ]

  const quickAccess = [
    { title: "Notes", icon: BookOpen, href: "/notes?grade=9", description: "Study materials" },
    { title: "Lectures", icon: Play, href: "/lectures?grade=9", description: "Video lessons" },
    { title: "AI Tutor", icon: Brain, href: "/ai-tutor?grade=9", description: "Smart learning" },
    { title: "Quiz", icon: Target, href: "/quiz?grade=9", description: "Test yourself" },
    { title: "Progress", icon: Star, href: "/dashboard?grade=9", description: "Track learning" }
  ]

  if (!mounted) return null

  return (
    <div className="min-h-screen bg-white dark:bg-black">
      <section className="pt-20 md:pt-24 pb-8 px-2 md:px-4">
        <div className="max-w-6xl mx-auto">
          <Link href="/level/high-school">
            <Button variant="ghost" className="mb-6 text-zinc-600 dark:text-zinc-400 hover:text-black dark:hover:text-white">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to High School
            </Button>
          </Link>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-8 md:mb-12">
            <div className="w-16 h-16 md:w-20 md:h-20 rounded-xl bg-gradient-to-br from-orange-500 to-orange-700 dark:from-orange-400 dark:to-orange-600 flex items-center justify-center mx-auto mb-4 shadow-lg">
              <Beaker className="text-white dark:text-black h-8 w-8 md:h-10 md:w-10" />
            </div>
            <h1 className="text-2xl md:text-4xl font-bold text-black dark:text-white mb-2">Class 9th</h1>
            <p className="text-sm md:text-lg text-zinc-600 dark:text-zinc-400 mb-4">Creator • High School • Create amazing projects</p>
            <div className="flex justify-center gap-2">
              <span className="text-xs px-3 py-1 rounded-full bg-orange-100 text-orange-700 dark:bg-orange-900 dark:text-orange-300">9 Subjects</span>
              <span className="text-xs px-3 py-1 rounded-full bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300">Intermediate Level</span>
            </div>
          </motion.div>
        </div>
      </section>

      <section className="py-8 px-2 md:px-4">
        <div className="max-w-6xl mx-auto">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="text-center mb-6 md:mb-8">
            <h2 className="text-lg md:text-2xl font-bold text-black dark:text-white mb-2">Choose a Subject</h2>
            <p className="text-sm md:text-base text-zinc-600 dark:text-zinc-400">Select a subject to access study materials and resources</p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-3 gap-4 md:gap-6 mb-12">
            {subjects.map((subject, index) => (
              <motion.div key={subject.name} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.1 * index }}>
                <Card className="group border-zinc-200 dark:border-zinc-800 hover:border-orange-500 dark:hover:border-orange-400 transition-all duration-300 cursor-pointer h-32 bg-gradient-to-br from-white to-zinc-100 dark:from-zinc-900 dark:to-black shadow-lg hover:shadow-xl">
                  <div className="p-4 md:p-6 h-full flex flex-col justify-center">
                    <h3 className="font-bold text-black dark:text-white mb-2 text-lg group-hover:text-zinc-800 dark:group-hover:text-zinc-200 transition-colors">{subject.name}</h3>
                    <p className="text-sm text-zinc-600 dark:text-zinc-400 group-hover:text-zinc-700 dark:group-hover:text-zinc-300 transition-colors">{subject.description}</p>
                  </div>
                </Card>
              </motion.div>
            ))}
          </div>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }} className="text-center mb-6">
            <h3 className="text-lg font-bold text-black dark:text-white mb-4">Quick Access</h3>
          </motion.div>

          <div className="grid grid-cols-2 md:grid-cols-5 gap-3 md:gap-4">
            {quickAccess.map((item, index) => (
              <motion.div key={item.title} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.5 + 0.1 * index }}>
                <Link href={item.href}>
                  <Card className="group border-zinc-200 dark:border-zinc-800 hover:border-black dark:hover:border-white transition-all duration-300 cursor-pointer h-20">
                    <div className="p-3 text-center h-full flex flex-col justify-center">
                      <div className="w-8 h-8 rounded-lg bg-zinc-100 dark:bg-zinc-900 flex items-center justify-center mx-auto mb-1 group-hover:bg-black dark:group-hover:bg-white transition-colors">
                        <item.icon className="h-4 w-4 text-zinc-600 dark:text-zinc-400 group-hover:text-white dark:group-hover:text-black transition-colors" />
                      </div>
                      <h4 className="font-semibold text-black dark:text-white text-xs">{item.title}</h4>
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
