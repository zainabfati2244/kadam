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
import { RouteProp } from '@react-navigation/native';
import { RootStackParamList } from '../../../types/navigation';
import { useTheme } from '../../../context/ThemeContext';
import AppHeader from '../../components/AppHeader';
import AppAlert from '../../components/AppAlert';
import { AppTheme } from '../../theme/theme';
import { authApi } from '../../../api/auth';

type Props = {
  navigation: NativeStackNavigationProp<RootStackParamList, 'ResetPassword'>;
  route: RouteProp<RootStackParamList, 'ResetPassword'>;
};

const ResetPasswordScreen: React.FC<Props> = ({ navigation, route }) => {
  const { theme } = useTheme();
  const styles = createStyles(theme);
  const { email, otp } = route.params;

  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [alert, setAlert] = useState<{ title: string; message: string; onConfirm?: () => void } | null>(null);

  const handleReset = async () => {
    if (!password || !confirm) {
      setAlert({ title: 'Error', message: 'Please fill both password fields' });
      return;
    }
    if (password.length < 6) {
      setAlert({ title: 'Error', message: 'Password must be at least 6 characters' });
      return;
    }
    if (password !== confirm) {
      setAlert({ title: 'Error', message: 'Passwords do not match' });
      return;
    }

    setLoading(true);
    try {
      const res = await authApi.resetPassword(email, password, otp);
      setAlert({
        title: 'Success 🎉',
        message: res.message || 'Password updated successfully!',
        onConfirm: () => navigation.replace('SignIn'),
      });
    } catch (err: any) {
      setAlert({
        title: 'Reset Error',
        message: err.message || 'Invalid or expired OTP code.',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle={theme.statusBar} backgroundColor={theme.background} />
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
            <Text style={styles.title}>Create New Password</Text>
            <Text style={styles.subtitle}>
              Enter a new password for account <Text style={styles.bold}>{email}</Text>
            </Text>
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>New Password</Text>
            <View style={styles.passwordField}>
              <TextInput
                style={styles.passwordInput}
                placeholder="Min 6 characters"
                placeholderTextColor={theme.mutedText}
                value={password}
                onChangeText={setPassword}
                secureTextEntry={!showPassword}
                selectionColor={theme.primary}
              />
              <TouchableOpacity
                accessibilityRole="button"
                accessibilityLabel={showPassword ? 'Hide password' : 'Show password'}
                onPress={() => setShowPassword((v) => !v)}
                style={styles.eyeButton}
              >
                <Image
                  source={
                    showPassword
                      ? require('../../asset/hide.png')
                      : require('../../asset/view.png')
                  }
                  style={styles.eye}
                />
              </TouchableOpacity>
            </View>
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>Confirm New Password</Text>
            <View style={styles.passwordField}>
              <TextInput
                style={styles.passwordInput}
                placeholder="Repeat new password"
                placeholderTextColor={theme.mutedText}
                value={confirm}
                onChangeText={setConfirm}
                secureTextEntry={!showConfirm}
                selectionColor={theme.primary}
              />
              <TouchableOpacity
                accessibilityRole="button"
                accessibilityLabel={showConfirm ? 'Hide password' : 'Show password'}
                onPress={() => setShowConfirm((v) => !v)}
                style={styles.eyeButton}
              >
                <Image
                  source={
                    showConfirm
                      ? require('../../asset/hide.png')
                      : require('../../asset/view.png')
                  }
                  style={styles.eye}
                />
              </TouchableOpacity>
            </View>
          </View>

          <TouchableOpacity
            style={[styles.goldButton, loading && { opacity: 0.7 }]}
            onPress={handleReset}
            activeOpacity={0.85}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#FFFFFF" />
            ) : (
              <Text style={styles.goldButtonText}>RESET PASSWORD</Text>
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
    backImage: { width: 20, height: 20, tintColor: theme.primary },
    header: { marginBottom: 28 },
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
    bold: {
      color: theme.primary,
      fontWeight: '700',
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
    passwordField: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: theme.card,
      borderWidth: 1.5,
      borderColor: theme.border,
      borderRadius: 14,
    },
    passwordInput: {
      flex: 1,
      paddingLeft: 18,
      paddingVertical: 15,
      fontSize: 16,
      color: theme.text,
    },
    eyeButton: {
      width: 56,
      height: 50,
      alignItems: 'center',
      justifyContent: 'center',
    },
    eye: { width: 22, height: 22, tintColor: theme.primary },
    goldButton: {
      backgroundColor: theme.primary,
      borderRadius: 14,
      paddingVertical: 17,
      alignItems: 'center',
      marginTop: 8,
    },
    goldButtonText: {
      color: '#FFFFFF',
      fontSize: 15,
      fontWeight: '800',
      letterSpacing: 1.6,
    },
  });

export default ResetPasswordScreen;
