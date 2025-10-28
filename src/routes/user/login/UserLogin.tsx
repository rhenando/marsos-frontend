import { useState, useEffect, ChangeEvent } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { useTranslation } from "react-i18next";
import { Input } from "@/components/ui/form/input";
import { Button } from "@/components/ui/base/button";
import { Card, CardContent } from "@/components/ui/data-display/card";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/navigation/tabs";
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from "@/components/ui/form/input-otp";
import { Phone, Mail, Eye, EyeOff } from "lucide-react";
import { supabase } from "@/lib/supabaseClient";

type TabType = "email" | "phone";
type Stage = "phone" | "otp";

export default function AuthPage(): React.ReactElement | null {
  // ✅ useTranslation without namespace (since "login" is nested under translation)
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const locale = i18n.language || "en";
  const isRtl = locale === "ar";

  // -----------------------------------------
  // State
  // -----------------------------------------
  const [mounted, setMounted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<TabType>("phone");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isSignUp, setIsSignUp] = useState(false);
  const [countryCode, setCountryCode] = useState("+966");
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState("");
  const [stage, setStage] = useState<Stage>("phone");
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [isNewUser, setIsNewUser] = useState(false);
  const [userRole, setUserRole] = useState<string | null>(null);

  const fullPhone = `${countryCode}${phone}`;

  useEffect(() => setMounted(true), []);
  if (!mounted) return null;

  // -----------------------------------------
  // Validators
  // -----------------------------------------
  const validateEmail = (val: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val);
  const validatePassword = (val: string) => val.length >= 6;

  // --------------------------------------------------------
  // EMAIL / PASSWORD AUTH
  // --------------------------------------------------------
  const handleEmailAuth = async (): Promise<void> => {
    if (!termsAccepted) {
      toast.error(t("login.errors.mustAcceptTerms"));
      return;
    }
    if (!validateEmail(email)) {
      toast.error(
        locale === "ar" ? "البريد الإلكتروني غير صالح" : "Invalid email"
      );
      return;
    }
    if (!validatePassword(password)) {
      toast.error(
        locale === "ar"
          ? "كلمة المرور يجب أن تكون 6 أحرف على الأقل"
          : "Password must be at least 6 characters"
      );
      return;
    }

    setLoading(true);
    try {
      if (isSignUp) {
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: `${window.location.origin}/auth/callback`,
          },
        });
        if (error) throw error;
        toast.success(
          locale === "ar"
            ? "تم إنشاء الحساب بنجاح"
            : "Account created successfully"
        );
      } else {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (error) throw error;

        // ✅ Determine redirect by profile role
        const { data: profile } = await supabase
          .from("profiles")
          .select("role")
          .eq("email", email)
          .maybeSingle();

        const redirectTo =
          profile?.role === "supplier"
            ? `/${locale}/supplier/dashboard`
            : `/${locale}/`;
        navigate(redirectTo);
        toast.success(t("login.messages.welcomeBack"));
      }
    } catch (err: any) {
      toast.error(err.message || t("login.errors.authFailed"));
    } finally {
      setLoading(false);
    }
  };

  // --------------------------------------------------------
  // PHONE / OTP AUTH
  // --------------------------------------------------------
  const handleSendOtp = async (): Promise<void> => {
    if (!termsAccepted) {
      toast.error(t("login.errors.mustAcceptTerms"));
      return;
    }

    if (phone.length < 8 || !/^\d+$/.test(phone)) {
      toast.error(
        locale === "ar" ? "رقم الجوال غير صالح" : "Invalid phone number"
      );
      return;
    }

    setLoading(true);
    try {
      // ⚙️ Call your own backend route (Node/Express)
      const res = await fetch(
        `${
          import.meta.env.VITE_API_URL
        }/api/check-phone?phone=${encodeURIComponent(fullPhone)}`
      );

      const json = await res.json();
      if (json.error) throw new Error(json.error);

      if (json.status === "new") {
        setIsNewUser(true);
        toast.info(
          locale === "ar"
            ? "لا يوجد سجل لهذا الرقم، يتم تحويلك إلى صفحة التسجيل."
            : "We don't have a record for this number, redirecting to registration page."
        );

        navigate(
          `/${locale}/user-choices?phone=${encodeURIComponent(fullPhone)}`
        );
        return;
      }

      if (json.status === "pending") {
        toast.info(
          locale === "ar"
            ? "حسابك قيد المراجعة"
            : "Your account is pending admin approval."
        );
        return;
      }

      // ✅ Verified user
      setIsNewUser(false);
      setUserRole(json.role || null);

      const { error } = await supabase.auth.signInWithOtp({ phone: fullPhone });
      if (error) throw error;

      toast.success(t("login.messages.otpSent"));
      setStage("otp");
    } catch (err: any) {
      toast.error(err.message || t("login.errors.otpSendFailed"));
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (): Promise<void> => {
    if (otp.length < 6) {
      toast.error(t("login.errors.invalidOtp"));
      return;
    }

    setLoading(true);
    try {
      const { error } = await supabase.auth.verifyOtp({
        phone: fullPhone,
        token: otp,
        type: "sms",
      });
      if (error) throw error;

      const normalizedPhone = fullPhone.replace(/^\+/, "");
      const { data: profile } = await supabase
        .from("profiles")
        .select("role")
        .eq("phone", normalizedPhone)
        .maybeSingle();

      if (isNewUser || !profile) {
        navigate(
          `/${locale}/user-choices?phone=${encodeURIComponent(fullPhone)}`
        );
      } else if (profile.role === "supplier") {
        navigate(`/${locale}/supplier/dashboard`);
      } else {
        navigate(`/${locale}/`);
      }

      toast.success(t("login.messages.welcomeBack"));
    } catch (err: any) {
      toast.error(err.message || t("login.errors.otpVerifyFailed"));
    } finally {
      setLoading(false);
    }
  };

  // --------------------------------------------------------
  // UI
  // --------------------------------------------------------
  return (
    <div className='lg:grid lg:grid-cols-2 min-h-[86vh] items-center'>
      {/* LEFT PANEL */}
      <div
        className='bg-gray-50 px-4 sm:px-6 lg:px-8 h-full'
        dir={isRtl ? "rtl" : "ltr"}
      >
        <div className='flex items-center justify-center h-full'>
          <div className='w-full max-w-md space-y-8'>
            <div className='text-center mt-4'>
              <h2 className='text-2xl font-bold text-gray-900'>
                {activeTab === "email"
                  ? isSignUp
                    ? t("login.title.signup")
                    : t("login.title.signin")
                  : t(`login.title.${stage}`)}
              </h2>
              <p className='mt-2 text-sm text-gray-600'>
                {activeTab === "email"
                  ? isSignUp
                    ? t("login.desc.signup")
                    : t("login.desc.signin")
                  : t(`login.desc.${stage}`)}
              </p>
            </div>

            <Card className='bg-white shadow-lg rounded-lg'>
              <CardContent className='px-6 py-8 space-y-6'>
                <Tabs value={activeTab} onValueChange={setActiveTab}>
                  <TabsList className='grid w-full grid-cols-2'>
                    <TabsTrigger value='email'>
                      <Mail className='w-4 h-4 mr-1' /> Email
                    </TabsTrigger>
                    <TabsTrigger value='phone'>
                      <Phone className='w-4 h-4 mr-1' /> Phone
                    </TabsTrigger>
                  </TabsList>

                  {/* EMAIL / PASSWORD TAB */}
                  <TabsContent value='email' className='space-y-4'>
                    <Input
                      type='email'
                      placeholder='you@example.com'
                      value={email}
                      onChange={(e: ChangeEvent<HTMLInputElement>) =>
                        setEmail(e.target.value)
                      }
                    />
                    <div className='relative'>
                      <Input
                        type={showPassword ? "text" : "password"}
                        placeholder='********'
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                      />
                      <button
                        type='button'
                        className='absolute right-3 top-2.5'
                        onClick={() => setShowPassword(!showPassword)}
                      >
                        {showPassword ? (
                          <EyeOff className='w-5 h-5 text-gray-400' />
                        ) : (
                          <Eye className='w-5 h-5 text-gray-400' />
                        )}
                      </button>
                    </div>

                    <label className='flex items-center space-x-2 text-sm'>
                      <input
                        type='checkbox'
                        checked={termsAccepted}
                        onChange={(e) => setTermsAccepted(e.target.checked)}
                      />
                      <span>
                        {t("login.labels.acceptTerms")}{" "}
                        <a
                          href='/updated-terms-and-conditions'
                          target='_blank'
                          className='text-primary font-medium hover:underline'
                        >
                          {t("login.links.terms")}
                        </a>{" "}
                        &amp;{" "}
                        <a
                          href='/updated-privacy-policy'
                          target='_blank'
                          className='text-primary font-medium hover:underline'
                        >
                          {t("login.links.privacy")}
                        </a>
                      </span>
                    </label>

                    <Button
                      className='w-full'
                      disabled={loading || !termsAccepted}
                      onClick={handleEmailAuth}
                    >
                      {loading
                        ? t("login.buttons.processing")
                        : isSignUp
                        ? t("login.buttons.signup")
                        : t("login.buttons.signin")}
                    </Button>

                    <div className='text-center'>
                      <button
                        type='button'
                        onClick={() => setIsSignUp(!isSignUp)}
                        className='text-sm text-primary hover:underline'
                      >
                        {isSignUp
                          ? t("login.links.haveAccount")
                          : t("login.links.needAccount")}
                      </button>
                    </div>
                  </TabsContent>

                  {/* PHONE / OTP TAB */}
                  <TabsContent value='phone' className='space-y-4'>
                    {stage === "phone" && (
                      <>
                        <div className='flex gap-2'>
                          <select
                            value={countryCode}
                            onChange={(e) => setCountryCode(e.target.value)}
                            className='border rounded-md px-3 py-2 w-28'
                          >
                            <option value='+966'>+966</option>
                            <option value='+971'>+971</option>
                            <option value='+63'>+63</option>
                          </select>
                          <Input
                            type='tel'
                            placeholder={t("login.placeholders.phone")}
                            value={phone}
                            onChange={(e) => setPhone(e.target.value)}
                            maxLength={9}
                          />
                        </div>

                        <label className='flex items-center space-x-2 text-sm'>
                          <input
                            type='checkbox'
                            checked={termsAccepted}
                            onChange={(e) => setTermsAccepted(e.target.checked)}
                          />
                          <span>
                            {t("login.labels.acceptTerms")}{" "}
                            <a
                              href='/updated-terms-and-conditions'
                              target='_blank'
                              className='text-primary font-medium hover:underline'
                            >
                              {t("login.links.terms")}
                            </a>{" "}
                            &amp;{" "}
                            <a
                              href='/updated-privacy-policy'
                              target='_blank'
                              className='text-primary font-medium hover:underline'
                            >
                              {t("login.links.privacy")}
                            </a>
                          </span>
                        </label>

                        <Button
                          className='w-full'
                          disabled={loading || !termsAccepted}
                          onClick={handleSendOtp}
                        >
                          {loading
                            ? t("login.buttons.sending")
                            : t("login.buttons.sendOtp")}
                        </Button>
                      </>
                    )}

                    {stage === "otp" && (
                      <>
                        <div className='flex justify-center'>
                          <InputOTP maxLength={6} value={otp} onChange={setOtp}>
                            <InputOTPGroup>
                              {Array.from({ length: 6 }).map((_, i) => (
                                <InputOTPSlot key={i} index={i} />
                              ))}
                            </InputOTPGroup>
                          </InputOTP>
                        </div>
                        <Button
                          className='w-full'
                          disabled={loading}
                          onClick={handleVerifyOtp}
                        >
                          {loading
                            ? t("login.buttons.verifying")
                            : t("login.buttons.verifyOtp")}
                        </Button>
                      </>
                    )}
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* RIGHT PANEL */}
      <div className='hidden lg:flex h-full bg-gradient-to-br from-[#2c6449] to-green-400 text-white flex-col items-center justify-center p-10'>
        <img src='/logo.svg' alt='Marsos Logo' className='w-28 mb-4' />
        <h1 className='text-4xl font-bold mb-4'>{t("login.welcome.title")}</h1>
        <p className='text-lg max-w-sm text-center opacity-80'>
          {t("login.welcome.subtitle")}
        </p>
      </div>
    </div>
  );
}
