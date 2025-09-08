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
      {/* User Profile Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <Card className="bg-gradient-to-br from-blue-500/10 to-purple-600/10 border-blue-200/50">
          <CardContent className="p-6">
            <div className="flex items-center gap-4 mb-6">
              <Avatar className="h-16 w-16 ring-4 ring-blue-100">
                <AvatarImage src="/placeholder-avatar.png" />
                <AvatarFallback className="text-xl font-bold bg-gradient-to-br from-blue-500 to-purple-600 text-white">
                  SL
                </AvatarFallback>
              </Avatar>
              
              <div className="flex-1">
                <h2 className="text-2xl font-bold">Student Learner</h2>
                <p className="text-muted-foreground">STEM Explorer • Level {userStats.level}</p>
                <div className="flex items-center gap-4 mt-2">
                  <Badge variant="secondary" className="bg-blue-100 text-blue-800">
                    <Zap className="h-3 w-3 mr-1" />
                    {userStats.totalAuraPoints} Aura Points
                  </Badge>
                  <Badge variant="secondary" className="bg-orange-100 text-orange-800">
                    <Flame className="h-3 w-3 mr-1" />
                    {userStats.currentStreak} day streak
                  </Badge>
                </div>
              </div>

              <div className="text-right">
                <div className="text-3xl font-bold text-blue-600 mb-1">
                  #{leaderboard.findIndex(entry => entry.userId === userStats.userId) + 1 || "?"}
                </div>
                <p className="text-sm text-muted-foreground">Rank</p>
              </div>
            </div>

            {/* Level Progress */}
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Level Progress</span>
                <span className="font-medium">
                  {userStats.experience} / {getXPForNextLevel(userStats.level)} XP
                </span>
              </div>
              <Progress value={getXPProgress()} className="h-2" />
              <p className="text-xs text-muted-foreground">
                {getXPForNextLevel(userStats.level) - userStats.experience} XP to next level
              </p>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Quick Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          {
            title: "Games Completed",
            value: userStats.gamesCompleted,
            icon: Target,
            color: "text-green-600",
            bgColor: "bg-green-100"
          },
          {
            title: "Time Spent",
            value: `${Math.floor(userStats.totalTimeSpent / 60)}h ${userStats.totalTimeSpent % 60}m`,
            icon: Clock,
            color: "text-blue-600",
            bgColor: "bg-blue-100"
          },
          {
            title: "Best Streak",
            value: `${userStats.longestStreak} days`,
            icon: Flame,
            color: "text-orange-600",
            bgColor: "bg-orange-100"
          },
          {
            title: "Achievements",
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
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className={cn("p-2 rounded-lg", stat.bgColor)}>
                    <stat.icon className={cn("h-4 w-4", stat.color)} />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">{stat.value}</p>
                    <p className="text-xs text-muted-foreground">{stat.title}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Achievements */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Award className="h-5 w-5" />
                Recent Achievements
              </CardTitle>
              <CardDescription>
                Your latest accomplishments
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {recentAchievements.length > 0 ? (
                recentAchievements.map((achievement) => (
                  <div
                    key={achievement.id}
                    className="flex items-center gap-3 p-3 bg-muted/30 rounded-lg"
                  >
                    <div className="text-2xl">{achievement.emoji}</div>
                    <div className="flex-1">
                      <p className="font-medium text-sm">{achievement.title}</p>
                      <p className="text-xs text-muted-foreground">
                        {achievement.description}
                      </p>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge variant="secondary" className="text-xs">
                          +{achievement.auraPointsReward} points
                        </Badge>
                        <span className="text-xs text-muted-foreground">
                          {achievement.unlockedAt?.toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-6 text-muted-foreground">
                  <Award className="h-8 w-8 mx-auto mb-2 opacity-50" />
                  <p className="text-sm">No achievements yet</p>
                  <p className="text-xs">Complete games to earn achievements!</p>
                </div>
              )}
              
              <Button variant="outline" size="sm" className="w-full">
                View All Achievements
              </Button>
            </CardContent>
          </Card>
        </motion.div>

        {/* Weekly Progress */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5" />
                This Week
              </CardTitle>
              <CardDescription>
                Your learning activity
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Mock weekly data */}
              <div className="space-y-3">
                {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((day, index) => (
                  <div key={day} className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground w-8">{day}</span>
                    <div className="flex-1 mx-3">
                      <Progress 
                        value={Math.random() * 100} 
                        className="h-2"
                      />
                    </div>
                    <span className="text-sm font-medium w-8 text-right">
                      {Math.floor(Math.random() * 60)}m
                    </span>
                  </div>
                ))}
              </div>
              
              <div className="pt-3 border-t">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Weekly Goal</span>
                  <span className="font-medium">180 minutes</span>
                </div>
                <Progress value={75} className="h-2 mt-2" />
                <p className="text-xs text-muted-foreground mt-1">
                  45 minutes to reach your goal!
                </p>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Mini Leaderboard */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
        >
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                Leaderboard
              </CardTitle>
              <CardDescription>
                Top performers this month
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {leaderboard.slice(0, 5).map((entry, index) => (
                <div
                  key={entry.userId}
                  className={cn(
                    "flex items-center gap-3 p-2 rounded-lg",
                    entry.userId === userStats.userId && "bg-blue-50 ring-2 ring-blue-200"
                  )}
                >
                  <div className={cn(
                    "flex items-center justify-center w-6 h-6 rounded-full text-xs font-bold",
                    index === 0 && "bg-yellow-100 text-yellow-800",
                    index === 1 && "bg-gray-100 text-gray-600",
                    index === 2 && "bg-orange-100 text-orange-800",
                    index > 2 && "bg-muted text-muted-foreground"
                  )}>
                    {index + 1}
                  </div>
                  
                  <Avatar className="h-6 w-6">
                    <AvatarImage src={entry.avatar} />
                    <AvatarFallback className="text-xs">
                      {entry.userName.slice(0, 2).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">
                      {entry.userName}
                      {entry.userId === userStats.userId && " (You)"}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {entry.auraPoints} points • {entry.gamesCompleted} games
                    </p>
                  </div>
                </div>
              ))}
              
              <Button variant="outline" size="sm" className="w-full">
                View Full Leaderboard
              </Button>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  )
}
