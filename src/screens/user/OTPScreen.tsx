import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  StatusBar,
  KeyboardAvoidingView,
  Platform,
  Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RouteProp } from '@react-navigation/native';
import { RootStackParamList } from '../../../types/navigation';
import { useTheme } from '../../../context/ThemeContext';
import AppHeader from '../../components/AppHeader';
import AppAlert from '../../components/AppAlert';
import { AppTheme } from '../../theme/colors';

const COLORS = {
  primary: '#0A0A0A',
  secondary: '#C9A84C',
  accent: '#E84118',
  background: '#FAFAFA',      // soft off-white
  card: '#FFFFFF',            // pure white cards
  textPrimary: '#1A1A1A',
  textSecondary: '#6B6B6B',
  textMuted: '#9A9A9A',
  border: '#E5E5E5',
  white: '#FFFFFF',
};

type Props = {
  navigation: NativeStackNavigationProp<RootStackParamList, 'OTP'>;
  route: RouteProp<RootStackParamList, 'OTP'>;
};

const OTPScreen: React.FC<Props> = ({ navigation, route }) => {
  const { theme } = useTheme();
  const styles = createStyles(theme);
  const { email } = route.params;
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [alert, setAlert] = useState<{ title: string; message: string } | null>(null);
  const inputs = useRef<(TextInput | null)[]>([]);

  const handleChange = (text: string, index: number) => {
    if (text.length > 1) text = text.slice(-1);
    const newOtp = [...otp];
    newOtp[index] = text;
    setOtp(newOtp);

    if (text && index < 5) {
      inputs.current[index + 1]?.focus();
    }
  };

  const handleKeyPress = (e: any, index: number) => {
    if (e.nativeEvent.key === 'Backspace' && !otp[index] && index > 0) {
      inputs.current[index - 1]?.focus();
    }
  };

  const handleVerify = () => {
    const code = otp.join('');
    if (code.length !== 6) {
      setAlert({ title: 'Error', message: 'Please enter the 6-digit OTP' });
      return;
    }
    navigation.navigate('ResetPassword', { email, otp: code });
  };

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle={theme.statusBar} backgroundColor={theme.background} />
      <AppAlert visible={!!alert} title={alert?.title || ''} message={alert?.message || ''} onConfirm={() => setAlert(null)} />
      <AppHeader
        left={
          <TouchableOpacity
            accessibilityRole="button"
            accessibilityLabel="Go back"
            onPress={() => navigation.goBack()}
            style={styles.headerBack}
          >
            <Image
              source={require('../../asset/back_button.png')}
              style={styles.backImage}
              resizeMode="contain"
            />
          </TouchableOpacity>
        }
      />
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <View style={styles.container}>
          <Text style={styles.title}>Enter OTP</Text>
          <Text style={styles.subtitle}>
            We sent a 6-digit code to{'\n'}
            <Text style={{ color: COLORS.secondary }}>{email}</Text>
          </Text>

          <View style={styles.otpRow}>
            {otp.map((digit, index) => (
              <TextInput
                key={index}
                ref={(ref) => { inputs.current[index] = ref; }}
                style={styles.otpInput}
                value={digit}
                onChangeText={(text) => handleChange(text, index)}
                onKeyPress={(e) => handleKeyPress(e, index)}
                keyboardType="number-pad"
                maxLength={1}
                selectionColor={theme.primary}
              />
            ))}
          </View>

          <TouchableOpacity
            style={styles.goldButton}
            onPress={handleVerify}
            activeOpacity={0.85}
          >
            <Text style={styles.goldButtonText}>CONTINUE</Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const createStyles = (theme: AppTheme) => StyleSheet.create({
  safe: { flex: 1, backgroundColor: theme.background },
  flex: { flex: 1 },
  container: {
    flex: 1,
    paddingHorizontal: 26,
    paddingTop: 24,
  },
  headerBack: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  backImage: { width: 20, height: 20, tintColor: theme.primary },
  title: {
    fontSize: 28,
    fontWeight: '800',
    color: theme.text,
    marginBottom: 10,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 14,
    color: theme.mutedText,
    lineHeight: 22,
    textAlign: 'center',
    marginBottom: 36,
  },
  otpRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 36,
  },
  otpInput: {
    width: 48,
    height: 56,
    backgroundColor: theme.card,
    borderWidth: 1.5,
    borderColor: theme.border,
    borderRadius: 12,
    textAlign: 'center',
    fontSize: 22,
    fontWeight: '700',
    color: theme.text,
  },
  goldButton: {
    backgroundColor: theme.primary,
    borderRadius: 14,
    paddingVertical: 17,
    alignItems: 'center',
  },
  goldButtonText: {
    color: theme.text,
    fontSize: 15,
    fontWeight: '800',
    letterSpacing: 1.6,
  },
});

export default OTPScreen;
