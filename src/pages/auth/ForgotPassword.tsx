import * as React from "react";
import { Link } from "react-router-dom";
import { Zap, Loader2, MailCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/lib/supabase";

export default function ForgotPassword() {
  const [email, setEmail] = React.useState("");
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [sent, setSent] = React.useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    });
    setIsSubmitting(false);
    if (error) {
      setError(error.message);
      return;
    }
    setSent(true);
  };

  return (
    <div className="noise-bg flex min-h-screen items-center justify-center px-4 py-12">
      <div className="w-full max-w-sm">
        <div className="mb-8 flex flex-col items-center text-center">
          <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-primary/70 shadow-glow">
            <Zap className="h-5 w-5 text-white" fill="white" strokeWidth={0} />
          </div>
          <h1 className="text-xl font-semibold tracking-tight">Reset your password</h1>
          <p className="mt-1.5 text-sm text-muted-foreground">
            We'll email you a link to get back in.
          </p>
        </div>

        <div className="ambient-glow rounded-xl border border-border bg-card p-6 shadow-premium">
          {sent ? (
            <div className="flex flex-col items-center py-2 text-center">
              <MailCheck className="mb-3 h-8 w-8 text-success" />
              <p className="text-sm text-muted-foreground">
                If an account exists for <span className="text-foreground">{email}</span>, a reset
                link is on its way.
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-1.5">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
              {error && (
                <p className="rounded-md bg-destructive/10 px-3 py-2 text-sm text-destructive">
                  {error}
                </p>
              )}
              <Button type="submit" variant="premium" className="w-full" disabled={isSubmitting}>
                {isSubmitting && <Loader2 className="h-4 w-4 animate-spin" />}
                Send reset link
              </Button>
            </form>
          )}
        </div>

        <p className="mt-6 text-center text-sm text-muted-foreground">
          <Link to="/login" className="font-medium text-primary hover:underline">
            Back to sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
