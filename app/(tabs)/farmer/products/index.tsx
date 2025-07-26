// app/(tabs)/farmer/products/index.tsx
import React, { useState, useEffect, useCallback, useContext } from 'react'
import {
  View, Text, Button, FlatList, Image, TouchableOpacity,
  ActivityIndicator, Alert, StyleSheet
} from 'react-native'
import { useRouter } from 'expo-router'
import api from '../../../../src/api/client'
import COLORS from '../../../../src/theme/colors'

type Product = {
  _id: string
  title: string
  images: string[]
  price: number
  quantity: number
}

export default function ProductsScreen() {
  const router = useRouter()
  const [tab, setTab]             = useState<'list'|'create'>('list')
  const [products, setProducts]   = useState<Product[]>([])
  const [loadingList, setLoading] = useState(false)

  const loadMyProducts = useCallback(async () => {
    setLoading(true)
    try {
      const res = await api.get<Product[]>('/products?farmer=me')
      setProducts(res.data)
    } catch (e: any) {
      Alert.alert('Error', e.message)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { if (tab === 'list') loadMyProducts() }, [tab])

  if (tab === 'create') {
    router.push('/(tabs)/farmer/products/new' as any)
    return null
  }

  return (
    <View style={styles.container}>
      <View style={styles.tabBar}>
        <Button title="My Products" onPress={() => setTab('list')} color={COLORS.primary} />
        <Button title="＋ Add New"  onPress={() => setTab('create')} color={COLORS.primary} />
      </View>

      {loadingList
        ? <ActivityIndicator style={{ marginTop: 40 }} />
        : <FlatList
            data={products}
            keyExtractor={p => p._id}
            contentContainerStyle={{ padding: 16 }}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={styles.card}
                onPress={() => router.push(`/(tabs)/farmer/products/${item._id}` as any)}
              >
                {item.images[0] && (
                  <Image source={{ uri: item.images[0] }} style={styles.cardImg} />
                )}
                <View style={{ flex: 1, marginLeft: 12 }}>
                  <Text style={styles.cardTitle}>{item.title}</Text>
                  <Text>${item.price} · Qty: {item.quantity}</Text>
                </View>
                <Text style={styles.edit}>Edit</Text>
              </TouchableOpacity>
            )}
          />
      }
    </View>
  )
}

const styles = StyleSheet.create({
  container:{ flex:1, backgroundColor:COLORS.background },
  tabBar:   { flexDirection:'row', justifyContent:'space-around', padding:8 },
  card:     { flexDirection:'row', alignItems:'center', backgroundColor:'#fff',
              borderRadius:6, padding:12, marginBottom:12, elevation:2 },
  cardImg:  { width:60, height:60, borderRadius:6 },
  cardTitle:{ fontSize:16, fontWeight:'600' },
  edit:     { color:COLORS.primary, fontWeight:'bold', marginLeft:12 }
})
