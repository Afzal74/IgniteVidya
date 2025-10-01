"use client"

import { useState, useEffect } from "react"
import { ArrowLeft, Rocket, BookOpen, Play, Brain, Target, Star } from "lucide-react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { motion } from "framer-motion"
import { useSoundEffects } from "@/hooks/useSoundEffects"

export default function Grade6Page() {
  const [mounted, setMounted] = useState(false)
  const { playHoverSound, playClickSound } = useSoundEffects()

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
    { title: "Notes", icon: BookOpen, href: "/notes?grade=6", description: "Study materials" },
    { title: "Lectures", icon: Play, href: "/lectures?grade=6", description: "Video lessons" },
    { title: "AI Tutor", icon: Brain, href: "/ai-tutor?grade=6", description: "Smart learning" },
    { title: "Quiz", icon: Target, href: "/quiz?grade=6", description: "Test yourself" },
    { title: "Progress", icon: Star, href: "/dashboard?grade=6", description: "Track learning" }
  ]

  if (!mounted) return null

  return (
    <div className="min-h-screen bg-white dark:bg-black">
      {/* Header */}
      <section className="pt-20 md:pt-24 pb-8 px-2 md:px-4">
        <div className="max-w-6xl mx-auto">
          {/* Back Button */}
          <Link href="/level/higher-primary">
            <Button variant="ghost" className="mb-6 text-zinc-600 dark:text-zinc-400 hover:text-black dark:hover:text-white">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Higher Primary
            </Button>
          </Link>

          {/* Page Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-8 md:mb-12"
          >
            <img 
              src="/6th.png" 
              alt="Class 6th" 
              className="w-36 h-36 md:w-44 md:h-44 lg:w-52 lg:h-52 xl:w-60 xl:h-60 object-contain mx-auto mb-4 drop-shadow-2xl"
            />
            <p className="text-sm md:text-lg text-zinc-600 dark:text-zinc-400 mb-4">
              Explorer • Higher Primary • Begin your STEM adventure
            </p>
            <div className="flex justify-center gap-2">
              <span className="text-xs px-3 py-1 rounded-full bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300">
                6 Subjects
              </span>
              <span className="text-xs px-3 py-1 rounded-full bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300">
                Foundation Level
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
            {subjects.map((subject, index) => {
              const isAvailable = subject.name === 'Mathematics' || subject.name === 'Science' || subject.name === 'English';
              const isComingSoon = subject.name === 'Social Studies' || subject.name === 'Computer Science' || subject.name === 'Environmental Studies';
              
              return (
                <motion.div
                  key={subject.name}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.1 * index }}
                >
                  {isAvailable ? (
                    <Link href={
                      subject.name === 'Mathematics' ? '/grade/6/mathematics' : 
                      subject.name === 'Science' ? '/grade/6/science' : 
                      subject.name === 'English' ? '/grade/6/english' :
                      '#'
                    }>
                      <Card 
                        className="group relative overflow-hidden border-zinc-200 dark:border-zinc-800 hover:border-blue-500 dark:hover:border-blue-400 transition-all duration-500 cursor-pointer h-32 bg-gradient-to-br from-white to-zinc-100 dark:from-zinc-900 dark:to-black shadow-lg hover:shadow-2xl hover:shadow-blue-500/25 transform hover:-translate-y-2 hover:scale-105"
                        onMouseEnter={() => playHoverSound("card")}
                        onClick={() => playClickSound("card")}
                      >
                        {/* Enhanced Shiny Overlay Effect */}
                        <div className="absolute inset-0 bg-gradient-to-br from-transparent via-white/30 to-transparent dark:via-white/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                        
                        {/* Animated Background Pattern */}
                        <div className="absolute inset-0 opacity-5 dark:opacity-10 group-hover:opacity-20 transition-opacity duration-500">
                          <div className="w-full h-full bg-[radial-gradient(circle_at_1px_1px,rgba(59,130,246,0.3)_1px,transparent_0)] dark:bg-[radial-gradient(circle_at_1px_1px,rgba(59,130,246,0.2)_1px,transparent_0)] bg-[length:12px_12px] group-hover:animate-pulse" />
                        </div>

                        {/* Glowing Border Effect */}
                        <div className="absolute inset-0 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-500 bg-gradient-to-r from-blue-500/20 via-transparent to-blue-500/20 blur-sm" />

                        <div className="relative p-4 md:p-6 h-full flex flex-col justify-center">
                          <h3 className="font-bold text-black dark:text-white mb-2 text-lg group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors duration-300">
                            {subject.name}
                          </h3>
                          <p className="text-sm text-zinc-600 dark:text-zinc-400 group-hover:text-zinc-700 dark:group-hover:text-zinc-300 transition-colors duration-300 group-hover:font-medium">
                            {subject.description}
                          </p>
                          <div className="mt-2">
                            <span className="text-xs px-2 py-1 rounded-full bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300 group-hover:bg-green-200 dark:group-hover:bg-green-800 transition-colors duration-300">
                              Available
                            </span>
                          </div>
                        </div>
                      </Card>
                    </Link>
                  ) : (
                    <Card 
                      className="group relative overflow-hidden border-zinc-200 dark:border-zinc-800 hover:border-yellow-500 dark:hover:border-yellow-400 transition-all duration-500 cursor-not-allowed h-32 bg-gradient-to-br from-gray-50 to-gray-100 dark:from-zinc-800 dark:to-zinc-900 shadow-lg hover:shadow-xl opacity-75 hover:opacity-90"
                      onMouseEnter={() => playHoverSound("card")}
                    >
                      {/* Subtle Overlay Effect */}
                      <div className="absolute inset-0 bg-gradient-to-br from-transparent via-yellow/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                      
                      {/* Subtle Pattern */}
                      <div className="absolute inset-0 opacity-5 dark:opacity-10">
                        <div className="w-full h-full bg-[radial-gradient(circle_at_1px_1px,rgba(234,179,8,0.2)_1px,transparent_0)] dark:bg-[radial-gradient(circle_at_1px_1px,rgba(234,179,8,0.1)_1px,transparent_0)] bg-[length:8px_8px]" />
                      </div>

                      <div className="relative p-4 md:p-6 h-full flex flex-col justify-center">
                        <h3 className="font-bold text-gray-600 dark:text-gray-300 mb-2 text-lg group-hover:text-gray-700 dark:group-hover:text-gray-200 transition-colors duration-300">
                          {subject.name}
                        </h3>
                        <p className="text-sm text-gray-500 dark:text-gray-400 group-hover:text-gray-600 dark:group-hover:text-gray-300 transition-colors duration-300">
                          {subject.description}
                        </p>
                        {isComingSoon && (
                          <div className="mt-2">
                            <span className="text-xs px-2 py-1 rounded-full bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300 group-hover:bg-yellow-200 dark:group-hover:bg-yellow-800 transition-colors duration-300">
                              Coming Soon
                            </span>
                          </div>
                        )}
                      </div>
                    </Card>
                  )}
                </motion.div>
              );
            })}
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
                  <Card 
                    className="group relative overflow-hidden border-zinc-200 dark:border-zinc-800 hover:border-black dark:hover:border-white transition-all duration-500 cursor-pointer h-20 bg-gradient-to-br from-white to-zinc-50 dark:from-zinc-900 dark:to-zinc-800 shadow-md hover:shadow-xl transform hover:-translate-y-1 hover:scale-105"
                    onMouseEnter={() => playHoverSound("button")}
                    onClick={() => playClickSound("button")}
                  >
                    {/* Subtle Overlay Effect */}
                    <div className="absolute inset-0 bg-gradient-to-br from-transparent via-white/20 to-transparent dark:via-white/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                    
                    {/* Animated Background Pattern */}
                    <div className="absolute inset-0 opacity-5 dark:opacity-10 group-hover:opacity-15 transition-opacity duration-500">
                      <div className="w-full h-full bg-[radial-gradient(circle_at_1px_1px,rgba(0,0,0,0.1)_1px,transparent_0)] dark:bg-[radial-gradient(circle_at_1px_1px,rgba(255,255,255,0.1)_1px,transparent_0)] bg-[length:8px_8px] group-hover:animate-pulse" />
                    </div>

                    <div className="relative p-3 text-center h-full flex flex-col justify-center">
                      <div className="w-8 h-8 rounded-lg bg-zinc-100 dark:bg-zinc-900 flex items-center justify-center mx-auto mb-1 group-hover:bg-black dark:group-hover:bg-white transition-all duration-300 group-hover:scale-110 group-hover:rotate-3">
                        <item.icon className="h-4 w-4 text-zinc-600 dark:text-zinc-400 group-hover:text-white dark:group-hover:text-black transition-colors duration-300" />
                      </div>
                      <h4 className="font-semibold text-black dark:text-white text-xs group-hover:font-bold transition-all duration-300">
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