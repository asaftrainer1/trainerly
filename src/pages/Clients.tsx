import * as React from "react";
import { useNavigate } from "react-router-dom";
import { Plus, Search, Users, MoreHorizontal, Pencil, Trash2 } from "lucide-react";
import { PageHeader } from "@/components/shared/PageHeader";
import { EmptyState } from "@/components/shared/EmptyState";
import { ClientFormDialog } from "@/components/clients/ClientFormDialog";
import { ClientStatusBadge } from "@/components/shared/StatusBadge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
import { useClients, useDeleteClient } from "@/hooks/useClients";
import { useToast } from "@/hooks/use-toast";
import { formatCurrency, getInitials } from "@/lib/utils";
import type { Client, ClientStatus } from "@/types/database";

export default function Clients() {
  const navigate = useNavigate();
  const { data: clients, isLoading, isError } = useClients();
  const deleteClient = useDeleteClient();
  const { toast } = useToast();

  const [search, setSearch] = React.useState("");
  const [statusFilter, setStatusFilter] = React.useState<ClientStatus | "all">("all");
  const [dialogOpen, setDialogOpen] = React.useState(false);
  const [editing, setEditing] = React.useState<Client | undefined>();
  const [deleteTarget, setDeleteTarget] = React.useState<Client | undefined>();

  const filtered = React.useMemo(() => {
    if (!clients) return [];
    return clients.filter((c) => {
      const matchesSearch =
        c.full_name.toLowerCase().includes(search.toLowerCase()) ||
        (c.email?.toLowerCase().includes(search.toLowerCase()) ?? false);
      const matchesStatus = statusFilter === "all" || c.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [clients, search, statusFilter]);

  const handleAdd = () => {
    setEditing(undefined);
    setDialogOpen(true);
  };

  const handleEdit = (client: Client) => {
    setEditing(client);
    setDialogOpen(true);
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      await deleteClient.mutateAsync(deleteTarget.id);
      toast({ title: "Client removed", description: `${deleteTarget.full_name} was deleted.` });
    } catch (err) {
      toast({
        variant: "destructive",
        title: "Couldn't delete client",
        description: err instanceof Error ? err.message : "Please try again.",
      });
    } finally {
      setDeleteTarget(undefined);
    }
  };

  return (
    <div className="animate-fade-in">
      <PageHeader
        title="Clients"
        description="Everyone you're currently coaching."
        actions={
          <Button onClick={handleAdd}>
            <Plus className="h-4 w-4" />
            Add client
          </Button>
        }
      />

      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search by name or email"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
        <Select value={statusFilter} onValueChange={(v) => setStatusFilter(v as ClientStatus | "all")}>
          <SelectTrigger className="w-full sm:w-40">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All statuses</SelectItem>
            <SelectItem value="active">Active</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="inactive">Inactive</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {isLoading ? (
        <Card className="overflow-hidden">
          <div className="divide-y divide-border">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="flex items-center gap-3 p-4">
                <Skeleton className="h-10 w-10 rounded-full" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-4 w-40" />
                  <Skeleton className="h-3 w-28" />
                </div>
                <Skeleton className="h-6 w-16 rounded-full" />
              </div>
            ))}
          </div>
        </Card>
      ) : isError ? (
        <EmptyState
          icon={Users}
          title="Couldn't load clients"
          description="There was a problem reaching the server. Refresh to try again."
        />
      ) : filtered.length === 0 ? (
        <EmptyState
          icon={Users}
          title={search || statusFilter !== "all" ? "No matches" : "No clients yet"}
          description={
            search || statusFilter !== "all"
              ? "Try adjusting your search or filter."
              : "Add your first client to start building programs and tracking progress."
          }
          actionLabel={search || statusFilter !== "all" ? undefined : "Add client"}
          onAction={search || statusFilter !== "all" ? undefined : handleAdd}
        />
      ) : (
        <Card className="overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow className="hover:bg-transparent">
                <TableHead>Client</TableHead>
                <TableHead className="hidden md:table-cell">Goal</TableHead>
                <TableHead className="hidden sm:table-cell">Status</TableHead>
                <TableHead className="hidden lg:table-cell">Weight</TableHead>
                <TableHead className="w-10" />
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((client) => (
                <TableRow
                  key={client.id}
                  className="cursor-pointer"
                  onClick={() => navigate(`/clients/${client.id}`)}
                >
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <Avatar className="h-9 w-9">
                        <AvatarImage src={client.avatar_url ?? undefined} />
                        <AvatarFallback>{getInitials(client.full_name)}</AvatarFallback>
                      </Avatar>
                      <div className="min-w-0">
                        <p className="truncate text-sm font-medium">{client.full_name}</p>
                        <p className="truncate text-xs text-muted-foreground">
                          {client.email ?? "No email"}
                        </p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="hidden max-w-[220px] md:table-cell">
                    <span className="line-clamp-1 text-sm text-muted-foreground">
                      {client.goal ?? "—"}
                    </span>
                  </TableCell>
                  <TableCell className="hidden sm:table-cell">
                    <ClientStatusBadge status={client.status} />
                  </TableCell>
                  <TableCell className="hidden lg:table-cell">
                    <span className="text-sm tabular-nums text-muted-foreground">
                      {client.current_weight_kg ? `${client.current_weight_kg} kg` : "—"}
                    </span>
                  </TableCell>
                  <TableCell onClick={(e) => e.stopPropagation()}>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => handleEdit(client)}>
                          <Pencil className="mr-2 h-4 w-4" />
                          Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          className="text-destructive focus:text-destructive"
                          onClick={() => setDeleteTarget(client)}
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

      <ClientFormDialog open={dialogOpen} onOpenChange={setDialogOpen} client={editing} />

      <AlertDialog open={!!deleteTarget} onOpenChange={(o) => !o && setDeleteTarget(undefined)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete {deleteTarget?.full_name}?</AlertDialogTitle>
            <AlertDialogDescription>
              This permanently removes the client along with their programs, progress entries, and
              payment history. This can't be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete}>Delete client</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
