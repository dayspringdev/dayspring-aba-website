import { NextRequest, NextResponse } from "next/server";
import { parseISO } from "date-fns";
import { getAvailableSlots } from "@/lib/db";
import { createClient } from "@/lib/supabase/server"; // <-- Import the correct server client helper

/**
 * @route GET /api/availability
 * @description Get all available slots for a specific date using dynamic rules.
 */
export async function GET(request: NextRequest) {
  const supabase = createClient();
  const searchParams = request.nextUrl.searchParams;
  const dateParam = searchParams.get("date");

  if (!dateParam) {
    return NextResponse.json(
      { error: "Date parameter is required" },
      { status: 400 }
    );
  }

  try {
    const requestedDate = parseISO(dateParam);
    const slots = await getAvailableSlots(supabase, requestedDate);
    return NextResponse.json(slots.map((s) => s.toISOString()));
  } catch (error) {
    return NextResponse.json(
      { error: `Invalid date format. Details ${error}` },
      { status: 400 }
    );
  }
}

/**
 * @route POST /api/availability
 * @description (Admin Only) This endpoint is now used conceptually by the admin routes.
 * In a real app, this might be split or protected. For now, it's unused directly.
 * The specific admin logic is in /api/admin/*.
 */
// --- FIX IS HERE ---
// The original POST functionality is now handled by the specific admin routes.
// We can leave a placeholder or remove it, but we won't import from a non-existent file.
// For simplicity, we'll assume no general POST route is needed here anymore.
