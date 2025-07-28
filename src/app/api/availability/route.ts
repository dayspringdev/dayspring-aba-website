// FILE: src/app/api/availability/route.ts

import { NextRequest, NextResponse } from "next/server";
import { parseISO, eachDayOfInterval, startOfDay } from "date-fns";
import { getAvailableSlots } from "@/lib/db";
import { publicSupabase } from "@/lib/supabase/public-server";
import { formatInTimeZone } from "date-fns-tz";
import { TIMEZONE } from "@/lib/config";

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const dateParam = searchParams.get("date");
  const startParam = searchParams.get("start");
  const endParam = searchParams.get("end");

  // --- LOGIC FOR A SINGLE DAY'S SLOTS (This part is correct and unchanged) ---
  if (dateParam) {
    try {
      const requestedDate = parseISO(dateParam);
      const slots = await getAvailableSlots(publicSupabase, requestedDate);
      const formattedSlots = slots.map((slot) => ({
        utc: slot.toISOString(),
        local: formatInTimeZone(slot, TIMEZONE, "p"),
      }));
      return NextResponse.json(formattedSlots);
    } catch (error) {
      return NextResponse.json(
        { error: `Invalid date format provided. Details ${error}` },
        { status: 400 }
      );
    }
  }

  // --- REVISED LOGIC FOR A DATE RANGE'S UNAVAILABILITY ---
  if (startParam && endParam) {
    try {
      const startDate = parseISO(startParam);
      const endDate = parseISO(endParam);
      const interval = { start: startDate, end: endDate };

      const daysInInterval = eachDayOfInterval(interval);
      const today = startOfDay(new Date());

      // Create an array of promises, one for each day, to call our new DB function.
      const availabilityChecks = daysInInterval.map(async (day) => {
        // Automatically mark past days as unavailable.
        if (day < today) {
          return { date: day, isAvailable: false };
        }

        // Call the new, efficient database function.
        const { data, error } = await publicSupabase.rpc(
          "has_availability_rule_for_day",
          { p_date: day.toISOString() }
        );

        if (error) {
          console.error(`Error checking availability for ${day}:`, error);
          return { date: day, isAvailable: false }; // Assume unavailable on error
        }

        return { date: day, isAvailable: data };
      });

      const results = await Promise.all(availabilityChecks);

      // We return the dates that are UNAVAILABLE.
      // A day is unavailable if our function returned `false`.
      const finalUnavailableDates = results
        .filter((r) => !r.isAvailable)
        .map((r) => r.date.toISOString());

      return NextResponse.json(finalUnavailableDates);
    } catch {
      return NextResponse.json(
        { error: "Invalid date format for range." },
        { status: 400 }
      );
    }
  }

  // Fallback if neither condition is met
  return NextResponse.json(
    {
      error: "A 'date' parameter or 'start' and 'end' parameters are required",
    },
    { status: 400 }
  );
}
