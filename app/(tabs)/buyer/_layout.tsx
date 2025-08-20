import React, { useContext } from 'react'
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs'
import { Ionicons } from '@expo/vector-icons'
import { AuthContext } from '../../../src/context/AuthContext'
import ProductsListScreen from '../../../src/screens/buyer/ProductsListScreen'
import ProductDetailScreen from '../../../src/screens/buyer/ProductDetailScreen'
import OrdersScreen from '../../../src/screens/buyer/OrdersScreen'
import ProfileScreen from '../../profile'
import { useRouter } from 'expo-router'

type RouteName = 'Products' | 'Orders' | 'Profile'

const Tab = createBottomTabNavigator()

export default function FarmerTabs() {
  const { logout } = useContext(AuthContext)
  const router = useRouter()

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerStyle: { backgroundColor: '#025F3B' },
        headerTintColor: '#fff',
        tabBarActiveTintColor: '#025F3B',
        tabBarIcon: ({ color, size }) => {
          const icons: Record<RouteName, keyof typeof Ionicons.glyphMap> = {
            Products: 'leaf-outline',
            Orders: 'list-outline',
            Profile: 'person-outline',
          }
          // route.name is one of our keys:
          return <Ionicons name={icons[route.name as RouteName]} size={size} color={color} />
        },
      })}
    >
      <Tab.Screen name="Products" component={ProductsListScreen} options={{ title: 'Products', headerShown: false }} />
      <Tab.Screen name="Orders" component={OrdersScreen} options={{ title: 'Orders' }} />
      <Tab.Screen name="Profile" component={ProfileScreen} options={{ title: 'Profile' }} />
    </Tab.Navigator>
  )
}
