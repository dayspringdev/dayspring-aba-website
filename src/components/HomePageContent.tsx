// FILE: src/components/HomePageContent.tsx

"use client";

import type { HomePageData } from "@/types/homepage";
import { useEffect } from "react"; // <-- ADD useEffect
import { scroller } from "react-scroll"; // <-- ADD scroller
import Hero from "@/components/Hero";
import MissionVision from "./MissionVision";
import CoreValues from "./CoreValues";
import AboutUs from "./AboutUs";
import Services from "./Services";
import HowItWorks from "./HowItWorks";
import FAQ from "./FAQ";
import Contact from "./Contact";
import React from "react"; // React import is good practice but not strictly needed here

// This component is complete and correct.
export function HomePageContent({ content }: { content: HomePageData | null }) {
  useEffect(() => {
    // Check if there is a hash in the URL
    const hash = window.location.hash;
    if (hash) {
      // Extract the element ID from the hash (e.g., "#services" -> "services")
      const elementId = hash.substring(1);
      // Use a small timeout to ensure the element has rendered
      setTimeout(() => {
        scroller.scrollTo(elementId, {
          smooth: true,
          duration: 800, // A slightly longer duration feels good on page load
          offset: -96,
        });
      }, 100); // 100ms delay
    }
  }, []); // Empty array means this runs only once when the component mounts
  // --- END OF HOOK ---

  if (!content) {
    return <div>Loading page...</div>;
  }

  return (
    <>
      {/* Each of these components already contains the necessary id for react-scroll */}
      <Hero data={content.hero} />
      <MissionVision data={content.missionVision} />
      <CoreValues data={content.coreValues} />
      <AboutUs data={content.aboutUs} />
      <Services data={content.services} />
      <HowItWorks data={content.howItWorks} />
      <FAQ data={content.faq} />
      <Contact data={content.contact} />
    </>
  );
}
