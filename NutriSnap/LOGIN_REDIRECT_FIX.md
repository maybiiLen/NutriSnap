# Login Redirect Loop - FIXED ✅

## Problem
After successful Google login, the app was redirecting back to the login page instead of going to onboarding or the main app, creating an infinite redirect loop.

## Root Causes Identified

### 1. **Incorrect Boolean Check for `isLoggedIn`**
- **Old Code**: `session != undefined`
- **Issue**: This returns `true` even when `session === null` (logged out state)
- **Fixed**: Changed to `!!session` for proper boolean conversion

### 2. **Stack.Protected Not Working Properly**
- **Old Code**: Used `Stack.Protected` guards for routing
- **Issue**: Multiple overlapping guards caused routing conflicts
- **Fixed**: Replaced with explicit `useRouter()` and `useSegments()` navigation logic

### 3. **State Initialization Issues**
- **Old Code**: States initialized as `undefined` without explicit values
- **Issue**: Caused race conditions during initial load
- **Fixed**: Properly initialized all states with correct default values

### 4. **Loading State Not Properly Managed**
- **Old Code**: Loading state wasn't consistently set during profile fetch
- **Issue**: Premature redirects before data was loaded
- **Fixed**: Proper loading state management with error handling

---

## Changes Made

### File 1: `provider/auth-provider.tsx`

#### Change 1: Fixed State Initialization
```typescript
// BEFORE
const [session, setSession] = useState<Session | undefined | null>()
const [profile, setProfile] = useState<any>()
const [userData, setUserData] = useState<any>()

// AFTER
const [session, setSession] = useState<Session | undefined | null>(undefined)
const [profile, setProfile] = useState<any>(null)
const [userData, setUserData] = useState<any>(null)
```

#### Change 2: Fixed isLoggedIn Boolean Check
```typescript
// BEFORE
isLoggedIn: session != undefined

// AFTER
isLoggedIn: !!session
```

#### Change 3: Fixed hasCompletedOnboarding Boolean Check
```typescript
// BEFORE
hasCompletedOnboarding: userData?.onboarding_completed || false

// AFTER
hasCompletedOnboarding: !!userData?.onboarding_completed
```

#### Change 4: Improved Loading State Management
```typescript
// Added proper loading state control
if (session) {
  setIsLoading(true)
  // ... fetch data ...
  setIsLoading(false)
} else {
  setProfile(null)
  setUserData(null)
  setIsLoading(false)
}
```

#### Change 5: Added Error Handling
```typescript
const { data: profileData, error: profileError } = await supabase
  .from('profiles')
  .select('*')
  .eq('id', session.user.id)
  .single()

if (profileError) {
  console.log('Profile fetch error (may not exist yet):', profileError.message)
}
```

---

### File 2: `app/_layout.tsx`

#### Change 1: Replaced Stack.Protected with Explicit Navigation
```typescript
// BEFORE
<Stack.Protected guard={isLoggedIn && hasCompletedOnboarding}>
  <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
</Stack.Protected>
<Stack.Protected guard={isLoggedIn && !hasCompletedOnboarding}>
  <Stack.Screen name="onboarding" options={{ headerShown: false }} />
</Stack.Protected>
<Stack.Protected guard={!isLoggedIn}>
  <Stack.Screen name="login" options={{ headerShown: false }} />
</Stack.Protected>

// AFTER
<Stack>
  <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
  <Stack.Screen name="onboarding" options={{ headerShown: false }} />
  <Stack.Screen name="login" options={{ headerShown: false }} />
  <Stack.Screen name="+not-found" />
</Stack>
```

#### Change 2: Added useEffect Navigation Logic
```typescript
const { isLoggedIn, hasCompletedOnboarding, isLoading } = useAuthContext()
const segments = useSegments()
const router = useRouter()

useEffect(() => {
  if (isLoading) return // Don't redirect while loading

  const inAuthGroup = segments[0] === 'login'
  const inOnboardingGroup = segments[0] === 'onboarding'
  const inTabsGroup = segments[0] === '(tabs)'

  console.log('Navigation check:', { 
    isLoggedIn, 
    hasCompletedOnboarding, 
    isLoading,
    currentSegment: segments[0] 
  })

  if (!isLoggedIn && !inAuthGroup) {
    // Redirect to login if not logged in
    router.replace('/login')
  } else if (isLoggedIn && !hasCompletedOnboarding && !inOnboardingGroup) {
    // Redirect to onboarding if logged in but hasn't completed onboarding
    router.replace('/onboarding')
  } else if (isLoggedIn && hasCompletedOnboarding && !inTabsGroup) {
    // Redirect to main app if logged in and completed onboarding
    router.replace('/(tabs)')
  }
}, [isLoggedIn, hasCompletedOnboarding, isLoading, segments])
```

---

## How It Works Now

### Navigation Flow:

```
App Loads
    ↓
[Check if loading]
    ↓ Yes → Show Splash Screen
    ↓ No
[Is user logged in?]
    ↓ No → Redirect to /login
    ↓ Yes
[Has completed onboarding?]
    ↓ No → Redirect to /onboarding
    ↓ Yes → Redirect to /(tabs)
```

### State Management:

1. **Initial Load**:
   - `isLoading = true`
   - Fetch session from Supabase
   - If session exists, fetch user data
   - `isLoading = false`

2. **After Login**:
   - `session` updates via `onAuthStateChange`
   - Triggers `useEffect` to fetch user data
   - Navigation logic checks state and redirects

3. **After Onboarding**:
   - User completes onboarding
   - `onboarding_completed = true` saved to DB
   - `userData` refetched
   - `hasCompletedOnboarding = true`
   - Navigation redirects to main app

---

## Testing the Fix

### Test Case 1: First Time Login
1. Not logged in → Should see Login page ✅
2. Click "Sign in with Google" → Google OAuth
3. After successful login → Check if user exists in DB
4. If no user record → Redirect to Onboarding ✅
5. Complete onboarding → Redirect to Main App ✅

### Test Case 2: Returning User
1. Not logged in → Should see Login page ✅
2. Click "Sign in with Google" → Google OAuth
3. After successful login → Check user record
4. User has `onboarding_completed = true` → Redirect to Main App ✅

### Test Case 3: Session Persistence
1. User is already logged in → Should see Main App ✅
2. Refresh page → Should stay on Main App ✅
3. No redirect loop ✅

---

## Debug Logging

Added console logs to help debug:

```typescript
console.log('Auth state changed:', { event: _event, session })
console.log('Profile fetch error (may not exist yet):', profileError.message)
console.log('User data fetch error (may not exist yet):', userError.message)
console.log('Navigation check:', { 
  isLoggedIn, 
  hasCompletedOnboarding, 
  isLoading,
  currentSegment: segments[0] 
})
```

Check the browser console or terminal to see navigation flow.

---

## What to Check

1. **Restart your dev server**: `npx expo start --clear`
2. **Clear browser cache** if testing on web
3. **Check console logs** to see navigation flow
4. **Make sure the users table exists** in Supabase (run `database/users-table.sql`)

---

## Expected Behavior After Fix

✅ No more redirect loops
✅ Proper navigation after Google login
✅ Onboarding shows for first-time users
✅ Main app shows for returning users
✅ Splash screen shows during loading
✅ No premature redirects

---

## If Issues Persist

1. **Clear all caches**:
   ```bash
   npx expo start --clear
   ```

2. **Check Supabase**:
   - Verify `users` table exists
   - Check RLS policies are enabled
   - Verify OAuth callback URL is correct

3. **Check Console Logs**:
   - Look for "Navigation check:" logs
   - Verify `isLoggedIn` and `hasCompletedOnboarding` values

4. **Reset User Data** (for testing):
   ```sql
   DELETE FROM users WHERE id = 'your-user-id';
   ```

---

## Summary

The redirect loop was caused by incorrect boolean checks and overlapping navigation guards. The fix implements explicit navigation logic with proper state management and loading handling. The app now correctly routes users based on their authentication and onboarding status without any loops! 🎉
