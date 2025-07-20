// src/screens/profile/SettingsTab.tsx

import React, { useContext, useEffect, useRef, useState } from 'react'
import {
  View,
  Text,
  StyleSheet,
  Switch,
  Button,
  ActivityIndicator,
  Alert,
  Animated,
} from 'react-native'
import { AuthContext } from '../../context/AuthContext'
import api from '../../api/client'
import COLORS from '../../theme/colors'
import ChangePasswordScreen from '../../../app/profile/change-password'

export default function SettingsTab() {
  const { user, setUser } = useContext(AuthContext)
  const [emailNotification, setEmailNotification] = useState(user?.emailNotification || false)
  const [smsNotification, setSmsNotification] = useState(user?.smsNotification || false)
  const [loading, setLoading] = useState(false)

  // control whether we show the ChangePasswordScreen
  const [showChangePassword, setShowChangePassword] = useState(false)

  // Animation refs for the main settings form
  const fadeAnim = useRef(new Animated.Value(0)).current
  const slideAnim = useRef(new Animated.Value(30)).current

  useEffect(() => {
    if (!showChangePassword) {
      // only animate when showing the settings form
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 400,
          useNativeDriver: true,
        }),
        Animated.timing(slideAnim, {
          toValue: 0,
          duration: 400,
          useNativeDriver: true,
        }),
      ]).start()
    }
  }, [showChangePassword])

  const handleSave = async () => {
    setLoading(true)
    try {
      const res = await api.patch('/users/me', {
        emailNotification,
        smsNotification,
      })
      setUser(res.data)
      Alert.alert('Success', 'Settings updated')
    } catch (err: any) {
      Alert.alert('Error', err.response?.data?.error || 'Failed to update settings')
    } finally {
      setLoading(false)
    }
  }

  // If user tapped “Change Password”, render that screen in-place
  if (showChangePassword) {
    return (
      <ChangePasswordScreen onClose={() => setShowChangePassword(false)} />
    )
  }

  // Otherwise show your animated settings form
  return (
    <Animated.View
      style={[
        styles.container,
        {
          opacity: fadeAnim,
          transform: [{ translateY: slideAnim }],
        },
      ]}
    >
      <View style={styles.row}>
        <Text style={styles.label}>Email Notifications</Text>
        <Switch
          value={emailNotification}
          onValueChange={setEmailNotification}
          trackColor={{ false: COLORS.grayLight, true: COLORS.primary }}
          thumbColor="#fff"
        />
      </View>

      <View style={styles.row}>
        <Text style={styles.label}>SMS Notifications</Text>
        <Switch
          value={smsNotification}
          onValueChange={setSmsNotification}
          trackColor={{ false: COLORS.grayLight, true: COLORS.primary }}
          thumbColor="#fff"
        />
      </View>

      <View style={{ marginTop: 32 }}>
        {loading ? (
          <ActivityIndicator color={COLORS.primary} />
        ) : (
          <Button title="Save Settings" color={COLORS.primary} onPress={handleSave} />
        )}
      </View>

      <View style={{ marginTop: 40 }}>
        <Button
          title="Change Password"
          color={COLORS.primary}
          onPress={() => setShowChangePassword(true)}
        />
      </View>
    </Animated.View>
  )
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
    backgroundColor: COLORS.background,
    flex: 1,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginVertical: 16,
  },
  label: {
    fontSize: 16,
    fontWeight: '500',
    color: COLORS.text,
  },
})
