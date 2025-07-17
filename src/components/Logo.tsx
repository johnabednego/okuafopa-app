// src/components/Logo.tsx
import React from 'react'
import { Image, StyleSheet, ViewStyle, ImageStyle } from 'react-native'

type Props = {
  /** 'light'=white logo on green bg, 'dark'=green logo on white bg */
  variant?: 'light' | 'dark'
  containerStyle?: ViewStyle
  imageStyle?: ImageStyle
}

const logoDark = require('../../assets/images/logo-green.png')
const logoLight = require('../../assets/images/logo-white.png')

export default function Logo({
  variant = 'dark',
  containerStyle,
  imageStyle
}: Props) {
  const source = variant === 'dark' ? logoDark : logoLight
  return (
    <Image
      source={source}
      style={[styles.logo, imageStyle]}
      resizeMode="contain"
    />
  )
}

const styles = StyleSheet.create({
  logo: {
    width: 150,
    height: 150,
    marginBottom: 24
  }
})
