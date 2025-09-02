import React, { useEffect, useState, useContext } from "react";
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  ActivityIndicator,
  Image,
  TouchableOpacity,
  LayoutAnimation,
  Alert
} from "react-native";
import Ionicons from "@expo/vector-icons/Ionicons";
import COLORS from "../../theme/colors";
import api from '../../api/client'
import { AuthContext } from '../../../src/context/AuthContext'
import { router } from "expo-router"

export default function OrdersScreen() {
  const { logout } = useContext(AuthContext)
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedOrder, setExpandedOrder] = useState<string | null>(null);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const res = await api.get('/orders');
        setOrders(res?.data);
      } catch (err: any) {
        Alert.alert("Error", err.response?.data?.message || err.message)
        if (err.response?.data?.message === "Unauthorized: Invalid or expired token" || err.message === "Unauthorized: Invalid or expired token") {
          logout()
          router.replace('/')  // back to public landing
        }
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, []);

  const getStatusStyle = (status: string) => {
    switch (status) {
      case "delivered":
        return { backgroundColor: "#4CAF50" };
      case "in_progress":
        return { backgroundColor: "#2196F3" };
      case "pending":
        return { backgroundColor: "#FF9800" };
      case "cancelled":
        return { backgroundColor: "#F44336" };
      default:
        return { backgroundColor: "#9E9E9E" };
    }
  };

  const toggleExpand = (id: string) => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setExpandedOrder(expandedOrder === id ? null : id);
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    );
  }

  if (orders?.length === 0) {
    return (
      <View style={styles.center}>
        <Text style={styles.empty}>No orders found.</Text>
      </View>
    );
  }

  return (
    <FlatList
      data={orders}
      keyExtractor={(order) => order._id}
      renderItem={({ item }) => {
        const expanded = expandedOrder === item._id;
        return (
          <TouchableOpacity activeOpacity={0.9} onPress={() => toggleExpand(item._id)}>
            <View style={styles.card}>
              {/* Header */}
              <View style={styles.headerRow}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.title}>Order #{item._id.slice(-6)}</Text>
                  <Text style={styles.date}>
                    {new Date(item.createdAt).toLocaleDateString()}{" "}
                    {new Date(item.createdAt).toLocaleTimeString()}
                  </Text>
                </View>

                <View style={styles.rightHeader}>
                  <View style={[styles.statusBadge, getStatusStyle(item.status)]}>
                    <Text style={styles.statusText}>{item.status}</Text>
                  </View>
                  <Ionicons
                    name={expanded ? "chevron-up" : "chevron-down"}
                    size={20}
                    color="#555"
                    style={{ marginLeft: 8 }}
                  />
                </View>
              </View>

              {/* Expanded details */}
              {expanded && (
                <>
                  <View style={styles.itemsContainer}>
                    {item.items?.map((it: any) => (
                      <View key={it._id} style={styles.itemRow}>
                        {it.product?.images?.length > 0 && (
                          <Image
                            source={{ uri: it.product.images[0] }}
                            style={styles.itemImage}
                          />
                        )}
                        <View style={{ flex: 1 }}>
                          <Text style={styles.itemName}>
                            {it.product?.title || "Unnamed"}
                          </Text>
                          <Text style={styles.itemQty}>
                            Qty: {it.qty} × ₵{it.priceAtOrder?.toFixed(2)}
                          </Text>
                        </View>
                      </View>
                    ))}
                  </View>

                  <View style={styles.footerRow}>
                    <Text style={styles.totalLabel}>Total:</Text>
                    <Text style={styles.totalValue}>
                      ₵{item.subtotal?.toFixed(2) || "0.00"}
                    </Text>
                  </View>
                </>
              )}
            </View>
          </TouchableOpacity>
        );
      }}
      contentContainerStyle={{ padding: 16 }}
    />
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, justifyContent: "center", alignItems: "center" },
  empty: { fontSize: 16, color: "#777" },
  card: {
    backgroundColor: "#fff",
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 3,
  },
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  title: { fontWeight: "700", fontSize: 16, color: "#333" },
  date: { fontSize: 12, color: "#666" },
  rightHeader: { flexDirection: "row", alignItems: "center" },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: { color: "#fff", fontWeight: "600", fontSize: 12, textTransform: "capitalize" },
  itemsContainer: { marginTop: 12, marginBottom: 12 },
  itemRow: { flexDirection: "row", alignItems: "center", marginBottom: 8 },
  itemImage: { width: 40, height: 40, borderRadius: 6, marginRight: 10 },
  itemName: { fontWeight: "500", fontSize: 14, color: "#333" },
  itemQty: { fontSize: 13, color: "#555" },
  footerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    borderTopWidth: 1,
    borderTopColor: "#eee",
    paddingTop: 8,
  },
  totalLabel: { fontSize: 14, fontWeight: "600", color: "#444" },
  totalValue: { fontSize: 14, fontWeight: "700", color: COLORS.primary },
});
