// FILE: /src/app/auth/callback/route.ts

import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export async function GET(request: NextRequest) {
  // LOG 1: Prove this route is being hit.
  console.log("[CALLBACK] Auth callback route reached.");

  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get("code");

  if (code) {
    const supabase = createClient();
    await supabase.auth.exchangeCodeForSession(code);
    console.log("[CALLBACK] Code exchanged for session successfully.");
  }

  // LOG 2: See what the 'next' parameter contains. This is critical.
  const next = requestUrl.searchParams.get("next") || "/admin";
  console.log(`[CALLBACK] 'next' parameter from Supabase is: "${next}"`);

  // This is the robust way to create the final redirect URL.
  const finalRedirectUrl = new URL(next, requestUrl.origin);
  console.log(
    `[CALLBACK] Final calculated redirect URL is: "${finalRedirectUrl.toString()}"`
  );

  return NextResponse.redirect(finalRedirectUrl);
}
