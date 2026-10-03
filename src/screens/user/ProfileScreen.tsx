import React, { useEffect, useState } from 'react';
import {
 
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Image,
  StatusBar,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { RootStackParamList } from '../../../types/navigation';
import { useTheme } from '../../../context/ThemeContext';
import { AppTheme } from '../../theme/colors';
import AppHeader from '../../components/AppHeader';
import AppAlert from '../../components/AppAlert';
import { useAuth } from '../../../context/AuthContext';

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

const MENU = [
  { id: '1', title: 'My Orders', icon: '📦' },
  { id: '2', title: 'Shipping Address', icon: '📍' },
  { id: '3', title: 'Payment Methods', icon: '💳' },
  { id: '4', title: 'Notifications', icon: '🔔' },
  
];

const ProfileScreen = () => {
  const { theme } = useTheme();
  const styles = createStyles(theme);
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const [showLogoutAlert, setShowLogoutAlert] = useState(false);
  const [storedEmail, setStoredEmail] = useState<string | null>(null);
  const { user, currentRole, forceRole, setForceRole, logout } = useAuth();

  useEffect(() => {
    AsyncStorage.getItem('email').then(setStoredEmail).catch(() => setStoredEmail(null));
  }, []);

  // Google/Firebase values always take priority. The fallback keeps the existing
  // email/password flow showing the same account that was used at sign-in.
  const profileEmail = user?.email || storedEmail || 'Not signed in';
  const profileName = user?.name || (storedEmail ? storedEmail.split('@')[0] : 'Kadam User');

  const handleLogout = () => {
    setShowLogoutAlert(true);
  };

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle={theme.statusBar} backgroundColor={theme.background} />
      <AppAlert
        visible={showLogoutAlert}
        title="Logout"
        message="Are you sure you want to logout?"
        cancelText="Cancel"
        confirmText="Logout"
        onCancel={() => setShowLogoutAlert(false)}
        onConfirm={async () => {
          setShowLogoutAlert(false);
          await logout();
          await AsyncStorage.removeItem('token');
        }}
      />
      <AppHeader />

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Profile Header */}
        <View style={styles.header}>
          <View style={styles.avatar}>{user?.photo ? <Image source={{ uri: user.photo }} style={styles.avatarImage} /> : <Text style={styles.avatarText}>{profileName.charAt(0).toUpperCase()}</Text>}</View>
          <Text style={styles.name}>{profileName}</Text>
          <Text style={styles.email}>{profileEmail}</Text>
        </View>

        {/* Menu */}
        <View style={styles.menuCard}>
          {MENU.map((item, index) => (
            <TouchableOpacity
              key={item.id}
              style={[
                styles.menuItem,
                index === MENU.length - 1 && { borderBottomWidth: 0 },
              ]}
              activeOpacity={0.7}
              onPress={() => item.title === 'My Orders' ? navigation.navigate('MyOrders') : item.title === 'Shipping Address' ? navigation.navigate('ShippingAddress') : item.title === 'Notifications' ? navigation.navigate('Notifications') : undefined}
            >
              <Text style={styles.menuIcon}>{item.icon}</Text>
              <Text style={styles.menuTitle}>{item.title}</Text>
              <Text style={styles.arrow}>›</Text>
            </TouchableOpacity>
          ))}
        </View>

        <View style={styles.roleCard}>
          <Text style={styles.roleTitle}>Development role switch</Text>
          <Text style={styles.roleMeta}>Current: {currentRole}{forceRole ? ' (forced)' : ''}</Text>
          <View style={styles.roleRow}>
            {(['customer', 'admin'] as const).map((nextRole) => (
              <TouchableOpacity
                key={nextRole}
                onPress={() => setForceRole(nextRole)}
                style={[styles.roleButton, currentRole === nextRole && styles.roleButtonActive]}
              >
                <Text style={[styles.roleButtonText, currentRole === nextRole && styles.roleButtonTextActive]}>
                  {nextRole === 'customer' ? 'User' : 'Admin'}
                </Text>
              </TouchableOpacity>
            ))}
            <TouchableOpacity
              onPress={() => setForceRole(null)}
              style={[styles.roleButton, !forceRole && styles.roleButtonActive]}
            >
              <Text style={[styles.roleButtonText, !forceRole && styles.roleButtonTextActive]}>Auto</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Logout */}
        <TouchableOpacity
          style={styles.logoutBtn}
          onPress={handleLogout}
          activeOpacity={0.85}
        >
          <Text style={styles.logoutText}>LOGOUT</Text>
        </TouchableOpacity>

        <Text style={styles.version}>Kadam v1.0.0</Text>
      </ScrollView>
    </SafeAreaView>
  );
};

const createStyles = (theme: AppTheme) => StyleSheet.create({
  safe: { flex: 1, backgroundColor: theme.background },
  header: {
    alignItems: 'center',
    paddingTop: 30,
    paddingBottom: 28,
    backgroundColor: theme.background,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: theme.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 14,
  },
  avatarText: {
    fontSize: 32,
    fontWeight: '900',
    color: theme.text,
  },
  avatarImage: { width: 80, height: 80, borderRadius: 40 },
  name: {
    color: theme.text,
    fontSize: 20,
    fontWeight: '800',
    marginBottom: 4,
  },
  email: {
    color: theme.mutedText,
    fontSize: 13,
  },
  menuCard: {
    marginHorizontal: 20,
    marginTop: 24,
    backgroundColor: theme.card,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: theme.border,
    overflow: 'hidden',
  },
  roleCard: {
    marginHorizontal: 20,
    marginTop: 18,
    padding: 16,
    backgroundColor: theme.card,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: theme.border,
  },
  roleTitle: { color: theme.text, fontSize: 15, fontWeight: '800' },
  roleMeta: { color: theme.mutedText, fontSize: 12, marginTop: 5 },
  roleRow: { flexDirection: 'row', marginTop: 12 },
  roleButton: { flex: 1, borderWidth: 1, borderColor: theme.border, borderRadius: 10, paddingVertical: 9, alignItems: 'center', marginRight: 8 },
  roleButtonActive: { backgroundColor: theme.primary, borderColor: theme.primary },
  roleButtonText: { color: theme.text, fontSize: 12, fontWeight: '700' },
  roleButtonTextActive: { color: '#fff' },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 18,
    borderBottomWidth: 1,
    borderBottomColor: theme.border,
  },
  menuIcon: { fontSize: 18, marginRight: 14 },
  menuTitle: {
    flex: 1,
    color: theme.text,
    fontSize: 15,
    fontWeight: '600',
  },
  arrow: {
    color: theme.mutedText,
    fontSize: 22,
  },
  logoutBtn: {
    marginHorizontal: 20,
    marginTop: 28,
    backgroundColor: 'transparent',
    borderWidth: 1.5,
    borderColor: COLORS.accent,
    borderRadius: 14,
    paddingVertical: 15,
    alignItems: 'center',
  },
  logoutText: {
    color: COLORS.accent,
    fontSize: 14,
    fontWeight: '800',
    letterSpacing: 1.5,
  },
  version: {
    textAlign: 'center',
    color: theme.mutedText,
    fontSize: 12,
    marginTop: 24,
    marginBottom: 40,
  },
});

export default ProfileScreen;
