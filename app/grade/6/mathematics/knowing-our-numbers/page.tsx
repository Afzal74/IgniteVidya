"use client";

import { useState, useEffect } from "react";
import {
  ArrowLeft,
  Hash,
  Play,
  CheckCircle,
  Lock,
  Trophy,
  Star,
  Clock,
  Target,
  BookOpen,
  Gamepad2,
  Award,
  Zap,
  Brain,
  Eye,
  Users,
  TrendingUp,
  BarChart3,
  PieChart,
  Calculator,
  Globe,
  Lightbulb,
  Rocket,
  X,
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { motion } from "framer-motion";

interface Subtopic {
  id: number;
  title: string;
  description: string;
  icon: any;
  status: "locked" | "available" | "completed";
  estimatedTime: string;
  difficulty: "Easy" | "Medium" | "Hard";
  points: number;
  videoUrl?: string;
  gameUrl?: string;
  prerequisites?: number[];
  concepts: string[];
  realWorldApplications: string[];
}

export default function KnowingOurNumbersPage() {
  const [mounted, setMounted] = useState(false);
  const [completedTopics, setCompletedTopics] = useState<number[]>([1]); // First topic unlocked
  const [currentProgress, setCurrentProgress] = useState(0);
  const [totalPoints, setTotalPoints] = useState(0);
  const [selectedTopic, setSelectedTopic] = useState<Subtopic | null>(null);

  useEffect(() => {
    setMounted(true);
    // Load progress from localStorage
    const saved = localStorage.getItem("knowing-our-numbers-progress");
    if (saved) {
      const data = JSON.parse(saved);
      setCompletedTopics(data.completed || [1]);
      setTotalPoints(data.points || 0);
    }
  }, []);

  useEffect(() => {
    calculateProgress();
  }, [completedTopics]);

  // NCERT Class 6 Chapter 1: Knowing Our Numbers - Complete Breakdown
  const subtopics: Subtopic[] = [
    {
      id: 1,
      title: "Comparing Numbers",
      description: "Learn to compare large numbers using place values",
      icon: BarChart3,
      status: "available", // First topic is always available
      estimatedTime: "15 min",
      difficulty: "Easy",
      points: 100,
      videoUrl: "/videos/comparing-numbers.mp4",
      gameUrl: "/games/number-comparison",
      concepts: ["Greater than", "Less than", "Equal to", "Place value"],
      realWorldApplications: [
        "Comparing populations of cities",
        "Comparing distances between planets",
        "Comparing prices and costs",
      ],
    },
    {
      id: 2,
      title: "Large Numbers in Practice",
      description: "Understanding large numbers like thousands, lakhs, crores",
      icon: Calculator,
      status: "available",
      estimatedTime: "20 min",
      difficulty: "Easy",
      points: 150,
      prerequisites: [1],
      videoUrl: "/videos/large-numbers.mp4",
      gameUrl: "/games/large-numbers",
      concepts: [
        "Indian number system",
        "International number system",
        "Periods and commas",
      ],
      realWorldApplications: [
        "Population counting",
        "Government budgets",
        "Astronomical distances",
      ],
    },
    {
      id: 3,
      title: "Place Value & Face Value",
      description: "Understanding the position and value of digits",
      icon: Hash,
      status: "locked",
      estimatedTime: "18 min",
      difficulty: "Medium",
      points: 200,
      prerequisites: [2],
      videoUrl: "/videos/place-face-value.mp4",
      gameUrl: "/games/place-value-builder",
      concepts: ["Place value", "Face value", "Expanded form", "Standard form"],
      realWorldApplications: [
        "Reading bank account numbers",
        "Understanding postal codes",
        "Interpreting measurement readings",
      ],
    },
    {
      id: 4,
      title: "Reading and Writing Large Numbers",
      description:
        "Techniques for reading and writing numbers in words and figures",
      icon: BookOpen,
      status: "locked",
      estimatedTime: "25 min",
      difficulty: "Medium",
      points: 250,
      prerequisites: [3],
      videoUrl: "/videos/reading-writing-numbers.mp4",
      gameUrl: "/games/number-writing-challenge",
      concepts: [
        "Number names",
        "Word form",
        "Standard form",
        "Comma placement",
      ],
      realWorldApplications: [
        "Writing checks and money orders",
        "Understanding census data",
        "Reading scientific measurements",
      ],
    },
    {
      id: 5,
      title: "Ascending and Descending Order",
      description: "Arranging numbers from smallest to largest and vice versa",
      icon: TrendingUp,
      status: "locked",
      estimatedTime: "20 min",
      difficulty: "Medium",
      points: 200,
      prerequisites: [4],
      videoUrl: "/videos/ordering-numbers.mp4",
      gameUrl: "/games/number-sorting-race",
      concepts: [
        "Ascending order",
        "Descending order",
        "Comparison strategies",
      ],
      realWorldApplications: [
        "Ranking exam scores",
        "Organizing data sets",
        "Creating leaderboards",
      ],
    },
    {
      id: 6,
      title: "Successor and Predecessor",
      description: "Finding the number that comes just before or after",
      icon: Target,
      status: "locked",
      estimatedTime: "15 min",
      difficulty: "Easy",
      points: 150,
      prerequisites: [5],
      videoUrl: "/videos/successor-predecessor.mp4",
      gameUrl: "/games/number-sequence-game",
      concepts: [
        "Successor",
        "Predecessor",
        "Number line",
        "Consecutive numbers",
      ],
      realWorldApplications: [
        "Page numbering",
        "Sequential processes",
        "Time progression",
      ],
    },
    {
      id: 7,
      title: "Rounding Off Numbers",
      description: "Approximating numbers to nearest tens, hundreds, thousands",
      icon: Globe,
      status: "locked",
      estimatedTime: "22 min",
      difficulty: "Medium",
      points: 250,
      prerequisites: [6],
      videoUrl: "/videos/rounding-numbers.mp4",
      gameUrl: "/games/rounding-challenge",
      concepts: [
        "Rounding rules",
        "Nearest ten/hundred/thousand",
        "Estimation",
      ],
      realWorldApplications: [
        "Estimating costs",
        "Population approximations",
        "Distance calculations",
      ],
    },
    {
      id: 8,
      title: "Estimation and Approximation",
      description: "Making reasonable estimates for practical calculations",
      icon: Brain,
      status: "locked",
      estimatedTime: "25 min",
      difficulty: "Hard",
      points: 300,
      prerequisites: [7],
      videoUrl: "/videos/estimation-approximation.mp4",
      gameUrl: "/games/estimation-master",
      concepts: [
        "Estimation strategies",
        "Approximation techniques",
        "Mental math",
      ],
      realWorldApplications: [
        "Shopping budget planning",
        "Travel time estimation",
        "Resource allocation",
      ],
    },
    {
      id: 9,
      title: "Using Brackets in Number Expressions",
      description: "Understanding the order of operations with brackets",
      icon: Lightbulb,
      status: "locked",
      estimatedTime: "20 min",
      difficulty: "Hard",
      points: 250,
      prerequisites: [8],
      videoUrl: "/videos/brackets-expressions.mp4",
      gameUrl: "/games/bracket-master",
      concepts: ["BODMAS rule", "Order of operations", "Bracket usage"],
      realWorldApplications: [
        "Mathematical expressions",
        "Formula calculations",
        "Programming logic",
      ],
    },
    {
      id: 10,
      title: "Roman Numerals",
      description: "Understanding and converting Roman numeral system",
      icon: Trophy,
      status: "locked",
      estimatedTime: "30 min",
      difficulty: "Hard",
      points: 400,
      prerequisites: [9],
      videoUrl: "/videos/roman-numerals.mp4",
      gameUrl: "/games/roman-numeral-quest",
      concepts: [
        "Roman symbols",
        "Addition/subtraction rules",
        "Conversion methods",
      ],
      realWorldApplications: [
        "Historical dates",
        "Book chapters",
        "Clock faces",
        "Movie sequels",
      ],
    },
  ];

  const calculateProgress = () => {
    const progress = (completedTopics.length / subtopics.length) * 100;
    setCurrentProgress(progress);
  };

  const getTopicStatus = (
    topic: Subtopic
  ): "locked" | "available" | "completed" => {
    if (completedTopics.includes(topic.id)) return "completed";
    if (topic.id === 1) return "available"; // First topic always available
    if (
      topic.prerequisites &&
      topic.prerequisites.every((req) => completedTopics.includes(req))
    ) {
      return "available";
    }
    return "locked";
  };

  const markTopicComplete = (topicId: number) => {
    if (!completedTopics.includes(topicId)) {
      const newCompleted = [...completedTopics, topicId];
      const topic = subtopics.find((t) => t.id === topicId);
      const newPoints = totalPoints + (topic?.points || 0);

      setCompletedTopics(newCompleted);
      setTotalPoints(newPoints);

      // Save to localStorage
      localStorage.setItem(
        "knowing-our-numbers-progress",
        JSON.stringify({
          completed: newCompleted,
          points: newPoints,
        })
      );
    }
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case "Easy":
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200";
      case "Medium":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200";
      case "Hard":
        return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200";
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200";
    }
  };

  if (!mounted) return null;

  return (
    <div className="min-h-screen bg-white dark:bg-black relative overflow-hidden">
      {/* Global Animated Background Elements - matching other pages */}
      <div className="fixed inset-0 pointer-events-none">
        {/* Animated Grid */}
        <div className="absolute inset-0 opacity-30 dark:opacity-10">
          <div className="h-full w-full bg-[linear-gradient(rgba(59,130,246,0.3)_1px,transparent_1px),linear-gradient(90deg,rgba(59,130,246,0.3)_1px,transparent_1px)] dark:bg-[linear-gradient(rgba(59,130,246,0.1)_1px,transparent_1px),linear-gradient(90deg,rgba(59,130,246,0.1)_1px,transparent_1px)] bg-[size:20px_20px] animate-pulse" />
        </div>
      </div>

      {/* Animated Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-50/30 via-white to-purple-50/30 dark:from-gray-900/50 dark:via-black dark:to-purple-900/50" />

      {/* Header */}
      <section className="pt-20 md:pt-24 pb-8 px-4 md:px-6 relative z-10">
        <div className="max-w-7xl mx-auto">
          {/* Back Button */}
          <Link href="/grade/6/mathematics">
            <Button
              variant="ghost"
              className="mb-6 text-black dark:text-white hover:text-zinc-600 dark:hover:text-zinc-300"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Mathematics
            </Button>
          </Link>

          {/* Chapter Header */}
          <div className="text-center mb-8">
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              className="mb-4"
            >
              <img
                src="/Knowing_our_numbers.png"
                alt="Knowing Our Numbers"
                className="mx-auto w-full h-auto"
                style={{ maxWidth: "280px" }}
              />
            </motion.div>

            <motion.p
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto mb-6"
            >
              Master the fundamentals of large numbers, place values, and number
              systems through interactive learning
            </motion.p>

            {/* Progress Stats */}
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.4 }}
              className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-2xl mx-auto"
            >
              <Card className="bg-white/90 dark:bg-zinc-800 border-gray-200 dark:border-zinc-700 backdrop-blur-sm p-4">
                <div className="text-2xl font-bold text-gray-900 dark:text-white">
                  {Math.round(currentProgress)}%
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  Complete
                </div>
              </Card>
              <Card className="bg-white/90 dark:bg-zinc-800 border-gray-200 dark:border-zinc-700 backdrop-blur-sm p-4">
                <div className="text-2xl font-bold text-gray-900 dark:text-white">
                  {totalPoints}
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  Points Earned
                </div>
              </Card>
              <Card className="bg-white/90 dark:bg-zinc-800 border-gray-200 dark:border-zinc-700 backdrop-blur-sm p-4">
                <div className="text-2xl font-bold text-gray-900 dark:text-white">
                  {completedTopics.length}/{subtopics.length}
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  Topics Done
                </div>
              </Card>
            </motion.div>

            {/* Progress Bar */}
            <div className="mt-6 max-w-2xl mx-auto">
              <Progress
                value={currentProgress}
                className="h-3 bg-gray-200/60 dark:bg-white/20"
              />
            </div>
          </div>

          {/* Subtopics Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {subtopics.map((topic, index) => {
              const status = getTopicStatus(topic);
              const IconComponent = topic.icon;
              const isLocked = status === "locked";
              const isCompleted = status === "completed";

              return (
                <motion.div
                  key={topic.id}
                  initial={{ y: 50, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: index * 0.1 }}
                  className={`relative ${isLocked ? "opacity-60" : ""}`}
                >
                  <Card
                    className={`
                    h-full transition-all duration-300 backdrop-blur-sm
                    ${
                      isCompleted
                        ? "bg-blue-50/90 dark:bg-zinc-800 border-blue-200 dark:border-zinc-700 hover:bg-blue-100/90 dark:hover:bg-zinc-700"
                        : isLocked
                        ? "bg-gray-50/60 dark:bg-zinc-800 border-gray-300 dark:border-zinc-700 opacity-60"
                        : "bg-white/90 dark:bg-zinc-800 border-gray-200 dark:border-zinc-700 hover:bg-white dark:hover:bg-zinc-700 cursor-pointer"
                    }
                  `}
                  >
                    <div className="p-4 h-full flex flex-col">
                      {/* Topic Header */}
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center gap-2">
                          <div
                            className={`
                            w-8 h-8 rounded-lg flex items-center justify-center
                            ${
                              isCompleted
                                ? "bg-blue-100 dark:bg-blue-900/50"
                                : isLocked
                                ? "bg-gray-100 dark:bg-gray-700"
                                : "bg-blue-100 dark:bg-blue-800"
                            }
                          `}
                          >
                            {isLocked ? (
                              <Lock className="h-4 w-4 text-gray-400" />
                            ) : isCompleted ? (
                              <CheckCircle className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                            ) : (
                              <IconComponent className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                            )}
                          </div>
                          <div className="text-xs font-medium text-gray-500">
                            Topic {topic.id}
                          </div>
                        </div>

                        <Badge
                          className={`text-xs ${getDifficultyColor(
                            topic.difficulty
                          )}`}
                        >
                          {topic.difficulty}
                        </Badge>
                      </div>

                      {/* Topic Content with Left-side GIF for Comparing Numbers and Large Numbers */}
                      <div className="flex-1 flex items-start gap-3">
                        {/* Circular GIF Showcase for Comparing Numbers - Left Side */}
                        {topic.id === 1 && (
                          <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-blue-200 dark:border-blue-700 bg-gradient-to-br from-blue-100 to-purple-100 dark:from-blue-900 dark:to-purple-900 flex-shrink-0">
                            <img
                              src="/seesaw.gif"
                              alt="Comparing Numbers Animation"
                              className="w-full h-full object-cover"
                            />
                          </div>
                        )}

                        {/* Circular GIF Showcase for Large Numbers - Left Side */}
                        {topic.id === 2 && (
                          <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-orange-200 dark:border-orange-700 bg-gradient-to-br from-orange-100 to-yellow-100 dark:from-orange-900 dark:to-yellow-900 flex-shrink-0">
                            <img
                              src="/Numbers.gif"
                              alt="Large Numbers Animation"
                              className="w-full h-full object-cover"
                            />
                          </div>
                        )}

                        <div className="flex-1 min-w-0">
                          <h3
                            className={`
                            text-sm font-bold mb-1
                            ${
                              isCompleted
                                ? "text-blue-700 dark:text-blue-300"
                                : "text-gray-900 dark:text-white"
                            }
                          `}
                          >
                            {topic.title}
                          </h3>

                          <p
                            className={`
                            text-xs mb-3 line-clamp-2
                            ${
                              isCompleted
                                ? "text-blue-600 dark:text-blue-400"
                                : "text-gray-600 dark:text-gray-400"
                            }
                          `}
                          >
                            {topic.description}
                          </p>

                          <div className="flex items-center justify-between text-xs text-gray-500 mb-2">
                            <div className="flex items-center gap-1">
                              <Clock className="h-3 w-3" />
                              {topic.estimatedTime}
                            </div>
                            <div className="flex items-center gap-1">
                              <Trophy className="h-3 w-3" />
                              {topic.points}pts
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Action Buttons */}
                      <div className="flex gap-2 mt-4">
                        {!isLocked && (
                          <>
                            {topic.id === 1 ? (
                              <Link
                                href="/games/comparing-numbers"
                                className="flex-1"
                              >
                                <Button
                                  size="sm"
                                  className="w-full bg-blue-600 hover:bg-blue-700"
                                >
                                  <Play className="h-4 w-4 mr-1" />
                                  Play Game
                                </Button>
                              </Link>
                            ) : topic.id === 2 ? (
                              <Link
                                href="/games/large-numbers"
                                className="flex-1"
                              >
                                <Button
                                  size="sm"
                                  className="w-full bg-orange-600 hover:bg-orange-700"
                                >
                                  <Play className="h-4 w-4 mr-1" />
                                  Number Adventure
                                </Button>
                              </Link>
                            ) : (
                              <Button
                                size="sm"
                                className="flex-1 bg-blue-600 hover:bg-blue-700"
                                onClick={() => setSelectedTopic(topic)}
                              >
                                <Play className="h-4 w-4 mr-1" />
                                Learn
                              </Button>
                            )}

                            {topic.gameUrl && (
                              <Button
                                size="sm"
                                variant="outline"
                                className="border-green-600 text-green-400 hover:bg-green-900/30"
                              >
                                <Gamepad2 className="h-4 w-4" />
                              </Button>
                            )}

                            {!isCompleted && (
                              <Button
                                size="sm"
                                variant="outline"
                                className="border-zinc-600 text-zinc-300 hover:bg-zinc-700"
                                onClick={() => markTopicComplete(topic.id)}
                              >
                                <CheckCircle className="h-4 w-4" />
                              </Button>
                            )}
                          </>
                        )}

                        {isLocked && (
                          <Button size="sm" disabled className="flex-1">
                            <Lock className="h-4 w-4 mr-1" />
                            Complete Previous Topics
                          </Button>
                        )}
                      </div>
                    </div>
                  </Card>
                </motion.div>
              );
            })}
          </div>

          {/* Achievement Section */}
          {completedTopics.length > 1 && (
            <motion.div
              initial={{ y: 50, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              className="mt-12 text-center"
            >
              <Card className="bg-gradient-to-r from-yellow-50 to-orange-50 dark:from-yellow-900/20 dark:to-orange-900/20 border-yellow-200 dark:border-yellow-700 p-8">
                <div className="flex items-center justify-center gap-3 mb-4">
                  <Award className="h-8 w-8 text-yellow-600" />
                  <h2 className="text-2xl font-bold text-yellow-800 dark:text-yellow-200">
                    Great Progress!
                  </h2>
                </div>
                <p className="text-yellow-700 dark:text-yellow-300 mb-4">
                  You've completed {completedTopics.length} out of{" "}
                  {subtopics.length} topics and earned {totalPoints} points!
                </p>
                <div className="flex justify-center gap-4">
                  <div className="flex items-center gap-2 bg-white dark:bg-gray-800 px-4 py-2 rounded-lg">
                    <Star className="h-5 w-5 text-yellow-500" />
                    <span className="font-medium">Math Explorer</span>
                  </div>
                  {completedTopics.length >= 5 && (
                    <div className="flex items-center gap-2 bg-white dark:bg-gray-800 px-4 py-2 rounded-lg">
                      <Rocket className="h-5 w-5 text-blue-500" />
                      <span className="font-medium">Number Master</span>
                    </div>
                  )}
                </div>
              </Card>
            </motion.div>
          )}
        </div>
      </section>

      {/* Topic Detail Modal */}
      {selectedTopic && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          onClick={() => setSelectedTopic(null)}
        >
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-white/95 dark:bg-zinc-800 border border-gray-300 dark:border-zinc-700 rounded-2xl p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto backdrop-blur-sm"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start justify-between mb-6">
              <div>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                  {selectedTopic.title}
                </h2>
                <p className="text-gray-600 dark:text-gray-400">
                  {selectedTopic.description}
                </p>
              </div>
              <Button variant="ghost" onClick={() => setSelectedTopic(null)}>
                <X className="h-5 w-5" />
              </Button>
            </div>

            {/* Real World Applications */}
            <div className="mb-6">
              <h3 className="text-lg font-semibold mb-3 text-gray-900 dark:text-white">
                Real World Applications
              </h3>
              <div className="grid gap-2">
                {selectedTopic.realWorldApplications.map((app, idx) => (
                  <div
                    key={idx}
                    className="flex items-start gap-2 text-sm text-gray-600 dark:text-gray-400"
                  >
                    <Zap className="h-4 w-4 text-yellow-500 mt-0.5 flex-shrink-0" />
                    {app}
                  </div>
                ))}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3">
              <Button className="flex-1 bg-blue-600 hover:bg-blue-700 text-white">
                <Play className="h-4 w-4 mr-2" />
                Watch Video
              </Button>
              <Button
                variant="outline"
                className="flex-1 border-zinc-600 text-zinc-300 hover:bg-zinc-700"
              >
                <Gamepad2 className="h-4 w-4 mr-2" />
                Play Game
              </Button>
              <Button
                variant="outline"
                onClick={() => markTopicComplete(selectedTopic.id)}
                className="bg-green-900/30 border-green-600 text-green-400 hover:bg-green-800/30"
              >
                <CheckCircle className="h-4 w-4 mr-2" />
                Complete
              </Button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </div>
  );
}
