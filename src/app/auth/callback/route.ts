// FILE: /src/app/auth/callback/route.ts

import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export async function GET(request: NextRequest) {
  // <-- ADD LOG
  console.log("[ROUTE /auth/callback] Callback route reached.");

  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get("code");

  if (code) {
    const supabase = createClient();
    await supabase.auth.exchangeCodeForSession(code);
  }

  const next = requestUrl.searchParams.get("next") || "/admin";

  // <-- ADD LOG
  console.log("[ROUTE /auth/callback] Determined next path:", next);
  console.log(
    `[ROUTE /auth/callback] Redirecting to: ${requestUrl.origin}${next}`
  );

  // URL to redirect to after sign in process completes
  return NextResponse.redirect(`${requestUrl.origin}${next}`);
}
