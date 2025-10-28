import React, { useEffect } from "react";
import { supabase } from "@/lib/supabaseClient";
import { useAuthStore } from "@/state/useAuthStore";
import { I18nextProvider } from "react-i18next";
import i18n from "@/lib/i18n/i18n";

export default function RootProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const { restoreSession, setUser, setSession, loading } = useAuthStore();

  useEffect(() => {
    // ─────────────────────────────────────────────
    // ✅ Restore session on first app load
    // ─────────────────────────────────────────────
    (async () => {
      await restoreSession(); // checks localStorage & loads Supabase session
      const { data } = await supabase.auth.getSession();
      if (data.session?.user) {
        const { user } = data.session;
        setSession(data.session);
        setUser({
          id: user.id,
          email: user.email!,
          role: user.user_metadata?.role || "buyer",
          full_name: user.user_metadata?.full_name || "",
        });
        console.log("[RootProvider] 🔑 Session restored →", user.email);
      } else {
        console.log("[RootProvider] ⚠️ No active session found");
      }
    })();

    // ─────────────────────────────────────────────
    // ✅ Subscribe to global auth state changes
    // ─────────────────────────────────────────────
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      switch (event) {
        case "SIGNED_IN":
          console.log("[Auth] ✅ SIGNED_IN →", session?.user?.email);
          break;
        case "SIGNED_OUT":
          console.log("[Auth] 🚪 SIGNED_OUT");
          break;
        case "TOKEN_REFRESHED":
          console.log("[Auth] 🔁 TOKEN_REFRESHED");
          break;
        case "USER_UPDATED":
          console.log("[Auth] 👤 USER_UPDATED");
          break;
      }

      // 🔹 Sync Zustand state with Supabase session changes
      if (session?.user) {
        const { user } = session;
        setSession(session);
        setUser({
          id: user.id,
          email: user.email!,
          role: user.user_metadata?.role || "buyer",
          full_name: user.user_metadata?.full_name || "",
        });
      } else {
        setUser(null);
        setSession(null);
      }
    });

    // ✅ Clean up listener on unmount
    return () => {
      subscription.unsubscribe();
    };
  }, []);

  if (loading) {
    return (
      <div className='flex items-center justify-center h-screen text-gray-500'>
        Loading session...
      </div>
    );
  }

  // ─────────────────────────────────────────────
  // ✅ Wrap with I18n context
  // ─────────────────────────────────────────────
  return <I18nextProvider i18n={i18n}>{children}</I18nextProvider>;
}
