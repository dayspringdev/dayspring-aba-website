// FILE: src/components/Header.tsx

"use client";

import { Button } from "@/components/ui/button";
import Link from "next/link";
import { useLenis } from "@/context/LenisContext";

export function Header() {
  const lenis = useLenis();

  const handleScrollTo = (targetId: string) => {
    if (lenis) {
      const targetElement = document.querySelector(targetId);
      if (targetElement instanceof HTMLElement) {
        lenis.scrollTo(targetElement, { offset: -80 });
      }
    }
  };

  // New function to handle scrolling to the top of the page
  const handleScrollToTop = () => {
    if (lenis) {
      lenis.scrollTo(0); // 0 signifies the top of the page
    }
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b border-[var(--border)] bg-[var(--background)]/50 backdrop-blur-lg">
      <div className="container mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* The logo is now a button that calls our new function */}
        <button onClick={handleScrollToTop} className="flex items-center">
          <span className="text-xl font-bold text-[var(--primary)]">DBTS</span>
        </button>
        <nav className="hidden items-center space-x-8 text-sm font-medium md:flex">
          <button
            onClick={() => handleScrollTo("#about")}
            className="nav-link text-[var(--foreground)] hover:text-[var(--primary)]"
          >
            About
          </button>
          <button
            onClick={() => handleScrollTo("#services")}
            className="nav-link text-[var(--foreground)] hover:text-[var(--primary)]"
          >
            Services
          </button>
          <button
            onClick={() => handleScrollTo("#faq")}
            className="nav-link text-[var(--foreground)] hover:text-[var(--primary)]"
          >
            FAQ
          </button>
        </nav>
        <Button
          asChild
          className="inline-flex justify-center h-10 items-center text-base font-semibold shadow-lg transition-all hover:scale-105 active:scale-95"
        >
          <Link href="/contact">Contact Us</Link>
        </Button>
      </div>
    </header>
  );
}
