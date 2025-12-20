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

  // Touch handlers for mobile
  const handleTouchItem = (itemId: string) => {
    if (draggedItem === itemId) {
      setDraggedItem(null);
    } else {
      setDraggedItem(itemId);
    }
  };

  const handleTouchSlot = (slotIndex: number) => {
    if (draggedItem) {
      const newSlots = [...slots];
      const previousSlotIndex = newSlots.indexOf(draggedItem);
      if (previousSlotIndex !== -1) {
        newSlots[previousSlotIndex] = null;
      }
      newSlots[slotIndex] = draggedItem;
      setSlots(newSlots);
      setDraggedItem(null);
    } else if (slots[slotIndex]) {
      // If slot has item, select it for moving
      setDraggedItem(slots[slotIndex]);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const resetGame = () => {
    setSlots([null, null, null]);
    setProgress(0);
    setIsComplete(false);
    setDraggedItem(null);
  };

  const getItemById = (id: string | null) => {
    if (!id) return null;
    return availableItems.find((item) => item.id === id);
  };

  return (
    <div
      className="w-full h-full relative overflow-hidden"
      style={{
        backgroundImage: "url(/background_photosynthesis.jpg)",
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
      }}
    >
      {/* Overlay */}
      <div className="absolute inset-0 bg-black/10" />

      {/* Pixel Font Styles */}
      <style jsx>{`
        .pixel-font {
          font-family: 'Courier New', monospace;
          font-weight: bold;
          letter-spacing: 1px;
          image-rendering: pixelated;
          image-rendering: -moz-crisp-edges;
          image-rendering: crisp-edges;
        }
      `}</style>

      {/* Game Content */}
      <div className="relative z-10 h-full flex flex-col justify-center items-center p-1 sm:p-2 md:p-3">
        {/* Title - At Top */}
        <div className="text-center mb-1 sm:mb-2 md:mb-3">
          <h1 className="text-base sm:text-lg md:text-xl lg:text-2xl font-bold text-green-700 pixel-font">
            GAME TIME!
          </h1>
          <p className="text-[10px] sm:text-xs md:text-sm text-black font-bold pixel-font px-1">
            Test your knowledge through a little game
          </p>
        </div>

        {/* Progress Bar */}
        <div className="w-full max-w-4xl mb-1 sm:mb-1.5">
          <div className="w-full h-1 sm:h-1.5 md:h-2 bg-white/40 rounded-full overflow-hidden border border-white/60">
            <motion.div
              className="h-full bg-green-500"
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.3 }}
            />
          </div>
        </div>

        {/* Equation Area - Mobile: Stacked layout */}
        <div className="w-full max-w-5xl bg-white/95 backdrop-blur-sm rounded-md sm:rounded-lg md:rounded-xl p-1 sm:p-1.5 md:p-2 mb-1 sm:mb-1.5 shadow-md">
          {/* Mobile Layout - Stacked */}
          <div className="flex sm:hidden flex-col items-center gap-0.5 text-[10px] font-bold pixel-font">
            <div className="flex items-center gap-0.5">
              <span className="text-purple-600">6CO₂</span>
              <span className="text-gray-700">+</span>
              {/* Slot 1 - H2O */}
              <div
                onClick={() => handleTouchSlot(0)}
                className={`w-10 h-5 rounded border border-dashed flex items-center justify-center transition-all ${
                  slots[0]
                    ? "bg-blue-50 border-blue-400"
                    : draggedItem ? "bg-yellow-50 border-yellow-400 animate-pulse" : "bg-gray-50 border-gray-400"
                }`}
              >
                {slots[0] && (
                  <span className="text-[8px] pixel-font" style={{ color: getItemById(slots[0])?.color }}>
                    {getItemById(slots[0])?.label}
                  </span>
                )}
              </div>
              <span className="text-gray-700">+</span>
              <span className="text-orange-500 text-[8px]">Sun</span>
            </div>
            <span className="text-gray-700 text-xs">↓</span>
            <div className="flex items-center gap-0.5">
              {/* Slot 2 - C6H12O6 */}
              <div
                onClick={() => handleTouchSlot(1)}
                className={`w-12 h-5 rounded border border-dashed flex items-center justify-center transition-all ${
                  slots[1]
                    ? "bg-red-50 border-red-400"
                    : draggedItem ? "bg-yellow-50 border-yellow-400 animate-pulse" : "bg-gray-50 border-gray-400"
                }`}
              >
                {slots[1] && (
                  <span className="text-[8px] pixel-font" style={{ color: getItemById(slots[1])?.color }}>
                    {getItemById(slots[1])?.label}
                  </span>
                )}
              </div>
              <span className="text-gray-700">+</span>
              {/* Slot 3 - 6O2 */}
              <div
                onClick={() => handleTouchSlot(2)}
                className={`w-8 h-5 rounded border border-dashed flex items-center justify-center transition-all ${
                  slots[2]
                    ? "bg-blue-50 border-blue-400"
                    : draggedItem ? "bg-yellow-50 border-yellow-400 animate-pulse" : "bg-gray-50 border-gray-400"
                }`}
              >
                {slots[2] && (
                  <span className="text-[8px] pixel-font" style={{ color: getItemById(slots[2])?.color }}>
                    {getItemById(slots[2])?.label}
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Desktop Layout - Horizontal */}
          <div className="hidden sm:flex items-center justify-center gap-0.5 md:gap-1 text-[10px] md:text-xs lg:text-sm font-bold pixel-font flex-wrap">
            <span className="text-purple-600">6CO₂</span>
            <span className="text-gray-700">+</span>

            {/* Slot 1 - H2O */}
            <div
              onDrop={() => handleDrop(0)}
              onDragOver={handleDragOver}
              onClick={() => handleTouchSlot(0)}
              className={`w-10 md:w-12 lg:w-16 h-5 md:h-6 lg:h-8 rounded border border-dashed flex items-center justify-center transition-all cursor-pointer ${
                slots[0]
                  ? "bg-blue-50 border-blue-400"
                  : draggedItem ? "bg-yellow-50 border-yellow-400 animate-pulse" : "bg-gray-50 border-gray-400 hover:border-gray-500"
              }`}
            >
              {slots[0] && (
                <span
                  className="cursor-move text-[8px] md:text-[10px] lg:text-xs pixel-font"
                  draggable
                  onDragStart={() => handleDragStart(slots[0]!)}
                  onDragEnd={handleDragEnd}
                  style={{ color: getItemById(slots[0])?.color }}
                >
                  {getItemById(slots[0])?.label}
                </span>
              )}
            </div>

            <span className="text-gray-700">+</span>
            <span className="text-orange-500 text-[8px] md:text-[10px] lg:text-xs">Sunlight</span>
            <span className="text-gray-700 text-xs md:text-sm lg:text-base">→</span>

            {/* Slot 2 - C6H12O6 */}
            <div
              onDrop={() => handleDrop(1)}
              onDragOver={handleDragOver}
              onClick={() => handleTouchSlot(1)}
              className={`w-12 md:w-16 lg:w-20 h-5 md:h-6 lg:h-8 rounded border border-dashed flex items-center justify-center transition-all cursor-pointer ${
                slots[1]
                  ? "bg-red-50 border-red-400"
                  : draggedItem ? "bg-yellow-50 border-yellow-400 animate-pulse" : "bg-gray-50 border-gray-400 hover:border-gray-500"
              }`}
            >
              {slots[1] && (
                <span
                  className="cursor-move text-[8px] md:text-[10px] lg:text-xs pixel-font"
                  draggable
                  onDragStart={() => handleDragStart(slots[1]!)}
                  onDragEnd={handleDragEnd}
                  style={{ color: getItemById(slots[1])?.color }}
                >
                  {getItemById(slots[1])?.label}
                </span>
              )}
            </div>

            <span className="text-gray-700">+</span>

            {/* Slot 3 - 6O2 */}
            <div
              onDrop={() => handleDrop(2)}
              onDragOver={handleDragOver}
              onClick={() => handleTouchSlot(2)}
              className={`w-8 md:w-10 lg:w-14 h-5 md:h-6 lg:h-8 rounded border border-dashed flex items-center justify-center transition-all cursor-pointer ${
                slots[2]
                  ? "bg-blue-50 border-blue-400"
                  : draggedItem ? "bg-yellow-50 border-yellow-400 animate-pulse" : "bg-gray-50 border-gray-400 hover:border-gray-500"
              }`}
            >
              {slots[2] && (
                <span
                  className="cursor-move text-[8px] md:text-[10px] lg:text-xs pixel-font"
                  draggable
                  onDragStart={() => handleDragStart(slots[2]!)}
                  onDragEnd={handleDragEnd}
                  style={{ color: getItemById(slots[2])?.color }}
                >
                  {getItemById(slots[2])?.label}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Draggable Items Area */}
        <div className="w-full max-w-4xl bg-white/85 backdrop-blur-sm rounded p-0.5 sm:p-1 md:p-1.5 shadow-sm">
          <div className="flex items-center justify-center gap-0.5 sm:gap-1 md:gap-1.5 flex-wrap">
            {availableItems.map((item) => {
              const isPlaced = slots.includes(item.id);
              if (isPlaced) return null;

              return (
                <motion.div
                  key={item.id}
                  draggable
                  onDragStart={() => handleDragStart(item.id)}
                  onDragEnd={handleDragEnd}
                  onClick={() => handleTouchItem(item.id)}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className={`cursor-pointer bg-white rounded px-1.5 sm:px-2 md:px-3 py-0.5 sm:py-1 md:py-1.5 shadow-sm border hover:shadow transition-all ${
                    draggedItem === item.id ? "ring-1 ring-yellow-400 ring-offset-1" : ""
                  }`}
                  style={{ borderColor: item.color }}
                >
                  <span
                    className="text-[10px] sm:text-xs md:text-sm font-bold pixel-font"
                    style={{ color: item.color }}
                  >
                    {item.label}
                  </span>
                </motion.div>
              );
            })}
          </div>
          {draggedItem && (
            <p className="text-center text-[8px] sm:text-[10px] text-gray-600 mt-0.5 pixel-font">
              Tap a slot
            </p>
          )}
        </div>

        {/* Success Message */}
        {isComplete && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            className="mt-1 w-full max-w-4xl bg-green-500 text-white rounded p-1 sm:p-1.5 md:p-2 text-center shadow"
          >
            <h2 className="text-[10px] sm:text-xs md:text-sm font-bold pixel-font">
              🎉 Correct!
            </h2>
            <Button
              onClick={resetGame}
              size="sm"
              className="bg-white text-green-600 hover:bg-gray-100 text-[8px] sm:text-[10px] md:text-xs px-1.5 sm:px-2 py-0.5 pixel-font h-auto mt-0.5"
            >
              Play Again
            </Button>
          </motion.div>
        )}
      </div>
    </div>
  );
}
