import React from "react";
import { useNavigate } from "react-router-dom";
import { useIsMobile } from "@/hooks/use-mobile";
import { useTranslation } from "react-i18next";

interface ProductCardProps {
  product?: {
    id: string;
    productname_en?: string;
    productname_ar?: string;
    supplierName?: string;
    suppliername?: string;
    mainImageUrl?: string;
    mainimageurl?: string;
    productName?: string | { en?: string; ar?: string };
    price?: string; // ✅ Added for TrendingProducts integration
  };
}

const translations = {
  en: {
    unnamed_product: "Unnamed Product",
    unknown: "Unknown",
    supplier: "Supplier:",
    view_details: "View Details",
  },
  ar: {
    unnamed_product: "منتج بدون اسم",
    unknown: "غير معروف",
    supplier: "المورد:",
    view_details: "عرض التفاصيل",
  },
};

const ProductCardMinimal: React.FC<ProductCardProps> = ({ product }) => {
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  const { i18n } = useTranslation();
  const locale = i18n.language === "ar" ? "ar" : "en";
  const isRTL = locale === "ar";
  const t = translations[locale];

  // ✅ Silent guard — but log once in dev to help trace Supabase data
  if (!product || typeof product !== "object" || !product.id) {
    if (import.meta.env.DEV) {
      console.debug(
        "⚠️ [ProductCardMinimal] skipped rendering due to invalid or missing product:",
        product
      );
    }
    return null;
  }

  // ✅ Safely resolve product name per locale
  const productName =
    (locale === "ar" ? product.productname_ar : product.productname_en) ||
    (typeof product.productName === "string"
      ? product.productName
      : product.productName?.[locale]) ||
    translations[locale].unnamed_product;

  // ✅ Handle supplier and image
  const supplierName =
    product.suppliername ||
    product.supplierName ||
    translations[locale].unknown;

  const mainImage =
    product.mainimageurl ||
    product.mainImageUrl ||
    "https://via.placeholder.com/300?text=No+Image";

  // ✅ Navigation to product page
  const handleViewProduct = (): void => {
    navigate(`/${locale}/product/${product.id}`);
  };

  return (
    <div
      dir={isRTL ? "rtl" : "ltr"}
      className={`
        group flex flex-col
        p-2 sm:p-3 md:p-4
        bg-white
        rounded-lg md:rounded-2xl
        border border-gray-100
        shadow-sm md:shadow
        transition duration-200
        hover:shadow-lg hover:-translate-y-1
        relative overflow-hidden
        min-h-[290px] md:min-h-[340px]
        cursor-pointer
        w-full max-w-xs md:max-w-none
      `}
      onClick={handleViewProduct}
      tabIndex={0}
      aria-label={productName}
    >
      {/* ✅ Product Image */}
      <div
        className={`
          w-full
          aspect-[5/4] md:aspect-[4/3]
          bg-white
          rounded-md md:rounded-xl
          border border-[#2c6449]/30
          shadow-xs md:shadow
          mb-2 md:mb-3
          overflow-hidden
          flex items-center justify-center
          relative
        `}
      >
        <img
          src={mainImage}
          alt={productName}
          className={`
            w-full h-full object-cover
            transition-transform duration-300
            group-hover:scale-105
          `}
          loading='lazy'
          onError={(e) => {
            (e.target as HTMLImageElement).src =
              "https://via.placeholder.com/300?text=No+Image";
            if (import.meta.env.DEV) {
              console.debug(
                "🖼️ [ProductCardMinimal] Fallback placeholder used for product:",
                product.id
              );
            }
          }}
        />
      </div>

      {/* ✅ Product Name */}
      <h3
        className={`
          text-sm sm:text-base md:text-lg
          font-bold text-gray-800
          mb-1 md:mb-2
          line-clamp-2
          group-hover:text-[#2c6449]
          transition
        `}
      >
        {productName}
      </h3>

      {/* ✅ Supplier */}
      <div className={`${isMobile ? "mb-1" : "mb-2"}`}>
        <span className='text-xs sm:text-sm text-gray-400 mr-1'>
          {t.supplier}
        </span>
        <span
          className={`
            inline-block bg-gray-50 border border-gray-200
            px-2 py-0.5 rounded-full
            text-xs sm:text-sm font-medium
            text-gray-700 capitalize
          `}
        >
          {supplierName}
        </span>
      </div>

      {/* ✅ Price (optional) */}
      {product.price && (
        <div className='text-sm sm:text-base font-bold text-[#2c6449] mb-2'>
          {product.price}
        </div>
      )}

      <div className='flex-1' />

      {/* ✅ View Details Button */}
      <button
        onClick={(e) => {
          e.stopPropagation();
          handleViewProduct();
        }}
        className={`
          w-full
          py-2 md:py-2.5
          mt-2
          rounded-lg md:rounded-xl
          bg-[#2c6449]
          text-white
          font-semibold
          text-xs sm:text-sm md:text-base
          shadow
          hover:bg-[#24533b]
          hover:shadow-md
          transition
          duration-150
          outline-none
          focus:ring-2
          focus:ring-[#2c6449]/40
        `}
        tabIndex={0}
      >
        {t.view_details}
      </button>
    </div>
  );
};

export default ProductCardMinimal;
