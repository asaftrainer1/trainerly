import * as React from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, Plus, Clock, CalendarDays } from "lucide-react";
import { PageLoader } from "@/components/shared/LoadingSpinner";
import { EmptyState } from "@/components/shared/EmptyState";
import { WorkoutCard } from "@/components/workouts/WorkoutCard";
import { ProgramStatusBadge } from "@/components/shared/StatusBadge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Dumbbell } from "lucide-react";
import {
  useProgram,
  useCreateWorkout,
  useUpdateProgram,
} from "@/hooks/useWorkouts";
import { useToast } from "@/hooks/use-toast";
import type { ProgramStatus } from "@/types/database";

export default function ProgramDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { data: program, isLoading } = useProgram(id);
  const createWorkout = useCreateWorkout();
  const updateProgram = useUpdateProgram();
  const { toast } = useToast();

  const [addingDay, setAddingDay] = React.useState(false);
  const [dayName, setDayName] = React.useState("");

  if (isLoading) return <PageLoader label="Loading program" />;
  if (!program) {
    return (
      <EmptyState
        icon={Dumbbell}
        title="Program not found"
        description="This program may have been removed."
        actionLabel="Back to programs"
        onAction={() => navigate("/programs")}
      />
    );
  }

  const handleAddDay = async (e: React.FormEvent) => {
    e.preventDefault();
    const name = dayName.trim() || `Day ${program.workouts.length + 1}`;
    try {
      await createWorkout.mutateAsync({
        program_id: program.id,
        name,
        day_index: program.workouts.length,
      });
      setDayName("");
      setAddingDay(false);
    } catch (err) {
      toast({
        variant: "destructive",
        title: "Couldn't add day",
        description: err instanceof Error ? err.message : "Please try again.",
      });
    }
  };

  const handleStatusChange = async (status: ProgramStatus) => {
    try {
      await updateProgram.mutateAsync({ id: program.id, status });
      toast({ title: "Status updated", description: `Program marked as ${status}.` });
    } catch (err) {
      toast({
        variant: "destructive",
        title: "Couldn't update status",
        description: err instanceof Error ? err.message : "Please try again.",
      });
    }
  };

  return (
    <div className="animate-fade-in">
      <button
        onClick={() => navigate("/programs")}
        className="mb-4 inline-flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4" />
        All programs
      </button>

      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-semibold tracking-tight">{program.name}</h1>
            <ProgramStatusBadge status={program.status} />
          </div>
          {program.description && (
            <p className="mt-1.5 max-w-2xl text-sm text-muted-foreground">
              {program.description}
            </p>
          )}
          <div className="mt-3 flex items-center gap-4 text-sm text-muted-foreground">
            <span className="flex items-center gap-1.5">
              <Clock className="h-4 w-4" />
              {program.duration_weeks} weeks
            </span>
            <span className="flex items-center gap-1.5">
              <CalendarDays className="h-4 w-4" />
              {program.workouts.length} training days
            </span>
          </div>
        </div>
        <Select value={program.status} onValueChange={(v) => handleStatusChange(v as ProgramStatus)}>
          <SelectTrigger className="w-40">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="draft">Draft</SelectItem>
            <SelectItem value="active">Active</SelectItem>
            <SelectItem value="completed">Completed</SelectItem>
            <SelectItem value="archived">Archived</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {program.workouts.length === 0 && !addingDay ? (
        <EmptyState
          icon={Dumbbell}
          title="No training days yet"
          description="Add your first day, then fill it with exercises."
          actionLabel="Add training day"
          onAction={() => setAddingDay(true)}
        />
      ) : (
        <div className="space-y-4">
          {program.workouts.map((workout) => (
            <WorkoutCard key={workout.id} workout={workout} programId={program.id} />
          ))}

          {addingDay ? (
            <form
              onSubmit={handleAddDay}
              className="flex items-center gap-2 rounded-xl border border-dashed border-border p-3"
            >
              <Input
                value={dayName}
                onChange={(e) => setDayName(e.target.value)}
                placeholder={`Day ${program.workouts.length + 1} — e.g. Upper Body`}
                className="flex-1"
                autoFocus
              />
              <Button type="submit" disabled={createWorkout.isPending}>
                Add day
              </Button>
              <Button
                type="button"
                variant="ghost"
                onClick={() => {
                  setAddingDay(false);
                  setDayName("");
                }}
              >
                Cancel
              </Button>
            </form>
          ) : (
            <Button variant="outline" className="w-full" onClick={() => setAddingDay(true)}>
              <Plus className="h-4 w-4" />
              Add training day
            </Button>
          )}
        </div>
      )}
    </div>
  );
}
