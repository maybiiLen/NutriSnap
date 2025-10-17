import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native'
import { Stack, useRouter, useSegments } from 'expo-router'
import { StatusBar } from 'expo-status-bar'
import { useEffect } from 'react'
import 'react-native-reanimated'

import { SplashScreenController } from '@/components/splash-screen-controller'

import { useAuthContext } from '@/hooks/use-auth-context'
import { useColorScheme } from '@/hooks/use-color-scheme'
import AuthProvider from '@/provider/auth-provider'

// Separate RootNavigator so we can access the AuthContext
function RootNavigator() {
  const { isLoggedIn, hasCompletedOnboarding, isLoading } = useAuthContext()
  const segments = useSegments()
  const router = useRouter()

  useEffect(() => {
    // Wait for auth state to be fully loaded
    if (isLoading) {
      console.log('🔄 Auth is loading, waiting...')
      return
    }

    const inAuthGroup = segments[0] === 'login'
    const inOnboardingGroup = segments[0] === 'onboarding'
    const inTabsGroup = segments[0] === '(tabs)'

    console.log('🧭 Navigation check:', { 
      isLoggedIn, 
      hasCompletedOnboarding, 
      isLoading,
      currentSegment: segments[0],
      inAuthGroup,
      inOnboardingGroup,
      inTabsGroup
    })

    // Use setTimeout to avoid navigation conflicts during OAuth callback
    const navigationTimeout = setTimeout(() => {
      if (!isLoggedIn) {
        if (!inAuthGroup) {
          console.log('➡️ Redirecting to login (not logged in)')
          router.replace('/login')
        }
      } else if (!hasCompletedOnboarding) {
        if (!inOnboardingGroup) {
          console.log('➡️ Redirecting to onboarding (not completed)')
          router.replace('/onboarding')
        }
      } else {
        if (!inTabsGroup) {
          console.log('➡️ Redirecting to main app (completed onboarding)')
          router.replace('/(tabs)')
        }
      }
    }, 100) // Small delay to let OAuth callback complete

    return () => clearTimeout(navigationTimeout)
  }, [isLoggedIn, hasCompletedOnboarding, isLoading, segments])

  return (
    <Stack>
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      <Stack.Screen name="onboarding" options={{ headerShown: false }} />
      <Stack.Screen name="login" options={{ headerShown: false }} />
      <Stack.Screen name="+not-found" />
    </Stack>
  )
}

export default function RootLayout() {
  const colorScheme = useColorScheme()

  return (
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      <AuthProvider>
        <SplashScreenController />
        <RootNavigator />
        <StatusBar style="auto" />
      </AuthProvider>
    </ThemeProvider>
  )
}