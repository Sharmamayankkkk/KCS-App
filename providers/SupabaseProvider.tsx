'use client';

import { useAuth } from '@clerk/nextjs';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { createContext, useContext, useEffect, useState, ReactNode } from 'react';

// Define the context
type SupabaseContextType = SupabaseClient | null;
const SupabaseContext = createContext<SupabaseContextType>(null);

// Get Supabase URL and anon key from environment variables
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

// Create the provider component
export const SupabaseProvider = ({ children }: { children: ReactNode }) => {
  const { getToken } = useAuth();
  const [supabase, setSupabase] = useState<SupabaseClient | null>(null);

  useEffect(() => {
    const setSupabaseClient = async () => {
      // Get the custom JWT from Clerk using the 'Supabase' template you created
      const token = await getToken({ template: 'Supabase' });
      
      if (token) {
        // Create a new Supabase client that is authenticated with the user's JWT
        const client = createClient(supabaseUrl, supabaseAnonKey, {
          global: {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          },
        });
        setSupabase(client);
      }
    };

    setSupabaseClient();
    
  }, [getToken]);

  return (
    <SupabaseContext.Provider value={supabase}>
      {children}
    </SupabaseContext.Provider>
  );
};

// Create a custom hook to easily access the client in other components
export const useSupabase = () => {
  const context = useContext(SupabaseContext);
  if (context === undefined) {
    throw new Error('useSupabase must be used within a SupabaseProvider');
  }
  return context;
};
