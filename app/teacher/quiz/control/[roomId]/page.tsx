'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { useRouter, useParams } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Users, Trophy, Clock, ArrowRight, CheckCircle, X, Loader2 } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

export default function QuizControlPage() {
  const params = useParams()
  const roomId = params.roomId as string
  const router = useRouter()
  
  const [room, setRoom] = useState<any>(null)
  const [questions, setQuestions] = useState<any[]>([])
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)
  const [participants, setParticipants] = useState<any[]>([])
  const [showLeaderboard, setShowLeaderboard] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchQuizData()
    
    // Subscribe to participant updates
    const channel = supabase
      .channel(`control-room-${roomId}`)
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'quiz_participants',
          filter: `room_id=eq.${roomId}`
        },
        () => {
          fetchParticipants()
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [roomId])

  const fetchQuizData = async () => {
    // Fetch room
    const { data: roomData } = await supabase
      .from('quiz_rooms')
      .select('*')
      .eq('id', roomId)
      .single()

    if (roomData) {
      setRoom(roomData)
    }

    // Fetch questions
    const { data: questionsData } = await supabase
      .from('quiz_questions')
      .select('*')
      .eq('room_id', roomId)
      .order('order_number', { ascending: true })

    if (questionsData) {
      setQuestions(questionsData)
    }

    fetchParticipants()
    setLoading(false)
  }

  const fetchParticipants = async () => {
    const { data } = await supabase
      .from('quiz_participants')
      .select('*')
      .eq('room_id', roomId)
      .order('score', { ascending: false })

    if (data) {
      setParticipants(data)
    }
  }

  const handleNextQuestion = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setShowLeaderboard(false)
      setCurrentQuestionIndex(currentQuestionIndex + 1)
    } else {
      endQuiz()
    }
  }

  const handleShowLeaderboard = () => {
    setShowLeaderboard(true)
  }

  const endQuiz = async () => {
    await supabase
      .from('quiz_rooms')
      .update({ 
        status: 'completed',
        ended_at: new Date().toISOString()
      })
      .eq('id', roomId)

    router.push(`/teacher/quiz/results/${roomId}`)
  }

  const getAnswerLabel = (answer: string) => {
    return answer
  }

  const getLeaderboardColor = (index: number) => {
    if (index === 0) return 'from-yellow-500 to-orange-500'
    if (index === 1) return 'from-gray-400 to-gray-500'
    if (index === 2) return 'from-orange-600 to-orange-700'
    return 'from-blue-500 to-cyan-500'
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

  if (!room || questions.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>Quiz not found</p>
      </div>
    )
  }

  const currentQuestion = questions[currentQuestionIndex]

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-cyan-50 dark:from-gray-900 dark:via-purple-900/20 dark:to-blue-900/20">
      <div className="pt-24 pb-12 px-4 md:px-8">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-3xl font-bold text-black dark:text-white">
                {room.room_name}
              </h1>
              <p className="text-zinc-600 dark:text-zinc-400">
                Question {currentQuestionIndex + 1} of {questions.length}
              </p>
            </div>
            <div className="flex items-center gap-4">
              <div className="px-4 py-2 rounded-full bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 font-semibold">
                <Users className="inline h-4 w-4 mr-2" />
                {participants.length} Students
              </div>
            </div>
          </div>

          <div className="grid lg:grid-cols-3 gap-6">
            {/* Main Question Area */}
            <div className="lg:col-span-2 space-y-6">
              {!showLeaderboard ? (
                <>
                  {/* Current Question */}
                  <Card className="border-2 border-purple-200 dark:border-purple-800 bg-white/80 dark:bg-black/80 backdrop-blur-sm">
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-black dark:text-white">
                          Current Question
                        </CardTitle>
                        <span className="px-3 py-1 rounded-full bg-purple-100 dark:bg-purple-900 text-purple-700 dark:text-purple-300 text-sm font-semibold">
                          {currentQuestion.points} points
                        </span>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <p className="text-xl font-semibold text-black dark:text-white mb-6">
                        {currentQuestion.question_text}
                      </p>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {['A', 'B', 'C', 'D'].map((letter) => {
                          const optionKey = `option_${letter.toLowerCase()}` as keyof typeof currentQuestion
                          const isCorrect = currentQuestion.correct_answer === letter
                          
                          return (
                            <div
                              key={letter}
                              className={`p-4 rounded-lg border-2 ${
                                isCorrect
                                  ? 'border-green-500 bg-green-50 dark:bg-green-900/20'
                                  : 'border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50'
                              }`}
                            >
                              <div className="flex items-center gap-3">
                                <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold ${
                                  isCorrect
                                    ? 'bg-green-500 text-white'
                                    : 'bg-gray-300 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
                                }`}>
                                  {letter}
                                </div>
                                <span className="text-black dark:text-white font-medium">
                                  {currentQuestion[optionKey]}
                                </span>
                                {isCorrect && (
                                  <CheckCircle className="h-5 w-5 text-green-500 ml-auto" />
                                )}
                              </div>
                            </div>
                          )
                        })}
                      </div>

                      <div className="mt-6 p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
                        <p className="text-sm text-green-800 dark:text-green-300">
                          <CheckCircle className="inline h-4 w-4 mr-2" />
                          Correct Answer: <span className="font-bold">{currentQuestion.correct_answer}</span> - {currentQuestion[`option_${currentQuestion.correct_answer.toLowerCase()}` as keyof typeof currentQuestion]}
                        </p>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Controls */}
                  <div className="flex gap-4">
                    <Button
                      onClick={handleShowLeaderboard}
                      className="flex-1 h-14 text-lg font-semibold bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700"
                    >
                      <Trophy className="h-5 w-5 mr-2" />
                      Show Leaderboard
                    </Button>
                  </div>
                </>
              ) : (
                <>
                  {/* Leaderboard */}
                  <Card className="border-2 border-yellow-200 dark:border-yellow-800 bg-white/80 dark:bg-black/80 backdrop-blur-sm">
                    <CardHeader>
                      <CardTitle className="text-black dark:text-white flex items-center gap-2">
                        <Trophy className="h-6 w-6 text-yellow-500" />
                        Leaderboard - After Question {currentQuestionIndex + 1}
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        <AnimatePresence>
                          {participants.map((participant, index) => (
                            <motion.div
                              key={participant.id}
                              initial={{ opacity: 0, x: -20 }}
                              animate={{ opacity: 1, x: 0 }}
                              transition={{ delay: index * 0.1 }}
                              className={`flex items-center gap-4 p-4 rounded-lg ${
                                index < 3
                                  ? 'bg-gradient-to-r ' + getLeaderboardColor(index) + ' text-white'
                                  : 'bg-gray-100 dark:bg-gray-800'
                              }`}
                            >
                              <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-lg ${
                                index < 3 ? 'bg-white/20' : 'bg-gray-300 dark:bg-gray-700'
                              }`}>
                                {index + 1}
                              </div>
                              <div className="flex-1">
                                <p className={`font-semibold ${index < 3 ? 'text-white' : 'text-black dark:text-white'}`}>
                                  {participant.student_name}
                                </p>
                                <p className={`text-sm ${index < 3 ? 'text-white/80' : 'text-zinc-600 dark:text-zinc-400'}`}>
                                  {participant.answers_submitted} / {currentQuestionIndex + 1} answered
                                </p>
                              </div>
                              <div className={`text-2xl font-bold ${index < 3 ? 'text-white' : 'text-black dark:text-white'}`}>
                                {participant.score}
                              </div>
                            </motion.div>
                          ))}
                        </AnimatePresence>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Next Question Button */}
                  <Button
                    onClick={handleNextQuestion}
                    className="w-full h-14 text-lg font-semibold bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700"
                  >
                    {currentQuestionIndex < questions.length - 1 ? (
                      <>
                        <ArrowRight className="h-5 w-5 mr-2" />
                        Next Question
                      </>
                    ) : (
                      <>
                        <Trophy className="h-5 w-5 mr-2" />
                        End Quiz & Show Final Results
                      </>
                    )}
                  </Button>
                </>
              )}
            </div>

            {/* Sidebar - Live Stats */}
            <div className="space-y-6">
              {/* Progress */}
              <Card className="border-zinc-200 dark:border-zinc-800 bg-white/80 dark:bg-black/80 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="text-sm text-zinc-600 dark:text-zinc-400">
                    Quiz Progress
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <div className="flex justify-between text-sm mb-2">
                        <span className="text-zinc-600 dark:text-zinc-400">Questions</span>
                        <span className="text-black dark:text-white font-semibold">
                          {currentQuestionIndex + 1} / {questions.length}
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                        <div
                          className="bg-gradient-to-r from-purple-600 to-pink-600 h-2 rounded-full transition-all duration-500"
                          style={{ width: `${((currentQuestionIndex + 1) / questions.length) * 100}%` }}
                        />
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Quick Stats */}
              <Card className="border-zinc-200 dark:border-zinc-800 bg-white/80 dark:bg-black/80 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="text-sm text-zinc-600 dark:text-zinc-400">
                    Live Stats
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-zinc-600 dark:text-zinc-400">Total Students</span>
                    <span className="text-black dark:text-white font-bold">{participants.length}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-zinc-600 dark:text-zinc-400">Time per Q</span>
                    <span className="text-black dark:text-white font-bold">{room.time_limit}s</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-zinc-600 dark:text-zinc-400">Category</span>
                    <span className="text-black dark:text-white font-bold capitalize">{room.category}</span>
                  </div>
                </CardContent>
              </Card>

              {/* Top 3 Preview */}
              <Card className="border-zinc-200 dark:border-zinc-800 bg-white/80 dark:bg-black/80 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="text-sm text-zinc-600 dark:text-zinc-400 flex items-center gap-2">
                    <Trophy className="h-4 w-4" />
                    Top 3 Students
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  {participants.slice(0, 3).map((participant, index) => (
                    <div key={participant.id} className="flex items-center gap-2">
                      <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                        index === 0 ? 'bg-yellow-500 text-white' :
                        index === 1 ? 'bg-gray-400 text-white' :
                        'bg-orange-600 text-white'
                      }`}>
                        {index + 1}
                      </div>
                      <span className="flex-1 text-sm text-black dark:text-white truncate">
                        {participant.student_name}
                      </span>
                      <span className="text-sm font-bold text-black dark:text-white">
                        {participant.score}
                      </span>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
