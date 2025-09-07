"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { 
  ChevronLeft, 
  ChevronRight, 
  X, 
  BookOpen, 
  Calculator, 
  Lightbulb, 
  MessageCircle,
  Search,
  FileText,
  Zap,
  Star,
  CheckCircle
} from "lucide-react"

interface TutorialStep {
  id: number
  title: string
  description: string
  icon: any
  image?: string
  tips?: string[]
}

interface AppTutorialProps {
  onComplete?: () => void
  onSkip?: () => void
}

export default function AppTutorial({ onComplete, onSkip }: AppTutorialProps) {
  const [currentStep, setCurrentStep] = useState(0)
  const [isVisible, setIsVisible] = useState(false)

  // Check if tutorial has been completed before
  useEffect(() => {
    const tutorialCompleted = localStorage.getItem('igniteVidya_tutorialCompleted')
    if (!tutorialCompleted) {
      setIsVisible(true)
    }
  }, [])

  const tutorialSteps: TutorialStep[] = [
    {
      id: 1,
      title: "Welcome to IgniteVidya! 🎉",
      description: "Your ultimate academic companion for VTU students. Discover study materials, calculate CGPA, explore projects, and chat with AI tutors.",
      icon: Star,
      tips: [
        "Everything you need for VTU studies in one place",
        "Smart search across all content",
        "Mobile-friendly design for study on-the-go"
      ]
    },
    {
      id: 2,
      title: "Study Materials 📚",
      description: "Access comprehensive notes, question papers, and study resources organized by semester and subject.",
      icon: BookOpen,
      tips: [
        "Browse notes by semester and subject",
        "Download previous year question papers",
        "Filter content by branch and topic",
        "Bookmark important materials"
      ]
    },
    {
      id: 3,
      title: "CGPA Calculator 🧮",
      description: "Calculate your SGPA and CGPA with VTU's official grading system. Track your academic progress easily.",
      icon: Calculator,
      tips: [
        "Add subjects with credits and grades",
        "Automatic SGPA calculation",
        "View semester-wise breakdown",
        "Export results as PDF"
      ]
    },
    {
      id: 4,
      title: "Project Ideas 💡",
      description: "Explore innovative engineering project ideas across different domains and difficulty levels.",
      icon: Lightbulb,
      tips: [
        "Browse projects by engineering branch",
        "Filter by difficulty level",
        "Get implementation guidance",
        "Save favorite projects"
      ]
    },
    {
      id: 5,
      title: "AI Chat Support 🤖",
      description: "Get instant help with your studies! Chat with VTU Companion for academic queries or with Afzal for personalized guidance.",
      icon: MessageCircle,
      tips: [
        "Ask questions about VTU syllabus",
        "Get study tips and strategies",
        "Clarify doubts instantly",
        "Available 24/7 for support"
      ]
    },
    {
      id: 6,
      title: "Smart Search 🔍",
      description: "Find exactly what you need with our intelligent search feature that works across all sections.",
      icon: Search,
      tips: [
        "Search across notes, papers, and projects",
        "Use keywords or topics",
        "Filter results by type",
        "Quick access to relevant content"
      ]
    },
    {
      id: 7,
      title: "Ready to Start! 🚀",
      description: "You're all set to excel in your VTU journey! Remember, learning is a continuous process, and we're here to support you every step of the way.",
      icon: CheckCircle,
      tips: [
        "Start with your current semester materials",
        "Use the calculator to track your performance",
        "Explore project ideas for upcoming assignments",
        "Don't hesitate to ask the AI for help!"
      ]
    }
  ]

  const nextStep = () => {
    if (currentStep < tutorialSteps.length - 1) {
      setCurrentStep(currentStep + 1)
    } else {
      completeTutorial()
    }
  }

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1)
    }
  }

  const completeTutorial = () => {
    localStorage.setItem('igniteVidya_tutorialCompleted', 'true')
    localStorage.setItem('igniteVidya_tutorialCompletedAt', new Date().toISOString())
    setIsVisible(false)
    onComplete?.()
  }

  const skipTutorial = () => {
    localStorage.setItem('igniteVidya_tutorialSkipped', 'true')
    localStorage.setItem('igniteVidya_tutorialSkippedAt', new Date().toISOString())
    setIsVisible(false)
    onSkip?.()
  }

  if (!isVisible) return null

  const currentStepData = tutorialSteps[currentStep]
  const progress = ((currentStep + 1) / tutorialSteps.length) * 100

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
      <motion.div
        className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-2xl shadow-2xl border border-gray-700/50 w-full max-w-2xl max-h-[90vh] overflow-hidden"
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        {/* Header */}
        <div className="relative bg-gradient-to-r from-cyan-600 to-purple-600 px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="bg-white/20 p-2 rounded-lg">
                <Zap className="h-6 w-6 text-white" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-white">App Tutorial</h2>
                <p className="text-cyan-100 text-sm">Step {currentStep + 1} of {tutorialSteps.length}</p>
              </div>
            </div>
            <button
              onClick={skipTutorial}
              className="text-white/80 hover:text-white transition-colors p-2 hover:bg-white/10 rounded-lg"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
          
          {/* Progress Bar */}
          <div className="mt-4">
            <div className="flex justify-between text-xs text-cyan-100 mb-1">
              <span>Progress</span>
              <span>{Math.round(progress)}%</span>
            </div>
            <div className="w-full bg-white/20 rounded-full h-2">
              <motion.div
                className="bg-white h-full rounded-full"
                initial={{ width: 0 }}
                animate={{ width: `${progress}%` }}
                transition={{ duration: 0.5 }}
              />
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-96">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentStep}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
              className="text-center"
            >
              {/* Icon */}
              <div className="flex justify-center mb-6">
                <div className="bg-gradient-to-r from-cyan-500 to-purple-500 p-4 rounded-2xl">
                  <currentStepData.icon className="h-12 w-12 text-white" />
                </div>
              </div>

              {/* Title */}
              <h3 className="text-2xl font-bold text-white mb-4">
                {currentStepData.title}
              </h3>

              {/* Description */}
              <p className="text-gray-300 text-lg leading-relaxed mb-6">
                {currentStepData.description}
              </p>

              {/* Tips */}
              {currentStepData.tips && (
                <div className="bg-gray-800/50 rounded-xl p-4 mb-6">
                  <h4 className="text-cyan-400 font-semibold mb-3 flex items-center">
                    <FileText className="h-4 w-4 mr-2" />
                    Key Features:
                  </h4>
                  <ul className="space-y-2 text-left">
                    {currentStepData.tips.map((tip, index) => (
                      <motion.li
                        key={index}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.1 }}
                        className="flex items-start space-x-2 text-gray-300"
                      >
                        <div className="bg-cyan-500/20 p-1 rounded-full mt-0.5">
                          <div className="w-2 h-2 bg-cyan-400 rounded-full" />
                        </div>
                        <span className="text-sm">{tip}</span>
                      </motion.li>
                    ))}
                  </ul>
                </div>
              )}
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Footer */}
        <div className="bg-gray-800/50 px-6 py-4 border-t border-gray-700/50">
          <div className="flex items-center justify-between">
            <button
              onClick={prevStep}
              disabled={currentStep === 0}
              className="flex items-center space-x-2 px-4 py-2 rounded-lg bg-gray-700 hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed text-white transition-colors"
            >
              <ChevronLeft className="h-4 w-4" />
              <span>Previous</span>
            </button>

            <div className="flex space-x-2">
              {tutorialSteps.map((_, index) => (
                <div
                  key={index}
                  className={`w-2 h-2 rounded-full transition-colors ${
                    index <= currentStep ? 'bg-cyan-400' : 'bg-gray-600'
                  }`}
                />
              ))}
            </div>

            <button
              onClick={nextStep}
              className="flex items-center space-x-2 px-4 py-2 rounded-lg bg-gradient-to-r from-cyan-500 to-purple-500 hover:from-cyan-600 hover:to-purple-600 text-white transition-all duration-200 hover:scale-105"
            >
              <span>{currentStep === tutorialSteps.length - 1 ? 'Get Started' : 'Next'}</span>
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  )
}

// Utility function to check if tutorial should be shown
export const shouldShowTutorial = (): boolean => {
  if (typeof window === 'undefined') return false
  
  const completed = localStorage.getItem('igniteVidya_tutorialCompleted')
  const skipped = localStorage.getItem('igniteVidya_tutorialSkipped')
  
  return !completed && !skipped
}

// Utility function to reset tutorial (for testing or re-showing)
export const resetTutorial = (): void => {
  if (typeof window === 'undefined') return
  
  localStorage.removeItem('igniteVidya_tutorialCompleted')
  localStorage.removeItem('igniteVidya_tutorialSkipped')
  localStorage.removeItem('igniteVidya_tutorialCompletedAt')
  localStorage.removeItem('igniteVidya_tutorialSkippedAt')
}
