// src/lib/i18n/i18n.ts
import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import ar from "./locales/ar.json";
import en from "./locales/en.json";

// Get saved language (localStorage or fallback)
const savedLang =
  typeof window !== "undefined" ? localStorage.getItem("lang") || "en" : "en";

i18n.use(initReactI18next).init({
  resources: {
    en: { translation: en },
    ar: { translation: ar },
  },
  lng: savedLang,
  fallbackLng: "en",
  debug: import.meta.env.DEV, // helpful for dev
  interpolation: {
    escapeValue: false,
  },
  react: {
    useSuspense: false,
  },
});

// Adjust document direction on load
if (typeof document !== "undefined") {
  document.documentElement.dir = savedLang === "ar" ? "rtl" : "ltr";
  document.documentElement.lang = savedLang;
}

export default i18n;
