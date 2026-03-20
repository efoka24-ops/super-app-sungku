// Chargement explicite du .env, compatible ES module
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, '.env') });

console.log('SUPABASE_URL:', process.env.SUPABASE_URL);
console.log('SUPABASE_SERVICE_ROLE_KEY:', process.env.SUPABASE_SERVICE_ROLE_KEY);
console.log('SUPABASE_PUBLISHABLE_KEY:', process.env.SUPABASE_PUBLISHABLE_KEY);

import { getSupabase } from "./lib/supabase.js";
// ...existing code...

async function testSupabase() {
  const supabase = getSupabase();
  if (!supabase) {
    console.error("Supabase n'est pas configuré");
    process.exit(1);
  }
  const { data, error } = await supabase.from("users").select("*").limit(1);
  if (error) {
    console.error("Erreur Supabase:", error);
    process.exit(1);
  } else {
    console.log("Connexion Supabase OK, exemple utilisateur:", data);
    process.exit(0);
  }
}

testSupabase();
