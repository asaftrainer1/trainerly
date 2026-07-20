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
import { useAddProgressEntry } from "@/hooks/useProgress";
import { useToast } from "@/hooks/use-toast";

interface ProgressEntryDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  clientId: string;
}

const fields: { key: string; label: string; unit: string }[] = [
  { key: "weight_kg", label: "Weight", unit: "kg" },
  { key: "body_fat_pct", label: "Body fat", unit: "%" },
  { key: "chest_cm", label: "Chest", unit: "cm" },
  { key: "waist_cm", label: "Waist", unit: "cm" },
  { key: "hips_cm", label: "Hips", unit: "cm" },
  { key: "arm_cm", label: "Arm", unit: "cm" },
];

export function ProgressEntryDialog({ open, onOpenChange, clientId }: ProgressEntryDialogProps) {
  const addEntry = useAddProgressEntry();
  const { toast } = useToast();

  const [date, setDate] = React.useState(() => new Date().toISOString().slice(0, 10));
  const [values, setValues] = React.useState<Record<string, string>>({});
  const [notes, setNotes] = React.useState("");

  React.useEffect(() => {
    if (open) {
      setDate(new Date().toISOString().slice(0, 10));
      setValues({});
      setNotes("");
    }
  }, [open]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const payload: Record<string, number | string | null> = { client_id: clientId, date };
    for (const { key } of fields) {
      payload[key] = values[key] ? Number(values[key]) : null;
    }
    payload.notes = notes.trim() || null;

    try {
      await addEntry.mutateAsync(payload as never);
      toast({ title: "Entry logged", description: "Progress has been recorded." });
      onOpenChange(false);
    } catch (err) {
      toast({
        variant: "destructive",
        title: "Couldn't save entry",
        description: err instanceof Error ? err.message : "Please try again.",
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Log progress</DialogTitle>
          <DialogDescription>
            Record a weigh-in and measurements. Leave any field blank to skip it.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="date">Date</Label>
            <Input id="date" type="date" value={date} onChange={(e) => setDate(e.target.value)} required />
          </div>

          <div className="grid grid-cols-2 gap-3">
            {fields.map(({ key, label, unit }) => (
              <div key={key} className="space-y-1.5">
                <Label htmlFor={key}>
                  {label} <span className="text-muted-foreground">({unit})</span>
                </Label>
                <Input
                  id={key}
                  type="number"
                  step="0.1"
                  value={values[key] ?? ""}
                  onChange={(e) => setValues((v) => ({ ...v, [key]: e.target.value }))}
                  placeholder="—"
                />
              </div>
            ))}
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="notes">Notes</Label>
            <Textarea
              id="notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="How did they feel? Any observations?"
              rows={2}
            />
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={addEntry.isPending}>
              {addEntry.isPending && <Loader2 className="h-4 w-4 animate-spin" />}
              Save entry
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
