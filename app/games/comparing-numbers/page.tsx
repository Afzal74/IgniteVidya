"use client";

import { useState, useEffect, useRef } from "react";
import {
  ArrowLeft,
  Trophy,
  RotateCcw,
  Play,
  Zap,
  ArrowRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import RocketAscendingGame from "./rocket-game";

type DraggableNumber = {
  id: string;
  value: number;
  isDragging: boolean;
  isCorrect: boolean | null;
  isDropped: boolean;
  droppedIn: string | null;
};

type DropBucket = {
  id: string;
  label: string;
  type: "greater" | "smaller" | "equal";
  color: string;
  isHovered: boolean;
  droppedNumber: number | null;
};

export default function ComparingNumbersGame() {
  const audioContext = useRef<AudioContext | null>(null);
  const gameAreaRef = useRef<HTMLDivElement>(null);
  const animationFrameRef = useRef<number>();

  const [gameState, setGameState] = useState({
    score: 0,
    level: 1,
    lives: 3,
    isPlaying: false,
    gameOver: false,
    feedback: "",
    streak: 0,
    combo: 0,
    isAnswered: false,
    showNextGame: false,
    canAdvanceToNextGame: false,
    gameType: "drag-drop",
  });

  const [numbers, setNumbers] = useState<DraggableNumber[]>([]);
  const [buckets, setBuckets] = useState<DropBucket[]>([
    {
      id: "greater",
      label: "Greater",
      type: "greater",
      color: "emerald",
      isHovered: false,
      droppedNumber: null,
    },
    {
      id: "equal",
      label: "Equal",
      type: "equal",
      color: "amber",
      isHovered: false,
      droppedNumber: null,
    },
    {
      id: "smaller",
      label: "Smaller",
      type: "smaller",
      color: "rose",
      isHovered: false,
      droppedNumber: null,
    },
  ]);
  const [draggedItem, setDraggedItem] = useState<{
    id: string | null;
    value: number | null;
  }>({ id: null, value: null });
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

  // Initialize game
  useEffect(() => {
    if (gameState.isPlaying && !gameState.isAnswered) {
      generateNewNumbers();
    }
  }, [gameState.isPlaying, gameState.isAnswered]);

  // Particle animation loop
  useEffect(() => {
    const interval = setInterval(() => {
      setParticles((prev) =>
        prev
          .map((p) => ({
            ...p,
            x: p.x + p.vx,
            y: p.y + p.vy,
            vy: p.vy + 0.5, // gravity
            life: p.life - 1,
          }))
          .filter((p) => p.life > 0)
      );
    }, 16);

    return () => clearInterval(interval);
  }, []);

  const generateNewNumbers = () => {
    let num1 = Math.floor(Math.random() * 10) + 1;
    let num2 = Math.floor(Math.random() * 10) + 1;

    // 20% chance for equal numbers
    if (Math.random() < 0.2) {
      num2 = num1;
    }

    const newNumbers = [
      {
        id: "num1",
        value: num1,
        isDragging: false,
        isCorrect: null,
        isDropped: false,
        droppedIn: null,
      },
      {
        id: "num2",
        value: num2,
        isDragging: false,
        isCorrect: null,
        isDropped: false,
        droppedIn: null,
      },
    ];

    setNumbers(newNumbers);
    setBuckets((prev) =>
      prev.map((bucket) => ({
        ...bucket,
        droppedNumber: null,
        isHovered: false,
      }))
    );
    setGameState((prev) => ({ ...prev, feedback: "", isAnswered: false }));
  };

  // Improved sound system with pleasant tones
  const playSound = (
    type: "correct" | "wrong" | "drop" | "pickup",
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

      if (type === "correct") {
        // Pleasant chime sound
        oscillator.type = "sine";
        oscillator.frequency.setValueAtTime(523.25 * pitch, ctx.currentTime); // C5
        oscillator.frequency.setValueAtTime(
          659.25 * pitch,
          ctx.currentTime + 0.1
        ); // E5
        oscillator.frequency.setValueAtTime(
          783.99 * pitch,
          ctx.currentTime + 0.2
        ); // G5
        gainNode.gain.setValueAtTime(0.05, ctx.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(
          0.001,
          ctx.currentTime + 0.3
        );
        oscillator.start(ctx.currentTime);
        oscillator.stop(ctx.currentTime + 0.3);
      } else if (type === "wrong") {
        // Soft incorrect sound
        oscillator.type = "sine";
        oscillator.frequency.setValueAtTime(220, ctx.currentTime);
        oscillator.frequency.exponentialRampToValueAtTime(
          110,
          ctx.currentTime + 0.3
        );
        gainNode.gain.setValueAtTime(0.03, ctx.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(
          0.001,
          ctx.currentTime + 0.3
        );
        oscillator.start(ctx.currentTime);
        oscillator.stop(ctx.currentTime + 0.3);
      } else if (type === "drop") {
        // Soft drop sound
        oscillator.type = "sine";
        oscillator.frequency.setValueAtTime(400, ctx.currentTime);
        gainNode.gain.setValueAtTime(0.03, ctx.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(
          0.001,
          ctx.currentTime + 0.1
        );
        oscillator.start(ctx.currentTime);
        oscillator.stop(ctx.currentTime + 0.1);
      } else if (type === "pickup") {
        // Soft pickup sound
        oscillator.type = "sine";
        oscillator.frequency.setValueAtTime(600, ctx.currentTime);
        gainNode.gain.setValueAtTime(0.02, ctx.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(
          0.001,
          ctx.currentTime + 0.05
        );
        oscillator.start(ctx.currentTime);
        oscillator.stop(ctx.currentTime + 0.05);
      }
    } catch (error) {
      console.log("Audio context error:", error);
    }
  };

  const createParticles = (x: number, y: number, color = "#FFD700") => {
    const colors = [
      "#FFD700",
      "#FF6B6B",
      "#4ECDC4",
      "#45B7D1",
      "#96CEB4",
      "#FFEAA7",
    ];
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

    for (let i = 0; i < 12; i++) {
      newParticles.push({
        id: `particle-${baseId}-${i}`,
        x: x + (Math.random() - 0.5) * 20,
        y: y + (Math.random() - 0.5) * 20,
        vx: (Math.random() - 0.5) * 8,
        vy: (Math.random() - 0.5) * 8 - 3,
        life: 60,
        maxLife: 60,
        color: colors[Math.floor(Math.random() * colors.length)],
        size: Math.random() * 3 + 2,
      });
    }
    setParticles((prev) => [...prev, ...newParticles]);
  };

  const handleDrop = (bucketType: string, numberValue: number) => {
    const [num1, num2] = numbers.map((n) => n.value);

    let isCorrect = false;

    // Check if the drop is correct based on bucket type and number comparison
    if (bucketType === "greater") {
      // For greater bucket, check if this number is larger than the other
      const otherNumber = numbers.find((n) => n.value !== numberValue)?.value;
      if (otherNumber !== undefined) {
        isCorrect = numberValue > otherNumber;
      }
    } else if (bucketType === "smaller") {
      // For smaller bucket, check if this number is smaller than the other
      const otherNumber = numbers.find((n) => n.value !== numberValue)?.value;
      if (otherNumber !== undefined) {
        isCorrect = numberValue < otherNumber;
      }
    } else if (bucketType === "equal") {
      // For equal bucket, check if both numbers are the same
      isCorrect = num1 === num2;
    }

    // Update the bucket with the dropped number
    setBuckets((prev) =>
      prev.map((bucket) =>
        bucket.type === bucketType
          ? { ...bucket, droppedNumber: numberValue, isHovered: false }
          : bucket
      )
    );

    // Update the number as dropped
    setNumbers((prev) =>
      prev.map((n) =>
        n.value === numberValue
          ? { ...n, isDropped: true, droppedIn: bucketType, isCorrect }
          : n
      )
    );

    if (isCorrect) {
      const points = Math.floor(
        15 + gameState.level * 5 + gameState.streak * 3
      );
      const combo = gameState.combo + 1;
      const bonusPoints = combo > 3 ? combo * 2 : 0;

      setGameState((prev) => ({
        ...prev,
        score: prev.score + points + bonusPoints,
        feedback: `Perfect! +${points + bonusPoints} points${
          combo > 3 ? ` (${combo}x combo!)` : ""
        }`,
        streak: prev.streak + 1,
        combo: combo,
        isAnswered: true,
      }));

      playSound("correct", 1 + combo * 0.1);
      createParticles(400, 300);

      // Check level up
      const newScore = gameState.score + points + bonusPoints;
      const shouldLevelUp = newScore >= gameState.level * 100;

      if (shouldLevelUp) {
        const newLevel = gameState.level + 1;

        // Level up celebration
        playSound("correct", 1.5); // Higher pitch for level up

        // Create particles with delays to avoid duplicate keys
        setTimeout(() => createParticles(400, 200), 0);
        setTimeout(() => createParticles(200, 300), 50);
        setTimeout(() => createParticles(600, 300), 100);

        // Check if player can advance to next game type (every level after Level 1)
        const canAdvance = newLevel > 1;

        console.log("Level up!", {
          newLevel,
          canAdvance,
          showNextGame: canAdvance,
        }); // Debug log

        setGameState((prev) => ({
          ...prev,
          level: newLevel,
          score: newScore, // Make sure to update the score
          feedback: canAdvance
            ? `🎉 LEVEL ${newLevel} COMPLETE! Ready for a new challenge! 🎉`
            : `🎉 LEVEL UP! Welcome to Level ${newLevel}! 🎉`,
          canAdvanceToNextGame: canAdvance,
          showNextGame: canAdvance,
        }));

        // Show modal after celebration if advancing
        if (canAdvance) {
          setTimeout(() => {
            console.log("Should show next game modal now"); // Debug log
            // Modal should be visible now due to showNextGame being true
          }, 1000);
        }

        // Longer delay for level up celebration
        setTimeout(
          () => {
            if (!canAdvance) {
              // Only clear if not advancing to prevent modal from disappearing
              setGameState((prev) => ({ ...prev, isAnswered: false }));
            }
          },
          canAdvance ? 4000 : 3000
        );
      } else {
        // Next round after delay
        setTimeout(() => {
          setGameState((prev) => ({ ...prev, isAnswered: false }));
        }, 2000);
      }
    } else {
      setGameState((prev) => ({
        ...prev,
        lives: prev.lives - 1,
        feedback: "Not quite right. Try again!",
        streak: 0,
        combo: 0,
        isAnswered: true,
      }));

      playSound("wrong");

      if (gameState.lives <= 1) {
        setGameState((prev) => ({
          ...prev,
          isPlaying: false,
          gameOver: true,
        }));
      } else {
        setTimeout(() => {
          setGameState((prev) => ({ ...prev, isAnswered: false }));
        }, 1500);
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
      isAnswered: false,
      showNextGame: false,
      canAdvanceToNextGame: false,
      gameType: "drag-drop",
    });
    setParticles([]);
  };

  const continueCurrentGame = () => {
    setGameState((prev) => ({
      ...prev,
      showNextGame: false,
      canAdvanceToNextGame: false,
      isAnswered: false,
    }));
  };

  const handleNextGameType = () => {
    // Switch to space rocket ascending order game
    setGameState((prev) => ({
      ...prev,
      showNextGame: false,
      gameType: "rocket-ascending",
      isAnswered: false,
    }));
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
      isAnswered: false,
      showNextGame: false,
      canAdvanceToNextGame: false,
      gameType: "drag-drop",
    });
    setNumbers([]);
    setParticles([]);
  };

  const handleBackToMainGame = () => {
    setGameState((prev) => ({
      ...prev,
      gameType: "drag-drop",
      isPlaying: false,
      gameOver: false,
      showNextGame: false,
      canAdvanceToNextGame: false,
    }));
  };

  // If rocket game is selected, render that instead
  if (gameState.gameType === "rocket-ascending") {
    return <RocketAscendingGame onBackToMainGame={handleBackToMainGame} />;
  }

  return (
    <div className="min-h-screen bg-gray-900 relative overflow-hidden">
      {/* Game Particles */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none z-10">
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

      <section className="pt-8 sm:pt-12 md:pt-16 pb-4 sm:pb-6 md:pb-8 px-2 sm:px-4 md:px-6 relative">
        <div className="max-w-6xl mx-auto">
          {/* Back Button */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
            className="mb-4"
          >
            <Link href="/grade/6/mathematics/knowing-our-numbers">
              <Button
                variant="outline"
                size="sm"
                className="border-gray-700 hover:bg-gray-800 text-gray-300"
              >
                <ArrowLeft className="h-3 w-3 mr-1" />
                Back
              </Button>
            </Link>
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
                Number Comparison Challenge
              </span>
            </div>
            <h1 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold leading-tight text-white mb-2">
              Compare the Numbers!
            </h1>
            <p className="text-gray-400 text-xs sm:text-sm">
              Drag numbers to their correct category
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
              <div className="mt-1 w-full bg-gray-700 rounded-full h-1">
                <div
                  className="bg-gradient-to-r from-purple-500 to-pink-500 h-1 rounded-full transition-all duration-500"
                  style={{
                    width: `${Math.min(
                      100,
                      ((gameState.score % (gameState.level * 100)) /
                        (gameState.level * 100)) *
                        100
                    )}%`,
                  }}
                ></div>
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
          {!gameState.isPlaying && !gameState.gameOver && (
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
                Start Challenge
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
              {/* Numbers to Compare */}
              <div className="bg-gray-800/90 backdrop-blur-sm rounded-2xl p-4 sm:p-6 border border-gray-700">
                <h2 className="text-sm sm:text-base md:text-lg font-semibold text-white mb-3 sm:mb-4 text-center">
                  Drag the numbers to the correct buckets:
                </h2>
                <div className="flex justify-center gap-4 sm:gap-6 md:gap-8">
                  {numbers
                    .filter((n) => !n.isDropped)
                    .map((number, index) => (
                      <motion.div
                        key={number.id}
                        className={`
                          w-14 h-14 sm:w-18 sm:h-18 md:w-24 md:h-24 rounded-xl flex items-center justify-center text-xl sm:text-2xl md:text-4xl font-bold shadow-xl transform transition-all select-none border-2
                          ${
                            number.isDragging
                              ? "bg-gradient-to-br from-purple-500 to-pink-500 text-white shadow-purple-400/50 scale-110 rotate-2 cursor-grabbing border-purple-400"
                              : "bg-gray-700 text-white hover:shadow-2xl hover:scale-105 hover:bg-gradient-to-br hover:from-purple-600 hover:to-pink-600 cursor-pointer hover:cursor-grab border-gray-600 hover:border-purple-400"
                          }
                        `}
                        initial={{ scale: 0, rotate: -180 }}
                        animate={{ scale: 1, rotate: 0 }}
                        transition={{
                          delay: index * 0.3,
                          type: "spring",
                          stiffness: 200,
                        }}
                        draggable
                        onDragStart={(e) => {
                          playSound("pickup");
                          setDraggedItem({
                            id: number.id,
                            value: number.value,
                          });
                          setNumbers((prev) =>
                            prev.map((n) =>
                              n.id === number.id
                                ? { ...n, isDragging: true }
                                : n
                            )
                          );
                        }}
                        onDragEnd={() => {
                          setNumbers((prev) =>
                            prev.map((n) => ({ ...n, isDragging: false }))
                          );
                          setDraggedItem({ id: null, value: null });
                        }}
                      >
                        {number.value}
                      </motion.div>
                    ))}
                </div>
              </div>

              {/* Bucket Drop Zones */}
              <div className="grid grid-cols-3 gap-2 sm:gap-4 md:gap-6">
                {buckets.map((bucket, index) => (
                  <motion.div
                    key={bucket.id}
                    className={`
                      relative min-h-[100px] sm:min-h-[130px] md:min-h-[160px] rounded-xl sm:rounded-2xl p-3 sm:p-4 md:p-6 text-center flex flex-col justify-center backdrop-blur transition-all duration-300 overflow-hidden border-2
                      ${
                        bucket.color === "emerald"
                          ? "bg-emerald-500/10 border-emerald-500/30 hover:border-emerald-400"
                          : bucket.color === "amber"
                          ? "bg-amber-500/10 border-amber-500/30 hover:border-amber-400"
                          : "bg-rose-500/10 border-rose-500/30 hover:border-rose-400"
                      }
                      ${
                        bucket.isHovered
                          ? "scale-105 shadow-lg border-dashed border-4"
                          : "hover:scale-102 shadow-md"
                      }
                    `}
                    initial={{ opacity: 0, y: 50 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5 + index * 0.2 }}
                    onDragOver={(e) => {
                      e.preventDefault();
                      setBuckets((prev) =>
                        prev.map((b) =>
                          b.id === bucket.id
                            ? { ...b, isHovered: true }
                            : { ...b, isHovered: false }
                        )
                      );
                    }}
                    onDragLeave={() => {
                      setBuckets((prev) =>
                        prev.map((b) => ({ ...b, isHovered: false }))
                      );
                    }}
                    onDrop={(e) => {
                      e.preventDefault();
                      setBuckets((prev) =>
                        prev.map((b) => ({ ...b, isHovered: false }))
                      );

                      if (draggedItem.value !== null) {
                        playSound("drop");
                        handleDrop(bucket.type, draggedItem.value);
                      }
                    }}
                  >
                    {/* Bucket Icon */}
                    <div className="mb-1 sm:mb-2 md:mb-3">
                      <div
                        className={`w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 rounded-full mx-auto flex items-center justify-center ${
                          bucket.color === "emerald"
                            ? "bg-emerald-500/20 border border-emerald-500/30"
                            : bucket.color === "amber"
                            ? "bg-amber-500/20 border border-amber-500/30"
                            : "bg-rose-500/20 border border-rose-500/30"
                        }`}
                      >
                        <span className="text-lg sm:text-xl md:text-2xl">
                          {bucket.type === "greater"
                            ? ">"
                            : bucket.type === "equal"
                            ? "="
                            : "<"}
                        </span>
                      </div>
                    </div>

                    {/* Bucket Label */}
                    <h3
                      className={`text-xs sm:text-sm md:text-lg font-bold mb-0.5 sm:mb-1 ${
                        bucket.color === "emerald"
                          ? "text-emerald-400"
                          : bucket.color === "amber"
                          ? "text-amber-400"
                          : "text-rose-400"
                      }`}
                    >
                      {bucket.label}
                    </h3>

                    {/* Description */}
                    <p className="text-[10px] sm:text-xs text-gray-400 hidden sm:block">
                      {bucket.type === "greater"
                        ? "Larger number"
                        : bucket.type === "equal"
                        ? "Same numbers"
                        : "Smaller number"}
                    </p>

                    {/* Dropped Number Display */}
                    {bucket.droppedNumber !== null && (
                      <motion.div
                        initial={{ scale: 0, rotate: 180 }}
                        animate={{ scale: 1, rotate: 0 }}
                        className={`
                          absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-10 h-10 sm:w-14 sm:h-14 md:w-16 md:h-16 rounded-xl flex items-center justify-center text-base sm:text-xl md:text-2xl font-bold shadow-2xl
                          ${
                            numbers.find(
                              (n) => n.value === bucket.droppedNumber
                            )?.isCorrect === true
                              ? "bg-gradient-to-br from-green-400 to-green-600 text-white"
                              : numbers.find(
                                  (n) => n.value === bucket.droppedNumber
                                )?.isCorrect === false
                              ? "bg-gradient-to-br from-red-400 to-red-600 text-white"
                              : "bg-gradient-to-br from-purple-400 to-pink-600 text-white"
                          }
                        `}
                      >
                        {bucket.droppedNumber}
                      </motion.div>
                    )}
                  </motion.div>
                ))}
              </div>

              {/* Feedback */}
              <AnimatePresence>
                {gameState.feedback && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.5 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.5 }}
                    className="text-center"
                  >
                    <div
                      className={`text-sm sm:text-base md:text-lg font-bold px-4 py-2 sm:px-6 sm:py-3 rounded-xl inline-block ${
                        gameState.feedback.includes("LEVEL")
                          ? "bg-purple-500/20 text-purple-300 border border-purple-500/30"
                          : gameState.feedback.includes("Perfect")
                          ? "bg-green-500/20 text-green-400 border border-green-500/30"
                          : "bg-red-500/20 text-red-400 border border-red-500/30"
                      }`}
                    >
                      {gameState.feedback}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          )}

          {/* Next Game Type Modal */}
          {gameState.showNextGame && (
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4"
            >
              <div className="bg-gray-800/95 border border-purple-500/50 rounded-2xl p-6 sm:p-8 max-w-lg mx-auto backdrop-blur shadow-2xl">
                <div className="text-center">
                  <Zap className="h-16 w-16 sm:h-20 sm:w-20 text-yellow-400 mx-auto mb-4 animate-pulse" />
                  <h2 className="text-2xl sm:text-3xl font-bold text-white mb-3">
                    🎉 Milestone Reached! 🎉
                  </h2>
                  <p className="text-base sm:text-lg text-purple-300 mb-2">
                    Congratulations! You've completed Level {gameState.level}!
                  </p>
                  <p className="text-gray-400 text-sm mb-4">
                    You've unlocked the next challenge!
                  </p>

                  <div className="bg-purple-500/10 border border-purple-500/30 rounded-xl p-4 mb-6">
                    <h3 className="text-sm sm:text-base font-bold text-white mb-2">
                      🚀 Ready for the next adventure?
                    </h3>
                    <p className="text-xs sm:text-sm text-gray-300">
                      Continue or try a new challenge type!
                    </p>
                  </div>

                  <div className="flex flex-col sm:flex-row gap-3 justify-center">
                    <Button
                      onClick={handleNextGameType}
                      className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white px-6 py-3 rounded-xl font-semibold"
                    >
                      <ArrowRight className="h-4 w-4 mr-2" />
                      Next Game
                    </Button>
                    <Button
                      onClick={continueCurrentGame}
                      variant="outline"
                      className="border-gray-600 text-gray-300 hover:bg-gray-700 px-6 py-3 rounded-xl"
                    >
                      <Play className="h-4 w-4 mr-2" />
                      Continue
                    </Button>
                  </div>
                </div>
              </div>
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
                  Challenge Complete!
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
                    Play Again
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

          {/* How to Play Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.5 }}
            className="mt-4 sm:mt-6 pb-4 sm:pb-8"
          >
            <h3 className="text-base sm:text-lg font-bold text-white mb-3 sm:mb-4 text-center">
              How to Play
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2 sm:gap-3">
              <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-3 sm:p-4 border border-gray-700 text-center">
                <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-purple-500/20 border border-purple-500/30 flex items-center justify-center mx-auto mb-2">
                  <span className="text-base sm:text-lg">🎯</span>
                </div>
                <h4 className="text-white font-semibold mb-1 text-xs sm:text-sm">
                  Drag & Drop
                </h4>
                <p className="text-gray-400 text-[10px] sm:text-xs">
                  Drag numbers to correct zones
                </p>
              </div>

              <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-3 sm:p-4 border border-gray-700 text-center">
                <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-purple-500/20 border border-purple-500/30 flex items-center justify-center mx-auto mb-2">
                  <span className="text-base sm:text-lg">⭐</span>
                </div>
                <h4 className="text-white font-semibold mb-1 text-xs sm:text-sm">
                  Build Combos
                </h4>
                <p className="text-gray-400 text-[10px] sm:text-xs">
                  Chain correct answers
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
                  Reach score milestones
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
                  Streaks give bonus points
                </p>
              </div>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
