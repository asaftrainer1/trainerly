import * as React from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  ArrowLeft,
  Pencil,
  Mail,
  Phone,
  Target,
  Ruler,
  Weight,
  Plus,
  TrendingDown,
  TrendingUp,
} from "lucide-react";
import { PageHeader } from "@/components/shared/PageHeader";
import { PageLoader } from "@/components/shared/LoadingSpinner";
import { EmptyState } from "@/components/shared/EmptyState";
import { ClientFormDialog } from "@/components/clients/ClientFormDialog";
import { ProgressChart } from "@/components/progress/ProgressChart";
import { ProgressEntryDialog } from "@/components/progress/ProgressEntryDialog";
import { ClientStatusBadge, PaymentStatusBadge } from "@/components/shared/StatusBadge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useClient } from "@/hooks/useClients";
import { useProgressEntries } from "@/hooks/useProgress";
import { useClientPayments } from "@/hooks/usePayments";
import { calculateAge, formatCurrency, formatDate, getInitials } from "@/lib/utils";
import { LineChart as LineChartIcon, Wallet } from "lucide-react";

export default function ClientDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { data: client, isLoading } = useClient(id);
  const { data: progress } = useProgressEntries(id);
  const { data: payments } = useClientPayments(id);

  const [editOpen, setEditOpen] = React.useState(false);
  const [progressOpen, setProgressOpen] = React.useState(false);

  if (isLoading) return <PageLoader label="Loading client" />;
  if (!client) {
    return (
      <EmptyState
        icon={LineChartIcon}
        title="Client not found"
        description="This client may have been removed."
        actionLabel="Back to clients"
        onAction={() => navigate("/clients")}
      />
    );
  }

  const weightDelta =
    client.starting_weight_kg && client.current_weight_kg
      ? client.current_weight_kg - client.starting_weight_kg
      : null;

  return (
    <div className="animate-fade-in">
      <button
        onClick={() => navigate("/clients")}
        className="mb-4 inline-flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4" />
        All clients
      </button>

      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex items-center gap-4">
          <Avatar className="h-16 w-16">
            <AvatarImage src={client.avatar_url ?? undefined} />
            <AvatarFallback className="text-lg">{getInitials(client.full_name)}</AvatarFallback>
          </Avatar>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-semibold tracking-tight">{client.full_name}</h1>
              <ClientStatusBadge status={client.status} />
            </div>
            <p className="mt-1 text-sm text-muted-foreground">
              {client.goal ?? "No goal set yet"}
            </p>
          </div>
        </div>
        <Button variant="outline" onClick={() => setEditOpen(true)}>
          <Pencil className="h-4 w-4" />
          Edit
        </Button>
      </div>

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <InfoTile icon={Weight} label="Current weight" value={client.current_weight_kg ? `${client.current_weight_kg} kg` : "—"} />
        <InfoTile
          icon={weightDelta && weightDelta < 0 ? TrendingDown : TrendingUp}
          label="Change"
          value={weightDelta !== null ? `${weightDelta > 0 ? "+" : ""}${weightDelta.toFixed(1)} kg` : "—"}
        />
        <InfoTile icon={Ruler} label="Height" value={client.height_cm ? `${client.height_cm} cm` : "—"} />
        <InfoTile
          icon={Target}
          label="Age"
          value={client.date_of_birth ? `${calculateAge(client.date_of_birth)}` : "—"}
        />
      </div>

      <Tabs defaultValue="overview" className="mt-6">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="progress">Progress</TabsTrigger>
          <TabsTrigger value="payments">Payments</TabsTrigger>
        </TabsList>

        <TabsContent value="overview">
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle>Notes</CardTitle>
              </CardHeader>
              <CardContent>
                {client.notes ? (
                  <p className="whitespace-pre-wrap text-sm leading-relaxed text-muted-foreground">
                    {client.notes}
                  </p>
                ) : (
                  <p className="text-sm text-muted-foreground">
                    No notes yet. Use edit to add injury history, preferences, or reminders.
                  </p>
                )}
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>Contact</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <ContactRow icon={Mail} value={client.email} href={client.email ? `mailto:${client.email}` : undefined} />
                <ContactRow icon={Phone} value={client.phone} href={client.phone ? `tel:${client.phone}` : undefined} />
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="progress">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <h3 className="text-sm font-semibold">Body measurements</h3>
              <p className="text-xs text-muted-foreground">Weight and measurements over time.</p>
            </div>
            <Button size="sm" onClick={() => setProgressOpen(true)}>
              <Plus className="h-4 w-4" />
              Log entry
            </Button>
          </div>
          {progress && progress.length > 0 ? (
            <ProgressChart entries={progress} />
          ) : (
            <EmptyState
              icon={LineChartIcon}
              title="No measurements yet"
              description="Log your client's first weigh-in to start tracking progress."
              actionLabel="Log entry"
              onAction={() => setProgressOpen(true)}
            />
          )}
        </TabsContent>

        <TabsContent value="payments">
          {payments && payments.length > 0 ? (
            <Card className="overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow className="hover:bg-transparent">
                    <TableHead>Invoice</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Due</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {payments.map((p) => (
                    <TableRow key={p.id}>
                      <TableCell className="font-mono text-xs text-muted-foreground">
                        {p.invoice_number}
                      </TableCell>
                      <TableCell className="font-medium tabular-nums">
                        {formatCurrency(Number(p.amount), p.currency)}
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {formatDate(p.due_date)}
                      </TableCell>
                      <TableCell>
                        <PaymentStatusBadge status={p.status} />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </Card>
          ) : (
            <EmptyState
              icon={Wallet}
              title="No payments recorded"
              description="Payments you log for this client will appear here."
            />
          )}
        </TabsContent>
      </Tabs>

      <ClientFormDialog open={editOpen} onOpenChange={setEditOpen} client={client} />
      <ProgressEntryDialog open={progressOpen} onOpenChange={setProgressOpen} clientId={client.id} />
    </div>
  );
}

function InfoTile({
  icon: Icon,
  label,
  value,
}: {
  icon: typeof Weight;
  label: string;
  value: string;
}) {
  return (
    <Card className="p-4">
      <div className="flex items-center gap-2 text-muted-foreground">
        <Icon className="h-4 w-4" />
        <span className="text-xs">{label}</span>
      </div>
      <p className="mt-2 text-lg font-semibold tabular-nums">{value}</p>
    </Card>
  );
}

function ContactRow({
  icon: Icon,
  value,
  href,
}: {
  icon: typeof Mail;
  value: string | null;
  href?: string;
}) {
  const content = (
    <div className="flex items-center gap-3">
      <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-secondary">
        <Icon className="h-4 w-4 text-muted-foreground" />
      </div>
      <span className="text-sm">{value ?? "Not provided"}</span>
    </div>
  );
  if (href && value) {
    return (
      <a href={href} className="block transition-opacity hover:opacity-80">
        {content}
      </a>
    );
  }
  return content;
}
