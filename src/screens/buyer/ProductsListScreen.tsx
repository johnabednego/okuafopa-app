import React, { useState, useRef, useEffect, useContext } from 'react';
import {
  View, Text, Button, ActivityIndicator,
  Alert, Animated, Image, TouchableOpacity, FlatList, StyleSheet, Easing,
  TextInput,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import api from '../../api/client';
import COLORS from '../../theme/colors';
import ImageViewer from 'react-native-image-zoom-viewer';
import Modal from 'react-native-modal';
import ProductDetailScreen from './ProductDetailScreen';
import { useCart } from '../../../src/context/CartContext';
import { AuthContext } from '../../../src/context/AuthContext'
import { router } from "expo-router"

type Product = {
  productItem: any;
  farmer: any;
  _id: string;
  title: string;
  description: string;
  price: number;
  quantity: number;
  category: string;
  images: string[];
  isActive: boolean;
  deliveryOptions: { pickup: boolean; thirdParty: boolean };
  location: { coordinates: [number, number] };
};

export default function ProductListScreen() {
  const { logout } = useContext(AuthContext)
  const [activeCategory, setActiveCategory] = useState<string>('AllCrops');
  const [productMessage, setProductMessage] = useState<string | null>(null);
  const rotateValue = useRef(new Animated.Value(0)).current;
  const [tab, setTab] = useState<'list' | 'create'>('list');
  const [allProducts, setAllProducts] = useState<Product[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [loadingList, setLoadingList] = useState(false);
  const [editingProductId, setEditingProductId] = useState<string | null>(null);
  const [zoomImages, setZoomImages] = useState<{ url: string }[]>([]);
  const [zoomVisible, setZoomVisible] = useState(false);
  const [zoomStartIndex, setZoomStartIndex] = useState(0);
  const rotationAnimation = useRef<Animated.CompositeAnimation | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [viewProduct, SetViewProduct] = useState<any>(null);

  //  use context
  const { addToCart } = useCart();

  const stopRotation = () => {
    rotateValue.setValue(0);
    if (rotationAnimation.current) {
      rotationAnimation.current.stop();
    }
  };

  const startRotation = () => {
    stopRotation();
    rotationAnimation.current = Animated.loop(
      Animated.timing(rotateValue, {
        toValue: 1,
        duration: 2000,
        easing: Easing.linear,
        useNativeDriver: true,
      })
    );
    rotationAnimation.current.start();
  };

  const rotateInterpolate = rotateValue.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  const handleCategoryClick = (category: string) => {
    setActiveCategory(category);
    startRotation();
    filterProducts(category);
  };

  const loadMyProducts = async () => {
    setLoadingList(true);
    try {
      const res = await api.get('/product-listings');
      setAllProducts(res.data.data);
      setProducts(res.data.data);
    } catch (e: any) {
      Alert.alert('Error', e.message);
      if (e.response?.data?.message === "Unauthorized: Invalid or expired token" || e.message === "Unauthorized: Invalid or expired token") {
        logout()
        router.replace('/')  // back to public landing
      }
    } finally {
      setLoadingList(false);
    }
  };

  const filterProducts = async (category: string, searchText = '') => {
    setProductMessage(null);
    try {
      let filtered = allProducts;

      if (category !== 'AllCrops') {
        filtered = filtered.filter((product: any) => {
          const categoryName = product.productItem?.category?.categoryName;
          return categoryName === category;
        });
      }

      if (searchText.trim() !== '') {
        const searchLower = searchText.toLowerCase();
        filtered = filtered.filter((product: any) => {
          const productName = product.productItem?.productName?.toLowerCase() || '';
          return productName.includes(searchLower);
        });
      }

      if (filtered.length === 0) {
        setProductMessage(
          `No products found${category !== 'AllCrops' ? ` for ${category}` : ''
          }${searchText ? ` matching "${searchText}"` : ''}.`
        );
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
    startRotation();
  }, [activeCategory]);

  useEffect(() => {
    if (tab === 'list' && editingProductId === null) loadMyProducts();
  }, [tab, editingProductId]);

  useEffect(() => {
    filterProducts(activeCategory, searchQuery);
  }, [activeCategory, searchQuery]);

  return (
    <View style={[styles.container, { backgroundColor: COLORS.grayLight }]}>
      {loadingList ? (
        <ActivityIndicator style={{ marginTop: 40 }} />
      ) : viewProduct ? (
        <View style={styles.container}>
          <View style={styles.tabBar}>
            <Button
              title="← Back to List"
              onPress={() => SetViewProduct(null)}
              color={COLORS.primary}
            />
            <Button
              title="Add to cart"
              onPress={() => {
                addToCart(viewProduct);
              }}
              color={COLORS.success}
            />
          </View>
          <ProductDetailScreen viewProduct={viewProduct} />
        </View>
      ) : (
        <View style={styles.container}>
          {/* Category Tabs */}
          <View style={styles.topContainer}>
            <Text style={{ fontWeight: '500', fontSize: 20, color: COLORS.white, marginLeft: 15 }}>
              Categories
            </Text>
            <View style={styles.imageContainer}>
              {[
                { key: 'AllCrops', label: 'All crops', icon: require('../../../assets/images/AllCrops.png') },
                { key: 'Fruits', label: 'Fruits', icon: require('../../../assets/images/Fruits.png') },
                { key: 'Grains', label: 'Grains', icon: require('../../../assets/images/Grains.png') },
                { key: 'Tubers', label: 'Tubers', icon: require('../../../assets/images/Tubers.png') },
                { key: 'Vegetables', label: 'Vegetables', icon: require('../../../assets/images/Vegetables.png') },
              ].map((cat) => (
                <TouchableOpacity
                  key={cat.key}
                  style={styles.category}
                  onPress={() => handleCategoryClick(cat.key)}
                >
                  <Animated.Image
                    source={cat.icon}
                    style={[
                      styles.image,
                      {
                        transform: [{ rotate: activeCategory === cat.key ? rotateInterpolate : '0deg' }],
                      },
                    ]}
                    resizeMode="cover"
                  />
                  <Text
                    style={[
                      styles.imageText,
                      { color: activeCategory === cat.key ? COLORS.gray : COLORS.white },
                    ]}
                  >
                    {cat.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            {/* Search bar */}
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
                backgroundColor: COLORS.white,
              }}
              placeholder="🔍 Search crops..."
              placeholderTextColor="#ccc"
              onChangeText={(text) => setSearchQuery(text)}
              value={searchQuery}
            />
          </View>

          {products.length === 0 ? (
            <Text style={{ textAlign: 'center', marginTop: 40, color: COLORS.text }}>
              {productMessage ?? 'No products found.'}
            </Text>
          ) : (
            <FlatList
              data={products}
              keyExtractor={(p) => p._id}
              contentContainerStyle={{ padding: 16 }}
              renderItem={({ item }) => (
                <TouchableOpacity style={styles.card} onPress={() => SetViewProduct(item)}>
                  <View style={styles.cardHeader}>
                    {item.images[0] && <Image source={{ uri: item.images[0] }} style={styles.thumb} />}
                    <View style={styles.productInfo}>
                      <Text style={styles.title}>{item.productItem?.productName}</Text>
                      <Text>📦 <Text style={{ fontWeight: '700' }}>Qty:</Text> {item.quantity}</Text>
                      <Text>💸 ₵{item.price}</Text>
                    </View>
                    <View style={styles.farmerInfo}>
                      <Text>👨‍🌾 <Text style={{ fontWeight: '700' }}>Farmer</Text></Text>
                      <Text style={styles.farmerText}>
                        {item.farmer.firstName} {item.farmer.lastName}
                      </Text>
                    </View>
                  </View>
                </TouchableOpacity>
              )}
            />
          )}

          {/* Modal for image view */}
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
  );
}

const styles = StyleSheet.create({
  topContainer: {
    backgroundColor: COLORS.primary,
    paddingVertical: 14,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
  },
  category: { flexDirection: 'column', justifyContent: 'center', alignItems: 'center' },
  image: { width: 52, height: 52 },
  imageText: { fontWeight: '600', fontSize: 12, color: COLORS.white },
  container: { flex: 1 },
  tabBar: {
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 8,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 6,
    padding: 12,
    marginBottom: 12,
    elevation: 2,
  },
  cardHeader: { flexDirection: 'row', alignItems: 'flex-start', width: '100%' },
  thumb: { width: 60, height: 60, borderRadius: 4 },
  productInfo: { flex: 1, marginLeft: 12, marginRight: 8 },
  farmerInfo: { flexShrink: 1, maxWidth: 100 },
  farmerText: { flexWrap: 'wrap' },
  title: { fontSize: 16, fontWeight: '600' },
  imageContainer: { marginTop: 10, flexDirection: 'row', justifyContent: 'space-between', paddingHorizontal: 12 },
});
