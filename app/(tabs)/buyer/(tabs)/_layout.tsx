import React, { useEffect, useRef } from "react";
import { Tabs } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { View, Text, Animated } from "react-native";
import { useCart } from "../../../../src/context/CartContext";

function TabBarIcon({ name, color, size }: any) {
  return <Ionicons name={name} size={size} color={color} />;
}

export default function BuyerTabs() {
  const { cartCount } = useCart();
  const bounceAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    if (cartCount > 0) {
      Animated.sequence([
        Animated.timing(bounceAnim, {
          toValue: 1.4,
          duration: 150,
          useNativeDriver: true,
        }),
        Animated.spring(bounceAnim, {
          toValue: 1,
          friction: 3,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [cartCount]);

  return (
    <Tabs
      screenOptions={{
        headerStyle: { backgroundColor: "#025F3B" },
        headerTintColor: "#fff",
        tabBarActiveTintColor: "#025F3B",
      }}
    >
      <Tabs.Screen
        name="products/index"
        options={{
          title: "Products",
          headerShown: false,
          tabBarIcon: ({ color, size }) => (
            <TabBarIcon name="leaf-outline" color={color} size={size} />
          ),
        }}
      />
      <Tabs.Screen
        name="orders/index"
        options={{
          title: "Orders",
          tabBarIcon: ({ color, size }) => (
            <TabBarIcon name="list-outline" color={color} size={size} />
          ),
        }}
      />
      <Tabs.Screen
        name="cart/index"
        options={{
          title: "Cart",
          tabBarIcon: ({ color, size }) => (
            <View>
              <Ionicons name="cart-outline" size={size} color={color} />
              {cartCount > 0 && (
                <Animated.View
                  style={{
                    position: "absolute",
                    right: -8,
                    top: -4,
                    backgroundColor: "red",
                    borderRadius: 10,
                    width: 18,
                    height: 18,
                    justifyContent: "center",
                    alignItems: "center",
                    transform: [{ scale: bounceAnim }],
                  }}
                >
                  <Text
                    style={{
                      color: "white",
                      fontSize: 10,
                      fontWeight: "bold",
                    }}
                  >
                    {cartCount}
                  </Text>
                </Animated.View>
              )}
            </View>
          ),
        }}
      />
      <Tabs.Screen
        name="profile/index"
        options={{
          title: "Profile",
          headerShown: false,
          tabBarIcon: ({ color, size }) => (
            <TabBarIcon name="person-outline" color={color} size={size} />
          ),
        }}
      />
    </Tabs>
  );
}
