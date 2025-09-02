import React, { useState, useContext, useEffect, useRef } from 'react'
import {
  View, Text, Button, ActivityIndicator,
  Alert, Animated, Image, TouchableOpacity, FlatList, StyleSheet, Easing,
  TextInput,
} from 'react-native'
import { Ionicons } from '@expo/vector-icons';
import api from '../api/client'
import COLORS from '../theme/colors'
import { AuthContext } from '../../src/context/AuthContext'
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

export default function HomeScreen() {
  const { logout } = useContext(AuthContext)

  const [activeCategory, setActiveCategory] = useState<string>('AllCrops');
  const [productMessage, setProductMessage] = useState<string | null>(null)

  const rotateValue = useRef(new Animated.Value(0)).current;
  const [tab, setTab] = useState<'list' | 'create'>('list')
  const [allProducts, setAllProducts] = useState<Product[]>([])
  const [products, setProducts] = useState<Product[]>([])
  const [loadingList, setLoadingList] = useState(false)
  const [editingProductId, setEditingProductId] = useState<string | null>(null)
  const [expandedProductId, setExpandedProductId] = useState<string | null>(null)
  const [currentIndex, setCurrentIndex] = useState(0);

  const [zoomImages, setZoomImages] = useState<{ url: string }[]>([]);
  const [zoomVisible, setZoomVisible] = useState(false);
  const [zoomStartIndex, setZoomStartIndex] = useState(0);

  const rotationAnimation = useRef<Animated.CompositeAnimation | null>(null);  // Keeps track of the current animation

  const [searchQuery, setSearchQuery] = useState('');


  const stopRotation = () => {
    // Reset the rotation value to stop any ongoing rotation
    rotateValue.setValue(0);
    if (rotationAnimation.current) {
      rotationAnimation.current.stop();
    }
  };

  const startRotation = () => {
    stopRotation(); // First, stop the current rotation if any

    // Start a new rotation animation
    rotationAnimation.current = Animated.loop(
      Animated.timing(rotateValue, {
        toValue: 1,
        duration: 2000, // Duration for a full rotation
        easing: Easing.linear,
        useNativeDriver: true,
      })
    );

    rotationAnimation.current.start();  // Start the animation
  };

  const rotateInterpolate = rotateValue.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  const handleCategoryClick = (category: string) => {
    setActiveCategory(category); // Set the active category
    startRotation()
    filterProducts(category)
  };

  const loadMyProducts = async () => {
    setLoadingList(true)
    try {
      const res = await api.get('/product-listings')
      setAllProducts(res.data.data)
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

  const filterProducts = async (category: string, searchText = '') => {
    setProductMessage(null);
    try {
      let filtered = allProducts;

      // Filter by category first (if not AllCrops)
      if (category !== 'AllCrops') {
        filtered = filtered.filter((product: any) => {
          const categoryName = product.productItem?.category?.categoryName;
          return categoryName === category;
        });
      }

      // Then filter by search text (if not empty)
      if (searchText.trim() !== '') {
        const searchLower = searchText.toLowerCase();
        filtered = filtered.filter((product: any) => {
          const productName = product.productItem?.productName?.toLowerCase() || '';
          return productName.includes(searchLower);
        });
      }

      if (filtered.length === 0) {
        setProductMessage(`No products found${category !== 'AllCrops' ? ` for the category: ${category}` : ''}${searchText ? ` matching "${searchText}"` : ''}.`);
      }

      setProducts(filtered);
    } catch (e: any) {
      Alert.alert('Error', e.message);
      if (e.response?.data?.message === "Unauthorized: Invalid or expired token" || e.message === "Unauthorized: Invalid or expired token") {
        logout()
        router.replace('/')  // back to public landing
      }
    }
  };



  useEffect(() => {
    startRotation(); // Start the animation
  }, [activeCategory])

  useEffect(() => {
    if (tab === 'list' && editingProductId === null) loadMyProducts()
  }, [tab, editingProductId])

  useEffect(() => {
    filterProducts(activeCategory, searchQuery);
  }, [activeCategory, searchQuery]);

  if (tab === 'list') {
    return (
      <View style={styles.container}>
        {loadingList ? (
          <ActivityIndicator style={{ marginTop: 40 }} />
        ) : (
          <View style={styles.container}>
            {/**The category Tabs */}
            <View style={styles.topContainer}>
              <Text style={{ fontWeight: 500, fontSize: 20, color: COLORS.white, marginLeft: 15 }}>Categories</Text>
              {/** Tabs */}
              <View style={styles.imageContainer}>
                <TouchableOpacity style={styles.category} onPress={() => handleCategoryClick('AllCrops')}>
                  <Animated.Image
                    source={require('../../assets/images/AllCrops.png')}
                    style={[
                      styles.image,
                      {
                        transform: [{ rotate: activeCategory === 'AllCrops' ? rotateInterpolate : '0deg' }],
                      },
                    ]}
                    resizeMode="cover"
                  />
                  <Text
                    style={[
                      styles.imageText,
                      { color: activeCategory === 'AllCrops' ? COLORS.gray : COLORS.white },
                    ]}
                  >
                    All crops
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity style={styles.category} onPress={() => handleCategoryClick('Fruits')}>
                  <Animated.Image
                    source={require('../../assets/images/Fruits.png')}
                    style={[
                      styles.image,
                      {
                        transform: [{ rotate: activeCategory === 'Fruits' ? rotateInterpolate : '0deg' }],
                      },
                    ]}
                    resizeMode="cover"
                  />
                  <Text
                    style={[
                      styles.imageText,
                      { color: activeCategory === 'Fruits' ? COLORS.gray : COLORS.white },
                    ]}
                  >
                    Fruits
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity style={styles.category} onPress={() => handleCategoryClick('Grains')}>
                  <Animated.Image
                    source={require('../../assets/images/Grains.png')}
                    style={[
                      styles.image,
                      {
                        transform: [{ rotate: activeCategory === 'Grains' ? rotateInterpolate : '0deg' }],
                      },
                    ]}
                    resizeMode="cover"
                  />
                  <Text
                    style={[
                      styles.imageText,
                      { color: activeCategory === 'Grains' ? COLORS.gray : COLORS.white },
                    ]}
                  >
                    Grains
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity style={styles.category} onPress={() => handleCategoryClick('Tubers')}>
                  <Animated.Image
                    source={require('../../assets/images/Tubers.png')}
                    style={[
                      styles.image,
                      {
                        transform: [{ rotate: activeCategory === 'Tubers' ? rotateInterpolate : '0deg' }],
                      },
                    ]}
                    resizeMode="cover"
                  />
                  <Text
                    style={[
                      styles.imageText,
                      { color: activeCategory === 'Tubers' ? COLORS.gray : COLORS.white },
                    ]}
                  >
                    Tubers
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity style={styles.category} onPress={() => handleCategoryClick('Vegetables')}>
                  <Animated.Image
                    source={require('../../assets/images/Vegetables.png')}
                    style={[
                      styles.image,
                      {
                        transform: [{ rotate: activeCategory === 'Vegetables' ? rotateInterpolate : '0deg' }],
                      },
                    ]}
                    resizeMode="cover"
                  />
                  <Text
                    style={[
                      styles.imageText,
                      { color: activeCategory === 'Vegetables' ? COLORS.gray : COLORS.white },
                    ]}
                  >
                    Vegetables
                  </Text>
                </TouchableOpacity>

              </View>

              {/** Search bar */}
              <TextInput
                style={{
                  height: 60,
                  borderColor: 'white',
                  borderWidth: 1,
                  borderRadius: 10,
                  marginTop: 25,
                  marginHorizontal: 20,
                  paddingHorizontal: 10,
                  fontSize: 20,
                  color: COLORS.black,
                  backgroundColor: COLORS.white
                }}
                placeholder="&#x1F50D; Search crops..."
                placeholderTextColor="#ccc"
                onChangeText={(text) => setSearchQuery(text)}
                value={searchQuery}
              />

            </View>

            {
              products.length === 0 ?
                (
                  productMessage ?
                    <Text style={{ textAlign: 'center', marginTop: 40, color: COLORS.text }}>{productMessage}</Text>
                    :
                    <Text style={{ textAlign: 'center', marginTop: 40, color: COLORS.text }}>No products found.</Text>
                )

                :
                (
                  <View style={styles.container}>
                    {/**  Product Listing */}
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
                                  <Text style={styles.metaLabel}>💰 Price:</Text>
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
                                {/* <View style={styles.cardActions}>
                          <TouchableOpacity onPress={() => setEditingProductId(item._id)}>
                            <Text style={styles.edit}>Edit</Text>
                          </TouchableOpacity>
                          <TouchableOpacity onPress={() => handleDelete(item._id)}>
                            <Text style={styles.delete}>Delete</Text>
                          </TouchableOpacity>
                        </View> */}
                              </View>
                            )}

                          </View>
                        )
                      }}

                    />

                    {/** Modal for image view */}
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
                )
            }
          </View>
        )}
      </View>
    )
  }

  return (
    <View style={styles.container}>
      <View style={styles.tabBar}>
        <View style={{ width: "100%", display: "flex", flexDirection: "row", justifyContent: "flex-start", alignItems: "flex-start" }}>
          <Button title="← Back to List" onPress={() => setTab('list')} color={COLORS.primary} />
        </View>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  topContainer: {
    backgroundColor: COLORS.primary,
    paddingVertical: 14,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30
  },
  category: {
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center'
  },
  image: {
    width: 52,
    height: 52
  },
  imageText: {
    fontWeight: 600,
    fontSize: 12,
    color: COLORS.white
  },
  container: { flex: 1, backgroundColor: COLORS.background },
  tabBar: { flexDirection: 'row', justifyContent: 'space-around', padding: 8 },
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

  imageContainer: {
    marginTop: 10,
    flexDirection: 'row', justifyContent: 'space-between',
    paddingHorizontal: 12,
  },

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
