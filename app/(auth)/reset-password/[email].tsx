// app/auth/reset-password/[email].tsx

import { useLocalSearchParams, useRouter } from 'expo-router'
import React, { useContext, useState } from 'react'
import { Alert, Button, StyleSheet, Text, TextInput, View } from 'react-native'
import { AuthContext } from '../../../src/context/AuthContext'
import COLORS from '../../../src/theme/colors'

export default function ResetPassword() {
  const { email } = useLocalSearchParams<{ email: string }>()
  const { resetPassword, resendOtp } = useContext(AuthContext)
  const router = useRouter()
  const [otp, setOtp] = useState('')
  const [newPass, setNewPass] = useState('')

  const onReset = async () => {
    try {
      await resetPassword(email, otp, newPass)
      Alert.alert('Success','Password reset—please log in')
      router.replace('/login' as any)
    } catch (e: any) {
      Alert.alert('Error', e.response?.data?.message || e.message)
    }
  }

  const onResend = async () => {
    try {
      await resendOtp(email, 'passwordReset')
      Alert.alert('Sent','New OTP sent')
    } catch (e: any) {
      Alert.alert('Error', e.response?.data?.message || e.message)
    }
  }

  return (
    <View style={styles.container}>
      <Text>Email: {email}</Text>
      <TextInput
        placeholder="OTP"
        style={styles.input}
        value={otp}
        onChangeText={setOtp}
        keyboardType="number-pad"
      />
      <TextInput
        placeholder="New Password"
        secureTextEntry
        style={styles.input}
        value={newPass}
        onChangeText={setNewPass}
      />
      <Button title="Reset Password" color={COLORS.primary} onPress={onReset}/>
      <Text style={styles.link} onPress={onResend}>
        Didn’t get code? Resend OTP
      </Text>
    </View>
  )
}

const styles = StyleSheet.create({
  container:{ flex:1, padding:16, justifyContent:'center' },
  input:{ borderWidth:1, borderColor:COLORS.muted, padding:8, marginBottom:12 },
  link:{ color:COLORS.primary, textAlign:'center', marginTop:16 }
})
