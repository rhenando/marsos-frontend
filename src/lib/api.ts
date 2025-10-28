import { supabase } from "@/lib/supabaseClient";

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:5001";

// ───────────────────────────────
// 🔐 Auth Header Helper
// ───────────────────────────────
async function getAuthHeader(): Promise<Record<string, string>> {
  const { data } = await supabase.auth.getSession();
  const token = data?.session?.access_token;
  if (!token) throw new Error("User not authenticated");
  return { Authorization: `Bearer ${token}` };
}

// ───────────────────────────────
// 🧱 Build Headers
// ───────────────────────────────
async function buildHeaders(
  extra?: Record<string, string>
): Promise<HeadersInit> {
  const authHeader = await getAuthHeader();
  return {
    "Content-Type": "application/json",
    ...authHeader,
    ...(extra || {}),
  };
}

// ───────────────────────────────
// 🌐 API
// ───────────────────────────────
export const api = {
  admin: {
    // ─────────────── USERS ───────────────
    listUsers: async () => {
      const headers = await buildHeaders();
      const res = await fetch(`${API_BASE_URL}/api/admin/users`, { headers });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Failed to fetch users");
      return json.data || json;
    },

    createUser: async (body: any) => {
      const headers = await buildHeaders();
      const res = await fetch(`${API_BASE_URL}/api/admin/users`, {
        method: "POST",
        headers,
        body: JSON.stringify(body),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Failed to create user");
      return json.data || json;
    },

    updateUser: async (id: string, body: any) => {
      const headers = await buildHeaders();
      const res = await fetch(`${API_BASE_URL}/api/admin/users/${id}`, {
        method: "PUT",
        headers,
        body: JSON.stringify(body),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Failed to update user");
      return json.data || json;
    },

    deleteUser: async (id: string) => {
      const headers = await buildHeaders();
      const res = await fetch(`${API_BASE_URL}/api/admin/users/${id}`, {
        method: "DELETE",
        headers,
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Failed to delete user");
      return json;
    },

    approveUser: async (id: string) => {
      const headers = await buildHeaders();
      const res = await fetch(`${API_BASE_URL}/api/admin/users/${id}/approve`, {
        method: "POST",
        headers,
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Failed to approve user");
      return json.data || json;
    },

    getStats: async () => {
      const headers = await buildHeaders();
      const res = await fetch(`${API_BASE_URL}/api/admin/stats`, { headers });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Failed to fetch stats");
      return json.data || json;
    },

    // ─────────────── PRODUCTS ───────────────
    listProducts: async () => {
      const headers = await buildHeaders();
      const res = await fetch(`${API_BASE_URL}/api/admin/products`, {
        headers,
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Failed to fetch products");
      return json.data || json;
    },

    createProduct: async (body: any) => {
      const headers = await buildHeaders();
      const res = await fetch(`${API_BASE_URL}/api/admin/products`, {
        method: "POST",
        headers,
        body: JSON.stringify(body),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Failed to create product");
      return json.data || json;
    },

    updateProduct: async (id: string, body: any) => {
      const headers = await buildHeaders();
      const res = await fetch(`${API_BASE_URL}/api/admin/products/${id}`, {
        method: "PUT",
        headers,
        body: JSON.stringify(body),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Failed to update product");
      return json.data || json;
    },

    deleteProduct: async (id: string) => {
      const headers = await buildHeaders();
      const res = await fetch(`${API_BASE_URL}/api/admin/products/${id}`, {
        method: "DELETE",
        headers,
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Failed to delete product");
      return json;
    },
  },
};
