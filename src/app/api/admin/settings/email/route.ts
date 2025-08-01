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

  // Use a simpler redirect that goes directly to a success page
  // This bypasses the complex callback flow
  const redirectTo = `${redirectUrl}/login?message=email-confirmed`;

  try {
    const { error } = await supabase.auth.updateUser(
      {
        email: newEmail,
      },
      {
        emailRedirectTo: redirectTo,
      }
    );

    if (error) {
      console.error("[EMAIL UPDATE API] Supabase error:", error);
      return NextResponse.json(
        { error: error.message || "Failed to update email." },
        { status: 500 }
      );
    }

    return NextResponse.json({
      message: `Verification link sent to ${newEmail}. Please check your inbox and click the confirmation link.`,
    });
  } catch {
    return NextResponse.json(
      { error: "An unexpected error occurred." },
      { status: 500 }
    );
  }
}
