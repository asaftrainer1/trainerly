import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/hooks/useAuth";
import type { Exercise, Program, ProgramWithWorkouts, Workout } from "@/types/database";

export function usePrograms() {
  const { user } = useAuth();

  return useQuery({
    queryKey: ["programs", user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("programs")
        .select("*, clients(full_name, avatar_url)")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data as (Program & { clients: { full_name: string; avatar_url: string | null } | null })[];
    },
    enabled: !!user,
  });
}

export function useProgram(programId: string | undefined) {
  return useQuery({
    queryKey: ["program", programId],
    queryFn: async () => {
      const { data: program, error: programError } = await supabase
        .from("programs")
        .select("*")
        .eq("id", programId as string)
        .single();
      if (programError) throw programError;

      const { data: workouts, error: workoutsError } = await supabase
        .from("workouts")
        .select("*, exercises(*)")
        .eq("program_id", programId as string)
        .order("day_index", { ascending: true });
      if (workoutsError) throw workoutsError;

      return {
        ...program,
        workouts: (workouts ?? []).map((w) => ({
          ...w,
          exercises: (w.exercises ?? []).sort(
            (a: Exercise, b: Exercise) => a.order_index - b.order_index
          ),
        })),
      } as ProgramWithWorkouts;
    },
    enabled: !!programId,
  });
}

export function useCreateProgram() {
  const queryClient = useQueryClient();
  const { user } = useAuth();
console.log('User ID:', user?.id);
console.log('Full User:', user);

  return useMutation({
    mutationFn: async (input: Partial<Program> & { name: string }) => {
      if (!user) throw new Error("Not authenticated");
      const { data, error } = await supabase
        .from("programs")
        .insert({ ...input, trainer_id: user.id })
        .select()
        .single();
      if (error) throw error;
      return data as Program;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["programs"] });
    },
  });
}

export function useUpdateProgram() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...updates }: Partial<Program> & { id: string }) => {
      const { data, error } = await supabase
        .from("programs")
        .update(updates)
        .eq("id", id)
        .select()
        .single();
      if (error) throw error;
      return data as Program;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["programs"] });
      queryClient.invalidateQueries({ queryKey: ["program", data.id] });
    },
  });
}

export function useDeleteProgram() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("programs").delete().eq("id", id);
      if (error) throw error;
      return id;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["programs"] }),
  });
}

export function useCreateWorkout() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (input: Partial<Workout> & { program_id: string; name: string }) => {
      const { data, error } = await supabase.from("workouts").insert(input).select().single();
      if (error) throw error;
      return data as Workout;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["program", data.program_id] });
    },
  });
}

export function useDeleteWorkout() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id }: { id: string; program_id: string }) => {
      const { error } = await supabase.from("workouts").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ["program", variables.program_id] });
    },
  });
}

export function useCreateExercise() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (
      input: Partial<Exercise> & { workout_id: string; name: string; program_id: string }
    ) => {
      const { program_id, ...rest } = input;
      const { data, error } = await supabase.from("exercises").insert(rest).select().single();
      if (error) throw error;
      return { data: data as Exercise, program_id };
    },
    onSuccess: ({ program_id }) => {
      queryClient.invalidateQueries({ queryKey: ["program", program_id] });
    },
  });
}

export function useUpdateExercise() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      id,
      program_id,
      ...updates
    }: Partial<Exercise> & { id: string; program_id: string }) => {
      const { data, error } = await supabase
        .from("exercises")
        .update(updates)
        .eq("id", id)
        .select()
        .single();
      if (error) throw error;
      return { data: data as Exercise, program_id };
    },
    onSuccess: ({ program_id }) => {
      queryClient.invalidateQueries({ queryKey: ["program", program_id] });
    },
  });
}

export function useDeleteExercise() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id }: { id: string; program_id: string }) => {
      const { error } = await supabase.from("exercises").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ["program", variables.program_id] });
    },
  });
}
