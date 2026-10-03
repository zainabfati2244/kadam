import React, { useMemo, useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  StatusBar,
  Dimensions,
  Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../../types/navigation';
import { useTheme } from '../../../context/ThemeContext';
import AppHeader from '../../components/AppHeader';
import { AppTheme } from '../../theme/theme';

import { FilterState, INITIAL_FILTER_STATE } from '../../types/filter';
import { MOCK_PRODUCTS } from '../../data/mockProducts';
import {
  countActiveFilters,
  filterAndSortProducts,
} from '../../utils/filterUtils';
import FilterDrawer from '../../components/FilterDrawer';
import ActiveFilterChips from '../../components/ActiveFilterChips';

const { width } = Dimensions.get('window');
const CARD_WIDTH = (width - 40) / 2;

const SearchScreen = () => {
  const { theme } = useTheme();
  const styles = createStyles(theme);
  const navigation =
    useNavigation<NativeStackNavigationProp<RootStackParamList>>();

  const [query, setQuery] = useState('');
  const [filterDrawerVisible, setFilterDrawerVisible] = useState(false);
  const [activeFilters, setActiveFilters] =
    useState<FilterState>(INITIAL_FILTER_STATE);

  const activeFilterCount = useMemo(
    () => countActiveFilters(activeFilters),
    [activeFilters],
  );

  // Combined search query + filter drawer criteria
  const filteredProducts = useMemo(() => {
    let result = filterAndSortProducts(MOCK_PRODUCTS, activeFilters);
    if (query.trim().length > 0) {
      const q = query.toLowerCase();
      result = result.filter(
        p =>
          p.name.toLowerCase().includes(q) ||
          p.brand.toLowerCase().includes(q) ||
          p.category.toLowerCase().includes(q),
      );
    }
    return result;
  }, [query, activeFilters]);

  const handleClearAllFilters = () => {
    setActiveFilters(INITIAL_FILTER_STATE);
  };

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar
        barStyle={theme.statusBar}
        backgroundColor={theme.background}
      />

      <AppHeader />

      <View style={styles.header}>
        <Text style={styles.title}>Search & Discover</Text>
      </View>

      {/* Search Input Bar + Filter Trigger */}
      <View style={styles.searchRow}>
        <View style={styles.searchBox}>
          <Text style={styles.searchIcon}>🔍</Text>
          <TextInput
            style={styles.searchInput}
            placeholder="Search brand, sneakers, style..."
            placeholderTextColor={theme.mutedText}
            value={query}
            onChangeText={setQuery}
            selectionColor={theme.primary}
            autoCapitalize="none"
          />
          {query.length > 0 && (
            <TouchableOpacity onPress={() => setQuery('')}>
              <Text style={styles.clear}>✕</Text>
            </TouchableOpacity>
          )}
        </View>

        <TouchableOpacity
          style={[
            styles.filterTriggerBtn,
            activeFilterCount > 0 && styles.filterTriggerBtnActive,
          ]}
          onPress={() => setFilterDrawerVisible(true)}
          activeOpacity={0.8}
        >
          <Image
            source={require('../../asset/filter.png')}
            style={styles.filterTriggerIcon}
            resizeMode="contain"
          />
          {activeFilterCount > 0 && (
            <View style={styles.filterBadge}>
              <Text style={styles.filterBadgeText}>{activeFilterCount}</Text>
            </View>
          )}
        </TouchableOpacity>
      </View>

      {/* Active Filter Chips */}
      <ActiveFilterChips
        filters={activeFilters}
        onRemoveGender={() =>
          setActiveFilters(prev => ({ ...prev, gender: 'All' }))
        }
        onRemoveCategory={cat =>
          setActiveFilters(prev => ({
            ...prev,
            categories: prev.categories.filter(c => c !== cat),
          }))
        }
        onRemoveBrand={brand =>
          setActiveFilters(prev => ({
            ...prev,
            brands: prev.brands.filter(b => b !== brand),
          }))
        }
        onRemoveSize={size =>
          setActiveFilters(prev => ({
            ...prev,
            sizes: prev.sizes.filter(s => s !== size),
          }))
        }
        onRemoveColor={hex =>
          setActiveFilters(prev => ({
            ...prev,
            colors: prev.colors.filter(
              c => c.toLowerCase() !== hex.toLowerCase(),
            ),
          }))
        }
        onResetPrice={() =>
          setActiveFilters(prev => ({
            ...prev,
            priceRange: INITIAL_FILTER_STATE.priceRange,
          }))
        }
        onResetSort={() =>
          setActiveFilters(prev => ({ ...prev, sortBy: 'newest' }))
        }
        onClearAll={handleClearAllFilters}
      />

      <ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <Text style={styles.resultCount}>
          {filteredProducts.length} result
          {filteredProducts.length !== 1 ? 's' : ''} found
        </Text>

        <View style={styles.grid}>
          {filteredProducts.map(item => (
            <TouchableOpacity
              key={item.id}
              style={styles.card}
              activeOpacity={0.9}
              onPress={() =>
                navigation.navigate('ProductDetail', {
                  product: item,
                })
              }
            >
              <View style={styles.imageBox}>
                <Image
                  source={{ uri: item.image }}
                  style={styles.productImage}
                  resizeMode="cover"
                />
                {item.tag && (
                  <View
                    style={[
                      styles.tag,
                      { backgroundColor: item.tagColor || theme.primary },
                    ]}
                  >
                    <Text style={styles.tagText}>{item.tag}</Text>
                  </View>
                )}
              </View>

              <View style={styles.cardBody}>
                <Text style={styles.brandSub}>{item.brand}</Text>
                <Text style={styles.productName} numberOfLines={1}>
                  {item.name}
                </Text>
                <Text style={styles.productPrice}>
                  PKR {item.price.toLocaleString()}
                </Text>
              </View>
            </TouchableOpacity>
          ))}
        </View>

        {filteredProducts.length === 0 && (
          <View style={styles.empty}>
            <Text style={styles.emptyText}>
              No products match your criteria
            </Text>
            <TouchableOpacity
              style={styles.emptyBtn}
              onPress={handleClearAllFilters}
            >
              <Text style={styles.emptyBtnText}>Reset Filters</Text>
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>

      {/* Filter Drawer */}
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

const createStyles = (theme: AppTheme) =>
  StyleSheet.create({
    safe: { flex: 1, backgroundColor: theme.background },
    header: {
      paddingHorizontal: 20,
      paddingTop: 6,
      paddingBottom: 4,
      backgroundColor: theme.background,
    },
    title: {
      color: theme.text,
      fontSize: 24,
      fontWeight: '800',
    },
    searchRow: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: 20,
      marginTop: 8,
      marginBottom: 8,
      gap: 10,
    },
    searchBox: {
      flex: 1,
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: theme.card,
      borderRadius: 14,
      paddingHorizontal: 14,
      borderWidth: 1,
      borderColor: theme.border,
      height: 48,
    },
    searchIcon: { fontSize: 16, marginRight: 8 },
    searchInput: {
      flex: 1,
      paddingVertical: 8,
      fontSize: 14,
      color: theme.text,
    },
    clear: {
      color: theme.mutedText,
      fontSize: 16,
      padding: 4,
    },
    filterTriggerBtn: {
      width: 48,
      height: 48,
      borderRadius: 14,
      backgroundColor: theme.card,
      borderWidth: 1,
      borderColor: theme.border,
      alignItems: 'center',
      justifyContent: 'center',
    },
    filterTriggerBtnActive: {
      borderColor: theme.primary,
    },
    filterTriggerIcon: {
      width: 20,
      height: 20,
    },
    filterBadge: {
      position: 'absolute',
      top: -3,
      right: -3,
      backgroundColor: theme.primary,
      width: 18,
      height: 18,
      borderRadius: 9,
      alignItems: 'center',
      justifyContent: 'center',
    },
    filterBadgeText: {
      color: '#FFFFFF',
      fontSize: 10,
      fontWeight: '800',
    },
    scroll: { paddingBottom: 40 },
    resultCount: {
      color: theme.mutedText,
      fontSize: 13,
      paddingHorizontal: 20,
      marginBottom: 12,
      marginTop: 8,
    },
    grid: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      paddingHorizontal: 12,
      justifyContent: 'space-between',
    },
    card: {
      width: CARD_WIDTH,
      backgroundColor: theme.card,
      borderRadius: 16,
      marginBottom: 16,
      overflow: 'hidden',
      borderWidth: 1,
      borderColor: theme.border,
    },
    imageBox: {
      height: 170,
      width: '100%',
      backgroundColor: theme.card,
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
    cardBody: { padding: 12 },
    brandSub: {
      color: theme.mutedText,
      fontSize: 10,
      fontWeight: '600',
      textTransform: 'uppercase',
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
    empty: {
      alignItems: 'center',
      marginTop: 40,
      paddingHorizontal: 20,
    },
    emptyText: {
      color: theme.mutedText,
      fontSize: 15,
      marginBottom: 12,
    },
    emptyBtn: {
      paddingHorizontal: 16,
      paddingVertical: 10,
      borderRadius: 12,
      backgroundColor: theme.primary,
    },
    emptyBtnText: {
      color: '#FFFFFF',
      fontSize: 13,
      fontWeight: '700',
    },
  });

export default SearchScreen;
