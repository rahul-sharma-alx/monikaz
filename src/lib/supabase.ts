import { createClient, SupabaseClient } from '@supabase/supabase-js';

// Retrieve keys from environment or localStorage
export function getSupabaseCredentials() {
  const env = (import.meta as any).env || {};
  const url = env.VITE_SUPABASE_URL || localStorage.getItem('monikaz_supabase_url') || '';
  const anonKey = env.VITE_SUPABASE_ANON_KEY || localStorage.getItem('monikaz_supabase_anon_key') || '';
  return { url, anonKey };
}

let cachedClient: SupabaseClient | null = null;

export function getSupabaseClient(): SupabaseClient | null {
  const { url, anonKey } = getSupabaseCredentials();
  if (!url || !anonKey) {
    return null;
  }
  if (!cachedClient) {
    try {
      cachedClient = createClient(url, anonKey);
    } catch (err) {
      console.warn('Failed to initialize Supabase client:', err);
      return null;
    }
  }
  return cachedClient;
}

export function saveSupabaseCredentials(url: string, anonKey: string) {
  if (url && anonKey) {
    localStorage.setItem('monikaz_supabase_url', url);
    localStorage.setItem('monikaz_supabase_anon_key', anonKey);
    cachedClient = createClient(url, anonKey);
  } else {
    localStorage.removeItem('monikaz_supabase_url');
    localStorage.removeItem('monikaz_supabase_anon_key');
    cachedClient = null;
  }
}
