"use client";

import { useEffect, useState, useCallback, useMemo } from "react";
import { supabase } from "@/lib/supabaseClient";
import { useTranslation } from "react-i18next";
import ProductCard from "@/components/global/ProductCardMinimal";
import { useUIStore } from "@/state/useUIStore";
import sarSymbol from "../../../public/images/payments/sar_symbol.svg";

interface Product {
  id: string;
  productname_en?: string;
  productname_ar?: string;
  mainimageurl?: string;
  category_en?: string;
  category_ar?: string;
  priceranges?: any; // JSONB returned as string or array
  suppliername?: string;
  [key: string]: any;
}

interface NormalizedPriceRange {
  price: number | null;
  minQty: number | null;
  maxQty: number | null;
  locations?: any[];
}

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;

export default function TrendingProductsSection() {
  const { t, i18n } = useTranslation();
  const locale = (i18n.language as "en" | "ar") || "en";

  const { setLoading } = useUIStore();
  const [allProducts, setAllProducts] = useState<Product[]>([]);
  const [activeTab, setActiveTab] = useState<"trending" | "all">("trending");
  const [error, setError] = useState<string | null>(null);

  /* ------------------------------------------------------------
   * Price number formatting
   * ------------------------------------------------------------ */
  const formatNumber = useCallback(
    (number: number): string =>
      new Intl.NumberFormat(locale, {
        minimumFractionDigits: 0,
        maximumFractionDigits: 2,
      }).format(number),
    [locale]
  );

  /* ------------------------------------------------------------
   * Fetch products from Supabase
   * ------------------------------------------------------------ */
  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true);

        const { data, error } = await supabase
          .from("products")
          .select(
            "id::text, productname_en, productname_ar, mainimageurl, category_en, category_ar, priceranges, suppliername"
          )
          .limit(100);

        if (error) throw error;

        if (import.meta.env.DEV) {
          console.log("🧩 Supabase returned products:", data?.slice(0, 5));
        }

        setAllProducts(data || []);
      } catch (err) {
        console.error("❌ Error loading products:", err);
        setError("Failed to load products.");
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, [setLoading]);

  /* ------------------------------------------------------------
   * Trending subset (stable by useMemo)
   * ------------------------------------------------------------ */
  const trendingProducts = useMemo(() => {
    const shuffled = [...allProducts].sort(() => 0.5 - Math.random());
    return shuffled.slice(0, 8);
  }, [allProducts]);

  /* ------------------------------------------------------------
   * Build product image URL
   * ------------------------------------------------------------ */
  const buildImageUrl = (path?: string): string => {
    if (!path) return "/placeholder-product.png";
    if (path.startsWith("http")) return path;

    return `${SUPABASE_URL}/storage/v1/object/public/product-images/${path}`;
  };

  /* ------------------------------------------------------------
   * Decide which product list to render
   * ------------------------------------------------------------ */
  const productsToShow =
    activeTab === "trending" ? trendingProducts : allProducts;

  const safeProducts = productsToShow.filter((p) => !!p.id);

  return (
    <section id='trending-products' className='bg-gray-50 py-10'>
      <div className='container mx-auto px-4'>
        <h2 className='text-2xl font-bold mb-10 text-[#2c6449] text-center'>
          {t("trendingProductsSection.title") || "Trending Products"}
        </h2>

        {/* TABS */}
        <div className='flex flex-wrap gap-3 mb-8 justify-center'>
          <button
            onClick={() => setActiveTab("trending")}
            className={`px-5 py-2 text-sm rounded-md font-semibold transition ${
              activeTab === "trending"
                ? "bg-[#2c6449] text-white"
                : "bg-white border border-gray-300 text-[#2c6449]"
            }`}
          >
            {t("trendingProductsSection.trending") || "Trending"}
          </button>

          <button
            onClick={() => setActiveTab("all")}
            className={`px-5 py-2 text-sm rounded-md font-semibold transition ${
              activeTab === "all"
                ? "bg-[#2c6449] text-white"
                : "bg-white border border-gray-300 text-[#2c6449]"
            }`}
          >
            {t("trendingProductsSection.allProducts") || "All Products"}
          </button>
        </div>

        {/* GRID */}
        {error ? (
          <div className='text-center text-red-600'>{error}</div>
        ) : (
          <div
            className='
              grid grid-cols-2
              sm:grid-cols-2
              md:grid-cols-3
              lg:grid-cols-4
              gap-6
            '
          >
            {safeProducts.length > 0 ? (
              safeProducts.map((p) => {
                /* ------------------------------------------------------------
                 * Parse JSONB priceranges safely
                 * Supabase returns either:
                 * - an array
                 * - a JSON string (stringified array)
                 * ------------------------------------------------------------ */

                let rawRanges: any[] = [];

                if (Array.isArray(p.priceranges)) {
                  rawRanges = p.priceranges;
                } else {
                  try {
                    rawRanges = JSON.parse(p.priceranges || "[]");
                  } catch {
                    rawRanges = [];
                  }
                }

                // 🔥 Normalize each range: strings → numbers
                const priceRanges: NormalizedPriceRange[] = rawRanges.map(
                  (r: any) => ({
                    price:
                      r.price !== undefined && r.price !== null
                        ? Number(r.price)
                        : null,
                    minQty:
                      r.minQty !== undefined && r.minQty !== null
                        ? Number(r.minQty)
                        : null,
                    maxQty:
                      r.maxQty !== undefined && r.maxQty !== null
                        ? Number(r.maxQty)
                        : null,
                    locations: r.locations || [],
                  })
                );

                return (
                  <ProductCard
                    key={p.id}
                    product={{
                      id: p.id,
                      productname_en: p.productname_en,
                      productname_ar: p.productname_ar,
                      suppliername: p.suppliername || "Unknown",
                      mainimageurl: buildImageUrl(p.mainimageurl),
                      // 🔥 Pass normalized ranges, formatter & SAR icon
                      priceRanges,
                      sarIcon: sarSymbol,
                      formatNumber,
                    }}
                  />
                );
              })
            ) : (
              <div className='col-span-full text-center text-gray-400'>
                {t("trendingProductsSection.noProductsFound") ||
                  "No products available."}
              </div>
            )}
          </div>
        )}
      </div>
    </section>
  );
}
