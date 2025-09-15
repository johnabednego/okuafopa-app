import React from "react";
import { Stack } from "expo-router";
import { CartProvider } from "../../../src/context/CartContext";

export default function BuyerLayout() {
  return (
    <CartProvider>
      <Stack>
        {/* Tabs group */}
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />

        {/* Non-tab screen */}
        <Stack.Screen
          name="check-out"
          options={{
            title: "Checkout",
            headerShown: true,
          }}
        />
      </Stack>
    </CartProvider>
  );
}
