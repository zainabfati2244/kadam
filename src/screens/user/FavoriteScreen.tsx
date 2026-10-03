import React from 'react';
import {
  View,
  Text,
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
import { AppTheme } from '../../theme/colors';
import { useFavorites } from '../../../context/FavoritesContext';

const COLORS = {
  primary: '#1E1E1E',
  secondary: '#1E1E1E',
  accent: '#B88B67',
  background: '#F4F0EA',
  card: '#FFF8E7',
  textPrimary: '#3A3A3A',
  textSecondary: '#A3A5A6',
  textMuted: '#A3A5A6',
  border: '#EAD8C3',
  white: '#FFF8E7',
};

const { width } = Dimensions.get('window');
const CARD_WIDTH = (width - 40) / 2;

const FavoriteScreen = () => {
  const { theme } = useTheme();
  const styles = createStyles(theme);
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const { favorites, toggleFavorite } = useFavorites();

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle={theme.statusBar} backgroundColor={theme.background} />

      <AppHeader />

      <View style={styles.header}>
        <Text style={styles.title}>Favorites</Text>
        <Text style={styles.count}>{favorites.length} items</Text>
      </View>

      {favorites.length === 0 ? (
        <View style={styles.empty}>
          <Text style={styles.emptyIcon}>🤍</Text>
          <Text style={styles.emptyTitle}>No favorites yet</Text>
          <Text style={styles.emptySub}>
            Tap the heart on any product to save it here
          </Text>
        </View>
      ) : (
        <ScrollView
          contentContainerStyle={styles.scroll}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.grid}>
            {favorites.map((item) => (
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
                    <View style={[styles.tag, { backgroundColor: item.tagColor || COLORS.secondary }]}>
                      <Text style={styles.tagText}>{item.tag}</Text>
                    </View>
                  )}

                  <TouchableOpacity
                    style={styles.heartBtn}
                    onPress={(e) => {
                      e.stopPropagation?.();
                      toggleFavorite(item);
                    }}
                  >
                    <Text style={{ fontSize: 16 }}>❤️</Text>
                  </TouchableOpacity>
                </View>

                <View style={styles.cardBody}>
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
        </ScrollView>
      )}
    </SafeAreaView>
  );
};

const createStyles = (theme: AppTheme) => StyleSheet.create({
  safe: { flex: 1, backgroundColor: theme.background },
  header: {
    paddingHorizontal: 20,
    paddingTop: 6,
    paddingBottom: 16,
    backgroundColor: theme.background,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  title: {
    color: theme.text,
    fontSize: 24,
    fontWeight: '800',
  },
  count: {
    color: theme.mutedText,
    fontSize: 13,
  },
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
    lineHeight: 20,
  },
  scroll: { paddingBottom: 40 },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 12,
    paddingTop: 16,
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
    height: 200,
    width: '100%',
    backgroundColor: '#F0F0F0',
    overflow: 'hidden',
  },
  productImage: {
    width: '100%',
    height: '100%',
  },
  tag: {
    position: 'absolute',
    top: 12,
    left: 12,
    paddingHorizontal: 9,
    paddingVertical: 4,
    borderRadius: 6,
  },
  tagText: {
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.6,
    color: theme.text,
  },
  heartBtn: {
    position: 'absolute',
    top: 10,
    right: 10,
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: 'rgba(255,255,255,0.85)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardBody: { padding: 14 },
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
});

export default FavoriteScreen;
