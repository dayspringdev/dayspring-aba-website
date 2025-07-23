// src/components/MissionVision.tsx

import { Card, CardContent } from "@/components/ui/card";
import { Target, Eye } from "lucide-react";
import { AnimatedSection } from "./AnimatedSection"; // <-- 1. IMPORT AnimatedSection

const MissionVision = () => {
  return (
    // 2. REPLACE <section> with <AnimatedSection>
    <AnimatedSection className="py-20 bg-gradient-soft">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
            Our Purpose & Vision
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Guided by faith and grounded in science, we&apos;re committed to
            transforming lives through compassionate, evidence-based care.
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
                Our Mission
              </h3>

              <p className="text-muted-foreground leading-relaxed">
                To provide Christ-centered, evidence-based ABA therapy that
                empowers children and families to reach their fullest potential.
                We believe every child is fearfully and wonderfully made,
                deserving of compassionate, individualized care that honors
                their unique gifts.
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
                Our Vision
              </h3>

              <p className="text-muted-foreground leading-relaxed">
                A world where every child with autism and behavioral needs
                thrives in an environment of love, understanding, and hope. We
                envision communities where faith and science unite to create
                inclusive spaces for all children to grow, learn, and flourish.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </AnimatedSection> // <-- 3. CLOSE the AnimatedSection tag
  );
};

export default MissionVision;
