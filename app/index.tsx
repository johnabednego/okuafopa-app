import React from 'react'
import { StyleSheet, Text, View } from 'react-native'
import COLORS from '../src/theme/colors'

export default function Home() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Welcome to Okuafopa</Text>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 24,
    color: COLORS.primary,
    fontWeight: 'bold',
  },
})
