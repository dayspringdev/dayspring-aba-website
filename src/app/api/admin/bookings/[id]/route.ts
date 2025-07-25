// FILE: src/app/api/admin/bookings/[id]/route.ts
import { createClient } from "@/lib/supabase/server";
import { getAvailableSlots } from "@/lib/db";
import { NextRequest, NextResponse } from "next/server";
import { format, parseISO } from "date-fns";
import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const supabase = createClient();
  const { id } = params;
  const { status, newSlotTime } = await request.json();

  const bookingId = parseInt(id, 10);
  if (isNaN(bookingId)) {
    return NextResponse.json({ error: "Invalid booking ID." }, { status: 400 });
  }

  // --- LOGIC FOR STATUS UPDATE ---
  if (status) {
    if (!["confirmed", "cancelled"].includes(status)) {
      return NextResponse.json(
        { error: "Invalid status provided." },
        { status: 400 }
      );
    }
    const { data: updatedBooking, error } = await supabase
      .from("bookings")
      .update({ status: status })
      .eq("id", bookingId)
      .select()
      .single();

    if (error) {
      return NextResponse.json(
        { error: "Failed to update status." },
        { status: 500 }
      );
    }

    // Send email on CONFIRMATION
    if (status === "confirmed" && updatedBooking) {
      try {
        const formattedDate = format(
          new Date(updatedBooking.slot_time),
          "EEEE, PPP 'at' p"
        );
        await resend.emails.send({
          from: "DBTS Booking <onboarding@resend.dev>",
          to: updatedBooking.email,
          subject: "Your Consultation is Confirmed!",
          html: `
            <div style="font-family: sans-serif; line-height: 1.6;">
              <h2>Booking Confirmed</h2>
              <p>Hi ${updatedBooking.first_name},</p>
              <p>Great news! Your consultation with Dayspring Behavioural Therapeutic Services is confirmed for <strong>${formattedDate}</strong>.</p>
              <p>We look forward to speaking with you. If you have any questions before then, please don't hesitate to reach out.</p>
              <p>Sincerely,<br/>The Dayspring Team</p>
            </div>
          `,
        });
      } catch (emailError) {
        console.error("Failed to send confirmation email:", emailError);
      }
    }

    // --- THIS IS THE NEW PART ---
    // Send email on CANCELLATION
    if (status === "cancelled" && updatedBooking) {
      try {
        await resend.emails.send({
          from: "DBTS Booking <onboarding@resend.dev>",
          to: updatedBooking.email,
          subject: "Your Consultation Has Been Cancelled",
          html: `
            <div style="font-family: sans-serif; line-height: 1.6;">
              <h2>Booking Cancelled</h2>
              <p>Hi ${updatedBooking.first_name},</p>
              <p>This is a notification that your consultation with Dayspring Behavioural Therapeutic Services has been cancelled.</p>
              <p>If you believe this was in error, or if you would like to schedule a new time, please visit our booking page. We apologize for any inconvenience.</p>
              <p>Sincerely,<br/>The Dayspring Team</p>
            </div>
          `,
        });
      } catch (emailError) {
        console.error("Failed to send cancellation email:", emailError);
      }
    }

    return NextResponse.json(updatedBooking);
  }

  // --- LOGIC FOR RESCHEDULING ---
  if (newSlotTime) {
    const requestedSlot = parseISO(newSlotTime);

    const availableSlots = await getAvailableSlots(supabase, requestedSlot);
    const isStillAvailable = availableSlots.some(
      (s) => s.getTime() === requestedSlot.getTime()
    );

    if (!isStillAvailable) {
      return NextResponse.json(
        { error: "This time slot is not available for rescheduling." },
        { status: 409 }
      );
    }

    const { data: rescheduledBooking, error } = await supabase
      .from("bookings")
      .update({ slot_time: newSlotTime, status: "confirmed" })
      .eq("id", bookingId)
      .select()
      .single();

    if (error) {
      return NextResponse.json(
        { error: "Failed to reschedule booking." },
        { status: 500 }
      );
    }

    if (rescheduledBooking) {
      try {
        const formattedDate = format(
          new Date(rescheduledBooking.slot_time),
          "EEEE, PPP 'at' p"
        );
        await resend.emails.send({
          from: "DBTS Booking <onboarding@resend.dev>",
          to: rescheduledBooking.email,
          subject: "Your Consultation Has Been Rescheduled",
          html: `
            <div style="font-family: sans-serif; line-height: 1.6;">
              <h2>Booking Rescheduled</h2>
              <p>Hi ${rescheduledBooking.first_name},</p>
              <p>Please note that your consultation with Dayspring Behavioural Therapeutic Services has been rescheduled to a new time: <strong>${formattedDate}</strong>.</p>
              <p>This new time is confirmed. We look forward to speaking with you then.</p>
              <p>Sincerely,<br/>The Dayspring Team</p>
            </div>
          `,
        });
      } catch (emailError) {
        console.error("Failed to send reschedule email:", emailError);
      }
    }

    return NextResponse.json(rescheduledBooking);
  }

  return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
}
