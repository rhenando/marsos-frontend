// frontend/src/routes/admin/dashboard/Overview.tsx
import { useEffect, useState } from "react";
import AdminLayout from "@/routes/admin/dashboard/AdminLayout";
import AdminStatCard from "@/components/admin/AdminStatCard";
import { api } from "@/lib/api";

export default function Overview() {
  const [stats, setStats] = useState({ users: 0, products: 0, orders: 0 });

  useEffect(() => {
    (async () => {
      const s = await api.admin.getStats();
      setStats(s);
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
