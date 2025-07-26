// src/screens/farmer/CreateProductScreen.tsx
import React, { useState, useContext, useEffect } from 'react'
import {
  View, Text, TextInput, ScrollView, Switch,
  Button, Image, TouchableOpacity, ActivityIndicator,
  Alert, StyleSheet
} from 'react-native'
import MapView, { Marker, Region } from 'react-native-maps'
import * as ImagePicker from 'expo-image-picker'
import * as Location from 'expo-location'
import { uploadImageAsync } from '../../utils/cloudinary'
import { AuthContext } from '../../context/AuthContext'
import COLORS from '../../theme/colors'
import api from '../../api/client'

interface Props {
  onDone: () => void
}

export default function CreateProductScreen({ onDone }: Props) {
  const { user } = useContext(AuthContext)

  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [price, setPrice] = useState('')
  const [quantity, setQuantity] = useState('')
  const [category, setCategory] = useState('')
  const [images, setImages] = useState<string[]>([])
  const [isActive, setIsActive] = useState(true)
  const [deliveryOptions, setDeliveryOptions] = useState({
    pickup: true,
    thirdParty: false,
  })
  const [marker, setMarker] = useState<{ latitude: number; longitude: number } | null>(null)
  const [region, setRegion] = useState<Region>({
    latitude: 0,
    longitude: 0,
    latitudeDelta: 0.01,
    longitudeDelta: 0.01,
  })
  const [uploading, setUploading] = useState(false)
  const [errors, setErrors] = useState<{ [key: string]: string }>({})

  useEffect(() => {
    (async () => {
      const { status } = await Location.requestForegroundPermissionsAsync()
      if (status !== 'granted') return Alert.alert('Permission denied')
      const loc = await Location.getCurrentPositionAsync({})
      setRegion(r => ({ ...r, latitude: loc.coords.latitude, longitude: loc.coords.longitude }))
      setMarker({ latitude: loc.coords.latitude, longitude: loc.coords.longitude })
    })()
  }, [])

  const validate = () => {
    const newErrors: { [key: string]: string } = {}
    if (!title.trim()) newErrors.title = 'This is required'
    if (!description.trim()) newErrors.description = 'This is required'
    if (!price.trim()) newErrors.price = 'This is required'
    else if (isNaN(Number(price))) newErrors.price = 'Must be a number'
    if (!quantity.trim()) newErrors.quantity = 'This is required'
    else if (isNaN(Number(quantity))) newErrors.quantity = 'Must be a number'
    if (!category.trim()) newErrors.category = 'This is required'
    if (!images.length) newErrors.images = 'At least one image is required'
    if (!marker) newErrors.location = 'Select a location on the map'

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({ quality: 0.7 })
    if (!result.canceled && result.assets.length) {
      setUploading(true)
      try {
        const url = await uploadImageAsync(result.assets[0].uri)
        setImages(imgs => [...imgs, url])
      } catch (e: any) {
        Alert.alert('Upload failed', e.message)
      } finally {
        setUploading(false)
      }
    }
  }

  const handleCreate = async () => {
    if (!validate()) return

    setUploading(true)
    try {
      const payload = {
        farmer: user.id,
        title,
        description,
        price: parseFloat(price),
        quantity: parseInt(quantity, 10),
        category,
        images,
        isActive,
        deliveryOptions,
        location: {
          type: 'Point',
          coordinates: marker ? [marker.longitude, marker.latitude] : [0, 0],
        },
      }

      const res = await api.post('/products', payload)
      Alert.alert('Success', `"${res.data.title}" created`)
      onDone()
    } catch (e: any) {
      Alert.alert('Error', e.response?.data?.message || e.message)
    } finally {
      setUploading(false)
    }
  }

  return (
    <ScrollView style={{ backgroundColor: COLORS.background }} contentContainerStyle={{ padding: 16 }}>
      <Text style={styles.label}>Title</Text>
      <TextInput style={styles.input} value={title} onChangeText={setTitle} />
      {errors.title && <Text style={styles.errorText}>{errors.title}</Text>}

      <Text style={styles.label}>Description</Text>
      <TextInput style={[styles.input, { height: 80 }]} multiline value={description} onChangeText={setDescription} />
      {errors.description && <Text style={styles.errorText}>{errors.description}</Text>}

      <Text style={styles.label}>Price</Text>
      <TextInput style={styles.input} keyboardType="decimal-pad" value={price} onChangeText={setPrice} />
      {errors.price && <Text style={styles.errorText}>{errors.price}</Text>}

      <Text style={styles.label}>Quantity</Text>
      <TextInput style={styles.input} keyboardType="number-pad" value={quantity} onChangeText={setQuantity} />
      {errors.quantity && <Text style={styles.errorText}>{errors.quantity}</Text>}

      <Text style={styles.label}>Category</Text>
      <TextInput style={styles.input} value={category} onChangeText={setCategory} />
      {errors.category && <Text style={styles.errorText}>{errors.category}</Text>}

      <Text style={styles.label}>Active</Text>
      <Switch
        value={isActive}
        onValueChange={setIsActive}
        trackColor={{ false: COLORS.grayLight, true: COLORS.primary }}
        thumbColor="#fff"
      />

      <Text style={styles.label}>Delivery Options</Text>
      <View style={styles.row}>
        <Text>Pickup</Text>
        <Switch
          value={deliveryOptions.pickup}
          onValueChange={v => setDeliveryOptions(o => ({ ...o, pickup: v }))}
          trackColor={{ false: COLORS.grayLight, true: COLORS.primary }}
          thumbColor="#fff"
        />
      </View>
      <View style={styles.row}>
        <Text>Third‑Party</Text>
        <Switch
          value={deliveryOptions.thirdParty}
          onValueChange={v => setDeliveryOptions(o => ({ ...o, thirdParty: v }))}
          trackColor={{ false: COLORS.grayLight, true: COLORS.primary }}
          thumbColor="#fff"
        />
      </View>

      <Text style={styles.label}>Images</Text>
      <View style={styles.imageRow}>
        {images.map((uri, i) => (
          <Image key={i} source={{ uri }} style={styles.thumb} />
        ))}
        <TouchableOpacity onPress={pickImage} style={styles.addBtn}>
          {uploading ? <ActivityIndicator color="#fff" /> : <Text style={styles.plus}>＋</Text>}
        </TouchableOpacity>
      </View>
      {errors.images && <Text style={styles.errorText}>{errors.images}</Text>}

      <Text style={styles.label}>Tap on the map to select location</Text>
      <MapView
        style={styles.map}
        region={region}
        onPress={e => setMarker(e.nativeEvent.coordinate)}
      >
        {marker && <Marker coordinate={marker} />}
      </MapView>
      {errors.location && <Text style={styles.errorText}>{errors.location}</Text>}

      <View style={{ marginVertical: 20 }}>
        {uploading ? (
          <ActivityIndicator size="large" color={COLORS.primary} />
        ) : (
          <Button title="Create Product" onPress={handleCreate} color={COLORS.primary} />
        )}
      </View>
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  label: { marginTop: 12, fontWeight: '600', color: COLORS.text },
  input: {
    borderWidth: 1,
    borderColor: COLORS.grayLight,
    borderRadius: 6,
    padding: 8,
    backgroundColor: '#fff',
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginVertical: 8,
  },
  imageRow: { flexDirection: 'row', flexWrap: 'wrap', marginVertical: 8 },
  thumb: { width: 60, height: 60, borderRadius: 6, margin: 4 },
  addBtn: {
    width: 60,
    height: 60,
    borderRadius: 6,
    backgroundColor: COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
    margin: 4,
  },
  plus: { color: '#fff', fontSize: 28, lineHeight: 28 },
  map: { width: '100%', height: 200, borderRadius: 6, marginTop: 8 },
  errorText: {
    color: 'red',
    fontSize: 12,
    marginTop: 4,
  },
})
