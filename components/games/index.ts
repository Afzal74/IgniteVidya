// Export all game components
export { ClassSelection } from "./class-selection"
export { SubjectSelection } from "./subject-selection"
export { GameCard } from "./game-card"
export { UserDashboard } from "./user-dashboard"

// Re-export types and data for convenience
export type { 
  ClassLevel, 
  ClassData, 
  GameContent, 
  UserStats, 
  Achievement, 
  LeaderboardEntry 
} from "@/lib/types/games"

export { 
  gameClassData, 
  sampleAchievements, 
  sampleUserData 
} from "@/lib/data/games-data"
