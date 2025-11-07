'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { getUserProfile, UserType, UserProfile } from '@/lib/auth'
import { User } from '@supabase/supabase-js'
import { Loader2 } from 'lucide-react'

interface ProtectedRouteProps {
  children: React.ReactNode
  allowedUserTypes?: UserType[]
  redirectTo?: string
}

export default function ProtectedRoute({ 
  children, 
  allowedUserTypes = ['student', 'teacher'],
  redirectTo = '/student/login'
}: ProtectedRouteProps) {
  const [loading, setLoading] = useState(true)
  const [user, setUser] = useState<User | null>(null)
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [userType, setUserType] = useState<UserType>(null)
  const router = useRouter()

  useEffect(() => {
    const checkAuth = async () => {
      try {
        // Add a small delay to ensure session is loaded
        await new Promise(resolve => setTimeout(resolve, 100))
        
        const { user, profile, userType } = await getUserProfile()
        
        console.log('Protected Route Auth Check:', { user: !!user, profile: !!profile, userType })
        
        if (!user) {
          console.log('No user found, redirecting to:', redirectTo)
          router.push(redirectTo)
          return
        }

        if (!profile) {
          console.log('User exists but no profile found')
          // User exists but no profile - redirect to appropriate signup
          if (redirectTo.includes('teacher')) {
            router.push('/teacher/login')
          } else {
            router.push('/student/login')
          }
          return
        }

        if (!allowedUserTypes.includes(userType)) {
          console.log('User type not allowed:', userType, 'allowed:', allowedUserTypes)
          // User type not allowed for this route
          if (userType === 'teacher') {
            router.push('/teacher/dashboard')
          } else if (userType === 'student') {
            router.push('/dashboard')
          } else {
            router.push('/student/login')
          }
          return
        }

        console.log('Auth check passed, setting user data')
        setUser(user)
        setProfile(profile)
        setUserType(userType)
      } catch (error) {
        console.error('Auth check failed:', error)
        router.push(redirectTo)
      } finally {
        setLoading(false)
      }
    }

    checkAuth()
  }, [router, allowedUserTypes, redirectTo])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-900">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin text-blue-500 mx-auto mb-4" />
          <p className="text-gray-400">Loading...</p>
        </div>
      </div>
    )
  }

  if (!user || !profile || !allowedUserTypes.includes(userType)) {
    return null // Will redirect
  }

  return (
    <div className="auth-context" data-user-type={userType}>
      {children}
    </div>
  )
}

// Hook to use auth context in components
export function useAuth() {
  const [authData, setAuthData] = useState<{
    user: User | null
    profile: UserProfile | null
    userType: UserType
    loading: boolean
  }>({
    user: null,
    profile: null,
    userType: null,
    loading: true
  })

  useEffect(() => {
    const getAuthData = async () => {
      try {
        const { user, profile, userType } = await getUserProfile()
        setAuthData({ user, profile, userType, loading: false })
      } catch (error) {
        console.error('Failed to get auth data:', error)
        setAuthData({ user: null, profile: null, userType: null, loading: false })
      }
    }

    getAuthData()
  }, [])

  return authData
}