// FILE: src/app/auth/callback/route.ts
import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export async function GET(request: NextRequest) {
  console.log("[CALLBACK] Auth callback route reached.");

  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get("code");
  const next = requestUrl.searchParams.get("next") || "/admin";

  console.log(`[CALLBACK] Code: ${code ? "present" : "missing"}`);
  console.log(`[CALLBACK] 'next' parameter: "${next}"`);

  if (code) {
    const supabase = createClient();

    try {
      const { data, error } = await supabase.auth.exchangeCodeForSession(code);

      if (error) {
        console.error("[CALLBACK] Error exchanging code:", error);
        // Redirect to login with a specific error if exchange fails
        const errorUrl = new URL(
          "/login?error=auth_callback_error",
          requestUrl.origin
        );
        errorUrl.searchParams.set("error_description", error.message);
        return NextResponse.redirect(errorUrl);
      }

      console.log("[CALLBACK] Code exchanged successfully.");
      console.log("[CALLBACK] Session user email is now:", data.user?.email);
    } catch (error) {
      console.error("[CALLBACK] Exception during code exchange:", error);
      const errorUrl = new URL(
        "/login?error=unexpected_callback_error",
        requestUrl.origin
      );
      return NextResponse.redirect(errorUrl);
    }
  } else {
    console.warn(
      "[CALLBACK] No code found in URL. This is expected for email change flow."
    );
  }

  const finalRedirectUrl = new URL(next, requestUrl.origin);
  console.log(
    `[CALLBACK] Redirecting to final destination: "${finalRedirectUrl.toString()}"`
  );

  return NextResponse.redirect(finalRedirectUrl);
}
