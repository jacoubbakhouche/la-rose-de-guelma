import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  isAdmin: boolean;
  role: string | null;
  signUp: (email: string, password: string, fullName: string) => Promise<{ error: Error | null }>;
  signIn: (email: string, password: string) => Promise<{ error: Error | null }>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [role, setRole] = useState<string | null>(null);

  useEffect(() => {
    // Helper to fetch role
    const fetchRole = async (userId: string, email?: string) => {
      // Short-circuit for hardcoded admin to prevent loading delay
      if (email === 'yakoubbakhouche011@gmail.com') {
        console.log('⚡ Skipping DB fetch for hardcoded admin');
        setRole('admin');
        return;
      }

      console.log('🔍 Fetching role for user:', userId);
      try {
        // Create a timeout promise to prevent hanging
        const timeoutPromise = new Promise((_, reject) =>
          setTimeout(() => reject(new Error('Fetch role timed out')), 4000)
        );

        const fetchPromise = supabase
          .from('profiles')
          .select('role')
          .eq('user_id', userId)
          .single();

        const { data, error } = await Promise.race([fetchPromise, timeoutPromise]) as any;

        if (error) {
          console.error('❌ Error fetching role from DB:', error);
        } else {
          console.log('✅ Role data received:', data);
        }

        setRole(data?.role ?? null);
      } catch (error) {
        console.error('❌ Unexpected error fetching role:', error);
        setRole(null);
      }
    };

    // Set up auth state listener FIRST
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
        if (session?.user) {
          await fetchRole(session.user.id, session.user.email);
        } else {
          setRole(null);
        }
        setLoading(false);
      }
    );

    // THEN check for existing session
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      if (session?.user) {
        await fetchRole(session.user.id, session.user.email);
      } else {
        setRole(null);
      }
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const signUp = async (email: string, password: string, fullName: string) => {
    const redirectUrl = `${window.location.origin}/`;

    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: redirectUrl,
        data: {
          full_name: fullName,
        }
      }
    });

    return { error: error as Error | null };
  };

  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    return { error: error as Error | null };
  };

  const signOut = async () => {
    try {
      console.log("Initiating sign out...");

      // Create a timeout promise that rejects after 2 seconds
      const timeoutPromise = new Promise((_, reject) =>
        setTimeout(() => reject(new Error('Sign out timed out')), 2000)
      );

      // Race between actual sign out and timeout
      await Promise.race([
        supabase.auth.signOut(),
        timeoutPromise
      ]);

      console.log("Supabase sign out complete.");
    } catch (error) {
      console.error("Error during sign out:", error);
    } finally {
      console.log("Cleaning up local session...");
      // Nuking the session from storage to prevent auto-recovery
      Object.keys(localStorage).forEach((key) => {
        if (key.startsWith('sb-') && key.endsWith('-auth-token')) {
          localStorage.removeItem(key);
        }
      });

      setRole(null);
      setSession(null);
      setUser(null);

      // Force a hard reload to clear any persistent memory state
      console.log("Reloading page...");
      window.location.replace('/');
    }
  };

  const isAdmin = role === 'admin' || user?.email === 'yakoubbakhouche011@gmail.com';

  return (
    <AuthContext.Provider value={{ user, session, loading, isAdmin, role, signUp, signIn, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
