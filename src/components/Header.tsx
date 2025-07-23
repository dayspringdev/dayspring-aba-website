// FILE: src/components/Header.tsx

"use client";

import { Button } from "@/components/ui/button";
import Link from "next/link";
// We don't need useLenis for this new, simpler navigation
// import { useLenis } from "@/context/LenisContext";

export function Header() {
  // Since the new design doesn't have smooth scrolling to sections,
  // we can remove the Lenis logic for now to simplify.
  // The links will behave like standard page links.

  return (
    // --- CHANGE: Header bar is taller (h-28) and has a solid background ---
    // We remove bg-background/50 and backdrop-blur-lg
    <header className="sticky top-0 z-50 w-full border-b border-gray-200 bg-white">
      {/* --- CHANGE: The main container now has 3 direct children for our 3-column layout --- */}
      <div className="container mx-auto flex h-42 max-w-8xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* === Left Navigation Links === */}
        {/* This div takes up 1/3 of the space to help center the logo */}
        <nav className="flex w-1/3 items-center justify-start gap-20 text-md font-medium">
          {/* We'll use standard Next.js Link components now */}
          <Link
            href="/services" // Assuming you'll have a dedicated services page
            className="nav-link text-primary tracking-tight font-thin"
          >
            Services
          </Link>
          <Link
            href="/about" // Assuming a dedicated about page
            className="nav-link text-primary tracking-tight font-extralight"
          >
            About
          </Link>
          <Link
            href="/contact"
            className="nav-link text-primary tracking-tight font-extralight"
          >
            Contact
          </Link>
        </nav>

        {/* === Centered Logo === */}
        {/* This div is the new home for our centered logo */}
        <div className="flex w-1/3 justify-center">
          <Link href="/" className="flex flex-col items-center text-center">
            {/* The main, larger text */}
            <h1 className="text-4xl font-bold tracking-wide text-primary">
              Dayspring Behavioural
            </h1>
            {/* The smaller subtitle */}
            <p className="text-xs tracking-widest text-gray-500">
              THERAPEUTIC SERVICES
            </p>
          </Link>
        </div>

        {/* === Right Contact Button === */}
        {/* This div takes up the final 1/3 and pushes its content to the right */}
        <div className="flex w-1/3 justify-end">
          <Button
            asChild
            // --- CHANGE: The button now uses the "outline" style ---
            variant="outline"
            className="border-gray-800 text-gray-800 hover:bg-gray-800 hover:text-white h-11 px-6 text-base font-semibold"
          >
            <Link href="/contact/intake">Contact Us</Link>
          </Button>
        </div>
      </div>
    </header>
  );
}
