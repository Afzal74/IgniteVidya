"use client";

import { useState, useEffect, useRef } from "react";
import {
  ArrowLeft,
  Star,
  Trophy,
  RotateCcw,
  Play,
  Sparkles,
  Zap,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";

type NumberAsteroid = {
  id: string;
  value: number;
  x: number;
  y: number;
  xPercent?: number;
  yPercent?: number;
  isShot: boolean;
  isCorrect: boolean | null;
};

type GameState = {
  score: number;
  level: number;
  lives: number;
  isPlaying: boolean;
  gameOver: boolean;
  feedback: string;
  streak: number;
  combo: number;
  targetSequence: number[];
  currentSequenceIndex: number;
  sequenceBucket: { value: number; isCorrect: boolean }[];
  isAnswered: boolean;
  gameComplete: boolean;
  currentMode: "ascending" | "descending";
  completedLevels: number;
  showDescendingIntro: boolean;
};

interface RocketAscendingGameProps {
  onBackToMainGame?: () => void;
}

export default function RocketAscendingGame({
  onBackToMainGame,
}: RocketAscendingGameProps = {}) {
  const audioContext = useRef<AudioContext | null>(null);
  const rocketRef = useRef<HTMLDivElement>(null);
  const laserSoundRef = useRef<{
    oscillator: OscillatorNode | null;
    gainNode: GainNode | null;
    filter: BiquadFilterNode | null;
  }>({ oscillator: null, gainNode: null, filter: null });

  const [gameState, setGameState] = useState<GameState>({
    score: 0,
    level: 1,
    lives: 3,
    isPlaying: false,
    gameOver: false,
    feedback: "",
    streak: 0,
    combo: 0,
    targetSequence: [],
    currentSequenceIndex: 0,
    sequenceBucket: [],
    isAnswered: false,
    gameComplete: false,
    currentMode: "ascending",
    completedLevels: 0,
    showDescendingIntro: false,
  });

  const [asteroids, setAsteroids] = useState<NumberAsteroid[]>([]);
  const [particles, setParticles] = useState<
    Array<{
      id: string;
      x: number;
      y: number;
      vx: number;
      vy: number;
      life: number;
      maxLife: number;
      color: string;
      size: number;
    }>
  >([]);
  const [targetedAsteroid, setTargetedAsteroid] = useState<string | null>(null);
  const [rocketPosition, setRocketPosition] = useState({ x: 0, y: 0 });
  const [rocketRotation, setRocketRotation] = useState(-90);
  
  // Bullet animation state
  const [bullets, setBullets] = useState<
    Array<{
      id: string;
      startXPercent: number;
      startYPercent: number;
      endXPercent: number;
      endYPercent: number;
      asteroidId: string;
      progress: number;
    }>
  >([]);
  const gameAreaRef = useRef<HTMLDivElement>(null);

  // Generate random numbers for asteroids
  const generateAsteroids = () => {
    const count = 5; // Always generate exactly 5 asteroids
    const numbers = [];
    const usedNumbers = new Set();

    // Include the number 14 in the set
    numbers.push(14);
    usedNumbers.add(14);

    // Generate unique random numbers (avoiding 14 since it's already added)
    while (numbers.length < count) {
      const num = Math.floor(Math.random() * 20) + 1; // Range 1-20
      if (!usedNumbers.has(num)) {
        usedNumbers.add(num);
        numbers.push(num);
      }
    }

    // Create target sequence based on current mode
    let targetSequence;
    if (gameState.currentMode === "ascending") {
      targetSequence = [...numbers].sort((a, b) => a - b);
    } else {
      targetSequence = [...numbers].sort((a, b) => b - a); // descending
    }

    // Simple grid positioning - use percentages that work for any container size
    // Layout: 3 asteroids on top row, 2 on bottom row
    // Leave right 20% for rocket
    const positions = [
      { col: 0, row: 0 }, // Top left
      { col: 1, row: 0 }, // Top center
      { col: 2, row: 0 }, // Top right
      { col: 0.5, row: 1 }, // Bottom left-center
      { col: 1.5, row: 1 }, // Bottom right-center
    ];

    const newAsteroids: NumberAsteroid[] = numbers.map((num, index) => {
      const pos = positions[index];

      // Calculate percentage-based positions
      // X: 5% to 65% (leaving 35% for rocket area on right)
      // Y: 10% to 80%
      const xPercent = 5 + (pos.col / 3) * 60; // 5% to 65%
      const yPercent = 15 + (pos.row / 2) * 55; // 15% to 70%

      // Add small random offset (±5%)
      const randomX = (Math.random() - 0.5) * 8;
      const randomY = (Math.random() - 0.5) * 10;

      return {
        id: `asteroid-${Date.now()}-${index}`,
        value: num,
        xPercent: Math.max(5, Math.min(60, xPercent + randomX)),
        yPercent: Math.max(10, Math.min(75, yPercent + randomY)),
        // Keep x, y for backward compatibility but they'll be overridden by percent
        x: 0,
        y: 0,
        isShot: false,
        isCorrect: null,
      };
    });

    setAsteroids(newAsteroids);
    setGameState((prev) => ({
      ...prev,
      targetSequence,
      currentSequenceIndex: 0,
      sequenceBucket: [],
      isAnswered: false,
      feedback: `Shoot asteroids in ${
        gameState.currentMode
      } order: ${targetSequence.join(" → ")}`,
    }));
  };

  // Initialize game
  useEffect(() => {
    if (gameState.isPlaying && !gameState.isAnswered) {
      generateAsteroids();
    }
  }, [gameState.isPlaying, gameState.isAnswered, gameState.level]);

  // Update rocket position
  useEffect(() => {
    if (rocketRef.current) {
      const rect = rocketRef.current.getBoundingClientRect();
      const gameArea = rocketRef.current.closest(".relative");
      if (gameArea) {
        const gameRect = gameArea.getBoundingClientRect();
        setRocketPosition({
          x: rect.left + rect.width / 2 - gameRect.left,
          y: rect.top + rect.height / 2 - gameRect.top,
        });
      }
    }
  }, [gameState.isPlaying]);

  // Update rocket rotation based on targeted asteroid - simplified for percentage positioning
  useEffect(() => {
    if (!targetedAsteroid) {
      setRocketRotation(-90); // Default left-facing position
    }
    // Note: Rotation calculation disabled for percentage-based positioning
    // The rocket will stay in default position
  }, [targetedAsteroid]);

  // Particle animation
  useEffect(() => {
    const interval = setInterval(() => {
      setParticles((prev) =>
        prev
          .map((p) => ({
            ...p,
            x: p.x + p.vx,
            y: p.y + p.vy,
            vy: p.vy + 0.3,
            life: p.life - 1,
          }))
          .filter((p) => p.life > 0)
      );
    }, 16);

    return () => {
      clearInterval(interval);
      // Cleanup laser sound on unmount
      stopLaserTargetingSound();
    };
  }, []);

  // Continuous laser targeting sound
  const startLaserTargetingSound = () => {
    try {
      if (!audioContext.current) {
        audioContext.current = new (window.AudioContext ||
          (window as any).webkitAudioContext)();
      }

      // Stop any existing laser sound
      stopLaserTargetingSound();

      const ctx = audioContext.current;
      const oscillator = ctx.createOscillator();
      const gainNode = ctx.createGain();
      const filter = ctx.createBiquadFilter();

      // Connect audio graph
      oscillator.connect(filter);
      filter.connect(gainNode);
      gainNode.connect(ctx.destination);

      // Configure for continuous laser targeting sound
      oscillator.type = "sawtooth";
      oscillator.frequency.setValueAtTime(400, ctx.currentTime);

      // Add subtle frequency modulation for that "charging" effect
      const lfo = ctx.createOscillator();
      const lfoGain = ctx.createGain();
      lfo.connect(lfoGain);
      lfoGain.connect(oscillator.frequency);
      lfo.type = "sine";
      lfo.frequency.setValueAtTime(8, ctx.currentTime); // 8Hz modulation
      lfoGain.gain.setValueAtTime(20, ctx.currentTime); // Subtle frequency wobble

      // Configure filter for sci-fi effect
      filter.type = "bandpass";
      filter.frequency.setValueAtTime(800, ctx.currentTime);
      filter.Q.setValueAtTime(3, ctx.currentTime);

      // Set volume - quiet but audible
      gainNode.gain.setValueAtTime(0, ctx.currentTime);
      gainNode.gain.linearRampToValueAtTime(0.03, ctx.currentTime + 0.1); // Fade in

      // Start the sounds
      oscillator.start(ctx.currentTime);
      lfo.start(ctx.currentTime);

      // Store references for cleanup
      laserSoundRef.current = { oscillator, gainNode, filter };
    } catch (error) {
      console.log("Laser targeting sound error:", error);
    }
  };

  const stopLaserTargetingSound = () => {
    try {
      if (laserSoundRef.current.oscillator && laserSoundRef.current.gainNode) {
        const { oscillator, gainNode } = laserSoundRef.current;

        // Fade out quickly
        gainNode.gain.linearRampToValueAtTime(
          0,
          audioContext.current!.currentTime + 0.05
        );

        // Stop after fade out
        setTimeout(() => {
          try {
            oscillator.stop();
          } catch (e) {
            // Oscillator might already be stopped
          }
        }, 60);

        // Clear references
        laserSoundRef.current = {
          oscillator: null,
          gainNode: null,
          filter: null,
        };
      }
    } catch (error) {
      console.log("Stop laser targeting sound error:", error);
    }
  };

  // Sound system
  const playSound = (
    type: "laser" | "correct" | "wrong" | "explosion" | "victory",
    pitch = 1
  ) => {
    try {
      if (!audioContext.current) {
        audioContext.current = new (window.AudioContext ||
          (window as any).webkitAudioContext)();
      }

      const ctx = audioContext.current;
      const oscillator = ctx.createOscillator();
      const gainNode = ctx.createGain();

      oscillator.connect(gainNode);
      gainNode.connect(ctx.destination);

      if (type === "laser") {
        // Create a more complex laser sound with multiple oscillators
        const oscillator2 = ctx.createOscillator();
        const oscillator3 = ctx.createOscillator();
        const gainNode2 = ctx.createGain();
        const gainNode3 = ctx.createGain();
        const filter = ctx.createBiquadFilter();

        // Connect the audio graph
        oscillator.connect(gainNode);
        oscillator2.connect(gainNode2);
        oscillator3.connect(gainNode3);
        gainNode.connect(filter);
        gainNode2.connect(filter);
        gainNode3.connect(filter);
        filter.connect(ctx.destination);

        // Configure filter for that sci-fi laser sound
        filter.type = "lowpass";
        filter.frequency.setValueAtTime(2000, ctx.currentTime);
        filter.frequency.exponentialRampToValueAtTime(
          500,
          ctx.currentTime + 0.15
        );
        filter.Q.setValueAtTime(5, ctx.currentTime);

        // Main laser beam sound
        oscillator.type = "sawtooth";
        oscillator.frequency.setValueAtTime(1200 * pitch, ctx.currentTime);
        oscillator.frequency.exponentialRampToValueAtTime(
          300 * pitch,
          ctx.currentTime + 0.15
        );
        gainNode.gain.setValueAtTime(0.08, ctx.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(
          0.001,
          ctx.currentTime + 0.15
        );

        // High frequency component for that "zap" sound
        oscillator2.type = "square";
        oscillator2.frequency.setValueAtTime(2400 * pitch, ctx.currentTime);
        oscillator2.frequency.exponentialRampToValueAtTime(
          600 * pitch,
          ctx.currentTime + 0.1
        );
        gainNode2.gain.setValueAtTime(0.04, ctx.currentTime);
        gainNode2.gain.exponentialRampToValueAtTime(
          0.001,
          ctx.currentTime + 0.1
        );

        // Low frequency rumble for power
        oscillator3.type = "triangle";
        oscillator3.frequency.setValueAtTime(150 * pitch, ctx.currentTime);
        oscillator3.frequency.exponentialRampToValueAtTime(
          80 * pitch,
          ctx.currentTime + 0.12
        );
        gainNode3.gain.setValueAtTime(0.06, ctx.currentTime);
        gainNode3.gain.exponentialRampToValueAtTime(
          0.001,
          ctx.currentTime + 0.12
        );

        // Start all oscillators
        oscillator.start(ctx.currentTime);
        oscillator2.start(ctx.currentTime);
        oscillator3.start(ctx.currentTime + 0.02); // Slight delay for the rumble

        // Stop all oscillators
        oscillator.stop(ctx.currentTime + 0.15);
        oscillator2.stop(ctx.currentTime + 0.1);
        oscillator3.stop(ctx.currentTime + 0.12);
      } else if (type === "explosion") {
        // Create a more realistic explosion sound with noise and multiple components
        const oscillator2 = ctx.createOscillator();
        const oscillator3 = ctx.createOscillator();
        const gainNode2 = ctx.createGain();
        const gainNode3 = ctx.createGain();
        const filter = ctx.createBiquadFilter();

        // Connect audio graph
        oscillator.connect(gainNode);
        oscillator2.connect(gainNode2);
        oscillator3.connect(gainNode3);
        gainNode.connect(filter);
        gainNode2.connect(filter);
        gainNode3.connect(filter);
        filter.connect(ctx.destination);

        // Configure filter for explosion
        filter.type = "highpass";
        filter.frequency.setValueAtTime(50, ctx.currentTime);
        filter.Q.setValueAtTime(0.5, ctx.currentTime);

        // Low rumble for the explosion base
        oscillator.type = "sawtooth";
        oscillator.frequency.setValueAtTime(60, ctx.currentTime);
        oscillator.frequency.exponentialRampToValueAtTime(
          30,
          ctx.currentTime + 0.4
        );
        gainNode.gain.setValueAtTime(0.15, ctx.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(
          0.001,
          ctx.currentTime + 0.4
        );

        // Mid-range crack sound
        oscillator2.type = "square";
        oscillator2.frequency.setValueAtTime(200, ctx.currentTime);
        oscillator2.frequency.exponentialRampToValueAtTime(
          80,
          ctx.currentTime + 0.2
        );
        gainNode2.gain.setValueAtTime(0.1, ctx.currentTime);
        gainNode2.gain.exponentialRampToValueAtTime(
          0.001,
          ctx.currentTime + 0.2
        );

        // High frequency sizzle
        oscillator3.type = "sawtooth";
        oscillator3.frequency.setValueAtTime(800, ctx.currentTime);
        oscillator3.frequency.exponentialRampToValueAtTime(
          200,
          ctx.currentTime + 0.15
        );
        gainNode3.gain.setValueAtTime(0.08, ctx.currentTime);
        gainNode3.gain.exponentialRampToValueAtTime(
          0.001,
          ctx.currentTime + 0.15
        );

        // Start all oscillators
        oscillator.start(ctx.currentTime);
        oscillator2.start(ctx.currentTime);
        oscillator3.start(ctx.currentTime + 0.01);

        // Stop all oscillators
        oscillator.stop(ctx.currentTime + 0.4);
        oscillator2.stop(ctx.currentTime + 0.2);
        oscillator3.stop(ctx.currentTime + 0.15);
      } else if (type === "correct") {
        oscillator.type = "sine";
        oscillator.frequency.setValueAtTime(523.25 * pitch, ctx.currentTime);
        oscillator.frequency.setValueAtTime(
          659.25 * pitch,
          ctx.currentTime + 0.1
        );
        gainNode.gain.setValueAtTime(0.1, ctx.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(
          0.001,
          ctx.currentTime + 0.3
        );
        oscillator.start(ctx.currentTime);
        oscillator.stop(ctx.currentTime + 0.3);
      } else if (type === "wrong") {
        oscillator.type = "sine";
        oscillator.frequency.setValueAtTime(220, ctx.currentTime);
        oscillator.frequency.exponentialRampToValueAtTime(
          110,
          ctx.currentTime + 0.3
        );
        gainNode.gain.setValueAtTime(0.05, ctx.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(
          0.001,
          ctx.currentTime + 0.3
        );
        oscillator.start(ctx.currentTime);
        oscillator.stop(ctx.currentTime + 0.3);
      } else if (type === "victory") {
        // Create an epic victory fanfare with multiple layers
        const oscillator2 = ctx.createOscillator();
        const oscillator3 = ctx.createOscillator();
        const oscillator4 = ctx.createOscillator();
        const gainNode2 = ctx.createGain();
        const gainNode3 = ctx.createGain();
        const gainNode4 = ctx.createGain();
        const filter = ctx.createBiquadFilter();

        // Connect audio graph
        oscillator.connect(gainNode);
        oscillator2.connect(gainNode2);
        oscillator3.connect(gainNode3);
        oscillator4.connect(gainNode4);
        gainNode.connect(filter);
        gainNode2.connect(filter);
        gainNode3.connect(filter);
        gainNode4.connect(filter);
        filter.connect(ctx.destination);

        // Configure filter for bright, celebratory sound
        filter.type = "highpass";
        filter.frequency.setValueAtTime(100, ctx.currentTime);
        filter.Q.setValueAtTime(1, ctx.currentTime);

        // Main triumphant melody - ascending major scale
        oscillator.type = "sine";
        oscillator.frequency.setValueAtTime(523.25 * pitch, ctx.currentTime); // C5
        oscillator.frequency.setValueAtTime(
          659.25 * pitch,
          ctx.currentTime + 0.2
        ); // E5
        oscillator.frequency.setValueAtTime(
          783.99 * pitch,
          ctx.currentTime + 0.4
        ); // G5
        oscillator.frequency.setValueAtTime(
          1046.5 * pitch,
          ctx.currentTime + 0.6
        ); // C6
        gainNode.gain.setValueAtTime(0.12, ctx.currentTime);
        gainNode.gain.setValueAtTime(0.12, ctx.currentTime + 0.6);
        gainNode.gain.exponentialRampToValueAtTime(
          0.001,
          ctx.currentTime + 1.2
        );

        // Harmony layer - thirds
        oscillator2.type = "sine";
        oscillator2.frequency.setValueAtTime(659.25 * pitch, ctx.currentTime); // E5
        oscillator2.frequency.setValueAtTime(
          783.99 * pitch,
          ctx.currentTime + 0.2
        ); // G5
        oscillator2.frequency.setValueAtTime(
          987.77 * pitch,
          ctx.currentTime + 0.4
        ); // B5
        oscillator2.frequency.setValueAtTime(
          1318.51 * pitch,
          ctx.currentTime + 0.6
        ); // E6
        gainNode2.gain.setValueAtTime(0.08, ctx.currentTime);
        gainNode2.gain.setValueAtTime(0.08, ctx.currentTime + 0.6);
        gainNode2.gain.exponentialRampToValueAtTime(
          0.001,
          ctx.currentTime + 1.2
        );

        // Bass foundation
        oscillator3.type = "triangle";
        oscillator3.frequency.setValueAtTime(261.63 * pitch, ctx.currentTime); // C4
        oscillator3.frequency.setValueAtTime(
          329.63 * pitch,
          ctx.currentTime + 0.4
        ); // E4
        oscillator3.frequency.setValueAtTime(
          523.25 * pitch,
          ctx.currentTime + 0.8
        ); // C5
        gainNode3.gain.setValueAtTime(0.1, ctx.currentTime);
        gainNode3.gain.exponentialRampToValueAtTime(
          0.001,
          ctx.currentTime + 1.2
        );

        // Sparkle/celebration layer
        oscillator4.type = "square";
        oscillator4.frequency.setValueAtTime(1567.98 * pitch, ctx.currentTime); // G6
        oscillator4.frequency.setValueAtTime(
          2093.0 * pitch,
          ctx.currentTime + 0.1
        ); // C7
        oscillator4.frequency.setValueAtTime(
          1567.98 * pitch,
          ctx.currentTime + 0.2
        ); // G6
        oscillator4.frequency.setValueAtTime(
          2637.02 * pitch,
          ctx.currentTime + 0.3
        ); // E7
        gainNode4.gain.setValueAtTime(0.06, ctx.currentTime);
        gainNode4.gain.exponentialRampToValueAtTime(
          0.001,
          ctx.currentTime + 0.8
        );

        // Start all oscillators with slight delays for musical effect
        oscillator.start(ctx.currentTime);
        oscillator2.start(ctx.currentTime + 0.05);
        oscillator3.start(ctx.currentTime);
        oscillator4.start(ctx.currentTime + 0.1);

        // Stop all oscillators
        oscillator.stop(ctx.currentTime + 1.2);
        oscillator2.stop(ctx.currentTime + 1.2);
        oscillator3.stop(ctx.currentTime + 1.2);
        oscillator4.stop(ctx.currentTime + 0.8);
      }
    } catch (error) {
      console.log("Audio context error:", error);
    }
  };

  // Create explosion particles
  const createExplosion = (
    x: number,
    y: number,
    isCorrect: boolean = false
  ) => {
    const correctColors = [
      "#10B981",
      "#34D399",
      "#6EE7B7",
      "#A7F3D0",
      "#D1FAE5",
    ];
    const wrongColors = ["#EF4444", "#F87171", "#FCA5A5", "#FECACA", "#FEE2E2"];
    const neutralColors = [
      "#FFD700",
      "#FF6B6B",
      "#4ECDC4",
      "#45B7D1",
      "#96CEB4",
      "#FFEAA7",
    ];

    const colors = isCorrect
      ? correctColors
      : wrongColors.length > 0
      ? wrongColors
      : neutralColors;

    // Mobile-optimized particle count and physics
    const isMobile = typeof window !== "undefined" && window.innerWidth < 640;
    const particleCount = isMobile
      ? isCorrect
        ? 15
        : 12
      : isCorrect
      ? 25
      : 20; // Fewer particles on mobile
    const velocityMultiplier = isMobile ? 0.7 : 1; // Slower particles on mobile
    const lifespan = isMobile ? (isCorrect ? 80 : 70) : isCorrect ? 100 : 90; // Shorter lifespan on mobile

    const newParticles: Array<{
      id: string;
      x: number;
      y: number;
      vx: number;
      vy: number;
      life: number;
      maxLife: number;
      color: string;
      size: number;
    }> = [];
    const baseId = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

    for (let i = 0; i < particleCount; i++) {
      newParticles.push({
        id: `explosion-${baseId}-${i}`,
        x: x + (Math.random() - 0.5) * (isMobile ? 30 : 40), // Smaller spread on mobile
        y: y + (Math.random() - 0.5) * (isMobile ? 30 : 40),
        vx: (Math.random() - 0.5) * 15 * velocityMultiplier,
        vy: ((Math.random() - 0.5) * 15 - 3) * velocityMultiplier,
        life: lifespan,
        maxLife: lifespan,
        color: colors[Math.floor(Math.random() * colors.length)],
        size: Math.random() * (isCorrect ? 6 : 5) + 2,
      });
    }
    setParticles((prev) => [...prev, ...newParticles]);
  };

  // Fire bullet animation from rocket to asteroid
  const fireBullet = (asteroid: NumberAsteroid, onComplete: () => void) => {
    const bulletId = `bullet-${Date.now()}`;
    
    // Rocket position (right side of game area)
    const rocketXPercent = 85;
    const rocketYPercent = 50;
    
    // Target asteroid position
    const targetXPercent = asteroid.xPercent || 30;
    const targetYPercent = asteroid.yPercent || 30;
    
    // Add bullet to state
    setBullets(prev => [...prev, {
      id: bulletId,
      startXPercent: rocketXPercent,
      startYPercent: rocketYPercent,
      endXPercent: targetXPercent + 5, // Center of asteroid
      endYPercent: targetYPercent + 5,
      asteroidId: asteroid.id,
      progress: 0
    }]);
    
    // Play laser sound immediately
    const pitchVariation = 0.8 + (asteroid.value / 20) * 0.4;
    playSound("laser", pitchVariation);
    
    // Remove bullet and trigger explosion after animation
    const bulletDuration = 200; // ms - fast bullet
    setTimeout(() => {
      setBullets(prev => prev.filter(b => b.id !== bulletId));
      onComplete();
    }, bulletDuration);
  };

  // Handle asteroid click (shooting)
  const shootAsteroid = (asteroid: NumberAsteroid) => {
    const expectedNumber =
      gameState.targetSequence[gameState.currentSequenceIndex];
    const isCorrect = asteroid.value === expectedNumber;

    // Clear targeting line and stop targeting sound
    setTargetedAsteroid(null);
    stopLaserTargetingSound();

    // Fire bullet animation, then handle the hit
    fireBullet(asteroid, () => {
      // Explosion happens when bullet reaches asteroid
      playSound("explosion");
      
      // Get actual pixel position for explosion particles
      if (gameAreaRef.current) {
        const rect = gameAreaRef.current.getBoundingClientRect();
        const explosionX = (asteroid.xPercent || 30) / 100 * rect.width + 40;
        const explosionY = (asteroid.yPercent || 30) / 100 * rect.height + 40;
        createExplosion(explosionX, explosionY, isCorrect);
      } else {
        createExplosion(asteroid.x + 40, asteroid.y + 40, isCorrect);
      }
    });

    // Don't mark asteroid as shot permanently - allow re-shooting after wrong attempts
    // Only temporarily mark for visual feedback
    setAsteroids((prev) =>
      prev.map((a) =>
        a.id === asteroid.id ? { ...a, isShot: true, isCorrect } : a
      )
    );

    if (isCorrect) {
      const newSequenceBucket = [
        ...gameState.sequenceBucket,
        { value: asteroid.value, isCorrect: true },
      ];
      const newIndex = gameState.currentSequenceIndex + 1;

      playSound("correct", 1 + newIndex * 0.1);

      // Special scoring: number 14 gives 0 points but still counts as correct
      const points =
        asteroid.value === 14
          ? 0
          : 20 + gameState.level * 5 + gameState.streak * 2;
      const combo = gameState.combo + 1;

      setGameState((prev) => ({
        ...prev,
        score: prev.score + points,
        sequenceBucket: newSequenceBucket,
        currentSequenceIndex: newIndex,
        combo: combo,
        streak: prev.streak + 1,
        feedback:
          asteroid.value === 14
            ? newIndex >= prev.targetSequence.length
              ? `🎯 Sequence Complete! (14 gives 0 points)`
              : `✨ Correct! Next: ${prev.targetSequence[newIndex]} (14 gives 0 points)`
            : newIndex >= prev.targetSequence.length
            ? `🎯 Sequence Complete! +${points} points!`
            : `✨ Correct! Next: ${prev.targetSequence[newIndex]} (+${points})`,
      }));

      // Check if sequence is complete
      if (newIndex >= gameState.targetSequence.length) {
        const currentScore = gameState.score + points;
        setGameState((prev) => ({
          ...prev,
          isAnswered: true,
          completedLevels: prev.completedLevels + 1,
        }));

        // Check if we should progress to the next level (descending mode)
        setTimeout(() => {
          if (
            gameState.currentMode === "ascending" &&
            gameState.completedLevels === 0
          ) {
            // Show descending intro first
            setGameState((prev) => ({
              ...prev,
              showDescendingIntro: true,
              isPlaying: false,
              feedback: `🎊 Level 1 Complete! 🎊`,
            }));
          } else if (
            gameState.currentMode === "descending" &&
            gameState.completedLevels === 1
          ) {
            // Both levels completed - game complete!
            playSound("victory"); // Play triumphant victory fanfare
            setGameState((prev) => ({
              ...prev,
              gameComplete: true,
              isPlaying: false,
              feedback: `🏆 CONGRATULATIONS! You completed both levels! 🏆`,
            }));
          } else {
            // Continue with current mode
            setGameState((prev) => ({ ...prev, isAnswered: false }));
          }
        }, 2500);
      }
    } else {
      playSound("wrong");

      // Add wrong number to sequence bucket in red
      const newSequenceBucket = [
        ...gameState.sequenceBucket,
        { value: asteroid.value, isCorrect: false },
      ];

      setGameState((prev) => ({
        ...prev,
        lives: prev.lives - 1,
        combo: 0,
        streak: 0,
        sequenceBucket: newSequenceBucket,
        feedback: `❌ Wrong! Expected ${expectedNumber}, got ${asteroid.value}`,
      }));

      // Reset asteroid to allow re-shooting after a short delay
      setTimeout(() => {
        setAsteroids((prev) =>
          prev.map((a) =>
            a.id === asteroid.id ? { ...a, isShot: false, isCorrect: null } : a
          )
        );
      }, 1500);

      // Check game over
      if (gameState.lives <= 1) {
        setGameState((prev) => ({
          ...prev,
          isPlaying: false,
          gameOver: true,
        }));
      }
    }
  };

  const startGame = () => {
    setGameState({
      score: 0,
      level: 1,
      lives: 3,
      isPlaying: true,
      gameOver: false,
      feedback: "",
      streak: 0,
      combo: 0,
      targetSequence: [],
      currentSequenceIndex: 0,
      sequenceBucket: [],
      isAnswered: false,
      gameComplete: false,
      currentMode: "ascending",
      completedLevels: 0,
      showDescendingIntro: false,
    });
    setParticles([]);
    setBullets([]);
  };

  const resetGame = () => {
    setGameState({
      score: 0,
      level: 1,
      lives: 3,
      isPlaying: false,
      gameOver: false,
      feedback: "",
      streak: 0,
      combo: 0,
      targetSequence: [],
      currentSequenceIndex: 0,
      sequenceBucket: [],
      isAnswered: false,
      gameComplete: false,
      currentMode: "ascending",
      completedLevels: 0,
      showDescendingIntro: false,
    });
    setAsteroids([]);
    setParticles([]);
    setBullets([]);
  };

  const startDescendingLevel = () => {
    setGameState((prev) => ({
      ...prev,
      currentMode: "descending",
      level: 2,
      isPlaying: true,
      showDescendingIntro: false,
      feedback: "",
      isAnswered: false,
    }));
  };

  const skipDescendingIntro = () => {
    startDescendingLevel();
  };

  // Generate and download completion badge
  const downloadCompletionBadge = () => {
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Set canvas size
    canvas.width = 400;
    canvas.height = 500;

    // Background gradient
    const gradient = ctx.createLinearGradient(0, 0, 0, 500);
    gradient.addColorStop(0, "#1e293b");
    gradient.addColorStop(0.5, "#3730a3");
    gradient.addColorStop(1, "#7c3aed");
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, 400, 500);

    // Border
    ctx.strokeStyle = "#fbbf24";
    ctx.lineWidth = 4;
    ctx.strokeRect(10, 10, 380, 480);

    // Title
    ctx.fillStyle = "#fbbf24";
    ctx.font = "bold 24px Arial";
    ctx.textAlign = "center";
    ctx.fillText("COMPLETION CERTIFICATE", 200, 60);

    // Trophy emoji (using text)
    ctx.font = "48px Arial";
    ctx.fillText("🏆", 200, 120);

    // Main title
    ctx.fillStyle = "#ffffff";
    ctx.font = "bold 20px Arial";
    ctx.fillText("Comparing Numbers", 200, 160);
    ctx.fillText("Master Achievement", 200, 185);

    // Student name placeholder
    ctx.fillStyle = "#e5e7eb";
    ctx.font = "16px Arial";
    ctx.fillText("This certifies that", 200, 220);

    ctx.fillStyle = "#fbbf24";
    ctx.font = "bold 18px Arial";
    ctx.fillText("Student Name", 200, 250);

    // Achievement details
    ctx.fillStyle = "#ffffff";
    ctx.font = "14px Arial";
    ctx.fillText("has successfully completed:", 200, 280);

    // Level badges
    ctx.fillStyle = "#10b981";
    ctx.fillRect(50, 300, 130, 40);
    ctx.fillStyle = "#3b82f6";
    ctx.fillRect(220, 300, 130, 40);

    ctx.fillStyle = "#ffffff";
    ctx.font = "bold 12px Arial";
    ctx.fillText("Level 1:", 115, 315);
    ctx.fillText("Compare Numbers", 115, 330);
    ctx.fillText("Level 2:", 285, 315);
    ctx.fillText("Ascending/Descending", 285, 330);

    // Score
    ctx.fillStyle = "#fbbf24";
    ctx.font = "bold 16px Arial";
    ctx.fillText(`Final Score: ${gameState.score}`, 200, 370);

    // Date
    ctx.fillStyle = "#e5e7eb";
    ctx.font = "12px Arial";
    const today = new Date().toLocaleDateString();
    ctx.fillText(`Completed on: ${today}`, 200, 400);

    // Signature line
    ctx.fillStyle = "#9ca3af";
    ctx.font = "10px Arial";
    ctx.fillText("Kiro Educational Games", 200, 450);
    ctx.fillText("Number Comparison Challenge", 200, 465);

    // Download the image
    const link = document.createElement("a");
    link.download = `comparing-numbers-completion-badge-${Date.now()}.png`;
    link.href = canvas.toDataURL();
    link.click();
  };

  return (
    <div className="min-h-screen bg-gray-900 relative overflow-hidden">
      {/* Particles */}
      <div className="fixed inset-0 pointer-events-none">
        {particles.map((particle) => (
          <div
            key={particle.id}
            className="absolute rounded-full"
            style={{
              left: particle.x,
              top: particle.y,
              width: particle.size,
              height: particle.size,
              backgroundColor: particle.color,
              opacity: particle.life / particle.maxLife,
              transform: `scale(${particle.life / particle.maxLife})`,
            }}
          />
        ))}
      </div>

      <section className="pt-8 sm:pt-12 md:pt-16 pb-4 sm:pb-6 md:pb-8 px-2 sm:px-4 md:px-6 relative z-10">
        <div className="max-w-6xl mx-auto">
          {/* Back Button */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
            className="mb-4"
          >
            <Button
              onClick={onBackToMainGame}
              variant="outline"
              size="sm"
              className="border-gray-700 hover:bg-gray-800 text-gray-300"
            >
              <ArrowLeft className="h-3 w-3 mr-1" />
              Back
            </Button>
          </motion.div>

          {/* Hero Section */}
          <motion.div
            initial={{ opacity: 0, y: -30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center mb-4 md:mb-6"
          >
            <div className="mb-3 md:mb-4">
              <span className="px-3 py-1.5 md:px-4 md:py-2 rounded-full bg-purple-500/20 border border-purple-500/30 text-purple-300 text-xs md:text-sm font-semibold">
                {gameState.currentMode === "ascending"
                  ? "Ascending Order"
                  : "Descending Order"}{" "}
                Challenge
              </span>
            </div>
            <h1 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold leading-tight text-white mb-2">
              🚀 Space Rocket Mission
            </h1>
            <p className="text-gray-400 text-xs sm:text-sm">
              Shoot asteroids in {gameState.currentMode} order!
            </p>
          </motion.div>

          {/* Game Stats - Compact Mobile Grid */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="grid grid-cols-5 gap-1.5 sm:gap-2 md:gap-4 mb-4 sm:mb-6 md:mb-8"
          >
            <div className="bg-gray-800/90 backdrop-blur-sm rounded-xl p-2 sm:p-3 md:p-4 border border-gray-700 text-center">
              <div className="text-lg sm:text-xl md:text-2xl font-bold text-purple-400">
                {gameState.score}
              </div>
              <div className="text-[10px] sm:text-xs md:text-sm text-gray-400">
                SCORE
              </div>
            </div>
            <div className="bg-gray-800/90 backdrop-blur-sm rounded-xl p-2 sm:p-3 md:p-4 border border-gray-700 text-center">
              <div className="text-lg sm:text-xl md:text-2xl font-bold text-pink-400">
                {gameState.level}
              </div>
              <div className="text-[10px] sm:text-xs md:text-sm text-gray-400">
                LEVEL
              </div>
            </div>
            <div className="bg-gray-800/90 backdrop-blur-sm rounded-xl p-2 sm:p-3 md:p-4 border border-gray-700 text-center">
              <div className="text-lg sm:text-xl md:text-2xl font-bold text-red-400">
                {gameState.lives}
              </div>
              <div className="text-[10px] sm:text-xs md:text-sm text-gray-400">
                LIVES
              </div>
            </div>
            <div className="bg-gray-800/90 backdrop-blur-sm rounded-xl p-2 sm:p-3 md:p-4 border border-gray-700 text-center">
              <div className="text-lg sm:text-xl md:text-2xl font-bold text-orange-400">
                {gameState.streak}
              </div>
              <div className="text-[10px] sm:text-xs md:text-sm text-gray-400">
                STREAK
              </div>
            </div>
            <div className="bg-gray-800/90 backdrop-blur-sm rounded-xl p-2 sm:p-3 md:p-4 border border-gray-700 text-center">
              <div className="text-lg sm:text-xl md:text-2xl font-bold text-cyan-400">
                {gameState.combo}
              </div>
              <div className="text-[10px] sm:text-xs md:text-sm text-gray-400">
                COMBO
              </div>
            </div>
          </motion.div>

          {/* Start Game Button */}
          {!gameState.isPlaying &&
            !gameState.gameOver &&
            !gameState.gameComplete && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.3 }}
                className="text-center mb-4 sm:mb-6 md:mb-8"
              >
                <Button
                  onClick={startGame}
                  className="w-full max-w-md bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white py-3 sm:py-4 rounded-xl text-base sm:text-lg font-semibold shadow-lg hover:shadow-xl transition-all duration-300"
                >
                  <Play className="mr-2 h-4 w-4 sm:h-5 sm:w-5" />
                  Launch Mission
                </Button>
              </motion.div>
            )}

          {/* Game Area */}
          {gameState.isPlaying && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-4 sm:space-y-6"
            >
              {/* Sequence Bucket */}
              <div className="bg-gray-800/90 backdrop-blur-sm rounded-2xl p-3 sm:p-4 border border-gray-700">
                <h3 className="text-sm sm:text-base font-semibold text-white mb-2 sm:mb-3 text-center">
                  🎯 Sequence Bucket
                </h3>
                <div className="flex justify-center gap-1.5 sm:gap-2 flex-wrap">
                  {gameState.sequenceBucket.map((item, index) => (
                    <motion.div
                      key={`bucket-${index}`}
                      initial={{ scale: 0, rotate: 180 }}
                      animate={{ scale: 1, rotate: 0 }}
                      className={`w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 rounded-lg flex items-center justify-center text-white font-bold shadow-lg text-xs sm:text-sm md:text-base ${
                        item.isCorrect
                          ? "bg-gradient-to-br from-emerald-400 to-emerald-600"
                          : "bg-gradient-to-br from-red-400 to-red-600"
                      }`}
                    >
                      {item.value}
                    </motion.div>
                  ))}
                  {gameState.currentSequenceIndex <
                    gameState.targetSequence.length && (
                    <div className="w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 border-2 border-dashed border-purple-400 rounded-lg flex items-center justify-center text-purple-400 font-bold text-xs sm:text-sm md:text-base">
                      ?
                    </div>
                  )}
                </div>
              </div>

              {/* Space Area with Asteroids */}
              <div
                ref={gameAreaRef}
                className="relative h-56 sm:h-72 md:h-80 lg:h-96 bg-gray-800/50 rounded-xl sm:rounded-2xl border border-gray-700 backdrop-blur overflow-hidden"
                style={{
                  backgroundImage:
                    "radial-gradient(circle at 20% 30%, rgba(139, 92, 246, 0.2), transparent 50%), radial-gradient(circle at 80% 70%, rgba(236, 72, 153, 0.2), transparent 50%)",
                }}
              >
                {/* Bullet animations */}
                {bullets.map((bullet) => (
                  <motion.div
                    key={bullet.id}
                    className="absolute z-50 pointer-events-none"
                    initial={{
                      left: `${bullet.startXPercent}%`,
                      top: `${bullet.startYPercent}%`,
                      scale: 1,
                      opacity: 1,
                    }}
                    animate={{
                      left: `${bullet.endXPercent}%`,
                      top: `${bullet.endYPercent}%`,
                      scale: [1, 1.2, 1],
                    }}
                    transition={{
                      duration: 0.2,
                      ease: "linear",
                    }}
                  >
                    {/* Bullet glow trail */}
                    <div className="relative">
                      {/* Main bullet */}
                      <div 
                        className="w-3 h-3 sm:w-4 sm:h-4 rounded-full bg-gradient-to-r from-yellow-300 via-orange-400 to-red-500"
                        style={{
                          boxShadow: '0 0 10px #fbbf24, 0 0 20px #f97316, 0 0 30px #ef4444',
                        }}
                      />
                      {/* Bullet trail */}
                      <div 
                        className="absolute top-1/2 -translate-y-1/2 -right-4 sm:-right-6 w-6 sm:w-10 h-1.5 sm:h-2 rounded-full opacity-80"
                        style={{
                          background: 'linear-gradient(to left, transparent, #fbbf24, #f97316)',
                        }}
                      />
                      {/* Inner glow */}
                      <div className="absolute inset-0 w-3 h-3 sm:w-4 sm:h-4 rounded-full bg-white/60 blur-sm" />
                    </div>
                  </motion.div>
                ))}

                {/* Rocket at right side */}
                <motion.div
                  ref={rocketRef}
                  className="absolute right-2 sm:right-4 top-1/2 transform -translate-y-1/2 z-30"
                  animate={{
                    x: [0, -3, 0],
                    rotate: rocketRotation,
                  }}
                  transition={{
                    x: { duration: 2, repeat: Infinity, ease: "easeInOut" },
                    rotate: { duration: 0.3, ease: "easeOut" },
                  }}
                >
                  {/* Round background for rocket - smaller on mobile */}
                  <div className="relative w-12 h-12 sm:w-16 sm:h-16 md:w-20 md:h-20 bg-gradient-to-br from-gray-700/80 to-gray-900/80 rounded-full border-2 border-gray-600/50 backdrop-blur-sm shadow-lg flex items-center justify-center">
                    <div className="absolute inset-0 rounded-full bg-gradient-to-br from-purple-400/20 to-pink-400/20 animate-pulse"></div>
                    <img
                      src="/super-Brain.png"
                      alt="Super Brain"
                      className="w-8 h-8 sm:w-12 sm:h-12 md:w-16 md:h-16 relative z-10 object-contain drop-shadow-lg"
                    />
                  </div>
                </motion.div>

                {/* Targeting Line - simplified for percentage-based positioning */}
                {targetedAsteroid &&
                  (() => {
                    const targetAsteroid = asteroids.find(
                      (a) => a.id === targetedAsteroid
                    );
                    if (!targetAsteroid) return null;

                    // For percentage-based asteroids, we'll use CSS to draw the targeting effect
                    // The actual line drawing is complex with percentages, so we simplify
                    return null; // Disable targeting line for now - touch/click still works
                  })()}

                {/* Asteroids */}
                {asteroids.map((asteroid, index) => {
                  // Mobile-optimized floating movement
                  const isMobile =
                    typeof window !== "undefined" && window.innerWidth < 640;
                  const floatX = isMobile ? 1 : 2;
                  const floatY = isMobile ? 1 : 2;
                  const floatDuration = 4 + (index % 3);

                  return (
                    <motion.div
                      key={asteroid.id}
                      className={`absolute cursor-pointer transform transition-all duration-300 z-40 ${
                        asteroid.isShot
                          ? asteroid.isCorrect
                            ? "scale-0 opacity-0"
                            : "scale-150 opacity-50"
                          : "active:scale-95 hover:scale-110"
                      }`}
                      style={{
                        // Use percentage positioning for responsive layout
                        left: `${asteroid.xPercent || 10}%`,
                        top: `${asteroid.yPercent || 20}%`,
                        zIndex: 40,
                      }}
                      initial={{ scale: 1, rotate: 0 }}
                      animate={{
                        scale: asteroid.isShot
                          ? asteroid.isCorrect
                            ? 0
                            : 1.5
                          : 1,
                        rotate: asteroid.isShot ? 360 : 0,
                        opacity: asteroid.isShot
                          ? asteroid.isCorrect
                            ? 0
                            : 0.5
                          : 1,
                        x: asteroid.isShot ? 0 : [0, floatX, 0, -floatX, 0],
                        y: asteroid.isShot ? 0 : [0, -floatY, 0, floatY, 0],
                      }}
                      transition={{
                        duration: asteroid.isShot ? 0.5 : 4,
                        rotate: { duration: 0.5 },
                        scale: { duration: 0.3, ease: "easeOut" },
                        x: {
                          duration: floatDuration,
                          repeat: Infinity,
                          ease: "easeInOut",
                        },
                        y: {
                          duration: floatDuration * 1.5,
                          repeat: Infinity,
                          ease: "easeInOut",
                        },
                      }}
                      onTouchStart={(e) => {
                        e.preventDefault();
                        if (!asteroid.isShot) {
                          setTargetedAsteroid(asteroid.id);
                        }
                      }}
                      onTouchEnd={(e) => {
                        e.preventDefault();
                        if (!asteroid.isShot) {
                          shootAsteroid(asteroid);
                          setTargetedAsteroid(null);
                        }
                      }}
                      onMouseEnter={() => {
                        if (!asteroid.isShot) {
                          setTargetedAsteroid(asteroid.id);
                          startLaserTargetingSound();
                        }
                      }}
                      onMouseLeave={() => {
                        setTargetedAsteroid(null);
                        stopLaserTargetingSound();
                      }}
                      onClick={(e) => {
                        e.preventDefault();
                        if (!asteroid.isShot) {
                          shootAsteroid(asteroid);
                        }
                      }}
                    >
                      {/* Asteroid with irregular shape - responsive sizes */}
                      <div
                        className={`relative w-12 h-12 sm:w-16 sm:h-16 md:w-20 md:h-20 flex items-center justify-center text-sm sm:text-base md:text-xl font-bold shadow-2xl ${
                          asteroid.isCorrect === true
                            ? "text-white"
                            : asteroid.isCorrect === false
                            ? "text-white"
                            : "text-white hover:scale-105 transition-transform"
                        }`}
                        style={{
                          clipPath:
                            "polygon(30% 0%, 70% 0%, 100% 30%, 85% 70%, 70% 100%, 30% 100%, 15% 70%, 0% 30%)",
                          background:
                            asteroid.isCorrect === true
                              ? "linear-gradient(135deg, #10B981 0%, #059669 100%)"
                              : asteroid.isCorrect === false
                              ? "linear-gradient(135deg, #EF4444 0%, #DC2626 100%)"
                              : "linear-gradient(135deg, #78716C 0%, #57534E 30%, #44403C  70%, #292524 100%)",
                          boxShadow:
                            asteroid.isCorrect === true
                              ? "0 0 20px rgba(16, 185, 129, 0.5)"
                              : asteroid.isCorrect === false
                              ? "0 0 20px rgba(239, 68, 68, 0.5)"
                              : "0 8px 32px rgba(0, 0, 0, 0.3), inset -2px -2px 8px rgba(0, 0, 0, 0.3), inset 2px 2px 8px rgba(120, 113, 108, 0.3)",
                        }}
                      >
                        {/* Crater textures - smaller on mobile */}
                        <div className="absolute inset-0 opacity-30">
                          <div className="absolute w-1 h-1 sm:w-2 sm:h-2 bg-black rounded-full top-1 sm:top-2 left-2 sm:left-3 opacity-40"></div>
                          <div className="absolute w-1 h-1 sm:w-1.5 sm:h-1.5 bg-black rounded-full top-3 sm:top-4 right-3 sm:right-4 opacity-30"></div>
                          <div className="absolute w-0.5 h-0.5 sm:w-1 sm:h-1 bg-black rounded-full bottom-2 sm:bottom-3 left-1 sm:left-2 opacity-50"></div>
                          <div className="absolute w-0.5 h-0.5 sm:w-1 sm:h-1 bg-black rounded-full bottom-1 sm:bottom-2 right-2 sm:right-3 opacity-40"></div>
                        </div>

                        {/* Asteroid Emoji and Number - responsive sizes */}
                        <div className="relative z-10 flex flex-col items-center justify-center">
                          <div className="text-sm sm:text-lg md:text-xl mb-0 sm:mb-0.5">
                            {["🪨", "☄️", "🌑", "🌖", "🪨"][index % 5]}
                          </div>
                          <span className="text-xs sm:text-sm md:text-lg font-bold drop-shadow-lg">
                            {asteroid.value}
                          </span>
                        </div>

                        {/* Glow effect for unshot asteroids */}
                        {!asteroid.isShot && (
                          <div
                            className={`absolute -inset-0.5 sm:-inset-1 ${
                              targetedAsteroid === asteroid.id
                                ? "bg-purple-500 opacity-40"
                                : "bg-purple-400 opacity-20"
                            } animate-pulse`}
                            style={{
                              clipPath:
                                "polygon(30% 0%, 70% 0%, 100% 30%, 85% 70%, 70% 100%, 30% 100%, 15% 70%, 0% 30%)",
                            }}
                          ></div>
                        )}
                      </div>
                    </motion.div>
                  );
                })}
              </div>

              {/* Feedback */}
              <AnimatePresence>
                {gameState.feedback && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    className="text-center"
                  >
                    <div
                      className={`text-xs sm:text-sm md:text-base font-bold px-3 py-2 sm:px-4 sm:py-2 rounded-xl inline-block max-w-xs sm:max-w-md ${
                        gameState.feedback.includes("Complete") ||
                        gameState.feedback.includes("LEVEL")
                          ? "bg-purple-500/20 text-purple-300 border border-purple-500/30"
                          : gameState.feedback.includes("Correct")
                          ? "bg-green-500/20 text-green-400 border border-green-500/30"
                          : gameState.feedback.includes("Wrong")
                          ? "bg-red-500/20 text-red-400 border border-red-500/30"
                          : "bg-blue-500/20 text-blue-300 border border-blue-500/30"
                      }`}
                    >
                      {gameState.feedback.length > 60
                        ? gameState.feedback.substring(0, 60) + "..."
                        : gameState.feedback}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          )}

          {/* Game Over */}
          {gameState.gameOver && (
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-center"
            >
              <div className="bg-gray-800/90 backdrop-blur-sm rounded-2xl p-6 sm:p-8 max-w-md mx-auto border border-gray-700">
                <Trophy className="h-12 w-12 sm:h-16 sm:w-16 text-yellow-400 mx-auto mb-4" />
                <h2 className="text-2xl sm:text-3xl font-bold text-white mb-4">
                  Mission Failed!
                </h2>
                <p className="text-gray-300 mb-2">
                  Final Score:{" "}
                  <span className="text-purple-400 font-bold text-xl sm:text-2xl">
                    {gameState.score}
                  </span>
                </p>
                <p className="text-gray-300 mb-6">
                  Level Reached:{" "}
                  <span className="text-pink-400 font-bold text-lg sm:text-xl">
                    {gameState.level}
                  </span>
                </p>

                <div className="flex gap-3 justify-center">
                  <Button
                    onClick={startGame}
                    className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white rounded-xl"
                  >
                    <Play className="h-4 w-4 mr-2" />
                    Try Again
                  </Button>
                  <Button
                    onClick={resetGame}
                    variant="outline"
                    className="border-gray-600 text-gray-300 hover:bg-gray-700 rounded-xl"
                  >
                    <RotateCcw className="h-4 w-4 mr-2" />
                    Reset
                  </Button>
                </div>
              </div>
            </motion.div>
          )}

          {/* Descending Order Introduction */}
          {gameState.showDescendingIntro && (
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4"
            >
              <div className="bg-gray-800/95 border border-purple-500/50 rounded-2xl p-4 sm:p-6 max-w-lg mx-auto backdrop-blur shadow-2xl">
                <div className="text-center">
                  <motion.div
                    animate={{ rotate: [0, 10, -10, 0], scale: [1, 1.1, 1] }}
                    transition={{
                      duration: 2,
                      repeat: Infinity,
                      ease: "easeInOut",
                    }}
                    className="mb-4"
                  >
                    <div className="text-4xl sm:text-5xl">🚀</div>
                  </motion.div>

                  <h2 className="text-xl sm:text-2xl font-bold text-white mb-3">
                    <span className="bg-gradient-to-r from-orange-400 to-pink-400 bg-clip-text text-transparent">
                      Now: Descending Order!
                    </span>
                  </h2>

                  <p className="text-gray-300 text-sm mb-4">
                    Great job! Now shoot asteroids from{" "}
                    <strong className="text-orange-400">
                      LARGEST to SMALLEST
                    </strong>
                    .
                  </p>

                  <div className="grid grid-cols-2 gap-2 mb-4">
                    <div className="bg-green-500/20 border border-green-500/30 p-2 rounded-lg">
                      <p className="text-green-300 text-xs">
                        ✅ Ascending Done
                      </p>
                      <p className="text-green-200 text-[10px]">1 → 2 → 3</p>
                    </div>
                    <div className="bg-orange-500/20 border border-orange-500/30 p-2 rounded-lg">
                      <p className="text-orange-300 text-xs">
                        🎯 Descending Next
                      </p>
                      <p className="text-orange-200 text-[10px]">3 → 2 → 1</p>
                    </div>
                  </div>

                  <div className="flex flex-col sm:flex-row gap-2 justify-center">
                    <Button
                      onClick={startDescendingLevel}
                      className="bg-gradient-to-r from-orange-500 to-pink-500 hover:from-orange-600 hover:to-pink-600 text-white font-semibold px-4 py-2 rounded-xl"
                    >
                      <Star className="h-4 w-4 mr-2" />
                      Start Descending
                    </Button>
                    <Button
                      onClick={skipDescendingIntro}
                      variant="outline"
                      className="border-gray-600 text-gray-300 hover:bg-gray-700 px-4 py-2 rounded-xl"
                    >
                      Skip
                    </Button>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {/* Game Complete */}
          {gameState.gameComplete && (
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-center"
            >
              <div className="bg-gray-800/95 border border-purple-500/50 rounded-2xl p-4 sm:p-6 max-w-md mx-auto backdrop-blur shadow-2xl">
                <motion.div
                  animate={{ rotate: [0, 5, -5, 0], scale: [1, 1.05, 1] }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                    ease: "easeInOut",
                  }}
                  className="text-center mb-3"
                >
                  <div className="text-4xl sm:text-5xl">🏆</div>
                </motion.div>

                <h2 className="text-xl sm:text-2xl font-bold text-white mb-3">
                  <span className="bg-gradient-to-r from-yellow-300 to-amber-300 bg-clip-text text-transparent">
                    Mission Accomplished!
                  </span>
                </h2>

                <p className="text-gray-300 text-sm mb-3">
                  Outstanding! You completed both levels.
                </p>

                <div className="grid grid-cols-2 gap-2 mb-3">
                  <div className="bg-emerald-500/20 border border-emerald-500/30 px-2 py-1.5 rounded-lg">
                    <p className="text-emerald-300 text-xs">Lvl 1 ✓</p>
                  </div>
                  <div className="bg-blue-500/20 border border-blue-500/30 px-2 py-1.5 rounded-lg">
                    <p className="text-blue-300 text-xs">Lvl 2 ✓</p>
                  </div>
                </div>

                <div className="bg-gray-700/50 border border-gray-600 p-3 rounded-xl mb-4">
                  <p className="text-gray-400 text-xs mb-1">Final Score</p>
                  <p className="text-yellow-400 font-bold text-2xl sm:text-3xl">
                    {gameState.score}
                  </p>
                </div>

                <div className="flex flex-col gap-2">
                  <Button
                    onClick={downloadCompletionBadge}
                    className="bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 text-white font-semibold px-4 py-2 rounded-xl"
                  >
                    <Trophy className="h-4 w-4 mr-2" />
                    Download Badge
                  </Button>
                  <div className="flex gap-2">
                    <Button
                      onClick={startGame}
                      className="flex-1 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-semibold px-4 py-2 rounded-xl"
                    >
                      <Sparkles className="h-4 w-4 mr-2" />
                      Play Again
                    </Button>
                    <Button
                      onClick={resetGame}
                      variant="outline"
                      className="flex-1 border-gray-600 text-gray-300 hover:bg-gray-700 px-4 py-2 rounded-xl"
                    >
                      <RotateCcw className="h-4 w-4 mr-2" />
                      Reset
                    </Button>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {/* How to Play Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.5 }}
            className="mt-4 sm:mt-6 pb-4 sm:pb-8"
          >
            <h3 className="text-base sm:text-lg font-bold text-white mb-3 sm:mb-4 text-center">
              Mission Briefing
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2 sm:gap-3">
              <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-3 sm:p-4 border border-gray-700 text-center">
                <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-purple-500/20 border border-purple-500/30 flex items-center justify-center mx-auto mb-2">
                  <span className="text-base sm:text-lg">🚀</span>
                </div>
                <h4 className="text-white font-semibold mb-1 text-xs sm:text-sm">
                  Your Mission
                </h4>
                <p className="text-gray-400 text-[10px] sm:text-xs">
                  Click asteroids in order
                </p>
              </div>

              <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-3 sm:p-4 border border-gray-700 text-center">
                <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-purple-500/20 border border-purple-500/30 flex items-center justify-center mx-auto mb-2">
                  <span className="text-base sm:text-lg">🎯</span>
                </div>
                <h4 className="text-white font-semibold mb-1 text-xs sm:text-sm">
                  Sequence Bucket
                </h4>
                <p className="text-gray-400 text-[10px] sm:text-xs">
                  Track your progress
                </p>
              </div>

              <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-3 sm:p-4 border border-gray-700 text-center">
                <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-purple-500/20 border border-purple-500/30 flex items-center justify-center mx-auto mb-2">
                  <span className="text-base sm:text-lg">📈</span>
                </div>
                <h4 className="text-white font-semibold mb-1 text-xs sm:text-sm">
                  Level Up
                </h4>
                <p className="text-gray-400 text-[10px] sm:text-xs">
                  Complete sequences
                </p>
              </div>

              <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-3 sm:p-4 border border-gray-700 text-center">
                <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-purple-500/20 border border-purple-500/30 flex items-center justify-center mx-auto mb-2">
                  <span className="text-base sm:text-lg">❤️</span>
                </div>
                <h4 className="text-white font-semibold mb-1 text-xs sm:text-sm">
                  3 Lives
                </h4>
                <p className="text-gray-400 text-[10px] sm:text-xs">
                  Don't miss the order
                </p>
              </div>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
