import React, { useState } from 'react';
import {
  
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  StatusBar,
  Image,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../../types/navigation';
import { useTheme } from '../../../context/ThemeContext';
import AppHeader from '../../components/AppHeader';
import { AppTheme } from '../../theme/colors';
import { useCart } from '../../../context/CartContext';
import AppAlert from '../../components/AppAlert';

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

const { width } = Dimensions.get('window');
const SIZES = ['40', '41', '42', '43', '44', '45'];

type ProductDetailRouteProp = RouteProp<RootStackParamList, 'ProductDetail'>;

const ProductDetailScreen = () => {
  const { theme } = useTheme();
  const styles = createStyles(theme);
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const route = useRoute<ProductDetailRouteProp>();
  const { product } = route.params;
  const { addToCart } = useCart();

  const [selectedSize, setSelectedSize] = useState<string | null>(null);
  const [alert, setAlert] = useState<{ title: string; message: string } | null>(null);

  const handleAddToCart = () => {
    if (!selectedSize) {
      setAlert({ title: 'Select Size', message: 'Please select a size first' });
      return;
    }

    addToCart(
      {
        id: product.id,
        name: product.name,
        price: product.price,
        image: product.image,
        tag: product.tag,
        tagColor: product.tagColor,
      },
      selectedSize
    );

    navigation.navigate('AddToCart');
  };

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle={theme.statusBar} backgroundColor={theme.background} />
      <AppAlert visible={!!alert} title={alert?.title || ''} message={alert?.message || ''} onConfirm={() => setAlert(null)} />
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

      <View style={styles.detailHeader}>
        <Text style={styles.headerTitle}>Product Details</Text>
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.imageContainer}>
          <Image
            source={{ uri: product.image }}
            style={styles.productImage}
            resizeMode="contain"
          />
          {product.tag ? (
            <View style={[styles.tag, { backgroundColor: product.tagColor || COLORS.secondary }]}>
              <Text style={styles.tagText}>{product.tag}</Text>
            </View>
          ) : null}
        </View>

        <View style={styles.infoSection}>
          <Text style={styles.productName}>{product.name}</Text>
          <Text style={styles.productCode}>SKU: {product.id.padStart(6, '0')}</Text>

          <View style={styles.priceRow}>
            <Text style={styles.price}>PKR {product.price.toLocaleString()}</Text>
            <Text style={styles.oldPrice}>
              PKR {Math.round(product.price * 1.25).toLocaleString()}
            </Text>
          </View>

          <Text style={styles.sectionLabel}>Select Size</Text>
          <View style={styles.sizeRow}>
            {SIZES.map((size) => (
              <TouchableOpacity
                key={size}
                style={[styles.sizeBtn, selectedSize === size && styles.sizeBtnActive]}
                onPress={() => setSelectedSize(size)}
              >
                <Text
                  style={[styles.sizeText, selectedSize === size && styles.sizeTextActive]}
                >
                  {size}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          <Text style={styles.sectionLabel}>Features</Text>
          <View style={styles.featureBox}>
            <Text style={styles.featureItem}>• Premium cushioning for all-day comfort</Text>
            <Text style={styles.featureItem}>• Breathable mesh upper</Text>
            <Text style={styles.featureItem}>• Durable outsole with great grip</Text>
            <Text style={styles.featureItem}>• Lightweight design</Text>
            <Text style={styles.featureItem}>• Slip-in easy wear technology</Text>
          </View>
        </View>
      </ScrollView>

      <View style={styles.bottomBar}>
        <TouchableOpacity style={styles.cartBtn} activeOpacity={0.85} onPress={handleAddToCart}>
          <Text style={styles.cartBtnText}>Add to Cart</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.buyBtn} activeOpacity={0.85} onPress={handleAddToCart}>
          <Text style={styles.buyBtnText}>Buy Now</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const createStyles = (theme: AppTheme) => StyleSheet.create({
  safe: { flex: 1, backgroundColor: theme.background },
  detailHeader: { paddingHorizontal: 20, paddingTop: 6, paddingBottom: 12 },
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
  imageContainer: {
    width: width,
    height: width * 0.9,
    backgroundColor: theme.card,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  productImage: { width: '90%', height: '90%' },
  tag: {
    position: 'absolute',
    top: 16,
    left: 16,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 6,
  },
  tagText: {
    fontSize: 11,
    fontWeight: '800',
    color: theme.text,
    letterSpacing: 0.5,
  },
  infoSection: { padding: 20 },
  productName: {
    color: theme.text,
    fontSize: 22,
    fontWeight: '800',
    marginBottom: 6,
  },
  productCode: { color: theme.mutedText, fontSize: 13, marginBottom: 14 },
  priceRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 24 },
  price: {
    color: theme.primary,
    fontSize: 24,
    fontWeight: '800',
    marginRight: 12,
  },
  oldPrice: {
    color: theme.mutedText,
    fontSize: 16,
    textDecorationLine: 'line-through',
  },
  sectionLabel: {
    color: theme.text,
    fontSize: 15,
    fontWeight: '700',
    marginBottom: 12,
  },
  sizeRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 24,
    gap: 10,
  },
  sizeBtn: {
    width: 52,
    height: 44,
    borderRadius: 10,
    borderWidth: 1.5,
    borderColor: theme.border,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: theme.card,
  },
  sizeBtnActive: {
    borderColor: theme.primary,
    backgroundColor: theme.primary,
  },
  sizeText: { color: theme.text, fontSize: 15, fontWeight: '600' },
  sizeTextActive: { color: theme.text, fontWeight: '800' },
  featureBox: {
    backgroundColor: theme.card,
    borderRadius: 14,
    padding: 16,
    borderWidth: 1,
    borderColor: theme.border,
  },
  featureItem: { color: theme.mutedText, fontSize: 14, lineHeight: 26 },
  bottomBar: {
    flexDirection: 'row',
    padding: 16,
    paddingBottom: 24,
    backgroundColor: theme.card,
    borderTopWidth: 1,
    borderTopColor: theme.border,
    gap: 12,
  },
  cartBtn: {
    flex: 1,
    height: 52,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: theme.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cartBtnText: { color: theme.primary, fontSize: 15, fontWeight: '800' },
  buyBtn: {
    flex: 1,
    height: 52,
    borderRadius: 12,
    backgroundColor: theme.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buyBtnText: { color: theme.text, fontSize: 15, fontWeight: '800' },
});

export default ProductDetailScreen;
