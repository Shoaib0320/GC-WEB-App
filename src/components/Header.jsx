"use client";

import Image from "next/image";
import ThemeToggle from "./ThemeToggle";

export default function Header() {
  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-white dark:bg-slate-900 border-b border-gray-200 dark:border-slate-700 shadow-sm transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Logo */}
        <div className="flex items-center space-x-3">
          <Image
            src="/images/GCLogo.png"
            alt="GC Logo"
            width={40}
            height={40}
            className="object-contain rounded-md"
            priority
          />
          <span className="text-xl font-semibold text-gray-900 dark:text-gray-100 select-none">
            Gobium Cloud
          </span>
        </div>

        {/* Right Section - Theme Toggle */}
        <div className="flex items-center space-x-4">
          <ThemeToggle />
        </div>
      </div>
    </header>
  );
}
