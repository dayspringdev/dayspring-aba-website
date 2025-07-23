// src/components/Services.tsx

import { Card, CardContent } from "@/components/ui/card";
import { User, Users, Home, Video, School, MapPin } from "lucide-react";
import { AnimatedSection } from "./AnimatedSection";

const Services = () => {
  const therapyServices = [
    {
      icon: User,
      title: "1:1 ABA Therapy",
      description:
        "Individualized, evidence-based behavioral intervention tailored to your child's unique needs and goals.",
      features: [
        "Personalized treatment plans",
        "Skill building focus",
        "Progress tracking",
        "Family involvement",
      ],
    },
    {
      icon: Users,
      title: "Caregiver Coaching",
      description:
        "Empowering parents and caregivers with strategies and techniques to support their child's development at home.",
      features: [
        "Parent training sessions",
        "Behavior strategies",
        "Home implementation",
        "Ongoing support",
      ],
    },
  ];

  const settings = [
    {
      icon: Home,
      title: "Home-Based Services",
      description:
        "Therapy in the comfort and familiarity of your own home environment.",
    },
    {
      icon: Video,
      title: "Virtual Sessions",
      description:
        "Flexible telehealth options for consultations and parent coaching.",
    },
    {
      icon: School,
      title: "School Collaboration",
      description:
        "Working with educational teams to ensure consistent support across settings.",
    },
    {
      icon: MapPin,
      title: "Community-Based",
      description:
        "Practicing skills in real-world community settings for generalization.",
    },
  ];

  return (
    <AnimatedSection id="services" className="py-20 bg-background scroll-mt-20">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
            Our Services
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Comprehensive ABA therapy services designed to meet your child and
            family exactly where you are, with the flexibility and support you
            need.
          </p>
        </div>

        {/* Main Services */}
        <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto mb-20">
          {therapyServices.map((service, index) => {
            const IconComponent = service.icon;

            return (
              <Card
                key={index}
                className="bg-card border border-border/50 shadow-gentle hover:shadow-warm transition-all duration-300 group"
              >
                <CardContent className="p-8">
                  <div className="flex items-start space-x-4 mb-6">
                    <div className="w-16 h-16 bg-primary-light rounded-2xl flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform duration-300">
                      <IconComponent className="text-primary" size={32} />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-foreground mb-2">
                        {service.title}
                      </h3>
                      <p className="text-muted-foreground leading-relaxed">
                        {service.description}
                      </p>
                    </div>
                  </div>

                  <div className="space-y-2">
                    {service.features.map((feature, featureIndex) => (
                      <div
                        key={featureIndex}
                        className="flex items-center text-sm"
                      >
                        <div className="w-2 h-2 bg-primary rounded-full mr-3 flex-shrink-0"></div>
                        <span className="text-muted-foreground">{feature}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Service Settings */}
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <h3 className="text-2xl md:text-3xl font-bold text-foreground mb-4">
              Service Settings
            </h3>
            <p className="text-muted-foreground max-w-xl mx-auto">
              We bring our services to you, wherever your child feels most
              comfortable and can learn best.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {settings.map((setting, index) => {
              const IconComponent = setting.icon;

              return (
                <Card
                  key={index}
                  className="bg-card/60 backdrop-blur-sm border border-border/30 shadow-gentle hover:shadow-warm transition-all duration-300 group text-center"
                >
                  <CardContent className="p-6">
                    <div className="w-14 h-14 bg-gradient-faith rounded-xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300">
                      <IconComponent className="text-primary" size={28} />
                    </div>

                    <h4 className="text-lg font-semibold text-foreground mb-2">
                      {setting.title}
                    </h4>

                    <p className="text-sm text-muted-foreground leading-relaxed">
                      {setting.description}
                    </p>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </div>
    </AnimatedSection>
  );
};

export default Services;
