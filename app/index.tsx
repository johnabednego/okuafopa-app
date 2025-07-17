// app/index.tsx

import { useRouter } from 'expo-router'
import React, { useContext } from 'react'
import { Button, StyleSheet, Text, View } from 'react-native'
import { AuthContext } from '../src/context/AuthContext'
import COLORS from '../src/theme/colors'

export default function Home() {
  const { token, user, logout } = useContext(AuthContext)
  const router = useRouter()

  if (!token || !user) {
    // Public landing
    return (
      <View style={styles.container}>
        <Text style={styles.title}>Welcome to Okuafopa</Text>
        <Button
          title="Log In"
          color={COLORS.primary}
          onPress={() => router.push('/login' as any)}
        />
        <View style={{ height: 12 }} />
        <Button
          title="Sign Up"
          color={COLORS.primary}
          onPress={() => router.push('/signup' as any)}
        />
      </View>
    )
  }

  // Authenticated home
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Hello, {user.firstName}!</Text>

      <Button
        title="Browse Products"
        color={COLORS.primary}
        onPress={() => router.push('/products' as any)}
      />
      <View style={{ height: 12 }} />
      <Button
        title="My Orders"
        color={COLORS.primary}
        onPress={() => router.push('/orders' as any)}
      />
      <View style={{ height: 12 }} />
      <Button
        title="My Profile"
        color={COLORS.primary}
        onPress={() => router.push('/profile' as any)}
      />
      <View style={{ height: 24 }} />
      <Button
        title="Log Out"
        color={COLORS.danger}
        onPress={() => {
          logout()
          router.replace('/')  // back to public landing
        }}
      />
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16
  },
  title: {
    fontSize: 24,
    color: COLORS.primary,
    fontWeight: 'bold',
    marginBottom: 24
  }
})
