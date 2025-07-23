// src/components/CoreValues.tsx

import { Card, CardContent } from "@/components/ui/card";
import { Cross, FlaskConical, Shield, Zap, Users } from "lucide-react";
import { AnimatedSection } from "./AnimatedSection";

const CoreValues = () => {
  const values = [
    {
      icon: Cross,
      title: "Faith-Centered",
      description:
        "We integrate Christian values into our therapeutic approach, honoring each child as God's unique creation.",
      color: "text-faith-gold",
      bgColor: "bg-faith-gold/10",
    },
    {
      icon: FlaskConical,
      title: "Science-Based",
      description:
        "Our methods are rooted in evidence-based ABA practices, ensuring effective and measurable outcomes.",
      color: "text-primary",
      bgColor: "bg-primary-light/30",
    },
    {
      icon: Shield,
      title: "Trauma-Informed",
      description:
        "We prioritize safety and emotional well-being, recognizing the impact of trauma on learning and development.",
      color: "text-hope-blue",
      bgColor: "bg-hope-blue/10",
    },
    {
      icon: Zap,
      title: "Empowerment",
      description:
        "We focus on building independence and self-advocacy skills, empowering children to reach their potential.",
      color: "text-love-rose",
      bgColor: "bg-love-rose/10",
    },
    {
      icon: Users,
      title: "Collaboration",
      description:
        "We work closely with families, schools, and other professionals to ensure comprehensive support.",
      color: "text-accent",
      bgColor: "bg-accent/20",
    },
  ];

  return (
    <AnimatedSection className="py-20 bg-background">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
            Our Core Values
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            These fundamental principles guide every aspect of our therapeutic
            approach and shape the caring environment we create for your family.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
          {values.map((value, index) => {
            const IconComponent = value.icon;

            return (
              <Card
                key={index}
                className="bg-card border border-border/50 shadow-gentle hover:shadow-warm transition-all duration-300 group hover:-translate-y-1"
              >
                <CardContent className="p-6 text-center">
                  <div
                    className={`w-16 h-16 ${value.bgColor} rounded-full flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300`}
                  >
                    <IconComponent className={value.color} size={32} />
                  </div>

                  <h3 className="text-xl font-bold text-foreground mb-3">
                    {value.title}
                  </h3>

                  <p className="text-muted-foreground leading-relaxed">
                    {value.description}
                  </p>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Bottom decorative wave */}
        <div className="mt-20">
          <svg
            className="w-full h-16 text-muted/10"
            viewBox="0 0 1200 120"
            preserveAspectRatio="none"
          >
            <path
              d="M0,60 C300,120 900,0 1200,60 L1200,120 L0,120 Z"
              fill="currentColor"
            />
          </svg>
        </div>
      </div>
    </AnimatedSection>
  );
};

export default CoreValues;
