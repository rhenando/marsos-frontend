// frontend/src/components/admin/AdminSidebar.tsx
import { NavLink } from "react-router-dom";
import { Home, Users, Package, ShoppingBag, Settings } from "lucide-react";

const linkBase = "flex items-center gap-3 px-3 py-2 rounded-lg text-sm";
const linkClass = ({ isActive }: { isActive: boolean }) =>
  `${linkBase} ${isActive ? "bg-[#2c6449] text-white" : "hover:bg-muted"}`;

export default function AdminSidebar() {
  return (
    <aside className='h-[calc(100vh-56px)] w-60 border-r p-3'>
      <nav className='space-y-1'>
        <NavLink to='/admin-dashboard' className={linkClass} end>
          <Home size={18} /> Overview
        </NavLink>
        <NavLink to='/admin/users' className={linkClass}>
          <Users size={18} /> Users
        </NavLink>
        <NavLink to='/admin/products' className={linkClass}>
          <Package size={18} /> Products
        </NavLink>
        <NavLink to='/admin/orders' className={linkClass}>
          <ShoppingBag size={18} /> Orders
        </NavLink>
        <NavLink to='/admin/settings' className={linkClass}>
          <Settings size={18} /> Settings
        </NavLink>
      </nav>
    </aside>
  );
}
