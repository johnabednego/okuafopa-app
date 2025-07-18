import React, { useState, useEffect, useCallback } from 'react'
import { View, StyleSheet, Platform } from 'react-native'
import { StatusBar } from 'expo-status-bar'
import { Slot } from 'expo-router'
import * as SplashScreen from 'expo-splash-screen'
import { AuthProvider } from '../src/context/AuthContext' 

if (Platform.OS !== 'web') {
  SplashScreen.preventAutoHideAsync().catch(() => {})
}

export default function RootLayout() {
  const [appIsReady, setAppIsReady] = useState(false)

  useEffect(() => {
    async function prepare() {
      try {
        // Load fonts, API setup etc.
      } catch (e) {
        console.warn(e)
      } finally {
        setAppIsReady(true)
      }
    }
    prepare()
  }, [])

  const onLayoutRootView = useCallback(async () => {
    if (appIsReady) {
      await SplashScreen.hideAsync()
    }
  }, [appIsReady])

  if (!appIsReady) return null

  return (
    <View style={styles.container} onLayout={onLayoutRootView}>
      <AuthProvider>
        <Slot />
      </AuthProvider>
      <StatusBar style="light" />
    </View>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1 }
})
