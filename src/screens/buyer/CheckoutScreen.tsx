import React, { useState } from 'react';
import { View, Text, TextInput, StyleSheet, TouchableOpacity, FlatList } from 'react-native';
import COLORS from '../../theme/colors';
import { useLocalSearchParams } from "expo-router";


export default function CheckoutScreen() {
  const params = useLocalSearchParams();
  const cartItems = params.cartItems ? JSON.parse(params.cartItems as string) : [];
  const grandTotal = params.grandTotal ? parseFloat(params.grandTotal as string) : 0;

  const [billing, setBilling] = useState({
    name: '', email: '', address: '', city: '', country: '', phone: '',
  });

  const handleChange = (field: string, value: string) =>
    setBilling(prev => ({ ...prev, [field]: value }));

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Order Summary</Text>
      <FlatList
        data={cartItems}
        keyExtractor={item => item._id}
        renderItem={({ item }) => (
          <View style={styles.itemRow}>
            <Text>{item.productItem?.productName}</Text>
            <Text>{item.selectedQuantity} × ₵{item.price.toFixed(2)}</Text>
          </View>
        )}
        ListFooterComponent={<Text style={styles.total}>Grand Total: ₵{grandTotal.toFixed(2)}</Text>}
      />

      <Text style={styles.header}>Billing & Delivery Information</Text>
      {['name', 'email', 'address', 'city', 'country', 'phone'].map(field => (
        <TextInput
          key={field}
          style={styles.input}
          placeholder={field.charAt(0).toUpperCase() + field.slice(1)}
          value={(billing as any)[field]}
          onChangeText={text => handleChange(field, text)}
        />
      ))}

      <TouchableOpacity style={styles.submitBtn} onPress={() => alert('Order submitted!')}>
        <Text style={styles.submitText}>Submit Order</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, backgroundColor: '#fff' },
  header: { fontSize: 18, fontWeight: '600', marginVertical: 12 },
  itemRow: { flexDirection: 'row', justifyContent: 'space-between', marginVertical: 4 },
  total: { fontWeight: 'bold', marginTop: 8, fontSize: 16 },
  input: { borderWidth: 1, borderColor: COLORS.gray, padding: 10, borderRadius: 4, marginBottom: 10 },
  submitBtn: { backgroundColor: COLORS.primary, padding: 16, borderRadius: 8, alignItems: 'center', marginTop: 20 },
  submitText: { color: 'white', fontWeight: 'bold' },
});
