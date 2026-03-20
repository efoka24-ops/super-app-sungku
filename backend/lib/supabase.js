import { createClient } from "@supabase/supabase-js";

export function getSupabase() {
  const supabaseUrl = process.env.SUPABASE_URL || "";
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || "";
  const publishableKey = process.env.SUPABASE_PUBLISHABLE_KEY || "";

  console.log('[supabase.js] supabaseUrl:', supabaseUrl);
  console.log('[supabase.js] serviceRoleKey:', serviceRoleKey);
  console.log('[supabase.js] publishableKey:', publishableKey);

  const isSupabaseConfigured = Boolean(supabaseUrl && (serviceRoleKey || publishableKey));
  const backendKey = serviceRoleKey || publishableKey;

  return isSupabaseConfigured
    ? createClient(supabaseUrl, backendKey, {
        auth: {
          autoRefreshToken: false,
          persistSession: false,
        },
      })
    : null;
}
