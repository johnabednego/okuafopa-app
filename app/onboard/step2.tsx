import React, { useEffect, useRef } from 'react';
import {
  Animated,
  Image,
  StyleSheet,
  View,
  Dimensions,
  Text,
  Button,
  TouchableOpacity,
} from 'react-native';
import COLORS from '@/src/theme/colors';
import { navigate } from 'expo-router/build/global-state/routing';

export default function Step2() {
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 1000,
      useNativeDriver: true,
    }).start();
  }, []);

  return (
    <Animated.View style={[styles.container, { opacity: fadeAnim }]}>
      <Image
        source={require('../../assets/images/step2.png')}
        style={styles.image}
        resizeMode="cover"
      />
      <Image
        source={require('../../assets/images/ellipse.png')}
        style={styles.ellipse}
        resizeMode="cover"
      />
      <View style={styles.main}>
        <Text style={styles.heading}>Welcome to</Text>
        <Text style={styles.brand}>Agri Insight</Text>
        <Text style={styles.description}>
          Agriculture is the heartbeat of our land — feeding families,
          creating livelihoods, and sustaining communities. Okuafopa empowers
          farmers by connecting them to markets, fair prices, and
          opportunities through technology.
        </Text>
        <View style={styles.dots}>
          <View style={styles.dotActive} />
          <View style={styles.dotActive} />
          <View style={styles.dotInactive} />
        </View>
        <View style={styles.buttonWrapper}>
          <TouchableOpacity onPress={() => navigate('/onboard/step3')} style={styles.customButton}>
            <Text style={styles.buttonText}>Get Started</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.gray,
  },
  image: {
    width: Dimensions.get('window').width,
  },
  ellipse: {
    marginTop: -60,
    width: Dimensions.get('window').width,
    height: Dimensions.get('window').height,
  },
  main: {
    marginTop: -Dimensions.get('window').height,
    paddingTop: 98,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
  },
  heading: {
    color: COLORS.black,
    fontWeight: '700',
    fontSize: 20,
  },
  brand: {
    color: '#339944',
    fontWeight: '700',
    fontSize: 40,
    marginTop: 8,
  },
  description: {
    color: COLORS.black,
    fontWeight: '500',
    fontSize: 12,
    paddingHorizontal: 50,
    textAlign: 'center',
    marginTop: 12,
  },
  dots: {
    marginTop: 24,
    flexDirection: 'row',
    gap: 5,
  },
  dotInactive: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#D9D9D9',
  },
  dotActive: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: COLORS.primary,
  },
  buttonWrapper: {
    width: '90%',
    marginTop: 30,
  },
  customButton: {
    backgroundColor: COLORS.primary,
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 6,
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
  },
});
