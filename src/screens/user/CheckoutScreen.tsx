import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  StatusBar,
  ActivityIndicator,
  Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { useQueryClient } from '@tanstack/react-query';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../../types/navigation';
import { useTheme } from '../../../context/ThemeContext';
import { AppTheme } from '../../theme/theme';
import { useCart } from '../../../context/CartContext';
import AppAlert from '../../components/AppAlert';
import { addDoc, collection, getFirestore, serverTimestamp } from '@react-native-firebase/firestore';
import { useAuth } from '../../../context/AuthContext';
import { saveLocalOrder } from '../../services/localOrderStore';
import { getDeliveryFee } from '../../services/checkoutPricing';

const CheckoutScreen = () => {
  const { theme } = useTheme();
  const styles = createStyles(theme);
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const queryClient = useQueryClient();
  const { cart, totalItems, totalPrice, clearCart } = useCart();
  const { user } = useAuth();

  // Contact & Shipping Form State
  const [email, setEmail] = useState('');
  const [newsOffers, setNewsOffers] = useState(true);
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [city, setCity] = useState('');
  const [sameBilling, setSameBilling] = useState(true);

  // Status & Alert State
  const [loading, setLoading] = useState(false);
  const [alert, setAlert] = useState<{ title: string; message: string; onConfirm?: () => void } | null>(null);

  const shippingCost = getDeliveryFee();
  const grandTotal = totalPrice + shippingCost;

  const handleSubmit = async () => {
    // 1. Basic Field Validation
    if (
      !email.trim() ||
      !fullName.trim() ||
      !phone.trim() ||
      !address.trim() ||
      !city.trim()
    ) {
      setAlert({ title: 'Missing Info', message: 'Please fill all required delivery fields.' });
      return;
    }

    setLoading(true);

    // Save the order locally for same-device admin testing.
    try {
      await saveLocalOrder({
        customerName: fullName.trim(),
        email: email.trim(),
        items: cart.map(({ id, name, quantity, price }) => ({ id, name, quantity, price })),
        total: grandTotal,
        paymentMethod: 'Cash on Delivery',
        paymentStatus: 'Pending (COD)',
        shippingAddress: { fullName, phone, address, city },
        shippingMethod: 'cod',
      });
      queryClient.invalidateQueries({ queryKey: ['admin-local-orders'] }).catch(() => undefined);
    } catch (error) {
      setLoading(false);
      setAlert({
        title: 'Order Error',
        message: error instanceof Error ? error.message : 'Failed to record order. Please try again.',
      });
      return;
    }

    // Firebase history is optional; it must not block the backend/admin order.
    if (user) {
      addDoc(collection(getFirestore(), 'users', user.uid, 'orders'), {
        items: cart,
        total: grandTotal,
        paymentMethod: 'Cash on Delivery',
        paymentStatus: 'Pending (COD)',
        shippingAddress: { fullName, phone, address, city },
        email,
        createdAt: serverTimestamp(),
      }).catch(() => undefined);
    }

    setLoading(false);

    setAlert({
      title: 'Order Confirmed! 🎉',
      message: `Your Cash on Delivery order of PKR ${grandTotal.toLocaleString()} has been placed successfully!`,
      onConfirm: () => {
        clearCart();
        navigation.navigate('MainTabs');
      },
    });
  };

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle={theme.statusBar} backgroundColor={theme.background} />
      <AppAlert
        visible={!!alert}
        title={alert?.title || ''}
        message={alert?.message || ''}
        onConfirm={() => {
          const action = alert?.onConfirm;
          setAlert(null);
          action?.();
        }}
      />
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Image
            source={require('../../asset/back_button.png')}
            style={styles.backImage}
            resizeMode="contain"
          />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Checkout</Text>
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* Order Summary */}
        <View style={styles.summaryCard}>
          <Text style={styles.sectionTitleTop}>Order Summary</Text>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>{totalItems} item(s)</Text>
            <Text style={styles.summaryValue}>PKR {totalPrice.toLocaleString()}</Text>
          </View>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Shipping</Text>
            <Text style={styles.summaryValue}>
              {shippingCost === 0 ? 'Free' : `PKR ${shippingCost}`}
            </Text>
          </View>
          <View style={[styles.summaryRow, styles.totalRow]}>
            <Text style={styles.totalLabel}>Total</Text>
            <Text style={styles.totalValue}>PKR {grandTotal.toLocaleString()}</Text>
          </View>
        </View>

        {/* Contact */}
        <Text style={styles.sectionTitle}>Contact Information</Text>
        <View style={styles.card}>
          <Text style={styles.inputLabel}>Email Address</Text>
          <TextInput
            style={styles.input}
            placeholder="Email address"
            placeholderTextColor={theme.mutedText}
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
            selectionColor={theme.primary}
          />
          <TouchableOpacity
            style={styles.checkRow}
            onPress={() => setNewsOffers(!newsOffers)}
          >
            <View style={[styles.checkbox, newsOffers && styles.checkboxActive]}>
              {newsOffers ? <Text style={styles.checkMark}>✓</Text> : null}
            </View>
            <Text style={styles.checkLabel}>Email me with news and special offers</Text>
          </TouchableOpacity>
        </View>

        {/* Delivery */}
        <Text style={styles.sectionTitle}>Delivery Details</Text>
        <View style={styles.card}>
          <Text style={styles.countryText}>🇵🇰 Pakistan</Text>

          <Text style={styles.inputLabel}>Full Name</Text>
          <TextInput
            style={styles.input}
            placeholder="Full name"
            placeholderTextColor={theme.mutedText}
            value={fullName}
            onChangeText={setFullName}
            selectionColor={theme.primary}
          />

          <Text style={styles.inputLabel}>Phone Number</Text>
          <TextInput
            style={styles.input}
            placeholder="03XX-XXXXXXX"
            placeholderTextColor={theme.mutedText}
            value={phone}
            onChangeText={setPhone}
            keyboardType="phone-pad"
            selectionColor={theme.primary}
          />

          <Text style={styles.inputLabel}>Street Address</Text>
          <TextInput
            style={styles.input}
            placeholder="Street address, apartment, suite"
            placeholderTextColor={theme.mutedText}
            value={address}
            onChangeText={setAddress}
            selectionColor={theme.primary}
          />

          <Text style={styles.inputLabel}>City</Text>
          <TextInput
            style={styles.input}
            placeholder="City (e.g. Lahore, Karachi, Islamabad)"
            placeholderTextColor={theme.mutedText}
            value={city}
            onChangeText={setCity}
            selectionColor={theme.primary}
          />
        </View>

        {/* Payment method */}
        <Text style={styles.sectionTitle}>Payment Method</Text>
        <View style={styles.card}>
          <View style={[styles.optionRow, styles.optionRowActive]}>
            <View style={styles.radioOuter}>
              <View style={styles.radioInner} />
            </View>
            <View style={styles.optionTextContainer}>
              <Text style={styles.optionLabel}>Cash on Delivery</Text>
              <Text style={styles.optionDesc}>Pay with cash when your order is delivered.</Text>
            </View>
          </View>
        </View>

        {/* Billing */}
        <Text style={styles.sectionTitle}>Billing Address</Text>
        <View style={styles.card}>
          <TouchableOpacity
            style={styles.checkRow}
            onPress={() => setSameBilling(true)}
          >
            <View style={styles.radioOuter}>
              {sameBilling ? <View style={styles.radioInner} /> : null}
            </View>
            <Text style={styles.checkLabel}>Same as shipping address</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.checkRow, styles.billingDifferentRow]}
            onPress={() => setSameBilling(false)}
          >
            <View style={styles.radioOuter}>
              {!sameBilling ? <View style={styles.radioInner} /> : null}
            </View>
            <Text style={styles.checkLabel}>Use a different billing address</Text>
          </TouchableOpacity>
        </View>

        {/* Final Total */}
        <View style={styles.finalCard}>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>{totalItems} item(s)</Text>
            <Text style={styles.summaryValue}>PKR {totalPrice.toLocaleString()}</Text>
          </View>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Delivery</Text>
            <Text style={styles.summaryValue}>{shippingCost === 0 ? 'Free' : `PKR ${shippingCost.toLocaleString()}`}</Text>
          </View>
          <View style={[styles.summaryRow, styles.totalRow]}>
            <Text style={styles.totalLabel}>Total Amount</Text>
            <Text style={styles.totalValue}>PKR {grandTotal.toLocaleString()}</Text>
          </View>
        </View>

        {/* SUBMIT BUTTON */}
        <TouchableOpacity
          style={[styles.submitBtn, loading && styles.submitBtnDisabled]}
          activeOpacity={0.85}
          onPress={handleSubmit}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#FFFFFF" />
          ) : (
            <Text style={styles.submitText}>
              Place Order (Cash on Delivery)
            </Text>
          )}
        </TouchableOpacity>

        <View style={styles.scrollBottomSpacer} />
      </ScrollView>
    </SafeAreaView>
  );
};

const createStyles = (theme: AppTheme) =>
  StyleSheet.create({
    safe: { flex: 1, backgroundColor: theme.background },
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingHorizontal: 16,
      paddingVertical: 12,
      backgroundColor: theme.background,
    },
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
    headerTitle: { color: theme.text, fontSize: 16, fontWeight: '700' },
    headerSpacer: { width: 40 },
    scroll: { padding: 16, paddingBottom: 20 },
    scrollBottomSpacer: { height: 40 },
    sectionTitleTop: {
      color: theme.text,
      fontSize: 16,
      fontWeight: '800',
      marginBottom: 12,
    },
    sectionTitle: {
      color: theme.text,
      fontSize: 16,
      fontWeight: '800',
      marginTop: 20,
      marginBottom: 10,
    },
    card: {
      backgroundColor: theme.card,
      borderRadius: 14,
      padding: 16,
      borderWidth: 1,
      borderColor: theme.border,
    },
    summaryCard: {
      backgroundColor: theme.card,
      borderRadius: 14,
      padding: 16,
      borderWidth: 1,
      borderColor: theme.border,
    },
    summaryRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      marginBottom: 8,
    },
    summaryLabel: { color: theme.mutedText, fontSize: 14 },
    summaryValue: { color: theme.text, fontSize: 14, fontWeight: '600' },
    totalRow: {
      marginTop: 8,
      paddingTop: 12,
      borderTopWidth: 1,
      borderTopColor: theme.border,
      marginBottom: 0,
    },
    totalLabel: { color: theme.text, fontSize: 16, fontWeight: '700' },
    totalValue: { color: theme.primary, fontSize: 18, fontWeight: '800' },
    inputLabel: {
      color: theme.mutedText,
      fontSize: 12,
      marginBottom: 6,
      marginTop: 10,
    },
    input: {
      backgroundColor: theme.background,
      borderRadius: 10,
      paddingHorizontal: 14,
      paddingVertical: 12,
      color: theme.text,
      fontSize: 15,
      borderWidth: 1,
      borderColor: theme.border,
    },
    countryText: {
      color: theme.text,
      fontSize: 15,
      fontWeight: '600',
      marginBottom: 4,
    },
    checkRow: {
      flexDirection: 'row',
      alignItems: 'center',
      marginTop: 14,
    },
    billingDifferentRow: { marginTop: 12 },
    checkbox: {
      width: 22,
      height: 22,
      borderRadius: 6,
      borderWidth: 1.5,
      borderColor: theme.border,
      alignItems: 'center',
      justifyContent: 'center',
      marginRight: 10,
    },
    checkboxActive: {
      backgroundColor: theme.primary,
      borderColor: theme.primary,
    },
    checkMark: { color: '#FFFFFF', fontSize: 13, fontWeight: '800' },
    checkLabel: { color: theme.mutedText, fontSize: 13, flex: 1 },
    optionRow: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingVertical: 12,
      paddingHorizontal: 10,
      borderRadius: 10,
      marginBottom: 6,
      borderWidth: 1,
      borderColor: 'transparent',
    },
    optionRowActive: {
      borderColor: theme.primary,
      backgroundColor: 'rgba(184,127,81,0.08)',
    },
    radioOuter: {
      width: 20,
      height: 20,
      borderRadius: 10,
      borderWidth: 2,
      borderColor: theme.border,
      alignItems: 'center',
      justifyContent: 'center',
      marginRight: 12,
    },
    radioInner: {
      width: 10,
      height: 10,
      borderRadius: 5,
      backgroundColor: theme.primary,
    },
    optionLabel: {
      color: theme.text,
      fontSize: 14,
      fontWeight: '700',
    },
    optionTextContainer: { flex: 1 },
    optionDesc: {
      color: theme.mutedText,
      fontSize: 12,
      marginTop: 2,
    },
    optionPrice: {
      color: theme.primary,
      fontSize: 13,
      fontWeight: '700',
    },
    finalCard: {
      backgroundColor: theme.card,
      borderRadius: 14,
      padding: 16,
      borderWidth: 1,
      borderColor: theme.border,
      marginTop: 24,
    },
    submitBtn: {
      height: 54,
      borderRadius: 12,
      backgroundColor: theme.primary,
      alignItems: 'center',
      justifyContent: 'center',
      marginTop: 20,
    },
    submitBtnDisabled: {
      opacity: 0.7,
    },
    submitText: {
      color: '#FFFFFF',
      fontSize: 16,
      fontWeight: '800',
    },
  });

export default CheckoutScreen;
