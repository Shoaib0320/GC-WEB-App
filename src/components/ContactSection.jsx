"use client";
import { useEffect, useState } from "react";
import { Mail, Phone, MapPin, Send } from "lucide-react";

export default function ContactSection() {
  const [isVisible, setIsVisible] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  });

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
        }
      },
      { threshold: 0.1 }
    );

    const element = document.getElementById('contact');
    if (element) observer.observe(element);

    return () => observer.disconnect();
  }, []);

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // Handle form submission here
    console.log('Form submitted:', formData);
    toast.success('Message sent successfully!');
    // Reset form
    setFormData({ name: '', email: '', subject: '', message: '' });
  };

  const contactInfo = [
    {
      icon: Mail,
      title: "Email Us",
      details: "globiumclouds@gmail.com",
      description: "Send us an email anytime!"
    },
    {
      icon: Phone,
      title: "Call Us",
      details: "+92 335 2778488",
      description: "Mon-Sat from 9am to 6pm"
    },
    {
      icon: MapPin,
      title: "Visit Us",
      details: "House R-84 , near Al.Habeeb Resturent, Sector 15-A/4 Sector 15 A 4 Buffer Zone, Karachi, Pakistan, Karachi Lines, Pakistan",
      description: "Come say hello at our office"
    }
  ];

  return (
    <section id="contact" className="py-20 bg-gradient-to-b from-white to-sky-50 dark:from-slate-800 dark:to-slate-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <div className={`transition-all duration-1000 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-4">
              Get In <span className="bg-gradient-to-r from-[var(--theme-primary-light)] to-[var(--theme-primary-dark)] bg-clip-text text-transparent">Touch</span>
            </h2>
            <p className="text-xl text-gray-600 dark:text-slate-300 max-w-3xl mx-auto">
              Ready to transform your business with cloud solutions? Let's discuss your project and how we can help.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Contact Info */}
          <div className={`transition-all duration-1000 delay-200 ${isVisible ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-8'}`}>
            <h3 className="text-2xl font-semibold text-gray-900 dark:text-white mb-6">Contact Information</h3>
            <div className="space-y-6">
              {contactInfo.map((info, index) => (
                <div key={index} className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-sky-100 dark:bg-slate-600 rounded-lg flex items-center justify-center flex-shrink-0">
                    <info.icon className="w-6 h-6 text-sky-600 dark:text-sky-400" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900 dark:text-white mb-1">{info.title}</h4>
                    <p className="text-sky-600 dark:text-sky-400 font-medium mb-1">{info.details}</p>
                    <p className="text-sm text-gray-600 dark:text-slate-300">{info.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Contact Form */}
          <div className={`transition-all duration-1000 delay-400 ${isVisible ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-8'}`}>
            <form onSubmit={handleSubmit} className="bg-white/70 dark:bg-slate-700/70 backdrop-blur-sm rounded-xl p-8 shadow-lg border border-sky-100 dark:border-slate-600">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-2">
                    Full Name
                  </label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    required
                    className="w-full px-4 py-3 border border-gray-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-transparent transition-colors bg-white dark:bg-slate-800 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-slate-400"
                    placeholder="Your full name"
                  />
                </div>
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-2">
                    Email Address
                  </label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    required
                    className="w-full px-4 py-3 border border-gray-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-transparent transition-colors bg-white dark:bg-slate-800 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-slate-400"
                    placeholder="your@email.com"
                  />
                </div>
              </div>

              <div className="mb-6">
                <label htmlFor="subject" className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-2">
                  Subject
                </label>
                <input
                  type="text"
                  id="subject"
                  name="subject"
                  value={formData.subject}
                  onChange={handleInputChange}
                  required
                  className="w-full px-4 py-3 border border-gray-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-transparent transition-colors bg-white dark:bg-slate-800 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-slate-400"
                  placeholder="What's this about?"
                />
              </div>

              <div className="mb-6">
                <label htmlFor="message" className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-2">
                  Message
                </label>
                <textarea
                  id="message"
                  name="message"
                  value={formData.message}
                  onChange={handleInputChange}
                  required
                  rows={5}
                  className="w-full px-4 py-3 border border-gray-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-transparent transition-colors resize-none bg-white dark:bg-slate-800 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-slate-400"
                  placeholder="Tell us about your project..."
                />
              </div>

              <button
                type="submit"
                className="w-full bg-transparent text-[var(--theme-primary-light)] font-semibold py-3 px-6 rounded-lg transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-2xl flex items-center justify-center gap-2 border-2 border-[var(--theme-primary-light)] hover:bg-gradient-to-r hover:from-[var(--theme-primary-light)] hover:to-[var(--theme-primary-dark)] hover:text-white"
              >
                <Send className="w-5 h-5 text-[var(--theme-primary-light)] hover:text-white" />
                Send Message
              </button>
            </form>
          </div>
        </div>
      </div>
    </section>
  );
}
