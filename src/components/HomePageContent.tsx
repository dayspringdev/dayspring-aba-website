// FILE: src/components/HomePageContent.tsx

"use client"; // This component uses animations, so it must be a client component.

import React from "react";
import type { HomePageData } from "@/types/homepage"; // <-- Import our new data contract
import Hero from "@/components/Hero";
import MissionVision from "@/components/MissionVision";
import CoreValues from "./CoreValues"; // <-- IMPORT CORE VALUES
import AboutUs from "./AboutUs"; // <-- IMPORT ABOUT US
import Services from "./Services"; // <-- IMPORT NEW SERVICES
import HowItWorks from "./HowItWorks"; // <-- IMPORT NEW HOW IT WORKS
import FAQ from "./FAQ"; // <-- IMPORT FAQ
import Contact from "./Contact"; // <-- IMPORT CONTACT

export function HomePageContent({ content }: { content: HomePageData | null }) {
  if (!content) {
    return <div>Loading page content...</div>;
  }

  return (
    <>
      <Hero />
      <MissionVision />

      <CoreValues />
      <AboutUs />

      <Services />
      <HowItWorks />
      <FAQ />
      <Contact />
    </>
  );
}
