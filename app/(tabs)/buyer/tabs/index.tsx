import React, { useRef, useEffect } from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { View, Text, Animated } from 'react-native';

// Screens
import ProductsListScreen from '../../../../src/screens/buyer/ProductsListScreen';
import OrdersScreen from '../../../../src/screens/buyer/OrdersScreen';
import ProfileScreen from '../../../profile';
import CartScreen from '../../../../src/screens/buyer/CartScreen';
import { useCart } from '../../../../src/context/CartContext';

type RouteName = 'Products' | 'Orders' | 'Cart' | 'Profile';
const Tab = createBottomTabNavigator();

function BuyerTabs({ route }: any) {
  const initialTab = route?.params?.initialTab || "Products";
  const { cartCount } = useCart();
  const bounceAnim = useRef(new Animated.Value(1)).current;

  // Bounce when count changes
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
    <Tab.Navigator
      initialRouteName={initialTab}
      screenOptions={({ route }) => ({
        headerStyle: { backgroundColor: '#025F3B' },
        headerTintColor: '#fff',
        tabBarActiveTintColor: '#025F3B',
        tabBarIcon: ({ color, size }) => {
          const icons: Record<RouteName, keyof typeof Ionicons.glyphMap> = {
            Products: 'leaf-outline',
            Orders: 'list-outline',
            Cart: 'cart-outline',
            Profile: 'person-outline',
          };
          const iconName = icons[route.name as RouteName];

          if (route.name === 'Cart') {
            return (
              <View>
                <Ionicons name={iconName} size={size} color={color} />
                {cartCount > 0 && (
                  <Animated.View
                    style={{
                      position: 'absolute',
                      right: -8,
                      top: -4,
                      backgroundColor: 'red',
                      borderRadius: 10,
                      width: 18,
                      height: 18,
                      justifyContent: 'center',
                      alignItems: 'center',
                      transform: [{ scale: bounceAnim }],
                    }}
                  >
                    <Text style={{ color: 'white', fontSize: 10, fontWeight: 'bold' }}>
                      {cartCount}
                    </Text>
                  </Animated.View>
                )}
              </View>
            );
          }

          return <Ionicons name={iconName} size={size} color={color} />;
        },
      })}
    >
      <Tab.Screen
        name="Products"
        component={ProductsListScreen}
        options={{ title: 'Products', headerShown: false }}
      />
      <Tab.Screen
        name="Orders"
        component={OrdersScreen}
        options={{ title: 'Orders' }}
      />
      <Tab.Screen
        name="Cart"
        component={CartScreen}
        options={{ title: 'Cart' }}
      />
      <Tab.Screen
        name="Profile"
        component={ProfileScreen}
        options={{ title: 'Profile', headerShown: false }}
      />
    </Tab.Navigator>
  );
}

export default BuyerTabs;
