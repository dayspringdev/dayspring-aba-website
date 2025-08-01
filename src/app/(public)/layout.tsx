// FILE: src/app/(public)/layout.tsx

"use client";

// No longer need useEffect or useRouter here
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Toaster } from "sonner";

export default function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // The complex useEffect hook is now completely removed.
  // The layout is now a simple, clean presentation component.

  return (
    <div className="grid min-h-screen grid-rows-[auto_1fr_auto]">
      <Header />
      <main>{children}</main>
      <Footer />
      <Toaster />
    </div>
  );
}
