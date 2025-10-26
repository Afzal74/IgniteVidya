"use client";

import { useState, useEffect } from "react";
import { ArrowLeft, ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import WaterCycleGame from "@/components/water-cycle-game";

export default function WaterCyclePage() {
  const [mounted, setMounted] = useState(false);
  const [currentPage, setCurrentPage] = useState(0);

  useEffect(() => {
    setMounted(true);
  }, []);

  const pages = [
    { type: "image", src: "/water_cycle_title.jpg" },
    { type: "video", src: "/water_cycle_explainer.mp4" },
    { type: "image", src: "/water_cycle_stages.jpg" },
    { type: "game", src: "/grade/6/science/water-cycle/game" },
  ];

  const nextPage = () => {
    if (currentPage < pages.length - 1) {
      setCurrentPage(currentPage + 1);
    }
  };

  const prevPage = () => {
    if (currentPage > 0) {
      setCurrentPage(currentPage - 1);
    }
  };

  if (!mounted) return null;

  return (
    <div className="min-h-screen bg-white dark:bg-black relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-blue-50/30 via-white to-cyan-50/30 dark:from-gray-900/50 dark:via-black dark:to-blue-900/50" />

      <section className="pt-20 md:pt-24 pb-4 px-4 md:px-6 relative z-10">
        <div className="max-w-7xl mx-auto">
          <Link href="/grade/6/science">
            <Button
              variant="ghost"
              className="mb-4 text-black dark:text-white hover:text-zinc-600 dark:hover:text-zinc-300"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Science
            </Button>
          </Link>
        </div>
      </section>

      <section className="relative z-10 px-4 md:px-6 pb-8">
        <div className="max-w-6xl mx-auto">
          <div className="relative bg-white dark:bg-zinc-900 rounded-lg shadow-2xl overflow-hidden">
            <AnimatePresence mode="wait">
              <motion.div
                key={currentPage}
                initial={{ opacity: 0, x: 100 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -100 }}
                transition={{ duration: 0.3 }}
                className="w-full"
              >
                {pages[currentPage].type === "image" ? (
                  <img
                    src={pages[currentPage].src}
                    alt={`Page ${currentPage + 1}`}
                    className="w-full h-auto object-contain"
                    style={{ maxHeight: "70vh" }}
                  />
                ) : pages[currentPage].type === "video" ? (
                  <video
                    src={pages[currentPage].src}
                    controls
                    className="w-full h-auto object-contain"
                    style={{ maxHeight: "70vh" }}
                  >
                    Your browser does not support the video tag.
                  </video>
                ) : (
                  <div className="w-full" style={{ minHeight: "70vh" }}>
                    <WaterCycleGame />
                  </div>
                )}
              </motion.div>
            </AnimatePresence>
          </div>

          <div className="flex items-center justify-between mt-6">
            <Button
              onClick={prevPage}
              disabled={currentPage === 0}
              className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ChevronLeft className="h-5 w-5" />
              Previous
            </Button>

            <div className="text-center">
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Page {currentPage + 1} of {pages.length}
              </p>
            </div>

            <Button
              onClick={nextPage}
              disabled={currentPage === pages.length - 1}
              className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Next
              <ChevronRight className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}
