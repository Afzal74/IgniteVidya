"use client";

import { useState, useEffect, useRef } from "react";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { motion } from "framer-motion";

interface WaterDrop {
  id: number;
  x: number;
  y: number;
  speed: number;
}

interface Obstacle {
  id: number;
  x: number;
  y: number;
  type: "pollution" | "ice" | "heat";
}

export default function WaterCycleGamePage() {
  const [mounted, setMounted] = useState(false);
  const [gameStarted, setGameStarted] = useState(false);
  const [score, setScore] = useState(0);
  const [waterLevel, setWaterLevel] = useState(100);
  const [containerX, setContainerX] = useState(50);
  const [drops, setDrops] = useState<WaterDrop[]>([]);
  const [obstacles, setObstacles] = useState<Obstacle[]>([]);
  const [gameOver, setGameOver] = useState(false);
  const gameLoopRef = useRef<number>();
  const dropIdRef = useRef(0);
  const obstacleIdRef = useRef(0);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (gameStarted && !gameOver) {
      gameLoopRef.current = window.setInterval(() => {
        if (Math.random() < 0.1) {
          setDrops((prev) => [
            ...prev,
            {
              id: dropIdRef.current++,
              x: Math.random() * 90 + 5,
              y: 0,
              speed: Math.random() * 2 + 2,
            },
          ]);
        }

        if (Math.random() < 0.03) {
          const types: ("pollution" | "ice" | "heat")[] = ["pollution", "ice", "heat"];
          setObstacles((prev) => [
            ...prev,
            {
              id: obstacleIdRef.current++,
              x: Math.random() * 90 + 5,
              y: 0,
              type: types[Math.floor(Math.random() * types.length)],
            },
          ]);
        }

        setDrops((prev) =>
          prev
            .map((drop) => ({ ...drop, y: drop.y + drop.speed }))
            .filter((drop) => {
              if (drop.y > 85 && drop.y < 95) {
                if (Math.abs(drop.x - containerX) < 8) {
                  setScore((s) => s + 10);
                  setWaterLevel((w) => Math.min(w + 2, 100));
                  return false;
                }
              }
              return drop.y < 100;
            })
        );

        setObstacles((prev) =>
          prev
            .map((obs) => ({ ...obs, y: obs.y + 3 }))
            .filter((obs) => {
              if (obs.y > 85 && obs.y < 95) {
                if (Math.abs(obs.x - containerX) < 8) {
                  setWaterLevel((w) => Math.max(w - 15, 0));
                  return false;
                }
              }
              return obs.y < 100;
            })
        );

        setWaterLevel((w) => {
          const newLevel = w - 0.3;
          if (newLevel <= 0) {
            setGameOver(true);
            return 0;
          }
          return newLevel;
        });
      }, 50);

      return () => {
        if (gameLoopRef.current) clearInterval(gameLoopRef.current);
      };
    }
  }, [gameStarted, gameOver, containerX]);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    setContainerX(Math.max(8, Math.min(92, x)));
  };

  const startGame = () => {
    setGameStarted(true);
    setScore(0);
    setWaterLevel(100);
    setDrops([]);
    setObstacles([]);
    setGameOver(false);
  };

  const resetGame = () => {
    setGameStarted(false);
    setScore(0);
    setWaterLevel(100);
    setDrops([]);
    setObstacles([]);
    setGameOver(false);
  };

  if (!mounted) return null;

  return (
    <div
      className="min-h-screen relative overflow-hidden"
      style={{
        backgroundImage: "url(/Watercycle-asset/water_cycle_background.png)",
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}
    >
      <div className="absolute inset-0 bg-black/20" />

      <section className="pt-20 md:pt-24 pb-4 px-4 md:px-6 relative z-10">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <Link href="/grade/6/science/water-cycle">
            <Button variant="ghost" className="bg-white/80 hover:bg-white text-black">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Button>
          </Link>
          <Link href="/grade/6/science/water-cycle">
            <Button variant="ghost" className="bg-white/80 hover:bg-white text-black">
              ✕
            </Button>
          </Link>
        </div>
      </section>

      <section className="relative z-10 px-4 md:px-6 pb-8">
        {!gameStarted ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="max-w-4xl mx-auto flex flex-col items-center"
          >
            <img
              src="/Watercycle-asset/game_title.png"
              alt="Water Cycle Game"
              className="w-full max-w-2xl mb-8"
            />
            <div className="bg-white/90 backdrop-blur-sm rounded-3xl p-8 text-center shadow-2xl">
              <h2 className="text-3xl font-bold text-blue-700 mb-4">
                Collect Water Drops!
              </h2>
              <p className="text-lg text-gray-700 mb-6">
                Move your container to catch water drops and avoid pollution, ice barriers, and heat waves!
              </p>
              <Button
                onClick={startGame}
                className="bg-blue-600 hover:bg-blue-700 text-white text-xl px-12 py-6"
              >
                Start Game
              </Button>
            </div>
          </motion.div>
        ) : (
          <div
            className="max-w-6xl mx-auto relative bg-black/10 rounded-lg"
            style={{ height: "70vh" }}
            onMouseMove={handleMouseMove}
          >
            <div className="absolute top-4 left-4 right-4 flex justify-between items-start z-20">
              <div className="bg-white/90 rounded-2xl px-6 py-3 shadow-lg">
                <p className="text-2xl font-bold text-blue-700">Score: {score}</p>
              </div>
              <div className="bg-white/90 rounded-2xl px-6 py-3 shadow-lg">
                <p className="text-lg font-bold text-gray-700 mb-2">Water Level</p>
                <div className="w-48 h-6 bg-gray-300 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-blue-500 transition-all"
                    style={{ width: `${waterLevel}%` }}
                  />
                </div>
              </div>
            </div>

            {drops.map((drop) => (
              <div
                key={drop.id}
                className="absolute w-6 h-6 bg-blue-400 rounded-full shadow-lg"
                style={{
                  left: `${drop.x}%`,
                  top: `${drop.y}%`,
                  transform: "translate(-50%, -50%)",
                }}
              />
            ))}

            {obstacles.map((obs) => (
              <img
                key={obs.id}
                src={`/Watercycle-asset/${
                  obs.type === "pollution"
                    ? "pollution_cloud.png"
                    : obs.type === "ice"
                    ? "ice_barrier.png"
                    : "heat_wave_effect.png"
                }`}
                alt={obs.type}
                className="absolute w-16 h-16"
                style={{
                  left: `${obs.x}%`,
                  top: `${obs.y}%`,
                  transform: "translate(-50%, -50%)",
                }}
              />
            ))}

            <img
              src="/Watercycle-asset/water_container.png"
              alt="Container"
              className="absolute w-24 h-24 pointer-events-none"
              style={{
                left: `${containerX}%`,
                bottom: "5%",
                transform: "translateX(-50%)",
              }}
            />

            {gameOver && (
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                className="absolute inset-0 flex items-center justify-center bg-black/50"
              >
                <div className="bg-white rounded-3xl p-8 text-center shadow-2xl">
                  <h2 className="text-4xl font-bold text-red-600 mb-4">Game Over!</h2>
                  <p className="text-2xl text-gray-700 mb-6">Final Score: {score}</p>
                  <div className="flex gap-4 justify-center">
                    <Button
                      onClick={resetGame}
                      className="bg-blue-600 hover:bg-blue-700 text-white text-xl px-8 py-4"
                    >
                      Play Again
                    </Button>
                    <Link href="/grade/6/science/water-cycle">
                      <Button className="bg-green-600 hover:bg-green-700 text-white text-xl px-8 py-4">
                        Continue Learning
                      </Button>
                    </Link>
                  </div>
                </div>
              </motion.div>
            )}
          </div>
        )}
      </section>
    </div>
  );
}
