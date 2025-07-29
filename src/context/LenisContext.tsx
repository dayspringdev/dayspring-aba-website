// FILE: src/context/LenisContext.tsx

"use client";

import { createContext, useContext, useEffect, useState } from "react";
import Lenis from "@studio-freight/lenis";

const LenisContext = createContext<Lenis | null>(null);

export const useLenis = () => {
  return useContext(LenisContext);
};

export const LenisProvider = ({ children }: { children: React.ReactNode }) => {
  const [lenis, setLenis] = useState<Lenis | null>(null);

  useEffect(() => {
    // --- THIS IS THE FIX ---
    // 1. Check if the user has a preference for reduced motion.
    const prefersReducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;

    // 2. If they do, we do NOT initialize Lenis and exit early.
    // The site will use the browser's native, non-animated scrolling.
    if (prefersReducedMotion) {
      return;
    }
    // --- END OF FIX ---

    // 3. If they don't have a preference, initialize Lenis as normal.
    const newLenisInstance = new Lenis({
      lerp: 0.1,
    });

    setLenis(newLenisInstance);

    const animate = (time: number) => {
      newLenisInstance.raf(time);
      requestAnimationFrame(animate);
    };

    const rafId = requestAnimationFrame(animate);

    // Cleanup function
    return () => {
      cancelAnimationFrame(rafId);
      newLenisInstance.destroy();
      setLenis(null);
    };
  }, []); // The empty array ensures this runs only once on mount

  return (
    <LenisContext.Provider value={lenis}>{children}</LenisContext.Provider>
  );
};
