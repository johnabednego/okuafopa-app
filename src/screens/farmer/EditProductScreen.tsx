import React, { useState, useEffect, useContext } from 'react'
import {
  View, Text, TextInput, Button, ScrollView,
  ActivityIndicator, Alert, Image, TouchableOpacity, StyleSheet, Switch
} from 'react-native'
import MapView, { Marker, Region } from 'react-native-maps'
import * as ImagePicker from 'expo-image-picker'
import * as Location from 'expo-location'
import { uploadImageAsync } from '../../utils/cloudinary'
import api from '../../api/client'
import COLORS from '../../theme/colors'
import { AuthContext } from '../../context/AuthContext'

interface Props {
  id: string
  onDone: () => void
}

export default function EditProductScreen({ id, onDone }: Props) {
  const { user } = useContext(AuthContext)

  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  const [title, setTitle] = useState('')
  const [description, setDesc] = useState('')
  const [price, setPrice] = useState('')
  const [quantity, setQuantity] = useState('')
  const [category, setCategory] = useState('')
  const [images, setImages] = useState<string[]>([])
  const [isActive, setIsActive] = useState(true)
  const [deliveryOptions, setDeliveryOptions] = useState({ pickup: true, thirdParty: false })

  const [region, setRegion] = useState<Region>({
    latitude: 0, longitude: 0, latitudeDelta: 0.01, longitudeDelta: 0.01
  })
  const [marker, setMarker] = useState<{ latitude: number; longitude: number } | null>(null)

  const [errors, setErrors] = useState<{ [key: string]: string }>({})

  useEffect(() => {
    api.get(`/products/${id}`)
      .then(res => {
        const p = res.data
        setTitle(p.title)
        setDesc(p.description)
        setPrice(String(p.price))
        setQuantity(String(p.quantity))
        setCategory(p.category)
        setImages(p.images || [])
        setIsActive(p.isActive)
        setDeliveryOptions(p.deliveryOptions || { pickup: true, thirdParty: false })
        if (p.location?.coordinates) {
          const [lng, lat] = p.location.coordinates
          setRegion(r => ({ ...r, latitude: lat, longitude: lng }))
          setMarker({ latitude: lat, longitude: lng })
        }
      })
      .catch(() => Alert.alert('Error', 'Failed to load product'))
      .finally(() => setLoading(false))
  }, [id])

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
      setSaving(true)
      try {
        const url = await uploadImageAsync(result.assets[0].uri)
        setImages(imgs => [...imgs, url])
      } catch (e: any) {
        Alert.alert('Upload failed', e.message)
      } finally {
        setSaving(false)
      }
    }
  }

  const removeImage = (index: number) => {
    const newImages = [...images]
    newImages.splice(index, 1)
    setImages(newImages)
  }

  const handleSave = async () => {
    if (!validate()) return

    setSaving(true)
    const payload = {
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
        coordinates: [marker!.longitude, marker!.latitude],
      },
    }

    try {
      await api.patch(`/products/${id}`, payload)
      Alert.alert('Saved', `"${title}" updated`)
      onDone()
    } catch (e: any) {
      Alert.alert('Error', e.response?.data?.message || e.message)
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return <ActivityIndicator style={{ flex: 1, justifyContent: 'center' }} />
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.label}>Title</Text>
      <TextInput style={styles.input} value={title} onChangeText={setTitle} />
      {errors.title && <Text style={styles.errorText}>{errors.title}</Text>}

      <Text style={styles.label}>Description</Text>
      <TextInput
        style={[styles.input, { height: 80 }]}
        multiline value={description}
        onChangeText={setDesc}
      />
      {errors.description && <Text style={styles.errorText}>{errors.description}</Text>}

      <Text style={styles.label}>Price</Text>
      <TextInput
        style={styles.input}
        keyboardType="decimal-pad"
        value={price}
        onChangeText={setPrice}
      />
      {errors.price && <Text style={styles.errorText}>{errors.price}</Text>}

      <Text style={styles.label}>Quantity</Text>
      <TextInput
        style={styles.input}
        keyboardType="number-pad"
        value={quantity}
        onChangeText={setQuantity}
      />
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
          <View key={i} style={{ position: 'relative' }}>
            <Image source={{ uri }} style={styles.thumb} />
            {images.length > 1 && (
              <TouchableOpacity
                onPress={() => removeImage(i)}
                style={styles.removeBtn}
              >
                <Text style={{ color: '#fff', fontSize: 12 }}>✕</Text>
              </TouchableOpacity>
            )}
          </View>
        ))}
        <TouchableOpacity style={styles.addBtn} onPress={pickImage}>
          {saving
            ? <ActivityIndicator color="#fff" />
            : <Text style={styles.plus}>＋</Text>
          }
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
        {saving
          ? <ActivityIndicator color={COLORS.primary} size="large" />
          : <Button
            title="Save Changes"
            onPress={handleSave}
            color={COLORS.primary}
          />
        }
      </View>
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  content: { padding: 16 },
  label: { marginTop: 12, fontWeight: '600', color: COLORS.text },
  input: {
    borderWidth: 1, borderColor: COLORS.grayLight,
    borderRadius: 6, padding: 8, backgroundColor: '#fff'
  },
  row: {
    flexDirection: 'row', justifyContent: 'space-between',
    alignItems: 'center', marginVertical: 8,
  },
  imageRow: { flexDirection: 'row', flexWrap: 'wrap', marginVertical: 8 },
  thumb: { width: 60, height: 60, borderRadius: 6, margin: 4 },
  addBtn: {
    width: 60, height: 60, borderRadius: 6,
    backgroundColor: COLORS.primary, justifyContent: 'center',
    alignItems: 'center', margin: 4,
  },
  plus: { color: '#fff', fontSize: 28, lineHeight: 28 },
  removeBtn: {
    position: 'absolute', top: -4, right: -4,
    backgroundColor: COLORS.primary,
    borderRadius: 12, padding: 4, zIndex: 1,
  },
  map: { width: '100%', height: 200, borderRadius: 6, marginTop: 8 },
  errorText: { color: 'red', fontSize: 12, marginTop: 4 },
})
