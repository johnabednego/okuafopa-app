import React, { useContext, useRef, useState } from 'react'
import {
  View,
  Button,
  StyleSheet,
  ActivityIndicator,
  Text,
  Pressable,
  TouchableOpacity,
} from 'react-native'
import { useRouter } from 'expo-router'
import { Formik } from 'formik'
import * as Yup from 'yup'
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context'
import { Ionicons } from "@expo/vector-icons"
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view'

import FormInput from '../../src/components/FormInput'
import Logo from '../../src/components/Logo'
import { AuthContext } from '../../src/context/AuthContext'
import { showError } from '../../src/utils/alert'
import COLORS from '../../src/theme/colors'

const LoginSchema = Yup.object().shape({
  email: Yup.string().email('Invalid email').required('Email is required'),
  password: Yup.string().min(6, 'At least 6 characters').required('Password is required'),
})

export default function LoginScreen() {
  const { login } = useContext(AuthContext)
  const router = useRouter()
  const [showPassword, setShowPassword] = useState(false)
  const insets = useSafeAreaInsets()
  const scrollRef = useRef<KeyboardAwareScrollView>(null)

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
        <Logo variant="dark" imageStyle={styles.logo} />
        <View style={styles.titleContainer}>
          <Text style={styles.title}>Welcome Back!</Text>
          <Text style={styles.subTitle}>Sign In to your account</Text>
        </View>

        <Formik
          initialValues={{ email: '', password: '' }}
          validationSchema={LoginSchema}
          onSubmit={async (values, { setSubmitting }) => {
            try {
              await login(values.email, values.password)
              router.replace('/')
            } catch (err: any) {
              if (err.needsVerification) {
                router.push(`/verify-email/${encodeURIComponent(values.email)}` as any)
              } else {
                showError(err, 'Login Failed')
              }
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
              <FormInput
                label="Email"
                keyboardType="email-address"
                autoCapitalize="none"
                onChangeText={handleChange('email')}
                onBlur={handleBlur('email')}
                onFocus={(e) => {
                  scrollRef.current?.scrollToFocusedInput(e.target, 100)
                }}
                value={values.email}
                error={errors.email}
                touched={touched.email}
              />

              <View style={styles.inputContainer}>
                <FormInput
                  label="Password"
                  secureTextEntry={!showPassword}
                  onChangeText={handleChange('password')}
                  onBlur={handleBlur('password')}
                  onFocus={(e) => {
                    scrollRef.current?.scrollToFocusedInput(e.target, 100)
                  }}
                  value={values.password}
                  error={errors.password}
                  touched={touched.password}
                />
                <TouchableOpacity
                  style={styles.eyeButton}
                  onPress={() => setShowPassword(!showPassword)}
                >
                  <Ionicons
                    name={showPassword ? "eye-outline" : "eye-off-outline"}
                    size={20}
                    color={COLORS.textLight}
                  />
                </TouchableOpacity>
              </View>

              {isSubmitting ? (
                <ActivityIndicator
                  size="large"
                  color={COLORS.primary}
                  style={{ marginTop: 20 }}
                />
              ) : (
                <View style={styles.buttonWrapper}>
                  <TouchableOpacity
                    style={[styles.button, { backgroundColor: COLORS.primary }]}
                    onPress={handleSubmit as any}
                  >
                    <Text style={{ color: COLORS.white, fontWeight: 500, fontSize: 16 }}>Sign In</Text>
                  </TouchableOpacity>
                </View>
              )}

              <Pressable onPress={() => router.push('/forgot-password')}>
                <Text style={styles.link}>Forgot Password?</Text>
              </Pressable>

              <View style={styles.createAccountRow}>
                <Text style={styles.createAccountText}>Don’t have an account? </Text>
                <Pressable onPress={() => router.replace('/signup')}>
                  <Text style={[styles.createAccountText, styles.createAccountLink]}>
                    Create Account
                  </Text>
                </Pressable>
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
    paddingTop: 20,
    paddingBottom: 32,
    alignItems: 'center',
  },
  logo: {
    marginBottom: 30,
  },
  titleContainer: {
    width: "100%",
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
    alignItems: "center"
  },
  title: {
    fontSize: 24,
    color: COLORS.dark,
    fontWeight: 'bold',
    textAlign: 'left',
  },
  subTitle: {
    fontSize: 16,
    color: COLORS.mainGray,
    fontWeight: 'normal',
  },
  form: {
    alignSelf: 'stretch',
    backgroundColor: COLORS.white,
    borderRadius: 8,
    marginTop: 24
  },
  buttonWrapper: {
    alignSelf: 'stretch',
    marginTop: 12,
  },
  link: {
    marginTop: 16,
    textAlign: 'center',
    color: COLORS.primary,
  },
  createAccountRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 24,
  },
  createAccountText: {
    color: COLORS.text,
    fontSize: 14,
  },
  createAccountLink: {
    color: COLORS.primary,
    fontWeight: 'bold',
  },
  inputContainer: {
    width: '100%',
    marginBottom: 20,
    position: 'relative',
  },
  eyeButton: {
    position: 'absolute',
    right: 16,
    top: 26,
    padding: 4,
  },
  button: {
    width: '100%',
    height: 46,
    display: "flex",
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderStyle: "solid",
    borderColor: COLORS.primary,
    borderRadius: 5,
  }
})
