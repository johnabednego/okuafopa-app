import { useRouter } from 'expo-router'
import React, { useContext, useRef, useState } from 'react'
import {
  Alert,
  Button,
  StyleSheet,
  Text,
  View,
  ActivityIndicator,
  TextInput
} from 'react-native'
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view'
import { AuthContext } from '../../src/context/AuthContext'
import COLORS from '../../src/theme/colors'
import Logo from '../../src/components/Logo'
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context'

export default function ForgotPassword() {
  const { forgotPassword } = useContext(AuthContext)
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const insets = useSafeAreaInsets()
  const scrollRef = useRef<KeyboardAwareScrollView>(null)

  const onSubmit = async () => {
    try {
      setLoading(true)
      await forgotPassword(email)
      Alert.alert('OTP sent', 'Check your email')
      router.push(`/reset-password/${encodeURIComponent(email)}` as any)
    } catch (e: any) {
      Alert.alert('Error', e.response?.data?.message || e.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <SafeAreaView
      edges={['bottom']}
      style={[styles.safeArea, { paddingBottom: insets.bottom }]}
    >
      <KeyboardAwareScrollView
        ref={scrollRef}
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
        enableOnAndroid
        extraScrollHeight={20}
        enableAutomaticScroll
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
            onFocus={(e) => {
              scrollRef.current?.scrollToFocusedInput(e.target, 100)
            }}
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
      </KeyboardAwareScrollView>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  scrollContent: {
    paddingHorizontal: 24,
    paddingTop: 40,
    paddingBottom: 32,
    alignItems: 'center',
  },
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
