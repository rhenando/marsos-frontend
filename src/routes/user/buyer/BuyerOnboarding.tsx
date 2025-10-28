// src/routes/user/buyer/BuyerOnboarding.tsx
import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { useTranslation } from "react-i18next";
import { Card, CardContent } from "@/components/ui/data-display/card";
import DateDropdownPicker from "@/components/global/DateDropdownPicker";
import { v4 as uuidv4 } from "uuid";

type CalendarType = "hijri" | "gregorian";
type LocaleType = "en" | "ar";

// ----- Constants -----
const STEP_KEYS = [
  "buyer.steps.authNun",
  "buyer.steps.verifyDate",
  "buyer.steps.completeDetails",
];

const PHONE_CODES = ["+966", "+971", "+973", "+965", "+968", "+974", "+63"];

export default function SecureBuyerOnboardingPage() {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();

  // ✅ Narrow down locale to the two allowed types
  const locale = (i18n.language as LocaleType) || "en";
  const isRtl = locale === "ar";

  // --- UI States ---
  const [step, setStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [passwordErrors, setPasswordErrors] = useState<string[]>([]);
  // ❌ Unused setter removed
  const [emailErrors] = useState<Record<string, string>>({});

  // --- Form State ---
  const [form, setForm] = useState({
    nun: "",
    dateType: "hijri" as CalendarType,
    issueDate: "",
    fullName: "",
    personalEmail: "",
    crFile: null as File | null,
    crFileUrl: null as string | null,
    vatFile: null as File | null,
    vatFileUrl: null as string | null,
    commercialReg: "",
    crIssueG: "",
    crIssueH: "",
    crConfirmG: "",
    crConfirmH: "",
    vatRegNumber: "",
    personalPhoneCode: "+966",
    personalPhone: "",
    city: "",
    zipCode: "",
    country: "",
    address: "",
    buyerName: "",
    buyerEmail: "",
    buyerPassword: "",
    buyerPhoneCode: "+966",
    buyerMobile: "",
    designation: "",
    personalIdNumber: "",
  });

  // Load cached phone (if any)
  useEffect(() => {
    const saved = localStorage.getItem("unregisteredPhone");
    if (saved) {
      const match = PHONE_CODES.find((code) => saved.startsWith(code));
      if (match) {
        setForm((prev) => ({
          ...prev,
          buyerPhoneCode: match,
          buyerMobile: saved.slice(match.length),
        }));
      }
    }
  }, []);

  // ----- Validators -----
  const validatePassword = (password: string) => {
    const errors: string[] = [];
    if (!password) return { isValid: false, errors: ["Password is required"] };
    if (password.length < 8)
      errors.push("Password must be at least 8 characters long");
    if (!/[A-Z]/.test(password))
      errors.push("Password must contain at least one uppercase letter");
    if (!/[a-z]/.test(password))
      errors.push("Password must contain at least one lowercase letter");
    if (!/\d/.test(password))
      errors.push("Password must contain at least one number");
    if (!/[!@#$%^&*()_+\-=[\]{};':\"\\|,.<>/?]/.test(password))
      errors.push("Password must contain at least one special character");
    return { isValid: errors.length === 0, errors };
  };

  const sanitize = (s: string) => s.trim();
  const onlyDigits = (s: string) => s.replace(/\D/g, "");

  const getClientIP = async () => {
    try {
      const res = await fetch("http://localhost:5001/api/get-client-ip");
      const data = await res.json();
      return data?.ip || "unknown";
    } catch {
      return "unknown";
    }
  };

  const uploadViaServer = async (file: File, prefix: string) => {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("prefix", prefix);

    const res = await fetch("http://localhost:5001/api/upload-doc", {
      method: "POST",
      body: formData,
    });

    const data = await res.json();
    if (!res.ok) throw new Error(data.error || "Upload failed");
    return data.signedUrl || data.path;
  };

  // ----- Handlers -----
  const handleChange = (field: keyof typeof form, value: any) => {
    setForm((prev) => {
      if (prev[field] === value) return prev;

      if (field === "crFile" && value)
        return {
          ...prev,
          crFile: value,
          crFileUrl: URL.createObjectURL(value),
        };

      if (field === "vatFile" && value)
        return {
          ...prev,
          vatFile: value,
          vatFileUrl: URL.createObjectURL(value),
        };

      if (field === "buyerPassword") {
        const validation = validatePassword(value);
        setPasswordErrors(validation.errors);
        return { ...prev, buyerPassword: value };
      }

      if (field === "personalPhone" || field === "buyerMobile")
        return { ...prev, [field]: onlyDigits(value) };

      if (field === "dateType")
        return { ...prev, dateType: value as CalendarType };

      return { ...prev, [field]: value };
    });
  };

  const authenticateNun = async () => {
    if (!form.nun) return toast.error(t("buyer.errors.nunRequired"));
    setLoading(true);
    try {
      toast.success(t("buyer.messages.authSuccess"));
      setStep(1);
    } catch {
      toast.error(t("buyer.errors.authFailed"));
    } finally {
      setLoading(false);
    }
  };

  const verifyIssueDate = async () => {
    if (!form.issueDate) return toast.error(t("buyer.errors.dateRequired"));
    setLoading(true);
    try {
      toast.success(t("buyer.messages.dateVerified"));
      setStep(2);
    } catch {
      toast.error(t("buyer.errors.dateFailed"));
    } finally {
      setLoading(false);
    }
  };

  const uploadToStorage = async (file: File, prefix: string) => {
    try {
      return await uploadViaServer(file, prefix);
    } catch (err: any) {
      toast.error(err.message || "Upload failed");
      throw err;
    }
  };

  // ───────────────────────────────────────────────
  // Submit Onboarding Form
  // ───────────────────────────────────────────────
  const submitOnboarding = async (e: React.FormEvent) => {
    e.preventDefault();

    const requiredFields = [
      "fullName",
      "personalEmail",
      "commercialReg",
      "vatRegNumber",
      "personalPhone",
      "city",
      "zipCode",
      "country",
      "address",
      "buyerName",
      "buyerEmail",
      "buyerMobile",
      "designation",
      "personalIdNumber",
      "crFile",
      "vatFile",
    ];

    if (requiredFields.some((f) => !form[f as keyof typeof form])) {
      return toast.error(t("buyer.errors.completeAllFields"));
    }

    setLoading(true);
    try {
      const cleanedBuyerEmail = String(form.buyerEmail)
        .replace(/["'<>]/g, "")
        .replace(/\u200B/g, "")
        .replace(/\r?\n|\r/g, "")
        .trim()
        .toLowerCase();

      const cleanedPersonalEmail = String(form.personalEmail)
        .replace(/["'<>]/g, "")
        .replace(/\u200B/g, "")
        .replace(/\r?\n|\r/g, "")
        .trim()
        .toLowerCase();

      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (
        !emailRegex.test(cleanedBuyerEmail) ||
        !emailRegex.test(cleanedPersonalEmail)
      ) {
        toast.error("Please enter valid email addresses.");
        setLoading(false);
        return;
      }

      const clientIP = await getClientIP();
      const crUrl = await uploadToStorage(form.crFile!, "cr");
      const vatUrl = await uploadToStorage(form.vatFile!, "vat");

      if (!crUrl || !vatUrl)
        throw new Error(
          "Document upload failed. Please re-upload CR/VAT files."
        );

      const newBuyerId = uuidv4();
      const cleaned = {
        id: newBuyerId,
        full_name: sanitize(form.fullName),
        personal_email: cleanedPersonalEmail,
        buyer_email: cleanedBuyerEmail,
        buyer_name: sanitize(form.buyerName),
        commercial_reg: sanitize(form.commercialReg),
        vat_reg_number: sanitize(form.vatRegNumber),
        city: sanitize(form.city),
        zip_code: sanitize(form.zipCode),
        country: sanitize(form.country),
        address: sanitize(form.address),
        designation: sanitize(form.designation),
        personal_id_number: sanitize(form.personalIdNumber),
        phone: `${form.buyerPhoneCode}${form.buyerMobile}`,
        personal_phone: `${form.personalPhoneCode}${form.personalPhone}`,
        cr_license_url: String(crUrl),
        vat_doc_url: String(vatUrl),
        role: "buyer",
        is_verified: false,
        account_status: "pending_approval",
        registration_ip: clientIP,
      };

      const res = await fetch("http://localhost:5001/api/create-profile", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(cleaned),
      });

      const result = await res.json();
      if (!res.ok)
        throw new Error(result.error || "Profile submission failed.");

      toast.success("Your registration has been submitted for approval.");
      navigate("/user-login");
    } catch (err: any) {
      toast.error(err.message || "Something went wrong while submitting.");
    } finally {
      setLoading(false);
    }
  };

  // ───────────────────────────────────────────────
  // UI Rendering
  // ───────────────────────────────────────────────
  const stepBadges = useMemo(
    () =>
      STEP_KEYS.map((key, i) => (
        <div key={key} className='flex flex-col items-center'>
          <div
            className={`w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-bold ${
              step === i
                ? "bg-[#2c6449]"
                : i < step
                ? "bg-green-500"
                : "bg-gray-300"
            }`}
          >
            {i < step ? "✓" : i + 1}
          </div>
          <div
            className={`mt-1 text-xs ${
              step === i ? "text-[#2c6449] font-medium" : "text-gray-500"
            }`}
          >
            {t(key)}
          </div>
        </div>
      )),
    [step, t]
  );

  return (
    <div
      dir={isRtl ? "rtl" : "ltr"}
      className='min-h-[80vh] flex items-center justify-center bg-gray-50 px-4 py-6'
    >
      <Card className='w-full max-w-4xl bg-white shadow-xl rounded-lg'>
        <CardContent className='p-6 sm:p-10 space-y-6'>
          <h2 className='text-2xl font-bold text-center text-[#2c6449]'>
            {t("buyer.welcome.title")}
          </h2>
          <div className='flex justify-center gap-6' role='list'>
            {stepBadges}
          </div>
          <div className='mt-6'>
            {step === 0 && (
              <div className='space-y-4'>
                <label className='block text-sm font-medium text-gray-700'>
                  {t("buyer.labels.nun")} *
                </label>
                <div className='flex flex-col md:flex-row gap-4'>
                  <input
                    className='w-full md:flex-1 p-2 border rounded-md focus:ring-2 focus:ring-[#2c6449]'
                    value={form.nun}
                    onChange={(e) => handleChange("nun", e.target.value)}
                    placeholder={t("buyer.placeholders.nun")}
                    maxLength={20}
                  />
                  <button
                    onClick={authenticateNun}
                    disabled={loading || !form.nun}
                    className='w-full md:w-auto md:px-6 bg-[#2c6449] text-white py-2 rounded-md font-semibold hover:bg-[#24513b] transition disabled:opacity-50'
                  >
                    {loading
                      ? t("buyer.buttons.authenticating")
                      : t("buyer.buttons.authenticate")}
                  </button>
                </div>
              </div>
            )}

            {step === 1 && (
              <div className='bg-white border rounded-lg shadow-sm p-5 space-y-6'>
                <h3 className='text-lg font-semibold text-[#2c6449]'>
                  {t("buyer.labels.issueDate")}{" "}
                  <span className='text-red-500'>*</span>
                </h3>
                <div className='flex gap-2'>
                  {["hijri", "gregorian"].map((type) => (
                    <button
                      key={type}
                      type='button'
                      onClick={() => handleChange("dateType", type)}
                      className={`px-4 py-1 text-sm rounded-full border font-medium transition ${
                        form.dateType === type
                          ? "bg-[#2c6449] text-white border-[#2c6449]"
                          : "bg-white text-gray-700 border-gray-300 hover:border-[#2c6449]"
                      }`}
                    >
                      {t(`buyer.labels.${type}`)}
                    </button>
                  ))}
                </div>
                <div className='flex flex-col md:flex-row md:items-end gap-4'>
                  <div className='w-full md:flex-1 relative'>
                    <DateDropdownPicker
                      type={form.dateType}
                      locale={locale}
                      required
                      onChange={({ formatted }) =>
                        handleChange("issueDate", formatted)
                      }
                    />
                    {form.dateType === "hijri" && (
                      <p className='text-xs text-gray-500 mt-1'>
                        {t("Converted Gregorian")}:{" "}
                        <strong className='text-gray-700'>
                          {form.issueDate}
                        </strong>
                      </p>
                    )}
                  </div>
                  <div className='w-full md:w-[160px]'>
                    <button
                      type='button'
                      onClick={verifyIssueDate}
                      disabled={loading || !form.issueDate}
                      className='w-full bg-[#2c6449] text-white py-2.5 px-4 rounded-md font-semibold hover:bg-[#24513b] transition text-sm disabled:opacity-50'
                    >
                      {loading
                        ? t("buyer.buttons.verifyingDate")
                        : t("buyer.buttons.verify")}
                    </button>
                  </div>
                </div>
              </div>
            )}

            {step === 2 && (
              <form onSubmit={submitOnboarding} className='space-y-6'>
                <div className='border rounded-lg p-4'>
                  <h3 className='text-[#2c6449] font-semibold mb-3'>
                    {t("buyer.legends.personalDetails")}
                  </h3>
                  <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                    <input
                      placeholder={t("buyer.placeholders.fullName")}
                      value={form.fullName}
                      onChange={(e) => handleChange("fullName", e.target.value)}
                      className='p-2 border rounded-md'
                      maxLength={100}
                      required
                    />
                    <div>
                      <input
                        type='email'
                        placeholder={t("buyer.placeholders.personalEmail")}
                        value={form.personalEmail}
                        onChange={(e) =>
                          handleChange("personalEmail", e.target.value)
                        }
                        className={`p-2 border rounded-md w-full ${
                          emailErrors.personalEmail ? "border-red-500" : ""
                        }`}
                        required
                        inputMode='email'
                        autoComplete='email'
                      />
                      {emailErrors.personalEmail && (
                        <p className='text-xs text-red-600 mt-1'>
                          {emailErrors.personalEmail}
                        </p>
                      )}
                    </div>

                    <div>
                      <label className='block text-sm font-medium text-gray-700'>
                        {t("buyer.labels.commercialReg")} *
                      </label>
                      <input
                        placeholder={t("buyer.placeholders.commercialReg")}
                        value={form.commercialReg}
                        onChange={(e) =>
                          handleChange("commercialReg", e.target.value)
                        }
                        className='mt-1 block w-full p-2 border rounded-md'
                        maxLength={20}
                        required
                      />
                      <input
                        type='file'
                        accept='.jpg,.jpeg,.png,.pdf'
                        onChange={(e) =>
                          handleChange("crFile", e.target.files?.[0] || null)
                        }
                        className='mt-2 block w-full text-sm text-gray-700 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-medium file:bg-[#2c6449] file:text-white hover:file:bg-[#24513b]'
                        required
                      />
                      {form.crFileUrl && form.crFile && (
                        <div className='mt-3 text-sm'>
                          {form.crFile.type.startsWith("image/") ? (
                            <img
                              src={form.crFileUrl}
                              alt='CR Preview'
                              className='mt-2 w-32 h-auto rounded border'
                            />
                          ) : (
                            <a
                              href={form.crFileUrl}
                              target='_blank'
                              rel='noopener noreferrer'
                              className='text-blue-600 underline'
                            >
                              {form.crFile.name}
                            </a>
                          )}
                        </div>
                      )}
                    </div>

                    <div>
                      <label className='block text-sm font-medium text-gray-700'>
                        {t("buyer.labels.vatRegNumber")} *
                      </label>
                      <input
                        placeholder={t("buyer.placeholders.vatRegNumber")}
                        value={form.vatRegNumber}
                        onChange={(e) =>
                          handleChange("vatRegNumber", e.target.value)
                        }
                        className='mt-1 block w-full p-2 border rounded-md'
                        maxLength={15}
                        required
                      />
                      <input
                        type='file'
                        accept='.jpg,.jpeg,.png,.pdf'
                        onChange={(e) =>
                          handleChange("vatFile", e.target.files?.[0] || null)
                        }
                        className='mt-2 block w-full text-sm text-gray-700 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-medium file:bg-[#2c6449] file:text-white hover:file:bg-[#24513b]'
                        required
                      />
                      {form.vatFileUrl && form.vatFile && (
                        <div className='mt-3 text-sm'>
                          {form.vatFile.type.startsWith("image/") ? (
                            <img
                              src={form.vatFileUrl}
                              alt='VAT Preview'
                              className='mt-2 w-32 h-auto rounded border'
                            />
                          ) : (
                            <a
                              href={form.vatFileUrl}
                              target='_blank'
                              rel='noopener noreferrer'
                              className='text-blue-600 underline'
                            >
                              {form.vatFile.name}
                            </a>
                          )}
                        </div>
                      )}
                    </div>

                    <DateDropdownPicker
                      type='gregorian'
                      locale={locale}
                      label={t("buyer.labels.crIssueG")}
                      required
                      onChange={({ formatted }) =>
                        handleChange("crIssueG", formatted)
                      }
                    />
                    <DateDropdownPicker
                      type='hijri'
                      locale={locale}
                      label={t("buyer.labels.crIssueH")}
                      required
                      onChange={({ formatted }) =>
                        handleChange("crIssueH", formatted)
                      }
                    />
                    <DateDropdownPicker
                      type='gregorian'
                      locale={locale}
                      label={t("buyer.labels.crConfirmG")}
                      required
                      onChange={({ formatted }) =>
                        handleChange("crConfirmG", formatted)
                      }
                    />
                    <DateDropdownPicker
                      type='hijri'
                      locale={locale}
                      label={t("buyer.labels.crConfirmH")}
                      required
                      onChange={({ formatted }) =>
                        handleChange("crConfirmH", formatted)
                      }
                    />

                    <div className='flex'>
                      <select
                        value={form.personalPhoneCode}
                        onChange={(e) =>
                          handleChange("personalPhoneCode", e.target.value)
                        }
                        className='p-2 border rounded-l-md bg-gray-50'
                      >
                        {PHONE_CODES.map((code) => (
                          <option key={code} value={code}>
                            {code}
                          </option>
                        ))}
                      </select>
                      <input
                        type='tel'
                        value={form.personalPhone}
                        onChange={(e) =>
                          handleChange("personalPhone", e.target.value)
                        }
                        placeholder={t("buyer.placeholders.personalPhone")}
                        className='flex-1 p-2 border rounded-r-md'
                        maxLength={15}
                        required
                        inputMode='tel'
                        autoComplete='tel'
                      />
                    </div>

                    <input
                      placeholder={t("buyer.placeholders.city")}
                      value={form.city}
                      onChange={(e) => handleChange("city", e.target.value)}
                      className='p-2 border rounded-md'
                      maxLength={50}
                      required
                    />
                    <input
                      placeholder={t("buyer.placeholders.zipCode")}
                      value={form.zipCode}
                      onChange={(e) => handleChange("zipCode", e.target.value)}
                      className='p-2 border rounded-md'
                      maxLength={10}
                      required
                      inputMode='numeric'
                    />
                    <input
                      placeholder={t("buyer.placeholders.country")}
                      value={form.country}
                      onChange={(e) => handleChange("country", e.target.value)}
                      className='p-2 border rounded-md'
                      maxLength={50}
                      required
                    />
                    <textarea
                      rows={3}
                      placeholder={t("buyer.placeholders.address")}
                      value={form.address}
                      onChange={(e) => handleChange("address", e.target.value)}
                      className='p-2 border rounded-md md:col-span-2'
                      maxLength={500}
                      required
                    />
                  </div>
                </div>

                <div className='border rounded-lg p-4'>
                  <h3 className='text-[#2c6449] font-semibold mb-3'>
                    {t("buyer.legends.accountDetails")}
                  </h3>
                  <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                    <input
                      placeholder={t("buyer.placeholders.buyerName")}
                      value={form.buyerName}
                      onChange={(e) =>
                        handleChange("buyerName", e.target.value)
                      }
                      className='p-2 border rounded-md'
                      maxLength={100}
                      required
                    />
                    <div>
                      <input
                        type='email'
                        placeholder={t("buyer.placeholders.buyerEmail")}
                        value={form.buyerEmail}
                        onChange={(e) =>
                          handleChange("buyerEmail", e.target.value)
                        }
                        className={`p-2 border rounded-md w-full ${
                          emailErrors.buyerEmail ? "border-red-500" : ""
                        }`}
                        required
                        inputMode='email'
                        autoComplete='email'
                      />
                      {emailErrors.buyerEmail && (
                        <p className='text-xs text-red-600 mt-1'>
                          {emailErrors.buyerEmail}
                        </p>
                      )}
                    </div>

                    {/* Password with live policy checks */}
                    <div className='md:col-span-2 bg-yellow-50 p-3 rounded-md'>
                      <label className='block text-sm font-medium text-[#2c6449] mb-2'>
                        {t("buyer.placeholders.buyerPassword")} * (Secure
                        Password Required)
                      </label>
                      <div className='relative'>
                        <input
                          type={showPassword ? "text" : "password"}
                          placeholder={t("buyer.placeholders.buyerPassword")}
                          value={form.buyerPassword}
                          onChange={(e) =>
                            handleChange("buyerPassword", e.target.value)
                          }
                          className={`p-2 border rounded-md w-full pr-16 ${
                            passwordErrors.length > 0
                              ? "border-red-500"
                              : form.buyerPassword &&
                                passwordErrors.length === 0
                              ? "border-green-500"
                              : ""
                          }`}
                          required
                          autoComplete='new-password'
                        />
                        <button
                          type='button'
                          onClick={() => setShowPassword(!showPassword)}
                          className='absolute right-2 top-1/2 -translate-y-1/2 text-gray-600 text-sm hover:text-gray-800'
                          aria-label={
                            showPassword ? "Hide password" : "Show password"
                          }
                        >
                          {showPassword ? "Hide" : "Show"}
                        </button>
                      </div>

                      <div className='mt-2 text-xs'>
                        <p className='font-medium mb-1 text-[#2c6449]'>
                          Password Requirements:
                        </p>
                        <div className='grid grid-cols-1 sm:grid-cols-2 gap-1'>
                          <span
                            className={
                              form.buyerPassword.length >= 8
                                ? "text-green-600"
                                : "text-red-600"
                            }
                          >
                            • At least 8 characters{" "}
                            {form.buyerPassword.length >= 8 ? "✓" : "✗"}
                          </span>
                          <span
                            className={
                              /[A-Z]/.test(form.buyerPassword)
                                ? "text-green-600"
                                : "text-red-600"
                            }
                          >
                            • One uppercase letter{" "}
                            {/[A-Z]/.test(form.buyerPassword) ? "✓" : "✗"}
                          </span>
                          <span
                            className={
                              /[a-z]/.test(form.buyerPassword)
                                ? "text-green-600"
                                : "text-red-600"
                            }
                          >
                            • One lowercase letter{" "}
                            {/[a-z]/.test(form.buyerPassword) ? "✓" : "✗"}
                          </span>
                          <span
                            className={
                              /\d/.test(form.buyerPassword)
                                ? "text-green-600"
                                : "text-red-600"
                            }
                          >
                            • One number{" "}
                            {/\d/.test(form.buyerPassword) ? "✓" : "✗"}
                          </span>
                          <span
                            className={`${
                              /[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/.test(
                                form.buyerPassword
                              )
                                ? "text-green-600"
                                : "text-red-600"
                            } sm:col-span-2`}
                          >
                            • One special character{" "}
                            {/[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/.test(
                              form.buyerPassword
                            )
                              ? "✓"
                              : "✗"}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className='flex'>
                      <select
                        value={form.buyerPhoneCode}
                        onChange={(e) =>
                          handleChange("buyerPhoneCode", e.target.value)
                        }
                        className='p-2 border rounded-l-md bg-gray-50'
                      >
                        {PHONE_CODES.map((code) => (
                          <option key={code} value={code}>
                            {code}
                          </option>
                        ))}
                      </select>
                      <input
                        type='tel'
                        value={form.buyerMobile}
                        onChange={(e) =>
                          handleChange("buyerMobile", e.target.value)
                        }
                        placeholder={t("buyer.placeholders.buyerMobile")}
                        className='flex-1 p-2 border rounded-r-md'
                        maxLength={15}
                        required
                        inputMode='tel'
                        autoComplete='tel'
                      />
                    </div>
                    <input
                      placeholder={t("buyer.placeholders.designation")}
                      value={form.designation}
                      onChange={(e) =>
                        handleChange("designation", e.target.value)
                      }
                      className='p-2 border rounded-md'
                      maxLength={50}
                      required
                    />
                    <input
                      placeholder={t("buyer.placeholders.personalIdNumber")}
                      value={form.personalIdNumber}
                      onChange={(e) =>
                        handleChange("personalIdNumber", e.target.value)
                      }
                      className='p-2 border rounded-md'
                      maxLength={20}
                      required
                    />
                  </div>
                </div>

                <button
                  type='submit'
                  disabled={loading || passwordErrors.length > 0}
                  className='w-full bg-[#2c6449] text-white py-2 rounded-md font-semibold hover:bg-[#24513b] transition disabled:opacity-50 disabled:cursor-not-allowed'
                >
                  {loading
                    ? t("buyer.buttons.uploading")
                    : t("buyer.buttons.submit")}
                </button>
              </form>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
