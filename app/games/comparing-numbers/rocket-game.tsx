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
import { Card } from "@/components/ui/card";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";

type NumberAsteroid = {
  id: string;
  value: number;
  x: number;
  y: number;
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

    // Responsive asteroid positioning - horizontal layout for mobile
    const isMobile = typeof window !== "undefined" && window.innerWidth < 640;
    const isTablet = typeof window !== "undefined" && window.innerWidth < 1024;

    // Dynamic game area dimensions based on screen size
    let gameAreaWidth, gameAreaHeight, asteroidSize, padding;

    if (isMobile) {
      // Mobile: horizontal scrollable layout
      gameAreaWidth = Math.max(600, count * 120); // Ensure enough width for all asteroids
      gameAreaHeight = 256; // Match the h-64 class (16rem = 256px)
      asteroidSize = 80;
      padding = 20;
    } else if (isTablet) {
      // Tablet: hybrid layout
      gameAreaWidth = 600;
      gameAreaHeight = 280;
      asteroidSize = 85;
      padding = 30;
    } else {
      // Desktop: original layout
      gameAreaWidth = 700;
      gameAreaHeight = 300;
      asteroidSize = 90;
      padding = 50;
    }

    // Create asteroids with responsive positioning
    const newAsteroids: NumberAsteroid[] = numbers.map((num, index) => {
      let x, y;

      if (isMobile) {
        // Mobile: Horizontal line layout with slight vertical variation
        const availableWidth = gameAreaWidth - 2 * padding;
        const slotWidth = availableWidth / count;

        x = padding + index * slotWidth + (slotWidth - asteroidSize) / 2;
        y = (gameAreaHeight - asteroidSize) / 2 + (Math.random() - 0.5) * 30; // Small vertical randomization

        // Ensure asteroids stay within boundaries
        x = Math.max(
          padding,
          Math.min(x, gameAreaWidth - asteroidSize - padding)
        );
        y = Math.max(20, Math.min(y, gameAreaHeight - asteroidSize - 20));
      } else {
        // Desktop/Tablet: Grid layout
        const cols = Math.ceil(Math.sqrt(count));
        const rows = Math.ceil(count / cols);

        const col = index % cols;
        const row = Math.floor(index / cols);

        // Calculate slot dimensions
        const slotWidth = (gameAreaWidth - 2 * padding) / cols;
        const slotHeight = (gameAreaHeight - 2 * padding) / rows;

        // Calculate base position for this slot
        const baseX = padding + col * slotWidth;
        const baseY = padding + row * slotHeight;

        // Add randomization within the slot (but ensure asteroid fits)
        const maxOffsetX = Math.max(0, slotWidth - asteroidSize);
        const maxOffsetY = Math.max(0, slotHeight - asteroidSize);

        x = baseX + Math.random() * maxOffsetX;
        y = baseY + Math.random() * maxOffsetY;

        // Ensure asteroids stay within boundaries
        x = Math.max(0, Math.min(x, gameAreaWidth - asteroidSize));
        y = Math.max(0, Math.min(y, gameAreaHeight - asteroidSize));
      }

      return {
        id: `asteroid-${Date.now()}-${index}`,
        value: num,
        x,
        y,
        isShot: false,
        isCorrect: null,
      };
    });

    console.log("Generated asteroids:", newAsteroids);
    console.log("Target sequence:", targetSequence);
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

  // Update rocket rotation based on targeted asteroid
  useEffect(() => {
    if (targetedAsteroid && rocketPosition.x && rocketPosition.y) {
      const asteroid = asteroids.find((a) => a.id === targetedAsteroid);
      if (asteroid) {
        // Use responsive sizing for asteroid center calculation
        const isMobile =
          typeof window !== "undefined" && window.innerWidth < 640;
        const asteroidSize = isMobile ? 32 : 40; // Half of asteroid width/height for center
        const asteroidCenterX = asteroid.x + asteroidSize;
        const asteroidCenterY = asteroid.y + asteroidSize;

        // Calculate angle from rocket to asteroid
        const deltaX = asteroidCenterX - rocketPosition.x;
        const deltaY = asteroidCenterY - rocketPosition.y;

        // Convert to degrees - rocket emoji points up by default, so we need to adjust
        // atan2(deltaY, deltaX) gives us the angle from rocket to asteroid
        // We subtract 90 degrees because the rocket emoji's default orientation is pointing up (90°)
        const angle = Math.atan2(deltaY, deltaX) * (180 / Math.PI) + 90;

        setRocketRotation(angle);
      }
    } else {
      // Reset rotation to face left when no target (default left-facing position)
      setRocketRotation(-90);
    }
  }, [targetedAsteroid, rocketPosition, asteroids]);

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

  // Handle asteroid click (shooting)
  const shootAsteroid = (asteroid: NumberAsteroid) => {
    const expectedNumber =
      gameState.targetSequence[gameState.currentSequenceIndex];
    const isCorrect = asteroid.value === expectedNumber;

    // Clear targeting line and stop targeting sound
    setTargetedAsteroid(null);
    stopLaserTargetingSound();

    // Add pitch variation based on asteroid value for more dynamic sound
    const pitchVariation = 0.8 + (asteroid.value / 20) * 0.4; // Range from 0.8 to 1.2
    playSound("laser", pitchVariation);
    setTimeout(() => {
      playSound("explosion");
      createExplosion(asteroid.x + 40, asteroid.y + 40, isCorrect);
    }, 100);

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
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-indigo-900 to-purple-900 relative overflow-hidden">
      {/* Animated stars background */}
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-gradient-to-br from-transparent via-slate-800/20 to-transparent"></div>
        {[...Array(50)].map((_, i) => (
          <div
            key={i}
            className="absolute w-1 h-1 bg-white rounded-full animate-pulse"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 3}s`,
              animationDuration: `${2 + Math.random() * 2}s`,
            }}
          />
        ))}
      </div>

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

      <section className="pt-16 md:pt-24 pb-6 md:pb-8 px-3 md:px-6 relative z-10">
        <div className="max-w-6xl mx-auto">
          {/* Header - Mobile optimization */}
          <div className="flex flex-col md:flex-row items-center justify-between mb-4 md:mb-8 space-y-2 md:space-y-0">
            {/* Back button - floating on mobile */}
            <Button
              onClick={onBackToMainGame}
              variant="ghost"
              className="text-gray-300 hover:text-white self-start absolute top-4 left-4 z-20 bg-slate-800/70 backdrop-blur-sm md:static md:bg-transparent md:backdrop-blur-none rounded-full md:rounded-md p-2 md:p-2 h-10 w-10 md:w-auto md:h-auto"
            >
              <ArrowLeft className="h-4 w-4 md:mr-2" />
              <span className="hidden md:inline">Back to Game</span>
            </Button>

            <div className="text-center flex-1 md:flex-none">
              <h1 className="text-xl md:text-3xl lg:text-4xl font-bold text-white mb-1 md:mb-2 flex flex-col md:flex-row items-center gap-1 md:gap-2" style={{ fontFamily: 'Courier New, monospace', letterSpacing: '2px', textShadow: '2px 2px 0px #000, -2px -2px 0px #000, 2px -2px 0px #000, -2px 2px 0px #000' }}>
                <span>🚀 SPACE ROCKET</span>
                <span className="hidden md:inline">
                  {gameState.currentMode === "ascending"
                    ? "ASCENDING ORDER"
                    : "DESCENDING ORDER"}{" "}
                  🚀
                </span>
                <span className="md:hidden text-sm">GAME 🚀</span>
              </h1>
              <p className="text-gray-300 text-xs md:text-base">
                Shoot asteroids in{" "}
                <span className="hidden md:inline">
                  {gameState.currentMode}
                </span>
                <span className="md:hidden">correct</span> order!
              </p>
            </div>

            <div className="w-0 md:w-24"></div>
          </div>

          {/* Game Stats - Compact mobile layout */}
          <div className="flex flex-wrap gap-1 sm:grid sm:grid-cols-5 sm:gap-4 justify-center mb-3 md:mb-8">
            {/* Mobile: Single row with mini cards */}
            <div className="flex gap-1 w-full justify-center sm:hidden">
              <div className="bg-slate-800/80 border border-slate-700 px-2 py-1 rounded text-center backdrop-blur flex-1 min-w-0 max-w-16">
                <div className="text-sm font-bold text-blue-400 truncate">
                  {gameState.score}
                </div>
                <div className="text-xs text-gray-400">💰</div>
              </div>
              <div className="bg-slate-800/80 border border-slate-700 px-2 py-1 rounded text-center backdrop-blur flex-1 min-w-0 max-w-16">
                <div className="text-sm font-bold text-purple-400 truncate">
                  {gameState.level}
                </div>
                <div className="text-xs text-gray-400">🎮</div>
              </div>
              <div className="bg-slate-800/80 border border-slate-700 px-2 py-1 rounded text-center backdrop-blur flex-1 min-w-0 max-w-16">
                <div className="text-sm font-bold text-red-400 truncate">
                  {gameState.lives}
                </div>
                <div className="text-xs text-gray-400">❤️</div>
              </div>
              <div className="bg-slate-800/80 border border-slate-700 px-2 py-1 rounded text-center backdrop-blur flex-1 min-w-0 max-w-16">
                <div className="text-sm font-bold text-yellow-400 truncate">
                  {gameState.streak}
                </div>
                <div className="text-xs text-gray-400">⚡</div>
              </div>
              <div className="bg-slate-800/80 border border-slate-700 px-2 py-1 rounded text-center backdrop-blur flex-1 min-w-0 max-w-16">
                <div className="text-sm font-bold text-emerald-400 truncate">
                  {gameState.combo}
                </div>
                <div className="text-xs text-gray-400">🔥</div>
              </div>
            </div>

            {/* Desktop: Original larger cards */}
            <Card className="hidden sm:block bg-slate-800/80 border-slate-700 p-4 text-center backdrop-blur">
              <div className="text-2xl font-bold text-blue-400" style={{ fontFamily: 'Courier New, monospace', letterSpacing: '1px' }}>
                {gameState.score}
              </div>
              <div className="text-sm text-gray-400" style={{ fontFamily: 'Courier New, monospace' }}>SCORE</div>
            </Card>
            <Card className="hidden sm:block bg-slate-800/80 border-slate-700 p-4 text-center backdrop-blur">
              <div className="text-2xl font-bold text-purple-400" style={{ fontFamily: 'Courier New, monospace', letterSpacing: '1px' }}>
                {gameState.level}
              </div>
              <div className="text-sm text-gray-400" style={{ fontFamily: 'Courier New, monospace' }}>LEVEL</div>
            </Card>
            <Card className="hidden sm:block bg-slate-800/80 border-slate-700 p-4 text-center backdrop-blur">
              <div className="text-2xl font-bold text-red-400" style={{ fontFamily: 'Courier New, monospace', letterSpacing: '1px' }}>
                {gameState.lives}
              </div>
              <div className="text-sm text-gray-400" style={{ fontFamily: 'Courier New, monospace' }}>LIVES</div>
            </Card>
            <Card className="hidden sm:block bg-slate-800/80 border-slate-700 p-4 text-center backdrop-blur">
              <div className="text-2xl font-bold text-yellow-400" style={{ fontFamily: 'Courier New, monospace', letterSpacing: '1px' }}>
                {gameState.streak}
              </div>
              <div className="text-sm text-gray-400" style={{ fontFamily: 'Courier New, monospace' }}>STREAK</div>
            </Card>
            <Card className="hidden sm:block bg-slate-800/80 border-slate-700 p-4 text-center backdrop-blur">
              <div className="text-2xl font-bold text-emerald-400">
                {gameState.combo}
              </div>
              <div className="text-sm text-gray-400">Combo</div>
            </Card>
          </div>

          {/* Start Game Button - Compact mobile version */}
          {!gameState.isPlaying &&
            !gameState.gameOver &&
            !gameState.gameComplete && (
              <div className="text-center mb-6 md:mb-8">
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Button
                    onClick={startGame}
                    className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white px-6 py-3 md:px-12 md:py-4 text-base md:text-lg font-bold rounded-lg md:rounded-xl shadow-lg"
                  >
                    <Play className="h-4 w-4 md:h-6 md:w-6 mr-2 md:mr-3" />
                    <span className="hidden sm:inline">Launch Mission</span>
                    <span className="sm:hidden">Start</span>
                  </Button>
                </motion.div>
              </div>
            )}

          {/* Game Area */}
          {gameState.isPlaying && (
            <div className="space-y-8">
              {/* Sequence Bucket */}
              <div className="text-center mb-4 md:mb-6 px-2">
                <h3 className="text-lg md:text-xl font-bold text-white mb-3 md:mb-4">
                  🎯 Sequence Bucket:
                </h3>
                <div className="flex justify-center gap-1.5 sm:gap-2 flex-wrap max-w-md mx-auto">
                  {gameState.sequenceBucket.map((item, index) => (
                    <motion.div
                      key={`bucket-${index}`}
                      initial={{ scale: 0, rotate: 180 }}
                      animate={{ scale: 1, rotate: 0 }}
                      className={`w-10 h-10 sm:w-12 sm:h-12 rounded-lg flex items-center justify-center text-white font-bold shadow-lg text-sm sm:text-base ${
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
                    <div className="w-10 h-10 sm:w-12 sm:h-12 border-2 border-dashed border-emerald-400 rounded-lg flex items-center justify-center text-emerald-400 font-bold text-sm sm:text-base">
                      ?
                    </div>
                  )}
                </div>
              </div>

              {/* Space Area with Asteroids */}
              <div
                className="relative h-64 sm:h-80 md:h-96 lg:h-[28rem] bg-gradient-to-b from-indigo-900/30 to-purple-900/30 rounded-xl sm:rounded-2xl lg:rounded-3xl border-2 border-slate-700 backdrop-blur mx-1 sm:mx-2 lg:mx-0"
                style={{
                  backgroundImage:
                    "radial-gradient(circle at 20% 30%, rgba(139, 92, 246, 0.3), transparent 50%), radial-gradient(circle at 80% 70%, rgba(59, 130, 246, 0.3), transparent 50%)",
                  overflowX: "auto",
                  overflowY: "hidden",
                }}
              >
                {/* Rocket at right side, positioned lower on mobile */}
                <motion.div
                  ref={rocketRef}
                  className="absolute right-3 sm:right-4 top-3/4 sm:top-1/2 transform -translate-y-1/2"
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
                  <div className="relative w-16 h-16 sm:w-20 sm:h-20 bg-gradient-to-br from-slate-700/80 to-slate-900/80 rounded-full border-2 border-slate-600/50 backdrop-blur-sm shadow-lg flex items-center justify-center">
                    <div className="absolute inset-0 rounded-full bg-gradient-to-br from-blue-400/20 to-purple-400/20 animate-pulse"></div>
                    <img
                      src="/super-Brain.png"
                      alt="Super Brain"
                      className="w-12 h-12 sm:w-16 sm:h-16 relative z-10 object-contain drop-shadow-lg"
                    />
                  </div>
                </motion.div>

                {/* Targeting Line */}
                {targetedAsteroid &&
                  (() => {
                    const targetAsteroid = asteroids.find(
                      (a) => a.id === targetedAsteroid
                    );
                    if (!targetAsteroid) return null;

                    // Calculate responsive asteroid center based on screen size
                    const isMobile =
                      typeof window !== "undefined" && window.innerWidth < 640;
                    const isTablet =
                      typeof window !== "undefined" && window.innerWidth < 1024;

                    // Match the asteroid size calculation from generateAsteroids
                    let asteroidDisplaySize;
                    if (isMobile) {
                      asteroidDisplaySize = 32; // Half of 64px (16*4)
                    } else if (isTablet) {
                      asteroidDisplaySize = 40; // Half of 80px (20*4)
                    } else {
                      asteroidDisplaySize = 40; // Half of 80px (20*4) for desktop
                    }

                    const asteroidCenterX =
                      targetAsteroid.x + asteroidDisplaySize;
                    const asteroidCenterY =
                      targetAsteroid.y + asteroidDisplaySize;

                    return (
                      <motion.svg
                        className="absolute inset-0 pointer-events-none"
                        style={{
                          width: "100%",
                          height: "100%",
                          overflow: "visible", // Ensure line isn't clipped
                          zIndex: 50, // Ensure targeting line appears above asteroids
                        }}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                      >
                        <motion.line
                          x1={rocketPosition.x}
                          y1={rocketPosition.y}
                          x2={asteroidCenterX}
                          y2={asteroidCenterY}
                          stroke="#FF0000"
                          strokeWidth="3"
                          strokeDasharray="0"
                          initial={{ pathLength: 0, opacity: 0 }}
                          animate={{ pathLength: 1, opacity: [0.6, 1, 0.6] }}
                          transition={{
                            pathLength: { duration: 0.3 },
                            opacity: {
                              duration: 0.8,
                              repeat: Infinity,
                              ease: "easeInOut",
                            },
                          }}
                          style={{
                            filter: "drop-shadow(0 0 8px #FF0000)",
                            vectorEffect: "non-scaling-stroke", // Maintain stroke width across scaling
                          }}
                        />
                        {/* Laser sight dots */}
                        <motion.circle
                          cx={asteroidCenterX}
                          cy={asteroidCenterY}
                          r="3"
                          fill="#FF0000"
                          initial={{ scale: 0 }}
                          animate={{ scale: [0, 1, 0] }}
                          transition={{ duration: 0.5, repeat: Infinity }}
                          style={{
                            filter: "drop-shadow(0 0 4px #FF0000)",
                          }}
                        />
                        {/* Additional targeting circle around asteroid */}
                        <motion.circle
                          cx={asteroidCenterX}
                          cy={asteroidCenterY}
                          r={asteroidDisplaySize * 0.8}
                          fill="none"
                          stroke="#FF0000"
                          strokeWidth="2"
                          strokeDasharray="8 4"
                          initial={{ scale: 0, rotate: 0 }}
                          animate={{
                            scale: [0.8, 1.2, 0.8],
                            rotate: 360,
                            opacity: [0.3, 0.8, 0.3],
                          }}
                          transition={{
                            scale: {
                              duration: 1,
                              repeat: Infinity,
                              ease: "easeInOut",
                            },
                            rotate: {
                              duration: 2,
                              repeat: Infinity,
                              ease: "linear",
                            },
                            opacity: {
                              duration: 1,
                              repeat: Infinity,
                              ease: "easeInOut",
                            },
                          }}
                          style={{
                            filter: "drop-shadow(0 0 4px #FF0000)",
                          }}
                        />
                      </motion.svg>
                    );
                  })()}

                {/* Debug: Show asteroid count */}
                {asteroids.length > 0 && (
                  <div className="absolute top-2 left-2 text-white bg-black/50 px-2 py-1 rounded text-sm z-50">
                    Asteroids: {asteroids.length}
                  </div>
                )}

                {/* Asteroids */}
                {asteroids.map((asteroid, index) => {
                  console.log("Rendering asteroid:", asteroid); // Debug log

                  // Mobile-optimized floating movement
                  const isMobile =
                    typeof window !== "undefined" && window.innerWidth < 640;
                  const floatX = isMobile
                    ? 1 + (index % 2) * 1
                    : 2 + (index % 2) * 2; // Smaller movement on mobile
                  const floatY = isMobile
                    ? 0.5 + (index % 3) * 0.5
                    : 1 + (index % 3) * 1; // Smaller movement on mobile
                  const floatDuration = 5 + (index % 3) * 2; // Consistent slower movement

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
                        left: asteroid.x,
                        top: asteroid.y,
                        zIndex: 40,
                        // Wider touch zone for mobile
                        padding: isMobile ? "12px" : "8px",
                        margin: isMobile ? "-12px" : "-8px",
                        minWidth: isMobile ? "96px" : "80px",
                        minHeight: isMobile ? "96px" : "80px",
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
                        // Mobile-optimized floating movement
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
                      // Mobile-friendly interactions
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
                      {/* Asteroid with irregular shape */}
                      <div
                        className={`relative w-16 h-16 sm:w-20 sm:h-20 flex items-center justify-center text-lg sm:text-xl font-bold shadow-2xl ${
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
                        {/* Crater textures */}
                        <div className="absolute inset-0 opacity-30">
                          <div className="absolute w-2 h-2 bg-black rounded-full top-2 left-3 opacity-40"></div>
                          <div className="absolute w-1.5 h-1.5 bg-black rounded-full top-4 right-4 opacity-30"></div>
                          <div className="absolute w-1 h-1 bg-black rounded-full bottom-3 left-2 opacity-50"></div>
                          <div className="absolute w-1 h-1 bg-black rounded-full bottom-2 right-3 opacity-40"></div>
                        </div>

                        {/* Asteroid Emoji and Number */}
                        <div className="relative z-10 flex flex-col items-center justify-center">
                          <div className="text-xl sm:text-2xl mb-0.5 sm:mb-1">
                            {["🪨", "☄️", "🌑", "🌖", "🪨"][index % 5]}
                          </div>
                          <span className="text-base sm:text-lg font-bold drop-shadow-lg">
                            {asteroid.value}
                          </span>
                        </div>

                        {/* Glow effect for unshot asteroids */}
                        {!asteroid.isShot && (
                          <div
                            className="absolute -inset-1 bg-amber-400 opacity-20 animate-pulse"
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

              {/* Feedback - Compact for mobile */}
              <AnimatePresence>
                {gameState.feedback && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    className="text-center px-2"
                  >
                    <div
                      className={`text-sm md:text-xl font-bold p-2 md:p-4 rounded-lg md:rounded-xl inline-block max-w-xs md:max-w-none mx-auto ${
                        gameState.feedback.includes("Complete") ||
                        gameState.feedback.includes("LEVEL")
                          ? "bg-gradient-to-r from-emerald-500/30 to-blue-500/30 text-emerald-300 border-2 border-emerald-400"
                          : gameState.feedback.includes("Correct")
                          ? "bg-green-500/20 text-green-400 border border-green-400"
                          : gameState.feedback.includes("Wrong")
                          ? "bg-red-500/20 text-red-400 border border-red-400"
                          : "bg-blue-500/20 text-blue-300 border border-blue-400"
                      }`}
                    >
                      <span className="block md:hidden text-xs">
                        {gameState.feedback.length > 50
                          ? gameState.feedback.substring(0, 50) + "..."
                          : gameState.feedback}
                      </span>
                      <span className="hidden md:block">
                        {gameState.feedback}
                      </span>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          )}

          {/* Game Over */}
          {gameState.gameOver && (
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-center"
            >
              <Card className="bg-slate-800/90 border-slate-700 p-8 max-w-md mx-auto backdrop-blur">
                <Trophy className="h-16 w-16 text-yellow-400 mx-auto mb-4" />
                <h2 className="text-3xl font-bold text-white mb-4">
                  Mission Failed!
                </h2>
                <p className="text-gray-300 mb-2">
                  Final Score:{" "}
                  <span className="text-blue-400 font-bold text-2xl">
                    {gameState.score}
                  </span>
                </p>
                <p className="text-gray-300 mb-6">
                  Level Reached:{" "}
                  <span className="text-purple-400 font-bold text-xl">
                    {gameState.level}
                  </span>
                </p>

                <div className="flex gap-4 justify-center">
                  <Button
                    onClick={startGame}
                    className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white"
                  >
                    <Play className="h-4 w-4 mr-2" />
                    Try Again
                  </Button>
                  <Button
                    onClick={resetGame}
                    variant="outline"
                    className="border-slate-600 text-slate-300 hover:bg-slate-700"
                  >
                    <RotateCcw className="h-4 w-4 mr-2" />
                    Reset
                  </Button>
                </div>
              </Card>
            </motion.div>
          )}

          {/* Descending Order Introduction */}
          {gameState.showDescendingIntro && (
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
            >
              <Card className="bg-gradient-to-br from-slate-900/95 via-indigo-900/90 to-purple-900/95 border-2 border-yellow-400/50 p-8 max-w-2xl mx-auto backdrop-blur-xl shadow-2xl relative overflow-hidden">
                {/* Background pattern */}
                <div className="absolute inset-0 bg-gradient-to-br from-yellow-400/5 via-transparent to-blue-400/5" />
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,_rgba(255,215,0,0.1),_transparent_50%),radial-gradient(circle_at_70%_80%,_rgba(59,130,246,0.1),_transparent_50%)]" />

                {/* Content */}
                <div className="relative z-10 text-center">
                  {/* Rocket Icon */}
                  <motion.div
                    animate={{
                      rotate: [0, 10, -10, 0],
                      scale: [1, 1.1, 1],
                    }}
                    transition={{
                      duration: 2,
                      repeat: Infinity,
                      ease: "easeInOut",
                    }}
                    className="mb-6"
                  >
                    <div className="text-6xl mb-4">🚀</div>
                  </motion.div>

                  <motion.h2
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ delay: 0.3 }}
                    className="text-4xl font-black text-center mb-4"
                  >
                    <span className="bg-gradient-to-r from-yellow-300 via-orange-400 to-red-400 bg-clip-text text-transparent drop-shadow-lg">
                      NOW DESCENDING ORDER!
                    </span>
                  </motion.h2>

                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5 }}
                    className="space-y-4 mb-8"
                  >
                    <h3 className="text-2xl font-bold text-white mb-4">
                      🔄 New Challenge: Reverse the Order!
                    </h3>

                    <div className="bg-slate-800/60 p-6 rounded-xl border border-blue-400/30">
                      <p className="text-slate-200 text-lg mb-4">
                        Excellent work with ascending order! Now let's try the
                        opposite direction.
                      </p>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                        <div className="bg-green-500/20 border border-green-400/30 p-4 rounded-lg">
                          <div className="flex items-center gap-2 mb-2">
                            <span className="text-2xl">✅</span>
                            <h4 className="font-bold text-green-300">
                              Ascending Complete
                            </h4>
                          </div>
                          <p className="text-green-200 text-sm">
                            Smallest to Largest (1 → 2 → 3)
                          </p>
                        </div>

                        <div className="bg-orange-500/20 border border-orange-400/30 p-4 rounded-lg">
                          <div className="flex items-center gap-2 mb-2">
                            <span className="text-2xl">🎯</span>
                            <h4 className="font-bold text-orange-300">
                              Descending Ready
                            </h4>
                          </div>
                          <p className="text-orange-200 text-sm">
                            Largest to Smallest (3 → 2 → 1)
                          </p>
                        </div>
                      </div>

                      <div className="bg-blue-500/20 border border-blue-400/30 p-4 rounded-lg">
                        <h4 className="font-bold text-blue-300 mb-2">
                          🔄 New Challenge:
                        </h4>
                        <p className="text-blue-200 text-sm">
                          Shoot asteroids from{" "}
                          <strong>LARGEST to SMALLEST</strong> numbers. The
                          sequence will be reversed - start with the biggest
                          number first!
                        </p>
                      </div>
                    </div>
                  </motion.div>

                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.7 }}
                    className="flex flex-col sm:flex-row gap-4 justify-center"
                  >
                    <Button
                      onClick={startDescendingLevel}
                      className="bg-gradient-to-r from-orange-500 via-red-500 to-pink-500 hover:from-orange-600 hover:via-red-600 hover:to-pink-600 text-white font-bold px-8 py-3 text-lg rounded-xl shadow-lg hover:shadow-xl transition-all duration-300"
                    >
                      <Star className="h-5 w-5 mr-2" />
                      Start Descending
                    </Button>

                    <Button
                      onClick={skipDescendingIntro}
                      variant="outline"
                      className="border-2 border-yellow-400/50 text-yellow-300 hover:bg-yellow-400/10 hover:border-yellow-400 font-bold px-8 py-3 text-lg rounded-xl backdrop-blur transition-all duration-300"
                    >
                      Skip Intro
                    </Button>
                  </motion.div>
                </div>
              </Card>
            </motion.div>
          )}

          {/* Game Complete */}
          {gameState.gameComplete && (
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-center"
            >
              <Card className="bg-gradient-to-br from-slate-900/95 via-blue-900/90 to-purple-900/95 border-2 border-yellow-400/50 p-6 max-w-lg mx-auto backdrop-blur-xl shadow-2xl relative overflow-hidden">
                {/* Professional background pattern */}
                <div className="absolute inset-0 bg-gradient-to-br from-yellow-400/5 via-transparent to-blue-400/5" />
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,_rgba(255,215,0,0.1),_transparent_50%),radial-gradient(circle_at_70%_80%,_rgba(59,130,246,0.1),_transparent_50%)]" />

                {/* Real Trophy Emoji */}
                <motion.div
                  animate={{
                    rotate: [0, 5, -5, 0],
                    scale: [1, 1.05, 1],
                  }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                    ease: "easeInOut",
                  }}
                  className="text-center mb-4"
                >
                  <div className="text-6xl mb-2">🏆</div>
                </motion.div>

                <motion.h2
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{
                    scale: [0.8, 1.1, 1],
                    opacity: 1,
                  }}
                  transition={{
                    duration: 1.2,
                    ease: "easeOut",
                  }}
                  className="text-3xl font-black text-center mb-4 relative z-10"
                >
                  <span className="bg-gradient-to-r from-yellow-300 via-yellow-400 to-amber-300 bg-clip-text text-transparent drop-shadow-lg">
                    MISSION ACCOMPLISHED
                  </span>
                </motion.h2>

                <div className="space-y-4 mb-6 relative z-10">
                  <motion.p
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5 }}
                    className="text-slate-200 text-lg font-semibold text-center"
                  >
                    Outstanding! You completed both levels.
                  </motion.p>

                  <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.7 }}
                    className="grid grid-cols-2 gap-3 max-w-sm mx-auto"
                  >
                    <div className="bg-gradient-to-br from-emerald-500/20 to-emerald-600/30 border border-emerald-400/30 px-3 py-2 rounded-lg backdrop-blur">
                      <div className="flex items-center justify-center gap-1">
                        <p className="text-emerald-200 text-sm font-medium">
                          Lvl 1: Compare Numbers
                        </p>
                        <span className="text-emerald-300">✓</span>
                      </div>
                    </div>
                    <div className="bg-gradient-to-br from-blue-500/20 to-blue-600/30 border border-blue-400/30 px-3 py-2 rounded-lg backdrop-blur">
                      <div className="flex items-center justify-center gap-1">
                        <p className="text-blue-200 text-sm font-medium">
                          Lvl 2: Ascending/Descending
                        </p>
                        <span className="text-blue-300">✓</span>
                      </div>
                    </div>
                  </motion.div>

                  <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.9 }}
                    className="bg-gradient-to-br from-slate-800/80 to-slate-900/80 border border-yellow-400/20 p-4 rounded-xl backdrop-blur-sm"
                  >
                    <div className="text-center space-y-2">
                      <div className="flex items-center justify-center gap-2">
                        <Star className="h-5 w-5 text-yellow-400" />
                        <p className="text-slate-300 font-medium">
                          Final Score
                        </p>
                        <Star className="h-5 w-5 text-yellow-400" />
                      </div>
                      <p className="text-yellow-400 font-black text-4xl tracking-wider drop-shadow-lg">
                        {gameState.score}
                      </p>
                      <div className="flex items-center justify-center gap-2 text-slate-400 text-sm">
                        <span>Levels Mastered:</span>
                        <span className="text-emerald-400 font-bold text-xl">
                          {gameState.completedLevels}/2
                        </span>
                      </div>
                    </div>
                  </motion.div>

                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 1.1 }}
                    className="text-center"
                  >
                    <div className="inline-block bg-gradient-to-r from-purple-500/20 to-pink-500/20 border border-purple-400/30 px-4 py-2 rounded-full backdrop-blur">
                      <p className="text-purple-200 text-sm font-medium italic">
                        "Number Comparison Master"
                      </p>
                    </div>
                  </motion.div>
                </div>

                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 1.3 }}
                  className="flex flex-col gap-3 justify-center relative z-10"
                >
                  {/* Download Badge Button */}
                  <Button
                    onClick={downloadCompletionBadge}
                    className="bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 text-white font-bold px-6 py-2 text-base rounded-lg shadow-lg hover:shadow-xl transition-all duration-300 border border-white/20"
                  >
                    <Trophy className="h-4 w-4 mr-2" />
                    Download Completion Badge
                  </Button>

                  <div className="flex gap-3 justify-center">
                    <Button
                      onClick={startGame}
                      className="bg-gradient-to-r from-emerald-500 to-blue-500 hover:from-emerald-600 hover:to-blue-600 text-white font-bold px-6 py-2 text-base rounded-lg shadow-lg hover:shadow-xl transition-all duration-300 border border-white/20"
                    >
                      <Sparkles className="h-4 w-4 mr-2" />
                      Play Again
                    </Button>
                    <Button
                      onClick={resetGame}
                      variant="outline"
                      className="border-2 border-yellow-400/50 text-yellow-300 hover:bg-yellow-400/10 hover:border-yellow-400 font-bold px-6 py-2 text-base rounded-lg backdrop-blur transition-all duration-300"
                    >
                      <RotateCcw className="h-4 w-4 mr-2" />
                      New Game
                    </Button>
                  </div>
                </motion.div>
              </Card>
            </motion.div>
          )}

          {/* Instructions */}
          <Card className="bg-slate-800/80 border-slate-700 p-6 mt-8 backdrop-blur">
            <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
              <Star className="h-5 w-5 text-yellow-400" />
              Mission Briefing:
            </h3>
            <div className="grid md:grid-cols-2 gap-6 text-gray-300">
              <div>
                <h4 className="font-semibold text-blue-400 mb-2">
                  🚀 Your Mission
                </h4>
                <p className="text-sm">
                  Click asteroids with your rocket's laser to shoot them in
                  ascending order (smallest to largest).
                </p>
              </div>
              <div>
                <h4 className="font-semibold text-emerald-400 mb-2">
                  🎯 Sequence Bucket
                </h4>
                <p className="text-sm">
                  Successfully shot numbers appear in your sequence bucket in
                  the correct order.
                </p>
              </div>
              <div>
                <h4 className="font-semibold text-purple-400 mb-2">
                  📈 Level Up
                </h4>
                <p className="text-sm">
                  Complete sequences to earn points. Higher levels have more
                  asteroids to sort!
                </p>
              </div>
              <div>
                <h4 className="font-semibold text-red-400 mb-2">❤️ Lives</h4>
                <p className="text-sm">
                  Shooting asteroids out of order costs a life. Complete the
                  sequence before running out!
                </p>
              </div>
            </div>
          </Card>
        </div>
      </section>
    </div>
  );
}
