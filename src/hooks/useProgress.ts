import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/hooks/useAuth";
import type { ProgressEntry } from "@/types/database";

export function useProgressEntries(clientId: string | undefined) {
  return useQuery({
    queryKey: ["progress", clientId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("progress_entries")
        .select("*")
        .eq("client_id", clientId as string)
        .order("date", { ascending: true });
      if (error) throw error;
      return data as ProgressEntry[];
    },
    enabled: !!clientId,
  });
}

export function useAddProgressEntry() {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async (input: Partial<ProgressEntry> & { client_id: string; date: string }) => {
      if (!user) throw new Error("Not authenticated");
      const { data, error } = await supabase
        .from("progress_entries")
        .insert({ ...input, trainer_id: user.id })
        .select()
        .single();
      if (error) throw error;
      return data as ProgressEntry;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["progress", data.client_id] });
      // Keep the client's headline current_weight_kg in sync with the latest entry
      if (data.weight_kg) {
        supabase
          .from("clients")
          .update({ current_weight_kg: data.weight_kg })
          .eq("id", data.client_id)
          .then(() => queryClient.invalidateQueries({ queryKey: ["clients"] }));
      }
    },
  });
}

export function useDeleteProgressEntry() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id }: { id: string; client_id: string }) => {
      const { error } = await supabase.from("progress_entries").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ["progress", variables.client_id] });
    },
  });
}
