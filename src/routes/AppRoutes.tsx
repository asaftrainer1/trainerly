import { Suspense, lazy } from "react";
import { Route, Routes } from "react-router-dom";
import { AppShell } from "@/components/layout/AppShell";
import { ProtectedRoute } from "@/routes/ProtectedRoute";
import { PageLoader } from "@/components/shared/LoadingSpinner";

// Auth pages load eagerly (small, first paint)
import Login from "@/pages/auth/Login";
import Signup from "@/pages/auth/Signup";
import ForgotPassword from "@/pages/auth/ForgotPassword";
import ResetPassword from "@/pages/auth/ResetPassword";

// Feature pages are code-split
const Dashboard = lazy(() => import("@/pages/Dashboard"));
const Clients = lazy(() => import("@/pages/Clients"));
const ClientDetail = lazy(() => import("@/pages/ClientDetail"));
const Programs = lazy(() => import("@/pages/Programs"));
const ProgramDetail = lazy(() => import("@/pages/ProgramDetail"));
const Progress = lazy(() => import("@/pages/Progress"));
const Payments = lazy(() => import("@/pages/Payments"));
const Settings = lazy(() => import("@/pages/Settings"));
const NotFound = lazy(() => import("@/pages/NotFound"));

function Lazy({ children }: { children: React.ReactNode }) {
  return <Suspense fallback={<PageLoader />}>{children}</Suspense>;
}

export function AppRoutes() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/signup" element={<Signup />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route path="/reset-password" element={<ResetPassword />} />

      <Route
        element={
          <ProtectedRoute>
            <AppShell />
          </ProtectedRoute>
        }
      >
        <Route path="/" element={<Lazy><Dashboard /></Lazy>} />
        <Route path="/clients" element={<Lazy><Clients /></Lazy>} />
        <Route path="/clients/:id" element={<Lazy><ClientDetail /></Lazy>} />
        <Route path="/programs" element={<Lazy><Programs /></Lazy>} />
        <Route path="/programs/:id" element={<Lazy><ProgramDetail /></Lazy>} />
        <Route path="/progress" element={<Lazy><Progress /></Lazy>} />
        <Route path="/payments" element={<Lazy><Payments /></Lazy>} />
        <Route path="/settings" element={<Lazy><Settings /></Lazy>} />
        <Route path="*" element={<Lazy><NotFound /></Lazy>} />
      </Route>
    </Routes>
  );
}
