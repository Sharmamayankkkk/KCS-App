import { createClient } from '@supabase/supabase-js';
import { useAuth } from '@clerk/nextjs';

// Define a global object to hold the Supabase client instance and Clerk token
declare global {
  var __supabase: any;
  var __clerk_token: string | null;
}

if (typeof globalThis.__supabase === 'undefined') {
  globalThis.__supabase = null;
}
if (typeof globalThis.__clerk_token === 'undefined') {
  globalThis.__clerk_token = null;
}

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

// This function creates a new Supabase client, optionally using a Clerk-generated token
const createSupabaseClient = (token: string | null = null) => {
  return createClient(supabaseUrl, supabaseAnonKey, {
    global: {
      headers: {
        Authorization: `Bearer ${token || supabaseAnonKey}`,
      },
    },
  });
};

// Initialize a base client
if (!globalThis.__supabase) {
  globalThis.__supabase = createSupabaseClient();
}

export const supabase = globalThis.__supabase;

// This is a custom hook to get an authenticated Supabase client
export const useSupabase = () => {
  const { getToken } = useAuth();

  const getSupabase = async () => {
    // Use the 'Supabase' template we created in the Clerk dashboard
    const token = await getToken({ template: 'Supabase' });
    if (token) {
      return createClient(supabaseUrl, supabaseAnonKey, {
        global: {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      });
    }
    // Fallback to the anonymous client if no token is available
    return supabase;
  };

  return { getSupabase };
};
