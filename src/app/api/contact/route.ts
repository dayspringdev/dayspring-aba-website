// FILE: src/app/api/contact/route.ts

import { NextRequest, NextResponse } from "next/server";
import { sendEmail } from "@/lib/emails/send"; // <-- IMPORT your email service
import { publicSupabase } from "@/lib/supabase/public-server";

export async function POST(request: NextRequest) {
  try {
    // Fetch the public contact email from the database
    const { data: profile, error: profileError } = await publicSupabase
      .from("profiles")
      .select("public_contact_email")
      .eq("id", 1)
      .single();

    if (profileError || !profile?.public_contact_email) {
      throw new Error("Business contact email is not configured.");
    }
    const businessEmail = profile.public_contact_email;

    const body = await request.json();
    const { firstName, lastName, email, phone, message } = body as {
      firstName: string;
      lastName: string;
      email: string;
      phone?: string;
      message: string;
    };

    if (!firstName || !lastName || !email || !message || !businessEmail) {
      return NextResponse.json(
        { error: "Missing required fields." },
        { status: 400 }
      );
    }

    const emailPromises = [];

    // 1. Send the user's message to the business inbox
    emailPromises.push(
      sendEmail("contactFormToBusiness", {
        to: businessEmail,
        data: {
          firstName,
          lastName,
          email,
          phone,
          message,
        },
        replyTo: email, // This lets the therapist reply directly to the user
      })
    );

    // 2. Send an auto-reply confirmation to the user
    emailPromises.push(
      sendEmail("contactFormAutoReply", {
        to: email,
        data: {
          firstName,
        },
      })
    );

    // Send both emails concurrently, but don't let a failed email stop the response
    const results = await Promise.allSettled(emailPromises);
    results.forEach((result) => {
      if (result.status === "rejected") {
        console.error(`Failed to send an email:`, result.reason);
      }
    });

    return NextResponse.json({ message: "Emails sent successfully!" });
  } catch (error) {
    console.error("Contact form API error:", error);
    return NextResponse.json(
      { error: "Failed to send message." },
      { status: 500 }
    );
  }
}
