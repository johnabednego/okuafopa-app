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

  if (!checked) return null

  return (
    <Stack
      screenOptions={{
        headerShown: true,
        headerStyle: { backgroundColor: COLORS.primary },
        headerTintColor: COLORS.onPrimary,
        headerTitleAlign: 'center',
        contentStyle: { backgroundColor: COLORS.primary },
        keyboardHandlingEnabled: false
      }}
    >
      <Stack.Screen name="signup" options={{ title: 'Okuafopa' }} />
      <Stack.Screen name="login" options={{ title: 'Okuafopa' }} />
      <Stack.Screen name="forgot-password" options={{ title: 'Okuafopa' }} />
      <Stack.Screen name="verify-email/[email]" options={{ title: 'Okuafopa' }} />
      <Stack.Screen name="reset-password/[email]" options={{ title: 'Okuafopa' }} />
    </Stack>
  )
}
