// frontend/src/routes/admin/dashboard/Settings.tsx

import AdminLayout from "@/routes/admin/dashboard/AdminLayout";

export default function Settings(): JSX.Element {
  return (
    <AdminLayout>
      <h2 className='text-xl font-semibold mb-4'>Settings</h2>
      <div className='text-sm text-muted-foreground'>
        Environment / Security toggles are enforced server-side.
      </div>
    </AdminLayout>
  );
}
