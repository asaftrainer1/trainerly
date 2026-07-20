import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/hooks/useAuth";
import type { Payment } from "@/types/database";

export function usePayments() {
  const { user } = useAuth();

  return useQuery({
    queryKey: ["payments", user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("payments")
        .select("*, clients(full_name, avatar_url)")
        .order("due_date", { ascending: false });
      if (error) throw error;
      return data as (Payment & {
        clients: { full_name: string; avatar_url: string | null } | null;
      })[];
    },
    enabled: !!user,
  });
}

export function useClientPayments(clientId: string | undefined) {
  return useQuery({
    queryKey: ["payments", "client", clientId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("payments")
        .select("*")
        .eq("client_id", clientId as string)
        .order("due_date", { ascending: false });
      if (error) throw error;
      return data as Payment[];
    },
    enabled: !!clientId,
  });
}

export function useCreatePayment() {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async (
      input: Partial<Payment> & { client_id: string; amount: number; due_date: string }
    ) => {
      if (!user) throw new Error("Not authenticated");
      const { data, error } = await supabase
        .from("payments")
        .insert({ ...input, trainer_id: user.id })
        .select()
        .single();
      if (error) throw error;
      return data as Payment;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["payments"] });
    },
  });
}

export function useUpdatePayment() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...updates }: Partial<Payment> & { id: string }) => {
      const { data, error } = await supabase
        .from("payments")
        .update(updates)
        .eq("id", id)
        .select()
        .single();
      if (error) throw error;
      return data as Payment;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["payments"] });
    },
  });
}

export function useDeletePayment() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("payments").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["payments"] }),
  });
}
