import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { useTranslation } from "react-i18next";
import { Card, CardContent } from "@/components/ui/data-display/card";
import DateDropdownPicker from "@/components/global/DateDropdownPicker";
import { v4 as uuidv4 } from "uuid";

// ----- Constants -----
const STEP_KEYS = [
  "supplier.steps.authNun",
  "supplier.steps.verifyDate",
  "supplier.steps.completeDetails",
];

const PHONE_CODES = ["+966", "+971", "+973", "+965", "+968", "+974", "+63"];

type CalendarType = "hijri" | "gregorian";
type LocaleType = "en" | "ar";

export default function SupplierOnboarding() {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const locale = (i18n.language as LocaleType) || "en";
  const isRtl = locale === "ar";

  // --- UI States ---
  const [step, setStep] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(false);
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [passwordErrors, setPasswordErrors] = useState<string[]>([]);
  const [emailErrors] = useState<Record<string, string>>({});

  // --- Form State ---
  const [form, setForm] = useState({
    nun: "",
    dateType: "hijri" as CalendarType,
    issueDate: "",
    companyName: "",
    companyEmail: "",
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
    companyPhoneCode: "+966",
    companyPhone: "",
    city: "",
    zipCode: "",
    country: "",
    address: "",
    authPersonName: "",
    authPersonEmail: "",
    authPassword: "",
    authPhoneCode: "+966",
    authPersonMobile: "",
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
          authPhoneCode: match,
          authPersonMobile: saved.slice(match.length),
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

  const getClientIP = async (): Promise<string> => {
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

      if (field === "authPassword") {
        const validation = validatePassword(value);
        setPasswordErrors(validation.errors);
        return { ...prev, authPassword: value };
      }

      if (field === "companyPhone" || field === "authPersonMobile")
        return { ...prev, [field]: onlyDigits(value) };

      return { ...prev, [field]: value };
    });
  };

  const authenticateNun = async () => {
    if (!form.nun) return toast.error(t("supplier.errors.nunRequired"));
    setLoading(true);
    try {
      toast.success(t("supplier.messages.authSuccess"));
      setStep(1);
    } catch {
      toast.error(t("supplier.errors.authFailed"));
    } finally {
      setLoading(false);
    }
  };

  const verifyIssueDate = async () => {
    if (!form.issueDate) return toast.error(t("supplier.errors.dateRequired"));
    setLoading(true);
    try {
      toast.success(t("supplier.messages.dateVerified"));
      setStep(2);
    } catch {
      toast.error(t("supplier.errors.dateFailed"));
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
      "companyName",
      "companyEmail",
      "commercialReg",
      "vatRegNumber",
      "companyPhone",
      "city",
      "zipCode",
      "country",
      "address",
      "authPersonName",
      "authPersonEmail",
      "authPassword",
      "authPersonMobile",
      "designation",
      "personalIdNumber",
      "crFile",
      "vatFile",
    ];

    if (requiredFields.some((f) => !(form as any)[f])) {
      return toast.error(t("supplier.errors.completeAllFields"));
    }

    setLoading(true);
    try {
      const cleanedCompanyEmail = String(form.companyEmail)
        .replace(/["'<>]/g, "")
        .replace(/\u200B/g, "")
        .replace(/\r?\n|\r/g, "")
        .trim()
        .toLowerCase();

      const cleanedAuthPersonEmail = String(form.authPersonEmail)
        .replace(/["'<>]/g, "")
        .replace(/\u200B/g, "")
        .replace(/\r?\n|\r/g, "")
        .trim()
        .toLowerCase();

      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (
        !emailRegex.test(cleanedCompanyEmail) ||
        !emailRegex.test(cleanedAuthPersonEmail)
      ) {
        toast.error("Please enter valid email addresses.");
        setLoading(false);
        return;
      }

      const clientIP = await getClientIP();
      const crUrl = form.crFile ? await uploadToStorage(form.crFile, "cr") : "";
      const vatUrl = form.vatFile
        ? await uploadToStorage(form.vatFile, "vat")
        : "";

      if (!crUrl || !vatUrl)
        throw new Error(
          "Document upload failed. Please re-upload CR/VAT files."
        );

      const newSupplierId = uuidv4();
      const cleaned = {
        id: newSupplierId,
        company_name: sanitize(form.companyName),
        company_email: cleanedCompanyEmail,
        auth_person_email: cleanedAuthPersonEmail,
        auth_person_name: sanitize(form.authPersonName),
        commercial_reg: sanitize(form.commercialReg),
        vat_reg_number: sanitize(form.vatRegNumber),
        city: sanitize(form.city),
        zip_code: sanitize(form.zipCode),
        country: sanitize(form.country),
        address: sanitize(form.address),
        designation: sanitize(form.designation),
        personal_id_number: sanitize(form.personalIdNumber),
        phone: `${form.authPhoneCode}${form.authPersonMobile}`,
        company_phone: `${form.companyPhoneCode}${form.companyPhone}`,
        cr_license_url: String(crUrl),
        vat_doc_url: String(vatUrl),
        role: "supplier",
        is_verified: false,
        account_status: "pending_approval",
        registration_ip: clientIP,
      };

      const res = await fetch(
        "http://localhost:5001/api/create-supplier-profile",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(cleaned),
        }
      );

      const result = await res.json();
      if (!res.ok)
        throw new Error(result.error || "Profile submission failed.");

      toast.success(
        "Your supplier registration has been submitted for approval."
      );
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
            {t("supplier.welcome.title")}
          </h2>
          <div className='flex justify-center gap-6' role='list'>
            {stepBadges}
          </div>

          <div className='mt-6'>
            {/* STEP 0 — NUN */}
            {step === 0 && (
              <div className='space-y-4'>
                <label className='block text-sm font-medium text-gray-700'>
                  {t("supplier.labels.nun")} *
                </label>
                <div className='flex flex-col md:flex-row gap-4'>
                  <input
                    className='w-full md:flex-1 p-2 border rounded-md focus:ring-2 focus:ring-[#2c6449]'
                    value={form.nun}
                    onChange={(e) => handleChange("nun", e.target.value)}
                    placeholder={t("supplier.placeholders.nun")}
                    maxLength={20}
                  />
                  <button
                    onClick={authenticateNun}
                    disabled={loading || !form.nun}
                    className='w-full md:w-auto md:px-6 bg-[#2c6449] text-white py-2 rounded-md font-semibold hover:bg-[#24513b] transition disabled:opacity-50'
                  >
                    {loading
                      ? t("supplier.buttons.authenticating")
                      : t("supplier.buttons.authenticate")}
                  </button>
                </div>
              </div>
            )}

            {/* STEP 1 — Date Verify */}
            {step === 1 && (
              <div className='bg-white border rounded-lg shadow-sm p-5 space-y-6'>
                <h3 className='text-lg font-semibold text-[#2c6449]'>
                  {t("supplier.labels.issueDate")}{" "}
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
                      {t(`supplier.labels.${type}`)}
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
                        ? t("supplier.buttons.verifyingDate")
                        : t("supplier.buttons.verify")}
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* STEP 2 — Full Form */}
            {step === 2 && (
              <form onSubmit={submitOnboarding} className='space-y-6'>
                <div className='border rounded-lg p-4'>
                  <h3 className='text-[#2c6449] font-semibold mb-3'>
                    {t("supplier.legends.companyDetails")}
                  </h3>

                  {/* --- Company Details Fields --- */}
                  <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                    {/* CR FILE (SAFE) */}
                    <div>
                      <label className='block text-sm font-medium text-gray-700'>
                        {t("supplier.labels.commercialReg")} *
                      </label>
                      <input
                        placeholder={t("supplier.placeholders.commercialReg")}
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
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) handleChange("crFile", file);
                        }}
                        className='mt-2 block w-full text-sm text-gray-700 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-medium file:bg-[#2c6449] file:text-white hover:file:bg-[#24513b]'
                        required
                      />
                      {form.crFileUrl && form.crFile ? (
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
                      ) : null}
                    </div>

                    {/* VAT FILE (SAFE) */}
                    <div>
                      <label className='block text-sm font-medium text-gray-700'>
                        {t("supplier.labels.vatRegNumber")} *
                      </label>
                      <input
                        placeholder={t("supplier.placeholders.vatRegNumber")}
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
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) handleChange("vatFile", file);
                        }}
                        className='mt-2 block w-full text-sm text-gray-700 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-medium file:bg-[#2c6449] file:text-white hover:file:bg-[#24513b]'
                        required
                      />
                      {form.vatFileUrl && form.vatFile ? (
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
                      ) : null}
                    </div>
                  </div>
                </div>

                <button
                  type='submit'
                  disabled={loading || passwordErrors.length > 0}
                  className='w-full bg-[#2c6449] text-white py-2 rounded-md font-semibold hover:bg-[#24513b] transition disabled:opacity-50 disabled:cursor-not-allowed'
                >
                  {loading
                    ? t("supplier.buttons.uploading")
                    : t("supplier.buttons.submit")}
                </button>
              </form>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
