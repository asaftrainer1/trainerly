import * as React from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { PageLoader } from "@/components/shared/LoadingSpinner";

export function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, role, isLoading } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <PageLoader label="Loading your workspace" />
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" state={{ from: location.pathname }} replace />;
  }

  const isPortalPath = location.pathname.startsWith("/portal");

  if (role === "client" && !isPortalPath) {
    return <Navigate to="/portal" replace />;
  }

  if (role === "trainer" && isPortalPath) {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
}