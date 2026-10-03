import React, { useEffect, useState } from 'react';
import { ActivityIndicator, FlatList, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { collection, getFirestore, onSnapshot, orderBy, query, updateDoc, doc } from '@react-native-firebase/firestore';
import AppHeader from '../../components/AppHeader';
import { useAuth } from '../../../context/AuthContext';
import { useTheme } from '../../../context/ThemeContext';

export default function NotificationsScreen() {
  const { user } = useAuth(); const { theme } = useTheme(); const [items, setItems] = useState<any[]>([]); const [loading, setLoading] = useState(true);
  useEffect(() => { if (!user) return; const ref = collection(getFirestore(), 'users', user.uid, 'notifications'); return onSnapshot(query(ref, orderBy('createdAt', 'desc')), snap => { const next: any[] = snap.docs.map(item => ({ id: item.id, ...item.data() })); setItems(next); setLoading(false); next.filter(item => !item.read).forEach(item => updateDoc(doc(getFirestore(), 'users', user.uid, 'notifications', item.id), { read: true })); }, () => setLoading(false)); }, [user]);
  return <SafeAreaView style={[styles.safe, { backgroundColor: theme.background }]}><AppHeader /><Text style={[styles.title, { color: theme.text }]}>Notifications</Text>{loading ? <ActivityIndicator color={theme.primary} /> : <FlatList data={items} keyExtractor={item => item.id} contentContainerStyle={styles.list} ListEmptyComponent={<Text style={[styles.empty, { color: theme.mutedText }]}>No notifications yet</Text>} renderItem={({ item }) => <View style={[styles.card, { backgroundColor: theme.card, borderColor: item.read ? theme.border : theme.primary }]}><Text style={[styles.cardTitle, { color: theme.text }]}>{item.title}</Text><Text style={[styles.body, { color: theme.mutedText }]}>{item.body}</Text><Text style={[styles.time, { color: theme.mutedText }]}>{item.createdAt?.toDate?.().toLocaleString() || 'Just now'}</Text></View>} />}</SafeAreaView>;
}
const styles = StyleSheet.create({ safe: { flex: 1 }, title: { fontSize: 24, fontWeight: '800', marginHorizontal: 20, marginBottom: 14 }, list: { padding: 20, paddingTop: 0 }, card: { borderWidth: 1, borderRadius: 14, padding: 16, marginBottom: 12 }, cardTitle: { fontSize: 16, fontWeight: '800' }, body: { fontSize: 14, marginTop: 6 }, time: { fontSize: 11, marginTop: 10 }, empty: { textAlign: 'center', marginTop: 50, fontSize: 15 } });
