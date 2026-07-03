import { createClient } from '@supabase/supabase-js';

function readEnv(key: string): string | null {
  const value = process.env[key]?.trim();
  return value && value.length > 0 ? value : null;
}

export function readSupabaseCredentials(): { url: string; anonKey: string } | null {
  const url = readEnv('SUPABASE_URL') ?? readEnv('NEXT_PUBLIC_SUPABASE_URL');
  const anonKey = readEnv('SUPABASE_ANON_KEY') ?? readEnv('NEXT_PUBLIC_SUPABASE_ANON_KEY');

  if (!url || !anonKey) {
    return null;
  }

  return { url, anonKey };
}

export function createSupabaseClient() {
  const credentials = readSupabaseCredentials();
  if (!credentials) {
    return null;
  }

  return createClient(credentials.url, credentials.anonKey);
}
