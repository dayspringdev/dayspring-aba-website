"use client";

import { motion, HTMLMotionProps } from "framer-motion"; // <-- Import HTMLMotionProps
import React from "react";

// --- THIS IS THE CHANGE ---
// We're defining the props by combining framer-motion's props with our own.
// `HTMLMotionProps<'section'>` includes all valid props for a `<motion.section>`,
// including standard HTML attributes like `id` and special motion props.
interface AnimatedSectionProps extends HTMLMotionProps<"section"> {
  children: React.ReactNode;
  className?: string;
}

export function AnimatedSection({
  children,
  className,
  ...props
}: AnimatedSectionProps) {
  return (
    // The rest of the component is the same. The spread props are now fully type-safe.
    <motion.section
      className={className}
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.6, ease: "easeInOut" }}
      {...props}
    >
      {children}
    </motion.section>
  );
}
