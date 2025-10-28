import React, { useEffect, useState, useCallback } from "react";
import { supabase } from "@/lib/supabaseClient";
import { useTranslation } from "react-i18next";
import ProductCard from "@/components/global/ProductCardMinimal";
import { useUIStore } from "@/state/useUIStore";

interface Product {
  id: string;
  productname_en?: string;
  productname_ar?: string;
  mainimageurl?: string;
  category_en?: string;
  category_ar?: string;
  priceranges?: any;
  suppliername?: string;
  [key: string]: any;
}

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;

const TrendingProductsSection: React.FC = () => {
  const { t, i18n } = useTranslation();
  const locale = (i18n.language as "en" | "ar") || "en";

  const [allProducts, setAllProducts] = useState<Product[]>([]);
  const [activeTab, setActiveTab] = useState<"trending" | "all">("trending");
  const [error, setError] = useState<string | null>(null);
  const { setLoading } = useUIStore();

  const formatNumber = useCallback(
    (number: number): string =>
      new Intl.NumberFormat(locale, {
        minimumFractionDigits: 0,
        maximumFractionDigits: 2,
      }).format(number),
    [locale]
  );

  useEffect(() => {
    const fetchData = async (): Promise<void> => {
      try {
        setLoading(true);

        const { data, error } = await supabase
          .from("products")
          // ✅ Cast id::text to ensure it comes as string
          .select(
            "id::text, productname_en, productname_ar, mainimageurl, category_en, category_ar, priceranges, suppliername"
          )
          .limit(100);

        if (error) throw error;

        if (import.meta.env.DEV) {
          console.log("🧩 Supabase returned products:", data?.slice(0, 5));
        }

        setAllProducts(data || []);
        setError(null);
      } catch (err: any) {
        console.error("❌ Error loading products:", err);
        setError(
          t("trendingProductsSection.failedToLoadProducts") ||
            "Failed to load products."
        );
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [setLoading, t, i18n.language]);

  const getTrendingProducts = useCallback((): Product[] => {
    const shuffled = [...allProducts].sort(() => 0.5 - Math.random());
    return shuffled.slice(0, 8);
  }, [allProducts]);

  const buildImageUrl = (path?: string): string => {
    if (!path) return "/placeholder-product.png";
    if (path.startsWith("http")) return path;
    return `${SUPABASE_URL}/storage/v1/object/public/product-images/${path}`;
  };

  // ✅ Defensive guard
  const validProducts = Array.isArray(allProducts) ? allProducts : [];

  // ✅ Choose dataset safely
  const displayedProducts =
    activeTab === "trending" ? getTrendingProducts() : validProducts;

  // ✅ Filter out invalid items (no id)
  const safeProducts = displayedProducts.filter(
    (p): p is Product => !!p && !!p.id
  );

  return (
    <section id='trending-products' className='bg-gray-50 py-10'>
      <div className='container mx-auto px-4'>
        <h2 className='text-2xl font-bold mb-10 text-[#2c6449] text-center'>
          {t("trendingProductsSection.title")}
        </h2>

        {/* 🔹 Tabs */}
        <div className='flex flex-wrap gap-3 mb-8 justify-center'>
          <button
            onClick={() => setActiveTab("trending")}
            className={`px-5 py-2 text-sm rounded-md font-semibold transition ${
              activeTab === "trending"
                ? "bg-[#2c6449] text-white"
                : "bg-white border border-gray-300 text-[#2c6449]"
            }`}
          >
            {t("trendingProductsSection.trending")}
          </button>

          <button
            onClick={() => setActiveTab("all")}
            className={`px-5 py-2 text-sm rounded-md font-semibold transition ${
              activeTab === "all"
                ? "bg-[#2c6449] text-white"
                : "bg-white border border-gray-300 text-[#2c6449]"
            }`}
          >
            {t("trendingProductsSection.allProducts")}
          </button>
        </div>

        {/* 🔹 Product Grid / Error */}
        {error ? (
          <div className='text-center text-red-600'>{error}</div>
        ) : (
          <div
            className='
              grid
              grid-cols-2
              sm:grid-cols-2
              md:grid-cols-3
              lg:grid-cols-4
              gap-6
            '
          >
            {safeProducts.length > 0 ? (
              safeProducts.map((p) => (
                <ProductCard
                  key={p.id}
                  product={{
                    id: p.id,
                    productname_en: p.productname_en,
                    productname_ar: p.productname_ar,
                    suppliername: p.suppliername || "Unknown",
                    mainimageurl: buildImageUrl(p.mainimageurl),
                  }}
                />
              ))
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
};

export default TrendingProductsSection;
