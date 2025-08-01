// FILE: src/app/(public)/layout.tsx

"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Toaster } from "sonner";
import { createClient } from "@/lib/supabase/client";

export default function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = createClient();
  const router = useRouter();

  useEffect(() => {
    // LOG 1: Confirm the layout's effect hook is running.
    console.log("[PublicLayout] Effect hook initiated. Setting up listener...");

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      // LOG 2: See every auth event that fires. This is the most important log.
      console.log("[onAuthStateChange] Event fired!", { event, session });

      if (event === "SIGNED_IN" && session) {
        // LOG 3: Confirm we've entered the logic block for a SIGNED_IN event.
        console.log(
          "[onAuthStateChange] SIGNED_IN event detected. Checking claims..."
        );

        const { data: claims } = await supabase.auth.getClaims();

        const amr = claims?.claims?.amr as { method: string }[] | undefined;
        const isRecovery = amr?.some((m) => m.method === "recovery") ?? false;

        // LOG 4: Check the result of our recovery logic.
        console.log("[onAuthStateChange] Claims inspection complete.", {
          claims,
          isRecovery,
        });

        if (isRecovery) {
          // LOG 5: This is the final gate. If we see this, the redirect should happen.
          console.log(
            "[onAuthStateChange] Recovery session confirmed. REDIRECTING to /forgot-password..."
          );
          router.push("/forgot-password");
        } else {
          console.log(
            "[onAuthStateChange] Not a recovery session. No redirect needed."
          );
        }
      }
    });

    return () => {
      console.log("[PublicLayout] Cleaning up auth state listener.");
      subscription.unsubscribe();
    };
  }, [supabase, router]);

  return (
    <div className="grid min-h-screen grid-rows-[auto_1fr_auto]">
      <Header />
      <main>{children}</main>
      <Footer />
      <Toaster />
    </div>
  );
}
