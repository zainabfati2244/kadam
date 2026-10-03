import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { useTheme } from '../../context/ThemeContext';
import { AppTheme } from '../theme/theme';
import { COLOR_OPTIONS, DEFAULT_PRICE_RANGE, FilterState } from '../types/filter';
import { countActiveFilters } from '../utils/filterUtils';

interface ActiveFilterChipsProps {
  filters: FilterState;
  onRemoveGender: () => void;
  onRemoveCategory: (category: string) => void;
  onRemoveBrand: (brand: string) => void;
  onRemoveSize: (size: number) => void;
  onRemoveColor: (hex: string) => void;
  onResetPrice: () => void;
  onResetSort: () => void;
  onClearAll: () => void;
}

export default function ActiveFilterChips({
  filters,
  onRemoveGender,
  onRemoveCategory,
  onRemoveBrand,
  onRemoveSize,
  onRemoveColor,
  onResetPrice,
  onResetSort,
  onClearAll,
}: ActiveFilterChipsProps) {
  const { theme } = useTheme();
  const styles = createStyles(theme);
  const activeCount = countActiveFilters(filters);

  if (activeCount === 0) return null;

  return (
    <View style={styles.container}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollInner}
      >
        <TouchableOpacity style={styles.clearAllChip} onPress={onClearAll}>
          <Text style={styles.clearAllText}>Clear All ({activeCount})</Text>
        </TouchableOpacity>

        {/* Gender Chip */}
        {filters.gender !== 'All' && (
          <TouchableOpacity style={styles.chip} onPress={onRemoveGender}>
            <Text style={styles.chipText}>Gender: {filters.gender}</Text>
            <Text style={styles.removeIcon}>✕</Text>
          </TouchableOpacity>
        )}

        {/* Category Chips */}
        {filters.categories.map((cat) => (
          <TouchableOpacity
            key={`cat-${cat}`}
            style={styles.chip}
            onPress={() => onRemoveCategory(cat)}
          >
            <Text style={styles.chipText}>{cat}</Text>
            <Text style={styles.removeIcon}>✕</Text>
          </TouchableOpacity>
        ))}

        {/* Brand Chips */}
        {filters.brands.map((brand) => (
          <TouchableOpacity
            key={`brand-${brand}`}
            style={styles.chip}
            onPress={() => onRemoveBrand(brand)}
          >
            <Text style={styles.chipText}>{brand}</Text>
            <Text style={styles.removeIcon}>✕</Text>
          </TouchableOpacity>
        ))}

        {/* Size Chips */}
        {filters.sizes.map((size) => (
          <TouchableOpacity
            key={`size-${size}`}
            style={styles.chip}
            onPress={() => onRemoveSize(size)}
          >
            <Text style={styles.chipText}>Size: {size}</Text>
            <Text style={styles.removeIcon}>✕</Text>
          </TouchableOpacity>
        ))}

        {/* Color Chips */}
        {filters.colors.map((hex) => {
          const matched = COLOR_OPTIONS.find(
            (c) => c.hex.toLowerCase() === hex.toLowerCase()
          );
          const name = matched ? matched.name : hex;
          return (
            <TouchableOpacity
              key={`color-${hex}`}
              style={styles.chip}
              onPress={() => onRemoveColor(hex)}
            >
              <View style={[styles.colorDot, { backgroundColor: hex }]} />
              <Text style={styles.chipText}>{name}</Text>
              <Text style={styles.removeIcon}>✕</Text>
            </TouchableOpacity>
          );
        })}

        {/* Price Range Chip */}
        {(filters.priceRange[0] > DEFAULT_PRICE_RANGE[0] ||
          filters.priceRange[1] < DEFAULT_PRICE_RANGE[1]) && (
          <TouchableOpacity style={styles.chip} onPress={onResetPrice}>
            <Text style={styles.chipText}>
              PKR {filters.priceRange[0]} - {filters.priceRange[1]}
            </Text>
            <Text style={styles.removeIcon}>✕</Text>
          </TouchableOpacity>
        )}

        {/* Sort Chip */}
        {filters.sortBy !== 'newest' && (
          <TouchableOpacity style={styles.chip} onPress={onResetSort}>
            <Text style={styles.chipText}>Sort: {filters.sortBy.replace('_', ' ')}</Text>
            <Text style={styles.removeIcon}>✕</Text>
          </TouchableOpacity>
        )}
      </ScrollView>
    </View>
  );
}

const createStyles = (theme: AppTheme) =>
  StyleSheet.create({
    container: {
      paddingVertical: 8,
      backgroundColor: theme.background,
    },
    scrollInner: {
      paddingHorizontal: 20,
      gap: 8,
      alignItems: 'center',
    },
    clearAllChip: {
      paddingHorizontal: 12,
      paddingVertical: 6,
      borderRadius: 16,
      backgroundColor: theme.primary,
    },
    clearAllText: {
      color: '#FFFFFF',
      fontSize: 12,
      fontWeight: '800',
    },
    chip: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: 12,
      paddingVertical: 6,
      borderRadius: 16,
      backgroundColor: theme.card,
      borderWidth: 1,
      borderColor: theme.border,
      gap: 6,
    },
    chipText: {
      color: theme.text,
      fontSize: 12,
      fontWeight: '600',
    },
    colorDot: {
      width: 10,
      height: 10,
      borderRadius: 5,
    },
    removeIcon: {
      color: theme.mutedText,
      fontSize: 12,
      fontWeight: '800',
      marginLeft: 2,
    },
  });
