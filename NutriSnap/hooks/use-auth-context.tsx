import { Session } from '@supabase/supabase-js'
import { createContext, useContext } from 'react'

export type AuthData = {
  session?: Session | null
  profile?: any | null
  userData?: any | null
  isLoading: boolean
  isLoggedIn: boolean
  hasCompletedOnboarding: boolean
}

export const AuthContext = createContext<AuthData>({
  session: undefined,
  profile: undefined,
  userData: undefined,
  isLoading: true,
  isLoggedIn: false,
  hasCompletedOnboarding: false,
})

export const useAuthContext = () => useContext(AuthContext)