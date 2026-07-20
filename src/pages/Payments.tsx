import * as React from "react";
import {
  Plus,
  Wallet,
  MoreHorizontal,
  Check,
  Trash2,
  TrendingUp,
  Clock,
  AlertCircle,
} from "lucide-react";
import { PageHeader } from "@/components/shared/PageHeader";
import { EmptyState } from "@/components/shared/EmptyState";
import { PaymentFormDialog } from "@/components/payments/PaymentFormDialog";
import { PaymentStatusBadge } from "@/components/shared/StatusBadge";
import { StatCard } from "@/components/dashboard/StatCard";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { usePayments, useUpdatePayment, useDeletePayment } from "@/hooks/usePayments";
import { useToast } from "@/hooks/use-toast";
import { formatCurrency, formatDate, getInitials } from "@/lib/utils";
import type { PaymentStatus } from "@/types/database";

export default function Payments() {
  const { data: payments, isLoading } = usePayments();
  const updatePayment = useUpdatePayment();
  const deletePayment = useDeletePayment();
  const { toast } = useToast();

  const [dialogOpen, setDialogOpen] = React.useState(false);
  const [statusFilter, setStatusFilter] = React.useState<PaymentStatus | "all">("all");

  const summary = React.useMemo(() => {
    const all = payments ?? [];
    const now = new Date();
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const collected = all
      .filter((p) => p.status === "paid" && new Date(p.due_date) >= monthStart)
      .reduce((s, p) => s + Number(p.amount), 0);
    const pending = all
      .filter((p) => p.status === "pending")
      .reduce((s, p) => s + Number(p.amount), 0);
    const overdue = all
      .filter((p) => p.status === "overdue")
      .reduce((s, p) => s + Number(p.amount), 0);
    return { collected, pending, overdue };
  }, [payments]);

  const filtered = React.useMemo(
    () =>
      (payments ?? []).filter((p) => statusFilter === "all" || p.status === statusFilter),
    [payments, statusFilter]
  );

  const markPaid = async (id: string) => {
    try {
      await updatePayment.mutateAsync({
        id,
        status: "paid",
        paid_date: new Date().toISOString().slice(0, 10),
      });
      toast({ title: "Marked as paid" });
    } catch (err) {
      toast({
        variant: "destructive",
        title: "Couldn't update",
        description: err instanceof Error ? err.message : "Please try again.",
      });
    }
  };

  return (
    <div className="animate-fade-in">
      <PageHeader
        title="Payments"
        description="Track invoices, collections, and what's outstanding."
        actions={
          <Button onClick={() => setDialogOpen(true)}>
            <Plus className="h-4 w-4" />
            Record payment
          </Button>
        }
      />

      <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
        <StatCard
          label="Collected this month"
          value={formatCurrency(summary.collected)}
          icon={TrendingUp}
          accent="success"
          isLoading={isLoading}
        />
        <StatCard
          label="Pending"
          value={formatCurrency(summary.pending)}
          icon={Clock}
          accent="warning"
          isLoading={isLoading}
        />
        <StatCard
          label="Overdue"
          value={formatCurrency(summary.overdue)}
          icon={AlertCircle}
          accent="warning"
          isLoading={isLoading}
        />
      </div>

      <div className="mb-4 flex items-center justify-between">
        <Select value={statusFilter} onValueChange={(v) => setStatusFilter(v as PaymentStatus | "all")}>
          <SelectTrigger className="w-40">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All payments</SelectItem>
            <SelectItem value="paid">Paid</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="overdue">Overdue</SelectItem>
            <SelectItem value="refunded">Refunded</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {isLoading ? (
        <Card className="overflow-hidden">
          <div className="divide-y divide-border">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="flex items-center gap-3 p-4">
                <Skeleton className="h-9 w-9 rounded-full" />
                <Skeleton className="h-4 w-32 flex-1" />
                <Skeleton className="h-4 w-16" />
                <Skeleton className="h-6 w-16 rounded-full" />
              </div>
            ))}
          </div>
        </Card>
      ) : filtered.length === 0 ? (
        <EmptyState
          icon={Wallet}
          title={statusFilter === "all" ? "No payments yet" : "No matching payments"}
          description={
            statusFilter === "all"
              ? "Record your first invoice to start tracking revenue."
              : "Try a different filter."
          }
          actionLabel={statusFilter === "all" ? "Record payment" : undefined}
          onAction={statusFilter === "all" ? () => setDialogOpen(true) : undefined}
        />
      ) : (
        <Card className="overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow className="hover:bg-transparent">
                <TableHead>Client</TableHead>
                <TableHead className="hidden md:table-cell">Description</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead className="hidden sm:table-cell">Due</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="w-10" />
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((payment) => (
                <TableRow key={payment.id}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <Avatar className="h-8 w-8">
                        <AvatarImage src={payment.clients?.avatar_url ?? undefined} />
                        <AvatarFallback className="text-xs">
                          {getInitials(payment.clients?.full_name ?? "?")}
                        </AvatarFallback>
                      </Avatar>
                      <span className="text-sm font-medium">
                        {payment.clients?.full_name ?? "Unknown"}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell className="hidden max-w-[220px] md:table-cell">
                    <span className="line-clamp-1 text-sm text-muted-foreground">
                      {payment.description ?? "—"}
                    </span>
                  </TableCell>
                  <TableCell className="font-medium tabular-nums">
                    {formatCurrency(Number(payment.amount), payment.currency)}
                  </TableCell>
                  <TableCell className="hidden text-sm text-muted-foreground sm:table-cell">
                    {formatDate(payment.due_date)}
                  </TableCell>
                  <TableCell>
                    <PaymentStatusBadge status={payment.status} />
                  </TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        {payment.status !== "paid" && (
                          <DropdownMenuItem onClick={() => markPaid(payment.id)}>
                            <Check className="mr-2 h-4 w-4" />
                            Mark as paid
                          </DropdownMenuItem>
                        )}
                        <DropdownMenuItem
                          className="text-destructive focus:text-destructive"
                          onClick={() => deletePayment.mutate(payment.id)}
                        >
                          <Trash2 className="mr-2 h-4 w-4" />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Card>
      )}

      <PaymentFormDialog open={dialogOpen} onOpenChange={setDialogOpen} />
    </div>
  );
}
