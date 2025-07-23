// FILE: src/lib/supabase/client.ts

import { createBrowserClient } from "@supabase/ssr";
import type { Database } from "@/types/supabase";

// This client is for use in "use client" components
export const createClient = () =>
  createBrowserClient<Database>(
    // --- THESE ARGUMENTS WERE MISSING ---
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
