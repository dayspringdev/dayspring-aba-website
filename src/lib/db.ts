// FILE: src/lib/db.ts

import {
  startOfDay,
  getDay,
  parse,
  isWithinInterval,
  isEqual,
  addHours,
  endOfDay,
} from "date-fns";
import { toZonedTime } from "date-fns-tz";
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
  const bookingLeadTimeHours = 2;
  const now = new Date();
  const earliestBookingTime = addHours(now, bookingLeadTimeHours);

  const dayOfWeek = getDayInToronto(date);
  const dayStart = startOfDay(date);
  const dayEnd = endOfDay(date);

  const [ruleRes, overridesRes, bookingsRes] = await Promise.all([
    supabase
      .from("recurring_availability_rules")
      .select("available_slots")
      .eq("day_of_week", dayOfWeek)
      .single(),

    // === THIS IS THE FIX: The query logic is now correct for finding overlaps ===
    supabase
      .from("availability_overrides")
      .select("*")
      .lte("start_time", dayEnd.toISOString()) // The override must start BEFORE the day ends
      .gte("end_time", dayStart.toISOString()), // AND the override must end AFTER the day begins
    // ===========================================================================

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

  // If there's an override that covers the whole day, we can stop early.
  // This is an optimization.
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

  const timezoneOffset =
    new Date(date.toLocaleString("en-US", { timeZone: TIMEZONE })).getTime() -
    date.getTime();

  const potentialSlots: Date[] = rule.available_slots.map((timeStr) => {
    const naiveSlot = parse(timeStr, "HH:mm:ss", dayStart);
    return new Date(naiveSlot.getTime() - timezoneOffset);
  });

  const isCheckingToday = isEqual(startOfDay(new Date()), startOfDay(date));

  const availableSlots = potentialSlots.filter((slot) => {
    const isAfterLeadTime = isCheckingToday ? slot > earliestBookingTime : true;

    const isBooked = todaysBookings.some((booking) =>
      isEqual(new Date(booking.slot_time), slot)
    );

    // Now this check will correctly identify slots within the full-day block
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
