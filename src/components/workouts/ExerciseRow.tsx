import * as React from "react";
import { Trash2, Check, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useUpdateExercise, useDeleteExercise } from "@/hooks/useWorkouts";
import { useToast } from "@/hooks/use-toast";
import type { Exercise } from "@/types/database";

export function ExerciseRow({
  exercise,
  programId,
}: {
  exercise: Exercise;
  programId: string;
}) {
  const updateExercise = useUpdateExercise();
  const deleteExercise = useDeleteExercise();
  const { toast } = useToast();

  const [editing, setEditing] = React.useState(false);
  const [draft, setDraft] = React.useState({
    name: exercise.name,
    sets: String(exercise.sets),
    reps: exercise.reps,
    weight_kg: exercise.weight_kg?.toString() ?? "",
  });

  const save = async () => {
    try {
      await updateExercise.mutateAsync({
        id: exercise.id,
        program_id: programId,
        name: draft.name.trim() || exercise.name,
        sets: Number(draft.sets) || exercise.sets,
        reps: draft.reps.trim() || exercise.reps,
        weight_kg: draft.weight_kg ? Number(draft.weight_kg) : null,
      });
      setEditing(false);
    } catch (err) {
      toast({
        variant: "destructive",
        title: "Couldn't save",
        description: err instanceof Error ? err.message : "Please try again.",
      });
    }
  };

  if (editing) {
    return (
      <div className="flex items-center gap-2 rounded-lg border border-primary/30 bg-secondary/40 p-2">
        <Input
          value={draft.name}
          onChange={(e) => setDraft((d) => ({ ...d, name: e.target.value }))}
          className="h-8 flex-1"
          placeholder="Exercise"
          autoFocus
        />
        <Input
          value={draft.sets}
          onChange={(e) => setDraft((d) => ({ ...d, sets: e.target.value }))}
          className="h-8 w-14 text-center"
          placeholder="Sets"
        />
        <Input
          value={draft.reps}
          onChange={(e) => setDraft((d) => ({ ...d, reps: e.target.value }))}
          className="h-8 w-20 text-center"
          placeholder="Reps"
        />
        <Input
          value={draft.weight_kg}
          onChange={(e) => setDraft((d) => ({ ...d, weight_kg: e.target.value }))}
          className="h-8 w-20 text-center"
          placeholder="kg"
        />
        <Button size="icon" className="h-8 w-8" onClick={save} disabled={updateExercise.isPending}>
          <Check className="h-4 w-4" />
        </Button>
        <Button size="icon" variant="ghost" className="h-8 w-8" onClick={() => setEditing(false)}>
          <X className="h-4 w-4" />
        </Button>
      </div>
    );
  }

  return (
    <div className="group flex items-center gap-3 rounded-lg px-3 py-2.5 transition-colors hover:bg-secondary/50">
      <button className="flex-1 text-left" onClick={() => setEditing(true)}>
        <p className="text-sm font-medium">{exercise.name}</p>
      </button>
      <div className="flex items-center gap-4 text-sm tabular-nums text-muted-foreground">
        <span className="w-12 text-center">
          {exercise.sets}×{exercise.reps}
        </span>
        <span className="w-16 text-right">
          {exercise.weight_kg ? `${exercise.weight_kg} kg` : "—"}
        </span>
      </div>
      <Button
        size="icon"
        variant="ghost"
        className="h-8 w-8 opacity-0 transition-opacity group-hover:opacity-100"
        onClick={() =>
          deleteExercise.mutate({ id: exercise.id, program_id: programId })
        }
      >
        <Trash2 className="h-4 w-4 text-muted-foreground" />
      </Button>
    </div>
  );
}
