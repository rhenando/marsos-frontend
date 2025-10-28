// src/hooks/useAdminStats.ts
import { useEffect, useState } from "react";
import { api } from "@/lib/api";

export function useAdminStats() {
  const [stats, setStats] = useState<{
    users: number;
    products: number;
    orders: number;
  } | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      try {
        const data = await api.admin.getStats();
        setStats(data);
      } catch (err) {
        console.error("Failed to load stats:", err);
        setError("Failed to fetch admin stats");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  return { stats, loading, error };
}
