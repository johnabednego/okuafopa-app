import { useLocalSearchParams, useRouter } from 'expo-router'
import React, { useContext, useRef, useState, useEffect } from 'react'
import {
  Alert,
  StyleSheet,
  Text,
  TextInput,
  View,
  Button,
  ActivityIndicator,
  TouchableOpacity,
} from 'react-native'
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view'
import { AuthContext } from '../../../src/context/AuthContext'
import COLORS from '../../../src/theme/colors'
import Logo from '../../../src/components/Logo'
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context'

export default function VerifyEmail() {
  const { verifyEmail, resendOtp } = useContext(AuthContext)
  const { email } = useLocalSearchParams<{ email: string }>()
  const router = useRouter()
  const [otp, setOtp] = useState('')
  const [loading, setLoading] = useState(false)
  const [resending, setResending] = useState(false)
  const [timeLeft, setTimeLeft] = useState(600) // Start with 10 minutes (600 seconds)
  const insets = useSafeAreaInsets()
  const scrollRef = useRef<KeyboardAwareScrollView>(null)

  // Countdown effect
  useEffect(() => {
    if (timeLeft === 0) return; // Stop when the time reaches 0

    const interval = setInterval(() => {
      setTimeLeft(prevTime => {
        if (prevTime <= 1) clearInterval(interval); // Stop the interval when time is 0
        return prevTime - 1;
      })
    }, 1000);

    return () => clearInterval(interval); // Clean up the interval when the component unmounts
  }, [timeLeft]);

  // Format time in MM:SS
  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const secondsLeft = seconds % 60;
    return `${String(minutes).padStart(2, '0')}:${String(secondsLeft).padStart(2, '0')}`;
  };

  const onVerify = async () => {
    try {
      setLoading(true)
      await verifyEmail(email, otp)
      router.replace('/')
    } catch (e: any) {
      Alert.alert('Error', e.response?.data?.message || e.message)
    } finally {
      setLoading(false)
    }
  }

  const onResend = async () => {
    try {
      setResending(true)
      await resendOtp(email, 'emailVerification')
      Alert.alert('Sent', 'A new code has been sent to your email')
      setTimeLeft(600); // Reset timer when OTP is resent
    } catch (e: any) {
      Alert.alert('Error', e.response?.data?.message || e.message)
    } finally {
      setResending(false)
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
        <Text style={styles.title}>Verify Email</Text>

        <View style={styles.form}>
          <Text style={styles.infoText}>
            Enter the OTP sent to <Text style={styles.bold}>{email}</Text>
          </Text>

          <Text style={styles.label}>OTP Code</Text>
          <TextInput
            placeholder="Enter OTP"
            placeholderTextColor={COLORS.muted}
            style={styles.input}
            value={otp}
            onChangeText={setOtp}
            onFocus={(e) => {
              scrollRef.current?.scrollToFocusedInput(e.target, 100)
            }}
            keyboardType="number-pad"
            maxLength={6}
          />

          {loading ? (
            <ActivityIndicator size="large" color={COLORS.primary} style={{ marginTop: 20 }} />
          ) : (
            <View style={styles.buttonWrapper}>
              <Button title="Verify" color={COLORS.primary} onPress={onVerify} />
            </View>
          )}

          <View style={styles.resendRow}>
            <Text style={styles.infoText}>Didn't get code?</Text>
            <TouchableOpacity onPress={onResend} disabled={resending || timeLeft > 0}>
              <Text style={styles.resendLink}>
                {resending ? 'Sending...' : timeLeft > 0 ? (
                  <View style={styles.resendContainer} >
                    <Text style={styles.resendCodeText}>
                      Resend code in
                    </Text>
                    <Text style={styles.timerText}>
                      {formatTime(timeLeft)}
                    </Text>

                  </View>
                ) : 'Resend OTP'}
              </Text>
            </TouchableOpacity>
          </View>
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
    backgroundColor: COLORS.background,
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
    marginTop: 16,
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
  },
  buttonWrapper: {
    marginTop: 16,
  },
  infoText: {
    textAlign: 'center',
    color: COLORS.text,
  },
  bold: {
    fontWeight: 'bold',
  },
  resendRow: {
    marginTop: 20,
    alignItems: 'center',
  },
  resendContainer: {
    flex: 0,
    flexDirection: "row",
  },
  resendLink: {
    color: COLORS.primary,
    fontWeight: '600',
  },
  resendCodeText: {
    marginTop: 4,
    color: COLORS.gray,  // Default text color for "Resend code in"
    fontWeight: '600',
  },
  timerText: {
    marginTop: 5,
    marginLeft: 5,
    color: COLORS.primary,
    fontWeight: '600',
  },
})
