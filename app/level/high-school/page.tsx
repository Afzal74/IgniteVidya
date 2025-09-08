"use client"

import { useState, useEffect } from "react"
import { ArrowLeft, Microscope, Atom, Beaker, Target } from "lucide-react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { motion } from "framer-motion"

export default function HighSchoolPage() {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  const grades = [
    {
      grade: "8th",
      subjects: 8,
      theme: "Innovator", 
      description: "Innovate with technology",
      icon: Atom,
      color: "purple",
      href: "/grade/8"
    },
    {
      grade: "9th",
      subjects: 9,
      theme: "Creator",
      description: "Create amazing projects",
      icon: Beaker,
      color: "orange",
      href: "/grade/9"
    },
    {
      grade: "10th",
      subjects: 10,
      theme: "Builder",
      description: "Build your future",
      icon: Target,
      color: "indigo",
      href: "/grade/10"
    }
  ]

  if (!mounted) return null

  return (
    <div className="min-h-screen bg-white dark:bg-black">
      {/* Header */}
      <section className="pt-20 md:pt-24 pb-8 px-2 md:px-4">
        <div className="max-w-6xl mx-auto">
          {/* Back Button */}
          <Link href="/">
            <Button variant="ghost" className="mb-6 text-zinc-600 dark:text-zinc-400 hover:text-black dark:hover:text-white">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Home
            </Button>
          </Link>

          {/* Page Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-8 md:mb-12"
          >
            <div className="w-16 h-16 md:w-20 md:h-20 rounded-xl bg-gradient-to-br from-green-500 to-green-700 dark:from-green-400 dark:to-green-600 flex items-center justify-center mx-auto mb-4 shadow-lg">
              <Microscope className="text-white dark:text-black h-8 w-8 md:h-10 md:w-10" />
            </div>
            <h1 className="text-2xl md:text-4xl font-bold text-black dark:text-white mb-2">
              High School
            </h1>
            <p className="text-sm md:text-lg text-zinc-600 dark:text-zinc-400 mb-4">
              Knowledge Explorer • Classes 8-10 • Explore advanced concepts
            </p>
            <div className="flex justify-center gap-2">
              <span className="text-xs px-3 py-1 rounded-full bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300">
                Class 8th
              </span>
              <span className="text-xs px-3 py-1 rounded-full bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300">
                Class 9th
              </span>
              <span className="text-xs px-3 py-1 rounded-full bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300">
                Class 10th
              </span>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Grade Selection */}
      <section className="py-8 px-2 md:px-4">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-center mb-6 md:mb-8"
          >
            <h2 className="text-lg md:text-2xl font-bold text-black dark:text-white mb-2">
              Select Your Class
            </h2>
            <p className="text-sm md:text-base text-zinc-600 dark:text-zinc-400">
              Choose your class to access grade-specific STEM resources
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
            {grades.map((grade, index) => (
              <motion.div
                key={grade.grade}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.1 * index }}
              >
                <Link href={grade.href}>
                  <Card className="group relative overflow-hidden border-zinc-200 dark:border-zinc-800 hover:border-green-500 dark:hover:border-green-400 transition-all duration-300 cursor-pointer h-32 md:h-40 bg-gradient-to-br from-white to-zinc-100 dark:from-zinc-900 dark:to-black shadow-lg hover:shadow-xl">
                    {/* Shiny Overlay Effect */}
                    <div className="absolute inset-0 bg-gradient-to-br from-transparent via-white/20 to-transparent dark:via-white/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                    
                    {/* Subtle Pattern */}
                    <div className="absolute inset-0 opacity-5 dark:opacity-10">
                      <div className="w-full h-full bg-[radial-gradient(circle_at_1px_1px,rgba(0,0,0,0.1)_1px,transparent_0)] dark:bg-[radial-gradient(circle_at_1px_1px,rgba(255,255,255,0.1)_1px,transparent_0)] bg-[length:8px_8px]" />
                    </div>

                    <div className="relative p-4 md:p-6 text-center h-full flex flex-col justify-center">
                      {/* Hero Badge with Icon */}
                      <div className={`w-10 h-10 md:w-12 md:h-12 rounded-lg bg-gradient-to-br ${
                        grade.color === 'purple' ? 'from-purple-500 to-purple-700 dark:from-purple-400 dark:to-purple-600' :
                        grade.color === 'orange' ? 'from-orange-500 to-orange-700 dark:from-orange-400 dark:to-orange-600' :
                        'from-indigo-500 to-indigo-700 dark:from-indigo-400 dark:to-indigo-600'
                      } flex items-center justify-center mx-auto mb-3 group-hover:scale-110 transition-transform shadow-lg group-hover:shadow-xl`}>
                        <grade.icon className="text-white dark:text-black h-5 w-5 md:h-6 md:w-6" />
                      </div>
                      
                      <h3 className="font-bold text-black dark:text-white mb-2 text-lg md:text-xl group-hover:text-zinc-800 dark:group-hover:text-zinc-200 transition-colors">
                        Class {grade.grade}
                      </h3>
                      
                      <p className="text-sm md:text-base text-zinc-600 dark:text-zinc-400 group-hover:text-zinc-700 dark:group-hover:text-zinc-300 transition-colors mb-1">
                        {grade.subjects} Subjects Available
                      </p>
                      
                      <p className="text-xs md:text-sm text-zinc-500 dark:text-zinc-500 font-medium">
                        {grade.theme} • {grade.description}
                      </p>
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
