import { StyleSheet, Text, View } from 'react-native';
import COLORS from '../theme/colors';

export default function HomeScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Welcome to Okuafopa</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    color: COLORS.background,
    fontSize: 24,
    fontWeight: 'bold',
  },
});
