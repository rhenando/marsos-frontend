// frontend/src/routes/admin/dashboard/Overview.tsx
import { useEffect, useState } from "react";
import AdminLayout from "@/routes/admin/dashboard/AdminLayout";
import AdminStatCard from "@/components/admin/AdminStatCard";
import { api } from "@/lib/api";

// ✅ Define the shape of data you expect from API
type AdminStats = {
  users: number;
  products: number;
  orders: number;
};

export default function Overview() {
  // ✅ Explicitly define state type
  const [stats, setStats] = useState<AdminStats>({
    users: 0,
    products: 0,
    orders: 0,
  });

  useEffect(() => {
    (async () => {
      try {
        // ✅ Explicit type assertion for API response
        const s = (await api.admin.getStats()) as AdminStats;
        setStats(s);
      } catch (err) {
        console.error("❌ Failed to fetch admin stats:", err);
      }
    })();
  }, []);

  return (
    <AdminLayout>
      <div className='grid grid-cols-1 md:grid-cols-3 gap-4'>
        <AdminStatCard title='Users' value={stats.users} />
        <AdminStatCard title='Products' value={stats.products} />
        <AdminStatCard title='Orders' value={stats.orders} />
      </div>
    </AdminLayout>
  );
}
