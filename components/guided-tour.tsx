"use client"

import { useState, useEffect, useRef } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { X, ChevronLeft, ChevronRight, Sun, Moon, Search, Users, Star, Navigation, Lightbulb } from "lucide-react"

interface TourStep {
  target: string // CSS selector for the element to highlight
  title: string
  description: string
  position: 'top' | 'bottom' | 'left' | 'right'
  icon?: any
}

interface GuidedTourProps {
  onComplete?: () => void
  onSkip?: () => void
}

export default function GuidedTour({ onComplete, onSkip }: GuidedTourProps) {
  const [currentStep, setCurrentStep] = useState(0)
  const [isActive, setIsActive] = useState(false)
  const [targetElement, setTargetElement] = useState<HTMLElement | null>(null)
  const [overlayPosition, setOverlayPosition] = useState({ x: 0, y: 0, width: 0, height: 0 })

  // Check if tour should be shown
  useEffect(() => {
    const tourCompleted = localStorage.getItem('igniteVidya_guidedTourCompleted')
    if (!tourCompleted) {
      setTimeout(() => setIsActive(true), 2000) // Show after 2 seconds
    }
  }, [])

  // Tour steps that highlight actual page elements
  const tourSteps: TourStep[] = [
    {
      target: '[data-tour="theme-toggle"]',
      title: "Theme Toggle 🌙",
      description: "Switch between dark and light mode for comfortable studying at any time of day.",
      position: 'bottom',
      icon: Sun
    },
    {
      target: '[data-tour="search-bar"]',
      title: "Smart Search 🔍", 
      description: "Search anything across notes, papers, projects, and more. Just type your query here!",
      position: 'bottom',
      icon: Search
    },
    {
      target: '[data-tour="class-section"]',
      title: "Your Class Hub 👥",
      description: "Access your class notes, compete with classmates, and stay updated with your academic progress.",
      position: 'top',
      icon: Users
    },
    {
      target: '[data-tour="features-grid"]',
      title: "Essential Tools 🛠️",
      description: "These are specially made features to make your VTU journey easier - Calculator, Notes, Projects, and more!",
      position: 'top',
      icon: Star
    },
    {
      target: '[data-tour="navigation-menu"]',
      title: "Quick Navigation 📱",
      description: "Access all sections quickly from this menu. Everything you need is just a click away!",
      position: 'left',
      icon: Navigation
    }
  ]

  // Update target element and position when step changes
  useEffect(() => {
    if (!isActive || currentStep >= tourSteps.length) return

    const findAndHighlightElement = () => {
      const element = document.querySelector(tourSteps[currentStep].target) as HTMLElement
      if (element) {
        setTargetElement(element)
        const rect = element.getBoundingClientRect()
        const scrollTop = window.pageYOffset || document.documentElement.scrollTop
        const scrollLeft = window.pageXOffset || document.documentElement.scrollLeft

        setOverlayPosition({
          x: rect.left + scrollLeft,
          y: rect.top + scrollTop,
          width: rect.width,
          height: rect.height
        })

        // Scroll element into view
        element.scrollIntoView({ 
          behavior: 'smooth', 
          block: 'center',
          inline: 'center' 
        })
      }
    }

    // Try multiple times in case elements are still loading
    const attempts = [100, 500, 1000, 2000]
    attempts.forEach(delay => {
      setTimeout(findAndHighlightElement, delay)
    })
  }, [currentStep, isActive, tourSteps])

  const nextStep = () => {
    if (currentStep < tourSteps.length - 1) {
      setCurrentStep(currentStep + 1)
    } else {
      completeTour()
    }
  }

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1)
    }
  }

  const completeTour = () => {
    localStorage.setItem('igniteVidya_guidedTourCompleted', 'true')
    localStorage.setItem('igniteVidya_guidedTourCompletedAt', new Date().toISOString())
    setIsActive(false)
    onComplete?.()
  }

  const skipTour = () => {
    localStorage.setItem('igniteVidya_guidedTourSkipped', 'true')
    localStorage.setItem('igniteVidya_guidedTourSkippedAt', new Date().toISOString())
    setIsActive(false)
    onSkip?.()
  }

  if (!isActive || currentStep >= tourSteps.length) return null

  const currentStepData = tourSteps[currentStep]
  const progress = ((currentStep + 1) / tourSteps.length) * 100

  // Calculate tooltip position
  const getTooltipPosition = () => {
    const tooltipOffset = 20
    const tooltipWidth = 320
    const tooltipHeight = 180

    switch (currentStepData.position) {
      case 'top':
        return {
          left: overlayPosition.x + (overlayPosition.width / 2) - (tooltipWidth / 2),
          top: overlayPosition.y - tooltipHeight - tooltipOffset,
          transform: 'translateY(0)'
        }
      case 'bottom':
        return {
          left: overlayPosition.x + (overlayPosition.width / 2) - (tooltipWidth / 2),
          top: overlayPosition.y + overlayPosition.height + tooltipOffset,
          transform: 'translateY(0)'
        }
      case 'left':
        return {
          left: overlayPosition.x - tooltipWidth - tooltipOffset,
          top: overlayPosition.y + (overlayPosition.height / 2) - (tooltipHeight / 2),
          transform: 'translateY(0)'
        }
      case 'right':
        return {
          left: overlayPosition.x + overlayPosition.width + tooltipOffset,
          top: overlayPosition.y + (overlayPosition.height / 2) - (tooltipHeight / 2),
          transform: 'translateY(0)'
        }
      default:
        return {
          left: overlayPosition.x + (overlayPosition.width / 2) - (tooltipWidth / 2),
          top: overlayPosition.y - tooltipHeight - tooltipOffset,
          transform: 'translateY(0)'
        }
    }
  }

  const tooltipStyle = getTooltipPosition()

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 pointer-events-none">
        {/* Dark overlay with hole for highlighted element */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="absolute inset-0 bg-black/60"
          style={{
            clipPath: `polygon(0% 0%, 0% 100%, ${overlayPosition.x}px 100%, ${overlayPosition.x}px ${overlayPosition.y}px, ${overlayPosition.x + overlayPosition.width}px ${overlayPosition.y}px, ${overlayPosition.x + overlayPosition.width}px ${overlayPosition.y + overlayPosition.height}px, ${overlayPosition.x}px ${overlayPosition.y + overlayPosition.height}px, ${overlayPosition.x}px 100%, 100% 100%, 100% 0%)`
          }}
        />

        {/* Highlighted border around target element */}
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.8 }}
          className="absolute border-4 border-cyan-400 rounded-lg shadow-lg shadow-cyan-400/50"
          style={{
            left: overlayPosition.x - 4,
            top: overlayPosition.y - 4,
            width: overlayPosition.width + 8,
            height: overlayPosition.height + 8,
            boxShadow: '0 0 0 9999px rgba(0, 0, 0, 0.6), 0 0 20px rgba(34, 211, 238, 0.5)'
          }}
        />

        {/* Pulsing dot indicator */}
        <motion.div
          className="absolute w-4 h-4 bg-cyan-400 rounded-full"
          style={{
            left: overlayPosition.x + overlayPosition.width / 2 - 8,
            top: overlayPosition.y + overlayPosition.height / 2 - 8
          }}
          animate={{ scale: [1, 1.5, 1], opacity: [1, 0.5, 1] }}
          transition={{ duration: 2, repeat: Infinity }}
        />

        {/* Tooltip */}
        <motion.div
          initial={{ opacity: 0, scale: 0.8, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.8, y: 20 }}
          className="absolute pointer-events-auto bg-white dark:bg-gray-900 rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-700 p-6 w-80"
          style={tooltipStyle}
        >
          {/* Progress bar */}
          <div className="mb-4">
            <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400 mb-2">
              <span>Step {currentStep + 1} of {tourSteps.length}</span>
              <span>{Math.round(progress)}%</span>
            </div>
            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-1">
              <motion.div
                className="bg-cyan-500 h-full rounded-full"
                initial={{ width: 0 }}
                animate={{ width: `${progress}%` }}
                transition={{ duration: 0.5 }}
              />
            </div>
          </div>

          {/* Content */}
          <div className="text-center mb-6">
            {currentStepData.icon && (
              <div className="flex justify-center mb-3">
                <div className="bg-cyan-100 dark:bg-cyan-900/30 p-3 rounded-xl">
                  <currentStepData.icon className="h-6 w-6 text-cyan-600 dark:text-cyan-400" />
                </div>
              </div>
            )}
            
            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">
              {currentStepData.title}
            </h3>
            
            <p className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed">
              {currentStepData.description}
            </p>
          </div>

          {/* Controls */}
          <div className="flex items-center justify-between">
            <button
              onClick={skipTour}
              className="text-sm text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 transition-colors"
            >
              Skip tour
            </button>

            <div className="flex items-center space-x-2">
              <button
                onClick={prevStep}
                disabled={currentStep === 0}
                className="flex items-center space-x-1 px-3 py-1.5 rounded-lg bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed text-sm transition-colors"
              >
                <ChevronLeft className="h-4 w-4" />
                <span>Back</span>
              </button>

              <button
                onClick={nextStep}
                className="flex items-center space-x-1 px-4 py-1.5 rounded-lg bg-cyan-500 hover:bg-cyan-600 text-white text-sm transition-colors"
              >
                <span>{currentStep === tourSteps.length - 1 ? 'Finish' : 'Next'}</span>
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </div>

          {/* Close button */}
          <button
            onClick={skipTour}
            className="absolute top-4 right-4 p-1 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
          >
            <X className="h-4 w-4 text-gray-400" />
          </button>
        </motion.div>
      </div>
    </AnimatePresence>
  )
}

// Utility functions
export const shouldShowGuidedTour = (): boolean => {
  if (typeof window === 'undefined') return false
  
  const completed = localStorage.getItem('igniteVidya_guidedTourCompleted')
  const skipped = localStorage.getItem('igniteVidya_guidedTourSkipped')
  
  return !completed && !skipped
}

export const resetGuidedTour = (): void => {
  if (typeof window === 'undefined') return
  
  localStorage.removeItem('igniteVidya_guidedTourCompleted')
  localStorage.removeItem('igniteVidya_guidedTourSkipped')
  localStorage.removeItem('igniteVidya_guidedTourCompletedAt')
  localStorage.removeItem('igniteVidya_guidedTourSkippedAt')
}
