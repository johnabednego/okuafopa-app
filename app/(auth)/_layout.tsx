// app/(auth)/_layout.tsx
import { Stack, useRouter } from 'expo-router'
import React, { useContext, useEffect, useState } from 'react'
import { AuthContext } from '../../src/context/AuthContext'
import COLORS from '../../src/theme/colors'

export default function AuthLayout() {
  const { token, user } = useContext(AuthContext)
  const [checked, setChecked] = useState(false)
  const router = useRouter()

  useEffect(() => {
    if (token && user) {
      router.replace('/')
    } else {
      setChecked(true)
    }
  }, [token, user])

  if (!checked) {
    return null
  }

  return (
    <Stack
      screenOptions={{
        headerShown: true,
        headerStyle: { backgroundColor: COLORS.primary },
        headerTintColor: COLORS.onPrimary,
        headerTitleAlign: 'center',
        // ensure the background behind the header and status bar is green
        contentStyle: { backgroundColor: COLORS.primary }
      }}
    >
      <Stack.Screen name="signup" options={{ title: 'Register' }} />
      <Stack.Screen name="login" options={{ title: 'Log In' }} />
      <Stack.Screen name="forgot-password" options={{ title: 'Forgot Password' }} />
      <Stack.Screen name="verify-email/[email]" options={{ title: 'Verify Email' }} />
      <Stack.Screen name="reset-password/[email]" options={{ title: 'Reset Password' }} />
    </Stack>
  )
}
