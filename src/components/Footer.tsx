// FILE: src/components/Footer.tsx

"use client";

import { useEffect, useState } from "react";
import NextLink from "next/link"; // For the external /login link
import { Mail, Instagram, Facebook, Linkedin, Twitter } from "lucide-react";
import Image from "next/image";
import type { SocialMediaLink } from "@/types/homepage";
import { Link as ScrollLink, animateScroll } from "react-scroll"; // <-- CORRECTLY IMPORT BOTH

// A map to look up the correct icon component based on the string from the database.
const socialIcons = {
  Instagram,
  Facebook,
  Linkedin,
  Twitter,
};

export function Footer() {
  const [socialLinks, setSocialLinks] = useState<SocialMediaLink[]>([]);

  useEffect(() => {
    const fetchSocialLinks = async () => {
      try {
        const response = await fetch("/api/social-links");
        if (!response.ok) throw new Error("Failed to fetch social links");
        const data: SocialMediaLink[] = await response.json();
        setSocialLinks(data);
      } catch (error) {
        console.error("Error fetching social links for footer:", error);
      }
    };
    fetchSocialLinks();
  }, []);

  // Correctly scrolls to the top of the page using the imported animateScroll
  const handleScrollToTop = () => {
    animateScroll.scrollToTop({
      smooth: true,
      duration: 500,
    });
  };

  return (
    <footer className="w-full border-t border-border/50 bg-primary text-primary-foreground">
      <div className="container mx-auto grid max-w-7xl grid-cols-1 gap-8 px-4 py-12 sm:px-6 md:grid-cols-3 lg:px-8">
        {/* Column 1: DBTS Section */}
        <div>
          <button
            onClick={handleScrollToTop}
            className="flex items-center gap-3 text-left"
          >
            <Image
              src="/logo.svg"
              alt="Dayspring Logo"
              width={90}
              height={90}
            />
            <div className="flex flex-col">
              <h3 className="text-2xl font-bold tracking-wide text-primary-foreground">
                <span className="block">Dayspring</span>
                <span className="block">Behavioural</span>
              </h3>
              <p className="text-xs tracking-widest text-primary-foreground/80">
                THERAPEUTIC SERVICES
              </p>
            </div>
          </button>
          <p className="mt-4 text-sm text-primary-foreground/80">
            Providing compassionate care for a brighter tomorrow.
          </p>
        </div>

        {/* Column 2 & 3 */}
        <div className="md:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-8">
          <div>
            <h4 className="font-semibold text-primary-foreground">
              Navigation
            </h4>
            <ul className="mt-4 space-y-2">
              {/* --- THIS IS THE FIX --- */}
              {/* Each ScrollLink now has the essential 'href' attribute for SEO */}
              <li>
                <ScrollLink
                  to="about"
                  href="/#about"
                  smooth={true}
                  duration={500}
                  offset={-96}
                  className="text-sm text-primary-foreground/80 hover:text-primary-foreground ease-in-out cursor-pointer"
                >
                  About
                </ScrollLink>
              </li>
              <li>
                <ScrollLink
                  to="services"
                  href="/#services"
                  smooth={true}
                  duration={500}
                  offset={-96}
                  className="text-sm text-primary-foreground/80 hover:text-primary-foreground ease-in-out cursor-pointer"
                >
                  Services
                </ScrollLink>
              </li>
              <li>
                <ScrollLink
                  to="faq"
                  href="/#faq"
                  smooth={true}
                  duration={500}
                  offset={-96}
                  className="text-sm text-primary-foreground/80 hover:text-primary-foreground ease-in-out cursor-pointer"
                >
                  FAQ
                </ScrollLink>
              </li>
              <li>
                <ScrollLink
                  to="contact"
                  href="/#contact"
                  smooth={true}
                  duration={500}
                  offset={-96}
                  className="text-sm text-primary-foreground/80 hover:text-primary-foreground ease-in-out cursor-pointer"
                >
                  Contact
                </ScrollLink>
              </li>
              {/* --- END OF FIX --- */}
            </ul>
          </div>
          <div>
            <h4 className="font-semibold text-primary-foreground mb-4">
              Get In Touch
            </h4>
            <div className="space-y-4">
              <div className="flex items-start space-x-3">
                <Mail
                  className="text-faith-light mt-1 flex-shrink-0"
                  size={18}
                />
                <div>
                  <p className="text-primary-foreground font-medium">
                    dayspringbehavioural@gmail.com
                  </p>
                  <p className="text-sm text-primary-foreground/80">
                    We&apos;d love to hear from you
                  </p>
                </div>
              </div>
              <div className="pt-4">
                <p className="text-sm text-primary-foreground/80 mb-2">
                  Follow our journey:
                </p>
                {socialLinks.length > 0 ? (
                  <div className="flex items-center space-x-3">
                    {socialLinks.map((link) => {
                      const IconComponent =
                        socialIcons[link.icon as keyof typeof socialIcons];
                      if (!IconComponent) return null;
                      return (
                        <a
                          key={link.icon}
                          href={link.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="w-8 h-8 bg-primary-foreground/10 rounded-lg flex items-center justify-center text-primary-foreground transition-opacity hover:opacity-80"
                          aria-label={`Follow us on ${link.icon}`}
                        >
                          <IconComponent size={16} />
                        </a>
                      );
                    })}
                  </div>
                ) : (
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-primary-foreground/10 rounded-lg flex items-center justify-center">
                      <Instagram
                        className="text-primary-foreground/50"
                        size={16}
                      />
                    </div>
                    <span className="text-sm text-primary-foreground/80">
                      Socials coming soon!
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Copyright Section */}
      <div className="border-t border-primary-foreground/20 py-6">
        <div className="container mx-auto flex flex-col items-center justify-between gap-4 px-4 text-center sm:flex-row sm:px-6 lg:px-8">
          <p className="text-sm text-primary-foreground/80">
            © {new Date().getFullYear()} Dayspring Behavioural Therapeutic
            Services. All Rights Reserved.
          </p>
          <NextLink
            href="/login"
            className="text-xs text-primary-foreground/60 transition-colors hover:text-primary-foreground ease-in-out"
          >
            Admin Login
          </NextLink>
        </div>
      </div>
    </footer>
  );
}
