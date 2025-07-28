// FILE: src/app/(admin)/login/page.tsx

import { Suspense } from "react";
import LoginPageClient from "@/components/admin/LoginPageClient";
import { Skeleton } from "@/components/ui/skeleton";

// A simple loading skeleton that mimics the login card
const LoginSkeleton = () => (
  <div className="flex min-h-[80vh] w-full items-center justify-center bg-background/50">
    <div className="w-full max-w-sm space-y-4">
      <Skeleton className="h-10 w-3/4" />
      <Skeleton className="h-6 w-full" />
      <Skeleton className="h-40 w-full" />
      <Skeleton className="h-10 w-full" />
    </div>
  </div>
);

export default function LoginPage() {
  return (
    <Suspense fallback={<LoginSkeleton />}>
      <LoginPageClient />
    </Suspense>
  );
}
