import React, { ReactNode } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useTheme } from '../../context/ThemeContext';

type Props = {
  left?: ReactNode;
  right?: ReactNode;
};

/** Shared header for screens so the Kadam logo stays aligned with custom left/right action buttons. */
export default function AppHeader({ left, right }: Props) {
  const { theme } = useTheme();

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <View style={styles.leftSlot}>{left ? left : null}</View>

      <View pointerEvents="none" style={styles.brandWrap}>
        <Text style={[styles.brand, { color: theme.primary }]}>Kadam</Text>
      </View>

      <View style={styles.rightSlot}>{right}</View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    height: 70,
    paddingHorizontal: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  brand: {
    textAlign: 'center',
    fontFamily: 'Bezoria-Reguler-Exfontfbf7',
    fontSize: 32,
    fontWeight: '400',
    letterSpacing: 0.5,
  },
  brandWrap: {
    position: 'absolute',
    left: 0,
    right: 0,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 0,
  },
  leftSlot: {
    zIndex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  rightSlot: {
    zIndex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    gap: 8,
  },
});
