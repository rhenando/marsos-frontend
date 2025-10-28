// frontend/src/state/useAuthStore.ts
import { create } from "zustand";
import { persist } from "zustand/middleware";
import { supabase } from "@/lib/supabaseClient";

export interface UserProfile {
  id: string;
  email: string;
  full_name?: string;
  role?: "admin" | "buyer" | "supplier";
}

interface AuthState {
  user: UserProfile | null;
  session: any | null;
  loading: boolean;

  // Actions
  setUser: (user: UserProfile | null) => void;
  setSession: (session: any | null) => void;
  clearUser: () => void;
  logout: (
    navigate?: (url: string) => void,
    i18n?: any,
    role?: string | null
  ) => Promise<void>;
  restoreSession: () => Promise<void>;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      session: null,
      loading: false,

      setUser: (user) => set({ user }),
      setSession: (session) => set({ session }),
      clearUser: () => set({ user: null, session: null }),

      logout: async (navigate, i18n, role) => {
        try {
          // ✅ Clear local state immediately to avoid flicker
          set({ user: null, session: null });

          // ✅ Perform Supabase logout (server-side session clear)
          await supabase.auth.signOut();

          // ✅ Optional: redirect cleanly if context provided
          if (navigate && i18n) {
            const lang = i18n.language || "en";
            navigate(
              role === "admin" ? `/${lang}/admin-login` : `/${lang}/user-login`,
              { replace: true }
            );
          }
        } catch (error) {
          console.error("Logout failed:", error);
        }
      },

      restoreSession: async () => {
        try {
          set({ loading: true });
          const { data, error } = await supabase.auth.getSession();

          if (error) {
            console.error("Session restore failed:", error.message);
            set({ loading: false });
            return;
          }

          const session = data?.session || null;
          const user = session?.user
            ? {
                id: session.user.id,
                email: session.user.email!,
                role: session.user.user_metadata?.role,
                full_name: session.user.user_metadata?.full_name,
              }
            : null;

          set({ session, user, loading: false });
        } catch (err) {
          console.error("Unexpected restoreSession error:", err);
          set({ loading: false });
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
