import React, { useContext, useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  Button,
  ActivityIndicator,
  Alert,
  Animated,
} from 'react-native';
import { AuthContext } from '../../context/AuthContext';
import api from '../../api/client';
import COLORS from '../../theme/colors';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import { router } from "expo-router"

export default function BasicInfoTab() {
  const { user, setUser, logout } = useContext(AuthContext);
  const [firstName, setFirstName] = useState(user?.firstName || '');
  const [lastName, setLastName] = useState(user?.lastName || '');
  const [phoneNumber, setPhoneNumber] = useState(user?.phoneNumber || '');
  const [country, setCountry] = useState(user?.country || '');
  const [city, setCity] = useState(user?.city || '');
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef<KeyboardAwareScrollView>(null);

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;

  useEffect(() => {
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
    ]).start();
  }, []);

  const handleSave = async () => {
    setLoading(true);
    try {
      const res = await api.patch('/users/me', {
        firstName,
        lastName,
        phoneNumber,
        country,
        city,
      });
      setUser(res.data);
      Alert.alert('Success', 'Profile updated successfully');
    } catch (e: any) {
      Alert.alert('Error', e.response?.data?.error || e.response?.data?.message || e.message);
      if (e.response?.data?.message === "Unauthorized: Invalid or expired token" || e.message === "Unauthorized: Invalid or expired token") {
        logout()
        router.replace('/')  // back to public landing
      }
    } finally {
      setLoading(false);
    }
  };

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
      <Animated.View
        style={[
          styles.container,
          {
            opacity: fadeAnim,
            transform: [{ translateY: slideAnim }],
          },
        ]}
      >
        {/** Each TextInput will automatically scroll into view **/}
        <Text style={styles.label}>First Name</Text>
        <TextInput
          style={[styles.input, { backgroundColor: COLORS.grayLight, color: COLORS.gray }]}
          value={firstName}
          onChangeText={setFirstName}
          editable={false}
          returnKeyType="next"
        />

        <Text style={styles.label}>Last Name</Text>
        <TextInput
          style={[styles.input, { backgroundColor: COLORS.grayLight, color: COLORS.gray }]}
          value={lastName}
          onChangeText={setLastName}
          editable={false}
          returnKeyType="next"
        />

        <Text style={styles.label}>Phone Number</Text>
        <TextInput
          style={styles.input}
          value={phoneNumber}
          onChangeText={setPhoneNumber}
          keyboardType="phone-pad"
          returnKeyType="next"
        />

        <Text style={styles.label}>Country</Text>
        <TextInput
          style={styles.input}
          value={country}
          onChangeText={setCountry}
          returnKeyType="next"
        />

        <Text style={styles.label}>City</Text>
        <TextInput
          style={styles.input}
          value={city}
          onChangeText={setCity}
          returnKeyType="done"
        />

        <View style={styles.buttonWrapper}>
          {loading ? (
            <ActivityIndicator color={COLORS.primary} />
          ) : (
            <Button title="Save Changes" onPress={handleSave} color={COLORS.primary} />
          )}
        </View>
      </Animated.View>
    </KeyboardAwareScrollView>
  );
}

const styles = StyleSheet.create({
  scrollContent: {
    flexGrow: 1,
    padding: 16,
    justifyContent: 'flex-start',
    backgroundColor: COLORS.background,
  },
  container: {
    width: '100%',
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
  buttonWrapper: {
    marginTop: 32,
    marginBottom: 10
  },
});
