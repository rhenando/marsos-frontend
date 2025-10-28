// src/routes/admin/dashboard/AdminOverviewPage.tsx
import { useAdminStats } from "@/hooks/useAdminStats";
import AdminLayout from "@/routes/admin/dashboard/AdminLayout";
import AdminStatCard from "@/components/admin/AdminStatCard";
import { Skeleton } from "@/components/ui/data-display/skeleton";

export default function AdminOverviewPage() {
  const { stats, loading, error } = useAdminStats();

  return (
    <AdminLayout>
      <div className='space-y-6'>
        <h1 className='text-2xl font-semibold text-gray-800'>
          Dashboard Overview
        </h1>

        {/* Stats Section */}
        {loading ? (
          <div className='grid grid-cols-1 md:grid-cols-3 gap-4'>
            {[...Array(3)].map((_, i) => (
              <Skeleton key={i} className='h-24 rounded-lg' />
            ))}
          </div>
        ) : error ? (
          <div className='text-center text-red-500 py-6'>
            Failed to load stats. Please try again.
          </div>
        ) : (
          <div className='grid grid-cols-1 md:grid-cols-3 gap-4'>
            <AdminStatCard title='Total Users' value={stats?.users ?? 0} />
            <AdminStatCard
              title='Total Products'
              value={stats?.products ?? 0}
            />
            <AdminStatCard title='Total Orders' value={stats?.orders ?? 0} />
          </div>
        )}

        {/* Future Sections */}
        <div className='grid md:grid-cols-2 gap-6'>
          <div className='border rounded-lg p-4 bg-white shadow-sm'>
            <h2 className='text-lg font-semibold mb-2'>Recent Users</h2>
            <p className='text-sm text-muted-foreground'>
              Shows last 5 registered accounts.
            </p>
          </div>
          <div className='border rounded-lg p-4 bg-white shadow-sm'>
            <h2 className='text-lg font-semibold mb-2'>Recent Orders</h2>
            <p className='text-sm text-muted-foreground'>
              Displays 5 most recent orders for review.
            </p>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
