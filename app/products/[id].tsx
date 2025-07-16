import { useLocalSearchParams, useRouter } from 'expo-router'
import React, { useEffect, useState } from 'react'
import { Button, StyleSheet, Text, View } from 'react-native'
import api from '../../src/api/client'
import COLORS from '../../src/theme/colors'

export default function ProductDetail() {
  const { id } = useLocalSearchParams<{ id: string }>()
  const [product, setProduct] = useState<any>(null)
  const router = useRouter()

  useEffect(() => {
    api.get(`/products/${id}`).then(res => setProduct(res.data))
  }, [id])

  if (!product) return <Text>Loading…</Text>

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{product.title}</Text>
      <Text style={styles.desc}>{product.description}</Text>
      <Text style={styles.price}>${product.price.toFixed(2)}</Text>
      <Button title="Order Now" color={COLORS.primary} onPress={() => {/* push to order screen */}} />
    </View>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, backgroundColor: COLORS.background },
  title:     { fontSize: 24, color: COLORS.primary, fontWeight: 'bold' },
  desc:      { marginVertical: 8, color: COLORS.text },
  price:     { fontSize: 20, color: COLORS.primary }
})
