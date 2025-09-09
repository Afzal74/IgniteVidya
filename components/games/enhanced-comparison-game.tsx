"use client"

import { useState, useEffect, useCallback } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { 
  Trophy, 
  Star, 
  RotateCcw, 
  CheckCircle, 
  X, 
  ArrowRight,
  BookOpen,
  Target,
  Clock,
  Play,
  Timer,
  Zap,
  Award
} from "lucide-react"

interface ComparisonQuestion {
  id: number
  leftNumber: number
  rightNumber: number
  correctAnswer: string
  explanation: string
}

interface GameStats {
  score: number
  totalQuestions: number
  timeSpent: number
  correctAnswers: number
  consecutiveCorrect: number
  fastAnswers: number
}

interface DraggedSymbol {
  symbol: string
  id: string
}

export function EnhancedComparisonGame() {
  const [currentQuestion, setCurrentQuestion] = useState(0)
  const [selectedAnswer, setSelectedAnswer] = useState<string>("")
  const [showResult, setShowResult] = useState(false)
  const [gameStats, setGameStats] = useState<GameStats>({
    score: 0,
    totalQuestions: 10,
    correctAnswers: 0,
    timeSpent: 0,
    consecutiveCorrect: 0,
    fastAnswers: 0
  })
  const [gameStarted, setGameStarted] = useState(false)
  const [gameCompleted, setGameCompleted] = useState(false)
  const [startTime, setStartTime] = useState<Date>()
  const [questionStartTime, setQuestionStartTime] = useState<Date>()
  const [timeLeft, setTimeLeft] = useState(30) // 30 seconds per question
  const [draggedSymbol, setDraggedSymbol] = useState<DraggedSymbol | null>(null)
  const [dropZoneActive, setDropZoneActive] = useState(false)
  const [streak, setStreak] = useState(0)
  const [showStreakBonus, setShowStreakBonus] = useState(false)
  const [bonusPoints, setBonusPoints] = useState(0)

  const symbols = [
    { symbol: ">", label: "Greater than", color: "from-red-500 to-red-600" },
    { symbol: "<", label: "Less than", color: "from-blue-500 to-blue-600" },
    { symbol: "=", label: "Equal to", color: "from-green-500 to-green-600" },
    { symbol: "≥", label: "Greater than or equal", color: "from-purple-500 to-purple-600" },
  ]

  // Generate comparison questions
  const generateQuestions = (): ComparisonQuestion[] => {
    const questions: ComparisonQuestion[] = []
    for (let i = 0; i < 10; i++) {
      const leftNumber = Math.floor(Math.random() * 50) + 1
      let rightNumber = Math.floor(Math.random() * 50) + 1
      
      // Ensure variety in question types
      const questionType = Math.floor(Math.random() * 4)
      if (questionType === 0 && Math.random() > 0.3) {
        rightNumber = leftNumber // Make some equal
      }

      let correctAnswer = ""
      let explanation = ""

      if (leftNumber > rightNumber) {
        correctAnswer = ">"
        explanation = `${leftNumber} is greater than ${rightNumber}`
      } else if (leftNumber < rightNumber) {
        correctAnswer = "<"
        explanation = `${leftNumber} is less than ${rightNumber}`
      } else {
        correctAnswer = "="
        explanation = `${leftNumber} is equal to ${rightNumber}`
      }

      questions.push({
        id: i + 1,
        leftNumber,
        rightNumber,
        correctAnswer,
        explanation
      })
    }
    return questions
  }

  const [questions] = useState<ComparisonQuestion[]>(generateQuestions())

  // Timer effect
  useEffect(() => {
    if (gameStarted && !gameCompleted && !showResult && timeLeft > 0) {
      const timer = setTimeout(() => {
        setTimeLeft(prev => prev - 1)
      }, 1000)
      return () => clearTimeout(timer)
    } else if (timeLeft === 0 && !showResult) {
      // Time's up, show incorrect result
      handleAnswer("", true)
    }
  }, [gameStarted, gameCompleted, showResult, timeLeft])

  const startGame = () => {
    setGameStarted(true)
    setStartTime(new Date())
    setQuestionStartTime(new Date())
    setCurrentQuestion(0)
    setTimeLeft(30)
    setGameStats({
      score: 0,
      totalQuestions: 10,
      correctAnswers: 0,
      timeSpent: 0,
      consecutiveCorrect: 0,
      fastAnswers: 0
    })
  }

  const resetGame = () => {
    setGameStarted(false)
    setGameCompleted(false)
    setCurrentQuestion(0)
    setSelectedAnswer("")
    setShowResult(false)
    setTimeLeft(30)
    setStreak(0)
    setGameStats({
      score: 0,
      totalQuestions: 10,
      correctAnswers: 0,
      timeSpent: 0,
      consecutiveCorrect: 0,
      fastAnswers: 0
    })
  }

  const handleAnswer = useCallback((answer: string, timeUp: boolean = false) => {
    setSelectedAnswer(answer)
    setShowResult(true)

    const questionTime = questionStartTime ? 
      (new Date().getTime() - questionStartTime.getTime()) / 1000 : 30
    
    const isCorrect = !timeUp && answer === questions[currentQuestion].correctAnswer
    const isFast = questionTime < 10 // Under 10 seconds is considered fast
    
    let pointsEarned = 0
    let newBonusPoints = 0

    if (isCorrect) {
      pointsEarned = 10
      if (isFast) pointsEarned += 5 // Speed bonus
      
      const newStreak = streak + 1
      setStreak(newStreak)
      
      // Streak bonus
      if (newStreak >= 3) {
        const streakBonus = newStreak * 2
        newBonusPoints = streakBonus
        pointsEarned += streakBonus
        setBonusPoints(streakBonus)
        setShowStreakBonus(true)
        setTimeout(() => setShowStreakBonus(false), 2000)
      }

      setGameStats(prev => ({
        ...prev,
        score: prev.score + pointsEarned,
        correctAnswers: prev.correctAnswers + 1,
        consecutiveCorrect: Math.max(prev.consecutiveCorrect, newStreak),
        fastAnswers: isFast ? prev.fastAnswers + 1 : prev.fastAnswers
      }))
    } else {
      setStreak(0)
    }

    setTimeout(() => {
      if (currentQuestion < questions.length - 1) {
        setCurrentQuestion(prev => prev + 1)
        setSelectedAnswer("")
        setShowResult(false)
        setTimeLeft(30)
        setQuestionStartTime(new Date())
      } else {
        // Game completed
        const endTime = new Date()
        const timeSpent = startTime ? Math.floor((endTime.getTime() - startTime.getTime()) / 1000) : 0
        setGameStats(prev => ({
          ...prev,
          timeSpent
        }))
        setGameCompleted(true)
      }
    }, timeUp ? 1500 : 2500)
  }, [currentQuestion, questions, questionStartTime, startTime, streak])

  const handleDragStart = (e: React.DragEvent, symbol: string) => {
    setDraggedSymbol({ symbol, id: Math.random().toString() })
    e.dataTransfer.effectAllowed = 'move'
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    setDropZoneActive(true)
  }

  const handleDragLeave = () => {
    setDropZoneActive(false)
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setDropZoneActive(false)
    
    if (draggedSymbol && !showResult) {
      handleAnswer(draggedSymbol.symbol)
    }
    setDraggedSymbol(null)
  }

  const getResultColor = () => {
    if (!showResult) return "border-gray-300"
    const isCorrect = selectedAnswer === questions[currentQuestion].correctAnswer
    return isCorrect ? "border-green-500 bg-green-50" : "border-red-500 bg-red-50"
  }

  const getScoreGrade = () => {
    const percentage = (gameStats.correctAnswers / gameStats.totalQuestions) * 100
    if (percentage >= 90) return { grade: "A+", color: "text-emerald-600", message: "Outstanding! 🎉" }
    if (percentage >= 80) return { grade: "A", color: "text-green-600", message: "Excellent work! 🌟" }
    if (percentage >= 70) return { grade: "B", color: "text-blue-600", message: "Great job! 👏" }
    if (percentage >= 60) return { grade: "C", color: "text-yellow-600", message: "Good effort! 💪" }
    return { grade: "D", color: "text-red-600", message: "Keep practicing! 📚" }
  }

  const getTimeColor = () => {
    if (timeLeft > 20) return "text-green-600"
    if (timeLeft > 10) return "text-yellow-600"
    return "text-red-600"
  }

  if (!gameStarted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 p-4 pt-20">
        <div className="max-w-5xl mx-auto">
          <Card className="shadow-2xl border-0 bg-white/90 backdrop-blur-sm">
            <CardHeader className="text-center pb-8">
              <motion.div
                initial={{ scale: 0, rotate: -180 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ duration: 0.8, type: "spring", bounce: 0.5 }}
                className="text-7xl mb-4"
              >
                🔢
              </motion.div>
              <CardTitle className="text-4xl mb-4 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                Number Comparison Challenge
              </CardTitle>
              <p className="text-xl text-gray-600 mb-6">
                Drag and drop symbols to compare numbers! Race against time and build streaks for bonus points!
              </p>
              
              <div className="flex items-center justify-center gap-4 mb-8">
                <Badge className="bg-blue-100 text-blue-800 text-sm px-3 py-2">
                  <Timer className="h-4 w-4 mr-1" />
                  30s per question
                </Badge>
                <Badge className="bg-purple-100 text-purple-800 text-sm px-3 py-2">
                  <Zap className="h-4 w-4 mr-1" />
                  Streak bonuses
                </Badge>
                <Badge className="bg-green-100 text-green-800 text-sm px-3 py-2">
                  <Award className="h-4 w-4 mr-1" />
                  Speed bonuses
                </Badge>
              </div>
            </CardHeader>

            <CardContent className="space-y-8">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="text-center p-6 bg-blue-50 rounded-xl border-2 border-blue-200">
                  <BookOpen className="h-10 w-10 text-blue-600 mx-auto mb-3" />
                  <h3 className="font-bold text-blue-900 mb-2">Learn</h3>
                  <p className="text-sm text-blue-700">Master comparison symbols with drag & drop</p>
                </div>
                
                <div className="text-center p-6 bg-purple-50 rounded-xl border-2 border-purple-200">
                  <Target className="h-10 w-10 text-purple-600 mx-auto mb-3" />
                  <h3 className="font-bold text-purple-900 mb-2">Practice</h3>
                  <p className="text-sm text-purple-700">10 timed questions with instant feedback</p>
                </div>
                
                <div className="text-center p-6 bg-green-50 rounded-xl border-2 border-green-200">
                  <Trophy className="h-10 w-10 text-green-600 mx-auto mb-3" />
                  <h3 className="font-bold text-green-900 mb-2">Achieve</h3>
                  <p className="text-sm text-green-700">Earn points and unlock achievements</p>
                </div>

                <div className="text-center p-6 bg-orange-50 rounded-xl border-2 border-orange-200">
                  <Zap className="h-10 w-10 text-orange-600 mx-auto mb-3" />
                  <h3 className="font-bold text-orange-900 mb-2">Compete</h3>
                  <p className="text-sm text-orange-700">Race against time for bonus scores</p>
                </div>
              </div>

              <div className="bg-gradient-to-r from-yellow-50 to-orange-50 p-6 rounded-xl border-2 border-yellow-200">
                <h4 className="font-bold text-yellow-800 mb-4 text-center">🎯 How to Play</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm">
                  <div className="space-y-3">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-blue-500 text-white flex items-center justify-center font-bold">1</div>
                      <span className="text-gray-700">Look at the two numbers</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-purple-500 text-white flex items-center justify-center font-bold">2</div>
                      <span className="text-gray-700">Drag the correct symbol to the drop zone</span>
                    </div>
                  </div>
                  <div className="space-y-3">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-green-500 text-white flex items-center justify-center font-bold">3</div>
                      <span className="text-gray-700">Answer quickly for speed bonuses!</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-orange-500 text-white flex items-center justify-center font-bold">4</div>
                      <span className="text-gray-700">Build streaks for extra points</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-white p-6 rounded-xl border-2 border-gray-200">
                <h4 className="font-bold text-gray-800 mb-4 text-center">🎓 Symbol Guide</h4>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {symbols.map((sym, index) => (
                    <div key={index} className="text-center p-4 bg-gray-50 rounded-lg border">
                      <div className="text-3xl mb-2 font-bold text-gray-700">{sym.symbol}</div>
                      <p className="text-sm font-medium text-gray-600">{sym.label}</p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="text-center">
                <Button 
                  size="lg" 
                  onClick={startGame}
                  className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white px-12 py-4 text-xl font-semibold shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:scale-105"
                >
                  <Play className="mr-3 h-6 w-6" />
                  Start Challenge
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  if (gameCompleted) {
    const grade = getScoreGrade()
    
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 via-blue-50 to-purple-50 p-4 pt-20">
        <div className="max-w-3xl mx-auto">
          <Card className="shadow-2xl border-0 bg-white/90 backdrop-blur-sm">
            <CardHeader className="text-center">
              <motion.div
                initial={{ scale: 0, rotate: -180 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ duration: 0.8, type: "spring", bounce: 0.6 }}
                className="text-8xl mb-4"
              >
                🏆
              </motion.div>
              <CardTitle className="text-4xl mb-4">Challenge Complete!</CardTitle>
              <p className="text-xl text-gray-600">{grade.message}</p>
            </CardHeader>

            <CardContent className="space-y-8">
              <div className="text-center">
                <motion.div 
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.5, type: "spring", bounce: 0.5 }}
                  className={`text-8xl font-bold mb-4 ${grade.color}`}
                >
                  {grade.grade}
                </motion.div>
                <p className="text-3xl font-bold mb-2">
                  {gameStats.correctAnswers}/{gameStats.totalQuestions} Correct
                </p>
                <p className="text-xl text-gray-600 mb-6">Final Score: {gameStats.score} points</p>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center p-4 bg-blue-50 rounded-xl">
                  <Clock className="h-8 w-8 text-blue-600 mx-auto mb-2" />
                  <p className="font-semibold">Time</p>
                  <p className="text-blue-600">{Math.floor(gameStats.timeSpent / 60)}:{(gameStats.timeSpent % 60).toString().padStart(2, '0')}</p>
                </div>
                
                <div className="text-center p-4 bg-purple-50 rounded-xl">
                  <Star className="h-8 w-8 text-purple-600 mx-auto mb-2" />
                  <p className="font-semibold">Accuracy</p>
                  <p className="text-purple-600">
                    {Math.round((gameStats.correctAnswers / gameStats.totalQuestions) * 100)}%
                  </p>
                </div>

                <div className="text-center p-4 bg-green-50 rounded-xl">
                  <Zap className="h-8 w-8 text-green-600 mx-auto mb-2" />
                  <p className="font-semibold">Best Streak</p>
                  <p className="text-green-600">{gameStats.consecutiveCorrect}</p>
                </div>

                <div className="text-center p-4 bg-orange-50 rounded-xl">
                  <Trophy className="h-8 w-8 text-orange-600 mx-auto mb-2" />
                  <p className="font-semibold">Fast Answers</p>
                  <p className="text-orange-600">{gameStats.fastAnswers}</p>
                </div>
              </div>

              <div className="flex gap-4 justify-center">
                <Button onClick={resetGame} variant="outline" size="lg">
                  <RotateCcw className="mr-2 h-5 w-5" />
                  Play Again
                </Button>
                <Button onClick={() => window.history.back()} size="lg">
                  <ArrowRight className="mr-2 h-5 w-5" />
                  Back to Games
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  const currentQ = questions[currentQuestion]
  const progress = ((currentQuestion + 1) / questions.length) * 100

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 p-4 pt-20">
      <div className="max-w-6xl mx-auto">
        {/* Game Header */}
        <div className="mb-8">
          <div className="flex justify-between items-center mb-4">
            <div className="flex items-center gap-4">
              <Badge className="bg-blue-100 text-blue-800 px-3 py-1">
                Question {currentQuestion + 1}/{questions.length}
              </Badge>
              <Badge className="bg-green-100 text-green-800 px-3 py-1">
                Score: {gameStats.score}
              </Badge>
              {streak > 0 && (
                <Badge className="bg-orange-100 text-orange-800 px-3 py-1">
                  🔥 Streak: {streak}
                </Badge>
              )}
            </div>
            
            <div className={`text-2xl font-bold ${getTimeColor()} flex items-center gap-2`}>
              <Timer className="h-6 w-6" />
              {timeLeft}s
            </div>
          </div>
          <Progress value={progress} className="h-3" />
        </div>

        {/* Streak Bonus Notification */}
        <AnimatePresence>
          {showStreakBonus && (
            <motion.div
              initial={{ opacity: 0, y: -50, scale: 0.8 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -50, scale: 0.8 }}
              className="fixed top-24 left-1/2 transform -translate-x-1/2 z-50"
            >
              <div className="bg-gradient-to-r from-orange-500 to-red-500 text-white px-6 py-3 rounded-full font-bold shadow-2xl">
                🔥 STREAK BONUS: +{bonusPoints} points!
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Main Game Area */}
        <Card className="shadow-2xl border-0 bg-white/90 backdrop-blur-sm">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl mb-4">
              Drag the correct symbol to compare the numbers
            </CardTitle>
          </CardHeader>

          <CardContent>
            <div className="space-y-8">
              {/* Numbers Display */}
              <div className="flex items-center justify-center gap-8">
                <motion.div
                  key={`left-${currentQuestion}`}
                  initial={{ scale: 0, rotateY: -90 }}
                  animate={{ scale: 1, rotateY: 0 }}
                  transition={{ type: "spring", bounce: 0.5 }}
                  className="text-8xl font-bold text-blue-600 bg-gradient-to-br from-blue-50 to-blue-100 p-8 rounded-2xl border-4 border-blue-200 shadow-xl"
                >
                  {currentQ.leftNumber}
                </motion.div>
                
                {/* Drop Zone */}
                <motion.div
                  className={`w-32 h-32 rounded-2xl border-4 border-dashed flex items-center justify-center text-6xl font-bold transition-all duration-300 ${
                    dropZoneActive 
                      ? 'border-green-500 bg-green-50 scale-110' 
                      : getResultColor()
                  } ${!showResult ? 'border-gray-400 bg-gray-50' : ''}`}
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                  whileHover={{ scale: 1.05 }}
                  animate={dropZoneActive ? { scale: 1.1 } : { scale: 1 }}
                >
                  {showResult ? (
                    <motion.span
                      initial={{ scale: 0, rotate: -180 }}
                      animate={{ scale: 1, rotate: 0 }}
                      className={selectedAnswer === currentQ.correctAnswer ? "text-green-600" : "text-red-600"}
                    >
                      {selectedAnswer}
                    </motion.span>
                  ) : (
                    <motion.span 
                      className="text-gray-400 text-4xl"
                      animate={{ opacity: [0.5, 1, 0.5] }}
                      transition={{ duration: 2, repeat: Infinity }}
                    >
                      ?
                    </motion.span>
                  )}
                </motion.div>
                
                <motion.div
                  key={`right-${currentQuestion}`}
                  initial={{ scale: 0, rotateY: 90 }}
                  animate={{ scale: 1, rotateY: 0 }}
                  transition={{ type: "spring", bounce: 0.5 }}
                  className="text-8xl font-bold text-purple-600 bg-gradient-to-br from-purple-50 to-purple-100 p-8 rounded-2xl border-4 border-purple-200 shadow-xl"
                >
                  {currentQ.rightNumber}
                </motion.div>
              </div>

              {/* Draggable Symbols */}
              <div className="flex justify-center">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-2xl">
                  {symbols.map((symbol, index) => (
                    <motion.div
                      key={symbol.symbol}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 + 0.5 }}
                      drag={!showResult}
                      dragConstraints={{ left: 0, right: 0, top: 0, bottom: 0 }}
                      whileDrag={{ scale: 1.2, zIndex: 1000, rotate: 5 }}
                      whileHover={{ scale: 1.1 }}
                      onDragStart={(e) => handleDragStart(e as any, symbol.symbol)}
                      className={`cursor-grab active:cursor-grabbing p-6 text-4xl font-bold rounded-2xl border-3 bg-gradient-to-r ${symbol.color} text-white shadow-xl hover:shadow-2xl transition-all duration-200 select-none`}
                      style={{ touchAction: 'none' }}
                    >
                      <div className="text-center">
                        <div className="mb-2">{symbol.symbol}</div>
                        <div className="text-xs font-medium opacity-90">{symbol.label}</div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>

              {/* Result Display */}
              <AnimatePresence>
                {showResult && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.8, y: 20 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.8, y: -20 }}
                    className="text-center p-6 rounded-2xl bg-gradient-to-r from-gray-50 to-gray-100 border-2 border-gray-200"
                  >
                    <div className="flex items-center justify-center gap-3 mb-3">
                      {selectedAnswer === currentQ.correctAnswer ? (
                        <>
                          <CheckCircle className="h-8 w-8 text-green-600" />
                          <span className="text-2xl font-bold text-green-600">Correct! 🎉</span>
                        </>
                      ) : (
                        <>
                          <X className="h-8 w-8 text-red-600" />
                          <span className="text-2xl font-bold text-red-600">
                            {timeLeft === 0 ? "Time's up! ⏰" : "Try again! 🤔"}
                          </span>
                        </>
                      )}
                    </div>
                    <p className="text-lg text-gray-700 mb-2">{currentQ.explanation}</p>
                    {selectedAnswer === currentQ.correctAnswer && questionStartTime && (
                      <div className="text-sm text-blue-600">
                        {(new Date().getTime() - questionStartTime.getTime()) / 1000 < 10 && 
                          <span className="font-bold">⚡ Speed Bonus: +5 points!</span>
                        }
                      </div>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Progress Info */}
              <div className="text-center text-gray-600">
                <p className="text-sm mb-2">Drag a symbol to the center box to make your comparison</p>
                <div className="flex items-center justify-center gap-4 text-xs">
                  <span>💡 Fast answers get bonus points</span>
                  <span>🔥 Build streaks for extra rewards</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
