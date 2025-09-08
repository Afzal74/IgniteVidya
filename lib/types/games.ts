// Core data types for the gamified STEM learning platform

export type ClassLevel = "upper-primary" | "secondary" | "higher-secondary"
export type Subject = "mathematics" | "science" | "technology"
export type DifficultyLevel = "easy" | "medium" | "advanced"
export type GameType = "puzzle" | "simulation" | "quiz" | "construction" | "adventure" | "lab"

export interface GameContent {
  id: string
  title: string
  emoji: string
  description: string
  content: string[]
  gameType: GameType
  example?: string
  mission?: string
  challenge?: string
  implementation: string
  syllabusMatch: string[]
  realContext?: string
  localContext?: string
  difficultyLevel: DifficultyLevel
  estimatedTime: number // in minutes
  auraPoints: number
}

export interface Subject {
  id: string
  name: string
  emoji: string
  color: string
  games: GameContent[]
}

export interface ClassData {
  id: ClassLevel
  name: string
  subtitle: string
  grades: string[]
  subjects: Subject[]
  ageRange: string
  description: string
}

export interface UserProgress {
  userId: string
  gameId: string
  completed: boolean
  score?: number
  timeSpent: number
  attempts: number
  lastPlayed: Date
  bestScore?: number
  streak: number
}

export interface UserStats {
  userId: string
  totalAuraPoints: number
  gamesCompleted: number
  totalTimeSpent: number
  currentStreak: number
  longestStreak: number
  achievements: Achievement[]
  level: number
  experience: number
}

export interface Achievement {
  id: string
  title: string
  description: string
  emoji: string
  type: "completion" | "streak" | "score" | "time" | "special"
  requirement: number
  auraPointsReward: number
  unlockedAt?: Date
}

export interface LeaderboardEntry {
  userId: string
  userName: string
  avatar?: string
  auraPoints: number
  gamesCompleted: number
  rank: number
  classLevel: ClassLevel
  district?: string
}

export interface GameSession {
  id: string
  userId: string
  gameId: string
  startTime: Date
  endTime?: Date
  score?: number
  completed: boolean
  data: Record<string, any> // Game-specific progress data
}

// Offline data sync
export interface OfflineData {
  userId: string
  lastSyncTime: Date
  pendingSessions: GameSession[]
  cachedContent: {
    classData: ClassData[]
    userProgress: UserProgress[]
    userStats: UserStats
  }
}
