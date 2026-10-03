import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getFirestore,
  onSnapshot,
  serverTimestamp,
  setDoc,
} from '@react-native-firebase/firestore';
import AppHeader from '../../components/AppHeader';
import { useAuth } from '../../../context/AuthContext';
import { useTheme } from '../../../context/ThemeContext';
type Address = {
  id: string;
  name: string;
  phone: string;
  address: string;
  city: string;
  selected?: boolean;
};
export default function ShippingAddressScreen() {
  const { user } = useAuth();
  const { theme } = useTheme();
  const [items, setItems] = useState<Address[]>([]);
  const [loading, setLoading] = useState(true);
  const [draft, setDraft] = useState({
    name: '',
    phone: '',
    address: '',
    city: '',
  });
  const [editing, setEditing] = useState<string | null>(null);
  useEffect(() => {
    if (!user) return;
    return onSnapshot(
      collection(getFirestore(), 'users', user.uid, 'addresses'),
      snap => {
        setItems(
          snap.docs.map(value => ({
            id: value.id,
            ...(value.data() as Omit<Address, 'id'>),
          })),
        );
        setLoading(false);
      },
      () => setLoading(false),
    );
  }, [user]);
  const save = async () => {
    if (!user || !draft.name || !draft.address || !draft.city) return;
    const ref = collection(getFirestore(), 'users', user.uid, 'addresses');
    if (editing)
      await setDoc(
        doc(ref, editing),
        { ...draft, updatedAt: serverTimestamp() },
        { merge: true },
      );
    else
      await addDoc(ref, {
        ...draft,
        selected: !items.length,
        createdAt: serverTimestamp(),
      });
    setDraft({ name: '', phone: '', address: '', city: '' });
    setEditing(null);
  };
  const choose = async (id: string) => {
    if (!user) return;
    await Promise.all(
      items.map(item =>
        setDoc(
          doc(getFirestore(), 'users', user.uid, 'addresses', item.id),
          { selected: item.id === id },
          { merge: true },
        ),
      ),
    );
  };
  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: theme.background }]}>
      <AppHeader />
      <Text style={[styles.title, { color: theme.text }]}>
        Shipping Address
      </Text>
      <View style={[styles.form, { borderColor: theme.border }]}>
        {(['name', 'phone', 'address', 'city'] as const).map(key => (
          <TextInput
            key={key}
            style={[
              styles.input,
              { color: theme.text, borderColor: theme.border },
            ]}
            placeholder={key[0].toUpperCase() + key.slice(1)}
            placeholderTextColor={theme.mutedText}
            value={draft[key]}
            onChangeText={value => setDraft({ ...draft, [key]: value })}
          />
        ))}
        <TouchableOpacity
          style={[styles.save, { backgroundColor: theme.primary }]}
          onPress={save}
        >
          <Text style={[styles.saveText, { color: theme.text }]}>
            {editing ? 'UPDATE ADDRESS' : 'ADD ADDRESS'}
          </Text>
        </TouchableOpacity>
      </View>
      {loading ? (
        <ActivityIndicator color={theme.primary} />
      ) : (
        <FlatList
          data={items}
          keyExtractor={item => item.id}
          contentContainerStyle={styles.list}
          ListEmptyComponent={
            <Text style={[styles.empty, { color: theme.mutedText }]}>
              No saved addresses
            </Text>
          }
          renderItem={({ item }) => (
            <TouchableOpacity
              onPress={() => choose(item.id)}
              style={[
                styles.card,
                {
                  backgroundColor: theme.card,
                  borderColor: item.selected ? theme.primary : theme.border,
                },
              ]}
            >
              <Text style={[styles.name, { color: theme.text }]}>
                {item.selected ? '✓ ' : ''}
                {item.name}
              </Text>
              <Text style={{ color: theme.mutedText }}>
                {item.address}, {item.city}
              </Text>
              <Text style={{ color: theme.mutedText }}>{item.phone}</Text>
              <View style={styles.row}>
                <TouchableOpacity
                  onPress={() => {
                    setDraft(item);
                    setEditing(item.id);
                  }}
                >
                  <Text style={[styles.action, { color: theme.primary }]}>
                    Edit
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={() =>
                    user &&
                    deleteDoc(
                      doc(
                        getFirestore(),
                        'users',
                        user.uid,
                        'addresses',
                        item.id,
                      ),
                    )
                  }
                >
                  <Text style={styles.delete}>Delete</Text>
                </TouchableOpacity>
              </View>
            </TouchableOpacity>
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
  form: {
    margin: 20,
    marginTop: 0,
    borderWidth: 1,
    borderRadius: 14,
    padding: 12,
  },
  input: { borderWidth: 1, borderRadius: 10, padding: 11, marginBottom: 8 },
  save: { borderRadius: 10, padding: 14, alignItems: 'center' },
  saveText: { fontWeight: '800' },
  list: { padding: 20, paddingTop: 0 },
  card: { borderWidth: 1, borderRadius: 14, padding: 14, marginBottom: 10 },
  name: { fontSize: 16, fontWeight: '800', marginBottom: 5 },
  row: { flexDirection: 'row', gap: 22, marginTop: 10 },
  action: { fontWeight: '800' },
  delete: { color: '#B85C4A', fontWeight: '800' },
  empty: { textAlign: 'center', marginTop: 25 },
});
