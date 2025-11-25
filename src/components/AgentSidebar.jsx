
"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useAgent } from "../context/AgentContext";
import { BarChart3, Clock, DollarSign, Settings } from "lucide-react";

export default function AgentSidebar({ isOpen, setIsOpen, children }) {
  const router = useRouter();
  const { logout } = useAgent();
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      const mobile = window.innerWidth < 768;
      setIsMobile(mobile);
      if (!mobile) setIsOpen(true); // Default open on desktop
    };

    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, [setIsOpen]);

  const handleLogout = async () => {
    await logout();
    router.push("/agent/login");
  };

  const closeSidebar = () => {
    if (isMobile) setIsOpen(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Mobile Overlay */}
      {isMobile && isOpen && (
        <div
          className="fixed inset-0 bg-gray-400 bg-opacity-50 z-20 md:hidden"
          onClick={closeSidebar}
        />
      )}

      {/* Sidebar */}
      <div
        className={`fixed left-0 top-0 h-full bg-gradient-to-b from-white to-gray-50 shadow-xl px-6 py-8 border-r border-gray-200 transition-transform duration-300 z-30 ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        } ${isMobile ? "w-64" : "w-72"}`}
      >
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-2xl font-extrabold text-indigo-800 tracking-wide">
            Agent Panel
          </h2>
          {isMobile && (
            <button
              onClick={closeSidebar}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          )}
        </div>

        <nav className="space-y-4">
          <Link
            href="/agent/dashboard"
            onClick={closeSidebar}
            className="flex items-center space-x-3 text-gray-700 hover:text-indigo-600 hover:bg-indigo-50 px-4 py-3 rounded-lg transition-all duration-200 group"
          >
            <BarChart3 className="h-5 w-5 text-indigo-600" />
            <span className="font-medium">Dashboard</span>
          </Link>

          <Link
            href="/agent/attendance"
            onClick={closeSidebar}
            className="flex items-center space-x-3 text-gray-700 hover:text-indigo-600 hover:bg-indigo-50 px-4 py-3 rounded-lg transition-all duration-200 group"
          >
            <Clock className="h-5 w-5 text-indigo-600" />
            <span className="font-medium">Attendance</span>
          </Link>

          <Link
            href="/agent/sales"
            onClick={closeSidebar}
            className="flex items-center space-x-3 text-gray-700 hover:text-indigo-600 hover:bg-indigo-50 px-4 py-3 rounded-lg transition-all duration-200 group"
          >
            <DollarSign className="h-5 w-5 text-indigo-600" />
            <span className="font-medium">Sales</span>
          </Link>

          {/* <Link
            href="/agent/notification"
            onClick={closeSidebar}
            className="flex items-center space-x-3 text-gray-700 hover:text-indigo-600 hover:bg-indigo-50 px-4 py-3 rounded-lg transition-all duration-200 group"
          >
            <span className="font-medium">Notification</span>
          </Link> */}

          <Link
            href="/agent/settings"
            onClick={closeSidebar}
            className="flex items-center space-x-3 text-gray-700 hover:text-indigo-600 hover:bg-indigo-50 px-4 py-3 rounded-lg transition-all duration-200 group"
          >
            <Settings className="h-5 w-5 text-indigo-600" />
            <span className="font-medium">Settings</span>
          </Link>
        </nav>
{/* 
        <button
          onClick={handleLogout}
          className="absolute bottom-8 left-6 right-6 bg-gradient-to-r from-red-500 to-red-600 text-white py-3 rounded-lg hover:from-red-600 hover:to-red-700 transition-all duration-200 shadow-md hover:shadow-lg font-medium"
        >
          Logout
        </button> */}
      </div>

      {/* Page Content */}
      <div
        className={`transition-all duration-300 ${
          isMobile ? "p-4" : isOpen ? "ml-72 p-8" : "ml-0 p-8"
        }`}
      >
        {children}
      </div>
    </div>
  );
}
