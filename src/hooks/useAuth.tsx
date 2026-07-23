import * as React from "react";
import type { Session, User } from "@supabase/supabase-js";
import { supabase } from "@/lib/supabase";
import type { Profile, Client } from "@/types/database";

interface AuthContextValue {
  user: User | null;
  session: Session | null;
  profile: Profile | null;
  clientRecord: Client | null;
  role: "trainer" | "client" | null;
  isLoading: boolean;
  signIn: (email: string, password: string) => Promise<{ error: string | null }>;
  signUp: (
    email: string,
    password: string,
    fullName: string
  ) => Promise<{ error: string | null }>;
  signOut: () => Promise<void>;
  refreshProfile: () => Promise<void>;
}

export const AuthContext = React.createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = React.useState<User | null>(null);
  const [session, setSession] = React.useState<Session | null>(null);
  const [profile, setProfile] = React.useState<Profile | null>(null);
  const [clientRecord, setClientRecord] = React.useState<Client | null>(null);
  const [role, setRole] = React.useState<"trainer" | "client" | null>(null);
  const [isLoading, setIsLoading] = React.useState(true);

  const fetchProfile = React.useCallback(async (userId: string) => {
    const { data: trainerData, error: trainerError } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", userId)
      .single();

    if (!trainerError && trainerData) {
      setProfile(trainerData);
      setClientRecord(null);
      setRole("trainer");
      return;
    }

    const { data: clientData, error: clientError } = await supabase
      .from("clients")
      .select("*")
      .eq("auth_user_id", userId)
      .single();

    if (!clientError && clientData) {
      setClientRecord(clientData);
      setProfile(null);
      setRole("client");
      return;
    }

    setProfile(null);
    setClientRecord(null);
    setRole(null);
  }, []);

  React.useEffect(() => {
    let mounted = true;
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!mounted) return;
      setSession(session);
      setUser(session?.user ?? null);
      if (session?.user) fetchProfile(session.user.id);
      setIsLoading(false);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      setUser(session?.user ?? null);
      if (session?.user) {
        fetchProfile(session.user.id);
      } else {
        setProfile(null);
        setClientRecord(null);
        setRole(null);
      }
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, [fetchProfile]);

  const signIn = React.useCallback(async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    return { error: error?.message ?? null };
  }, []);
  
  const signUp = React.useCallback(
    async (email: string, password: string, fullName: string, role: "trainer" | "client") => {
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: { data: { full_name: fullName, role } },
      });
      return { error: error?.message ?? null };
    },
    []
  );
  
  const signOut = React.useCallback(async () => {
    await supabase.auth.signOut();
  }, []);

  const refreshProfile = React.useCallback(async () => {
    if (user) await fetchProfile(user.id);
  }, [user, fetchProfile]);

  const value = React.useMemo(
    () => ({ user, session, profile, clientRecord, role, isLoading, signIn, signUp, signOut, refreshProfile }),
    [user, session, profile, clientRecord, role, isLoading, signIn, signUp, signOut, refreshProfile]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = React.useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within an AuthProvider");
  return ctx;
}