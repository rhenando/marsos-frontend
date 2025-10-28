import { useEffect, useState } from "react";
import AdminLayout from "@/routes/admin/dashboard/AdminLayout";
import { api } from "@/lib/api";
import { useTranslation } from "react-i18next";
import { Loader2 } from "lucide-react";

export default function Products(): JSX.Element {
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const { i18n } = useTranslation();
  const locale = i18n.language || "en";

  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        const data = await api.admin.listProducts();
        setProducts(data || []);
      } catch (err) {
        console.error("Error fetching products:", err);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const getLocalized = (item: any, field: string) => {
    const localizedField = locale === "ar" ? `${field}_ar` : `${field}_en`;
    return item[localizedField] || item[`${field}_en`] || "—";
  };

  const getPriceRange = (ranges: any) => {
    try {
      if (!ranges || !Array.isArray(ranges) || ranges.length === 0) return "—";
      const first = ranges[0]?.price;
      const last = ranges[ranges.length - 1]?.price;
      return first === last ? `${first} SAR` : `${first}–${last} SAR`;
    } catch {
      return "—";
    }
  };

  return (
    <AdminLayout>
      <div className='p-6 space-y-6'>
        <h2 className='text-2xl font-semibold text-gray-800 mb-4'>
          {locale === "ar" ? "إدارة المنتجات" : "Products Management"}
        </h2>

        {loading && (
          <div className='flex justify-center items-center text-gray-500 py-10'>
            <Loader2 className='animate-spin w-5 h-5 mr-2' />
            {locale === "ar" ? "جارٍ تحميل المنتجات..." : "Loading products..."}
          </div>
        )}

        {!loading && products.length === 0 && (
          <div className='text-center text-gray-500 py-10'>
            {locale === "ar" ? "لا توجد منتجات حالياً." : "No products found."}
          </div>
        )}

        {!loading && products.length > 0 && (
          <div className='overflow-x-auto border rounded-lg shadow-sm bg-white'>
            <table
              dir={locale === "ar" ? "rtl" : "ltr"}
              className='w-full text-sm'
            >
              <thead className='bg-gray-100 text-gray-700'>
                <tr>
                  <th className='p-3 text-left font-medium'>
                    {locale === "ar" ? "الصورة" : "Image"}
                  </th>
                  <th className='p-3 text-left font-medium'>
                    {locale === "ar" ? "الاسم" : "Name"}
                  </th>
                  <th className='p-3 text-left font-medium'>
                    {locale === "ar" ? "الفئة" : "Category"}
                  </th>
                  <th className='p-3 text-left font-medium'>
                    {locale === "ar" ? "المورد" : "Supplier"}
                  </th>
                  <th className='p-3 text-left font-medium'>
                    {locale === "ar" ? "نطاق السعر" : "Price Range"}
                  </th>
                  <th className='p-3 text-left font-medium'>
                    {locale === "ar" ? "الحالة" : "Status"}
                  </th>
                  <th className='p-3 text-left font-medium'>
                    {locale === "ar" ? "تاريخ الإنشاء" : "Created"}
                  </th>
                </tr>
              </thead>
              <tbody>
                {products.map((p) => (
                  <tr
                    key={p.id}
                    className='border-t hover:bg-gray-50 transition-colors'
                  >
                    <td className='p-3'>
                      <img
                        src={p.mainimageurl || "/placeholder-product.png"}
                        alt={getLocalized(p, "productname")}
                        className='w-14 h-14 object-cover rounded-md border'
                      />
                    </td>

                    <td className='p-3 font-medium'>
                      {getLocalized(p, "productname")}
                    </td>

                    <td className='p-3'>{getLocalized(p, "category")}</td>

                    <td className='p-3'>
                      {p.suppliername || "—"}{" "}
                      <span className='text-xs text-gray-500'>
                        ({p.suppliernumber || "—"})
                      </span>
                    </td>

                    <td className='p-3'>{getPriceRange(p.priceranges)}</td>

                    <td className='p-3'>
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-semibold ${
                          p.status === "approved"
                            ? "bg-green-100 text-green-700"
                            : p.status === "draft"
                            ? "bg-yellow-100 text-yellow-700"
                            : "bg-gray-100 text-gray-700"
                        }`}
                      >
                        {p.status}
                      </span>
                    </td>

                    <td className='p-3 text-gray-500'>
                      {p.created_at
                        ? new Date(p.created_at).toLocaleDateString(locale, {
                            year: "numeric",
                            month: "short",
                            day: "numeric",
                          })
                        : "—"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
