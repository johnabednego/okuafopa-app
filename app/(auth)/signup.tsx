// app/signup.tsx

import React, { useContext, useState } from 'react'
import {
  View,
  Text,
  TouchableOpacity,
  Button,
  StyleSheet,
  ActivityIndicator,
  ScrollView,
  Alert
} from 'react-native'
import { Formik } from 'formik'
import * as Yup from 'yup'
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context'
import { useRouter } from 'expo-router'

import FormInput from '../../src/components/FormInput'
import Logo from '../../src/components/Logo'
import { AuthContext } from '../../src/context/AuthContext'
import { showError } from '../../src/utils/alert'
import COLORS from '../../src/theme/colors'

const SignupSchema = Yup.object().shape({
  firstName:    Yup.string().required('First name is required'),
  lastName:     Yup.string().required('Last name is required'),
  email:        Yup.string().email('Invalid email').required('Email is required'),
  password:     Yup.string().min(6, 'At least 6 characters').required('Password is required'),
  phoneNumber:  Yup.string().required('Phone number is required'),
  country:      Yup.string().required('Country is required'),
  city:         Yup.string().required('City is required'),
})

export default function SignupScreen() {
  const { signup } = useContext(AuthContext)
  const router = useRouter()
  const [role, setRole] = useState<'farmer' | 'buyer'>('farmer')
  const insets = useSafeAreaInsets()

  return (
    <SafeAreaView
      edges={['bottom']}
      style={[styles.safeArea, { paddingBottom: insets.bottom }]}
    >
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
      >
        {/* Logo */}
        <Logo variant="dark" imageStyle={styles.logo} />

        {/* Role Tabs */}
        <View style={styles.tabRow}>
          {(['farmer', 'buyer'] as const).map(r => (
            <TouchableOpacity
              key={r}
              style={[ styles.tab, role === r && styles.tabActive ]}
              onPress={() => setRole(r)}
            >
              <Text style={[ styles.tabText, role === r && styles.tabTextActive ]}>
                {r.charAt(0).toUpperCase() + r.slice(1)}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Form */}
        <Formik
          initialValues={{
            firstName: '',
            lastName: '',
            email: '',
            password: '',
            phoneNumber: '',
            country: '',
            city: ''
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
                touched={touched.firstName}
              />

              <FormInput
                label="Last Name"
                onChangeText={handleChange('lastName')}
                onBlur={handleBlur('lastName')}
                value={values.lastName}
                error={errors.lastName}
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
                touched={touched.email}
              />

              <FormInput
                label="Password"
                secureTextEntry
                onChangeText={handleChange('password')}
                onBlur={handleBlur('password')}
                value={values.password}
                error={errors.password}
                touched={touched.password}
              />

              <FormInput
                label="Phone Number"
                keyboardType="phone-pad"
                onChangeText={handleChange('phoneNumber')}
                onBlur={handleBlur('phoneNumber')}
                value={values.phoneNumber}
                error={errors.phoneNumber}
                touched={touched.phoneNumber}
              />

              <FormInput
                label="Country"
                onChangeText={handleChange('country')}
                onBlur={handleBlur('country')}
                value={values.country}
                error={errors.country}
                touched={touched.country}
              />

              <FormInput
                label="City"
                onChangeText={handleChange('city')}
                onBlur={handleBlur('city')}
                value={values.city}
                error={errors.city}
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

              {/* Already have account? Log In */}
              <View style={styles.loginRow}>
                <Text style={styles.loginText}>Already have an account? </Text>
                <TouchableOpacity onPress={() => router.replace('/login')}>
                  <Text style={styles.loginLink}>Log In</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}
        </Formik>
      </ScrollView>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  scrollContent: {
    padding: 16,
    alignItems: 'center',
  },
  logo: {
    marginBottom: 24,
  },
  tabRow: {
    flexDirection: 'row',
    marginBottom: 24,
    borderRadius: 8,
    overflow: 'hidden',
    alignSelf: 'stretch',
  },
  tab: {
    flex: 1,
    paddingVertical: 12,
    backgroundColor: COLORS.gray,
  },
  tabActive: {
    backgroundColor: COLORS.primary,
  },
  tabText: {
    textAlign: 'center',
    color: COLORS.text,
    fontWeight: '600',
  },
  tabTextActive: {
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
