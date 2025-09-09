"use client"

import { useState, useEffect } from "react"
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
  Play
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
}

export function ComparisonGame() {
  const [currentQuestion, setCurrentQuestion] = useState(0)
  const [selectedAnswer, setSelectedAnswer] = useState<string>("")
  const [showResult, setShowResult] = useState(false)
  const [gameStats, setGameStats] = useState<GameStats>({
    score: 0,
    totalQuestions: 10,
    correctAnswers: 0,
    timeSpent: 0
  })
  const [gameStarted, setGameStarted] = useState(false)
  const [gameCompleted, setGameCompleted] = useState(false)
  const [startTime, setStartTime] = useState<Date>()

  // Generate comparison questions
  const generateQuestions = (): ComparisonQuestion[] => {
    const questions: ComparisonQuestion[] = []
    for (let i = 0; i < 10; i++) {
      const leftNumber = Math.floor(Math.random() * 20) + 1
      let rightNumber = Math.floor(Math.random() * 20) + 1
      
      // Ensure numbers are different
      while (rightNumber === leftNumber) {
        rightNumber = Math.floor(Math.random() * 20) + 1
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

  const startGame = () => {
    setGameStarted(true)
    setStartTime(new Date())
    setCurrentQuestion(0)
    setGameStats({
      score: 0,
      totalQuestions: 10,
      correctAnswers: 0,
      timeSpent: 0
    })
  }

  const resetGame = () => {
    setGameStarted(false)
    setGameCompleted(false)
    setCurrentQuestion(0)
    setSelectedAnswer("")
    setShowResult(false)
    setGameStats({
      score: 0,
      totalQuestions: 10,
      correctAnswers: 0,
      timeSpent: 0
    })
  }

  const handleAnswerSelect = (answer: string) => {
    setSelectedAnswer(answer)
    setShowResult(true)

    const isCorrect = answer === questions[currentQuestion].correctAnswer
    
    if (isCorrect) {
      setGameStats(prev => ({
        ...prev,
        score: prev.score + 10,
        correctAnswers: prev.correctAnswers + 1
      }))
    }

    setTimeout(() => {
      if (currentQuestion < questions.length - 1) {
        setCurrentQuestion(prev => prev + 1)
        setSelectedAnswer("")
        setShowResult(false)
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
    }, 2000)
  }

  const getAnswerColor = (answer: string) => {
    if (!showResult) return "border-gray-300 hover:border-blue-500"
    if (answer === questions[currentQuestion].correctAnswer) {
      return "border-green-500 bg-green-50 text-green-700"
    }
    if (answer === selectedAnswer && answer !== questions[currentQuestion].correctAnswer) {
      return "border-red-500 bg-red-50 text-red-700"
    }
    return "border-gray-300 opacity-50"
  }

  const getScoreGrade = () => {
    const percentage = (gameStats.correctAnswers / gameStats.totalQuestions) * 100
    if (percentage >= 90) return { grade: "A+", color: "text-green-600", message: "Excellent work!" }
    if (percentage >= 80) return { grade: "A", color: "text-green-600", message: "Great job!" }
    if (percentage >= 70) return { grade: "B", color: "text-blue-600", message: "Good work!" }
    if (percentage >= 60) return { grade: "C", color: "text-yellow-600", message: "Keep practicing!" }
    return { grade: "D", color: "text-red-600", message: "Need more practice!" }
  }

  if (!gameStarted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 p-4 pt-20">
        <div className="max-w-4xl mx-auto">
          <Card className="shadow-xl border-0 bg-white/80 backdrop-blur-sm">
            <CardHeader className="text-center pb-8">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="text-6xl mb-4"
              >
                🧮
              </motion.div>
              <CardTitle className="text-3xl mb-2 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                Number Comparison Challenge
              </CardTitle>
              <p className="text-gray-600 text-lg">
                Master the art of comparing numbers with fun interactive exercises!
              </p>
            </CardHeader>

            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="text-center p-4 bg-blue-50 rounded-lg">
                  <BookOpen className="h-8 w-8 text-blue-600 mx-auto mb-2" />
                  <h3 className="font-semibold text-blue-900">Learn</h3>
                  <p className="text-sm text-blue-700">Compare numbers using &gt;, &lt;, and = symbols</p>
                </div>
                
                <div className="text-center p-4 bg-purple-50 rounded-lg">
                  <Target className="h-8 w-8 text-purple-600 mx-auto mb-2" />
                  <h3 className="font-semibold text-purple-900">Practice</h3>
                  <p className="text-sm text-purple-700">10 interactive comparison questions</p>
                </div>
                
                <div className="text-center p-4 bg-green-50 rounded-lg">
                  <Trophy className="h-8 w-8 text-green-600 mx-auto mb-2" />
                  <h3 className="font-semibold text-green-900">Master</h3>
                  <p className="text-sm text-green-700">Earn points and improve your skills</p>
                </div>
              </div>

              <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200">
                <h4 className="font-semibold text-yellow-800 mb-2">📚 Quick Review:</h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                  <div className="text-center">
                    <div className="text-2xl mb-1">&gt;</div>
                    <p className="text-yellow-700"><strong>Greater than</strong><br/>5 &gt; 3</p>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl mb-1">&lt;</div>
                    <p className="text-yellow-700"><strong>Less than</strong><br/>3 &lt; 5</p>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl mb-1">=</div>
                    <p className="text-yellow-700"><strong>Equal to</strong><br/>4 = 4</p>
                  </div>
                </div>
              </div>

              <div className="text-center">
                <Button 
                  size="lg" 
                  onClick={startGame}
                  className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white px-8 py-3 text-lg"
                >
                  <Play className="mr-2 h-5 w-5" />
                  Start Game
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
        <div className="max-w-2xl mx-auto">
          <Card className="shadow-xl border-0 bg-white/80 backdrop-blur-sm">
            <CardHeader className="text-center">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="text-6xl mb-4"
              >
                🏆
              </motion.div>
              <CardTitle className="text-3xl mb-2">Game Complete!</CardTitle>
              <p className="text-gray-600">{grade.message}</p>
            </CardHeader>

            <CardContent className="space-y-6">
              <div className="text-center">
                <div className={`text-6xl font-bold mb-2 ${grade.color}`}>
                  {grade.grade}
                </div>
                <p className="text-2xl font-semibold">
                  {gameStats.correctAnswers}/{gameStats.totalQuestions} Correct
                </p>
                <p className="text-gray-600">Score: {gameStats.score}/100</p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="text-center p-4 bg-blue-50 rounded-lg">
                  <Clock className="h-8 w-8 text-blue-600 mx-auto mb-2" />
                  <p className="font-semibold">Time Taken</p>
                  <p className="text-blue-600">{gameStats.timeSpent} seconds</p>
                </div>
                
                <div className="text-center p-4 bg-purple-50 rounded-lg">
                  <Star className="h-8 w-8 text-purple-600 mx-auto mb-2" />
                  <p className="font-semibold">Accuracy</p>
                  <p className="text-purple-600">
                    {Math.round((gameStats.correctAnswers / gameStats.totalQuestions) * 100)}%
                  </p>
                </div>
              </div>

              <div className="flex gap-2 justify-center">
                <Button onClick={resetGame} variant="outline">
                  <RotateCcw className="mr-2 h-4 w-4" />
                  Play Again
                </Button>
                <Button onClick={() => window.history.back()}>
                  <ArrowRight className="mr-2 h-4 w-4" />
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
      <div className="max-w-4xl mx-auto">
        {/* Progress Bar */}
        <div className="mb-6">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm font-medium">Question {currentQuestion + 1} of {questions.length}</span>
            <span className="text-sm font-medium">Score: {gameStats.score}</span>
          </div>
          <Progress value={progress} className="h-2" />
        </div>

        <Card className="shadow-xl border-0 bg-white/80 backdrop-blur-sm">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl mb-4">
              Select the correct comparison symbol
            </CardTitle>
          </CardHeader>

          <CardContent>
            <div className="space-y-8">
              {/* Numbers Display */}
              <div className="flex items-center justify-center gap-8">
                <motion.div
                  key={`left-${currentQuestion}`}
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="text-6xl font-bold text-blue-600 bg-blue-50 p-6 rounded-xl border-2 border-blue-200"
                >
                  {currentQ.leftNumber}
                </motion.div>
                
                <div className="text-4xl font-bold text-gray-400">?</div>
                
                <motion.div
                  key={`right-${currentQuestion}`}
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="text-6xl font-bold text-purple-600 bg-purple-50 p-6 rounded-xl border-2 border-purple-200"
                >
                  {currentQ.rightNumber}
                </motion.div>
              </div>

              {/* Answer Options */}
              <div className="grid grid-cols-4 gap-4 max-w-2xl mx-auto">
                {[">", ">=", "<=", "<"].map((option, index) => (
                  <motion.button
                    key={option}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    onClick={() => !showResult && handleAnswerSelect(option)}
                    disabled={showResult}
                    className={`p-6 text-4xl font-bold rounded-xl border-2 transition-all duration-200 ${getAnswerColor(option)}`}
                  >
                    {option}
                  </motion.button>
                ))}
              </div>

              <div className="text-center">
                <div className="text-sm text-gray-600 mb-2">Choose from:</div>
                <div className="flex justify-center gap-8 text-lg">
                  <span><strong>a.</strong> Greater than (&gt;)</span>
                  <span><strong>b.</strong> Greater than or equal (&gt;=)</span>
                  <span><strong>c.</strong> Less than or equal (&lt;=)</span>  
                  <span><strong>d.</strong> Less than (&lt;)</span>
                </div>
              </div>

              {/* Result Display */}
              <AnimatePresence>
                {showResult && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-center p-4 rounded-lg bg-gray-50"
                  >
                    <div className="flex items-center justify-center gap-2 mb-2">
                      {selectedAnswer === currentQ.correctAnswer ? (
                        <>
                          <CheckCircle className="h-6 w-6 text-green-600" />
                          <span className="text-green-600 font-semibold">Correct!</span>
                        </>
                      ) : (
                        <>
                          <X className="h-6 w-6 text-red-600" />
                          <span className="text-red-600 font-semibold">Incorrect</span>
                        </>
                      )}
                    </div>
                    <p className="text-gray-700">{currentQ.explanation}</p>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
