// frontend/src/components/admin/AdminTopbar.tsx
import { useAuthStore } from "@/state/useAuthStore";

export default function AdminTopbar() {
  const { user } = useAuthStore();
  const email = user?.email ?? "Unknown";

  return (
    <header className='w-full h-14 border-b bg-white/70 backdrop-blur flex items-center justify-between px-4'>
      <div className='font-semibold'>Admin</div>
      <div className='flex items-center gap-3'>
        <span className='text-sm text-muted-foreground'>{email}</span>
      </div>
    </header>
  );
}
