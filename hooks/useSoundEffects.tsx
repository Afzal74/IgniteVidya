"use client"

import { useCallback, useRef, useState, useEffect } from 'react'

interface SoundEffectOptions {
  volume?: number
  playbackRate?: number
}

export const useSoundEffects = () => {
  const [soundEnabled, setSoundEnabled] = useState(true)
  const audioContextRef = useRef<AudioContext | null>(null)

  // Initialize AudioContext
  useEffect(() => {
    if (typeof window !== 'undefined') {
      try {
        audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)()
      } catch (error) {
        console.warn('Web Audio API not supported:', error)
      }
    }
  }, [])

  // Create different sound types using Web Audio API
  const createTone = useCallback((frequency: number, duration: number, type: OscillatorType = 'sine', options: SoundEffectOptions = {}) => {
    if (!soundEnabled || !audioContextRef.current) return

    const { volume = 0.1, playbackRate = 1 } = options
    
    try {
      const oscillator = audioContextRef.current.createOscillator()
      const gainNode = audioContextRef.current.createGain()
      
      oscillator.connect(gainNode)
      gainNode.connect(audioContextRef.current.destination)
      
      oscillator.frequency.value = frequency * playbackRate
      oscillator.type = type
      
      gainNode.gain.setValueAtTime(0, audioContextRef.current.currentTime)
      gainNode.gain.linearRampToValueAtTime(volume, audioContextRef.current.currentTime + 0.01)
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContextRef.current.currentTime + duration)
      
      oscillator.start(audioContextRef.current.currentTime)
      oscillator.stop(audioContextRef.current.currentTime + duration)
    } catch (error) {
      console.warn('Error playing sound:', error)
    }
  }, [soundEnabled])

  // Different sound effects for various UI interactions
  const playHoverSound = useCallback((type: 'card' | 'button' | 'link' = 'button') => {
    const sounds = {
      card: { frequency: 800, duration: 0.1, type: 'sine' as const, volume: 0.05 },
      button: { frequency: 1000, duration: 0.08, type: 'triangle' as const, volume: 0.06 },
      link: { frequency: 600, duration: 0.06, type: 'sine' as const, volume: 0.04 }
    }
    
    const sound = sounds[type]
    createTone(sound.frequency, sound.duration, sound.type, { volume: sound.volume })
  }, [createTone])

  const playClickSound = useCallback((type: 'primary' | 'secondary' | 'card' | 'navigation' = 'primary') => {
    const sounds = {
      primary: { frequency: 1200, duration: 0.15, type: 'square' as const, volume: 0.08 },
      secondary: { frequency: 900, duration: 0.12, type: 'triangle' as const, volume: 0.06 },
      card: { frequency: 700, duration: 0.18, type: 'sine' as const, volume: 0.07 },
      navigation: { frequency: 1400, duration: 0.1, type: 'sawtooth' as const, volume: 0.05 }
    }
    
    const sound = sounds[type]
    createTone(sound.frequency, sound.duration, sound.type, { volume: sound.volume })
  }, [createTone])

  const playSuccessSound = useCallback(() => {
    // Play a pleasant success chord
    createTone(523.25, 0.15, 'sine', { volume: 0.06 }) // C5
    setTimeout(() => createTone(659.25, 0.15, 'sine', { volume: 0.06 }), 50) // E5
    setTimeout(() => createTone(783.99, 0.2, 'sine', { volume: 0.06 }), 100) // G5
  }, [createTone])

  const playErrorSound = useCallback(() => {
    // Play a subtle error sound
    createTone(220, 0.1, 'sawtooth', { volume: 0.08 })
    setTimeout(() => createTone(196, 0.15, 'sawtooth', { volume: 0.06 }), 100)
  }, [createTone])

  const playNotificationSound = useCallback(() => {
    // Play a gentle notification chime
    createTone(880, 0.1, 'sine', { volume: 0.05 })
    setTimeout(() => createTone(1174.66, 0.15, 'sine', { volume: 0.04 }), 80)
  }, [createTone])

  const playSearchSound = useCallback(() => {
    // Play a quick search typing sound
    createTone(1500, 0.03, 'square', { volume: 0.03 })
  }, [createTone])

  const playTypingSound = useCallback(() => {
    // Random typing sound
    const frequencies = [1400, 1500, 1600, 1700, 1800]
    const randomFreq = frequencies[Math.floor(Math.random() * frequencies.length)]
    createTone(randomFreq, 0.02, 'square', { volume: 0.02 })
  }, [createTone])

  // Toggle sound on/off
  const toggleSound = useCallback(() => {
    setSoundEnabled(prev => !prev)
    if (!soundEnabled) {
      playSuccessSound() // Play a sound when enabling
    }
  }, [soundEnabled, playSuccessSound])

  return {
    soundEnabled,
    toggleSound,
    playHoverSound,
    playClickSound,
    playSuccessSound,
    playErrorSound,
    playNotificationSound,
    playSearchSound,
    playTypingSound
  }
}
