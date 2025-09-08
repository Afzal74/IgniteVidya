"use client"

import { useState, useEffect } from "react"
import { ArrowLeft, Crown, BookOpen, Play, Calculator, Target, Star, Lightbulb, GraduationCap } from "lucide-react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { motion } from "framer-motion"

export default function Grade12Page() {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  const subjects = [
    { name: "Physics", description: "Electromagnetism, Modern Physics", color: "blue" },
    { name: "Chemistry", description: "Advanced Organic, Physical", color: "green" },
    { name: "Mathematics", description: "Advanced Calculus, Statistics", color: "purple" },
    { name: "Biology", description: "Genetics, Biotechnology, Ecology", color: "emerald" },
    { name: "Computer Science", description: "Advanced Programming, AI/ML", color: "cyan" },
    { name: "English", description: "Advanced Literature, Communication", color: "indigo" },
    { name: "Economics", description: "Development Economics", color: "orange" },
    { name: "Business Studies", description: "Strategic Management", color: "rose" },
    { name: "Accountancy", description: "Advanced Accounting", color: "amber" },
    { name: "Psychology", description: "Applied Psychology", color: "violet" },
    { name: "Political Science", description: "International Relations", color: "teal" },
    { name: "Career Guidance", description: "Future Planning", color: "slate" }
  ]

  const quickAccess = [
    { title: "Notes", icon: BookOpen, href: "/notes?grade=12", description: "Study materials" },
    { title: "Lectures", icon: Play, href: "/lectures?grade=12", description: "Video lessons" },
    { title: "Calculator", icon: Calculator, href: "/calculator?grade=12", description: "CGPA Calculator" },
    { title: "Projects", icon: Lightbulb, href: "/projects?grade=12", description: "Final projects" },
    { title: "Career", icon: GraduationCap, href: "/career?grade=12", description: "Career guidance" }
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
            <div className="w-16 h-16 md:w-20 md:h-20 rounded-xl bg-gradient-to-br from-violet-500 to-violet-700 dark:from-violet-400 dark:to-violet-600 flex items-center justify-center mx-auto mb-4 shadow-lg">
              <Crown className="text-white dark:text-black h-8 w-8 md:h-10 md:w-10" />
            </div>
            <h1 className="text-2xl md:text-4xl font-bold text-black dark:text-white mb-2">Class 12th</h1>
            <p className="text-sm md:text-lg text-zinc-600 dark:text-zinc-400 mb-4">Leader • Higher Secondary • Lead the STEM revolution</p>
            <div className="flex justify-center gap-2">
              <span className="text-xs px-3 py-1 rounded-full bg-violet-100 text-violet-700 dark:bg-violet-900 dark:text-violet-300">12 Subjects</span>
              <span className="text-xs px-3 py-1 rounded-full bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300">Final Year</span>
              <span className="text-xs px-3 py-1 rounded-full bg-gold-100 text-gold-700 dark:bg-gold-900 dark:text-gold-300">Graduate Ready</span>
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
                <Card className="group border-zinc-200 dark:border-zinc-800 hover:border-violet-500 dark:hover:border-violet-400 transition-all duration-300 cursor-pointer h-32 bg-gradient-to-br from-white to-zinc-100 dark:from-zinc-900 dark:to-black shadow-lg hover:shadow-xl">
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

          {/* Special Graduation Section */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6 }} className="mt-12 text-center">
            <div className="bg-gradient-to-r from-violet-50 to-purple-50 dark:from-violet-950 dark:to-purple-950 rounded-xl p-6 md:p-8 border border-violet-200 dark:border-violet-800">
              <GraduationCap className="h-12 w-12 md:h-16 md:w-16 text-violet-600 dark:text-violet-400 mx-auto mb-4" />
              <h3 className="text-xl md:text-2xl font-bold text-black dark:text-white mb-2">
                Final Year Excellence
              </h3>
              <p className="text-sm md:text-base text-zinc-600 dark:text-zinc-400 mb-4 max-w-2xl mx-auto">
                You're in your final year! This is the time to consolidate your learning, focus on your career goals, 
                and prepare for the next phase of your academic journey.
              </p>
              <div className="flex flex-wrap justify-center gap-2 md:gap-3">
                <Link href="/syllabus?grade=12">
                  <Button variant="outline" size="sm" className="rounded-full">
                    Complete Syllabus
                  </Button>
                </Link>
                <Link href="/question-papers?grade=12">
                  <Button variant="outline" size="sm" className="rounded-full">
                    Previous Papers
                  </Button>
                </Link>
                <Link href="/career">
                  <Button variant="default" size="sm" className="rounded-full bg-violet-600 hover:bg-violet-700">
                    Career Guidance
                  </Button>
                </Link>
              </div>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  )
}
