// FILE: src/app/api/bookings/route.ts

import { NextRequest, NextResponse } from "next/server";
import { parseISO } from "date-fns";
import { getAvailableSlots } from "@/lib/db";
import { formatInTimeZone } from "date-fns-tz";
import { createClient } from "@/lib/supabase/server";
import { sendEmail } from "@/lib/emails/send";
import { TIMEZONE } from "@/lib/config";
import { getBusinessEmail } from "@/lib/data-access/homepage"; // Import the new helper

export async function POST(request: NextRequest) {
  const supabase = createClient();

  try {
    const body = await request.json();
    const { slotTime, clientDetails, bookedByAdmin } = body as {
      slotTime: string;
      clientDetails: {
        firstName: string;
        lastName: string;
        email: string;
        notes?: string;
      };
      bookedByAdmin?: boolean;
    };

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
        status: status,
      })
      .select()
      .single();

    if (error) {
      throw new Error("Could not create booking in the database.");
    }

    // --- EMAIL LOGIC ---
    try {
      // Fetch both admin/business emails concurrently
      const [adminEmail, businessEmail] = await Promise.all([
        supabase.rpc("get_admin_email"),
        getBusinessEmail(),
      ]);

      if (adminEmail.error || !adminEmail.data) {
        throw new Error(
          `Could not fetch admin email: ${adminEmail.error?.message}`
        );
      }
      if (!businessEmail) {
        console.error(
          "CRITICAL: Business email not found. Calendar invites may be incomplete."
        );
      }

      const formattedDate = formatInTimeZone(
        requestedSlot,
        TIMEZONE,
        "EEEE, PPP 'at' p zzzz"
      );

      const emailPromises = [];

      if (status === "pending") {
        emailPromises.push(
          sendEmail("bookingRequestUser", {
            to: clientDetails.email,
            data: {
              firstName: clientDetails.firstName,
              formattedDate,
            },
          })
        );
      } else if (status === "confirmed" && businessEmail) {
        emailPromises.push(
          sendEmail("bookingConfirmed", {
            to: newBooking.email,
            data: {
              bookingId: newBooking.id,
              firstName: newBooking.first_name,
              lastName: newBooking.last_name,
              email: newBooking.email,
              slotTime: newBooking.slot_time,
              notes: newBooking.notes,
              formattedDate,
              businessEmail: businessEmail, // Pass the email
            },
          })
        );
      }

      emailPromises.push(
        sendEmail("adminNewBookingNotice", {
          to: adminEmail.data,
          data: {
            firstName: clientDetails.firstName,
            lastName: clientDetails.lastName,
            email: clientDetails.email,
            notes: clientDetails.notes,
            formattedDate,
            status,
            adminLink: new URL("/admin/bookings", request.url).toString(),
          },
        })
      );

      const results = await Promise.allSettled(emailPromises);
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
