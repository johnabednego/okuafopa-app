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
import { useRouter } from 'expo-router';

export default function Step3() {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const router = useRouter()

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
        source={require('../../assets/images/step3.png')}
        style={styles.image}
        resizeMode="cover"
      />
      <Image
        source={require('../../assets/images/ellipse.png')}
        style={styles.ellipse}
        resizeMode="cover"
      />
      <View style={styles.main}>
        <Text style={styles.heading}>Join the</Text>
        <Text style={styles.brand}>Okuafopa Community</Text>
        <Text style={styles.description}>
          Agriculture is the heartbeat of our land — feeding families,
          creating livelihoods, and sustaining communities. Okuafopa empowers
          farmers by connecting them to markets, fair prices, and
          opportunities through technology.
        </Text>
        <View style={styles.dots}>
          <View style={styles.dotActive} />
          <View style={styles.dotActive} />
          <View style={styles.dotActive} />
        </View>
        <View style={styles.buttonWrapper}>
          <TouchableOpacity
            style={styles.button}
            onPress={() => router.replace('/signup')}
          >
            <Text style={{ color: COLORS.primary, fontWeight: 500, fontSize: 16 }}>Register</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.button, {backgroundColor: COLORS.primary}]}
            onPress={() => router.replace('/login')}
          >
            <Text style={{ color: COLORS.white, fontWeight: 500, fontSize: 16 }}>Login</Text>
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
    fontSize: 30,
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
  dotActive: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: COLORS.primary,
  },
  buttonWrapper: {
    width: '90%',
    display: "flex",
    flexDirection: "row",
    gap: 20,
    justifyContent: "center",
    marginTop: 30,
  },
  button: {
    width: '50%',
    height: 46,
    display: "flex",
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderStyle: "solid",
    borderColor: COLORS.primary,
    borderRadius: 5,
  }
});
