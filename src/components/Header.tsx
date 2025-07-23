// FILE: src/components/Header.tsx

"use client";

import { Button } from "@/components/ui/button";
import Link from "next/link";
import { useLenis } from "@/context/LenisContext"; // 1. IMPORT useLenis

export function Header() {
  const lenis = useLenis(); // 2. GET the Lenis instance

  // 3. CREATE a scroll handler function
  const handleScrollTo = (targetId: string) => {
    // Check if Lenis is available
    if (lenis) {
      // Use the scrollTo method with an offset to account for the sticky header
      // h-24 is 96px, so we use a negative offset.
      lenis.scrollTo(targetId, { offset: -96 });
    }
  };

  const handleScrollToTop = () => {
    if (lenis) {
      lenis.scrollTo(0);
    }
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/50 bg-background/95 backdrop-blur-sm">
      <div className="container mx-auto flex h-24 max-w-8xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* === Left Navigation Links === */}
        <nav className="flex w-1/3 items-center justify-start gap-10 text-md font-medium">
          {/* 4. CHANGE Links to Buttons with onClick handlers */}
          <button
            onClick={() => handleScrollTo("#services")}
            className="nav-link text-muted-foreground hover:text-primary tracking-tight font-thin ease-in-out"
          >
            Services
          </button>
          <button
            onClick={() => handleScrollTo("#about")}
            className="nav-link text-muted-foreground hover:text-primary tracking-tight font-extralight ease-in-out"
          >
            About
          </button>
          <button
            onClick={() => handleScrollTo("#faq")}
            className="nav-link text-muted-foreground hover:text-primary tracking-tight font-extralight ease-in-out"
          >
            FAQ
          </button>
          <button
            onClick={() => handleScrollTo("#contact")}
            className="nav-link text-muted-foreground hover:text-primary tracking-tight font-extralight ease-in-out"
          >
            Contact
          </button>
        </nav>

        {/* === Centered Logo (this remains a Link) === */}
        <div className="flex w-1/3 justify-center">
          <button
            onClick={handleScrollToTop}
            className="flex flex-col items-center text-center"
          >
            <h1 className="text-4xl font-bold tracking-wide text-primary">
              Dayspring Behavioural
            </h1>
            <p className="text-xs tracking-widest text-muted-foreground">
              THERAPEUTIC SERVICES
            </p>
          </button>
        </div>

        {/* === Right Contact Button (this remains a Link to a different page) === */}
        <div className="flex w-1/3 justify-end">
          <Button
            asChild
            className="bg-primary hover:bg-primary-soft text-primary-foreground shadow-gentle"
          >
            <Link href="/book">Book Consultation</Link>
          </Button>
        </div>
      </div>
    </header>
  );
}
