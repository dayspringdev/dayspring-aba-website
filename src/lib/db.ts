// FILE: src/lib/db.ts

import {
  startOfDay,
  getDay,
  parse,
  isWithinInterval,
  isEqual,
  addHours,
  endOfDay,
  addMinutes,
  differenceInMinutes,
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

// 👇 CONVERTED FROM A CONST TO A STANDARD FUNCTION DECLARATION TO FIX THE TYPESCRIPT ERROR
function getDayInToronto(date: Date): number {
  // --- START LOGGING ---
  console.log(`[getDayInToronto] Input UTC Date: ${date.toISOString()}`);

  const zonedDate = toZonedTime(date, TIMEZONE);
  console.log(
    `[getDayInToronto] Converted Zoned (Toronto) Date: ${zonedDate.toISOString()}`
  );

  const dayOfWeek = getDay(zonedDate);
  console.log(
    `[getDayInToronto] Calculated Day of Week: ${dayOfWeek} (0=Sun, 1=Mon)`
  );
  // --- END LOGGING ---

  return dayOfWeek;
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
    supabase
      .from("availability_overrides")
      .select("*")
      .gte("start_time", dayStart.toISOString())
      .lte("end_time", dayEnd.toISOString()),
    supabase
      .from("bookings")
      .select("slot_time")
      .gte("slot_time", dayStart.toISOString())
      .lte("slot_time", dayEnd.toISOString())
      .in("status", ["pending", "confirmed"]),
  ]);

  const rule = ruleRes.data;
  const todaysOverrides = overridesRes.data || [];
  const todaysBookings = bookingsRes.data || [];

  if (!rule || !rule.available_slots || rule.available_slots.length === 0) {
    return [];
  }

  const zonedDayStart = toZonedTime(dayStart, TIMEZONE);
  const offsetMinutes = differenceInMinutes(zonedDayStart, dayStart);

  const potentialSlots: Date[] = rule.available_slots.map((timeStr) => {
    const naiveSlot = parse(timeStr, "HH:mm:ss", dayStart);
    return addMinutes(naiveSlot, -offsetMinutes);
  });

  const availableSlots = potentialSlots.filter((slot) => {
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
