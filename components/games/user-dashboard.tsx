"use client"

import { motion } from "framer-motion"
import { cn } from "@/lib/utils"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { UserStats, Achievement, LeaderboardEntry } from "@/lib/types/games"
import { 
  Trophy, 
  Flame, 
  Star, 
  Clock, 
  Target, 
  Award,
  TrendingUp,
  Calendar,
  Users,
  BookOpen,
  Zap
} from "lucide-react"

interface UserDashboardProps {
  userStats: UserStats
  achievements: Achievement[]
  leaderboard: LeaderboardEntry[]
  className?: string
}

export function UserDashboard({
  userStats,
  achievements,
  leaderboard,
  className
}: UserDashboardProps) {
  const getXPForNextLevel = (currentLevel: number) => {
    return currentLevel * 1000 // Simple XP calculation
  }

  const getXPProgress = () => {
    const xpForCurrentLevel = (userStats.level - 1) * 1000
    const xpForNextLevel = getXPForNextLevel(userStats.level)
    const progressXP = userStats.experience - xpForCurrentLevel
    const neededXP = xpForNextLevel - xpForCurrentLevel
    return Math.min((progressXP / neededXP) * 100, 100)
  }

  const recentAchievements = achievements
    .filter(a => a.unlockedAt)
    .sort((a, b) => (b.unlockedAt?.getTime() || 0) - (a.unlockedAt?.getTime() || 0))
    .slice(0, 3)

  return (
    <div className={cn("space-y-6", className)}>
      {/* Compact User Profile Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <Card className="bg-gradient-to-br from-blue-500/10 to-purple-600/10 border-blue-200/50">
          <CardContent className="p-4">
            <div className="flex items-center gap-3 mb-4">
              <Avatar className="h-12 w-12 ring-2 ring-blue-100">
                <AvatarImage src="/placeholder-avatar.png" />
                <AvatarFallback className="text-sm font-bold bg-gradient-to-br from-blue-500 to-purple-600 text-white">
                  SL
                </AvatarFallback>
              </Avatar>
              
              <div className="flex-1">
                <h2 className="text-lg font-bold">Student Learner</h2>
                <p className="text-muted-foreground text-sm">Level {userStats.level} • STEM Explorer</p>
              </div>

              <div className="text-right">
                <div className="text-xl font-bold text-blue-600">
                  #{leaderboard.findIndex(entry => entry.userId === userStats.userId) + 1 || "?"}
                </div>
                <p className="text-xs text-muted-foreground">Rank</p>
              </div>
            </div>

            <div className="flex items-center gap-3 mb-3">
              <Badge variant="secondary" className="bg-blue-100 text-blue-800 text-xs">
                <Zap className="h-3 w-3 mr-1" />
                {userStats.totalAuraPoints}
              </Badge>
              <Badge variant="secondary" className="bg-orange-100 text-orange-800 text-xs">
                <Flame className="h-3 w-3 mr-1" />
                {userStats.currentStreak} days
              </Badge>
            </div>

            {/* Compact Level Progress */}
            <div className="space-y-1">
              <div className="flex justify-between text-xs">
                <span className="text-muted-foreground">Level Progress</span>
                <span className="font-medium">
                  {userStats.experience}/{getXPForNextLevel(userStats.level)}
                </span>
              </div>
              <Progress value={getXPProgress()} className="h-1.5" />
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Compact Quick Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          {
            title: "Games",
            value: userStats.gamesCompleted,
            icon: Target,
            color: "text-green-600",
            bgColor: "bg-green-100"
          },
          {
            title: "Time",
            value: `${Math.floor(userStats.totalTimeSpent / 60)}h`,
            icon: Clock,
            color: "text-blue-600",
            bgColor: "bg-blue-100"
          },
          {
            title: "Streak",
            value: `${userStats.longestStreak}d`,
            icon: Flame,
            color: "text-orange-600",
            bgColor: "bg-orange-100"
          },
          {
            title: "Badges",
            value: userStats.achievements.length,
            icon: Award,
            color: "text-purple-600",
            bgColor: "bg-purple-100"
          }
        ].map((stat, index) => (
          <motion.div
            key={stat.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 + 0.2 }}
          >
            <Card>
              <CardContent className="p-3">
                <div className="flex items-center gap-2">
                  <div className={cn("p-1.5 rounded-lg", stat.bgColor)}>
                    <stat.icon className={cn("h-3 w-3", stat.color)} />
                  </div>
                  <div>
                    <p className="text-lg font-bold">{stat.value}</p>
                    <p className="text-xs text-muted-foreground">{stat.title}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Compact Recent Achievements */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-base">
                <Award className="h-4 w-4" />
                Recent Achievements
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {recentAchievements.length > 0 ? (
                recentAchievements.slice(0, 3).map((achievement) => (
                  <div
                    key={achievement.id}
                    className="flex items-center gap-2 p-2 bg-muted/30 rounded"
                  >
                    <div className="text-lg">{achievement.emoji}</div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-xs truncate">{achievement.title}</p>
                      <div className="flex items-center gap-1">
                        <Badge variant="secondary" className="text-xs px-1 py-0">
                          +{achievement.auraPointsReward}
                        </Badge>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-4 text-muted-foreground">
                  <Award className="h-6 w-6 mx-auto mb-1 opacity-50" />
                  <p className="text-xs">No achievements yet</p>
                </div>
              )}
              
              <Button variant="outline" size="sm" className="w-full h-8 text-xs">
                View All
              </Button>
            </CardContent>
          </Card>
        </motion.div>

        {/* Compact Weekly Progress */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-base">
                <TrendingUp className="h-4 w-4" />
                This Week
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {/* Compact weekly data */}
              <div className="space-y-1.5">
                {['Mon', 'Tue', 'Wed', 'Thu', 'Fri'].map((day, index) => (
                  <div key={day} className="flex items-center gap-2">
                    <span className="text-xs text-muted-foreground w-6">{day}</span>
                    <div className="flex-1">
                      <Progress 
                        value={Math.random() * 100} 
                        className="h-1.5"
                      />
                    </div>
                    <span className="text-xs font-medium w-6 text-right">
                      {Math.floor(Math.random() * 60)}m
                    </span>
                  </div>
                ))}
              </div>
              
              <div className="pt-2 border-t">
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-muted-foreground">Weekly Goal</span>
                  <span className="font-medium">75%</span>
                </div>
                <Progress value={75} className="h-1.5" />
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Compact Mini Leaderboard */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
        >
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-base">
                <Users className="h-4 w-4" />
                Top Players
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-1.5">
              {leaderboard.slice(0, 4).map((entry, index) => (
                <div
                  key={entry.userId}
                  className={cn(
                    "flex items-center gap-2 p-1.5 rounded",
                    entry.userId === userStats.userId && "bg-blue-50 ring-1 ring-blue-200"
                  )}
                >
                  <div className={cn(
                    "flex items-center justify-center w-5 h-5 rounded-full text-xs font-bold",
                    index === 0 && "bg-yellow-100 text-yellow-800",
                    index === 1 && "bg-gray-100 text-gray-600",
                    index === 2 && "bg-orange-100 text-orange-800",
                    index > 2 && "bg-muted text-muted-foreground"
                  )}>
                    {index + 1}
                  </div>
                  
                  <Avatar className="h-5 w-5">
                    <AvatarImage src={entry.avatar} />
                    <AvatarFallback className="text-xs">
                      {entry.userName.slice(0, 1).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium truncate">
                      {entry.userName}
                      {entry.userId === userStats.userId && " (You)"}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {entry.auraPoints} pts
                    </p>
                  </div>
                </div>
              ))}
              
              <Button variant="outline" size="sm" className="w-full h-8 text-xs">
                View All
              </Button>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  )
}
