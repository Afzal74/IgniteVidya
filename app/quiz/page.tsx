"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { 
  Brain, 
  Clock, 
  Target, 
  CheckCircle, 
  XCircle, 
  ArrowRight, 
  ArrowLeft,
  Trophy,
  Star,
  BookOpen,
  Users
} from "lucide-react"

interface Question {
  id: string
  question: string
  options: string[]
  correctAnswer: number
  explanation: string
  difficulty: "easy" | "medium" | "hard"
  subject: string
  grade: string
}

interface Quiz {
  id: string
  title: string
  description: string
  subject: string
  grade: string
  duration: number
  questions: Question[]
  totalQuestions: number
  createdBy: string
  createdAt: string
}

export default function QuizPage() {
  const [selectedGrade, setSelectedGrade] = useState("")
  const [selectedSubject, setSelectedSubject] = useState("")
  const [quizzes, setQuizzes] = useState<Quiz[]>([])
  const [currentQuiz, setCurrentQuiz] = useState<Quiz | null>(null)
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)
  const [selectedAnswers, setSelectedAnswers] = useState<number[]>([])
  const [timeLeft, setTimeLeft] = useState(0)
  const [quizStarted, setQuizStarted] = useState(false)
  const [quizCompleted, setQuizCompleted] = useState(false)
  const [score, setScore] = useState(0)

  const grades = ["6", "7", "8", "9", "10", "11", "12"]
  const subjects = [
    "Mathematics", "Physics", "Chemistry", "Biology", 
    "Computer Science", "English", "Social Studies"
  ]

  // Sample quiz data
  const sampleQuizzes: Quiz[] = [
    {
      id: "1",
      title: "Basic Mathematics - Grade 6",
      description: "Test your understanding of basic mathematical concepts",
      subject: "Mathematics",
      grade: "6",
      duration: 30,
      totalQuestions: 5,
      createdBy: "Ms. Sarah Johnson",
      createdAt: "2024-01-15",
      questions: [
        {
          id: "1",
          question: "What is 15 + 27?",
          options: ["40", "42", "41", "43"],
          correctAnswer: 1,
          explanation: "15 + 27 = 42",
          difficulty: "easy",
          subject: "Mathematics",
          grade: "6"
        },
        {
          id: "2",
          question: "What is the area of a rectangle with length 8 cm and width 5 cm?",
          options: ["13 cm", "40 cm", "26 cm", "35 cm"],
          correctAnswer: 1,
          explanation: "Area = length  width = 8  5 = 40 cm",
          difficulty: "medium",
          subject: "Mathematics",
          grade: "6"
        },
        {
          id: "3",
          question: "What is 3/4 as a decimal?",
          options: ["0.25", "0.5", "0.75", "0.8"],
          correctAnswer: 2,
          explanation: "3/4 = 0.75",
          difficulty: "easy",
          subject: "Mathematics",
          grade: "6"
        },
        {
          id: "4",
          question: "What is the perimeter of a square with side length 6 cm?",
          options: ["12 cm", "24 cm", "36 cm", "18 cm"],
          correctAnswer: 1,
          explanation: "Perimeter = 4  side = 4  6 = 24 cm",
          difficulty: "medium",
          subject: "Mathematics",
          grade: "6"
        },
        {
          id: "5",
          question: "What is 2?",
          options: ["6", "8", "9", "4"],
          correctAnswer: 1,
          explanation: "2 = 2  2  2 = 8",
          difficulty: "hard",
          subject: "Mathematics",
          grade: "6"
        }
      ]
    },
    {
      id: "2",
      title: "Introduction to Physics - Grade 7",
      description: "Basic concepts of physics for grade 7 students",
      subject: "Physics",
      grade: "7",
      duration: 25,
      totalQuestions: 4,
      createdBy: "Dr. Michael Chen",
      createdAt: "2024-01-20",
      questions: [
        {
          id: "1",
          question: "What is the unit of force?",
          options: ["Joule", "Newton", "Watt", "Pascal"],
          correctAnswer: 1,
          explanation: "Force is measured in Newtons (N)",
          difficulty: "easy",
          subject: "Physics",
          grade: "7"
        },
        {
          id: "2",
          question: "What is the speed of light in vacuum?",
          options: ["3  10 m/s", "3  10 m/s", "3  10 m/s", "3  10 m/s"],
          correctAnswer: 0,
          explanation: "The speed of light in vacuum is approximately 3  10 m/s",
          difficulty: "medium",
          subject: "Physics",
          grade: "7"
        }
      ]
    }
  ]

  useEffect(() => {
    // Filter quizzes based on selected grade and subject
    let filteredQuizzes = sampleQuizzes
    if (selectedGrade) {
      filteredQuizzes = filteredQuizzes.filter(quiz => quiz.grade === selectedGrade)
    }
    if (selectedSubject) {
      filteredQuizzes = filteredQuizzes.filter(quiz => quiz.subject === selectedSubject)
    }
    setQuizzes(filteredQuizzes)
  }, [selectedGrade, selectedSubject])

  useEffect(() => {
    if (quizStarted && timeLeft > 0) {
      const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000)
      return () => clearTimeout(timer)
    } else if (quizStarted && timeLeft === 0) {
      finishQuiz()
    }
  }, [quizStarted, timeLeft])

  const startQuiz = (quiz: Quiz) => {
    setCurrentQuiz(quiz)
    setTimeLeft(quiz.duration * 60) // Convert minutes to seconds
    setQuizStarted(true)
    setCurrentQuestionIndex(0)
    setSelectedAnswers(new Array(quiz.questions.length).fill(-1))
    setQuizCompleted(false)
    setScore(0)
  }

  const selectAnswer = (answerIndex: number) => {
    const newAnswers = [...selectedAnswers]
    newAnswers[currentQuestionIndex] = answerIndex
    setSelectedAnswers(newAnswers)
  }

  const nextQuestion = () => {
    if (currentQuestionIndex < currentQuiz!.questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1)
    }
  }

  const previousQuestion = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1)
    }
  }

  const finishQuiz = () => {
    let correctAnswers = 0
    currentQuiz!.questions.forEach((question, index) => {
      if (selectedAnswers[index] === question.correctAnswer) {
        correctAnswers++
      }
    })
    setScore(correctAnswers)
    setQuizCompleted(true)
    setQuizStarted(false)
  }

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case "easy": return "bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400"
      case "medium": return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400"
      case "hard": return "bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400"
      default: return "bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400"
    }
  }

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  if (quizStarted && currentQuiz) {
    const currentQuestion = currentQuiz.questions[currentQuestionIndex]
    const progress = ((currentQuestionIndex + 1) / currentQuiz.questions.length) * 100

    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-black dark:to-purple-900 py-8 px-4">
        <div className="max-w-4xl mx-auto">
          {/* Quiz Header */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-4">
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{currentQuiz.title}</h1>
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                  <Clock className="h-4 w-4" />
                  {formatTime(timeLeft)}
                </div>
                <Badge className={getDifficultyColor(currentQuestion.difficulty)}>
                  {currentQuestion.difficulty}
                </Badge>
              </div>
            </div>
            
            <Progress value={progress} className="h-2" />
            <div className="flex justify-between text-sm text-gray-600 dark:text-gray-400 mt-2">
              <span>Question {currentQuestionIndex + 1} of {currentQuiz.questions.length}</span>
              <span>{Math.round(progress)}% Complete</span>
            </div>
          </div>

          {/* Question Card */}
          <Card className="p-8 shadow-xl border-0 bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm">
            <div className="mb-6">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                {currentQuestion.question}
              </h2>
              
              <div className="space-y-3">
                {currentQuestion.options.map((option, index) => (
                  <motion.button
                    key={index}
                    onClick={() => selectAnswer(index)}
                    className={`w-full p-4 text-left rounded-lg border-2 transition-all duration-200 ${
                      selectedAnswers[currentQuestionIndex] === index
                        ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                        : 'border-gray-300 dark:border-gray-600 hover:border-blue-300 dark:hover:border-blue-700'
                    }`}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${
                        selectedAnswers[currentQuestionIndex] === index
                          ? 'border-blue-500 bg-blue-500'
                          : 'border-gray-300 dark:border-gray-600'
                      }`}>
                        {selectedAnswers[currentQuestionIndex] === index && (
                          <CheckCircle className="h-4 w-4 text-white" />
                        )}
                      </div>
                      <span className="text-gray-900 dark:text-white">{option}</span>
                    </div>
                  </motion.button>
                ))}
              </div>
            </div>

            {/* Navigation */}
            <div className="flex justify-between">
              <Button
                onClick={previousQuestion}
                disabled={currentQuestionIndex === 0}
                variant="outline"
                className="flex items-center gap-2"
              >
                <ArrowLeft className="h-4 w-4" />
                Previous
              </Button>
              
              <div className="flex gap-2">
                {currentQuiz.questions.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => setCurrentQuestionIndex(index)}
                    className={`w-8 h-8 rounded-full text-sm font-medium ${
                      index === currentQuestionIndex
                        ? 'bg-blue-500 text-white'
                        : selectedAnswers[index] !== -1
                        ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400'
                        : 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400'
                    }`}
                  >
                    {index + 1}
                  </button>
                ))}
              </div>
              
              {currentQuestionIndex === currentQuiz.questions.length - 1 ? (
                <Button
                  onClick={finishQuiz}
                  className="bg-green-500 hover:bg-green-600 text-white flex items-center gap-2"
                >
                  Finish Quiz
                  <Trophy className="h-4 w-4" />
                </Button>
              ) : (
                <Button
                  onClick={nextQuestion}
                  className="flex items-center gap-2"
                >
                  Next
                  <ArrowRight className="h-4 w-4" />
                </Button>
              )}
            </div>
          </Card>
        </div>
      </div>
    )
  }

  if (quizCompleted && currentQuiz) {
    const percentage = (score / currentQuiz.questions.length) * 100
    const isPassed = percentage >= 60

    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-black dark:to-purple-900 py-8 px-4">
        <div className="max-w-2xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6 }}
          >
            <div className="mb-8">
              <div className={`w-24 h-24 rounded-full mx-auto mb-4 flex items-center justify-center ${
                isPassed ? 'bg-green-100 dark:bg-green-900/20' : 'bg-red-100 dark:bg-red-900/20'
              }`}>
                {isPassed ? (
                  <Trophy className="h-12 w-12 text-green-600 dark:text-green-400" />
                ) : (
                  <XCircle className="h-12 w-12 text-red-600 dark:text-red-400" />
                )}
              </div>
              
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                {isPassed ? "Congratulations!" : "Keep Learning!"}
              </h1>
              <p className="text-gray-600 dark:text-gray-400">
                {isPassed ? "You passed the quiz!" : "Don't worry, practice makes perfect!"}
              </p>
            </div>

            <Card className="p-8 shadow-xl border-0 bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm mb-6">
              <div className="space-y-4">
                <div className="text-4xl font-bold text-gray-900 dark:text-white">
                  {score}/{currentQuiz.questions.length}
                </div>
                <div className="text-2xl font-semibold text-gray-600 dark:text-gray-400">
                  {percentage.toFixed(1)}%
                </div>
                <div className="text-lg text-gray-500 dark:text-gray-500">
                  {isPassed ? "Well Done!" : "Try Again!"}
                </div>
              </div>
            </Card>

            <div className="flex gap-4 justify-center">
              <Button
                onClick={() => {
                  setQuizCompleted(false)
                  setCurrentQuiz(null)
                }}
                variant="outline"
                className="flex items-center gap-2"
              >
                <BookOpen className="h-4 w-4" />
                Take Another Quiz
              </Button>
              <Button
                onClick={() => window.location.href = "/dashboard"}
                className="flex items-center gap-2"
              >
                <Users className="h-4 w-4" />
                Go to Dashboard
              </Button>
            </div>
          </motion.div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-black dark:to-purple-900 py-8 px-4">
      <div className="max-w-6xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-8"
        >
          <div className="flex items-center justify-center mb-4">
            <div className="w-20 h-20 rounded-2xl bg-white dark:bg-gray-800 shadow-lg border border-gray-200 dark:border-gray-700 flex items-center justify-center">
              <img 
                src="/vtu-logo.png" 
                alt="VTU Logo" 
                className="w-16 h-16 object-contain"
                onError={(e) => {
                  // Fallback to icon if image fails to load
                  e.currentTarget.style.display = 'none';
                  e.currentTarget.nextElementSibling?.classList.remove('hidden');
                }}
              />
              <Brain className="h-10 w-10 text-blue-600 dark:text-blue-400 hidden" />
            </div>
          </div>
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">Quiz Center</h1>
          <p className="text-gray-600 dark:text-gray-400">Test your knowledge and track your progress</p>
        </motion.div>

        {/* Filters */}
        <Card className="p-6 shadow-xl border-0 bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm mb-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Select Grade
              </label>
              <select
                value={selectedGrade}
                onChange={(e) => setSelectedGrade(e.target.value)}
                className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
              >
                <option value="">All Grades</option>
                {grades.map(grade => (
                  <option key={grade} value={grade}>Grade {grade}</option>
                ))}
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Select Subject
              </label>
              <select
                value={selectedSubject}
                onChange={(e) => setSelectedSubject(e.target.value)}
                className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
              >
                <option value="">All Subjects</option>
                {subjects.map(subject => (
                  <option key={subject} value={subject}>{subject}</option>
                ))}
              </select>
            </div>
            
            <div className="flex items-end">
              <Button
                onClick={() => {
                  setSelectedGrade("")
                  setSelectedSubject("")
                }}
                variant="outline"
                className="w-full"
              >
                Clear Filters
              </Button>
            </div>
          </div>
        </Card>

        {/* Quiz List */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {quizzes.map((quiz, index) => (
            <motion.div
              key={quiz.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: index * 0.1 }}
            >
              <Card className="p-6 shadow-xl border-0 bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm hover:shadow-2xl transition-all duration-300">
                <div className="mb-4">
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                    {quiz.title}
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400 text-sm mb-3">
                    {quiz.description}
                  </p>
                  
                  <div className="flex flex-wrap gap-2 mb-4">
                    <Badge variant="outline">Grade {quiz.grade}</Badge>
                    <Badge variant="outline">{quiz.subject}</Badge>
                    <Badge className="bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400">
                      {quiz.totalQuestions} Questions
                    </Badge>
                    <Badge className="bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400">
                      {quiz.duration} min
                    </Badge>
                  </div>
                </div>
                
                <div className="text-sm text-gray-500 dark:text-gray-500 mb-4">
                  <div>Created by: {quiz.createdBy}</div>
                  <div>Created: {quiz.createdAt}</div>
                </div>
                
                <Button
                  onClick={() => startQuiz(quiz)}
                  className="w-full bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white font-medium py-3 rounded-lg"
                >
                  Start Quiz
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Button>
              </Card>
            </motion.div>
          ))}
        </div>

        {quizzes.length === 0 && (
          <Card className="p-8 text-center shadow-xl border-0 bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm">
            <Target className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
              No quizzes found
            </h3>
            <p className="text-gray-600 dark:text-gray-400">
              Try adjusting your filters or check back later for new quizzes.
            </p>
          </Card>
        )}
      </div>
    </div>
  )
}
