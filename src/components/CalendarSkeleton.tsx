// src/components/CalendarSkeleton.tsx

import { Skeleton } from "@/components/ui/skeleton";

export function CalendarSkeleton() {
  return (
    <div className="flex flex-col" style={{ width: "224px", height: "267px" }}>
      {/* Header - 224 x 32 */}
      <div
        style={{ width: "224px", height: "32px" }}
        className="grid grid-cols-[auto_1fr_auto] items-center px-2"
      >
        <Skeleton className="h-4 w-4 rounded-[4px]" />
        <Skeleton className="h-4 w-20 justify-self-center rounded-[4px]" />
        <Skeleton className="h-4 w-4 justify-self-end rounded-[4px]" />
      </div>

      {/* Spacer between header and body */}
      <div className="h-4" />

      {/* Table container - 224 x 219 */}
      <div
        style={{ width: "224px", height: "219px" }}
        className="flex flex-col justify-between"
      >
        {/* Weekday labels - 224 x 19 */}
        <div className="flex justify-between h-[19.2px]">
          {Array.from({ length: 7 }).map((_, i) => (
            <Skeleton key={`wd-${i}`} className="h-full rounded-[4px] w-7" />
          ))}
        </div>

        {/* Day grid - 224 x 200 */}
        <div
          style={{ height: "200px" }}
          className="flex flex-col justify-between"
        >
          {Array.from({ length: 5 }).map((_, row) => (
            <div key={`row-${row}`} className="flex justify-between mt-2">
              {Array.from({ length: 7 }).map((_, col) => {
                const index = row * 7 + col;
                return (
                  <Skeleton
                    key={`d-${index}`}
                    className="w-7 h-6 rounded-[4px]"
                  />
                );
              })}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
