'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { useRouter, useParams } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { motion, AnimatePresence } from 'framer-motion'
import { Clock, Zap, Trophy, Loader2, Volume2, VolumeX } from 'lucide-react'

interface Question {
  id: string
  question_text: string
  option_a: string
  option_b: string
  option_c: string
  option_d: string
  correct_answer: string
  points: number
  order_number: number
}

export default function QuizPlayPage() {
  const params = useParams()
  const roomId = params.roomId as string
  const router = useRouter()
  
  const [room, setRoom] = useState<any>(null)
  const [questions, setQuestions] = useState<Question[]>([])
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null)
  const [timeLeft, setTimeLeft] = useState(0)
  const [score, setScore] = useState(0)
  const [auraPoints, setAuraPoints] = useState(1000)
  const [loading, setLoading] = useState(true)
  const [answered, setAnswered] = useState(false)
  const [participantId, setParticipantId] = useState<string | null>(null)
  const [participantName, setParticipantName] = useState('')
  const [quizEnded, setQuizEnded] = useState(false)
  const [showLeaderboard, setShowLeaderboard] = useState(false)
  const [leaderboard, setLeaderboard] = useState<any[]>([])
  const [soundEnabled, setSoundEnabled] = useState(true)

  useEffect(() => {
    const name = localStorage.getItem('quiz_participant_name')
    const pId = localStorage.getItem('quiz_participant_id')
    if (name) setParticipantName(name)
    if (pId) setParticipantId(pId)
    
    fetchQuizData()
    
    // Enable sound on first user interaction
    const enableSound = () => {
      setSoundEnabled(true)
      document.removeEventListener('click', enableSound)
    }
    document.addEventListener('click', enableSound)
    
    return () => document.removeEventListener('click', enableSound)
  }, [roomId])

  useEffect(() => {
    if (room && questions.length > 0 && !answered && !quizEnded) {
      setTimeLeft(room.time_limit)
      setAuraPoints(1000)
    }
  }, [currentQuestionIndex, room, questions, answered, quizEnded])

  useEffect(() => {
    if (timeLeft > 0 && !answered && !quizEnded) {
      const timer = setInterval(() => {
        setTimeLeft(prev => {
          const newTime = prev - 1
          // Reduce aura points: 1000 points over time_limit seconds
          const pointsPerSecond = 1000 / (room?.time_limit || 15)
          setAuraPoints(prev => Math.max(0, prev - pointsPerSecond))
          
          // Play tick sound when time is running low
          if (newTime <= 5 && newTime > 0) {
            playSound('tick')
          }
          
          if (newTime === 0) {
            handleTimeout()
          }
          return newTime
        })
      }, 1000)
      
      return () => clearInterval(timer)
    }
  }, [timeLeft, answered, quizEnded, room])

  const fetchQuizData = async () => {
    try {
      // Fetch room data
      const { data: roomData } = await supabase
        .from('quiz_rooms')
        .select('*')
        .eq('id', roomId)
        .single()

      if (!roomData) {
        router.push('/quiz')
        return
      }

      setRoom(roomData)

      // Fetch questions
      const { data: questionsData } = await supabase
        .from('quiz_questions')
        .select('*')
        .eq('room_id', roomId)
        .order('order_number', { ascending: true })

      if (questionsData) {
        setQuestions(questionsData)
      }

      setLoading(false)
    } catch (error) {
      console.error('Error fetching quiz data:', error)
      setLoading(false)
    }
  }

  const playSound = (type: 'correct' | 'wrong' | 'tick' | 'finish') => {
    if (!soundEnabled) return
    
    const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)()
    const oscillator = audioContext.createOscillator()
    const gainNode = audioContext.createGain()
    
    oscillator.connect(gainNode)
    gainNode.connect(audioContext.destination)
    
    switch (type) {
      case 'correct':
        // Happy ascending notes
        oscillator.frequency.setValueAtTime(523.25, audioContext.currentTime) // C5
        oscillator.frequency.setValueAtTime(659.25, audioContext.currentTime + 0.1) // E5
        oscillator.frequency.setValueAtTime(783.99, audioContext.currentTime + 0.2) // G5
        gainNode.gain.setValueAtTime(0.3, audioContext.currentTime)
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.3)
        oscillator.start(audioContext.currentTime)
        oscillator.stop(audioContext.currentTime + 0.3)
        break
      case 'wrong':
        // Descending sad notes
        oscillator.frequency.setValueAtTime(392.00, audioContext.currentTime) // G4
        oscillator.frequency.setValueAtTime(329.63, audioContext.currentTime + 0.1) // E4
        oscillator.frequency.setValueAtTime(261.63, audioContext.currentTime + 0.2) // C4
        gainNode.gain.setValueAtTime(0.3, audioContext.currentTime)
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.3)
        oscillator.start(audioContext.currentTime)
        oscillator.stop(audioContext.currentTime + 0.3)
        break
      case 'tick':
        // Quick tick sound
        oscillator.frequency.setValueAtTime(800, audioContext.currentTime)
        gainNode.gain.setValueAtTime(0.1, audioContext.currentTime)
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.05)
        oscillator.start(audioContext.currentTime)
        oscillator.stop(audioContext.currentTime + 0.05)
        break
      case 'finish':
        // Victory fanfare
        const notes = [523.25, 659.25, 783.99, 1046.50] // C5, E5, G5, C6
        notes.forEach((freq, i) => {
          const osc = audioContext.createOscillator()
          const gain = audioContext.createGain()
          osc.connect(gain)
          gain.connect(audioContext.destination)
          osc.frequency.setValueAtTime(freq, audioContext.currentTime + i * 0.15)
          gain.gain.setValueAtTime(0.2, audioContext.currentTime + i * 0.15)
          gain.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + i * 0.15 + 0.3)
          osc.start(audioContext.currentTime + i * 0.15)
          osc.stop(audioContext.currentTime + i * 0.15 + 0.3)
        })
        break
    }
  }

  const handleTimeout = () => {
    if (!answered) {
      playSound('wrong')
      setAnswered(true)
      setTimeout(() => {
        showLeaderboardAndContinue()
      }, 2000)
    }
  }

  const fetchLeaderboard = async () => {
    const { data } = await supabase
      .from('quiz_participants')
      .select('*')
      .eq('room_id', roomId)
      .order('score', { ascending: false })
      .limit(10)
    
    if (data) {
      setLeaderboard(data)
    }
  }

  const showLeaderboardAndContinue = async () => {
    // Fetch latest leaderboard
    await fetchLeaderboard()
    
    // Show leaderboard
    setShowLeaderboard(true)
    
    // Wait 6 seconds then move to next question
    setTimeout(() => {
      setShowLeaderboard(false)
      moveToNextQuestion()
    }, 6000)
  }

  const handleAnswerSelect = async (answer: string) => {
    if (answered) return

    setSelectedAnswer(answer)
    setAnswered(true)

    const currentQuestion = questions[currentQuestionIndex]
    const isCorrect = answer === currentQuestion.correct_answer
    
    // Play sound
    playSound(isCorrect ? 'correct' : 'wrong')
    
    // Calculate points based on remaining aura
    const earnedPoints = isCorrect ? Math.round(auraPoints) : 0
    const newScore = score + earnedPoints
    setScore(newScore)

    // Update participant score in database
    if (participantId) {
      await supabase
        .from('quiz_participants')
        .update({
          score: newScore,
          answers_submitted: currentQuestionIndex + 1
        })
        .eq('id', participantId)
    }

    // Show leaderboard after 2 seconds
    setTimeout(() => {
      showLeaderboardAndContinue()
    }, 2000)
  }

  const moveToNextQuestion = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1)
      setSelectedAnswer(null)
      setAnswered(false)
    } else {
      endQuiz()
    }
  }

  const endQuiz = async () => {
    playSound('finish')
    setQuizEnded(true)
    
    // Update room status if all questions answered
    if (participantId) {
      await supabase
        .from('quiz_participants')
        .update({
          answers_submitted: questions.length
        })
        .eq('id', participantId)
    }
    
    // Fetch final leaderboard
    await fetchLeaderboard()
  }

  const getRankEmoji = (index: number) => {
    if (index === 0) return '🥇'
    if (index === 1) return '🥈'
    if (index === 2) return '🥉'
    return `${index + 1}`
  }

  const getOptionClass = (option: string) => {
    if (!answered) {
      return 'bg-white dark:bg-zinc-900 hover:bg-blue-50 dark:hover:bg-blue-950 border-2 border-zinc-200 dark:border-zinc-800 hover:border-blue-400 dark:hover:border-blue-600'
    }
    
    const currentQuestion = questions[currentQuestionIndex]
    const isCorrect = option === currentQuestion.correct_answer
    const isSelected = option === selectedAnswer

    if (isCorrect) {
      return 'bg-green-100 dark:bg-green-950 border-2 border-green-500 dark:border-green-600'
    }
    if (isSelected && !isCorrect) {
      return 'bg-red-100 dark:bg-red-950 border-2 border-red-500 dark:border-red-600'
    }
    return 'bg-zinc-100 dark:bg-zinc-800 border-2 border-zinc-300 dark:border-zinc-700 opacity-50'
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-50 via-blue-50 to-cyan-50 dark:from-gray-900 dark:via-purple-900/20 dark:to-blue-900/20">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin text-purple-600 mx-auto mb-4" />
          <p className="text-zinc-600 dark:text-zinc-400">Loading quiz...</p>
        </div>
      </div>
    )
  }

  // Leaderboard Display Component
  if (showLeaderboard) {
    const myRank = leaderboard.findIndex(p => p.id === participantId)
    const myData = leaderboard[myRank]
    
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-50 via-blue-50 to-cyan-50 dark:from-gray-900 dark:via-purple-900/20 dark:to-blue-900/20 p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="w-full max-w-2xl"
        >
          <Card className="border-2 border-purple-200 dark:border-purple-800">
            <CardContent className="p-8">
              <motion.div
                initial={{ y: -20 }}
                animate={{ y: 0 }}
                className="text-center mb-6"
              >
                <Trophy className="h-16 w-16 text-yellow-500 mx-auto mb-4" />
                <h2 className="text-3xl font-bold text-black dark:text-white mb-2">
                  Leaderboard
                </h2>
                <p className="text-zinc-600 dark:text-zinc-400">
                  Question {currentQuestionIndex + 1} of {questions.length}
                </p>
              </motion.div>

              <div className="space-y-3 mb-6">
                {leaderboard.slice(0, 5).map((participant, index) => (
                  <motion.div
                    key={participant.id}
                    initial={{ opacity: 0, x: -50 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className={`flex items-center gap-4 p-4 rounded-lg ${
                      participant.id === participantId
                        ? 'bg-gradient-to-r from-purple-100 to-blue-100 dark:from-purple-950 dark:to-blue-950 border-2 border-purple-500'
                        : 'bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800'
                    }`}
                  >
                    <div className="flex-shrink-0 w-12 h-12 rounded-full bg-gradient-to-br from-yellow-400 to-orange-500 flex items-center justify-center text-white font-bold text-xl">
                      {getRankEmoji(index)}
                    </div>
                    <div className="flex-1">
                      <p className="font-bold text-black dark:text-white">
                        {participant.student_name}
                        {participant.id === participantId && (
                          <span className="text-purple-600 dark:text-purple-400 ml-2">(You)</span>
                        )}
                      </p>
                      <p className="text-sm text-zinc-600 dark:text-zinc-400">
                        {participant.answers_submitted} answered
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                        {participant.score}
                      </p>
                      <p className="text-xs text-zinc-500">points</p>
                    </div>
                  </motion.div>
                ))}
              </div>

              {myRank > 4 && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="border-t-2 border-dashed border-zinc-300 dark:border-zinc-700 pt-4"
                >
                  <div className="flex items-center gap-4 p-4 rounded-lg bg-gradient-to-r from-purple-100 to-blue-100 dark:from-purple-950 dark:to-blue-950 border-2 border-purple-500">
                    <div className="flex-shrink-0 w-12 h-12 rounded-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center text-white font-bold">
                      {myRank + 1}
                    </div>
                    <div className="flex-1">
                      <p className="font-bold text-black dark:text-white">
                        {myData?.student_name} (You)
                      </p>
                      <p className="text-sm text-zinc-600 dark:text-zinc-400">
                        {myData?.answers_submitted} answered
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                        {myData?.score}
                      </p>
                      <p className="text-xs text-zinc-500">points</p>
                    </div>
                  </div>
                </motion.div>
              )}

              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 }}
                className="text-center mt-6"
              >
                <p className="text-sm text-zinc-600 dark:text-zinc-400">
                  Next question in <span className="font-bold text-purple-600">6</span> seconds...
                </p>
              </motion.div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    )
  }

  if (quizEnded) {
    const myRank = leaderboard.findIndex(p => p.id === participantId)
    
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-50 via-blue-50 to-cyan-50 dark:from-gray-900 dark:via-purple-900/20 dark:to-blue-900/20 p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="w-full max-w-2xl"
        >
          <Card className="border-2 border-purple-200 dark:border-purple-800">
            <CardContent className="p-8">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.2, type: 'spring' }}
              >
                <Trophy className="h-20 w-20 text-yellow-500 mx-auto mb-4" />
              </motion.div>
              <h1 className="text-3xl font-bold text-black dark:text-white mb-2 text-center">
                Quiz Complete!
              </h1>
              <p className="text-zinc-600 dark:text-zinc-400 mb-6 text-center">
                Great job, {participantName}!
              </p>
              
              <div className="bg-gradient-to-r from-purple-100 to-blue-100 dark:from-purple-950 dark:to-blue-950 rounded-lg p-6 mb-6 text-center">
                <p className="text-sm text-zinc-600 dark:text-zinc-400 mb-2">Your Final Score</p>
                <p className="text-5xl font-bold text-purple-600 dark:text-purple-400 mb-2">
                  {score}
                </p>
                <p className="text-lg font-semibold text-black dark:text-white mb-1">
                  Rank: #{myRank + 1}
                </p>
                <p className="text-sm text-zinc-600 dark:text-zinc-400">
                  {questions.length} questions answered
                </p>
              </div>

              <div className="mb-6">
                <h3 className="text-lg font-bold text-black dark:text-white mb-3 text-center">
                  Final Leaderboard
                </h3>
                <div className="space-y-2">
                  {leaderboard.slice(0, 10).map((participant, index) => (
                    <div
                      key={participant.id}
                      className={`flex items-center gap-3 p-3 rounded-lg ${
                        participant.id === participantId
                          ? 'bg-gradient-to-r from-purple-100 to-blue-100 dark:from-purple-950 dark:to-blue-950 border-2 border-purple-500'
                          : 'bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800'
                      }`}
                    >
                      <div className="flex-shrink-0 w-10 h-10 rounded-full bg-gradient-to-br from-yellow-400 to-orange-500 flex items-center justify-center text-white font-bold">
                        {getRankEmoji(index)}
                      </div>
                      <div className="flex-1">
                        <p className="font-semibold text-black dark:text-white">
                          {participant.student_name}
                          {participant.id === participantId && (
                            <span className="text-purple-600 dark:text-purple-400 ml-2">(You)</span>
                          )}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-xl font-bold text-purple-600 dark:text-purple-400">
                          {participant.score}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <Button
                onClick={() => router.push('/quiz')}
                className="w-full"
              >
                Back to Home
              </Button>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    )
  }

  const currentQuestion = questions[currentQuestionIndex]
  if (!currentQuestion) return null

  const progress = ((currentQuestionIndex + 1) / questions.length) * 100

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-cyan-50 dark:from-gray-900 dark:via-purple-900/20 dark:to-blue-900/20 p-4 relative overflow-hidden">
      {/* Animated background particles */}
      <div className="fixed inset-0 pointer-events-none">
        {[...Array(15)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-2 h-2 bg-purple-400/30 rounded-full"
            initial={{
              x: Math.random() * (typeof window !== 'undefined' ? window.innerWidth : 1000),
              y: Math.random() * (typeof window !== 'undefined' ? window.innerHeight : 1000),
            }}
            animate={{
              y: [null, Math.random() * (typeof window !== 'undefined' ? window.innerHeight : 1000)],
              x: [null, Math.random() * (typeof window !== 'undefined' ? window.innerWidth : 1000)],
            }}
            transition={{
              duration: Math.random() * 10 + 10,
              repeat: Infinity,
              ease: "linear"
            }}
          />
        ))}
      </div>

      <div className="max-w-4xl mx-auto pt-8 relative z-10">
        {/* Sound Toggle */}
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setSoundEnabled(!soundEnabled)}
          className="fixed top-4 right-4 z-50"
        >
          {soundEnabled ? <Volume2 className="h-5 w-5" /> : <VolumeX className="h-5 w-5" />}
        </Button>
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-sm text-zinc-600 dark:text-zinc-400">
                Question {currentQuestionIndex + 1} of {questions.length}
              </h2>
              <div className="w-full bg-zinc-200 dark:bg-zinc-800 h-2 rounded-full mt-2">
                <motion.div
                  className="bg-gradient-to-r from-purple-600 to-blue-600 h-2 rounded-full"
                  initial={{ width: 0 }}
                  animate={{ width: `${progress}%` }}
                  transition={{ duration: 0.5 }}
                />
              </div>
            </div>
            <div className="text-right">
              <p className="text-sm text-zinc-600 dark:text-zinc-400">Score</p>
              <p className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                {score}
              </p>
            </div>
          </div>
        </div>

        {/* Timer and Aura Points */}
        <div className="grid grid-cols-2 gap-4 mb-6">
          <Card className={`border-2 ${timeLeft <= 5 ? 'border-red-500 animate-pulse' : 'border-blue-500'}`}>
            <CardContent className="p-4 flex items-center gap-3">
              <Clock className={`h-8 w-8 ${timeLeft <= 5 ? 'text-red-600' : 'text-blue-600'}`} />
              <div>
                <p className="text-sm text-zinc-600 dark:text-zinc-400">Time Left</p>
                <p className={`text-3xl font-bold ${timeLeft <= 5 ? 'text-red-600' : 'text-blue-600'}`}>
                  {timeLeft}s
                </p>
              </div>
            </CardContent>
          </Card>

          <Card className="border-2 border-purple-500">
            <CardContent className="p-4 flex items-center gap-3">
              <Zap className="h-8 w-8 text-purple-600" />
              <div>
                <p className="text-sm text-zinc-600 dark:text-zinc-400">Aura Points</p>
                <p className="text-3xl font-bold text-purple-600">
                  {Math.round(auraPoints)}
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Question Card */}
        <AnimatePresence mode="wait">
          <motion.div
            key={currentQuestionIndex}
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -50 }}
            transition={{ duration: 0.3 }}
          >
            <Card className="border-2 border-zinc-200 dark:border-zinc-800 mb-6">
              <CardContent className="p-8">
                <h1 className="text-2xl md:text-3xl font-bold text-black dark:text-white mb-8">
                  {currentQuestion.question_text}
                </h1>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {['A', 'B', 'C', 'D'].map((option) => (
                    <motion.button
                      key={option}
                      onClick={() => handleAnswerSelect(option)}
                      disabled={answered}
                      className={`p-6 rounded-lg text-left transition-all ${getOptionClass(option)}`}
                      whileHover={!answered ? { scale: 1.02 } : {}}
                      whileTap={!answered ? { scale: 0.98 } : {}}
                    >
                      <div className="flex items-start gap-4">
                        <div className="flex-shrink-0 w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center font-bold text-blue-600 dark:text-blue-400">
                          {option}
                        </div>
                        <p className="text-lg text-black dark:text-white flex-1">
                          {currentQuestion[`option_${option.toLowerCase()}` as keyof Question]}
                        </p>
                      </div>
                    </motion.button>
                  ))}
                </div>

                {answered && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mt-6 text-center"
                  >
                    {selectedAnswer === currentQuestion.correct_answer ? (
                      <div className="text-green-600 dark:text-green-400">
                        <p className="text-xl font-bold">Correct! 🎉</p>
                        <p className="text-sm">+{Math.round(auraPoints)} points</p>
                      </div>
                    ) : (
                      <div className="text-red-600 dark:text-red-400">
                        <p className="text-xl font-bold">Incorrect</p>
                        <p className="text-sm">Correct answer: {currentQuestion.correct_answer}</p>
                      </div>
                    )}
                  </motion.div>
                )}
              </CardContent>
            </Card>
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  )
}
