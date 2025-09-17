import React, { useContext, useEffect, useRef, useState } from "react";
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
  RefreshControl,
  SafeAreaView,
  ScrollView,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import ioClient from "socket.io-client";
import COLORS from "../../theme/colors";
import api from "../../api/client";
import ConfirmModal from "../../components/ConfirmModal";
import { AuthContext } from "@/src/context/AuthContext";
import { router } from "expo-router";

type FilterKey = "All" | "Pending" | "In Progress" | "Delivered" | "Cancelled";
const FILTER_KEYS: FilterKey[] = ["All", "Pending", "In Progress", "Delivered", "Cancelled"];

const USE_LIGHTWEIGHT = true; // toggle lightweight farmer endpoint

export default function FarmerOrdersScreen() {
  const { user, logout } = useContext(AuthContext);
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const [expandedOrders, setExpandedOrders] = useState<Record<string, boolean>>({});
  const [expandedSubOrders, setExpandedSubOrders] = useState<Record<string, boolean>>({});

  const [activeFilter, setActiveFilter] = useState<FilterKey>("All");

  const [modalVisible, setModalVisible] = useState(false);
  const [modalItem, setModalItem] = useState<any>(null);

  const [confirmVisible, setConfirmVisible] = useState(false);
  const [confirmPayload, setConfirmPayload] = useState<any>(null);

  const socketRef = useRef<any>(null);

  useEffect(() => {
    fetchOrders();

    // socket
    const socketUrl = process.env.SOCKET_URL || (api.defaults.baseURL || "").replace(/^http/, "ws");
    const socket = ioClient(process.env.SOCKET_URL || socketUrl, { transports: ["websocket"] });
    socketRef.current = socket;

    socket.on("connect", () => {
      socket.emit("subscribe", { type: "farmer", id: user?.id || user?._id });
    });

    socket.on("suborder:update", (payload: any) => applySubOrderUpdate(payload));
    socket.on("order:update", () => fetchOrders());

    return () => {
      try {
        socket.emit("unsubscribe", { type: "farmer", id: user?.id || user?._id });
      } catch (_) {}
      socket.disconnect();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const applySubOrderUpdate = (payload: any) => {
    if (!payload) return;
    setOrders((prev) => {
      const { orderId, subOrderId, subOrder } = payload;
      return prev.map((order) => {
        if (String(order._id) !== String(orderId)) return order;
        const newOrder = { ...order };
        newOrder.subOrders = (newOrder.subOrders || []).map((so: any) => {
          if (String(so._id) !== String(subOrderId)) return so;
          return { ...so, ...subOrder };
        });
        return newOrder;
      });
    });
  };

  const fetchOrders = async () => {
    setLoading(true);
    try {
      if (USE_LIGHTWEIGHT) {
        const res = await api.get("/orders/farmer/subOrders");
        setOrders(res?.data || []);
      } else {
        const res = await api.get("/orders");
        setOrders(res?.data || []);
      }
    } catch (e: any) {
      Alert.alert("Error", e.response?.data?.message || e.message || "Failed to load orders");
      if (
        e.response?.data?.message === "Unauthorized: Invalid or expired token" ||
        e.message === "Unauthorized: Invalid or expired token"
      ) {
        logout();
        router.replace("/");
      }
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    try {
      await fetchOrders();
    } finally {
      setRefreshing(false);
    }
  };

  /* ---------- Filter helpers (same behavior as buyer screen) ---------- */

  const mapToSimple = (order: any) => {
    if (!order) return "pending";
    if (order.simpleStatus) return order.simpleStatus;
    const s = order.status;
    if (!s) return "pending";
    if (s === "delivered") return "delivered";
    if (s === "cancelled") return "cancelled";
    if (s === "partially_delivered" || s === "in_progress") return "in_progress";
    return "pending";
  };

  const counts = orders.reduce<Record<string, number>>((acc, o) => {
    const simple = mapToSimple(o);
    acc["All"] = (acc["All"] || 0) + 1;
    if (simple === "pending") acc["Pending"] = (acc["Pending"] || 0) + 1;
    else if (simple === "in_progress") acc["In Progress"] = (acc["In Progress"] || 0) + 1;
    else if (simple === "delivered") acc["Delivered"] = (acc["Delivered"] || 0) + 1;
    else if (simple === "cancelled") acc["Cancelled"] = (acc["Cancelled"] || 0) + 1;
    return acc;
  }, { All: 0, Pending: 0, "In Progress": 0, Delivered: 0, Cancelled: 0 });

  const filteredOrders = orders.filter((o) => {
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
    setExpandedOrders((prev) => (prev[orderId] ? {} : { [orderId]: true }));
    setExpandedSubOrders({});
  };

  const toggleSubOrder = (subOrderId: string) => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setExpandedSubOrders((prev) => (prev[subOrderId] ? {} : { [subOrderId]: true }));
  };

  /* ---------- Modals & contact ---------- */

  const openItemModal = (item: any) => {
    setModalItem(item);
    setModalVisible(true);
  };
  const closeModal = () => {
    setModalVisible(false);
    setModalItem(null);
  };

  /* ---------- Optimistic updates (unchanged) ---------- */

  const updateItemStatus = async (orderId: string, subOrderId: string, itemId: string, status: string) => {
    console.log(orderId, subOrderId, itemId, status)
    const prev = JSON.parse(JSON.stringify(orders));
    setOrders((prevOrders) =>
      prevOrders.map((o) => {
        if (String(o._id) !== String(orderId)) return o;
        return {
          ...o,
          subOrders: (o.subOrders || []).map((so: any) => {
            if (String(so._id) !== String(subOrderId)) return so;
            return {
              ...so,
              items: (so.items || []).map((it: any) => (it._id === itemId ? { ...it, itemStatus: status } : it)),
            };
          }),
        };
      })
    );

    try {
      await api.patch(`/orders/${orderId}/subOrders/${subOrderId}/items/${itemId}/status`, { itemStatus: status });
    } catch (err: any) {
      setOrders(prev);
      Alert.alert("Error", err.response?.data?.message || err.message || "Failed to update item");
    }
  };

  const updateSubOrderStatus = async (orderId: string, subOrderId: string, status: string, setItemsTo?: string) => {
    const destructive = status === "rejected" || status === "cancelled";
    if (destructive) {
      setConfirmPayload({ orderId, subOrderId, status, setItemsTo });
      setConfirmVisible(true);
      return;
    }

    const prev = JSON.parse(JSON.stringify(orders));
    setOrders((prevOrders) =>
      prevOrders.map((o) => {
        if (String(o._id) !== String(orderId)) return o;
        return {
          ...o,
          subOrders: (o.subOrders || []).map((so: any) => {
            if (String(so._id) !== String(subOrderId)) return so;
            return {
              ...so,
              status,
              items: setItemsTo ? (so.items || []).map((it: any) => ({ ...it, itemStatus: setItemsTo })) : so.items,
            };
          }),
        };
      })
    );

    try {
      await api.patch(`/orders/${orderId}/subOrders/${subOrderId}/status`, { status, setItemsTo });
    } catch (err: any) {
      setOrders(prev);
      Alert.alert("Error", err.response?.data?.message || err.message || "Failed to update sub order");
    }
  };

  const confirmProceed = async () => {
    if (!confirmPayload) return setConfirmVisible(false);
    const { orderId, subOrderId, status, setItemsTo } = confirmPayload;
    setConfirmVisible(false);
    setConfirmPayload(null);

    const prev = JSON.parse(JSON.stringify(orders));
    setOrders((prevOrders) =>
      prevOrders.map((o) => {
        if (String(o._id) !== String(orderId)) return o;
        return {
          ...o,
          subOrders: (o.subOrders || []).map((so: any) => {
            if (String(so._id) !== String(subOrderId)) return so;
            return {
              ...so,
              status,
              items: setItemsTo ? (so.items || []).map((it: any) => ({ ...it, itemStatus: setItemsTo })) : so.items,
            };
          }),
        };
      })
    );

    try {
      await api.patch(`/orders/${orderId}/subOrders/${subOrderId}/status`, { status, setItemsTo });
    } catch (err: any) {
      setOrders(prev);
      Alert.alert("Error", err.response?.data?.message || err.message || "Failed to update sub order");
    }
  };

  /* ---------- UI helpers for dynamic button styling ---------- */

  const buttonForBackground = (parentIsPrimary: boolean) => {
    if (parentIsPrimary) {
      return {
        bg: "#fff",
        textColor: COLORS.primary,
        borderColor: COLORS.primary,
      };
    }
    return {
      bg: COLORS.primary,
      textColor: "#fff",
      borderColor: "transparent",
    };
  };

  /* ---------- Filter bar renderer (copied/adapted from buyer) ---------- */

  const renderFilterBar = () => {
    return (
      <View style={styles.filterWrap}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 8 }}>
          {FILTER_KEYS.map((key) => {
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

  /* ---------- Renderers ---------- */

  const renderOrder = ({ item: order }: { item: any }) => {
    const idShort = order._id ? order._id.slice(-6) : "—";
    const expanded = !!expandedOrders[order._id];
    const created = order.createdAt ? new Date(order.createdAt).toLocaleString() : "";
    const subOrders = order.subOrders || [];

    return (
      <View style={[styles.card, expanded ? styles.cardExpanded : null]}>
        <TouchableOpacity onPress={() => toggleOrder(order._id)} activeOpacity={0.85}>
          <View style={styles.cardHeader}>
            <View style={{ flex: 1 }}>
              <Text style={[styles.orderTitle, expanded ? styles.orderTitleExpanded : null]}>Order #{idShort}</Text>
              <Text style={[styles.orderMeta, expanded ? styles.orderMetaExpanded : null]}>Placed: {created}</Text>
            </View>

            <View style={{ alignItems: "flex-end", marginLeft: 8 }}>
              <Text style={[styles.orderMeta, expanded ? styles.orderMetaExpanded : null]}>Status: {order.status ?? "—"}</Text>
              <Ionicons
                name={expanded ? "chevron-up" : "chevron-down"}
                size={20}
                color={expanded ? "#fff" : COLORS.primary}
                style={{ marginTop: 6 }}
              />
            </View>
          </View>
        </TouchableOpacity>

        {expanded && <View style={styles.expandedArea}>{subOrders.map((so: any) => renderSubOrder(so, order))}</View>}
      </View>
    );
  };

  const renderSubOrder = (so: any, parentOrder: any) => {
    console.log("So: ", so)
    console.log("ParentOrder", parentOrder)
    const subExpanded = !!expandedSubOrders[so._id];
    const items = so.items || [];

    const bTheme = buttonForBackground(subExpanded);

    return (
      <View key={so._id} style={[styles.subCard, subExpanded ? styles.subCardExpanded : null]}>
        <TouchableOpacity onPress={() => toggleSubOrder(so._id)} activeOpacity={0.85}>
          <View style={styles.subHeader}>
            <View style={{ flex: 1 }}>
              <Text style={[styles.subTitle, subExpanded ? styles.subTitleExpanded : null]} numberOfLines={1}>
                {so.farmer?.firstName ? `${so.farmer.firstName} ${so.farmer.lastName}` : String(so.farmer).slice(-6)}
              </Text>
              <Text style={[styles.subMeta, subExpanded ? styles.subMetaExpanded : null]}>
                Delivery: {so.deliveryMethod ?? "—"} • Status: {so.status ?? "—"}
              </Text>
            </View>

            <View style={{ alignItems: "flex-end" }}>
              <Text style={[styles.subTotal, subExpanded ? styles.subTotalExpanded : null]}>₵{Number(so.subtotal ?? 0).toFixed(2)}</Text>
              <Ionicons name={subExpanded ? "chevron-up" : "chevron-down"} size={18} color={subExpanded ? COLORS.primary : "#666"} />
            </View>
          </View>
        </TouchableOpacity>

        {subExpanded && (
          <>
            <View style={styles.itemsArea}>
              {items.map((it: any, idx: number) => {
                const prod = it.product || {};
                const productName = prod.productItem?.productName || prod.title || `Product ${idx + 1}`;
                const qty = it.qty ?? 0;
                const unit = it.priceAtOrder ?? prod.price ?? 0;
                const line = qty * unit;
                const image = prod.images && prod.images[0] ? { uri: prod.images[0] } : null;

                return (
                  <TouchableOpacity key={idx} style={styles.itemRow} onPress={() => openItemModal({ ...it, product: prod })}>
                    <View style={{ flexDirection: "row", alignItems: "center", flex: 1 }}>
                      <View style={styles.thumbWrap}>
                        {image ? <Image source={image} style={styles.thumb} /> : <View style={styles.thumbPlaceholder}><Text style={{ color: "#666" }}>No Img</Text></View>}
                      </View>

                      <View style={{ marginLeft: 10, flex: 1 }}>
                        <Text style={[styles.itemName, subExpanded ? styles.itemNameExpanded : null]} numberOfLines={2}>
                          {productName}
                        </Text>
                        <Text style={[styles.itemMeta, subExpanded ? styles.itemMetaExpanded : null]}>Qty: {qty} • {it.itemStatus}</Text>
                      </View>
                    </View>

                    <View style={{ alignItems: "flex-end" }}>
                      <Text style={[styles.itemLine, subExpanded ? styles.itemLineExpanded : null]}>₵{Number(line).toFixed(2)}</Text>

                      <View style={{ flexDirection: "row", marginTop: 8 }}>
                        <TouchableOpacity
                          onPress={() => updateItemStatus(parentOrder._id, so._id, it._id, "accepted")}
                          style={[
                            styles.smallBtn,
                            { backgroundColor: bTheme.bg, borderColor: bTheme.borderColor, borderWidth: 1 },
                          ]}
                        >
                          <Text style={[styles.smallBtnText, { color: bTheme.textColor }]}>Accept</Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                          onPress={() => {
                            setConfirmPayload({ orderId: parentOrder._id, subOrderId: so._id, itemId: it._id, act: "rejectItem" });
                            setConfirmVisible(true);
                          }}
                          style={[styles.smallBtn, { backgroundColor: "#c0392b", marginLeft: 8 }]}
                        >
                          <Text style={styles.smallBtnText}>Reject</Text>
                        </TouchableOpacity>
                      </View>
                    </View>
                  </TouchableOpacity>
                );
              })}
            </View>

            <View style={styles.actionRow}>
              <TouchableOpacity
                style={[styles.actionBtn, { backgroundColor: bTheme.bg, borderColor: bTheme.borderColor, borderWidth: 1 }]}
                onPress={() => updateSubOrderStatus(parentOrder._id, so._id, "accepted", "accepted")}
              >
                <Text style={[styles.actionText, { color: bTheme.textColor }]}>Accept All</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.actionBtn, { backgroundColor: "#e74c3c", borderColor: "transparent" }]}
                onPress={() => {
                  setConfirmPayload({ orderId: parentOrder._id, subOrderId: so._id, status: "rejected", setItemsTo: "cancelled" });
                  setConfirmVisible(true);
                }}
              >
                <Text style={styles.actionText}>Reject All</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.actionBtn, { backgroundColor: bTheme.bg, borderColor: bTheme.borderColor, borderWidth: 1 }]}
                onPress={() => updateSubOrderStatus(parentOrder._id, so._id, "ready", "ready")}
              >
                <Text style={[styles.actionText, { color: bTheme.textColor }]}>Mark Ready</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.actionBtn, { backgroundColor: bTheme.bg, borderColor: bTheme.borderColor, borderWidth: 1 }]}
                onPress={() => updateSubOrderStatus(parentOrder._id, so._id, "in_transit", "in_transit")}
              >
                <Text style={[styles.actionText, { color: bTheme.textColor }]}>In Transit</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.actionBtn, { backgroundColor: "#2ecc71", borderColor: "transparent" }]}
                onPress={() => {
                  setConfirmPayload({ orderId: parentOrder._id, subOrderId: so._id, status: "delivered", setItemsTo: "delivered" });
                  setConfirmVisible(true);
                }}
              >
                <Text style={styles.actionText}>Delivered</Text>
              </TouchableOpacity>
            </View>
          </>
        )}
      </View>
    );
  };

  if (loading) return <View style={styles.center}><ActivityIndicator size="large" color={COLORS.primary} /></View>;
  if (!orders.length) return <View style={styles.center}><Text>No orders found.</Text></View>;

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: COLORS.grayLight }}>
      {renderFilterBar()}

      <FlatList
        data={filteredOrders}
        keyExtractor={(o) => o._id}
        renderItem={renderOrder}
        contentContainerStyle={{ padding: 12 }}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        ListEmptyComponent={<View style={{ padding: 24 }}><Text style={{ textAlign: "center" }}>No orders matching filter</Text></View>}
      />

      {/* item modal */}
      <Modal visible={modalVisible} animationType="slide" transparent onRequestClose={closeModal}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <ScrollView>
              {modalItem && (
                <>
                  <Text style={styles.modalTitle}>{modalItem.product?.productItem?.productName || modalItem.product?.title || "Item"}</Text>
                  {modalItem.product?.images?.[0] ? <Image source={{ uri: modalItem.product.images[0] }} style={styles.modalImage} /> : <View style={[styles.modalImage, { justifyContent: "center", alignItems: "center" }]}><Text style={{ color: "#666" }}>No image</Text></View>}
                  <Text>Qty: {modalItem.qty}</Text>
                  <Text>Unit: ₵{Number(modalItem.priceAtOrder ?? modalItem.product?.price ?? 0).toFixed(2)}</Text>
                  <Text>Status: {modalItem.itemStatus}</Text>
                </>
              )}
            </ScrollView>
            <View style={{ flexDirection: "row", justifyContent: "flex-end", marginTop: 12 }}>
              <TouchableOpacity onPress={closeModal} style={[styles.actionBtn, { marginRight: 8 }]}><Text style={styles.actionText}>Close</Text></TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* confirm modal */}
      <ConfirmModal
        visible={confirmVisible}
        title="Are you sure?"
        message="This action cannot be undone. Confirm?"
        onCancel={() => { setConfirmVisible(false); setConfirmPayload(null); }}
        onConfirm={() => {
          if (confirmPayload?.act === "rejectItem") {
            const { orderId, subOrderId, itemId } = confirmPayload;
            setConfirmVisible(false);
            setConfirmPayload(null);
            updateItemStatus(orderId, subOrderId, itemId, "rejected");
          } else {
            confirmProceed();
          }
        }}
        confirmLabel="Yes, continue"
        cancelLabel="Cancel"
      />
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
    elevation: 3,
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
  orderTitle: { fontSize: 16, fontWeight: "700", color: "#222" },
  orderTitleExpanded: { color: "#fff" },
  orderMeta: { color: "#666", fontSize: 12 },
  orderMetaExpanded: { color: "rgba(255,255,255,0.9)" },

  expandedArea: { marginTop: 12 },

  /* sub card */
  subCard: {
    backgroundColor: "#f9fafb",
    padding: 10,
    borderRadius: 10,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: "#f0f0f0",
  },
  subCardExpanded: {
    backgroundColor: "#eaf7ef",
    borderColor: "#d6efe0",
    shadowColor: COLORS.primary,
    shadowOpacity: 0.03,
  },
  subHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  subTitle: { fontWeight: "700", fontSize: 14, color: "#223" },
  subTitleExpanded: { color: COLORS.primary },
  subMeta: { color: "#555", fontSize: 12 },
  subMetaExpanded: { color: COLORS.primary },
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
  itemNameExpanded: { color: COLORS.primary },
  itemMeta: { color: "#666", fontSize: 12 },
  itemMetaExpanded: { color: COLORS.primary },
  itemLine: { fontWeight: "700", color: "#222" },
  itemLineExpanded: { color: "#0b3" },

  /* action row + buttons */
  actionRow: { flexDirection: "row", flexWrap: "wrap", marginTop: 10 },
  actionBtn: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    marginRight: 8,
    marginTop: 8,
  },
  actionText: { color: "#fff", fontWeight: "700" },

  smallBtn: {
    backgroundColor: "#3498db",
    paddingHorizontal: 8,
    paddingVertical: 6,
    borderRadius: 6,
    borderWidth: 0,
  },
  smallBtnText: { color: "#fff", fontWeight: "600" },

  /* modal */
  modalOverlay: { flex: 1, backgroundColor: "rgba(0,0,0,0.5)", justifyContent: "center", alignItems: "center" },
  modalContent: { width: "92%", backgroundColor: "#fff", borderRadius: 12, padding: 16, maxHeight: "80%" },
  modalTitle: { fontSize: 18, fontWeight: "700", marginBottom: 12 },
  modalImage: { width: "100%", height: 220, borderRadius: 8, backgroundColor: "#f5f5f5", marginBottom: 10 },
});
