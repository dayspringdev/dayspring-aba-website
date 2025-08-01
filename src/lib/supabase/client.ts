// FILE: src/lib/supabase/client.ts

import { createBrowserClient } from "@supabase/ssr";
import type { Database } from "@/types/supabase";

export const createClient = () =>
  createBrowserClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    // We also tell the browser client to expect and handle the PKCE flow.
    {
      auth: {
        flowType: "pkce",
      },
    }
  );
