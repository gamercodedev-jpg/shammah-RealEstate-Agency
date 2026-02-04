import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "./types";

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY ?? import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;
const SUPABASE_SERVICE_ROLE = import.meta.env.VITE_SUPABASE_SERVICE_ROLE as string | undefined;

// Import the supabase client like this:
// import { supabase } from "@/integrations/supabase/client";

let supabaseClient: SupabaseClient<Database> | null = null;

if (SUPABASE_URL && SUPABASE_ANON_KEY) {
  supabaseClient = createClient<Database>(SUPABASE_URL, SUPABASE_ANON_KEY, {
    auth: {
      storage: localStorage,
      persistSession: true,
      autoRefreshToken: true,
    },
  });
} else {
  // eslint-disable-next-line no-console
  console.warn("Supabase env not configured; supabase client is disabled.");
}

export const supabase = supabaseClient;

// Optional admin client (insecure if used in browser). Only set via env when
// running locally and you understand the security implications.
export const adminSupabase = SUPABASE_SERVICE_ROLE && SUPABASE_URL
  ? createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE, { auth: { persistSession: false } })
  : null;