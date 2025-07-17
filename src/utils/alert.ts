// src/utils/alert.ts
import { Alert } from 'react-native'

export function showError(err: any, fallback = 'An error occurred') {
  const msg = err.response?.data?.message || err.message || fallback
  Alert.alert('Error', msg)
}
