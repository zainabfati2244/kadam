import React, { useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Modal,
  Animated,
  Dimensions,
  TouchableWithoutFeedback,
  StatusBar,
  TextInput,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../../context/ThemeContext';
import { AppTheme } from '../theme/theme';
import {
  Category,
  CATEGORY_OPTIONS,
  COLOR_OPTIONS,
  DEFAULT_PRICE_RANGE,
  FilterState,
  Gender,
  GENDER_OPTIONS,
  INITIAL_FILTER_STATE,
  Product,
  SIZE_OPTIONS,
  SortOption,
  SORT_OPTIONS,
} from '../types/filter';
import { filterAndSortProducts } from '../utils/filterUtils';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const DRAWER_WIDTH = Math.min(SCREEN_WIDTH * 0.85, 360);

interface FilterDrawerProps {
  visible: boolean;
  onClose: () => void;
  activeFilters: FilterState;
  onApplyFilters: (filters: FilterState) => void;
  products: Product[];
}

export default function FilterDrawer({
  visible,
  onClose,
  activeFilters,
  onApplyFilters,
  products,
}: FilterDrawerProps) {
  const { theme } = useTheme();
  const insets = useSafeAreaInsets();
  const styles = createStyles(theme, insets.top, insets.bottom);

  // Local draft state inside drawer before applying
  const [draftFilters, setDraftFilters] = useState<FilterState>(activeFilters);

  // Animation references
  const translateX = useRef(new Animated.Value(-DRAWER_WIDTH)).current;
  const backdropOpacity = useRef(new Animated.Value(0)).current;

  // Synchronize draft state when drawer opens
  useEffect(() => {
    if (visible) {
      setDraftFilters(activeFilters);
      // Animate left drawer in
      Animated.parallel([
        Animated.timing(translateX, {
          toValue: 0,
          duration: 250,
          useNativeDriver: true,
        }),
        Animated.timing(backdropOpacity, {
          toValue: 1,
          duration: 250,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      // Animate out
      Animated.parallel([
        Animated.timing(translateX, {
          toValue: -DRAWER_WIDTH,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.timing(backdropOpacity, {
          toValue: 0,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [visible, activeFilters, translateX, backdropOpacity]);

  const handleClose = () => {
    Animated.parallel([
      Animated.timing(translateX, {
        toValue: -DRAWER_WIDTH,
        duration: 200,
        useNativeDriver: true,
      }),
      Animated.timing(backdropOpacity, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }),
    ]).start(() => {
      onClose();
    });
  };

  const handleApply = () => {
    onApplyFilters(draftFilters);
    handleClose();
  };

  const handleClearAll = () => {
    setDraftFilters(INITIAL_FILTER_STATE);
  };

  // Calculate matching products live for the current draft selection
  const matchingProductsCount = filterAndSortProducts(products, draftFilters).length;

  // Handlers for filter options
  const toggleGender = (gender: Gender | 'All') => {
    setDraftFilters((prev) => ({ ...prev, gender }));
  };

  const toggleCategory = (cat: Category) => {
    setDraftFilters((prev) => {
      const exists = prev.categories.includes(cat);
      return {
        ...prev,
        categories: exists
          ? prev.categories.filter((c) => c !== cat)
          : [...prev.categories, cat],
      };
    });
  };

 
  const toggleSize = (size: number) => {
    setDraftFilters((prev) => {
      const exists = prev.sizes.includes(size);
      return {
        ...prev,
        sizes: exists
          ? prev.sizes.filter((s) => s !== size)
          : [...prev.sizes, size],
      };
    });
  };

  const toggleColor = (hex: string) => {
    setDraftFilters((prev) => {
      const exists = prev.colors.some((c) => c.toLowerCase() === hex.toLowerCase());
      return {
        ...prev,
        colors: exists
          ? prev.colors.filter((c) => c.toLowerCase() !== hex.toLowerCase())
          : [...prev.colors, hex],
      };
    });
  };

  const setSortBy = (sortBy: SortOption) => {
    setDraftFilters((prev) => ({ ...prev, sortBy }));
  };

  const setMinPrice = (val: string) => {
    const num = parseInt(val.replace(/[^0-9]/g, ''), 10) || 0;
    setDraftFilters((prev) => ({
      ...prev,
      priceRange: [num, prev.priceRange[1]],
    }));
  };

  const setMaxPrice = (val: string) => {
    const num = parseInt(val.replace(/[^0-9]/g, ''), 10) || DEFAULT_PRICE_RANGE[1];
    setDraftFilters((prev) => ({
      ...prev,
      priceRange: [prev.priceRange[0], num],
    }));
  };

  const setPricePreset = (min: number, max: number) => {
    setDraftFilters((prev) => ({ ...prev, priceRange: [min, max] }));
  };

  if (!visible) return null;

  return (
    <Modal visible={visible} transparent animationType="none" onRequestClose={handleClose}>
      <StatusBar barStyle={theme.statusBar} />
      <View style={styles.overlayContainer}>
        {/* Semi-transparent Backdrop Overlay */}
        <TouchableWithoutFeedback onPress={handleClose}>
          <Animated.View style={[styles.backdrop, { opacity: backdropOpacity }]} />
        </TouchableWithoutFeedback>

        {/* Sliding Left Drawer */}
        <Animated.View
          style={[
            styles.drawerContent,
            { transform: [{ translateX }] },
          ]}
        >
          {/* STICKY HEADER */}
          <View style={styles.header}>
            <View style={styles.titleRow}>
              <Text style={styles.headerTitle}>Filters</Text>
              {matchingProductsCount !== products.length && (
                <View style={styles.countBadge}>
                  <Text style={styles.countBadgeText}>{matchingProductsCount}</Text>
                </View>
              )}
            </View>
            <TouchableOpacity
              onPress={handleClose}
              style={styles.closeBtn}
              accessibilityRole="button"
              accessibilityLabel="Close filters"
            >
              <Text style={styles.closeBtnText}>✕</Text>
            </TouchableOpacity>
          </View>

          {/* SCROLLABLE FILTER SECTIONS */}
          <ScrollView
            style={styles.scrollBody}
            contentContainerStyle={styles.scrollInner}
            showsVerticalScrollIndicator={false}
          >
            {/* 1. GENDER (Radio / Chips) */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Gender</Text>
              <View style={styles.chipsRow}>
                {GENDER_OPTIONS.map((g) => {
                  const isSelected = draftFilters.gender === g;
                  return (
                    <TouchableOpacity
                      key={g}
                      style={[styles.chip, isSelected && styles.chipActive]}
                      onPress={() => toggleGender(g)}
                      activeOpacity={0.8}
                    >
                      <Text style={[styles.chipText, isSelected && styles.chipTextActive]}>
                        {g}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>

            {/* 2. CATEGORY (Multi-select) */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Category</Text>
              <View style={styles.chipsRow}>
                {CATEGORY_OPTIONS.map((cat) => {
                  const isSelected = draftFilters.categories.includes(cat);
                  return (
                    <TouchableOpacity
                      key={cat}
                      style={[styles.chip, isSelected && styles.chipActive]}
                      onPress={() => toggleCategory(cat)}
                      activeOpacity={0.8}
                    >
                      <Text style={[styles.chipText, isSelected && styles.chipTextActive]}>
                        {cat}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>

            {/* 3. SIZE (Multi-select Pills) */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Size (EU)</Text>
              <View style={styles.gridRow}>
                {SIZE_OPTIONS.map((size) => {
                  const isSelected = draftFilters.sizes.includes(size);
                  return (
                    <TouchableOpacity
                      key={size}
                      style={[styles.sizePill, isSelected && styles.sizePillActive]}
                      onPress={() => toggleSize(size)}
                      activeOpacity={0.8}
                    >
                      <Text style={[styles.sizePillText, isSelected && styles.sizePillTextActive]}>
                        {size}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>

            {/* 5. COLOR (Multi-select Color Dots) */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Color</Text>
              <View style={styles.colorRow}>
                {COLOR_OPTIONS.map((c) => {
                  const isSelected = draftFilters.colors.some(
                    (hex) => hex.toLowerCase() === c.hex.toLowerCase()
                  );
                  const isWhite = c.hex.toUpperCase() === '#FFFFFF';
                  return (
                    <TouchableOpacity
                      key={c.name}
                      style={[
                        styles.colorDotWrap,
                        isSelected && styles.colorDotWrapActive,
                        isWhite && styles.colorDotWrapWhite,
                      ]}
                      onPress={() => toggleColor(c.hex)}
                      activeOpacity={0.8}
                    >
                      <View
                        style={[
                          styles.colorDot,
                          { backgroundColor: c.hex },
                          isWhite && styles.colorDotWhite,
                        ]}
                      >
                        {isSelected && (
                          <Text style={[styles.colorCheckmark, isWhite && styles.colorCheckmarkWhite]}>
                            ✓
                          </Text>
                        )}
                      </View>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>

            {/* 6. PRICE RANGE (Min - Max in PKR) */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Price Range (PKR)</Text>
              <View style={styles.priceInputsRow}>
                <View style={styles.priceInputBox}>
                  <Text style={styles.priceInputLabel}>Min</Text>
                  <TextInput
                    style={styles.priceInput}
                    keyboardType="numeric"
                    value={draftFilters.priceRange[0].toString()}
                    onChangeText={setMinPrice}
                  />
                </View>
                <Text style={styles.priceDash}>-</Text>
                <View style={styles.priceInputBox}>
                  <Text style={styles.priceInputLabel}>Max</Text>
                  <TextInput
                    style={styles.priceInput}
                    keyboardType="numeric"
                    value={draftFilters.priceRange[1].toString()}
                    onChangeText={setMaxPrice}
                  />
                </View>
              </View>

              {/* Quick Presets */}
              <View style={styles.chipsRow}>
                <TouchableOpacity
                  style={styles.presetChip}
                  onPress={() => setPricePreset(0, 3000)}
                >
                  <Text style={styles.presetChipText}>Under 3,000</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.presetChip}
                  onPress={() => setPricePreset(3000, 3500)}
                >
                  <Text style={styles.presetChipText}>3,000 - 3,500</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.presetChip}
                  onPress={() => setPricePreset(3500, 10000)}
                >
                  <Text style={styles.presetChipText}>Above 3,500</Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* 7. SORT BY */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Sort By</Text>
              <View style={styles.sortList}>
                {SORT_OPTIONS.map((opt) => {
                  const isSelected = draftFilters.sortBy === opt.value;
                  return (
                    <TouchableOpacity
                      key={opt.value}
                      style={[styles.sortRow, isSelected && styles.sortRowActive]}
                      onPress={() => setSortBy(opt.value)}
                      activeOpacity={0.8}
                    >
                      <View style={[styles.radioCircle, isSelected && styles.radioCircleActive]}>
                        {isSelected && <View style={styles.radioDot} />}
                      </View>
                      <Text style={[styles.sortLabel, isSelected && styles.sortLabelActive]}>
                        {opt.label}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>
          </ScrollView>

          {/* STICKY FOOTER */}
          <View style={styles.footer}>
            <TouchableOpacity
              style={styles.clearBtn}
              onPress={handleClearAll}
              activeOpacity={0.8}
            >
              <Text style={styles.clearBtnText}>Clear All</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.applyBtn}
              onPress={handleApply}
              activeOpacity={0.9}
            >
              <Text style={styles.applyBtnText}>
                Apply ({matchingProductsCount})
              </Text>
            </TouchableOpacity>
          </View>
        </Animated.View>
      </View>
    </Modal>
  );
}

const createStyles = (theme: AppTheme, topInset: number, bottomInset: number) =>
  StyleSheet.create({
    overlayContainer: {
      flex: 1,
      flexDirection: 'row',
    },
    backdrop: {
      ...StyleSheet.absoluteFill,
      backgroundColor: 'rgba(0, 0, 0, 0.55)',
    },
    drawerContent: {
      width: DRAWER_WIDTH,
      height: '100%',
      backgroundColor: theme.background,
      elevation: 16,
      shadowColor: '#000',
      shadowOffset: { width: 4, height: 0 },
      shadowOpacity: 0.3,
      shadowRadius: 10,
      justifyContent: 'space-between',
    },
    header: {
      paddingTop: Math.max(topInset + 10, 20),
      paddingBottom: 16,
      paddingHorizontal: 20,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      borderBottomWidth: 1,
      borderBottomColor: theme.border,
      backgroundColor: theme.card,
    },
    titleRow: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    headerTitle: {
      color: theme.text,
      fontSize: 20,
      fontWeight: '800',
      letterSpacing: 0.4,
    },
    countBadge: {
      marginLeft: 10,
      backgroundColor: theme.primary,
      paddingHorizontal: 8,
      paddingVertical: 2,
      borderRadius: 12,
    },
    countBadgeText: {
      color: '#FFFFFF',
      fontSize: 12,
      fontWeight: '700',
    },
    closeBtn: {
      width: 36,
      height: 36,
      borderRadius: 18,
      backgroundColor: theme.background,
      alignItems: 'center',
      justifyContent: 'center',
      borderWidth: 1,
      borderColor: theme.border,
    },
    closeBtnText: {
      color: theme.text,
      fontSize: 16,
      fontWeight: '600',
    },
    scrollBody: {
      flex: 1,
    },
    scrollInner: {
      paddingHorizontal: 20,
      paddingTop: 16,
      paddingBottom: 30,
    },
    section: {
      marginBottom: 24,
    },
    sectionTitle: {
      color: theme.text,
      fontSize: 15,
      fontWeight: '700',
      marginBottom: 12,
      letterSpacing: 0.3,
    },
    chipsRow: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: 8,
    },
    chip: {
      paddingHorizontal: 14,
      paddingVertical: 8,
      borderRadius: 20,
      backgroundColor: theme.card,
      borderWidth: 1,
      borderColor: theme.border,
    },
    chipActive: {
      backgroundColor: theme.primary,
      borderColor: theme.primary,
    },
    chipText: {
      color: theme.text,
      fontSize: 13,
      fontWeight: '600',
    },
    chipTextActive: {
      color: '#FFFFFF',
      fontWeight: '700',
    },
    checkboxList: {
      gap: 10,
    },
    checkboxRow: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    checkbox: {
      width: 20,
      height: 20,
      borderRadius: 4,
      borderWidth: 2,
      borderColor: theme.mutedText,
      alignItems: 'center',
      justifyContent: 'center',
      marginRight: 10,
    },
    checkboxActive: {
      backgroundColor: theme.primary,
      borderColor: theme.primary,
    },
    checkmark: {
      color: '#FFFFFF',
      fontSize: 12,
      fontWeight: '900',
    },
    checkboxLabel: {
      color: theme.text,
      fontSize: 14,
      fontWeight: '500',
    },
    gridRow: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: 10,
    },
    sizePill: {
      width: 48,
      height: 40,
      borderRadius: 10,
      backgroundColor: theme.card,
      borderWidth: 1,
      borderColor: theme.border,
      alignItems: 'center',
      justifyContent: 'center',
    },
    sizePillActive: {
      backgroundColor: theme.primary,
      borderColor: theme.primary,
    },
    sizePillText: {
      color: theme.text,
      fontSize: 14,
      fontWeight: '600',
    },
    sizePillTextActive: {
      color: '#FFFFFF',
      fontWeight: '700',
    },
    colorRow: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: 12,
    },
    colorDotWrap: {
      width: 38,
      height: 38,
      borderRadius: 19,
      padding: 3,
      borderWidth: 2,
      borderColor: 'transparent',
      alignItems: 'center',
      justifyContent: 'center',
    },
    colorDotWrapActive: {
      borderColor: theme.primary,
    },
    colorDotWrapWhite: {
      borderColor: theme.border,
    },
    colorDot: {
      width: 28,
      height: 28,
      borderRadius: 14,
      alignItems: 'center',
      justifyContent: 'center',
    },
    colorDotWhite: {
      borderWidth: 1,
      borderColor: '#CCCCCC',
    },
    colorCheckmark: {
      color: '#FFFFFF',
      fontSize: 14,
      fontWeight: '900',
    },
    colorCheckmarkWhite: {
      color: '#000000',
    },
    priceInputsRow: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: 10,
    },
    priceInputBox: {
      flex: 1,
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: theme.card,
      borderWidth: 1,
      borderColor: theme.border,
      borderRadius: 10,
      paddingHorizontal: 10,
      height: 42,
    },
    priceInputLabel: {
      color: theme.mutedText,
      fontSize: 12,
      marginRight: 6,
    },
    priceInput: {
      flex: 1,
      color: theme.text,
      fontSize: 14,
      fontWeight: '600',
      paddingVertical: 0,
    },
    priceDash: {
      marginHorizontal: 8,
      color: theme.mutedText,
      fontSize: 16,
      fontWeight: '700',
    },
    presetChip: {
      paddingHorizontal: 10,
      paddingVertical: 6,
      borderRadius: 14,
      backgroundColor: theme.card,
      borderWidth: 1,
      borderColor: theme.border,
    },
    presetChipText: {
      color: theme.mutedText,
      fontSize: 11,
      fontWeight: '600',
    },
    sortList: {
      gap: 12,
    },
    sortRow: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingVertical: 8,
      paddingHorizontal: 12,
      borderRadius: 10,
      backgroundColor: theme.card,
      borderWidth: 1,
      borderColor: theme.border,
    },
    sortRowActive: {
      borderColor: theme.primary,
    },
    radioCircle: {
      width: 18,
      height: 18,
      borderRadius: 9,
      borderWidth: 2,
      borderColor: theme.mutedText,
      alignItems: 'center',
      justifyContent: 'center',
      marginRight: 10,
    },
    radioCircleActive: {
      borderColor: theme.primary,
    },
    radioDot: {
      width: 10,
      height: 10,
      borderRadius: 5,
      backgroundColor: theme.primary,
    },
    sortLabel: {
      color: theme.text,
      fontSize: 13,
      fontWeight: '500',
    },
    sortLabelActive: {
      fontWeight: '700',
      color: theme.text,
    },
    footer: {
      paddingHorizontal: 20,
      paddingTop: 14,
      paddingBottom: Math.max(bottomInset + 10, 16),
      flexDirection: 'row',
      gap: 12,
      borderTopWidth: 1,
      borderTopColor: theme.border,
      backgroundColor: theme.card,
    },
    clearBtn: {
      flex: 1,
      height: 48,
      borderRadius: 12,
      borderWidth: 1,
      borderColor: theme.border,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: theme.background,
    },
    clearBtnText: {
      color: theme.text,
      fontSize: 14,
      fontWeight: '700',
    },
    applyBtn: {
      flex: 1.5,
      height: 48,
      borderRadius: 12,
      backgroundColor: theme.primary,
      alignItems: 'center',
      justifyContent: 'center',
    },
    applyBtnText: {
      color: '#FFFFFF',
      fontSize: 14,
      fontWeight: '800',
    },
  });
