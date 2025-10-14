"use client";

import { useState, useEffect } from "react";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { motion } from "framer-motion";

type NumberPair = {
  num1: number;
  num2: number;
};

type DraggableSymbol = {
  id: string;
  symbol: string;
  correctAnswer: string;
};

export default function ComparingNumbersGamePage() {
  const [mounted, setMounted] = useState(false);
  const [draggedItem, setDraggedItem] = useState<string | null>(null);
  const [slot, setSlot] = useState<string | null>(null);
  const [availableSymbols] = useState<DraggableSymbol[]>([
    { id: "greater", symbol: ">", correctAnswer: ">" },
    { id: "equal", symbol: "=", correctAnswer: "=" },
    { id: "smaller", symbol: "<", correctAnswer: "<" },
  ]);
  const [progress, setProgress] = useState(0);
  const [isComplete, setIsComplete] = useState(false);
  const [currentPair, setCurrentPair] = useState<NumberPair>({ num1: 0, num2: 0 });
  const [score, setScore] = useState(0);
  const [attempts, setAttempts] = useState(0);

  useEffect(() => {
    setMounted(true);
    generateNewPair();
  }, []);

  useEffect(() => {
    if (slot !== null) {
      checkAnswer();
    }
  }, [slot]);

  const generateNewPair = () => {
    const num1 = Math.floor(Math.random() * 100) + 1;
    const num2 = Math.floor(Math.random() * 100) + 1;
    setCurrentPair({ num1, num2 });
    setSlot(null);
    setIsComplete(false);
  };

  const getCorrectSymbol = () => {
    if (currentPair.num1 > currentPair.num2) return ">";
    if (currentPair.num1 < currentPair.num2) return "<";
    return "=";
  };

  const checkAnswer = () => {
    const correctSymbol = getCorrectSymbol();
    if (slot === correctSymbol) {
      setIsComplete(true);
      setScore(score + 1);
      setProgress(100);
    }
  };

  const handleDragStart = (symbolId: string) => {
    setDraggedItem(symbolId);
  };

  const handleDragEnd = () => {
    setDraggedItem(null);
  };

  const handleDrop = () => {
    if (draggedItem) {
      const symbol = availableSymbols.find((s) => s.id === draggedItem);
      if (symbol) {
        setSlot(symbol.symbol);
        setAttempts(attempts + 1);
      }
      setDraggedItem(null);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleNextRound = () => {
    generateNewPair();
    setProgress(0);
  };

  const getSymbolById = (id: string | null) => {
    if (!id) return null;
    return availableSymbols.find((symbol) => symbol.id === id);
  };

  if (!mounted) return null;

  return (
    <div
      className="min-h-screen relative overflow-hidden"
      style={{
        backgroundImage: "url(/background_photosynthesis.jpg)",
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
      }}
    >
      {/* Overlay for better readability */}
      <div className="absolute inset-0 bg-black/10" />

      {/* Header */}
      <section className="pt-20 md:pt-24 pb-4 px-4 md:px-6 relative z-10">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <Link href="/grade/6/mathematics/knowing-our-numbers">
            <Button
              variant="ghost"
              className="bg-white/80 hover:bg-white text-black"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Button>
          </Link>

          {/* Score Display */}
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl px-6 py-3">
            <span className="text-xl font-bold text-black">
              Score: {score} / {attempts}
            </span>
          </div>

          {/* Close Button */}
          <Link href="/grade/6/mathematics/knowing-our-numbers">
            <Button
              variant="ghost"
              className="bg-white/80 hover:bg-white text-black"
            >
              ✕
            </Button>
          </Link>
        </div>
      </section>

      {/* Game Content */}
      <section className="relative z-10 px-4 md:px-6 pb-8">
        <div className="max-w-4xl mx-auto">
          {/* Progress Bar */}
          <div className="mb-6">
            <div className="w-full h-4 bg-white/30 rounded-full overflow-hidden border-2 border-white/50">
              <motion.div
                className="h-full bg-blue-500"
                initial={{ width: 0 }}
                animate={{ width: `${progress}%` }}
                transition={{ duration: 0.3 }}
              />
            </div>
          </div>

          {/* Title */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-8"
          >
            <h1 className="text-4xl md:text-5xl font-bold text-blue-800 mb-4">
              COMPARING NUMBERS!
            </h1>
            <p className="text-xl md:text-2xl text-black font-semibold">
              Drag the correct symbol to compare the numbers
            </p>
          </motion.div>

          {/* Comparison Area */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2 }}
            className="bg-white/90 backdrop-blur-sm rounded-3xl p-8 mb-8 shadow-2xl"
          >
            <div className="flex items-center justify-center gap-6 flex-wrap text-4xl md:text-6xl font-bold">
              {/* Number 1 */}
              <motion.span
                className="text-purple-600 bg-purple-100 rounded-2xl px-8 py-4 shadow-lg"
                initial={{ scale: 0, rotate: -180 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ type: "spring", stiffness: 200 }}
              >
                {currentPair.num1}
              </motion.span>

              {/* Drop Slot */}
              <div
                onDrop={handleDrop}
                onDragOver={handleDragOver}
                className={`w-32 h-24 rounded-2xl border-4 border-dashed flex items-center justify-center transition-all ${
                  slot
                    ? isComplete
                      ? "bg-green-100 border-green-400"
                      : "bg-red-100 border-red-400"
                    : "bg-gray-100 border-gray-400 hover:border-gray-600"
                }`}
              >
                {slot ? (
                  <span
                    className={`text-5xl ${
                      isComplete ? "text-green-600" : "text-red-600"
                    }`}
                  >
                    {slot}
                  </span>
                ) : (
                  <span className="text-gray-400 text-2xl">?</span>
                )}
              </div>

              {/* Number 2 */}
              <motion.span
                className="text-blue-600 bg-blue-100 rounded-2xl px-8 py-4 shadow-lg"
                initial={{ scale: 0, rotate: 180 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ type: "spring", stiffness: 200, delay: 0.1 }}
              >
                {currentPair.num2}
              </motion.span>
            </div>
          </motion.div>

          {/* Draggable Symbols Area */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="bg-white/70 backdrop-blur-sm rounded-3xl p-6 shadow-xl"
          >
            <div className="flex items-center justify-center gap-6 flex-wrap">
              {availableSymbols.map((symbol, index) => {
                const isPlaced = slot === symbol.symbol;
                if (isPlaced && isComplete) return null;

                return (
                  <motion.div
                    key={symbol.id}
                    draggable
                    onDragStart={() => handleDragStart(symbol.id)}
                    onDragEnd={handleDragEnd}
                    initial={{ scale: 0, rotate: -180 }}
                    animate={{ scale: 1, rotate: 0 }}
                    transition={{ delay: 0.5 + index * 0.1, type: "spring" }}
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.95 }}
                    className={`cursor-move bg-white rounded-2xl px-10 py-6 shadow-lg border-4 transition-all ${
                      symbol.id === "greater"
                        ? "border-emerald-400 hover:border-emerald-600"
                        : symbol.id === "equal"
                        ? "border-amber-400 hover:border-amber-600"
                        : "border-rose-400 hover:border-rose-600"
                    }`}
                  >
                    <span
                      className={`text-5xl font-bold ${
                        symbol.id === "greater"
                          ? "text-emerald-600"
                          : symbol.id === "equal"
                          ? "text-amber-600"
                          : "text-rose-600"
                      }`}
                    >
                      {symbol.symbol}
                    </span>
                  </motion.div>
                );
              })}
            </div>
          </motion.div>

          {/* Success Message */}
          {isComplete && (
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              className="mt-8 bg-green-500 text-white rounded-3xl p-8 text-center shadow-2xl"
            >
              <h2 className="text-3xl font-bold mb-4">🎉 Correct!</h2>
              <p className="text-xl mb-6">
                {currentPair.num1} {slot} {currentPair.num2} is right!
              </p>
              <div className="flex gap-4 justify-center">
                <Button
                  onClick={handleNextRound}
                  className="bg-white text-green-600 hover:bg-gray-100 text-lg px-8 py-3"
                >
                  Next Challenge
                </Button>
                <Link href="/grade/6/mathematics/knowing-our-numbers">
                  <Button className="bg-green-700 hover:bg-green-800 text-lg px-8 py-3">
                    Continue Learning
                  </Button>
                </Link>
              </div>
            </motion.div>
          )}

          {/* Wrong Answer Feedback */}
          {slot && !isComplete && (
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              className="mt-8 bg-red-500 text-white rounded-3xl p-8 text-center shadow-2xl"
            >
              <h2 className="text-3xl font-bold mb-4">❌ Try Again!</h2>
              <p className="text-xl mb-6">
                That's not quite right. Think about which number is bigger!
              </p>
              <Button
                onClick={() => setSlot(null)}
                className="bg-white text-red-600 hover:bg-gray-100 text-lg px-8 py-3"
              >
                Try Again
              </Button>
            </motion.div>
          )}
        </div>
      </section>
    </div>
  );
}
