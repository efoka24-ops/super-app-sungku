import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.SUPABASE_URL || "";
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || "";
const publishableKey = process.env.SUPABASE_PUBLISHABLE_KEY || "";

export const isSupabaseConfigured = Boolean(supabaseUrl && (serviceRoleKey || publishableKey));

// Prefer service role key on backend; fallback to publishable key for read-only/dev scenarios.
const backendKey = serviceRoleKey || publishableKey;

export const supabase = isSupabaseConfigured
  ? createClient(supabaseUrl, backendKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    })
  : null;
