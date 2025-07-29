// FILE: src/app/api/admin/bookings/[id]/route.ts
import { createClient } from "@/lib/supabase/server";
import { getAvailableSlots } from "@/lib/db";
import { NextRequest, NextResponse } from "next/server";
import { parseISO } from "date-fns";
import { formatInTimeZone } from "date-fns-tz"; // IMPORT THE NEW FUNCTION
import { sendEmail } from "@/lib/emails/send"; // <-- IMPORT our new service
import { TIMEZONE } from "@/lib/config"; // IMPORT our new constant

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
    if (updatedBooking) {
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
              bookingId: updatedBooking.id, // Provide the ID
              firstName: updatedBooking.first_name,
              lastName: updatedBooking.last_name, // Provide the last name
              email: updatedBooking.email, // Provide the email
              slotTime: updatedBooking.slot_time, // Provide the ISO time string
              notes: updatedBooking.notes, // Provide the notes
              formattedDate: formattedDate,
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
        // Don't block the API response if email fails
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
        const formattedDate = formatInTimeZone(
          new Date(rescheduledBooking.slot_time),
          TIMEZONE,
          "EEEE, PPP 'at' p zzzz"
        );

        await sendEmail("bookingRescheduled", {
          to: rescheduledBooking.email,
          data: {
            firstName: rescheduledBooking.first_name,
            formattedDate: formattedDate,
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
