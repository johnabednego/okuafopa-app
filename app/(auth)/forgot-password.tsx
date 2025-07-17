// app/auth/forgot-password.tsx

import { useRouter } from 'expo-router'
import React, { useContext, useState } from 'react'
import { Alert, Button, StyleSheet, TextInput, View } from 'react-native'
import { AuthContext } from '../../src/context/AuthContext'
import COLORS from '../../src/theme/colors'

export default function ForgotPassword() {
  const { forgotPassword } = useContext(AuthContext)
  const router = useRouter()
  const [email, setEmail] = useState('')

  const onSubmit = async () => {
    try {
      await forgotPassword(email)
      Alert.alert('OTP sent','Check your email')

      // navigate to /auth/reset-password/[email]
      router.push(`/reset-password/${encodeURIComponent(email)}` as any)
    } catch {
      Alert.alert('Error','Could not send OTP')
    }
  }

  return (
    <View style={styles.container}>
      <TextInput
        placeholder="Email"
        style={styles.input}
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
        autoCapitalize="none"
      />
      <Button title="Send OTP" color={COLORS.primary} onPress={onSubmit}/>
    </View>
  )
}

const styles = StyleSheet.create({
  container:{ flex:1, padding:16, justifyContent:'center' },
  input:{ borderWidth:1, borderColor:COLORS.muted, padding:8, marginBottom:12 }
})
