import { useLocalSearchParams, useRouter } from 'expo-router'
import React, { useContext, useRef, useState, useEffect } from 'react'
import {
  Alert,
  Button,
  StyleSheet,
  Text,
  View,
  ActivityIndicator,
  TouchableOpacity,
} from 'react-native'
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view'
import { AuthContext } from '../../../src/context/AuthContext'
import COLORS from '../../../src/theme/colors'
import Logo from '../../../src/components/Logo'
import FormInput from '../../../src/components/FormInput'
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context'
import { Formik } from 'formik'
import * as Yup from 'yup'

const ResetSchema = Yup.object().shape({
  otp: Yup.string()
    .length(6, 'OTP must be 6 digits')
    .required('OTP is required'),
  newPass: Yup.string()
    .min(6, 'At least 6 characters')
    .required('New password is required'),
})

export default function ResetPassword() {
  const { email } = useLocalSearchParams<{ email: string }>()
  const { resetPassword, resendOtp } = useContext(AuthContext)
  const router = useRouter()
  const insets = useSafeAreaInsets()
  const scrollRef = useRef<KeyboardAwareScrollView>(null)

  const [resending, setResending] = useState(false)
  const [timeLeft, setTimeLeft] = useState(600) // 10 minutes countdown (600 seconds)

  // Countdown effect
  useEffect(() => {
    if (timeLeft === 0) return; // Stop when time reaches 0

    const interval = setInterval(() => {
      setTimeLeft(prevTime => {
        if (prevTime <= 1) clearInterval(interval); // Stop when time reaches 0
        return prevTime - 1;
      })
    }, 1000);

    return () => clearInterval(interval); // Cleanup on unmount or when timeLeft changes
  }, [timeLeft]);

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const secondsLeft = seconds % 60;
    return `${String(minutes).padStart(2, '0')}:${String(secondsLeft).padStart(2, '0')}`;
  };

  const onResend = async () => {
    try {
      setResending(true)
      await resendOtp(email, 'passwordReset')
      Alert.alert('Sent', 'A new OTP has been sent')
      setTimeLeft(600); // Reset the timer when OTP is resent
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
        <Text style={styles.title}>Reset Password</Text>

        <Formik
          initialValues={{ otp: '', newPass: '' }}
          validationSchema={ResetSchema}
          onSubmit={async (values, { setSubmitting }) => {
            try {
              await resetPassword(email, values.otp, values.newPass)
              Alert.alert('Success', 'Password reset—please log in')
              router.replace('/login')
            } catch (e: any) {
              Alert.alert('Error', e.response?.data?.message || e.message)
            } finally {
              setSubmitting(false)
            }
          }}
        >
          {({
            handleChange,
            handleBlur,
            handleSubmit,
            values,
            errors,
            touched,
            isSubmitting,
          }) => (
            <View style={styles.form}>
              <Text style={styles.infoText}>
                Enter the OTP sent to <Text style={styles.bold}>{email}</Text>
              </Text>

              <FormInput
                label="OTP Code"
                placeholder="Enter OTP"
                keyboardType="number-pad"
                maxLength={6}
                value={values.otp}
                onChangeText={handleChange('otp')}
                onBlur={handleBlur('otp')}
                onFocus={(e) => {
                  scrollRef.current?.scrollToFocusedInput(e.target, 100)
                }}
                error={errors.otp}
                touched={touched.otp}
              />

              <FormInput
                label="New Password"
                placeholder="Enter new password"
                secureTextEntry
                value={values.newPass}
                onChangeText={handleChange('newPass')}
                onBlur={handleBlur('newPass')}
                onFocus={(e) => {
                  scrollRef.current?.scrollToFocusedInput(e.target, 100)
                }}
                error={errors.newPass}
                touched={touched.newPass}
              />

              {isSubmitting ? (
                <ActivityIndicator
                  size="large"
                  color={COLORS.primary}
                  style={{ marginTop: 20 }}
                />
              ) : (
                <View style={styles.buttonWrapper}>
                  <Button title="Reset Password" color={COLORS.primary} onPress={handleSubmit as any} />
                </View>
              )}

              {/* Countdown timer */}
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
          )}
        </Formik>
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
