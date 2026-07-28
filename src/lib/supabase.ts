import { createClient, SupabaseClient, User } from '@supabase/supabase-js';

let cachedClient: SupabaseClient | null = null;
let cachedUser: User | null = null;
let authListeners: Array<(user: User | null) => void> = [];

export function getSupabaseCredentials() {
  const env = (import.meta as any).env || {};
  const url = env.VITE_SUPABASE_URL || localStorage.getItem('monikaz_supabase_url') || '';
  const anonKey = env.VITE_SUPABASE_ANON_KEY || localStorage.getItem('monikaz_supabase_anon_key') || '';
  return { url, anonKey };
}

export function getSupabaseClient(): SupabaseClient | null {
  const { url, anonKey } = getSupabaseCredentials();
  if (!url || !anonKey) return null;
  if (!cachedClient) {
    try {
      cachedClient = createClient(url, anonKey, {
        auth: { persistSession: true, autoRefreshToken: true },
      });
    } catch { return null; }
  }
  return cachedClient;
}

export function saveSupabaseCredentials(url: string, anonKey: string) {
  if (url && anonKey) {
    localStorage.setItem('monikaz_supabase_url', url);
    localStorage.setItem('monikaz_supabase_anon_key', anonKey);
    cachedClient = createClient(url, anonKey, {
      auth: { persistSession: true, autoRefreshToken: true },
    });
  } else {
    localStorage.removeItem('monikaz_supabase_url');
    localStorage.removeItem('monikaz_supabase_anon_key');
    cachedClient = null;
  }
}

export async function signInWithGoogle() {
  const supabase = getSupabaseClient();
  if (!supabase) throw new Error('Supabase not configured');
  const { error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: { redirectTo: window.location.origin },
  });
  if (error) throw error;
}

export async function signOut() {
  const supabase = getSupabaseClient();
  if (!supabase) return;
  await supabase.auth.signOut();
  cachedUser = null;
  notifyListeners(null);
}

export function onAuthChange(cb: (user: User | null) => void) {
  authListeners.push(cb);
  if (cachedUser) cb(cachedUser);
  return () => { authListeners = authListeners.filter(l => l !== cb); };
}

function notifyListeners(user: User | null) {
  authListeners.forEach(cb => cb(user));
}

export function setupAuthListener() {
  const supabase = getSupabaseClient();
  if (!supabase) return;
  supabase.auth.getSession().then(({ data: { session } }) => {
    cachedUser = session?.user ?? null;
    notifyListeners(cachedUser);
  });
  supabase.auth.onAuthStateChange((_event, session) => {
    cachedUser = session?.user ?? null;
    notifyListeners(cachedUser);
  });
}

export function getCurrentUser(): User | null {
  return cachedUser;
}

export function tryRecoverSessionFromHash(): {
  id: string; email: string; full_name: string; avatar_url: string;
} | null {
  const hash = window.location.hash;
  if (!hash || !hash.includes('access_token=')) return null;
  try {
    const params = new URLSearchParams(hash.slice(1));
    const token = params.get('access_token');
    if (!token) return null;
    const payload = JSON.parse(atob(token.split('.')[1]));
    return {
      id: payload.sub,
      email: payload.email || '',
      full_name: payload.user_metadata?.full_name || payload.email?.split('@')[0] || 'User',
      avatar_url: payload.user_metadata?.avatar_url || payload.user_metadata?.picture || '',
    };
  } catch { return null; }
}

export function clearAuthHash() {
  if (window.location.hash.includes('access_token=')) {
    window.history.replaceState({}, '', window.location.pathname);
  }
}

export async function signUpWithEmail(email: string, password: string, fullName: string) {
  const supabase = getSupabaseClient();
  if (!supabase) throw new Error('Supabase not configured');
  const { data, error } = await supabase.auth.signUp({
    email, password,
    options: { data: { full_name: fullName } },
  });
  if (error) throw error;
  return data;
}

export async function signInWithEmail(email: string, password: string) {
  const supabase = getSupabaseClient();
  if (!supabase) throw new Error('Supabase not configured');
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) throw error;
  return data;
}
