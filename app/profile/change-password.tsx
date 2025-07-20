// app/profile/change-password.tsx

import React, { useRef, useState } from 'react'
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  Button,
  Alert,
  ActivityIndicator,
  TouchableOpacity,
} from 'react-native'
import api from '../../src/api/client'
import COLORS from '../../src/theme/colors'
import { useRouter } from 'expo-router'
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view'
import { Ionicons } from '@expo/vector-icons'

type ChangePasswordProps = {
  /** Called when the user successfully changes password, or hits “Cancel” */
  onClose?: () => void
}

export default function ChangePasswordScreen({ onClose }: ChangePasswordProps) {
  const [currentPassword, setCurrentPassword] = useState('')
  const [showCurrentPassword, setShowCurrentPassword] = useState(false)
  const [newPassword, setNewPassword] = useState('')
  const [showNewPassword, setShowNewPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const scrollRef = useRef<KeyboardAwareScrollView>(null);
  // fallback to router.back() if no onClose provided
  const close = onClose ?? (() => router.back())

  const handleChangePassword = async () => {
    if (newPassword.length < 6) {
      return Alert.alert('Error', 'New password must be at least 6 characters')
    }

    setLoading(true)
    try {
      await api.post('/users/me/change-password', { currentPassword, newPassword })
      Alert.alert('Success', 'Password changed successfully')
      close()
    } catch (err: any) {
      Alert.alert('Error', err.response?.data?.error || 'Failed to change password')
    } finally {
      setLoading(false)
    }
  }

  const handleCancel = () => {
    if (!loading) close()
  }

  return (
    <KeyboardAwareScrollView
      ref={scrollRef}
      contentContainerStyle={styles.scrollContent}
      keyboardShouldPersistTaps="handled"
      enableOnAndroid
      extraScrollHeight={100}
      enableAutomaticScroll
      keyboardOpeningTime={0}
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.container}>
        {/* Only show “Cancel” when embedded via onClose */}
        {onClose && (
          <Text style={styles.cancelText} onPress={handleCancel}>
            ← Cancel
          </Text>
        )}

        <Text style={styles.label}>Current Password</Text>
        <View style={styles.inputContainer}>
          <TextInput
            style={styles.input}
            secureTextEntry={!showCurrentPassword}
            value={currentPassword}
            onChangeText={setCurrentPassword}
          />
          <TouchableOpacity
            style={styles.eyeButton}
            onPress={() => setShowCurrentPassword(!showCurrentPassword)}
          >
            <Ionicons
              name={showCurrentPassword ? "eye-outline" : "eye-off-outline"}
              size={20}
              color={COLORS.textLight}
            />
          </TouchableOpacity>
        </View>
        <Text style={styles.label}>New Password</Text>
        <View style={styles.inputContainer}>
          <TextInput
            style={styles.input}
            secureTextEntry={!showNewPassword}
            value={newPassword}
            onChangeText={setNewPassword}
          />
          <TouchableOpacity
            style={styles.eyeButton}
            onPress={() => setShowNewPassword(!showNewPassword)}
          >
            <Ionicons
              name={showNewPassword ? "eye-outline" : "eye-off-outline"}
              size={20}
              color={COLORS.textLight}
            />
          </TouchableOpacity>
        </View>

        <View style={{ marginTop: 24 }}>
          {loading ? (
            <ActivityIndicator color={COLORS.primary} />
          ) : (
            <Button
              title="Change Password"
              onPress={handleChangePassword}
              color={COLORS.primary}
            />
          )}
        </View>
      </View>
    </KeyboardAwareScrollView>
  )
}

const styles = StyleSheet.create({
  scrollContent: {
    flexGrow: 1,
    padding: 16,
    justifyContent: 'flex-start',
    backgroundColor: COLORS.background,
  },
  container: {
    padding: 20,
    backgroundColor: COLORS.background,
    flex: 1,
  },
  cancelText: {
    color: COLORS.primary,
    marginBottom: 12,
    fontSize: 16,
  },
  label: {
    marginTop: 16,
    marginBottom: 6,
    fontWeight: '600',
    color: COLORS.text,
  },
  input: {
    borderWidth: 1,
    borderColor: COLORS.grayLight,
    borderRadius: 6,
    padding: 10,
    backgroundColor: COLORS.white,
  },
  inputContainer: {
    width: '100%',
    marginBottom: 20,
    position: 'relative',
  },
  eyeButton: {
    position: 'absolute',
    right: 16,
    top: 6,
    padding: 4,
  },
})
