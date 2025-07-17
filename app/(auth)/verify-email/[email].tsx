import { useLocalSearchParams, useRouter } from 'expo-router'
import React, { useContext, useState } from 'react'
import { Alert, Button, StyleSheet, Text, TextInput, View } from 'react-native'
import { AuthContext } from '../../../src/context/AuthContext'
import COLORS from '../../../src/theme/colors'

export default function VerifyEmail() {
  const { verifyEmail, resendOtp } = useContext(AuthContext)
  const { email } = useLocalSearchParams<{ email: string }>()
  const router = useRouter()
  const [otp, setOtp] = useState('')

  const onVerify = async () => {
    try {
      await verifyEmail(email, otp)
      router.replace('/')  // go to home
    } catch (e: any) {
      Alert.alert('Error', e.response?.data?.message || e.message)
    }
  }

  const onResend = async () => {
    try {
      await resendOtp(email, 'emailVerification')
      Alert.alert('Sent', 'New code sent to your email')
    } catch (e: any) {
      Alert.alert('Error', e.response?.data?.message || e.message)
    }
  }

  return (
    <View style={styles.container}>
      <Text>Email: {email}</Text>
      <TextInput
        placeholder="Enter OTP"
        style={styles.input}
        value={otp}
        keyboardType="number-pad"
        onChangeText={setOtp}
      />
      <Button title="Verify" color={COLORS.primary} onPress={onVerify} />
      <Text style={{ textAlign: 'center', marginVertical: 12 }}>Didn't get it?</Text>
      <Button title="Resend Code" onPress={onResend} />
    </View>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, justifyContent: 'center' },
  input: { borderWidth: 1, borderColor: COLORS.muted, padding: 8, marginBottom: 12 }
})
