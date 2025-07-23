import { createClient } from "@supabase/supabase-js";
import type { Database } from "@/types/supabase";

// This client is for public, server-side data fetching
// where no user session is required.
export const publicSupabase = createClient<Database>(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);
