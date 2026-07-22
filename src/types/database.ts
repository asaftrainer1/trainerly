export type ClientStatus = "active" | "pending" | "inactive";
export type ProgramStatus = "draft" | "active" | "completed" | "archived";
export type PaymentStatus = "paid" | "pending" | "overdue" | "refunded";
export type SessionStatus = "scheduled" | "completed" | "cancelled" | "no_show";

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          full_name: string;
          business_name: string | null;
          avatar_url: string | null;
          phone: string | null;
          currency: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          full_name: string;
          business_name?: string | null;
          avatar_url?: string | null;
          phone?: string | null;
          currency?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["profiles"]["Insert"]>;
      };
      clients: {
        Row: {
          id: string;
          trainer_id: string;
          full_name: string;
          email: string | null;
          phone: string | null;
          avatar_url: string | null;
          date_of_birth: string | null;
          goal: string | null;
          status: ClientStatus;
          starting_weight_kg: number | null;
          current_weight_kg: number | null;
          height_cm: number | null;
          notes: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          trainer_id: string;
          full_name: string;
          email?: string | null;
          phone?: string | null;
          avatar_url?: string | null;
          date_of_birth?: string | null;
          goal?: string | null;
          status?: ClientStatus;
          starting_weight_kg?: number | null;
          current_weight_kg?: number | null;
          height_cm?: number | null;
          notes?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["clients"]["Insert"]>;
      };
      programs: {
        Row: {
          id: string;
          trainer_id: string;
          client_id: string | null;
          name: string;
          description: string | null;
          duration_weeks: number;
          status: ProgramStatus;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          trainer_id: string;
          client_id?: string | null;
          name: string;
          description?: string | null;
          duration_weeks?: number;
          status?: ProgramStatus;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["programs"]["Insert"]>;
      };
      workouts: {
        Row: {
          id: string;
          program_id: string;
          name: string;
          day_index: number;
          notes: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          program_id: string;
          name: string;
          day_index?: number;
          notes?: string | null;
          created_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["workouts"]["Insert"]>;
      };
      exercises: {
        Row: {
          id: string;
          workout_id: string;
          name: string;
          sets: number;
          reps: string;
          weight_kg: number | null;
          rest_seconds: number | null;
          order_index: number;
          notes: string | null;
        };
        Insert: {
          id?: string;
          workout_id: string;
          name: string;
          sets?: number;
          reps?: string;
          weight_kg?: number | null;
          rest_seconds?: number | null;
          order_index?: number;
          notes?: string | null;
        };
        Update: Partial<Database["public"]["Tables"]["exercises"]["Insert"]>;
      };
      progress_entries: {
        Row: {
          id: string;
          client_id: string;
          trainer_id: string;
          date: string;
          weight_kg: number | null;
          body_fat_pct: number | null;
          chest_cm: number | null;
          waist_cm: number | null;
          hips_cm: number | null;
          arm_cm: number | null;
          thigh_cm: number | null;
          notes: string | null;
          photo_url: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          client_id: string;
          trainer_id: string;
          date: string;
          weight_kg?: number | null;
          body_fat_pct?: number | null;
          chest_cm?: number | null;
          waist_cm?: number | null;
          hips_cm?: number | null;
          arm_cm?: number | null;
          thigh_cm?: number | null;
          notes?: string | null;
          photo_url?: string | null;
          created_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["progress_entries"]["Insert"]>;
      };
      payments: {
        Row: {
          id: string;
          trainer_id: string;
          client_id: string;
          amount: number;
          currency: string;
          status: PaymentStatus;
          due_date: string;
          paid_date: string | null;
          method: string | null;
          description: string | null;
          invoice_number: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          trainer_id: string;
          client_id: string;
          amount: number;
          currency?: string;
          status?: PaymentStatus;
          due_date: string;
          paid_date?: string | null;
          method?: string | null;
          description?: string | null;
          invoice_number?: string;
          created_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["payments"]["Insert"]>;
      };
      sessions: {
        Row: {
          id: string;
          trainer_id: string;
          client_id: string;
          scheduled_at: string;
          duration_minutes: number;
          status: SessionStatus;
          location: string | null;
          notes: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          trainer_id: string;
          client_id: string;
          scheduled_at: string;
          duration_minutes?: number;
          status?: SessionStatus;
          location?: string | null;
          notes?: string | null;
          created_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["sessions"]["Insert"]>;
      };

      workout_completions: {
        Row: {
          id: string;
          workout_id: string;
          client_id: string;
          completed_at: string;
          notes: string | null;
        };
        Insert: {
          id?: string;
          workout_id: string;
          client_id: string;
          completed_at?: string;
          notes?: string | null;
        };
        Update: Partial<Database["public"]["Tables"]["workout_completions"]["Insert"]>;
      };
      exercise_logs: {
        Row: {
          id: string;
          workout_completion_id: string;
          exercise_id: string | null;
          set_number: number;
          weight_kg: number | null;
          reps: number | null;
          rpe: number | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          workout_completion_id: string;
          exercise_id?: string | null;
          set_number: number;
          weight_kg?: number | null;
          reps?: number | null;
          rpe?: number | null;
          created_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["exercise_logs"]["Insert"]>;
      };
      daily_metrics: {
        Row: {
          id: string;
          client_id: string;
          date: string;
          steps: number | null;
          body_weight_kg: number | null;
          calories_burned: number | null;
          bmr: number | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          client_id: string;
          date?: string;
          steps?: number | null;
          body_weight_kg?: number | null;
          calories_burned?: number | null;
          bmr?: number | null;
          created_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["daily_metrics"]["Insert"]>;
     
      };
    };
  
  Views: Record<string, never>;
  Functions: Record<string, never>;
  Enums: Record<string, never>;
  CompositeTypes: Record<string, never>;
  }; 
}
export type Profile = Database["public"]["Tables"]["profiles"]["Row"];
export type Client = Database["public"]["Tables"]["clients"]["Row"];
export type Program = Database["public"]["Tables"]["programs"]["Row"];
export type Workout = Database["public"]["Tables"]["workouts"]["Row"];
export type Exercise = Database["public"]["Tables"]["exercises"]["Row"];
export type ProgressEntry = Database["public"]["Tables"]["progress_entries"]["Row"];
export type Payment = Database["public"]["Tables"]["payments"]["Row"];
export type Session = Database["public"]["Tables"]["sessions"]["Row"];
export type WorkoutCompletion = Database["public"]["Tables"]["workout_completions"]["Row"];
export type ExerciseLog = Database["public"]["Tables"]["exercise_logs"]["Row"];
export type DailyMetric = Database["public"]["Tables"]["daily_metrics"]["Row"];
export type ProgramWithWorkouts = Program & {
  workouts: (Workout & { exercises: Exercise[] })[];

  // New types for program exercises and tracking
export type ProgramExercise = Database["public"]["Tables"]["program_exercises"]["Row"];
export type ExercisePerformance = Database["public"]["Tables"]["exercise_performance"]["Row"];
export type WorkoutSession = Database["public"]["Tables"]["workout_session"]["Row"];

// Combined types
export type ProgramWithExercises = Program & {
  exercises?: ProgramExercise[];
};

export type ExerciseWithPerformance = ProgramExercise & {
  performances?: ExercisePerformance[];
};
};
