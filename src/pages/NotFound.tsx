import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  const navigate = useNavigate();
  return (
    <div className="flex min-h-[70vh] flex-col items-center justify-center text-center">
      <p className="text-6xl font-semibold tracking-tight text-primary">404</p>
      <h1 className="mt-4 text-xl font-semibold">Page not found</h1>
      <p className="mt-1 text-sm text-muted-foreground">
        The page you're looking for doesn't exist or has moved.
      </p>
      <Button className="mt-6" onClick={() => navigate("/")}>
        Back to dashboard
      </Button>
    </div>
  );
}
