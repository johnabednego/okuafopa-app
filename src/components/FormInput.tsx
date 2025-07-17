// src/components/FormInput.tsx

import React from 'react'
import { View, TextInput, Text, StyleSheet } from 'react-native'
import COLORS from '../theme/colors'

type Props = {
  label?: string
  error?: string
  touched?: boolean
} & React.ComponentProps<typeof TextInput>

export default function FormInput({ label, error, touched, style, ...rest }: Props) {
  const showError = touched && !!error
  return (
    <View style={styles.wrapper}>
      {label && <Text style={styles.label}>{label}</Text>}
      <TextInput
        style={[styles.input, showError && styles.inputError, style]}
        placeholderTextColor={COLORS.muted}
        {...rest}
      />
      {showError && <Text style={styles.errorText}>{error}</Text>}
    </View>
  )
}

const styles = StyleSheet.create({
  wrapper: {
    marginBottom: 16,
    width: '100%',            // fill available width
  },
  label: {
    marginBottom: 4,
    color: COLORS.text
  },
  input: {
    width: '100%',            // span full wrapper
    borderWidth: 1,
    borderColor: COLORS.gray,
    borderRadius: 4,
    paddingHorizontal: 12,
    paddingVertical: 8,
    color: COLORS.text,
    backgroundColor: COLORS.white
  },
  inputError: {
    borderColor: COLORS.danger
  },
  errorText: {
    marginTop: 4,
    color: COLORS.danger,
    fontSize: 12
  }
})
