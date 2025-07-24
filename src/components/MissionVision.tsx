// src/components/MissionVision.tsx

import { Card, CardContent } from "@/components/ui/card";
import { Target, Eye } from "lucide-react";
import { AnimatedSection } from "./AnimatedSection";
import type { HomePageData } from "@/types/homepage"; // 1. IMPORT the type

// 2. DEFINE the component's props
interface MissionVisionProps {
  data: HomePageData["missionVision"];
}

const MissionVision = ({ data }: MissionVisionProps) => {
  return (
    <AnimatedSection className="py-20 bg-gradient-soft">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          {/* 3. REPLACE hardcoded text with props */}
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
            {data.title}
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            {data.subtitle}
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          {/* Mission Card */}
          <Card className="bg-card/80 backdrop-blur-sm border border-border/50 shadow-gentle hover:shadow-warm transition-all duration-300">
            <CardContent className="p-8 text-center">
              <div className="w-16 h-16 bg-primary-light rounded-full flex items-center justify-center mx-auto mb-6">
                <Target className="text-primary" size={32} />
              </div>

              <h3 className="text-2xl font-bold text-foreground mb-4">
                {data.mission.title}
              </h3>

              <p className="text-muted-foreground leading-relaxed">
                {data.mission.text}
              </p>
            </CardContent>
          </Card>

          {/* Vision Card */}
          <Card className="bg-card/80 backdrop-blur-sm border border-border/50 shadow-gentle hover:shadow-warm transition-all duration-300">
            <CardContent className="p-8 text-center">
              <div className="w-16 h-16 bg-hope-blue/20 rounded-full flex items-center justify-center mx-auto mb-6">
                <Eye className="text-hope-blue" size={32} />
              </div>

              <h3 className="text-2xl font-bold text-foreground mb-4">
                {data.vision.title}
              </h3>

              <p className="text-muted-foreground leading-relaxed">
                {data.vision.text}
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </AnimatedSection>
  );
};

export default MissionVision;
