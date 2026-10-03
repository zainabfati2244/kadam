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
import ThemeToggle from '../../components/ThemeToggle';
import { AppTheme } from '../../theme/theme';
import AppAlert from '../../components/AppAlert';
import { useAuth } from '../../../context/AuthContext';

type Props = {
  navigation: NativeStackNavigationProp<RootStackParamList, 'SignIn'>;
};

const SignInScreen: React.FC<Props> = ({ navigation }) => {
  const { theme } = useTheme();
  const styles = createStyles(theme);
  const { login } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [alert, setAlert] = useState<{ title: string; message: string } | null>(
    null,
  );

  const handleLogin = async () => {
    if (!email.trim() || !password.trim()) {
      setAlert({ title: 'Error', message: 'Please enter email and password' });
      return;
    }

    setLoading(true);
    try {
      await login(email.trim(), password);
    } catch (err: any) {
      setAlert({
        title: 'Login Failed',
        message:
          err.message || 'Incorrect email or password. Please try again.',
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
        onConfirm={() => setAlert(null)}
      />
      <ThemeToggle />
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
            <Text style={styles.title}>Welcome Back</Text>
            <Text style={styles.subtitle}>
              Sign in to access exclusive drops & limited editions
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
                placeholder="Enter your password"
                placeholderTextColor={theme.mutedText}
                value={password}
                onChangeText={setPassword}
                secureTextEntry={!showPassword}
                selectionColor={theme.primary}
              />
              <TouchableOpacity
                accessibilityRole="button"
                accessibilityLabel={
                  showPassword ? 'Hide password' : 'Show password'
                }
                onPress={() => setShowPassword(v => !v)}
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

          <TouchableOpacity
            onPress={() => navigation.navigate('ForgotPassword')}
            style={styles.forgot}
          >
            <Text style={styles.forgotText}>Forgot Password?</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.goldButton, loading && { opacity: 0.7 }]}
            onPress={handleLogin}
            activeOpacity={0.85}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#FFFFFF" />
            ) : (
              <Text style={styles.goldButtonText}>SIGN IN</Text>
            )}
          </TouchableOpacity>

          <View style={styles.divider}>
            <View style={styles.line} />
            <Text style={styles.or}>OR</Text>
            <View style={styles.line} />
          </View>

          <TouchableOpacity
            style={styles.outlineButton}
            onPress={() => navigation.navigate('SignUp')}
            activeOpacity={0.8}
          >
            <Text style={styles.outlineButtonText}>CREATE ACCOUNT</Text>
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
      paddingTop: 30,
      paddingBottom: 40,
    },
    logoWrap: { alignItems: 'center', marginBottom: 40 },
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
    header: { marginBottom: 32 },
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
    forgot: { alignSelf: 'flex-end', marginBottom: 24, marginTop: -4 },
    forgotText: { color: theme.primary, fontSize: 13, fontWeight: '600' },
    goldButton: {
      backgroundColor: theme.primary,
      borderRadius: 14,
      paddingVertical: 17,
      alignItems: 'center',
      marginBottom: 8,
    },
    goldButtonText: {
      color: '#FFFFFF',
      fontSize: 15,
      fontWeight: '800',
      letterSpacing: 1.6,
    },
    divider: {
      flexDirection: 'row',
      alignItems: 'center',
      marginVertical: 26,
    },
    line: { flex: 1, height: 1, backgroundColor: theme.border },
    or: {
      color: theme.mutedText,
      fontSize: 12,
      fontWeight: '600',
      marginHorizontal: 16,
    },
    outlineButton: {
      borderWidth: 1.5,
      borderColor: theme.primary,
      borderRadius: 14,
      paddingVertical: 16,
      alignItems: 'center',
    },
    outlineButtonText: {
      color: theme.primary,
      fontSize: 15,
      fontWeight: '700',
      letterSpacing: 1.3,
    },
  });

export default SignInScreen;
