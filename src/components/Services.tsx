// src/components/Services.tsx

import { Card, CardContent } from "@/components/ui/card";
import { User, Users, Home, Video, School, MapPin } from "lucide-react";
import { AnimatedSection } from "./AnimatedSection";
import type { HomePageData } from "@/types/homepage";

// Icon map for the main therapy services
const therapyServiceIcons = {
  User: User,
  Users: Users,
};

// Icon map for the service settings
const settingIcons = {
  Home: Home,
  Video: Video,
  School: School,
  MapPin: MapPin,
};

// Define the component's props
interface ServicesProps {
  data: HomePageData["services"];
}

const Services = ({ data }: ServicesProps) => {
  return (
    <AnimatedSection id="services" className="py-20 bg-background scroll-mt-20">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
            {data.title}
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            {data.subtitle}
          </p>
        </div>

        {/* Main Services */}
        <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto mb-20">
          {data.therapyServices.map((service, index) => {
            const IconComponent =
              therapyServiceIcons[
                service.icon as keyof typeof therapyServiceIcons
              ];
            if (!IconComponent) return null;

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
              {data.settingsTitle}
            </h3>
            <p className="text-muted-foreground max-w-xl mx-auto">
              {data.settingsSubtitle}
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {data.settings.map((setting, index) => {
              const IconComponent =
                settingIcons[setting.icon as keyof typeof settingIcons];
              if (!IconComponent) return null;

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
