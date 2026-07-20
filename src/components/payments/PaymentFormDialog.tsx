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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useCreatePayment } from "@/hooks/usePayments";
import { useClients } from "@/hooks/useClients";
import { useToast } from "@/hooks/use-toast";
import type { PaymentStatus } from "@/types/database";

interface PaymentFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function PaymentFormDialog({ open, onOpenChange }: PaymentFormDialogProps) {
  const createPayment = useCreatePayment();
  const { data: clients } = useClients();
  const { toast } = useToast();

  const [clientId, setClientId] = React.useState("");
  const [amount, setAmount] = React.useState("");
  const [status, setStatus] = React.useState<PaymentStatus>("pending");
  const [dueDate, setDueDate] = React.useState(() => new Date().toISOString().slice(0, 10));
  const [description, setDescription] = React.useState("");

  React.useEffect(() => {
    if (open) {
      setClientId("");
      setAmount("");
      setStatus("pending");
      setDueDate(new Date().toISOString().slice(0, 10));
      setDescription("");
    }
  }, [open]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!clientId || !amount) return;
    try {
      await createPayment.mutateAsync({
        client_id: clientId,
        amount: Number(amount),
        status,
        due_date: dueDate,
        paid_date: status === "paid" ? new Date().toISOString().slice(0, 10) : null,
        description: description.trim() || null,
      });
      toast({ title: "Payment recorded", description: "The invoice has been logged." });
      onOpenChange(false);
    } catch (err) {
      toast({
        variant: "destructive",
        title: "Couldn't record payment",
        description: err instanceof Error ? err.message : "Please try again.",
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Record a payment</DialogTitle>
          <DialogDescription>Log an invoice or a received payment.</DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="client">Client</Label>
            <Select value={clientId} onValueChange={setClientId}>
              <SelectTrigger id="client">
                <SelectValue placeholder="Select a client" />
              </SelectTrigger>
              <SelectContent>
                {(clients ?? []).map((c) => (
                  <SelectItem key={c.id} value={c.id}>
                    {c.full_name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="amount">Amount</Label>
              <Input
                id="amount"
                type="number"
                step="0.01"
                min="0"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="250"
                required
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="status">Status</Label>
              <Select value={status} onValueChange={(v) => setStatus(v as PaymentStatus)}>
                <SelectTrigger id="status">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="paid">Paid</SelectItem>
                  <SelectItem value="overdue">Overdue</SelectItem>
                  <SelectItem value="refunded">Refunded</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="due">Due date</Label>
            <Input
              id="due"
              type="date"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
              required
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="description">Description</Label>
            <Input
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Monthly coaching — August"
            />
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={createPayment.isPending || !clientId || !amount}>
              {createPayment.isPending && <Loader2 className="h-4 w-4 animate-spin" />}
              Record payment
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
