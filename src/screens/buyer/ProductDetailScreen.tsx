import React, { useState } from 'react'
import {
  View, Text, ScrollView, Image, Dimensions, StyleSheet,
  TouchableOpacity
} from 'react-native'
import MapView, { Marker } from 'react-native-maps'
import COLORS from '../../theme/colors'
import { Ionicons } from '@expo/vector-icons'
import Modal from 'react-native-modal';
import ImageViewer from 'react-native-image-zoom-viewer'

export default function ProductDetailScreen({ viewProduct }: any) {
  const [zoomImages, setZoomImages] = useState<{ url: string }[]>([]);
  const [zoomVisible, setZoomVisible] = useState(false);
  const [zoomStartIndex, setZoomStartIndex] = useState(0);

  const width = Dimensions.get('window').width
  const { location, images, title, description, price, quantity } = viewProduct
  const [lng, lat] = location.coordinates

  return (
    <View style={styles.container}>
      <ScrollView style={{ flex: 1, padding: 16, }}>
        <View style={styles.card}>
          {/* {images.map((uri: string, i: number) => (
          <Image key={i} source={{ uri }} style={{ width, height: width * 0.75 }} />
        ))} */}

          {/* Carousel Container */}
          <View style={styles.imageCarousel}>
            <View style={styles.imageViewIcon}>
              <Ionicons name="eye" size={30} color={COLORS.white} />
            </View>

            <View style={styles.imageClickable}>
              <Image
                source={{ uri: viewProduct.images[0] }}
                style={styles.expandedImage}
                resizeMode="cover"
              />

              {/* Dark overlay over the image */}
              <View style={styles.darkOverlay} />

              <TouchableOpacity
                onPress={() => {
                  setZoomImages(viewProduct.images.map((img: any) => ({ url: img })));
                  setZoomStartIndex(0);
                  setZoomVisible(true);
                }}
                style={styles.imageTapOverlay}
                activeOpacity={1}
              >
              </TouchableOpacity>
            </View>
          </View>
        </View>

        {/* Horizontal wrapper */}
        <View style={styles.horizontalContainer}>

          {/* Product Info */}
          <View style={styles.productInfoContainer}>
            <Text style={styles.title}>{viewProduct.productItem?.productName}</Text>

            {/* Meta Information */}
            <View style={styles.metaContainer}>
              <View style={styles.metaRow}>
                <Text style={styles.metaLabel}>🏷️ Category:</Text>
                <Text style={styles.metaValue}>{viewProduct.productItem?.category?.categoryName}</Text>
              </View>

              <View style={styles.metaRow}>
                <Text style={styles.metaLabel}>💸 Price:</Text>
                <Text style={styles.metaValue}>₵{viewProduct.price}</Text>
              </View>

              <View style={styles.metaRow}>
                <Text style={styles.metaLabel}>📦 Quantity:</Text>
                <Text style={styles.metaValue}>{viewProduct.quantity}</Text>
              </View>

              <View style={styles.metaRow}>
                <Text style={styles.metaLabel}>📍 Active:</Text>
                <Text style={styles.metaValue}>{viewProduct.isActive ? 'Yes' : 'No'}</Text>
              </View>

              <View style={styles.metaRow}>
                <Text style={styles.metaLabel}>🚚 Delivery:</Text>
                <Text style={styles.metaValue}>
                  {viewProduct?.deliveryOptions?.pickup ? 'Pickup' : ''}
                  {viewProduct?.deliveryOptions?.pickup && viewProduct.deliveryOptions?.thirdParty ? ', ' : ''}
                  {viewProduct?.deliveryOptions?.thirdParty ? 'Third-party' : ''}
                </Text>
              </View>

              <View style={[styles.metaRow, { flexDirection: 'column', alignItems: 'flex-start' }]}>
                <Text style={styles.metaLabel}>📝 Description:</Text>
                <Text style={[styles.metaValue, { marginTop: 4 }]}>{viewProduct.description}</Text>
              </View>
            </View>
          </View>

          {/* Farmer Info */}
          <View style={styles.farmerInfoContainer}>
            <View style={styles.farmerInfo}>
              <Text>
                👨‍🌾 <Text style={{ fontWeight: '700' }}>Farmer</Text>
              </Text>
              <Text style={styles.farmerText}>
                {viewProduct.farmer.firstName} {viewProduct.farmer.lastName}
              </Text>
            </View>
          </View>
        </View>

        <Text style={styles.label}>Location</Text>
        <MapView
          style={{ height: 200, borderRadius: 6, marginTop: 8 }}
          initialRegion={{ latitude: lat, longitude: lng, latitudeDelta: 0.01, longitudeDelta: 0.01 }}
        >
          <Marker coordinate={{ latitude: lat, longitude: lng }} />
        </MapView>

      </ScrollView>

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

const styles = StyleSheet.create({
  container: { flex: 1 },
  title: { fontSize: 22, fontWeight: 'bold', color: COLORS.primary, marginTop: 12 },
  price: { fontSize: 18, marginVertical: 8 },
  desc: { fontSize: 14, color: COLORS.text, marginBottom: 12 },
  label: { fontWeight: '600', marginTop: 16 },
  card: {
    backgroundColor: COLORS.white,
    borderRadius: 6,
    elevation: 2,
  },
  imageCarousel: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  imageClickable: {
    flexDirection: 'row', justifyContent: 'space-between',
  },
  imageViewIcon: {
    position: 'absolute',
    top: '50%',
    zIndex: 2,
    transform: [{ translateY: -15 }], // Center vertically (since icon size is ~30)
    backgroundColor: 'rgba(0, 0, 0, 0.9)',
    padding: 10,
    borderRadius: 50,
    alignItems: 'center',
    justifyContent: 'center',
  },
  expandedImage: {
    width: '100%',
    height: Dimensions.get('window').width * 0.75,
    borderRadius: 8,
  },
  darkOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    borderRadius: 8,
    zIndex: 1, // Below the TouchableOpacity but above the Image
  },
  imageTapOverlay: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 3,
  },

  metaContainer: {
    width: '100%',
    backgroundColor: COLORS.white,
    borderRadius: 10,
    padding: 12,
    marginTop: 12,
    // borderWidth: 1,
    // borderColor: COLORS.grayLight,
    // shadowColor: '#000',
    // shadowOffset: { width: 0, height: 1 },
    // shadowOpacity: 0.1,
    // shadowRadius: 3,
    // elevation: 2,
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

  horizontalContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: 16, // for spacing if supported in your RN version (or use margin)
  },

  productInfoContainer: {
    flex: 1,
  },

  farmerInfoContainer: {
    marginTop: 54,
    backgroundColor: COLORS.white,
    padding: 10,
    borderRadius: 8,
  },

  farmerInfo: {
    flexShrink: 1,
    maxWidth: 150, // Optional, can be tuned
  },

  farmerText: {
    flexWrap: 'wrap',
  },
})
