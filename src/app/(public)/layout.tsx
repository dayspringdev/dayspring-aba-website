// FILE: src/app/(public)/layout.tsx

"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Toaster } from "sonner";
import { toast } from "sonner"; // Import toast

export default function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();

  useEffect(() => {
    // Check for our signal when the layout first loads
    const isNewInvite = sessionStorage.getItem("is_new_invite");

    if (isNewInvite === "true") {
      console.log(
        "[PublicLayout] Invite flag found in sessionStorage. Redirecting to login..."
      );

      // Important: Remove the flag so this doesn't run again if the user navigates back
      sessionStorage.removeItem("is_new_invite");

      // Give a helpful toast message to guide the user
      toast.info("Account Confirmed!", {
        description:
          "Your account is now registered. Please use the 'Forgot Password' link to set your password for the first time.",
        duration: 10000, // Make it last longer
      });

      // Redirect the user to the login page
      router.push("/login");
    }
  }, [router]); // This effect only needs to run once per page load

  return (
    <div className="grid min-h-screen grid-rows-[auto_1fr_auto]">
      <Header />
      <main>{children}</main>
      <Footer />
      <Toaster />
    </div>
  );
}
