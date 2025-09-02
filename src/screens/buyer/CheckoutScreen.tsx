import React, { useRef, useState, useContext } from "react"
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  Alert,
} from "react-native"
import { useLocalSearchParams, router } from "expo-router"
import { Formik } from "formik"
import * as Yup from "yup"
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context'
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view"
import api from "../../api/client"
import COLORS from "../../theme/colors"
import FormInput from "../../../src/components/FormInput"
import { AuthContext } from '../../../src/context/AuthContext'

const CheckoutSchema = Yup.object().shape({
  name: Yup.string().required("Name is required"),
  email: Yup.string().email("Invalid email").required("Email is required"),
  address: Yup.string().required("Address is required"),
  city: Yup.string().required("City is required"),
  country: Yup.string().required("Country is required"),
  phone: Yup.string().required("Phone is required"),
})

export default function CheckoutScreen() {
  const { logout } = useContext(AuthContext)

  const scrollRef = useRef<KeyboardAwareScrollView>(null)
  const insets = useSafeAreaInsets()
  const params = useLocalSearchParams()
  const cartItems = params.cartItems ? JSON.parse(params.cartItems as string) : []
  const grandTotal = params.grandTotal ? parseFloat(params.grandTotal as string) : 0
  const [loading, setLoading] = useState(false)

  const groupByFarmer = (items: any[]) => {
    const map: Record<string, any> = {}
    for (let item of items) {
      const farmerId = item?.farmer?._id || "unknown"
      if (!map[farmerId]) {
        map[farmerId] = {
          farmer: farmerId,
          deliveryMethod: "pickup",
          items: [],
        }
      }
      map[farmerId].items.push({
        product: item._id,
        qty: item.selectedQuantity,
      })
    }
    return Object.values(map)
  }

  const handleSubmit = async (values: any) => {
    setLoading(true)
    try {
      const payload = {
        subOrders: groupByFarmer(cartItems),
        billing: values,
      }

      await api.post("/orders", payload)
      Alert.alert("Success", "Your order has been placed!")
      router.replace({
        pathname: "/(tabs)/buyer/tabs",
        params: { initialTab: "Orders" },
      });

    } catch (e: any) {
      Alert.alert("Error", e.response?.data?.message || e.message)
      if (e.response?.data?.message === "Unauthorized: Invalid or expired token" || e.message === "Unauthorized: Invalid or expired token") {
        logout()
        router.replace('/')  // back to public landing
      }

    } finally {
      setLoading(false)
    }
  }

  return (
    <SafeAreaView
      edges={['bottom']}
      style={[styles.safeArea, { paddingBottom: insets.bottom }]}
    >
      <KeyboardAwareScrollView
        ref={scrollRef}
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
        enableOnAndroid
        extraScrollHeight={20}
        enableAutomaticScroll
      >
        {/* Order Summary */}
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>🛒 Order Summary</Text>
          <FlatList
            data={cartItems}
            keyExtractor={(item) => item._id}
            renderItem={({ item }) => (
              <View style={styles.itemRow}>
                <Text style={styles.itemName}>
                  {item.productItem?.productName}
                </Text>
                <Text style={styles.itemPrice}>
                  {item.selectedQuantity} × ₵{item.price.toFixed(2)}
                </Text>
              </View>
            )}
            scrollEnabled={false}
            ListFooterComponent={
              <Text style={styles.total}>
                Grand Total: ₵{grandTotal.toFixed(2)}
              </Text>
            }
          />
        </View>

        {/* Billing Form */}
        <Formik
          initialValues={{
            name: "",
            email: "",
            address: "",
            city: "",
            country: "",
            phone: "",
          }}
          validationSchema={CheckoutSchema}
          onSubmit={handleSubmit}
        >
          {({
            handleChange,
            handleBlur,
            handleSubmit,
            values,
            errors,
            touched,
          }) => (
            <View style={styles.card}>
              <Text style={styles.sectionTitle}>📦 Billing & Delivery Info</Text>

              {["name", "email", "address", "city", "country", "phone"].map(
                (field) => (
                  <FormInput
                    key={field}
                    label={field.charAt(0).toUpperCase() + field.slice(1)}
                    onChangeText={handleChange(field)}
                    onBlur={handleBlur(field)}
                    value={(values as any)[field]}
                    error={(errors as any)[field]}
                    touched={(touched as any)[field]}
                    autoCapitalize={field === "email" ? "none" : "words"}
                    keyboardType={field === "email" ? "email-address" : "default"}
                    onFocus={(e) => scrollRef.current?.scrollToFocusedInput(e.target, 180)}
                  />
                )
              )}

              {/* Submit */}
              <TouchableOpacity
                style={[styles.submitBtn, loading && { opacity: 0.7 }]}
                onPress={handleSubmit as any}
                disabled={loading}
              >
                <Text style={styles.submitText}>
                  {loading ? "Placing Order..." : "Submit Order"}
                </Text>
              </TouchableOpacity>
            </View>
          )}
        </Formik>
      </KeyboardAwareScrollView>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  scrollContent: {
    flexGrow: 1,
    padding: 16,
    justifyContent: "flex-start",
  },
  container: { flex: 1, backgroundColor: COLORS.white, paddingBottom: 50, },
  card: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 16,
    marginBottom: 20,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 3,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "700",
    marginBottom: 12,
    color: COLORS.primary,
  },
  itemRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginVertical: 6,
  },
  itemName: { fontSize: 15, color: "#333" },
  itemPrice: { fontSize: 15, fontWeight: "600", color: "#444" },
  total: {
    fontWeight: "bold",
    marginTop: 12,
    fontSize: 16,
    textAlign: "right",
    color: COLORS.primary,
  },
  submitBtn: {
    backgroundColor: COLORS.primary,
    paddingVertical: 16,
    borderRadius: 16,
    alignItems: "center",
    marginTop: 20,
  },
  submitText: { color: "white", fontWeight: "bold", fontSize: 16 },
})
