// FILE: src/app/api/availability/route.ts

import { NextRequest, NextResponse } from "next/server";
import { parseISO, eachDayOfInterval, startOfDay } from "date-fns";
import { getAvailableSlots } from "@/lib/db";
import { publicSupabase } from "@/lib/supabase/public-server";
import { formatInTimeZone } from "date-fns-tz";
import { TIMEZONE } from "@/lib/config";

// === THIS IS THE FIX ===
// This tells Next.js and Vercel to treat this route as fully dynamic.
// It will be executed on every request, ensuring fresh data.
export const revalidate = 0;
// ========================

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const dateParam = searchParams.get("date");
  const startParam = searchParams.get("start");
  const endParam = searchParams.get("end");

  // --- LOGIC FOR FETCHING SLOTS FOR A SINGLE, SPECIFIC DAY ---
  if (dateParam) {
    try {
      const requestedDate = parseISO(dateParam);
      const slots = await getAvailableSlots(publicSupabase, requestedDate);

      // This part is correct: It returns the object { utc, local }
      const formattedSlots = slots.map((slot) => ({
        utc: slot.toISOString(),
        local: formatInTimeZone(slot, TIMEZONE, "p"),
      }));
      return NextResponse.json(formattedSlots);
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unknown error";
      return NextResponse.json(
        { error: `Invalid date format provided. Details: ${message}` },
        { status: 400 }
      );
    }
  }

  // --- LOGIC FOR CHECKING WHICH DAYS IN A RANGE ARE UNAVAILABLE ---
  if (startParam && endParam) {
    try {
      const startDate = parseISO(startParam);
      const endDate = parseISO(endParam);
      const interval = { start: startDate, end: endDate };

      const daysInInterval = eachDayOfInterval(interval);
      const today = startOfDay(new Date());

      const availabilityChecks = daysInInterval.map(async (day) => {
        // Automatically mark past days as having no availability.
        if (day < today) {
          return { date: day, isAvailable: false };
        }

        // Use our new, efficient database function to check for a rule.
        const { data, error } = await publicSupabase.rpc(
          "has_availability_rule_for_day",
          { p_date: day.toISOString() }
        );

        if (error) {
          console.error(
            `Error checking availability for ${day}:`,
            error.message
          );
          return { date: day, isAvailable: false }; // Assume unavailable on error
        }

        return { date: day, isAvailable: data };
      });

      const results = await Promise.all(availabilityChecks);

      // The frontend expects a list of UNAVAILABLE dates.
      // So, we filter for results where isAvailable is false.
      const finalUnavailableDates = results
        .filter((result) => !result.isAvailable)
        .map((result) => result.date.toISOString());

      return NextResponse.json(finalUnavailableDates);
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unknown error";
      return NextResponse.json(
        { error: `Invalid date format for range. Details: ${message}` },
        { status: 400 }
      );
    }
  }

  // Fallback if the request is malformed
  return NextResponse.json(
    {
      error:
        "Request must include either a 'date' parameter or both 'start' and 'end' parameters.",
    },
    { status: 400 }
  );
}
