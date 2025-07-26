// src/screens/buyer/ProductListScreen.tsx
import React, { useState, useEffect } from 'react'
import {
  View, FlatList, Text, Image, TouchableOpacity, ActivityIndicator, StyleSheet
} from 'react-native'
import api from '../../api/client'
import COLORS from '../../theme/colors'

export default function ProductListScreen({ navigation }) {
  const [items, setItems] = useState<any[]>([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    setLoading(true)
    api.get('/products')
      .then(res => setItems(res.data.data))
      .catch(_=>{})
      .finally(()=>setLoading(false))
  },[])

  if (loading) return <ActivityIndicator style={{flex:1}} />

  return (
    <FlatList
      contentContainerStyle={{ padding:16 }}
      data={items}
      keyExtractor={i=>i._id}
      renderItem={({item})=>(
        <TouchableOpacity
          style={styles.card}
          onPress={()=>navigation.navigate('productsDetail', { id: item._id })}
        >
          {item.images[0] && <Image source={{uri:item.images[0]}} style={styles.thumb}/>}
          <View style={{flex:1, marginLeft:12}}>
            <Text style={styles.title}>{item.title}</Text>
            <Text>${item.price}</Text>
          </View>
        </TouchableOpacity>
      )}
    />
  )
}

const styles = StyleSheet.create({
  card:{ flexDirection:'row', backgroundColor:'#fff', marginBottom:12, padding:12, borderRadius:6 },
  thumb:{ width:60, height:60, borderRadius:6 },
  title:{ fontSize:16, fontWeight:'600' }
})
