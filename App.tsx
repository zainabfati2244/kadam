import React from 'react';
import { DarkTheme, DefaultTheme, NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Image, StyleSheet } from 'react-native';
import { StripeProvider } from '@stripe/stripe-react-native';
import { SafeAreaProvider, useSafeAreaInsets } from 'react-native-safe-area-context';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { RootStackParamList, MainTabParamList } from './types/navigation';
import SignInScreen from './src/screens/user/SignInScreen';
import SignUpScreen from './src/screens/user/SignUpScreen';
import ForgotPasswordScreen from './src/screens/user/ForgotPasswordScreen';
import OTPScreen from './src/screens/user/OTPScreen';
import ResetPasswordScreen from './src/screens/user/ResetPasswordScreen';
import HomeScreen from './src/screens/user/HomeScreen';
import FavoriteScreen from './src/screens/user/FavoriteScreen';
import SearchScreen from './src/screens/user/SearchScreen';
import ProfileScreen from './src/screens/user/ProfileScreen';
import AddToCartScreen from './src/screens/user/AddToCartScreen';
import ProductDetailScreen from './src/screens/user/ProductDetailScreen';
import CheckoutScreen from './src/screens/user/CheckoutScreen';
import { FavoritesProvider } from './context/FavoritesContext';
import { CartProvider } from './context/CartContext';
import { ThemeProvider, useTheme } from './context/ThemeContext';
import { AuthProvider, useAuth } from './context/AuthContext';
import SplashScreen from './src/screens/user/SplashScreen';
import NotificationsScreen from './src/screens/user/NotificationsScreen';
import MyOrdersScreen from './src/screens/user/MyOrdersScreen';
import ShippingAddressScreen from './src/screens/user/ShippingAddressScreen';
import { STRIPE_PUBLISHABLE_KEY } from './src/services/stripeService';
import { AdminTabs } from './src/navigation/AdminNavigator';



const Stack = createNativeStackNavigator<RootStackParamList>();
const Tab = createBottomTabNavigator<MainTabParamList>();
const queryClient = new QueryClient();

function MainTabs() {
  const { theme } = useTheme();
  const insets = useSafeAreaInsets();

  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: theme.card,
          borderTopColor: theme.border,
          borderTopWidth: 1,
          height: 60 + (insets.bottom > 0 ? insets.bottom : 8),
          paddingBottom: insets.bottom > 0 ? insets.bottom : 8,
          paddingTop: 6,
        },
        tabBarActiveTintColor: theme.primary,
        tabBarInactiveTintColor: theme.mutedText,
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: '600',
          marginBottom: 2,
        },
      }}
    >
      <Tab.Screen
        name="Home"
        component={HomeScreen}
        options={{
          tabBarIcon: () => <Image source={require('./src/asset/home.png')} style={styles.tabIcon} />,
        }}
      />
      <Tab.Screen
        name="Favorite"
        component={FavoriteScreen}
        options={{
          tabBarIcon: () => <Image source={require('./src/asset/wish-list.png')} style={styles.tabIcon} />,
        }}
      />
      <Tab.Screen
        name="Search"
        component={SearchScreen}
        options={{
          tabBarIcon: () => <Image source={require('./src/asset/search.png')} style={styles.tabIcon} />,
        }}
      />
      <Tab.Screen
        name="Profile"
        component={ProfileScreen}
        options={{
          tabBarIcon: () => <Image source={require('./src/asset/user (2).png')} style={styles.tabIcon} />,
        }}
      />
    </Tab.Navigator>
  );
}

function AppNavigator() {
  const { isDark, theme } = useTheme();
  const { user, currentRole, loading } = useAuth();
  const baseNavigationTheme = isDark ? DarkTheme : DefaultTheme;
  const navigationTheme = {
    ...baseNavigationTheme,
    colors: {
      ...baseNavigationTheme.colors,
      background: theme.background,
      card: theme.card,
      text: theme.text,
      primary: theme.primary,
      border: theme.border,
    },
  };

  return (
    <NavigationContainer theme={navigationTheme}>
      <Stack.Navigator
        screenOptions={{
          headerShown: false,
          animation: 'slide_from_right',
          contentStyle: { backgroundColor: theme.background },
        }}
      >
        {loading ? <Stack.Screen name="Splash" component={SplashScreen} /> : user ? (currentRole === 'admin' ? (
          <>
            <Stack.Screen name="AdminTabs" component={AdminTabs} />
          </>
        ) : (
          <>
            {/* Protected group: it is not mounted until Supabase restores a session. */}
            <Stack.Screen name="MainTabs" component={MainTabs} />
            <Stack.Screen name="AddToCart" component={AddToCartScreen} />
            <Stack.Screen name="ProductDetail" component={ProductDetailScreen} />
            <Stack.Screen name="Checkout" component={CheckoutScreen} />
            <Stack.Screen name="Notifications" component={NotificationsScreen} />
            <Stack.Screen name="MyOrders" component={MyOrdersScreen} />
            <Stack.Screen name="ShippingAddress" component={ShippingAddressScreen} />
          </>
        )) : <>
          <Stack.Screen name="SignIn" component={SignInScreen} />
          <Stack.Screen name="SignUp" component={SignUpScreen} />
          <Stack.Screen name="ForgotPassword" component={ForgotPasswordScreen} />
          <Stack.Screen name="OTP" component={OTPScreen} />
          <Stack.Screen name="ResetPassword" component={ResetPasswordScreen} />
        </>}
      </Stack.Navigator>
    </NavigationContainer>
  );
}

export default function App() {
  return (
    <GestureHandlerRootView style={styles.appRoot}>
      <SafeAreaProvider>
        <StripeProvider publishableKey={STRIPE_PUBLISHABLE_KEY} urlScheme="kadam">
          <ThemeProvider>
            <AuthProvider>
              <QueryClientProvider client={queryClient}>
                <FavoritesProvider><CartProvider><AppNavigator /></CartProvider></FavoritesProvider>
              </QueryClientProvider>
            </AuthProvider>
          </ThemeProvider>
        </StripeProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  appRoot: { flex: 1 },
  tabIcon: {
    width: 24,
    height: 24,
    resizeMode: 'contain',
  },
});
