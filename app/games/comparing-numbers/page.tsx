"use client";

import { useState, useEffect, useRef } from "react";
import { ArrowLeft, Star, Trophy, RotateCcw, Play, Package, Sparkles, Zap, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
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
  type: 'greater' | 'smaller' | 'equal';
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
    gameType: 'drag-drop'
  });

  const [numbers, setNumbers] = useState<DraggableNumber[]>([]);
  const [buckets, setBuckets] = useState<DropBucket[]>([
    { id: 'greater', label: 'Greater', type: 'greater', color: 'emerald', isHovered: false, droppedNumber: null },
    { id: 'equal', label: 'Equal', type: 'equal', color: 'amber', isHovered: false, droppedNumber: null },
    { id: 'smaller', label: 'Smaller', type: 'smaller', color: 'rose', isHovered: false, droppedNumber: null }
  ]);
  const [draggedItem, setDraggedItem] = useState<{
    id: string | null;
    value: number | null;
  }>({ id: null, value: null });
  const [particles, setParticles] = useState<Array<{
    id: string;
    x: number;
    y: number;
    vx: number;
    vy: number;
    life: number;
    maxLife: number;
    color: string;
    size: number;
  }>>([]);

  // Initialize game
  useEffect(() => {
    if (gameState.isPlaying && !gameState.isAnswered) {
      generateNewNumbers();
    }
  }, [gameState.isPlaying, gameState.isAnswered]);

  // Particle animation loop
  useEffect(() => {
    const interval = setInterval(() => {
      setParticles(prev => prev
        .map(p => ({
          ...p,
          x: p.x + p.vx,
          y: p.y + p.vy,
          vy: p.vy + 0.5, // gravity
          life: p.life - 1
        }))
        .filter(p => p.life > 0)
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
        id: 'num1',
        value: num1,
        isDragging: false,
        isCorrect: null,
        isDropped: false,
        droppedIn: null
      },
      {
        id: 'num2', 
        value: num2,
        isDragging: false,
        isCorrect: null,
        isDropped: false,
        droppedIn: null
      }
    ];

    setNumbers(newNumbers);
    setBuckets(prev => prev.map(bucket => ({ ...bucket, droppedNumber: null, isHovered: false })));
    setGameState(prev => ({ ...prev, feedback: "", isAnswered: false }));
  };

  // Improved sound system with pleasant tones
  const playSound = (type: 'correct' | 'wrong' | 'drop' | 'pickup', pitch = 1) => {
    try {
      if (!audioContext.current) {
        audioContext.current = new (window.AudioContext || (window as any).webkitAudioContext)();
      }
      
      const ctx = audioContext.current;
      const oscillator = ctx.createOscillator();
      const gainNode = ctx.createGain();
      
      oscillator.connect(gainNode);
      gainNode.connect(ctx.destination);
      
      if (type === 'correct') {
        // Pleasant chime sound
        oscillator.type = 'sine';
        oscillator.frequency.setValueAtTime(523.25 * pitch, ctx.currentTime); // C5
        oscillator.frequency.setValueAtTime(659.25 * pitch, ctx.currentTime + 0.1); // E5
        oscillator.frequency.setValueAtTime(783.99 * pitch, ctx.currentTime + 0.2); // G5
        gainNode.gain.setValueAtTime(0.05, ctx.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.3);
        oscillator.start(ctx.currentTime);
        oscillator.stop(ctx.currentTime + 0.3);
      } else if (type === 'wrong') {
        // Soft incorrect sound
        oscillator.type = 'sine';
        oscillator.frequency.setValueAtTime(220, ctx.currentTime);
        oscillator.frequency.exponentialRampToValueAtTime(110, ctx.currentTime + 0.3);
        gainNode.gain.setValueAtTime(0.03, ctx.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.3);
        oscillator.start(ctx.currentTime);
        oscillator.stop(ctx.currentTime + 0.3);
      } else if (type === 'drop') {
        // Soft drop sound
        oscillator.type = 'sine';
        oscillator.frequency.setValueAtTime(400, ctx.currentTime);
        gainNode.gain.setValueAtTime(0.03, ctx.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.1);
        oscillator.start(ctx.currentTime);
        oscillator.stop(ctx.currentTime + 0.1);
      } else if (type === 'pickup') {
        // Soft pickup sound
        oscillator.type = 'sine';
        oscillator.frequency.setValueAtTime(600, ctx.currentTime);
        gainNode.gain.setValueAtTime(0.02, ctx.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.05);
        oscillator.start(ctx.currentTime);
        oscillator.stop(ctx.currentTime + 0.05);
      }
    } catch (error) {
      console.log('Audio context error:', error);
    }
  };

  const createParticles = (x: number, y: number, color = '#FFD700') => {
    const colors = ['#FFD700', '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7'];
    const newParticles = [];
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
        size: Math.random() * 3 + 2
      });
    }
    setParticles(prev => [...prev, ...newParticles]);
  };

  const handleDrop = (bucketType: string, numberValue: number) => {
    const [num1, num2] = numbers.map(n => n.value);
    
    let isCorrect = false;
    
    // Check if the drop is correct based on bucket type and number comparison
    if (bucketType === 'greater') {
      // For greater bucket, check if this number is larger than the other
      const otherNumber = numbers.find(n => n.value !== numberValue)?.value;
      if (otherNumber !== undefined) {
        isCorrect = numberValue > otherNumber;
      }
    } else if (bucketType === 'smaller') {
      // For smaller bucket, check if this number is smaller than the other
      const otherNumber = numbers.find(n => n.value !== numberValue)?.value;
      if (otherNumber !== undefined) {
        isCorrect = numberValue < otherNumber;
      }
    } else if (bucketType === 'equal') {
      // For equal bucket, check if both numbers are the same
      isCorrect = num1 === num2;
    }

    // Update the bucket with the dropped number
    setBuckets(prev => prev.map(bucket => 
      bucket.type === bucketType 
        ? { ...bucket, droppedNumber: numberValue, isHovered: false }
        : bucket
    ));

    // Update the number as dropped
    setNumbers(prev => prev.map(n => 
      n.value === numberValue 
        ? { ...n, isDropped: true, droppedIn: bucketType, isCorrect }
        : n
    ));

    if (isCorrect) {
      const points = Math.floor(15 + gameState.level * 5 + gameState.streak * 3);
      const combo = gameState.combo + 1;
      const bonusPoints = combo > 3 ? combo * 2 : 0;
      
      setGameState(prev => ({
        ...prev,
        score: prev.score + points + bonusPoints,
        feedback: `Perfect! +${points + bonusPoints} points${combo > 3 ? ` (${combo}x combo!)` : ''}`,
        streak: prev.streak + 1,
        combo: combo,
        isAnswered: true
      }));

      playSound('correct', 1 + (combo * 0.1));
      createParticles(400, 300);

      // Check level up
      const newScore = gameState.score + points + bonusPoints;
      const shouldLevelUp = newScore >= gameState.level * 100;
      
      if (shouldLevelUp) {
        const newLevel = gameState.level + 1;
        
        // Level up celebration
        playSound('correct', 1.5); // Higher pitch for level up
        
        // Create particles with delays to avoid duplicate keys
        setTimeout(() => createParticles(400, 200), 0);
        setTimeout(() => createParticles(200, 300), 50);
        setTimeout(() => createParticles(600, 300), 100);
        
        // Check if player can advance to next game type (every level after Level 1)
        const canAdvance = newLevel > 1;
        
        console.log('Level up!', { newLevel, canAdvance, showNextGame: canAdvance }); // Debug log
        
        setGameState(prev => ({ 
          ...prev, 
          level: newLevel,
          score: newScore, // Make sure to update the score
          feedback: canAdvance 
            ? `🎉 LEVEL ${newLevel} COMPLETE! Ready for a new challenge! 🎉`
            : `🎉 LEVEL UP! Welcome to Level ${newLevel}! 🎉`,
          canAdvanceToNextGame: canAdvance,
          showNextGame: canAdvance
        }));
        
        // Show modal after celebration if advancing
        if (canAdvance) {
          setTimeout(() => {
            console.log('Should show next game modal now'); // Debug log
            // Modal should be visible now due to showNextGame being true
          }, 1000);
        }
        
        // Longer delay for level up celebration
        setTimeout(() => {
          if (!canAdvance) { // Only clear if not advancing to prevent modal from disappearing
            setGameState(prev => ({ ...prev, isAnswered: false }));
          }
        }, canAdvance ? 4000 : 3000);
      } else {
        // Next round after delay
        setTimeout(() => {
          setGameState(prev => ({ ...prev, isAnswered: false }));
        }, 2000);
      }

    } else {
      setGameState(prev => ({
        ...prev,
        lives: prev.lives - 1,
        feedback: "Not quite right. Try again!",
        streak: 0,
        combo: 0,
        isAnswered: true
      }));

      playSound('wrong');

      if (gameState.lives <= 1) {
        setGameState(prev => ({
          ...prev,
          isPlaying: false,
          gameOver: true
        }));
      } else {
        setTimeout(() => {
          setGameState(prev => ({ ...prev, isAnswered: false }));
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
      gameType: 'drag-drop'
    });
    setParticles([]);
  };

  const continueCurrentGame = () => {
    setGameState(prev => ({
      ...prev,
      showNextGame: false,
      canAdvanceToNextGame: false,
      isAnswered: false
    }));
  };

  const handleNextGameType = () => {
    // Switch to space rocket ascending order game
    setGameState(prev => ({
      ...prev,
      showNextGame: false,
      gameType: 'rocket-ascending',
      isAnswered: false
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
      gameType: 'drag-drop'
    });
    setNumbers([]);
    setParticles([]);
  };

  const handleBackToMainGame = () => {
    setGameState(prev => ({
      ...prev,
      gameType: 'drag-drop',
      isPlaying: false,
      gameOver: false,
      showNextGame: false,
      canAdvanceToNextGame: false
    }));
  };

  // If rocket game is selected, render that instead
  if (gameState.gameType === 'rocket-ascending') {
    return <RocketAscendingGame onBackToMainGame={handleBackToMainGame} />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      {/* Animated background particles */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        {particles.map(particle => (
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
              transform: `scale(${particle.life / particle.maxLife})`
            }}
          />
        ))}
      </div>

      <section className="pt-20 md:pt-24 pb-8 px-4 md:px-6 relative">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <Link href="/grade/6/mathematics/knowing-our-numbers">
              <Button variant="ghost" className="text-gray-300 hover:text-white">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Learning
              </Button>
            </Link>
            
            <div className="text-center">
              <h1 className="text-3xl md:text-4xl font-bold text-white mb-2 flex items-center gap-2">
                <Sparkles className="h-8 w-8 text-yellow-400" />
                Number Comparison Challenge
                <Sparkles className="h-8 w-8 text-yellow-400" />
              </h1>
              <p className="text-gray-300">
                Drag numbers to their correct category!
              </p>
            </div>
            
            <div className="w-24"></div>
          </div>

          {/* Game Stats */}
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
            <Card className="bg-slate-800/80 border-slate-700 p-4 text-center backdrop-blur">
              <div className="text-2xl font-bold text-blue-400">{gameState.score}</div>
              <div className="text-sm text-gray-400">Score</div>
            </Card>
            <Card className="bg-slate-800/80 border-slate-700 p-4 text-center backdrop-blur relative">
              <div className="text-2xl font-bold text-purple-400">{gameState.level}</div>
              <div className="text-sm text-gray-400">Level</div>
              {/* Level Progress Bar */}
              <div className="mt-2 w-full bg-gray-700 rounded-full h-1.5">
                <div 
                  className="bg-gradient-to-r from-purple-400 to-blue-500 h-1.5 rounded-full transition-all duration-500"
                  style={{ 
                    width: `${Math.min(100, (gameState.score % (gameState.level * 100)) / (gameState.level * 100) * 100)}%` 
                  }}
                ></div>
              </div>
              <div className="text-xs text-gray-500 mt-1">
                {gameState.level * 100 - (gameState.score % (gameState.level * 100))} to next
              </div>
            </Card>
            <Card className="bg-slate-800/80 border-slate-700 p-4 text-center backdrop-blur">
              <div className="text-2xl font-bold text-red-400">{gameState.lives}</div>
              <div className="text-sm text-gray-400">Lives</div>
            </Card>
            <Card className="bg-slate-800/80 border-slate-700 p-4 text-center backdrop-blur">
              <div className="text-2xl font-bold text-yellow-400">{gameState.streak}</div>
              <div className="text-sm text-gray-400">Streak</div>
            </Card>
            <Card className="bg-slate-800/80 border-slate-700 p-4 text-center backdrop-blur">
              <div className="text-2xl font-bold text-emerald-400">{gameState.combo}</div>
              <div className="text-sm text-gray-400">Combo</div>
            </Card>
          </div>

          {/* Start Game Button */}
          {!gameState.isPlaying && !gameState.gameOver && (
            <div className="text-center mb-8">
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Button 
                  onClick={startGame}
                  className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-12 py-4 text-lg font-bold rounded-xl shadow-lg"
                >
                  <Play className="h-6 w-6 mr-3" />
                  Start Challenge
                </Button>
              </motion.div>
            </div>
          )}

          {/* Game Area */}
          {gameState.isPlaying && (
            <div className="space-y-8">
          {/* Numbers to Compare */}
          <div className="text-center mb-4 md:mb-8 px-2">
            <h2 className="text-lg md:text-2xl font-bold text-white mb-3 md:mb-6">Drag the numbers to the correct buckets:</h2>
            <div className="flex justify-center gap-3 sm:gap-6 md:gap-8 mb-4 md:mb-8">
              {numbers.filter(n => !n.isDropped).map((number, index) => (
                <motion.div
                  key={number.id}
                  className={`
                    w-16 h-16 sm:w-20 sm:h-20 md:w-24 md:h-24 rounded-xl md:rounded-2xl flex items-center justify-center text-2xl sm:text-3xl md:text-4xl font-bold cursor-grab active:cursor-grabbing shadow-xl transform transition-all select-none
                    ${
                      number.isDragging 
                        ? 'bg-gradient-to-br from-blue-400 to-blue-600 text-white shadow-blue-400/50 scale-110 rotate-2' 
                        : 'bg-gradient-to-br from-white to-gray-100 text-gray-800 hover:shadow-2xl hover:scale-105'
                    }
                  `}
                  initial={{ scale: 0, rotate: -180 }}
                  animate={{ scale: 1, rotate: 0 }}
                  transition={{ delay: index * 0.3, type: "spring", stiffness: 200 }}
                      draggable
                      onDragStart={(e) => {
                        playSound('pickup');
                        setDraggedItem({ id: number.id, value: number.value });
                        setNumbers(prev => prev.map(n => 
                          n.id === number.id ? { ...n, isDragging: true } : n
                        ));
                      }}
                      onDragEnd={() => {
                        setNumbers(prev => prev.map(n => ({ ...n, isDragging: false })));
                        setDraggedItem({ id: null, value: null });
                      }}
                    >
                      {number.value}
                    </motion.div>
                  ))}
                </div>
              </div>

              {/* Bucket Drop Zones */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 md:gap-8 px-2">
                {buckets.map((bucket, index) => (
                  <motion.div
                    key={bucket.id}
                    className={`
                      relative bg-gradient-to-br min-h-[140px] sm:min-h-[160px] md:min-h-[200px] rounded-2xl sm:rounded-3xl border-2 sm:border-3 md:border-4 border-dashed p-4 sm:p-6 md:p-8 text-center flex flex-col justify-center backdrop-blur transition-all duration-300
                      ${
                        bucket.color === 'emerald'
                          ? 'from-emerald-500/30 to-emerald-600/30 border-emerald-400 hover:border-emerald-300'
                          : bucket.color === 'amber'
                          ? 'from-amber-500/30 to-amber-600/30 border-amber-400 hover:border-amber-300'
                          : 'from-rose-500/30 to-rose-600/30 border-rose-400 hover:border-rose-300'
                      }
                      ${
                        bucket.isHovered 
                          ? 'scale-105 shadow-2xl border-solid' 
                          : 'hover:scale-102'
                      }
                    `}
                    initial={{ opacity: 0, y: 50 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5 + index * 0.2 }}
                    onDragOver={(e) => {
                      e.preventDefault();
                      setBuckets(prev => prev.map(b => 
                        b.id === bucket.id ? { ...b, isHovered: true } : { ...b, isHovered: false }
                      ));
                    }}
                    onDragLeave={() => {
                      setBuckets(prev => prev.map(b => ({ ...b, isHovered: false })));
                    }}
                    onDrop={(e) => {
                      e.preventDefault();
                      setBuckets(prev => prev.map(b => ({ ...b, isHovered: false })));
                      
                      if (draggedItem.value !== null) {
                        playSound('drop');
                        handleDrop(bucket.type, draggedItem.value);
                      }
                    }}
                  >
                    {/* Bucket Icon */}
                    <div className="mb-2 sm:mb-3 md:mb-4">
                      <Package 
                        className={`h-10 w-10 sm:h-12 sm:w-12 md:h-16 md:w-16 mx-auto ${
                          bucket.color === 'emerald' ? 'text-emerald-400' :
                          bucket.color === 'amber' ? 'text-amber-400' :
                          'text-rose-400'
                        }`} 
                      />
                    </div>
                    
                    {/* Bucket Label */}
                    <h3 className={`text-lg sm:text-xl md:text-2xl font-bold mb-1 sm:mb-2 md:mb-3 ${
                      bucket.color === 'emerald' ? 'text-emerald-300' :
                      bucket.color === 'amber' ? 'text-amber-300' :
                      'text-rose-300'
                    }`}>
                      {bucket.label}
                    </h3>
                    
                    {/* Description */}
                    <p className={`text-xs sm:text-sm mb-2 sm:mb-3 md:mb-4 ${
                      bucket.color === 'emerald' ? 'text-emerald-200' :
                      bucket.color === 'amber' ? 'text-amber-200' :
                      'text-rose-200'
                    }`}>
                      {bucket.type === 'greater' ? 'For the larger number' :
                       bucket.type === 'equal' ? 'When numbers are the same' :
                       'For the smaller number'}
                    </p>

                    {/* Dropped Number Display */}
                    {bucket.droppedNumber !== null && (
                      <motion.div
                        initial={{ scale: 0, rotate: 180 }}
                        animate={{ scale: 1, rotate: 0 }}
                        className={`
                          absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-12 h-12 sm:w-16 sm:h-16 md:w-20 md:h-20 rounded-xl sm:rounded-2xl flex items-center justify-center text-lg sm:text-2xl md:text-3xl font-bold shadow-2xl
                          ${
                            numbers.find(n => n.value === bucket.droppedNumber)?.isCorrect === true
                              ? 'bg-gradient-to-br from-green-400 to-green-600 text-white'
                              : numbers.find(n => n.value === bucket.droppedNumber)?.isCorrect === false
                              ? 'bg-gradient-to-br from-red-400 to-red-600 text-white'
                              : 'bg-gradient-to-br from-blue-400 to-blue-600 text-white'
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
                    <div className={`text-2xl font-bold p-4 rounded-xl inline-block ${
                      gameState.feedback.includes('LEVEL UP') 
                        ? 'bg-gradient-to-r from-purple-500/30 to-blue-500/30 text-purple-300 border-2 border-purple-400 shadow-purple-400/50 shadow-lg'
                        : gameState.feedback.includes('Perfect') 
                        ? 'bg-green-500/20 text-green-400 border border-green-400'
                        : 'bg-red-500/20 text-red-400 border border-red-400'
                    }`}>
                      {gameState.feedback}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          )}

          {/* Next Game Type Modal */}
          {gameState.showNextGame && (
            <motion.div 
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4"
            >
              <Card className="bg-slate-800/95 border-purple-500 p-8 max-w-lg mx-auto backdrop-blur shadow-2xl">
                <div className="text-center">
                  <Zap className="h-20 w-20 text-yellow-400 mx-auto mb-4 animate-pulse" />
                  <h2 className="text-4xl font-bold text-white mb-4">🎉 Milestone Reached! 🎉</h2>
                  <p className="text-xl text-purple-300 mb-2">Congratulations! You've completed Level {gameState.level}!</p>
                  <p className="text-gray-300 mb-6">You've unlocked the next type of number comparison challenge!</p>
                  
                  <div className="bg-gradient-to-r from-purple-500/20 to-blue-500/20 rounded-xl p-4 mb-6">
                    <h3 className="text-lg font-bold text-white mb-2">🚀 Ready for the next adventure?</h3>
                    <p className="text-sm text-gray-300">Choose to continue with the current game or try a new challenge type!</p>
                  </div>
                  
                  <div className="flex flex-col sm:flex-row gap-4 justify-center">
                    <Button 
                      onClick={handleNextGameType}
                      className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white px-6 py-3 text-lg font-bold"
                    >
                      <ArrowRight className="h-5 w-5 mr-2" />
                      Next Game Type
                    </Button>
                    <Button 
                      onClick={continueCurrentGame}
                      variant="outline"
                      className="border-slate-500 text-slate-300 hover:bg-slate-700 px-6 py-3"
                    >
                      <Play className="h-5 w-5 mr-2" />
                      Continue Current
                    </Button>
                  </div>
                </div>
              </Card>
            </motion.div>
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
                <h2 className="text-3xl font-bold text-white mb-4">Challenge Complete!</h2>
                <p className="text-gray-300 mb-2">Final Score: <span className="text-blue-400 font-bold text-2xl">{gameState.score}</span></p>
                <p className="text-gray-300 mb-6">Level Reached: <span className="text-purple-400 font-bold text-xl">{gameState.level}</span></p>
                
                <div className="flex gap-4 justify-center">
                  <Button 
                    onClick={startGame}
                    className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white"
                  >
                    <Play className="h-4 w-4 mr-2" />
                    Play Again
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

          {/* Instructions */}
          <Card className="bg-slate-800/80 border-slate-700 p-6 mt-8 backdrop-blur">
            <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
              <Star className="h-5 w-5 text-yellow-400" />
              How to Play:
            </h3>
            <div className="grid md:grid-cols-2 gap-6 text-gray-300">
              <div>
                <h4 className="font-semibold text-emerald-400 mb-2">🎯 Drag & Drop</h4>
                <p className="text-sm">Drag the numbers to the correct category zones based on their comparison.</p>
              </div>
              <div>
                <h4 className="font-semibold text-blue-400 mb-2">⭐ Build Combos</h4>
                <p className="text-sm">Get multiple answers right in a row to build combo multipliers!</p>
              </div>
              <div>
                <h4 className="font-semibold text-purple-400 mb-2">📈 Level Up</h4>
                <p className="text-sm">Reach score milestones to advance levels and earn more points.</p>
              </div>
              <div>
                <h4 className="font-semibold text-red-400 mb-2">❤️ Lives</h4>
                <p className="text-sm">You have 3 lives. Wrong answers cost a life, but streaks give bonus points!</p>
              </div>
            </div>
          </Card>
        </div>
      </section>
    </div>
  );
}
