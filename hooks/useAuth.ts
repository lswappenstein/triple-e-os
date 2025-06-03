import { useEffect, useState } from 'react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { User } from '@supabase/supabase-js';

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const supabase = createClientComponentClient();

  useEffect(() => {
    const getUser = async () => {
      try {
        console.log('useAuth: Getting session...');
        const { data: { session }, error } = await supabase.auth.getSession();
        if (error) {
          console.error('useAuth: Session error:', error);
          throw error;
        }
        console.log('useAuth: Session:', session);
        setUser(session?.user ?? null);
      } catch (error) {
        console.error('useAuth: Error getting user:', error);
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    getUser();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      console.log('useAuth: Auth state changed:', _event, session);
      setUser(session?.user ?? null);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [supabase.auth]);

  return { user, loading };
} 