"use client";

import { useState, useEffect } from "react";
import {
  ArrowLeft,
  Leaf,
  Clock,
  Trophy,
  Play,
  CheckCircle,
  Lock,
  Star,
  Award,
  Rocket,
  X,
  Droplet,
  Wind,
  Sun,
  Zap,
  Gamepad2,
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
  prerequisites?: number[];
}

export default function Grade6SciencePage() {
  const [mounted, setMounted] = useState(false);
  const [completedTopics, setCompletedTopics] = useState<number[]>([1]);
  const [currentProgress, setCurrentProgress] = useState(0);
  const [totalPoints, setTotalPoints] = useState(0);
  const [selectedTopic, setSelectedTopic] = useState<Subtopic | null>(null);

  useEffect(() => {
    setMounted(true);
    const saved = localStorage.getItem("science-class6-progress");
    if (saved) {
      const data = JSON.parse(saved);
      setCompletedTopics(data.completed || [1]);
      setTotalPoints(data.points || 0);
    }
  }, []);

  useEffect(() => {
    calculateProgress();
  }, [completedTopics]);

  const subtopics: Subtopic[] = [
    {
      id: 1,
      title: "The Green Adventure",
      description: "Discover the magic of photosynthesis",
      icon: Leaf,
      status: "available",
      estimatedTime: "15 min",
      difficulty: "Easy",
      points: 100,
    },
    {
      id: 2,
      title: "Water Cycle",
      description: "Learn about evaporation, condensation, and precipitation",
      icon: Droplet,
      status: "locked",
      estimatedTime: "20 min",
      difficulty: "Easy",
      points: 150,
    },
    {
      id: 3,
      title: "Air Around Us",
      description: "Explore the composition and properties of air",
      icon: Wind,
      status: "locked",
      estimatedTime: "18 min",
      difficulty: "Medium",
      points: 200,
    },
    {
      id: 4,
      title: "Light and Shadows",
      description: "Understanding how light travels and creates shadows",
      icon: Sun,
      status: "locked",
      estimatedTime: "25 min",
      difficulty: "Medium",
      points: 250,
    },
    {
      id: 5,
      title: "Electricity Basics",
      description: "Introduction to circuits and electrical energy",
      icon: Zap,
      status: "locked",
      estimatedTime: "30 min",
      difficulty: "Hard",
      points: 300,
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
    if (topic.id === 1) return "available";
    return "locked";
  };

  const markTopicComplete = (topicId: number) => {
    if (!completedTopics.includes(topicId)) {
      const newCompleted = [...completedTopics, topicId];
      const topic = subtopics.find((t) => t.id === topicId);
      const newPoints = totalPoints + (topic?.points || 0);

      setCompletedTopics(newCompleted);
      setTotalPoints(newPoints);

      localStorage.setItem(
        "science-class6-progress",
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
      {/* Global Animated Background Elements */}
      <div className="fixed inset-0 pointer-events-none">
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

          {/* Chapter Header */}
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
                        ? "bg-green-50/90 dark:bg-zinc-800 border-green-200 dark:border-zinc-700 hover:bg-green-100/90 dark:hover:bg-zinc-700"
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
                                ? "bg-green-100 dark:bg-green-900/50"
                                : isLocked
                                ? "bg-gray-100 dark:bg-gray-700"
                                : "bg-green-100 dark:bg-green-800"
                            }
                          `}
                          >
                            {isLocked ? (
                              <Lock className="h-4 w-4 text-gray-400" />
                            ) : isCompleted ? (
                              <CheckCircle className="h-4 w-4 text-green-600 dark:text-green-400" />
                            ) : (
                              <IconComponent className="h-4 w-4 text-green-600 dark:text-green-400" />
                            )}
                          </div>
                          <div className="text-xs font-medium text-gray-500">
                            Topic {topic.id}
                          </div>
                        </div>

                        {topic.id === 1 ? (
                          <Badge
                            className={`text-xs ${getDifficultyColor(
                              topic.difficulty
                            )}`}
                          >
                            {topic.difficulty}
                          </Badge>
                        ) : (
                          <Badge className="text-xs bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200">
                            Coming Soon
                          </Badge>
                        )}
                      </div>

                      {/* Topic Content */}
                      <div className="flex-1">
                        <h3
                          className={`
                            text-sm font-bold mb-1
                            ${
                              isCompleted
                                ? "text-green-700 dark:text-green-300"
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
                                ? "text-green-600 dark:text-green-400"
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

                      {/* Action Buttons */}
                      <div className="flex gap-2 mt-4">
                        {topic.id === 1 ? (
                          <>
                            <Link
                              href="/grade/6/science/photosynthesis"
                              className="flex-1"
                            >
                              <Button
                                size="sm"
                                className="w-full bg-green-600 hover:bg-green-700"
                              >
                                <Play className="h-4 w-4 mr-1" />
                                Start Learning
                              </Button>
                            </Link>
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
                        ) : (
                          <Button
                            size="sm"
                            disabled
                            className="flex-1 opacity-50 cursor-not-allowed"
                          >
                            <Lock className="h-4 w-4 mr-1" />
                            Coming Soon
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
              <Card className="bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 border-green-200 dark:border-green-700 p-8">
                <div className="flex items-center justify-center gap-3 mb-4">
                  <Award className="h-8 w-8 text-green-600" />
                  <h2 className="text-2xl font-bold text-green-800 dark:text-green-200">
                    Great Progress!
                  </h2>
                </div>
                <p className="text-green-700 dark:text-green-300 mb-4">
                  You've completed {completedTopics.length} out of{" "}
                  {subtopics.length} topics and earned {totalPoints} points!
                </p>
                <div className="flex justify-center gap-4">
                  <div className="flex items-center gap-2 bg-white dark:bg-gray-800 px-4 py-2 rounded-lg">
                    <Star className="h-5 w-5 text-green-500" />
                    <span className="font-medium">Science Explorer</span>
                  </div>
                  {completedTopics.length >= 3 && (
                    <div className="flex items-center gap-2 bg-white dark:bg-gray-800 px-4 py-2 rounded-lg">
                      <Rocket className="h-5 w-5 text-green-500" />
                      <span className="font-medium">Nature Master</span>
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

            <div className="flex gap-3">
              <Button className="flex-1 bg-green-600 hover:bg-green-700 text-white">
                <Play className="h-4 w-4 mr-2" />
                Coming Soon
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
