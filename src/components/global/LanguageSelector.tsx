// src/components/global/LanguageSelector.tsx
import React, { useState, useCallback } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Globe } from "lucide-react";
import {
  Popover,
  PopoverTrigger,
  PopoverContent,
} from "@/components/ui/overlay/popover";
import { Button } from "@/components/ui/base/button";

const LOCALES = [
  { code: "ar", label: "العربية" },
  { code: "en", label: "English" },
] as const;

type LocaleCode = (typeof LOCALES)[number]["code"];

export default function LanguageSelector() {
  const { i18n } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();
  const [open, setOpen] = useState(false);

  const pathname = location.pathname || "/";
  const currentLocale = (i18n.language as LocaleCode) || "en";

  // ---------------------------------------------------------
  // 🌍 Change language handler (no reload)
  // ---------------------------------------------------------
  const handleChange = useCallback(
    (newLocale: LocaleCode) => {
      if (newLocale === currentLocale) {
        setOpen(false);
        return;
      }

      // Save preference and change language
      localStorage.setItem("lang", newLocale);
      i18n.changeLanguage(newLocale);

      // Update route locale segment if exists
      const pathSegments = pathname.split("/");
      if (["ar", "en"].includes(pathSegments[1])) pathSegments[1] = newLocale;
      else pathSegments.splice(1, 0, newLocale);

      navigate(pathSegments.join("/"), { replace: true });
      setOpen(false);
    },
    [currentLocale, pathname, navigate, i18n]
  );

  // ---------------------------------------------------------
  // 🌐 Render UI
  // ---------------------------------------------------------
  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant='ghost'
          className='flex items-center gap-1 hover:text-[#f9d783]'
          aria-label='Change language'
        >
          <Globe size={18} />
          <span className='text-sm font-medium'>
            {LOCALES.find((l) => l.code === currentLocale)?.label || "Language"}
          </span>
        </Button>
      </PopoverTrigger>

      <PopoverContent
        align='end'
        sideOffset={8}
        className='w-40 text-sm z-[9999] border border-gray-200 bg-white shadow-lg'
      >
        {LOCALES.map(({ code, label }) => (
          <Button
            key={code}
            variant={currentLocale === code ? "default" : "ghost"}
            className={`w-full justify-start ${
              currentLocale === code
                ? "font-semibold bg-[#2c6449] text-white hover:bg-[#24523b]"
                : "hover:bg-gray-100"
            }`}
            onClick={() => handleChange(code)}
          >
            {label}
          </Button>
        ))}
      </PopoverContent>
    </Popover>
  );
}
