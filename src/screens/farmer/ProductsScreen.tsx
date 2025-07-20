// app/tabs/ProductsScreen.tsx
import React from 'react'
import { View, Text, StyleSheet } from 'react-native'

export default function ProductsScreen() {
  return (
    <View style={styles.container}>
      <Text>Products Page</Text>
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
