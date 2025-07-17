// app/(app)/_layout.tsx
import { Stack, useRouter } from 'expo-router'
import React, { useContext, useEffect, useState } from 'react'
import { AuthContext } from '../../src/context/AuthContext'
import COLORS from '../../src/theme/colors'

export default function AppLayout() {
  const { token, user } = useContext(AuthContext)
  const [checked, setChecked] = useState(false)
  const router = useRouter()

  useEffect(() => {
    if (!token || !user) {
      router.replace('/login')
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
        headerStyle: { backgroundColor: COLORS.primary },
        headerTintColor: COLORS.onPrimary,
        contentStyle: { backgroundColor: COLORS.primary }
      }}
    >
      <Stack.Screen name="index" options={{ title: 'Home' }} />
      <Stack.Screen name="products/index" options={{ title: 'Products' }} />
      <Stack.Screen name="products/[id]" options={{ title: 'Product Details' }} />
      <Stack.Screen name="orders/index" options={{ title: 'My Orders' }} />
      <Stack.Screen name="orders/[id]" options={{ title: 'Order Details' }} />
      <Stack.Screen name="profile/index" options={{ title: 'Profile' }} />
    </Stack>
  )
}
