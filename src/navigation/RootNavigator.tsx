import React from 'react';
import { Image, ImageSourcePropType, StyleSheet } from 'react-native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import type { LinkingOptions } from '@react-navigation/native';
import type { MainTabParamList, RootStackParamList } from '../../types/navigation';
import SignInScreen from '../screens/user/SignInScreen';
import SignUpScreen from '../screens/user/SignUpScreen';
import ForgotPasswordScreen from '../screens/user/ForgotPasswordScreen';
import OTPScreen from '../screens/user/OTPScreen';
import ResetPasswordScreen from '../screens/user/ResetPasswordScreen';
import HomeScreen from '../screens/user/HomeScreen';
import FavoriteScreen from '../screens/user/FavoriteScreen';
import SearchScreen from '../screens/user/SearchScreen';
import ProfileScreen from '../screens/user/ProfileScreen';
import AddToCartScreen from '../screens/user/AddToCartScreen';

const Stack = createNativeStackNavigator<RootStackParamList>();
const Tab = createBottomTabNavigator<MainTabParamList>();

const tabIcon: Record<keyof MainTabParamList, ImageSourcePropType> = {
  Home: require('../asset/home.png'),
  Favorite: require('../asset/wish-list.png'),
  Search: require('../asset/search.png'),
  Profile: require('../asset/user (2).png'),
};

function MainTabs() {
  const insets = useSafeAreaInsets();

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        lazy: true,
        freezeOnBlur: true,
        tabBarStyle: {
          backgroundColor: '#0A0A0A',
          borderTopColor: '#3A3A3A',
          borderTopWidth: 1,
          height: 60 + (insets.bottom > 0 ? insets.bottom : 10),
          paddingBottom: insets.bottom > 0 ? insets.bottom : 8,
          paddingTop: 6,
        },
        tabBarActiveTintColor: '#C9A84C',
        tabBarInactiveTintColor: '#A8A8A8',
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: '600',
          marginBottom: 2,
        },
        tabBarIcon: () => <Image source={tabIcon[route.name]} style={styles.tabIcon} />,
      })}
    >
      <Tab.Screen name="Home" component={HomeScreen} />
      <Tab.Screen
        name="Favorite"
        component={FavoriteScreen}
        options={{ title: 'Favorites' }}
      />
      <Tab.Screen name="Search" component={SearchScreen} />
      <Tab.Screen name="Profile" component={ProfileScreen} />
    </Tab.Navigator>
  );
}

export const linking: LinkingOptions<RootStackParamList> = {
  prefixes: ['shoezia://'],
  config: {
    screens: {
      SignIn: 'signin',
      SignUp: 'signup',
      ForgotPassword: 'forgot-password',
      OTP: 'otp/:email',
      ResetPassword: 'reset/:email/:otp',
      MainTabs: 'app',
      AddToCart: 'cart',
    },
  },
};

export function RootNavigator() {
  return (
    <Stack.Navigator
      initialRouteName="SignIn"
      screenOptions={{ headerShown: false }}
    >
      <Stack.Screen
        name="SignIn"
        component={SignInScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="SignUp"
        component={SignUpScreen}
        options={{ title: 'Create account' }}
      />
      <Stack.Screen
        name="ForgotPassword"
        component={ForgotPasswordScreen}
        options={{ title: 'Forgot password' }}
      />
      <Stack.Screen
        name="OTP"
        component={OTPScreen}
        options={{ title: 'Verify code' }}
      />
      <Stack.Screen
        name="ResetPassword"
        component={ResetPasswordScreen}
        options={{ title: 'Reset password' }}
      />
      <Stack.Screen
        name="MainTabs"
        component={MainTabs}
        options={{ headerShown: false, gestureEnabled: false }}
      />
      <Stack.Screen
        name="AddToCart"
        component={AddToCartScreen}
        options={{ title: 'Your cart' }}
      />
    </Stack.Navigator>
  );
}

const styles = StyleSheet.create({
  tabIcon: { width: 24, height: 24, resizeMode: 'contain' },
});
