import React, { useMemo, useState } from 'react';
import { View, Text, StyleSheet, FlatList, ActivityIndicator, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { NavigationProp, useNavigation } from '@react-navigation/native';
import { useAuth } from '../../../context/AuthContext';
import { useTheme } from '../../../context/ThemeContext';
import { adminApi, AdminOrder, AdminOrderStatus } from '../../services/adminApi';
import { AppTheme } from '../../theme/theme';
import { RootStackParamList } from '../../../types/navigation';
import AppHeader from '../../components/AppHeader';
import { getLocalOrders, updateLocalOrderStatus } from '../../services/localOrderStore';

const ORDER_STATUS_OPTIONS: AdminOrderStatus[] = ['Pending', 'Confirmed', 'Shipped', 'Delivered', 'Cancelled'];

export default function AdminOrdersScreen() {
  const { token } = useAuth();
  const { theme } = useTheme();
  const styles = createStyles(theme);
  const queryClient = useQueryClient();
  const navigation = useNavigation<NavigationProp<RootStackParamList>>();
  const [activeFilter, setActiveFilter] = useState<'All' | AdminOrderStatus>('All');

  const ordersQuery = useQuery({
    queryKey: ['admin-orders'],
    queryFn: async () => {
      const [remoteOrders, localOrders] = await Promise.all([
        adminApi.getOrders(token || '').catch(() => [] as AdminOrder[]),
        getLocalOrders(),
      ]);
      return [...localOrders, ...remoteOrders];
    },
    enabled: !!token,
    retry: 1,
    refetchInterval: 5000,
  });

  const updateStatusMutation = useMutation({
    mutationFn: ({ orderId, status }: { orderId: string; status: AdminOrderStatus }) => {
      if (orderId.startsWith('local-')) return updateLocalOrderStatus(orderId, status);
      return adminApi.updateOrderStatus(token || '', orderId, status);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-orders'] });
      queryClient.invalidateQueries({ queryKey: ['admin-recent-orders'] });
    },
  });

  const visibleOrders = useMemo(() => {
    const source = ordersQuery.data || [];
    if (activeFilter === 'All') return source;
    return source.filter((order) => order.status === activeFilter);
  }, [ordersQuery.data, activeFilter]);

  if (!token) {
    return <View style={styles.center}><Text style={styles.title}>Admin session missing</Text></View>;
  }

  if (ordersQuery.isLoading) {
    return <View style={styles.center}><ActivityIndicator color={theme.primary} /></View>;
  }

  if (ordersQuery.error) {
    return (
      <View style={styles.center}>
        <Text style={styles.title}>Orders unavailable</Text>
        <Text style={styles.meta}>{ordersQuery.error instanceof Error ? ordersQuery.error.message : 'Unable to load order data.'}</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <AppHeader
        left={<Text style={styles.sectionBadge}>Admin</Text>}
        right={<Text style={styles.panelLabel}>Orders</Text>}
      />

      <View style={styles.content}>
        <Text style={styles.title}>Orders</Text>

        <View style={styles.filterRow}>
          {['All', ...ORDER_STATUS_OPTIONS].map((status) => (
            <TouchableOpacity
              key={status}
              onPress={() => setActiveFilter(status as 'All' | AdminOrderStatus)}
              style={[styles.filterButton, activeFilter === status && styles.filterButtonActive]}
            >
              <Text style={[styles.filterText, activeFilter === status && styles.filterTextActive]}>{status}</Text>
            </TouchableOpacity>
          ))}
        </View>

        <FlatList
          data={visibleOrders}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
          renderItem={({ item }) => (
            <View style={styles.card}>
              <View style={styles.rowBetween}>
                <Text style={styles.name}>Order No. {item.orderNumber ?? item.id}</Text>
                <Text style={styles.badge}>{item.status}</Text>
              </View>
              <Text style={styles.meta}>{item.customerName}</Text>
              <Text style={styles.meta}>Total: PKR {item.total}</Text>
              <Text style={styles.meta}>{new Date(item.createdAt).toLocaleString()}</Text>

              <View style={styles.actionRow}>
                {ORDER_STATUS_OPTIONS.map((status) => (
                  <TouchableOpacity
                    key={status}
                    disabled={updateStatusMutation.isPending || item.status === status}
                    onPress={() => updateStatusMutation.mutate({ orderId: item.id, status })}
                    style={[styles.statusButton, item.status === status && styles.statusButtonActive]}
                  >
                    <Text style={[styles.statusText, item.status === status && styles.statusTextActive]}>{status}</Text>
                  </TouchableOpacity>
                ))}
              </View>

              <TouchableOpacity
                onPress={() => navigation.navigate('OrderDetail', { orderId: item.id })}
                style={styles.detailButton}
              >
                <Text style={styles.detailButtonText}>View details</Text>
              </TouchableOpacity>
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
  card: { backgroundColor: theme.card, borderRadius: 16, padding: 16, marginBottom: 12, borderWidth: 1, borderColor: theme.border },
  rowBetween: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  name: { color: theme.text, fontSize: 18, fontWeight: '700' },
  meta: { color: theme.mutedText, marginTop: 4, fontWeight: '600' },
  filterRow: { flexDirection: 'row', flexWrap: 'wrap', marginBottom: 12 },
  filterButton: { borderRadius: 18, backgroundColor: theme.card, paddingHorizontal: 12, paddingVertical: 8, marginRight: 8, marginBottom: 8, borderWidth: 1, borderColor: theme.border },
  filterButtonActive: { backgroundColor: theme.primary, borderColor: theme.primary },
  filterText: { color: theme.text, fontWeight: '700' },
  filterTextActive: { color: '#fff' },
  badge: { backgroundColor: theme.primary, color: '#fff', paddingHorizontal: 10, paddingVertical: 6, borderRadius: 16, overflow: 'hidden', fontSize: 11, fontWeight: '800' },
  actionRow: { flexDirection: 'row', flexWrap: 'wrap', marginTop: 12 },
  statusButton: { borderRadius: 10, borderWidth: 1, borderColor: theme.border, paddingHorizontal: 8, paddingVertical: 6, marginRight: 6, marginBottom: 6 },
  statusButtonActive: { backgroundColor: theme.primary, borderColor: theme.primary },
  statusText: { color: theme.text, fontSize: 10, fontWeight: '800' },
  statusTextActive: { color: '#fff' },
  detailButton: { marginTop: 12, alignSelf: 'flex-start', backgroundColor: theme.card, borderWidth: 1, borderColor: theme.border, borderRadius: 10, paddingHorizontal: 12, paddingVertical: 8 },
  detailButtonText: { color: theme.primary, fontWeight: '800' },
  listContent: { paddingBottom: 24 },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: theme.background, padding: 16 },
});
