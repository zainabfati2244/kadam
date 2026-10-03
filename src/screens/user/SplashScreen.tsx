import React from 'react';
import {
  View,
  StyleSheet,
  Text,
  StatusBar,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '../../../context/ThemeContext';
import { AppTheme } from '../../theme/colors';

const SplashScreen = () => {
  const { theme } = useTheme();
  const styles = createStyles(theme);
  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle={theme.statusBar} backgroundColor={theme.background} />

      <View style={styles.logoWrap}>
        <Text style={styles.logo}>Kadam</Text>
        <View style={styles.line} />
        <Text style={styles.tagline}>PREMIUM FOOTWEAR</Text>
      </View>

      <Text style={styles.loading}>STEP INTO STYLE</Text>
    </SafeAreaView>
  );
};

const createStyles = (theme: AppTheme) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.background,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoWrap: {
    alignItems: 'center',
  },
  logo: {
    color: theme.primary,
    fontFamily: 'Bezoria-Reguler-Exfontfbf7',
    fontSize: 52,
    fontWeight: '400',
    letterSpacing: 1,
  },
  line: {
    width: 72,
    height: 2,
    marginVertical: 10,
    backgroundColor: theme.primary,
  },
  tagline: {
    color: theme.text,
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 4,
  },
  loading: {
    position: 'absolute',
    bottom: 44,
    color: theme.mutedText,
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 2,
  },
});

export default SplashScreen;
