import * as React from "react";
import { Loader2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useCreateProgram } from "@/hooks/useWorkouts";
import { useClients } from "@/hooks/useClients";
import { useToast } from "@/hooks/use-toast";

interface ProgramFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCreated?: (programId: string) => void;
}

export function ProgramFormDialog({ open, onOpenChange, onCreated }: ProgramFormDialogProps) {
  const createProgram = useCreateProgram();
  const { data: clients } = useClients();
  const { toast } = useToast();

  const [name, setName] = React.useState("");
  const [description, setDescription] = React.useState("");
  const [durationWeeks, setDurationWeeks] = React.useState("8");
  const [clientId, setClientId] = React.useState<string>("none");

  React.useEffect(() => {
    if (open) {
      setName("");
      setDescription("");
      setDurationWeeks("8");
      setClientId("none");
    }
  }, [open]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const program = await createProgram.mutateAsync({
        name: name.trim(),
        description: description.trim() || null,
        duration_weeks: Number(durationWeeks) || 4,
        client_id: clientId === "none" ? null : clientId,
        status: "draft",
      });
      toast({ title: "Program created", description: `"${program.name}" is ready to build.` });
      onOpenChange(false);
      onCreated?.(program.id);
    } catch (err) {
      toast({
        variant: "destructive",
        title: "Couldn't create program",
        description: err instanceof Error ? err.message : "Please try again.",
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>New program</DialogTitle>
          <DialogDescription>
            Start a training block. Assign it to a client now or keep it as a reusable template.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="name">Program name</Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="12-Week Strength Base"
              required
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Focus, split, progression scheme…"
              rows={2}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="duration">Duration (weeks)</Label>
              <Input
                id="duration"
                type="number"
                min="1"
                value={durationWeeks}
                onChange={(e) => setDurationWeeks(e.target.value)}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="client">Assign to</Label>
              <Select value={clientId} onValueChange={setClientId}>
                <SelectTrigger id="client">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">Template (unassigned)</SelectItem>
                  {(clients ?? []).map((c) => (
                    <SelectItem key={c.id} value={c.id}>
                      {c.full_name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={createProgram.isPending || !name.trim()}>
              {createProgram.isPending && <Loader2 className="h-4 w-4 animate-spin" />}
              Create program
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
