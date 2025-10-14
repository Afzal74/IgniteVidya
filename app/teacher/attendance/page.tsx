'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Calendar, CheckCircle, XCircle, Clock, FileText, Users, ArrowLeft } from 'lucide-react'
import { motion } from 'framer-motion'

export default function AttendancePage() {
  const [user, setUser] = useState<any>(null)
  const [students, setStudents] = useState<any[]>([])
  const [attendance, setAttendance] = useState<any>({})
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const router = useRouter()

  useEffect(() => {
    checkUser()
  }, [])

  useEffect(() => {
    if (user) {
      fetchStudents()
      fetchAttendance()
    }
  }, [user, selectedDate])

  const checkUser = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      router.push('/teacher/login')
    } else {
      setUser(user)
    }
    setLoading(false)
  }

  const fetchStudents = async () => {
    if (!user) return
    const { data } = await supabase
      .from('students')
      .select('*')
      .eq('teacher_id', user.id)
      .order('grade', { ascending: true })
      .order('roll_number', { ascending: true })
    
    if (data) {
      setStudents(data)
    }
  }

  const fetchAttendance = async () => {
    if (!user) return
    const { data } = await supabase
      .from('attendance')
      .select('*')
      .eq('teacher_id', user.id)
      .eq('date', selectedDate)
    
    if (data) {
      const attendanceMap: any = {}
      data.forEach((record: any) => {
        attendanceMap[record.student_id] = record.status
      })
      setAttendance(attendanceMap)
    }
  }

  const markAttendance = async (studentId: string, status: string) => {
    if (!user) return
    setSaving(true)

    try {
      // Check if attendance already exists
      const { data: existing } = await supabase
        .from('attendance')
        .select('id')
        .eq('student_id', studentId)
        .eq('date', selectedDate)
        .single()

      if (existing) {
        // Update existing
        await supabase
          .from('attendance')
          .update({ status, updated_at: new Date().toISOString() })
          .eq('id', existing.id)
      } else {
        // Insert new
        await supabase
          .from('attendance')
          .insert({
            teacher_id: user.id,
            student_id: studentId,
            date: selectedDate,
            status
          })
      }

      setAttendance({ ...attendance, [studentId]: status })
    } catch (error: any) {
      alert('Error marking attendance: ' + error.message)
    } finally {
      setSaving(false)
    }
  }

  const markAllPresent = async () => {
    setSaving(true)
    for (const student of students) {
      await markAttendance(student.id, 'present')
    }
    setSaving(false)
  }

  const getAttendanceStats = () => {
    const present = Object.values(attendance).filter(s => s === 'present').length
    const absent = Object.values(attendance).filter(s => s === 'absent').length
    const late = Object.values(attendance).filter(s => s === 'late').length
    const total = students.length
    return { present, absent, late, total }
  }

  const stats = getAttendanceStats()

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>Loading...</p>
      </div>
    )
  }

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
            onClick={() => router.push('/teacher/dashboard')}
            className="mb-6 border-zinc-200 dark:border-zinc-800 hover:bg-zinc-100 dark:hover:bg-zinc-900"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Dashboard
          </Button>

          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-black dark:text-white flex items-center gap-3">
              <Calendar className="h-8 w-8 text-blue-600 dark:text-blue-400" />
              Daily Attendance
            </h1>
            <p className="text-zinc-600 dark:text-zinc-400 mt-1">
              Track student attendance
            </p>
          </div>

          {/* Date Selector & Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <Card className="border-zinc-200 dark:border-zinc-800 bg-white/80 dark:bg-black/80 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-sm text-zinc-600 dark:text-zinc-400">Date</CardTitle>
              </CardHeader>
              <CardContent>
                <input
                  type="date"
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  className="w-full bg-transparent border border-zinc-200 dark:border-zinc-800 rounded-lg px-3 py-2 text-black dark:text-white"
                />
              </CardContent>
            </Card>

            <Card className="border-zinc-200 dark:border-zinc-800 bg-white/80 dark:bg-black/80 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-sm text-zinc-600 dark:text-zinc-400 flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  Present
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold text-black dark:text-white">{stats.present}</p>
              </CardContent>
            </Card>

            <Card className="border-zinc-200 dark:border-zinc-800 bg-white/80 dark:bg-black/80 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-sm text-zinc-600 dark:text-zinc-400 flex items-center gap-2">
                  <XCircle className="h-4 w-4 text-red-600" />
                  Absent
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold text-black dark:text-white">{stats.absent}</p>
              </CardContent>
            </Card>

            <Card className="border-zinc-200 dark:border-zinc-800 bg-white/80 dark:bg-black/80 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-sm text-zinc-600 dark:text-zinc-400 flex items-center gap-2">
                  <Clock className="h-4 w-4 text-yellow-600" />
                  Late
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold text-black dark:text-white">{stats.late}</p>
              </CardContent>
            </Card>
          </div>

          {/* Quick Actions */}
          <div className="mb-6 flex gap-2">
            <Button
              onClick={markAllPresent}
              disabled={saving}
              className="bg-green-600 hover:bg-green-700 text-white"
            >
              <CheckCircle className="h-4 w-4 mr-2" />
              Mark All Present
            </Button>
          </div>

          {/* Attendance List */}
          <Card className="border-zinc-200 dark:border-zinc-800 bg-white/80 dark:bg-black/80 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="text-black dark:text-white">Student Attendance</CardTitle>
              <CardDescription className="text-zinc-600 dark:text-zinc-400">
                {selectedDate} • {stats.total} students
              </CardDescription>
            </CardHeader>
            <CardContent>
              {students.length === 0 ? (
                <div className="text-center py-12">
                  <Users className="h-12 w-12 text-zinc-400 mx-auto mb-4" />
                  <p className="text-zinc-600 dark:text-zinc-400">No students added yet</p>
                  <Button
                    className="mt-4"
                    onClick={() => router.push('/teacher/students')}
                  >
                    Add Students
                  </Button>
                </div>
              ) : (
                <div className="space-y-2">
                  {students.map((student) => (
                    <div
                      key={student.id}
                      className="flex items-center justify-between p-4 rounded-lg border border-zinc-200 dark:border-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-900 transition-colors"
                    >
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center text-blue-600 dark:text-blue-400 font-semibold">
                          {student.roll_number}
                        </div>
                        <div>
                          <p className="font-medium text-black dark:text-white">
                            {student.first_name} {student.last_name}
                          </p>
                          <p className="text-sm text-zinc-600 dark:text-zinc-400">
                            Grade {student.grade}
                          </p>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant={attendance[student.id] === 'present' ? 'default' : 'outline'}
                          className={attendance[student.id] === 'present' ? 'bg-green-600 hover:bg-green-700' : ''}
                          onClick={() => markAttendance(student.id, 'present')}
                          disabled={saving}
                        >
                          <CheckCircle className="h-4 w-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant={attendance[student.id] === 'absent' ? 'default' : 'outline'}
                          className={attendance[student.id] === 'absent' ? 'bg-red-600 hover:bg-red-700' : ''}
                          onClick={() => markAttendance(student.id, 'absent')}
                          disabled={saving}
                        >
                          <XCircle className="h-4 w-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant={attendance[student.id] === 'late' ? 'default' : 'outline'}
                          className={attendance[student.id] === 'late' ? 'bg-yellow-600 hover:bg-yellow-700' : ''}
                          onClick={() => markAttendance(student.id, 'late')}
                          disabled={saving}
                        >
                          <Clock className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
