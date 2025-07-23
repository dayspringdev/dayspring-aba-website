import { Skeleton } from "@/components/ui/skeleton";

/**
 * A dedicated skeleton loading component for the weekly schedule UI.
 * It mimics the layout of the actual schedule rows to prevent layout shift.
 */
export function ScheduleSkeleton() {
  // We can create an array of a few placeholders to show a list loading.
  const placeholders = Array.from({ length: 5 });

  return (
    <div className="space-y-4">
      {placeholders.map((_, index) => (
        <div
          key={index}
          className="flex flex-col gap-4 rounded-md border p-4 sm:flex-row sm:items-center"
        >
          {/* Left side: Checkbox and Label */}
          <div className="flex flex-1 items-center">
            <Skeleton className="h-4 w-4" />
            <Skeleton className="ml-3 h-4 w-28" />
          </div>

          {/* Right side: Time inputs */}
          <div className="grid flex-1 grid-cols-2 gap-4">
            <div className="space-y-1">
              <Skeleton className="h-4 w-12" />
              <Skeleton className="h-9 w-full" />
            </div>
            <div className="space-y-1">
              <Skeleton className="h-4 w-8" />
              <Skeleton className="h-9 w-full" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
