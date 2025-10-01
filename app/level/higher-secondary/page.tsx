"use client";

import { useState, useEffect } from "react";
import { ArrowLeft, Brain, Crown } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { motion } from "framer-motion";
import { useSoundEffects } from "@/hooks/useSoundEffects";

export default function HigherSecondaryPage() {
  const [mounted, setMounted] = useState(false);
  const { playHoverSound, playClickSound } = useSoundEffects();

  useEffect(() => {
    setMounted(true);
  }, []);

  const grades = [
    {
      grade: "11th",
      subjects: 11,
      theme: "Scientist",
      description: "Master scientific concepts",
      icon: Brain,
      color: "teal",
      href: "/grade/11",
    },
    {
      grade: "12th",
      subjects: 12,
      theme: "Leader",
      description: "Lead the STEM revolution",
      icon: Crown,
      color: "violet",
      href: "/grade/12",
    },
  ];

  if (!mounted) return null;

  return (
    <div className="min-h-screen bg-white dark:bg-black">
      {/* Header */}
      <section className="pt-16 md:pt-20 pb-4 px-2 md:px-4">
        <div className="max-w-6xl mx-auto">
          {/* Back Button */}
          <Link href="/">
            <Button
              variant="ghost"
              className="mb-4 text-zinc-600 dark:text-zinc-400 hover:text-black dark:hover:text-white"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Home
            </Button>
          </Link>

          {/* Page Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-4"
          >
            <div className="w-full max-w-lg mx-auto mb-2 group cursor-pointer">
              <img
                src="/Higher secondary.png"
                alt="Higher Secondary"
                className="w-full h-auto object-cover drop-shadow-2xl transition-all duration-300 group-hover:scale-105 border-4 border-transparent group-hover:border-purple-400 rounded-2xl group-hover:shadow-[0_0_30px_rgba(147,51,234,0.5)]"
              />
            </div>
            <p className="text-sm md:text-lg text-zinc-600 dark:text-zinc-400 mb-3">
              Future Leader • Classes 11-12 • Master specialized subjects
            </p>
            <div className="flex justify-center gap-2">
              <span className="text-xs px-3 py-1 rounded-full bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-300">
                Class 11th
              </span>
              <span className="text-xs px-3 py-1 rounded-full bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-300">
                Class 12th
              </span>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Grade Selection */}
      <section className="py-8 px-2 md:px-4">
        <div className="max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-center mb-4"
          >
            <h2 className="text-lg md:text-2xl font-bold text-black dark:text-white mb-2">
              Select Your Class
            </h2>
            <p className="text-sm md:text-base text-zinc-600 dark:text-zinc-400">
              Choose your class to access grade-specific STEM resources
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
            {grades.map((grade, index) => (
              <motion.div
                key={grade.grade}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.1 * index }}
              >
                <Link href={grade.href}>
                  <Card 
                    className="group relative overflow-hidden border-zinc-200 dark:border-zinc-800 hover:border-purple-500 dark:hover:border-purple-400 transition-all duration-500 cursor-pointer h-32 md:h-40 bg-gradient-to-br from-white to-zinc-100 dark:from-zinc-900 dark:to-black shadow-lg hover:shadow-2xl hover:shadow-purple-500/25 transform hover:-translate-y-2 hover:scale-105"
                    onMouseEnter={() => playHoverSound("card")}
                    onClick={() => playClickSound("card")}
                  >
                    {/* Enhanced Shiny Overlay Effect */}
                    <div className="absolute inset-0 bg-gradient-to-br from-transparent via-white/30 to-transparent dark:via-white/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                    
                    {/* Animated Background Pattern */}
                    <div className="absolute inset-0 opacity-5 dark:opacity-10 group-hover:opacity-20 transition-opacity duration-500">
                      <div className="w-full h-full bg-[radial-gradient(circle_at_1px_1px,rgba(147,51,234,0.3)_1px,transparent_0)] dark:bg-[radial-gradient(circle_at_1px_1px,rgba(147,51,234,0.2)_1px,transparent_0)] bg-[length:12px_12px] group-hover:animate-pulse" />
                    </div>

                    {/* Glowing Border Effect */}
                    <div className="absolute inset-0 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-500 bg-gradient-to-r from-purple-500/20 via-transparent to-purple-500/20 blur-sm" />

                    <div className="relative p-4 md:p-6 text-center h-full flex flex-col justify-center">
                      <h3 className="font-bold text-black dark:text-white mb-2 text-xl md:text-2xl group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors duration-300">
                        Class {grade.grade}
                      </h3>

                      <p className="text-sm md:text-base text-zinc-600 dark:text-zinc-400 group-hover:text-zinc-700 dark:group-hover:text-zinc-300 transition-colors duration-300 mb-1 group-hover:font-medium">
                        {grade.subjects} Subjects Available
                      </p>

                      <p className="text-xs md:text-sm text-zinc-500 dark:text-zinc-500 font-medium group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors duration-300">
                        {grade.theme} • {grade.description}
                      </p>
                    </div>
                  </Card>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
