import React, { useEffect, useMemo, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { supabase } from "@/lib/supabaseClient";

// 🧱 UI Components
import { Input } from "@/components/ui/form/input";
import { Button } from "@/components/ui/base/button";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/form/select";
import {
  Tabs,
  TabsList,
  TabsTrigger,
  TabsContent,
} from "@/components/ui/navigation/tabs";

interface PriceRange {
  minQty: number;
  maxQty?: number | null;
  price: number;
  locations?: { location: string; locationPrice: number }[];
}

interface Product {
  id: string;
  productname_en?: string;
  productname_ar?: string;
  description_en?: string;
  description_ar?: string;
  category_en?: string;
  category_ar?: string;
  supplierid?: string;
  suppliername?: string;
  mainimageurl?: string;
  additionalimageurls?: string[];
  priceranges?: PriceRange[];
  sizes?: string[];
  colors?: string[];
}

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;

const ProductDetailsPage: React.FC = () => {
  const { id, locale } = useParams();
  const navigate = useNavigate();
  const { t, i18n } = useTranslation();
  const lang = locale === "ar" || i18n.language === "ar" ? "ar" : "en";

  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [quantity, setQuantity] = useState<number>(1);
  const [selectedSize, setSelectedSize] = useState<string>("");
  const [selectedColor, setSelectedColor] = useState<string>("");
  const [deliveryLocation, setDeliveryLocation] = useState<string>("");
  const [qtyError, setQtyError] = useState<string>("");

  // ─────────────────────────────────────────────
  // 🧩 Load Product from Supabase
  // ─────────────────────────────────────────────
  useEffect(() => {
    const loadProduct = async () => {
      try {
        setLoading(true);
        const { data, error } = await supabase
          .from("products")
          .select(
            "id::text, productname_en, productname_ar, description_en, description_ar, category_en, category_ar, supplierid, suppliername, mainimageurl, additionalimageurls, priceranges, sizes, colors"
          )
          .eq("id", id)
          .single();

        if (error) throw error;

        // ✅ Fix: build full image path safely
        const fullMainImage = data.mainimageurl?.startsWith("http")
          ? data.mainimageurl
          : `${SUPABASE_URL}/storage/v1/object/public/product-images/${data.mainimageurl}`;

        setProduct(data);
        setSelectedImage(fullMainImage || null);
      } catch (err: any) {
        console.error("❌ Failed to load product:", err);
        toast.error(
          t("product_details_page.load_error", {
            defaultValue: "Failed to load product details.",
          })
        );
      } finally {
        setLoading(false);
      }
    };

    if (id) loadProduct();
  }, [id]);

  // ─────────────────────────────────────────────
  // 🧮 Pricing Logic
  // ─────────────────────────────────────────────
  const priceRanges = product?.priceranges || [];

  const availableLocations = useMemo(() => {
    const allLocs =
      priceRanges
        .flatMap((r) => r.locations || [])
        .map((l) => l.location?.trim())
        .filter((loc): loc is string => !!loc && loc.length > 0) || [];
    return [...new Set(allLocs)];
  }, [priceRanges]);

  const minQtyAllowed = useMemo(() => {
    const mins = priceRanges
      .map((r) => Number(r.minQty))
      .filter((n) => !isNaN(n))
      .sort((a, b) => a - b);
    return mins[0] || 1;
  }, [priceRanges]);

  const matchedTier = useMemo(() => {
    if (!priceRanges.length) return null;
    return (
      priceRanges.find(
        (r) =>
          quantity >= r.minQty &&
          (!r.maxQty || quantity <= (r.maxQty ?? Infinity))
      ) || priceRanges[0]
    );
  }, [priceRanges, quantity]);

  const hasValidNumericPrice = priceRanges.some(
    (r) => r.price !== undefined && !isNaN(Number(r.price))
  );

  const matchedPrice =
    hasValidNumericPrice && matchedTier?.price
      ? Number(matchedTier.price)
      : null;

  const matchedLocationPrice = useMemo(() => {
    if (!matchedTier || !deliveryLocation) return 0;
    const loc = (matchedTier.locations || []).find(
      (l) =>
        l.location?.trim().toLowerCase() ===
        deliveryLocation.trim().toLowerCase()
    );
    return loc ? Number(loc.locationPrice) : 0;
  }, [matchedTier, deliveryLocation]);

  const shippingCost = matchedLocationPrice;
  const subtotal =
    matchedPrice !== null && !isNaN(quantity) ? matchedPrice * quantity : null;

  // ─────────────────────────────────────────────
  // 🖼️ Fallbacks
  // ─────────────────────────────────────────────
  if (loading) {
    return (
      <div className='flex justify-center items-center h-[60vh] text-[#2c6449]'>
        <Loader2 className='animate-spin mr-2' />{" "}
        {t("product_details_page.loading", "Loading...")}
      </div>
    );
  }

  if (!product) {
    return (
      <div className='text-center py-20 text-red-600 font-semibold'>
        {t("product_details_page.not_found", "Product not found.")}
      </div>
    );
  }

  // ─────────────────────────────────────────────
  // 🏷️ Localized fields
  // ─────────────────────────────────────────────
  const productName =
    lang === "ar"
      ? product.productname_ar || product.productname_en
      : product.productname_en || product.productname_ar;

  const description =
    lang === "ar"
      ? product.description_ar || "لا توجد تفاصيل متاحة"
      : product.description_en || "No description available.";

  const category =
    lang === "ar"
      ? product.category_ar || product.category_en
      : product.category_en || product.category_ar;

  // ─────────────────────────────────────────────
  // 🛒 Handlers
  // ─────────────────────────────────────────────
  const handleAddToCart = () => {
    if (quantity < minQtyAllowed)
      return toast.error(
        t("product_details_page.minimum_qty", {
          defaultValue: "Minimum quantity not met",
        })
      );
    toast.success(
      t("product_details_page.added_to_cart", {
        defaultValue: "Added to cart!",
      })
    );
  };

  const handleContactSupplier = () => {
    if (!product.supplierid)
      return toast.error(
        t("product_details_page.no_supplier", {
          defaultValue: "No supplier found",
        })
      );
    navigate(
      `/${lang}/chat/product/${product.id}?supplier=${product.supplierid}`
    );
  };

  // ─────────────────────────────────────────────
  // 🧱 Render
  // ─────────────────────────────────────────────
  return (
    <div
      className={`max-w-6xl mx-auto px-4 py-10 ${
        lang === "ar" ? "text-right" : "text-left"
      }`}
    >
      <div className='flex flex-col md:flex-row gap-8'>
        {/* LEFT COLUMN */}
        <div className='w-full md:w-1/2'>
          <img
            src={selectedImage || "https://via.placeholder.com/400"}
            alt={productName}
            className='rounded-xl border object-cover w-full h-[400px]'
          />

          {product.additionalimageurls?.length ? (
            <div className='mt-4 grid grid-cols-4 gap-1'>
              {[product.mainimageurl, ...product.additionalimageurls].map(
                (url, i) => (
                  <button
                    key={i}
                    // ✅ Fix TS2345: ensure value is not undefined
                    onClick={() => setSelectedImage(url || null)}
                    className={`border rounded overflow-hidden w-[100px] h-[100px] ${
                      selectedImage === url ? "ring-2 ring-[#2c6449]" : ""
                    }`}
                  >
                    <img src={url} className='object-cover w-full h-full' />
                  </button>
                )
              )}
            </div>
          ) : null}
        </div>

        {/* RIGHT COLUMN */}
        <div className='flex-1'>
          <h1 className='text-2xl font-bold text-[#2c6449] mb-2 capitalize'>
            {productName}
          </h1>
          <p className='text-sm text-gray-500 mb-1 capitalize'>
            {t("product_details_page.category", { defaultValue: "Category" })}:{" "}
            {category}
          </p>
          <p className='text-sm text-gray-600 mb-4'>
            {t("product_details_page.supplier", { defaultValue: "Supplier" })}:{" "}
            <span className='ml-1 text-[#2c6449]'>
              {product.suppliername || "N/A"}
            </span>
          </p>

          {(product.sizes?.length ||
            product.colors?.length ||
            availableLocations.length > 0) && (
            <div className='mt-4 flex flex-wrap items-end gap-6'>
              {/* Size Selector */}
              {product.sizes?.length ? (
                <div className='flex flex-col'>
                  <label className='block text-sm font-medium text-gray-700 mb-1'>
                    {t("product_details_page.sizes", {
                      defaultValue: "Size",
                    })}
                  </label>
                  <Select onValueChange={setSelectedSize} value={selectedSize}>
                    <SelectTrigger className='w-40'>
                      <SelectValue
                        placeholder={t("product_details_page.select_size", {
                          defaultValue: "Select size",
                        })}
                      />
                    </SelectTrigger>
                    <SelectContent>
                      {product.sizes.map((size) => (
                        <SelectItem key={size} value={size}>
                          {size}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              ) : null}

              {/* Color Selector */}
              {product.colors?.length ? (
                <div className='flex flex-col'>
                  <label className='block text-sm font-medium text-gray-700 mb-1'>
                    {t("product_details_page.colors", {
                      defaultValue: "Color",
                    })}
                  </label>
                  <Select
                    onValueChange={setSelectedColor}
                    value={selectedColor}
                  >
                    <SelectTrigger className='w-40'>
                      <SelectValue
                        placeholder={t("product_details_page.select_color", {
                          defaultValue: "Select color",
                        })}
                      />
                    </SelectTrigger>
                    <SelectContent>
                      {product.colors.map((color) => (
                        <SelectItem key={color} value={color}>
                          {color}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              ) : null}

              {/* Delivery Location Selector */}
              {availableLocations.length > 0 && (
                <div className='flex flex-col'>
                  <label className='block text-sm font-medium text-gray-700 mb-1'>
                    {t("product_details_page.delivery_location", {
                      defaultValue: "Delivery Location",
                    })}
                  </label>
                  <Select
                    onValueChange={setDeliveryLocation}
                    value={deliveryLocation}
                  >
                    <SelectTrigger className='w-48'>
                      <SelectValue
                        placeholder={t("product_details_page.select_location", {
                          defaultValue: "Select location",
                        })}
                      />
                    </SelectTrigger>
                    <SelectContent>
                      {availableLocations.map((loc) => (
                        <SelectItem key={loc} value={loc}>
                          {loc}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}
            </div>
          )}

          {/* Quantity */}
          <div className='mt-6'>
            <label className='block text-sm font-medium text-gray-700 mb-1'>
              {t("product_details_page.quantity", {
                defaultValue: "Quantity",
              })}
            </label>
            <div className='flex items-center gap-2'>
              <Button
                variant='outline'
                size='icon'
                onClick={() => setQuantity((q) => Math.max(1, q - 1))}
              >
                −
              </Button>
              <Input
                type='number'
                value={quantity}
                onChange={(e) => {
                  const val = Math.max(1, parseInt(e.target.value) || 1);
                  setQuantity(val);
                  setQtyError(
                    val < minQtyAllowed
                      ? `${t("product_details_page.minimum_qty", {
                          defaultValue: "Minimum",
                        })} ${minQtyAllowed}`
                      : ""
                  );
                }}
                className='w-24 text-center'
              />
              <Button
                variant='outline'
                size='icon'
                onClick={() => setQuantity((q) => q + 1)}
              >
                +
              </Button>
            </div>
            {qtyError && (
              <p className='text-sm text-red-600 mt-1'>{qtyError}</p>
            )}
          </div>

          {/* Actions */}
          <div className='flex flex-wrap items-center gap-4 mt-6'>
            <Button onClick={handleAddToCart}>
              {t("product_details_page.add_to_cart", {
                defaultValue: "Add to Cart",
              })}
            </Button>
            <Button
              variant='outline'
              className='text-[#2c6449] border-[#2c6449]'
              onClick={handleContactSupplier}
            >
              {t("product_details_page.contact_supplier", {
                defaultValue: "Contact Supplier",
              })}
            </Button>
          </div>

          {/* Costs */}
          {hasValidNumericPrice && matchedPrice !== null && (
            <div className='mt-6 text-sm'>
              <div className='text-gray-700'>
                <span className='font-medium'>
                  {t("product_details_page.shipping_cost", {
                    defaultValue: "Shipping",
                  })}
                  :
                </span>{" "}
                {shippingCost} SAR
              </div>
              <div className='text-[#2c6449] font-semibold'>
                <span className='font-medium'>
                  {t("product_details_page.subtotal", {
                    defaultValue: "Subtotal",
                  })}
                  :
                </span>{" "}
                {subtotal !== null ? `${subtotal} SAR` : "Negotiable"}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div className='mt-12 bg-white border rounded-xl shadow-sm p-6'>
        <Tabs defaultValue='description' className='w-full'>
          <TabsList className='flex space-x-4 border-b mb-4'>
            <TabsTrigger value='description'>
              {t("product_details_page.description", {
                defaultValue: "Description",
              })}
            </TabsTrigger>
            <TabsTrigger value='reviews'>
              {t("product_details_page.reviews", {
                defaultValue: "Reviews",
              })}
            </TabsTrigger>
          </TabsList>
          <TabsContent value='description'>
            <p className='text-gray-700 whitespace-pre-line text-sm'>
              {description}
            </p>
          </TabsContent>
          <TabsContent value='reviews'>
            <p className='text-gray-600 italic text-sm'>
              {t("product_details_page.no_reviews", {
                defaultValue: "No reviews yet.",
              })}
            </p>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default ProductDetailsPage;
