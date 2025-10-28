// frontend/src/routes/admin/layout/AdminLayout.tsx
import React from "react";
import RequireAdmin from "@/components/admin/RequireAdmin";
import AdminSidebar from "@/components/admin/AdminSidebar";
import AdminTopbar from "@/components/admin/AdminTopbar";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <RequireAdmin>
      <div className='min-h-screen w-full bg-background text-foreground'>
        <AdminTopbar />
        <div className='flex'>
          <AdminSidebar />
          <main className='flex-1 p-4'>{children}</main>
        </div>
      </div>
    </RequireAdmin>
  );
}
