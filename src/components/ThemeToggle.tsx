import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useTheme } from '../../context/ThemeContext';

export default function ThemeToggle() {
  const { isDark, theme, toggleTheme } = useTheme();

  return (
    <TouchableOpacity
      accessibilityRole="switch"
      accessibilityState={{ checked: isDark }}
      accessibilityLabel="Toggle dark mode"
      onPress={toggleTheme}
      activeOpacity={0.75}
      style={[
        styles.button,
        {
          backgroundColor: isDark ? theme.primary : theme.card,
          borderColor: theme.border,
        },
      ]}
    >
      <View style={[styles.thumb, isDark && styles.thumbDark]}>
        <Text style={styles.icon}>{isDark ? '☾' : '☀'}</Text>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    width: 52,
    height: 30,
    borderWidth: 1,
    borderRadius: 15,
    justifyContent: 'center',
    flexShrink: 0,
  },
  thumb: {
    width: 26,
    height: 26,
    marginLeft: 1,
    borderRadius: 13,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#B88B67',
  },
  thumbDark: {
    marginLeft: 23,
    backgroundColor: '#FFF8E7',
  },
  icon: {
    color: '#3A3A3A',
    fontSize: 16,
    fontWeight: '700',
  },
});
