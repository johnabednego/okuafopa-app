import React, { useContext, useRef, useState } from 'react'
import {
  View,
  Text,
  TouchableOpacity,
  Button,
  StyleSheet,
  ActivityIndicator,
  Alert,
  Animated,
  Easing,
} from 'react-native'
import { Formik } from 'formik'
import * as Yup from 'yup'
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context'
import { useRouter } from 'expo-router'
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view'

import FormInput from '../../src/components/FormInput'
import Logo from '../../src/components/Logo'
import { AuthContext } from '../../src/context/AuthContext'
import { showError } from '../../src/utils/alert'
import COLORS from '../../src/theme/colors'
import { Ionicons } from '@expo/vector-icons'

// Validation Schema
const SignupSchema = Yup.object().shape({
  firstName: Yup.string().required('First name is required'),
  lastName: Yup.string().required('Last name is required'),
  email: Yup.string().email('Invalid email').required('Email is required'),
  password: Yup.string().min(6, 'At least 6 characters').required('Password is required'),
  confirmPassword: Yup.string()
    .required('Confirm password is required')
    .oneOf([Yup.ref('password')], 'Passwords must match'),
  phoneNumber: Yup.string().required('Phone number is required'),
  country: Yup.string().required('Country is required'),
  city: Yup.string().required('City is required'),
})

export default function SignupScreen() {
  const { signup } = useContext(AuthContext)
  const router = useRouter()
  const [role, setRole] = useState<'farmer' | 'buyer'>('farmer')
  const insets = useSafeAreaInsets()
  const [toggleAnim] = useState(new Animated.Value(0))
  const scrollRef = useRef<KeyboardAwareScrollView>(null)

  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)

  const toggleRole = (newRole: 'farmer' | 'buyer') => {
    if (newRole !== role) {
      setRole(newRole)
      Animated.timing(toggleAnim, {
        toValue: newRole === 'farmer' ? 0 : 1,
        duration: 250,
        easing: Easing.out(Easing.circle),
        useNativeDriver: false,
      }).start()
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
        <Logo variant="dark" imageStyle={styles.logo} />
        <Text style={styles.title}>Register</Text>

        <View style={styles.toggleWrapper}>
          <Animated.View
            style={[
              styles.toggleSlider,
              {
                left: toggleAnim.interpolate({
                  inputRange: [0, 1],
                  outputRange: ['0%', '50%'],
                }),
              },
            ]}
          />
          <TouchableOpacity
            style={styles.toggleHalf}
            onPress={() => toggleRole('farmer')}
            activeOpacity={0.8}
          >
            <Text style={[styles.toggleLabel, role === 'farmer' && styles.toggleLabelActive]}>
              Farmer
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.toggleHalf}
            onPress={() => toggleRole('buyer')}
            activeOpacity={0.8}
          >
            <Text style={[styles.toggleLabel, role === 'buyer' && styles.toggleLabelActive]}>
              Buyer
            </Text>
          </TouchableOpacity>
        </View>

        <Formik
          initialValues={{
            firstName: '',
            lastName: '',
            email: '',
            password: '',
            confirmPassword: '',
            phoneNumber: '',
            country: '',
            city: '',
            role: role,
          }}
          validationSchema={SignupSchema}
          onSubmit={async (values, { setSubmitting }) => {
            try {
              const { confirmPassword, ...safeValues } = values
              await signup({ ...safeValues, role })
              Alert.alert(
                'Verification Required',
                'Please check your email for the OTP to verify your account'
              )
              router.push(`/verify-email/${encodeURIComponent(values.email)}` as any)
            } catch (err: any) {
              showError(err, 'Registration Failed')
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
                label="First Name"
                onChangeText={handleChange('firstName')}
                onBlur={handleBlur('firstName')}
                value={values.firstName}
                error={errors.firstName}
                touched={touched.firstName}
                onFocus={(e) => scrollRef.current?.scrollToFocusedInput(e.target, 100)}
              />
              <FormInput
                label="Last Name"
                onChangeText={handleChange('lastName')}
                onBlur={handleBlur('lastName')}
                value={values.lastName}
                error={errors.lastName}
                touched={touched.lastName}
                onFocus={(e) => scrollRef.current?.scrollToFocusedInput(e.target, 100)}
              />
              <FormInput
                label="Email"
                keyboardType="email-address"
                autoCapitalize="none"
                onChangeText={handleChange('email')}
                onBlur={handleBlur('email')}
                value={values.email}
                error={errors.email}
                touched={touched.email}
                onFocus={(e) => scrollRef.current?.scrollToFocusedInput(e.target, 100)}
              />

              {/* Password Field */}
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

              {/* Confirm Password Field */}
              <View style={styles.inputContainer}>
                <FormInput
                  label="Confirm Password"
                  secureTextEntry={!showConfirmPassword}
                  onChangeText={handleChange('confirmPassword')}
                  onBlur={handleBlur('confirmPassword')}
                  onFocus={(e) => {
                    scrollRef.current?.scrollToFocusedInput(e.target, 100)
                  }}
                  value={values.confirmPassword}
                  error={errors.confirmPassword}
                  touched={touched.confirmPassword}
                />
                <TouchableOpacity
                  style={styles.eyeButton}
                  onPress={() => setShowConfirmPassword(!showConfirmPassword)}
                >
                  <Ionicons
                    name={showConfirmPassword ? "eye-outline" : "eye-off-outline"}
                    size={20}
                    color={COLORS.textLight}
                  />
                </TouchableOpacity>
              </View>

              <FormInput
                label="Phone Number"
                keyboardType="phone-pad"
                onChangeText={handleChange('phoneNumber')}
                onBlur={handleBlur('phoneNumber')}
                value={values.phoneNumber}
                error={errors.phoneNumber}
                touched={touched.phoneNumber}
                onFocus={(e) => scrollRef.current?.scrollToFocusedInput(e.target, 100)}
              />
              <FormInput
                label="Country"
                onChangeText={handleChange('country')}
                onBlur={handleBlur('country')}
                value={values.country}
                error={errors.country}
                touched={touched.country}
                onFocus={(e) => scrollRef.current?.scrollToFocusedInput(e.target, 100)}
              />
              <FormInput
                label="City"
                onChangeText={handleChange('city')}
                onBlur={handleBlur('city')}
                value={values.city}
                error={errors.city}
                touched={touched.city}
                onFocus={(e) => scrollRef.current?.scrollToFocusedInput(e.target, 100)}
              />

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
                    <Text style={{ color: COLORS.white, fontWeight: 500, fontSize: 16 }}>Create Account</Text>
                  </TouchableOpacity>
                </View>
              )}

              <View style={styles.loginRow}>
                <Text style={styles.loginText}>Already have an account? </Text>
                <TouchableOpacity onPress={() => router.replace('/login')}>
                  <Text style={styles.loginLink}>Sign In</Text>
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
    paddingTop: 20,
    paddingBottom: 32,
    alignItems: 'center',
  },
  logo: {
    marginBottom: 20,
  },
  title: {
    fontSize: 28,
    color: COLORS.primary,
    fontWeight: 'bold',
    marginBottom: 24,
    textAlign: 'center',
  },
  toggleWrapper: {
    flexDirection: 'row',
    position: 'relative',
    height: 48,
    borderWidth: 1,
    borderStyle: 'solid',
    borderColor: COLORS.primary,
    borderRadius: 10,
    backgroundColor: COLORS.white,
    overflow: 'hidden',
    marginBottom: 24,
    elevation: 3,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 3 },
  },
  toggleSlider: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    width: '50%',
    backgroundColor: COLORS.primary,
    zIndex: 0,
  },
  toggleHalf: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1,
  },
  toggleLabel: {
    color: COLORS.primary,
    fontSize: 16,
    fontWeight: '600',
  },
  toggleLabelActive: {
    color: COLORS.white,
  },
  form: {
    alignSelf: 'stretch',
    backgroundColor: COLORS.white,
    borderRadius: 8,
    padding: 16,
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
  buttonWrapper: {
    alignSelf: 'stretch',
    marginTop: 12,
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
  },
  loginRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 16,
  },
  loginText: {
    color: COLORS.text,
  },
  loginLink: {
    color: COLORS.primary,
    fontWeight: 'bold',
  },
})
