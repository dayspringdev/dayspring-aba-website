// FILE: src/app/api/admin/availability/overrides/route.ts

import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

/**
 * @route   GET /api/admin/availability/overrides
 * @desc    Retrieves all upcoming overrides from Supabase, sorted by date.
 */
export async function GET() {
  const supabase = createClient();
  const today = new Date().toISOString();

  const { data, error } = await supabase
    .from("availability_overrides")
    .select("*")
    .gte("start_time", today) // Only get overrides from today onwards
    .order("start_time", { ascending: true });

  if (error) {
    console.error("Error fetching overrides:", error);
    return NextResponse.json(
      { error: "Failed to fetch overrides." },
      { status: 500 }
    );
  }

  return NextResponse.json(data);
}

/**
 * @route   POST /api/admin/availability/overrides
 * @desc    Adds a new "BLOCKED" override to Supabase.
 */
export async function POST(request: NextRequest) {
  const supabase = createClient();
  try {
    const body = await request.json();
    // Supabase client can accept ISO date strings directly for timestamptz columns
    const { startTime, endTime } = body as {
      startTime: string;
      endTime: string;
    };

    if (!startTime || !endTime) {
      return NextResponse.json(
        { error: "startTime and endTime are required." },
        { status: 400 }
      );
    }

    const { data: newOverride, error } = await supabase
      .from("availability_overrides")
      .insert({
        start_time: startTime,
        end_time: endTime,
        type: "BLOCKED", // This matches your table's default, but it's good to be explicit
      })
      .select()
      .single(); // .single() is great for getting back the one row you just inserted

    if (error) {
      console.error("Error creating override:", error);
      throw new Error("Database operation failed.");
    }

    return NextResponse.json(newOverride, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { error: `Failed to create override. Details: ${error}` },
      { status: 500 }
    );
  }
}

/**
 * @route   DELETE /api/admin/availability/overrides
 * @desc    Deletes a specific override from Supabase by its ID.
 */
export async function DELETE(request: NextRequest) {
  const supabase = createClient();
  try {
    const id = request.nextUrl.searchParams.get("id");
    if (!id) {
      return NextResponse.json(
        { error: "Override ID is required" },
        { status: 400 }
      );
    }

    const { error } = await supabase
      .from("availability_overrides")
      .delete()
      .eq("id", parseInt(id, 10));

    if (error) {
      // This can happen if the row doesn't exist, but we'll treat it as an error for now
      console.error("Error deleting override:", error);
      return NextResponse.json(
        { error: "Override not found or could not be deleted" },
        { status: 404 }
      );
    }

    return NextResponse.json({ message: "Override deleted successfully" });
  } catch (error) {
    return NextResponse.json(
      { error: `Failed to delete override. Details ${error}` },
      { status: 500 }
    );
  }
}
