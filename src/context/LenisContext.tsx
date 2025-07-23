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
    const newLenisInstance = new Lenis({
      lerp: 0.1,
    });

    setLenis(newLenisInstance);

    const animate = (time: number) => {
      newLenisInstance.raf(time);
      requestAnimationFrame(animate);
    };

    const rafId = requestAnimationFrame(animate);

    return () => {
      cancelAnimationFrame(rafId);
      newLenisInstance.destroy();
      setLenis(null);
    };
  }, []);

  return (
    <LenisContext.Provider value={lenis}>{children}</LenisContext.Provider>
  );
};
