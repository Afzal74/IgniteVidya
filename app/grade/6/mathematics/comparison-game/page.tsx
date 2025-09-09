"use client"

import { useState, useEffect, useCallback, useRef } from "react"
import { motion, AnimatePresence, useDragControls, PanInfo, useAnimation } from "framer-motion"
import { ArrowLeft, Timer, Trophy, Star, RotateCcw, CheckCircle, X, Play, Target, Zap, Calculator, Percent, Divide, Plus, Minus, Equal, Pause, Settings, Volume2, VolumeX, Award, Crown, Shield, Flame, Download, FileText, Image, Share2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import Link from "next/link"

interface ComparisonQuestion {
  id: number
  leftNumber: number
  rightNumber: number
  correctAnswer: string
  explanation: string
}

interface GameStats {
  score: number
  correctAnswers: number
  timeSpent: number
  streak: number
  bestStreak: number
  perfectAnswers: number
  averageTime: number
}

interface Achievement {
  id: string
  title: string
  description: string
  icon: string
  unlocked: boolean
  progress: number
  target: number
}

type DifficultyLevel = 'easy' | 'medium' | 'hard'
type PowerUpType = 'timeFreeze' | 'doubleScore' | 'hint' | 'skipQuestion'

export default function ComparisonGamePage() {
  const [mounted, setMounted] = useState(false)
  const [gameStarted, setGameStarted] = useState(false)
  const [gameCompleted, setGameCompleted] = useState(false)
  const [currentQuestion, setCurrentQuestion] = useState(0)
  const [selectedAnswer, setSelectedAnswer] = useState<string>("")
  const [showResult, setShowResult] = useState(false)
  const [timeLeft, setTimeLeft] = useState(30)
  const [questions, setQuestions] = useState<ComparisonQuestion[]>([])
  const [gameStats, setGameStats] = useState<GameStats>({
    score: 0,
    correctAnswers: 0,
    timeSpent: 0,
    streak: 0,
    bestStreak: 0,
    perfectAnswers: 0,
    averageTime: 0
  })
  const [difficulty, setDifficulty] = useState<DifficultyLevel>('medium')
  const [isPaused, setIsPaused] = useState(false)
  const [showAchievements, setShowAchievements] = useState(false)
  const [unlockedAchievements, setUnlockedAchievements] = useState<string[]>([])
  const [activePowerUps, setActivePowerUps] = useState<PowerUpType[]>([])
  const [showSettings, setShowSettings] = useState(false)
  const [soundEnabled, setSoundEnabled] = useState(true)
  const [hapticEnabled, setHapticEnabled] = useState(true)
  const [startTime, setStartTime] = useState<Date>()
  const [questionStartTime, setQuestionStartTime] = useState<Date>()
  const [draggedSymbol, setDraggedSymbol] = useState<string | null>(null)
  const [dropZoneActive, setDropZoneActive] = useState(false)
  const [isDragging, setIsDragging] = useState(false)
  const [showParticles, setShowParticles] = useState(false)
  const [isWrongAnswer, setIsWrongAnswer] = useState(false)
  const [comboMultiplier, setComboMultiplier] = useState(1)
  const [showCombo, setShowCombo] = useState(false)
  const [hoveringDropZone, setHoveringDropZone] = useState(false)
  const dropZoneRef = useRef<HTMLDivElement>(null)
  const [isDownloading, setIsDownloading] = useState(false)
  const [downloadProgress, setDownloadProgress] = useState(0)
  const [downloadComplete, setDownloadComplete] = useState(false)
  
  // Sound effect functions (using Web Audio API)
  const playSound = useCallback((type: 'drag' | 'drop' | 'correct' | 'wrong' | 'combo' | 'tick') => {
    if (typeof window === 'undefined') return
    
    const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)()
    const oscillator = audioContext.createOscillator()
    const gainNode = audioContext.createGain()
    
    oscillator.connect(gainNode)
    gainNode.connect(audioContext.destination)
    
    switch (type) {
      case 'drag':
        oscillator.frequency.value = 300
        gainNode.gain.setValueAtTime(0.1, audioContext.currentTime)
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.1)
        break
      case 'drop':
        oscillator.frequency.value = 200
        gainNode.gain.setValueAtTime(0.2, audioContext.currentTime)
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.2)
        break
      case 'correct':
        oscillator.frequency.value = 523
        gainNode.gain.setValueAtTime(0.3, audioContext.currentTime)
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5)
        break
      case 'wrong':
        oscillator.frequency.value = 150
        oscillator.type = 'sawtooth'
        gainNode.gain.setValueAtTime(0.2, audioContext.currentTime)
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.3)
        break
      case 'combo':
        oscillator.frequency.value = 659
        oscillator.type = 'sine'
        gainNode.gain.setValueAtTime(0.4, audioContext.currentTime)
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.6)
        break
      case 'tick':
        oscillator.frequency.value = 800
        gainNode.gain.setValueAtTime(0.05, audioContext.currentTime)
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.05)
        break
    }
    
    oscillator.start()
    oscillator.stop(audioContext.currentTime + 1)
  }, [])
  
  // Create drag controls for each symbol (reusing audio widget pattern)
  const dragControls1 = useDragControls()
  const dragControls2 = useDragControls()
  const dragControls3 = useDragControls()

  const symbols = [
    { symbol: ">", label: "Greater than", color: "from-red-500 to-red-600" },
    { symbol: "<", label: "Less than", color: "from-blue-500 to-blue-600" },
    { symbol: "=", label: "Equal to", color: "from-green-500 to-green-600" }
  ]

  useEffect(() => {
    setMounted(true)
    generateQuestions()
  }, [])

  useEffect(() => {
    if (gameStarted && !gameCompleted && !showResult && timeLeft > 0) {
      const timer = setTimeout(() => {
        setTimeLeft(prev => prev - 1)
      }, 1000)
      return () => clearTimeout(timer)
    } else if (timeLeft === 0 && !showResult) {
      handleAnswer("", true)
    }
  }, [gameStarted, gameCompleted, showResult, timeLeft])

  const generateQuestions = () => {
    const newQuestions: ComparisonQuestion[] = []
    for (let i = 0; i < 10; i++) {
      const leftNumber = Math.floor(Math.random() * 100) + 1
      let rightNumber = Math.floor(Math.random() * 100) + 1
      
      // Ensure variety
      if (Math.random() > 0.7) {
        rightNumber = leftNumber // Some equal questions
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

      newQuestions.push({
        id: i + 1,
        leftNumber,
        rightNumber,
        correctAnswer,
        explanation
      })
    }
    setQuestions(newQuestions)
  }

  const startGame = () => {
    setGameStarted(true)
    setStartTime(new Date())
    setQuestionStartTime(new Date())
    setCurrentQuestion(0)
    setTimeLeft(30)
    setGameStats({
      score: 0,
      correctAnswers: 0,
      timeSpent: 0,
      streak: 0,
      bestStreak: 0
    })
  }

  const handleAnswer = useCallback((answer: string, timeUp: boolean = false) => {
    setSelectedAnswer(answer)
    setShowResult(true)

    const questionTime = questionStartTime ? 
      (new Date().getTime() - questionStartTime.getTime()) / 1000 : 30
    
    const isCorrect = !timeUp && answer === questions[currentQuestion].correctAnswer
    const isFast = questionTime < 10
    
    let pointsEarned = 0
    const newStreak = isCorrect ? gameStats.streak + 1 : 0

    if (isCorrect) {
      // Play correct sound and show particles
      playSound('correct')
      setShowParticles(true)
      setTimeout(() => setShowParticles(false), 2000)
      
      pointsEarned = 10
      if (isFast) pointsEarned += 5
      
      // Combo system
      if (newStreak >= 3) {
        pointsEarned += newStreak * 2
        setComboMultiplier(newStreak)
        setShowCombo(true)
        playSound('combo')
        setTimeout(() => setShowCombo(false), 1500)
      }

      setGameStats(prev => ({
        ...prev,
        score: prev.score + pointsEarned,
        correctAnswers: prev.correctAnswers + 1,
        streak: newStreak,
        bestStreak: Math.max(prev.bestStreak, newStreak)
      }))
    } else {
      // Play wrong sound and screen shake
      playSound('wrong')
      setIsWrongAnswer(true)
      setTimeout(() => setIsWrongAnswer(false), 600)
      
      setGameStats(prev => ({
        ...prev,
        streak: 0
      }))
    }

    setTimeout(() => {
      if (currentQuestion < questions.length - 1) {
        setCurrentQuestion(prev => prev + 1)
        setSelectedAnswer("")
        setShowResult(false)
        setTimeLeft(30)
        setQuestionStartTime(new Date())
        setHoveringDropZone(false)
      } else {
        const endTime = new Date()
        const timeSpent = startTime ? Math.floor((endTime.getTime() - startTime.getTime()) / 1000) : 0
        setGameStats(prev => ({ ...prev, timeSpent }))
        setGameCompleted(true)
      }
    }, timeUp ? 1500 : 2500)
  }, [currentQuestion, questions, questionStartTime, startTime, gameStats.streak, playSound])

  // Enhanced drag handlers with physics and feedback
  const handleDragEnd = useCallback((symbol: string, event: any, info: PanInfo) => {
    setIsDragging(false)
    playSound('drop')
    
    // Enhanced hit detection with magnetic snap
    const dropZone = document.querySelector('[data-drop-zone]') as HTMLElement
    if (dropZone) {
      const dropRect = dropZone.getBoundingClientRect()
      const { x, y } = info.point
      
      // Expanded hit area for better UX
      const expandedHitArea = {
        left: dropRect.left - 20,
        right: dropRect.right + 20,
        top: dropRect.top - 20,
        bottom: dropRect.bottom + 20
      }
      
      if (
        x >= expandedHitArea.left &&
        x <= expandedHitArea.right &&
        y >= expandedHitArea.top &&
        y <= expandedHitArea.bottom
      ) {
        if (!showResult) {
          handleAnswer(symbol)
        }
      } else {
        // Wrong drop - bounce back with physics
        const symbolElement = event.target.closest('[data-symbol]')
        if (symbolElement) {
          // Animate bounce back to original position
          symbolElement.style.transform = 'scale(0.8)'
          setTimeout(() => {
            symbolElement.style.transform = 'scale(1)'
          }, 200)
        }
      }
    }
    setDraggedSymbol(null)
    setHoveringDropZone(false)
  }, [showResult, handleAnswer, playSound])

  const handleDrag = useCallback((event: any, info: PanInfo) => {
    // Check proximity to drop zone for hover effect
    const dropZone = document.querySelector('[data-drop-zone]') as HTMLElement
    if (dropZone) {
      const dropRect = dropZone.getBoundingClientRect()
      const { x, y } = info.point
      
      const distance = Math.sqrt(
        Math.pow(x - (dropRect.left + dropRect.width / 2), 2) +
        Math.pow(y - (dropRect.top + dropRect.height / 2), 2)
      )
      
      if (distance < 100 && !hoveringDropZone) {
        setHoveringDropZone(true)
        playSound('tick')
      } else if (distance >= 100 && hoveringDropZone) {
        setHoveringDropZone(false)
      }
    }
  }, [hoveringDropZone, playSound])

  const startDrag = useCallback((symbol: string, event: React.PointerEvent, dragControls: any) => {
    if (!showResult) {
      setDraggedSymbol(symbol)
      dragControls.start(event)
    }
  }, [showResult])

  const resetGame = () => {
    setGameStarted(false)
    setGameCompleted(false)
    setCurrentQuestion(0)
    setSelectedAnswer("")
    setShowResult(false)
    setTimeLeft(30)
    generateQuestions()
    setGameStats({
      score: 0,
      correctAnswers: 0,
      timeSpent: 0,
      streak: 0,
      bestStreak: 0
    })
  }

  const getTimeColor = () => {
    if (timeLeft > 20) return "text-green-600 dark:text-green-400"
    if (timeLeft > 10) return "text-yellow-600 dark:text-yellow-400"
    return "text-red-600 dark:text-red-400"
  }

  const getGrade = () => {
    const percentage = (gameStats.correctAnswers / questions.length) * 100
    if (percentage >= 90) return { grade: "A+", color: "text-green-600", message: "Outstanding! 🎉" }
    if (percentage >= 80) return { grade: "A", color: "text-green-600", message: "Excellent work! ⭐" }
    if (percentage >= 70) return { grade: "B", color: "text-blue-600", message: "Great job! 👏" }
    if (percentage >= 60) return { grade: "C", color: "text-yellow-600", message: "Good effort! 💪" }
    return { grade: "D", color: "text-red-600", message: "Keep practicing! 📚" }
  }

  // Download functionality
  const downloadGameResults = async (type: 'json' | 'certificate' | 'summary') => {
    setIsDownloading(true)
    setDownloadProgress(0)
    
    // Simulate download progress
    const progressInterval = setInterval(() => {
      setDownloadProgress(prev => {
        if (prev >= 100) {
          clearInterval(progressInterval)
          return 100
        }
        return prev + 10
      })
    }, 200)

    // Wait for progress to complete
    setTimeout(async () => {
      const grade = getGrade()
      const currentDate = new Date().toLocaleDateString()
      const percentage = Math.round((gameStats.correctAnswers / questions.length) * 100)
      
      let content = ''
      let filename = ''
      let mimeType = ''

      if (type === 'json') {
        // JSON results
        const results = {
          gameType: 'Number Comparison Game',
          completionDate: currentDate,
          results: {
            grade: grade.grade,
            score: gameStats.score,
            correctAnswers: gameStats.correctAnswers,
            totalQuestions: questions.length,
            accuracy: percentage,
            timeSpent: gameStats.timeSpent,
            bestStreak: gameStats.bestStreak
          },
          questions: questions.map((q, index) => ({
            questionNumber: index + 1,
            leftNumber: q.leftNumber,
            rightNumber: q.rightNumber,
            correctAnswer: q.correctAnswer,
            explanation: q.explanation
          }))
        }
        content = JSON.stringify(results, null, 2)
        filename = `comparison-game-results-${currentDate.replace(/\//g, '-')}.json`
        mimeType = 'application/json'
        
      } else if (type === 'certificate') {
        // Certificate HTML
        content = `<!DOCTYPE html>
<html>
<head>
    <title>Certificate of Achievement</title>
    <style>
        body {
            font-family: 'Georgia', serif;
            text-align: center;
            padding: 40px;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            margin: 0;
            min-height: 100vh;
            display: flex;
            align-items: center;
            justify-content: center;
        }
        .certificate {
            background: white;
            padding: 60px;
            border-radius: 20px;
            box-shadow: 0 20px 40px rgba(0,0,0,0.1);
            max-width: 800px;
            border: 8px solid #f0f0f0;
            position: relative;
        }
        .certificate::before {
            content: '';
            position: absolute;
            top: 20px;
            left: 20px;
            right: 20px;
            bottom: 20px;
            border: 3px solid #667eea;
            border-radius: 10px;
        }
        .header {
            color: #667eea;
            font-size: 48px;
            margin-bottom: 20px;
            font-weight: bold;
        }
        .title {
            font-size: 36px;
            color: #333;
            margin-bottom: 30px;
        }
        .student-name {
            font-size: 32px;
            color: #667eea;
            font-weight: bold;
            margin: 30px 0;
            border-bottom: 2px solid #667eea;
            padding-bottom: 10px;
            display: inline-block;
        }
        .achievement {
            font-size: 24px;
            color: #555;
            margin: 20px 0;
            line-height: 1.6;
        }
        .grade {
            font-size: 72px;
            font-weight: bold;
            color: #667eea;
            margin: 30px 0;
            text-shadow: 2px 2px 4px rgba(0,0,0,0.1);
        }
        .stats {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
            gap: 20px;
            margin: 40px 0;
        }
        .stat {
            background: #f8f9ff;
            padding: 20px;
            border-radius: 10px;
            border: 2px solid #e0e7ff;
        }
        .stat-value {
            font-size: 28px;
            font-weight: bold;
            color: #667eea;
        }
        .stat-label {
            font-size: 14px;
            color: #666;
            text-transform: uppercase;
            letter-spacing: 1px;
        }
        .date {
            margin-top: 40px;
            font-size: 18px;
            color: #666;
        }
        .signature {
            margin-top: 60px;
            display: flex;
            justify-content: space-between;
            align-items: end;
        }
        .signature-line {
            border-top: 2px solid #333;
            padding-top: 10px;
            width: 200px;
            text-align: center;
            font-size: 14px;
            color: #666;
        }
        .trophy {
            font-size: 64px;
            margin: 20px 0;
        }
    </style>
</head>
<body>
    <div class="certificate">
        <div class="header">🏆 CERTIFICATE OF ACHIEVEMENT 🏆</div>
        
        <div class="title">Number Comparison Game</div>
        
        <div class="achievement">
            This certifies that
        </div>
        
        <div class="student-name">Student Name</div>
        
        <div class="achievement">
            has successfully completed the Number Comparison Game<br>
            and demonstrated excellent mathematical skills
        </div>
        
        <div class="trophy">🎖️</div>
        
        <div class="grade">${grade.grade}</div>
        
        <div class="stats">
            <div class="stat">
                <div class="stat-value">${gameStats.score}</div>
                <div class="stat-label">Final Score</div>
            </div>
            <div class="stat">
                <div class="stat-value">${percentage}%</div>
                <div class="stat-label">Accuracy</div>
            </div>
            <div class="stat">
                <div class="stat-value">${gameStats.correctAnswers}/10</div>
                <div class="stat-label">Correct Answers</div>
            </div>
            <div class="stat">
                <div class="stat-value">${gameStats.bestStreak}</div>
                <div class="stat-label">Best Streak</div>
            </div>
        </div>
        
        <div class="date">Awarded on ${currentDate}</div>
        
        <div class="signature">
            <div class="signature-line">
                VTU Vault Mathematics
            </div>
            <div class="signature-line">
                Grade 6 Instructor
            </div>
        </div>
    </div>
</body>
</html>`
        filename = `comparison-game-certificate-${currentDate.replace(/\//g, '-')}.html`
        mimeType = 'text/html'
        
      } else {
        // Text summary
        content = `NUMBER COMPARISON GAME - PERFORMANCE SUMMARY
${'='.repeat(50)}

Date: ${currentDate}
Game Type: Number Comparison Game
Grade Level: 6th Grade Mathematics

RESULTS:
${'-'.repeat(20)}
Final Grade: ${grade.grade}
Final Score: ${gameStats.score} points
Correct Answers: ${gameStats.correctAnswers} out of ${questions.length}
Accuracy: ${percentage}%
Time Spent: ${Math.floor(gameStats.timeSpent / 60)}:${(gameStats.timeSpent % 60).toString().padStart(2, '0')}
Best Streak: ${gameStats.bestStreak} consecutive correct answers

PERFORMANCE ANALYSIS:
${'-'.repeat(25)}
${grade.message}

RECOMMENDations:
${'-'.repeat(20)}
${percentage >= 90 ? '• Excellent work! Try more advanced comparison problems.' : 
  percentage >= 70 ? '• Good progress! Practice with larger numbers for improvement.' :
  '• Keep practicing! Focus on understanding comparison symbols.'}
• Regular practice will improve speed and accuracy
• Try the game again to beat your current score

QUESTION REVIEW:
${'-'.repeat(18)}
${questions.map((q, i) => `${i + 1}. ${q.leftNumber} ${q.correctAnswer} ${q.rightNumber} - ${q.explanation}`).join('\n')}

${'='.repeat(50)}
Generated by VTU Vault - Grade 6 Mathematics Platform`
        filename = `comparison-game-summary-${currentDate.replace(/\//g, '-')}.txt`
        mimeType = 'text/plain'
      }

      // Create and download file
      const blob = new Blob([content], { type: mimeType })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = filename
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)

      setDownloadComplete(true)
      setIsDownloading(false)
      
      // Reset download state after 3 seconds
      setTimeout(() => {
        setDownloadComplete(false)
        setDownloadProgress(0)
      }, 3000)
    }, 2000)
  }

  if (!mounted) return null

  // Game Start Screen
  if (!gameStarted) {
    return (
      <div className="min-h-screen bg-white dark:bg-black">
        <section className="pt-20 md:pt-24 pb-8 px-2 md:px-4">
        <div className="max-w-4xl mx-auto px-2 md:px-4">
            <Link href="/grade/6/mathematics">
              <Button variant="ghost" className="mb-6 text-zinc-600 dark:text-zinc-400 hover:text-black dark:hover:text-white">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Mathematics
              </Button>
            </Link>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center mb-8"
            >
              <div className="w-16 h-16 md:w-20 md:h-20 rounded-xl bg-gradient-to-br from-blue-500 to-blue-700 dark:from-blue-400 dark:to-blue-600 flex items-center justify-center mx-auto mb-6 shadow-lg">
                <span className="text-2xl md:text-3xl">🔢</span>
              </div>
              <h1 className="text-2xl md:text-4xl font-bold text-black dark:text-white mb-4">
                Number Comparison Game
              </h1>
              <p className="text-sm md:text-lg text-zinc-600 dark:text-zinc-400 mb-6 max-w-2xl mx-auto">
                Drag and drop comparison symbols to compare numbers! Test your skills with timed challenges.
              </p>
              
              <div className="flex justify-center gap-4 mb-8 flex-wrap">
                <div className="text-center p-3 bg-zinc-100 dark:bg-zinc-900 rounded-lg">
                  <Timer className="h-6 w-6 mx-auto mb-1 text-blue-600 dark:text-blue-400" />
                  <p className="text-xs text-zinc-600 dark:text-zinc-400">30s per question</p>
                </div>
                <div className="text-center p-3 bg-zinc-100 dark:bg-zinc-900 rounded-lg">
                  <Zap className="h-6 w-6 mx-auto mb-1 text-yellow-600 dark:text-yellow-400" />
                  <p className="text-xs text-zinc-600 dark:text-zinc-400">Speed bonuses</p>
                </div>
                <div className="text-center p-3 bg-zinc-100 dark:bg-zinc-900 rounded-lg">
                  <Trophy className="h-6 w-6 mx-auto mb-1 text-green-600 dark:text-green-400" />
                  <p className="text-xs text-zinc-600 dark:text-zinc-400">Streak rewards</p>
                </div>
              </div>
            </motion.div>

            <Card className="shadow-lg border-zinc-200 dark:border-zinc-800">
              <div className="p-6 md:p-8">
                <h2 className="text-lg font-bold text-black dark:text-white mb-4 text-center">
                  How to Play
                </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-8 mb-6 md:mb-8">
                  <div className="text-center p-4">
                    <div className="w-8 h-8 rounded-full bg-blue-500 text-white flex items-center justify-center mx-auto mb-2 text-sm font-bold">1</div>
                    <p className="text-sm text-zinc-600 dark:text-zinc-400">Look at the two numbers</p>
                  </div>
                  <div className="text-center p-4">
                    <div className="w-8 h-8 rounded-full bg-blue-500 text-white flex items-center justify-center mx-auto mb-2 text-sm font-bold">2</div>
                    <p className="text-sm text-zinc-600 dark:text-zinc-400">Drag the correct symbol</p>
                  </div>
                  <div className="text-center p-4">
                    <div className="w-8 h-8 rounded-full bg-blue-500 text-white flex items-center justify-center mx-auto mb-2 text-sm font-bold">3</div>
                    <p className="text-sm text-zinc-600 dark:text-zinc-400">Answer quickly for bonuses!</p>
                  </div>
                </div>

                <div className="bg-zinc-50 dark:bg-zinc-900 rounded-lg p-4 mb-6">
                  <h3 className="font-semibold text-black dark:text-white mb-3 text-center">Symbols</h3>
                  <div className="grid grid-cols-3 gap-4">
                    {symbols.map((sym, index) => (
                      <div key={index} className="text-center p-2">
                        <div className="text-2xl mb-1 font-bold text-zinc-700 dark:text-zinc-300">{sym.symbol}</div>
                        <p className="text-xs text-zinc-600 dark:text-zinc-400">{sym.label}</p>
                      </div>
                    ))}
                  </div>
                </div>

            <div className="text-center mb-6 md:mb-8">
                  <Button 
                    size="lg" 
                    onClick={startGame}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3"
                  >
                    <Play className="mr-2 h-5 w-5" />
                    Start Game
                  </Button>
                </div>
              </div>
            </Card>
          </div>
        </section>
      </div>
    )
  }

  // Game Complete Screen
  if (gameCompleted) {
    const grade = getGrade()
    
    return (
      <div className="min-h-screen bg-white dark:bg-black">
        <section className="pt-20 md:pt-24 pb-8 px-2 md:px-4">
          <div className="max-w-3xl mx-auto">
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-center mb-8"
            >
              <div className="text-6xl mb-4">🏆</div>
              <h1 className="text-2xl md:text-4xl font-bold text-black dark:text-white mb-4">
                Game Complete!
              </h1>
              <p className="text-lg text-zinc-600 dark:text-zinc-400 mb-6">{grade.message}</p>
              
              <div className={`text-6xl font-bold mb-4 ${grade.color}`}>
                {grade.grade}
              </div>
            </motion.div>

            <Card className="shadow-lg border-zinc-200 dark:border-zinc-800 mb-6">
              <div className="p-6">
                <h2 className="text-lg font-bold text-black dark:text-white mb-4 text-center">Final Results</h2>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="text-center p-4 bg-blue-50 dark:bg-blue-950 rounded-lg">
                    <Trophy className="h-6 w-6 text-blue-600 dark:text-blue-400 mx-auto mb-2" />
                    <p className="text-sm text-zinc-600 dark:text-zinc-400">Score</p>
                    <p className="text-lg font-bold text-blue-600 dark:text-blue-400">{gameStats.score}</p>
                  </div>
                  <div className="text-center p-4 bg-green-50 dark:bg-green-950 rounded-lg">
                    <CheckCircle className="h-6 w-6 text-green-600 dark:text-green-400 mx-auto mb-2" />
                    <p className="text-sm text-zinc-600 dark:text-zinc-400">Correct</p>
                    <p className="text-lg font-bold text-green-600 dark:text-green-400">{gameStats.correctAnswers}/10</p>
                  </div>
                  <div className="text-center p-4 bg-yellow-50 dark:bg-yellow-950 rounded-lg">
                    <Star className="h-6 w-6 text-yellow-600 dark:text-yellow-400 mx-auto mb-2" />
                    <p className="text-sm text-zinc-600 dark:text-zinc-400">Best Streak</p>
                    <p className="text-lg font-bold text-yellow-600 dark:text-yellow-400">{gameStats.bestStreak}</p>
                  </div>
                  <div className="text-center p-4 bg-purple-50 dark:bg-purple-950 rounded-lg">
                    <Timer className="h-6 w-6 text-purple-600 dark:text-purple-400 mx-auto mb-2" />
                    <p className="text-sm text-zinc-600 dark:text-zinc-400">Time</p>
                    <p className="text-lg font-bold text-purple-600 dark:text-purple-400">{Math.floor(gameStats.timeSpent / 60)}:{(gameStats.timeSpent % 60).toString().padStart(2, '0')}</p>
                  </div>
                </div>
              </div>
            </Card>

            {/* Download Section */}
            <Card className="shadow-lg border-zinc-200 dark:border-zinc-800 mb-6">
              <div className="p-6">
                <h2 className="text-lg font-bold text-black dark:text-white mb-4 text-center flex items-center justify-center gap-2">
                  <Download className="h-5 w-5" />
                  Download Your Results
                </h2>
                <p className="text-sm text-zinc-600 dark:text-zinc-400 text-center mb-4">
                  Save your game performance as a file to track your progress!
                </p>
                
                {/* Download Progress */}
                {isDownloading && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mb-4"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm text-zinc-600 dark:text-zinc-400">Preparing download...</span>
                      <span className="text-sm font-medium text-blue-600 dark:text-blue-400">{downloadProgress}%</span>
                    </div>
                    <div className="w-full bg-zinc-200 dark:bg-zinc-800 rounded-full h-2">
                      <motion.div 
                        className="bg-gradient-to-r from-blue-500 to-purple-600 h-2 rounded-full"
                        initial={{ width: 0 }}
                        animate={{ width: `${downloadProgress}%` }}
                        transition={{ duration: 0.3 }}
                      />
                    </div>
                  </motion.div>
                )}
                
                {downloadComplete && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="mb-4 p-3 bg-green-50 dark:bg-green-950 border border-green-200 dark:border-green-800 rounded-lg"
                  >
                    <div className="flex items-center justify-center gap-2 text-green-700 dark:text-green-300">
                      <CheckCircle className="h-5 w-5" />
                      <span className="font-medium">Download Complete! ✓</span>
                    </div>
                  </motion.div>
                )}
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <Button
                    onClick={() => downloadGameResults('summary')}
                    variant="outline"
                    size="sm"
                    disabled={isDownloading}
                    className="flex items-center justify-center gap-2"
                  >
                    <FileText className="h-4 w-4" />
                    Text Summary
                  </Button>
                  
                  <Button
                    onClick={() => downloadGameResults('json')}
                    variant="outline"
                    size="sm"
                    disabled={isDownloading}
                    className="flex items-center justify-center gap-2"
                  >
                    <Download className="h-4 w-4" />
                    JSON Data
                  </Button>
                  
                  <Button
                    onClick={() => downloadGameResults('certificate')}
                    variant="outline"
                    size="sm"
                    disabled={isDownloading}
                    className="flex items-center justify-center gap-2 text-purple-600 dark:text-purple-400 border-purple-200 dark:border-purple-800 hover:bg-purple-50 dark:hover:bg-purple-950"
                  >
                    <Award className="h-4 w-4" />
                    Certificate
                  </Button>
                </div>
                
                <div className="mt-4 text-xs text-zinc-500 dark:text-zinc-500 text-center">
                  <p>• Text Summary: Human-readable performance report</p>
                  <p>• JSON Data: Structured data for analysis</p>
                  <p>• Certificate: Printable achievement certificate</p>
                </div>
              </div>
            </Card>

            <div className="flex gap-4 justify-center">
              <Button onClick={resetGame} variant="outline" size="lg">
                <RotateCcw className="mr-2 h-5 w-5" />
                Play Again
              </Button>
              <Link href="/grade/6/mathematics">
                <Button size="lg">
                  <ArrowLeft className="mr-2 h-5 w-5" />
                  Back to Mathematics
                </Button>
              </Link>
            </div>
          </div>
        </section>
      </div>
    )
  }

  // Particle component
  const Particle = ({ delay }: { delay: number }) => (
    <motion.div
      className="absolute w-2 h-2 bg-yellow-400 rounded-full"
      initial={{ 
        opacity: 0,
        scale: 0,
        x: Math.random() * 400 - 200,
        y: Math.random() * 400 - 200
      }}
      animate={{
        opacity: [0, 1, 0],
        scale: [0, 1.5, 0],
        y: [0, -100, -200]
      }}
      transition={{
        duration: 2,
        delay: delay,
        ease: "easeOut"
      }}
    />
  )

  // Main Game
  const currentQ = questions[currentQuestion]
  const progress = ((currentQuestion + 1) / questions.length) * 100

  return (
    <motion.div 
      className="min-h-screen bg-white dark:bg-black relative overflow-hidden"
      animate={isWrongAnswer ? { x: [-10, 10, -10, 10, 0] } : {}}
      transition={{ duration: 0.6 }}
    >
      {/* Particle Effects */}
      <AnimatePresence>
        {showParticles && (
          <div className="fixed inset-0 pointer-events-none z-50">
            {Array.from({ length: 20 }, (_, i) => (
              <Particle key={i} delay={i * 0.1} />
            ))}
          </div>
        )}
      </AnimatePresence>

      {/* Combo Display */}
      <AnimatePresence>
        {showCombo && (
          <motion.div
            className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-50 pointer-events-none"
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: [0, 1.2, 1], opacity: [0, 1, 1] }}
            exit={{ scale: 0, opacity: 0 }}
            transition={{ duration: 1.5 }}
          >
            <div className="bg-gradient-to-r from-purple-600 to-pink-600 text-white px-6 py-3 rounded-full text-2xl font-bold shadow-2xl">
              🔥 {comboMultiplier}x COMBO!
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <section className="pt-20 md:pt-24 pb-8 px-2 md:px-4">
        <div className="max-w-4xl mx-auto">
          {/* Game Header */}
          <div className="flex justify-between items-center mb-6">
            <div className="flex items-center gap-4">
              <span className="text-sm font-medium text-zinc-600 dark:text-zinc-400">
                Question {currentQuestion + 1}/{questions.length}
              </span>
              <span className="text-sm font-medium text-green-600 dark:text-green-400">
                Score: {gameStats.score}
              </span>
              {gameStats.streak > 0 && (
                <span className="text-sm font-medium text-orange-600 dark:text-orange-400">
                  🔥 Streak: {gameStats.streak}
                </span>
              )}
            </div>
            
            <div className={`text-xl font-bold ${getTimeColor()} flex items-center gap-2`}>
              <Timer className="h-5 w-5" />
              {timeLeft}s
            </div>
          </div>

          {/* Progress Bar */}
          <div className="w-full bg-zinc-200 dark:bg-zinc-800 rounded-full h-2 mb-8">
            <div 
              className="bg-blue-500 h-2 rounded-full transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>

          {/* Main Game Card */}
          <Card className="shadow-xl border-zinc-200 dark:border-zinc-800">
            <div className="p-6 md:p-8">
              <h2 className="text-lg font-bold text-black dark:text-white mb-6 text-center">
                Compare the numbers
              </h2>

              {/* Numbers and Drop Zone */}
              <div className="flex items-center justify-center gap-4 md:gap-8 mb-8">
                <motion.div
                  key={`left-${currentQuestion}`}
                  initial={{ scale: 0, rotateY: -90 }}
                  animate={{ scale: 1, rotateY: 0 }}
                  className="w-20 h-20 md:w-24 md:h-24 rounded-lg bg-blue-100 dark:bg-blue-900 flex items-center justify-center text-2xl md:text-3xl font-bold text-blue-700 dark:text-blue-300"
                >
                  {currentQ?.leftNumber}
                </motion.div>
                
                {/* Drop Zone */}
                <motion.div
                  data-drop-zone
                  className={`w-16 h-16 md:w-20 md:h-20 rounded-lg border-2 border-dashed flex items-center justify-center text-2xl font-bold transition-all ${
                    isDragging
                      ? 'border-green-500 bg-green-50 dark:bg-green-950 scale-110' 
                      : showResult
                        ? selectedAnswer === currentQ?.correctAnswer
                          ? 'border-green-500 bg-green-50 dark:bg-green-950 text-green-600'
                          : 'border-red-500 bg-red-50 dark:bg-red-950 text-red-600'
                        : 'border-zinc-300 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-900 text-zinc-400'
                  }`}
                  animate={isDragging ? { scale: 1.1 } : { scale: 1 }}
                  transition={{ type: "spring", stiffness: 300, damping: 30 }}
                >
                  {showResult ? (
                    <motion.span
                      initial={{ scale: 0, rotate: -180 }}
                      animate={{ scale: 1, rotate: 0 }}
                    >
                      {selectedAnswer}
                    </motion.span>
                  ) : (
                    <span>?</span>
                  )}
                </motion.div>
                
                <motion.div
                  key={`right-${currentQuestion}`}
                  initial={{ scale: 0, rotateY: 90 }}
                  animate={{ scale: 1, rotateY: 0 }}
                  className="w-20 h-20 md:w-24 md:h-24 rounded-lg bg-purple-100 dark:bg-purple-900 flex items-center justify-center text-2xl md:text-3xl font-bold text-purple-700 dark:text-purple-300"
                >
                  {currentQ?.rightNumber}
                </motion.div>
              </div>

              {/* Draggable Symbols */}
              <div className="flex justify-center">
                <div className="flex gap-4 md:gap-6">
                  {symbols.map((symbol, index) => {
                    const dragControls = index === 0 ? dragControls1 : index === 1 ? dragControls2 : dragControls3
                    return (
                      <motion.div
                        key={`${symbol.symbol}-${currentQuestion}`}
                        initial={{ opacity: 0, y: 20, x: 0 }}
                        animate={{ 
                          opacity: 1, 
                          y: 0, 
                          x: 0,
                          scale: isDragging && draggedSymbol === symbol.symbol ? 1.1 : 1,
                          rotate: isDragging && draggedSymbol === symbol.symbol ? 2 : 0
                        }}
                        exit={{ opacity: 0, scale: 0.8 }}
                        transition={{ delay: index * 0.1 + 0.5, type: "spring", stiffness: 300, damping: 30 }}
                        className="select-none"
                        drag={!showResult}
                        dragControls={dragControls}
                        dragMomentum={false}
                        dragElastic={0.2}
                        dragConstraints={{
                          top: -200,
                          left: -200,
                          right: 200,
                          bottom: 200,
                        }}
                        onDragStart={() => {
                          setIsDragging(true)
                          playSound('drag')
                        }}
                        onDrag={(event, info) => handleDrag(event, info)}
                        onDragEnd={(event, info) => handleDragEnd(symbol.symbol, event, info)}
                        whileHover={{ scale: !showResult ? 1.05 : 1 }}
                        whileDrag={{ 
                          scale: 1.15, 
                          rotate: 5,
                          zIndex: 50,
                          boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.25)"
                        }}
                        className={`
                          w-16 h-16 md:w-20 md:h-20 text-2xl font-bold rounded-lg 
                          bg-gradient-to-r ${symbol.color} text-white shadow-lg 
                          hover:shadow-xl transition-shadow duration-200
                          select-none flex items-center justify-center relative
                          ${!showResult ? 'cursor-grab active:cursor-grabbing' : 'cursor-not-allowed opacity-60'}
                          transform-gpu
                        `}
                      >
                        <div 
                          onPointerDown={(event) => startDrag(symbol.symbol, event, dragControls)}
                          className="w-full h-full flex items-center justify-center"
                        >
                          {symbol.symbol}
                        </div>
                      </motion.div>
                    )
                  })}
                </div>
              </div>

              {/* Result Display */}
              <AnimatePresence>
                {showResult && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mt-6 text-center p-4 rounded-lg bg-zinc-50 dark:bg-zinc-900"
                  >
                    <div className="flex items-center justify-center gap-2 mb-2">
                      {selectedAnswer === currentQ?.correctAnswer ? (
                        <>
                          <CheckCircle className="h-6 w-6 text-green-600" />
                          <span className="text-lg font-bold text-green-600">Correct! 🎉</span>
                        </>
                      ) : (
                        <>
                          <X className="h-6 w-6 text-red-600" />
                          <span className="text-lg font-bold text-red-600">
                            {timeLeft === 0 ? "Time's up! ⏰" : "Try again! 🤔"}
                          </span>
                        </>
                      )}
                    </div>
                    <p className="text-zinc-600 dark:text-zinc-400">{currentQ?.explanation}</p>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </Card>
        </div>
      </section>
    </motion.div>
  )
}
