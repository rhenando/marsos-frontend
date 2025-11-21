import React from "react";
import { useNavigate } from "react-router-dom";
import { useIsMobile } from "@/hooks/use-mobile";
import { useTranslation } from "react-i18next";

interface PriceRange {
  price: number | null;
  minQty: number | string | null;
  maxQty: number | string | null;
}

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

    // Price ranges from Supabase
    priceRanges?: PriceRange[];

    sarIcon?: string;
    formatNumber?: (n: number) => string;
  };
}

const translations = {
  en: {
    unnamed_product: "Unnamed Product",
    unknown: "Unknown",
    supplier: "Supplier:",
    view_details: "View Details",
    negotiable: "Negotiable",
    pcs: "pcs",
    unlimited: "Unlimited",
  },
  ar: {
    unnamed_product: "منتج بدون اسم",
    unknown: "غير معروف",
    supplier: "المورد:",
    view_details: "عرض التفاصيل",
    negotiable: "قابل للتفاوض",
    pcs: "قطعة",
    unlimited: "غير محدود",
  },
};

const ProductCardMinimal: React.FC<ProductCardProps> = ({ product }) => {
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  const { i18n } = useTranslation();

  const locale = i18n.language === "ar" ? "ar" : "en";
  const isRTL = locale === "ar";
  const t = translations[locale];

  if (!product || !product.id) return null;

  /* ----------------------------------------
   * Product Name
   * ---------------------------------------- */
  const productName =
    (locale === "ar" ? product.productname_ar : product.productname_en) ||
    (typeof product.productName === "string"
      ? product.productName
      : product.productName?.[locale]) ||
    t.unnamed_product;

  /* ----------------------------------------
   * Supplier
   * ---------------------------------------- */
  const supplierName =
    product.suppliername || product.supplierName || t.unknown;

  /* ----------------------------------------
   * Main Image
   * ---------------------------------------- */
  const mainImage =
    product.mainimageurl ||
    product.mainImageUrl ||
    "https://via.placeholder.com/300?text=No+Image";

  const handleViewProduct = () => {
    navigate(`/${locale}/product/${product.id}`);
  };

  /* ----------------------------------------
   * Price Ranges (FULL FIX WITH SAFE PARSING)
   * ---------------------------------------- */
  const ranges: PriceRange[] = Array.isArray(product.priceRanges)
    ? product.priceRanges
    : [];

  const format = product.formatNumber ?? ((n: number) => String(n));

  return (
    <div
      dir={isRTL ? "rtl" : "ltr"}
      className='
        group flex flex-col
        p-2 sm:p-3 md:p-4
        bg-white rounded-lg md:rounded-2xl
        border border-gray-100
        shadow-sm md:shadow
        hover:shadow-lg hover:-translate-y-1
        transition cursor-pointer
        min-h-[300px] md:min-h-[340px]
        w-full max-w-xs md:max-w-none
      '
      onClick={handleViewProduct}
      tabIndex={0}
    >
      {/* IMAGE */}
      <div
        className='
          w-full aspect-[5/4] md:aspect-[4/3]
          bg-white rounded-md md:rounded-xl
          border border-[#2c6449]/30 shadow-xs md:shadow
          mb-2 md:mb-3 overflow-hidden
        '
      >
        <img
          src={mainImage}
          alt={productName}
          className='w-full h-full object-cover group-hover:scale-105 transition'
          loading='lazy'
        />
      </div>

      {/* NAME */}
      <h3 className='text-sm sm:text-base md:text-lg font-bold text-gray-800 mb-1 md:mb-2 line-clamp-2 group-hover:text-[#2c6449] transition'>
        {productName}
      </h3>

      {/* SUPPLIER */}
      <div className={isMobile ? "mb-1" : "mb-2"}>
        <span className='text-xs sm:text-sm text-gray-400 mr-1'>
          {t.supplier}
        </span>
        <span className='inline-block bg-gray-50 border px-2 py-0.5 rounded-full text-xs sm:text-sm text-gray-700 capitalize'>
          {supplierName}
        </span>
      </div>

      {/* PRICE RANGES */}
      {ranges.length > 0 ? (
        <div className='mb-2 space-y-0.5'>
          {ranges.map((r, index) => {
            const hasPrice =
              typeof r.price === "number" && !isNaN(r.price as number);

            /* ----------------------------------------
             * SAFE NORMALIZATION (NO TS ERRORS)
             * ---------------------------------------- */
            const rawMinStr = String(r.minQty);
            const rawMaxStr = String(r.maxQty);

            const min =
              !rawMinStr ||
              rawMinStr === "null" ||
              rawMinStr === "undefined" ||
              rawMinStr === "NaN" ||
              Number.isNaN(Number(rawMinStr))
                ? "?"
                : Number(rawMinStr);

            const max =
              !rawMaxStr ||
              rawMaxStr === "null" ||
              rawMaxStr === "undefined" ||
              rawMaxStr === "NaN" ||
              Number.isNaN(Number(rawMaxStr))
                ? t.unlimited
                : Number(rawMaxStr);

            return (
              <div
                key={index}
                className='text-[11px] sm:text-xs text-gray-700 flex items-center gap-1'
              >
                {/* Qty range */}
                <span className='font-semibold'>
                  {min}–{max} {t.pcs}
                </span>

                <span>:</span>

                {/* Price or Negotiable */}
                {hasPrice ? (
                  <>
                    {product.sarIcon && (
                      <img
                        src={product.sarIcon}
                        className='w-3 h-3 object-contain'
                      />
                    )}
                    <span className='font-medium'>
                      {format(r.price as number)}
                    </span>
                  </>
                ) : (
                  <span className='text-gray-500'>{t.negotiable}</span>
                )}
              </div>
            );
          })}
        </div>
      ) : (
        <div className='text-sm text-gray-500 mb-2'>{t.negotiable}</div>
      )}

      {/* SPACER */}
      <div className='flex-1' />

      {/* BUTTON */}
      <button
        onClick={(e) => {
          e.stopPropagation();
          handleViewProduct();
        }}
        className='
          w-full py-2 mt-2 rounded-lg bg-[#2c6449]
          text-white font-semibold text-xs sm:text-sm md:text-base
          hover:bg-[#24533b] transition
        '
      >
        {t.view_details}
      </button>
    </div>
  );
};

export default ProductCardMinimal;
