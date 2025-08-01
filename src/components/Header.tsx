// FILE: src/components/Header.tsx

"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import NextLink from "next/link";
import { scroller, animateScroll } from "react-scroll";
import { usePathname } from "next/navigation";
import Image from "next/image";
import { Menu, X } from "lucide-react";
import { cn } from "@/lib/utils";

// This is the new, "smarter" NavLink component.
const NavLink = ({
  to,
  children,
  onLinkClick,
}: {
  to: string;
  children: React.ReactNode;
  onLinkClick?: () => void;
}) => {
  const pathname = usePathname();
  // const router = useRouter();

  const handleNav = (e: React.MouseEvent<HTMLAnchorElement>) => {
    // Always call the passed onLinkClick for closing the mobile menu
    if (onLinkClick) {
      onLinkClick();
    }

    // If we are already on the homepage, use smooth scroll.
    if (pathname === "/") {
      e.preventDefault(); // Stop the browser from navigating
      scroller.scrollTo(to, {
        smooth: true,
        duration: 500,
        offset: -96,
      });
    } else {
      // If we are on another page (e.g., /book), we let the NextLink navigate.
      // The href="/#about" will take us to the homepage, and the useEffect
      // in HomePageContent will handle the scroll.
      // We don't need to do anything extra here.
    }
  };

  return (
    <NextLink
      href={`/#${to}`} // This ensures navigation from other pages works.
      onClick={handleNav}
      className="nav-link text-muted-foreground hover:text-primary tracking-tight font-medium ease-in-out cursor-pointer"
    >
      {children}
    </NextLink>
  );
};

export function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const pathname = usePathname();

  const handleLogoClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    if (pathname === "/") {
      e.preventDefault();
      animateScroll.scrollToTop({ smooth: true, duration: 500 });
    }
    setIsMenuOpen(false);
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/50 bg-background/95 backdrop-blur-sm">
      <div className="container mx-auto flex h-34 max-w-8xl items-center justify-between px-4 sm:px-6 lg:p-8">
        {/* === Desktop Navigation Links === */}
        <nav className="hidden w-1/3 items-center justify-start gap-10 lg:gap-6 text-md font-medium lg:flex">
          <NavLink to="services">Services</NavLink>
          <NavLink to="about">About</NavLink>
          <NavLink to="faq">FAQ</NavLink>
          <NavLink to="contact">Contact</NavLink>
        </nav>

        {/* Centered Logo */}
        <div className="flex justify-start lg:w-1/3 lg:justify-center">
          <NextLink
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
              className="h-20 w-20 lg:h-[90px] lg:w-[90px]"
            />
            <div className="hidden flex-col sm:flex">
              <div className="text-2xl font-bold tracking-wide text-primary lg:text-3xl">
                <span className="block">Dayspring</span>
                <span className="block">Behavioural</span>
              </div>
              <p className="text-xs tracking-widest text-muted-foreground">
                THERAPEUTIC SERVICES
              </p>
            </div>
          </NextLink>
        </div>

        {/* Desktop "Book" Button */}
        <div className="hidden w-1/3 justify-end lg:flex">
          <Button
            asChild
            className="bg-primary hover:bg-primary-soft text-primary-foreground shadow-gentle"
          >
            <NextLink href="/book">Book Consultation</NextLink>
          </Button>
        </div>

        {/* Mobile Menu Button */}
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

      {/* Mobile Menu Overlay */}
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
          <NavLink to="services" onLinkClick={() => setIsMenuOpen(false)}>
            Services
          </NavLink>
          <NavLink to="about" onLinkClick={() => setIsMenuOpen(false)}>
            About
          </NavLink>
          <NavLink to="faq" onLinkClick={() => setIsMenuOpen(false)}>
            FAQ
          </NavLink>
          <NavLink to="contact" onLinkClick={() => setIsMenuOpen(false)}>
            Contact
          </NavLink>

          <Button
            asChild
            size="lg"
            className="mt-4 w-full max-w-xs"
            onClick={() => setIsMenuOpen(false)}
          >
            <NextLink href="/book">Book Consultation</NextLink>
          </Button>
        </nav>
      </div>
    </header>
  );
}
