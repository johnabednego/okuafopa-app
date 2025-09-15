import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Alert,
  LayoutAnimation,
  Modal,
  Image,
  Linking,
  RefreshControl,
  SafeAreaView,
  ScrollView,
  Dimensions,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import COLORS from "../../theme/colors";
import api from "../../api/client";


type FilterKey = "All" | "Pending" | "In Progress" | "Delivered" | "Cancelled";

const FILTER_KEYS: FilterKey[] = ["All", "Pending", "In Progress", "Delivered", "Cancelled"];

export default function OrdersScreen() {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [refreshing, setRefreshing] = useState<boolean>(false);

  // which orders/subOrders are expanded — single-open semantics
  const [expandedOrders, setExpandedOrders] = useState<Record<string, boolean>>({});
  const [expandedSubOrders, setExpandedSubOrders] = useState<Record<string, boolean>>({});

  // filter state
  const [activeFilter, setActiveFilter] = useState<FilterKey>("All");

  // modal for item details
  const [modalVisible, setModalVisible] = useState(false);
  const [modalItem, setModalItem] = useState<any>(null);

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const res = await api.get("/orders");
      setOrders(res?.data || []);
    } catch (err: any) {
      console.error("Failed fetching orders:", err);
      Alert.alert("Error", err.response?.data?.message || err.message || "Failed to load orders");
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    try {
      const res = await api.get("/orders");
      setOrders(res?.data || []);
    } catch (err: any) {
      console.error(err);
      Alert.alert("Error", err.response?.data?.message || err.message || "Failed to refresh");
    } finally {
      setRefreshing(false);
    }
  };

  /* ---------- Helpers ---------- */

  // Client-side mapping that mirrors server's simpleStatus virtual.
  const mapToSimple = (order: any) => {
    // Prefer virtual if present
    if (order.simpleStatus) return order.simpleStatus;

    const s = order.status;
    if (!s) return "pending";
    if (s === "delivered") return "delivered";
    if (s === "cancelled") return "cancelled";
    if (s === "partially_delivered" || s === "in_progress") return "in_progress";
    return "pending";
  };

  // compute counts for top tabs
  const counts = orders.reduce<Record<string, number>>((acc, o) => {
    const simple = mapToSimple(o);
    acc["All"] = (acc["All"] || 0) + 1;
    if (simple === "pending") acc["Pending"] = (acc["Pending"] || 0) + 1;
    else if (simple === "in_progress") acc["In Progress"] = (acc["In Progress"] || 0) + 1;
    else if (simple === "delivered") acc["Delivered"] = (acc["Delivered"] || 0) + 1;
    else if (simple === "cancelled") acc["Cancelled"] = (acc["Cancelled"] || 0) + 1;
    return acc;
  }, { All: 0, Pending: 0, "In Progress": 0, Delivered: 0, Cancelled: 0 });

  const filteredOrders = orders.filter(o => {
    if (activeFilter === "All") return true;
    const simple = mapToSimple(o);
    if (activeFilter === "Pending") return simple === "pending";
    if (activeFilter === "In Progress") return simple === "in_progress";
    if (activeFilter === "Delivered") return simple === "delivered";
    if (activeFilter === "Cancelled") return simple === "cancelled";
    return true;
  });

  /* ---------- Expand toggle (single open) ---------- */

  const toggleOrder = (orderId: string) => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setExpandedOrders(prev => {
      const isOpen = !!prev[orderId];
      if (isOpen) return {}; // close all
      return { [orderId]: true }; // open only this
    });
    setExpandedSubOrders({}); // collapse suborders when switching order
  };

  const toggleSubOrder = (subOrderId: string) => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setExpandedSubOrders(prev => {
      const isOpen = !!prev[subOrderId];
      if (isOpen) return {};
      return { [subOrderId]: true };
    });
  };

  /* ---------- Modals & Contact ---------- */

  const openItemModal = (item: any) => {
    setModalItem(item);
    setModalVisible(true);
  };

  const closeModal = () => {
    setModalVisible(false);
    setModalItem(null);
  };

  const callPhone = (phone?: string) => {
    if (!phone) return Alert.alert("No phone", "No phone number available for this farmer.");
    const url = `tel:${phone}`;
    Linking.canOpenURL(url).then(supported => {
      if (supported) Linking.openURL(url);
      else Alert.alert("Error", "Can't open phone app on this device.");
    });
  };

  const emailTo = (email?: string) => {
    if (!email) return Alert.alert("No email", "No email available for this farmer.");
    const url = `mailto:${email}`;
    Linking.canOpenURL(url).then(supported => {
      if (supported) Linking.openURL(url);
      else Alert.alert("Error", "Can't open mail app on this device.");
    });
  };

  /* ---------- Renderers ---------- */

  const renderFilterBar = () => {
    return (
      <View style={styles.filterWrap}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 8 }}>
          {FILTER_KEYS.map(key => {
            const active = key === activeFilter;
            const c = counts[key] ?? 0;
            return (
              <TouchableOpacity
                key={key}
                style={[styles.filterBtn, active ? styles.filterBtnActive : null]}
                onPress={() => setActiveFilter(key)}
                activeOpacity={0.8}
              >
                <Text style={[styles.filterText, active ? styles.filterTextActive : null]}>
                  {key} {key !== "All" ? `(${c})` : ""}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>
    );
  };

  const renderOrder = ({ item: order }: { item: any }) => {
    const idShort = order._id ? order._id.slice(-6) : "—";
    const expanded = !!expandedOrders[order._id];
    const total = order.grandTotal ?? 0;
    const created = order.createdAt ? new Date(order.createdAt).toLocaleString() : "";
    const subOrders = Array.isArray(order.subOrders) ? order.subOrders : [];

    return (
      <View style={[styles.card, expanded ? styles.cardExpanded : null]}>
        <TouchableOpacity activeOpacity={0.85} onPress={() => toggleOrder(order._id)}>
          <View style={styles.cardHeader}>
            <View style={styles.headerLeft}>
              <Text style={[styles.orderTitle, expanded ? styles.orderTitleExpanded : null]}>Order #{idShort}</Text>
              <Text style={[styles.orderMeta, expanded ? styles.orderMetaExpanded : null]}>Status: {order.status ?? "—"}</Text>
            </View>

            <View style={styles.headerRight}>
              <Text style={[styles.orderTotal, expanded ? styles.orderTotalExpanded : null]}>₵{Number(total).toFixed(2)}</Text>
              <Text style={[styles.orderMeta, expanded ? styles.orderMetaExpanded : null]}>{created}</Text>

              <Ionicons
                name={expanded ? "chevron-up" : "chevron-down"}
                size={20}
                color={expanded ? "#fff" : COLORS.primary}
                style={{ marginTop: 6 }}
              />
            </View>
          </View>
        </TouchableOpacity>

        {expanded && (
          <View style={styles.expandedArea}>
            {subOrders.map((so: any) => renderSubOrder(so, order))}
          </View>
        )}
      </View>
    );
  };

  const renderSubOrder = (so: any, parentOrder: any) => {
    const farmer = so.farmer || {};
    const farmerName =
      typeof farmer === "string" ? farmer.slice(-6) : `${farmer.firstName ?? ""} ${farmer.lastName ?? ""}`.trim() || "Farmer";
    const subExpanded = !!expandedSubOrders[so._id];
    const items = Array.isArray(so.items) ? so.items : [];
    const subtotal = so.subtotal ?? 0;

    return (
      <View key={so._id} style={[styles.subCard, subExpanded ? styles.subCardExpanded : null]}>
        <TouchableOpacity onPress={() => toggleSubOrder(so._id)} activeOpacity={0.85}>
          <View style={styles.subHeader}>
            <View style={{ flex: 1 }}>
              <Text style={[styles.subTitle, subExpanded ? styles.subTitleExpanded : null]} numberOfLines={1}>
                {farmerName}
              </Text>
              <Text style={[styles.subMeta, subExpanded ? styles.subMetaExpanded : null]}>
                Delivery: {so.deliveryMethod ?? "—"} • Status: {so.status ?? "—"}
              </Text>
            </View>

            <View style={styles.subRight}>
              <Text style={[styles.subTotal, subExpanded ? styles.subTotalExpanded : null]}>₵{Number(subtotal).toFixed(2)}</Text>

              <Ionicons
                name={subExpanded ? "chevron-up" : "chevron-down"}
                size={18}
                color={subExpanded ? COLORS.primary : "#666"}
                style={{ marginTop: 6 }}
              />
            </View>
          </View>
        </TouchableOpacity>

        {subExpanded && (
          <View style={styles.itemsArea}>
            {items.length === 0 ? (
              <Text style={styles.empty}>No items</Text>
            ) : (
              items.map((it: any, idx: number) => {
                const product = it.product || {};
                const productName =
                  product.productItem?.productName || product.title || product.productName || `Product ${idx + 1}`;
                const qty = it.qty ?? it.quantity ?? 0;
                const unit = it.priceAtOrder ?? product.price ?? 0;
                const line = qty * unit;
                const image = product.images && product.images[0] ? { uri: product.images[0] } : null;

                return (
                  <TouchableOpacity
                    key={idx}
                    style={styles.itemRow}
                    onPress={() => openItemModal({ ...it, product })}
                    activeOpacity={0.8}
                  >
                    <View style={{ flexDirection: "row", alignItems: "center", flex: 1 }}>
                      <View style={styles.thumbWrap}>
                        {image ? (
                          <Image source={image} style={styles.thumb} />
                        ) : (
                          <View style={styles.thumbPlaceholder}>
                            <Text style={{ color: "#666", fontSize: 11 }}>No Image</Text>
                          </View>
                        )}
                      </View>

                      <View style={{ marginLeft: 12, flex: 1 }}>
                        <Text style={styles.itemName} numberOfLines={2}>
                          {productName}
                        </Text>
                        <Text style={styles.itemMeta} numberOfLines={1}>
                          {product._id ? `${product._id.slice(-6)}` : ""}
                        </Text>
                      </View>
                    </View>

                    {/* price column (fixed width) */}
                    <View style={styles.priceCol}>
                      <Text style={styles.itemQtySmall}>{qty} ×</Text>
                      <Text style={styles.itemUnitSmall}>₵{Number(unit).toFixed(2)}</Text>
                      <Text style={styles.itemLineSmall}>₵{Number(line).toFixed(2)}</Text>
                    </View>
                  </TouchableOpacity>
                );
              })
            )}
          </View>
        )}

        {/* contact buttons row (always visible under subCard) */}
        <View style={styles.contactRow}>
          {so.farmer?.phoneNumber ? (
            <TouchableOpacity style={styles.contactBtn} onPress={() => callPhone(so.farmer.phoneNumber)}>
              <Ionicons name="call" size={14} color="#fff" style={{ marginRight: 6 }} />
              <Text style={styles.contactText}>Call</Text>
            </TouchableOpacity>
          ) : null}
          {so.farmer?.email ? (
            <TouchableOpacity style={[styles.contactBtn, { marginLeft: 10 }]} onPress={() => emailTo(so.farmer.email)}>
              <Ionicons name="mail-outline" size={14} color="#fff" style={{ marginRight: 6 }} />
              <Text style={styles.contactText}>Email</Text>
            </TouchableOpacity>
          ) : null}
        </View>
      </View>
    );
  };

  /* ---------- UI ---------- */

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    );
  }

  if (!orders.length) {
    return (
      <View style={styles.center}>
        <Text>No orders found.</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: COLORS.grayLight }}>
      {renderFilterBar()}

      <FlatList
        data={filteredOrders}
        keyExtractor={(o) => o._id}
        renderItem={renderOrder}
        contentContainerStyle={{ padding: 12, paddingBottom: 36 }}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        ListEmptyComponent={<View style={{ padding: 24 }}><Text style={{ textAlign: "center" }}>No orders matching filter</Text></View>}
      />

      {/* Item Modal */}
      <Modal visible={modalVisible} animationType="slide" onRequestClose={closeModal} transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <ScrollView>
              {modalItem ? (
                <>
                  <Text style={styles.modalTitle}>
                    {modalItem.product?.productItem?.productName ||
                      modalItem.product?.title ||
                      modalItem.product?.productName ||
                      "Item"}
                  </Text>
                  {modalItem.product?.images && modalItem.product.images.length > 0 ? (
                    <Image source={{ uri: modalItem.product.images[0] }} style={styles.modalImage} />
                  ) : (
                    <View style={[styles.modalImage, { justifyContent: "center", alignItems: "center" }]}>
                      <Text style={{ color: "#666" }}>No image</Text>
                    </View>
                  )}

                  <View style={{ marginTop: 12 }}>
                    <Text>Quantity: {modalItem.qty}</Text>
                    <Text>Unit Price: ₵{Number(modalItem.priceAtOrder ?? modalItem.product?.price ?? 0).toFixed(2)}</Text>
                    <Text>Line total: ₵{Number((modalItem.qty ?? 0) * (modalItem.priceAtOrder ?? modalItem.product?.price ?? 0)).toFixed(2)}</Text>
                    <Text style={{ marginTop: 8 }}>Status: {modalItem.itemStatus ?? "pending"}</Text>
                  </View>
                </>
              ) : null}
            </ScrollView>

            <View style={{ flexDirection: "row", justifyContent: "flex-end", marginTop: 16 }}>
              <TouchableOpacity onPress={closeModal} style={[styles.modalBtn, { backgroundColor: COLORS.gray }]}>
                <Text style={{ color: "#fff" }}>Close</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

/* Styles */
const styles = StyleSheet.create({
  center: { flex: 1, justifyContent: "center", alignItems: "center" },

  /* filter bar */
  filterWrap: {
    backgroundColor: "#fff",
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  filterBtn: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    marginHorizontal: 6,
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "transparent",
  },
  filterBtnActive: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  filterText: { color: "#333", fontWeight: "600" },
  filterTextActive: { color: "#fff" },

  /* order card */
  card: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 12,
    marginBottom: 12,
    elevation: 2,
    borderWidth: 1,
    borderColor: "transparent",
  },
  cardExpanded: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
    shadowColor: COLORS.primary,
    shadowOpacity: 0.08,
  },
  cardHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  headerLeft: { flex: 1 },
  headerRight: { alignItems: "flex-end", marginLeft: 12 },

  orderTitle: { fontSize: 16, fontWeight: "700", color: "#222" },
  orderTitleExpanded: { color: "#fff" },
  orderMeta: { color: "#666", fontSize: 12 },
  orderMetaExpanded: { color: "rgba(255,255,255,0.85)" },

  orderTotal: { fontSize: 15, fontWeight: "700", color: COLORS.primary },
  orderTotalExpanded: { color: "#fff" },

  expandedArea: { marginTop: 12 },

  /* sub order */
  subCard: {
    backgroundColor: "#fafafa",
    padding: 10,
    borderRadius: 10,
    marginBottom: 10,
  },
  subCardExpanded: {
    backgroundColor: "#E9F7EF",
  },
  subHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  subTitle: { fontWeight: "700", fontSize: 14, color: "#223" },
  subTitleExpanded: { color: COLORS.primary },
  subMeta: { color: "#555", fontSize: 12 },
  subMetaExpanded: { color: COLORS.primary },
  subRight: { alignItems: "flex-end", marginLeft: 8 },
  subTotal: { fontWeight: "700", color: "#333" },
  subTotalExpanded: { color: COLORS.primary },

  /* items */
  itemsArea: { marginTop: 10 },
  itemRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 10,
    borderBottomColor: "#eee",
    borderBottomWidth: 1,
  },
  thumbWrap: {
    width: 52,
    height: 52,
    borderRadius: 8,
    overflow: "hidden",
    backgroundColor: "#fff",
    justifyContent: "center",
    alignItems: "center",
  },
  thumb: { width: 52, height: 52, resizeMode: "cover" },
  thumbPlaceholder: {
    width: 52,
    height: 52,
    borderRadius: 8,
    backgroundColor: "#f0f0f0",
    justifyContent: "center",
    alignItems: "center",
  },

  itemName: { fontSize: 14, fontWeight: "600", color: "#222" },
  itemMeta: { color: "#666", fontSize: 12 },
  // Price column (fixed width so it won't push the name)
  priceCol: {
    width: 92,
    alignItems: "flex-end",
    marginLeft: 12,
  },
  itemQtySmall: { fontSize: 12, color: "#666" },
  itemUnitSmall: { fontSize: 12, color: "#666" },
  itemLineSmall: { fontSize: 13, fontWeight: "700", color: "#222" },

  empty: { color: "#777", fontStyle: "italic" },

  /* contact row */
  contactRow: { flexDirection: "row", marginTop: 8 },
  contactBtn: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.primary,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
  },
  contactText: { color: "#fff", fontSize: 13, fontWeight: "600" },

  /* Modal */
  modalOverlay: { flex: 1, backgroundColor: "rgba(0,0,0,0.5)", justifyContent: "center", alignItems: "center" },
  modalContent: { width: "92%", backgroundColor: "#fff", borderRadius: 12, padding: 16, maxHeight: "80%" },
  modalTitle: { fontSize: 18, fontWeight: "700", marginBottom: 12 },
  modalImage: { width: "100%", height: 220, borderRadius: 8, backgroundColor: "#f5f5f5" },
  modalBtn: { paddingHorizontal: 12, paddingVertical: 10, borderRadius: 8, marginLeft: 8 },
});
