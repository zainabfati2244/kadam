import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  collection,
  getFirestore,
  onSnapshot,
  orderBy,
  query,
} from '@react-native-firebase/firestore';
import AppHeader from '../../components/AppHeader';
import { useAuth } from '../../../context/AuthContext';
import { useTheme } from '../../../context/ThemeContext';
export default function MyOrdersScreen() {
  const { user } = useAuth();
  const { theme } = useTheme();
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    if (!user) return;
    return onSnapshot(
      query(
        collection(getFirestore(), 'users', user.uid, 'orders'),
        orderBy('createdAt', 'desc'),
      ),
      snapshot => {
        setOrders(
          snapshot.docs.map(value => ({ id: value.id, ...value.data() })),
        );
        setLoading(false);
      },
      () => setLoading(false),
    );
  }, [user]);
  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: theme.background }]}>
      <AppHeader />
      <Text style={[styles.title, { color: theme.text }]}>My Orders</Text>
      {loading ? (
        <ActivityIndicator color={theme.primary} />
      ) : (
        <FlatList
          data={orders}
          keyExtractor={item => item.id}
          contentContainerStyle={styles.list}
          ListEmptyComponent={
            <Text style={[styles.empty, { color: theme.mutedText }]}>
              You have not placed any orders yet
            </Text>
          }
          renderItem={({ item }) => (
            <View
              style={[
                styles.card,
                { backgroundColor: theme.card, borderColor: theme.border },
              ]}
            >
              <Text style={[styles.status, { color: theme.primary }]}>
                {item.status || 'Processing'}
              </Text>
              <Text style={[styles.text, { color: theme.text }]}>
                Order #{item.id.slice(0, 8)}
              </Text>
              <Text style={[styles.meta, { color: theme.mutedText }]}>
                {item.items?.length || 0} item(s) ·{' '}
                {item.createdAt?.toDate?.().toLocaleDateString() || 'Pending'}
              </Text>
              <Text style={[styles.total, { color: theme.primary }]}>
                PKR {Number(item.total || 0).toLocaleString()}
              </Text>
            </View>
          )}
        />
      )}
    </SafeAreaView>
  );
}
const styles = StyleSheet.create({
  safe: { flex: 1 },
  title: {
    fontSize: 24,
    fontWeight: '800',
    marginHorizontal: 20,
    marginBottom: 14,
  },
  list: { padding: 20, paddingTop: 0 },
  card: { borderWidth: 1, borderRadius: 14, padding: 16, marginBottom: 12 },
  status: { fontSize: 12, fontWeight: '800', textTransform: 'uppercase' },
  text: { fontSize: 16, fontWeight: '800', marginTop: 6 },
  meta: { fontSize: 13, marginTop: 5 },
  total: { fontSize: 17, fontWeight: '800', marginTop: 12 },
  empty: { textAlign: 'center', marginTop: 50 },
});
