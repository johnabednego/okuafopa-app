// app/_layout.tsx
import React, { useState, useEffect, useCallback } from 'react'
import { View, StyleSheet, Platform } from 'react-native'
import { Slot } from 'expo-router'
import * as SplashScreen from 'expo-splash-screen'

// keep the splash visible on native until we explicitly hide it
if (Platform.OS !== 'web') {
  SplashScreen.preventAutoHideAsync().catch(() => {
    /* ignore if already prevented */
  })
}

export default function RootLayout() {
  const [appIsReady, setAppIsReady] = useState(false)

  useEffect(() => {
    async function prepare() {
      try {
        // any async tasks here: fonts, auth check, API preload...
        // await someAsyncTask()
      } catch (e) {
        console.warn(e)
      } finally {
        setAppIsReady(true)
      }
    }
    prepare()
  }, [])

  // Once the first view is laid out, hide the native splash
  const onLayoutRootView = useCallback(async () => {
    if (appIsReady) {
      await SplashScreen.hideAsync()
    }
  }, [appIsReady])

  if (!appIsReady) {
    // Render nothing (keep the splash screen)
    return null
  }

  return (
    <View style={styles.container} onLayout={onLayoutRootView}>
      <Slot />
    </View>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1 }
})
