import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Input } from "@/components/ui/form/input";
import { Button } from "@/components/ui/base/button";
import { toast } from "sonner";
import { MailIcon, LockIcon } from "lucide-react";
import { supabase } from "@/lib/supabaseClient";

export default function AdminLoginPage() {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();

  // ── State
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);

  // ─────────────────────────────
  // 🔐 Handle Login
  // ─────────────────────────────
  const handleLogin = async (): Promise<void> => {
    if (!email || !password) {
      toast.error(
        t("auth.errors.missingFields") || "Please fill in all fields"
      );
      return;
    }

    setLoading(true);

    try {
      // ✅ Sign in via Supabase
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;

      const user = data?.user;
      if (!user) throw new Error("User not found");

      // ✅ Optional: Basic check if the email matches your admin
      // (you can remove this if backend handles all role checks)
      if (user.email !== "marsos@ayn-almanal.com") {
        toast.error(
          t("auth.errors.notAdmin") || "Access denied: Not an admin account"
        );
        await supabase.auth.signOut();
        setLoading(false);
        return;
      }

      // ✅ Supabase automatically stores the session (includes access_token)
      toast.success(t("auth.success") || "Login successful");

      // ✅ Redirect to Admin Dashboard (backend verifies role)
      setTimeout(() => {
        navigate(`/${i18n.language}/admin-dashboard`);
      }, 800);
    } catch (err: unknown) {
      console.error("Admin login error:", err);
      const message =
        err instanceof Error
          ? err.message
          : t("auth.errors.invalidCredentials") || "Invalid credentials";
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  // ─────────────────────────────
  // 🧱 UI
  // ─────────────────────────────
  return (
    <div className='grid grid-cols-1 lg:grid-cols-2 min-h-[86vh] items-center bg-white'>
      {/* Left Panel */}
      <div className='flex flex-col justify-center px-6 py-12 lg:px-24 h-full'>
        <h1 className='mb-8 text-2xl font-semibold text-center text-[#2c6449]'>
          {t("admin.title") || "Marsos Admin"}
        </h1>

        <div className='mx-auto w-full max-w-md space-y-6'>
          {/* Email Field */}
          <div className='space-y-1'>
            <label htmlFor='email' className='text-sm font-medium'>
              {t("auth.email") || "Email"}
            </label>
            <div className='relative'>
              <Input
                id='email'
                type='email'
                placeholder={t("auth.emailPlaceholder") || "admin@example.com"}
                value={email}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  setEmail(e.target.value)
                }
                className='pr-10'
              />
              <MailIcon className='absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400' />
            </div>
          </div>

          {/* Password Field */}
          <div className='space-y-1'>
            <label htmlFor='password' className='text-sm font-medium'>
              {t("auth.password") || "Password"}
            </label>
            <div className='relative'>
              <Input
                id='password'
                type='password'
                placeholder={t("auth.passwordPlaceholder") || "••••••••"}
                value={password}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  setPassword(e.target.value)
                }
                className='pr-10'
              />
              <LockIcon className='absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400' />
            </div>
          </div>

          {/* Login Button */}
          <Button
            onClick={handleLogin}
            disabled={loading}
            className='w-full bg-[#2c6449] hover:bg-[#24523b] text-white'
          >
            {loading
              ? t("auth.loggingIn") || "Logging in…"
              : t("auth.login") || "Login"}
          </Button>
        </div>
      </div>

      {/* Right Image */}
      <div className='hidden lg:flex h-full bg-gray-100 items-center justify-center'>
        <img
          src='/images/logos/logo.svg'
          alt={t("admin.logoAlt") || "Logo"}
          className='w-40 h-40 object-contain'
        />
      </div>
    </div>
  );
}
