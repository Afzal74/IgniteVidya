"use client"

import { motion } from "framer-motion"
import { cn } from "@/lib/utils"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { GameContent, UserProgress } from "@/lib/types/games"
import { 
  Clock, 
  Trophy, 
  Star, 
  Play, 
  CheckCircle, 
  Lock,
  Target,
  BookOpen,
  MapPin
} from "lucide-react"

interface GameCardProps {
  game: GameContent
  userProgress?: UserProgress
  isLocked?: boolean
  onGameStart: (gameId: string) => void
  onGameContinue?: (gameId: string) => void
  className?: string
  variant?: "compact" | "detailed"
}

export function GameCard({
  game,
  userProgress,
  isLocked = false,
  onGameStart,
  onGameContinue,
  className,
  variant = "detailed"
}: GameCardProps) {
  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case "easy": return "bg-green-100 text-green-800 border-green-200 dark:bg-green-900/20 dark:text-green-400"
      case "medium": return "bg-yellow-100 text-yellow-800 border-yellow-200 dark:bg-yellow-900/20 dark:text-yellow-400"
      case "advanced": return "bg-red-100 text-red-800 border-red-200 dark:bg-red-900/20 dark:text-red-400"
      default: return "bg-gray-100 text-gray-800 border-gray-200 dark:bg-gray-900/20 dark:text-gray-400"
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

  const isCompleted = userProgress?.completed || false
  const progressPercent = userProgress ? (userProgress.timeSpent / game.estimatedTime) * 100 : 0
  const hasStarted = userProgress && userProgress.timeSpent > 0

  const handleGameAction = () => {
    if (hasStarted && !isCompleted && onGameContinue) {
      onGameContinue(game.id)
    } else {
      onGameStart(game.id)
    }
  }

  if (variant === "compact") {
    return (
      <motion.div
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        className={className}
      >
        <Card className={cn(
          "cursor-pointer transition-all duration-300 hover:shadow-lg",
          isLocked && "opacity-60",
          isCompleted && "ring-2 ring-green-500/20 bg-green-50/50 dark:bg-green-900/10"
        )}>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="relative">
                <span className="text-3xl">{game.emoji}</span>
                {isCompleted && (
                  <CheckCircle className="absolute -top-1 -right-1 h-4 w-4 text-green-600 bg-white rounded-full" />
                )}
                {isLocked && (
                  <Lock className="absolute -top-1 -right-1 h-4 w-4 text-gray-400 bg-white rounded-full" />
                )}
              </div>
              
              <div className="flex-1 min-w-0">
                <h4 className="font-medium truncate">{game.title}</h4>
                <div className="flex items-center gap-2 text-sm text-muted-foreground mt-1">
                  <Clock className="h-3 w-3" />
                  {game.estimatedTime}m
                  <Trophy className="h-3 w-3 ml-2" />
                  {game.auraPoints}
                </div>
              </div>

              <div className="flex flex-col items-end gap-1">
                <Badge variant="outline" className={getDifficultyColor(game.difficultyLevel)}>
                  {game.difficultyLevel}
                </Badge>
                <Button 
                  size="sm" 
                  variant={isCompleted ? "secondary" : "default"}
                  onClick={handleGameAction}
                  disabled={isLocked}
                  className="h-7"
                >
                  {isLocked ? (
                    <Lock className="h-3 w-3" />
                  ) : isCompleted ? (
                    "Replay"
                  ) : hasStarted ? (
                    "Continue"
                  ) : (
                    <Play className="h-3 w-3" />
                  )}
                </Button>
              </div>
            </div>

            {hasStarted && !isCompleted && (
              <div className="mt-3">
                <Progress value={Math.min(progressPercent, 100)} className="h-1" />
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ scale: 1.02 }}
      className={className}
    >
      <Card className={cn(
        "h-full transition-all duration-300 hover:shadow-lg group",
        isLocked && "opacity-60",
        isCompleted && "ring-2 ring-green-500/20 bg-green-50/50 dark:bg-green-900/10"
      )}>
        <CardHeader className="pb-4">
          <div className="flex items-start justify-between mb-3">
            <div className="relative">
              <span className="text-4xl group-hover:scale-110 transition-transform duration-200">
                {game.emoji}
              </span>
              {isCompleted && (
                <CheckCircle className="absolute -top-1 -right-1 h-5 w-5 text-green-600 bg-white rounded-full" />
              )}
              {isLocked && (
                <Lock className="absolute -top-1 -right-1 h-5 w-5 text-gray-400 bg-white rounded-full" />
              )}
            </div>
            <div className="flex flex-col gap-2">
              <Badge variant="outline" className={getDifficultyColor(game.difficultyLevel)}>
                {game.difficultyLevel}
              </Badge>
              {userProgress?.bestScore && (
                <Badge variant="secondary" className="text-xs">
                  <Star className="h-3 w-3 mr-1" />
                  {userProgress.bestScore}%
                </Badge>
              )}
            </div>
          </div>
          
          <CardTitle className="text-xl leading-tight group-hover:text-primary transition-colors">
            {game.title}
          </CardTitle>
          
          <p className="text-sm text-muted-foreground leading-relaxed">
            {game.description}
          </p>
        </CardHeader>

        <CardContent className="space-y-4">
          {/* Content Topics */}
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm font-medium">
              <BookOpen className="h-4 w-4 text-muted-foreground" />
              Topics Covered:
            </div>
            <div className="flex flex-wrap gap-1">
              {game.content.map((topic, index) => (
                <Badge key={index} variant="secondary" className="text-xs">
                  {topic}
                </Badge>
              ))}
            </div>
          </div>

          {/* Game Details */}
          {(game.example || game.mission || game.challenge) && (
            <div className="p-3 bg-muted/30 rounded-lg">
              <div className="flex items-start gap-2">
                <Target className="h-4 w-4 text-muted-foreground mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-xs font-medium text-muted-foreground mb-1">
                    {game.example ? "Example:" : game.mission ? "Mission:" : "Challenge:"}
                  </p>
                  <p className="text-sm leading-relaxed">
                    {game.example || game.mission || game.challenge}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Local Context */}
          {game.localContext && (
            <div className="flex items-start gap-2 p-3 bg-blue-50/50 dark:bg-blue-900/10 rounded-lg">
              <MapPin className="h-4 w-4 text-blue-600 mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-xs font-medium text-blue-600 mb-1">
                  Odisha Context:
                </p>
                <p className="text-sm text-blue-800 dark:text-blue-400 leading-relaxed">
                  {game.localContext}
                </p>
              </div>
            </div>
          )}

          {/* Game Stats */}
          <div className="grid grid-cols-2 gap-4 py-3 border-y">
            <div className="text-center">
              <div className="flex items-center justify-center gap-1 text-muted-foreground mb-1">
                <Clock className="h-4 w-4" />
              </div>
              <p className="text-sm font-medium">{game.estimatedTime} min</p>
              <p className="text-xs text-muted-foreground">Duration</p>
            </div>
            <div className="text-center">
              <div className="flex items-center justify-center gap-1 text-orange-600 mb-1">
                <Trophy className="h-4 w-4" />
              </div>
              <p className="text-sm font-medium text-orange-600">{game.auraPoints}</p>
              <p className="text-xs text-muted-foreground">Aura Points</p>
            </div>
          </div>

          {/* Progress Bar */}
          {hasStarted && !isCompleted && (
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Progress</span>
                <span className="font-medium">{Math.round(progressPercent)}%</span>
              </div>
              <Progress value={Math.min(progressPercent, 100)} className="h-2" />
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex gap-2 pt-2">
            <Button 
              className="flex-1" 
              onClick={handleGameAction}
              disabled={isLocked}
              variant={isCompleted ? "outline" : "default"}
            >
              {isLocked ? (
                <>
                  <Lock className="h-4 w-4 mr-2" />
                  Locked
                </>
              ) : isCompleted ? (
                <>
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Play Again
                </>
              ) : hasStarted ? (
                <>
                  <Play className="h-4 w-4 mr-2" />
                  Continue Game
                </>
              ) : (
                <>
                  <Play className="h-4 w-4 mr-2" />
                  Start Game
                </>
              )}
            </Button>
            
            {userProgress && userProgress.attempts > 0 && (
              <Button variant="ghost" size="sm" className="px-3">
                <Star className="h-4 w-4" />
              </Button>
            )}
          </div>

          {/* Game Type and Implementation */}
          <div className="pt-2 border-t">
            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <span className="flex items-center gap-1">
                {getGameTypeIcon(game.gameType)} {game.gameType} game
              </span>
              {userProgress && (
                <span>{userProgress.attempts} attempt{userProgress.attempts !== 1 ? 's' : ''}</span>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  )
}
