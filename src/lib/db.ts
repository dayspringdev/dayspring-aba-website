// FILE: src/lib/db.ts

import {
  startOfDay,
  getDay,
  isWithinInterval,
  isEqual,
  addHours,
  endOfDay,
  format,
} from "date-fns";
// Import the necessary timezone functions, including the CORRECT one: fromZonedTime
import { toZonedTime, fromZonedTime } from "date-fns-tz";
import type { Database } from "@/types/supabase";
import type { SupabaseClient } from "@supabase/supabase-js";
import { TIMEZONE } from "./config";

export type Booking = Database["public"]["Tables"]["bookings"]["Row"];
export type RecurringRule =
  Database["public"]["Tables"]["recurring_availability_rules"]["Row"];
export type Override =
  Database["public"]["Tables"]["availability_overrides"]["Row"];

function getDayInToronto(date: Date): number {
  const zonedDate = toZonedTime(date, TIMEZONE);
  return getDay(zonedDate);
}

export const getAvailableSlots = async (
  supabase: SupabaseClient<Database>,
  date: Date
): Promise<Date[]> => {
  // Get the current date and time IN YOUR BUSINESS'S TIMEZONE.
  const nowInToronto = toZonedTime(new Date(), TIMEZONE);

  // Define your lead time and calculate the earliest bookable moment in your timezone.
  const bookingLeadTimeHours = 2;
  const earliestBookingTime = addHours(nowInToronto, bookingLeadTimeHours);

  const dayOfWeek = getDayInToronto(date);
  const dayStart = startOfDay(date);
  const dayEnd = endOfDay(date);

  const [ruleRes, overridesRes, bookingsRes] = await Promise.all([
    supabase
      .from("recurring_availability_rules")
      .select("available_slots")
      .eq("day_of_week", dayOfWeek)
      .single(),
    supabase
      .from("availability_overrides")
      .select("*")
      .lte("start_time", dayEnd.toISOString())
      .gte("end_time", dayStart.toISOString()),
    supabase
      .from("bookings")
      .select("slot_time")
      .gte("slot_time", dayStart.toISOString())
      .lte("slot_time", dayEnd.toISOString())
      .in("status", ["pending", "confirmed"]),
  ]);

  const rule = ruleRes.data;
  const todaysOverrides: Override[] = overridesRes.data || [];
  const todaysBookings = bookingsRes.data || [];

  const isDayFullyBlocked = todaysOverrides.some(
    (override) =>
      new Date(override.start_time) <= dayStart &&
      new Date(override.end_time) >= dayEnd
  );

  if (
    !rule ||
    !rule.available_slots ||
    rule.available_slots.length === 0 ||
    isDayFullyBlocked
  ) {
    return [];
  }

  // --- THIS IS THE DEFINITIVE FIX ---
  // We use `fromZonedTime` which correctly interprets a string as being in a
  // specific timezone and returns the corresponding UTC Date object.
  const potentialSlots: Date[] = rule.available_slots.map((timeStr) => {
    // e.g., "2025-07-31 09:00:00"
    const dateString = `${format(date, "yyyy-MM-dd")} ${timeStr}`;

    // This reads: "Take this string, treat it as a time in 'America/Toronto',
    // and give me the universal Date object for that exact moment."
    return fromZonedTime(dateString, TIMEZONE);
  });
  // --- END OF FIX ---

  const availableSlots = potentialSlots.filter((slot) => {
    // This comparison logic is now 100% reliable because both `slot` and
    // `earliestBookingTime` are standard JavaScript Date objects (UTC timestamps).
    const isAfterLeadTime = slot > earliestBookingTime;

    const isBooked = todaysBookings.some((booking) =>
      isEqual(new Date(booking.slot_time), slot)
    );

    const isOverridden = todaysOverrides.some((override) =>
      isWithinInterval(slot, {
        start: new Date(override.start_time),
        end: new Date(override.end_time),
      })
    );

    return isAfterLeadTime && !isBooked && !isOverridden;
  });

  return availableSlots;
};
