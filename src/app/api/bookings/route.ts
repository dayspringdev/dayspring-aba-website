// FILE: src/app/api/bookings/route.ts

import { NextRequest, NextResponse } from "next/server";
import { format, parseISO } from "date-fns";
import { getAvailableSlots } from "@/lib/db";
import { createClient } from "@/lib/supabase/server";
import { sendEmail } from "@/lib/emails/send"; // <-- IMPORT our new service

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

    try {
      const { data: adminEmail, error: rpcError } =
        await supabase.rpc("get_admin_email");

      if (rpcError || !adminEmail) {
        throw new Error(`Could not fetch admin email: ${rpcError?.message}`);
      }

      const formattedDate = format(requestedSlot, "EEEE, PPP 'at' p");
      const emailPromises = [];

      // Send confirmation to client ONLY if it's a public booking request.
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
      }

      // Always send notification to admin.
      emailPromises.push(
        sendEmail("adminNewBookingNotice", {
          to: adminEmail,
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

      // Await all emails, but don't let a failed email stop the response.
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
