import React, { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { supabase } from "@/lib/supabaseClient";
import { useTranslation } from "react-i18next";

// ---- Types ----
interface Category {
  name: string;
  slug: string;
  image: string;
}

interface Product {
  id: string;
  category_en?: string | null;
  category_ar?: string | null;
  mainimageurl?: string | null;
  additionalimageurls?: string[] | null;
}

// ---- Helper ----
function slugify(label: string): string {
  return label
    .trim()
    .toLowerCase()
    .replace(/[\s_]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/[^a-z0-9\-ء-ي]+/gi, "");
}

// ---- Component ----
const CategoryGrid: React.FC = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const { locale } = useParams<{ locale: string }>();
  const currentLocale = locale === "ar" ? "ar" : "en";
  const isRTL = currentLocale === "ar";

  const { t } = useTranslation();

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const { data, error } = await supabase
          .from("products")
          .select(
            "id, category_en, category_ar, mainimageurl, additionalimageurls"
          )
          .limit(500);

        if (error) throw error;

        const categoryMap: Record<string, Category> = {};

        (data as Product[]).forEach((product) => {
          const categoryLabel =
            currentLocale === "ar"
              ? product.category_ar || product.category_en
              : product.category_en || product.category_ar;

          if (!categoryLabel) return;

          const normalized = categoryLabel
            .trim()
            .toLowerCase()
            .replace(/[\s_]+/g, "-")
            .replace(/-+/g, "-");

          if (!categoryMap[normalized]) {
            categoryMap[normalized] = {
              name: categoryLabel,
              slug: encodeURIComponent(slugify(categoryLabel)),
              image:
                product.mainimageurl ||
                (Array.isArray(product.additionalimageurls) &&
                  product.additionalimageurls[0]) ||
                "https://via.placeholder.com/300x225?text=No+Image",
            };
          }
        });

        setCategories(Object.values(categoryMap));
      } catch (err) {
        console.error("❌ Error fetching categories:", err);
      }
    };

    fetchCategories();
  }, [currentLocale]);

  if (!categories.length) return null;

  return (
    <div
      id='category-grid-section'
      dir={isRTL ? "rtl" : "ltr"}
      className={`max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 ${
        isRTL ? "font-arabic" : ""
      }`}
    >
      {/* 🔹 Section Title */}
      <h2 className='text-2xl font-bold mb-10 text-[#2c6449] text-center'>
        {t("section.exploreCategories")}
      </h2>

      {/* 🔹 Category Grid */}
      <div className='grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8'>
        {categories.map((cat) => (
          <div key={cat.slug} className='flex flex-col items-center'>
            <div className='mb-2'>
              <span className='text-base sm:text-lg font-semibold text-[#2c6449]'>
                {cat.name}
              </span>
            </div>

            <Link
              to={`/category/${cat.slug}`}
              className='relative group flex flex-col justify-end items-center
                bg-white rounded-2xl shadow border hover:shadow-lg transition
                overflow-hidden min-h-[190px] sm:min-h-[230px] w-full'
              style={{ aspectRatio: "4/3" }}
            >
              <img
                src={cat.image}
                alt={cat.name}
                className='absolute inset-0 w-full h-full object-cover object-center transition-transform group-hover:scale-105'
                loading='lazy'
              />
              <span className='sr-only'>{cat.name}</span>
            </Link>
          </div>
        ))}
      </div>
    </div>
  );
};

export default CategoryGrid;
