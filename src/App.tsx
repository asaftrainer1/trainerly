import { ThemeProvider } from "./contexts/ThemeContext";
import { AuthProvider } from '@/hooks/useAuth';
import { BrowserRouter } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { AppRoutes } from "@/routes/AppRoutes";
import { Toaster } from "@/components/ui/toaster";
import { ErrorBoundary } from "@/components/shared/ErrorBoundary";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 30_000,
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <AuthProvider>
          <BrowserRouter>
            <ErrorBoundary fallbackTitle="Trainerly hit an unexpected error">
              <AppRoutes />
              <Toaster />
            </ErrorBoundary>
          </BrowserRouter>
        </AuthProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}