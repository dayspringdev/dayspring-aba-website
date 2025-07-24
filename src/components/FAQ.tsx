// src/components/FAQ.tsx
"use client";

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Button } from "@/components/ui/button"; // 2. IMPORT the Button component
import { useLenis } from "@/context/LenisContext"; // 3. IMPORT useLenis
import { AnimatedSection } from "./AnimatedSection";

const FAQ = () => {
  const lenis = useLenis(); // 4. GET the Lenis instance

  // 5. CREATE a scroll handler function
  const handleScrollToContact = () => {
    if (lenis) {
      // Use the same offset as the header for consistency
      lenis.scrollTo("#contact", { offset: -96 });
    }
  };

  const faqs = [
    {
      question: "What is Applied Behavior Analysis (ABA) therapy?",
      answer:
        "ABA therapy is an evidence-based treatment approach that focuses on improving specific behaviors and teaching new skills. It uses principles of learning and behavior to help children with autism and other developmental needs reach their full potential. Our faith-integrated approach combines these scientific methods with Christian values of love, patience, and hope.",
    },
    {
      question: "How do you integrate faith into your therapy approach?",
      answer:
        "We honor and respect your family's Christian values while providing professional ABA services. This means creating a therapy environment rooted in love, grace, and the belief that every child is wonderfully made by God. We work collaboratively with families to ensure our approach aligns with your faith and values, while maintaining the highest clinical standards.",
    },
    {
      question: "What ages do you work with?",
      answer:
        "We primarily work with children ages 2-12, though we can accommodate older children based on individual needs and circumstances. Early intervention is often most effective, but we believe it's never too late to make meaningful progress with the right support and approach.",
    },
    {
      question: "Do you accept insurance?",
      answer:
        "We are working to become credentialed with major insurance providers. Currently, we offer private pay options with flexible payment plans available. We're happy to provide documentation that may help with insurance reimbursement, and we can discuss financial options during your free consultation.",
    },
    {
      question: "Where do therapy sessions take place?",
      answer:
        "We offer flexible service locations including your home, virtual sessions, school collaboration, and community-based settings. We believe children learn best in environments where they feel comfortable and safe, so we'll work with you to determine the most effective setting for your child's needs.",
    },
    {
      question: "What makes your approach trauma-informed?",
      answer:
        "Our trauma-informed approach recognizes that some children may have experienced difficult situations that affect their learning and behavior. We prioritize building trust, ensuring safety, and creating positive therapeutic relationships. We use gentle, respectful methods and always consider your child's emotional well-being alongside their behavioral goals.",
    },
    {
      question:
        "How do you involve parents and families in the therapy process?",
      answer:
        "Family involvement is essential to our approach. We provide parent coaching, regular progress updates, and training on implementing strategies at home. We believe parents are their child's first and most important teachers, so we work to empower you with the knowledge and skills to support your child's continued growth.",
    },
  ];

  return (
    <AnimatedSection id="faq" className="py-20 bg-background scroll-mt-20">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
            Frequently Asked Questions
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            We understand you may have questions about our services. Here are
            answers to some of the most common questions families ask us.
          </p>
        </div>

        <div className="max-w-3xl mx-auto">
          <Accordion type="single" collapsible className="space-y-4">
            {faqs.map((faq, index) => (
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
            onClick={handleScrollToContact}
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
