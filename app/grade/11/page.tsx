"use client"

import { useState, useEffect } from "react"
import { ArrowLeft, Brain, BookOpen, Play, Calculator, Target, Star, Lightbulb } from "lucide-react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { motion } from "framer-motion"

export default function Grade11Page() {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  const subjects = [
    { name: "Physics", description: "Mechanics, Thermodynamics, Waves", color: "blue" },
    { name: "Chemistry", description: "Organic, Inorganic, Physical", color: "green" },
    { name: "Mathematics", description: "Calculus, Coordinate Geometry", color: "purple" },
    { name: "Biology", description: "Cell Biology, Plant Physiology", color: "emerald" },
    { name: "Computer Science", description: "Programming, Data Structures", color: "cyan" },
    { name: "English", description: "Literature, Language Skills", color: "indigo" },
    { name: "Economics", description: "Micro & Macroeconomics", color: "orange" },
    { name: "Business Studies", description: "Management, Entrepreneurship", color: "rose" },
    { name: "Accountancy", description: "Financial Accounting", color: "amber" },
    { name: "Psychology", description: "Human Behavior & Mind", color: "violet" },
    { name: "Political Science", description: "Governance & Politics", color: "teal" }
  ]

  const quickAccess = [
    { title: "Notes", icon: BookOpen, href: "/notes?grade=11", description: "Study materials" },
    { title: "Lectures", icon: Play, href: "/lectures?grade=11", description: "Video lessons" },
    { title: "AI Tutor", icon: Brain, href: "/ai-tutor?grade=11", description: "Smart learning" },
    { title: "Projects", icon: Lightbulb, href: "/projects?grade=11", description: "Project ideas" },
    { title: "Progress", icon: Star, href: "/dashboard?grade=11", description: "Track learning" }
  ]

  if (!mounted) return null

  return (
    <div className="min-h-screen bg-white dark:bg-black">
      <section className="pt-20 md:pt-24 pb-8 px-2 md:px-4">
        <div className="max-w-6xl mx-auto">
          <Link href="/level/higher-secondary">
            <Button variant="ghost" className="mb-6 text-zinc-600 dark:text-zinc-400 hover:text-black dark:hover:text-white">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Higher Secondary
            </Button>
          </Link>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-8 md:mb-12">
            <div className="w-16 h-16 md:w-20 md:h-20 rounded-xl bg-gradient-to-br from-teal-500 to-teal-700 dark:from-teal-400 dark:to-teal-600 flex items-center justify-center mx-auto mb-4 shadow-lg">
              <Brain className="text-white dark:text-black h-8 w-8 md:h-10 md:w-10" />
            </div>
            <h1 className="text-2xl md:text-4xl font-bold text-black dark:text-white mb-2">Class 11th</h1>
            <p className="text-sm md:text-lg text-zinc-600 dark:text-zinc-400 mb-4">Scientist • Higher Secondary • Master scientific concepts</p>
            <div className="flex justify-center gap-2">
              <span className="text-xs px-3 py-1 rounded-full bg-teal-100 text-teal-700 dark:bg-teal-900 dark:text-teal-300">11 Subjects</span>
              <span className="text-xs px-3 py-1 rounded-full bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-300">Advanced Level</span>
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

          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6 mb-12">
            {subjects.map((subject, index) => (
              <motion.div key={subject.name} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.1 * index }}>
                <Card className="group border-zinc-200 dark:border-zinc-800 hover:border-teal-500 dark:hover:border-teal-400 transition-all duration-300 cursor-pointer h-32 bg-gradient-to-br from-white to-zinc-100 dark:from-zinc-900 dark:to-black shadow-lg hover:shadow-xl">
                  <div className="p-4 h-full flex flex-col justify-center">
                    <h3 className="font-bold text-black dark:text-white mb-2 text-sm group-hover:text-zinc-800 dark:group-hover:text-zinc-200 transition-colors">{subject.name}</h3>
                    <p className="text-xs text-zinc-600 dark:text-zinc-400 group-hover:text-zinc-700 dark:group-hover:text-zinc-300 transition-colors">{subject.description}</p>
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
