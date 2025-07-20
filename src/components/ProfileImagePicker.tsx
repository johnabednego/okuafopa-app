import React, { useState } from 'react'
import {
  View,
  Image,
  StyleSheet,
  TouchableOpacity,
  Alert,
  Text
} from 'react-native'
import * as ImagePicker from 'expo-image-picker'
import { Ionicons } from '@expo/vector-icons'
import COLORS from '../theme/colors'

type Props = {
  value?: string
  onChange: (uri: string) => void
}

export default function ProfileImagePicker({ value, onChange }: Props) {
  const [uploading, setUploading] = useState(false)

  const requestPermission = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync()
    if (status !== 'granted') {
      Alert.alert('Permission Required', 'Please grant media library access.')
      return false
    }
    return true
  }

  const pickImage = async () => {
    const hasPermission = await requestPermission()
    if (!hasPermission) return

    const result = await ImagePicker.launchImageLibraryAsync({
      allowsEditing: true,
      quality: 0.5,
    })

    if (!result.canceled) {
      onChange(result.assets[0].uri)
    }
  }

  const takePhoto = async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync()
    if (status !== 'granted') {
      Alert.alert('Permission Required', 'Please grant camera access.')
      return
    }

    const result = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      quality: 0.5,
    })

    if (!result.canceled) {
      onChange(result.assets[0].uri)
    }
  }

  const showOptions = () => {
    Alert.alert('Upload Photo', 'Choose an option', [
      { text: 'Take Photo', onPress: takePhoto },
      { text: 'Choose from Gallery', onPress: pickImage },
      { text: 'Cancel', style: 'cancel' },
    ])
  }

  return (
    <TouchableOpacity onPress={showOptions} style={styles.wrapper}>
      {value ? (
        <Image source={{ uri: value }} style={styles.image} />
      ) : (
        <View style={styles.placeholder}>
          <Ionicons name="camera" size={32} color={COLORS.textLight} />
          <Text style={styles.label}>Upload Photo</Text>
        </View>
      )}
    </TouchableOpacity>
  )
}

const styles = StyleSheet.create({
  wrapper: {
    alignSelf: 'center',
    marginBottom: 16,
    borderRadius: 75,
    overflow: 'hidden',
    width: 120,
    height: 120,
    backgroundColor: COLORS.grayLight,
    justifyContent: 'center',
    alignItems: 'center',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  placeholder: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  label: {
    color: COLORS.textLight,
    fontSize: 12,
    marginTop: 6,
  },
})
