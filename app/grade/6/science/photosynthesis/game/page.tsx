"use client";

import { useState, useEffect } from "react";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { motion } from "framer-motion";

interface DraggableItem {
  id: string;
  label: string;
  color: string;
  correctSlot: number;
}

export default function PhotosynthesisGame() {
  const [mounted, setMounted] = useState(false);
  const [draggedItem, setDraggedItem] = useState<string | null>(null);
  const [slots, setSlots] = useState<(string | null)[]>([null, null, null]);
  const [availableItems, setAvailableItems] = useState<DraggableItem[]>([
    { id: "h2o", label: "6H₂O", color: "#3B82F6", correctSlot: 0 },
    { id: "c6h12o6", label: "C₆H₁₂O₆", color: "#EF4444", correctSlot: 1 },
    { id: "6o2", label: "6O₂", color: "#3B82F6", correctSlot: 2 },
  ]);
  const [progress, setProgress] = useState(0);
  const [isComplete, setIsComplete] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    const filledSlots = slots.filter((slot) => slot !== null).length;
    setProgress((filledSlots / slots.length) * 100);

    // Check if all slots are correctly filled
    const allCorrect = slots.every((slot, index) => {
      if (slot === null) return false;
      const item = availableItems.find((i) => i.id === slot);
      return item && item.correctSlot === index;
    });

    if (allCorrect && filledSlots === slots.length) {
      setIsComplete(true);
    }
  }, [slots]);

  const handleDragStart = (itemId: string) => {
    setDraggedItem(itemId);
  };

  const handleDragEnd = () => {
    setDraggedItem(null);
  };

  const handleDrop = (slotIndex: number) => {
    if (draggedItem) {
      const newSlots = [...slots];
      
      // Remove item from its previous slot if it was already placed
      const previousSlotIndex = newSlots.indexOf(draggedItem);
      if (previousSlotIndex !== -1) {
        newSlots[previousSlotIndex] = null;
      }

      // Place item in new slot
      newSlots[slotIndex] = draggedItem;
      setSlots(newSlots);
      setDraggedItem(null);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const resetGame = () => {
    setSlots([null, null, null]);
    setProgress(0);
    setIsComplete(false);
  };

  const getItemById = (id: string | null) => {
    if (!id) return null;
    return availableItems.find((item) => item.id === id);
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
          <Link href="/grade/6/science/photosynthesis">
            <Button
              variant="ghost"
              className="bg-white/80 hover:bg-white text-black"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Button>
          </Link>

          {/* Close Button */}
          <Link href="/grade/6/science/photosynthesis">
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
                className="h-full bg-green-500"
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
            <h1 className="text-4xl md:text-5xl font-bold text-green-800 mb-4">
              GAME TIME!
            </h1>
            <p className="text-xl md:text-2xl text-black font-semibold">
              Lets test your knowledge through a little game
            </p>
          </motion.div>

          {/* Equation Area */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2 }}
            className="bg-white/90 backdrop-blur-sm rounded-3xl p-8 mb-8 shadow-2xl"
          >
            <div className="flex items-center justify-center gap-4 flex-wrap text-2xl md:text-3xl font-bold">
              {/* CO2 */}
              <span className="text-purple-600">6CO₂</span>
              <span className="text-gray-600">+</span>

              {/* Slot 1 - H2O */}
              <div
                onDrop={() => handleDrop(0)}
                onDragOver={handleDragOver}
                className={`w-32 h-16 rounded-xl border-4 border-dashed flex items-center justify-center transition-all ${
                  slots[0]
                    ? "bg-blue-100 border-blue-400"
                    : "bg-gray-100 border-gray-400 hover:border-gray-600"
                }`}
              >
                {slots[0] ? (
                  <span
                    className="cursor-move"
                    draggable
                    onDragStart={() => handleDragStart(slots[0]!)}
                    onDragEnd={handleDragEnd}
                    style={{ color: getItemById(slots[0])?.color }}
                  >
                    {getItemById(slots[0])?.label}
                  </span>
                ) : null}
              </div>

              <span className="text-gray-600">+</span>
              <span className="text-yellow-600">Sunlight</span>
              <span className="text-gray-600 text-4xl">→</span>

              {/* Slot 2 - C6H12O6 */}
              <div
                onDrop={() => handleDrop(1)}
                onDragOver={handleDragOver}
                className={`w-40 h-16 rounded-xl border-4 border-dashed flex items-center justify-center transition-all ${
                  slots[1]
                    ? "bg-red-100 border-red-400"
                    : "bg-gray-100 border-gray-400 hover:border-gray-600"
                }`}
              >
                {slots[1] ? (
                  <span
                    className="cursor-move"
                    draggable
                    onDragStart={() => handleDragStart(slots[1]!)}
                    onDragEnd={handleDragEnd}
                    style={{ color: getItemById(slots[1])?.color }}
                  >
                    {getItemById(slots[1])?.label}
                  </span>
                ) : null}
              </div>

              <span className="text-gray-600">+</span>

              {/* Slot 3 - 6O2 */}
              <div
                onDrop={() => handleDrop(2)}
                onDragOver={handleDragOver}
                className={`w-28 h-16 rounded-xl border-4 border-dashed flex items-center justify-center transition-all ${
                  slots[2]
                    ? "bg-blue-100 border-blue-400"
                    : "bg-gray-100 border-gray-400 hover:border-gray-600"
                }`}
              >
                {slots[2] ? (
                  <span
                    className="cursor-move"
                    draggable
                    onDragStart={() => handleDragStart(slots[2]!)}
                    onDragEnd={handleDragEnd}
                    style={{ color: getItemById(slots[2])?.color }}
                  >
                    {getItemById(slots[2])?.label}
                  </span>
                ) : null}
              </div>
            </div>
          </motion.div>

          {/* Draggable Items Area */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="bg-white/70 backdrop-blur-sm rounded-3xl p-6 shadow-xl"
          >
            <div className="flex items-center justify-center gap-6 flex-wrap">
              {availableItems.map((item) => {
                const isPlaced = slots.includes(item.id);
                if (isPlaced) return null;

                return (
                  <motion.div
                    key={item.id}
                    draggable
                    onDragStart={() => handleDragStart(item.id)}
                    onDragEnd={handleDragEnd}
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.95 }}
                    className="cursor-move bg-white rounded-2xl px-6 py-4 shadow-lg border-4 border-gray-300 hover:border-gray-500 transition-all"
                    style={{ borderColor: item.color }}
                  >
                    <span
                      className="text-2xl font-bold"
                      style={{ color: item.color }}
                    >
                      {item.label}
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
              <h2 className="text-3xl font-bold mb-4">🎉 Congratulations!</h2>
              <p className="text-xl mb-6">
                You've completed the photosynthesis equation correctly!
              </p>
              <div className="flex gap-4 justify-center">
                <Button
                  onClick={resetGame}
                  className="bg-white text-green-600 hover:bg-gray-100"
                >
                  Play Again
                </Button>
                <Link href="/grade/6/science/photosynthesis">
                  <Button className="bg-green-700 hover:bg-green-800">
                    Continue Learning
                  </Button>
                </Link>
              </div>
            </motion.div>
          )}
        </div>
      </section>
    </div>
  );
}
