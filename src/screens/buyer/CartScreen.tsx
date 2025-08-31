import React from 'react';
import {
  View,
  Text,
  FlatList,
  Image,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import COLORS from '../../theme/colors';
import { useNavigation } from '@react-navigation/native';
import { useCart, CartItem } from '../../../src/context/CartContext';

export default function CartScreen() {
  const navigation = useNavigation<any>();
  const { cart, removeFromCart, updateQuantity } = useCart();

  const subtotal = (item: CartItem) =>
    (item.selectedQuantity ?? 1) * item.price;

  const grandTotal = cart.reduce((acc, item) => acc + subtotal(item), 0);

  const renderItem = ({ item }: { item: CartItem }) => {
    const qty = item.selectedQuantity ?? 1;

    return (
      <View style={styles.card}>
        <Image source={{ uri: item.images[0] }} style={styles.image} />
        <View style={styles.details}>
          <Text style={styles.name}>{item.productItem?.productName}</Text>
          <Text>Price: ₵{item.price.toFixed(2)}</Text>
          <Text>Available: {item.quantity}</Text>

          <View style={styles.quantityRow}>
            <TouchableOpacity
              onPress={() => qty > 1 && updateQuantity(item._id, qty - 1)}
              style={[styles.qtyBtn, qty <= 1 && styles.disabled]}
            >
              <Text style={styles.qtyText}>−</Text>
            </TouchableOpacity>
            <Text style={styles.qtyCount}>{qty}</Text>
            <TouchableOpacity
              onPress={() =>
                qty < item.quantity && updateQuantity(item._id, qty + 1)
              }
              style={[styles.qtyBtn, qty >= item.quantity && styles.disabled]}
            >
              <Text style={styles.qtyText}>+</Text>
            </TouchableOpacity>
          </View>

          <Text style={styles.subtotal}>
            Subtotal: ₵{subtotal(item).toFixed(2)}
          </Text>
        </View>

        <TouchableOpacity onPress={() => removeFromCart(item._id)}>
          <Ionicons name="trash-outline" size={24} color="red" />
        </TouchableOpacity>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      {cart.length === 0 ? (
        <Text style={styles.empty}>Your cart is empty.</Text>
      ) : (
        <>
          <FlatList
            data={cart}
            keyExtractor={item => item._id}
            renderItem={renderItem}
            contentContainerStyle={{ padding: 16 }}
          />

          <View style={styles.footer}>
            <Text style={styles.totalText}>
              Grand Total: ₵{grandTotal.toFixed(2)}
            </Text>
            <TouchableOpacity
              style={styles.checkoutBtn}
              onPress={() =>
                navigation.navigate('Checkout', {
                  cartItems: cart,
                  grandTotal,
                })
              }
            >
              <Text style={styles.checkoutText}>Proceed to Checkout</Text>
            </TouchableOpacity>
          </View>
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  empty: { textAlign: 'center', marginTop: 40, fontSize: 16 },
  card: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderRadius: 8,
    marginBottom: 12,
    padding: 12,
    alignItems: 'flex-start',
    elevation: 2,
  },
  image: { width: 60, height: 60, borderRadius: 6 },
  details: { flex: 1, marginLeft: 12 },
  name: { fontWeight: '600', fontSize: 16 },
  quantityRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 6,
  },
  qtyBtn: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    backgroundColor: '#ccc',
    borderRadius: 4,
  },
  disabled: { backgroundColor: '#eee' },
  qtyText: { fontSize: 18 },
  qtyCount: { marginHorizontal: 8, fontSize: 16 },
  subtotal: { fontWeight: '600', marginTop: 4 },
  footer: {
    padding: 16,
    borderTopWidth: 1,
    borderColor: '#ddd',
    backgroundColor: '#fff',
  },
  totalText: { fontSize: 18, fontWeight: 'bold', marginBottom: 12 },
  checkoutBtn: {
    backgroundColor: COLORS.primary,
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  checkoutText: { color: '#fff', fontWeight: 'bold' },
});
