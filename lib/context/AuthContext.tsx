'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import { User } from '@supabase/supabase-js';
import { createBrowserClient } from '@supabase/ssr';
import { useRouter } from 'next/navigation';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, fullName?: string) => Promise<void>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  
  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  useEffect(() => {
    console.log('🔐 AuthProvider: Component mounted, starting auth setup');
    
    // Get initial session
    const getInitialSession = async () => {
      try {
        console.log('🔐 Getting initial session...');
        const { data: { session }, error } = await supabase.auth.getSession();
        console.log('🔐 Initial session result:', { 
          hasSession: !!session,
          hasUser: !!session?.user,
          userEmail: session?.user?.email,
          error: error?.message 
        });
        
        setUser(session?.user ?? null);
        setLoading(false);
        console.log('🔐 Initial session processing complete');
      } catch (err) {
        console.error('🔐 Error getting initial session:', err);
        setUser(null);
        setLoading(false);
      }
    };

    getInitialSession();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      console.log('🔄 Auth state changed:', event, {
        hasSession: !!session,
        hasUser: !!session?.user,
        userEmail: session?.user?.email
      });
      
      setUser(session?.user ?? null);
      setLoading(false);
    });

    return () => {
      console.log('🔐 AuthProvider: Cleaning up subscription');
      subscription.unsubscribe();
    };
  }, [supabase]);

  const signIn = async (email: string, password: string) => {
    console.log('🔑 SignIn: Starting login for', email);
    setLoading(true);
    
    try {
      const { data, error } = await supabase.auth.signInWithPassword({ email, password });
      console.log('🔑 SignIn: Result:', { 
        hasUser: !!data.user, 
        hasSession: !!data.session,
        error: error?.message 
      });
      
      if (error) throw error;
      
      // Don't redirect here - let the auth state change handle it
      console.log('🔑 SignIn: Success, auth state will update');
    } catch (err) {
      console.error('🔑 SignIn: Error:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const signUp = async (email: string, password: string, fullName?: string) => {
    setLoading(true);
    try {
      const { error } = await supabase.auth.signUp({ 
        email, 
        password,
        options: {
          data: { 
            full_name: fullName || '' 
          }
        }
      });
      if (error) throw error;
    } catch (err) {
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const signOut = async () => {
    console.log('🚪 SignOut: Starting sign out process');
    setLoading(true);
    try {
      await supabase.auth.signOut();
      setUser(null);
      console.log('🚪 SignOut: Success, redirecting to login');
      // Redirect to login page after successful sign out
      router.push('/auth/login');
    } catch (err) {
      console.error('🚪 SignOut: Error:', err);
    } finally {
      setLoading(false);
    }
  };

  const resetPassword = async (email: string) => {
    setLoading(true);
    await supabase.auth.resetPasswordForEmail(email);
    setLoading(false);
  };

  console.log('🔐 AuthProvider: Rendering with state:', { 
    hasUser: !!user, 
    userEmail: user?.email,
    loading 
  });

  return (
    <AuthContext.Provider value={{ user, loading, signIn, signUp, signOut, resetPassword }}>
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