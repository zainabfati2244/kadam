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
import { AppTheme } from '../../theme/theme';
import AppAlert from '../../components/AppAlert';
import { authApi } from '../../../api/auth';

type Props = {
  navigation: NativeStackNavigationProp<RootStackParamList, 'SignUp'>;
};

const SignUpScreen: React.FC<Props> = ({ navigation }) => {
  const { theme } = useTheme();
  const styles = createStyles(theme);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [alert, setAlert] = useState<{ title: string; message: string; onConfirm?: () => void } | null>(null);

  const handleRegister = async () => {
    if (!email.trim() || !password.trim()) {
      setAlert({ title: 'Error', message: 'Please fill all required fields' });
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
      const res = await authApi.register(email.trim(), password);
      setAlert({
        title: 'Success',
        message: res.message || 'Account created successfully! Please sign in.',
        onConfirm: () => navigation.replace('SignIn'),
      });
    } catch (err: any) {
      setAlert({
        title: 'Registration Failed',
        message: err.message || 'Email already registered or registration error.',
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
      <TouchableOpacity
        accessibilityRole="button"
        accessibilityLabel="Go back"
        onPress={() => navigation.goBack()}
        style={styles.backBtn}
      >
        <Image
          source={require('../../asset/back_button.png')}
          style={styles.backImage}
          resizeMode="contain"
        />
      </TouchableOpacity>
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView
          contentContainerStyle={styles.scroll}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.logoWrap}>
            <Text style={styles.logoMain}>Kadam</Text>
            <View style={styles.logoLine} />
          </View>

          <View style={styles.header}>
            <Text style={styles.title}>Join the Elite</Text>
            <Text style={styles.subtitle}>
              Create your account and unlock exclusive access
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

          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>Password</Text>
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
            <Text style={styles.inputLabel}>Confirm Password</Text>
            <View style={styles.passwordField}>
              <TextInput
                style={styles.passwordInput}
                placeholder="Repeat password"
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
            onPress={handleRegister}
            activeOpacity={0.85}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#FFFFFF" />
            ) : (
              <Text style={styles.goldButtonText}>CREATE ACCOUNT</Text>
            )}
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => navigation.navigate('SignIn')}
            style={styles.bottomLink}
          >
            <Text style={styles.bottomText}>
              Already have an account? <Text style={styles.gold}>Sign In</Text>
            </Text>
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const createStyles = (theme: AppTheme) =>
  StyleSheet.create({
    safe: { flex: 1, backgroundColor: theme.background },
    backBtn: {
      paddingHorizontal: 20,
      paddingTop: 12,
      paddingBottom: 4,
      width: 60,
    },
    backImage: {
      width: 24,
      height: 24,
      tintColor: theme.primary,
    },
    flex: { flex: 1 },
    scroll: {
      flexGrow: 1,
      paddingHorizontal: 26,
      paddingTop: 24,
      paddingBottom: 40,
    },
    logoWrap: { alignItems: 'center', marginBottom: 32 },
    logoMain: {
      fontFamily: 'Bezoria-Reguler-Exfontfbf7',
      fontSize: 48,
      fontWeight: '400',
      color: theme.primary,
      letterSpacing: 1,
    },
    logoLine: {
      width: 56,
      height: 2,
      backgroundColor: theme.primary,
      marginVertical: 6,
      opacity: 0.7,
    },
    header: { marginBottom: 28 },
    title: {
      fontSize: 30,
      fontWeight: '800',
      color: theme.text,
      marginBottom: 8,
    },
    subtitle: {
      fontSize: 14,
      color: theme.mutedText,
      lineHeight: 21,
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
    bottomLink: { marginTop: 28, alignItems: 'center' },
    bottomText: { color: theme.mutedText, fontSize: 14 },
    gold: { color: theme.primary, fontWeight: '700' },
  });

export default SignUpScreen;
