"use client";

import { useState, useEffect, useCallback } from "react";
import { ArrowLeft, RotateCcw, Trophy } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { useSoundEffects } from "@/hooks/useSoundEffects";

// Import space-themed font
if (typeof window !== "undefined") {
  const link = document.createElement("link");
  link.href =
    "https://fonts.googleapis.com/css2?family=Orbitron:wght@400;500;600;700;800;900&display=swap";
  link.rel = "stylesheet";
  document.head.appendChild(link);
}

interface Player {
  x: number;
  y: number;
  width: number;
  height: number;
  velocityY: number;
  isJumping: boolean;
  isOnGround: boolean;
  direction: "left" | "right";
}

interface NumberCollectible {
  id: number;
  x: number;
  y: number;
  value: number;
  type: "ones" | "tens" | "hundreds" | "thousands" | "lakhs" | "crores";
  collected: boolean;
  asset: string;
}

interface Platform {
  x: number;
  y: number;
  width: number;
  height: number;
}

export default function LargeNumbersGame() {
  const [mounted, setMounted] = useState(false);
  const [gameStarted, setGameStarted] = useState(false);
  const [gameWon, setGameWon] = useState(false);
  const [currentLevel, setCurrentLevel] = useState(1);
  const [score, setScore] = useState(0);
  const [targetNumber, setTargetNumber] = useState(0);
  const [collectedValue, setCollectedValue] = useState(0);
  const [lives, setLives] = useState(3);
  const [showInstructions, setShowInstructions] = useState(true);
  const [hasMushroomPower, setHasMushroomPower] = useState(false);
  const [nextToCollect, setNextToCollect] = useState(1); // Track which number to collect next
  const [showQuiz, setShowQuiz] = useState(false);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [quizScore, setQuizScore] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [quizCompleted, setQuizCompleted] = useState(false);

  const { playClickSound } = useSoundEffects();

  // Detect system/site theme
  const [isDarkTheme, setIsDarkTheme] = useState(true);

  useEffect(() => {
    // Check if dark mode is active on the document
    const checkTheme = () => {
      const isDark = document.documentElement.classList.contains("dark");
      setIsDarkTheme(isDark);
    };

    // Initial check
    checkTheme();

    // Watch for theme changes
    const observer = new MutationObserver(checkTheme);
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["class"],
    });

    return () => observer.disconnect();
  }, []);

  // Level-specific quiz questions
  const allQuizQuestions = {
    1: [
      {
        question:
          "In this level, you collected numbers 1, 2, 3, 4 in order. What is their sum?",
        options: ["8", "10", "12", "14"],
        correct: 1,
        explanation: "1 + 2 + 3 + 4 = 10. This is the target for Level 1!",
      },
      {
        question: "What is the place value of 4 in the number 1,234?",
        options: ["4", "40", "400", "4,000"],
        correct: 0,
        explanation: "The digit 4 is in the ones place, so its value is 4.",
      },
      {
        question: "Which is the correct order to collect numbers in this game?",
        options: [
          "Any order",
          "Largest to smallest",
          "Smallest to largest",
          "The order shown at top",
        ],
        correct: 3,
        explanation:
          "You must collect numbers in the exact order shown at the top of the screen!",
      },
      {
        question: "What is 1 + 2 + 3?",
        options: ["5", "6", "7", "8"],
        correct: 1,
        explanation: "1 + 2 + 3 = 6. Simple addition!",
      },
      {
        question: "In the number 10, which digit is in the tens place?",
        options: ["0", "1", "10", "None"],
        correct: 1,
        explanation: "The digit 1 is in the tens place, making it 10.",
      },
    ],
    2: [
      {
        question:
          "In Level 2, you collected 5, 6, 7, 8 in order. What is their sum?",
        options: ["20", "24", "26", "28"],
        correct: 2,
        explanation: "5 + 6 + 7 + 8 = 26. This is the target for Level 2!",
      },
      {
        question: "What is the place value of 2 in the number 5,267?",
        options: ["2", "20", "200", "2,000"],
        correct: 2,
        explanation:
          "The digit 2 is in the hundreds place, so its value is 200.",
      },
      {
        question: "How do you write 'Twenty-six' in numbers?",
        options: ["16", "26", "62", "206"],
        correct: 1,
        explanation: "Twenty-six is written as 26 in numbers.",
      },
      {
        question: "What comes after 25 in counting?",
        options: ["24", "26", "27", "30"],
        correct: 1,
        explanation: "After 25 comes 26 in counting sequence.",
      },
      {
        question: "Which number is greater: 26 or 62?",
        options: ["26", "62", "Both equal", "Cannot tell"],
        correct: 1,
        explanation:
          "62 is greater than 26 because 6 tens is more than 2 tens.",
      },
    ],
    3: [
      {
        question:
          "In Level 3, you collected 10, 12, 14, 14. What is their sum?",
        options: ["40", "45", "50", "55"],
        correct: 2,
        explanation: "10 + 12 + 14 + 14 = 50. This is the target for Level 3!",
      },
      {
        question: "What is the place value of 5 in the number 52,847?",
        options: ["5", "50", "5,000", "50,000"],
        correct: 3,
        explanation:
          "The digit 5 is in the ten-thousands place, so its value is 50,000.",
      },
      {
        question: "How do you write 'Fifty thousand' in Indian number system?",
        options: ["5,000", "50,000", "5,00,000", "50,00,000"],
        correct: 1,
        explanation: "Fifty thousand is written as 50,000 in numbers.",
      },
      {
        question: "How many thousands make one lakh?",
        options: ["10", "100", "1,000", "10,000"],
        correct: 1,
        explanation: "One lakh = 1,00,000 = 100 thousands.",
      },
      {
        question: "What is 10 + 12 + 14?",
        options: ["34", "36", "38", "40"],
        correct: 1,
        explanation: "10 + 12 + 14 = 36. Good addition practice!",
      },
    ],
  };

  const quizQuestions =
    allQuizQuestions[currentLevel as keyof typeof allQuizQuestions] ||
    allQuizQuestions[1];

  // Generate and download completion badge
  const downloadCompletionBadge = () => {
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    canvas.width = 400;
    canvas.height = 500;

    // Background gradient
    const gradient = ctx.createLinearGradient(0, 0, 0, 500);
    gradient.addColorStop(0, "#1e3a8a");
    gradient.addColorStop(1, "#7c3aed");
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, 400, 500);

    // Border
    ctx.strokeStyle = "#fbbf24";
    ctx.lineWidth = 8;
    ctx.strokeRect(10, 10, 380, 480);

    // Title
    ctx.fillStyle = "#fbbf24";
    ctx.font = "bold 24px Orbitron, Arial";
    ctx.textAlign = "center";
    ctx.fillText("COMPLETION CERTIFICATE", 200, 60);

    // Trophy emoji
    ctx.font = "60px Arial";
    ctx.fillText("🏆", 200, 130);

    // Game name
    ctx.fillStyle = "#ffffff";
    ctx.font = "bold 20px Orbitron, Arial";
    ctx.fillText("Large Numbers Adventure", 200, 180);
    ctx.fillText("Master Achievement", 200, 205);

    // Student name
    ctx.fillStyle = "#fbbf24";
    ctx.font = "bold 18px Arial";
    ctx.fillText("Student Name", 200, 250);

    // Achievement details
    ctx.fillStyle = "#ffffff";
    ctx.font = "14px Arial";
    ctx.fillText("has successfully completed:", 200, 280);

    // Level badges
    ctx.fillStyle = "#10b981";
    ctx.fillRect(50, 310, 90, 35);
    ctx.fillRect(155, 310, 90, 35);
    ctx.fillRect(260, 310, 90, 35);

    ctx.fillStyle = "#ffffff";
    ctx.font = "bold 14px Arial";
    ctx.fillText("Level 1", 95, 333);
    ctx.fillText("Level 2", 200, 333);
    ctx.fillText("Level 3", 305, 333);

    // Quiz score
    ctx.fillStyle = "#fbbf24";
    ctx.font = "16px Arial";
    ctx.fillText(`Quiz Score: ${quizScore}/${quizQuestions.length}`, 200, 380);

    // Skills learned
    ctx.fillStyle = "#ffffff";
    ctx.font = "bold 14px Arial";
    ctx.fillText("Skills Mastered:", 200, 415);
    ctx.font = "12px Arial";
    ctx.fillText("✓ Ordered Number Collection", 200, 435);
    ctx.fillText("✓ Indian Number System", 200, 455);
    ctx.fillText("✓ Place Value Understanding", 200, 475);

    // Download
    const link = document.createElement("a");
    link.download = `large-numbers-completion-badge-${Date.now()}.png`;
    link.href = canvas.toDataURL();
    link.click();
  };

  // Game objects with enhanced physics
  const [player, setPlayer] = useState<Player>({
    x: 20,
    y: 222, // Standing exactly ON TOP of stone platform (286 - 64 = 222)
    width: 64,
    height: 64,
    velocityY: 0,
    isJumping: false,
    isOnGround: true, // Start on the stone platform
    direction: "right",
  });

  // Enhanced physics constants
  const GRAVITY = 0.6; // Smoother gravity
  const JUMP_POWER = -16; // Better jump feel
  const MUSHROOM_BOUNCE = -22; // Enhanced mushroom bounce
  const MOVE_SPEED = 6; // Smoother movement
  const MAX_FALL_SPEED = 12; // Terminal velocity
  const GROUND_FRICTION = 0.8; // Ground friction for realistic stopping

  const [collectibles, setCollectibles] = useState<NumberCollectible[]>([]);
  const [platforms] = useState<Platform[]>([
    { x: 0, y: 350, width: 800, height: 50 }, // Grass ground platform - TOP at y:350 (bottom: "50px" in 400px canvas)
    { x: 16, y: 286, width: 128, height: 64 }, // Stone platform - CORRECTED: bottom at 350, so top at 286 (350-64=286)
    // Mushroom is handled separately as a spring/trampoline, not a regular platform
  ]);

  const levels = [
    {
      target: 10,
      numbers: [1, 2, 3, 4],
      description: "Collect in order: 1 → 2 → 3 → 4 = 10",
    },
    {
      target: 26,
      numbers: [5, 6, 7, 8],
      description: "Collect in order: 5 → 6 → 7 → 8 = 26",
    },
    {
      target: 50,
      numbers: [10, 12, 14, 14],
      description: "Collect in order: 10 → 12 → 14 → 14 = 50",
    },
  ];

  useEffect(() => {
    setMounted(true);
    generateCollectibles();
  }, [currentLevel]);

  const generateCollectibles = () => {
    // Generate collectibles based on current level
    const level = levels[currentLevel - 1];
    const levelNumbers = level.numbers;

    setTargetNumber(level.target);
    setCollectedValue(0);
    setNextToCollect(levelNumbers[0]); // Set first number to collect

    // Far apart positions across the entire level - FIXED positions for ordered collection
    const farApartPositions = [
      { x: 80, y: 200 }, // Far left - above stone platform
      { x: 280, y: 240 }, // Left center - above mushroom area
      { x: 520, y: 180 }, // Right center - high floating
      { x: 680, y: 286 }, // Far right - on ground near goal
    ];

    const newCollectibles: NumberCollectible[] = levelNumbers.map(
      (number, index) => ({
        id: index + 1,
        x: farApartPositions[index].x,
        y: farApartPositions[index].y,
        value: number,
        type: "ones",
        collected: false,
        asset: "coin.png",
      })
    );

    setCollectibles(newCollectibles);
  };

  const formatNumber = (num: number) => {
    if (num >= 10000000) {
      return `${(num / 10000000).toFixed(1)} Crore`;
    } else if (num >= 100000) {
      return `${(num / 100000).toFixed(1)} Lakh`;
    } else if (num >= 1000) {
      return `${(num / 1000).toFixed(1)}K`;
    }
    return num.toString();
  };

  const formatIndianNumber = (num: number) => {
    return num.toLocaleString("en-IN");
  };

  const checkCollision = (rect1: any, rect2: any) => {
    return (
      rect1.x < rect2.x + rect2.width &&
      rect1.x + rect1.width > rect2.x &&
      rect1.y < rect2.y + rect2.height &&
      rect1.y + rect1.height > rect2.y
    );
  };

  const gameLoop = useCallback(() => {
    if (!gameStarted || gameWon) return;

    setPlayer((prevPlayer) => {
      let newPlayer = { ...prevPlayer };

      // Enhanced physics - Apply gravity with terminal velocity
      if (!newPlayer.isOnGround) {
        newPlayer.velocityY += GRAVITY;
        // Cap falling speed for more realistic physics
        if (newPlayer.velocityY > MAX_FALL_SPEED) {
          newPlayer.velocityY = MAX_FALL_SPEED;
        }
      }

      // Apply vertical movement
      newPlayer.y += newPlayer.velocityY;

      // Check platform collisions - Stone acts as solid platform object
      newPlayer.isOnGround = false;
      platforms.forEach((platform) => {
        // Check if player is overlapping horizontally with platform
        const horizontalOverlap =
          newPlayer.x < platform.x + platform.width &&
          newPlayer.x + newPlayer.width > platform.x;

        // Enhanced platform landing with better collision detection
        if (
          horizontalOverlap &&
          newPlayer.y + newPlayer.height >= platform.y &&
          newPlayer.y + newPlayer.height <= platform.y + 12 &&
          newPlayer.velocityY >= 0
        ) {
          // Smooth landing on platform
          newPlayer.y = platform.y - newPlayer.height;
          newPlayer.velocityY = 0;
          newPlayer.isJumping = false;
          newPlayer.isOnGround = true;
        }
        // Check if player is hitting platform from below (jumping into it)
        else if (
          horizontalOverlap &&
          newPlayer.y <= platform.y + platform.height &&
          newPlayer.y >= platform.y &&
          newPlayer.velocityY < 0
        ) {
          // Hit platform from below, stop upward movement
          newPlayer.y = platform.y + platform.height;
          newPlayer.velocityY = 0;
        }
        // Check if player is hitting platform from the side
        else if (
          newPlayer.y < platform.y + platform.height &&
          newPlayer.y + newPlayer.height > platform.y &&
          ((newPlayer.x + newPlayer.width > platform.x &&
            newPlayer.x + newPlayer.width < platform.x + 10) ||
            (newPlayer.x < platform.x + platform.width &&
              newPlayer.x > platform.x + platform.width - 10))
        ) {
          // Hit platform from side, stop horizontal movement
          if (newPlayer.x < platform.x) {
            newPlayer.x = platform.x - newPlayer.width;
          } else {
            newPlayer.x = platform.x + platform.width;
          }
        }
      });

      // Check mushroom spring collision - CORRECTED coordinates to match visual position
      // Visual: left: "320px", bottom: "50px" = y: 350 (grass level)
      // Mushroom top should be at y: 350 - 64 = 286 (same calculation as stone platform)
      const mushroomArea = { x: 320, y: 286, width: 64, height: 64 };

      // Use SAME collision logic as stone platform for consistency
      const horizontalOverlapMushroom =
        newPlayer.x < mushroomArea.x + mushroomArea.width &&
        newPlayer.x + newPlayer.width > mushroomArea.x;

      // Check if player is landing on top of mushroom (same logic as stone platform)
      if (
        horizontalOverlapMushroom &&
        newPlayer.y + newPlayer.height >= mushroomArea.y &&
        newPlayer.y + newPlayer.height <= mushroomArea.y + 10 &&
        newPlayer.velocityY >= 0
      ) {
        // Land on mushroom and bounce up with enhanced physics
        newPlayer.y = mushroomArea.y - newPlayer.height;
        newPlayer.velocityY = MUSHROOM_BOUNCE; // Enhanced bounce feel
        newPlayer.isJumping = true;
        newPlayer.isOnGround = false;
        playClickSound("primary");
      }

      // Check poison plant collision (damage) - Exact positioning match
      // CSS: right-60 w-12 h-12 bottom-50px
      // Calculation: right-60 = 240px from right = 560px from left (800-240=560)
      // bottom-50px = y: 302 (350-48=302) for 48px height image
      // Making collision area smaller and more precise to match visible plant
      const poisonPlantArea = { x: 565, y: 310, width: 38, height: 40 };
      if (checkCollision(newPlayer, poisonPlantArea)) {
        // Reduce heart count
        setLives((prev) => Math.max(0, prev - 1));
        playClickSound("card");

        // Reset character to starting position (beginning of level)
        newPlayer.x = 20; // Starting X position (on stone platform)
        newPlayer.y = 222; // Starting Y position (on stone platform)
        newPlayer.velocityY = 0;
        newPlayer.isJumping = false;
        newPlayer.isOnGround = true;
        newPlayer.direction = "right";
      }

      // Check goal tower collision (win condition) - Enhanced with better feedback
      // Visual: right-0 = right: 0px = left: 776px (800-24=776), bottom: "0px" = y: 208 (400-192=208 for 48px height tower)
      const towerArea = { x: 776, y: 208, width: 24, height: 192 };
      if (checkCollision(newPlayer, towerArea)) {
        if (collectedValue >= targetNumber) {
          // Victory! Player has collected enough numbers
          setGameWon(true);
          playClickSound("primary");
        } else {
          // Not enough numbers collected yet - give feedback
          playClickSound("card");
          // Optional: Add visual feedback here (like screen shake or message)
        }
      }

      // Boundary checks
      if (newPlayer.x < 0) newPlayer.x = 0;
      if (newPlayer.x > 760) newPlayer.x = 760;

      // Ground collision - prevent falling through ground
      if (newPlayer.y + newPlayer.height >= 350) {
        // Land on grass surface - grass platform top is at y: 350
        newPlayer.y = 350 - newPlayer.height; // 350 - 64 = 286
        newPlayer.velocityY = 0;
        newPlayer.isOnGround = true;
        newPlayer.isJumping = false;
      }

      return newPlayer;
    });

    // Check collectible collisions - Enhanced with proper collision areas
    setCollectibles((prevCollectibles) => {
      return prevCollectibles.map((collectible) => {
        if (!collectible.collected) {
          // Create collision area for coin (make it generous for easier collection)
          const coinArea = {
            x: collectible.x,
            y: collectible.y,
            width: 40, // Generous collision area
            height: 40, // Generous collision area
          };

          if (checkCollision(player, coinArea)) {
            // Check if collecting in correct order
            if (collectible.value === nextToCollect) {
              // Correct order - collect the coin
              setCollectedValue((prev) => prev + collectible.value);
              setScore((prev) => prev + collectible.value);

              // Find next number to collect from current level
              const currentLevelNumbers = levels[currentLevel - 1].numbers;
              const currentIndex = currentLevelNumbers.indexOf(
                collectible.value
              );
              const nextIndex = currentIndex + 1;

              if (nextIndex < currentLevelNumbers.length) {
                setNextToCollect(currentLevelNumbers[nextIndex]);
              } else {
                // All numbers collected, set to a value that won't match any remaining
                setNextToCollect(-1);
              }

              playClickSound("primary");
              return { ...collectible, collected: true };
            } else {
              // Wrong order - play error sound and don't collect
              playClickSound("card");
            }
          }
        }
        return collectible;
      });
    });
  }, [
    gameStarted,
    gameWon,
    player,
    platforms,
    playClickSound,
    collectedValue,
    targetNumber,
    hasMushroomPower,
    nextToCollect,
    currentLevel,
    levels,
  ]);

  useEffect(() => {
    const interval = setInterval(gameLoop, 16);
    return () => clearInterval(interval);
  }, [gameLoop]);

  // Check win condition
  useEffect(() => {
    if (collectedValue === targetNumber && gameStarted) {
      setGameWon(true);
      playClickSound("primary");
      // Show quiz after a short delay
      setTimeout(() => {
        setShowQuiz(true);
      }, 2000);
    }
  }, [collectedValue, targetNumber, gameStarted, playClickSound]);

  // Keyboard controls with multi-key support
  useEffect(() => {
    if (!gameStarted) return;

    const keysPressed = new Set<string>();

    const handleKeyDown = (e: KeyboardEvent) => {
      keysPressed.add(e.key.toLowerCase());

      // Handle jump
      if (e.key === " " || e.key === "ArrowUp" || e.key.toLowerCase() === "w") {
        e.preventDefault();
        setPlayer((prev) => {
          if (prev.isOnGround && !prev.isJumping) {
            return {
              ...prev,
              velocityY: JUMP_POWER,
              isJumping: true,
              isOnGround: false,
            };
          }
          return prev;
        });
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      keysPressed.delete(e.key.toLowerCase());
    };

    // Movement loop - runs continuously
    const movementInterval = setInterval(() => {
      if (keysPressed.has("arrowleft") || keysPressed.has("a")) {
        setPlayer((prev) => ({
          ...prev,
          x: Math.max(0, prev.x - MOVE_SPEED),
          direction: "left",
        }));
      }
      if (keysPressed.has("arrowright") || keysPressed.has("d")) {
        setPlayer((prev) => ({
          ...prev,
          x: Math.min(760, prev.x + MOVE_SPEED),
          direction: "right",
        }));
      }
    }, 16); // ~60fps

    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
      clearInterval(movementInterval);
    };
  }, [gameStarted]);

  const startGame = () => {
    setGameStarted(true);
    setShowInstructions(false);
    playClickSound("primary");
  };

  const resetGame = () => {
    // Reset to Level 1
    setCurrentLevel(1);
    setGameStarted(false);
    setGameWon(false);
    setCollectedValue(0);
    setLives(3);
    setHasMushroomPower(false);
    setScore(0);
    setShowQuiz(false);
    setCurrentQuestionIndex(0);
    setQuizScore(0);
    setSelectedAnswer(null);
    setQuizCompleted(false);
    setShowInstructions(true);
    setNextToCollect(1);
    setPlayer({
      x: 20,
      y: 222,
      width: 64,
      height: 64,
      velocityY: 0,
      isJumping: false,
      isOnGround: true,
      direction: "right",
    });
    playClickSound("card");
  };

  const restartLevel = () => {
    // Reset level but keep game running (for "Try Again" button)
    setGameWon(false);
    setCollectedValue(0);
    setLives(3);
    setHasMushroomPower(false);
    setNextToCollect(levels[currentLevel - 1]?.numbers[0] || 1);
    setPlayer({
      x: 20,
      y: 222, // Standing exactly ON TOP of stone platform
      width: 64,
      height: 64,
      velocityY: 0,
      isJumping: false,
      isOnGround: true,
      direction: "right",
    });
    generateCollectibles();
    playClickSound("card");
    // Keep gameStarted = true so controls work immediately
  };

  const nextLevel = () => {
    if (currentLevel < levels.length) {
      setCurrentLevel((prev) => prev + 1);
      setGameWon(false);
      setGameStarted(false);
      setShowInstructions(true); // This will show the welcome message
      setCollectedValue(0);
      setLives(3);
      setHasMushroomPower(false);
      setShowQuiz(false);
      setCurrentQuestionIndex(0);
      setQuizScore(0);
      setSelectedAnswer(null);
      setQuizCompleted(false);
      // nextToCollect will be set in generateCollectibles when the level changes
      setPlayer({
        x: 20,
        y: 222,
        width: 64,
        height: 64,
        velocityY: 0,
        isJumping: false,
        isOnGround: true,
        direction: "right",
      });
      playClickSound("primary");
    }
  };

  const handleQuizAnswer = (answerIndex: number) => {
    setSelectedAnswer(answerIndex);
    const isCorrect =
      answerIndex === quizQuestions[currentQuestionIndex].correct;

    if (isCorrect) {
      setQuizScore((prev) => prev + 1);
      playClickSound("primary");
    } else {
      playClickSound("card");
    }

    // Show result for 2 seconds, then move to next question
    setTimeout(() => {
      if (currentQuestionIndex < quizQuestions.length - 1) {
        setCurrentQuestionIndex((prev) => prev + 1);
        setSelectedAnswer(null);
      } else {
        setQuizCompleted(true);
      }
    }, 2000);
  };

  const resetQuiz = () => {
    setCurrentQuestionIndex(0);
    setQuizScore(0);
    setSelectedAnswer(null);
    setQuizCompleted(false);
    // Keep showQuiz true so quiz stays visible
    playClickSound("card");
  };

  if (!mounted) return null;

  return (
    <div
      className={`min-h-screen relative overflow-hidden transition-all duration-1000 ${
        isDarkTheme
          ? "bg-gradient-to-br from-gray-900 via-slate-800 to-gray-900" // Stormy rainy night - dark gray
          : "bg-gradient-to-br from-sky-400 via-blue-300 to-teal-200" // Snowy day - vibrant sky blue to teal
      }`}
      style={{ fontFamily: "'Orbitron', sans-serif" }}
    >
      {/* Optimized Background with weather effects */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {/* Theme-specific gradient overlay */}
        <div
          className={`absolute inset-0 ${
            isDarkTheme
              ? "bg-gradient-to-br from-slate-900/30 via-gray-800/20 to-slate-900/30" // Dark stormy overlay
              : "bg-gradient-to-br from-blue-500/5 via-purple-500/5 to-cyan-500/5" // Light overlay
          }`}
        />

        {/* Static glowing orbs - no animation */}
        <div className="absolute w-64 h-64 rounded-full opacity-10 blur-3xl bg-blue-500 top-10 left-10" />
        <div className="absolute w-64 h-64 rounded-full opacity-10 blur-3xl bg-purple-500 top-20 right-20" />
        <div className="absolute w-64 h-64 rounded-full opacity-10 blur-3xl bg-cyan-500 bottom-20 left-1/2" />

        {/* Rain effect for dark mode on outer layout */}
        {isDarkTheme && (
          <div className="absolute inset-0">
            {[...Array(25)].map((_, i) => (
              <div
                key={`outer-rain-${i}`}
                className="outer-rain-drop"
                style={{
                  left: `${i * 4}%`,
                  animationDuration: `${1 + Math.random() * 0.5}s`,
                  animationDelay: `${Math.random() * 2}s`,
                }}
              />
            ))}
          </div>
        )}

        {/* Snow effect for light mode on outer layout */}
        {!isDarkTheme && (
          <div className="absolute inset-0">
            {[...Array(20)].map((_, i) => (
              <div
                key={`outer-snow-${i}`}
                className="outer-snow-flake"
                style={{
                  left: `${i * 5}%`,
                  width: `${4 + Math.random() * 5}px`,
                  height: `${4 + Math.random() * 5}px`,
                  animationDuration: `${4 + Math.random() * 3}s`,
                  animationDelay: `${Math.random() * 4}s`,
                }}
              />
            ))}
          </div>
        )}
      </div>

      {/* Modern Header */}
      <div className="relative z-10 pt-20 sm:pt-24 px-3 sm:px-4 md:px-6 pb-3 sm:pb-4 md:pb-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-4 mb-4 sm:mb-6">
          <Link href="/grade/6/mathematics/knowing-our-numbers">
            <Button
              variant="ghost"
              className="text-white hover:bg-white/10 border border-white/20 backdrop-blur-sm rounded-xl px-3 py-2 sm:px-4 sm:py-2 md:px-6 md:py-3 transition-all duration-300 hover:scale-105 text-sm sm:text-base"
            >
              <ArrowLeft className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
              Back
            </Button>
          </Link>

          <div className="flex items-center gap-2 sm:gap-3 md:gap-6 flex-wrap">
            <motion.div
              className="flex items-center gap-1 sm:gap-2 bg-gradient-to-r from-yellow-500/20 to-orange-500/20 backdrop-blur-sm border border-yellow-500/30 px-2 py-1 sm:px-3 sm:py-2 md:px-4 md:py-2 rounded-lg sm:rounded-xl"
              whileHover={{ scale: 1.05 }}
            >
              <Trophy className="h-4 w-4 sm:h-5 sm:w-5 text-yellow-400" />
              <span className="font-bold text-yellow-400 text-sm sm:text-base">
                {score}
              </span>
            </motion.div>

            <motion.div
              className="flex items-center gap-1 sm:gap-2 bg-gradient-to-r from-red-500/20 to-pink-500/20 backdrop-blur-sm border border-red-500/30 px-2 py-1 sm:px-3 sm:py-2 md:px-4 md:py-2 rounded-lg sm:rounded-xl"
              whileHover={{ scale: 1.05 }}
            >
              <span className="text-red-400 text-sm sm:text-base">❤️</span>
              <span className="font-bold text-red-400 text-sm sm:text-base">
                {lives}
              </span>
            </motion.div>

            {hasMushroomPower && (
              <motion.div
                className="flex items-center gap-1 sm:gap-2 bg-gradient-to-r from-purple-500/20 to-pink-500/20 backdrop-blur-sm border border-purple-500/30 px-2 py-1 sm:px-3 sm:py-2 md:px-4 md:py-2 rounded-lg sm:rounded-xl"
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                whileHover={{ scale: 1.05 }}
              >
                <span className="text-sm sm:text-base">🍄</span>
                <span className="font-bold text-purple-400 text-xs sm:text-sm">
                  Super Jump!
                </span>
              </motion.div>
            )}
          </div>
        </div>

        {/* Modern Game Info */}
        <div
          className={`text-center mb-4 sm:mb-6 ${
            isDarkTheme ? "text-white" : "text-gray-900"
          }`}
        >
          <motion.h1
            className={`text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold mb-2 sm:mb-3 ${
              isDarkTheme
                ? "bg-gradient-to-r from-blue-400 via-purple-500 to-cyan-400 bg-clip-text text-transparent"
                : "bg-gradient-to-r from-blue-600 via-purple-600 to-cyan-600 bg-clip-text text-transparent"
            }`}
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            🎮 Large Numbers Adventure
          </motion.h1>

          <motion.div
            className={`backdrop-blur-sm rounded-xl p-2 sm:p-3 mb-3 max-w-2xl mx-auto ${
              isDarkTheme
                ? "bg-gradient-to-r from-blue-500/10 to-purple-500/10 border border-blue-500/20"
                : "bg-white/70 border border-blue-400/40 shadow-lg"
            }`}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <p
              className={`text-sm sm:text-base font-semibold mb-2 ${
                isDarkTheme ? "text-blue-300" : "text-blue-700"
              }`}
            >
              🎯 Level {currentLevel}: {levels[currentLevel - 1]?.description}
            </p>

            <div className="grid grid-cols-2 gap-2 mb-2">
              <div
                className={`rounded-lg p-2 border ${
                  isDarkTheme
                    ? "bg-black/30 border-green-500/30"
                    : "bg-green-50/80 border-green-400/50"
                }`}
              >
                <div
                  className={`text-xs font-medium ${
                    isDarkTheme ? "text-green-400" : "text-green-700"
                  }`}
                >
                  Target
                </div>
                <div
                  className={`text-lg sm:text-xl font-bold ${
                    isDarkTheme ? "text-green-300" : "text-green-800"
                  }`}
                >
                  {formatIndianNumber(targetNumber)}
                </div>
              </div>
              <div
                className={`rounded-lg p-2 border ${
                  isDarkTheme
                    ? "bg-black/30 border-blue-500/30"
                    : "bg-blue-50/80 border-blue-400/50"
                }`}
              >
                <div
                  className={`text-xs font-medium ${
                    isDarkTheme ? "text-blue-400" : "text-blue-700"
                  }`}
                >
                  Collected
                </div>
                <div
                  className={`text-lg sm:text-xl font-bold ${
                    isDarkTheme ? "text-blue-300" : "text-blue-800"
                  }`}
                >
                  {formatIndianNumber(collectedValue)}
                </div>
              </div>
            </div>

            {/* Compact Progress Bar */}
            <div className="relative mb-2">
              <div className="bg-gray-800/50 rounded-full h-3 w-full overflow-hidden border border-gray-600/30">
                <motion.div
                  className="bg-gradient-to-r from-green-400 via-blue-500 to-purple-500 h-full rounded-full"
                  initial={{ width: 0 }}
                  animate={{
                    width: `${Math.min(
                      100,
                      (collectedValue / targetNumber) * 100
                    )}%`,
                  }}
                  transition={{ duration: 0.5, ease: "easeOut" }}
                />
              </div>
              <div className="absolute inset-0 flex items-center justify-center text-xs font-bold text-white">
                {Math.round((collectedValue / targetNumber) * 100)}%
              </div>
            </div>

            {/* Compact Next Number Hint */}
            <div className="mt-2">
              {collectedValue >= targetNumber ? (
                <div
                  className={`rounded-lg p-2 border ${
                    isDarkTheme
                      ? "bg-gradient-to-r from-green-500/20 to-emerald-500/20 border-green-500/30"
                      : "bg-gradient-to-r from-green-100 to-emerald-100 border-green-500/50"
                  }`}
                >
                  <span
                    className={`font-bold text-sm ${
                      isDarkTheme ? "text-green-300" : "text-green-800"
                    }`}
                  >
                    🎯 Ready to reach the tower!
                  </span>
                </div>
              ) : (
                <div
                  className={`rounded-lg p-2 border ${
                    isDarkTheme
                      ? "bg-gradient-to-r from-yellow-500/20 to-orange-500/20 border-yellow-500/30"
                      : "bg-gradient-to-r from-yellow-100 to-orange-100 border-orange-500/50"
                  }`}
                >
                  <div
                    className={`font-bold text-sm ${
                      isDarkTheme ? "text-yellow-300" : "text-orange-800"
                    }`}
                  >
                    ➡️ Next: Collect number {nextToCollect}
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        </div>
      </div>

      {/* Instructions Modal */}
      <AnimatePresence>
        {showInstructions && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto"
          >
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              className="bg-gradient-to-br from-gray-900 to-black border border-gray-700/50 rounded-2xl p-4 sm:p-6 md:p-8 max-w-2xl w-full my-4 sm:my-8 max-h-[90vh] overflow-y-auto"
            >
              <h2 className="text-xl sm:text-2xl md:text-3xl font-bold mb-4 sm:mb-6 text-center bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
                {currentLevel === 1
                  ? "🎮 How to Play"
                  : `🎉 Welcome to Level ${currentLevel}!`}
              </h2>

              {currentLevel > 1 && (
                <div className="bg-gradient-to-r from-green-500/20 to-emerald-500/20 border border-green-500/30 rounded-xl p-4 mb-4">
                  <p className="text-green-300 font-bold text-lg mb-2">
                    🏆 Level {currentLevel - 1} Complete!
                  </p>
                  <p className="text-gray-300 text-sm">
                    {levels[currentLevel - 1]?.description}
                  </p>
                </div>
              )}

              <div className="space-y-3 sm:space-y-4 mb-4 sm:mb-6">
                {/* Goal */}
                <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-3">
                  <h3 className="text-base sm:text-lg font-bold text-blue-300 mb-1">
                    🎯 Your Mission
                  </h3>
                  <p className="text-sm text-gray-300">
                    Collect numbers in order, then reach the goal tower!
                  </p>
                </div>

                {/* Controls */}
                <div className="bg-purple-500/10 border border-purple-500/30 rounded-lg p-3">
                  <h3 className="text-base sm:text-lg font-bold text-purple-300 mb-2">
                    🎮 Controls
                  </h3>
                  <div className="flex flex-wrap gap-3 text-sm text-gray-300">
                    <div className="flex items-center gap-2">
                      <kbd className="px-2 py-1 text-xs bg-gray-700 rounded border border-gray-600">
                        ←→
                      </kbd>
                      <span>Move</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <kbd className="px-2 py-1 text-xs bg-gray-700 rounded border border-gray-600">
                        ↑
                      </kbd>
                      <span>Jump</span>
                    </div>
                  </div>
                </div>

                {/* Game Elements */}
                <div className="bg-green-500/10 border border-green-500/30 rounded-lg p-3">
                  <h3 className="text-base sm:text-lg font-bold text-green-300 mb-2">
                    🎨 Game Elements
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {/* Character */}
                    <div className="flex items-center gap-2 bg-black/30 rounded-lg p-2">
                      <img
                        src="/character.png"
                        alt="Character"
                        className="w-8 h-8 sm:w-10 sm:h-10 flex-shrink-0"
                        style={{ imageRendering: "pixelated" }}
                      />
                      <div className="min-w-0">
                        <p className="font-semibold text-white text-sm">
                          Your Character
                        </p>
                        <p className="text-xs text-gray-400">Move and jump</p>
                      </div>
                    </div>

                    {/* Coins */}
                    <div className="flex items-center gap-2 bg-black/30 rounded-lg p-2">
                      <div className="text-2xl sm:text-3xl flex-shrink-0">
                        🪙
                      </div>
                      <div className="min-w-0">
                        <p className="font-semibold text-yellow-300 text-sm">
                          Number Coins
                        </p>
                        <p className="text-xs text-gray-400">
                          Collect in order
                        </p>
                      </div>
                    </div>

                    {/* Stone Platform */}
                    <div className="flex items-center gap-2 bg-black/30 rounded-lg p-2">
                      <img
                        src="/stone.png"
                        alt="Stone"
                        className="w-8 h-8 sm:w-10 sm:h-10 flex-shrink-0"
                        style={{ imageRendering: "pixelated" }}
                      />
                      <div className="min-w-0">
                        <p className="font-semibold text-gray-300 text-sm">
                          Stone Platform
                        </p>
                        <p className="text-xs text-gray-400">Jump from here</p>
                      </div>
                    </div>

                    {/* Mushroom */}
                    <div className="flex items-center gap-2 bg-black/30 rounded-lg p-2">
                      <img
                        src="/mushroom.png"
                        alt="Mushroom"
                        className="w-8 h-8 sm:w-10 sm:h-10 flex-shrink-0"
                        style={{ imageRendering: "pixelated" }}
                      />
                      <div className="min-w-0">
                        <p className="font-semibold text-red-300 text-sm">
                          Mushroom 🚀
                        </p>
                        <p className="text-xs text-gray-400">Bounces you up</p>
                      </div>
                    </div>

                    {/* Poison Plant */}
                    <div className="flex items-center gap-2 bg-black/30 rounded-lg p-2 border border-red-500/30">
                      <img
                        src="/poisonplant.png"
                        alt="Poison"
                        className="w-8 h-8 sm:w-10 sm:h-10 flex-shrink-0"
                        style={{ imageRendering: "pixelated" }}
                      />
                      <div className="min-w-0">
                        <p className="font-semibold text-red-400 text-sm">
                          ⚠️ Poison Plant
                        </p>
                        <p className="text-xs text-gray-400">Avoid! -1 heart</p>
                      </div>
                    </div>

                    {/* Goal Tower */}
                    <div className="flex items-center gap-2 bg-black/30 rounded-lg p-2 border border-green-500/30">
                      <img
                        src="/tower_goal.png"
                        alt="Tower"
                        className="w-8 h-8 sm:w-10 sm:h-10 flex-shrink-0"
                        style={{ imageRendering: "pixelated" }}
                      />
                      <div className="min-w-0">
                        <p className="font-semibold text-green-400 text-sm">
                          🏆 Goal Tower
                        </p>
                        <p className="text-xs text-gray-400">Win here!</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Important Rules */}
                <div className="bg-orange-500/10 border border-orange-500/30 rounded-lg p-3">
                  <h3 className="text-base sm:text-lg font-bold text-orange-300 mb-2">
                    ⚡ Rules
                  </h3>
                  <ul className="space-y-1.5 text-gray-300 text-xs sm:text-sm">
                    <li className="flex items-start gap-2">
                      <span className="text-yellow-400 flex-shrink-0">1️⃣</span>
                      <span>Collect numbers in correct order</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-yellow-400 flex-shrink-0">2️⃣</span>
                      <span>You have 3 hearts ❤️ - avoid poison!</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-yellow-400 flex-shrink-0">3️⃣</span>
                      <span>Use mushroom to reach high places</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-yellow-400 flex-shrink-0">4️⃣</span>
                      <span>Complete quiz to unlock next level</span>
                    </li>
                  </ul>
                </div>
              </div>

              <Button
                onClick={startGame}
                className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 py-3 sm:py-4 text-base sm:text-lg font-bold rounded-xl"
              >
                🚀 Start Adventure!
              </Button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Consolidated CSS animations */}
      <style jsx>{`
        @keyframes snow-fall {
          0% {
            transform: translateY(-10px) translateX(0);
            opacity: 0.8;
          }
          100% {
            transform: translateY(420px) translateX(20px);
            opacity: 0.3;
          }
        }
        @keyframes rain-fall {
          0% {
            transform: translateY(-100%);
            opacity: 0.6;
          }
          100% {
            transform: translateY(500px);
            opacity: 0;
          }
        }
        @keyframes outer-rain {
          0% {
            transform: translateY(-100%);
            opacity: 0.4;
          }
          100% {
            transform: translateY(100vh);
            opacity: 0;
          }
        }
        @keyframes outer-snow {
          0% {
            transform: translateY(-20px) translateX(0);
            opacity: 0.7;
          }
          100% {
            transform: translateY(100vh) translateX(30px);
            opacity: 0.2;
          }
        }
        @keyframes disco-glow {
          0% {
            box-shadow: 0 0 20px #ff0080, 0 0 40px #ff0080, 0 0 60px #ff0080;
          }
          25% {
            box-shadow: 0 0 20px #00ff80, 0 0 40px #00ff80, 0 0 60px #00ff80;
          }
          50% {
            box-shadow: 0 0 20px #0080ff, 0 0 40px #0080ff, 0 0 60px #0080ff;
          }
          75% {
            box-shadow: 0 0 20px #ff8000, 0 0 40px #ff8000, 0 0 60px #ff8000;
          }
          100% {
            box-shadow: 0 0 20px #ff0080, 0 0 40px #ff0080, 0 0 60px #ff0080;
          }
        }
        .snow-flake {
          position: absolute;
          background: white;
          border-radius: 50%;
          animation: snow-fall linear infinite;
          box-shadow: 0 0 3px rgba(255, 255, 255, 0.8);
        }
        .rain-drop {
          position: absolute;
          width: 1px;
          height: 20px;
          background: linear-gradient(
            to bottom,
            transparent,
            rgba(173, 216, 230, 0.6)
          );
          animation: rain-fall linear infinite;
        }
        .outer-rain-drop {
          position: absolute;
          width: 1px;
          height: 25px;
          background: linear-gradient(
            to bottom,
            transparent,
            rgba(173, 216, 230, 0.5)
          );
          animation: outer-rain linear infinite;
        }
        .outer-snow-flake {
          position: absolute;
          background: white;
          border-radius: 50%;
          animation: outer-snow linear infinite;
          box-shadow: 0 0 5px rgba(255, 255, 255, 0.8);
        }
        .disco-border {
          position: absolute;
          inset: -4px;
          border-radius: 0.5rem;
          border: 4px solid transparent;
          background: linear-gradient(
              45deg,
              #ff0080,
              #00ff80,
              #0080ff,
              #ff8000,
              #ff0080
            )
            border-box;
          -webkit-mask: linear-gradient(#fff 0 0) padding-box,
            linear-gradient(#fff 0 0);
          -webkit-mask-composite: xor;
          mask-composite: exclude;
          animation: disco-glow 3s linear infinite;
          pointer-events: none;
          z-index: 10;
        }
      `}</style>

      {/* Game Canvas - Exact Reference Match */}
      <div
        className="relative mx-auto"
        style={{ width: "800px", height: "400px" }}
      >
        <div
          className="relative w-full h-full rounded-lg overflow-hidden"
          style={{
            background: isDarkTheme
              ? "linear-gradient(to bottom, #1a1f3a 0%, #2d3561 100%)" // Night sky - dark blue
              : "linear-gradient(to bottom, #87CEEB 0%, #B0E0E6 50%, #E0F6FF 100%)", // Winter day - bright cyan to light blue
            imageRendering: "pixelated",
          }}
        >
          {/* Disco glowing border effect */}
          <div className="disco-border"></div>
          {/* WIDER Mountain Background - BEHIND the grass */}
          <img
            src="/Mountain.png"
            alt="Background Mountains"
            className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-96 h-80 opacity-80"
            style={{ imageRendering: "pixelated", zIndex: 1 }}
          />

          {/* Background Clouds */}
          <img
            src="/cloud.png"
            alt="Cloud"
            className="absolute top-8 left-16 w-24 h-16"
            style={{ imageRendering: "pixelated", zIndex: 2 }}
          />
          <img
            src="/cloud2.png"
            alt="Cloud"
            className="absolute top-4 right-32 w-32 h-20"
            style={{ imageRendering: "pixelated", zIndex: 2 }}
          />

          {/* GRASS covering GROUND - Reduced height */}
          <img
            src="/grass.png"
            alt="Grass Ground"
            className="absolute bottom-0 left-0 w-full h-12"
            style={{
              imageRendering: "pixelated",
              zIndex: 3,
              width: "100%",
              height: "50px",
              objectFit: "cover",
            }}
          />

          {/* Stone Platform touching the tip of grass - Starting Point - LARGE SIZE FOR TESTING */}
          <img
            src="/stone.png"
            alt="Stone Platform - Starting Point"
            className="absolute w-32 h-16"
            style={{
              left: "16px",
              bottom: "50px", // Exactly at the top of the 50px grass
              imageRendering: "pixelated",
              zIndex: 2, // Much lower than character (zIndex: 10)
            }}
          />

          {/* Enhanced Character with smooth animations */}
          <img
            src="/character.png"
            alt="Player Character"
            className="absolute w-16 h-16 transition-transform duration-100 ease-out"
            style={{
              left: player.x,
              top: player.y,
              imageRendering: "pixelated",
              transform: `
                ${player.direction === "left" ? "scaleX(-1)" : "scaleX(1)"}
                ${player.isJumping ? "scaleY(1.1)" : "scaleY(1)"}
                ${!player.isOnGround ? "rotate(5deg)" : "rotate(0deg)"}
              `,
              zIndex: 10,
            }}
          />

          {/* Mushroom Spring - Bounces character up when landed on */}
          <img
            src="/mushroom.png"
            alt="Mushroom Spring"
            className="absolute w-16 h-16 cursor-pointer hover:scale-110 transition-transform"
            style={{
              left: "320px",
              bottom: "50px", // At grass level like poison plant
              imageRendering: "pixelated",
              zIndex: 4,
            }}
          />

          {/* Poison Plant touching the tip of grass - Takes away heart */}
          <img
            src="/poisonplant.png"
            alt="Poison Plant Trap"
            className="absolute right-60 w-12 h-12"
            style={{
              imageRendering: "pixelated",
              zIndex: 4,
              bottom: "50px", // Exactly at the top of the 50px grass
            }}
          />

          {/* Goal Tower ON the grass ground - Ending Point */}
          <img
            src="/tower_goal.png"
            alt="Goal Tower - Ending Point"
            className="absolute right-0 w-24 h-48"
            style={{
              imageRendering: "pixelated",
              zIndex: 15, // Higher than character (10) so character goes behind tower
              bottom: "0px", // Tower base touches the very bottom (ground level)
            }}
          />

          {/* Number Coins - Shows 1, 2, 3, 4 */}
          {collectibles.map(
            (collectible) =>
              !collectible.collected && (
                <div
                  key={collectible.id}
                  className="absolute flex items-center justify-center"
                  style={{ zIndex: 5 }}
                >
                  <div
                    className="relative animate-bounce cursor-pointer hover:scale-125 transition-transform"
                    style={{
                      left: collectible.x,
                      top: collectible.y,
                      animationDuration: "2s",
                    }}
                  >
                    {/* Coin background */}
                    <div className="text-3xl">🪙</div>
                    {/* Number on top of coin */}
                    <div
                      className="absolute inset-0 flex items-center justify-center text-lg font-bold text-yellow-900"
                      style={{ top: "2px" }}
                    >
                      {collectible.value}
                    </div>
                  </div>
                </div>
              )
          )}

          {/* Lives Display - Hearts */}
          <div className="absolute top-4 right-4 flex space-x-1">
            {Array.from({ length: 3 }).map((_, i) => (
              <div
                key={i}
                className={`text-xl ${
                  i < lives ? "text-red-500" : "text-gray-400"
                }`}
              >
                ❤️
              </div>
            ))}
          </div>

          {/* Day/Night Sky Element */}
          <div className="absolute top-8 left-8 text-3xl z-20">
            {isDarkTheme ? "🌙" : "☀️"}
          </div>

          {/* CSS-based snow effect for light mode - hardware accelerated */}
          {!isDarkTheme && (
            <div className="absolute inset-0 pointer-events-none overflow-hidden">
              {[...Array(15)].map((_, i) => (
                <div
                  key={`snow-${i}`}
                  className="snow-flake"
                  style={{
                    left: `${i * 6.5 + Math.random() * 5}%`,
                    width: `${3 + Math.random() * 4}px`,
                    height: `${3 + Math.random() * 4}px`,
                    animationDuration: `${3 + Math.random() * 2}s`,
                    animationDelay: `${Math.random() * 3}s`,
                  }}
                />
              ))}
            </div>
          )}

          {/* Realistic tiny white stars for night mode */}
          {isDarkTheme && (
            <div className="absolute inset-0 pointer-events-none">
              {/* Small stars */}
              <div className="absolute top-[8%] left-[15%] w-1 h-1 bg-white rounded-full opacity-80"></div>
              <div className="absolute top-[12%] left-[25%] w-0.5 h-0.5 bg-white rounded-full opacity-60"></div>
              <div className="absolute top-[18%] left-[35%] w-1 h-1 bg-white rounded-full opacity-90"></div>
              <div className="absolute top-[10%] left-[45%] w-0.5 h-0.5 bg-white rounded-full opacity-70"></div>
              <div className="absolute top-[15%] left-[55%] w-1 h-1 bg-white rounded-full opacity-85"></div>
              <div className="absolute top-[20%] left-[65%] w-0.5 h-0.5 bg-white rounded-full opacity-75"></div>
              <div className="absolute top-[8%] left-[75%] w-1 h-1 bg-white rounded-full opacity-80"></div>
              <div className="absolute top-[14%] left-[85%] w-0.5 h-0.5 bg-white rounded-full opacity-65"></div>
              <div className="absolute top-[22%] left-[92%] w-1 h-1 bg-white rounded-full opacity-90"></div>

              {/* Medium stars */}
              <div className="absolute top-[25%] left-[20%] w-1.5 h-1.5 bg-white rounded-full opacity-95"></div>
              <div className="absolute top-[28%] left-[40%] w-1 h-1 bg-white rounded-full opacity-80"></div>
              <div className="absolute top-[32%] left-[60%] w-1.5 h-1.5 bg-white rounded-full opacity-90"></div>
              <div className="absolute top-[30%] left-[80%] w-1 h-1 bg-white rounded-full opacity-85"></div>

              {/* Tiny scattered stars */}
              <div className="absolute top-[5%] left-[10%] w-0.5 h-0.5 bg-white rounded-full opacity-50"></div>
              <div className="absolute top-[7%] left-[50%] w-0.5 h-0.5 bg-white rounded-full opacity-55"></div>
              <div className="absolute top-[11%] left-[70%] w-0.5 h-0.5 bg-white rounded-full opacity-60"></div>
              <div className="absolute top-[16%] left-[30%] w-0.5 h-0.5 bg-white rounded-full opacity-50"></div>
              <div className="absolute top-[19%] left-[88%] w-0.5 h-0.5 bg-white rounded-full opacity-55"></div>
              <div className="absolute top-[24%] left-[12%] w-0.5 h-0.5 bg-white rounded-full opacity-60"></div>
              <div className="absolute top-[26%] left-[48%] w-0.5 h-0.5 bg-white rounded-full opacity-50"></div>
              <div className="absolute top-[29%] left-[72%] w-0.5 h-0.5 bg-white rounded-full opacity-55"></div>
              <div className="absolute top-[33%] left-[35%] w-0.5 h-0.5 bg-white rounded-full opacity-60"></div>
              <div className="absolute top-[35%] left-[90%] w-0.5 h-0.5 bg-white rounded-full opacity-50"></div>
            </div>
          )}

          {/* CSS-based rain effect - hardware accelerated */}
          {isDarkTheme && (
            <div className="absolute inset-0 pointer-events-none overflow-hidden">
              {[...Array(12)].map((_, i) => (
                <div
                  key={`rain-${i}`}
                  className="rain-drop"
                  style={{
                    left: `${i * 8 + Math.random() * 5}%`,
                    animationDuration: `${0.8 + Math.random() * 0.4}s`,
                    animationDelay: `${Math.random() * 2}s`,
                  }}
                />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Quiz Section */}
      <AnimatePresence>
        {showQuiz && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto"
          >
            <motion.div
              initial={{ y: 50 }}
              animate={{ y: 0 }}
              className="max-w-4xl w-full my-8"
            >
              <div className="bg-gradient-to-br from-gray-900/95 to-black/95 backdrop-blur-xl border border-gray-700/50 rounded-3xl p-8 shadow-2xl">
                {!quizCompleted ? (
                  <>
                    <div className="flex items-center justify-between mb-6">
                      <h2 className="text-3xl font-bold bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
                        🧠 Knowledge Check
                      </h2>
                      <div className="bg-gradient-to-r from-blue-500/20 to-purple-500/20 border border-blue-500/30 rounded-xl px-4 py-2">
                        <span className="text-blue-300 font-semibold">
                          Question {currentQuestionIndex + 1} of{" "}
                          {quizQuestions.length}
                        </span>
                      </div>
                    </div>

                    <div className="mb-8">
                      <h3 className="text-xl font-semibold text-white mb-6">
                        {quizQuestions[currentQuestionIndex].question}
                      </h3>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {quizQuestions[currentQuestionIndex].options.map(
                          (option, index) => (
                            <motion.button
                              key={index}
                              onClick={() => handleQuizAnswer(index)}
                              disabled={selectedAnswer !== null}
                              className={`p-4 rounded-xl border-2 transition-all duration-300 text-left font-medium ${
                                selectedAnswer === null
                                  ? "border-gray-600 bg-gray-800/50 hover:border-blue-500 hover:bg-blue-500/10 text-white"
                                  : selectedAnswer === index
                                  ? index ===
                                    quizQuestions[currentQuestionIndex].correct
                                    ? "border-green-500 bg-green-500/20 text-green-300"
                                    : "border-red-500 bg-red-500/20 text-red-300"
                                  : index ===
                                    quizQuestions[currentQuestionIndex].correct
                                  ? "border-green-500 bg-green-500/20 text-green-300"
                                  : "border-gray-600 bg-gray-800/30 text-gray-400"
                              }`}
                              whileHover={
                                selectedAnswer === null ? { scale: 1.02 } : {}
                              }
                              whileTap={
                                selectedAnswer === null ? { scale: 0.98 } : {}
                              }
                            >
                              <span className="font-bold mr-3">
                                {String.fromCharCode(65 + index)}.
                              </span>
                              {option}
                            </motion.button>
                          )
                        )}
                      </div>

                      {selectedAnswer !== null && (
                        <motion.div
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="mt-6 p-4 bg-blue-500/10 border border-blue-500/30 rounded-xl"
                        >
                          <p className="text-blue-300 font-medium">
                            💡 {quizQuestions[currentQuestionIndex].explanation}
                          </p>
                        </motion.div>
                      )}
                    </div>
                  </>
                ) : (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="text-center"
                  >
                    <div className="text-6xl mb-4">
                      {quizScore >= 4 ? "🏆" : quizScore >= 3 ? "🎉" : "📚"}
                    </div>
                    <h2 className="text-3xl font-bold mb-4 bg-gradient-to-r from-yellow-400 to-orange-500 bg-clip-text text-transparent">
                      Quiz Complete!
                    </h2>
                    <p className="text-xl text-white mb-2">
                      Your Score:{" "}
                      <span className="font-bold text-green-400">
                        {quizScore}
                      </span>{" "}
                      out of {quizQuestions.length}
                    </p>
                    <p className="text-lg text-gray-300 mb-6">
                      {quizScore >= 4
                        ? "Excellent! You're a numbers expert!"
                        : quizScore >= 3
                        ? "Great job! Keep practicing!"
                        : "Good effort! Review the concepts and try again!"}
                    </p>

                    <div className="flex flex-col gap-4">
                      {quizScore >= 3 ? (
                        <>
                          <div className="bg-green-500/10 border border-green-500/30 rounded-xl p-3 mb-2">
                            <p className="text-green-300 font-semibold">
                              ✅ Quiz Passed! You can proceed to the next level.
                            </p>
                          </div>
                          {/* Download Badge Button */}
                          {currentLevel >= levels.length && (
                            <Button
                              onClick={downloadCompletionBadge}
                              className="w-full bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 text-white font-bold px-6 py-3 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 border border-white/20"
                            >
                              <Trophy className="h-5 w-5 mr-2 inline" />
                              Download Completion Badge
                            </Button>
                          )}

                          <div className="flex gap-4 justify-center">
                            {currentLevel < levels.length ? (
                              <Button
                                onClick={nextLevel}
                                className="flex-1 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 px-6 py-3 rounded-xl text-lg font-bold"
                              >
                                🚀 Next Level
                              </Button>
                            ) : (
                              <Button
                                onClick={resetGame}
                                className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 px-6 py-3 rounded-xl text-lg font-bold"
                              >
                                🎮 Play Again
                              </Button>
                            )}
                            <Button
                              onClick={resetQuiz}
                              variant="outline"
                              className="border-gray-600 text-gray-300 hover:bg-gray-700 px-6 py-3 rounded-xl"
                            >
                              🔄 Retry Quiz
                            </Button>
                          </div>
                        </>
                      ) : (
                        <>
                          <div className="bg-orange-500/10 border border-orange-500/30 rounded-xl p-3 mb-2">
                            <p className="text-orange-300 font-semibold">
                              📚 You need at least 3 correct answers to proceed.
                            </p>
                          </div>
                          <div className="flex gap-4 justify-center">
                            <Button
                              onClick={resetQuiz}
                              className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 px-6 py-3 rounded-xl text-lg font-bold"
                            >
                              🔄 Try Quiz Again
                            </Button>
                            <Button
                              onClick={restartLevel}
                              variant="outline"
                              className="border-gray-600 text-gray-300 hover:bg-gray-700 px-6 py-3 rounded-xl"
                            >
                              🎮 Replay Level
                            </Button>
                          </div>
                        </>
                      )}
                    </div>
                  </motion.div>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Game Over/Win Modal */}
      <AnimatePresence>
        {gameWon && !showQuiz && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ scale: 0.8, opacity: 0, rotateY: -15 }}
              animate={{ scale: 1, opacity: 1, rotateY: 0 }}
              className="bg-gradient-to-br from-gray-900 to-black border border-gray-700/50 rounded-3xl p-8 max-w-md w-full text-center shadow-2xl"
            >
              <div className="text-6xl mb-4">🏆</div>

              <h2 className="text-3xl font-bold mb-4 bg-gradient-to-r from-yellow-400 via-orange-500 to-red-500 bg-clip-text text-transparent">
                🎉 Level Complete! 🎉
              </h2>

              <div className="bg-gradient-to-r from-blue-500/10 to-purple-500/10 border border-blue-500/30 rounded-2xl p-4 mb-4">
                <p className="text-gray-300 mb-2">
                  You successfully collected all numbers and built:
                </p>
                <p className="text-4xl font-bold bg-gradient-to-r from-green-400 to-blue-500 bg-clip-text text-transparent mb-2">
                  {formatIndianNumber(targetNumber)}
                </p>
                <p className="text-lg text-gray-400">
                  (
                  {targetNumber >= 10000000
                    ? `${(targetNumber / 10000000).toFixed(1)} Crore`
                    : targetNumber >= 100000
                    ? `${(targetNumber / 100000).toFixed(1)} Lakh`
                    : targetNumber >= 1000
                    ? `${(targetNumber / 1000).toFixed(1)} Thousand`
                    : targetNumber.toString()}
                  )
                </p>
              </div>

              <div className="bg-gradient-to-r from-purple-500/20 to-pink-500/20 border border-purple-500/30 rounded-2xl p-4 mb-6">
                <p className="text-cyan-300 font-bold text-lg mb-2">
                  🧠 Knowledge Quiz Time!
                </p>
                <p className="text-gray-400 text-sm">
                  Answer 5 questions to unlock the next level
                </p>
              </div>

              <div className="flex flex-col gap-3">
                <Button
                  onClick={() => setShowQuiz(true)}
                  className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 px-6 py-4 rounded-xl text-lg font-bold"
                >
                  🧠 Start Quiz Now
                </Button>

                <div className="flex gap-3">
                  <Button
                    onClick={restartLevel}
                    variant="outline"
                    className="flex-1 border-gray-600 text-gray-300 hover:bg-gray-700 px-4 py-2 rounded-xl"
                  >
                    <RotateCcw className="h-4 w-4 mr-2" />
                    Replay Level
                  </Button>

                  <Button
                    onClick={() =>
                      (window.location.href =
                        "/grade/6/mathematics/knowing-our-numbers")
                    }
                    variant="outline"
                    className="flex-1 border-gray-600 text-gray-300 hover:bg-gray-700 px-4 py-2 rounded-xl"
                  >
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    Exit
                  </Button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Controls Help */}
      <div className="fixed bottom-4 right-4 bg-black/80 backdrop-blur-sm border border-gray-600/50 rounded-xl p-4 text-sm text-white z-10">
        <p className="font-semibold mb-2 text-cyan-300">Controls:</p>
        <p className="text-gray-300">Arrow keys: Move</p>
        <p className="text-gray-300">Space: Jump</p>
      </div>
    </div>
  );
}
