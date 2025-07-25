// FILE: src/app/api/contact/route.ts

import { NextRequest, NextResponse } from "next/server";
import { Resend } from "resend";
import { publicSupabase } from "@/lib/supabase/public-server";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(request: NextRequest) {
  try {
    // 2. Fetch the public contact email from the database
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

    // 1. Send the user's message to the business inbox
    const sendToBusinessPromise = resend.emails.send({
      from: "DBTS Website <onboarding@resend.dev>",
      to: businessEmail,
      subject: `New Contact Form Message from ${firstName} ${lastName}`,
      replyTo: email, // This lets the therapist reply directly to the user
      html: `
        <div style="font-family: sans-serif; line-height: 1.6;">
          <h2>New Message from Website Contact Form</h2>
          <p>You have received a new message from your website's contact form.</p>
          <ul style="list-style-type: none; padding: 0;">
            <li><strong>Name:</strong> ${firstName} ${lastName}</li>
            <li><strong>Email:</strong> ${email}</li>
            <li><strong>Phone:</strong> ${phone || "Not provided"}</li>
          </ul>
          <h3>Message:</h3>
          <p style="padding: 15px; border-left: 4px solid #eee;">${message.replace(/\n/g, "<br>")}</p>
        </div>
      `,
    });

    // 2. Send an auto-reply confirmation to the user
    const sendAutoReplyPromise = resend.emails.send({
      from: "Dayspring BTS <onboarding@resend.dev>",
      to: email,
      subject: "We've Received Your Message!",
      html: `
        <div style="font-family: sans-serif; line-height: 1.6;">
          <h2>Thank You For Reaching Out!</h2>
          <p>Hi ${firstName},</p>
          <p>This is an automated confirmation that we have successfully received your message. Our team will review it and get back to you as soon as possible.</p>
          <p>Sincerely,<br/>The Dayspring Behavioural Therapeutic Services Team</p>
        </div>
      `,
    });

    // Send both emails concurrently
    await Promise.all([sendToBusinessPromise, sendAutoReplyPromise]);

    return NextResponse.json({ message: "Emails sent successfully!" });
  } catch (error) {
    console.error("Contact form API error:", error);
    return NextResponse.json(
      { error: "Failed to send message." },
      { status: 500 }
    );
  }
}
