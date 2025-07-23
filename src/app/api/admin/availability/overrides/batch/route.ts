// FILE: src/app/api/admin/availability/overrides/batch/route.ts

import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server"; // <-- Import the correct server client helper

import type { Database } from "@/types/supabase";

type NewOverride =
  Database["public"]["Tables"]["availability_overrides"]["Insert"];

export async function POST(request: NextRequest) {
  const supabase = createClient();
  try {
    const { overridesToAdd, idsToDelete } = (await request.json()) as {
      overridesToAdd: NewOverride[];
      idsToDelete: number[];
    };

    // We can run these operations in parallel for efficiency
    const [deleteResult, insertResult] = await Promise.all([
      // Delete operation
      supabase.from("availability_overrides").delete().in("id", idsToDelete),
      // Insert operation
      supabase.from("availability_overrides").insert(overridesToAdd),
    ]);

    if (deleteResult.error) {
      console.error("Batch delete error:", deleteResult.error);
      throw new Error("Failed to delete one or more overrides.");
    }

    if (insertResult.error) {
      console.error("Batch insert error:", insertResult.error);
      throw new Error("Failed to add one or more new overrides.");
    }

    return NextResponse.json({ message: "Overrides updated successfully!" });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "An unknown error occurred.";
    return NextResponse.json(
      { error: `Batch update failed: ${message}` },
      { status: 500 }
    );
  }
}
