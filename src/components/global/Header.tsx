import React, { useState, useEffect, useCallback } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  User,
  Send,
  MessageSquare,
  ShoppingCart,
  MapPin,
  Globe,
} from "lucide-react";
import { useCartStore } from "@/state/useCartStore";
import { useAuthStore } from "@/state/useAuthStore";
import { useTranslation } from "react-i18next";
import LanguageSelector from "@/components/global/LanguageSelector";
import MobileMenuSheet from "@/components/global/MobileMenuSheet";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/overlay/dropdown-menu";

// Lazy-load ProductSearch to optimize performance
const ProductSearch = React.lazy(
  () => import("@/components/global/productSearch/ProductSearch")
);

export default function Header() {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const { cartCount } = useCartStore();
  const { user, logout } = useAuthStore();

  // Safely access user data with fallback
  const role = user?.role ?? null;
  const displayName = user?.email || (user as any)?.phone || t("header.signIn");

  // ─────────────────────────────
  // 🌍 Geolocation logic
  // ─────────────────────────────
  const [coords, setCoords] = useState<{ lat: string; lng: string } | null>(
    null
  );
  const [locationName, setLocationName] = useState<string | null>(null);
  const [locError, setLocError] = useState<string | null>(null);

  useEffect(() => {
    const storedCoords = localStorage.getItem("coords");
    const storedName = localStorage.getItem("locationName");
    if (storedCoords) setCoords(JSON.parse(storedCoords));
    if (storedName) setLocationName(storedName);
  }, []);

  useEffect(() => {
    if (coords || locationName) return;
    if (!navigator.geolocation) return setLocError("Geolocation not supported");

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { latitude, longitude } = pos.coords;
        const geo = { lat: latitude.toFixed(3), lng: longitude.toFixed(3) };
        setCoords(geo);
        localStorage.setItem("coords", JSON.stringify(geo));
      },
      (err) => setLocError(err.message)
    );
  }, [coords, locationName]);

  useEffect(() => {
    if (!coords || locationName) return;
    (async () => {
      try {
        const res = await fetch(
          `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${coords.lat}&lon=${coords.lng}`
        );
        const data = await res.json();
        const address = data.address || {};
        const city = address.city || address.town || address.county;
        const region = address.state || address.province;
        const name =
          city && region
            ? `${city}, ${region}`
            : city || region || data.display_name;

        if (name) {
          setLocationName(name);
          localStorage.setItem("locationName", name);
        }
      } catch {
        setLocError("Reverse geocoding error");
      }
    })();
  }, [coords, locationName]);

  const renderLocationText = useCallback(() => {
    if (locationName) return locationName;
    if (locError) return "Unavailable";
    return "Detecting…";
  }, [locationName, locError]);

  const handleLogout = () => logout(navigate, i18n, role);
  const [menuOpen, setMenuOpen] = useState(false);

  // ─────────────────────────────
  // 🧩 Render Header
  // ─────────────────────────────
  return (
    <header className='w-full bg-white/90 backdrop-blur-md shadow-sm z-50'>
      <div className='max-w-full mx-auto flex items-center justify-between px-4 md:px-6 h-26'>
        {/* ── Left: Logo ── */}
        <div className='flex items-center'>
          <Link to='/' className='flex-shrink-0' aria-label='Home'>
            <img
              src='/images/logos/logo.svg'
              alt='Marsos logo'
              width={48}
              height={48}
            />
          </Link>

          {/* Mobile Search */}
          <div className='md:hidden ml-1 flex items-center'>
            <React.Suspense
              fallback={
                <div className='w-full text-center text-gray-400 text-sm'>
                  Loading search…
                </div>
              }
            >
              <ProductSearch />
            </React.Suspense>
          </div>
        </div>

        {/* ── Center: Search (Desktop) ── */}
        <div className='hidden md:flex flex-1 mx-6'>
          <React.Suspense
            fallback={
              <div className='w-full text-center text-gray-400 text-sm'>
                Loading search…
              </div>
            }
          >
            <ProductSearch />
          </React.Suspense>
        </div>

        {/* ── Right Section ── */}
        <div className='flex items-center'>
          {/* Mobile Menu */}
          <div className='md:hidden'>
            <MobileMenuSheet
              user={user}
              userRole={role}
              displayName={displayName}
              cartCount={cartCount}
              onLogout={handleLogout}
              onDashboard={() => {
                if (!role) return;
                navigate(
                  role === "buyer"
                    ? "/buyer-dashboard"
                    : role === "supplier"
                    ? "/supplier-dashboard"
                    : "/admin-dashboard"
                );
              }}
              onLogin={() => navigate("/user-login")}
              renderLocationText={renderLocationText}
            />
          </div>

          {/* Desktop Menu */}
          <div className='hidden lg:flex items-start space-x-8 ml-6 text-[#2c6449]'>
            {/* 🔹 User Dropdown */}
            {user ? (
              <DropdownMenu open={menuOpen} onOpenChange={setMenuOpen}>
                <DropdownMenuTrigger
                  asChild
                  onMouseEnter={() => setMenuOpen(true)}
                  onMouseLeave={() => setMenuOpen(false)}
                >
                  <div className='group flex flex-col items-center cursor-pointer transition-all duration-200 hover:text-[#1b4d36]'>
                    <User
                      size={18}
                      className='transition-transform duration-200 group-hover:scale-110 group-hover:text-[#1b4d36]'
                    />
                    <span className='text-sm mt-1 transition-colors duration-200 group-hover:text-[#1b4d36]'>
                      {displayName}
                    </span>
                  </div>
                </DropdownMenuTrigger>

                <DropdownMenuContent
                  side='bottom'
                  align='end'
                  className='w-40'
                  onMouseEnter={() => setMenuOpen(true)}
                  onMouseLeave={() => setTimeout(() => setMenuOpen(false), 150)}
                >
                  <DropdownMenuItem
                    onClick={() =>
                      navigate(role ? `/${role}/dashboard` : "/buyer/dashboard")
                    }
                  >
                    {t("header.dashboard")}
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={handleLogout}>
                    {t("header.logout")}
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <button
                onClick={() => navigate(`/${i18n.language}/user-login`)}
                className='group flex flex-col items-center cursor-pointer text-[#2c6449] transition-all duration-200 ease-in-out hover:text-[#1b4d36]'
              >
                <User
                  size={18}
                  className='transition-transform duration-200 ease-in-out group-hover:scale-110 group-hover:text-[#1b4d36]'
                />
                <span className='text-sm mt-1 transition-colors duration-200 ease-in-out group-hover:text-[#1b4d36]'>
                  {t("header.signIn")}
                </span>
              </button>
            )}

            {/* 🔹 Request RFQ */}
            <button
              onClick={() => navigate("/rfq")}
              className='group flex flex-col items-center cursor-pointer transition-all duration-200 ease-in-out text-[#2c6449] hover:text-[#1b4d36]'
            >
              <Send
                size={18}
                className='transition-transform duration-200 group-hover:scale-110 group-hover:text-[#1b4d36]'
              />
              <span className='text-sm mt-1 transition-colors group-hover:text-[#1b4d36]'>
                {t("header.requestRFQ")}
              </span>
            </button>

            {/* 🔹 Export from Saudi */}
            <button
              onClick={() => navigate("/import-from-saudi")}
              className='group flex flex-col items-center cursor-pointer transition-all duration-200 ease-in-out text-[#2c6449] hover:text-[#1b4d36]'
            >
              <Globe
                size={18}
                className='transition-transform duration-200 group-hover:scale-110 group-hover:text-[#1b4d36]'
              />
              <span className='text-sm mt-1 transition-colors group-hover:text-[#1b4d36]'>
                {t("header.exportFromSaudi")}
              </span>
            </button>

            {/* 🔹 Messages */}
            {user && (
              <Link
                to='/buyer/messages'
                className='group flex flex-col items-center cursor-pointer transition-all duration-200 ease-in-out text-[#2c6449] hover:text-[#1b4d36]'
              >
                <MessageSquare
                  size={18}
                  className='transition-transform duration-200 group-hover:scale-110 group-hover:text-[#1b4d36]'
                />
                <span className='text-sm mt-1 transition-colors group-hover:text-[#1b4d36]'>
                  {t("header.messages")}
                </span>
              </Link>
            )}

            {/* 🔹 Cart */}
            {role !== "admin" && (
              <Link
                to='/cart'
                className='group relative flex flex-col items-center cursor-pointer transition-all duration-200 ease-in-out text-[#2c6449] hover:text-[#1b4d36]'
              >
                <ShoppingCart
                  size={18}
                  className='transition-transform duration-200 group-hover:scale-110 group-hover:text-[#1b4d36]'
                />
                <span className='text-sm mt-1 transition-colors group-hover:text-[#1b4d36]'>
                  {t("header.cart")}
                </span>
                {cartCount > 0 && (
                  <span className='absolute -top-1 -right-2 bg-red-600 text-white text-[10px] w-4 h-4 rounded-full flex items-center justify-center'>
                    {cartCount}
                  </span>
                )}
              </Link>
            )}

            {/* 🔹 Location */}
            <div className='flex flex-col items-center text-[#2c6449]'>
              <MapPin size={18} />
              <span className='text-xs mt-2'>{renderLocationText()}</span>
            </div>

            {/* 🔹 Language Selector */}
            <div className='flex flex-col items-center hover:text-[#1b4d36] transition-colors'>
              <LanguageSelector />
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
