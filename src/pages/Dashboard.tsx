import { useNavigate } from "react-router-dom";
import {
  Users,
  Wallet,
  Dumbbell,
  AlertCircle,
  Calendar,
  ArrowRight,
  Plus,
} from "lucide-react";
import { StatCard } from "@/components/dashboard/StatCard";
import { PageHeader } from "@/components/shared/PageHeader";
import { EmptyState } from "@/components/shared/EmptyState";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { useDashboardStats, useUpcomingSessions } from "@/hooks/useDashboard";
import { useAuth } from "@/hooks/useAuth";
import { formatCurrency, formatDate, getInitials } from "@/lib/utils";

function greeting() {
  const h = new Date().getHours();
  if (h < 12) return "Good morning";
  if (h < 18) return "Good afternoon";
  return "Good evening";
}

export default function Dashboard() {
  const navigate = useNavigate();
  const { profile } = useAuth();
  const { data: stats, isLoading: statsLoading } = useDashboardStats();
  const { data: sessions, isLoading: sessionsLoading } = useUpcomingSessions();

  const firstName = profile?.full_name?.split(" ")[0] ?? "there";

  return (
    <div className="animate-fade-in">
      <PageHeader
        title={`${greeting()}, ${firstName}`}
        description="Here's what's happening across your practice today."
        actions={
          <Button onClick={() => navigate("/clients")}>
            <Plus className="h-4 w-4" />
            Add client
          </Button>
        }
      />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Active clients"
          value={stats ? String(stats.activeClients) : "0"}
          hint={stats ? `${stats.totalClients} total` : undefined}
          icon={Users}
          accent="primary"
          isLoading={statsLoading}
        />
        <StatCard
          label="Revenue this month"
          value={stats ? formatCurrency(stats.monthlyRevenue) : "$0"}
          icon={Wallet}
          accent="success"
          isLoading={statsLoading}
        />
        <StatCard
          label="Outstanding"
          value={stats ? formatCurrency(stats.outstanding) : "$0"}
          hint={stats?.overdueCount ? `${stats.overdueCount} overdue` : "All settled"}
          icon={AlertCircle}
          accent="warning"
          isLoading={statsLoading}
        />
        <StatCard
          label="Active programs"
          value={stats ? String(stats.activePrograms) : "0"}
          icon={Dumbbell}
          accent="primary"
          isLoading={statsLoading}
        />
      </div>

      <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader className="flex-row items-center justify-between space-y-0">
            <CardTitle>Upcoming sessions</CardTitle>
            <Button
              variant="ghost"
              size="sm"
              className="text-muted-foreground"
              onClick={() => navigate("/clients")}
            >
              View all
              <ArrowRight className="h-3.5 w-3.5" />
            </Button>
          </CardHeader>
          <CardContent>
            {sessionsLoading ? (
              <div className="space-y-3">
                {Array.from({ length: 3 }).map((_, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <Skeleton className="h-10 w-10 rounded-full" />
                    <div className="flex-1 space-y-2">
                      <Skeleton className="h-4 w-32" />
                      <Skeleton className="h-3 w-24" />
                    </div>
                  </div>
                ))}
              </div>
            ) : sessions && sessions.length > 0 ? (
              <div className="divide-y divide-border">
                {sessions.map((session) => (
                  <div key={session.id} className="flex items-center gap-3 py-3 first:pt-0 last:pb-0">
                    <Avatar className="h-10 w-10">
                      <AvatarImage src={session.clients?.avatar_url ?? undefined} />
                      <AvatarFallback>
                        {getInitials(session.clients?.full_name ?? "?")}
                      </AvatarFallback>
                    </Avatar>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium">
                        {session.clients?.full_name ?? "Client"}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {session.location ?? "No location set"}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium tabular-nums">
                        {formatDate(session.scheduled_at, {
                          hour: "numeric",
                          minute: "2-digit",
                          month: undefined,
                          day: undefined,
                          year: undefined,
                        })}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {formatDate(session.scheduled_at, { weekday: "short" })}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <EmptyState
                icon={Calendar}
                title="No upcoming sessions"
                description="Sessions you schedule with clients will show up here."
              />
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Quick actions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <QuickAction
              icon={Users}
              label="Add a client"
              description="Onboard someone new"
              onClick={() => navigate("/clients")}
            />
            <QuickAction
              icon={Dumbbell}
              label="Build a program"
              description="Design a training block"
              onClick={() => navigate("/programs")}
            />
            <QuickAction
              icon={Wallet}
              label="Record a payment"
              description="Log an invoice or receipt"
              onClick={() => navigate("/payments")}
            />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function QuickAction({
  icon: Icon,
  label,
  description,
  onClick,
}: {
  icon: typeof Users;
  label: string;
  description: string;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className="group flex w-full items-center gap-3 rounded-lg border border-transparent p-3 text-left transition-colors hover:border-border hover:bg-secondary/50"
    >
      <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-secondary transition-colors group-hover:bg-primary/10 group-hover:text-primary">
        <Icon className="h-[18px] w-[18px]" />
      </div>
      <div className="flex-1">
        <p className="text-sm font-medium">{label}</p>
        <p className="text-xs text-muted-foreground">{description}</p>
      </div>
      <ArrowRight className="h-4 w-4 text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100" />
    </button>
  );
}
