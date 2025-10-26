'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { BarChart, AlertTriangle, CheckCircle, Users, Calendar, ArrowLeft } from 'lucide-react'
import { motion } from 'framer-motion'

export default function AttendanceAnalytics() {
  const [user, setUser] = useState<any>(null)
  const [analytics, setAnalytics] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [dateRange, setDateRange] = useState(30)
  const router = useRouter()

  useEffect(() => {
    checkUser()
  }, [])

  useEffect(() => {
    if (user) {
      fetchAnalytics()
    }
  }, [user, dateRange])

  const checkUser = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      router.push('/teacher/login')
    } else {
      setUser(user)
    }
    setLoading(false)
  }

  const fetchAnalytics = async () => {
    if (!user) return

    const { data: studentsData } = await supabase
      .from('students')
      .select('*')
      .eq('teacher_id', user.id)
      .order('roll_number', { ascending: true })

    if (!studentsData) return

    const endDate = new Date()
    const startDate = new Date()
    startDate.setDate(startDate.getDate() - dateRange)

    const analyticsData = await Promise.all(
      studentsData.map(async (student) => {
        const { data: attendanceData } = await supabase
          .from('attendance')
          .select('*')
          .eq('student_id', student.id)
          .gte('date', startDate.toISOString().split('T')[0])
          .lte('date', endDate.toISOString().split('T')[0])

        const totalDays = dateRange
        const presentDays = attendanceData?.filter(a => a.status === 'present').length || 0
        const absentDays = attendanceData?.filter(a => a.status === 'absent').length || 0
        const lateDays = attendanceData?.filter(a => a.status === 'late').length || 0
        const percentage = totalDays > 0 ? Math.round((presentDays / totalDays) * 100) : 0

        return {
          ...student,
          totalDays,
          presentDays,
          absentDays,
          lateDays,
          percentage
        }
      })
    )

    analyticsData.sort((a, b) => a.percentage - b.percentage)
    setAnalytics(analyticsData)
  }

  const getStatusColor = (percentage: number) => {
    if (percentage >= 75) return 'green'
    if (percentage >= 50) return 'yellow'
    return 'red'
  }

  const getStatusBadge = (percentage: number) => {
    if (percentage >= 75) {
      return { text: 'Good', color: 'bg-green-100 dark:bg-green-950 text-green-700 dark:text-green-300 border-green-300 dark:border-green-700' }
    }
    if (percentage >= 50) {
      return { text: 'Warning', color: 'bg-yellow-100 dark:bg-yellow-950 text-yellow-700 dark:text-yellow-300 border-yellow-300 dark:border-yellow-700' }
    }
    return { text: 'Critical', color: 'bg-red-100 dark:bg-red-950 text-red-700 dark:text-red-300 border-red-300 dark:border-red-700' }
  }

  const getCategoryCounts = () => {
    const good = analytics.filter(a => a.percentage >= 75).length
    const warning = analytics.filter(a => a.percentage >= 50 && a.percentage < 75).length
    const critical = analytics.filter(a => a.percentage < 50).length
    return { good, warning, critical }
  }

  const counts = getCategoryCounts()

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>Loading...</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-white dark:bg-black relative overflow-hidden">
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
            onClick={() => router.push('/teacher/attendance')}
            className="mb-6 border-zinc-200 dark:border-zinc-800 hover:bg-zinc-100 dark:hover:bg-zinc-900"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Attendance
          </Button>

          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-3xl font-bold text-black dark:text-white flex items-center gap-3">
                <BarChart className="h-8 w-8 text-blue-600 dark:text-blue-400" />
                Attendance Analytics
              </h1>
              <p className="text-zinc-600 dark:text-zinc-400 mt-1">
                Click on any student to view detailed profile
              </p>
            </div>
            <div className="flex gap-2">
              <select
                value={dateRange}
                onChange={(e) => setDateRange(parseInt(e.target.value))}
                className="px-4 py-2 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-black text-black dark:text-white"
              >
                <option value={7}>Last 7 days</option>
                <option value={30}>Last 30 days</option>
                <option value={60}>Last 60 days</option>
                <option value={90}>Last 90 days</option>
              </select>
              <Button variant="outline" onClick={() => router.push('/teacher/attendance')}>
                <Calendar className="h-4 w-4 mr-2" />
                Mark Attendance
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <Card className="border-zinc-200 dark:border-zinc-800 bg-white/80 dark:bg-black/80 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-sm text-zinc-600 dark:text-zinc-400">Total Students</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold text-black dark:text-white">{analytics.length}</p>
              </CardContent>
            </Card>

            <Card className="border-green-200 dark:border-green-800 bg-green-50/80 dark:bg-green-950/80 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-sm text-green-700 dark:text-green-300 flex items-center gap-2">
                  <CheckCircle className="h-4 w-4" />
                  Good (≥75%)
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold text-green-700 dark:text-green-300">{counts.good}</p>
              </CardContent>
            </Card>

            <Card className="border-yellow-200 dark:border-yellow-800 bg-yellow-50/80 dark:bg-yellow-950/80 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-sm text-yellow-700 dark:text-yellow-300 flex items-center gap-2">
                  <AlertTriangle className="h-4 w-4" />
                  Warning (50-75%)
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold text-yellow-700 dark:text-yellow-300">{counts.warning}</p>
              </CardContent>
            </Card>

            <Card className="border-red-200 dark:border-red-800 bg-red-50/80 dark:bg-red-950/80 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-sm text-red-700 dark:text-red-300 flex items-center gap-2">
                  <AlertTriangle className="h-4 w-4" />
                  Critical (&lt;50%)
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold text-red-700 dark:text-red-300">{counts.critical}</p>
              </CardContent>
            </Card>
          </div>

          <Card className="border-zinc-200 dark:border-zinc-800 bg-white/80 dark:bg-black/80 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="text-black dark:text-white">Student Attendance Report</CardTitle>
              <CardDescription className="text-zinc-600 dark:text-zinc-400">
                Last {dateRange} days • Click any student for detailed profile
              </CardDescription>
            </CardHeader>
            <CardContent>
              {analytics.length === 0 ? (
                <div className="text-center py-12">
                  <Users className="h-12 w-12 text-zinc-400 mx-auto mb-4" />
                  <p className="text-zinc-600 dark:text-zinc-400">No students found</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {analytics.map((student, index) => {
                    const badge = getStatusBadge(student.percentage)
                    const color = getStatusColor(student.percentage)
                    
                    return (
                      <motion.div
                        key={student.id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.05 }}
                        onClick={() => router.push(`/teacher/students/${student.id}`)}
                        className={`p-4 rounded-lg border-2 cursor-pointer hover:shadow-lg transition-all ${
                          color === 'green' ? 'border-green-300 dark:border-green-700 bg-green-50 dark:bg-green-950/50 hover:bg-green-100 dark:hover:bg-green-950' :
                          color === 'yellow' ? 'border-yellow-300 dark:border-yellow-700 bg-yellow-50 dark:bg-yellow-950/50 hover:bg-yellow-100 dark:hover:bg-yellow-950' :
                          'border-red-300 dark:border-red-700 bg-red-50 dark:bg-red-950/50 hover:bg-red-100 dark:hover:bg-red-950'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-4 flex-1">
                            <div className="w-12 h-12 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center text-blue-600 dark:text-blue-400 font-bold">
                              {student.roll_number}
                            </div>
                            <div className="flex-1">
                              <div className="flex items-center gap-2">
                                <p className="font-semibold text-black dark:text-white">
                                  {student.first_name} {student.last_name}
                                </p>
                                <span className={`text-xs px-2 py-1 rounded-full border ${badge.color}`}>
                                  {badge.text}
                                </span>
                              </div>
                              <p className="text-sm text-zinc-600 dark:text-zinc-400">
                                Grade {student.grade} • Roll {student.roll_number}
                              </p>
                            </div>
                          </div>
                          
                          <div className="flex items-center gap-6">
                            <div className="text-right">
                              <p className={`text-3xl font-bold ${
                                color === 'green' ? 'text-green-600 dark:text-green-400' :
                                color === 'yellow' ? 'text-yellow-600 dark:text-yellow-400' :
                                'text-red-600 dark:text-red-400'
                              }`}>
                                {student.percentage}%
                              </p>
                              <p className="text-xs text-zinc-600 dark:text-zinc-400">
                                {student.presentDays}/{student.totalDays} days
                              </p>
                            </div>
                            
                            <div className="w-32">
                              <div className="h-3 bg-zinc-200 dark:bg-zinc-800 rounded-full overflow-hidden">
                                <div
                                  className={`h-full transition-all duration-500 ${
                                    color === 'green' ? 'bg-green-500' :
                                    color === 'yellow' ? 'bg-yellow-500' :
                                    'bg-red-500'
                                  }`}
                                  style={{ width: `${student.percentage}%` }}
                                />
                              </div>
                              <div className="flex justify-between text-xs text-zinc-500 dark:text-zinc-500 mt-1">
                                <span>P: {student.presentDays}</span>
                                <span>A: {student.absentDays}</span>
                                <span>L: {student.lateDays}</span>
                              </div>
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    )
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
