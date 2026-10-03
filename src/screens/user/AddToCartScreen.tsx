import React from 'react';
import {
  
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  StatusBar,
  Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../../types/navigation';
import { useCart } from '../../../context/CartContext';
import { useTheme } from '../../../context/ThemeContext';
import AppHeader from '../../components/AppHeader';
import { AppTheme } from '../../theme/colors';

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

const AddToCartScreen = () => {
  const { theme } = useTheme();
  const styles = createStyles(theme);
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const { cart, removeFromCart, updateQuantity, totalItems, totalPrice } = useCart();

  const handleCheckout = () => {
    navigation.push('Checkout');
  };

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: theme.background }]}>
      <StatusBar barStyle={theme.statusBar} backgroundColor={theme.background} />
      <AppHeader
        right={
          <TouchableOpacity
            accessibilityRole="button"
            accessibilityLabel="Go back"
            onPress={() => navigation.goBack()}
            style={styles.backBtn}
          >
            <Image source={require('../../asset/back_button.png')} style={styles.backImage} resizeMode="contain" />
          </TouchableOpacity>
        }
      />

      <View style={styles.cartHeader}>
        <Text style={styles.headerTitle}>My Cart ({totalItems})</Text>
      </View>

      {cart.length === 0 ? (
        <View style={styles.empty}>
          <Text style={styles.emptyIcon}>🛒</Text>
          <Text style={styles.emptyTitle}>Your cart is empty</Text>
          <Text style={styles.emptySub}>Add some shoes to get started</Text>
          <TouchableOpacity
            style={styles.shopBtn}
            onPress={() => navigation.navigate('MainTabs')}
          >
            <Text style={styles.shopBtnText}>Continue Shopping</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <>
          <ScrollView
            contentContainerStyle={styles.scroll}
            showsVerticalScrollIndicator={false}
          >
            {cart.map((item) => (
              <View key={`${item.id}-${item.size}`} style={[styles.cartItem, { backgroundColor: theme.card, borderColor: theme.border }]}>
                <Image source={{ uri: item.image }} style={styles.itemImage} />

                <View style={styles.itemInfo}>
                  <Text style={styles.itemName} numberOfLines={1}>
                    {item.name}
                  </Text>
                  {item.size ? (
                    <Text style={styles.itemSize}>Size: {item.size}</Text>
                  ) : null}
                  <Text style={styles.itemPrice}>
                    PKR {item.price.toLocaleString()}
                  </Text>

                  <View style={styles.qtyRow}>
                    <TouchableOpacity
                      style={styles.qtyBtn}
                      onPress={() => updateQuantity(item.id, item.quantity - 1)}
                    >
                      <Text style={styles.qtyBtnText}>−</Text>
                    </TouchableOpacity>
                    <Text style={styles.qtyText}>{item.quantity}</Text>
                    <TouchableOpacity
                      style={styles.qtyBtn}
                      onPress={() => updateQuantity(item.id, item.quantity + 1)}
                    >
                      <Text style={styles.qtyBtnText}>+</Text>
                    </TouchableOpacity>
                  </View>
                </View>

                <TouchableOpacity
                  style={styles.removeBtn}
                  onPress={() => removeFromCart(item.id)}
                >
                  <Text style={styles.removeText}>✕</Text>
                </TouchableOpacity>
              </View>
            ))}
          </ScrollView>

          <View style={[styles.footer, { backgroundColor: theme.card, borderTopColor: theme.border }]}>
            <View style={styles.totalRow}>
              <Text style={styles.totalLabel}>Total</Text>
              <Text style={styles.totalPrice}>
                PKR {totalPrice.toLocaleString()}
              </Text>
            </View>

            <TouchableOpacity
              style={styles.checkoutBtn}
              activeOpacity={0.85}
              onPress={handleCheckout}
            >
              <Text style={styles.checkoutText}>Checkout</Text>
            </TouchableOpacity>
          </View>
        </>
      )}
    </SafeAreaView>
  );
};

const createStyles = (theme: AppTheme) => StyleSheet.create({
  safe: { flex: 1, backgroundColor: theme.background },
  cartHeader: { paddingHorizontal: 20, paddingTop: 6, paddingBottom: 12 },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: theme.card,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: theme.border,
  },
  backImage: { width: 20, height: 20, tintColor: theme.primary },
  headerTitle: { color: theme.text, fontSize: 24, fontWeight: '800' },
  empty: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 40,
  },
  emptyIcon: { fontSize: 56, marginBottom: 16 },
  emptyTitle: {
    color: theme.text,
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 8,
  },
  emptySub: {
    color: theme.mutedText,
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 24,
  },
  shopBtn: {
    backgroundColor: theme.primary,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 10,
  },
  shopBtnText: { color: theme.text, fontSize: 14, fontWeight: '800' },
  scroll: { padding: 16, paddingBottom: 20 },
  cartItem: {
    flexDirection: 'row',
    backgroundColor: theme.card,
    borderRadius: 14,
    padding: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: theme.border,
    alignItems: 'center',
  },
  itemImage: {
    width: 80,
    height: 80,
    borderRadius: 10,
    backgroundColor: '#F0F0F0',
  },
  itemInfo: { flex: 1, marginLeft: 12 },
  itemName: {
    color: theme.text,
    fontSize: 15,
    fontWeight: '700',
    marginBottom: 2,
  },
  itemSize: { color: theme.mutedText, fontSize: 12, marginBottom: 4 },
  itemPrice: {
    color: theme.primary,
    fontSize: 15,
    fontWeight: '800',
    marginBottom: 8,
  },
  qtyRow: { flexDirection: 'row', alignItems: 'center' },
  qtyBtn: {
    width: 30,
    height: 30,
    borderRadius: 8,
    backgroundColor: theme.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  qtyBtnText: { color: theme.text, fontSize: 18, fontWeight: '600' },
  qtyText: {
    color: theme.text,
    fontSize: 15,
    fontWeight: '700',
    marginHorizontal: 12,
  },
  removeBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(232,65,24,0.12)',
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 8,
  },
  removeText: { color: COLORS.accent, fontSize: 14, fontWeight: '700' },
  footer: {
    padding: 16,
    paddingBottom: 24,
    backgroundColor: theme.card,
    borderTopWidth: 1,
    borderTopColor: theme.border,
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  totalLabel: { color: theme.mutedText, fontSize: 16 },
  totalPrice: { color: theme.primary, fontSize: 20, fontWeight: '800' },
  checkoutBtn: {
    height: 52,
    borderRadius: 12,
    backgroundColor: theme.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkoutText: { color: theme.text, fontSize: 16, fontWeight: '800' },
});

export default AddToCartScreen;
