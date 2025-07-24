// src/app/not-found.tsx

import { Button } from "@/components/ui/button";
import { AlertTriangle } from "lucide-react";
import Link from "next/link";

export default function NotFound() {
  return (
    // We don't need min-h-screen because the root layout already handles height.
    // This component will be rendered inside your main layout's {children}.
    <div className="flex flex-col items-center justify-center text-center py-20 lg:py-40">
      <AlertTriangle className="w-16 h-16 text-destructive mb-6" />
      <h1 className="text-6xl font-bold text-foreground">404</h1>
      <p className="mt-4 text-2xl font-medium text-foreground">
        Oops! Page Not Found
      </p>
      <p className="mt-2 max-w-md text-muted-foreground">
        The page you are looking for might have been removed, had its name
        changed, or is temporarily unavailable.
      </p>
      <Button asChild className="mt-8 shadow-gentle" size="lg">
        <Link href="/">Return to Homepage</Link>
      </Button>
    </div>
  );
}
