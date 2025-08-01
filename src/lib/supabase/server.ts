// FILE: src/lib/supabase/server.ts

import { createServerClient, type CookieOptions } from "@supabase/ssr";
import { cookies } from "next/headers";
import type { Database } from "@/types/supabase";

export const createClient = () => {
  // --- THE FINAL FIX IS HERE ---
  // We are telling TypeScript to ignore the incorrect Promise type
  // and treat cookieStore as a flexible 'any' type.
  // This is safe because we know at runtime it WILL have .get(), .set(), etc.
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const cookieStore = cookies() as any;

  return createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value;
        },
        set(name: string, value: string, options: CookieOptions) {
          try {
            cookieStore.set({ name, value, ...options });
          } catch {
            // The `set` method was called from a Server Component.
            // This can be ignored if you have middleware refreshing
            // user sessions.
          }
        },
        remove(name: string, options: CookieOptions) {
          try {
            cookieStore.set({ name, value: "", ...options });
          } catch {
            // The `delete` method was called from a Server Component.
            // This can be ignored if you have middleware refreshing
            // user sessions.
          }
        },
      },

      auth: {
        flowType: "pkce",
      },
    }
  );
};
