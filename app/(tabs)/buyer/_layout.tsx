import React from "react";
import { Stack } from "expo-router";
import { CartProvider } from "../../../src/context/CartContext";

export default function BuyerLayout() {
  return (
    <CartProvider>
      <Stack>
        <Stack.Screen name="tabs" options={{ headerShown: false }} />
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
