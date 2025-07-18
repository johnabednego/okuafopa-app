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

const SignupSchema = Yup.object().shape({
  firstName: Yup.string().required('First name is required'),
  lastName: Yup.string().required('Last name is required'),
  email: Yup.string().email('Invalid email').required('Email is required'),
  password: Yup.string().min(6, 'At least 6 characters').required('Password is required'),
  phoneNumber: Yup.string().required('Phone number is required'),
  country: Yup.string().required('Country is required'),
  city: Yup.string().required('City is required'),
})

export default function SignupScreen() {
  const { signup } = useContext(AuthContext)
  const router = useRouter()
  const [role, setRole] = useState<'farmer' | 'buyer'>('farmer')
  const insets = useSafeAreaInsets()
  const [toggleAnim] = useState(new Animated.Value(0)) // 0 = farmer, 1 = buyer
  const scrollRef = useRef<KeyboardAwareScrollView>(null)


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

        {/* Role Toggle Tabs */}
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
            phoneNumber: '',
            country: '',
            city: '',
            role:role,
          }}
          validationSchema={SignupSchema}
          onSubmit={async (values, { setSubmitting }) => {
            try {
              await signup({ ...values, role })
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
                onFocus={(e) => {
                  scrollRef.current?.scrollToFocusedInput(e.target, 100)
                }}
                touched={touched.firstName}
              />
              <FormInput
                label="Last Name"
                onChangeText={handleChange('lastName')}
                onBlur={handleBlur('lastName')}
                value={values.lastName}
                error={errors.lastName}
                onFocus={(e) => {
                  scrollRef.current?.scrollToFocusedInput(e.target, 100)
                }}
                touched={touched.lastName}
              />
              <FormInput
                label="Email"
                keyboardType="email-address"
                autoCapitalize="none"
                onChangeText={handleChange('email')}
                onBlur={handleBlur('email')}
                value={values.email}
                error={errors.email}
                onFocus={(e) => {
                  scrollRef.current?.scrollToFocusedInput(e.target, 100)
                }}
                touched={touched.email}
              />
              <FormInput
                label="Password"
                secureTextEntry
                onChangeText={handleChange('password')}
                onBlur={handleBlur('password')}
                value={values.password}
                error={errors.password}
                onFocus={(e) => {
                  scrollRef.current?.scrollToFocusedInput(e.target, 100)
                }}
                touched={touched.password}
              />
              <FormInput
                label="Phone Number"
                keyboardType="phone-pad"
                onChangeText={handleChange('phoneNumber')}
                onBlur={handleBlur('phoneNumber')}
                value={values.phoneNumber}
                error={errors.phoneNumber}
                onFocus={(e) => {
                  scrollRef.current?.scrollToFocusedInput(e.target, 100)
                }}
                touched={touched.phoneNumber}
              />
              <FormInput
                label="Country"
                onChangeText={handleChange('country')}
                onBlur={handleBlur('country')}
                value={values.country}
                error={errors.country}
                onFocus={(e) => {
                  scrollRef.current?.scrollToFocusedInput(e.target, 100)
                }}
                touched={touched.country}
              />
              <FormInput
                label="City"
                onChangeText={handleChange('city')}
                onBlur={handleBlur('city')}
                value={values.city}
                error={errors.city}
                onFocus={(e) => {
                  scrollRef.current?.scrollToFocusedInput(e.target, 100)
                }}
                touched={touched.city}
              />

              {isSubmitting ? (
                <ActivityIndicator
                  size="large"
                  color={COLORS.primary}
                  style={{ marginTop: 20 }}
                />
              ) : (
                <View style={styles.buttonWrapper}>
                  <Button
                    title="Create Account"
                    color={COLORS.primary}
                    onPress={handleSubmit as any}
                  />
                </View>
              )}

              <View style={styles.loginRow}>
                <Text style={styles.loginText}>Already have an account? </Text>
                <TouchableOpacity onPress={() => router.replace('/login')}>
                  <Text style={styles.loginLink}>Log In</Text>
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
  logo: {
    marginBottom: 24,
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
    borderRadius: 30,
    backgroundColor: COLORS.grayLight,
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
    borderRadius: 30,
    zIndex: 0,
  },
  toggleHalf: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1,
  },
  toggleLabel: {
    color: COLORS.text,
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
  buttonWrapper: {
    alignSelf: 'stretch',
    marginTop: 12,
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
