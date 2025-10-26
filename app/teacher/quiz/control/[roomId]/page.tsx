'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { useRouter, useParams } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Users, Trophy, Clock, CheckCircle, XCircle, Loader2 } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

interface Participant {
  id: string
  student_name: string
  score: number
  answers_submitted: number
}

interface Question {
  id: string
  question_text: string
  option_a: string
  option_b: string
  option_c: string
  option_d: string
  correct_answer: string
  order_number: number
}

export default function TeacherControlPage() {
  const params = useParams()
  const roomId = params.roomId as string
  const router = useRouter()
  
  const [room, setRoom] = useState<any>(null)
  const [participants, setParticipants] = useState<Participant[]>([])
  const [questions, setQuestions] = useState<Question[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchData()
    
    // Subscribe to participant updates
    const channel = supabase
      .channel(`teacher-control-${roomId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'quiz_participants',
          filter: `room_id=eq.${roomId}`
        },
        () => {
          fetchParticipants()
        }
      )
      .subscribe()

    // Poll for updates every 2 seconds
    const interval = setInterval(() => {
      fetchParticipants()
    }, 2000)

    return () => {
      supabase.removeChannel(channel)
      clearInterval(interval)
    }
  }, [roomId])

  const fetchData = async () => {
    await Promise.all([
      fetchRoom(),
      fetchQuestions(),
      fetchParticipants()
    ])
    setLoading(false)
  }

  const fetchRoom = async () => {
    const { data } = await supabase
      .from('quiz_rooms')
      .select('*')
      .eq('id', roomId)
      .single()
    
    if (data) setRoom(data)
  }

  const fetchQuestions = async () => {
    const { data } = await supabase
      .from('quiz_questions')
      .select('*')
      .eq('room_id', roomId)
      .order('order_number', { ascending: true })
    
    if (data) setQuestions(data)
  }

  const fetchParticipants = async () => {
    const { data } = await supabase
      .from('quiz_participants')
      .select('*')
      .eq('room_id', roomId)
      .order('score', { ascending: false })
    
    if (data) setParticipants(data)
  }

  const endQuiz = async () => {
    await supabase
      .from('quiz_rooms')
      .update({ 
        status: 'completed',
        ended_at: new Date().toISOString()
      })
      .eq('id', roomId)
    
    router.push(`/teacher/quiz`)
  }

  const getProgressColor = (answered: number, total: number) => {
    const percentage = (answered / total) * 100
    if (percentage === 100) return 'text-green-600'
    if (percentage >= 50) return 'text-yellow-600'
    return 'text-blue-600'
  }

  const getAvatarColor = (index: number) => {
    const colors = [
      'from-blue-500 to-cyan-500',
      'from-purple-500 to-pink-500',
      'from-green-500 to-emerald-500',
      'from-orange-500 to-red-500',
      'from-indigo-500 to-purple-500',
      'from-yellow-500 to-orange-500',
    ]
    return colors[index % colors.length]
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-50 via-blue-50 to-cyan-50 dark:from-gray-900 dark:via-purple-900/20 dark:to-blue-900/20">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin text-purple-600 mx-auto mb-4" />
          <p className="text-zinc-600 dark:text-zinc-400">Loading quiz control...</p>
        </div>
      </div>
    )
  }

  const allFinished = participants.every(p => p.answers_submitted === questions.length)
  const averageScore = participants.length > 0 
    ? Math.round(participants.reduce((sum, p) => sum + p.score, 0) / participants.length)
    : 0

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-cyan-50 dark:from-gray-900 dark:via-purple-900/20 dark:to-blue-900/20 p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-black dark:text-white mb-2">
            {room?.room_name}
          </h1>
          <p className="text-zinc-600 dark:text-zinc-400">
            Quiz in Progress - Monitor your students
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <Card className="border-zinc-200 dark:border-zinc-800">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm text-zinc-600 dark:text-zinc-400 flex items-center gap-2">
                <Users className="h-4 w-4" />
                Participants
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold text-black dark:text-white">
                {participants.length}
              </p>
            </CardContent>
          </Card>

          <Card className="border-zinc-200 dark:border-zinc-800">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm text-zinc-600 dark:text-zinc-400 flex items-center gap-2">
                <Trophy className="h-4 w-4" />
                Average Score
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold text-purple-600 dark:text-purple-400">
                {averageScore}
              </p>
            </CardContent>
          </Card>

          <Card className="border-zinc-200 dark:border-zinc-800">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm text-zinc-600 dark:text-zinc-400 flex items-center gap-2">
                <CheckCircle className="h-4 w-4" />
                Completed
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold text-green-600 dark:text-green-400">
                {participants.filter(p => p.answers_submitted === questions.length).length}
              </p>
            </CardContent>
          </Card>

          <Card className="border-zinc-200 dark:border-zinc-800">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm text-zinc-600 dark:text-zinc-400 flex items-center gap-2">
                <Clock className="h-4 w-4" />
                In Progress
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold text-blue-600 dark:text-blue-400">
                {participants.filter(p => p.answers_submitted < questions.length).length}
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Leaderboard */}
        <Card className="border-zinc-200 dark:border-zinc-800 mb-8">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-black dark:text-white flex items-center gap-2">
                <Trophy className="h-5 w-5" />
                Live Leaderboard
              </CardTitle>
              {allFinished && (
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="bg-green-100 dark:bg-green-950 text-green-700 dark:text-green-300 px-4 py-2 rounded-full text-sm font-semibold"
                >
                  All Finished! 🎉
                </motion.div>
              )}
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <AnimatePresence>
                {participants.map((participant, index) => (
                  <motion.div
                    key={participant.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                    transition={{ delay: index * 0.05 }}
                    className="flex items-center gap-4 p-4 bg-white dark:bg-zinc-900 rounded-lg border border-zinc-200 dark:border-zinc-800"
                  >
                    {/* Rank */}
                    <div className="flex-shrink-0">
                      {index === 0 && (
                        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-yellow-400 to-yellow-600 flex items-center justify-center text-white font-bold text-xl">
                          🥇
                        </div>
                      )}
                      {index === 1 && (
                        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-gray-300 to-gray-500 flex items-center justify-center text-white font-bold text-xl">
                          🥈
                        </div>
                      )}
                      {index === 2 && (
                        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-orange-400 to-orange-600 flex items-center justify-center text-white font-bold text-xl">
                          🥉
                        </div>
                      )}
                      {index > 2 && (
                        <div className={`w-12 h-12 rounded-full bg-gradient-to-br ${getAvatarColor(index)} flex items-center justify-center text-white font-bold text-xl`}>
                          {index + 1}
                        </div>
                      )}
                    </div>

                    {/* Name */}
                    <div className="flex-1">
                      <p className="font-semibold text-black dark:text-white">
                        {participant.student_name}
                      </p>
                      <div className="flex items-center gap-2 mt-1">
                        <div className="flex-1 bg-zinc-200 dark:bg-zinc-800 h-2 rounded-full overflow-hidden">
                          <motion.div
                            className="bg-gradient-to-r from-blue-600 to-purple-600 h-2"
                            initial={{ width: 0 }}
                            animate={{ width: `${(participant.answers_submitted / questions.length) * 100}%` }}
                            transition={{ duration: 0.5 }}
                          />
                        </div>
                        <span className={`text-sm font-medium ${getProgressColor(participant.answers_submitted, questions.length)}`}>
                          {participant.answers_submitted}/{questions.length}
                        </span>
                      </div>
                    </div>

                    {/* Score */}
                    <div className="text-right">
                      <p className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                        {participant.score}
                      </p>
                      <p className="text-xs text-zinc-500 dark:text-zinc-500">points</p>
                    </div>

                    {/* Status */}
                    <div className="flex-shrink-0">
                      {participant.answers_submitted === questions.length ? (
                        <CheckCircle className="h-6 w-6 text-green-600" />
                      ) : (
                        <motion.div
                          animate={{ rotate: 360 }}
                          transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
                        >
                          <Loader2 className="h-6 w-6 text-blue-600" />
                        </motion.div>
                      )}
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>

              {participants.length === 0 && (
                <div className="text-center py-12">
                  <Users className="h-16 w-16 text-zinc-400 mx-auto mb-4" />
                  <p className="text-zinc-600 dark:text-zinc-400">
                    No participants yet
                  </p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Actions */}
        <div className="flex gap-4">
          <Button
            onClick={endQuiz}
            variant="destructive"
            className="flex-1"
            disabled={!allFinished}
          >
            {allFinished ? 'End Quiz & View Results' : 'Waiting for students to finish...'}
          </Button>
        </div>
      </div>
    </div>
  )
}
