import { AuthContext } from '@/hooks/use-auth-context'
import { supabase } from '@/lib/supabase'
import type { Session } from '@supabase/supabase-js'
import { PropsWithChildren, useEffect, useState } from 'react'

export default function AuthProvider({ children }: PropsWithChildren) {
  const [session, setSession] = useState<Session | undefined | null>(undefined)
  const [profile, setProfile] = useState<any>(null)
  const [userData, setUserData] = useState<any>(null)
  const [isLoading, setIsLoading] = useState<boolean>(true)

  // Fetch the session once, and subscribe to auth state changes
  useEffect(() => {
    const fetchSession = async () => {
      setIsLoading(true)

      const {
        data: { session },
        error,
      } = await supabase.auth.getSession()

      if (error) {
        console.error('❌ Error fetching session:', error)
      }

      console.log('🔐 Initial session fetch:', session ? 'Session exists' : 'No session')
      setSession(session)
      setIsLoading(false)
    }

    fetchSession()

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      console.log('🔄 Auth state changed:', { event: _event, hasSession: !!session })
      setSession(session)
    })

    // Cleanup subscription on unmount
    return () => {
      subscription.unsubscribe()
    }
  }, [])

  // Fetch the profile when the session changes
  useEffect(() => {
    const fetchProfile = async () => {
      if (session) {
        console.log('👤 Fetching user profile and data...')
        setIsLoading(true)

        // Fetch profile data
        const { data: profileData, error: profileError } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', session.user.id)
          .single()

        if (profileError) {
          console.log('⚠️ Profile fetch error (may not exist yet):', profileError.message)
        }
        setProfile(profileData)

        // Fetch user data for onboarding status
        const { data: userData, error: userError } = await supabase
          .from('users')
          .select('*')
          .eq('id', session.user.id)
          .single()

        if (userError) {
          console.log('⚠️ User data fetch error (may not exist yet):', userError.message)
        } else {
          console.log('✅ User data loaded:', {
            hasData: !!userData,
            onboardingCompleted: userData?.onboarding_completed
          })
        }
        setUserData(userData)
        setIsLoading(false)
      } else {
        console.log('🚪 No session, clearing user data')
        setProfile(null)
        setUserData(null)
        setIsLoading(false)
      }
    }

    fetchProfile()
  }, [session])

  return (
    <AuthContext.Provider
      value={{
        session,
        isLoading,
        profile,
        userData,
        isLoggedIn: !!session,
        hasCompletedOnboarding: !!userData?.onboarding_completed,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}