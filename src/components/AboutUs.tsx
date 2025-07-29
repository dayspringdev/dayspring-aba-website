// src/components/AboutUs.tsx

import { Card, CardContent } from "@/components/ui/card";
import { GraduationCap, Award, Heart } from "lucide-react";
import Image from "next/image";
import { AnimatedSection } from "./AnimatedSection";
import type { HomePageData } from "@/types/homepage";
import React from "react";

// Define the component's props
interface AboutUsProps {
  data: HomePageData["aboutUs"];
}

// Map the position of the credential to a specific icon and color
const credentialIcons = [
  { Icon: GraduationCap, color: "text-primary" },
  { Icon: Award, color: "text-hope-blue" },
  { Icon: Heart, color: "text-love-rose" },
];

const AboutUs = ({ data }: AboutUsProps) => {
  return (
    <AnimatedSection id="about" className="py-20 bg-gradient-soft scroll-mt-20">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
            {data.title}
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            {data.subtitle}
          </p>
        </div>

        <div className="max-w-5xl mx-auto">
          <Card className="bg-card/80 p-0 backdrop-blur-sm border border-border/50 shadow-warm overflow-hidden">
            <CardContent className="p-0">
              <div className="grid grid-cols-1 md:grid-cols-5 gap-0">
                {/* Image Side: Now uses the dynamic imageUrl from props */}
                <div className="relative md:col-span-2 min-h-[450px]">
                  <Image
                    src={data.imageUrl}
                    alt="Tosin Ikotun, Clinical Director of Dayspring BTS"
                    fill
                    className="object-cover"
                    priority
                  />
                  <div className="absolute inset-0 bg-black/10"></div>
                </div>

                {/* Content Side: Now uses dynamic text from props */}
                <div className="md:col-span-3 p-8 md:p-12 flex flex-col justify-center">
                  <div className="space-y-4 text-muted-foreground leading-relaxed">
                    {data.bio.map((paragraph, index) => (
                      <p key={index}>{paragraph}</p>
                    ))}
                  </div>

                  <div className="mt-8 pt-6 border-t border-border/50 flex flex-wrap gap-x-6 gap-y-2">
                    {data.credentials.map((text, index) => {
                      const iconInfo = credentialIcons[index];
                      if (!iconInfo) return null; // Failsafe for too many credentials
                      const { Icon, color } = iconInfo;
                      return (
                        <div
                          key={index}
                          className="flex items-center text-sm text-muted-foreground transition-transform duration-300 ease-in-out hover:scale-105"
                        >
                          <Icon className={`${color} mr-2`} size={20} />
                          {text}
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </AnimatedSection>
  );
};

export default AboutUs;
