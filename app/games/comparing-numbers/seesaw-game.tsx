"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, Trophy, Star, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function SeesawGame() {
  const [leftNumber, setLeftNumber] = useState(0);
  const [rightNumber, setRightNumber] = useState(0);
  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);
  const [level, setLevel] = useState(1);
  const [showFeedback, setShowFeedback] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const [hasAnswered, setHasAnswered] = useState(false);
  const [showLevelUp, setShowLevelUp] = useState(false);

  const generateNumbers = () => {
    const max = Math.min(10 + level * 10, 100);
    const num1 = Math.floor(Math.random() * max) + 1;
    const num2 = Math.floor(Math.random() * max) + 1;
    setLeftNumber(num1);
    setRightNumber(num2);
    setHasAnswered(false);
  };

  useEffect(() => {
    generateNumbers();
  }, [level]);

  const getSeesawRotation = () => {
    if (!hasAnswered) return 0;
    if (leftNumber > rightNumber) return -15;
    if (rightNumber > leftNumber) return 15;
    return 0;
  };

  const handleAnswer = (answer: "left" | "right" | "equal") => {
    if (hasAnswered) return;

    setHasAnswered(true);
    let correct = false;

    if (answer === "left" && leftNumber > rightNumber) correct = true;
    if (answer === "right" && rightNumber > leftNumber) correct = true;
    if (answer === "equal" && leftNumber === rightNumber) correct = true;

    setIsCorrect(correct);
    setShowFeedback(true);

    if (correct) {
      setScore(score + 10);
      setStreak(streak + 1);

      if ((streak + 1) % 5 === 0) {
        setLevel(level + 1);
        setShowLevelUp(true);
        setTimeout(() => setShowLevelUp(false), 2000);
      }
    } else {
      setStreak(0);
    }

    setTimeout(() => {
      setShowFeedback(false);
      generateNumbers();
    }, 2000);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 via-purple-900 to-pink-900 text-white pt-20 pb-10">
      <div className="max-w-6xl mx-auto px-4">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <Link href="/games/comparing-numbers">
            <Button variant="ghost" className="text-white hover:bg-white/20">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Button>
          </Link>

          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2 bg-white/10 px-4 py-2 rounded-lg backdrop-blur">
              <Trophy className="h-5 w-5 text-yellow-400" />
              <span className="font-bold">{score}</span>
            </div>
            <div className="flex items-center gap-2 bg-white/10 px-4 py-2 rounded-lg backdrop-blur">
              <Star className="h-5 w-5 text-orange-400" />
              <span className="font-bold">Level {level}</span>
            </div>
            <div className="flex items-center gap-2 bg-white/10 px-4 py-2 rounded-lg backdrop-blur">
              <span className="text-sm">Streak: {streak}</span>
            </div>
          </div>
        </div>

        {/* Title */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-black mb-2">
            ⚖️ SEESAW CHALLENGE
          </h1>
          <p className="text-lg text-white/80">Which number is heavier?</p>
        </div>

        {/* Seesaw Container */}
        <div className="relative h-[450px] flex items-center justify-center mb-12">
          {/* Seesaw */}
          <motion.div
            className="relative w-full max-w-3xl"
            animate={{ rotate: getSeesawRotation() }}
            transition={{ type: "spring", stiffness: 80, damping: 12 }}
          >
            {/* Seesaw Plank with 3D effect */}
            <div className="relative h-12 bg-gradient-to-b from-amber-500 via-amber-600 to-amber-700 rounded-2xl shadow-2xl">
              {/* Plank shine effect */}
              <div className="absolute inset-0 bg-gradient-to-b from-white/30 to-transparent rounded-2xl" />
              
              {/* Circular ends */}
              <div className="absolute -left-6 top-1/2 -translate-y-1/2 w-12 h-12 bg-gradient-to-br from-amber-500 to-amber-700 rounded-full shadow-lg" />
              <div className="absolute -right-6 top-1/2 -translate-y-1/2 w-12 h-12 bg-gradient-to-br from-amber-500 to-amber-700 rounded-full shadow-lg" />
              
              {/* Left Side Box */}
              <motion.div
                className="absolute -top-32 left-12 w-40 h-40 bg-gradient-to-br from-blue-400 via-blue-500 to-blue-600 rounded-3xl shadow-2xl flex items-center justify-center border-4 border-blue-300/50"
                animate={{
                  y: hasAnswered && leftNumber > rightNumber ? 60 : 0,
                  scale: hasAnswered && leftNumber > rightNumber ? 1.05 : 1,
                }}
                transition={{ type: "spring", stiffness: 80, damping: 10 }}
                style={{
                  boxShadow: "0 20px 60px rgba(59, 130, 246, 0.5), inset 0 -10px 20px rgba(0,0,0,0.2)",
                }}
              >
                {/* Inner glow */}
                <div className="absolute inset-0 bg-gradient-to-br from-white/40 to-transparent rounded-3xl" />
                <span className="text-7xl font-black text-white drop-shadow-2xl relative z-10">{leftNumber}</span>
                {/* Weight indicator */}
                {hasAnswered && leftNumber > rightNumber && (
                  <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="absolute -bottom-8 text-2xl"
                  >
                    ⬇️
                  </motion.div>
                )}
              </motion.div>

              {/* Right Side Box */}
              <motion.div
                className="absolute -top-32 right-12 w-40 h-40 bg-gradient-to-br from-pink-400 via-pink-500 to-pink-600 rounded-3xl shadow-2xl flex items-center justify-center border-4 border-pink-300/50"
                animate={{
                  y: hasAnswered && rightNumber > leftNumber ? 60 : 0,
                  scale: hasAnswered && rightNumber > leftNumber ? 1.05 : 1,
                }}
                transition={{ type: "spring", stiffness: 80, damping: 10 }}
                style={{
                  boxShadow: "0 20px 60px rgba(236, 72, 153, 0.5), inset 0 -10px 20px rgba(0,0,0,0.2)",
                }}
              >
                {/* Inner glow */}
                <div className="absolute inset-0 bg-gradient-to-br from-white/40 to-transparent rounded-3xl" />
                <span className="text-7xl font-black text-white drop-shadow-2xl relative z-10">{rightNumber}</span>
                {/* Weight indicator */}
                {hasAnswered && rightNumber > leftNumber && (
                  <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="absolute -bottom-8 text-2xl"
                  >
                    ⬇️
                  </motion.div>
                )}
              </motion.div>
            </div>

            {/* Center Triangle (Fulcrum) with 3D effect */}
            <div className="absolute left-1/2 -translate-x-1/2 top-12">
              <div className="relative">
                {/* Shadow */}
                <div className="absolute top-16 left-1/2 -translate-x-1/2 w-24 h-4 bg-black/30 rounded-full blur-md" />
                {/* Triangle */}
                <div className="w-0 h-0 border-l-[50px] border-l-transparent border-r-[50px] border-r-transparent border-b-[80px] border-b-gray-700 relative">
                  <div className="absolute top-0 left-1/2 -translate-x-1/2 w-0 h-0 border-l-[45px] border-l-transparent border-r-[45px] border-r-transparent border-b-[72px] border-b-gray-600" />
                </div>
              </div>
            </div>
          </motion.div>

          {/* Ground/Base */}
          <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-full max-w-4xl h-2 bg-gradient-to-r from-transparent via-gray-600 to-transparent rounded-full" />
        </div>

        {/* Answer Buttons */}
        <div className="flex flex-wrap justify-center gap-4 mb-8 px-4">
          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
            <Button
              onClick={() => handleAnswer("left")}
              disabled={hasAnswered}
              className="h-16 px-10 text-lg font-bold bg-gradient-to-br from-blue-400 to-blue-600 hover:from-blue-500 hover:to-blue-700 disabled:opacity-50 shadow-xl border-2 border-blue-300/50 disabled:cursor-not-allowed"
              style={{
                boxShadow: "0 10px 30px rgba(59, 130, 246, 0.4)",
              }}
            >
              ⬅️ Left is Heavier
            </Button>
          </motion.div>
          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
            <Button
              onClick={() => handleAnswer("equal")}
              disabled={hasAnswered}
              className="h-16 px-10 text-lg font-bold bg-gradient-to-br from-yellow-400 to-orange-500 hover:from-yellow-500 hover:to-orange-600 disabled:opacity-50 shadow-xl border-2 border-yellow-300/50 text-white disabled:cursor-not-allowed"
              style={{
                boxShadow: "0 10px 30px rgba(251, 191, 36, 0.4)",
              }}
            >
              ⚖️ Equal
            </Button>
          </motion.div>
          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
            <Button
              onClick={() => handleAnswer("right")}
              disabled={hasAnswered}
              className="h-16 px-10 text-lg font-bold bg-gradient-to-br from-pink-400 to-pink-600 hover:from-pink-500 hover:to-pink-700 disabled:opacity-50 shadow-xl border-2 border-pink-300/50 disabled:cursor-not-allowed"
              style={{
                boxShadow: "0 10px 30px rgba(236, 72, 153, 0.4)",
              }}
            >
              Right is Heavier ➡️
            </Button>
          </motion.div>
        </div>

        {/* Feedback */}
        <AnimatePresence>
          {showFeedback && (
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              className="text-center"
            >
              <div
                className={`inline-block px-8 py-4 rounded-2xl text-2xl font-bold ${
                  isCorrect
                    ? "bg-green-500 text-white"
                    : "bg-red-500 text-white"
                }`}
              >
                {isCorrect ? "🎉 Correct!" : "❌ Try Again!"}
              </div>
              {isCorrect && (
                <p className="mt-2 text-lg">
                  {leftNumber > rightNumber
                    ? `${leftNumber} > ${rightNumber}`
                    : rightNumber > leftNumber
                    ? `${rightNumber} > ${leftNumber}`
                    : `${leftNumber} = ${rightNumber}`}
                </p>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Level Up Celebration */}
        <AnimatePresence>
          {showLevelUp && (
            <motion.div
              initial={{ opacity: 0, scale: 0.5, y: 50 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.5, y: -50 }}
              className="fixed inset-0 flex items-center justify-center pointer-events-none z-50"
            >
              <div className="relative">
                <motion.div
                  animate={{
                    rotate: [0, 360],
                    scale: [1, 1.2, 1],
                  }}
                  transition={{
                    duration: 1,
                    repeat: 2,
                  }}
                  className="text-8xl font-black text-yellow-400"
                >
                  🎉
                </motion.div>
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="absolute -bottom-16 left-1/2 -translate-x-1/2 whitespace-nowrap"
                >
                  <div className="bg-gradient-to-r from-yellow-400 to-orange-500 text-white px-8 py-4 rounded-2xl text-3xl font-black shadow-2xl">
                    LEVEL {level} UNLOCKED!
                  </div>
                </motion.div>
                {/* Sparkles */}
                {[...Array(8)].map((_, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, scale: 0 }}
                    animate={{
                      opacity: [0, 1, 0],
                      scale: [0, 1, 0],
                      x: Math.cos((i * Math.PI * 2) / 8) * 100,
                      y: Math.sin((i * Math.PI * 2) / 8) * 100,
                    }}
                    transition={{
                      duration: 1,
                      delay: i * 0.1,
                    }}
                    className="absolute top-1/2 left-1/2"
                  >
                    <Sparkles className="h-8 w-8 text-yellow-400" />
                  </motion.div>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Instructions */}
        <div className="mt-12 text-center text-white/60 text-sm">
          <p>
            Watch the seesaw tilt! The heavier number makes its side go down.
          </p>
          <p className="mt-1">Get 5 in a row correct to level up! 🚀</p>
        </div>
      </div>
    </div>
  );
}
