// FILE: /src/app/auth/callback/route.ts

import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get("code");

  if (code) {
    const supabase = createClient();
    await supabase.auth.exchangeCodeForSession(code);
  }

  // This is the crucial part. After the session is exchanged,
  // we check the 'next' parameter or default to the admin page.
  // Supabase automatically adds a 'next' param for password recovery.
  const next = requestUrl.searchParams.get("next") || "/admin";

  // URL to redirect to after sign in process completes
  return NextResponse.redirect(`${requestUrl.origin}${next}`);
}
