// app/(tabs)/farmer/_layout.tsx
import React, { useContext } from 'react'
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs'
import { Ionicons } from '@expo/vector-icons'
import { AuthContext } from '../../../src/context/AuthContext'

import ProductsScreen from '../../../src/screens/farmer/ProductsScreen'
import OrdersScreen   from '../../../src/screens/farmer/OrdersScreen'
import ProfileScreen  from '../../profile/index'

type RouteName = 'Products' | 'Orders' | 'Profile'

const Tab = createBottomTabNavigator()

export default function FarmerTabs() {
  const { logout } = useContext(AuthContext)

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerStyle: { backgroundColor: '#025F3B' },
        headerTintColor: '#fff',
        tabBarActiveTintColor: '#025F3B',
        headerRight: () => (
          <Ionicons
            name="log-out-outline"
            size={24}
            color="white"
            style={{ marginRight: 16 }}
            onPress={logout}
          />
        ),
        tabBarIcon: ({ color, size }) => {
          const icons: Record<RouteName, keyof typeof Ionicons.glyphMap> = {
            Products: 'leaf-outline',
            Orders:   'list-outline',
            Profile:  'person-outline',
          }
          // route.name is one of our keys:
          return <Ionicons name={icons[route.name as RouteName]} size={size} color={color} />
        },
      })}
    >
      <Tab.Screen   name="Products" component={ProductsScreen} options={{ title: 'My Products' }}/>
      <Tab.Screen   name="Orders"   component={OrdersScreen}   options={{ title: 'Orders' }} />
      <Tab.Screen   name="Profile"  component={ProfileScreen}  options={{ title: 'Profile' }}/>
    </Tab.Navigator>
  )
}
