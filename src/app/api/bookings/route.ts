// FILE: src/app/api/bookings/route.ts

import { NextRequest, NextResponse } from "next/server";
import { format, parseISO } from "date-fns";
import { getAvailableSlots } from "@/lib/db";
import { createClient } from "@/lib/supabase/server";
import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(request: NextRequest) {
  const supabase = createClient();

  try {
    // We no longer need to check the user session here for this logic.

    const body = await request.json();
    // Update the type to include the optional 'bookedByAdmin' flag
    const { slotTime, clientDetails, bookedByAdmin } = body as {
      slotTime: string;
      clientDetails: {
        firstName: string;
        lastName: string;
        email: string;
        notes?: string;
      };
      bookedByAdmin?: boolean; // The flag from the admin dialog
    };

    // --- THIS IS THE FIX ---
    // The status is 'confirmed' ONLY if the 'bookedByAdmin' flag is true.
    // Otherwise, it's 'pending'.
    const status = bookedByAdmin ? "confirmed" : "pending";

    if (
      !slotTime ||
      !clientDetails?.firstName ||
      !clientDetails?.lastName ||
      !clientDetails?.email
    ) {
      return NextResponse.json(
        { error: "slotTime and complete clientDetails are required" },
        { status: 400 }
      );
    }

    const requestedSlot = parseISO(slotTime);

    const availableSlots = await getAvailableSlots(supabase, requestedSlot);
    const isStillAvailable = availableSlots.some(
      (s) => s.getTime() === requestedSlot.getTime()
    );

    if (!isStillAvailable) {
      return NextResponse.json(
        {
          error:
            "This time slot is no longer available. Please select another time.",
        },
        { status: 409 }
      );
    }

    const { data: newBooking, error } = await supabase
      .from("bookings")
      .insert({
        slot_time: requestedSlot.toISOString(),
        first_name: clientDetails.firstName,
        last_name: clientDetails.lastName,
        email: clientDetails.email,
        notes: clientDetails.notes || null,
        status: status, // Use our new status variable
      })
      .select()
      .single();

    if (error) {
      throw new Error("Could not create booking in the database.");
    }

    // The email sending logic remains the same and is still correct.
    try {
      const { data: adminEmail, error: rpcError } =
        await supabase.rpc("get_admin_email");

      if (rpcError || !adminEmail) {
        throw new Error(`Could not fetch admin email: ${rpcError?.message}`);
      }

      const formattedDate = format(requestedSlot, "EEEE, PPP 'at' p");

      const promises = [];

      // Send confirmation to client only if it's NOT an admin booking.
      // If admin books, they get the confirmed status directly.
      // The client will get a separate 'Confirmed' email later.
      // We will only send the "request received" email for public bookings.
      if (status === "pending") {
        promises.push(
          resend.emails.send({
            from: "DBTS Booking <onboarding@resend.dev>",
            to: clientDetails.email,
            subject: "Consultation Request Received - Dayspring BTS",
            html: `
                <div style="font-family: sans-serif; line-height: 1.6;">
                  <h2>Thank you for your request!</h2>
                  <p>Hi ${clientDetails.firstName},</p>
                  <p>We've received your request for a consultation on <strong>${formattedDate}</strong>.</p>
                  <p>Our team will review it shortly and send a separate confirmation email once it's approved. We look forward to speaking with you!</p>
                  <p>Sincerely,<br/>The Dayspring Behavioural Therapeutic Services Team</p>
                </div>
              `,
          })
        );
      }

      // Always send notification to admin
      promises.push(
        resend.emails.send({
          from: "DBTS System <onboarding@resend.dev>",
          to: adminEmail,
          subject: `New Consultation Request: ${clientDetails.firstName} ${clientDetails.lastName}`,
          html: `
            <div style="font-family: sans-serif; line-height: 1.6;">
              <h2>New Consultation Request</h2>
              <p>A new consultation has been requested with status: <strong>${status.toUpperCase()}</strong>.</p>
              <ul style="list-style-type: none; padding: 0;">
                <li><strong>Name:</strong> ${clientDetails.firstName} ${clientDetails.lastName}</li>
                <li><strong>Email:</strong> ${clientDetails.email}</li>
                <li><strong>Requested Time:</strong> ${formattedDate}</li>
                <li><strong>Notes:</strong> ${clientDetails.notes || "N/A"}</li>
              </ul>
              <a href="${new URL("/admin/bookings", request.url).toString()}" style="display: inline-block; padding: 10px 15px; background-color: #007bff; color: white; text-decoration: none; border-radius: 5px;">View in Admin Panel</a>
            </div>
          `,
        })
      );

      const results = await Promise.allSettled(promises);
      results.forEach((result) => {
        if (result.status === "rejected") {
          console.error(`Failed to send an email:`, result.reason);
        }
      });
    } catch (emailError) {
      console.error(
        "A critical error occurred in the email sending block:",
        emailError
      );
    }

    return NextResponse.json(newBooking, { status: 201 });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "An unexpected error occurred.";
    return NextResponse.json(
      {
        error: `An unexpected error occurred while creating the booking: ${message}`,
      },
      { status: 500 }
    );
  }
}
