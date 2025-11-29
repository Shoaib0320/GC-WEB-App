"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useAgent } from "../context/AgentContext";
import { BarChart3, Clock, DollarSign, Settings, LogOut, Menu, X, User, PanelLeftClose } from "lucide-react";

export default function AgentSidebar({ isOpen, setIsOpen, children }) {
  const router = useRouter();
  const { logout, agent } = useAgent();
  const [isMobile, setIsMobile] = useState(false);
  const [activePath, setActivePath] = useState("");

  useEffect(() => {
    setActivePath(window.location.pathname);
  }, []);

  useEffect(() => {
    const checkMobile = () => {
      const mobile = window.innerWidth < 768;
      setIsMobile(mobile);
      if (!mobile) setIsOpen(true);
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

  const navItems = [
    { href: "/agent/dashboard", icon: BarChart3, label: "Dashboard" },
    { href: "/agent/attendance", icon: Clock, label: "Attendance" },
    { href: "/agent/sales", icon: DollarSign, label: "Sales" },
    { href: "/agent/settings", icon: Settings, label: "Settings" },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      {/* Mobile Header */}
      {isMobile && (
        <div className="fixed top-0 left-0 right-0 bg-white/80 backdrop-blur-md border-b border-gray-200 z-40 p-4 flex items-center justify-between">
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="p-2 rounded-lg bg-indigo-50 text-indigo-600 hover:bg-indigo-100 transition-all duration-200"
          >
            {isOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
          <h1 className="text-lg font-bold text-indigo-800">Agent Panel</h1>
          <div className="w-9 h-9 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-full flex items-center justify-center text-white text-sm font-medium">
            <User className="w-4 h-4" />
          </div>
        </div>
      )}

      {/* Mobile Overlay */}
      {isMobile && isOpen && (
        <div
          className="fixed inset-0 bg-black/20 backdrop-blur-sm z-20 md:hidden animate-fade-in"
          onClick={closeSidebar}
        />
      )}

      {/* Sidebar */}
      <div
        className={`fixed left-0 top-0 h-full bg-gradient-to-b from-white via-white to-blue-50/30 shadow-2xl border-r border-gray-100 transition-all duration-300 z-30 ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        } ${isMobile ? "w-72" : "w-80"}`}
      >
        {/* Sidebar Header */}
        <div className="flex flex-col p-6 pb-4 border-b border-gray-100">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
                <BarChart3 className="w-5 h-5 text-white" />
              </div>
              <div>
                <h2 className="text-xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                  Agent Panel
                </h2>
                <p className="text-xs text-gray-500 mt-0.5">Professional Dashboard</p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              {!isMobile && (
                <button
                  onClick={() => setIsOpen(false)}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-all duration-200 hover:scale-110"
                  title="Close sidebar"
                >
                  <PanelLeftClose className="w-4 h-4 text-gray-600" />
                </button>
              )}
              {isMobile && (
                <button
                  onClick={closeSidebar}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-all duration-200 hover:scale-110"
                >
                  <X className="w-4 h-4 text-gray-600" />
                </button>
              )}
            </div>
          </div>

          {/* User Info */}
          <div className="flex items-center space-x-3 p-3 bg-white rounded-lg border border-gray-100 shadow-sm">
            <div className="w-10 h-10 bg-gradient-to-r from-green-500 to-emerald-600 rounded-full flex items-center justify-center text-white text-sm font-medium shadow-md">
              {agent?.name?.charAt(0) || <User className="w-5 h-5" />}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-gray-800 truncate">
                {agent?.name || "Agent"}
              </p>
              <p className="text-xs text-gray-500 truncate">Online</p>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="p-4 space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activePath === item.href;
            
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={closeSidebar}
                className={`flex items-center space-x-3 px-4 py-3 rounded-xl transition-all duration-200 group relative overflow-hidden ${
                  isActive
                    ? "bg-gradient-to-r from-indigo-50 to-blue-50 text-indigo-700 border border-indigo-100 shadow-sm"
                    : "text-gray-600 hover:text-indigo-600 hover:bg-white hover:shadow-md"
                }`}
              >
                {/* Animated background effect */}
                {isActive && (
                  <div className="absolute inset-0 bg-gradient-to-r from-indigo-500/5 to-blue-500/5 animate-pulse" />
                )}
                
                {/* Icon with gradient when active */}
                <div className={`relative z-10 p-1.5 rounded-lg transition-all duration-200 ${
                  isActive 
                    ? "bg-gradient-to-r from-indigo-500 to-purple-600 text-white shadow-md" 
                    : "bg-gray-100 text-gray-500 group-hover:bg-indigo-50 group-hover:text-indigo-600"
                }`}>
                  <Icon className="w-4 h-4" />
                </div>
                
                <span className={`relative z-10 font-medium transition-all duration-200 ${
                  isActive ? "text-indigo-700" : "group-hover:text-indigo-600"
                }`}>
                  {item.label}
                </span>

                {/* Active indicator */}
                {isActive && (
                  <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                    <div className="w-2 h-2 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-full animate-bounce" />
                  </div>
                )}
              </Link>
            );
          })}
        </nav>

        {/* Logout Button */}
        <div className="absolute bottom-6 left-6 right-6">
          <button
            onClick={handleLogout}
            className="flex items-center justify-center space-x-2 w-full bg-gradient-to-r from-gray-50 to-gray-100 hover:from-red-50 hover:to-red-100 text-gray-700 hover:text-red-700 py-3 rounded-xl border border-gray-200 hover:border-red-200 transition-all duration-200 shadow-sm hover:shadow-md font-medium group"
          >
            <LogOut className="w-4 h-4 transition-transform duration-200 group-hover:scale-110" />
            <span>Logout</span>
          </button>
        </div>
      </div>

      {/* Page Content */}
      <div
        className={`transition-all duration-300 min-h-screen ${
          isMobile
            ? "pt-16 p-4"
            : isOpen
              ? "ml-80 p-8"
              : "ml-0 p-8"
        }`}
      >
        {children}

        {/* Toggle Button for Desktop */}
        {!isMobile && (
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="fixed bottom-4 right-4 z-50 p-3 bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-full shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-110"
            title={isOpen ? "Close Sidebar" : "Open Sidebar"}
          >
            <Menu className={`w-6 h-6 transition-transform duration-200 ${isOpen ? "rotate-90" : ""}`} />
          </button>
        )}
      </div>

      {/* Custom Styles for Animations */}
      <style jsx global>{`
        @keyframes fade-in {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        .animate-fade-in {
          animation: fade-in 0.2s ease-out;
        }
      `}</style>
    </div>
  );
}