import { NavLink } from "react-router-dom";
import {
  LayoutDashboard,
  Users,
  Dumbbell,
  LineChart,
  Wallet,
  Settings,
  Zap,
} from "lucide-react";
import { cn } from "@/lib/utils";

const navItems = [
  { to: "/", label: "Dashboard", icon: LayoutDashboard, end: true },
  { to: "/clients", label: "Clients", icon: Users },
  { to: "/programs", label: "Programming", icon: Dumbbell },
  { to: "/progress", label: "Progress", icon: LineChart },
  { to: "/payments", label: "Payments", icon: Wallet },
];

export function SidebarNav() {
  return (
    <nav className="flex flex-1 flex-col gap-1 px-3">
      {navItems.map((item) => (
        <NavLink
          key={item.to}
          to={item.to}
          end={item.end}
          className={({ isActive }) =>
            cn(
              "group relative flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
              isActive
                ? "bg-sidebar-accent text-foreground"
                : "text-sidebar-foreground/70 hover:bg-sidebar-accent/60 hover:text-foreground"
            )
          }
        >
          {({ isActive }) => (
            <>
              {isActive && (
                <span className="absolute left-0 top-1/2 h-4 w-[3px] -translate-y-1/2 rounded-r-full bg-primary" />
              )}
              <item.icon className="h-4 w-4" strokeWidth={2} />
              {item.label}
            </>
          )}
        </NavLink>
      ))}
    </nav>
  );
}

export function SidebarBrand() {
  return (
    <div className="flex items-center gap-2.5 px-4 py-5">
      <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-primary to-primary/70 shadow-glow">
        <Zap className="h-4 w-4 text-white" fill="white" strokeWidth={0} />
      </div>
      <span className="text-[15px] font-semibold tracking-tight">Trainerly</span>
    </div>
  );
}

export function Sidebar() {
  return (
    <aside className="hidden w-60 shrink-0 flex-col border-r border-sidebar-border bg-sidebar lg:flex">
      <SidebarBrand />
      <SidebarNav />
      <div className="p-3">
        <NavLink
          to="/settings"
          className={({ isActive }) =>
            cn(
              "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
              isActive
                ? "bg-sidebar-accent text-foreground"
                : "text-sidebar-foreground/70 hover:bg-sidebar-accent/60 hover:text-foreground"
            )
          }
        >
          <Settings className="h-4 w-4" />
          Settings
        </NavLink>
      </div>
    </aside>
  );
}
