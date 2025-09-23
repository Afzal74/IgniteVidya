"use client";

import { useState, useEffect } from "react";
import {
  ArrowLeft,
  BookOpen,
  Play,
  Brain,
  Target,
  Star,
  Clock,
  FileText,
  Heart,
  PenTool,
  Feather,
  Book,
  Edit3,
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { motion } from "framer-motion";

export default function Grade6EnglishPage() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Prose Chapters from Honeysuckle
  const proseChapters = [
    {
      id: 1,
      name: "Who Did Patrick's Homework?",
      description: "A humorous story about a boy and his magical helper",
      icon: FileText,
      status: "coming-soon",
      href: "#coming-soon",
    },
    {
      id: 2,
      name: "How the Dog Found Himself a New Master!",
      description: "A tale about loyalty and finding the right master",
      icon: FileText,
      status: "coming-soon",
      href: "#coming-soon",
    },
    {
      id: 3,
      name: "Taro's Reward",
      description: "A Japanese folktale about kindness and reward",
      icon: FileText,
      status: "coming-soon",
      href: "#coming-soon",
    },
    {
      id: 4,
      name: "An Indian–American Woman in Space: Kalpana Chawla",
      description: "Biography of the inspiring astronaut",
      icon: FileText,
      status: "coming-soon",
      href: "#coming-soon",
    },
    {
      id: 5,
      name: "A Different Kind of School",
      description: "Story about alternative education methods",
      icon: FileText,
      status: "coming-soon",
      href: "#coming-soon",
    },
    {
      id: 6,
      name: "Who I Am",
      description: "A story about self-discovery and identity",
      icon: FileText,
      status: "coming-soon",
      href: "#coming-soon",
    },
    {
      id: 7,
      name: "Fair Play",
      description: "A story about justice and fairness",
      icon: FileText,
      status: "coming-soon",
      href: "#coming-soon",
    },
    {
      id: 8,
      name: "A Game of Chance",
      description: "A story about luck and decision-making",
      icon: FileText,
      status: "coming-soon",
      href: "#coming-soon",
    },
    {
      id: 9,
      name: "Desert Animals",
      description: "Learn about animals that live in desert environments",
      icon: FileText,
      status: "coming-soon",
      href: "#coming-soon",
    },
    {
      id: 10,
      name: "The Banyan Tree",
      description: "A story about nature and childhood memories",
      icon: FileText,
      status: "coming-soon",
      href: "#coming-soon",
    },
  ];

  // Poems from Honeysuckle
  const poems = [
    {
      id: 1,
      name: "A House, A Home",
      description: "Understanding the difference between a house and home",
      icon: Heart,
      status: "coming-soon",
      href: "#coming-soon",
    },
    {
      id: 2,
      name: "The Kite",
      description: "A poem about the joy of flying kites",
      icon: Heart,
      status: "coming-soon",
      href: "#coming-soon",
    },
    {
      id: 3,
      name: "The Quarrel",
      description: "A poem about sibling relationships and forgiveness",
      icon: Heart,
      status: "coming-soon",
      href: "#coming-soon",
    },
    {
      id: 4,
      name: "Beauty",
      description: "A poem exploring what makes things beautiful",
      icon: Heart,
      status: "coming-soon",
      href: "#coming-soon",
    },
    {
      id: 5,
      name: "Where Do All the Teachers Go?",
      description: "A humorous poem about teachers' lives outside school",
      icon: Heart,
      status: "coming-soon",
      href: "#coming-soon",
    },
    {
      id: 6,
      name: "The Wonderful Words",
      description: "A poem celebrating the power of language",
      icon: Heart,
      status: "coming-soon",
      href: "#coming-soon",
    },
    {
      id: 7,
      name: "Vocation",
      description: "A poem about different professions and dreams",
      icon: Heart,
      status: "coming-soon",
      href: "#coming-soon",
    },
  ];

  // Grammar and Writing Skills
  const grammarTopics = [
    {
      id: 1,
      name: "Grammar Basics",
      description: "Nouns, Pronouns, Verbs, Adjectives, Adverbs",
      icon: Edit3,
      status: "coming-soon",
      href: "#coming-soon",
    },
    {
      id: 2,
      name: "Tenses",
      description: "Present, Past, Future - Simple and Continuous",
      icon: Edit3,
      status: "coming-soon",
      href: "#coming-soon",
    },
    {
      id: 3,
      name: "Prepositions & Conjunctions",
      description: "Understanding connecting words and position words",
      icon: Edit3,
      status: "coming-soon",
      href: "#coming-soon",
    },
    {
      id: 4,
      name: "Articles",
      description: "Using A, An, and The correctly",
      icon: Edit3,
      status: "coming-soon",
      href: "#coming-soon",
    },
    {
      id: 5,
      name: "Active & Passive Voice",
      description: "Basic introduction to voice changes",
      icon: Edit3,
      status: "coming-soon",
      href: "#coming-soon",
    },
    {
      id: 6,
      name: "Direct & Indirect Speech",
      description: "Basic concepts of reported speech",
      icon: Edit3,
      status: "coming-soon",
      href: "#coming-soon",
    },
    {
      id: 7,
      name: "Writing Skills",
      description: "Paragraph, Letter, Notice, and Story Writing",
      icon: PenTool,
      status: "coming-soon",
      href: "#coming-soon",
    },
    {
      id: 8,
      name: "Comprehension",
      description: "Reading comprehension passages and exercises",
      icon: BookOpen,
      status: "coming-soon",
      href: "#coming-soon",
    },
  ];

  const quickLinks = [
    {
      title: "Library",
      icon: BookOpen,
      href: "/notes",
      description: "Study materials",
      color: "purple",
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
      case "blue":
        return "from-blue-500 to-blue-700 dark:from-blue-400 dark:to-blue-600";
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

  const renderChapterGrid = (chapters: any[], title: string, icon: any) => {
    const IconComponent = icon;
    return (
      <div className="mb-8 md:mb-12">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-lg bg-purple-600 flex items-center justify-center">
            <IconComponent className="text-white h-5 w-5" />
          </div>
          <h2 className="text-xl md:text-2xl font-bold text-black dark:text-white">
            {title}
          </h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-4 lg:gap-6">
          {chapters.map((chapter) => {
            const ChapterIcon = chapter.icon;
            const isAvailable = chapter.status === "available";

            if (isAvailable) {
              return (
                <Link key={chapter.id} href={chapter.href}>
                  <Card className="bg-white/90 dark:bg-zinc-800 border-gray-200 dark:border-zinc-700 hover:bg-white dark:hover:bg-zinc-700 transition-all duration-300 cursor-pointer p-4 md:p-6 backdrop-blur-sm">
                    <div className="flex items-start gap-3 md:gap-4">
                      <div className="w-10 h-10 md:w-12 md:h-12 rounded-lg bg-purple-600 flex items-center justify-center flex-shrink-0">
                        <ChapterIcon className="text-white h-5 w-5 md:h-6 md:w-6" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2 mb-2">
                          <h3 className="font-semibold text-gray-900 dark:text-white text-sm md:text-base leading-tight">
                            {chapter.name}
                          </h3>
                          <span className="text-xs px-2 py-1 rounded-full bg-purple-600 text-white whitespace-nowrap flex-shrink-0">
                            Available
                          </span>
                        </div>
                        <p className="text-gray-600 dark:text-gray-400 text-xs md:text-sm mb-3 md:mb-4 line-clamp-2">
                          {chapter.description}
                        </p>
                        <Button
                          size="sm"
                          className="bg-purple-600 hover:bg-purple-700 text-white w-full sm:w-auto text-xs md:text-sm"
                        >
                          <Play className="h-3 w-3 md:h-4 md:w-4 mr-1 md:mr-2" />
                          <span className="hidden sm:inline">Start Learning</span>
                          <span className="sm:hidden">Start</span>
                        </Button>
                      </div>
                    </div>
                  </Card>
                </Link>
              );
            }

            return (
              <Card
                key={chapter.id}
                className="bg-gray-50/90 dark:bg-zinc-800 border-gray-300 dark:border-zinc-700 cursor-not-allowed p-4 md:p-6 opacity-60 backdrop-blur-sm"
              >
                <div className="flex items-start gap-3 md:gap-4">
                  <div className="w-10 h-10 md:w-12 md:h-12 rounded-lg bg-gray-400 dark:bg-zinc-600 flex items-center justify-center flex-shrink-0">
                    <ChapterIcon className="text-gray-600 dark:text-zinc-400 h-5 w-5 md:h-6 md:w-6" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <h3 className="font-semibold text-gray-500 dark:text-gray-300 text-sm md:text-base leading-tight">
                        {chapter.name}
                      </h3>
                      <span className="text-xs px-2 py-1 rounded-full bg-yellow-600 text-white whitespace-nowrap flex-shrink-0">
                        Coming Soon
                      </span>
                    </div>
                    <p className="text-gray-400 dark:text-gray-500 text-xs md:text-sm mb-3 md:mb-4 line-clamp-2">
                      {chapter.description}
                    </p>
                    <Button
                      size="sm"
                      disabled
                      className="bg-gray-400 dark:bg-zinc-600 text-gray-600 dark:text-zinc-400 cursor-not-allowed w-full sm:w-auto text-xs md:text-sm"
                    >
                      <Clock className="h-3 w-3 md:h-4 md:w-4 mr-1 md:mr-2" />
                      Coming Soon
                    </Button>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      </div>
    );
  };

  if (!mounted) return null;

  return (
    <div className="min-h-screen bg-white dark:bg-black relative overflow-hidden">
      {/* Global Animated Background Elements */}
      <div className="fixed inset-0 pointer-events-none">
        {/* Animated Grid */}
        <div className="absolute inset-0 opacity-30 dark:opacity-10">
          <div className="h-full w-full bg-[linear-gradient(rgba(147,51,234,0.3)_1px,transparent_1px),linear-gradient(90deg,rgba(147,51,234,0.3)_1px,transparent_1px)] dark:bg-[linear-gradient(rgba(147,51,234,0.1)_1px,transparent_1px),linear-gradient(90deg,rgba(147,51,234,0.1)_1px,transparent_1px)] bg-[size:20px_20px] animate-pulse" />
        </div>

        {/* Floating Elements */}
        {[...Array(6)].map((_, i) => {
          const initialX = Math.random() * 1200;
          const initialY = Math.random() * 800;
          const duration = Math.random() * 15 + 10;
          const delay = Math.random() * 10;

          return (
            <motion.div
              key={`bg-shape-${i}`}
              className={`absolute w-2 h-2 ${
                i % 3 === 0
                  ? "bg-purple-400/60 dark:bg-purple-400/20"
                  : i % 3 === 1
                  ? "bg-pink-400/60 dark:bg-pink-400/20"
                  : "bg-indigo-400/60 dark:bg-indigo-400/20"
              } ${i % 2 === 0 ? "rounded-full" : "rotate-45"}`}
              initial={{
                x: initialX,
                y: initialY,
              }}
              animate={{
                y: [initialY, initialY - 200, initialY],
                x: [initialX, initialX + (Math.random() * 200 - 100), initialX],
                rotate: [0, 360],
                opacity: [0.2, 0.6, 0.2],
              }}
              transition={{
                duration,
                repeat: Infinity,
                ease: "easeInOut",
                delay,
              }}
            />
          );
        })}
      </div>

      {/* Animated Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-purple-50/30 via-white to-pink-50/30 dark:from-gray-900/50 dark:via-black dark:to-purple-900/50" />

      {/* Gradient Orbs */}
      <div className="absolute inset-0">
        <motion.div
          className="absolute top-1/4 left-1/4 w-64 h-64 bg-gradient-to-r from-purple-400/25 to-pink-400/25 dark:from-purple-400/10 dark:to-pink-400/10 rounded-full blur-3xl"
          animate={{
            scale: [1, 1.2, 1],
            x: [0, 50, 0],
            y: [0, -30, 0],
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
        <motion.div
          className="absolute top-3/4 right-1/4 w-48 h-48 bg-gradient-to-r from-indigo-400/25 to-purple-400/25 dark:from-indigo-400/10 dark:to-purple-400/10 rounded-full blur-3xl"
          animate={{
            scale: [1, 1.3, 1],
            x: [0, -40, 0],
            y: [0, 20, 0],
          }}
          transition={{
            duration: 6,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 2,
          }}
        />
      </div>

      {/* Header */}
      <section className="pt-16 md:pt-20 lg:pt-24 pb-6 md:pb-8 px-3 md:px-4 lg:px-6 relative z-10">
        <div className="max-w-7xl mx-auto">
          {/* Back Button */}
          <Link href="/grade/6">
            <Button
              variant="ghost"
              className="mb-4 md:mb-6 text-black dark:text-white hover:text-zinc-600 dark:hover:text-zinc-300 text-sm relative z-20"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              <span className="hidden sm:inline">Back to Class 6</span>
              <span className="sm:hidden">Back</span>
            </Button>
          </Link>

          {/* Page Header */}
          <div className="text-center mb-8 md:mb-12">
            <div className="mb-4 md:mb-6">
              <div className="w-16 h-16 md:w-20 md:h-20 rounded-xl bg-gradient-to-br from-purple-500 to-purple-700 dark:from-purple-400 dark:to-purple-600 flex items-center justify-center mx-auto shadow-lg">
                <Book className="text-white h-8 w-8 md:h-10 md:w-10" />
              </div>
            </div>
            <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold text-black dark:text-white mb-2 relative z-20">
              <span className="block sm:hidden">English - Class 6</span>
              <span className="hidden sm:block">English - Class 6</span>
            </h1>
            <p className="text-sm md:text-base lg:text-lg text-zinc-600 dark:text-zinc-400 px-4 relative z-20">
              NCERT Honeysuckle • Reading, Writing, Grammar
            </p>
          </div>

          {/* Prose Chapters */}
          {renderChapterGrid(proseChapters, "📘 Prose (Chapters)", FileText)}

          {/* Poems */}
          {renderChapterGrid(poems, "🔹 Poems", Heart)}

          {/* Grammar & Writing */}
          {renderChapterGrid(grammarTopics, "✏️ Grammar & Writing Skills", Edit3)}

          {/* Quick Links */}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
            {quickLinks.map((link, index) => {
              const IconComponent = link.icon;
              return (
                <Link key={index} href={link.href}>
                  <Card className="bg-white/90 dark:bg-zinc-800 border-gray-200 dark:border-zinc-700 hover:bg-white dark:hover:bg-zinc-700 transition-all duration-300 cursor-pointer p-4 text-center backdrop-blur-sm">
                    <div
                      className={`w-10 h-10 rounded-lg bg-gradient-to-br ${getColorClasses(
                        link.color
                      )} flex items-center justify-center mx-auto mb-3`}
                    >
                      <IconComponent className="text-white h-5 w-5" />
                    </div>
                    <h3 className="font-semibold text-gray-900 dark:text-white text-sm mb-1">
                      {link.title}
                    </h3>
                    <p className="text-gray-600 dark:text-gray-400 text-xs">
                      {link.description}
                    </p>
                  </Card>
                </Link>
              );
            })}
          </div>
        </div>
      </section>
    </div>
  );
}