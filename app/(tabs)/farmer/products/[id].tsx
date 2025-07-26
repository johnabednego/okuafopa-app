// app/(tabs)/farmer/products/[id].tsx
import React from 'react'
import { useLocalSearchParams } from 'expo-router'
import EditProductScreen from '../../../../src/screens/farmer/EditProductScreen'

export default function EditProductWrapper() {
  const { id } = useLocalSearchParams<{ id: string }>()
  return <EditProductScreen id={id} />
}
