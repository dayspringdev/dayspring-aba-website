// src/components/HowItWorks.tsx

import { Card, CardContent } from "@/components/ui/card";
import { Phone, FileText, Target, Play, TrendingUp } from "lucide-react";
import { AnimatedSection } from "./AnimatedSection";

const HowItWorks = () => {
  const steps = [
    {
      number: "01",
      icon: Phone,
      title: "Initial Consultation",
      description:
        "We begin with a free consultation to understand your child's needs, your family's goals, and how we can best support you.",
    },
    {
      number: "02",
      icon: FileText,
      title: "Comprehensive Assessment",
      description:
        "Our thorough assessment evaluates your child's current skills, challenges, and strengths to create a foundation for personalized care.",
    },
    {
      number: "03",
      icon: Target,
      title: "Personalized Treatment Plan",
      description:
        "We develop an individualized treatment plan with specific, measurable goals that align with your family's values and priorities.",
    },
    {
      number: "04",
      icon: Play,
      title: "Begin Therapy Sessions",
      description:
        "We start implementing evidence-based ABA techniques in your chosen setting, making learning engaging and meaningful for your child.",
    },
    {
      number: "05",
      icon: TrendingUp,
      title: "Ongoing Progress & Support",
      description:
        "Regular progress reviews, plan adjustments, and continuous family support ensure your child continues to thrive and grow.",
    },
  ];

  return (
    <AnimatedSection
      id="intake"
      className="py-20 bg-gradient-soft scroll-mt-20"
    >
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
            How It Works
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Our simple, compassionate intake process is designed to make getting
            started as smooth and stress-free as possible for your family.
          </p>
        </div>

        {/* === CHANGE #1: Widen the container from max-w-4xl to max-w-5xl === */}
        <div className="max-w-5xl mx-auto">
          {/* Desktop Flow */}
          <div className="hidden md:block">
            <div className="relative">
              <div className="absolute top-8 left-20 right-20 h-0.5 bg-gradient-to-r from-primary via-hope-blue to-love-rose opacity-30"></div>

              <div className="grid grid-cols-5 gap-8">
                {steps.map((step, index) => {
                  const IconComponent = step.icon;
                  return (
                    <div key={index} className="text-center relative">
                      <div className="w-16 h-16 bg-card border-2 border-primary-light text-primary rounded-full flex items-center justify-center text-lg font-bold mx-auto mb-6 shadow-gentle relative z-10">
                        {step.number}
                      </div>
                      <Card className="bg-card border border-border/50 shadow-gentle hover:shadow-warm transition-all duration-300">
                        <CardContent className="p-6">
                          <div className="w-12 h-12 bg-primary-light rounded-xl flex items-center justify-center mx-auto mb-4">
                            <IconComponent className="text-primary" size={24} />
                          </div>

                          {/* === CHANGE #2: Removed the 'break-words' class === */}
                          <h3 className="text-lg font-bold text-foreground mb-3">
                            {step.title}
                          </h3>

                          <p className="text-sm text-muted-foreground leading-relaxed">
                            {step.description}
                          </p>
                        </CardContent>
                      </Card>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Mobile Flow (Unchanged) */}
          <div className="md:hidden space-y-8">
            {steps.map((step, index) => {
              const IconComponent = step.icon;
              return (
                <div key={index} className="relative">
                  {index < steps.length - 1 && (
                    <div className="absolute left-8 top-20 w-0.5 h-full bg-gradient-to-b from-primary to-hope-blue opacity-30 z-0"></div>
                  )}
                  <Card className="bg-card border border-border/50 shadow-gentle relative z-10">
                    <CardContent className="p-6">
                      <div className="flex items-start space-x-4">
                        <div className="w-16 h-16 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-lg font-bold flex-shrink-0">
                          {step.number}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center mb-3">
                            <div className="w-10 h-10 bg-primary-light rounded-lg flex items-center justify-center mr-3">
                              <IconComponent
                                className="text-primary"
                                size={20}
                              />
                            </div>
                            <h3 className="text-lg font-bold text-foreground">
                              {step.title}
                            </h3>
                          </div>
                          <p className="text-muted-foreground leading-relaxed">
                            {step.description}
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </AnimatedSection>
  );
};

export default HowItWorks;
