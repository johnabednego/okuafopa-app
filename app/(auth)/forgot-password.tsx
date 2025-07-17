import { useRouter } from 'expo-router'
import React, { useContext, useState } from 'react'
import {
  Alert,
  Button,
  StyleSheet,
  Text,
  View,
  ActivityIndicator,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  ScrollView
} from 'react-native'
import { AuthContext } from '../../src/context/AuthContext'
import COLORS from '../../src/theme/colors'
import Logo from '../../src/components/Logo'

export default function ForgotPassword() {
  const { forgotPassword } = useContext(AuthContext)
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)

  const onSubmit = async () => {
    try {
      setLoading(true)
      await forgotPassword(email)
      Alert.alert('OTP sent', 'Check your email')
      router.push(`/reset-password/${encodeURIComponent(email)}` as any)
    } catch {
      Alert.alert('Error', 'Could not send OTP')
    } finally {
      setLoading(false)
    }
  }

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView
        contentContainerStyle={styles.container}
        keyboardShouldPersistTaps="handled"
      >
        <Logo variant="dark" />
        <Text style={styles.title}>Forgot Password</Text>

        <View style={styles.form}>
          <Text style={styles.label}>Email</Text>
          <TextInput
            placeholder="Enter your email"
            placeholderTextColor={COLORS.muted}
            style={styles.input}
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
          />

          {loading ? (
            <ActivityIndicator size="large" color={COLORS.primary} style={{ marginTop: 20 }} />
          ) : (
            <View style={styles.buttonWrapper}>
              <Button title="Send OTP" color={COLORS.primary} onPress={onSubmit} />
            </View>
          )}
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  )
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
    alignItems: 'center',
    justifyContent: 'center',
    flexGrow: 1,
    backgroundColor: COLORS.background
  },
  title: {
    fontSize: 28,
    color: COLORS.primary,
    fontWeight: 'bold',
    marginVertical: 24,
    textAlign: 'center',
  },
  form: {
    alignSelf: 'stretch',
    backgroundColor: COLORS.white,
    borderRadius: 8,
    padding: 16,
  },
  label: {
    marginBottom: 6,
    color: COLORS.text,
    fontSize: 14,
    fontWeight: '500',
  },
  input: {
    borderWidth: 1,
    borderColor: COLORS.gray,
    borderRadius: 4,
    paddingHorizontal: 12,
    paddingVertical: 8,
    color: COLORS.text,
    backgroundColor: COLORS.white,
    fontSize: 16,
    marginBottom: 16,
  },
  buttonWrapper: {
    marginTop: 8,
  }
})
