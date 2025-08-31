import React from 'react';
import { Stack } from 'expo-router';
import { CartProvider } from '../../../src/context/CartContext';
import BuyerTabs from './tabs';

export default function FarmerLayout() {
  return (
    <CartProvider>
      <BuyerTabs />
    </CartProvider>
  );
}
