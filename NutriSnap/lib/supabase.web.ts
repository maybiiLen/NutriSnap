import { createClient } from '@supabase/supabase-js';
import 'react-native-url-polyfill/auto';

// Web-compatible storage adapter using localStorage
const ExpoWebSecureStoreAdapter = {
  getItem: (key: string) => {
    console.debug("getItem", { key })
    if (typeof window !== 'undefined') {
      return Promise.resolve(window.localStorage.getItem(key))
    }
    return Promise.resolve(null)
  },
  setItem: (key: string, value: string) => {
    if (typeof window !== 'undefined') {
      window.localStorage.setItem(key, value)
    }
    return Promise.resolve()
  },
  removeItem: (key: string) => {
    if (typeof window !== 'undefined') {
      window.localStorage.removeItem(key)
    }
    return Promise.resolve()
  },
};

export const supabase = createClient(
  process.env.EXPO_PUBLIC_SUPABASE_URL ?? '',
  process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY ?? '',
  {
    auth: {
      storage: ExpoWebSecureStoreAdapter,
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: false,
    },
  },
);