import { createClient } from "@supabase/supabase-js";

const url = process.env.SUPABASE_URL;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_PUBLISHABLE_KEY;

if (!url || !key) {
  console.warn("⚠️  SUPABASE_URL or key missing — DB writes will fall back to JSON.");
}

export const db = url && key
  ? createClient(url, key, { auth: { autoRefreshToken: false, persistSession: false } })
  : null;

// Validate tables exist on startup
if (db) {
  db.from("users").select("user_id").limit(1).then(({ error }) => {
    if (error?.code === "42P01") {
      console.warn("⚠️  Supabase tables not found. Run the migration SQL at:");
      console.warn("   https://supabase.com/dashboard/project/uybhscmvncjxsokzgyuu/sql/new");
    } else if (error) {
      console.warn("⚠️  Supabase check:", error.message);
    } else {
      console.log("✅ Supabase REST connected — tables ready");
    }
  }).catch(() => {});
}

export default db;
