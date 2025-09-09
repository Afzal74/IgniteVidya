"use client"

import Link from "next/link"
import { motion } from "framer-motion"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Play, Clock, Trophy, BookOpen, Target } from "lucide-react"

export default function GamesPage() {
  const featuredGame = {
    id: "number-comparison",
    title: "Number Comparison Challenge",
    emoji: "🔢",
    description: "Master comparing numbers with interactive exercises perfect for Class 6 students",
    difficulty: "Easy",
    duration: "15 min",
    points: 80,
    href: "/games/comparison",
    featured: true
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 p-8 pt-20">
      <div className="container mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <h1 className="text-5xl font-bold mb-4 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            STEM Games Platform
          </h1>
          <p className="text-xl text-gray-600 mb-8">
            Welcome to IgniteVidya Games - Your STEM Learning Adventure
          </p>
        </motion.div>

        {/* Featured Game Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mb-12"
        >
          <Card className="shadow-xl border-0 bg-gradient-to-r from-blue-500 to-purple-600 text-white">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <Badge className="bg-white/20 text-white mb-2">Featured Game</Badge>
                  <CardTitle className="text-3xl mb-2 flex items-center gap-3">
                    <span className="text-4xl">{featuredGame.emoji}</span>
                    {featuredGame.title}
                  </CardTitle>
                  <CardDescription className="text-white/90 text-lg">
                    {featuredGame.description}
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-6 mb-6">
                <div className="flex items-center gap-2 text-white/90">
                  <Target className="h-5 w-5" />
                  <span>Difficulty: {featuredGame.difficulty}</span>
                </div>
                <div className="flex items-center gap-2 text-white/90">
                  <Clock className="h-5 w-5" />
                  <span>Duration: {featuredGame.duration}</span>
                </div>
                <div className="flex items-center gap-2 text-white/90">
                  <Trophy className="h-5 w-5" />
                  <span>Points: {featuredGame.points}</span>
                </div>
              </div>
              <Link href={featuredGame.href}>
                <Button size="lg" className="bg-white text-blue-600 hover:bg-gray-100">
                  <Play className="mr-2 h-5 w-5" />
                  Play Now
                </Button>
              </Link>
            </CardContent>
          </Card>
        </motion.div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <Card className="h-full shadow-lg border-0 bg-white/80 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-2xl text-blue-600 flex items-center gap-2">
                  🎮 Upper Primary
                </CardTitle>
                <CardDescription className="text-lg">
                  Foundation STEM for Classes 6-7
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3">
                  <li className="flex items-center gap-3 p-2 rounded-lg hover:bg-blue-50 transition-colors">
                    <span className="text-2xl">🔢</span>
                    <div>
                      <div className="font-medium">Number Comparison Challenge</div>
                      <div className="text-sm text-gray-500">Compare numbers using symbols</div>
                    </div>
                  </li>
                  <li className="flex items-center gap-3 p-2 rounded-lg hover:bg-blue-50 transition-colors">
                    <span className="text-2xl">🧮</span>
                    <div>
                      <div className="font-medium">Number Detective Adventures</div>
                      <div className="text-sm text-gray-500">Solve village math mysteries</div>
                    </div>
                  </li>
                  <li className="flex items-center gap-3 p-2 rounded-lg hover:bg-blue-50 transition-colors">
                    <span className="text-2xl">📐</span>
                    <div>
                      <div className="font-medium">Geometry Builder Odisha</div>
                      <div className="text-sm text-gray-500">Build temple geometry</div>
                    </div>
                  </li>
                  <li className="flex items-center gap-3 p-2 rounded-lg hover:bg-blue-50 transition-colors">
                    <span className="text-2xl">📈</span>
                    <div>
                      <div className="font-medium">Data Handler Village</div>
                      <div className="text-sm text-gray-500">Analyze village data</div>
                    </div>
                  </li>
                  <li className="flex items-center gap-3 p-2 rounded-lg hover:bg-blue-50 transition-colors">
                    <span className="text-2xl">🔬</span>
                    <div>
                      <div className="font-medium">Matter Explorer Lab</div>
                      <div className="text-sm text-gray-500">Transform matter states</div>
                    </div>
                  </li>
                  <li className="flex items-center gap-3 p-2 rounded-lg hover:bg-blue-50 transition-colors">
                    <span className="text-2xl">🌱</span>
                    <div>
                      <div className="font-medium">Life Systems Detective</div>
                      <div className="text-sm text-gray-500">Journey through body systems</div>
                    </div>
                  </li>
                </ul>
                <div className="mt-6">
                  <Link href="/games/comparison">
                    <Button className="w-full bg-blue-600 hover:bg-blue-700">
                      <BookOpen className="mr-2 h-4 w-4" />
                      Explore Class 6 Games
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          </motion.div>
          
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
            <h2 className="text-2xl font-bold mb-4 text-green-600">
              🎯 Secondary
            </h2>
            <p className="text-gray-600 dark:text-gray-300 mb-4">
              Applied STEM for Classes 8-10
            </p>
            <ul className="space-y-2 text-sm">
              <li>🏗 Engineering Challenge Odisha</li>
              <li>📈 Statistics Sports Arena</li>
              <li>⚡ Physics Power Plant</li>
              <li>🧪 Chemistry Lab Master</li>
              <li>🌿 Biodiversity Guardian</li>
              <li>💻 Code for Odisha</li>
            </ul>
          </div>
          
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
            <h2 className="text-2xl font-bold mb-4 text-purple-600">
              🚀 Higher Secondary
            </h2>
            <p className="text-gray-600 dark:text-gray-300 mb-4">
              Advanced STEM for +1, +2
            </p>
            <ul className="space-y-2 text-sm">
              <li>🎯 Calculus in Action</li>
              <li>📐 3D Geometry Studio</li>
              <li>⚛ Physics Research Lab</li>
              <li>🧬 Chemistry Innovation Hub</li>
              <li>🔬 Biology Research Center</li>
              <li>🤖 AI Innovation Lab</li>
            </ul>
          </div>
        </div>
        
        <div className="mt-12 text-center">
          <div className="bg-blue-50 dark:bg-blue-900/20 p-8 rounded-lg">
            <h3 className="text-2xl font-bold mb-4">🏛️ Built for Odisha Students</h3>
            <p className="text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
              All games incorporate local Odisha context including Chilika Lake, 
              Jagannath Temple, Konark Sun Temple, and real-world challenges 
              facing the state. Learn STEM through familiar cultural contexts!
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
