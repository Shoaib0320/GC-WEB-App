"use client";
import Header from "@/components/Header";
import HeroSection from "@/components/HeroSection";
import ServicesSection from "@/components/ServicesSection";
import PortfolioSection from "@/components/PortfolioSection";
import TeamSection from "@/components/TeamSection";
import AboutSection from "@/components/AboutSection";
import ContactSection from "@/components/ContactSection";

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

      <footer className="bg-gray-900 dark:bg-slate-800 text-white py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <p className="text-gray-400 dark:text-slate-400">
            © 2025 Globium Cloud. All rights reserved. Built with ❤️ using Next.js
          </p>

          <Button >Login</Button>
        </div>
      </footer>
    </div>
  );
}
