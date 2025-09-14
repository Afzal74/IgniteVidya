"use client";

import { useState, useEffect } from "react";
import { 
  ArrowLeft, 
  Calculator, 
  Play, 
  Brain, 
  Target, 
  Star, 
  Gamepad2, 
  Clock, 
  BookOpen,
  Hash,
  Shapes,
  Ruler,
  PieChart,
  BarChart3,
  Minus,
  Plus,
  Divide,
  Equal,
  Triangle,
  Circle,
  Square,
  Activity
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function Grade6MathematicsPage() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // All NCERT Class 6 Mathematics Chapters
  const mathematicsChapters = [
    {
      id: 1,
      name: "Knowing Our Numbers",
      description: "Learn about large numbers, place value, and number patterns",
      icon: Hash,
      status: "available",
      href: "/grade/6/mathematics/knowing-our-numbers"
    },
    {
      id: 2,
      name: "Whole Numbers",
      description: "Properties and operations on whole numbers",
      icon: Calculator,
      status: "coming-soon",
      href: "#coming-soon"
    },
    {
      id: 3,
      name: "Playing with Numbers",
      description: "Factors, multiples, and divisibility rules",
      icon: Target,
      status: "coming-soon",
      href: "#coming-soon"
    },
    {
      id: 4,
      name: "Basic Geometrical Ideas",
      description: "Points, lines, angles, and shapes",
      icon: Shapes,
      status: "coming-soon",
      href: "#coming-soon"
    },
    {
      id: 5,
      name: "Understanding Elementary Shapes",
      description: "2D and 3D shapes and their properties",
      icon: Triangle,
      status: "coming-soon",
      href: "#coming-soon"
    },
    {
      id: 6,
      name: "Integers",
      description: "Positive and negative numbers",
      icon: Minus,
      status: "coming-soon",
      href: "#coming-soon"
    },
    {
      id: 7,
      name: "Fractions",
      description: "Understanding and operations with fractions",
      icon: PieChart,
      status: "coming-soon",
      href: "#coming-soon"
    },
    {
      id: 8,
      name: "Decimals",
      description: "Decimal numbers and their applications",
      icon: Circle,
      status: "coming-soon",
      href: "#coming-soon"
    },
    {
      id: 9,
      name: "Data Handling",
      description: "Collection and representation of data",
      icon: BarChart3,
      status: "coming-soon",
      href: "#coming-soon"
    },
    {
      id: 10,
      name: "Mensuration",
      description: "Perimeter and area of shapes",
      icon: Ruler,
      status: "coming-soon",
      href: "#coming-soon"
    },
    {
      id: 11,
      name: "Algebra",
      description: "Introduction to algebraic expressions",
      icon: Equal,
      status: "coming-soon",
      href: "#coming-soon"
    },
    {
      id: 12,
      name: "Ratio and Proportion",
      description: "Understanding ratios and proportions",
      icon: Divide,
      status: "coming-soon",
      href: "#coming-soon"
    },
    {
      id: 13,
      name: "Symmetry",
      description: "Lines of symmetry and patterns",
      icon: Star,
      status: "coming-soon",
      href: "#coming-soon"
    },
    {
      id: 14,
      name: "Practical Geometry",
      description: "Construction of geometric figures",
      icon: Square,
      status: "coming-soon",
      href: "#coming-soon"
    }
  ];

  const quickLinks = [
    {
      title: "Library",
      icon: BookOpen,
      href: "/notes",
      description: "Study materials",
      color: "green"
    },
    {
      title: "Lectures",
      icon: Play,
      href: "/lectures",
      description: "Video lessons",
      color: "purple"
    },
    {
      title: "AI Tutor",
      icon: Brain,
      href: "/ai-tutor",
      description: "Smart learning",
      color: "emerald"
    },
    {
      title: "Quiz",
      icon: Target,
      href: "/quiz",
      description: "Test yourself",
      color: "orange"
    },
    {
      title: "Dashboard",
      icon: Star,
      href: "/dashboard",
      description: "Track progress",
      color: "indigo"
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
    <div className="min-h-screen bg-black">
      {/* Header */}
      <section className="pt-20 md:pt-24 pb-8 px-4 md:px-6">
        <div className="max-w-7xl mx-auto">
          {/* Back Button */}
          <Link href="/grade/6">
            <Button variant="ghost" className="mb-6 text-gray-400 hover:text-white">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Class 6
            </Button>
          </Link>

          {/* Page Header */}
          <div className="text-center mb-12">
            <div className="w-20 h-20 rounded-2xl bg-blue-600 flex items-center justify-center mx-auto mb-6">
              <Calculator className="text-white h-10 w-10" />
            </div>
            <h1 className="text-4xl font-bold text-white mb-2">
              Mathematics - Class 6
            </h1>
            <p className="text-lg text-gray-400">
              NCERT Curriculum • Interactive Learning Resources
            </p>
          </div>

          {/* Mathematics Chapters Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
            {mathematicsChapters.map((chapter) => {
              const IconComponent = chapter.icon;
              const isAvailable = chapter.status === "available";
              
              if (isAvailable) {
                return (
                  <Link key={chapter.id} href={chapter.href}>
                    <Card className="bg-zinc-800 border-zinc-700 hover:bg-zinc-700 transition-all duration-300 cursor-pointer p-6">
                      <div className="flex items-start gap-4">
                        <div className="w-12 h-12 rounded-lg bg-blue-600 flex items-center justify-center flex-shrink-0">
                          <IconComponent className="text-white h-6 w-6" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-2 mb-2">
                            <h3 className="font-semibold text-white text-base">
                              {chapter.name}
                            </h3>
                            <span className="text-xs px-2 py-1 rounded-full bg-green-600 text-white whitespace-nowrap">
                              Available
                            </span>
                          </div>
                          <p className="text-gray-400 text-sm mb-4">
                            {chapter.description}
                          </p>
                          <Button size="sm" className="bg-blue-600 hover:bg-blue-700 text-white">
                            <Play className="h-4 w-4 mr-2" />
                            Start Learning
                          </Button>
                        </div>
                      </div>
                    </Card>
                  </Link>
                );
              }
              
              return (
                <Card key={chapter.id} className="bg-zinc-800 border-zinc-700 cursor-not-allowed p-6 opacity-60">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-lg bg-zinc-600 flex items-center justify-center flex-shrink-0">
                      <IconComponent className="text-zinc-400 h-6 w-6" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <h3 className="font-semibold text-gray-300 text-base">
                          {chapter.name}
                        </h3>
                        <span className="text-xs px-2 py-1 rounded-full bg-yellow-600 text-white whitespace-nowrap">
                          Coming Soon
                        </span>
                      </div>
                      <p className="text-gray-500 text-sm mb-4">
                        {chapter.description}
                      </p>
                      <Button size="sm" disabled className="bg-zinc-600 text-zinc-400 cursor-not-allowed">
                        <Clock className="h-4 w-4 mr-2" />
                        Coming Soon
                      </Button>
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>

          {/* Quick Links */}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
            {quickLinks.map((link, index) => {
              const IconComponent = link.icon;
              return (
                <Link key={index} href={link.href}>
                  <Card className="bg-zinc-800 border-zinc-700 hover:bg-zinc-700 transition-all duration-300 cursor-pointer p-4 text-center">
                    <div className={`w-10 h-10 rounded-lg bg-gradient-to-br ${getColorClasses(link.color)} flex items-center justify-center mx-auto mb-3`}>
                      <IconComponent className="text-white h-5 w-5" />
                    </div>
                    <h3 className="font-semibold text-white text-sm mb-1">
                      {link.title}
                    </h3>
                    <p className="text-gray-400 text-xs">
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
