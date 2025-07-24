// src/components/AboutUs.tsx

import { Card, CardContent } from "@/components/ui/card";
import { GraduationCap, Award, Heart } from "lucide-react";
import Image from "next/image";
import { AnimatedSection } from "./AnimatedSection";

const AboutUs = () => {
  return (
    <AnimatedSection id="about" className="py-20 bg-gradient-soft scroll-mt-20">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
            Meet The Clinical Director
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Led by compassion, guided by faith, and backed by expertise in
            Applied Behavior Analysis.
          </p>
        </div>

        <div className="max-w-5xl mx-auto">
          <Card className="bg-card/80 p-0 backdrop-blur-sm border border-border/50 shadow-warm overflow-hidden">
            <CardContent className="p-0">
              {/* === THE FIX IS HERE === */}
              {/* Changed from grid-cols-2 to a more flexible grid-cols-5 */}
              <div className="grid grid-cols-1 md:grid-cols-5 gap-0">
                {/* Image Side: Now takes up 2/5 of the width on medium screens */}
                <div className="relative md:col-span-2 min-h-[450px]">
                  <Image
                    src="/tosin-ikotun.jpg"
                    alt="Tosin Ikotun, Clinical Director of Dayspring BTS"
                    fill
                    className="object-cover"
                    priority
                  />
                  <div className="absolute inset-0 bg-black/08"></div>
                </div>

                {/* Content Side: Now takes up 3/5 of the width, giving it more space */}
                <div className="md:col-span-3 p-8 md:p-12 flex flex-col justify-center">
                  <div className="space-y-4 text-muted-foreground leading-relaxed">
                    <p>
                      Hi, I’m Tosin (Irelewuyi) Ikotun, the clinical director
                      and owner of Dayspring Behavioural Therapeutic Services.
                      I’m a Board Certified Behaviour Analyst (BCBA) and a
                      Registered Behaviour Analyst in Ontario. With over 10
                      years of experience supporting individuals with various
                      needs, I am deeply committed to both clinical excellence
                      and faith-based care.
                    </p>
                    <p>
                      I created Dayspring to be a place where evidence-based ABA
                      therapy and the hope of Jesus Christ meet. I believe that
                      every child deserves to be supported with compassion,
                      dignity, and love.
                    </p>
                    <p>
                      When I’m not serving families, I’m spending time with my
                      loved ones, trying new foods, and growing in my faith.
                    </p>
                  </div>

                  {/* This section now has enough space to not wrap */}
                  <div className="mt-8 pt-6 border-t border-border/50 flex flex-wrap gap-x-6 gap-y-2 cursor-default">
                    <div className="flex items-center text-sm text-muted-foreground transition-transform duration-300 ease-in-out hover:scale-105">
                      <GraduationCap className="text-primary mr-2" size={20} />
                      Master&apos;s in ABA
                    </div>
                    <div className="flex items-center text-sm text-muted-foreground transition-transform duration-300 ease-in-out hover:scale-105">
                      <Award className="text-hope-blue mr-2" size={20} />
                      BCBA Certified
                    </div>
                    <div className="flex items-center text-sm text-muted-foreground transition-transform duration-300 ease-in-out hover:scale-105">
                      <Heart className="text-love-rose mr-2" size={20} />
                      10+ Years Experience
                    </div>
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
