"use client"

import { useState, useEffect } from "react"

interface Position {
  x: number
  y: number
}

export function useWidgetPosition(key: string, defaultPosition: Position) {
  const [position, setPosition] = useState<Position>(defaultPosition)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    // Load saved position from localStorage
    const saved = localStorage.getItem(`widget-position-${key}`)
    if (saved) {
      try {
        const savedPosition = JSON.parse(saved)
        setPosition(savedPosition)
      } catch (error) {
        console.log("Failed to parse saved position")
      }
    }
  }, [key])

  const updatePosition = (newPosition: Position) => {
    setPosition(newPosition)
    if (mounted) {
      localStorage.setItem(`widget-position-${key}`, JSON.stringify(newPosition))
    }
  }

  const resetPosition = () => {
    setPosition(defaultPosition)
    localStorage.removeItem(`widget-position-${key}`)
  }

  return {
    position,
    updatePosition,
    resetPosition,
    mounted
  }
}
