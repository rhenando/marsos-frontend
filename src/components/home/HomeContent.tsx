// src/components/home/HomeContent.tsx

import HeroSection from "@/components/home/HeroSection";
import CategoryGrid from "@/components/home/CategoryGrid";
import TrendingProducts from "@/components/home/TrendingProducts";

export default function HomeContent() {
  return (
    <>
      <HeroSection />
      <TrendingProducts />
      <CategoryGrid />
    </>
  );
}
