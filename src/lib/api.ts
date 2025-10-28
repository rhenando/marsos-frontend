import { supabase } from "@/lib/supabaseClient";

/**
 * 🔧 Base URL
 */
const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:5001";

/**
 * 🔐 Get Authorization Header from Supabase Session
 */
async function getAuthHeader(): Promise<Record<string, string>> {
  const { data } = await supabase.auth.getSession();
  const token = data?.session?.access_token;
  if (!token) throw new Error("User not authenticated");
  return { Authorization: `Bearer ${token}` };
}

/**
 * 🧱 Build Headers (JSON + Auth)
 */
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

/**
 * 🌐 Unified Request Helper
 */
async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  try {
    const res = await fetch(`${API_BASE_URL}${path}`, options);
    const json = await res.json();

    if (!res.ok) {
      const message = json?.error || json?.message || "Request failed";
      throw new Error(message);
    }

    return json.data || json;
  } catch (err: any) {
    console.error(`❌ API Request Error [${path}]:`, err);
    throw new Error(err.message || "Network error");
  }
}

/**
 * 🧩 API Object
 */
export const api = {
  admin: {
    // ─────────────── USERS ───────────────
    listUsers: async () => {
      const headers = await buildHeaders();
      return request("/api/admin/users", { headers });
    },

    createUser: async (body: any) => {
      const headers = await buildHeaders();
      return request("/api/admin/users", {
        method: "POST",
        headers,
        body: JSON.stringify(body),
      });
    },

    updateUser: async (id: string, body: any) => {
      const headers = await buildHeaders();
      return request(`/api/admin/users/${id}`, {
        method: "PUT",
        headers,
        body: JSON.stringify(body),
      });
    },

    deleteUser: async (id: string) => {
      const headers = await buildHeaders();
      return request(`/api/admin/users/${id}`, {
        method: "DELETE",
        headers,
      });
    },

    approveUser: async (id: string) => {
      const headers = await buildHeaders();
      return request(`/api/admin/users/${id}/approve`, {
        method: "POST",
        headers,
      });
    },

    getStats: async () => {
      const headers = await buildHeaders();
      return request("/api/admin/stats", { headers });
    },

    // ─────────────── PRODUCTS ───────────────
    listProducts: async () => {
      const headers = await buildHeaders();
      return request("/api/admin/products", { headers });
    },

    createProduct: async (body: any) => {
      const headers = await buildHeaders();
      return request("/api/admin/products", {
        method: "POST",
        headers,
        body: JSON.stringify(body),
      });
    },

    updateProduct: async (id: string, body: any) => {
      const headers = await buildHeaders();
      return request(`/api/admin/products/${id}`, {
        method: "PUT",
        headers,
        body: JSON.stringify(body),
      });
    },

    deleteProduct: async (id: string) => {
      const headers = await buildHeaders();
      return request(`/api/admin/products/${id}`, {
        method: "DELETE",
        headers,
      });
    },

    // ─────────────── ORDERS ───────────────
    listOrders: async () => {
      const headers = await buildHeaders();
      return request("/api/admin/orders", { headers });
    },
  },
};
