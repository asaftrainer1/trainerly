import * as React from "react";
import { Plus, Trash2, Dumbbell } from "lucide-react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ExerciseRow } from "@/components/workouts/ExerciseRow";
import { useCreateExercise, useDeleteWorkout } from "@/hooks/useWorkouts";
import { useToast } from "@/hooks/use-toast";
import type { Exercise, Workout } from "@/types/database";

export function WorkoutCard({
  workout,
  programId,
}: {
  workout: Workout & { exercises: Exercise[] };
  programId: string;
}) {
  const createExercise = useCreateExercise();
  const deleteWorkout = useDeleteWorkout();
  const { toast } = useToast();

  const [adding, setAdding] = React.useState(false);
  const [name, setName] = React.useState("");
  const [sets, setSets] = React.useState("3");
  const [reps, setReps] = React.useState("8-12");
  const [weight, setWeight] = React.useState("");

  const resetForm = () => {
    setName("");
    setSets("3");
    setReps("8-12");
    setWeight("");
  };

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    try {
      await createExercise.mutateAsync({
        workout_id: workout.id,
        program_id: programId,
        name: name.trim(),
        sets: Number(sets) || 3,
        reps: reps.trim() || "8-12",
        weight_kg: weight ? Number(weight) : null,
        order_index: workout.exercises.length,
      });
      resetForm();
    } catch (err) {
      toast({
        variant: "destructive",
        title: "Couldn't add exercise",
        description: err instanceof Error ? err.message : "Please try again.",
      });
    }
  };

  return (
    <Card>
      <CardHeader className="flex-row items-center justify-between space-y-0 pb-2">
        <div className="flex items-center gap-2.5">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-secondary">
            <Dumbbell className="h-4 w-4 text-muted-foreground" />
          </div>
          <div>
            <h3 className="text-sm font-semibold">{workout.name}</h3>
            <p className="text-xs text-muted-foreground">
              {workout.exercises.length}{" "}
              {workout.exercises.length === 1 ? "exercise" : "exercises"}
            </p>
          </div>
        </div>
        <Button
          size="icon"
          variant="ghost"
          className="h-8 w-8"
          onClick={() => deleteWorkout.mutate({ id: workout.id, program_id: programId })}
        >
          <Trash2 className="h-4 w-4 text-muted-foreground" />
        </Button>
      </CardHeader>
      <CardContent className="pt-0">
        {workout.exercises.length > 0 && (
          <div className="mb-2 flex items-center gap-4 px-3 text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
            <span className="flex-1">Exercise</span>
            <span className="w-12 text-center">Sets×Reps</span>
            <span className="w-16 text-right">Load</span>
            <span className="w-8" />
          </div>
        )}
        <div className="space-y-0.5">
          {workout.exercises.map((exercise) => (
            <ExerciseRow key={exercise.id} exercise={exercise} programId={programId} />
          ))}
        </div>

        {adding ? (
          <form
            onSubmit={handleAdd}
            className="mt-2 flex flex-wrap items-center gap-2 rounded-lg border border-border bg-secondary/40 p-2"
          >
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Exercise name"
              className="h-8 min-w-[140px] flex-1"
              autoFocus
            />
            <Input
              value={sets}
              onChange={(e) => setSets(e.target.value)}
              placeholder="Sets"
              className="h-8 w-14 text-center"
            />
            <Input
              value={reps}
              onChange={(e) => setReps(e.target.value)}
              placeholder="Reps"
              className="h-8 w-20 text-center"
            />
            <Input
              value={weight}
              onChange={(e) => setWeight(e.target.value)}
              placeholder="kg"
              className="h-8 w-16 text-center"
            />
            <Button type="submit" size="sm" disabled={createExercise.isPending || !name.trim()}>
              Add
            </Button>
            <Button
              type="button"
              size="sm"
              variant="ghost"
              onClick={() => {
                setAdding(false);
                resetForm();
              }}
            >
              Done
            </Button>
          </form>
        ) : (
          <Button
            variant="ghost"
            size="sm"
            className="mt-2 w-full justify-start text-muted-foreground"
            onClick={() => setAdding(true)}
          >
            <Plus className="h-4 w-4" />
            Add exercise
          </Button>
        )}
      </CardContent>
    </Card>
  );
}
