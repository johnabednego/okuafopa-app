// app/_layout.tsx
import { Stack } from 'expo-router';
import React from 'react';
import COLORS from '../src/theme/colors';

export default function RootLayout() {
  return (
    <Stack
      screenOptions={{
        headerStyle: { backgroundColor: COLORS.primary },
        headerTintColor: COLORS.onPrimary,  // now defined
      }}
    />
  );
}
