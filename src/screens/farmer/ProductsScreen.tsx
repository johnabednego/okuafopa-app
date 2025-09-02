import React, { useState, useContext, useEffect } from 'react'
import {
  View, Text, Button, ActivityIndicator,
  Alert, Image, TouchableOpacity, FlatList, StyleSheet
} from 'react-native'
import api from '../../api/client'
import COLORS from '../../theme/colors'
import { AuthContext } from '../../context/AuthContext'
import EditProductScreen from './EditProductScreen'
import CreateProductScreen from './CreateProductScreen'
import { Ionicons } from '@expo/vector-icons'
import { router } from "expo-router"


import ImageViewer from 'react-native-image-zoom-viewer';
import Modal from 'react-native-modal';

type Product = {
  productItem: any
  _id: string
  title: string
  description: string
  price: number
  quantity: number
  category: string
  images: string[]
  isActive: boolean
  deliveryOptions: { pickup: boolean; thirdParty: boolean }
  location: { coordinates: [number, number] }
}

// if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
//   UIManager.setLayoutAnimationEnabledExperimental(true)
// }

export default function ProductsScreen() {
  const { logout } = useContext(AuthContext)

  const [tab, setTab] = useState<'list' | 'create'>('list')
  const [products, setProducts] = useState<Product[]>([])
  const [loadingList, setLoadingList] = useState(false)
  const [editingProductId, setEditingProductId] = useState<string | null>(null)
  const [expandedProductId, setExpandedProductId] = useState<string | null>(null)
  const [currentIndex, setCurrentIndex] = useState(0);

  const [zoomImages, setZoomImages] = useState<{ url: string }[]>([]);
  const [zoomVisible, setZoomVisible] = useState(false);
  const [zoomStartIndex, setZoomStartIndex] = useState(0);

  const loadMyProducts = async () => {
    setLoadingList(true)
    try {
      const res = await api.get('/product-listings?farmer=me')
      setProducts(res.data.data)
    } catch (e: any) {
      Alert.alert('Error', e.message)
      if (e.response?.data?.message === "Unauthorized: Invalid or expired token" || e.message === "Unauthorized: Invalid or expired token") {
        logout()
        router.replace('/')  // back to public landing
      }
    } finally {
      setLoadingList(false)
    }
  }

  const handleDelete = async (id: string) => {
    Alert.alert('Delete Product', 'Are you sure?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Yes',
        style: 'destructive',
        onPress: async () => {
          try {
            await api.delete(`/product-listings/${id}`)
            loadMyProducts()
          } catch (e: any) {
            Alert.alert('Error', e.message)
            if (e.response?.data?.message === "Unauthorized: Invalid or expired token" || e.message === "Unauthorized: Invalid or expired token") {
              logout()
              router.replace('/')  // back to public landing
            }
          }
        }
      }
    ])
  }

  useEffect(() => {
    if (tab === 'list' && editingProductId === null) loadMyProducts()
  }, [tab, editingProductId])

  if (editingProductId) {
    return (
      <View style={styles.container}>
        <View style={styles.tabBar}>
          <View style={{ width: "100%", display: "flex", flexDirection: "row", justifyContent: "flex-start", alignItems: "flex-start" }}>
            <Button title="← Back to List" onPress={() => setEditingProductId(null)} color={COLORS.primary} />
          </View>
        </View>
        <EditProductScreen
          id={editingProductId}
          onDone={() => {
            setEditingProductId(null)
            loadMyProducts()
          }}
        />
      </View>
    )
  }

  if (tab === 'list') {
    return (
      <View style={styles.container}>
        <View style={styles.tabBar}>
          <View style={{ width: "100%", display: "flex", flexDirection: "row", justifyContent: "flex-end", alignItems: "flex-end" }}>
            <Button title="＋ Add New" onPress={() => setTab('create')} color={COLORS.primary} />
          </View>
        </View>

        {loadingList ? (
          <ActivityIndicator style={{ marginTop: 40 }} />
        ) : products.length === 0 ? (
          <Text style={{ textAlign: 'center', marginTop: 40, color: COLORS.text }}>No products found.</Text>
        ) : (

          <View style={styles.container}>
            {/**Product Listing */}
            <FlatList
              data={products}
              keyExtractor={p => p._id}
              contentContainerStyle={{ padding: 16 }}
              renderItem={({ item }) => {
                const isExpanded = expandedProductId === item._id
                return (
                  <View style={[styles.card, isExpanded && { flexDirection: 'column', alignItems: 'flex-start' }]}>
                    <View style={styles.cardHeader}>
                      {item.images[0] && <Image source={{ uri: item.images[0] }} style={styles.cardImg} />}

                      <View style={{ flex: 1, marginLeft: 12 }}>
                        <Text style={styles.cardTitle}>{item.productItem?.productName}</Text>
                        <Text>₵{item.price} . Qty: {item.quantity}</Text>
                      </View>

                      <TouchableOpacity
                        onPress={() => setExpandedProductId(prev => (prev === item._id ? null : item._id))}
                        style={styles.expandBtn}
                      >
                        <Text style={styles.expandIcon}>{isExpanded ? '−' : '＋'}</Text>
                      </TouchableOpacity>
                    </View>

                    {isExpanded && (
                      <View style={styles.expandedContainer}>
                        {/* Carousel Container */}
                        <View style={styles.imageCarousel}>
                          <View style={styles.imageViewIcon}>
                            <Ionicons name="eye" size={30} color="white" />
                          </View>

                          <View style={styles.imageClickable}>
                            <Image
                              source={{ uri: item.images[currentIndex] }}
                              style={styles.expandedImage}
                              resizeMode="cover"
                            />

                            <TouchableOpacity
                              onPress={() => {
                                setZoomImages(item.images.map((img) => ({ url: img })));
                                setZoomStartIndex(currentIndex);
                                setZoomVisible(true);
                              }}
                              style={styles.imageTapOverlay}
                              activeOpacity={1}
                            >
                              {/* Invisible overlay to capture tap */}
                            </TouchableOpacity>
                          </View>
                        </View>

                        {/* Meta Information */}
                        <View style={styles.metaRow}>
                          <Text style={styles.metaLabel}>🏷️ Category:</Text>
                          <Text style={styles.metaValue}>{item.productItem?.category?.categoryName}</Text>
                        </View>

                        <View style={styles.metaRow}>
                          <Text style={styles.metaLabel}>💸 Price:</Text>
                          <Text style={styles.metaValue}>₵{item.price}</Text>
                        </View>

                        <View style={styles.metaRow}>
                          <Text style={styles.metaLabel}>📦 Quantity:</Text>
                          <Text style={styles.metaValue}>{item.quantity}</Text>
                        </View>

                        <View style={styles.metaRow}>
                          <Text style={styles.metaLabel}>📍 Active:</Text>
                          <Text style={styles.metaValue}>{item.isActive ? 'Yes' : 'No'}</Text>
                        </View>

                        <View style={styles.metaRow}>
                          <Text style={styles.metaLabel}>🚚 Delivery:</Text>
                          <Text style={styles.metaValue}>
                            {item?.deliveryOptions?.pickup ? 'Pickup' : ''}
                            {item?.deliveryOptions?.pickup && item.deliveryOptions?.thirdParty ? ', ' : ''}
                            {item?.deliveryOptions?.thirdParty ? 'Third-party' : ''}
                          </Text>
                        </View>

                        <View style={[styles.metaRow, { flexDirection: 'column', alignItems: 'flex-start' }]}>
                          <Text style={styles.metaLabel}>📝 Description:</Text>
                          <Text style={[styles.metaValue, { marginTop: 4 }]}>{item.description}</Text>
                        </View>

                        {/* Edit & Delete Actions */}
                        <View style={styles.cardActions}>
                          <TouchableOpacity onPress={() => setEditingProductId(item._id)}>
                            <Text style={styles.edit}>Edit</Text>
                          </TouchableOpacity>
                          <TouchableOpacity onPress={() => handleDelete(item._id)}>
                            <Text style={styles.delete}>Delete</Text>
                          </TouchableOpacity>
                        </View>
                      </View>
                    )}

                  </View>
                )
              }}

            />

            {/**Modal for image view */}
            <Modal
              isVisible={zoomVisible}
              onBackdropPress={() => setZoomVisible(false)}
              style={{ margin: 0, backgroundColor: 'black' }}
            >
              <ImageViewer
                imageUrls={zoomImages}
                index={zoomStartIndex}
                enableSwipeDown
                onSwipeDown={() => setZoomVisible(false)}
                renderHeader={() => (
                  <TouchableOpacity
                    onPress={() => setZoomVisible(false)}
                    style={{
                      position: 'absolute',
                      top: 40,
                      right: 20,
                      zIndex: 10,
                      backgroundColor: 'rgba(0,0,0,0.6)',
                      padding: 10,
                      borderRadius: 30,
                    }}
                  >
                    <Ionicons name="close" size={30} color="white" />
                  </TouchableOpacity>
                )}
              />
            </Modal>



          </View>
        )}
      </View>
    )
  }

  return (
    <View style={styles.container}>
      <View style={[styles.tabBar, {
        borderBottomWidth: 1,
        borderBottomColor: COLORS.grayLight
      }]}>
        <View style={{ width: "100%", display: "flex", flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
          <Text style={styles.title}>List New Product</Text>
          <Button title="← Back to List" onPress={() => setTab('list')} color={COLORS.primary} />
        </View>
      </View>
      <CreateProductScreen
        onDone={() => {
          setTab('list')
          loadMyProducts()
        }}
      />
    </View>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  tabBar: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    padding: 8,
  },
  title: {
    fontWeight: 700,
    fontSize: 20,
    color: COLORS.primary,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 6,
    padding: 12,
    marginBottom: 12,
    elevation: 2,
  },
  cardExpanded: {
    borderColor: COLORS.primary,
    borderWidth: 1,
  },
  cardImg: { width: 60, height: 60, borderRadius: 6 },
  imageWrapper: { alignSelf: 'flex-start' },

  imageCarousel: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center'
  },
  imageClickable: {
    flexDirection: 'row', justifyContent: 'space-between',
  },
  imageViewIcon: {
    position: 'absolute',
    top: '50%',
    zIndex: 1,
    transform: [{ translateY: -15 }], // Center vertically (since icon size is ~30)
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    padding: 10,
    borderRadius: 50,
    alignItems: 'center',
    justifyContent: 'center',
  },

  imageTapOverlay: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 2,
  },


  infoWrapper: { marginTop: 8 },
  cardTitle: { fontSize: 16, fontWeight: '600' },
  cardSubtitle: { color: '#666', marginTop: 2 },
  cardDetail: { marginTop: 6, color: '#333', fontSize: 14 },
  cardActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 16,
    marginTop: 12,
  },
  edit: { color: COLORS.primary, fontWeight: 'bold', marginRight: 16 },
  delete: { color: 'red', fontWeight: 'bold' },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
  },

  expandBtn: {
    backgroundColor: 'green',
    width: 28,
    height: 28,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
  },

  expandIcon: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
    lineHeight: 20,
  },

  expandedContainer: {
    width: '100%',
    backgroundColor: '#f9f9f9',
    borderRadius: 10,
    padding: 12,
    marginTop: 12,
    borderWidth: 1,
    borderColor: COLORS.grayLight,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },

  expandedImage: {
    width: '100%',
    height: 180,
    borderRadius: 8,
    marginBottom: 12,
  },

  metaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginVertical: 4,
    borderBottomWidth: 1,
    borderColor: COLORS.gray,
  },

  metaLabel: {
    fontWeight: '600',
    color: COLORS.text,
    fontSize: 14,
  },

  metaValue: {
    color: '#333',
    fontSize: 14,
  },

})
