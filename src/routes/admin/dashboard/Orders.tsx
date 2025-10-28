import { useEffect, useState } from "react";
import AdminLayout from "@/routes/admin/dashboard/AdminLayout";
import { api } from "@/lib/api";

type Order = {
  id: string;
  status?: string;
  [key: string]: any;
};

export default function Orders() {
  const [orders, setOrders] = useState<Order[]>([]);

  useEffect(() => {
    (async () => {
      try {
        // ✅ Explicitly cast API result to Order[]
        const data = (await api.admin.listOrders()) as Order[];
        setOrders(data);
      } catch (err) {
        console.error("Failed to load orders:", err);
        setOrders([]);
      }
    })();
  }, []);

  return (
    <AdminLayout>
      <h2 className='text-xl font-semibold mb-4'>Orders</h2>
      <div className='grid gap-3'>
        {orders.length > 0 ? (
          orders.map((o) => (
            <div key={o.id} className='border rounded p-3'>
              <div className='font-semibold'>#{o.id}</div>
              <div className='text-sm capitalize'>{o.status || "Pending"}</div>
            </div>
          ))
        ) : (
          <p className='text-gray-500 text-sm'>No orders found.</p>
        )}
      </div>
    </AdminLayout>
  );
}
