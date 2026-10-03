import React, { useCallback, useMemo, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  FlatList,
  StatusBar,
  Image,
  ListRenderItem,
  useWindowDimensions,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { CompositeNavigationProp, useNavigation } from '@react-navigation/native';
import { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { MainTabParamList, RootStackParamList } from '../../../types/navigation';
import { useTheme } from '../../../context/ThemeContext';
import AppHeader from '../../components/AppHeader';
import { AppTheme } from '../../theme/theme';
import { useFavorites } from '../../../context/FavoritesContext';
import { useCart } from '../../../context/CartContext';

import { FilterState, INITIAL_FILTER_STATE, Product } from '../../types/filter';
import { MOCK_PRODUCTS } from '../../data/mockProducts';
import { countActiveFilters, filterAndSortProducts } from '../../utils/filterUtils';
import FilterDrawer from '../../components/FilterDrawer';
import ActiveFilterChips from '../../components/ActiveFilterChips';

type HomeNavigationProp = CompositeNavigationProp<
  BottomTabNavigationProp<MainTabParamList, 'Home'>,
  NativeStackNavigationProp<RootStackParamList>
>;

const HomeScreen = () => {
  const { theme } = useTheme();
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();
  const navigation = useNavigation<HomeNavigationProp>();
  const { isFavorite, toggleFavorite } = useFavorites();
  const { totalItems } = useCart();

  // Filter drawer state
  const [filterDrawerVisible, setFilterDrawerVisible] = useState(false);
  const [activeFilters, setActiveFilters] = useState<FilterState>(INITIAL_FILTER_STATE);

  const activeFilterCount = useMemo(
    () => countActiveFilters(activeFilters),
    [activeFilters]
  );

  // Compute filtered and sorted product list
  const filteredProducts = useMemo(
    () => filterAndSortProducts(MOCK_PRODUCTS, activeFilters),
    [activeFilters]
  );

  // Responsive layout math
  const cardWidth = Math.max(140, (width - 52) / 2);
  const styles = createStyles(theme, cardWidth);

  // Individual chip removal callbacks
  const handleRemoveGender = () =>
    setActiveFilters((prev) => ({ ...prev, gender: 'All' }));

  const handleRemoveCategory = (cat: string) =>
    setActiveFilters((prev) => ({
      ...prev,
      categories: prev.categories.filter((c) => c !== cat),
    }));

  const handleRemoveBrand = (brand: string) =>
    setActiveFilters((prev) => ({
      ...prev,
      brands: prev.brands.filter((b) => b !== brand),
    }));

  const handleRemoveSize = (size: number) =>
    setActiveFilters((prev) => ({
      ...prev,
      sizes: prev.sizes.filter((s) => s !== size),
    }));

  const handleRemoveColor = (hex: string) =>
    setActiveFilters((prev) => ({
      ...prev,
      colors: prev.colors.filter((c) => c.toLowerCase() !== hex.toLowerCase()),
    }));

  const handleResetPrice = () =>
    setActiveFilters((prev) => ({ ...prev, priceRange: INITIAL_FILTER_STATE.priceRange }));

  const handleResetSort = () =>
    setActiveFilters((prev) => ({ ...prev, sortBy: 'newest' }));

  const handleClearAllFilters = () => setActiveFilters(INITIAL_FILTER_STATE);

  const renderProduct: ListRenderItem<Product> = useCallback(
    ({ item }) => {
      const liked = isFavorite(item.id);

      return (
        <TouchableOpacity
          style={styles.card}
          activeOpacity={0.9}
          onPress={() => navigation.navigate('ProductDetail', { product: item })}
        >
          <View style={styles.imageBox}>
            <Image source={{ uri: item.image }} style={styles.productImage} resizeMode="cover" />
            {item.tag ? (
              <View style={[styles.tag, { backgroundColor: item.tagColor || theme.primary }]}>
                <Text style={styles.tagText}>{item.tag}</Text>
              </View>
            ) : null}
            <TouchableOpacity
              accessibilityRole="button"
              accessibilityLabel={`Toggle favorite for ${item.name}`}
              style={styles.heartBtn}
              onPress={() => toggleFavorite(item)}
              activeOpacity={0.7}
            >
              <Text style={styles.heartIcon}>{liked ? '❤️' : '🤍'}</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.cardBody}>
            <Text style={styles.brandSubtitle}>{item.brand}</Text>
            <Text style={styles.productName} numberOfLines={1}>
              {item.name}
            </Text>
            <Text style={styles.productPrice}>PKR {item.price.toLocaleString()}</Text>
          </View>
        </TouchableOpacity>
      );
    },
    [isFavorite, navigation, styles, theme.primary, toggleFavorite]
  );

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <StatusBar
        barStyle={theme.statusBar}
        backgroundColor={theme.background}
        translucent={false}
      />

      {/* App Header with Filter Button on Left and Cart Button on Right */}
      <AppHeader
        left={
          <View style={styles.leftHeaderActions}>
            {/* Filter Drawer Toggle Button */}
            <TouchableOpacity
              accessibilityRole="button"
              accessibilityLabel="Open filter drawer"
              style={[
                styles.filterBtn,
                activeFilterCount > 0 && styles.filterBtnActive,
              ]}
              onPress={() => setFilterDrawerVisible(true)}
              activeOpacity={0.8}
            >
              <Image
                source={require('../../asset/filter.png')}
                style={styles.filterIcon}
                resizeMode="contain"
              />
              <Text
                style={[
                  styles.filterBtnText,
                  activeFilterCount > 0 && styles.filterBtnTextActive,
                ]}
              >
                Filter
              </Text>
              {activeFilterCount > 0 && (
                <View style={styles.filterBadge}>
                  <Text style={styles.filterBadgeText}>{activeFilterCount}</Text>
                </View>
              )}
            </TouchableOpacity>
          </View>
        }
        right={
          <TouchableOpacity
            accessibilityRole="button"
            accessibilityLabel="Open cart"
            style={styles.cartBtn}
            onPress={() => navigation.navigate('AddToCart')}
            activeOpacity={0.8}
          >
            <Text style={styles.cartIcon}>🛒</Text>
            {totalItems > 0 ? (
              <View style={styles.badge}>
                <Text style={styles.badgeText}>{totalItems > 99 ? '99+' : totalItems}</Text>
              </View>
            ) : null}
          </TouchableOpacity>
        }
      />

      {/* Active Filter Chips Bar */}
      <ActiveFilterChips
        filters={activeFilters}
        onRemoveGender={handleRemoveGender}
        onRemoveCategory={handleRemoveCategory}
        onRemoveBrand={handleRemoveBrand}
        onRemoveSize={handleRemoveSize}
        onRemoveColor={handleRemoveColor}
        onResetPrice={handleResetPrice}
        onResetSort={handleResetSort}
        onClearAll={handleClearAllFilters}
      />

      {/* Product Grid */}
      <FlatList
        data={filteredProducts}
        renderItem={renderProduct}
        keyExtractor={(item) => item.id}
        numColumns={2}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[
          styles.scroll,
          {
            paddingBottom: insets.bottom + 90,
          },
        ]}
        ListHeaderComponent={
          <View style={styles.sectionRow}>
            <View>
              <Text style={styles.sectionTitle}>Featured Shoes</Text>
              <Text style={styles.productCountText}>
                {filteredProducts.length} {filteredProducts.length === 1 ? 'Product' : 'Products'} found
              </Text>
            </View>
            {activeFilterCount > 0 && (
              <TouchableOpacity onPress={handleClearAllFilters}>
                <Text style={styles.resetLinkText}>Reset Filters</Text>
              </TouchableOpacity>
            )}
          </View>
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyIcon}>👟</Text>
            <Text style={styles.emptyTitle}>No Shoes Found</Text>
            <Text style={styles.emptySub}>
              Try adjusting or clearing your filters to see more results.
            </Text>
            <TouchableOpacity
              style={styles.emptyResetBtn}
              onPress={handleClearAllFilters}
              activeOpacity={0.8}
            >
              <Text style={styles.emptyResetBtnText}>Clear All Filters</Text>
            </TouchableOpacity>
          </View>
        }
        columnWrapperStyle={filteredProducts.length > 0 ? styles.gridRow : undefined}
      />

      {/* Left Filter Drawer Component */}
      <FilterDrawer
        visible={filterDrawerVisible}
        onClose={() => setFilterDrawerVisible(false)}
        activeFilters={activeFilters}
        onApplyFilters={setActiveFilters}
        products={MOCK_PRODUCTS}
      />
    </SafeAreaView>
  );
};

const createStyles = (theme: AppTheme, cardWidth: number) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.background,
    },
    leftHeaderActions: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
    },
    filterBtn: {
      flexDirection: 'row',
      alignItems: 'center',
      height: 42,
      paddingHorizontal: 12,
      borderRadius: 21,
      backgroundColor: theme.card,
      borderWidth: 1,
      borderColor: theme.border,
      gap: 6,
    },
    filterBtnActive: {
      backgroundColor: theme.card,
      borderColor: theme.primary,
    },
    filterIcon: {
      width: 17,
      height: 17,
    },
    filterBtnText: {
      color: theme.text,
      fontSize: 13,
      fontWeight: '600',
    },
    filterBtnTextActive: {
      color: theme.primary,
      fontWeight: '700',
    },
    filterBadge: {
      backgroundColor: theme.primary,
      width: 18,
      height: 18,
      borderRadius: 9,
      alignItems: 'center',
      justifyContent: 'center',
      marginLeft: 2,
    },
    filterBadgeText: {
      color: '#FFFFFF',
      fontSize: 10,
      fontWeight: '800',
    },
    cartBtn: {
      width: 44,
      height: 44,
      borderRadius: 22,
      backgroundColor: theme.card,
      alignItems: 'center',
      justifyContent: 'center',
      borderWidth: 1,
      borderColor: theme.border,
    },
    cartIcon: {
      fontSize: 18,
    },
    badge: {
      position: 'absolute',
      top: -2,
      right: -2,
      backgroundColor: theme.primary,
      width: 18,
      height: 18,
      borderRadius: 9,
      alignItems: 'center',
      justifyContent: 'center',
    },
    badgeText: {
      color: '#FFFFFF',
      fontSize: 10,
      fontWeight: '800',
    },
    scroll: {
      paddingHorizontal: 12,
    },
    sectionRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginTop: 12,
      marginBottom: 16,
      paddingHorizontal: 4,
    },
    sectionTitle: {
      color: theme.text,
      fontSize: 20,
      fontWeight: '800',
    },
    productCountText: {
      color: theme.mutedText,
      fontSize: 12,
      fontWeight: '500',
      marginTop: 2,
    },
    resetLinkText: {
      color: theme.primary,
      fontSize: 13,
      fontWeight: '700',
    },
    gridRow: {
      justifyContent: 'space-between',
    },
    card: {
      width: cardWidth,
      backgroundColor: theme.card,
      borderRadius: 16,
      marginBottom: 16,
      overflow: 'hidden',
      borderWidth: 1,
      borderColor: theme.border,
    },
    imageBox: {
      width: '100%',
      aspectRatio: 1,
      backgroundColor: '#F0F0F0',
      overflow: 'hidden',
    },
    productImage: {
      width: '100%',
      height: '100%',
    },
    tag: {
      position: 'absolute',
      top: 10,
      left: 10,
      paddingHorizontal: 8,
      paddingVertical: 3,
      borderRadius: 6,
    },
    tagText: {
      fontSize: 9,
      fontWeight: '800',
      letterSpacing: 0.5,
      color: '#FFFFFF',
    },
    heartBtn: {
      position: 'absolute',
      top: 10,
      right: 10,
      width: 32,
      height: 32,
      borderRadius: 16,
      backgroundColor: 'rgba(255,255,255,0.9)',
      alignItems: 'center',
      justifyContent: 'center',
    },
    heartIcon: {
      fontSize: 15,
    },
    cardBody: {
      padding: 12,
    },
    brandSubtitle: {
      color: theme.mutedText,
      fontSize: 11,
      fontWeight: '600',
      textTransform: 'uppercase',
      letterSpacing: 0.5,
      marginBottom: 2,
    },
    productName: {
      color: theme.text,
      fontSize: 14,
      fontWeight: '700',
      marginBottom: 4,
    },
    productPrice: {
      color: theme.primary,
      fontSize: 15,
      fontWeight: '800',
    },
    emptyContainer: {
      paddingVertical: 60,
      alignItems: 'center',
      justifyContent: 'center',
      paddingHorizontal: 20,
    },
    emptyIcon: {
      fontSize: 48,
      marginBottom: 12,
    },
    emptyTitle: {
      color: theme.text,
      fontSize: 18,
      fontWeight: '800',
      marginBottom: 6,
    },
    emptySub: {
      color: theme.mutedText,
      fontSize: 13,
      textAlign: 'center',
      marginBottom: 20,
    },
    emptyResetBtn: {
      paddingHorizontal: 20,
      paddingVertical: 12,
      borderRadius: 20,
      backgroundColor: theme.primary,
    },
    emptyResetBtnText: {
      color: '#FFFFFF',
      fontSize: 13,
      fontWeight: '700',
    },
  });

export default HomeScreen;
