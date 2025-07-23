// FILE: src/app/(public)/layout.tsx

"use client"; // This must be a client component to use the provider

import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Toaster } from "sonner";
import { LenisProvider } from "@/context/LenisContext"; // Import the provider

export default function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    // Wrap the entire layout with LenisProvider
    <LenisProvider>
      <div className="grid min-h-screen grid-rows-[auto_1fr_auto]">
        <Header />
        <main>{children}</main>
        <Footer />
        <Toaster />
      </div>
    </LenisProvider>
  );
}
