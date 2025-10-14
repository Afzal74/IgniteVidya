'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { useRouter, useParams } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { 
  User, Calendar, TrendingUp, Award, BookOpen, Target, 
  Clock, CheckCircle, XCircle, ArrowLeft, Mail, Phone,
  BarChart3, Activity, Brain, Star
} from 'lucide-react'
import { motion } from 'framer-motion'

export default function StudentProfilePage() {
  const params = useParams()
  const studentId = params.id as string
  const [user, setUser] = useState<any>(null)
  const [student, setStudent] = useState<any>(null)
  const [attendanceData, setAttendanceData] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    checkUser()
  }, [])

  useEffect(() => {
    if (user && studentId) {
      fetchStudentProfile()
    }
  }, [user, studentId])

  const checkUser = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      router.push('/teacher/login')
    } else {
      setUser(user)
    }
    setLoading(false)
  }

  const fetchStudentProfile = async () => {
    // Fetch student details
    const { data: studentData } = await supabase
      .from('students')
      .select('*')
      .eq('id', studentId)
      .single()

    if (!studentData) {
      router.push('/teacher/students')
      return
    }

    setStudent(studentData)

    // Fetch attendance data (last 90 days)
    const endDate = new Date()
    const startDate = new Date()
    startDate.setDate(startDate.getDate() - 90)

    const { data: attendance } = await supabase
      .from('attendance')
      .select('*')
      .eq('student_id', studentId)
      .gte('date', startDate.toISOString().split('T')[0])
      .lte('date', endDate.toISOString().split('T')[0])
      .order('date', { ascending: false })

    if (attendance) {
      const totalDays = 90
      const presentDays = attendance.filter(a => a.status === 'present').length
      const absentDays = attendance.filter(a => a.status === 'absent').length
      const lateDays = attendance.filter(a => a.status === 'late').length
      const percentage = totalDays > 0 ? Math.round((presentDays / totalDays) * 100) : 0

      // Calculate recent trend (last 30 days vs previous 30 days)
      const last30Days = attendance.filter(a => {
        const date = new Date(a.date)
        const thirtyDaysAgo = new Date()
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)
        return date >= thirtyDaysAgo
      })
      const previous30Days = attendance.filter(a => {
        const date = new Date(a.date)
        const sixtyDaysAgo = new Date()
        sixtyDaysAgo.setDate(sixtyDaysAgo.getDate() - 60)
        const thirtyDaysAgo = new Date()
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)
        return date >= sixtyDaysAgo && date < thirtyDaysAgo
      })

      const recentPercentage = last30Days.length > 0 
        ? Math.round((last30Days.filter(a => a.status === 'present').length / 30) * 100)
        : 0
      const previousPercentage = previous30Days.length > 0
        ? Math.round((previous30Days.filter(a => a.status === 'present').length / 30) * 100)
        : 0
      const trend = recentPercentage - previousPercentage

      setAttendanceData({
        totalDays,
        presentDays,
        absentDays,
        lateDays,
        percentage,
        recentAttendance: last30Days,
        trend
      })
    }
  }

  const getAttendanceStatus = (percentage: number) => {
    if (percentage >= 75) return { text: 'Excellent', color: 'text-green-600 dark:text-green-400', bg: 'bg-green-100 dark:bg-green-950' }
    if (percentage >= 50) return { text: 'Needs Improvement', color: 'text-yellow-600 dark:text-yellow-400', bg: 'bg-yellow-100 dark:bg-yellow-950' }
    return { text: 'Critical', color: 'text-red-600 dark:text-red-400', bg: 'bg-red-100 dark:bg-red-950' }
  }

  const getPersonalityInsights = () => {
    if (!attendanceData) return []
    
    const insights = []
    
    if (attendanceData.percentage >= 90) {
      insights.push({ icon: Star, text: 'Highly Disciplined', color: 'text-blue-600' })
      insights.push({ icon: Award, text: 'Consistent Performer', color: 'text-purple-600' })
    }
    
    if (attendanceData.lateDays > 5) {
      insights.push({ icon: Clock, text: 'Time Management Needed', color: 'text-orange-600' })
    }
    
    if (attendanceData.trend > 10) {
      insights.push({ icon: TrendingUp, text: 'Improving Rapidly', color: 'text-green-600' })
    } else if (attendanceData.trend < -10) {
      insights.push({ icon: Activity, text: 'Declining Attendance', color: 'text-red-600' })
    }
    
    if (attendanceData.percentage >= 75 && attendanceData.lateDays < 3) {
      insights.push({ icon: CheckCircle, text: 'Reliable Student', color: 'text-green-600' })
    }
    
    return insights
  }

  if (loading || !student) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>Loading...</p>
      </div>
    )
  }

  const status = attendanceData ? getAttendanceStatus(attendanceData.percentage) : null
  const insights = getPersonalityInsights()

  return (
    <div className="min-h-screen bg-white dark:bg-black relative overflow-hidden">
      {/* Animated Background */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute inset-0 opacity-30 dark:opacity-10">
          <div className="h-full w-full bg-[linear-gradient(rgba(59,130,246,0.3)_1px,transparent_1px),linear-gradient(90deg,rgba(59,130,246,0.3)_1px,transparent_1px)] dark:bg-[linear-gradient(rgba(59,130,246,0.1)_1px,transparent_1px),linear-gradient(90deg,rgba(59,130,246,0.1)_1px,transparent_1px)] bg-[size:20px_20px] animate-pulse" />
        </div>
      </div>

      <div className="relative z-10 pt-24 pb-12 px-4 md:px-8">
        <div className="max-w-7xl mx-auto">
          {/* Back Button */}
          <Button
            variant="outline"
            onClick={() => router.back()}
            className="mb-6 border-zinc-200 dark:border-zinc-800 hover:bg-zinc-100 dark:hover:bg-zinc-900"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Analytics
          </Button>

          {/* Student Header */}
          <div className="mb-8">
            <div className="flex items-start gap-6">
              <div className="w-24 h-24 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-3xl font-bold">
                {student.first_name[0]}{student.last_name[0]}
              </div>
              <div className="flex-1">
                <h1 className="text-4xl font-bold text-black dark:text-white">
                  {student.first_name} {student.last_name}
                </h1>
                <div className="flex items-center gap-4 mt-2 text-zinc-600 dark:text-zinc-400">
                  <span className="flex items-center gap-1">
                    <BookOpen className="h-4 w-4" />
                    Grade {student.grade}
                  </span>
                  <span className="flex items-center gap-1">
                    <Target className="h-4 w-4" />
                    Roll No. {student.roll_number}
                  </span>
                  {student.email && (
                    <span className="flex items-center gap-1">
                      <Mail className="h-4 w-4" />
                      {student.email}
                    </span>
                  )}
                  {student.parent_contact && (
                    <span className="flex items-center gap-1">
                      <Phone className="h-4 w-4" />
                      {student.parent_contact}
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Overview Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <Card className={`border-zinc-200 dark:border-zinc-800 ${status?.bg}`}>
              <CardHeader>
                <CardTitle className="text-sm text-zinc-600 dark:text-zinc-400">Attendance</CardTitle>
              </CardHeader>
              <CardContent>
                <p className={`text-4xl font-bold ${status?.color}`}>
                  {attendanceData?.percentage || 0}%
                </p>
                <p className="text-sm text-zinc-600 dark:text-zinc-400 mt-1">
                  {status?.text}
                </p>
              </CardContent>
            </Card>

            <Card className="border-zinc-200 dark:border-zinc-800 bg-white/80 dark:bg-black/80">
              <CardHeader>
                <CardTitle className="text-sm text-zinc-600 dark:text-zinc-400">Present Days</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-4xl font-bold text-green-600 dark:text-green-400">
                  {attendanceData?.presentDays || 0}
                </p>
                <p className="text-sm text-zinc-600 dark:text-zinc-400 mt-1">
                  Last 90 days
                </p>
              </CardContent>
            </Card>

            <Card className="border-zinc-200 dark:border-zinc-800 bg-white/80 dark:bg-black/80">
              <CardHeader>
                <CardTitle className="text-sm text-zinc-600 dark:text-zinc-400">Absent Days</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-4xl font-bold text-red-600 dark:text-red-400">
                  {attendanceData?.absentDays || 0}
                </p>
                <p className="text-sm text-zinc-600 dark:text-zinc-400 mt-1">
                  Last 90 days
                </p>
              </CardContent>
            </Card>

            <Card className="border-zinc-200 dark:border-zinc-800 bg-white/80 dark:bg-black/80">
              <CardHeader>
                <CardTitle className="text-sm text-zinc-600 dark:text-zinc-400">Trend</CardTitle>
              </CardHeader>
              <CardContent>
                <p className={`text-4xl font-bold ${attendanceData?.trend >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                  {attendanceData?.trend >= 0 ? '+' : ''}{attendanceData?.trend || 0}%
                </p>
                <p className="text-sm text-zinc-600 dark:text-zinc-400 mt-1">
                  vs last month
                </p>
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Personality Insights */}
            <Card className="border-zinc-200 dark:border-zinc-800 bg-white/80 dark:bg-black/80 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-black dark:text-white flex items-center gap-2">
                  <Brain className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                  Personality Insights
                </CardTitle>
                <CardDescription className="text-zinc-600 dark:text-zinc-400">
                  Based on attendance and behavior patterns
                </CardDescription>
              </CardHeader>
              <CardContent>
                {insights.length === 0 ? (
                  <p className="text-zinc-600 dark:text-zinc-400 text-center py-8">
                    Not enough data to generate insights
                  </p>
                ) : (
                  <div className="space-y-3">
                    {insights.map((insight, index) => (
                      <motion.div
                        key={index}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.1 }}
                        className="flex items-center gap-3 p-3 rounded-lg bg-zinc-50 dark:bg-zinc-900"
                      >
                        <insight.icon className={`h-5 w-5 ${insight.color}`} />
                        <span className="text-black dark:text-white font-medium">
                          {insight.text}
                        </span>
                      </motion.div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Recent Attendance */}
            <Card className="border-zinc-200 dark:border-zinc-800 bg-white/80 dark:bg-black/80 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-black dark:text-white flex items-center gap-2">
                  <Calendar className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                  Recent Attendance
                </CardTitle>
                <CardDescription className="text-zinc-600 dark:text-zinc-400">
                  Last 10 days
                </CardDescription>
              </CardHeader>
              <CardContent>
                {!attendanceData?.recentAttendance || attendanceData.recentAttendance.length === 0 ? (
                  <p className="text-zinc-600 dark:text-zinc-400 text-center py-8">
                    No recent attendance data
                  </p>
                ) : (
                  <div className="space-y-2">
                    {attendanceData.recentAttendance.slice(0, 10).map((record: any, index: number) => (
                      <div
                        key={index}
                        className="flex items-center justify-between p-2 rounded-lg bg-zinc-50 dark:bg-zinc-900"
                      >
                        <span className="text-sm text-zinc-600 dark:text-zinc-400">
                          {new Date(record.date).toLocaleDateString('en-US', { 
                            weekday: 'short', 
                            month: 'short', 
                            day: 'numeric' 
                          })}
                        </span>
                        <span className={`text-sm font-medium px-2 py-1 rounded ${
                          record.status === 'present' ? 'bg-green-100 dark:bg-green-950 text-green-700 dark:text-green-300' :
                          record.status === 'late' ? 'bg-yellow-100 dark:bg-yellow-950 text-yellow-700 dark:text-yellow-300' :
                          'bg-red-100 dark:bg-red-950 text-red-700 dark:text-red-300'
                        }`}>
                          {record.status.charAt(0).toUpperCase() + record.status.slice(1)}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Academic Performance Placeholder */}
          <Card className="border-zinc-200 dark:border-zinc-800 bg-white/80 dark:bg-black/80 backdrop-blur-sm mt-6">
            <CardHeader>
              <CardTitle className="text-black dark:text-white flex items-center gap-2">
                <BarChart3 className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                Academic Performance
              </CardTitle>
              <CardDescription className="text-zinc-600 dark:text-zinc-400">
                Quiz scores, assignments, and overall progress
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-12">
                <BookOpen className="h-12 w-12 text-zinc-400 mx-auto mb-4" />
                <p className="text-zinc-600 dark:text-zinc-400">
                  Academic performance tracking coming soon
                </p>
                <p className="text-sm text-zinc-500 dark:text-zinc-500 mt-2">
                  Quiz scores and assignment grades will appear here
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
