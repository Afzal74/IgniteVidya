"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import {
  ArrowLeft,
  Play,
  RotateCcw,
  Trophy,
  Star,
  Volume2,
  VolumeX,
  Target,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";

// Game constants - Made easier and slower
const GAME_WIDTH = 800;
const GAME_HEIGHT = 600;
const BIRD_SIZE = 140; // Even larger bird for better visibility of GIF
const PIPE_WIDTH = 80;
const PIPE_GAP = 340; // Larger gap to accommodate bigger bird
const GRAVITY = 0.4; // Reduced gravity for slower falling
const JUMP_FORCE = -8; // Reduced jump force for gentler movement
const PIPE_SPEED = 2; // Slower pipe movement

// English vocabulary for different levels - now with vocabulary matching concept
const VOCABULARY_SETS = {
  easy: [
    {
      word: "CAT",
      definition: "A small furry pet animal",
      options: [
        "A small furry pet animal",
        "A large wild animal",
        "A flying creature",
        "A sea creature",
      ],
    },
    {
      word: "DOG",
      definition: "A loyal four-legged friend",
      options: [
        "A loyal four-legged friend",
        "A bird that sings",
        "A fish in water",
        "A tree branch",
      ],
    },
    {
      word: "SUN",
      definition: "The bright star in our sky",
      options: [
        "The bright star in our sky",
        "A cold winter day",
        "A dark cave",
        "A deep ocean",
      ],
    },
    {
      word: "BOOK",
      definition: "Something you read",
      options: [
        "Something you read",
        "Something you eat",
        "Something you wear",
        "Something you drive",
      ],
    },
    {
      word: "TREE",
      definition: "A tall plant with leaves",
      options: [
        "A tall plant with leaves",
        "A small insect",
        "A metal object",
        "A liquid substance",
      ],
    },
    {
      word: "BIRD",
      definition: "An animal that can fly",
      options: [
        "An animal that can fly",
        "An animal that swims",
        "An animal that digs",
        "An animal that sleeps",
      ],
    },
    {
      word: "FISH",
      definition: "An animal that lives in water",
      options: [
        "An animal that lives in water",
        "An animal that climbs trees",
        "An animal that runs fast",
        "An animal that jumps high",
      ],
    },
    {
      word: "MOON",
      definition: "Earth's natural satellite",
      options: [
        "Earth's natural satellite",
        "A type of flower",
        "A musical instrument",
        "A cooking utensil",
      ],
    },
  ],
  medium: [
    {
      word: "ADVENTURE",
      definition: "An exciting journey",
      options: [
        "An exciting journey",
        "A boring task",
        "A simple meal",
        "A quiet room",
      ],
    },
    {
      word: "MYSTERY",
      definition: "Something unknown or puzzling",
      options: [
        "Something unknown or puzzling",
        "Something very obvious",
        "Something very simple",
        "Something very common",
      ],
    },
    {
      word: "COURAGE",
      definition: "Bravery in difficult situations",
      options: [
        "Bravery in difficult situations",
        "Fear of everything",
        "Laziness in work",
        "Confusion in thinking",
      ],
    },
    {
      word: "FRIENDSHIP",
      definition: "A close relationship between people",
      options: [
        "A close relationship between people",
        "A distant memory",
        "A broken promise",
        "A lost opportunity",
      ],
    },
    {
      word: "KNOWLEDGE",
      definition: "Information and understanding",
      options: [
        "Information and understanding",
        "Complete ignorance",
        "Total confusion",
        "Pure guesswork",
      ],
    },
    {
      word: "CREATIVE",
      definition: "Having original ideas",
      options: [
        "Having original ideas",
        "Copying others always",
        "Never thinking new",
        "Following rules only",
      ],
    },
    {
      word: "EXPLORE",
      definition: "To investigate or discover",
      options: [
        "To investigate or discover",
        "To ignore completely",
        "To avoid always",
        "To forget quickly",
      ],
    },
    {
      word: "IMAGINE",
      definition: "To form mental pictures",
      options: [
        "To form mental pictures",
        "To see only reality",
        "To avoid all thoughts",
        "To copy exact images",
      ],
    },
  ],
  hard: [
    {
      word: "MAGNIFICENT",
      definition: "Extremely beautiful or impressive",
      options: [
        "Extremely beautiful or impressive",
        "Very ordinary and plain",
        "Quite ugly and boring",
        "Completely invisible",
      ],
    },
    {
      word: "PERSEVERANCE",
      definition: "Persistence in doing something",
      options: [
        "Persistence in doing something",
        "Giving up immediately",
        "Avoiding all challenges",
        "Forgetting the goal",
      ],
    },
    {
      word: "EXTRAORDINARY",
      definition: "Very unusual or remarkable",
      options: [
        "Very unusual or remarkable",
        "Completely ordinary",
        "Totally predictable",
        "Entirely forgettable",
      ],
    },
    {
      word: "COMPASSIONATE",
      definition: "Showing sympathy and concern",
      options: [
        "Showing sympathy and concern",
        "Being cruel and harsh",
        "Showing no emotions",
        "Acting selfishly always",
      ],
    },
    {
      word: "DETERMINATION",
      definition: "Firmness of purpose",
      options: [
        "Firmness of purpose",
        "Lack of direction",
        "Constant hesitation",
        "Complete indecision",
      ],
    },
    {
      word: "SOPHISTICATED",
      definition: "Complex and refined",
      options: [
        "Complex and refined",
        "Simple and crude",
        "Basic and rough",
        "Plain and ordinary",
      ],
    },
    {
      word: "ENTHUSIASTIC",
      definition: "Showing intense enjoyment",
      options: [
        "Showing intense enjoyment",
        "Displaying complete boredom",
        "Expressing total dislike",
        "Demonstrating no interest",
      ],
    },
    {
      word: "PHILOSOPHICAL",
      definition: "Relating to deep thinking",
      options: [
        "Relating to deep thinking",
        "Avoiding all thoughts",
        "Preferring simple answers",
        "Rejecting complex ideas",
      ],
    },
  ],
};

interface Bird {
  x: number;
  y: number;
  velocity: number;
  rotation: number;
}

interface Pipe {
  x: number;
  topHeight: number;
  bottomY: number;
  passed: boolean;
  word: string;
  definition: string;
  options: string[];
}

interface GameState {
  score: number;
  level: number;
  lives: number;
  isPlaying: boolean;
  gameOver: boolean;
  showWordChallenge: boolean;
  currentWord: { word: string; definition: string; options: string[] } | null;
  difficulty: "easy" | "medium" | "hard";
  soundEnabled: boolean;
  selectedAnswer: string | null;
  showCountdown: boolean;
  countdownNumber: number;
  showFeedback: boolean;
  isCorrectAnswer: boolean;
}

export default function FlappyWordsGame() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const gameLoopRef = useRef<number>();
  const audioContext = useRef<AudioContext | null>(null);
  const birdImageRef = useRef<HTMLImageElement | null>(null);
  const birdElementRef = useRef<HTMLImageElement | null>(null);

  const [gameState, setGameState] = useState<GameState>({
    score: 0,
    level: 1,
    lives: 3,
    isPlaying: false,
    gameOver: false,
    showWordChallenge: false,
    currentWord: null,
    difficulty: "easy",
    soundEnabled: true,
    selectedAnswer: null,
    showCountdown: false,
    countdownNumber: 3,
    showFeedback: false,
    isCorrectAnswer: false,
  });

  const [bird, setBird] = useState<Bird>({
    x: 100,
    y: GAME_HEIGHT / 2,
    velocity: 0,
    rotation: 0,
  });

  const [pipes, setPipes] = useState<Pipe[]>([]);
  const [particles, setParticles] = useState<
    Array<{
      x: number;
      y: number;
      vx: number;
      vy: number;
      life: number;
      color: string;
    }>
  >([]);

  // Load bird image
  useEffect(() => {
    const img = new Image();
    img.src = "/Bird.gif";
    img.onload = () => {
      birdImageRef.current = img;
    };
  }, []);

  // Sound effects
  const playSound = useCallback(
    (type: "jump" | "score" | "hit" | "word") => {
      if (!gameState.soundEnabled) return;

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

        switch (type) {
          case "jump":
            oscillator.type = "sine";
            oscillator.frequency.setValueAtTime(400, ctx.currentTime);
            gainNode.gain.setValueAtTime(0.1, ctx.currentTime);
            gainNode.gain.exponentialRampToValueAtTime(
              0.001,
              ctx.currentTime + 0.2
            );
            oscillator.start(ctx.currentTime);
            oscillator.stop(ctx.currentTime + 0.2);
            break;
          case "score":
            oscillator.type = "sine";
            oscillator.frequency.setValueAtTime(523, ctx.currentTime);
            oscillator.frequency.setValueAtTime(659, ctx.currentTime + 0.1);
            oscillator.frequency.setValueAtTime(784, ctx.currentTime + 0.2);
            gainNode.gain.setValueAtTime(0.1, ctx.currentTime);
            gainNode.gain.exponentialRampToValueAtTime(
              0.001,
              ctx.currentTime + 0.3
            );
            oscillator.start(ctx.currentTime);
            oscillator.stop(ctx.currentTime + 0.3);
            break;
          case "hit":
            oscillator.type = "sawtooth";
            oscillator.frequency.setValueAtTime(150, ctx.currentTime);
            gainNode.gain.setValueAtTime(0.2, ctx.currentTime);
            gainNode.gain.exponentialRampToValueAtTime(
              0.001,
              ctx.currentTime + 0.5
            );
            oscillator.start(ctx.currentTime);
            oscillator.stop(ctx.currentTime + 0.5);
            break;
          case "word":
            oscillator.type = "triangle";
            oscillator.frequency.setValueAtTime(800, ctx.currentTime);
            gainNode.gain.setValueAtTime(0.08, ctx.currentTime);
            gainNode.gain.exponentialRampToValueAtTime(
              0.001,
              ctx.currentTime + 0.4
            );
            oscillator.start(ctx.currentTime);
            oscillator.stop(ctx.currentTime + 0.4);
            break;
        }
      } catch (error) {
        console.log("Audio error:", error);
      }
    },
    [gameState.soundEnabled]
  );

  // Create particles effect
  const createParticles = useCallback((x: number, y: number, color: string) => {
    const newParticles: Array<{
      x: number;
      y: number;
      vx: number;
      vy: number;
      life: number;
      color: string;
    }> = [];
    for (let i = 0; i < 8; i++) {
      newParticles.push({
        x: x + (Math.random() - 0.5) * 20,
        y: y + (Math.random() - 0.5) * 20,
        vx: (Math.random() - 0.5) * 10,
        vy: (Math.random() - 0.5) * 10 - 3,
        life: 30,
        color,
      });
    }
    setParticles((prev) => [...prev, ...newParticles]);
  }, []);

  // Generate new pipe with vocabulary
  const generatePipe = useCallback(() => {
    const vocabularySet = VOCABULARY_SETS[gameState.difficulty];
    const randomWord =
      vocabularySet[Math.floor(Math.random() * vocabularySet.length)];
    const topHeight = Math.random() * (GAME_HEIGHT - PIPE_GAP - 100) + 50;

    return {
      x: GAME_WIDTH,
      topHeight,
      bottomY: topHeight + PIPE_GAP,
      passed: false,
      word: randomWord.word,
      definition: randomWord.definition,
      options: randomWord.options,
    };
  }, [gameState.difficulty]);

  // Jump function
  const jump = useCallback(() => {
    if (!gameState.isPlaying || gameState.gameOver) return;

    setBird((prev) => ({
      ...prev,
      velocity: JUMP_FORCE,
      rotation: -20,
    }));

    playSound("jump");
  }, [gameState.isPlaying, gameState.gameOver, playSound]);

  // Game loop
  const gameLoop = useCallback(() => {
    if (!gameState.isPlaying || gameState.gameOver) return;

    // Update bird with smoother movement
    setBird((prev) => {
      const newVelocity = prev.velocity + GRAVITY;
      const newY = prev.y + newVelocity;
      // Gentler rotation for smoother movement
      const newRotation = Math.min(Math.max(newVelocity * 2, -15), 45);

      // Check boundaries with much more forgiving padding for larger bird
      if (newY < -10 || newY > GAME_HEIGHT - BIRD_SIZE + 10) {
        playSound("hit");
        setGameState((prevState) => ({
          ...prevState,
          lives: prevState.lives - 1,
          gameOver: prevState.lives <= 1,
          isPlaying: prevState.lives > 1,
        }));
        return prev;
      }

      return {
        ...prev,
        y: newY,
        velocity: newVelocity,
        rotation: newRotation,
      };
    });

    // Update pipes
    setPipes((prev) => {
      const updatedPipes = prev.map((pipe) => ({
        ...pipe,
        x: pipe.x - PIPE_SPEED,
      }));

      // Check collisions and scoring with very forgiving hitbox for larger bird
      updatedPipes.forEach((pipe) => {
        const hitboxPadding = 30; // Very forgiving collision detection for larger bird
        const birdLeft = bird.x + hitboxPadding;
        const birdRight = bird.x + BIRD_SIZE - hitboxPadding;
        const birdTop = bird.y + hitboxPadding;
        const birdBottom = bird.y + BIRD_SIZE - hitboxPadding;

        const pipeLeft = pipe.x;
        const pipeRight = pipe.x + PIPE_WIDTH;

        // Check collision with very forgiving boundaries
        if (birdRight > pipeLeft && birdLeft < pipeRight) {
          if (birdTop < pipe.topHeight || birdBottom > pipe.bottomY) {
            playSound("hit");
            setGameState((prevState) => ({
              ...prevState,
              lives: prevState.lives - 1,
              gameOver: prevState.lives <= 1,
              isPlaying: prevState.lives > 1,
            }));
          }
        }

        // Check scoring - pause game when pipe is passed
        if (!pipe.passed && pipe.x + PIPE_WIDTH < bird.x) {
          pipe.passed = true;
          setGameState((prevState) => ({
            ...prevState,
            score: prevState.score + 10,
            currentWord: {
              word: pipe.word,
              definition: pipe.definition,
              options: pipe.options,
            },
            showWordChallenge: true,
            selectedAnswer: null,
            isPlaying: false, // Pause the game
          }));
          playSound("score");
          createParticles(bird.x, bird.y, "#FFD700");
        }
      });

      // Remove off-screen pipes and add new ones
      const filteredPipes = updatedPipes.filter((pipe) => pipe.x > -PIPE_WIDTH);

      // Generate pipes less frequently for easier gameplay
      if (
        filteredPipes.length === 0 ||
        filteredPipes[filteredPipes.length - 1].x < GAME_WIDTH - 400
      ) {
        filteredPipes.push(generatePipe());
      }

      return filteredPipes;
    });

    // Update particles
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
  }, [
    gameState.isPlaying,
    gameState.gameOver,
    bird,
    playSound,
    createParticles,
    generatePipe,
  ]);

  // Start game loop
  useEffect(() => {
    if (gameState.isPlaying && !gameState.gameOver) {
      gameLoopRef.current = requestAnimationFrame(function animate() {
        gameLoop();
        gameLoopRef.current = requestAnimationFrame(animate);
      });
    }

    return () => {
      if (gameLoopRef.current) {
        cancelAnimationFrame(gameLoopRef.current);
      }
    };
  }, [gameState.isPlaying, gameState.gameOver, gameLoop]);

  // Draw game
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Draw realistic sky background with gradient
    const gradient = ctx.createLinearGradient(0, 0, 0, GAME_HEIGHT);
    gradient.addColorStop(0, "#87CEEB");
    gradient.addColorStop(0.7, "#98D8E8");
    gradient.addColorStop(1, "#B0E0E6");
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, GAME_WIDTH, GAME_HEIGHT);

    // Draw moving clouds with more realistic appearance
    ctx.fillStyle = "rgba(255, 255, 255, 0.9)";
    ctx.shadowColor = "rgba(0, 0, 0, 0.1)";
    ctx.shadowBlur = 10;
    for (let i = 0; i < 8; i++) {
      const x = (i * 150 + Date.now() * 0.01) % (GAME_WIDTH + 120);
      const y = 30 + Math.sin(Date.now() * 0.0005 + i) * 15 + (i % 3) * 40;
      const size = 20 + (i % 3) * 10;

      ctx.beginPath();
      ctx.arc(x, y, size, 0, Math.PI * 2);
      ctx.arc(x + size * 1.2, y, size * 1.3, 0, Math.PI * 2);
      ctx.arc(x + size * 2.2, y, size, 0, Math.PI * 2);
      ctx.arc(x + size * 1.1, y - size * 0.6, size * 0.8, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.shadowBlur = 0;

    // Draw realistic pipes with 3D effect
    pipes.forEach((pipe) => {
      // Pipe shadow
      ctx.fillStyle = "rgba(0, 0, 0, 0.2)";
      ctx.fillRect(pipe.x + 3, 0, PIPE_WIDTH, pipe.topHeight);
      ctx.fillRect(
        pipe.x + 3,
        pipe.bottomY,
        PIPE_WIDTH,
        GAME_HEIGHT - pipe.bottomY
      );

      // Main pipe body - green gradient
      const pipeGradient = ctx.createLinearGradient(
        pipe.x,
        0,
        pipe.x + PIPE_WIDTH,
        0
      );
      pipeGradient.addColorStop(0, "#2E7D32");
      pipeGradient.addColorStop(0.3, "#4CAF50");
      pipeGradient.addColorStop(0.7, "#66BB6A");
      pipeGradient.addColorStop(1, "#2E7D32");

      ctx.fillStyle = pipeGradient;
      ctx.fillRect(pipe.x, 0, PIPE_WIDTH, pipe.topHeight);
      ctx.fillRect(
        pipe.x,
        pipe.bottomY,
        PIPE_WIDTH,
        GAME_HEIGHT - pipe.bottomY
      );

      // Pipe caps (wider sections at ends)
      const capHeight = 30;
      const capWidth = PIPE_WIDTH + 10;
      const capX = pipe.x - 5;

      // Top cap
      ctx.fillStyle = "#1B5E20";
      ctx.fillRect(capX, pipe.topHeight - capHeight, capWidth, capHeight);
      ctx.fillStyle = "#4CAF50";
      ctx.fillRect(
        capX + 2,
        pipe.topHeight - capHeight + 2,
        capWidth - 4,
        capHeight - 4
      );

      // Bottom cap
      ctx.fillStyle = "#1B5E20";
      ctx.fillRect(capX, pipe.bottomY, capWidth, capHeight);
      ctx.fillStyle = "#4CAF50";
      ctx.fillRect(capX + 2, pipe.bottomY + 2, capWidth - 4, capHeight - 4);

      // Pipe highlights for 3D effect
      ctx.fillStyle = "rgba(255, 255, 255, 0.3)";
      ctx.fillRect(pipe.x + 5, 0, 8, pipe.topHeight);
      ctx.fillRect(pipe.x + 5, pipe.bottomY, 8, GAME_HEIGHT - pipe.bottomY);

      // Word label with better styling
      ctx.fillStyle = "#FFFFFF";
      ctx.strokeStyle = "#000000";
      ctx.lineWidth = 3;
      ctx.font = "bold 16px Arial";
      ctx.textAlign = "center";
      const textY = pipe.topHeight + PIPE_GAP / 2;
      ctx.strokeText(pipe.word, pipe.x + PIPE_WIDTH / 2, textY);
      ctx.fillText(pipe.word, pipe.x + PIPE_WIDTH / 2, textY);
    });

    // Don't draw anything for the bird on canvas - only the HTML GIF element will be visible

    // Draw enhanced particles
    particles.forEach((particle) => {
      ctx.fillStyle = particle.color;
      ctx.globalAlpha = particle.life / 30;
      ctx.beginPath();
      ctx.arc(particle.x, particle.y, 4, 0, Math.PI * 2);
      ctx.fill();

      // Particle glow effect
      ctx.shadowColor = particle.color;
      ctx.shadowBlur = 8;
      ctx.beginPath();
      ctx.arc(particle.x, particle.y, 2, 0, Math.PI * 2);
      ctx.fill();
      ctx.shadowBlur = 0;
      ctx.globalAlpha = 1;
    });

    // Draw realistic ground with texture
    const groundGradient = ctx.createLinearGradient(
      0,
      GAME_HEIGHT - 40,
      0,
      GAME_HEIGHT
    );
    groundGradient.addColorStop(0, "#8BC34A");
    groundGradient.addColorStop(0.3, "#689F38");
    groundGradient.addColorStop(0.7, "#558B2F");
    groundGradient.addColorStop(1, "#33691E");

    ctx.fillStyle = groundGradient;
    ctx.fillRect(0, GAME_HEIGHT - 40, GAME_WIDTH, 40);

    // Ground texture details
    ctx.fillStyle = "#4CAF50";
    for (let i = 0; i < GAME_WIDTH; i += 20) {
      const grassHeight = Math.random() * 8 + 5;
      ctx.fillRect(i, GAME_HEIGHT - 40, 3, grassHeight);
      ctx.fillRect(i + 10, GAME_HEIGHT - 40, 2, grassHeight * 0.7);
    }

    // Ground shadow
    ctx.fillStyle = "rgba(0, 0, 0, 0.3)";
    ctx.fillRect(0, GAME_HEIGHT - 45, GAME_WIDTH, 5);
  }, [bird, pipes, particles]);

  // Update bird HTML element position
  useEffect(() => {
    if (birdElementRef.current && canvasRef.current) {
      const canvas = canvasRef.current;
      const rect = canvas.getBoundingClientRect();
      const scaleX = rect.width / GAME_WIDTH;
      const scaleY = rect.height / GAME_HEIGHT;

      const birdElement = birdElementRef.current;
      birdElement.style.left = `${rect.left + bird.x * scaleX}px`;
      birdElement.style.top = `${rect.top + bird.y * scaleY}px`;
      birdElement.style.width = `${BIRD_SIZE * scaleX}px`;
      birdElement.style.height = `${BIRD_SIZE * scaleY}px`;

      // Apply rotation
      const gentleRotation = Math.max(Math.min(bird.rotation * 0.5, 15), -15);
      birdElement.style.transform = `rotate(${gentleRotation}deg)`;
    }
  }, [bird]);

  // Keyboard controls
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.code === "Space" || e.code === "ArrowUp") {
        e.preventDefault();
        jump();
      }
    };

    window.addEventListener("keydown", handleKeyPress);
    return () => window.removeEventListener("keydown", handleKeyPress);
  }, [jump]);

  const startGame = () => {
    setGameState((prev) => ({
      ...prev,
      gameOver: false,
      score: 0,
      lives: 3,
      showWordChallenge: false,
      currentWord: null,
      showCountdown: true,
      countdownNumber: 3,
    }));

    setBird({
      x: 100,
      y: GAME_HEIGHT / 2,
      velocity: 0,
      rotation: 0,
    });

    setPipes([generatePipe()]);
    setParticles([]);

    // Start countdown for game start
    const countdownInterval = setInterval(() => {
      setGameState((prev) => {
        if (prev.countdownNumber > 1) {
          return { ...prev, countdownNumber: prev.countdownNumber - 1 };
        } else {
          clearInterval(countdownInterval);
          return {
            ...prev,
            showCountdown: false,
            isPlaying: true,
            countdownNumber: 3,
          };
        }
      });
    }, 1000);
  };

  const resetGame = () => {
    setGameState((prev) => ({
      ...prev,
      isPlaying: false,
      gameOver: false,
      score: 0,
      lives: 3,
      showWordChallenge: false,
      currentWord: null,
    }));

    setBird({
      x: 100,
      y: GAME_HEIGHT / 2,
      velocity: 0,
      rotation: 0,
    });

    setPipes([]);
    setParticles([]);
  };

  const selectAnswer = (answer: string) => {
    setGameState((prev) => ({ ...prev, selectedAnswer: answer }));
  };

  const startCountdown = () => {
    setGameState((prev) => ({
      ...prev,
      showFeedback: false,
      showWordChallenge: false,
      currentWord: null,
      selectedAnswer: null,
      showCountdown: true,
      countdownNumber: 3,
    }));

    // Countdown sequence
    const countdownInterval = setInterval(() => {
      setGameState((prev) => {
        if (prev.countdownNumber > 1) {
          return { ...prev, countdownNumber: prev.countdownNumber - 1 };
        } else {
          clearInterval(countdownInterval);
          return {
            ...prev,
            showCountdown: false,
            isPlaying: true,
            countdownNumber: 3,
          };
        }
      });
    }, 1000);
  };

  const submitAnswer = () => {
    if (!gameState.currentWord || !gameState.selectedAnswer) return;

    const isCorrect =
      gameState.selectedAnswer === gameState.currentWord.definition;

    setGameState((prev) => ({
      ...prev,
      showWordChallenge: false,
      showFeedback: true,
      isCorrectAnswer: isCorrect,
      score: isCorrect ? prev.score + 20 : prev.score,
      lives: isCorrect ? prev.lives : prev.lives - 1,
      gameOver: !isCorrect && prev.lives <= 1,
    }));

    if (isCorrect) {
      playSound("word");
      createParticles(GAME_WIDTH / 2, GAME_HEIGHT / 2, "#00FF00");
    } else {
      playSound("hit");
    }
  };

  const continueFeedback = () => {
    if (gameState.gameOver) {
      setGameState((prev) => ({
        ...prev,
        showFeedback: false,
        currentWord: null,
        selectedAnswer: null,
      }));
    } else {
      startCountdown();
    }
  };

  const skipWord = () => {
    setGameState((prev) => ({
      ...prev,
      showWordChallenge: false,
      currentWord: null,
      selectedAnswer: null,
    }));
    startCountdown();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-400 via-blue-500 to-purple-600 relative overflow-hidden">
      {/* Animated Background */}
      <div className="absolute inset-0">
        {[...Array(20)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-2 h-2 bg-white/30 rounded-full"
            animate={{
              x: [
                Math.random() * window.innerWidth,
                Math.random() * window.innerWidth,
              ],
              y: [
                Math.random() * window.innerHeight,
                Math.random() * window.innerHeight,
              ],
            }}
            transition={{
              duration: Math.random() * 10 + 10,
              repeat: Infinity,
              ease: "linear",
            }}
          />
        ))}
      </div>

      <section className="pt-16 md:pt-20 pb-8 px-4 md:px-6 relative z-10">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <Link href="/grade/6/english">
              <Button
                variant="ghost"
                className="text-white hover:text-blue-200"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to English
              </Button>
            </Link>

            <div className="text-center">
              <h1
                className="text-3xl md:text-4xl font-bold text-white mb-2"
                style={{
                  fontFamily: "Orbitron, monospace",
                  textShadow: "2px 2px 0px rgba(0,0,0,0.5)",
                }}
              >
                🐦 FLAPPY WORDS 🐦
              </h1>
              <p className="text-blue-100">
                Find the correct vocabulary definition by crossing pipes!
              </p>
            </div>

            <Button
              onClick={() =>
                setGameState((prev) => ({
                  ...prev,
                  soundEnabled: !prev.soundEnabled,
                }))
              }
              variant="ghost"
              className="text-white hover:text-blue-200"
            >
              {gameState.soundEnabled ? (
                <Volume2 className="h-5 w-5" />
              ) : (
                <VolumeX className="h-5 w-5" />
              )}
            </Button>
          </div>

          {/* Game Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <Card className="bg-white/20 backdrop-blur border-white/30 p-4 text-center">
              <div
                className="text-2xl font-bold text-white"
                style={{ fontFamily: "Orbitron, monospace" }}
              >
                {gameState.score}
              </div>
              <div className="text-sm text-blue-100">SCORE</div>
            </Card>
            <Card className="bg-white/20 backdrop-blur border-white/30 p-4 text-center">
              <div
                className="text-2xl font-bold text-white"
                style={{ fontFamily: "Orbitron, monospace" }}
              >
                {gameState.level}
              </div>
              <div className="text-sm text-blue-100">LEVEL</div>
            </Card>
            <Card className="bg-white/20 backdrop-blur border-white/30 p-4 text-center">
              <div
                className="text-2xl font-bold text-white"
                style={{ fontFamily: "Orbitron, monospace" }}
              >
                {gameState.lives}
              </div>
              <div className="text-sm text-blue-100">LIVES</div>
            </Card>
            <Card className="bg-white/20 backdrop-blur border-white/30 p-4 text-center">
              <div className="text-sm font-bold text-white uppercase">
                {gameState.difficulty}
              </div>
              <div className="text-sm text-blue-100">DIFFICULTY</div>
            </Card>
          </div>

          {/* Game Canvas */}
          <div className="flex justify-center mb-6">
            <div className="relative">
              <canvas
                ref={canvasRef}
                width={GAME_WIDTH}
                height={GAME_HEIGHT}
                className="border-4 border-white/50 rounded-lg shadow-2xl cursor-pointer"
                onClick={jump}
                style={{ maxWidth: "100%", height: "auto" }}
              />

              {/* Animated Bird GIF Element */}
              <img
                ref={birdElementRef}
                src="/Bird.gif"
                alt="Flappy Bird"
                className="absolute pointer-events-none z-10"
                style={{
                  position: "fixed",
                  transformOrigin: "center center",
                  imageRendering: "pixelated",
                }}
              />

              {/* Game Over Overlay */}
              {gameState.gameOver && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="absolute inset-0 bg-black/80 flex items-center justify-center rounded-lg"
                >
                  <Card className="bg-gradient-to-br from-white to-blue-50 p-6 text-center max-w-sm shadow-2xl border-2 border-blue-200">
                    <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full flex items-center justify-center shadow-lg">
                      <Trophy className="h-8 w-8 text-white" />
                    </div>
                    <h2
                      className="text-2xl font-bold mb-4 bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent"
                      style={{ fontFamily: "Orbitron, monospace" }}
                    >
                      MISSION COMPLETE
                    </h2>

                    <div className="bg-gradient-to-r from-blue-100 to-purple-100 p-4 rounded-xl mb-4 border border-blue-200">
                      <p
                        className="text-gray-700 mb-2 text-sm font-semibold"
                        style={{ fontFamily: "Orbitron, monospace" }}
                      >
                        FINAL SCORE:
                      </p>
                      <div
                        className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-3"
                        style={{ fontFamily: "Orbitron, monospace" }}
                      >
                        {gameState.score}
                      </div>
                      <div className="flex justify-center items-center gap-2 text-xs">
                        <div className="bg-green-100 px-2 py-1 rounded-lg border border-green-300 flex items-center gap-1">
                          <Star className="h-3 w-3 text-green-600" />
                          <span
                            className="text-green-700 font-semibold"
                            style={{ fontFamily: "Orbitron, monospace" }}
                          >
                            {Math.floor(gameState.score / 30)} WORDS
                          </span>
                        </div>
                        <div className="bg-blue-100 px-2 py-1 rounded-lg border border-blue-300 flex items-center gap-1">
                          <Target className="h-3 w-3 text-blue-600" />
                          <span
                            className="text-blue-700 font-semibold"
                            style={{ fontFamily: "Orbitron, monospace" }}
                          >
                            {Math.floor(gameState.score / 10)} PIPES
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="flex gap-3 justify-center">
                      <Button
                        onClick={startGame}
                        className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 px-4 py-2 text-sm font-semibold shadow-lg"
                        style={{ fontFamily: "Orbitron, monospace" }}
                      >
                        <Play className="h-4 w-4 mr-1" />
                        RESTART
                      </Button>
                      <Button
                        onClick={resetGame}
                        variant="outline"
                        className="border-2 border-gray-400 text-gray-700 hover:bg-gray-100 px-4 py-2 text-sm font-semibold"
                        style={{ fontFamily: "Orbitron, monospace" }}
                      >
                        <RotateCcw className="h-4 w-4 mr-1" />
                        RESET
                      </Button>
                    </div>
                  </Card>
                </motion.div>
              )}

              {/* Start Game Overlay */}
              {!gameState.isPlaying &&
                !gameState.gameOver &&
                !gameState.showCountdown &&
                !gameState.showWordChallenge && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="absolute inset-0 bg-black/70 flex items-center justify-center rounded-lg"
                  >
                    <Card className="bg-white p-8 text-center max-w-sm">
                      <div className="text-6xl mb-4">🐦</div>
                      <h2 className="text-2xl font-bold mb-4">Flappy Words</h2>
                      <p className="text-gray-600 mb-6">
                        Fly through pipes and match vocabulary definitions! Get
                        bonus points for correct answers!
                      </p>
                      <Button
                        onClick={startGame}
                        className="bg-blue-600 hover:bg-blue-700 text-lg px-8 py-3"
                      >
                        <Play className="h-5 w-5 mr-2" />
                        Start Flying
                      </Button>
                    </Card>
                  </motion.div>
                )}

              {/* Countdown Overlay */}
              {gameState.showCountdown && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.5 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="absolute inset-0 bg-black/50 flex items-center justify-center rounded-lg"
                >
                  <div className="text-center">
                    <motion.div
                      key={gameState.countdownNumber}
                      initial={{ scale: 0.5, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      exit={{ scale: 1.5, opacity: 0 }}
                      className="text-8xl font-bold text-white mb-4"
                      style={{ fontFamily: "Orbitron, monospace" }}
                    >
                      {gameState.countdownNumber}
                    </motion.div>
                    <p className="text-white text-xl">Get Ready!</p>
                  </div>
                </motion.div>
              )}
            </div>
          </div>

          {/* Controls */}
          <div className="text-center mb-6">
            <p className="text-white mb-4">
              <strong>Controls:</strong> Click the bird or press SPACE/UP ARROW
              to fly!
            </p>
            <div className="flex justify-center gap-4">
              <select
                value={gameState.difficulty}
                onChange={(e) =>
                  setGameState((prev) => ({
                    ...prev,
                    difficulty: e.target.value as "easy" | "medium" | "hard",
                  }))
                }
                className="px-4 py-2 rounded-lg bg-white/20 text-white border border-white/30"
                disabled={gameState.isPlaying}
              >
                <option value="easy">Easy Words</option>
                <option value="medium">Medium Words</option>
                <option value="hard">Hard Words</option>
              </select>
            </div>
          </div>

          {/* Instructions */}
          <Card className="bg-white/20 backdrop-blur border-white/30 p-6">
            <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
              <Star className="h-5 w-5 text-yellow-400" />
              How to Play:
            </h3>
            <div className="grid md:grid-cols-2 gap-6 text-white">
              <div>
                <h4 className="font-semibold text-yellow-300 mb-2">
                  🐦 Flying
                </h4>
                <p className="text-sm">
                  Click or press SPACE to make the bird fly. Avoid hitting the
                  pipes!
                </p>
              </div>
              <div>
                <h4 className="font-semibold text-green-300 mb-2">
                  📚 Vocabulary Challenge
                </h4>
                <p className="text-sm">
                  After passing each pipe, match the word with its correct
                  definition from multiple choices!
                </p>
              </div>
              <div>
                <h4 className="font-semibold text-blue-300 mb-2">🎯 Scoring</h4>
                <p className="text-sm">
                  Get 10 points for passing pipes + 20 bonus points for correct
                  vocabulary answers!
                </p>
              </div>
              <div>
                <h4 className="font-semibold text-red-300 mb-2">❤️ Lives</h4>
                <p className="text-sm">
                  You have 3 lives. Don't crash into pipes or the ground!
                </p>
              </div>
            </div>
          </Card>
        </div>
      </section>

      {/* Vocabulary Challenge Modal with Integrated Feedback */}
      <AnimatePresence>
        {(gameState.showWordChallenge || gameState.showFeedback) &&
          gameState.currentWord && (
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4"
            >
              <Card className="bg-gradient-to-br from-white to-blue-50 p-4 max-w-md mx-auto text-center shadow-2xl border-2 border-blue-200">
                <div className="w-12 h-12 mx-auto mb-3 bg-gradient-to-br from-pink-500 to-blue-600 rounded-full flex items-center justify-center">
                  <div className="text-lg">🎯</div>
                </div>
                <h3 className="text-xl font-bold mb-4 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  Vocabulary Challenge!
                </h3>
                <div className="bg-gradient-to-r from-blue-100 to-purple-100 p-4 rounded-xl mb-4 border border-blue-200">
                  <h4 className="text-2xl font-bold text-blue-800 mb-3">
                    {gameState.currentWord?.word}
                  </h4>
                  <p className="text-gray-700 mb-4 font-semibold text-base">
                    What does this word mean?
                  </p>
                  <div className="space-y-3">
                    {gameState.currentWord?.options.map((option, index) => (
                      <button
                        key={`${gameState.currentWord?.word}-${index}`}
                        onClick={() => selectAnswer(option)}
                        disabled={gameState.showFeedback}
                        className={`w-full p-3 text-left rounded-lg border-2 transition-all duration-300 ${
                          gameState.showFeedback
                            ? option === gameState.currentWord?.definition
                              ? "border-green-500 bg-green-200 text-green-900"
                              : option === gameState.selectedAnswer &&
                                option !== gameState.currentWord?.definition
                              ? "border-red-500 bg-red-200 text-red-900"
                              : "border-gray-300 bg-gray-100 text-gray-600"
                            : gameState.selectedAnswer === option
                            ? "border-blue-500 bg-blue-200 text-blue-900 shadow-lg transform scale-105"
                            : "border-gray-300 hover:border-blue-400 hover:bg-blue-50 bg-white"
                        }`}
                      >
                        <span className="font-bold text-blue-600 mr-2 text-base">
                          {String.fromCharCode(65 + index)}.
                        </span>
                        <span className="font-medium text-sm">{option}</span>
                        {gameState.showFeedback &&
                          option === gameState.currentWord?.definition && (
                            <span className="ml-2 text-green-600">✅</span>
                          )}
                        {gameState.showFeedback &&
                          option === gameState.selectedAnswer &&
                          option !== gameState.currentWord?.definition && (
                            <span className="ml-2 text-red-600">❌</span>
                          )}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Feedback Section */}
                {gameState.showFeedback && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mb-6"
                  >
                    <div
                      className={`p-4 rounded-xl border-2 mb-4 ${
                        gameState.isCorrectAnswer
                          ? "bg-green-100 border-green-300"
                          : "bg-red-100 border-red-300"
                      }`}
                    >
                      <div className="flex items-center justify-center mb-2">
                        <div className="text-2xl mr-2">
                          {gameState.isCorrectAnswer ? "🎉" : "💔"}
                        </div>
                        <h4
                          className={`text-xl font-bold ${
                            gameState.isCorrectAnswer
                              ? "text-green-700"
                              : "text-red-700"
                          }`}
                        >
                          {gameState.isCorrectAnswer
                            ? "Correct! +20 Points"
                            : "Wrong Answer! -1 Life"}
                        </h4>
                      </div>
                    </div>
                  </motion.div>
                )}

                <div className="flex gap-3 justify-center">
                  {!gameState.showFeedback ? (
                    <>
                      <Button
                        onClick={submitAnswer}
                        disabled={!gameState.selectedAnswer}
                        className="bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 disabled:opacity-50 px-4 py-2 text-sm font-semibold shadow-lg"
                      >
                        Submit (+20 pts)
                      </Button>
                      <Button
                        onClick={skipWord}
                        variant="outline"
                        className="border-2 border-gray-400 text-gray-700 hover:bg-gray-100 px-4 py-2 text-sm font-semibold"
                      >
                        Skip
                      </Button>
                    </>
                  ) : (
                    <Button
                      onClick={continueFeedback}
                      className={`px-6 py-2 text-sm font-semibold shadow-lg ${
                        gameState.isCorrectAnswer
                          ? "bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700"
                          : "bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700"
                      }`}
                    >
                      {gameState.gameOver ? "Game Over" : "Continue Flying! 🐦"}
                    </Button>
                  )}
                </div>

                {!gameState.showFeedback && (
                  <p className="text-xs text-orange-600 mt-3 font-medium">
                    ⚠️ Wrong answer costs 1 life!
                  </p>
                )}
              </Card>
            </motion.div>
          )}
      </AnimatePresence>
    </div>
  );
}
