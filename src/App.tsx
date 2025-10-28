import { useEffect } from "react";
import { Routes, Route, Navigate, useLocation } from "react-router-dom";
import { useTranslation } from "react-i18next";
import "@/lib/i18n/i18n";

// Main pages
import Home from "@/routes/Home";
import UserLogin from "@/routes/user/login/UserLogin";
import UserChoices from "@/routes/user/UserChoices";
import SupplierDashboard from "@/routes/user/supplier/Dashboard";

// Global components
import Header from "@/components/global/Header";
import Footer from "@/components/global/Footer";
import BuyerOnboarding from "@/routes/user/buyer/BuyerOnboarding";
import SupplierOnboarding from "@/routes/user/supplier/SupplierOnboarding";
import AdminLogin from "@/routes/admin/login/AdminLogin";
import AdminDashboardPage from "@/routes/admin/dashboard/Dashboard";
import Users from "@/routes/admin/dashboard/Users";
import Products from "@/routes/admin/dashboard/Products";
import Orders from "@/routes/admin/dashboard/Orders";
import Settings from "@/routes/admin/dashboard/Settings";

import ProductDetailsPage from "./components/global/ProductDetails";

function LocaleWatcher() {
  const { i18n } = useTranslation();
  const location = useLocation();

  useEffect(() => {
    const firstSegment = location.pathname.split("/")[1];
    const supported = ["ar", "en"];
    const urlLang = supported.includes(firstSegment) ? firstSegment : null;

    const savedLang = localStorage.getItem("lang");
    const browserLang = navigator.language.startsWith("ar") ? "ar" : "en";
    const effectiveLang = urlLang || savedLang || browserLang;

    if (i18n.language !== effectiveLang) {
      i18n.changeLanguage(effectiveLang);
    }

    document.documentElement.lang = effectiveLang;
    document.documentElement.dir = effectiveLang === "ar" ? "rtl" : "ltr";
    document.body.style.fontFamily =
      effectiveLang === "ar"
        ? "'SaudiWeb', sans-serif"
        : "'Montserrat', sans-serif";

    localStorage.setItem("lang", effectiveLang);
  }, [location.pathname, i18n]);

  return null;
}

export default function App() {
  const { i18n } = useTranslation();

  return (
    <>
      <LocaleWatcher />
      <Header />

      <Routes>
        {/* Root redirect to preferred locale */}
        <Route
          path='/'
          element={<Navigate to={`/${i18n.language || "en"}`} replace />}
        />

        <Route path='/:locale/product/:id' element={<ProductDetailsPage />} />

        {/* Locale-prefixed home */}
        <Route path='/:locale' element={<Home />} />
        <Route path='/:locale/*' element={<Home />} />

        {/* User Login */}
        <Route path='/:locale/user-login' element={<UserLogin />} />
        <Route path='/:locale/admin-login' element={<AdminLogin />} />

        {/* User Choices Page */}
        <Route path='/:locale/user-choices' element={<UserChoices />} />

        {/* Buyer and Supplier Onboarding */}
        <Route path='/:locale/buyer-onboarding' element={<BuyerOnboarding />} />
        <Route
          path='/:locale/supplier-onboarding'
          element={<SupplierOnboarding />}
        />

        {/* Admin Related */}
        <Route
          path='/:locale/admin-dashboard'
          element={<AdminDashboardPage />}
        />
        <Route path='/:locale/users' element={<Users />} />
        <Route path='/:locale/products' element={<Products />} />
        <Route path='/:locale/orders' element={<Orders />} />
        <Route path='/:locale/settings' element={<Settings />} />

        {/* Supplier Dashboard */}
        <Route
          path='/:locale/supplier/dashboard'
          element={<SupplierDashboard />}
        />

        {/* Fallback redirect for unknown routes */}
        <Route
          path='*'
          element={<Navigate to={`/${i18n.language || "en"}`} replace />}
        />
      </Routes>

      <Footer />
    </>
  );
}
