import React, { createContext, useCallback, useContext, useEffect, useState } from 'react';
import { BackHandler, Pressable, StatusBar, StyleSheet, Text, View, useWindowDimensions } from 'react-native';
import { BottomTabBarProps, createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, { Easing, runOnJS, useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated';
import { useTheme } from '../../context/ThemeContext';
import { AdminTabParamList, RootStackParamList } from '../../types/navigation';
import { AppTheme } from '../theme/theme';
import AdminDashboardScreen from '../screens/admin/AdminDashboardScreen';
import AdminProductsScreen from '../screens/admin/AdminProductsScreen';
import AdminOrdersScreen from '../screens/admin/AdminOrdersScreen';
import AdminCustomersScreen from '../screens/admin/AdminCustomersScreen';
import AdminCategoriesScreen from '../screens/admin/AdminCategoriesScreen';
import AdminReviewsScreen from '../screens/admin/AdminReviewsScreen';
import AdminOrderDetailScreen from '../screens/admin/AdminOrderDetailScreen';

const Tab = createBottomTabNavigator<AdminTabParamList>();
const Stack = createNativeStackNavigator<RootStackParamList>();

type AdminSidebarContextValue = {
  expanded: boolean;
  setExpanded: React.Dispatch<React.SetStateAction<boolean>>;
  theme: AppTheme;
};

const AdminSidebarContext = createContext<AdminSidebarContextValue | undefined>(undefined);
const setSidebarClosed: React.Dispatch<React.SetStateAction<boolean>> = () => undefined;

function AdminSidebarOverlay({ state, descriptors, navigation }: BottomTabBarProps) {
  const sidebar = useContext(AdminSidebarContext);
  const { theme: appTheme } = useTheme();
  const { width: screenWidth } = useWindowDimensions();
  const insets = useSafeAreaInsets();
  const drawerWidth = Math.round(screenWidth * 0.78);
  const expanded = sidebar?.expanded ?? false;
  const setExpanded = sidebar?.setExpanded ?? setSidebarClosed;
  const theme = sidebar?.theme ?? appTheme;
  const closeSidebar = useCallback(() => setExpanded(false), [setExpanded]);
  const translateX = useSharedValue(-drawerWidth);
  const backdropOpacity = useSharedValue(0);

  useEffect(() => {
    translateX.value = withTiming(expanded ? 0 : -drawerWidth, {
      duration: 280,
      easing: Easing.out(Easing.cubic),
    });
    backdropOpacity.value = withTiming(expanded ? 0.5 : 0, {
      duration: 280,
      easing: Easing.out(Easing.cubic),
    });
  }, [backdropOpacity, drawerWidth, expanded, translateX]);

  useEffect(() => {
    if (!expanded) return undefined;
    const subscription = BackHandler.addEventListener('hardwareBackPress', () => {
      closeSidebar();
      return true;
    });
    return () => subscription.remove();
  }, [closeSidebar, expanded]);

  const drawerStyle = useAnimatedStyle(() => ({ transform: [{ translateX: translateX.value }] }));
  const backdropStyle = useAnimatedStyle(() => ({ opacity: backdropOpacity.value }));
  const swipeToClose = Gesture.Pan()
    .activeOffsetX([-12, 12])
    .onEnd((event) => {
      if (event.translationX < -72) runOnJS(closeSidebar)();
    });

  return (
    <View pointerEvents="box-none" style={styles.overlayRoot}>
      <StatusBar translucent backgroundColor="transparent" barStyle={theme.statusBar} />
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={expanded ? 'Close admin menu' : 'Open admin menu'}
        onPress={() => setExpanded((current) => !current)}
        style={[styles.menuToggle, { top: insets.top + 8, backgroundColor: theme.card, borderColor: theme.border }]}
      >
        <Text style={[styles.menuGlyph, { color: theme.primary }]}>{expanded ? '×' : '☰'}</Text>
      </Pressable>

      <Animated.View
        pointerEvents={expanded ? 'auto' : 'none'}
        style={[StyleSheet.absoluteFill, styles.backdrop, backdropStyle]}
      >
        <Pressable accessibilityRole="button" accessibilityLabel="Close admin menu" onPress={closeSidebar} style={StyleSheet.absoluteFill} />
      </Animated.View>

      <GestureDetector gesture={swipeToClose}>
        <Animated.View
          pointerEvents={expanded ? 'auto' : 'none'}
          accessibilityElementsHidden={!expanded}
          importantForAccessibility={expanded ? 'yes' : 'no-hide-descendants'}
          style={[styles.drawerPosition, { width: drawerWidth, backgroundColor: theme.card, borderRightColor: theme.border }, drawerStyle]}
        >
          <SafeAreaView style={styles.drawerSafeArea} edges={['top', 'bottom']}>
          <View style={styles.drawerHeader}>
            <Text style={[styles.drawerTitle, { color: theme.text }]}>Admin</Text>
            <Pressable accessibilityRole="button" accessibilityLabel="Close admin menu" onPress={closeSidebar} style={styles.closeButton}>
              <Text style={[styles.closeText, { color: theme.primary }]}>Close</Text>
            </Pressable>
          </View>
          {state.routes.map((route, index) => {
            const focused = state.index === index;
            const options = descriptors[route.key].options;
            const label = typeof options.tabBarLabel === 'string'
              ? options.tabBarLabel
              : options.title || route.name;

            return (
              <Pressable
                key={route.key}
                accessibilityRole="button"
                accessibilityState={focused ? { selected: true } : {}}
                onPress={() => {
                  const event = navigation.emit({ type: 'tabPress', target: route.key, canPreventDefault: true });
                  if (!focused && !event.defaultPrevented) navigation.navigate(route.name, route.params);
                    closeSidebar();
                }}
                style={[styles.sectionButton, focused && { backgroundColor: theme.primary + '20' }]}
              >
                <Text style={[styles.sectionLabel, { color: focused ? theme.primary : theme.text }]}>{label}</Text>
              </Pressable>
            );
          })}
          </SafeAreaView>
        </Animated.View>
      </GestureDetector>
    </View>
  );
}

function renderAdminSidebar(props: BottomTabBarProps) {
  return <AdminSidebarOverlay {...props} />;
}

function AdminTabsContent() {
  const { theme } = useTheme();
  const [sidebarExpanded, setSidebarExpanded] = useState(false);

  return (
    <AdminSidebarContext.Provider value={{ expanded: sidebarExpanded, setExpanded: setSidebarExpanded, theme }}>
      <Tab.Navigator
        screenOptions={{
          headerShown: false,
        }}
        tabBar={renderAdminSidebar}
      >
        <Tab.Screen name="Dashboard" component={AdminDashboardScreen} />
        <Tab.Screen name="Products" component={AdminProductsScreen} />
        <Tab.Screen name="Orders" component={AdminOrdersScreen} />
        <Tab.Screen name="Customers" component={AdminCustomersScreen} />
        <Tab.Screen name="Categories" component={AdminCategoriesScreen} />
        <Tab.Screen name="Reviews" component={AdminReviewsScreen} />
      </Tab.Navigator>
    </AdminSidebarContext.Provider>
  );
}

const styles = StyleSheet.create({
  overlayRoot: { ...StyleSheet.absoluteFill, zIndex: 1000, elevation: 1000 },
  menuToggle: {
    position: 'absolute',
    left: 12,
    width: 48,
    height: 48,
    borderRadius: 8,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1002,
    elevation: 1002,
  },
  menuGlyph: { fontSize: 25, fontWeight: '600', lineHeight: 30 },
  backdrop: { backgroundColor: '#000', zIndex: 1000, elevation: 1000 },
  drawerPosition: { position: 'absolute', top: 0, bottom: 0, left: 0, borderRightWidth: StyleSheet.hairlineWidth, zIndex: 1001, elevation: 1001 },
  drawerSafeArea: { flex: 1, paddingHorizontal: 16 },
  drawerHeader: { minHeight: 56, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  drawerTitle: { fontSize: 20, fontWeight: '800', paddingHorizontal: 8 },
  closeButton: { paddingHorizontal: 12, paddingVertical: 10 },
  closeText: { fontSize: 14, fontWeight: '700' },
  sectionButton: { minHeight: 50, justifyContent: 'center', paddingHorizontal: 12, borderRadius: 8 },
  sectionLabel: { fontSize: 15, fontWeight: '600' },
});

export function AdminTabs() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="AdminTabs" component={AdminTabsContent} />
      <Stack.Screen name="OrderDetail" component={AdminOrderDetailScreen} />
    </Stack.Navigator>
  );
}
