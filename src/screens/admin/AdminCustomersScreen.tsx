import React, { useMemo, useState } from 'react';
import { View, Text, StyleSheet, FlatList, TextInput, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '../../../context/AuthContext';
import { useTheme } from '../../../context/ThemeContext';
import { adminApi } from '../../services/adminApi';
import { AppTheme } from '../../theme/theme';
import AppHeader from '../../components/AppHeader';

export default function AdminCustomersScreen() {
  const { token } = useAuth();
  const { theme } = useTheme();
  const styles = createStyles(theme);
  const [search, setSearch] = useState('');

  const customersQuery = useQuery({
    queryKey: ['admin-customers'],
    queryFn: () => adminApi.getCustomers(token || ''),
    enabled: !!token,
    retry: 1,
  });

  const filteredCustomers = useMemo(() => {
    const source = customersQuery.data || [];
    if (!search.trim()) return source;
    return source.filter((customer) =>
      customer.name.toLowerCase().includes(search.toLowerCase()) ||
      customer.email.toLowerCase().includes(search.toLowerCase())
    );
  }, [customersQuery.data, search]);

  if (!token) {
    return <View style={styles.center}><Text style={styles.title}>Admin session missing</Text></View>;
  }

  if (customersQuery.isLoading) {
    return <View style={styles.center}><ActivityIndicator color={theme.primary} /></View>;
  }

  if (customersQuery.error) {
    return (
      <View style={styles.center}>
        <Text style={styles.title}>Customers unavailable</Text>
        <Text style={styles.meta}>{customersQuery.error instanceof Error ? customersQuery.error.message : 'Unable to load customers.'}</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <AppHeader
        left={<Text style={styles.sectionBadge}>Admin</Text>}
        right={<Text style={styles.panelLabel}>Customers</Text>}
      />

      <View style={styles.content}>
        <Text style={styles.title}>Customers</Text>
        <TextInput
          value={search}
          onChangeText={setSearch}
          placeholder="Search customers"
          placeholderTextColor={theme.mutedText}
          style={styles.searchInput}
        />
        <FlatList
          data={filteredCustomers}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
          renderItem={({ item }) => (
            <View style={styles.card}>
              <Text style={styles.name}>{item.name}</Text>
              <Text style={styles.meta}>{item.email}</Text>
              <Text style={styles.meta}>Orders: {item.orders}</Text>
              <Text style={styles.meta}>Spent: PKR {item.totalSpent}</Text>
              <Text style={styles.meta}>Joined: {item.joinedAt || 'Recently'}</Text>
            </View>
          )}
        />
      </View>
    </SafeAreaView>
  );
}

const createStyles = (theme: AppTheme) => StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.background },
  content: { flex: 1, padding: 16 },
  title: { color: theme.text, fontSize: 28, fontWeight: '800', marginBottom: 12 },
  sectionBadge: { color: theme.primary, fontSize: 12, fontWeight: '800', letterSpacing: 1, textTransform: 'uppercase' },
  panelLabel: { color: theme.text, fontSize: 12, fontWeight: '700' },
  searchInput: {
    backgroundColor: theme.card,
    color: theme.text,
    borderRadius: 16,
    paddingHorizontal: 14,
    paddingVertical: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: theme.border,
  },
  card: { backgroundColor: theme.card, borderRadius: 16, padding: 16, marginBottom: 12, borderWidth: 1, borderColor: theme.border },
  name: { color: theme.text, fontSize: 18, fontWeight: '700' },
  meta: { color: theme.mutedText, marginTop: 4, fontWeight: '600' },
  listContent: { paddingBottom: 24 },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: theme.background, padding: 16 },
});
