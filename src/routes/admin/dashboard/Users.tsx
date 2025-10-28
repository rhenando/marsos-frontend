// frontend/src/routes/admin/dashboard/Users.tsx
import { useEffect, useState } from "react";
import AdminLayout from "@/routes/admin/dashboard/AdminLayout";
import { api } from "@/lib/api";
import { Button } from "@/components/ui/base/button";
import { Input } from "@/components/ui/form/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/overlay/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/form/select";
import {
  AlertDialog,
  AlertDialogTrigger,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogFooter,
} from "@/components/ui/feedback/alert-dialog";

import {
  Plus,
  Pencil,
  Trash2,
  CheckCircle2,
  Loader2,
  ShieldCheck,
} from "lucide-react";

export default function Users(): JSX.Element {
  const [users, setUsers] = useState<any[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);
  const [selectedUser, setSelectedUser] = useState<any | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [form, setForm] = useState({
    full_name: "",
    email: "",
    role: "buyer",
    company_name: "",
    phone: "",
    city: "",
    account_status: "pending_approval",
  });

  // ───────────────────────────────
  // 📦 Fetch Users
  // ───────────────────────────────
  useEffect(() => {
    (async () => {
      setLoading(true);
      try {
        const data = await api.admin.listUsers();
        setUsers(Array.isArray(data) ? data : data.data || []);
      } catch (err) {
        console.error("Failed to fetch users:", err);
        setUsers([]);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  // ───────────────────────────────
  // 🔍 Filter Users (null-safe)
  // ───────────────────────────────
  const filtered = users.filter((u) => {
    const email = u?.buyer_email || u?.personal_email || "";
    const name = u?.full_name || u?.buyer_name || "";
    const company = u?.company_name || "";
    return (
      email.toLowerCase().includes(search.toLowerCase()) ||
      name.toLowerCase().includes(search.toLowerCase()) ||
      company.toLowerCase().includes(search.toLowerCase())
    );
  });

  // ───────────────────────────────
  // ✏️ Add or Edit User
  // ───────────────────────────────
  const handleSubmit = async () => {
    try {
      setLoading(true);
      if (selectedUser) {
        await api.admin.updateUser(selectedUser.id, form);
        setUsers((prev) =>
          prev.map((u) => (u.id === selectedUser.id ? { ...u, ...form } : u))
        );
      } else {
        const newUser = await api.admin.createUser(form);
        setUsers((prev) => [...prev, newUser]);
      }
      setIsDialogOpen(false);
      setSelectedUser(null);
      setForm({
        full_name: "",
        email: "",
        role: "buyer",
        company_name: "",
        phone: "",
        city: "",
        account_status: "pending_approval",
      });
    } catch (err) {
      console.error("Error saving user:", err);
    } finally {
      setLoading(false);
    }
  };

  // ───────────────────────────────
  // 🗑️ Delete User
  // ───────────────────────────────
  const handleDelete = async (id: string) => {
    try {
      await api.admin.deleteUser(id);
      setUsers((prev) => prev.filter((u) => u.id !== id));
    } catch (err) {
      console.error("Error deleting user:", err);
    }
  };

  // ───────────────────────────────
  // ✅ Approve User
  // ───────────────────────────────
  const approve = async (id: string) => {
    try {
      await api.admin.approveUser(id);
      setUsers((u) =>
        u.map((x) => (x.id === id ? { ...x, account_status: "approved" } : x))
      );
    } catch (err) {
      console.error("Error approving user:", err);
    }
  };

  // ───────────────────────────────
  // 💡 UI Layout
  // ───────────────────────────────
  return (
    <AdminLayout>
      <div className='p-6 space-y-6'>
        {/* Header */}
        <div className='flex flex-col sm:flex-row sm:items-center justify-between gap-3'>
          <h2 className='text-2xl font-semibold text-gray-800'>
            User Management
          </h2>
          <div className='flex items-center gap-3'>
            <Input
              placeholder='Search by name, email or company...'
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className='w-60'
            />
            <Button
              className='bg-[#2c6449] text-white hover:bg-[#24513b]'
              onClick={() => {
                setSelectedUser(null);
                setForm({
                  full_name: "",
                  email: "",
                  role: "buyer",
                  company_name: "",
                  phone: "",
                  city: "",
                  account_status: "pending_approval",
                });
                setIsDialogOpen(true);
              }}
            >
              <Plus className='w-4 h-4 mr-2' /> Add User
            </Button>
          </div>
        </div>

        {/* Table */}
        <div className='overflow-x-auto border rounded-lg shadow-sm bg-white'>
          <table className='w-full text-sm'>
            <thead className='bg-gray-100 text-gray-700'>
              <tr>
                <th className='p-3 text-left font-medium'>Avatar</th>
                <th className='p-3 text-left font-medium'>Full Name</th>
                <th className='p-3 text-left font-medium'>Email</th>
                <th className='p-3 text-left font-medium'>Role</th>
                <th className='p-3 text-left font-medium'>Company</th>
                <th className='p-3 text-left font-medium'>Phone</th>
                <th className='p-3 text-left font-medium'>City</th>
                <th className='p-3 text-left font-medium'>Verified</th>
                <th className='p-3 text-left font-medium'>Account Status</th>
                <th className='p-3 text-left font-medium'>Created</th>
                <th className='p-3 text-left font-medium'>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((u) => (
                <tr
                  key={u.id}
                  className='border-t hover:bg-gray-50 transition-colors'
                >
                  <td className='p-3'>
                    {u.avatar_url ? (
                      <img
                        src={u.avatar_url}
                        alt={u.full_name || "User"}
                        className='w-10 h-10 rounded-full object-cover'
                      />
                    ) : (
                      <div className='w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center text-gray-500'>
                        {u.full_name?.[0]?.toUpperCase() || "U"}
                      </div>
                    )}
                  </td>
                  <td className='p-3 font-medium'>{u.full_name || "—"}</td>
                  <td className='p-3'>
                    {u.buyer_email || u.personal_email || "—"}
                  </td>
                  <td className='p-3 capitalize'>{u.role || "—"}</td>
                  <td className='p-3'>{u.company_name || "—"}</td>
                  <td className='p-3'>{u.phone || u.personal_phone || "—"}</td>
                  <td className='p-3'>{u.city || "—"}</td>
                  <td className='p-3'>
                    {u.is_verified ? (
                      <span className='flex items-center text-green-600'>
                        <ShieldCheck className='w-4 h-4 mr-1' /> Yes
                      </span>
                    ) : (
                      <span className='text-gray-500'>No</span>
                    )}
                  </td>
                  <td className='p-3'>
                    <span
                      className={`px-2 py-1 rounded-full text-xs font-semibold ${
                        u.account_status === "approved"
                          ? "bg-green-100 text-green-700"
                          : u.account_status === "suspended"
                          ? "bg-red-100 text-red-700"
                          : "bg-yellow-100 text-yellow-700"
                      }`}
                    >
                      {u.account_status || "pending_approval"}
                    </span>
                  </td>
                  <td className='p-3 text-gray-600'>
                    {u.created_at
                      ? new Date(u.created_at).toLocaleDateString()
                      : "—"}
                  </td>
                  <td className='p-3 flex gap-2'>
                    {u.account_status !== "approved" && (
                      <Button
                        size='sm'
                        variant='outline'
                        onClick={() => approve(u.id)}
                      >
                        <CheckCircle2 className='w-4 h-4 mr-1' /> Approve
                      </Button>
                    )}
                    <Button
                      size='sm'
                      variant='outline'
                      onClick={() => {
                        setSelectedUser(u);
                        setForm({
                          full_name: u.full_name || "",
                          email: u.buyer_email || u.personal_email || "",
                          role: u.role || "buyer",
                          company_name: u.company_name || "",
                          phone: u.phone || "",
                          city: u.city || "",
                          account_status:
                            u.account_status || "pending_approval",
                        });
                        setIsDialogOpen(true);
                      }}
                    >
                      <Pencil className='w-4 h-4 mr-1' /> Edit
                    </Button>

                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button size='sm' variant='destructive'>
                          <Trash2 className='w-4 h-4 mr-1' /> Delete
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>
                            Confirm User Deletion
                          </AlertDialogTitle>
                        </AlertDialogHeader>
                        <p className='text-sm text-gray-600'>
                          This action cannot be undone. The user will be
                          permanently removed.
                        </p>
                        <AlertDialogFooter>
                          <Button variant='outline'>Cancel</Button>
                          <Button
                            variant='destructive'
                            onClick={() => handleDelete(u.id)}
                          >
                            Delete
                          </Button>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {loading && (
          <div className='flex justify-center items-center py-6 text-gray-500'>
            <Loader2 className='animate-spin w-5 h-5 mr-2' /> Loading users...
          </div>
        )}

        {/* ─────────────────────────────── */}
        {/* 🧩 Modal: Add/Edit User */}
        {/* ─────────────────────────────── */}
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                {selectedUser ? "Edit User" : "Add New User"}
              </DialogTitle>
            </DialogHeader>

            <div className='space-y-4'>
              <Input
                placeholder='Full name'
                value={form.full_name}
                onChange={(e) =>
                  setForm({ ...form, full_name: e.target.value })
                }
              />
              <Input
                placeholder='Email'
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
              />
              <Input
                placeholder='Company name'
                value={form.company_name}
                onChange={(e) =>
                  setForm({ ...form, company_name: e.target.value })
                }
              />
              <Input
                placeholder='Phone number'
                value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
              />
              <Input
                placeholder='City'
                value={form.city}
                onChange={(e) => setForm({ ...form, city: e.target.value })}
              />

              <Select
                value={form.role}
                onValueChange={(v) => setForm({ ...form, role: v })}
              >
                <SelectTrigger>
                  <SelectValue placeholder='Select role' />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value='admin'>Admin</SelectItem>
                  <SelectItem value='supplier'>Supplier</SelectItem>
                  <SelectItem value='buyer'>Buyer</SelectItem>
                </SelectContent>
              </Select>

              <Select
                value={form.account_status}
                onValueChange={(v) => setForm({ ...form, account_status: v })}
              >
                <SelectTrigger>
                  <SelectValue placeholder='Account status' />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value='pending_approval'>
                    Pending Approval
                  </SelectItem>
                  <SelectItem value='approved'>Approved</SelectItem>
                  <SelectItem value='suspended'>Suspended</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <DialogFooter className='pt-4'>
              <Button variant='outline' onClick={() => setIsDialogOpen(false)}>
                Cancel
              </Button>
              <Button
                className='bg-[#2c6449] text-white hover:bg-[#24513b]'
                onClick={handleSubmit}
                disabled={loading}
              >
                {loading ? "Saving..." : "Save"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </AdminLayout>
  );
}
