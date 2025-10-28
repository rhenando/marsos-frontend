// frontend/src/state/useAuthStore.ts
import { create } from "zustand";
import { persist } from "zustand/middleware";
import { supabase } from "@/lib/supabaseClient";

/**
 * ────────────────────────────────
 * 🧩 Types
 * ────────────────────────────────
 */
export interface UserProfile {
  id: string;
  email: string;
  full_name?: string;
  role?: "admin" | "buyer" | "supplier";
}

interface AuthState {
  user: UserProfile | null;
  session: Record<string, any> | null;
  loading: boolean;

  // Actions
  setUser: (user: UserProfile | null) => void;
  setSession: (session: Record<string, any> | null) => void;
  clearUser: () => void;
  logout: (
    navigate?: (url: string, opts?: Record<string, any>) => void,
    i18n?: { language: string },
    role?: string | null
  ) => Promise<void>;
  restoreSession: () => Promise<void>;
}

/**
 * ────────────────────────────────
 * 🔐 Zustand Auth Store (Persistent)
 * ────────────────────────────────
 */
export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      session: null,
      loading: false,

      setUser: (user) => set({ user }),
      setSession: (session) => set({ session }),
      clearUser: () => set({ user: null, session: null }),

      /**
       * ✅ Logout user safely
       * Clears both Zustand + Supabase sessions
       */
      logout: async (navigate, i18n, role) => {
        try {
          // Immediately clear local state to prevent stale data flicker
          set({ user: null, session: null });

          // Server-side logout
          await supabase.auth.signOut();

          // Optional redirect after logout
          if (navigate && i18n) {
            const lang = i18n.language || "en";
            navigate(
              role === "admin" ? `/${lang}/admin-login` : `/${lang}/user-login`,
              { replace: true }
            );
          }
        } catch (error) {
          console.error("🚨 Logout failed:", error);
        }
      },

      /**
       * ✅ Restore Supabase session on app reload
       */
      restoreSession: async () => {
        try {
          set({ loading: true });

          const { data, error } = await supabase.auth.getSession();
          if (error) throw error;

          const session = data?.session ?? null;
          const user = session?.user
            ? {
                id: session.user.id,
                email: session.user.email ?? "",
                role: session.user.user_metadata?.role,
                full_name: session.user.user_metadata?.full_name,
              }
            : null;

          set({ session, user, loading: false });
        } catch (err) {
          console.error("🚨 restoreSession error:", err);
          set({ loading: false, session: null, user: null });
        }
      },
    }),
    {
      name: "marsos-auth-storage",
      partialize: (state) => ({
        user: state.user,
        session: state.session,
      }),
    }
  )
);
