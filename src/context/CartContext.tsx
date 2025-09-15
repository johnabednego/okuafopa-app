import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Alert } from 'react-native';

export type CartItem = {
  _id: string;
  productItem?: { productName?: string };
  images: string[];
  price: number;
  quantity: number; // stock available
  selectedQuantity: number; // chosen qty
};

type CartContextType = {
  cart: CartItem[];
  cartCount: number;
  addToCart: (item: CartItem) => Promise<void>;
  removeFromCart: (id: string) => Promise<void>;
  updateQuantity: (id: string, newQty: number) => Promise<void>;
  refreshCart: () => Promise<void>;
  setCart: (items: CartItem[]) => Promise<void>;
};

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider = ({ children }: { children: React.ReactNode }) => {
  const [cart, setCart] = useState<CartItem[]>([]);

  // Refresh from storage
  const refreshCart = async () => {
    const storedCart = await AsyncStorage.getItem('cartItems');
    const parsed = storedCart ? JSON.parse(storedCart) : [];
    setCart(parsed);
  };

  const addToCart = async (item: CartItem) => {
    const existing = await AsyncStorage.getItem('cartItems');
    let stored: CartItem[] = existing ? JSON.parse(existing) : [];

    const found = stored.find(c => c._id === item._id);

    if (found) {
      //  show alert instead of incrementing
      Alert.alert(
        "❌ Already in Cart",
        `${item.productItem?.productName || "This item"} is already in your cart.`
      );
    } else {
      stored.push({ ...item, selectedQuantity: 1 });
      await AsyncStorage.setItem('cartItems', JSON.stringify(stored));
      setCart(stored);

      //  show alert instead of incrementing
      Alert.alert(
        "✅ Added to Cart",
        `Item added successfully.`
      );
    }
  };

  const removeFromCart = async (id: string) => {
    let updated = cart.filter(c => c._id !== id);
    await AsyncStorage.setItem('cartItems', JSON.stringify(updated));
    setCart(updated);
  };

  const updateQuantity = async (id: string, newQty: number) => {
    let updated = cart.map(c =>
      c._id === id ? { ...c, selectedQuantity: newQty } : c
    );
    await AsyncStorage.setItem('cartItems', JSON.stringify(updated));
    setCart(updated);
  };

  useEffect(() => {
    refreshCart();
  }, []);

  // Wrapper for setCart to match context type
  const setCartAndPersist = async (items: CartItem[]) => {
    await AsyncStorage.setItem('cartItems', JSON.stringify(items));
    setCart(items);
  };

  return (
    <CartContext.Provider
      value={{
        cart,
        cartCount: cart.reduce((acc, i) => acc + (i.selectedQuantity ?? 1), 0),
        addToCart,
        removeFromCart,
        updateQuantity,
        refreshCart,
        setCart: setCartAndPersist
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error('useCart must be used within CartProvider');
  return ctx;
};
