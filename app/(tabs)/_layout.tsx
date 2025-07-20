import React, { useContext } from 'react'
import { Stack, useRouter } from 'expo-router'
import { TouchableOpacity, Text } from 'react-native'
import COLORS from '../../src/theme/colors'
import { AuthContext } from '../../src/context/AuthContext'

export default function TabsLayout() {
  const router = useRouter()
  const { logout } = useContext(AuthContext)

  return (
    <Stack
      screenOptions={{
        headerShown: true,
        headerStyle: { backgroundColor: COLORS.primary },
        headerTintColor: COLORS.onPrimary,
        headerTitleAlign: 'center',
        headerTitle: 'Okuafopa',
        contentStyle: { backgroundColor: COLORS.background },
        animation: 'fade',
        headerRight: () => (
          <TouchableOpacity
            onPress={() => {
              logout()
              router.replace('/')  // back to public landing
            }} style={{ marginRight: 12 }}>
            <Text style={{ color: COLORS.onPrimary, fontWeight: 'bold' }}>Log Out</Text>
          </TouchableOpacity>
        )
      }}
    />
  )
}
