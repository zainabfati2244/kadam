import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, ActivityIndicator, TouchableOpacity, Modal, TextInput } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '../../../context/AuthContext';
import { useTheme } from '../../../context/ThemeContext';
import { adminApi, AdminCategory } from '../../services/adminApi';
import { AppTheme } from '../../theme/theme';
import AppHeader from '../../components/AppHeader';

const FALLBACK_CATEGORIES: AdminCategory[] = [
  { id: 'cat-1', name: 'Running', type: 'category', count: 24 },
  { id: 'cat-2', name: 'Lifestyle', type: 'category', count: 18 },
  { id: 'brand-1', name: 'Nike', type: 'brand', count: 12 },
  { id: 'brand-2', name: 'Adidas', type: 'brand', count: 9 },
];

export default function AdminCategoriesScreen() {
  const { token } = useAuth();
  const { theme } = useTheme();
  const styles = createStyles(theme);
  const [localCategories, setLocalCategories] = useState<AdminCategory[]>(FALLBACK_CATEGORIES);
  const [modalVisible, setModalVisible] = useState(false);
  const [name, setName] = useState('');
  const [type, setType] = useState<'category' | 'brand'>('category');

  const categoriesQuery = useQuery({
    queryKey: ['admin-categories'],
    queryFn: () => adminApi.getCategories(token || ''),
    enabled: !!token,
    retry: 1,
  });

  useEffect(() => {
    if (categoriesQuery.data && categoriesQuery.data.length > 0) {
      setLocalCategories(categoriesQuery.data);
    }
  }, [categoriesQuery.data]);

  const saveCategory = () => {
    const trimmedName = name.trim();
    if (!trimmedName) return;

    setLocalCategories((prev) => [{
      id: `local-${Date.now()}`,
      name: trimmedName,
      type,
      count: 0,
    }, ...prev]);

    setName('');
    setType('category');
    setModalVisible(false);
  };

  const deleteCategory = (id: string) => {
    setLocalCategories((prev) => prev.filter((category) => category.id !== id));
  };

  if (!token) {
    return <View style={styles.center}><Text style={styles.title}>Admin session missing</Text></View>;
  }

  if (categoriesQuery.isLoading) {
    return <View style={styles.center}><ActivityIndicator color={theme.primary} /></View>;
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <AppHeader
        left={<Text style={styles.sectionBadge}>Admin</Text>}
        right={<TouchableOpacity onPress={() => setModalVisible(true)} style={styles.primaryButton}><Text style={styles.primaryButtonText}>Add</Text></TouchableOpacity>}
      />

      <View style={styles.content}>
        <Text style={styles.title}>Categories & Brands</Text>

        <FlatList
          data={localCategories}
          keyExtractor={(item) => `${item.type}-${item.id}`}
          contentContainerStyle={styles.listContent}
          renderItem={({ item }) => (
            <View style={styles.card}>
              <Text style={styles.name}>{item.name}</Text>
              <Text style={styles.meta}>{item.type === 'category' ? 'Category' : 'Brand'}</Text>
              {item.count !== undefined && <Text style={styles.meta}>Items: {item.count}</Text>}
              <TouchableOpacity onPress={() => deleteCategory(item.id)} style={[styles.deleteButton]}>
                <Text style={styles.deleteButtonText}>Delete</Text>
              </TouchableOpacity>
            </View>
          )}
        />

      <Modal transparent visible={modalVisible} animationType="slide" onRequestClose={() => setModalVisible(false)}>
        <View style={styles.modalBackdrop}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>Add category</Text>
            <TextInput
              value={name}
              onChangeText={setName}
              placeholder="Name"
              placeholderTextColor={theme.mutedText}
              style={styles.input}
            />

            <View style={styles.typeRow}>
              {(['category', 'brand'] as const).map((option) => (
                <TouchableOpacity
                  key={option}
                  onPress={() => setType(option)}
                  style={[styles.typeButton, type === option && styles.typeButtonActive]}
                >
                  <Text style={[styles.typeButtonText, type === option && styles.typeButtonTextActive]}>
                    {option === 'category' ? 'Category' : 'Brand'}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <View style={styles.modalActions}>
              <TouchableOpacity onPress={() => setModalVisible(false)} style={styles.secondaryButton}>
                <Text style={styles.secondaryButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={saveCategory} style={styles.primaryButton}>
                <Text style={styles.primaryButtonText}>Create</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
      </View>
    </SafeAreaView>
  );
}

const createStyles = (theme: AppTheme) => StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.background },
  content: { flex: 1, padding: 16 },
  sectionBadge: { color: theme.primary, fontSize: 12, fontWeight: '800', letterSpacing: 1, textTransform: 'uppercase' },
  headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  title: { color: theme.text, fontSize: 28, fontWeight: '800' },
  card: { backgroundColor: theme.card, borderRadius: 16, padding: 16, marginBottom: 12, borderWidth: 1, borderColor: theme.border },
  name: { color: theme.text, fontSize: 18, fontWeight: '700' },
  meta: { color: theme.mutedText, marginTop: 4, fontWeight: '600' },
  primaryButton: { backgroundColor: theme.primary, paddingHorizontal: 14, paddingVertical: 10, borderRadius: 10 },
  primaryButtonText: { color: '#fff', fontWeight: '700' },
  secondaryButton: { backgroundColor: theme.card, borderWidth: 1, borderColor: theme.border, paddingHorizontal: 14, paddingVertical: 10, borderRadius: 10 },
  secondaryButtonText: { color: theme.text, fontWeight: '700' },
  deleteButton: { backgroundColor: '#d94b4b', paddingHorizontal: 12, paddingVertical: 8, borderRadius: 8, alignSelf: 'flex-start', marginTop: 12 },
  deleteButtonText: { color: '#fff', fontWeight: '700' },
  modalBackdrop: { flex: 1, backgroundColor: 'rgba(0,0,0,0.35)', justifyContent: 'center', padding: 16 },
  modalCard: { backgroundColor: theme.card, borderRadius: 16, padding: 16 },
  modalTitle: { color: theme.text, fontSize: 22, fontWeight: '800', marginBottom: 12 },
  input: {
    backgroundColor: theme.background,
    color: theme.text,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: theme.border,
    marginBottom: 12,
  },
  typeRow: { flexDirection: 'row', marginBottom: 12 },
  typeButton: { flex: 1, borderWidth: 1, borderColor: theme.border, borderRadius: 10, paddingVertical: 10, alignItems: 'center', marginRight: 8 },
  typeButtonActive: { backgroundColor: theme.primary, borderColor: theme.primary },
  typeButtonText: { color: theme.text, fontWeight: '700' },
  typeButtonTextActive: { color: '#fff' },
  modalActions: { flexDirection: 'row', justifyContent: 'space-between' },
  listContent: { paddingBottom: 24 },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: theme.background, padding: 16 },
});
