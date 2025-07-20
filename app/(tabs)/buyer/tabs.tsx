import React from 'react'
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs'
import { Ionicons } from '@expo/vector-icons'
import ProductsScreen from '../../../src/screens/buyer/ProductsScreen'
import OrdersScreen from '../../../src/screens/buyer/OrdersScreen'
import ProfileScreen from '../../profile'


const Tab = createBottomTabNavigator()

export default function BuyerTabs() {
    return (
        <Tab.Navigator
            screenOptions={({ route }) => ({
                tabBarActiveTintColor: '#025F3B',
                headerShown: false,
                tabBarIcon: ({ color, size }) => {
                    const icons: Record<string, keyof typeof Ionicons.glyphMap> = {
                        Products: 'pricetag-outline',
                        Orders: 'cart-outline',
                        Profile: 'person-outline',
                    }
                    return <Ionicons name={icons[route.name]} size={size} color={color} />
                }
            })}
        >
            <Tab.Screen name="Products" component={ProductsScreen} />
            <Tab.Screen name="Orders" component={OrdersScreen} />
            <Tab.Screen name="Profile" component={ProfileScreen} />
        </Tab.Navigator>
    )
}
