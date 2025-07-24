// src/components/HomePageContent.tsx

"use client";

import type { HomePageData } from "@/types/homepage";
import Hero from "@/components/Hero";
import MissionVision from "@/components/MissionVision";
import CoreValues from "./CoreValues";
import AboutUs from "./AboutUs";
import Services from "./Services";
import HowItWorks from "./HowItWorks";
import FAQ from "./FAQ";
import Contact from "./Contact";

// Re-introduce the 'content' prop
export function HomePageContent({ content }: { content: HomePageData | null }) {
  // Add a robust check for loading or failed fetch
  if (!content) {
    // You can return a full-page loader/skeleton here
    return <div>Loading page...</div>;
  }

  return (
    <>
      {/* Pass the real data down to each component */}
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
