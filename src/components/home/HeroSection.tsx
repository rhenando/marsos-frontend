import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { supabase } from "@/lib/supabaseClient";
import HeroCategoriesBar from "./HeroCategoriesBar";
import HeroSlides from "./HeroSlides";
import HeroTrendingBar from "./HeroTrendingBar";

// -------------------------------
// 🔶 Types
// -------------------------------
interface Slide {
  title: { en: string; ar: string };
  description: { en: string; ar: string };
  bgImage: string;
  link: string;
}

interface Product {
  slug_en?: string;
  slug_ar?: string;
  category_en?: string;
  category_ar?: string;
  mainimageurl?: string;
  additionalimageurls?: string[];
}

interface TrendingCategory {
  label: string;
  slug: string;
  image: string;
}

// -------------------------------
// 🔶 Static Slides
// -------------------------------
const leftSlides: Slide[] = [
  {
    title: { en: "From Manufacturers to You", ar: "من المصانع إليك" },
    description: {
      en: "The Saudi B2B online platform for industrial products. Trusted, easy, and secure sourcing.",
      ar: "منصة إلكترونية سعودية لمنتجات المصانع. حلول موثوقة وسهلة وآمنة.",
    },
    bgImage: "/images/hero/marsos-hero-bg-1.jpg",
    link: "/import-from-saudi",
  },
  {
    title: { en: "Empowering Saudi Industry", ar: "تمكين الصناعة السعودية" },
    description: {
      en: "Access to many manufacturers in Saudi Arabia across major sectors with seamless transactions.",
      ar: "تجميع المصنعين والمشترين. تقنية حديثة ومدفوعات سلسة وانتشار عالمي.",
    },
    bgImage: "/images/hero/marsos-hero-bg-2.jpg",
    link: "/about-us",
  },
];

const rightSlides: Slide[] = [
  {
    title: { en: "Verified Saudi Suppliers", ar: "موردون سعوديون موثوقون" },
    description: {
      en: "Work directly with certified factories across Saudi Arabia. Quality you can trust.",
      ar: "تعامل مباشرة مع مصانع سعودية معتمدة. جودة موثوقة.",
    },
    bgImage: "/images/hero/marsos-hero-bg-3.jpg",
    link: "supplier-onboarding",
  },
  {
    title: { en: "Seamless & Secure", ar: "سلاسة وأمان" },
    description: {
      en: "Digital tools, fast onboarding, and secure payment for every business transaction.",
      ar: "أدوات رقمية وتسجيل سريع ودفع آمن لكل معاملة.",
    },
    bgImage: "/images/hero/marsos-hero-bg-4.jpg",
    link: "/contact",
  },
];

// -------------------------------
// 🔶 Helper Functions
// -------------------------------
function getBaseLocale(locale: string | undefined): "en" | "ar" {
  if (!locale) return "en";
  return locale.startsWith("ar") ? "ar" : "en";
}

function buildCategoriesFromProducts(
  products: Product[],
  locale: "en" | "ar" = "en"
): TrendingCategory[] {
  const seen = new Set<string>();
  const trending: TrendingCategory[] = [];

  for (const product of products) {
    const slug =
      locale === "ar"
        ? product.slug_ar || product.slug_en
        : product.slug_en || product.slug_ar;
    const label =
      locale === "ar"
        ? product.category_ar || product.category_en
        : product.category_en || product.category_ar;

    if (!slug || !label || seen.has(slug)) continue;
    seen.add(slug);

    trending.push({
      label,
      slug,
      image:
        product.mainimageurl ||
        (Array.isArray(product.additionalimageurls) &&
          product.additionalimageurls[0]) ||
        "/dummy1.jpg",
    });
  }

  return trending;
}

// -------------------------------
// 🔶 Main Component
// -------------------------------
const HeroSection: React.FC = () => {
  const { locale } = useParams<{ locale: string }>();
  const baseLocale = getBaseLocale(locale);
  const isRTL = baseLocale === "ar";
  const dir = isRTL ? "rtl" : "ltr";

  const loadingText = isRTL ? "جاري التحميل..." : "Loading...";
  const categoriesText = isRTL ? "التصنيفات" : "Categories";

  const [products, setProducts] = useState<Product[]>([]);
  const [categoryLabels, setCategoryLabels] = useState<string[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const fetchProductsAndCategories = async () => {
      try {
        setLoading(true);

        const { data, error } = await supabase
          .from("products")
          .select(
            "category_en, category_ar, slug_en, slug_ar, mainimageurl, additionalimageurls"
          )
          .limit(500);

        if (error) throw error;

        const catsSet = new Set<string>();
        const allProducts: Product[] = data || [];

        data?.forEach((product) => {
          const catLabel =
            baseLocale === "ar"
              ? product.category_ar || product.category_en
              : product.category_en || product.category_ar;

          if (catLabel) catsSet.add(catLabel);
        });

        setProducts(allProducts);
        setCategoryLabels(Array.from(catsSet));
        setLoading(false);
      } catch (err) {
        console.error("Error fetching products:", err);
        setProducts([]);
        setCategoryLabels([]);
        setLoading(false);
      }
    };

    fetchProductsAndCategories();
  }, [baseLocale]);

  const trendingCategories = buildCategoriesFromProducts(products, baseLocale);

  // -------------------------------
  // 🔶 Conditional States
  // -------------------------------
  if (!loading && products.length === 0) {
    return (
      <section className='w-full h-[80vh] flex items-center justify-center bg-[#f9fbe5]'>
        <div className='text-red-500 text-xl text-center'>
          No products found.
          <br />
          <span className='text-base text-gray-600'>
            Check Supabase table or query filters!
          </span>
        </div>
      </section>
    );
  }

  if (!loading && trendingCategories.length === 0) {
    return (
      <section className='w-full h-[80vh] flex items-center justify-center bg-[#f9fbe5]'>
        <div className='text-yellow-600 text-xl text-center'>
          No categories found.
          <br />
          <span className='text-base text-gray-600'>
            Make sure your products contain <b>category_en/ar</b> and{" "}
            <b>slug_en/ar</b> fields.
          </span>
        </div>
      </section>
    );
  }

  // -------------------------------
  // 🔶 Main Return
  // -------------------------------
  return (
    <section
      dir={dir}
      className={`w-full h-[80vh] flex flex-col overflow-hidden bg-[#f9fbe5] ${
        isRTL ? "font-arabic" : ""
      }`}
    >
      <HeroCategoriesBar
        categoryLabels={categoryLabels}
        isRTL={isRTL}
        loadingText={loadingText}
      />

      <HeroSlides
        leftSlides={leftSlides}
        rightSlides={rightSlides}
        isRTL={isRTL}
        locale={baseLocale}
      />

      <div className='flex-1 flex items-center justify-center'>
        <HeroTrendingBar
          trendingCategories={trendingCategories}
          isRTL={isRTL}
          categoriesText={categoriesText}
          loading={loading}
          loadingText={loadingText}
          locale={baseLocale}
        />
      </div>
    </section>
  );
};

export default HeroSection;
