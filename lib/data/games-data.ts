import { ClassData, GameContent, Subject as SubjectInterface } from "../types/games"

// Upper Primary (Classes 6-7) - Foundation STEM
const upperPrimaryMathGames: GameContent[] = [
  {
    id: "number-detective",
    title: "Number Detective Adventures",
    emoji: "🧮",
    description: "Solve mysteries in Odisha villages using math problems",
    content: ["Number systems", "Basic algebra", "Fractions"],
    gameType: "adventure",
    example: "Help fisherman calculate catch using fractions at Chilika Lake",
    implementation: "Visual story-based problems with drag-drop answers",
    syllabusMatch: ["Unit 4 - Number system", "Unit 5 - Algebra"],
    difficultyLevel: "easy",
    estimatedTime: 25,
    auraPoints: 100,
    localContext: "Explore Odisha's fishing villages and lakes"
  },
  {
    id: "geometry-builder-odisha",
    title: "Geometry Builder Odisha",
    emoji: "📐",
    description: "Reconstruct Jagannath Temple using geometric shapes",
    content: ["Basic geometric concepts", "Triangles", "Quadrilaterals"],
    gameType: "construction",
    challenge: "Use symmetry to complete Konark Sun Temple patterns",
    implementation: "Puzzle-based construction with hint system",
    syllabusMatch: ["Unit 6 - Shapes and spatial relationship"],
    difficultyLevel: "easy",
    estimatedTime: 30,
    auraPoints: 120,
    localContext: "Learn geometry through Odisha's architectural heritage"
  },
  {
    id: "data-handler-village",
    title: "Data Handler Village",
    emoji: "📊",
    description: "Analyze village population data, crop yields, rainfall",
    content: ["Pictographs", "Bar graphs", "Pie charts"],
    gameType: "simulation",
    example: "Create graphs for local festival attendance",
    implementation: "Interactive graph creator with templates",
    syllabusMatch: ["Unit 7 - Data Handling and Patterns"],
    difficultyLevel: "easy",
    estimatedTime: 20,
    auraPoints: 90,
    localContext: "Use real Odisha village data for learning"
  }
]

const upperPrimaryScienceGames: GameContent[] = [
  {
    id: "matter-explorer-lab",
    title: "Matter Explorer Lab",
    emoji: "🔬",
    description: "Transform matter states to help Odisha farmers",
    content: ["States of matter", "Physical/chemical changes"],
    gameType: "lab",
    example: "Convert water to steam for rice processing",
    implementation: "Virtual lab with simple animations",
    syllabusMatch: ["Unit 8 - Matter, Force and Energy"],
    difficultyLevel: "easy",
    estimatedTime: 35,
    auraPoints: 130,
    localContext: "Agricultural processes in Odisha"
  },
  {
    id: "life-systems-detective",
    title: "Life Systems Detective",
    emoji: "🌱",
    description: "Journey through body systems as micro-explorer",
    content: ["Internal systems of human body"],
    gameType: "adventure",
    mission: "Help nutrients reach different organs",
    implementation: "Animated journey with quiz checkpoints",
    syllabusMatch: ["Unit 7 - Internal Systems of Human Body"],
    difficultyLevel: "easy",
    estimatedTime: 40,
    auraPoints: 150,
    localContext: "Understanding health and nutrition"
  }
]

// Secondary Education (Classes 8-10) - Applied STEM
const secondaryMathGames: GameContent[] = [
  {
    id: "engineering-challenge-odisha",
    title: "Engineering Challenge Odisha",
    emoji: "🏗",
    description: "Design infrastructure for Odisha smart villages",
    content: ["Commercial arithmetic", "Coordinate geometry"],
    gameType: "simulation",
    example: "Calculate materials for bridges, roads, schools",
    implementation: "Step-by-step calculator with 3D visualization",
    syllabusMatch: ["Madhyamika Bijaganita", "Madhyamika Jyamiti"],
    difficultyLevel: "medium",
    estimatedTime: 45,
    auraPoints: 200,
    localContext: "Infrastructure development in rural Odisha"
  },
  {
    id: "statistics-sports-arena",
    title: "Statistics Sports Arena",
    emoji: "📈",
    description: "Analyze performance of Odisha sports teams",
    content: ["Data analysis", "Probability", "Statistics"],
    gameType: "simulation",
    example: "Predict match outcomes using probability",
    implementation: "Interactive data dashboard with charts",
    syllabusMatch: ["Statistics and Probability"],
    realContext: "Use actual Odisha sports data",
    difficultyLevel: "medium",
    estimatedTime: 35,
    auraPoints: 180,
    localContext: "Odisha's sporting achievements and analysis"
  }
]

const secondaryScienceGames: GameContent[] = [
  {
    id: "physics-power-plant",
    title: "Physics Power Plant",
    emoji: "⚡",
    description: "Design renewable energy solutions for Odisha",
    content: ["Force", "Motion", "Electricity", "Light"],
    gameType: "simulation",
    challenge: "Calculate power generation for coastal wind farms",
    implementation: "Physics simulation with real calculations",
    syllabusMatch: ["Bhoutika Bigyana"],
    difficultyLevel: "medium",
    estimatedTime: 50,
    auraPoints: 220,
    localContext: "Odisha's renewable energy potential"
  },
  {
    id: "chemistry-lab-master",
    title: "Chemistry Lab Master",
    emoji: "🧪",
    description: "Test soil quality across Odisha districts",
    content: ["Chemical reactions", "Acids", "Bases", "Salts"],
    gameType: "lab",
    mission: "Recommend fertilizers based on chemical analysis",
    implementation: "Virtual chemistry lab with safety protocols",
    localContext: "Use actual Odisha soil composition data",
    syllabusMatch: ["Chemical Reactions and Analysis"],
    difficultyLevel: "medium",
    estimatedTime: 40,
    auraPoints: 190,
    realContext: "Agricultural chemistry in Odisha"
  },
  {
    id: "biodiversity-guardian",
    title: "Biodiversity Guardian",
    emoji: "🌿",
    description: "Protect Odisha's unique ecosystems",
    content: ["Life processes", "Natural resources", "Environment"],
    gameType: "simulation",
    challenge: "Chilika Lake conservation, Simlipal forest protection",
    implementation: "Ecosystem simulation with cause-effect scenarios",
    realContext: "Connect to actual conservation efforts",
    syllabusMatch: ["Environmental Science and Conservation"],
    difficultyLevel: "medium",
    estimatedTime: 45,
    auraPoints: 200,
    localContext: "Odisha's biodiversity hotspots"
  }
]

const secondaryTechGames: GameContent[] = [
  {
    id: "code-for-odisha",
    title: "Code for Odisha",
    emoji: "💻",
    description: "Create apps to solve local problems",
    content: ["Basic programming", "Logical thinking"],
    gameType: "construction",
    example: "Bus tracker, weather alerts, rice price monitor",
    implementation: "Visual programming interface (Scratch-like)",
    syllabusMatch: ["Introduction to Programming"],
    difficultyLevel: "medium",
    estimatedTime: 60,
    auraPoints: 250,
    localContext: "Address real Odisha challenges through technology"
  }
]

// Higher Secondary (+1, +2) - Advanced STEM
const higherSecondaryMathGames: GameContent[] = [
  {
    id: "calculus-in-action",
    title: "Calculus in Action",
    emoji: "🎯",
    description: "Optimize agricultural yields using calculus",
    content: ["Sets", "Functions", "Calculus", "Probability"],
    gameType: "simulation",
    challenge: "Model crop growth rates and maximize profits",
    implementation: "Advanced graphing tools with real-time calculation",
    syllabusMatch: ["Unit IV - Calculus", "Unit VI - Probability"],
    difficultyLevel: "advanced",
    estimatedTime: 75,
    auraPoints: 350,
    localContext: "Agricultural optimization in Odisha"
  },
  {
    id: "3d-geometry-studio",
    title: "3D Geometry Studio",
    emoji: "📐",
    description: "Design earthquake-resistant buildings for Odisha",
    content: ["Vectors", "Three-dimensional geometry"],
    gameType: "construction",
    example: "Calculate structural stress using vector analysis",
    implementation: "3D modeling environment with physics engine",
    syllabusMatch: ["Unit IV - Vectors and 3D Geometry"],
    difficultyLevel: "advanced",
    estimatedTime: 80,
    auraPoints: 380,
    localContext: "Structural engineering for Odisha's geography"
  }
]

const higherSecondaryScienceGames: GameContent[] = [
  {
    id: "physics-research-lab",
    title: "Physics Research Lab",
    emoji: "⚛",
    description: "Conduct virtual experiments matching +2 practicals",
    content: ["Mechanics", "Thermodynamics", "Electromagnetism"],
    gameType: "lab",
    challenge: "Design particle accelerators, study wave mechanics",
    implementation: "High-fidelity physics simulation platform",
    syllabusMatch: ["Complete +2 Physics curriculum"],
    difficultyLevel: "advanced",
    estimatedTime: 90,
    auraPoints: 400,
    localContext: "Advanced physics applications"
  },
  {
    id: "chemistry-innovation-hub",
    title: "Chemistry Innovation Hub",
    emoji: "🧬",
    description: "Develop new materials for sustainable agriculture",
    content: ["Organic chemistry", "Coordination compounds"],
    gameType: "lab",
    mission: "Create biodegradable plastics from rice waste",
    implementation: "Molecular modeling with reaction simulation",
    syllabusMatch: ["+2 Chemistry practical syllabus"],
    difficultyLevel: "advanced",
    estimatedTime: 85,
    auraPoints: 390,
    localContext: "Sustainable chemistry for Odisha agriculture"
  },
  {
    id: "biology-research-center",
    title: "Biology Research Center",
    emoji: "🔬",
    description: "Develop disease-resistant crop varieties",
    content: ["Genetics", "Biotechnology", "Ecology"],
    gameType: "simulation",
    challenge: "Use genetic engineering for Odisha's climate",
    implementation: "DNA sequencing simulator with CRISPR tools",
    realContext: "Connect to actual agricultural research",
    syllabusMatch: ["Advanced Biology and Biotechnology"],
    difficultyLevel: "advanced",
    estimatedTime: 95,
    auraPoints: 420,
    localContext: "Agricultural biotechnology for Odisha"
  }
]

const higherSecondaryTechGames: GameContent[] = [
  {
    id: "ai-innovation-lab",
    title: "AI Innovation Lab",
    emoji: "🤖",
    description: "Create AI solutions for Odisha's challenges",
    content: ["Machine learning", "Data science", "Programming"],
    gameType: "construction",
    example: "Crop disease detection, weather prediction, traffic optimization",
    implementation: "Simplified ML interface with real datasets",
    syllabusMatch: ["Advanced Programming and AI"],
    difficultyLevel: "advanced",
    estimatedTime: 100,
    auraPoints: 450,
    localContext: "AI solutions for Odisha's development"
  }
]

// Subject definitions
const mathSubject: SubjectInterface = {
  id: "mathematics",
  name: "Mathematics",
  emoji: "🔢",
  color: "bg-blue-500",
  games: []
}

const scienceSubject: SubjectInterface = {
  id: "science",
  name: "Science",
  emoji: "🔬",
  color: "bg-green-500",
  games: []
}

const technologySubject: SubjectInterface = {
  id: "technology",
  name: "Technology",
  emoji: "💻",
  color: "bg-purple-500",
  games: []
}

// Complete class data structure
export const gameClassData: ClassData[] = [
  {
    id: "upper-primary",
    name: "Upper Primary",
    subtitle: "Foundation STEM",
    grades: ["Class 6", "Class 7"],
    ageRange: "11-13 years",
    description: "Build strong STEM foundations through local contexts and gamified learning",
    subjects: [
      { ...mathSubject, games: upperPrimaryMathGames },
      { ...scienceSubject, games: upperPrimaryScienceGames }
    ]
  },
  {
    id: "secondary",
    name: "Secondary Education",
    subtitle: "Applied STEM",
    grades: ["Class 8", "Class 9", "Class 10"],
    ageRange: "13-16 years",
    description: "Apply STEM concepts to real-world problems and local challenges",
    subjects: [
      { ...mathSubject, games: secondaryMathGames },
      { ...scienceSubject, games: secondaryScienceGames },
      { ...technologySubject, games: secondaryTechGames }
    ]
  },
  {
    id: "higher-secondary",
    name: "Higher Secondary",
    subtitle: "Advanced STEM",
    grades: ["+1", "+2"],
    ageRange: "16-18 years",
    description: "Master advanced STEM concepts with research-level simulations and real-world applications",
    subjects: [
      { ...mathSubject, games: higherSecondaryMathGames },
      { ...scienceSubject, games: higherSecondaryScienceGames },
      { ...technologySubject, games: higherSecondaryTechGames }
    ]
  }
]

// Sample achievements
export const sampleAchievements = [
  {
    id: "first-steps",
    title: "First Steps",
    description: "Complete your first game",
    emoji: "🎯",
    type: "completion" as const,
    requirement: 1,
    auraPointsReward: 50
  },
  {
    id: "math-wizard",
    title: "Math Wizard",
    description: "Complete 10 mathematics games",
    emoji: "🧙‍♂️",
    type: "completion" as const,
    requirement: 10,
    auraPointsReward: 200
  },
  {
    id: "science-explorer",
    title: "Science Explorer",
    description: "Complete 10 science games",
    emoji: "🔬",
    type: "completion" as const,
    requirement: 10,
    auraPointsReward: 200
  },
  {
    id: "streak-master",
    title: "Streak Master",
    description: "Maintain a 7-day learning streak",
    emoji: "🔥",
    type: "streak" as const,
    requirement: 7,
    auraPointsReward: 300
  },
  {
    id: "odisha-champion",
    title: "Odisha Champion",
    description: "Score perfect in 5 Odisha context games",
    emoji: "🏆",
    type: "score" as const,
    requirement: 5,
    auraPointsReward: 500
  }
]

// Sample user data
export const sampleUserData = {
  userId: "user_001",
  totalAuraPoints: 1250,
  gamesCompleted: 8,
  totalTimeSpent: 240, // minutes
  currentStreak: 5,
  longestStreak: 12,
  level: 3,
  experience: 1250,
  achievements: [sampleAchievements[0], sampleAchievements[1]]
}
