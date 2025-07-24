// src/app/error.tsx

"use client"; // Error components must be Client Components

import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { AlertCircle } from "lucide-react";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log the error to an error reporting service like Sentry, LogRocket, etc.
    console.error(error);
  }, [error]);

  return (
    <div className="flex flex-col items-center justify-center text-center py-20 lg:py-40">
      <AlertCircle className="w-16 h-16 text-destructive mb-6" />
      <h2 className="text-4xl font-bold text-foreground">
        Something Went Wrong
      </h2>
      <p className="mt-4 max-w-md text-muted-foreground">
        We encountered an unexpected issue. Please try again, or contact us if
        the problem persists.
      </p>
      <Button
        onClick={
          // Attempt to recover by trying to re-render the segment
          () => reset()
        }
        className="mt-8 shadow-gentle"
        size="lg"
      >
        Try Again
      </Button>
    </div>
  );
}
