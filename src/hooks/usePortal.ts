import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/hooks/useAuth";

// כל התוכניות של המתאמן המחובר, כולל אימונים ותרגילים
export function useMyPrograms() {
  const { clientRecord } = useAuth();
  return useQuery({
    queryKey: ["my-programs", clientRecord?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("programs")
        .select("*, workouts(*, exercises(*))")
        .eq("client_id", clientRecord!.id)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
    enabled: !!clientRecord,
  });
}

// היסטוריית ביצועים של אימון מסוים (כדי לדעת אם כבר בוצע)
export function useWorkoutCompletions(workoutId: string | undefined) {
  const { clientRecord } = useAuth();
  return useQuery({
    queryKey: ["workout-completions", workoutId, clientRecord?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("workout_completions")
        .select("*, exercise_logs(*)")
        .eq("workout_id", workoutId as string)
        .eq("client_id", clientRecord!.id)
        .order("completed_at", { ascending: false });
      if (error) throw error;
      return data;
    },
    enabled: !!workoutId && !!clientRecord,
  });
}

// סימון אימון כבוצע + שמירת כל הסטים (משקל, חזרות, RPE)
export function useCompleteWorkout() {
  const queryClient = useQueryClient();
  const { clientRecord } = useAuth();

  return useMutation({
    mutationFn: async (input: {
      workoutId: string;
      notes?: string;
      sets: { exerciseId: string; setNumber: number; weightKg?: number; reps?: number; rpe?: number }[];
    }) => {
      const { data: completion, error: completionError } = await supabase
        .from("workout_completions")
        .insert({
          workout_id: input.workoutId,
          client_id: clientRecord!.id,
          notes: input.notes,
        })
        .select()
        .single();
      if (completionError) throw completionError;

      const logsToInsert = input.sets.map((s) => ({
        workout_completion_id: completion.id,
        exercise_id: s.exerciseId,
        set_number: s.setNumber,
        weight_kg: s.weightKg,
        reps: s.reps,
        rpe: s.rpe,
      }));

      const { error: logsError } = await supabase.from("exercise_logs").insert(logsToInsert);
      if (logsError) throw logsError;

      return completion;
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ["workout-completions", variables.workoutId] });
    },
  });
}

// מילוי מדדים יומיים (צעדים, משקל גוף, קלוריות, BMR)
export function useSaveDailyMetric() {
  const queryClient = useQueryClient();
  const { clientRecord } = useAuth();

  return useMutation({
    mutationFn: async (input: {
      date: string;
      steps?: number;
      bodyWeightKg?: number;
      caloriesBurned?: number;
      bmr?: number;
    }) => {
      const { data, error } = await supabase
        .from("daily_metrics")
        .upsert(
          {
            client_id: clientRecord!.id,
            date: input.date,
            steps: input.steps,
            body_weight_kg: input.bodyWeightKg,
            calories_burned: input.caloriesBurned,
            bmr: input.bmr,
          },
          { onConflict: "client_id,date" }
        )
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["daily-metrics"] });
    },
  });
}