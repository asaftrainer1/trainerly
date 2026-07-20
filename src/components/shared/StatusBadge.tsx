import { Badge } from "@/components/ui/badge";
import type {
  ClientStatus,
  PaymentStatus,
  ProgramStatus,
  SessionStatus,
} from "@/types/database";

const clientMap: Record<ClientStatus, { label: string; variant: "success" | "warning" | "secondary" }> = {
  active: { label: "Active", variant: "success" },
  pending: { label: "Pending", variant: "warning" },
  inactive: { label: "Inactive", variant: "secondary" },
};

const paymentMap: Record<
  PaymentStatus,
  { label: string; variant: "success" | "warning" | "destructive" | "secondary" }
> = {
  paid: { label: "Paid", variant: "success" },
  pending: { label: "Pending", variant: "warning" },
  overdue: { label: "Overdue", variant: "destructive" },
  refunded: { label: "Refunded", variant: "secondary" },
};

const programMap: Record<
  ProgramStatus,
  { label: string; variant: "default" | "success" | "secondary" }
> = {
  draft: { label: "Draft", variant: "secondary" },
  active: { label: "Active", variant: "success" },
  completed: { label: "Completed", variant: "default" },
  archived: { label: "Archived", variant: "secondary" },
};

const sessionMap: Record<
  SessionStatus,
  { label: string; variant: "default" | "success" | "destructive" | "secondary" }
> = {
  scheduled: { label: "Scheduled", variant: "default" },
  completed: { label: "Completed", variant: "success" },
  cancelled: { label: "Cancelled", variant: "secondary" },
  no_show: { label: "No-show", variant: "destructive" },
};

export function ClientStatusBadge({ status }: { status: ClientStatus }) {
  const { label, variant } = clientMap[status];
  return <Badge variant={variant} dot>{label}</Badge>;
}

export function PaymentStatusBadge({ status }: { status: PaymentStatus }) {
  const { label, variant } = paymentMap[status];
  return <Badge variant={variant} dot>{label}</Badge>;
}

export function ProgramStatusBadge({ status }: { status: ProgramStatus }) {
  const { label, variant } = programMap[status];
  return <Badge variant={variant} dot>{label}</Badge>;
}

export function SessionStatusBadge({ status }: { status: SessionStatus }) {
  const { label, variant } = sessionMap[status];
  return <Badge variant={variant} dot>{label}</Badge>;
}
