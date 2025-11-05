"use client";
import { useEffect, useState } from "react";
import { Target, Users, Award, TrendingUp } from "lucide-react";

export default function AboutSection() {
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

    const element = document.getElementById('about');
    if (element) observer.observe(element);

    return () => observer.disconnect();
  }, []);

  const stats = [
    {
      icon: Users,
      number: "500+",
      label: "Happy Clients"
    },
    {
      icon: Award,
      number: "50+",
      label: "Projects Completed"
    },
    {
      icon: TrendingUp,
      number: "99.9%",
      label: "Uptime Guarantee"
    },
    {
      icon: Target,
      number: "24/7",
      label: "Support"
    }
  ];

  return (
    <section id="about" className="py-20 bg-gradient-to-b from-sky-50 to-white dark:from-slate-900 dark:to-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Content */}
          <div className={`transition-all duration-1000 ${isVisible ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-8'}`}>
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-6">
              About <span className="bg-gradient-to-r from-sky-400 to-sky-700 bg-clip-text text-transparent">Globium Cloud</span>
            </h2>
            <p className="text-lg text-gray-600 dark:text-slate-300 mb-6 leading-relaxed">
              We are a leading cloud solutions provider dedicated to helping businesses harness the power of cloud technology.
              With years of experience in cloud architecture, DevOps, and digital transformation, we empower organizations
              to scale efficiently and innovate rapidly.
            </p>
            <p className="text-lg text-gray-600 dark:text-slate-300 mb-8 leading-relaxed">
              Our mission is to bridge the gap between complex cloud technologies and business success. We believe that
              every business deserves access to world-class cloud infrastructure, regardless of their size or technical expertise.
            </p>

            <div className="grid grid-cols-2 gap-6">
              <div className="bg-white/70 dark:bg-slate-700/70 backdrop-blur-sm rounded-lg p-4 shadow-sm border border-sky-100 dark:border-slate-600">
                <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Our Vision</h3>
                <p className="text-sm text-gray-600 dark:text-slate-300">To democratize cloud technology and make it accessible to businesses worldwide.</p>
              </div>
              <div className="bg-white/70 dark:bg-slate-700/70 backdrop-blur-sm rounded-lg p-4 shadow-sm border border-sky-100 dark:border-slate-600">
                <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Our Values</h3>
                <p className="text-sm text-gray-600 dark:text-slate-300">Innovation, reliability, security, and customer-centric solutions.</p>
              </div>
            </div>
          </div>

          {/* Stats */}
          <div className={`transition-all duration-1000 delay-300 ${isVisible ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-8'}`}>
            <div className="grid grid-cols-2 gap-6">
              {stats.map((stat, index) => (
                <div
                  key={index}
                  className="bg-white/70 dark:bg-slate-700/70 backdrop-blur-sm rounded-xl p-6 shadow-lg border border-sky-100 dark:border-slate-600 hover:shadow-xl transition-all duration-300 hover:transform hover:scale-105 text-center"
                >
                  <div className="w-12 h-12 bg-sky-100 dark:bg-slate-600 rounded-lg flex items-center justify-center mx-auto mb-4">
                    <stat.icon className="w-6 h-6 text-sky-600 dark:text-sky-400" />
                  </div>
                  <div className="text-3xl font-bold text-gray-900 dark:text-white mb-1">{stat.number}</div>
                  <div className="text-sm text-gray-600 dark:text-slate-300">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
