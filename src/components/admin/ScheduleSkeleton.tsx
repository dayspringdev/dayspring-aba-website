// src/components/admin/ScheduleSkeleton.tsx

import { Skeleton } from "@/components/ui/skeleton";

/**
 * A dedicated skeleton that mimics the layout of the ScheduleSummary component.
 */
export function ScheduleSkeleton() {
  // Create 7 placeholder rows, one for each day of the week.
  const placeholders = Array.from({ length: 7 });

  return (
    <div className="space-y-4">
      {placeholders.map((_, index) => (
        <div
          key={index}
          className="flex flex-col sm:flex-row sm:items-center gap-4 rounded-md border p-4 "
        >
          {/* Left Side: Day Label Placeholder */}
          <Skeleton className="h-6 w-24 shrink-0 rounded-xs" />

          {/* Right Side: Time Slots Placeholder */}
          <div className="flex flex-wrap gap-2">
            {/* Render a few placeholder time slots to look realistic */}
            {Array.from({ length: 12 }).map((_, slotIndex) => (
              <Skeleton key={slotIndex} className="h-10 w-28 rounded-xs" />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
