import 'react-native-url-polyfill/auto';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { AppState, Platform } from 'react-native';
import Config from 'react-native-config';
import { createClient } from '@supabase/supabase-js';
import type { Database } from '../types/database';

/** Values come from .env at native build time with fallback project credentials. */
const url = Config.SUPABASE_URL || 'https://eyaoflmjxlikpfbylblz.supabase.co';
const publishableKey =
  Config.SUPABASE_PUBLISHABLE_KEY ||
  Config.SUPABASE_ANON_KEY ||
  'sb_publishable_vgE3EumM2kjSiHeX3sR2HA_k_R9mhgU';

export const supabase = createClient<Database>(url, publishableKey, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    // React Native does not expose browser URL fragments to the SDK.
    detectSessionInUrl: false,
  },
});

// Refresh tokens only while a native app is active, which avoids unnecessary work in background.
if (Platform.OS !== 'web') {
  AppState.addEventListener('change', (state) => {
    if (state === 'active') supabase.auth.startAutoRefresh();
    else supabase.auth.stopAutoRefresh();
  });
}
