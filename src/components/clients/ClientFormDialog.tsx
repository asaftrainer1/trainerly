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
import { useCreateClient, useUpdateClient } from "@/hooks/useClients";
import { useToast } from "@/hooks/use-toast";
import type { Client, ClientStatus } from "@/types/database";

interface ClientFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  client?: Client;
}

export function ClientFormDialog({ open, onOpenChange, client }: ClientFormDialogProps) {
  const isEdit = !!client;
  const createClient = useCreateClient();
  const updateClient = useUpdateClient();
  const { toast } = useToast();

  const [form, setForm] = React.useState({
    full_name: "",
    email: "",
    phone: "",
    goal: "",
    status: "active" as ClientStatus,
    starting_weight_kg: "",
    height_cm: "",
    notes: "",
  });

  React.useEffect(() => {
    if (open) {
      setForm({
        full_name: client?.full_name ?? "",
        email: client?.email ?? "",
        phone: client?.phone ?? "",
        goal: client?.goal ?? "",
        status: client?.status ?? "active",
        starting_weight_kg: client?.starting_weight_kg?.toString() ?? "",
        height_cm: client?.height_cm?.toString() ?? "",
        notes: client?.notes ?? "",
      });
    }
  }, [open, client]);

  const isPending = createClient.isPending || updateClient.isPending;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const payload = {
      full_name: form.full_name.trim(),
      email: form.email.trim() || null,
      phone: form.phone.trim() || null,
      goal: form.goal.trim() || null,
      status: form.status,
      starting_weight_kg: form.starting_weight_kg ? Number(form.starting_weight_kg) : null,
      current_weight_kg: isEdit
        ? client?.current_weight_kg ?? null
        : form.starting_weight_kg
        ? Number(form.starting_weight_kg)
        : null,
      height_cm: form.height_cm ? Number(form.height_cm) : null,
      notes: form.notes.trim() || null,
    };

    try {
      if (isEdit && client) {
        await updateClient.mutateAsync({ id: client.id, ...payload });
        toast({ title: "Client updated", description: `${payload.full_name}'s details are saved.` });
      } else {
        await createClient.mutateAsync(payload);
        toast({ title: "Client added", description: `${payload.full_name} is now on your roster.` });
      }
      onOpenChange(false);
    } catch (err) {
      toast({
        variant: "destructive",
        title: "Couldn't save client",
        description: err instanceof Error ? err.message : "Please try again.",
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{isEdit ? "Edit client" : "Add a client"}</DialogTitle>
          <DialogDescription>
            {isEdit
              ? "Update the details for this client."
              : "Add someone to your roster. You can fill in the rest later."}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="full_name">Full name</Label>
            <Input
              id="full_name"
              value={form.full_name}
              onChange={(e) => setForm((f) => ({ ...f, full_name: e.target.value }))}
              placeholder="Alex Morgan"
              required
            />
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={form.email}
                onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
                placeholder="alex@example.com"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="phone">Phone</Label>
              <Input
                id="phone"
                value={form.phone}
                onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))}
                placeholder="+1 555 000 0000"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="goal">Primary goal</Label>
            <Input
              id="goal"
              value={form.goal}
              onChange={(e) => setForm((f) => ({ ...f, goal: e.target.value }))}
              placeholder="Build strength, lose 5kg, run a 10k…"
            />
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <div className="space-y-1.5">
              <Label htmlFor="status">Status</Label>
              <Select
                value={form.status}
                onValueChange={(v) => setForm((f) => ({ ...f, status: v as ClientStatus }))}
              >
                <SelectTrigger id="status">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="weight">Weight (kg)</Label>
              <Input
                id="weight"
                type="number"
                step="0.1"
                value={form.starting_weight_kg}
                onChange={(e) => setForm((f) => ({ ...f, starting_weight_kg: e.target.value }))}
                placeholder="72.5"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="height">Height (cm)</Label>
              <Input
                id="height"
                type="number"
                step="0.1"
                value={form.height_cm}
                onChange={(e) => setForm((f) => ({ ...f, height_cm: e.target.value }))}
                placeholder="178"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="notes">Notes</Label>
            <Textarea
              id="notes"
              value={form.notes}
              onChange={(e) => setForm((f) => ({ ...f, notes: e.target.value }))}
              placeholder="Injury history, preferences, anything worth remembering…"
              rows={3}
            />
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={isPending || !form.full_name.trim()}>
              {isPending && <Loader2 className="h-4 w-4 animate-spin" />}
              {isEdit ? "Save changes" : "Add client"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
