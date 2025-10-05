"use client";

import { useState, useEffect } from "react";
import {
  ArrowLeft,
  Leaf,
  Clock,
  Trophy,
  Play,
  BookOpen,
  Brain,
  Target,
  Star,
  Microscope,
  Droplet,
  Wind,
  Zap,
  Flame,
  Magnet,
  Lightbulb,
  Atom,
  Beaker,
  FlaskConical,
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { motion } from "framer-motion";

export default function Grade6SciencePage() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // All NCERT Class 6 Science Chapters
  const scienceChapters = [
    {
      id: 1,
      name: "Food: Where Does It Come From?",
      description: "Learn about food sources and ingredients",
      icon: Beaker,
      status: "coming-soon",
      href: "#coming-soon",
    },
    {
      id: 2,
      name: "Components of Food",
      description: "Nutrients and balanced diet",
      icon: FlaskConical,
      status: "coming-soon",
      href: "#coming-soon",
    },
    {
      id: 3,
      name: "Fibre to Fabric",
      description: "From plants and animals to clothing",
      icon: Atom,
      status: "coming-soon",
      href: "#coming-soon",
    },
    {
      id: 4,
      name: "Sorting Materials into Groups",
      description: "Properties and classification of materials",
      icon: Target,
      status: "coming-soon",
      href: "#coming-soon",
    },
    {
      id: 5,
      name: "Separation of Substances",
      description: "Methods of separating mixtures",
      icon: Droplet,
      status: "coming-soon",
      href: "#coming-soon",
    },
    {
      id: 6,
      name: "Changes Around Us",
      description: "Physical and chemical changes",
      icon: Zap,
      status: "coming-soon",
      href: "#coming-soon",
    },
    {
      id: 7,
      name: "Getting to Know Plants",
      description: "Parts of plants and their functions",
      icon: Leaf,
      status: "coming-soon",
      href: "#coming-soon",
    },
    {
      id: 8,
      name: "Body Movements",
      description: "Human and animal movement",
      icon: Wind,
      status: "coming-soon",
      href: "#coming-soon",
    },
    {
      id: 9,
      name: "The Living Organisms",
      description: "Characteristics of living things",
      icon: Microscope,
      status: "coming-soon",
      href: "#coming-soon",
    },
    {
      id: 10,
      name: "Motion and Measurement",
      description: "Types of motion and measuring distances",
      icon: Target,
      status: "coming-soon",
      href: "#coming-soon",
    },
    {
      id: 11,
      name: "Light, Shadows and Reflections",
      description: "Properties of light and shadows",
      icon: Lightbulb,
      status: "coming-soon",
      href: "#coming-soon",
    },
    {
      id: 12,
      name: "Electricity and Circuits",
      description: "Electric circuits and conductors",
      icon: Zap,
      status: "coming-soon",
      href: "#coming-soon",
    },
    {
      id: 13,
      name: "Fun with Magnets",
      description: "Properties and uses of magnets",
      icon: Magnet,
      status: "coming-soon",
      href: "#coming-soon",
    },
    {
      id: 14,
      name: "Water",
      description: "Sources and importance of water",
      icon: Droplet,
      status: "coming-soon",
      href: "#coming-soon",
    },
    {
      id: 15,
      name: "Air Around Us",
      description: "Composition and properties of air",
      icon: Wind,
      status: "coming-soon",
      href: "#coming-soon",
    },
    {
      id: 16,
      name: "Garbage In, Garbage Out",
      description: "Waste management and recycling",
      icon: Beaker,
      status: "coming-soon",
      href: "#coming-soon",
    },
  ];

  // Add Photosynthesis as a special available chapter
  const photosynthesisChapter = {
    id: 0,
    name: "The Green Adventure",
    description: "Discover the magic of photosynthesis",
    icon: Leaf,
    status: "available",
    href: "/grade/6/science/photosynthesis",
    estimatedTime: "15 min",
    points: 100,
    difficulty: "Easy",
  };

  const quickLinks = [
    {
      title: "Library",
      icon: BookOpen,
      href: "/notes",
      description: "Study materials",
      color: "green",
    },
    {
      title: "Lectures",
      icon: Play,
      href: "/lectures",
      description: "Video lessons",
      color: "purple",
    },
    {
      title: "AI Tutor",
      icon: Brain,
      href: "/ai-tutor",
      description: "Smart learning",
      color: "emerald",
    },
    {
      title: "Quiz",
      icon: Target,
      href: "/quiz",
      description: "Test yourself",
      color: "orange",
    },
    {
      title: "Dashboard",
      icon: Star,
      href: "/dashboard",
      description: "Track progress",
      color: "indigo",
    },
  ];

  const getColorClasses = (color: string) => {
    switch (color) {
      case "green":
        return "from-green-500 to-green-700 dark:from-green-400 dark:to-green-600";
      case "purple":
        return "from-purple-500 to-purple-700 dark:from-purple-400 dark:to-purple-600";
      case "orange":
        return "from-orange-500 to-orange-700 dark:from-orange-400 dark:to-orange-600";
      case "indigo":
        return "from-indigo-500 to-indigo-700 dark:from-indigo-400 dark:to-indigo-600";
      case "emerald":
        return "from-emerald-500 to-emerald-700 dark:from-emerald-400 dark:to-emerald-600";
      default:
        return "from-gray-500 to-gray-700 dark:from-gray-400 dark:to-gray-600";
    }
  };

  if (!mounted) return null;

  return (
    <div className="min-h-screen bg-white dark:bg-black relative overflow-hidden">
      {/* Global Animated Background Elements */}
      <div className="fixed inset-0 pointer-events-none">
        {/* Animated Grid */}
        <div className="absolute inset-0 opacity-30 dark:opacity-10">
          <div className="h-full w-full bg-[linear-gradient(rgba(34,197,94,0.3)_1px,transparent_1px),linear-gradient(90deg,rgba(34,197,94,0.3)_1px,transparent_1px)] dark:bg-[linear-gradient(rgba(34,197,94,0.1)_1px,transparent_1px),linear-gradient(90deg,rgba(34,197,94,0.1)_1px,transparent_1px)] bg-[size:20px_20px] animate-pulse" />
        </div>
      </div>

      {/* Animated Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-green-50/30 via-white to-emerald-50/30 dark:from-gray-900/50 dark:via-black dark:to-green-900/50" />

      {/* Header */}
      <section className="pt-20 md:pt-24 pb-8 px-4 md:px-6 relative z-10">
        <div className="max-w-7xl mx-auto">
          {/* Back Button */}
          <Link href="/grade/6">
            <Button
              variant="ghost"
              className="mb-6 text-black dark:text-white hover:text-zinc-600 dark:hover:text-zinc-300"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Grade 6
            </Button>
          </Link>

          {/* Page Header */}
          <div className="text-center mb-8">
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              className="mb-4"
            >
              <h1 className="text-4xl md:text-5xl font-bold text-black dark:text-white mb-2">
                Science - Class 6
              </h1>
            </motion.div>

            <motion.p
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto mb-6"
            >
              Explore the wonders of science through interactive learning
            </motion.p>
          </div>

          {/* Topics Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6 max-w-5xl mx-auto">
            {/* Single Card: The Green Adventure */}
            <motion.div
              initial={{ y: 50, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.1 }}
            >
              <Link href="/grade/6/science/photosynthesis">
                <Card className="group relative overflow-hidden bg-zinc-800 dark:bg-zinc-900 border-zinc-700 dark:border-zinc-800 hover:border-green-500 dark:hover:border-green-400 transition-all duration-500 cursor-pointer shadow-xl hover:shadow-2xl hover:shadow-green-500/20">
                  <div className="p-6">
                    {/* Header with Icon and Badge */}
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-xl bg-green-600 dark:bg-green-700 flex items-center justify-center">
                          <Leaf className="h-6 w-6 text-white" />
                        </div>
                        <span className="text-sm font-medium text-gray-400">
                          Topic 1
                        </span>
                      </div>
                      <div className="px-3 py-1 rounded-full bg-green-600/20 border border-green-600/40">
                        <span className="text-xs font-bold text-green-400">
                          Easy
                        </span>
                      </div>
                    </div>

                    {/* Title and Description */}
                    <div className="mb-4">
                      <h3 className="text-xl font-bold text-white mb-2 group-hover:text-green-400 transition-colors">
                        The Green Adventure
                      </h3>
                      <p className="text-sm text-gray-400 leading-relaxed">
                        Discover the magic of photosynthesis
                      </p>
                    </div>

                    {/* Stats */}
                    <div className="flex items-center gap-4 mb-4 text-gray-500">
                      <div className="flex items-center gap-1">
                        <Clock className="h-4 w-4" />
                        <span className="text-xs">15 min</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Trophy className="h-4 w-4" />
                        <span className="text-xs">100pts</span>
                      </div>
                    </div>

                    {/* Action Button */}
                    <Button className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold">
                      <Play className="h-4 w-4 mr-2" />
                      Start Learning
                    </Button>
                  </div>

                  {/* Hover Effect */}
                  <div className="absolute inset-0 bg-gradient-to-br from-green-500/10 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
                </Card>
              </Link>
            </motion.div>
          </div>
        </div>
      </section>
    </div>
  );
}
