import * as React from "react";
import { useNavigate } from "react-router-dom";
import { Plus, Dumbbell, Clock, MoreHorizontal, Trash2, ArrowRight } from "lucide-react";
import { PageHeader } from "@/components/shared/PageHeader";
import { EmptyState } from "@/components/shared/EmptyState";
import { ProgramFormDialog } from "@/components/workouts/ProgramFormDialog";
import { ProgramStatusBadge } from "@/components/shared/StatusBadge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { usePrograms, useDeleteProgram } from "@/hooks/useWorkouts";
import { useToast } from "@/hooks/use-toast";
import { getInitials } from "@/lib/utils";

export default function Programs() {
  const navigate = useNavigate();
  const { data: programs, isLoading } = usePrograms();
  const deleteProgram = useDeleteProgram();
  const { toast } = useToast();

  const [dialogOpen, setDialogOpen] = React.useState(false);
  const [deleteTarget, setDeleteTarget] = React.useState<{ id: string; name: string } | null>(null);

  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      await deleteProgram.mutateAsync(deleteTarget.id);
      toast({ title: "Program deleted", description: `"${deleteTarget.name}" was removed.` });
    } catch (err) {
      toast({
        variant: "destructive",
        title: "Couldn't delete program",
        description: err instanceof Error ? err.message : "Please try again.",
      });
    } finally {
      setDeleteTarget(null);
    }
  };

  return (
    <div className="animate-fade-in">
      <PageHeader
        title="Programming"
        description="Build training blocks and assign them to clients."
        actions={
          <Button onClick={() => setDialogOpen(true)}>
            <Plus className="h-4 w-4" />
            New program
          </Button>
        }
      />

      {isLoading ? (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <Card key={i} className="p-5">
              <Skeleton className="h-5 w-3/4" />
              <Skeleton className="mt-3 h-4 w-full" />
              <Skeleton className="mt-2 h-4 w-2/3" />
              <Skeleton className="mt-4 h-8 w-full" />
            </Card>
          ))}
        </div>
      ) : !programs || programs.length === 0 ? (
        <EmptyState
          icon={Dumbbell}
          title="No programs yet"
          description="Create your first training program to start assigning workouts to clients."
          actionLabel="New program"
          onAction={() => setDialogOpen(true)}
        />
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {programs.map((program) => (
            <Card
              key={program.id}
              className="group flex cursor-pointer flex-col transition-all hover:border-primary/30 hover:shadow-premium"
              onClick={() => navigate(`/programs/${program.id}`)}
            >
              <CardHeader className="flex-row items-start justify-between space-y-0 pb-3">
                <div className="min-w-0 flex-1">
                  <div className="mb-2 flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10">
                    <Dumbbell className="h-[18px] w-[18px] text-primary" />
                  </div>
                  <h3 className="truncate font-semibold">{program.name}</h3>
                </div>
                <div onClick={(e) => e.stopPropagation()}>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-8 w-8 -mr-1 -mt-1">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem
                        className="text-destructive focus:text-destructive"
                        onClick={() => setDeleteTarget({ id: program.id, name: program.name })}
                      >
                        <Trash2 className="mr-2 h-4 w-4" />
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </CardHeader>
              <CardContent className="flex flex-1 flex-col justify-between">
                <p className="line-clamp-2 text-sm text-muted-foreground">
                  {program.description ?? "No description."}
                </p>
                <div className="mt-4 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <ProgramStatusBadge status={program.status} />
                    <span className="flex items-center gap-1 text-xs text-muted-foreground">
                      <Clock className="h-3 w-3" />
                      {program.duration_weeks}w
                    </span>
                  </div>
                  {program.clients ? (
                    <div className="flex items-center gap-1.5">
                      <Avatar className="h-6 w-6">
                        <AvatarImage src={program.clients.avatar_url ?? undefined} />
                        <AvatarFallback className="text-[10px]">
                          {getInitials(program.clients.full_name)}
                        </AvatarFallback>
                      </Avatar>
                    </div>
                  ) : (
                    <span className="text-xs text-muted-foreground">Template</span>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <ProgramFormDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        onCreated={(id) => navigate(`/programs/${id}`)}
      />

      <AlertDialog open={!!deleteTarget} onOpenChange={(o) => !o && setDeleteTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete "{deleteTarget?.name}"?</AlertDialogTitle>
            <AlertDialogDescription>
              This removes the program and all its workouts and exercises. This can't be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete}>Delete program</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
