// frontend/src/routes/admin/dashboard/Orders.tsx
import { useEffect, useState } from "react";
import AdminLayout from "@/routes/admin/dashboard/AdminLayout";
import { api } from "@/lib/api";

export default function Orders(): JSX.Element {
  const [orders, setOrders] = useState<any[]>([]);
  useEffect(() => {
    (async () => setOrders(await api.admin.listOrders()))();
  }, []);

  return (
    <AdminLayout>
      <h2 className='text-xl font-semibold mb-4'>Orders</h2>
      <div className='grid gap-3'>
        {orders.map((o) => (
          <div key={o.id} className='border rounded p-3'>
            <div className='font-semibold'>#{o.id}</div>
            <div className='text-sm'>{o.status}</div>
          </div>
        ))}
      </div>
    </AdminLayout>
  );
}
