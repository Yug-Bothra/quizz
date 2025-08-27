// src/supabaseClient.js
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Debug: log first part of vars (never log full key in production)
console.log("✅ Supabase URL:", supabaseUrl || "❌ Missing!");
console.log("✅ Supabase Anon Key prefix:", supabaseAnonKey?.slice(0, 10) || "❌ Missing!");

// Fail fast if env vars are missing
if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error("❌ Supabase environment variables are missing! Check your .env file.");
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Optional test query (comment out in prod)
(async () => {
  try {
    const { data, error } = await supabase.from("teachers").select("*").limit(1);
    if (error) console.error("🚨 Supabase test query failed:", error.message);
    else console.log("✅ Supabase test query success:", data);
  } catch (err) {
    console.error("🚨 Supabase init error:", err.message);
  }
})();
