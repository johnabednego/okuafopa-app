// app/index.tsx
import React, { useContext } from 'react'
import { Redirect } from 'expo-router'
import { AuthContext } from '../src/context/AuthContext'

export default function Index() {
  const { token, user } = useContext(AuthContext)

  if (!token || !user) return <Redirect href="/login" />

  // Redirect to appropriate tab layout based on role
  return user.role === 'farmer'
    ? <Redirect href="/(tabs)/farmer/tabs" />
    : <Redirect href="/(tabs)/buyer/tabs" />
}
