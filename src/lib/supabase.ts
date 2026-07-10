import { createClient, type SupabaseClient } from "@supabase/supabase-js";

const url = import.meta.env.VITE_SUPABASE_URL as string | undefined;
// Supabase's client-safe key. The new publishable key (sb_publishable_...) is
// the standard; it respects RLS, so shipping it in the browser bundle is fine.
// Fall back to the legacy anon key name so an older .env keeps working. The
// secret key (sb_secret_...) bypasses RLS and must never appear in a VITE_ var.
const publishableKey = (import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY ??
  import.meta.env.VITE_SUPABASE_ANON_KEY) as string | undefined;

/** False means local demo mode: seeded data, no auth, localStorage persistence. */
export const isSupabaseConfigured = Boolean(url && publishableKey);

export const supabase: SupabaseClient | null = isSupabaseConfigured
  ? createClient(url as string, publishableKey as string)
  : null;
