'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Users, BookOpen, FileText, Plus, Calendar } from 'lucide-react'

export default function TeacherDashboard() {
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [studentCount, setStudentCount] = useState(0)
  const router = useRouter()

  useEffect(() => {
    checkUser()
  }, [])

  const checkUser = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      router.push('/teacher/login')
    } else {
      // Fetch teacher profile
      const { data: profile } = await supabase
        .from('teacher_profiles')
        .select('*')
        .eq('user_id', user.id)
        .single()
      
      setUser({ ...user, profile })
      
      // Fetch student count
      const { count } = await supabase
        .from('students')
        .select('*', { count: 'exact', head: true })
        .eq('teacher_id', user.id)
      
      setStudentCount(count || 0)
    }
    setLoading(false)
  }

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    router.push('/teacher/login')
  }

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
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold text-xl">
                {user?.profile?.first_name?.[0]}{user?.profile?.last_name?.[0]}
              </div>
              <div>
                <h1 className="text-3xl font-bold text-black dark:text-white">
                  Welcome, {user?.profile?.first_name} {user?.profile?.last_name}
                </h1>
                <p className="text-sm text-zinc-600 dark:text-zinc-400">
                  {user?.profile?.school_name} • {user?.profile?.role?.replace('_', ' ').replace(/\b\w/g, (l: string) => l.toUpperCase())}
                </p>
              </div>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <Card className="border-zinc-200 dark:border-zinc-800 bg-white/80 dark:bg-black/80 backdrop-blur-sm hover:shadow-lg transition-shadow">
              <CardHeader>
                <CardTitle className="text-black dark:text-white flex items-center gap-2">
                  <Users className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                  Students
                </CardTitle>
                <CardDescription className="text-zinc-600 dark:text-zinc-400">Manage your students</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-4xl font-bold text-black dark:text-white">{studentCount}</p>
                <p className="text-sm text-zinc-600 dark:text-zinc-400 mt-1">Total students</p>
              </CardContent>
            </Card>

            <Card className="border-zinc-200 dark:border-zinc-800 bg-white/80 dark:bg-black/80 backdrop-blur-sm hover:shadow-lg transition-shadow">
              <CardHeader>
                <CardTitle className="text-black dark:text-white flex items-center gap-2">
                  <BookOpen className="h-5 w-5 text-green-600 dark:text-green-400" />
                  Classes
                </CardTitle>
                <CardDescription className="text-zinc-600 dark:text-zinc-400">Your active classes</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-4xl font-bold text-black dark:text-white">0</p>
                <p className="text-sm text-zinc-600 dark:text-zinc-400 mt-1">Active classes</p>
              </CardContent>
            </Card>

            <Card 
              className="border-zinc-200 dark:border-zinc-800 bg-white/80 dark:bg-black/80 backdrop-blur-sm hover:shadow-lg transition-shadow cursor-pointer"
              onClick={() => router.push('/teacher/quiz')}
            >
              <CardHeader>
                <CardTitle className="text-black dark:text-white flex items-center gap-2">
                  <FileText className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                  Quiz Rooms
                </CardTitle>
                <CardDescription className="text-zinc-600 dark:text-zinc-400">Create quiz rooms</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-4xl font-bold text-black dark:text-white">0</p>
                <p className="text-sm text-zinc-600 dark:text-zinc-400 mt-1">Active rooms</p>
              </CardContent>
            </Card>
          </div>

          {/* Quick Actions */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <Card className="border-zinc-200 dark:border-zinc-800 bg-white/80 dark:bg-black/80 backdrop-blur-sm hover:shadow-lg transition-shadow">
              <CardHeader>
                <CardTitle className="text-black dark:text-white flex items-center gap-2">
                  <Users className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                  Student Management
                </CardTitle>
                <CardDescription className="text-zinc-600 dark:text-zinc-400">
                  Add and manage your students
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button 
                  className="w-full bg-black dark:bg-white text-white dark:text-black hover:bg-zinc-800 dark:hover:bg-zinc-200"
                  onClick={() => router.push('/teacher/students')}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Manage Students
                </Button>
              </CardContent>
            </Card>

            <Card className="border-zinc-200 dark:border-zinc-800 bg-white/80 dark:bg-black/80 backdrop-blur-sm hover:shadow-lg transition-shadow">
              <CardHeader>
                <CardTitle className="text-black dark:text-white flex items-center gap-2">
                  <FileText className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                  Quiz Rooms
                </CardTitle>
                <CardDescription className="text-zinc-600 dark:text-zinc-400">
                  Create interactive quiz rooms
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button 
                  className="w-full bg-black dark:bg-white text-white dark:text-black hover:bg-zinc-800 dark:hover:bg-zinc-200"
                  onClick={() => router.push('/teacher/quiz')}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Create Quiz Room
                </Button>
              </CardContent>
            </Card>

            <Card className="border-zinc-200 dark:border-zinc-800 bg-white/80 dark:bg-black/80 backdrop-blur-sm hover:shadow-lg transition-shadow">
              <CardHeader>
                <CardTitle className="text-black dark:text-white flex items-center gap-2">
                  <Calendar className="h-5 w-5 text-green-600 dark:text-green-400" />
                  Daily Attendance
                </CardTitle>
                <CardDescription className="text-zinc-600 dark:text-zinc-400">
                  Track student attendance
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button 
                  className="w-full bg-black dark:bg-white text-white dark:text-black hover:bg-zinc-800 dark:hover:bg-zinc-200"
                  onClick={() => router.push('/teacher/attendance')}
                >
                  <Calendar className="h-4 w-4 mr-2" />
                  Mark Attendance
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Student Management Section */}
          <Card className="border-zinc-200 dark:border-zinc-800 bg-white/80 dark:bg-black/80 backdrop-blur-sm">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-black dark:text-white flex items-center gap-2">
                    <Users className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                    Recent Activity
                  </CardTitle>
                  <CardDescription className="text-zinc-600 dark:text-zinc-400">
                    Student progress and updates
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {studentCount === 0 ? (
                <div className="text-center py-12">
                  <Users className="h-16 w-16 text-zinc-300 dark:text-zinc-700 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-black dark:text-white mb-2">No students yet</h3>
                  <p className="text-zinc-600 dark:text-zinc-400 mb-6">
                    Start by adding students to track their progress
                  </p>
                  <Button 
                    className="bg-black dark:bg-white text-white dark:text-black hover:bg-zinc-800 dark:hover:bg-zinc-200"
                    onClick={() => router.push('/teacher/students')}
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Add Your First Student
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 rounded-lg bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800">
                    <div>
                      <p className="text-sm text-zinc-600 dark:text-zinc-400">Total Students</p>
                      <p className="text-2xl font-bold text-black dark:text-white">{studentCount}</p>
                    </div>
                    <Button 
                      variant="outline"
                      onClick={() => router.push('/teacher/students')}
                    >
                      View All Students
                    </Button>
                  </div>
                  <p className="text-sm text-zinc-600 dark:text-zinc-400">
                    Click "View All Students" to manage your student list, add new students, or track their progress.
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
