import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  StatusBar,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../../types/navigation';
import { useTheme } from '../../../context/ThemeContext';
import AppHeader from '../../components/AppHeader';
import AppAlert from '../../components/AppAlert';
import { AppTheme } from '../../theme/theme';
import { authApi } from '../../../api/auth';

type Props = {
  navigation: NativeStackNavigationProp<RootStackParamList, 'ForgotPassword'>;
};

const ForgotPasswordScreen: React.FC<Props> = ({ navigation }) => {
  const { theme } = useTheme();
  const styles = createStyles(theme);
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [alert, setAlert] = useState<{
    title: string;
    message: string;
    onConfirm?: () => void;
  } | null>(null);

  const handleSendOtp = async () => {
    if (!email.trim()) {
      setAlert({ title: 'Error', message: 'Please enter your email' });
      return;
    }

    setLoading(true);
    try {
      const res = await authApi.forgotPassword(email.trim());
      setAlert({
        title: 'OTP Sent',
        message: res.message || 'OTP sent to your registered email.',
        onConfirm: () => navigation.navigate('OTP', { email: email.trim() }),
      });
    } catch (err: any) {
      setAlert({
        title: 'Error',
        message: err.message || 'Failed to send OTP',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar
        barStyle={theme.statusBar}
        backgroundColor={theme.background}
      />
      <AppAlert
        visible={!!alert}
        title={alert?.title || ''}
        message={alert?.message || ''}
        onConfirm={() => {
          const action = alert?.onConfirm;
          setAlert(null);
          action?.();
        }}
      />
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
        <ScrollView
          contentContainerStyle={styles.scroll}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.header}>
            <Text style={styles.title}>Forgot Password?</Text>
            <Text style={styles.subtitle}>
              Enter your registered email and we’ll send you a 6-digit OTP code
              to reset your password.
            </Text>
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>Email Address</Text>
            <TextInput
              style={styles.input}
              placeholder="your@email.com"
              placeholderTextColor={theme.mutedText}
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              selectionColor={theme.primary}
            />
          </View>

          <TouchableOpacity
            style={[styles.goldButton, loading && { opacity: 0.7 }]}
            onPress={handleSendOtp}
            activeOpacity={0.85}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#FFFFFF" />
            ) : (
              <Text style={styles.goldButtonText}>SEND OTP</Text>
            )}
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const createStyles = (theme: AppTheme) =>
  StyleSheet.create({
    safe: { flex: 1, backgroundColor: theme.background },
    flex: { flex: 1 },
    scroll: {
      flexGrow: 1,
      paddingHorizontal: 26,
      paddingTop: 24,
      paddingBottom: 40,
    },
    headerBack: {
      width: 40,
      height: 40,
      alignItems: 'center',
      justifyContent: 'center',
    },
    backImage: {
      width: 24,
      height: 24,
      tintColor: theme.primary,
    },
    headerBackText: { color: theme.primary, fontSize: 28, fontWeight: '400' },
    header: { marginBottom: 32 },
    title: {
      fontSize: 28,
      fontWeight: '800',
      color: theme.text,
      marginBottom: 10,
    },
    subtitle: {
      fontSize: 14,
      color: theme.mutedText,
      lineHeight: 22,
    },
    inputContainer: { marginBottom: 18 },
    inputLabel: {
      fontSize: 12,
      fontWeight: '700',
      color: theme.mutedText,
      marginBottom: 8,
      letterSpacing: 0.8,
      textTransform: 'uppercase',
    },
    input: {
      backgroundColor: theme.card,
      borderWidth: 1.5,
      borderColor: theme.border,
      borderRadius: 14,
      paddingHorizontal: 18,
      paddingVertical: 15,
      fontSize: 16,
      color: theme.text,
    },
    goldButton: {
      backgroundColor: theme.primary,
      borderRadius: 14,
      paddingVertical: 17,
      alignItems: 'center',
      marginTop: 12,
    },
    goldButtonText: {
      color: '#FFFFFF',
      fontSize: 15,
      fontWeight: '800',
      letterSpacing: 1.6,
    },
  });

export default ForgotPasswordScreen;
