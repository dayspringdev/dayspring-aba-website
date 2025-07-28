// FILE: src/app/api/availability/route.ts

import { NextRequest, NextResponse } from "next/server";
import { parseISO, eachDayOfInterval, startOfDay } from "date-fns";
import { getAvailableSlots } from "@/lib/db";
import { publicSupabase } from "@/lib/supabase/public-server";
import { formatInTimeZone } from "date-fns-tz"; // IMPORT
import { TIMEZONE } from "@/lib/config"; // IMPORT

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const dateParam = searchParams.get("date");
  const startParam = searchParams.get("start");
  const endParam = searchParams.get("end");

  // --- LOGIC FOR A SINGLE DAY'S SLOTS (original functionality) ---
  if (dateParam) {
    try {
      const requestedDate = parseISO(dateParam);
      const slots = await getAvailableSlots(publicSupabase, requestedDate);
      // return NextResponse.json(slots.map((s) => s.toISOString()));
      // Return an object with both the UTC time and the formatted local time string.
      const formattedSlots = slots.map((slot) => {
        return {
          utc: slot.toISOString(), // The universal time for submitting
          local: formatInTimeZone(slot, TIMEZONE, "p"), // The display time, e.g., "8:30 AM"
        };
      });
      return NextResponse.json(formattedSlots);
    } catch (error) {
      return NextResponse.json(
        { error: `Invalid date format provided. Details ${error}` },
        { status: 400 }
      );
    }
  }

  // --- NEW LOGIC FOR A DATE RANGE'S UNAVAILABILITY ---
  if (startParam && endParam) {
    try {
      const startDate = parseISO(startParam);
      const endDate = parseISO(endParam);
      const interval = { start: startDate, end: endDate };

      const daysInInterval = eachDayOfInterval(interval);
      const today = startOfDay(new Date());

      const availabilityChecks = daysInInterval.map(async (day) => {
        // Treat past days as unavailable automatically
        if (day < today) {
          return { date: day.toISOString(), isUnavailable: true };
        }
        const slots = await getAvailableSlots(publicSupabase, day);
        return { date: day.toISOString(), isUnavailable: slots.length === 0 };
      });

      const results = await Promise.all(availabilityChecks);
      const finalUnavailableDates = results
        .filter((r) => r.isUnavailable)
        .map((r) => r.date);

      return NextResponse.json(finalUnavailableDates);
    } catch {
      return NextResponse.json(
        { error: "Invalid date format for range." },
        { status: 400 }
      );
    }
  }

  // --- Fallback if neither condition is met ---
  return NextResponse.json(
    {
      error: "A 'date' parameter or 'start' and 'end' parameters are required",
    },
    { status: 400 }
  );
}
