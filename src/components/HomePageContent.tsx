// FILE: src/components/HomePageContent.tsx

"use client";

import type { HomePageData } from "@/types/homepage";
import { useEffect } from "react";
import { scroller } from "react-scroll";
import Hero from "@/components/Hero";
import MissionVision from "./MissionVision";
import CoreValues from "./CoreValues";
import AboutUs from "./AboutUs";
import Services from "./Services";
import HowItWorks from "./HowItWorks";
import FAQ from "./FAQ";
import Contact from "./Contact";
import React from "react";

export function HomePageContent({ content }: { content: HomePageData | null }) {
  // This hook handles scrolling when navigating from another page.
  useEffect(() => {
    const hash = window.location.hash;
    if (hash) {
      // Remove the '#' from the hash to get the element ID
      const elementId = hash.substring(1);
      // Use a small timeout to ensure the page has rendered before scrolling
      setTimeout(() => {
        scroller.scrollTo(elementId, {
          smooth: true,
          duration: 800,
          offset: -96, // Adjust for your sticky header height
        });
      }, 100);
    }
  }, []); // The empty array ensures this runs only once when the component mounts

  if (!content) {
    return <div>Loading page...</div>;
  }

  return (
    <>
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
