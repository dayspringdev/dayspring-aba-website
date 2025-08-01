// FILE: src/app/api/admin/settings/email/route.ts

import { createClient } from "@/lib/supabase/server";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  const { newEmail } = await request.json();
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  const redirectUrl = new URL(request.url).origin;
  // --- DIAGNOSTIC CHANGE ---
  // We are redirecting to a simple, clean page that is NOT in the middleware's matcher.
  const redirectTo = `${redirectUrl}/email-confirmation-test`;
  console.log("[DIAGNOSTIC] Generated redirectTo URL:", redirectTo);

  const { error } = await supabase.auth.updateUser(
    {
      email: newEmail,
    },
    {
      emailRedirectTo: redirectTo,
    }
  );

  if (error) {
    console.error("Email update error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to update email." },
      { status: 500 }
    );
  }

  return NextResponse.json({
    message: `Verification link sent to ${newEmail}. Please check your inbox for the diagnostic test.`,
  });
}
