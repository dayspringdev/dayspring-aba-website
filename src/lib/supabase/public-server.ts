// FILE: src/lib/supabase/public-server.ts

import { createClient } from "@supabase/supabase-js";
import type { Database } from "@/types/supabase";

export const publicSupabase = createClient<Database>(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,

  // Add the auth configuration here as well for consistency.
  {
    auth: {
      flowType: "pkce",
    },
  }
);
