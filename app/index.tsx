import React, { useContext, useEffect, useState } from 'react';
import { Redirect } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { AuthContext } from '../src/context/AuthContext';
import { ActivityIndicator, View } from 'react-native';
import COLORS from '../src/theme/colors';

export default function Index() {
  const { token, user } = useContext(AuthContext);
  const [isLoading, setIsLoading] = useState(true);
  const [isFirstLaunch, setIsFirstLaunch] = useState(false);

  useEffect(() => {
    const checkFirstLaunch = async () => {
      try {
        // await AsyncStorage.removeItem('hasLaunched')
        const hasLaunched = await AsyncStorage.getItem('hasLaunched');
        if (hasLaunched === null) {
          // First time
          await AsyncStorage.setItem('hasLaunched', 'true');
          setIsFirstLaunch(true);
        } else {
          setIsFirstLaunch(false);
        }
      } catch (err) {
        console.error('Error checking app launch status', err);
        // Assume not first launch to avoid blocking users
        setIsFirstLaunch(false);
      } finally {
        setIsLoading(false);
      }
    };

    checkFirstLaunch();
  }, []);

  if (isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    );
  }

  if (!token || !user) {
    if (isFirstLaunch) {
      return <Redirect href="/onboard/step1" />;
    } else {
      return <Redirect href="/login" />;
    }
  }

  // Redirect to appropriate tab layout based on role
  return user.role === 'farmer'
    ? <Redirect href="/(tabs)/farmer/tabs" />
    : <Redirect href="/(tabs)/buyer/products" />;
}
