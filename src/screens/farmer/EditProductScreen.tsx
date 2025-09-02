import React, { useState, useEffect, useContext } from 'react'
import {
  View, Text, ScrollView, TextInput, Switch, TouchableOpacity, Image,
  ActivityIndicator, Alert, StyleSheet
} from 'react-native'
import RNPickerSelect from 'react-native-picker-select'
import MapView, { Marker } from 'react-native-maps'
import * as ImagePicker from 'expo-image-picker'
import * as Location from 'expo-location'
import { uploadImageAsync } from '../../utils/cloudinary'
import { AuthContext } from '../../context/AuthContext'
import COLORS from '../../theme/colors'
import api from '../../api/client'
import { router } from "expo-router"


interface Props {
  id: string
  onDone: () => void
}

export default function EditProductScreen({ id, onDone }: Props) {
  const { logout } = useContext(AuthContext)

  type Category = { _id: string; categoryName: string }
  type ProductItem = { _id: string; productName: string }

  const [categories, setCategories] = useState<Category[]>([])
  const [productItems, setProductItems] = useState<ProductItem[]>([])

  const [selectedCategory, setSelectedCategory] = useState('')
  const [selectedProductItem, setSelectedProductItem] = useState('')

  const [description, setDescription] = useState('')
  const [price, setPrice] = useState('')
  const [quantity, setQuantity] = useState('')
  const [images, setImages] = useState<string[]>([])
  const [isActive, setIsActive] = useState(true)
  const [deliveryOptions, setDeliveryOptions] = useState({ pickup: true, thirdParty: false })
  const [marker, setMarker] = useState<{ latitude: number, longitude: number } | null>(null)
  const [region, setRegion] = useState({ latitude: 0, longitude: 0, latitudeDelta: 0.01, longitudeDelta: 0.01 })

  const [loading, setLoading] = useState(true)
  const [uploading, setUploading] = useState(false)

  type ErrorState = {
    category?: string
    productItem?: string
    description?: string
    price?: string
    quantity?: string
    images?: string
    location?: string
  }
  const [errors, setErrors] = useState<ErrorState>({})

  useEffect(() => {
    fetchCategories()
    loadProduct()
  }, [])

  useEffect(() => {
    if (selectedCategory) {
      fetchProductItems(selectedCategory)
    } else {
      setProductItems([])
      setSelectedProductItem('')
    }
  }, [selectedCategory])

  const fetchCategories = async () => {
    try {
      const res = await api.get('/product-categories')
      setCategories(res.data || [])
    } catch (e: any) {
      Alert.alert('Error', e.response?.data?.message || e.message)
      if (e.response?.data?.message === "Unauthorized: Invalid or expired token" || e.message === "Unauthorized: Invalid or expired token") {
        logout()
        router.replace('/')  // back to public landing
      }
    }
  }

  const fetchProductItems = async (categoryId: string) => {
    try {
      const res = await api.get(`/product-items?category=${categoryId}`)
      setProductItems(res.data || [])
    } catch (e: any) {
      Alert.alert('Error', e.response?.data?.message || e.message)
      if (e.response?.data?.message === "Unauthorized: Invalid or expired token" || e.message === "Unauthorized: Invalid or expired token") {
        logout()
        router.replace('/')  // back to public landing
      }
    }
  }

  const loadProduct = async () => {
    try {
      const res = await api.get(`/product-listings/${id}`)
      const p = res.data
      setSelectedCategory(p.productItem?.category?._id || '')
      setSelectedProductItem(p.productItem?._id || '')
      setDescription(p.description || '')
      setPrice(String(p.price || ''))
      setQuantity(String(p.quantity || ''))
      setImages(p.images || [])
      setIsActive(p.isActive)
      setDeliveryOptions(p.deliveryOptions || { pickup: true, thirdParty: false })

      if (p.location?.coordinates) {
        const [lng, lat] = p.location.coordinates
        setRegion(r => ({ ...r, latitude: lat, longitude: lng }))
        setMarker({ latitude: lat, longitude: lng })
      } else {
        getLocation()
      }
    } catch (e: any) {
      Alert.alert('Error', e.response?.data?.message || e.message)
      if (e.response?.data?.message === "Unauthorized: Invalid or expired token" || e.message === "Unauthorized: Invalid or expired token") {
        logout()
        router.replace('/')  // back to public landing
      }
    } finally {
      setLoading(false)
    }
  }

  const getLocation = async () => {
    const { status } = await Location.requestForegroundPermissionsAsync()
    if (status !== 'granted') return
    const loc = await Location.getCurrentPositionAsync({})
    setRegion(r => ({ ...r, latitude: loc.coords.latitude, longitude: loc.coords.longitude }))
    setMarker({ latitude: loc.coords.latitude, longitude: loc.coords.longitude })
  }

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({ quality: 0.7 })
    if (!result.canceled && result.assets.length) {
      setUploading(true)
      try {
        const url = await uploadImageAsync(result.assets[0].uri)
        setImages(prev => [...prev, url])
      } catch (e: any) {
        Alert.alert('Upload failed', e.message)
        if (e.response?.data?.message === "Unauthorized: Invalid or expired token" || e.message === "Unauthorized: Invalid or expired token") {
          logout()
          router.replace('/')  // back to public landing
        }
      } finally {
        setUploading(false)
      }
    }
  }

  const removeImage = (index: number) => {
    if (images.length === 1) {
      Alert.alert('Error', 'At least one image is required')
      return
    }
    setImages(imgs => imgs.filter((_, i) => i !== index))
  }

  const validate = () => {
    const newErrors: ErrorState = {}
    if (!selectedCategory) newErrors.category = 'Select a category'
    if (!selectedProductItem) newErrors.productItem = 'Select a product item'
    if (!description.trim()) newErrors.description = 'Description required'

    if (!price.trim()) newErrors.price = 'Price required'
    else if (isNaN(Number(price))) newErrors.price = 'Must be a number'

    if (!quantity.trim()) newErrors.quantity = 'Quantity required'
    else if (isNaN(Number(quantity))) newErrors.quantity = 'Must be a number'

    if (!images.length) newErrors.images = 'At least one image is required'
    if (!marker) newErrors.location = 'Select a location on map'
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSave = async () => {
    if (!validate()) return
    setUploading(true)
    try {
      const payload = {
        productItem: selectedProductItem,
        description,
        price: parseFloat(price),
        quantity: parseInt(quantity, 10),
        images,
        isActive,
        deliveryOptions,
        location: marker
          ? { type: 'Point', coordinates: [marker.longitude, marker.latitude] }
          : undefined
      }
      await api.patch(`/product-listings/${id}`, payload)
      Alert.alert('Success', 'Product listing updated')
      onDone()
    } catch (e: any) {
      Alert.alert('Error', e.response?.data?.message || e.message)
      if (e.response?.data?.message === "Unauthorized: Invalid or expired token" || e.message === "Unauthorized: Invalid or expired token") {
        logout()
        router.replace('/')  // back to public landing
      }
    } finally {
      setUploading(false)
    }
  }

  if (loading) return <ActivityIndicator style={{ flex: 1 }} />

  return (
    <ScrollView style={{ backgroundColor: COLORS.background }} contentContainerStyle={{ padding: 16 }}>
      <Text style={styles.label}>Category</Text>
      <RNPickerSelect
        onValueChange={val => setSelectedCategory(val)}
        items={categories.map(c => ({ label: c.categoryName, value: c._id }))}
        value={selectedCategory}
        placeholder={{ label: 'Select category', value: '' }}
      />
      {errors.category && <Text style={styles.error}>{errors.category}</Text>}

      <Text style={styles.label}>Product Item</Text>
      <RNPickerSelect
        onValueChange={val => setSelectedProductItem(val)}
        items={productItems.map(p => ({ label: p.productName, value: p._id }))}
        value={selectedProductItem}
        placeholder={{ label: 'Select product item', value: '' }}
      />
      {errors.productItem && <Text style={styles.error}>{errors.productItem}</Text>}

      <Text style={styles.label}>Description</Text>
      <TextInput style={[styles.input, { height: 80 }]} multiline value={description} onChangeText={setDescription} />
      {errors.description && <Text style={styles.error}>{errors.description}</Text>}

      <Text style={styles.label}>Price</Text>
      <TextInput style={styles.input} keyboardType="decimal-pad" value={price} onChangeText={setPrice} />
      {errors.price && <Text style={styles.error}>{errors.price}</Text>}

      <Text style={styles.label}>Quantity</Text>
      <TextInput style={styles.input} keyboardType="number-pad" value={quantity} onChangeText={setQuantity} />
      {errors.quantity && <Text style={styles.error}>{errors.quantity}</Text>}

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
        <Text>Third-Party</Text>
        <Switch
          value={deliveryOptions.thirdParty}
          onValueChange={v => setDeliveryOptions(o => ({ ...o, thirdParty: v }))}
          trackColor={{ false: COLORS.grayLight, true: COLORS.primary }}
          thumbColor="#fff"
        />
      </View>

      <Text style={styles.label}>Images</Text>
      <View style={{ flexDirection: 'row', flexWrap: 'wrap' }}>
        {images.map((uri, i) => (
          <View key={i} style={{ position: 'relative' }}>
            <Image source={{ uri }} style={styles.thumb} />
            {images.length > 1 && (
              <TouchableOpacity onPress={() => removeImage(i)} style={styles.removeBtn}>
                <Text style={{ color: '#fff', fontSize: 12 }}>✕</Text>
              </TouchableOpacity>
            )}
          </View>
        ))}
        <TouchableOpacity onPress={pickImage} style={styles.addBtn}>
          {uploading ? <ActivityIndicator color="#fff" /> : <Text style={{ color: '#fff' }}>＋</Text>}
        </TouchableOpacity>
      </View>
      {errors.images && <Text style={styles.error}>{errors.images}</Text>}

      <Text style={styles.label}>Select Location</Text>
      <MapView
        style={{ height: 200 }}
        region={region}
        onPress={e => setMarker(e.nativeEvent.coordinate)}
      >
        {marker && <Marker coordinate={marker} />}
      </MapView>
      {errors.location && <Text style={styles.error}>{errors.location}</Text>}

      <TouchableOpacity onPress={handleSave} style={styles.submitBtn}>
        {uploading ? <ActivityIndicator color="#fff" /> : <Text style={{ color: '#fff' }}>Save Changes</Text>}
      </TouchableOpacity>
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  label: { marginTop: 12, fontWeight: '600', color: COLORS.text },
  input: { borderWidth: 1, borderColor: COLORS.grayLight, padding: 8, borderRadius: 6, backgroundColor: '#fff' },
  row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginVertical: 8 },
  error: { color: 'red', fontSize: 12 },
  thumb: { width: 60, height: 60, borderRadius: 6, margin: 4 },
  addBtn: { width: 60, height: 60, backgroundColor: COLORS.primary, justifyContent: 'center', alignItems: 'center', borderRadius: 6, margin: 4 },
  removeBtn: { position: 'absolute', top: -4, right: -4, backgroundColor: COLORS.primary, borderRadius: 12, padding: 4 },
  submitBtn: { backgroundColor: COLORS.primary, padding: 14, borderRadius: 8, marginTop: 20, alignItems: 'center' }
})
