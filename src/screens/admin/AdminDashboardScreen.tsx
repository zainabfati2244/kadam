import React from 'react';
import { View, Text, ScrollView, StyleSheet, ActivityIndicator, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '../../../context/AuthContext';
import { useTheme } from '../../../context/ThemeContext';
import { AppTheme } from '../../theme/theme';
import { adminApi } from '../../services/adminApi';
import { getLocalOrders } from '../../services/localOrderStore';
import { addLocalOrdersToOverview, mergeRecentOrders, mergeTopCustomers } from '../../services/adminDashboardData';
import AppHeader from '../../components/AppHeader';

export default function AdminDashboardScreen() {
  const { token, currentRole, forceRole, setForceRole } = useAuth();
  const { theme } = useTheme();
  const styles = createStyles(theme);

  const overviewQuery = useQuery({
    queryKey: ['admin-overview'],
    queryFn: () => adminApi.getDashboardOverview(token || ''),
    enabled: !!token,
    retry: 1,
  });

  const salesQuery = useQuery({
    queryKey: ['admin-sales'],
    queryFn: () => adminApi.getSales(token || '', 'weekly'),
    enabled: !!token,
    retry: 1,
  });

  const topProductsQuery = useQuery({
    queryKey: ['admin-top-products'],
    queryFn: () => adminApi.getTopProducts(token || ''),
    enabled: !!token,
    retry: 1,
  });

  const recentOrdersQuery = useQuery({
    queryKey: ['admin-recent-orders'],
    queryFn: () => adminApi.getRecentOrders(token || ''),
    enabled: !!token,
    retry: 1,
  });

  const topCustomersQuery = useQuery({
    queryKey: ['admin-top-customers'],
    queryFn: () => adminApi.getTopCustomers(token || ''),
    enabled: !!token,
    retry: 1,
  });

  const localOrdersQuery = useQuery({
    queryKey: ['admin-local-orders'],
    queryFn: getLocalOrders,
    enabled: !!token,
  });

  const loading = overviewQuery.isLoading || salesQuery.isLoading || topProductsQuery.isLoading || recentOrdersQuery.isLoading || topCustomersQuery.isLoading || localOrdersQuery.isLoading;
  const error = overviewQuery.error || salesQuery.error || topProductsQuery.error || recentOrdersQuery.error || topCustomersQuery.error || localOrdersQuery.error;

  if (!token) {
    return (
      <View style={styles.center}>
        <Text style={styles.title}>Admin session missing</Text>
      </View>
    );
  }

  if (loading) {
    return <View style={styles.center}><ActivityIndicator color={theme.primary} /></View>;
  }

  if (error) {
    return (
      <View style={styles.center}>
        <Text style={styles.title}>Dashboard unavailable</Text>
        <Text style={styles.muted}>{error instanceof Error ? error.message : 'Unable to load dashboard data.'}</Text>
      </View>
    );
  }

  const localOrders = localOrdersQuery.data || [];
  const overview = addLocalOrdersToOverview(overviewQuery.data, localOrders);
  const sales = Array.isArray(salesQuery.data) ? salesQuery.data : [];
  const products = Array.isArray(topProductsQuery.data) ? topProductsQuery.data : [];
  const orders = mergeRecentOrders(Array.isArray(recentOrdersQuery.data) ? recentOrdersQuery.data : [], localOrders).slice(0, 5);
  const customers = mergeTopCustomers(Array.isArray(topCustomersQuery.data) ? topCustomersQuery.data : [], localOrders).slice(0, 5);
  const maxSalesValue = Math.max(...sales.map((item) => item.value || 0), 1);

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <AppHeader />

      <ScrollView style={styles.scroll} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <Text style={styles.title}>Dashboard</Text>

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
            <TouchableOpacity onPress={() => setForceRole(null)} style={[styles.roleButton, !forceRole && styles.roleButtonActive]}>
              <Text style={[styles.roleButtonText, !forceRole && styles.roleButtonTextActive]}>Auto</Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.grid}>
          {[{ label: 'Total Sales', value: `PKR ${overview.totalSales.toLocaleString()}` }, { label: 'Orders', value: `${overview.totalOrders}` }, { label: 'Customers', value: `${overview.totalCustomers}` }, { label: 'Conversion', value: `${overview.conversionRate}%` }].map((item) => (
            <View key={item.label} style={styles.card}>
              <Text style={styles.cardLabel}>{item.label}</Text>
              <Text style={styles.cardValue}>{item.value}</Text>
            </View>
          ))}
        </View>

        <View style={styles.sectionCard}>
          <Text style={styles.sectionTitle}>Sales Overview</Text>
          <View style={styles.chartRow}>
            {sales.map((item) => (
              <View key={item.label} style={styles.barWrap}>
                <View style={[styles.bar, { height: Math.max((item.value / maxSalesValue) * 120, 20), backgroundColor: theme.primary }]} />
                <Text style={styles.barLabel}>{item.label}</Text>
              </View>
            ))}
          </View>
        </View>

        <View style={styles.sectionCard}>
          <Text style={styles.sectionTitle}>Top Products</Text>
          {products.map((product) => (
            <View key={product.name} style={styles.listRow}>
              <Text style={styles.listText}>{product.name}</Text>
              <Text style={styles.muted}>{product.sales ?? 0} sales</Text>
            </View>
          ))}
        </View>

        <View style={styles.sectionCard}>
          <Text style={styles.sectionTitle}>Recent Orders</Text>
          {orders.map((order) => (
            <View key={order.id} style={styles.listRow}>
              <View>
                <Text style={styles.listText}>{order.customerName || 'Customer'}</Text>
                <Text style={styles.muted}>{new Date(order.createdAt).toLocaleDateString()}</Text>
              </View>
              <Text style={styles.muted}>PKR {order.total.toLocaleString()}</Text>
            </View>
          ))}
        </View>

        <View style={styles.sectionCard}>
          <Text style={styles.sectionTitle}>Top Customers</Text>
          {customers.map((customer) => (
            <View key={customer.id} style={styles.listRow}>
              <View>
                <Text style={styles.listText}>{customer.name}</Text>
                <Text style={styles.muted}>{customer.email}</Text>
              </View>
              <Text style={styles.muted}>PKR {customer.totalSpent}</Text>
            </View>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const createStyles = (theme: AppTheme) => StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.background },
  scroll: { flex: 1 },
  content: { padding: 16, paddingBottom: 32 },
  title: { color: theme.text, fontSize: 28, fontWeight: '800', marginBottom: 16 },
  roleCard: { backgroundColor: theme.card, borderRadius: 16, padding: 14, borderWidth: 1, borderColor: theme.border, marginBottom: 16 },
  roleTitle: { color: theme.text, fontSize: 14, fontWeight: '800' },
  roleMeta: { color: theme.mutedText, fontSize: 12, marginTop: 4 },
  roleRow: { flexDirection: 'row', marginTop: 10 },
  roleButton: { flex: 1, borderWidth: 1, borderColor: theme.border, borderRadius: 10, paddingVertical: 8, alignItems: 'center', marginRight: 8 },
  roleButtonActive: { backgroundColor: theme.primary, borderColor: theme.primary },
  roleButtonText: { color: theme.text, fontSize: 12, fontWeight: '700' },
  roleButtonTextActive: { color: '#fff' },
  sectionBadge: { color: theme.primary, fontSize: 12, fontWeight: '800', letterSpacing: 1, textTransform: 'uppercase' },
  panelLabel: { color: theme.text, fontSize: 12, fontWeight: '700' },
  grid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', marginBottom: 16 },
  card: { width: '48%', backgroundColor: theme.card, borderRadius: 16, padding: 16, marginBottom: 12, borderWidth: 1, borderColor: theme.border },
  cardLabel: { color: theme.mutedText, fontSize: 12, fontWeight: '600', textTransform: 'uppercase', letterSpacing: 0.4 },
  cardValue: { color: theme.text, fontSize: 24, fontWeight: '800', marginTop: 10 },
  sectionCard: { backgroundColor: theme.card, borderRadius: 16, padding: 16, borderWidth: 1, borderColor: theme.border, marginBottom: 16 },
  sectionTitle: { color: theme.text, fontSize: 18, fontWeight: '800', marginBottom: 12 },
  chartRow: { flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'space-between', minHeight: 150 },
  barWrap: { flex: 1, alignItems: 'center', paddingHorizontal: 4 },
  bar: { width: '70%', borderRadius: 10, minHeight: 20 },
  barLabel: { color: theme.mutedText, fontSize: 10, marginTop: 8, fontWeight: '700' },
  listRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: theme.border },
  listText: { color: theme.text, fontSize: 14, fontWeight: '700' },
  muted: { color: theme.mutedText, fontSize: 12, fontWeight: '600' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: theme.background },
});
