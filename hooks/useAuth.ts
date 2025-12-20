import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { User } from '@supabase/supabase-js'
import { getUserProfile, UserProfile, UserType } from '@/lib/auth'
import { checkRoleConflict, RoleConflict } from '@/lib/role-conflict-resolver'

export function useAuth() {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [userType, setUserType] = useState<UserType>(null)
  const [roleConflict, setRoleConflict] = useState<RoleConflict | null>(null)

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null)
      if (session?.user) {
        loadUserProfile(session.user)
      } else {
        setProfile(null)
        setUserType(null)
        setRoleConflict(null)
      }
      setLoading(false)
    })

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null)
      if (session?.user) {
        loadUserProfile(session.user)
      } else {
        setProfile(null)
        setUserType(null)
        setRoleConflict(null)
      }
    })

    return () => subscription.unsubscribe()
  }, [])

  const loadUserProfile = async (user: User) => {
    try {
      // Check for role conflicts first
      const conflict = await checkRoleConflict(user.id)
      if (conflict) {
        setRoleConflict(conflict)
        setProfile(null)
        setUserType(null)
        return
      }

      // Load user profile normally
      const { profile: userProfile, userType: type } = await getUserProfile()
      setProfile(userProfile)
      setUserType(type)
      setRoleConflict(null)
    } catch (error) {
      console.error('Error loading user profile:', error)
      setProfile(null)
      setUserType(null)
      setRoleConflict(null)
    }
  }

  return { 
    user, 
    loading, 
    profile, 
    userType, 
    roleConflict,
    refreshProfile: () => user && loadUserProfile(user)
  }
}
