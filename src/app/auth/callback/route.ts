// FILE: src/app/auth/callback/route.ts
import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get("code");
  const token_hash = requestUrl.searchParams.get("token_hash");
  const token = requestUrl.searchParams.get("token");
  const type = requestUrl.searchParams.get("type");
  const next = requestUrl.searchParams.get("next") || "/admin";

  const supabase = createClient();

  // Handle PKCE flow (code exchange)
  if (code) {
    try {
      const { error } = await supabase.auth.exchangeCodeForSession(code);

      if (error) {
        console.error("[CALLBACK] Error exchanging code:", error);
        const errorUrl = new URL(
          "/login?error=auth_callback_error",
          requestUrl.origin
        );
        errorUrl.searchParams.set("error_description", error.message);
        return NextResponse.redirect(errorUrl);
      }
    } catch (error) {
      console.error("[CALLBACK] Exception during code exchange:", error);
      return NextResponse.redirect(
        new URL("/login?error=unexpected_callback_error", requestUrl.origin)
      );
    }
  }
  // Handle email confirmation with token hash (legacy/direct token method)
  else if ((token_hash || token) && type) {
    const tokenValue = token_hash || token;
    if (tokenValue) {
      try {
        const { error } = await supabase.auth.verifyOtp({
          token_hash: tokenValue,
          type: type as
            | "signup"
            | "email_change"
            | "recovery"
            | "invite"
            | "magiclink",
        });

        if (error) {
          console.error("[CALLBACK] Error verifying token:", error);
          const errorUrl = new URL(
            "/login?error=token_verification_error",
            requestUrl.origin
          );
          errorUrl.searchParams.set("error_description", error.message);
          return NextResponse.redirect(errorUrl);
        }
      } catch (error) {
        console.error("[CALLBACK] Exception during token verification:", error);
        return NextResponse.redirect(
          new URL("/login?error=unexpected_token_error", requestUrl.origin)
        );
      }
    } else {
      console.warn("[CALLBACK] Token value is null/undefined");
    }
  }
  // No code or token - this might be a direct link or error
  else {
    console.warn(
      "[CALLBACK] No code or token found. Proceeding with redirect."
    );
  }

  const finalRedirectUrl = new URL(next, requestUrl.origin);

  return NextResponse.redirect(finalRedirectUrl);
}
