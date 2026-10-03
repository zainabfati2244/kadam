import React, { useEffect, useMemo, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TextInput,
  ActivityIndicator,
  TouchableOpacity,
  Modal,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '../../../context/AuthContext';
import { useTheme } from '../../../context/ThemeContext';
import { adminApi, AdminProduct } from '../../services/adminApi';
import { AppTheme } from '../../theme/theme';
import AppHeader from '../../components/AppHeader';

const FALLBACK_PRODUCTS: AdminProduct[] = [
  {
    id: 'fallback-1',
    name: 'Air Max Pro',
    brand: 'Nike',
    category: 'Running',
    price: 129,
    stock: 12,
    sizes: ['7', '8', '9'],
    colors: ['Black', 'White'],
    image: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff',
  },
  {
    id: 'fallback-2',
    name: 'Street Runner',
    brand: 'Adidas',
    category: 'Lifestyle',
    price: 149,
    stock: 8,
    sizes: ['6', '7', '10'],
    colors: ['Blue', 'Grey'],
    image: 'https://images.unsplash.com/photo-1600185365483-26d7a4cc7519',
  },
];

type ProductDraft = {
  id: string;
  name: string;
  brand: string;
  category: string;
  price: string;
  stock: string;
  sizes: string;
  colors: string;
};

const emptyDraft = (): ProductDraft => ({
  id: '',
  name: '',
  brand: '',
  category: '',
  price: '',
  stock: '',
  sizes: '7, 8, 9',
  colors: 'Black, White',
});

const normalizeProduct = (product: Partial<AdminProduct>, index: number): AdminProduct => ({
  id: String(product.id ?? `product-${index}`),
  name: product.name || 'Unnamed product',
  brand: product.brand || 'Unknown brand',
  category: product.category || 'Uncategorized',
  price: typeof product.price === 'number' ? product.price : 0,
  stock: typeof product.stock === 'number' ? product.stock : 0,
  sizes: Array.isArray(product.sizes) ? product.sizes.filter((size): size is string => typeof size === 'string') : [],
  colors: Array.isArray(product.colors) ? product.colors.filter((color): color is string => typeof color === 'string') : [],
  image: product.image || '',
  featured: product.featured,
});

export default function AdminProductsScreen() {
  const { token } = useAuth();
  const { theme } = useTheme();
  const styles = createStyles(theme);
  const [search, setSearch] = useState('');
  const [localProducts, setLocalProducts] = useState<AdminProduct[]>(FALLBACK_PRODUCTS);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [draft, setDraft] = useState<ProductDraft>(emptyDraft());

  const productsQuery = useQuery({
    queryKey: ['admin-products'],
    queryFn: () => adminApi.getProducts(token || ''),
    enabled: !!token,
    retry: 1,
  });

  useEffect(() => {
    if (Array.isArray(productsQuery.data) && productsQuery.data.length > 0) {
      setLocalProducts(productsQuery.data.map(normalizeProduct));
    }
  }, [productsQuery.data]);

  const filteredProducts = useMemo(() => {
    const source = localProducts.length ? localProducts : FALLBACK_PRODUCTS;
    if (!search.trim()) return source;
    return source.filter((product) =>
      product.name.toLowerCase().includes(search.toLowerCase()) ||
      product.category.toLowerCase().includes(search.toLowerCase()) ||
      product.brand.toLowerCase().includes(search.toLowerCase())
    );
  }, [localProducts, search]);

  const openCreateModal = () => {
    setEditingId(null);
    setDraft(emptyDraft());
    setModalVisible(true);
  };

  const openEditModal = (product: AdminProduct) => {
    setEditingId(product.id);
    setDraft({
      id: product.id,
      name: product.name,
      brand: product.brand,
      category: product.category,
      price: String(product.price),
      stock: String(product.stock),
      sizes: Array.isArray(product.sizes) ? product.sizes.join(', ') : '',
      colors: Array.isArray(product.colors) ? product.colors.join(', ') : '',
    });
    setModalVisible(true);
  };

  const saveProduct = () => {
    const name = draft.name.trim();
    const brand = draft.brand.trim();
    const category = draft.category.trim();
    const price = Number(draft.price);
    const stock = Number(draft.stock);

    if (!name || !brand || !category || Number.isNaN(price) || Number.isNaN(stock)) {
      return;
    }

    const normalizedProduct: AdminProduct = {
      id: editingId || `product-${Date.now()}`,
      name,
      brand,
      category,
      price,
      stock,
      sizes: draft.sizes
        .split(',')
        .map((item) => item.trim())
        .filter(Boolean),
      colors: draft.colors
        .split(',')
        .map((item) => item.trim())
        .filter(Boolean),
      image: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff',
    };

    setLocalProducts((prev) => {
      if (editingId) {
        return prev.map((product) => (product.id === editingId ? normalizedProduct : product));
      }
      return [normalizedProduct, ...prev];
    });

    setModalVisible(false);
    setEditingId(null);
    setDraft(emptyDraft());
  };

  const deleteProduct = (productId: string) => {
    setLocalProducts((prev) => prev.filter((product) => product.id !== productId));
  };

  if (!token) {
    return <View style={styles.center}><Text style={styles.title}>Admin session missing</Text></View>;
  }

  if (productsQuery.isLoading) {
    return <View style={styles.center}><ActivityIndicator color={theme.primary} /></View>;
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <AppHeader
        left={<Text style={styles.sectionBadge}>Admin</Text>}
        right={<TouchableOpacity onPress={openCreateModal} style={styles.primaryButton}><Text style={styles.primaryButtonText}>Add</Text></TouchableOpacity>}
      />

      <View style={styles.content}>
        <Text style={styles.title}>Products</Text>

        <TextInput
          value={search}
          onChangeText={setSearch}
          placeholder="Search products"
          placeholderTextColor={theme.mutedText}
          style={styles.searchInput}
        />

        <FlatList
          data={filteredProducts}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
          renderItem={({ item }) => (
            <View style={styles.card}>
              <Text style={styles.name}>{item.name}</Text>
              <Text style={styles.meta}>{item.brand} • {item.category}</Text>
              <Text style={styles.meta}>Price: PKR {item.price}</Text>
              <Text style={styles.meta}>Stock: {item.stock}</Text>
              <Text style={styles.meta}>Sizes: {Array.isArray(item.sizes) ? item.sizes.join(', ') || 'Not specified' : 'Not specified'}</Text>
              <Text style={styles.meta}>Colors: {Array.isArray(item.colors) ? item.colors.join(', ') || 'Not specified' : 'Not specified'}</Text>

              <View style={styles.actionRow}>
                <TouchableOpacity onPress={() => openEditModal(item)} style={styles.smallButton}>
                  <Text style={styles.smallButtonText}>Edit</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={() => deleteProduct(item.id)} style={[styles.smallButton, styles.deleteButton]}>
                  <Text style={styles.smallButtonText}>Delete</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}
        />

      <Modal transparent visible={modalVisible} animationType="slide" onRequestClose={() => setModalVisible(false)}>
        <View style={styles.modalBackdrop}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>{editingId ? 'Edit Product' : 'Add Product'}</Text>
            <ScrollView>
              <TextInput value={draft.name} onChangeText={(value) => setDraft((current) => ({ ...current, name: value }))} placeholder="Name" placeholderTextColor={theme.mutedText} style={styles.input} />
              <TextInput value={draft.brand} onChangeText={(value) => setDraft((current) => ({ ...current, brand: value }))} placeholder="Brand" placeholderTextColor={theme.mutedText} style={styles.input} />
              <TextInput value={draft.category} onChangeText={(value) => setDraft((current) => ({ ...current, category: value }))} placeholder="Category" placeholderTextColor={theme.mutedText} style={styles.input} />
              <TextInput value={draft.price} onChangeText={(value) => setDraft((current) => ({ ...current, price: value }))} placeholder="Price" keyboardType="numeric" placeholderTextColor={theme.mutedText} style={styles.input} />
              <TextInput value={draft.stock} onChangeText={(value) => setDraft((current) => ({ ...current, stock: value }))} placeholder="Stock" keyboardType="numeric" placeholderTextColor={theme.mutedText} style={styles.input} />
              <TextInput value={draft.sizes} onChangeText={(value) => setDraft((current) => ({ ...current, sizes: value }))} placeholder="Sizes (comma separated)" placeholderTextColor={theme.mutedText} style={styles.input} />
              <TextInput value={draft.colors} onChangeText={(value) => setDraft((current) => ({ ...current, colors: value }))} placeholder="Colors (comma separated)" placeholderTextColor={theme.mutedText} style={styles.input} />
            </ScrollView>

            <View style={styles.modalActions}>
              <TouchableOpacity onPress={() => setModalVisible(false)} style={styles.secondaryButton}>
                <Text style={styles.secondaryButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={saveProduct} style={styles.primaryButton}>
                <Text style={styles.primaryButtonText}>{editingId ? 'Save' : 'Create'}</Text>
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
  actionRow: { flexDirection: 'row', marginTop: 12 },
  smallButton: { backgroundColor: theme.primary, paddingHorizontal: 12, paddingVertical: 8, borderRadius: 10, marginRight: 8 },
  smallButtonText: { color: '#fff', fontWeight: '700' },
  deleteButton: { backgroundColor: '#d94b4b' },
  primaryButton: { backgroundColor: theme.primary, paddingHorizontal: 14, paddingVertical: 10, borderRadius: 10 },
  primaryButtonText: { color: '#fff', fontWeight: '700' },
  secondaryButton: { backgroundColor: theme.card, borderWidth: 1, borderColor: theme.border, paddingHorizontal: 14, paddingVertical: 10, borderRadius: 10 },
  secondaryButtonText: { color: theme.text, fontWeight: '700' },
  modalBackdrop: { flex: 1, backgroundColor: 'rgba(0,0,0,0.35)', justifyContent: 'center', padding: 16 },
  modalCard: { backgroundColor: theme.card, borderRadius: 16, padding: 16, maxHeight: '80%' },
  modalTitle: { color: theme.text, fontSize: 22, fontWeight: '800', marginBottom: 12 },
  input: {
    backgroundColor: theme.background,
    color: theme.text,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: theme.border,
    marginBottom: 10,
  },
  modalActions: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 12 },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: theme.background, padding: 16 },
});
