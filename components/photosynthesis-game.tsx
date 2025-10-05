"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";

interface DraggableItem {
  id: string;
  label: string;
  color: string;
  correctSlot: number;
}

export default function PhotosynthesisGame() {
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
    const filledSlots = slots.filter((slot) => slot !== null).length;
    setProgress((filledSlots / slots.length) * 100);

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
      const previousSlotIndex = newSlots.indexOf(draggedItem);
      if (previousSlotIndex !== -1) {
        newSlots[previousSlotIndex] = null;
      }
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

  return (
    <div
      className="w-full h-full relative"
      style={{
        backgroundImage: "url(/background_photosynthesis.jpg)",
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
        minHeight: "70vh",
      }}
    >
      {/* Overlay */}
      <div className="absolute inset-0 bg-black/10" />

      {/* Pixel Font Styles */}
      <style jsx>{`
        .pixel-font {
          font-family: 'Courier New', monospace;
          font-weight: bold;
          letter-spacing: 2px;
          image-rendering: pixelated;
          image-rendering: -moz-crisp-edges;
          image-rendering: crisp-edges;
        }
      `}</style>

      {/* Game Content */}
      <div className="relative z-10 h-full flex flex-col justify-center items-center p-4 md:p-8">
        {/* Progress Bar */}
        <div className="w-full max-w-4xl mb-6">
          <div className="w-full h-4 bg-white/40 rounded-full overflow-hidden border-4 border-white/60">
            <motion.div
              className="h-full bg-green-500"
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.3 }}
            />
          </div>
        </div>

        {/* Title */}
        <div className="text-center mb-6">
          <h1 className="text-4xl md:text-5xl font-bold text-green-700 mb-3 pixel-font">
            GAME TIME!
          </h1>
          <p className="text-xl md:text-2xl text-black font-bold pixel-font">
            Lets test your knowledge through a little game
          </p>
        </div>

        {/* Equation Area */}
        <div className="w-full max-w-5xl bg-white/95 backdrop-blur-sm rounded-3xl p-6 md:p-8 mb-6 shadow-2xl overflow-x-auto">
          <div className="flex items-center justify-center gap-2 md:gap-3 text-xl md:text-2xl font-bold pixel-font whitespace-nowrap min-w-max">
            <span className="text-purple-600">6CO₂</span>
            <span className="text-gray-700">+</span>

            {/* Slot 1 - H2O */}
            <div
              onDrop={() => handleDrop(0)}
              onDragOver={handleDragOver}
              className={`w-24 md:w-32 h-12 md:h-14 rounded-2xl border-4 border-dashed flex items-center justify-center transition-all flex-shrink-0 ${
                slots[0]
                  ? "bg-blue-50 border-blue-400"
                  : "bg-gray-50 border-gray-400 hover:border-gray-500"
              }`}
            >
              {slots[0] ? (
                <span
                  className="cursor-move text-lg md:text-xl pixel-font"
                  draggable
                  onDragStart={() => handleDragStart(slots[0]!)}
                  onDragEnd={handleDragEnd}
                  style={{ color: getItemById(slots[0])?.color }}
                >
                  {getItemById(slots[0])?.label}
                </span>
              ) : null}
            </div>

            <span className="text-gray-700 flex-shrink-0">+</span>
            <span className="text-orange-500 flex-shrink-0">Sunlight</span>
            <span className="text-gray-700 text-2xl md:text-3xl flex-shrink-0">→</span>

            {/* Slot 2 - C6H12O6 */}
            <div
              onDrop={() => handleDrop(1)}
              onDragOver={handleDragOver}
              className={`w-32 md:w-40 h-12 md:h-14 rounded-2xl border-4 border-dashed flex items-center justify-center transition-all flex-shrink-0 ${
                slots[1]
                  ? "bg-red-50 border-red-400"
                  : "bg-gray-50 border-gray-400 hover:border-gray-500"
              }`}
            >
              {slots[1] ? (
                <span
                  className="cursor-move text-lg md:text-xl pixel-font"
                  draggable
                  onDragStart={() => handleDragStart(slots[1]!)}
                  onDragEnd={handleDragEnd}
                  style={{ color: getItemById(slots[1])?.color }}
                >
                  {getItemById(slots[1])?.label}
                </span>
              ) : null}
            </div>

            <span className="text-gray-700 flex-shrink-0">+</span>

            {/* Slot 3 - 6O2 */}
            <div
              onDrop={() => handleDrop(2)}
              onDragOver={handleDragOver}
              className={`w-20 md:w-28 h-12 md:h-14 rounded-2xl border-4 border-dashed flex items-center justify-center transition-all flex-shrink-0 ${
                slots[2]
                  ? "bg-blue-50 border-blue-400"
                  : "bg-gray-50 border-gray-400 hover:border-gray-500"
              }`}
            >
              {slots[2] ? (
                <span
                  className="cursor-move text-lg md:text-xl pixel-font"
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
        </div>

        {/* Draggable Items Area */}
        <div className="w-full max-w-4xl bg-white/85 backdrop-blur-sm rounded-3xl p-6 shadow-xl">
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
                  className="cursor-move bg-white rounded-2xl px-6 md:px-8 py-4 md:py-5 shadow-lg border-4 hover:shadow-xl transition-all"
                  style={{ borderColor: item.color }}
                >
                  <span
                    className="text-2xl md:text-3xl font-bold pixel-font"
                    style={{ color: item.color }}
                  >
                    {item.label}
                  </span>
                </motion.div>
              );
            })}
          </div>
        </div>

        {/* Success Message */}
        {isComplete && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            className="mt-6 w-full max-w-4xl bg-green-500 text-white rounded-3xl p-8 text-center shadow-2xl"
          >
            <h2 className="text-3xl md:text-4xl font-bold mb-3 pixel-font">
              🎉 Congratulations!
            </h2>
            <p className="text-xl md:text-2xl mb-6 pixel-font">
              You've completed the photosynthesis equation correctly!
            </p>
            <Button
              onClick={resetGame}
              className="bg-white text-green-600 hover:bg-gray-100 text-lg px-8 py-3 pixel-font"
            >
              Play Again
            </Button>
          </motion.div>
        )}
      </div>
    </div>
  );
}
