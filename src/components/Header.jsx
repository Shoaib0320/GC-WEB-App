import Link from "next/link";
import Image from "next/image";
import { useState, useEffect } from "react";
import ThemeToggle from "./ThemeToggle";

export default function Header() {
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 0);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <header className={`fixed top-0 left-0 right-0 z-50 bg-transparent transition-all duration-300 ${isScrolled ? "bg-white/95 dark:bg-slate-800/95 backdrop-blur-sm border-b border-sky-200 dark:border-slate-700 shadow-lg" : ""} dark:bg-transparent`}>
      <div className="max-w-7xl mx-auto px-2 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20">
          {/* GC Logo on the left */}
          <div className="flex items-center">
            <Image
              src="/images/GCLogo.png"
              alt="GC Logo"
              width={90}
              height={90}
              className="object-contain"
            />
          </div>

          {/* Navigation Links and Theme Toggle */}
          <div className="flex items-center space-x-5">
            <nav className="flex space-x-5">
              <a
                href="#home"
                className="text-slate-600 dark:text-slate-300 hover:text-sky-700 dark:hover:text-sky-400 px-3 py-2 rounded-md text-sm font-medium relative overflow-hidden group cursor-pointer"
              >
                Home
                <span className="absolute bottom-0 left-0 w-full h-0.5 bg-sky-300 transform scale-x-0 group-hover:scale-x-100 origin-left transition-transform duration-300"></span>
              </a>
              <a
                href="#services"
                className="text-slate-600 dark:text-slate-300 hover:text-sky-700 dark:hover:text-sky-400 px-3 py-2 rounded-md text-sm font-medium relative overflow-hidden group cursor-pointer"
              >
                Services
                <span className="absolute bottom-0 left-0 w-full h-0.5 bg-sky-300 transform scale-x-0 group-hover:scale-x-100 origin-left transition-transform duration-300"></span>
              </a>
              <a
                href="#portfolio"
                className="text-slate-600 dark:text-slate-300 hover:text-sky-700 dark:hover:text-sky-400 px-3 py-2 rounded-md text-sm font-medium relative overflow-hidden group cursor-pointer"
              >
                Portfolio
                <span className="absolute bottom-0 left-0 w-full h-0.5 bg-sky-300 transform scale-x-0 group-hover:scale-x-100 origin-left transition-transform duration-300"></span>
              </a>
              <a
                href="#team"
                className="text-slate-600 dark:text-slate-300 hover:text-sky-700 dark:hover:text-sky-400 px-3 py-2 rounded-md text-sm font-medium relative overflow-hidden group cursor-pointer"
              >
                Team
                <span className="absolute bottom-0 left-0 w-full h-0.5 bg-sky-300 transform scale-x-0 group-hover:scale-x-100 origin-left transition-transform duration-300"></span>
              </a>
              <a
                href="#about"
                className="text-slate-600 dark:text-slate-300 hover:text-sky-700 dark:hover:text-sky-400 px-3 py-2 rounded-md text-sm font-medium relative overflow-hidden group cursor-pointer"
              >
                About
                <span className="absolute bottom-0 left-0 w-full h-0.5 bg-sky-300 transform scale-x-0 group-hover:scale-x-100 origin-left transition-transform duration-300"></span>
              </a>
              <a
                href="#contact"
                className="text-slate-600 dark:text-slate-300 hover:text-sky-700 dark:hover:text-sky-400 px-3 py-2 rounded-md text-sm font-medium relative overflow-hidden group cursor-pointer"
              >
                Contact
                <span className="absolute bottom-0 left-0 w-full h-0.5 bg-sky-300 transform scale-x-0 group-hover:scale-x-100 origin-left transition-transform duration-300"></span>
              </a>
            </nav>
            <ThemeToggle />
          </div>
        </div>
      </div>
    </header>
  );
}
