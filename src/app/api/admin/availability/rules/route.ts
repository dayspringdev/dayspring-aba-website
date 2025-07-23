// FILE: src/app/api/admin/availability/rules/route.ts

import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import type { Database } from "@/types/supabase";

type NewRule =
  Database["public"]["Tables"]["recurring_availability_rules"]["Insert"];

export async function GET() {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("recurring_availability_rules")
    .select("*");

  if (error) {
    console.error("Error fetching recurring rules:", error);
    return NextResponse.json(
      { error: "Failed to fetch recurring rules." },
      { status: 500 }
    );
  }
  return NextResponse.json(data);
}

export async function POST(request: NextRequest) {
  const supabase = createClient();
  try {
    const { rules } = (await request.json()) as { rules: NewRule[] };

    if (!rules || !Array.isArray(rules)) {
      return NextResponse.json(
        { error: "A 'rules' array is required." },
        { status: 400 }
      );
    }

    // Clear the existing schedule
    const { error: deleteError } = await supabase
      .from("recurring_availability_rules")
      .delete()
      .neq("id", -1); // A trick to delete all rows

    if (deleteError) throw deleteError;

    // If there are new rules to insert, do it
    if (rules.length > 0) {
      // We only need day_of_week and available_slots for the insert
      const rulesToInsert = rules.map((r) => ({
        day_of_week: r.day_of_week,
        available_slots: r.available_slots,
      }));

      const { error: insertError } = await supabase
        .from("recurring_availability_rules")
        .insert(rulesToInsert);

      if (insertError) throw insertError;
    }

    return NextResponse.json({ message: "Schedule updated successfully" });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "An error occurred";
    return NextResponse.json(
      { error: `Failed to save rules: ${message}` },
      { status: 500 }
    );
  }
}
