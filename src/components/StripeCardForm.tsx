import React from 'react';
import { View, Text, TextInput, StyleSheet } from 'react-native';
import { useTheme } from '../../context/ThemeContext';
import { AppTheme } from '../theme/theme';
import {
  detectCardBrand,
  formatCardNumber,
  formatExpiry,
} from '../services/stripeService';

interface StripeCardFormProps {
  name: string;
  onChangeName: (val: string) => void;
  cardNumber: string;
  onChangeCardNumber: (val: string) => void;
  expiry: string;
  onChangeExpiry: (val: string) => void;
  cvc: string;
  onChangeCvc: (val: string) => void;
}

export default function StripeCardForm({
  name,
  onChangeName,
  cardNumber,
  onChangeCardNumber,
  expiry,
  onChangeExpiry,
  cvc,
  onChangeCvc,
}: StripeCardFormProps) {
  const { theme } = useTheme();
  const styles = createStyles(theme);

  const brand = detectCardBrand(cardNumber);

  const handleCardNumberChange = (text: string) => {
    const formatted = formatCardNumber(text);
    onChangeCardNumber(formatted);
  };

  const handleExpiryChange = (text: string) => {
    const formatted = formatExpiry(text);
    onChangeExpiry(formatted);
  };

  return (
    <View style={styles.container}>
      <View style={styles.headerRow}>
        <Text style={styles.title}>💳 Credit / Debit Card (Stripe)</Text>
        <Text style={styles.securityBadge}>🔒 256-bit SSL</Text>
      </View>

      {/* Cardholder Name */}
      <Text style={styles.label}>Cardholder Name</Text>
      <TextInput
        style={styles.input}
        placeholder="Name on Card"
        placeholderTextColor={theme.mutedText}
        value={name}
        onChangeText={onChangeName}
        autoCapitalize="words"
        selectionColor={theme.primary}
      />

      {/* Card Number */}
      <Text style={styles.label}>Card Number</Text>
      <View style={styles.cardNumberBox}>
        <TextInput
          style={styles.cardNumberInput}
          placeholder="4242 4242 4242 4242"
          placeholderTextColor={theme.mutedText}
          value={cardNumber}
          onChangeText={handleCardNumberChange}
          keyboardType="numeric"
          maxLength={19}
          selectionColor={theme.primary}
        />
        <View style={styles.brandBadge}>
          <Text style={styles.brandText}>{brand}</Text>
        </View>
      </View>

      {/* Row for Expiry & CVC */}
      <View style={styles.row}>
        <View style={styles.halfCol}>
          <Text style={styles.label}>Expiry (MM/YY)</Text>
          <TextInput
            style={styles.input}
            placeholder="MM/YY"
            placeholderTextColor={theme.mutedText}
            value={expiry}
            onChangeText={handleExpiryChange}
            keyboardType="numeric"
            maxLength={5}
            selectionColor={theme.primary}
          />
        </View>

        <View style={styles.halfCol}>
          <Text style={styles.label}>CVC / CVV</Text>
          <TextInput
            style={styles.input}
            placeholder="123"
            placeholderTextColor={theme.mutedText}
            value={cvc}
            onChangeText={(text) => onChangeCvc(text.replace(/\D/g, '').slice(0, 4))}
            keyboardType="numeric"
            maxLength={4}
            secureTextEntry
            selectionColor={theme.primary}
          />
        </View>
      </View>

      <Text style={styles.disclaimer}>
        Your card details are securely tokenized directly with Stripe.
      </Text>
    </View>
  );
}

const createStyles = (theme: AppTheme) =>
  StyleSheet.create({
    container: {
      marginTop: 12,
      padding: 14,
      borderRadius: 12,
      backgroundColor: theme.card,
      borderWidth: 1,
      borderColor: theme.primary,
    },
    headerRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 10,
    },
    title: {
      color: theme.text,
      fontSize: 14,
      fontWeight: '700',
    },
    securityBadge: {
      color: theme.primary,
      fontSize: 11,
      fontWeight: '600',
    },
    label: {
      color: theme.mutedText,
      fontSize: 12,
      fontWeight: '600',
      marginBottom: 4,
      marginTop: 8,
    },
    input: {
      backgroundColor: theme.background,
      borderRadius: 8,
      paddingHorizontal: 12,
      paddingVertical: 10,
      color: theme.text,
      fontSize: 14,
      borderWidth: 1,
      borderColor: theme.border,
    },
    cardNumberBox: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: theme.background,
      borderRadius: 8,
      borderWidth: 1,
      borderColor: theme.border,
      paddingHorizontal: 12,
    },
    cardNumberInput: {
      flex: 1,
      color: theme.text,
      fontSize: 14,
      paddingVertical: 10,
    },
    brandBadge: {
      backgroundColor: theme.card,
      paddingHorizontal: 8,
      paddingVertical: 4,
      borderRadius: 6,
      borderWidth: 1,
      borderColor: theme.border,
    },
    brandText: {
      color: theme.primary,
      fontSize: 11,
      fontWeight: '700',
    },
    row: {
      flexDirection: 'row',
      gap: 12,
    },
    halfCol: {
      flex: 1,
    },
    disclaimer: {
      color: theme.mutedText,
      fontSize: 11,
      marginTop: 12,
      textAlign: 'center',
      fontStyle: 'italic',
    },
  });
