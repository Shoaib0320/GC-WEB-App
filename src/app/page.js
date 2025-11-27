"use client";
import Header from "@/components/Header";
import HeroSection from "@/components/HeroSection";
import ServicesSection from "@/components/ServicesSection";
import PortfolioSection from "@/components/PortfolioSection";
import TeamSection from "@/components/TeamSection";
import AboutSection from "@/components/AboutSection";
import ContactSection from "@/components/ContactSection";
import { Button } from "@/components/ui/button";
import Footer from "@/components/Footer";

export default function Home() {
  return (
    <div className="min-h-screen bg-gray-100 dark:bg-slate-900">
      <Header />
      <section id="home">
        <HeroSection />
      </section>
      <ServicesSection />
      <PortfolioSection />
      <TeamSection />
      <AboutSection />
      <ContactSection />

      {/* Footer moved to global layout */}
      <Footer />
    </div>
  );
}
