import React, { useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { Instagram, Linkedin, Twitter, Facebook, Youtube } from "lucide-react";
import LanguageSelector from "@/components/global/LanguageSelector";

// Example placeholder translation function (replace later with i18next or JSON)
const t = (key: string): string => {
  const translations: Record<string, string> = {
    aboutTitle: "About Us",
    aboutText:
      "We are a trusted marketplace connecting suppliers and buyers across industries.",
    about_us: "Learn More",
    quickLinks: "Quick Links",
    exploreProducts: "Explore Products",
    viewCategories: "View Categories",
    support: "Support",
    helpCenter: "Help Center",
    terms: "Terms & Conditions",
    privacy: "Privacy Policy",
    followUs: "Follow Us",
    rights: "© 2025 Marsos. All rights reserved.",
  };
  return translations[key] || key;
};

interface PaymentLogo {
  src: string;
  alt: string;
}

export default function Footer(): JSX.Element {
  const location = useLocation();

  // ✅ Detect locale (default to English)
  const locale = location.pathname?.split("/")[1] === "ar" ? "ar" : "en";
  const prefix = `/${locale}`;

  // ✅ Build image path per locale
  const basePath = `/${locale}/images/payments`;

  const paymentLogos: PaymentLogo[] = [
    { src: `${basePath}/visa.png`, alt: "Visa" },
    { src: `${basePath}/master.png`, alt: "Mastercard" },
    { src: `${basePath}/applepay.png`, alt: "Apple Pay" },
    { src: `${basePath}/mada.png`, alt: "Mada" },
    { src: `${basePath}/tamara.png`, alt: "Tamara" },
    { src: `${basePath}/tabby.png`, alt: "Tabby" },
  ];

  // ✅ Load SSL seal (client-side only)
  useEffect(() => {
    if (typeof window === "undefined") return;
    if (!document.getElementById("gogetssl-seal-script")) {
      const script = document.createElement("script");
      script.src =
        "https://gogetssl-cdn.s3.eu-central-1.amazonaws.com/site-seals/gogetssl-seal.js";
      script.async = true;
      script.id = "gogetssl-seal-script";
      document.body.appendChild(script);
    }
  }, []);

  return (
    <footer className='bg-[#2c6449] text-white text-sm'>
      <div className='max-w-screen-xl mx-auto px-4 py-10'>
        {/* Top Grid */}
        <div className='grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6'>
          {/* About */}
          <div>
            <h3 className='font-semibold mb-3 text-[#f9d783]'>
              {t("aboutTitle")}
            </h3>
            <p className='text-gray-200'>{t("aboutText")}</p>
            <Link
              to={`${prefix}/about-us`}
              className='inline-block mt-2 text-[#f9d783] hover:underline font-medium transition'
            >
              {t("about_us")}
            </Link>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className='font-semibold mb-3 text-[#f9d783]'>
              {t("quickLinks")}
            </h3>
            <ul className='space-y-2'>
              <li>
                <Link to={`${prefix}/products`} className='hover:underline'>
                  {t("exploreProducts")}
                </Link>
              </li>
              <li>
                <Link to={`${prefix}/categories`} className='hover:underline'>
                  {t("viewCategories")}
                </Link>
              </li>
            </ul>
          </div>

          {/* Support */}
          <div>
            <h3 className='font-semibold mb-3 text-[#f9d783]'>
              {t("support")}
            </h3>
            <ul className='space-y-2'>
              <li>
                <Link to={`${prefix}/faq`} className='hover:underline'>
                  {t("helpCenter")}
                </Link>
              </li>
              <li>
                <Link
                  to={`${prefix}/updated-terms-and-conditions`}
                  className='hover:underline'
                >
                  {t("terms")}
                </Link>
              </li>
              <li>
                <Link
                  to={`${prefix}/updated-privacy-policy`}
                  className='hover:underline'
                >
                  {t("privacy")}
                </Link>
              </li>
            </ul>
          </div>

          {/* Social */}
          <div>
            <h3 className='font-semibold mb-3 text-[#f9d783]'>
              {t("followUs")}
            </h3>
            <div className='flex gap-4 flex-wrap text-white'>
              <a href='#' aria-label='Instagram'>
                <Instagram size={18} />
              </a>
              <a href='#' aria-label='LinkedIn'>
                <Linkedin size={18} />
              </a>
              <a href='#' aria-label='Twitter'>
                <Twitter size={18} />
              </a>
              <a href='#' aria-label='Facebook'>
                <Facebook size={18} />
              </a>
              <a href='#' aria-label='YouTube'>
                <Youtube size={18} />
              </a>
              <LanguageSelector />
            </div>
          </div>
        </div>

        {/* Payments + Logo + SSL */}
        <div className='mt-10 flex flex-col md:flex-row justify-between items-center gap-y-6 border-t pt-6'>
          <div className='relative w-[180px] h-[64px]'>
            <img
              src={`/${locale}/saudi_business_logo.svg`}
              alt='Saudi Business Center'
              className='object-contain w-[180px] h-[64px]'
            />
          </div>

          <div className='flex flex-wrap justify-center gap-2'>
            {paymentLogos.map(({ src, alt }, i) => (
              <img
                key={i}
                src={src}
                alt={alt}
                width={80}
                height={50}
                className='object-contain h-6'
                style={{ width: "auto" }}
              />
            ))}
          </div>

          <div className='text-center'>
            <a
              href='https://www.gogetssl.com'
              rel='nofollow'
              title='GoGetSSL Site Seal Logo'
            >
              <div
                id='gogetssl-animated-seal'
                style={{
                  width: "160px",
                  height: "58px",
                  display: "inline-block",
                }}
              />
            </a>
          </div>
        </div>

        {/* Copyright */}
        <div className='text-center text-xs text-gray-300 mt-6'>
          {t("rights")}
        </div>
      </div>
    </footer>
  );
}
