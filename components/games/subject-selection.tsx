"use client"

import { motion } from "framer-motion"
import { cn } from "@/lib/utils"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Subject as SubjectInterface } from "@/lib/types/games"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Clock, Trophy, Star } from "lucide-react"

interface SubjectSelectionProps {
  subjects: SubjectInterface[]
  selectedSubject?: string
  onSubjectSelect: (subjectId: string) => void
  className?: string
  showAllOption?: boolean
}

export function SubjectSelection({
  subjects,
  selectedSubject,
  onSubjectSelect,
  className,
  showAllOption = true
}: SubjectSelectionProps) {
  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case "easy": return "bg-green-100 text-green-800 border-green-200"
      case "medium": return "bg-yellow-100 text-yellow-800 border-yellow-200"
      case "advanced": return "bg-red-100 text-red-800 border-red-200"
      default: return "bg-gray-100 text-gray-800 border-gray-200"
    }
  }

  const getGameTypeIcon = (gameType: string) => {
    switch (gameType) {
      case "adventure": return "🗺️"
      case "puzzle": return "🧩"
      case "simulation": return "🎮"
      case "construction": return "🏗️"
      case "lab": return "⚗️"
      case "quiz": return "❓"
      default: return "🎯"
    }
  }

  return (
    <div className={cn("space-y-6", className)}>
      <div className="text-center space-y-3">
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-3xl font-bold"
        >
          Choose Your Subject
        </motion.h2>
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="text-muted-foreground"
        >
          Explore STEM subjects through engaging games set in Odisha's context
        </motion.p>
      </div>

      <Tabs value={selectedSubject || "all"} onValueChange={onSubjectSelect}>
        <TabsList className="grid w-full grid-cols-2 md:grid-cols-4 h-auto p-1">
          {showAllOption && (
            <TabsTrigger value="all" className="flex items-center gap-2 h-12">
              <span className="text-lg">🎯</span>
              <div className="text-left">
                <div className="font-medium">All Subjects</div>
                <div className="text-xs text-muted-foreground">
                  {subjects.reduce((total, subject) => total + subject.games.length, 0)} games
                </div>
              </div>
            </TabsTrigger>
          )}
          
          {subjects.map((subject) => (
            <TabsTrigger 
              key={subject.id} 
              value={subject.id}
              className="flex items-center gap-2 h-12"
            >
              <span className="text-lg">{subject.emoji}</span>
              <div className="text-left">
                <div className="font-medium">{subject.name}</div>
                <div className="text-xs text-muted-foreground">
                  {subject.games.length} games
                </div>
              </div>
            </TabsTrigger>
          ))}
        </TabsList>

        {showAllOption && (
          <TabsContent value="all" className="mt-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {subjects.map((subject, subjectIndex) => (
                subject.games.map((game, gameIndex) => (
                  <motion.div
                    key={`${subject.id}-${game.id}`}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: (subjectIndex * subject.games.length + gameIndex) * 0.05 }}
                  >
                    <Card className="h-full hover:shadow-md transition-shadow duration-200">
                      <CardHeader className="pb-3">
                        <div className="flex items-start justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <span className="text-2xl">{game.emoji}</span>
                            <Badge className={cn("text-xs", subject.color)}>
                              {subject.name}
                            </Badge>
                          </div>
                          <Badge variant="outline" className={getDifficultyColor(game.difficultyLevel)}>
                            {game.difficultyLevel}
                          </Badge>
                        </div>
                        <CardTitle className="text-lg leading-tight">{game.title}</CardTitle>
                      </CardHeader>
                      
                      <CardContent className="space-y-3">
                        <p className="text-sm text-muted-foreground line-clamp-2">
                          {game.description}
                        </p>
                        
                        <div className="flex items-center justify-between text-sm">
                          <div className="flex items-center gap-1 text-muted-foreground">
                            <Clock className="h-3 w-3" />
                            {game.estimatedTime}m
                          </div>
                          <div className="flex items-center gap-1 text-muted-foreground">
                            <Trophy className="h-3 w-3" />
                            {game.auraPoints} pts
                          </div>
                        </div>

                        <div className="flex items-center justify-between">
                          <span className="text-xs text-muted-foreground">
                            {getGameTypeIcon(game.gameType)} {game.gameType}
                          </span>
                          <Button size="sm" variant="outline">
                            Play Game
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))
              ))}
            </div>
          </TabsContent>
        )}

        {subjects.map((subject) => (
          <TabsContent key={subject.id} value={subject.id} className="mt-6">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="space-y-4"
            >
              <div className="text-center p-6 bg-gradient-to-r from-background to-muted/20 rounded-lg">
                <div className="text-6xl mb-3">{subject.emoji}</div>
                <h3 className="text-2xl font-bold mb-2">{subject.name}</h3>
                <p className="text-muted-foreground mb-4">
                  {subject.games.length} interactive games available
                </p>
                <div className="flex flex-wrap justify-center gap-2">
                  {Array.from(new Set(subject.games.map(g => g.difficultyLevel))).map(level => (
                    <Badge key={level} variant="secondary" className="capitalize">
                      {level} ({subject.games.filter(g => g.difficultyLevel === level).length})
                    </Badge>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {subject.games.map((game, index) => (
                  <motion.div
                    key={game.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                  >
                    <Card className="h-full hover:shadow-md transition-shadow duration-200 group">
                      <CardHeader className="pb-3">
                        <div className="flex items-start justify-between mb-2">
                          <span className="text-3xl group-hover:scale-110 transition-transform duration-200">
                            {game.emoji}
                          </span>
                          <Badge variant="outline" className={getDifficultyColor(game.difficultyLevel)}>
                            {game.difficultyLevel}
                          </Badge>
                        </div>
                        <CardTitle className="text-lg leading-tight">{game.title}</CardTitle>
                      </CardHeader>
                      
                      <CardContent className="space-y-4">
                        <p className="text-sm text-muted-foreground leading-relaxed">
                          {game.description}
                        </p>

                        {(game.example || game.mission || game.challenge) && (
                          <div className="p-3 bg-muted/30 rounded-md">
                            <p className="text-xs font-medium text-muted-foreground mb-1">
                              {game.example ? "Example:" : game.mission ? "Mission:" : "Challenge:"}
                            </p>
                            <p className="text-sm">
                              {game.example || game.mission || game.challenge}
                            </p>
                          </div>
                        )}

                        <div className="space-y-2">
                          <div className="flex items-center justify-between text-sm">
                            <div className="flex items-center gap-1 text-muted-foreground">
                              <Clock className="h-3 w-3" />
                              {game.estimatedTime} minutes
                            </div>
                            <div className="flex items-center gap-1 text-orange-600">
                              <Trophy className="h-3 w-3" />
                              {game.auraPoints} Aura Points
                            </div>
                          </div>
                          
                          <div className="flex items-center justify-between">
                            <span className="text-xs text-muted-foreground flex items-center gap-1">
                              {getGameTypeIcon(game.gameType)} {game.gameType}
                            </span>
                            <Button size="sm" className="group-hover:scale-105 transition-transform duration-200">
                              Start Game
                            </Button>
                          </div>
                        </div>

                        {game.localContext && (
                          <div className="pt-2 border-t">
                            <p className="text-xs text-muted-foreground">
                              <span className="font-medium">🏛️ Local Context:</span> {game.localContext}
                            </p>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          </TabsContent>
        ))}
      </Tabs>
    </div>
  )
}
