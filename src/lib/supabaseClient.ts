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
// 🧩 Global cache (prevents duplicate clients in Vite HMR)
// ─────────────────────────────────────────────────────────────
const globalForSupabase = globalThis as unknown as {
  _supabase?: SupabaseClient;
};

// ─────────────────────────────────────────────────────────────
// 🚀 Create Supabase client (Kong-compatible for local setup)
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
        // ✅ Kong requires this for all /rest/v1 calls
        apikey: anonKey,

        // ⚠️ DO NOT add Authorization header here when using Supabase Local.
        // Local anon/service_role keys are not real JWTs → will trigger
        // "Expected 3 parts in JWT; got 1" from PostgREST.

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
// 🔒 Auth event listener (keeps localStorage & tabs in sync)
// ─────────────────────────────────────────────────────────────
supabase.auth.onAuthStateChange((event, session) => {
  switch (event) {
    case "SIGNED_IN":
      console.log("✅ Signed in →", session?.user?.email);
      break;
    case "SIGNED_OUT":
      console.log("🚪 Signed out");
      break;
    case "TOKEN_REFRESHED":
      console.log("🔁 Token refreshed");
      break;
    case "USER_UPDATED":
      console.log("👤 User updated");
      break;
    default:
      console.log(`ℹ️ Auth event: ${event}`);
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
