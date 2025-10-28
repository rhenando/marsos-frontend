import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import ProductSearchClient from "@/components/global/productSearch/ProductSearchClient";
import { useUIStore } from "@/state/useUIStore";

export default function ProductSearch() {
  const { setLoading } = useUIStore();
  const [products, setProducts] = useState<any[]>([]);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);

        const { data, error } = await supabase
          .from("products")
          .select("id, productname_en, productname_ar, mainimageurl")
          .limit(200);

        if (error) {
          console.error("❌ Supabase error:", error);
          return;
        }

        let locale: "en" | "ar" = "en";
        if (
          typeof window !== "undefined" &&
          window.location.pathname.includes("/ar")
        ) {
          locale = "ar";
        }

        const formatted = (data || []).map((p: any) => ({
          id: p.id,
          name:
            locale === "ar" ? p.productname_ar : p.productname_en || "Unnamed",
          thumbnail: p.mainimageurl || "/placeholder-product.png",
        }));

        setProducts(formatted);
      } catch (err) {
        console.error("⚠️ Error fetching products:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, [setLoading]);

  return <ProductSearchClient initialProducts={products} />;
}
