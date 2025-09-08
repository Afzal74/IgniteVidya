"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { 
  Brain, 
  TrendingUp, 
  BookOpen, 
  Target, 
  Trophy, 
  Clock, 
  Star,
  Users,
  Award,
  Calendar,
  BarChart3,
  PlayCircle,
  CheckCircle,
  AlertCircle,
  Flame,
  Zap,
  Crown,
  Shield,
  Rocket,
  Activity,
  PieChart,
  LineChart,
  ArrowUp,
  ArrowDown,
  Medal,
  Sparkles,
  ChevronRight,
  Eye,
  ChevronUp,
  ChevronDown,
  Timer,
  Gauge
} from "lucide-react"

interface StudentProgress {
  subject: string
  completedLessons: number
  totalLessons: number
  averageScore: number
  lastActivity: string
  grade: string
  trend: 'up' | 'down' | 'stable'
  weeklyHours: number
  difficulty: 'beginner' | 'intermediate' | 'advanced'
}

interface QuizResult {
  id: string
  title: string
  subject: string
  score: number
  totalQuestions: number
  date: string
  grade: string
  timeSpent: number
  difficulty: 'easy' | 'medium' | 'hard'
}

interface Achievement {
  id: string
  title: string
  description: string
  icon: string
  earnedDate: string
  points: number
  rarity: 'common' | 'rare' | 'epic' | 'legendary'
}

interface LeaderboardEntry {
  id: string
  name: string
  points: number
  level: number
  avatar: string
  rank: number
  isCurrentUser?: boolean
}

interface LevelInfo {
  currentLevel: number
  currentXP: number
  nextLevelXP: number
  levelProgress: number
  title: string
  benefits: string[]
}

export default function DashboardPage() {
  const [userType, setUserType] = useState("student")
  const [currentGrade, setCurrentGrade] = useState("6")
  const [progress, setProgress] = useState<StudentProgress[]>([])
  const [recentQuizzes, setRecentQuizzes] = useState<QuizResult[]>([])
  const [achievements, setAchievements] = useState<Achievement[]>([])
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([])
  const [levelInfo, setLevelInfo] = useState<LevelInfo>({
    currentLevel: 1,
    currentXP: 0,
    nextLevelXP: 100,
    levelProgress: 0,
    title: 'Novice Scholar',
    benefits: []
  })
  const [activeTab, setActiveTab] = useState('overview')
  const [streakCount, setStreakCount] = useState(0)
  const [overallStats, setOverallStats] = useState({
    totalLessons: 0,
    completedLessons: 0,
    averageScore: 0,
    totalQuizzes: 0,
    totalPoints: 0,
    weeklyGoal: 100,
    weeklyProgress: 0,
    studyStreak: 0,
    rank: 0,
    totalStudents: 0
  })

  // Enhanced sample data
  useEffect(() => {
    const sampleProgress: StudentProgress[] = [
      {
        subject: "Mathematics",
        completedLessons: 12,
        totalLessons: 15,
        averageScore: 85,
        lastActivity: "2 hours ago",
        grade: "6",
        trend: 'up',
        weeklyHours: 4.5,
        difficulty: 'intermediate'
      },
      {
        subject: "Physics",
        completedLessons: 8,
        totalLessons: 12,
        averageScore: 78,
        lastActivity: "1 day ago",
        grade: "6",
        trend: 'stable',
        weeklyHours: 3.2,
        difficulty: 'intermediate'
      },
      {
        subject: "Chemistry",
        completedLessons: 10,
        totalLessons: 10,
        averageScore: 92,
        lastActivity: "3 hours ago",
        grade: "6",
        trend: 'up',
        weeklyHours: 5.1,
        difficulty: 'advanced'
      },
      {
        subject: "Computer Science",
        completedLessons: 6,
        totalLessons: 14,
        averageScore: 88,
        lastActivity: "5 hours ago",
        grade: "6",
        trend: 'up',
        weeklyHours: 6.8,
        difficulty: 'advanced'
      }
    ]

    const sampleQuizzes: QuizResult[] = [
      {
        id: "1",
        title: "Advanced Calculus",
        subject: "Mathematics",
        score: 8,
        totalQuestions: 10,
        date: "2024-01-15",
        grade: "6",
        timeSpent: 25,
        difficulty: 'hard'
      },
      {
        id: "2",
        title: "Quantum Mechanics Basics",
        subject: "Physics",
        score: 7,
        totalQuestions: 8,
        date: "2024-01-12",
        grade: "6",
        timeSpent: 18,
        difficulty: 'medium'
      },
      {
        id: "3",
        title: "Organic Chemistry",
        subject: "Chemistry",
        score: 9,
        totalQuestions: 10,
        date: "2024-01-10",
        grade: "6",
        timeSpent: 22,
        difficulty: 'hard'
      },
      {
        id: "4",
        title: "Data Structures",
        subject: "Computer Science",
        score: 10,
        totalQuestions: 12,
        date: "2024-01-08",
        grade: "6",
        timeSpent: 30,
        difficulty: 'hard'
      }
    ]

    const sampleAchievements: Achievement[] = [
      {
        id: "1",
        title: "Quiz Master",
        description: "Completed 50 quizzes with 80%+ average",
        icon: "🎯",
        earnedDate: "2024-01-10",
        points: 150,
        rarity: 'epic'
      },
      {
        id: "2",
        title: "Math Genius",
        description: "Perfect scores in 10 consecutive math quizzes",
        icon: "🧮",
        earnedDate: "2024-01-15",
        points: 200,
        rarity: 'legendary'
      },
      {
        id: "3",
        title: "Speed Runner",
        description: "Complete quiz in under 5 minutes",
        icon: "⚡",
        earnedDate: "2024-01-12",
        points: 75,
        rarity: 'rare'
      },
      {
        id: "4",
        title: "Knowledge Seeker",
        description: "Study for 7 consecutive days",
        icon: "🔍",
        earnedDate: "2024-01-08",
        points: 100,
        rarity: 'epic'
      },
      {
        id: "5",
        title: "First Steps",
        description: "Complete your first lesson",
        icon: "👶",
        earnedDate: "2024-01-01",
        points: 25,
        rarity: 'common'
      }
    ]

    const sampleLeaderboard: LeaderboardEntry[] = [
      { id: '1', name: 'Alex Chen', points: 2850, level: 12, avatar: '👨‍🎓', rank: 1 },
      { id: '2', name: 'Sarah Kim', points: 2640, level: 11, avatar: '👩‍🎓', rank: 2 },
      { id: '3', name: 'You', points: 2420, level: 10, avatar: '🎯', rank: 3, isCurrentUser: true },
      { id: '4', name: 'Mike Johnson', points: 2180, level: 9, avatar: '👨‍💻', rank: 4 },
      { id: '5', name: 'Emma Davis', points: 1950, level: 9, avatar: '👩‍🔬', rank: 5 },
      { id: '6', name: 'David Wilson', points: 1820, level: 8, avatar: '👨‍🏫', rank: 6 },
      { id: '7', name: 'Lisa Brown', points: 1650, level: 8, avatar: '👩‍💼', rank: 7 },
      { id: '8', name: 'James Taylor', points: 1480, level: 7, avatar: '👨‍🎨', rank: 8 }
    ]

    const levelData: LevelInfo = {
      currentLevel: 10,
      currentXP: 2420,
      nextLevelXP: 2500,
      levelProgress: (2420 / 2500) * 100,
      title: 'Advanced Scholar',
      benefits: ['Access to advanced courses', 'Priority support', 'Exclusive study materials']
    }

    setProgress(sampleProgress)
    setRecentQuizzes(sampleQuizzes)
    setAchievements(sampleAchievements)
    setLeaderboard(sampleLeaderboard)
    setLevelInfo(levelData)
    setStreakCount(7)

    // Calculate comprehensive stats
    const totalLessons = sampleProgress.reduce((sum, p) => sum + p.totalLessons, 0)
    const completedLessons = sampleProgress.reduce((sum, p) => sum + p.completedLessons, 0)
    const averageScore = sampleProgress.reduce((sum, p) => sum + p.averageScore, 0) / sampleProgress.length
    const totalQuizzes = sampleQuizzes.length
    const totalPoints = sampleAchievements.reduce((sum, a) => sum + a.points, 0)
    const weeklyHours = sampleProgress.reduce((sum, p) => sum + p.weeklyHours, 0)

    setOverallStats({
      totalLessons,
      completedLessons,
      averageScore,
      totalQuizzes,
      totalPoints,
      weeklyGoal: 100,
      weeklyProgress: (weeklyHours / 20) * 100,
      studyStreak: 7,
      rank: 3,
      totalStudents: 1247
    })
  }, [])

  const getGradeColor = (score: number) => {
    if (score >= 95) return "text-emerald-600 dark:text-emerald-400"
    if (score >= 90) return "text-green-600 dark:text-green-400"
    if (score >= 85) return "text-blue-600 dark:text-blue-400"
    if (score >= 80) return "text-cyan-600 dark:text-cyan-400"
    if (score >= 75) return "text-yellow-600 dark:text-yellow-400"
    if (score >= 70) return "text-orange-600 dark:text-orange-400"
    return "text-red-600 dark:text-red-400"
  }

  const getProgressColor = (percentage: number) => {
    if (percentage >= 90) return "bg-emerald-500"
    if (percentage >= 80) return "bg-green-500"
    if (percentage >= 70) return "bg-blue-500"
    if (percentage >= 60) return "bg-cyan-500"
    if (percentage >= 50) return "bg-yellow-500"
    if (percentage >= 40) return "bg-orange-500"
    return "text-red-500"
  }

  const getRarityColor = (rarity: string) => {
    switch (rarity) {
      case 'legendary': return 'from-yellow-400 to-orange-500'
      case 'epic': return 'from-purple-400 to-pink-500'
      case 'rare': return 'from-blue-400 to-cyan-500'
      case 'common': return 'from-gray-400 to-gray-500'
      default: return 'from-gray-400 to-gray-500'
    }
  }

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'up': return <ArrowUp className="h-4 w-4 text-green-500" />
      case 'down': return <ArrowDown className="h-4 w-4 text-red-500" />
      default: return <Activity className="h-4 w-4 text-gray-500" />
    }
  }

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'hard': return 'text-red-600 dark:text-red-400'
      case 'medium': return 'text-yellow-600 dark:text-yellow-400'
      case 'easy': return 'text-green-600 dark:text-green-400'
      default: return 'text-gray-600 dark:text-gray-400'
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-gray-900 to-black p-4 pt-16">
      <div className="max-w-[1600px] mx-auto">
        {/* Desktop Environment */}
        <div className="relative">
          {/* Modern Monitor Container */}
          <div className="relative bg-gradient-to-b from-gray-800 to-gray-900 p-3 rounded-t-3xl shadow-2xl">
            {/* Monitor Brand Strip */}
            <div className="absolute top-1 left-1/2 transform -translate-x-1/2">
              <div className="bg-gray-700 px-4 py-1 rounded-full">
                <span className="text-xs text-gray-300 font-mono tracking-wider">VTU QUANTUM DISPLAY</span>
              </div>
            </div>
            
            {/* Screen Bezel */}
            <div className="bg-black p-4 rounded-2xl mt-6 relative overflow-hidden shadow-inner">
          {/* Screen Reflection Effect */}
          <div className="absolute inset-0 bg-gradient-to-br from-white/5 via-transparent to-transparent rounded-2xl -z-30"></div>
              
              {/* Active Screen */}
              <div className="relative bg-gray-900 rounded-xl overflow-hidden h-[75vh] border border-gray-700/50 shadow-2xl">
              {/* Screen Content Container */}
              <div className="relative h-full p-4 overflow-y-auto">
                {/* Screen Glow Effects */}
                <div className="absolute inset-0 bg-gradient-to-br from-blue-500/8 via-transparent to-purple-500/8 pointer-events-none rounded-xl -z-10"></div>
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-cyan-400/30 to-transparent -z-10"></div>
                
                {/* Main Content Wrapper with proper z-index */}
                <div className="relative z-10">
        {/* Professional Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mb-6"
        >
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-2xl font-bold text-white mb-1">
                Hello, Scholar! 👋
              </h1>
              <p className="text-gray-400 text-sm">
                Here is your academic progress
              </p>
            </div>
            <div className="text-right">
              <div className="text-sm text-gray-400 mb-1">Current Grade</div>
              <Badge className="bg-blue-600 text-white text-lg px-3 py-1">
                Grade {currentGrade}
              </Badge>
            </div>
          </div>
        </motion.div>

        {/* Navigation Tabs */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="mb-4"
        >
          <div className="flex space-x-1 bg-gray-800 border border-gray-700 p-1 rounded-lg">
            {[
              { id: 'overview', label: 'Overview', icon: BarChart3 },
              { id: 'analytics', label: 'Analytics', icon: PieChart },
              { id: 'leaderboard', label: 'Leaderboard', icon: Trophy },
              { id: 'achievements', label: 'Achievements', icon: Award }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                  activeTab === tab.id
                    ? 'bg-blue-600 text-white shadow-sm'
                    : 'text-gray-400 hover:text-white hover:bg-gray-700'
                }`}
              >
                <tab.icon className="h-4 w-4" />
                {tab.label}
              </button>
            ))}
          </div>
        </motion.div>

        {/* Dynamic Content Based on Active Tab */}
        <AnimatePresence mode="wait">
          {activeTab === 'overview' && (
            <motion.div
              key="overview"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
            >
        {/* Compact Stats Grid */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-4">
                {/* Academic Performance */}
                <div className="bg-gray-800/90 backdrop-blur-sm rounded-lg p-3 border border-gray-600/50">
                  <div className="text-center">
                    <div className="relative w-16 h-16 mx-auto mb-2">
                      <svg className="w-16 h-16 transform -rotate-90" viewBox="0 0 36 36">
                        <path className="text-gray-700" stroke="currentColor" strokeWidth="2" fill="none" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
                        <path className="text-green-400" stroke="currentColor" strokeWidth="2" strokeLinecap="round" fill="none" strokeDasharray={`${overallStats.averageScore * 0.628}, 100`} d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
                      </svg>
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div className="text-lg font-bold text-white">{overallStats.averageScore.toFixed(0)}</div>
                      </div>
                    </div>
                    <div className="text-xs text-gray-300">Avg Score</div>
                  </div>
                </div>

                {/* Lessons Progress */}
                <div className="bg-gray-800/90 backdrop-blur-sm rounded-lg p-3 border border-gray-600/50">
                  <div className="flex items-center justify-between mb-1">
                    <BookOpen className="h-4 w-4 text-blue-400" />
                    <TrendingUp className="h-3 w-3 text-green-400" />
                  </div>
                  <div className="text-lg font-bold text-white">
                    {overallStats.completedLessons}<span className="text-gray-400 text-sm">/{overallStats.totalLessons}</span>
                  </div>
                  <div className="text-xs text-gray-300">Lessons</div>
                  <div className="w-full bg-gray-700 rounded-full h-1 mt-1">
                    <div className="bg-blue-500 h-1 rounded-full" style={{ width: `${(overallStats.completedLessons / overallStats.totalLessons) * 100}%` }} />
                  </div>
                </div>

                {/* Study Streak */}
                <div className="bg-gray-800/90 backdrop-blur-sm rounded-lg p-3 border border-gray-600/50">
                  <div className="flex items-center justify-between mb-1">
                    <Flame className="h-4 w-4 text-orange-400" />
                    <span className="text-xs text-green-400">+2</span>
                  </div>
                  <div className="text-lg font-bold text-white">{streakCount}</div>
                  <div className="text-xs text-gray-300">Day Streak</div>
                </div>

                {/* Class Rank */}
                <div className="bg-gray-800/90 backdrop-blur-sm rounded-lg p-3 border border-gray-600/50">
                  <div className="flex items-center justify-between mb-1">
                    <Crown className="h-4 w-4 text-yellow-400" />
                    <ArrowUp className="h-3 w-3 text-green-400" />
                  </div>
                  <div className="text-lg font-bold text-white">#{overallStats.rank}</div>
                  <div className="text-xs text-gray-300">Rank</div>
                </div>
              </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {/* Subject Progress */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.5 }}
          >
            <div className="bg-gray-800/90 backdrop-blur-sm rounded-lg p-4 border border-gray-600/50">
              <h2 className="text-lg font-bold text-white mb-3 flex items-center gap-2">
                <BarChart3 className="h-4 w-4 text-blue-400" />
                Subject Progress
              </h2>
              
              <div className="space-y-2">
                {progress.map((subject, index) => {
                  const progressPercentage = (subject.completedLessons / subject.totalLessons) * 100
                  return (
                    <div key={subject.subject} className="p-2 bg-gray-700/50 rounded border border-gray-600/30">
                      <div className="flex items-center justify-between mb-1">
                        <h3 className="font-medium text-white text-sm">{subject.subject}</h3>
                        <div className="flex items-center gap-2">
                          <span className={`text-xs font-medium ${getGradeColor(subject.averageScore)}`}>
                            {subject.averageScore}%
                          </span>
                          <Badge variant="outline" className="text-xs">
                            {subject.completedLessons}/{subject.totalLessons}
                          </Badge>
                        </div>
                      </div>
                      <Progress value={progressPercentage} className="h-1.5" />
                    </div>
                  )
                })}
              </div>
            </div>
          </motion.div>

          {/* Recent Activity */}
          <div className="space-y-3">
            {/* Recent Quizzes */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.6 }}
            >
              <div className="bg-gray-800/90 backdrop-blur-sm rounded-lg p-3 border border-gray-600/50">
                <h2 className="text-md font-bold text-white mb-2 flex items-center gap-2">
                  <Clock className="h-4 w-4 text-blue-400" />
                  Recent Quizzes
                </h2>
                
                <div className="space-y-1.5">
                  {recentQuizzes.slice(0, 3).map((quiz, index) => (
                    <div key={quiz.id} className="p-2 bg-gray-700/50 rounded border border-gray-600/30">
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="font-medium text-white text-xs">{quiz.title}</h4>
                          <div className="text-xs text-gray-400">{quiz.subject}</div>
                        </div>
                        <span className={`text-xs font-bold ${getGradeColor((quiz.score / quiz.totalQuestions) * 100)}`}>
                          {quiz.score}/{quiz.totalQuestions}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>

            {/* Top Achievements */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.7 }}
            >
              <div className="bg-gray-800/90 backdrop-blur-sm rounded-lg p-3 border border-gray-600/50">
                <h2 className="text-md font-bold text-white mb-2 flex items-center gap-2">
                  <Award className="h-4 w-4 text-yellow-400" />
                  Top Achievements
                </h2>
                
                <div className="space-y-1.5">
                  {achievements.slice(0, 3).map((achievement, index) => (
                    <div key={achievement.id} className="p-2 bg-gradient-to-r from-yellow-900/20 to-orange-900/20 rounded border border-yellow-600/30">
                      <div className="flex items-center gap-2">
                        <div className="text-lg">{achievement.icon}</div>
                        <div className="flex-1">
                          <h4 className="font-medium text-white text-xs">{achievement.title}</h4>
                          <div className="text-xs text-yellow-400">+{achievement.points} XP</div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          </div>
        </div>

              {/* Quick Actions for Overview Tab */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: 0.8 }}
                className="mt-3"
              >
                <div className="bg-gray-800/90 backdrop-blur-sm rounded-lg p-3 border border-gray-600/50">
                  <h2 className="text-md font-bold text-white mb-3">Quick Actions</h2>
                  
                  <div className="grid grid-cols-3 gap-2">
                    <Button size="sm" className="bg-blue-600 hover:bg-blue-700 text-white p-2 h-auto flex-col">
                      <PlayCircle className="h-4 w-4 mb-1" />
                      <div className="text-xs">Continue</div>
                    </Button>
                    
                    <Button size="sm" className="bg-purple-600 hover:bg-purple-700 text-white p-2 h-auto flex-col">
                      <Target className="h-4 w-4 mb-1" />
                      <div className="text-xs">Quiz</div>
                    </Button>
                    
                    <Button size="sm" className="bg-green-600 hover:bg-green-700 text-white p-2 h-auto flex-col">
                      <BookOpen className="h-4 w-4 mb-1" />
                      <div className="text-xs">Notes</div>
                    </Button>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          )}

          {activeTab === 'leaderboard' && (
            <motion.div
              key="leaderboard"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
            >
              <Card className="p-6 shadow-xl border-0 bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
                  <Trophy className="h-6 w-6" />
                  Class Leaderboard
                  <Badge className="bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400 ml-2">
                    Live
                  </Badge>
                </h2>
                
                <div className="space-y-3">
                  {leaderboard.map((student, index) => (
                    <motion.div
                      key={student.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.3, delay: index * 0.05 }}
                      className={`p-4 rounded-lg border-2 transition-all ${
                        student.isCurrentUser
                          ? 'bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 border-blue-300 dark:border-blue-700'
                          : 'bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                      }`}
                    >
                      <div className="flex items-center gap-4">
                        <div className={`flex items-center justify-center w-8 h-8 rounded-full font-bold text-sm ${
                          student.rank === 1 ? 'bg-yellow-500 text-white' :
                          student.rank === 2 ? 'bg-gray-400 text-white' :
                          student.rank === 3 ? 'bg-amber-600 text-white' :
                          'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
                        }`}>
                          {student.rank <= 3 ? (
                            student.rank === 1 ? '🥇' :
                            student.rank === 2 ? '🥈' : '🥉'
                          ) : (
                            student.rank
                          )}
                        </div>
                        
                        <div className="text-2xl">{student.avatar}</div>
                        
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <h3 className={`font-semibold ${
                              student.isCurrentUser ? 'text-blue-700 dark:text-blue-300' : 'text-gray-900 dark:text-white'
                            }`}>
                              {student.name}
                              {student.isCurrentUser && <span className="text-xs ml-1">(You)</span>}
                            </h3>
                            <Badge className="bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-400">
                              Level {student.level}
                            </Badge>
                          </div>
                          <div className="flex items-center gap-4 mt-1">
                            <span className="text-sm text-gray-600 dark:text-gray-400">
                              {student.points.toLocaleString()} XP
                            </span>
                            {student.rank <= 3 && (
                              <Badge className={`text-xs ${
                                student.rank === 1 ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400' :
                                student.rank === 2 ? 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400' :
                                'bg-amber-100 text-amber-800 dark:bg-amber-900/20 dark:text-amber-400'
                              }`}>
                                {student.rank === 1 ? 'Champion' : student.rank === 2 ? 'Runner-up' : 'Third Place'}
                              </Badge>
                            )}
                          </div>
                        </div>
                        
                        <div className="text-right">
                          <div className={`text-2xl font-bold ${
                            student.isCurrentUser ? 'text-blue-600 dark:text-blue-400' : 'text-gray-900 dark:text-white'
                          }`}>
                            #{student.rank}
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
                
                <div className="mt-6 p-4 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 rounded-lg">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
                        Your Progress This Week
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-500">
                        Keep studying to climb higher!
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <TrendingUp className="h-5 w-5 text-green-500" />
                      <span className="text-sm font-bold text-green-600 dark:text-green-400">
                        +2 positions
                      </span>
                    </div>
                  </div>
                </div>
              </Card>
            </motion.div>
          )}

          {activeTab === 'analytics' && (
            <motion.div
              key="analytics"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
            >
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
                {/* Performance Chart */}
                <Card className="p-6 shadow-xl border-0 bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm">
                  <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                    <LineChart className="h-5 w-5" />
                    Performance Trends
                  </h3>
                  
                  <div className="space-y-4">
                    {progress.map((subject, index) => (
                      <div key={subject.subject} className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                            {subject.subject}
                          </span>
                          <div className="flex items-center gap-2">
                            {getTrendIcon(subject.trend)}
                            <span className={`text-sm font-bold ${getGradeColor(subject.averageScore)}`}>
                              {subject.averageScore}%
                            </span>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="flex-1 bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                            <div 
                              className={`h-2 rounded-full ${getProgressColor(subject.averageScore)}`}
                              style={{ width: `${subject.averageScore}%` }}
                            />
                          </div>
                          <Badge className={`text-xs ${subject.difficulty === 'advanced' ? 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400' : subject.difficulty === 'intermediate' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400' : 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400'}`}>
                            {subject.difficulty}
                          </Badge>
                        </div>
                        <div className="text-xs text-gray-500 dark:text-gray-500">
                          Weekly study time: {subject.weeklyHours}h
                        </div>
                      </div>
                    ))}
                  </div>
                </Card>

                {/* Study Habits */}
                <Card className="p-6 shadow-xl border-0 bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm">
                  <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                    <Gauge className="h-5 w-5" />
                    Study Insights
                  </h3>
                  
                  <div className="space-y-4">
                    <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
                      <div className="flex items-center gap-3">
                        <CheckCircle className="h-5 w-5 text-green-600 dark:text-green-400" />
                        <div>
                          <p className="text-sm font-medium text-green-800 dark:text-green-300">
                            Consistent Learner
                          </p>
                          <p className="text-xs text-green-600 dark:text-green-500">
                            7-day study streak active
                          </p>
                        </div>
                      </div>
                    </div>
                    
                    <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
                      <div className="flex items-center gap-3">
                        <Brain className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                        <div>
                          <p className="text-sm font-medium text-blue-800 dark:text-blue-300">
                            Best Learning Time
                          </p>
                          <p className="text-xs text-blue-600 dark:text-blue-500">
                            7:00 PM - 9:00 PM (85% accuracy)
                          </p>
                        </div>
                      </div>
                    </div>
                    
                    <div className="p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg border border-yellow-200 dark:border-yellow-800">
                      <div className="flex items-center gap-3">
                        <Target className="h-5 w-5 text-yellow-600 dark:text-yellow-400" />
                        <div>
                          <p className="text-sm font-medium text-yellow-800 dark:text-yellow-300">
                            Improvement Area
                          </p>
                          <p className="text-xs text-yellow-600 dark:text-yellow-500">
                            Focus more on Physics concepts
                          </p>
                        </div>
                      </div>
                    </div>
                    
                    <div className="p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg border border-purple-200 dark:border-purple-800">
                      <div className="flex items-center gap-3">
                        <Rocket className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                        <div>
                          <p className="text-sm font-medium text-purple-800 dark:text-purple-300">
                            Next Milestone
                          </p>
                          <p className="text-xs text-purple-600 dark:text-purple-500">
                            80 XP to reach Level 11
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </Card>
              </div>

              {/* Recent Quiz Performance */}
              <Card className="p-6 shadow-xl border-0 bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm">
                <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                  <PieChart className="h-5 w-5" />
                  Recent Quiz Performance
                </h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  {recentQuizzes.map((quiz, index) => (
                    <div key={quiz.id} className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-medium text-gray-900 dark:text-white text-sm">
                          {quiz.subject}
                        </h4>
                        <Badge className={`text-xs ${getDifficultyColor(quiz.difficulty)}`}>
                          {quiz.difficulty}
                        </Badge>
                      </div>
                      
                      <div className="mb-3">
                        <div className={`text-2xl font-bold ${getGradeColor((quiz.score / quiz.totalQuestions) * 100)}`}>
                          {((quiz.score / quiz.totalQuestions) * 100).toFixed(0)}%
                        </div>
                        <div className="text-xs text-gray-500 dark:text-gray-500">
                          {quiz.score}/{quiz.totalQuestions} correct
                        </div>
                      </div>
                      
                      <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-500">
                        <div className="flex items-center gap-1">
                          <Timer className="h-3 w-3" />
                          {quiz.timeSpent}m
                        </div>
                        <div>{quiz.date}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </Card>
            </motion.div>
          )}

          {activeTab === 'achievements' && (
            <motion.div
              key="achievements"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
            >
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
                {achievements.map((achievement, index) => (
                  <motion.div
                    key={achievement.id}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.3, delay: index * 0.1 }}
                  >
                    <Card className={`p-6 shadow-xl border-0 bg-gradient-to-br ${getRarityColor(achievement.rarity)} text-white relative overflow-hidden`}>
                      <div className="absolute top-2 right-2">
                        <Badge className={`${
                          achievement.rarity === 'legendary' ? 'bg-yellow-500 text-yellow-900' :
                          achievement.rarity === 'epic' ? 'bg-purple-500 text-purple-900' :
                          achievement.rarity === 'rare' ? 'bg-blue-500 text-blue-900' :
                          'bg-gray-500 text-gray-900'
                        } capitalize text-xs`}>
                          {achievement.rarity}
                        </Badge>
                      </div>
                      
                      <div className="text-center">
                        <div className="text-4xl mb-3">{achievement.icon}</div>
                        <h3 className="text-lg font-bold mb-2">
                          {achievement.title}
                        </h3>
                        <p className="text-sm text-white/90 mb-4">
                          {achievement.description}
                        </p>
                        
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <Zap className="h-4 w-4" />
                            <span className="font-bold">+{achievement.points} XP</span>
                          </div>
                          <div className="text-xs text-white/75">
                            {achievement.earnedDate}
                          </div>
                        </div>
                      </div>
                      
                      {/* Sparkle effect for legendary achievements */}
                      {achievement.rarity === 'legendary' && (
                        <div className="absolute inset-0 pointer-events-none">
                          {[...Array(6)].map((_, i) => (
                            <motion.div
                              key={i}
                              className="absolute w-1 h-1 bg-white rounded-full"
                              style={{
                                left: `${20 + i * 15}%`,
                                top: `${20 + (i % 2) * 60}%`,
                              }}
                              animate={{
                                scale: [0, 1, 0],
                                opacity: [0, 1, 0],
                              }}
                              transition={{
                                duration: 2,
                                repeat: Infinity,
                                delay: i * 0.3,
                              }}
                            />
                          ))}
                        </div>
                      )}
                    </Card>
                  </motion.div>
                ))}
                
                {/* Coming Soon Achievements */}
                <Card className="p-6 shadow-xl border-2 border-dashed border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-800">
                  <div className="text-center">
                    <div className="text-4xl mb-3 opacity-50">🔒</div>
                    <h3 className="text-lg font-bold mb-2 text-gray-600 dark:text-gray-400">
                      Coming Soon
                    </h3>
                    <p className="text-sm text-gray-500 dark:text-gray-500 mb-4">
                      More achievements to unlock!
                    </p>
                    <div className="text-xs text-gray-400 dark:text-gray-600">
                      Keep studying to unlock new badges
                    </div>
                  </div>
                </Card>
              </div>
              
              {/* Achievement Progress */}
              <Card className="p-6 shadow-xl border-0 bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm">
                <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                  <Star className="h-5 w-5" />
                  Achievement Progress
                </h3>
                
                <div className="space-y-4">
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                        Quiz Completionist (7/10 quizzes)
                      </span>
                      <span className="text-xs text-gray-500 dark:text-gray-500">70%</span>
                    </div>
                    <Progress value={70} className="h-2" />
                  </div>
                  
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                        Study Warrior (25/30 days)
                      </span>
                      <span className="text-xs text-gray-500 dark:text-gray-500">83%</span>
                    </div>
                    <Progress value={83} className="h-2" />
                  </div>
                  
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                        Perfect Scholar (2/5 perfect scores)
                      </span>
                      <span className="text-xs text-gray-500 dark:text-gray-500">40%</span>
                    </div>
                    <Progress value={40} className="h-2" />
                  </div>
                </div>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>
                </div>
                
                {/* Screen Status Bar */}
                <div className="absolute bottom-0 left-0 right-0 h-8 bg-black/50 backdrop-blur-sm border-t border-gray-700/50 flex items-center justify-between px-4">
                  <div className="flex items-center gap-4">
                    {/* Power Status */}
                    <div className="flex items-center gap-1">
                      <motion.div 
                        className="w-1.5 h-1.5 bg-green-400 rounded-full"
                        animate={{ opacity: [0.5, 1, 0.5] }}
                        transition={{ duration: 2, repeat: Infinity }}
                      />
                      <span className="text-xs text-green-400 font-mono">ACTIVE</span>
                    </div>
                    
                    {/* Connection Status */}
                    <div className="flex items-center gap-1">
                      <div className="flex items-center gap-0.5">
                        {[1, 2, 3, 4].map((bar) => (
                          <motion.div
                            key={bar}
                            className="w-0.5 bg-blue-400 rounded-full"
                            style={{ height: `${bar * 1.5 + 2}px` }}
                            animate={{ opacity: [0.3, 1, 0.3] }}
                            transition={{ duration: 1.5, repeat: Infinity, delay: bar * 0.1 }}
                          />
                        ))}
                      </div>
                      <span className="text-xs text-blue-400 font-mono">100%</span>
                    </div>
                  </div>
                  
                  {/* System Info */}
                  <div className="flex items-center gap-4">
                    <span className="text-xs text-gray-400 font-mono">VTU-DASH v2.1</span>
                    <span className="text-xs text-cyan-400 font-mono">{new Date().toLocaleTimeString()}</span>
                  </div>
                </div>
                
                </div>
                {/* End Main Content Wrapper */}
                
                {/* Scan Lines Effect */}
                <div className="absolute inset-0 pointer-events-none overflow-hidden rounded-xl -z-20">
                  <motion.div
                    className="absolute inset-x-0 bg-gradient-to-b from-transparent via-cyan-400/10 to-transparent h-3 opacity-60"
                    animate={{ y: [-12, '85vh'] }}
                    transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
                  />
                </div>
                
                {/* Corner Highlights */}
                <div className="absolute top-0 left-0 w-20 h-20 bg-gradient-to-br from-white/10 to-transparent rounded-tl-xl pointer-events-none -z-20"></div>
                <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-bl from-white/5 to-transparent rounded-tr-xl pointer-events-none -z-20"></div>
              </div>
            </div>
          </div>
          
          {/* Monitor Stand and Base */}
          <div className="flex flex-col items-center">
            {/* Stand Neck */}
            <div className="w-6 h-12 bg-gradient-to-b from-gray-600 to-gray-700 rounded-b-lg shadow-lg"></div>
            
            {/* Stand Base */}
            <div className="w-48 h-6 bg-gradient-to-b from-gray-700 to-gray-800 rounded-full shadow-xl relative">
              {/* Base Details */}
              <div className="absolute inset-x-0 top-1 h-1 bg-gradient-to-r from-transparent via-gray-500 to-transparent rounded-full"></div>
              <div className="absolute bottom-1 left-1/2 transform -translate-x-1/2 w-16 h-1 bg-gray-600 rounded-full"></div>
            </div>
            
            {/* Brand Label on Base */}
            <div className="mt-2">
              <span className="text-xs text-gray-500 font-mono tracking-wider">QUANTUM SERIES</span>
            </div>
          </div>
          
          {/* Ambient Lighting Effects */}
          <div className="absolute -inset-8 bg-gradient-to-b from-blue-500/5 via-transparent to-purple-500/5 rounded-3xl pointer-events-none -z-40"></div>
          
          {/* Desktop Shadow */}
          <div className="absolute -bottom-4 left-1/2 transform -translate-x-1/2 w-96 h-8 bg-black/20 rounded-full blur-xl"></div>
        </div>
        
        {/* Custom Scrollbar Styles */}
        <style jsx global>{`
          .custom-scrollbar {
            scrollbar-width: thin;
            scrollbar-color: #374151 #1f2937;
          }
          .custom-scrollbar::-webkit-scrollbar {
            width: 8px;
          }
          .custom-scrollbar::-webkit-scrollbar-track {
            background: #1f2937;
            border-radius: 4px;
          }
          .custom-scrollbar::-webkit-scrollbar-thumb {
            background: #374151;
            border-radius: 4px;
            border: 1px solid #4b5563;
          }
          .custom-scrollbar::-webkit-scrollbar-thumb:hover {
            background: #4b5563;
          }
        `}</style>
      </div>
    </div>
  )
}
