"use client";

import { useState } from "react";
import { Search, Beaker, Code, Cog, Calculator, Rocket, Microscope, Cpu, Zap, Brain } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import Link from "next/link";

interface STEMProject {
  id: string;
  title: string;
  description: string;
  category: "Science" | "Technology" | "Engineering" | "Math";
  gradeLevel: "6-8" | "9-12" | "All";
  difficulty: "Beginner" | "Intermediate" | "Advanced";
  icon: any;
  comingSoon?: boolean;
}

export default function ProjectsPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [gradeFilter, setGradeFilter] = useState("all");

  const stemProjects: STEMProject[] = [
    // Grade 6-8 Science
    {
      id: "photosynthesis",
      title: "The Green Adventure",
      description: "Explore how plants make food through photosynthesis in an interactive journey",
      category: "Science",
      gradeLevel: "6-8",
      difficulty: "Beginner",
      icon: Microscope,
      comingSoon: true,
    },

    // Grade 6-8 Technology
    {
      id: "block-coding",
      title: "Code Your Own Game",
      description: "Block-based coding to create simple games and animations",
      category: "Technology",
      gradeLevel: "6-8",
      difficulty: "Beginner",
      icon: Code,
      comingSoon: true,
    },
    {
      id: "robot-maze",
      title: "Robot Maze Solver",
      description: "Program a virtual robot to navigate through challenging mazes",
      category: "Technology",
      gradeLevel: "6-8",
      difficulty: "Intermediate",
      icon: Cpu,
      comingSoon: true,
    },

    // Grade 6-8 Engineering
    {
      id: "bridge-builder",
      title: "Bridge Builder",
      description: "Design bridges and test their strength with physics simulations",
      category: "Engineering",
      gradeLevel: "6-8",
      difficulty: "Intermediate",
      icon: Cog,
      comingSoon: true,
    },
    {
      id: "circuit-builder",
      title: "Circuit Builder",
      description: "Create virtual electrical circuits and learn about electricity",
      category: "Engineering",
      gradeLevel: "6-8",
      difficulty: "Beginner",
      icon: Zap,
      comingSoon: true,
    },

    // Grade 6-8 Math
    {
      id: "fraction-pizza",
      title: "Fraction Pizza Maker",
      description: "Visual fraction operations using pizza slices and interactive tools",
      category: "Math",
      gradeLevel: "6-8",
      difficulty: "Beginner",
      icon: Calculator,
      comingSoon: true,
    },
    {
      id: "geometry-art",
      title: "Geometry Art Creator",
      description: "Create beautiful art using geometric shapes and transformations",
      category: "Math",
      gradeLevel: "6-8",
      difficulty: "Beginner",
      icon: Calculator,
      comingSoon: true,
    },



    // Grade 9-12 Technology
    {
      id: "ai-chatbot",
      title: "AI Chatbot Builder",
      description: "Create and train simple AI chatbots with natural language processing",
      category: "Technology",
      gradeLevel: "9-12",
      difficulty: "Advanced",
      icon: Brain,
      comingSoon: true,
    },
    {
      id: "data-viz",
      title: "Data Visualization Dashboard",
      description: "Analyze and visualize real-world datasets with interactive charts",
      category: "Technology",
      gradeLevel: "9-12",
      difficulty: "Intermediate",
      icon: Code,
      comingSoon: true,
    },
    {
      id: "ml-playground",
      title: "Machine Learning Playground",
      description: "Train simple machine learning models and understand AI concepts",
      category: "Technology",
      gradeLevel: "9-12",
      difficulty: "Advanced",
      icon: Brain,
      comingSoon: true,
    },

    // Grade 9-12 Engineering
    {
      id: "structural-eng",
      title: "Structural Engineering",
      description: "Design buildings with load calculations and structural analysis",
      category: "Engineering",
      gradeLevel: "9-12",
      difficulty: "Advanced",
      icon: Cog,
      comingSoon: true,
    },
    {
      id: "renewable-energy",
      title: "Renewable Energy Calculator",
      description: "Calculate solar and wind energy potential for real locations",
      category: "Engineering",
      gradeLevel: "9-12",
      difficulty: "Intermediate",
      icon: Zap,
      comingSoon: true,
    },
    {
      id: "robotics-sim",
      title: "Robotics Simulator",
      description: "Program complex robot behaviors and autonomous systems",
      category: "Engineering",
      gradeLevel: "9-12",
      difficulty: "Advanced",
      icon: Cpu,
      comingSoon: true,
    },

    // Grade 9-12 Math
    {
      id: "calculus-viz",
      title: "Calculus Visualizer",
      description: "Interactive derivatives, integrals, and limits visualization",
      category: "Math",
      gradeLevel: "9-12",
      difficulty: "Advanced",
      icon: Calculator,
      comingSoon: true,
    },
    {
      id: "statistics-dash",
      title: "Statistics Dashboard",
      description: "Real-world data analysis with statistical methods and tests",
      category: "Math",
      gradeLevel: "9-12",
      difficulty: "Intermediate",
      icon: Calculator,
      comingSoon: true,
    },
    {
      id: "probability-sim",
      title: "Probability Simulator",
      description: "Monte Carlo simulations and probability experiments",
      category: "Math",
      gradeLevel: "9-12",
      difficulty: "Intermediate",
      icon: Calculator,
      comingSoon: true,
    },
  ];

  const filteredProjects = stemProjects.filter((project) => {
    const matchesSearch =
      searchQuery === "" ||
      project.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      project.description.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesCategory = categoryFilter === "all" || project.category === categoryFilter;

    const matchesGrade = gradeFilter === "all" || project.gradeLevel === gradeFilter || project.gradeLevel === "All";

    return matchesSearch && matchesCategory && matchesGrade;
  });

  const getCategoryColor = (category: string) => {
    const colors: Record<string, { bg: string; icon: string; badge: string }> = {
      Science: {
        bg: "bg-green-50 dark:bg-green-950/20 hover:bg-green-100 dark:hover:bg-green-950/40",
        icon: "bg-green-100 dark:bg-green-900/50 text-green-600 dark:text-green-400",
        badge: "bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300",
      },
      Technology: {
        bg: "bg-blue-50 dark:bg-blue-950/20 hover:bg-blue-100 dark:hover:bg-blue-950/40",
        icon: "bg-blue-100 dark:bg-blue-900/50 text-blue-600 dark:text-blue-400",
        badge: "bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300",
      },
      Engineering: {
        bg: "bg-orange-50 dark:bg-orange-950/20 hover:bg-orange-100 dark:hover:bg-orange-950/40",
        icon: "bg-orange-100 dark:bg-orange-900/50 text-orange-600 dark:text-orange-400",
        badge: "bg-orange-100 text-orange-700 dark:bg-orange-900 dark:text-orange-300",
      },
      Math: {
        bg: "bg-purple-50 dark:bg-purple-950/20 hover:bg-purple-100 dark:hover:bg-purple-950/40",
        icon: "bg-purple-100 dark:bg-purple-900/50 text-purple-600 dark:text-purple-400",
        badge: "bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-300",
      },
    };
    return (
      colors[category] || {
        bg: "bg-gray-50 dark:bg-gray-950/20",
        icon: "bg-gray-100 dark:bg-gray-900/50 text-gray-600 dark:text-gray-400",
        badge: "bg-gray-100 text-gray-700 dark:bg-gray-900 dark:text-gray-300",
      }
    );
  };

  const getDifficultyColor = (difficulty: string) => {
    const colors: Record<string, string> = {
      Beginner: "bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-300",
      Intermediate: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300",
      Advanced: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300",
    };
    return colors[difficulty] || "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300";
  };

  return (
    <div className="min-h-screen bg-background py-8 pt-20">
      <div className="max-w-7xl mx-auto px-4">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
            STEM Projects
          </h1>
          <p className="text-muted-foreground text-lg">
            Hands-on Science, Technology, Engineering, and Math projects for grades 6-12
          </p>
        </div>

        {/* Filters */}
        <div className="flex flex-col md:flex-row gap-4 mb-8">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input
              placeholder="Search STEM projects..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          <Select value={categoryFilter} onValueChange={setCategoryFilter}>
            <SelectTrigger className="w-full md:w-48">
              <SelectValue placeholder="All Categories" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
              <SelectItem value="Science">Science</SelectItem>
              <SelectItem value="Technology">Technology</SelectItem>
              <SelectItem value="Engineering">Engineering</SelectItem>
              <SelectItem value="Math">Math</SelectItem>
            </SelectContent>
          </Select>
          <Select value={gradeFilter} onValueChange={setGradeFilter}>
            <SelectTrigger className="w-full md:w-48">
              <SelectValue placeholder="All Grades" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Grades</SelectItem>
              <SelectItem value="6-8">Grades 6-8</SelectItem>
              <SelectItem value="9-12">Grades 9-12</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Projects Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {filteredProjects.map((project) => {
            const Icon = project.icon;
            const colors = getCategoryColor(project.category);
            return (
              <Card
                key={project.id}
                className={`transition-all duration-300 hover:scale-105 hover:shadow-xl flex flex-col border-2 ${colors.bg}`}
              >
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between mb-2">
                    <div className={`p-2.5 rounded-full ${colors.icon} transition-transform hover:scale-110`}>
                      <Icon className="h-5 w-5" />
                    </div>
                    <Badge className={colors.badge}>
                      {project.category}
                    </Badge>
                  </div>
                  <CardTitle className="text-base leading-tight font-semibold">{project.title}</CardTitle>
                </CardHeader>
                
                <CardContent className="flex-1 flex flex-col pt-0">
                  <CardDescription className="text-xs mb-3 flex-1 line-clamp-2">
                    {project.description}
                  </CardDescription>

                  <div className="space-y-2">
                    <div className="flex items-center justify-between gap-2">
                      <Badge variant="outline" className="text-xs flex-1 justify-center">
                        Grade {project.gradeLevel}
                      </Badge>
                      <Badge variant="outline" className={`text-xs flex-1 justify-center ${getDifficultyColor(project.difficulty)}`}>
                        {project.difficulty}
                      </Badge>
                    </div>

                    {project.comingSoon ? (
                      <Button size="sm" variant="outline" className="w-full h-8 text-xs" disabled>
                        Coming Soon
                      </Button>
                    ) : (
                      <Button 
                        size="sm" 
                        className={`w-full h-8 text-xs font-semibold transition-all hover:scale-105 ${
                          project.category === "Science" ? "bg-green-600 hover:bg-green-700" :
                          project.category === "Technology" ? "bg-blue-600 hover:bg-blue-700" :
                          project.category === "Engineering" ? "bg-orange-600 hover:bg-orange-700" :
                          "bg-purple-600 hover:bg-purple-700"
                        }`}
                        asChild
                      >
                        <Link href={`/projects/${project.id}`}>
                          Start Project
                        </Link>
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {filteredProjects.length === 0 && (
          <div className="text-center py-12">
            <p className="text-muted-foreground">No projects found matching your criteria.</p>
          </div>
        )}

        {/* Category Statistics */}
        <div className="mt-16">
          <h2 className="text-2xl font-bold mb-6">Projects by Category</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {["Science", "Technology", "Engineering", "Math"].map((category) => {
              const count = stemProjects.filter((p) => p.category === category).length;
              const Icon =
                category === "Science"
                  ? Beaker
                  : category === "Technology"
                  ? Code
                  : category === "Engineering"
                  ? Cog
                  : Calculator;
              return (
                <Card key={category} className="text-center hover:shadow-lg transition-all">
                  <CardContent className="p-6">
                    <Icon className="h-8 w-8 mx-auto mb-2 text-primary" />
                    <div className="text-3xl font-bold text-primary">{count}</div>
                    <div className="text-sm text-muted-foreground">{category}</div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>

        {/* Copyright Footer */}
        <footer className="py-6 mt-16 border-t border-zinc-200 dark:border-zinc-800">
          <div className="max-w-6xl mx-auto text-center">
            <p className="text-xs text-zinc-600 dark:text-zinc-400">
              © 2024 IgniteVidya. All rights reserved.
            </p>
          </div>
        </footer>
      </div>
    </div>
  );
}
