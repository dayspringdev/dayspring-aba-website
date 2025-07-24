// FILE: src/components/Header.tsx

"use client";

import { Button } from "@/components/ui/button";
import Link from "next/link";
import { useLenis } from "@/context/LenisContext";
import { usePathname } from "next/navigation";
import Image from "next/image"; // 1. IMPORT the Image component

export function Header() {
  const lenis = useLenis();
  const pathname = usePathname();

  const handleNavigation = (
    e: React.MouseEvent<HTMLAnchorElement>,
    targetId: string
  ) => {
    if (pathname === "/") {
      e.preventDefault();
      if (lenis) {
        lenis.scrollTo(targetId, { offset: -96 });
      }
    }
  };

  const handleLogoClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    if (pathname === "/") {
      e.preventDefault();
      if (lenis) {
        lenis.scrollTo(0);
      }
    }
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/50 bg-background/95 backdrop-blur-sm">
      <div className="container mx-auto flex h-36 max-w-8xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* === Left Navigation Links (Unchanged) === */}
        <nav className="flex w-1/3 items-center justify-start gap-10 text-md font-medium">
          <Link
            href="/#services"
            onClick={(e) => handleNavigation(e, "#services")}
            className="nav-link text-muted-foreground hover:text-primary tracking-tight font-thin ease-in-out"
          >
            Services
          </Link>
          <Link
            href="/#about"
            onClick={(e) => handleNavigation(e, "#about")}
            className="nav-link text-muted-foreground hover:text-primary tracking-tight font-extralight ease-in-out"
          >
            About
          </Link>
          <Link
            href="/#faq"
            onClick={(e) => handleNavigation(e, "#faq")}
            className="nav-link text-muted-foreground hover:text-primary tracking-tight font-extralight ease-in-out"
          >
            FAQ
          </Link>
          <Link
            href="/#contact"
            onClick={(e) => handleNavigation(e, "#contact")}
            className="nav-link text-muted-foreground hover:text-primary tracking-tight font-extralight ease-in-out"
          >
            Contact
          </Link>
        </nav>

        {/* === Centered Logo (UPDATED) === */}
        {/* === Centered Logo (UPDATED) === */}
        <div className="flex w-1/3 justify-center">
          <Link
            href="/"
            onClick={handleLogoClick}
            className="flex items-center gap-2"
          >
            {/* Child 1: The Logo Image */}
            <Image
              src="/logo.svg"
              alt="Dayspring Behavioural Therapeutic Services Logo"
              width={120}
              height={120}
              priority
            />

            {/* Child 2: The Text Container */}
            <div className="flex flex-col">
              {/* === THE REAL FIX IS HERE === */}
              {/* By wrapping each word in a block-level span, we force the h1 to be only as wide as the longest word. */}
              <h1 className="text-4xl font-bold tracking-wide text-primary">
                <span className="block">Dayspring</span>
                <span className="block">Behavioural</span>
              </h1>
              <p className="text-xs tracking-widest text-muted-foreground">
                THERAPEUTIC SERVICES
              </p>
            </div>
          </Link>
        </div>

        {/* === Right Contact Button (Unchanged) === */}
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
