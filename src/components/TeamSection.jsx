"use client";
import { useEffect, useState } from "react";
import { Linkedin, Twitter, Github } from "lucide-react";

export default function TeamSection() {
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

    const element = document.getElementById('team');
    if (element) observer.observe(element);

    return () => observer.disconnect();
  }, []);

  const teamMembers = [
    {
      name: "Sarah Johnson",
      role: "CEO & Founder",
      bio: "15+ years in cloud architecture and digital transformation. Passionate about helping businesses scale.",
      social: {
        linkedin: "#",
        twitter: "#",
        github: "#"
      }
    },
    {
      name: "Michael Chen",
      role: "CTO",
      bio: "Expert in distributed systems and microservices. Leads our technical innovation and architecture decisions.",
      social: {
        linkedin: "#",
        twitter: "#",
        github: "#"
      }
    },
    {
      name: "Emily Rodriguez",
      role: "Head of Design",
      bio: "Creative director with a focus on user experience and brand strategy. Loves crafting beautiful digital experiences.",
      social: {
        linkedin: "#",
        twitter: "#",
        github: "#"
      }
    },
    {
      name: "David Kim",
      role: "Lead Developer",
      bio: "Full-stack developer specializing in React, Node.js, and cloud technologies. Always learning new things.",
      social: {
        linkedin: "#",
        twitter: "#",
        github: "#"
      }
    },
    {
      name: "Lisa Thompson",
      role: "DevOps Engineer",
      bio: "Infrastructure specialist ensuring our systems are reliable, scalable, and secure. Automation enthusiast.",
      social: {
        linkedin: "#",
        twitter: "#",
        github: "#"
      }
    },
    {
      name: "James Wilson",
      role: "Project Manager",
      bio: "Agile practitioner helping teams deliver exceptional results. Focuses on process optimization and client satisfaction.",
      social: {
        linkedin: "#",
        twitter: "#",
        github: "#"
      }
    }
  ];

  return (
    <section id="team" className="py-20 bg-gradient-to-b from-white to-sky-50 dark:from-slate-800 dark:to-slate-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <div className={`transition-all duration-1000 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-4">
              Meet Our <span className="bg-gradient-to-r from-sky-400 to-sky-700 bg-clip-text text-transparent">Team</span>
            </h2>
            <p className="text-xl text-gray-600 dark:text-slate-300 max-w-3xl mx-auto">
              Passionate professionals dedicated to delivering exceptional cloud solutions and driving digital innovation.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {teamMembers.map((member, index) => (
            <div
              key={index}
              className={`bg-white/70 dark:bg-slate-700/70 backdrop-blur-sm rounded-xl p-6 shadow-lg border border-sky-100 dark:border-slate-600 hover:shadow-xl transition-all duration-500 hover:transform hover:scale-105 text-center ${
                isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
              }`}
              style={{ transitionDelay: `${index * 100}ms` }}
            >
              <div className="w-24 h-24 bg-gradient-to-br from-sky-100 to-blue-100 dark:from-slate-600 dark:to-slate-700 rounded-full mx-auto mb-4 flex items-center justify-center">
                <span className="text-2xl font-bold text-sky-600 dark:text-sky-400">{member.name.split(' ').map(n => n[0]).join('')}</span>
              </div>

              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-1">{member.name}</h3>
              <p className="text-sky-600 dark:text-sky-400 font-medium mb-3">{member.role}</p>
              <p className="text-gray-600 dark:text-slate-300 text-sm leading-relaxed mb-4">{member.bio}</p>

              <div className="flex justify-center gap-3">
                <a
                  href={member.social.linkedin}
                  className="w-8 h-8 bg-sky-100 dark:bg-slate-600 rounded-full flex items-center justify-center text-sky-600 dark:text-sky-400 hover:bg-sky-200 dark:hover:bg-slate-500 transition-colors"
                >
                  <Linkedin className="w-4 h-4" />
                </a>
                <a
                  href={member.social.twitter}
                  className="w-8 h-8 bg-sky-100 dark:bg-slate-600 rounded-full flex items-center justify-center text-sky-600 dark:text-sky-400 hover:bg-sky-200 dark:hover:bg-slate-500 transition-colors"
                >
                  <Twitter className="w-4 h-4" />
                </a>
                <a
                  href={member.social.github}
                  className="w-8 h-8 bg-sky-100 dark:bg-slate-600 rounded-full flex items-center justify-center text-sky-600 dark:text-sky-400 hover:bg-sky-200 dark:hover:bg-slate-500 transition-colors"
                >
                  <Github className="w-4 h-4" />
                </a>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
