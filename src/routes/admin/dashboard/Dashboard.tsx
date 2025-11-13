import { useEffect, useState } from "react";
import AdminLayout from "@/routes/admin/dashboard/AdminLayout";
import { api } from "@/lib/api";
import { Skeleton } from "@/components/ui/data-display/skeleton";

type Order = {
  id: string;
  buyer_name?: string;
  total_amount?: number;
  status?: string;
  created_at?: string;
};

export default function Orders() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        // ✅ Explicit type assertion to tell TypeScript what this data is
        const data = (await api.admin.listOrders()) as Order[];
        setOrders(data);
      } catch (err: any) {
        console.error("❌ Failed to load orders:", err);
        setError(err.message || "Unknown error");
      } finally {
        setLoading(false);
      }
    };
    fetchOrders();
  }, []);

  return (
    <AdminLayout>
      <div className='space-y-6'>
        <h1 className='text-2xl font-semibold text-gray-800'>Orders</h1>

        {/* 🌀 Loading Skeleton */}
        {loading && (
          <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
            {[...Array(4)].map((_, i) => (
              <Skeleton key={i} className='h-24 rounded-lg' />
            ))}
          </div>
        )}

        {/* ⚠️ Error State */}
        {error && (
          <div className='text-center text-red-500 py-6'>
            Failed to load orders: {error}
          </div>
        )}

        {/* 📦 Orders Table */}
        {!loading && !error && (
          <div className='overflow-x-auto border rounded-lg bg-white shadow-sm'>
            <table className='w-full text-sm text-left border-collapse'>
              <thead className='bg-gray-100 text-gray-700 font-medium'>
                <tr>
                  <th className='p-3 border-b'>Order ID</th>
                  <th className='p-3 border-b'>Buyer</th>
                  <th className='p-3 border-b'>Total</th>
                  <th className='p-3 border-b'>Status</th>
                  <th className='p-3 border-b'>Created</th>
                </tr>
              </thead>
              <tbody>
                {orders.length > 0 ? (
                  orders.map((order) => (
                    <tr key={order.id} className='hover:bg-gray-50'>
                      <td className='p-3 border-b'>{order.id}</td>
                      <td className='p-3 border-b'>
                        {order.buyer_name || "N/A"}
                      </td>
                      <td className='p-3 border-b'>
                        {order.total_amount
                          ? `${order.total_amount.toFixed(2)} SAR`
                          : "—"}
                      </td>
                      <td className='p-3 border-b capitalize'>
                        {order.status || "pending"}
                      </td>
                      <td className='p-3 border-b'>
                        {order.created_at
                          ? new Date(order.created_at).toLocaleString()
                          : "—"}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td
                      colSpan={5}
                      className='text-center py-4 text-gray-500 border-b'
                    >
                      No orders found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
