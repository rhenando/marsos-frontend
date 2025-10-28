// frontend/src/components/admin/RequireAdmin.tsx
import React from "react";
import { Navigate } from "react-router-dom";
import { useAuthStore } from "@/state/useAuthStore";

export default function RequireAdmin({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, loading } = useAuthStore();

  // 🕒 Still checking session
  if (loading) {
    return (
      <div className='flex items-center justify-center h-screen bg-white'>
        <div className='text-gray-500 text-sm animate-pulse'>
          Checking admin session...
        </div>
      </div>
    );
  }

  // 🚫 Not logged in or not admin
  if (!user || user.role !== "admin") {
    return <Navigate to='/admin/login' replace />;
  }

  // ✅ Authorized
  return <>{children}</>;
}
