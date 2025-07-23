// src/components/Hero.tsx
import { Button } from "@/components/ui/button";
import { Heart, Star } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

const Hero = () => {
  return (
    <section className="relative py-20 md:py-32 bg-gradient-hero overflow-hidden">
      {/* Decorative elements */}
      <div className="absolute top-10 left-10 text-faith-gold/20 animate-pulse">
        <Star size={24} />
      </div>
      <div className="absolute top-20 right-20 text-hope-blue/20 animate-pulse delay-300">
        <Heart size={32} />
      </div>
      <div className="absolute bottom-10 left-20 text-love-rose/20 animate-pulse delay-500">
        <Star size={20} />
      </div>

      <div className="container mx-auto px-4">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          {/* Text Content */}
          <div className="text-center md:text-left">
            <div className="inline-flex items-center bg-faith-light/50 px-4 py-2 rounded-full mb-6">
              <Heart className="text-primary mr-2" size={16} />
              <span className="text-sm font-medium text-primary">
                Faith-Centered Care
              </span>
            </div>

            <h1 className="text-4xl md:text-6xl font-bold text-foreground leading-tight mb-6">
              Empowering Children Through
              <span className="text-primary block">Compassionate</span>
              <span className="text-hope-blue block">ABA Therapy</span>
            </h1>

            <p className="text-lg text-muted-foreground mb-8 max-w-lg mx-auto md:mx-0">
              Where faith meets science in supporting your child&apos;s unique
              journey. Professional, trauma-informed ABA therapy that honors
              your family&apos;s values.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center md:justify-start">
              {/* UPDATED: Use asChild and Link for Next.js routing */}
              <Button
                asChild
                size="lg"
                className="bg-primary hover:bg-primary-soft text-primary-foreground shadow-warm text-lg px-8 py-6"
              >
                <Link href="/book">Book Free Consultation</Link>
              </Button>

              <Button
                asChild
                variant="outline"
                size="lg"
                className="border-primary text-primary hover:bg-primary-light/20 text-lg px-8 py-6"
              >
                <Link href="#services">Learn More</Link>
              </Button>
            </div>

            {/* Trust indicators */}
            <div className="mt-12 flex flex-col sm:flex-row items-center gap-6 text-sm text-muted-foreground">
              <div className="flex items-center">
                <div className="w-2 h-2 bg-primary rounded-full mr-2"></div>
                Licensed & Insured
              </div>
              <div className="flex items-center">
                <div className="w-2 h-2 bg-hope-blue rounded-full mr-2"></div>
                Trauma-Informed Care
              </div>
              <div className="flex items-center">
                <div className="w-2 h-2 bg-faith-gold rounded-full mr-2"></div>
                Faith-Integrated
              </div>
            </div>
          </div>

          {/* Image */}
          <div className="relative">
            <div className="relative overflow-hidden rounded-3xl shadow-warm bg-gradient-faith p-1">
              {/* UPDATED: Changed <img> to next/image */}
              <Image
                src="/hero-image.jpg"
                alt="Compassionate ABA therapy session with child and therapist"
                width={600}
                height={600}
                className="w-full h-auto rounded-3xl object-cover"
                priority
              />
            </div>

            {/* Floating card */}
            <div className="absolute -bottom-6 -left-6 bg-card border border-border rounded-2xl p-4 shadow-gentle">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-primary-light rounded-full flex items-center justify-center">
                  <Heart className="text-primary" size={20} />
                </div>
                <div>
                  <p className="font-semibold text-sm">Evidence-Based</p>
                  <p className="text-xs text-muted-foreground">ABA Therapy</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
