/**
 * Print the migration SQL and open the Supabase SQL editor URL.
 * The direct Postgres connection is blocked on this network;
 * copy-paste the SQL file into the dashboard instead.
 */
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const sqlFile = path.join(__dirname, "..", "migrations", "001_init.sql");

console.log("\n=== SUPABASE MIGRATION ===");
console.log("Open the SQL editor in your Supabase dashboard:");
console.log("  https://supabase.com/dashboard/project/uybhscmvncjxsokzgyuu/sql/new\n");
console.log("Then paste the following SQL:\n");
console.log("─".repeat(60));
console.log(fs.readFileSync(sqlFile, "utf-8"));
console.log("─".repeat(60));
console.log("\nAfter running the SQL, restart the backend.");

import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import pg from "pg";

const { Pool } = pg;
const __dirname = path.dirname(fileURLToPath(import.meta.url));

const pool = new Pool({
  host: process.env.SUPABASE_DB_HOST || "db.uybhscmvncjxsokzgyuu.supabase.co",
  port: 5432,
  database: "postgres",
  user: "postgres",
  password: process.env.SUPABASE_DB_PASSWORD,
  ssl: { rejectUnauthorized: false },
});

const sqlFile = path.join(__dirname, "..", "migrations", "001_init.sql");
const sql = fs.readFileSync(sqlFile, "utf-8");

try {
  const client = await pool.connect();
  console.log("✅ Connected to Supabase DB");
  await client.query(sql);
  console.log("✅ Migration 001_init.sql applied successfully");
  client.release();
} catch (err) {
  console.error("❌ Migration failed:", err.message);
  process.exit(1);
} finally {
  await pool.end();
}
