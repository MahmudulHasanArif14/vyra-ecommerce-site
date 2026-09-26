import { createClient as createSupabaseClient } from "@supabase/supabase-js";

/**
 * A Supabase client that does NOT use cookies.
 * Safe to call at build time for public data (settings, published products, etc.)
 * NEVER use this for authenticated operations.
 */
export const createStaticClient = () => {
  return createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
      },
    },
  );
};
