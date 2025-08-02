// FILE: src/app/api/admin/bookings/[id]/route.ts
import { createClient } from "@/lib/supabase/server";
import { getAvailableSlots } from "@/lib/db";
import { NextRequest, NextResponse } from "next/server";
import { parseISO } from "date-fns";
import { formatInTimeZone } from "date-fns-tz";
import { sendEmail } from "@/lib/emails/send";
import { TIMEZONE } from "@/lib/config";
import { getBusinessEmail } from "@/lib/data-access/homepage"; // Import the new helper

// The PATCH function handles status updates and rescheduling
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

  // --- Fetch the business email once ---
  const businessEmail = await getBusinessEmail();
  if (!businessEmail) {
    // Log the error but don't block the core functionality
    console.error(
      "CRITICAL: Business email not found. Calendar invites may be incomplete."
    );
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

    // Send email notification based on the new status
    if (updatedBooking && businessEmail) {
      const formattedDate = formatInTimeZone(
        new Date(updatedBooking.slot_time),
        TIMEZONE,
        "EEEE, PPP 'at' p zzzz"
      );

      try {
        if (status === "confirmed") {
          await sendEmail("bookingConfirmed", {
            to: updatedBooking.email,
            data: {
              bookingId: updatedBooking.id,
              firstName: updatedBooking.first_name,
              lastName: updatedBooking.last_name,
              email: updatedBooking.email,
              slotTime: updatedBooking.slot_time,
              notes: updatedBooking.notes,
              formattedDate: formattedDate,
              businessEmail: businessEmail, // Pass the email
            },
          });
        } else if (status === "cancelled") {
          await sendEmail("bookingCancelled", {
            to: updatedBooking.email,
            data: {
              firstName: updatedBooking.first_name,
            },
          });
        }
      } catch (emailError) {
        console.error("Failed to send status update email:", emailError);
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

    if (rescheduledBooking && businessEmail) {
      try {
        const formattedDate = formatInTimeZone(
          new Date(rescheduledBooking.slot_time),
          TIMEZONE,
          "EEEE, PPP 'at' p zzzz"
        );

        await sendEmail("bookingRescheduled", {
          to: rescheduledBooking.email,
          data: {
            bookingId: rescheduledBooking.id,
            firstName: rescheduledBooking.first_name,
            lastName: rescheduledBooking.last_name,
            email: rescheduledBooking.email,
            slotTime: rescheduledBooking.slot_time,
            notes: rescheduledBooking.notes,
            formattedDate: formattedDate,
            businessEmail: businessEmail, // Pass the email
          },
        });
      } catch (emailError) {
        console.error("Failed to send reschedule email:", emailError);
      }
    }

    return NextResponse.json(rescheduledBooking);
  }

  return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
}
