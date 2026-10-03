import React from 'react';
import { View, Text, StyleSheet, ActivityIndicator, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useQuery } from '@tanstack/react-query';
import { RouteProp, useNavigation, useRoute } from '@react-navigation/native';
import { useAuth } from '../../../context/AuthContext';
import { useTheme } from '../../../context/ThemeContext';
import { adminApi } from '../../services/adminApi';
import { getLocalOrderById } from '../../services/localOrderStore';
import { AppTheme } from '../../theme/theme';
import { RootStackParamList } from '../../../types/navigation';

export default function AdminOrderDetailScreen() {
  const { token } = useAuth();
  const { theme } = useTheme();
  const navigation = useNavigation();
  const route = useRoute<RouteProp<RootStackParamList, 'OrderDetail'>>();
  const styles = createStyles(theme);
  const orderId = route.params?.orderId;

  const orderQuery = useQuery({
    queryKey: ['admin-order-detail', orderId],
    queryFn: async () => {
      if (!orderId) {
        throw new Error('Missing order id');
      }
      const localOrder = await getLocalOrderById(orderId);
      if (localOrder) return localOrder;
      if (!/^\d+$/.test(orderId)) {
        throw new Error('This local order is not available on this device.');
      }
      return adminApi.getOrderById(token || '', orderId);
    },
    enabled: !!token && !!orderId,
    retry: 1,
  });

  if (!token) {
    return <SafeAreaView style={styles.center} edges={['top', 'bottom']}><Text style={styles.title}>Admin session missing</Text></SafeAreaView>;
  }

  if (!orderId) {
    return (
      <SafeAreaView style={styles.center} edges={['top', 'bottom']}>
        <Text style={styles.title}>Order not selected</Text>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Text style={styles.backButtonText}>Go back</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  if (orderQuery.isLoading) {
    return <SafeAreaView style={styles.center} edges={['top', 'bottom']}><ActivityIndicator color={theme.primary} /></SafeAreaView>;
  }

  if (orderQuery.error) {
    return (
      <SafeAreaView style={styles.center} edges={['top', 'bottom']}>
        <Text style={styles.title}>Order details unavailable</Text>
        <Text style={styles.text}>{orderQuery.error instanceof Error ? orderQuery.error.message : 'Unable to load order details.'}</Text>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Text style={styles.backButtonText}>Go back</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  const order = orderQuery.data;

  if (!order) {
    return (
      <SafeAreaView style={styles.center} edges={['top', 'bottom']}>
        <Text style={styles.title}>Order details unavailable</Text>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Text style={styles.backButtonText}>Go back</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <ScrollView contentContainerStyle={styles.content}>
      <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
        <Text style={styles.backButtonText}>← Back</Text>
      </TouchableOpacity>
      <Text style={styles.title}>Order Details</Text>
      <View style={styles.card}>
        <Text style={styles.label}>Order No.</Text>
        <Text style={styles.value}>{order.orderNumber ?? order.id}</Text>
        <Text style={styles.label}>Customer</Text>
        <Text style={styles.value}>{order.customerName}</Text>
        <Text style={styles.label}>Status</Text>
        <Text style={styles.value}>{order.status}</Text>
        <Text style={styles.label}>Created</Text>
        <Text style={styles.value}>{order.createdAt}</Text>
        <Text style={styles.label}>Total</Text>
        <Text style={styles.value}>PKR {order.total}</Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.sectionTitle}>Items</Text>
        {order.items.map((item, index) => (
          <View key={`${item.name}-${index}`} style={styles.itemRow}>
            <Text style={styles.text}>{item.name}</Text>
            <Text style={styles.text}>x{item.quantity}</Text>
            <Text style={styles.text}>PKR {item.price}</Text>
          </View>
        ))}
      </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const createStyles = (theme: AppTheme) => StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.background },
  content: { padding: 16, paddingBottom: 32 },
  title: { color: theme.text, fontSize: 28, fontWeight: '800', marginBottom: 12 },
  card: { backgroundColor: theme.card, borderRadius: 12, padding: 16, borderWidth: 1, borderColor: theme.border, marginBottom: 16 },
  label: { color: theme.mutedText, fontSize: 12, marginTop: 8 },
  value: { color: theme.text, fontSize: 16, fontWeight: '600', marginTop: 2 },
  sectionTitle: { color: theme.text, fontSize: 18, fontWeight: '700', marginBottom: 8 },
  itemRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: theme.border },
  text: { color: theme.text, fontSize: 14 },
  backButton: { alignSelf: 'flex-start', marginBottom: 12, paddingHorizontal: 12, paddingVertical: 8, borderRadius: 8, backgroundColor: theme.card, borderWidth: 1, borderColor: theme.border },
  backButtonText: { color: theme.primary, fontWeight: '700' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: theme.background, padding: 16 },
});
