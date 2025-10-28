import React from "react";
import TrendingSlider from "./TrendingSlider";
import { Skeleton } from "@/components/ui/data-display/skeleton";

// -------------------------------
// 🔶 Types
// -------------------------------
interface Category {
  label: string | { en?: string; ar?: string };
  slug?: string;
  image?: string;
}

interface HeroTrendingBarProps {
  trendingCategories?: Category[];
  isRTL?: boolean;
  categoriesText?: string;
  loading?: boolean;
  loadingText?: string;
  locale?: string;
}

// -------------------------------
// 🔹 Component
// -------------------------------
const HeroTrendingBar: React.FC<HeroTrendingBarProps> = ({
  trendingCategories = [],
  isRTL = false,
  categoriesText,
  loading = false,
  loadingText = "Loading...", // kept for compatibility
  locale = "en",
}) => {
  const dedupedCategories: Category[] = [];
  const seenCategories = new Set<string>();

  trendingCategories.forEach((cat) => {
    const rawLabel =
      typeof cat.label === "string"
        ? cat.label
        : cat.label?.[locale] || cat.label?.en || cat.label?.ar || "";

    const normalizedLabel = rawLabel
      .trim()
      .toLowerCase()
      .replace(/[\s_]+/g, "-")
      .replace(/-+/g, "-");

    if (!normalizedLabel) return;
    if (!seenCategories.has(normalizedLabel)) {
      seenCategories.add(normalizedLabel);
      dedupedCategories.push(cat);
    }
  });

  return (
    <div className='w-full py-4 px-2 bg-[#eaf3ed] text-center'>
      <div className='mb-2 text-[#2c6449] font-bold text-base md:text-lg'>
        {categoriesText || "Categories"}
      </div>

      {loading ? (
        // ✅ Loading Skeletons
        <div
          className='w-full overflow-hidden'
          aria-busy='true'
          aria-live='polite'
        >
          <div
            className={`flex ${isRTL ? "flex-row-reverse" : ""}
                        gap-6 md:gap-8
                        justify-center md:justify-start
                        px-3 md:px-4 py-3`}
          >
            {Array.from({ length: 10 }).map((_, i) => (
              <Skeleton
                key={`circle-${i}`}
                className='h-14 w-14 md:h-16 md:w-16 rounded-full
                           bg-[#dfe9e3] dark:bg-neutral-800
                           border border-[#e7ecd8] flex-shrink-0'
              />
            ))}
          </div>
        </div>
      ) : dedupedCategories.length === 0 ? (
        // ✅ No categories fallback
        <div className='text-red-500 text-center py-4'>
          {isRTL ? "لا توجد فئات للعرض." : "No categories to show."}
          <br />
          <span className='text-base text-gray-600'>
            {isRTL
              ? "تأكد من وجود فئات ومنتجات في قاعدة البيانات."
              : "Check your Supabase product data for category and slug fields!"}
          </span>
        </div>
      ) : (
        // ✅ Trending Slider
        <TrendingSlider
          categories={dedupedCategories}
          isRTL={isRTL}
          locale={locale}
        />
      )}
    </div>
  );
};

export default HeroTrendingBar;
