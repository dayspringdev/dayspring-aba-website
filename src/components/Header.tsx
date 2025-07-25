"use client";

import { useState } from "react"; // 1. Import useState for menu state
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { useLenis } from "@/context/LenisContext";
import { usePathname } from "next/navigation";
import Image from "next/image";
import { Menu, X } from "lucide-react"; // 2. Import icons for the mobile menu
import { cn } from "@/lib/utils";

export function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false); // 3. State to manage mobile menu visibility
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
    setIsMenuOpen(false); // Close menu on navigation
  };

  const handleLogoClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    if (pathname === "/") {
      e.preventDefault();
      if (lenis) {
        lenis.scrollTo(0);
      }
    }
    setIsMenuOpen(false); // Close menu on navigation
  };

  return (
    // Add relative positioning to be a container for the absolute mobile menu
    <header className="sticky top-0 z-50 w-full border-b border-border/50 bg-background/95 backdrop-blur-sm">
      {/* 4. Adjust header height and layout for mobile */}
      <div className="container mx-auto flex h-34 max-w-8xl items-center justify-between px-4 sm:px-6 lg:p-8">
        {/* === 5. Desktop Navigation Links (Hidden on Mobile) === */}
        <nav className="hidden w-1/3 items-center justify-start gap-10 lg:gap-6 text-md font-medium lg:flex">
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

        {/* This empty div ensures the logo stays centered on desktop using the 3-column layout */}
        {/* <div className="hidden w-1/3 lg:flex lg:justify-center"></div> */}

        {/* === 6. Centered Logo (Responsive) === */}
        {/* On mobile, this becomes the left-aligned item */}
        <div className="flex justify-start lg:w-1/3 lg:justify-center">
          <Link
            href="/"
            onClick={handleLogoClick}
            className="flex items-center gap-2"
          >
            <Image
              src="/logo.svg"
              alt="Dayspring Behavioural Therapeutic Services Logo"
              width={120}
              height={120}
              priority
              // Adjust image size for mobile
              className="h-20 w-20 lg:h-[90px] lg:w-[90px]"
            />
            {/* Hide text on smaller screens to prevent clutter */}
            <div className="hidden flex-col sm:flex">
              <h1 className="text-2xl font-bold tracking-wide text-primary lg:text-3xl">
                <span className="block">Dayspring</span>
                <span className="block">Behavioural</span>
              </h1>
              <p className="text-xs tracking-widest text-muted-foreground">
                THERAPEUTIC SERVICES
              </p>
            </div>
          </Link>
        </div>

        {/* === 7. Desktop "Book" Button (Hidden on Mobile) === */}
        <div className="hidden w-1/3 justify-end lg:flex">
          <Button
            asChild
            className="bg-primary hover:bg-primary-soft text-primary-foreground shadow-gentle"
          >
            <Link href="/book">Book Consultation</Link>
          </Button>
        </div>

        {/* === 8. Mobile Menu Button (Hamburger) === */}
        <div className="flex items-center lg:hidden">
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="rounded-md p-2 text-primary focus:outline-none focus:ring-2 focus:ring-ring"
            aria-label="Toggle menu"
          >
            {isMenuOpen ? <X size={28} /> : <Menu size={28} />}
          </button>
        </div>
      </div>

      {/* === 9. Mobile Menu Overlay === */}
      <div
        className={cn(
          "absolute left-0 w-full bg-background/95 backdrop-blur-sm lg:hidden",
          "transform transition-all duration-300 ease-in-out",
          isMenuOpen
            ? "translate-y-0 opacity-100"
            : "-translate-y-4 opacity-0 pointer-events-none"
        )}
      >
        <nav className="flex flex-col items-center gap-6 px-4 py-8">
          <Link
            href="/#services"
            onClick={(e) => handleNavigation(e, "#services")}
            className="text-lg font-medium text-muted-foreground hover:text-primary"
          >
            Services
          </Link>
          <Link
            href="/#about"
            onClick={(e) => handleNavigation(e, "#about")}
            className="text-lg font-medium text-muted-foreground hover:text-primary"
          >
            About
          </Link>
          <Link
            href="/#faq"
            onClick={(e) => handleNavigation(e, "#faq")}
            className="text-lg font-medium text-muted-foreground hover:text-primary"
          >
            FAQ
          </Link>
          <Link
            href="/#contact"
            onClick={(e) => handleNavigation(e, "#contact")}
            className="text-lg font-medium text-muted-foreground hover:text-primary"
          >
            Contact
          </Link>
          <Button
            asChild
            size="lg"
            className="mt-4 w-full max-w-xs"
            onClick={() => setIsMenuOpen(false)}
          >
            <Link href="/book">Book Consultation</Link>
          </Button>
        </nav>
      </div>
    </header>
  );
}
