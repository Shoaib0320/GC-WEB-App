"use client";
import { useEffect, useState } from "react";
import { Cloud, Shield, Zap, Users, Database, Code } from "lucide-react";

export default function ServicesSection() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
        }
      },
      { threshold: 0.1 }
    );

    const element = document.getElementById('services');
    if (element) observer.observe(element);

    return () => observer.disconnect();
  }, []);

  const services = [
    {
      icon: Cloud,
      title: "Cloud Infrastructure",
      description: "Scalable cloud solutions with AWS, Azure, and GCP. Deploy, manage, and optimize your cloud resources efficiently."
    },
    {
      icon: Shield,
      title: "Security & Compliance",
      description: "Enterprise-grade security solutions ensuring data protection, compliance, and risk management for your business."
    },
    {
      icon: Zap,
      title: "Performance Optimization",
      description: "Boost your application performance with advanced caching, CDN, and optimization techniques."
    },
    {
      icon: Users,
      title: "Team Collaboration",
      description: "Integrated collaboration tools and platforms to enhance team productivity and communication."
    },
    {
      icon: Database,
      title: "Data Management",
      description: "Comprehensive data solutions including databases, analytics, and data warehousing services."
    },
    {
      icon: Code,
      title: "Custom Development",
      description: "Tailored software development services to meet your unique business requirements and goals."
    }
  ];

  return (
    <section id="services" className="py-20 bg-gradient-to-b from-white to-sky-50 dark:from-slate-800 dark:to-slate-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <div className={`transition-all duration-1000 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-4">
              Our <span className="text-transparent bg-gradient-to-r from-sky-400 to-sky-700 bg-clip-text">Services</span>
            </h2>
            <p className="text-xl text-gray-600 dark:text-slate-300 max-w-3xl mx-auto">
              Comprehensive cloud solutions designed to transform your business operations and drive innovation.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {services.map((service, index) => (
            <div
              key={index}
              className={`bg-white/70 dark:bg-slate-700/70 backdrop-blur-sm rounded-xl p-6 shadow-lg border border-sky-100 dark:border-slate-600 hover:shadow-xl transition-all duration-500 hover:transform hover:scale-105 ${
                isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
              }`}
              style={{ transitionDelay: `${index * 100}ms` }}
            >
              <div className="w-12 h-12 bg-sky-100 dark:bg-slate-600 rounded-lg flex items-center justify-center mb-4">
                <service.icon className="w-6 h-6 text-sky-600 dark:text-sky-400" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">{service.title}</h3>
              <p className="text-gray-600 dark:text-slate-300 leading-relaxed">{service.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
