import * as React from "react";
import { useNavigate } from "react-router-dom";
import { LineChart, ChevronRight, Users } from "lucide-react";
import { PageHeader } from "@/components/shared/PageHeader";
import { EmptyState } from "@/components/shared/EmptyState";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { ClientStatusBadge } from "@/components/shared/StatusBadge";
import { useClients } from "@/hooks/useClients";
import { getInitials } from "@/lib/utils";
import { Search } from "lucide-react";

export default function Progress() {
  const navigate = useNavigate();
  const { data: clients, isLoading } = useClients();
  const [search, setSearch] = React.useState("");

  const filtered = React.useMemo(
    () =>
      (clients ?? []).filter((c) =>
        c.full_name.toLowerCase().includes(search.toLowerCase())
      ),
    [clients, search]
  );

  return (
    <div className="animate-fade-in">
      <PageHeader
        title="Progress"
        description="Pick a client to review their measurements and trends."
      />

      <div className="relative mb-4 max-w-sm">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Search clients"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-9"
        />
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <Card key={i} className="flex items-center gap-3 p-4">
              <Skeleton className="h-11 w-11 rounded-full" />
              <div className="flex-1 space-y-2">
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-3 w-20" />
              </div>
            </Card>
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <EmptyState
          icon={search ? LineChart : Users}
          title={search ? "No matches" : "No clients yet"}
          description={
            search
              ? "Try a different name."
              : "Add clients first, then log their progress here."
          }
          actionLabel={search ? undefined : "Go to clients"}
          onAction={search ? undefined : () => navigate("/clients")}
        />
      ) : (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((client) => (
            <button
              key={client.id}
              onClick={() => navigate(`/clients/${client.id}`)}
              className="group"
            >
              <Card className="flex items-center gap-3 p-4 text-left transition-all hover:border-primary/30 hover:shadow-premium">
                <Avatar className="h-11 w-11">
                  <AvatarImage src={client.avatar_url ?? undefined} />
                  <AvatarFallback>{getInitials(client.full_name)}</AvatarFallback>
                </Avatar>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium">{client.full_name}</p>
                  <div className="mt-1">
                    <ClientStatusBadge status={client.status} />
                  </div>
                </div>
                <ChevronRight className="h-4 w-4 text-muted-foreground transition-transform group-hover:translate-x-0.5" />
              </Card>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
