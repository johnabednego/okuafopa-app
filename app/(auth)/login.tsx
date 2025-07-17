// app/login.tsx

import React, { useContext } from 'react'
import {
  View,
  Button,
  StyleSheet,
  ActivityIndicator,
  Text,
  Pressable
} from 'react-native'
import { useRouter } from 'expo-router'
import { Formik } from 'formik'
import * as Yup from 'yup'
import FormInput from '../../src/components/FormInput'
import Logo from '../../src/components/Logo'
import { AuthContext } from '../../src/context/AuthContext'
import { showError } from '../../src/utils/alert'
import COLORS from '../../src/theme/colors'

const LoginSchema = Yup.object().shape({
  email:    Yup.string().email('Invalid email').required('Email is required'),
  password: Yup.string().min(6, 'At least 6 characters').required('Password is required'),
})

export default function LoginScreen() {
  const { login } = useContext(AuthContext)
  const router = useRouter()

  return (
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
        <View style={styles.container}>
          <Logo variant="dark" />
          <Text style={styles.title}>Log In</Text>

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

          {isSubmitting ? (
            <ActivityIndicator size="large" color={COLORS.primary} style={{ marginTop: 20 }} />
          ) : (
            <View style={styles.buttonWrapper}>
              <Button title="Log In" color={COLORS.primary} onPress={handleSubmit as any} />
            </View>
          )}

          <Pressable onPress={() => router.push('/forgot-password')}>
            <Text style={styles.link}>Forgot Password?</Text>
          </Pressable>

          <View style={styles.createAccountRow}>
            <Text style={styles.createAccountText}>Don’t have an account? </Text>
            <Pressable onPress={() => router.replace('/signup')}>
              <Text style={[styles.createAccountText, styles.createAccountLink]}>Create Account</Text>
            </Pressable>
          </View>
        </View>
      )}
    </Formik>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
    padding: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 28,
    color: COLORS.primary,
    fontWeight: 'bold',
    marginBottom: 24,
    textAlign: 'center',
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
    marginTop: 24,
  },
  createAccountText: {
    color: COLORS.text,
    fontSize: 14,
  },
  createAccountLink: {
    color: COLORS.primary,
    fontWeight: 'bold',
  }
})
