// src/screens/buyer/ProductDetailScreen.tsx
import React, { useState, useEffect } from 'react'
import {
  View, Text, ScrollView, Image, Dimensions, ActivityIndicator, StyleSheet
} from 'react-native'
import MapView, { Marker } from 'react-native-maps'
import api from '../../api/client'
import COLORS from '../../theme/colors'

export default function ProductDetailScreen({ route }) {
  const { id } = route.params
  const [prod, setProd] = useState<any>(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    setLoading(true)
    api.get(`/products/${id}`)
      .then(res => setProd(res.data))
      .finally(()=>setLoading(false))
  }, [id])

  if (loading || !prod) return <ActivityIndicator style={{flex:1}}/>

  const width = Dimensions.get('window').width
  const { location, images, title, description, price, quantity } = prod
  const [lng, lat] = location.coordinates

  return (
    <ScrollView style={{flex:1,padding:16}}>
      <ScrollView horizontal pagingEnabled>
        {images.map((uri:string,i:number)=>(
          <Image key={i} source={{uri}} style={{width,height:width*0.75}} />
        ))}
      </ScrollView>

      <Text style={styles.title}>{title}</Text>
      <Text style={styles.price}>${price} · Qty: {quantity}</Text>
      <Text style={styles.desc}>{description}</Text>

      <Text style={styles.label}>Location</Text>
      <MapView
        style={{height:200,borderRadius:6,marginTop:8}}
        initialRegion={{latitude:lat,longitude:lng,latitudeDelta:0.01,longitudeDelta:0.01}}
      >
        <Marker coordinate={{latitude:lat,longitude:lng}} />
      </MapView>
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  title:{ fontSize:22, fontWeight:'bold', color:COLORS.primary, marginTop:12 },
  price:{ fontSize:18, marginVertical:8 },
  desc:{ fontSize:14, color:COLORS.text, marginBottom:12 },
  label:{ fontWeight:'600', marginTop:16 }
})
