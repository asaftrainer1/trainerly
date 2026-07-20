import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/hooks/useAuth";
import type { Session } from "@/types/database";

export function useUpcomingSessions() {
  const { user } = useAuth();

  return useQuery({
    queryKey: ["sessions", "upcoming", user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("sessions")
        .select("*, clients(full_name, avatar_url)")
        .eq("status", "scheduled")
        .gte("scheduled_at", new Date().toISOString())
        .order("scheduled_at", { ascending: true })
        .limit(6);
      if (error) throw error;
      return data as (Session & {
        clients: { full_name: string; avatar_url: string | null } | null;
      })[];
    },
    enabled: !!user,
  });
}

export function useDashboardStats() {
  const { user } = useAuth();

  return useQuery({
    queryKey: ["dashboard-stats", user?.id],
    queryFn: async () => {
      const [clientsRes, paymentsRes, programsRes] = await Promise.all([
        supabase.from("clients").select("id, status", { count: "exact" }),
        supabase.from("payments").select("amount, status, due_date"),
        supabase.from("programs").select("id, status"),
      ]);

      if (clientsRes.error) throw clientsRes.error;
      if (paymentsRes.error) throw paymentsRes.error;
      if (programsRes.error) throw programsRes.error;

      const activeClients = (clientsRes.data ?? []).filter((c) => c.status === "active").length;
      const totalClients = clientsRes.count ?? clientsRes.data?.length ?? 0;

      const now = new Date();
      const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
      const monthlyRevenue = (paymentsRes.data ?? [])
        .filter((p) => p.status === "paid" && new Date(p.due_date) >= monthStart)
        .reduce((sum, p) => sum + Number(p.amount), 0);

      const outstanding = (paymentsRes.data ?? [])
        .filter((p) => p.status === "pending" || p.status === "overdue")
        .reduce((sum, p) => sum + Number(p.amount), 0);

      const overdueCount = (paymentsRes.data ?? []).filter((p) => p.status === "overdue").length;

      const activePrograms = (programsRes.data ?? []).filter((p) => p.status === "active").length;

      return {
        activeClients,
        totalClients,
        monthlyRevenue,
        outstanding,
        overdueCount,
        activePrograms,
      };
    },
    enabled: !!user,
  });
}
