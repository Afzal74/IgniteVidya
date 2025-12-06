"use client";

import { useState, useEffect } from "react";
import { ArrowLeft, Leaf, Droplets, Atom, Zap, Microscope, FlaskConical } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { motion } from "framer-motion";
import { useSoundEffects } from "@/hooks/useSoundEffects";
import GradeAccessGuard from "@/components/grade-access-guard";

export default function SciencePage() {
  const [mounted, setMounted] = useState(false);
  const { playHoverSound, playClickSound } = useSoundEffects();

  useEffect(() => {
    setMounted(true);
  }, []);

  const topics = [
    {
      name: "Photosynthesis",
      description: "How plants make food",
      icon: Leaf,
      color: "green",
      href: "/grade/6/science/photosynthesis",
      available: true,
    },
    {
      name: "Water Cycle",
      description: "Journey of water on Earth",
      icon: Droplets,
      color: "blue",
      href: "/grade/6/science/water-cycle",
      available: true,
    },
    {
      name: "Matter & Materials",
      description: "States and properties",
      icon: Atom,
      color: "purple",
      href: "#",
      available: false,
    },
    {
      name: "Energy & Forces",
      description: "Motion and power",
      icon: Zap,
      color: "yellow",
      href: "#",
      available: false,
    },
    {
      name: "Living Organisms",
      description: "Life and classification",
      icon: Microscope,
      color: "pink",
      href: "#",
      available: false,
    },
    {
      name: "Chemical Reactions",
      description: "Changes in matter",
      icon: FlaskConical,
      color: "orange",
      href: "#",
      available: false,
    },
  ];

  if (!mounted) return null;

  return (
    <GradeAccessGuard requiredGrade={6}>
      <div className="min-h-screen bg-white dark:bg-black">
      <section className="pt-20 md:pt-24 pb-8 px-2 md:px-4">
        <div className="max-w-6xl mx-auto">
          <Link href="/grade/6">
            <Button
              variant="ghost"
              className="mb-6 text-zinc-600 dark:text-zinc-400 hover:text-black dark:hover:text-white"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Grade 6
            </Button>
          </Link>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-8 md:mb-12"
          >
            <div className="w-36 h-36 md:w-44 md:h-44 lg:w-52 lg:h-52 mx-auto mb-4 bg-gradient-to-br from-green-400 to-emerald-600 rounded-full flex items-center justify-center shadow-2xl">
              <Microscope className="w-20 h-20 md:w-28 md:h-28 text-white" />
            </div>
            <h1 className="text-3xl md:text-5xl font-bold text-black dark:text-white mb-4">
              Science - Grade 6
            </h1>
            <p className="text-sm md:text-lg text-zinc-600 dark:text-zinc-400 mb-4">
              Explore the wonders of nature and scientific principles
            </p>
            <div className="flex justify-center gap-2">
              <span className="text-xs px-3 py-1 rounded-full bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300">
                2 Topics Available
              </span>
              <span className="text-xs px-3 py-1 rounded-full bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300">
                Interactive Games
              </span>
            </div>
          </motion.div>
        </div>
      </section>

      <section className="py-8 px-2 md:px-4">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-center mb-6 md:mb-8"
          >
            <h2 className="text-lg md:text-2xl font-bold text-black dark:text-white mb-2">
              Choose a Topic
            </h2>
            <p className="text-sm md:text-base text-zinc-600 dark:text-zinc-400">
              Select a topic to start learning with interactive lessons and games
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
            {topics.map((topic, index) => (
              <motion.div
                key={topic.name}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.1 * index }}
              >
                {topic.available ? (
                  <Link href={topic.href}>
                    <Card
                      className="group relative overflow-hidden border-zinc-200 dark:border-zinc-800 hover:border-green-500 dark:hover:border-green-400 transition-all duration-500 cursor-pointer h-48 bg-gradient-to-br from-white to-zinc-100 dark:from-zinc-900 dark:to-black shadow-lg hover:shadow-2xl hover:shadow-green-500/25 transform hover:-translate-y-2 hover:scale-105"
                      onMouseEnter={() => playHoverSound("card")}
                      onClick={() => playClickSound("card")}
                    >
                      <div className="absolute inset-0 bg-gradient-to-br from-transparent via-white/30 to-transparent dark:via-white/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

                      <div className="absolute inset-0 opacity-5 dark:opacity-10 group-hover:opacity-20 transition-opacity duration-500">
                        <div className="w-full h-full bg-[radial-gradient(circle_at_1px_1px,rgba(34,197,94,0.3)_1px,transparent_0)] dark:bg-[radial-gradient(circle_at_1px_1px,rgba(34,197,94,0.2)_1px,transparent_0)] bg-[length:12px_12px] group-hover:animate-pulse" />
                      </div>

                      <div className="relative p-6 h-full flex flex-col">
                        <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-green-400 to-emerald-600 flex items-center justify-center mb-4 group-hover:scale-110 group-hover:rotate-3 transition-all duration-300 shadow-lg">
                          <topic.icon className="h-8 w-8 text-white" />
                        </div>
                        <h3 className="font-bold text-black dark:text-white mb-2 text-xl group-hover:text-green-600 dark:group-hover:text-green-400 transition-colors duration-300">
                          {topic.name}
                        </h3>
                        <p className="text-sm text-zinc-600 dark:text-zinc-400 group-hover:text-zinc-700 dark:group-hover:text-zinc-300 transition-colors duration-300 flex-1">
                          {topic.description}
                        </p>
                        <div className="mt-4">
                          <span className="text-xs px-3 py-1 rounded-full bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300 group-hover:bg-green-200 dark:group-hover:bg-green-800 transition-colors duration-300">
                            Available
                          </span>
                        </div>
                      </div>
                    </Card>
                  </Link>
                ) : (
                  <Card
                    className="group relative overflow-hidden border-zinc-200 dark:border-zinc-800 hover:border-yellow-500 dark:hover:border-yellow-400 transition-all duration-500 cursor-not-allowed h-48 bg-gradient-to-br from-gray-50 to-gray-100 dark:from-zinc-800 dark:to-zinc-900 shadow-lg hover:shadow-xl opacity-75 hover:opacity-90"
                    onMouseEnter={() => playHoverSound("card")}
                  >
                    <div className="absolute inset-0 bg-gradient-to-br from-transparent via-yellow/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

                    <div className="absolute inset-0 opacity-5 dark:opacity-10">
                      <div className="w-full h-full bg-[radial-gradient(circle_at_1px_1px,rgba(234,179,8,0.2)_1px,transparent_0)] dark:bg-[radial-gradient(circle_at_1px_1px,rgba(234,179,8,0.1)_1px,transparent_0)] bg-[length:8px_8px]" />
                    </div>

                    <div className="relative p-6 h-full flex flex-col">
                      <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-gray-300 to-gray-400 dark:from-gray-600 dark:to-gray-700 flex items-center justify-center mb-4 shadow-lg">
                        <topic.icon className="h-8 w-8 text-white" />
                      </div>
                      <h3 className="font-bold text-gray-600 dark:text-gray-300 mb-2 text-xl group-hover:text-gray-700 dark:group-hover:text-gray-200 transition-colors duration-300">
                        {topic.name}
                      </h3>
                      <p className="text-sm text-gray-500 dark:text-gray-400 group-hover:text-gray-600 dark:group-hover:text-gray-300 transition-colors duration-300 flex-1">
                        {topic.description}
                      </p>
                      <div className="mt-4">
                        <span className="text-xs px-3 py-1 rounded-full bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300 group-hover:bg-yellow-200 dark:group-hover:bg-yellow-800 transition-colors duration-300">
                          Coming Soon
                        </span>
                      </div>
                    </div>
                  </Card>
                )}
              </motion.div>
            ))}
          </div>
        </div>
      </section>
      </div>
    </GradeAccessGuard>
  );
}
