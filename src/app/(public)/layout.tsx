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
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      // This event fires when Supabase detects an auth token in the URL.
      if (event === "SIGNED_IN" && session) {
        // --- THIS IS THE FIX ---
        // Instead of getUser(), we use getClaims() to access the raw JWT claims.
        const { data: claims } = await supabase.auth.getClaims();

        // The 'amr' (Authentication Methods References) claim is what tells us
        // how the session was created. We cast it to the expected type.
        const amr = claims?.claims?.amr as { method: string }[] | undefined;

        // Check if one of the methods was 'recovery' (used for invites/resets).
        const isRecovery = amr?.some((m) => m.method === "recovery") ?? false;
        // --- END OF FIX ---

        // If it was a recovery/invite link, the user needs to set their password.
        // We immediately redirect them to the page that handles this.
        if (isRecovery) {
          router.push("/forgot-password");
        }
      }
    });

    // Clean up the listener when the component unmounts.
    return () => {
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
