'use client'

import { useState } from 'react'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { motion } from 'framer-motion'
import { ArrowLeft } from 'lucide-react'

export default function TeacherLogin() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [schoolName, setSchoolName] = useState('')
  const [role, setRole] = useState('')
  const [phoneNumber, setPhoneNumber] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [isSignUp, setIsSignUp] = useState(false)
  const router = useRouter()

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      if (isSignUp) {
        // Validate all fields
        if (!firstName || !lastName || !schoolName || !role || !phoneNumber) {
          throw new Error('Please fill in all fields')
        }

        // Check if email is already registered as a student
        const { data: existingStudent } = await supabase
          .from('student_profiles')
          .select('email, user_id')
          .eq('email', email)
          .single()

        if (existingStudent) {
          throw new Error('This email is already registered as a student. Please use a different email or login as a student.')
        }

        // Sign up the user
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: {
              first_name: firstName,
              last_name: lastName,
              role: 'teacher'
            },
            emailRedirectTo: window.location.origin + '/teacher/dashboard'
          }
        })
        if (error) throw error
        
        if (data.user) {
          // Wait a moment for the user to be fully created
          await new Promise(resolve => setTimeout(resolve, 1000))
          
          // Create teacher profile
          const { error: profileError } = await supabase
            .from('teacher_profiles')
            .insert({
              user_id: data.user.id,
              email: email,
              first_name: firstName,
              last_name: lastName,
              school_name: schoolName,
              role: role,
              phone_number: phoneNumber
            })
          
          if (profileError) {
            throw new Error(profileError.message || 'Failed to create teacher profile')
          }
          
          alert('Account created successfully! You can now sign in.')
          setIsSignUp(false)
          // Clear form
          setFirstName('')
          setLastName('')
          setSchoolName('')
          setRole('')
          setPhoneNumber('')
          setEmail('')
          setPassword('')
        }
      } else {
        // First check if this email is registered as a student
        const { data: studentCheck } = await supabase
          .from('student_profiles')
          .select('email, user_id')
          .eq('email', email)
          .single()

        if (studentCheck) {
          throw new Error('This email is registered as a student. Please use the student login page.')
        }

        const { data, error } = await supabase.auth.signInWithPassword({
          email,
          password
        })
        if (error) throw error
        
        if (data.user) {
          // Verify the user has a teacher profile
          const { data: teacherProfile } = await supabase
            .from('teacher_profiles')
            .select('id')
            .eq('user_id', data.user.id)
            .single()

          if (!teacherProfile) {
            await supabase.auth.signOut()
            throw new Error('No teacher profile found. Please sign up as a teacher first.')
          }

          router.push('/teacher/dashboard')
        }
      }
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const inputClass = "w-full h-9 px-3 text-sm rounded border-2 border-zinc-900 dark:border-zinc-100 bg-white dark:bg-zinc-900 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] dark:shadow-[2px_2px_0px_0px_rgba(255,255,255,0.9)] text-zinc-900 dark:text-white font-medium placeholder:text-zinc-400 outline-none focus:border-blue-500 dark:focus:border-blue-400 transition-colors";

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-zinc-100 dark:bg-zinc-900 p-4">
      {/* Subtle grid background */}
      <div className="fixed inset-0 pointer-events-none opacity-30 dark:opacity-15">
        <div className="h-full w-full bg-[linear-gradient(rgba(0,0,0,0.05)_1px,transparent_1px),linear-gradient(90deg,rgba(0,0,0,0.05)_1px,transparent_1px)] dark:bg-[linear-gradient(rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:20px_20px]" />
      </div>

      {/* Back Button */}
      <div className="w-full max-w-sm relative z-10 mb-2">
        <button onClick={() => router.push('/')} className="flex items-center gap-1.5 text-zinc-500 hover:text-zinc-900 dark:hover:text-white text-sm font-medium transition-colors">
          <ArrowLeft className="h-4 w-4" />
          Back
        </button>
      </div>

      {/* Main Form Card */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }} className="w-full max-w-sm relative z-10">
        <div className="bg-zinc-200 dark:bg-zinc-800 p-5 rounded-lg border-2 border-zinc-900 dark:border-zinc-100 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] dark:shadow-[4px_4px_0px_0px_rgba(255,255,255,0.9)]">
          {/* Title */}
          <div className="mb-4">
            <h1 className="text-zinc-900 dark:text-white font-bold text-lg">
              📚 {isSignUp ? 'Create Teacher Account' : 'Welcome back'}
            </h1>
            <p className="text-zinc-500 text-xs mt-0.5">
              {isSignUp ? 'Sign up to access the dashboard' : 'Sign in to continue'}
            </p>
          </div>

          <form onSubmit={handleAuth} className="space-y-3">
            {isSignUp && (
              <>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-zinc-900 dark:text-white text-xs font-semibold mb-1 block">First Name</label>
                    <input id="firstName" type="text" placeholder="John" value={firstName} onChange={(e) => setFirstName(e.target.value)} required className={inputClass} />
                  </div>
                  <div>
                    <label className="text-zinc-900 dark:text-white text-xs font-semibold mb-1 block">Last Name</label>
                    <input id="lastName" type="text" placeholder="Doe" value={lastName} onChange={(e) => setLastName(e.target.value)} required className={inputClass} />
                  </div>
                </div>
                <div>
                  <label className="text-zinc-900 dark:text-white text-xs font-semibold mb-1 block">School Name</label>
                  <input id="schoolName" type="text" placeholder="ABC High School" value={schoolName} onChange={(e) => setSchoolName(e.target.value)} required className={inputClass} />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-zinc-900 dark:text-white text-xs font-semibold mb-1 block">Role</label>
                    <Select value={role} onValueChange={setRole} required>
                      <SelectTrigger className="h-9 text-sm border-2 border-zinc-900 dark:border-zinc-100 bg-white dark:bg-zinc-900 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] dark:shadow-[2px_2px_0px_0px_rgba(255,255,255,0.9)] text-zinc-900 dark:text-white font-medium rounded">
                        <SelectValue placeholder="Select role" />
                      </SelectTrigger>
                      <SelectContent className="border-2 border-zinc-900 dark:border-zinc-100">
                        <SelectItem value="class_teacher">Class Teacher</SelectItem>
                        <SelectItem value="school_admin">School Admin</SelectItem>
                        <SelectItem value="subject_teacher">Subject Teacher</SelectItem>
                        <SelectItem value="principal">Principal</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <label className="text-zinc-900 dark:text-white text-xs font-semibold mb-1 block">Phone</label>
                    <input id="phoneNumber" type="tel" placeholder="+91 98765 43210" value={phoneNumber} onChange={(e) => setPhoneNumber(e.target.value)} required className={inputClass} />
                  </div>
                </div>
              </>
            )}
            <div>
              <label className="text-zinc-900 dark:text-white text-xs font-semibold mb-1 block">Email</label>
              <input id="email" type="email" placeholder="teacher@school.com" value={email} onChange={(e) => setEmail(e.target.value)} required className={inputClass} />
            </div>
            <div>
              <label className="text-zinc-900 dark:text-white text-xs font-semibold mb-1 block">Password</label>
              <input id="password" type="password" placeholder="••••••••" value={password} onChange={(e) => setPassword(e.target.value)} required minLength={6} className={inputClass} />
            </div>
            {error && (
              <div className="text-xs text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-950/50 p-2 rounded border border-red-300 dark:border-red-800">
                {error}
              </div>
            )}
            <button type="submit" disabled={loading} className="w-full h-9 mt-2 rounded border-2 border-zinc-900 dark:border-zinc-100 bg-zinc-900 dark:bg-white shadow-[3px_3px_0px_0px_rgba(59,130,246,1)] text-white dark:text-zinc-900 font-bold text-sm cursor-pointer hover:shadow-none hover:translate-x-0.5 hover:translate-y-0.5 active:shadow-none active:translate-x-1 active:translate-y-1 transition-all disabled:opacity-50">
              {loading ? 'Loading...' : isSignUp ? 'Sign Up →' : "Let's go →"}
            </button>
            <button type="button" onClick={() => setIsSignUp(!isSignUp)} className="w-full text-zinc-500 hover:text-zinc-900 dark:hover:text-white text-xs font-medium py-1 transition-colors">
              {isSignUp ? 'Already have an account? Sign In' : "Don't have an account? Sign Up"}
            </button>
          </form>
        </div>
      </motion.div>
    </div>
  )
}
