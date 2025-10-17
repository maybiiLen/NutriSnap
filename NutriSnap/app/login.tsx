import { Link, Stack } from 'expo-router'
import { StyleSheet, View, Dimensions, Platform } from 'react-native'
import { LinearGradient } from 'expo-linear-gradient'
import { Image } from 'expo-image'
import { Text } from '@react-navigation/elements'

import { ThemedText } from '@/components/themed-text'
import GoogleSignInButton from '@/components/social-auth-buttons/google/google-sign-in-button'

const { width, height } = Dimensions.get('window')

export default function LoginScreen() {
  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <View style={styles.container}>
        {/* Supabase-themed gradient background */}
        <LinearGradient
          colors={['#1a1a1a', '#2d3748', '#1f4037', '#99f2c8']}
          locations={[0, 0.3, 0.7, 1]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.gradient}
        >
          {/* Decorative circles for depth */}
          <View style={[styles.circle, styles.circle1]} />
          <View style={[styles.circle, styles.circle2]} />
          <View style={[styles.circle, styles.circle3]} />
          
          {/* Content Container */}
          <View style={styles.content}>
            {/* Logo/Brand Section */}
            <View style={styles.brandContainer}>
              <View style={styles.logoContainer}>
                <Text style={styles.logoText}>🥗</Text>
              </View>
              <ThemedText style={styles.appName}>NutriSnap</ThemedText>
              <Text style={styles.tagline}>
                Track your nutrition with a snap
              </Text>
            </View>

            {/* Login Card */}
            <View style={styles.loginCard}>
              <ThemedText style={styles.welcomeText}>Welcome Back</ThemedText>
              <Text style={styles.subtitle}>
                Sign in to continue your healthy journey
              </Text>
              
              <View style={styles.buttonContainer}>
                <GoogleSignInButton />
              </View>

              {/* Divider */}
              <View style={styles.dividerContainer}>
                <View style={styles.divider} />
                <Text style={styles.dividerText}>or</Text>
                <View style={styles.divider} />
              </View>

              {/* Additional options */}
              <Link href="/onboarding" style={styles.link}>
                <Text style={styles.linkText}>Continue as Guest →</Text>
              </Link>
            </View>

            {/* Footer */}
            <View style={styles.footer}>
              <Text style={styles.footerText}>
                By continuing, you agree to our Terms & Privacy Policy
              </Text>
            </View>
          </View>
        </LinearGradient>
      </View>
    </>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  gradient: {
    flex: 1,
    width: '100%',
    height: '100%',
  },
  circle: {
    position: 'absolute',
    borderRadius: 999,
    opacity: 0.1,
    backgroundColor: '#3ecf8e',
  },
  circle1: {
    width: 400,
    height: 400,
    top: -200,
    right: -100,
  },
  circle2: {
    width: 300,
    height: 300,
    bottom: -150,
    left: -100,
  },
  circle3: {
    width: 200,
    height: 200,
    top: '40%',
    left: -50,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
    paddingTop: Platform.OS === 'web' ? 60 : 80,
  },
  brandContainer: {
    alignItems: 'center',
    marginBottom: 48,
  },
  logoContainer: {
    width: 80,
    height: 80,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  logoText: {
    fontSize: 48,
  },
  appName: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 8,
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  tagline: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.9)',
    textAlign: 'center',
  },
  loginCard: {
    width: '100%',
    maxWidth: 400,
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderRadius: 24,
    padding: 32,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 10,
  },
  welcomeText: {
    fontSize: 28,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 8,
    color: '#1a1a1a',
  },
  subtitle: {
    fontSize: 14,
    textAlign: 'center',
    color: '#666',
    marginBottom: 32,
  },
  buttonContainer: {
    width: '100%',
    marginBottom: 24,
  },
  dividerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 24,
  },
  divider: {
    flex: 1,
    height: 1,
    backgroundColor: '#e0e0e0',
  },
  dividerText: {
    marginHorizontal: 16,
    fontSize: 14,
    color: '#999',
    fontWeight: '500',
  },
  link: {
    alignSelf: 'center',
    paddingVertical: 12,
    paddingHorizontal: 24,
  },
  linkText: {
    fontSize: 16,
    color: '#3ecf8e',
    fontWeight: '600',
    textAlign: 'center',
  },
  footer: {
    marginTop: 32,
    paddingHorizontal: 24,
  },
  footerText: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.7)',
    textAlign: 'center',
    lineHeight: 18,
  },
})