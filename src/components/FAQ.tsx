// FILE: src/components/FAQ.tsx

"use client";

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { scroller } from "react-scroll"; // <-- ADD this import
import { AnimatedSection } from "./AnimatedSection";
import type { HomePageData } from "@/types/homepage";

// Define the component's props
interface FAQProps {
  data: HomePageData["faq"];
}

const FAQ = ({ data }: FAQProps) => {
  // THIS IS THE UPDATED FUNCTION
  const handleScrollToContact = () => {
    scroller.scrollTo("contact", {
      // The target element's ID
      smooth: true,
      duration: 500,
      offset: -96, // Account for the sticky header
    });
  };

  return (
    <AnimatedSection id="faq" className="py-20 bg-background scroll-mt-20">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
            {data.title}
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            {data.subtitle}
          </p>
        </div>

        <div className="max-w-3xl mx-auto">
          <Accordion type="single" collapsible className="space-y-4">
            {data.questions.map((faq, index) => (
              <AccordionItem
                key={index}
                value={`item-${index}`}
                className="bg-card border border-border/50 rounded-xl px-6 shadow-gentle hover:shadow-warm transition-all duration-300"
              >
                <AccordionTrigger className="text-left font-semibold text-foreground hover:text-primary py-6">
                  {faq.question}
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground leading-relaxed pb-6">
                  {faq.answer}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>

        {/* CTA after FAQ */}
        <div className="text-center mt-16">
          <p className="text-muted-foreground mb-6">
            Still have questions? We&apos;re here to help and would love to chat
            with you.
          </p>
          <Button
            onClick={handleScrollToContact} // This onClick handler is now correct
            size="lg"
            className="shadow-gentle"
          >
            Get in Touch
          </Button>
        </div>
      </div>
    </AnimatedSection>
  );
};

export default FAQ;
