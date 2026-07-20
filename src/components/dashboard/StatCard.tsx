import { type LucideIcon, ArrowUpRight, ArrowDownRight } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

interface StatCardProps {
  label: string;
  value: string;
  icon: LucideIcon;
  trend?: { value: string; direction: "up" | "down"; positive?: boolean };
  accent?: "primary" | "success" | "warning";
  isLoading?: boolean;
  hint?: string;
}

const accentStyles = {
  primary: "text-primary bg-primary/10",
  success: "text-success bg-success/10",
  warning: "text-warning bg-warning/10",
};

export function StatCard({
  label,
  value,
  icon: Icon,
  trend,
  accent = "primary",
  isLoading,
  hint,
}: StatCardProps) {
  if (isLoading) {
    return (
      <Card className="p-5">
        <div className="flex items-center justify-between">
          <Skeleton className="h-9 w-9 rounded-lg" />
          <Skeleton className="h-4 w-12" />
        </div>
        <Skeleton className="mt-4 h-7 w-24" />
        <Skeleton className="mt-2 h-4 w-20" />
      </Card>
    );
  }

  return (
    <Card className="ambient-glow p-5 transition-shadow hover:shadow-premium">
      <div className="flex items-center justify-between">
        <div className={cn("flex h-9 w-9 items-center justify-center rounded-lg", accentStyles[accent])}>
          <Icon className="h-[18px] w-[18px]" strokeWidth={2} />
        </div>
        {trend && (
          <div
            className={cn(
              "flex items-center gap-0.5 text-xs font-medium",
              trend.positive === false ? "text-destructive" : "text-success"
            )}
          >
            {trend.direction === "up" ? (
              <ArrowUpRight className="h-3.5 w-3.5" />
            ) : (
              <ArrowDownRight className="h-3.5 w-3.5" />
            )}
            {trend.value}
          </div>
        )}
      </div>
      <p className="mt-4 text-2xl font-semibold tracking-tight tabular-nums">{value}</p>
      <p className="mt-1 text-sm text-muted-foreground">{label}</p>
      {hint && <p className="mt-0.5 text-xs text-muted-foreground/70">{hint}</p>}
    </Card>
  );
}
