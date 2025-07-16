import { useRouter } from 'expo-router'
import React, { useEffect, useState } from 'react'
import { FlatList, Text, TouchableOpacity } from 'react-native'
import api from '../../src/api/client'
import COLORS from '../../src/theme/colors'

export default function ProductsScreen() {
  const [products, setProducts] = useState<any[]>([])
  const router = useRouter()

  useEffect(() => {
    api.get('/products').then(res => setProducts(res.data.data))
  }, [])

  return (
    <FlatList
      data={products}
      keyExtractor={item => item._id}
      renderItem={({ item }) => (
        <TouchableOpacity
          style={{ padding: 16, borderBottomWidth: 1, borderColor: COLORS.muted }}
          onPress={() => router.push(`/products/${item._id}`)}
        >
          <Text style={{ fontSize: 18, color: COLORS.primary }}>{item.title}</Text>
          <Text>${item.price.toFixed(2)}</Text>
        </TouchableOpacity>
      )}
    />
  )
}
