// src/lib/supabaseServer.ts
import { createClient, SupabaseClient } from "@supabase/supabase-js";

// ─────────────────────────────────────────────────────────────
// 🔧 Load environment variables
// ─────────────────────────────────────────────────────────────
const url = import.meta.env.VITE_SUPABASE_URL as string;
const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string;

if (!url || !anonKey) {
  throw new Error(
    "❌ Missing Supabase env vars: VITE_SUPABASE_URL or VITE_SUPABASE_ANON_KEY"
  );
}

// ─────────────────────────────────────────────────────────────
// 🧩 Global cache (prevents duplicate clients during Vite HMR)
// ─────────────────────────────────────────────────────────────
const globalForSupabase = globalThis as unknown as {
  _supabase?: SupabaseClient;
};

// ─────────────────────────────────────────────────────────────
// 🚀 Create Supabase client
// ─────────────────────────────────────────────────────────────
if (!globalForSupabase._supabase) {
  globalForSupabase._supabase = createClient(url, anonKey, {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true,
      storage: localStorage,
      storageKey: "supabase-auth-client",
    },
    global: {
      headers: {
        apikey: anonKey,
        "x-client-info": "marsos-vite-frontend",
      },
    },
  });
}

// ─────────────────────────────────────────────────────────────
// 📦 Export single instance
// ─────────────────────────────────────────────────────────────
export const supabase = globalForSupabase._supabase!;

// ─────────────────────────────────────────────────────────────
// 🔒 Optional: Log auth state changes (for debugging)
// ─────────────────────────────────────────────────────────────
supabase.auth.onAuthStateChange((event, session) => {
  if (import.meta.env.DEV) {
    console.log(`[Supabase Auth] Event: ${event}`, session?.user?.email || "");
  }
});

// ─────────────────────────────────────────────────────────────
// 🧠 Optional debug info (only in dev mode)
// ─────────────────────────────────────────────────────────────
if (import.meta.env.DEV) {
  console.log("[Supabase] ⚙️ URL:", url);
  console.log(
    "[Supabase] 🔑 Using anon key prefix:",
    anonKey.slice(0, 10) + "..."
  );
}
