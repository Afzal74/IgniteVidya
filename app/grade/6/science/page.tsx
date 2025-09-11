"use client";

import { useState, useEffect } from "react";
import { ArrowLeft, Microscope, Play, Brain, Target, Star, Gamepad2, Clock, BookOpen } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function Grade6SciencePage() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const resources = [
    { name: "Study Notes", description: "Comprehensive science notes", color: "green", type: "notes", href: "/notes/grade/6/science" },
    { name: "Video Lectures", description: "Expert-taught lessons", color: "purple", type: "lectures", href: "/lectures/grade/6/science" },
    { name: "Practice Worksheets", description: "Exercise sheets and practice", color: "orange", type: "worksheets", href: "/worksheets/grade/6/science" },
    { name: "Quiz & Tests", description: "Assess your understanding", color: "indigo", type: "quiz", href: "/quiz/grade/6/science" },
    { name: "AI Science Tutor", description: "Personalized learning assistant", color: "emerald", type: "ai", href: "/ai-tutor/grade/6/science" }
  ];

  const scienceTopics = [
    {
      name: "Food: Where Does it Come From?",
      description: "Learn about food sources and origins",
      icon: Microscope,
      status: "coming-soon",
      href: "#coming-soon"
    },
    {
      name: "Components of Food",
      description: "Understand different food components",
      icon: Microscope,
      status: "coming-soon",
      href: "#coming-soon"
    }
  ];

  const getColorClasses = (color: string) => {
    switch (color) {
      case "blue": return "from-blue-500 to-blue-700 dark:from-blue-400 dark:to-blue-600";
      case "green": return "from-green-500 to-green-700 dark:from-green-400 dark:to-green-600";
      case "purple": return "from-purple-500 to-purple-700 dark:from-purple-400 dark:to-purple-600";
      case "orange": return "from-orange-500 to-orange-700 dark:from-orange-400 dark:to-orange-600";
      case "indigo": return "from-indigo-500 to-indigo-700 dark:from-indigo-400 dark:to-indigo-600";
      case "emerald": return "from-emerald-500 to-emerald-700 dark:from-emerald-400 dark:to-emerald-600";
      default: return "from-gray-500 to-gray-700 dark:from-gray-400 dark:to-gray-600";
    }
  };

  if (!mounted) return null;

  return (
    <div className="min-h-screen bg-white dark:bg-black">
      {/* Header */}
      <section className="pt-20 md:pt-24 pb-8 px-2 md:px-4">
        <div className="max-w-6xl mx-auto">
          {/* Back Button */}
          <Link href="/grade/6">
            <Button variant="ghost" className="mb-6 text-zinc-600 dark:text-zinc-400 hover:text-black dark:hover:text-white">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Class 6
            </Button>
          </Link>

          {/* Page Header */}
          <div className="text-center mb-8 md:mb-12">
            <div className="w-16 h-16 md:w-20 md:h-20 rounded-xl bg-gradient-to-br from-green-500 to-green-700 dark:from-green-400 dark:to-green-600 flex items-center justify-center mx-auto mb-4 shadow-lg">
              <Microscope className="text-white dark:text-black h-8 w-8 md:h-10 md:w-10" />
            </div>
            <h1 className="text-2xl md:text-4xl font-bold text-black dark:text-white mb-2">
              Science - Class 6
            </h1>
            <p className="text-sm md:text-lg text-zinc-600 dark:text-zinc-400 mb-4">
              NCERT Curriculum • Interactive Learning Resources
            </p>
          </div>

          {/* Topics Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6 mb-8">
            {scienceTopics.map((topic, index) => {
              const IconComponent = topic.icon;
              return (
                <Card key={index} className="border-zinc-200 dark:border-zinc-800 hover:border-green-500 dark:hover:border-green-400 transition-all duration-300 cursor-pointer">
                  <div className="p-4 md:p-6">
                    <div className="flex items-start gap-3">
                      <div className={`w-12 h-12 rounded-lg bg-gradient-to-br ${getColorClasses("green")} flex items-center justify-center flex-shrink-0`}>
                        <IconComponent className="text-white h-6 w-6" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2 mb-2">
                          <h3 className="font-semibold text-black dark:text-white text-sm md:text-base">
                            {topic.name}
                          </h3>
                          {topic.status === "available" && (
                            <span className="text-xs px-2 py-1 rounded-full bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300 whitespace-nowrap">
                              Available
                            </span>
                          )}
                          {topic.status === "coming-soon" && (
                            <span className="text-xs px-2 py-1 rounded-full bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300 whitespace-nowrap">
                              Coming Soon
                            </span>
                          )}
                        </div>
                        <p className="text-zinc-600 dark:text-zinc-400 text-xs md:text-sm line-clamp-2">
                          {topic.description}
                        </p>
                        <div className="mt-3">
                          {topic.status === "available" ? (
                            <Link href={topic.href}>
                              <Button size="sm" className="bg-green-600 hover:bg-green-700 text-white">
                                <Play className="h-4 w-4 mr-2" />
                                Start Learning
                              </Button>
                            </Link>
                          ) : (
                            <Button size="sm" disabled className="bg-gray-300 text-gray-500 cursor-not-allowed">
                              <Clock className="h-4 w-4 mr-2" />
                              Coming Soon
                            </Button>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>

          {/* Resources Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
            {resources.map((resource, index) => (
              <Card key={index} className="border-zinc-200 dark:border-zinc-800 hover:border-green-500 dark:hover:border-green-400 transition-all duration-300 cursor-pointer">
                <div className="p-4 md:p-6">
                  <div className="flex items-center gap-3 mb-3">
                    <div className={`w-10 h-10 rounded-lg bg-gradient-to-br ${getColorClasses(resource.color)} flex items-center justify-center`}>
                      <BookOpen className="text-white h-5 w-5" />
                    </div>
                    <h3 className="font-semibold text-black dark:text-white text-sm md:text-base">
                      {resource.name}
                    </h3>
                  </div>
                  <p className="text-zinc-600 dark:text-zinc-400 text-xs md:text-sm mb-4">
                    {resource.description}
                  </p>
                  <Button size="sm" variant="outline" className="w-full">
                    Access Resource
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
