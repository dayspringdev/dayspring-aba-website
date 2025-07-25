// src/components/CoreValues.tsx

import { Card, CardContent } from "@/components/ui/card";
import { Cross, FlaskConical, Shield, Zap, Users } from "lucide-react";
import { AnimatedSection } from "./AnimatedSection";
import type { HomePageData } from "@/types/homepage";

// This map of icons and their styles is correct.
const iconMap = {
  Cross: {
    Component: Cross,
    color: "text-faith-gold",
    bgColor: "bg-faith-gold/10",
  },
  FlaskConical: {
    Component: FlaskConical,
    color: "text-primary",
    bgColor: "bg-primary-light/30",
  },
  Shield: {
    Component: Shield,
    color: "text-hope-blue",
    bgColor: "bg-hope-blue/10",
  },
  Zap: {
    Component: Zap,
    color: "text-love-rose",
    bgColor: "bg-love-rose/10",
  },
  Users: {
    Component: Users,
    color: "text-accent",
    bgColor: "bg-accent/20",
  },
};

interface CoreValuesProps {
  data: HomePageData["coreValues"];
}

const CoreValues = ({ data }: CoreValuesProps) => {
  return (
    <AnimatedSection className="py-20 bg-background">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
            {data.title}
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            {data.subtitle}
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
          {data.values.map((value, index) => {
            const Icon = iconMap[value.icon as keyof typeof iconMap];
            if (!Icon) return null;

            return (
              // The parent card needs the `group` class.
              <Card
                key={index}
                className="bg-card border border-border/50 shadow-gentle hover:shadow-warm transition-all duration-300 group hover:-translate-y-1"
              >
                <CardContent className="p-6 text-center">
                  {/* The child element listens for the hover with `group-hover`. */}
                  <div
                    className={`w-16 h-16 ${Icon.bgColor} rounded-full flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300`}
                  >
                    <Icon.Component className={Icon.color} size={32} />
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

        {/* Bottom decorative wave (can remain hardcoded) */}
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
