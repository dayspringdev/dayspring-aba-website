// src/components/CoreValues.tsx

import { Card, CardContent } from "@/components/ui/card";
import { Cross, FlaskConical, Shield, Zap, Users } from "lucide-react";
import { AnimatedSection } from "./AnimatedSection";
import type { HomePageData } from "@/types/homepage"; // 1. IMPORT the type

// 2. CREATE A MAP to translate string names from data into actual components and styles.
// This is a powerful pattern that keeps your data clean and your component smart.
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

// 3. DEFINE the component's props
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
          {/* 4. DYNAMICALLY RENDER the values using the map */}
          {data.values.map((value, index) => {
            // Look up the correct icon component and styles from our map
            const Icon = iconMap[value.icon as keyof typeof iconMap];

            // A failsafe in case the data has an icon name we don't recognize
            if (!Icon) return null;

            return (
              <Card
                key={index}
                className="bg-card border border-border/50 shadow-gentle hover:shadow-warm transition-all duration-300 group hover:-translate-y-1"
              >
                <CardContent className="p-6 text-center">
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
