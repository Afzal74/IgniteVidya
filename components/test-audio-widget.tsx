"use client"

import { useState, useEffect } from "react"

export default function TestAudioWidget() {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) return null

  return (
    <div 
      style={{
        position: 'fixed',
        top: '100px',
        right: '20px',
        zIndex: 9999,
        background: 'red',
        color: 'white',
        padding: '20px',
        borderRadius: '10px',
        border: '2px solid yellow'
      }}
    >
      🎵 TEST WIDGET - Theme 1 
      <br />
      If you see this, React is working!
    </div>
  )
}
