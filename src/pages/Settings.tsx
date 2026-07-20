import * as React from "react";
import { Loader2, Save } from "lucide-react";
import { PageHeader } from "@/components/shared/PageHeader";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/lib/supabase";
import { useToast } from "@/hooks/use-toast";
import { getInitials } from "@/lib/utils";

const currencies = ["USD", "EUR", "GBP", "ILS", "AUD", "CAD"];

export default function Settings() {
  const { user, profile, refreshProfile } = useAuth();
  const { toast } = useToast();

  const [form, setForm] = React.useState({
    full_name: "",
    business_name: "",
    phone: "",
    currency: "USD",
  });
  const [isSaving, setIsSaving] = React.useState(false);

  React.useEffect(() => {
    if (profile) {
      setForm({
        full_name: profile.full_name ?? "",
        business_name: profile.business_name ?? "",
        phone: profile.phone ?? "",
        currency: profile.currency ?? "USD",
      });
    }
  }, [profile]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setIsSaving(true);
    const { error } = await supabase
      .from("profiles")
      .update({
        full_name: form.full_name.trim(),
        business_name: form.business_name.trim() || null,
        phone: form.phone.trim() || null,
        currency: form.currency,
      })
      .eq("id", user.id);
    setIsSaving(false);

    if (error) {
      toast({
        variant: "destructive",
        title: "Couldn't save settings",
        description: error.message,
      });
      return;
    }
    await refreshProfile();
    toast({ title: "Settings saved", description: "Your profile has been updated." });
  };

  const displayName = form.full_name || user?.email || "Account";

  return (
    <div className="animate-fade-in max-w-2xl">
      <PageHeader title="Settings" description="Manage your profile and preferences." />

      <Card>
        <CardHeader>
          <CardTitle>Profile</CardTitle>
          <CardDescription>This information appears across your workspace.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="mb-6 flex items-center gap-4">
            <Avatar className="h-16 w-16">
              <AvatarImage src={profile?.avatar_url ?? undefined} />
              <AvatarFallback className="text-lg">{getInitials(displayName)}</AvatarFallback>
            </Avatar>
            <div>
              <p className="text-sm font-medium">{displayName}</p>
              <p className="text-sm text-muted-foreground">{user?.email}</p>
            </div>
          </div>

          <Separator className="mb-6" />

          <form onSubmit={handleSave} className="space-y-4">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="space-y-1.5">
                <Label htmlFor="full_name">Full name</Label>
                <Input
                  id="full_name"
                  value={form.full_name}
                  onChange={(e) => setForm((f) => ({ ...f, full_name: e.target.value }))}
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="business_name">Business name</Label>
                <Input
                  id="business_name"
                  value={form.business_name}
                  onChange={(e) => setForm((f) => ({ ...f, business_name: e.target.value }))}
                  placeholder="Your coaching brand"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="space-y-1.5">
                <Label htmlFor="phone">Phone</Label>
                <Input
                  id="phone"
                  value={form.phone}
                  onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))}
                  placeholder="+1 555 000 0000"
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="currency">Currency</Label>
                <Select
                  value={form.currency}
                  onValueChange={(v) => setForm((f) => ({ ...f, currency: v }))}
                >
                  <SelectTrigger id="currency">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {currencies.map((c) => (
                      <SelectItem key={c} value={c}>
                        {c}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <Button type="submit" disabled={isSaving}>
                {isSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                Save changes
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
