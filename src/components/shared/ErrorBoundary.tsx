import * as React from "react";
import { AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";

interface Props {
  children: React.ReactNode;
  fallbackTitle?: string;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, info: React.ErrorInfo) {
    // eslint-disable-next-line no-console
    console.error("Trainerly caught a render error:", error, info);
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null });
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex min-h-[50vh] w-full flex-col items-center justify-center gap-3 rounded-xl border border-dashed border-border p-8 text-center">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-destructive/10">
            <AlertTriangle className="h-5 w-5 text-destructive" />
          </div>
          <h3 className="text-sm font-semibold">
            {this.props.fallbackTitle ?? "Something went wrong"}
          </h3>
          <p className="max-w-sm text-sm text-muted-foreground">
            This section couldn't load. Try again, and if the problem continues, refresh the page.
          </p>
          <Button size="sm" variant="outline" onClick={this.handleReset}>
            Try again
          </Button>
        </div>
      );
    }
    return this.props.children;
  }
}
