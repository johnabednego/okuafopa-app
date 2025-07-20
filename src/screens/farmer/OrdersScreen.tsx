// app/tabs/OrdersScreen.tsx
import React from 'react'
import { View, Text, StyleSheet } from 'react-native'

export default function OrdersScreen() {
  return (
    <View style={styles.container}>
      <Text>Orders Page</Text>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
})
