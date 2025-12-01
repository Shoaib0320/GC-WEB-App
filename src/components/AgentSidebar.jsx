"use client";

import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { useAgent } from "../context/AgentContext";
import { Button } from "@/components/ui/button";
import { 
  BarChart3, 
  Clock, 
  DollarSign, 
  Settings, 
  LogOut, 
  Menu, 
  X, 
  User
} from "lucide-react";
import { useMediaQuery } from "react-responsive";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { Separator } from "@/components/ui/separator";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import Image from "next/image";

export default function AgentSidebar({ isOpen, setIsOpen, collapsed, setCollapsed, children }) {
  const router = useRouter();
  const pathname = usePathname(); // Use usePathname hook for Next.js 13+
  const { logout, agent } = useAgent();
  const [activePath, setActivePath] = useState("");
  const isMobile = useMediaQuery({ maxWidth: 768 });

  // Use pathname to detect active page
  useEffect(() => {
    if (pathname) {
      setActivePath(pathname);
      console.log("Current path:", pathname); // Debug log
    }
  }, [pathname]);

  useEffect(() => {
    if (isMobile) {
      setIsOpen(false);
    }
  }, [isMobile, setIsOpen]);

  const handleLogout = async () => {
    await logout();
    router.push("/agent/login");
  };

  const navItems = [
    { label: "Dashboard", href: "/agent/dashboard", icon: BarChart3 },
    { label: "Attendance", href: "/agent/attendance", icon: Clock },
    { label: "Sales", href: "/agent/sales", icon: DollarSign },
    { label: "Settings", href: "/agent/settings", icon: Settings },
  ];

  return (
    <TooltipProvider>
      <div className="min-h-screen bg-white">
        {/* Mobile Overlay */}
        <AnimatePresence>
          {isMobile && isOpen && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsOpen(false)}
              className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 lg:hidden"
            />
          )}
        </AnimatePresence>

        {/* Sidebar */}
        <motion.aside
          initial={false}
          animate={{
            width: isMobile
              ? (isOpen ? "100vw" : 0)
              : (collapsed ? 80 : 300),
            x: isMobile && !isOpen ? "-100%" : 0
          }}
          transition={{ duration: 0.3, ease: "easeInOut" }}
          className={cn(
            "fixed z-50 flex flex-col h-full shadow-xl bg-white/90 backdrop-blur-2xl",
            "border-gray-200",
            "lg:left-0 lg:top-0 lg:h-screen lg:rounded-r-2xl",
            "overflow-hidden",
            isMobile && !isOpen ? "pointer-events-none" : "",
            !isMobile && "lg:border-r-0"
          )}
        >
          {/* Mobile Header with Close Button */}
          {isMobile && isOpen && (
            <div className="flex items-center justify-between p-4 border-b border-gray-200">
              <Image
                src="/images/GCLogo.png"
                alt="GC Logo"
                width={80}
                height={80}
                className="object-contain"
              />
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsOpen(false)}
                className="rounded-full"
              >
                <X size={20} />
              </Button>
            </div>
          )}

          {/* Desktop Header */}
          {!isMobile && (
            <div
              className={cn(
                "flex items-center justify-center py-6 px-4 border-b border-gray-200 transition-all duration-200 gap-8",
                collapsed ? "opacity-0 pointer-events-none" : "opacity-100"
              )}
            >
              <Image
                src="/images/GCLogo.png"
                alt="GC Logo"
                width={70}
                height={70}
                className="object-contain"
              />
            </div>
          )}

          {/* Navigation */}
          <nav className="flex-1 p-3 space-y-2 overflow-y-auto">
            {navItems.map((item, index) => {
              // Check if current path matches item href
              const isActive = pathname === item.href;
              
              // For debugging
              console.log(`Item: ${item.label}, Path: ${pathname}, Active: ${isActive}`);

              return (
                <Tooltip key={index}>
                  <TooltipTrigger asChild>
                    <Link
                      href={item.href}
                      onClick={() => isMobile && setIsOpen(false)}
                      className={cn(
                        "flex items-center gap-3 rounded-xl px-4 py-3 text-[15px] font-medium group transition-all duration-200 overflow-hidden",
                        "relative",

                        // Active styles
                        isActive
                          ? "bg-[#10B5DB]/10 text-[#10B5DB] border border-[#10B5DB]/20 shadow-sm"
                          : "text-gray-700 hover:bg-gray-100/60",

                        // Collapsed icon mode (desktop only)
                        !isMobile && collapsed ? "justify-center px-3" : "justify-start"
                      )}
                    >
                      {/* Active indicator line - Show on left side */}
                      {isActive && (
                        <div className="absolute left-0 top-1/2 transform -translate-y-1/2 w-1 h-8 bg-[#10B5DB] rounded-r-full" />
                      )}

                      <item.icon
                        size={22}
                        className={cn(
                          "transition-all duration-200",
                          isActive 
                            ? "text-[#10B5DB]" 
                            : "text-gray-600 group-hover:text-[#10B5DB]"
                        )}
                      />

                      {(!isMobile || isOpen) && !collapsed && (
                        <span className="truncate transition-opacity duration-200">
                          {item.label}
                          {isActive && (
                            <span className="ml-2 text-xs text-[#10B5DB]/70">●</span>
                          )}
                        </span>
                      )}
                    </Link>
                  </TooltipTrigger>

                  {/* Tooltip only in collapsed mode (desktop only) */}
                  {!isMobile && collapsed && (
                    <TooltipContent side="right" className="text-sm">
                      {item.label}
                      {isActive && " (Active)"}
                    </TooltipContent>
                  )}
                </Tooltip>
              );
            })}
          </nav>

          {/* User Info - Moved to bottom */}
          {(!isMobile || isOpen) && !collapsed && (
            <div className="mt-auto p-4 border-t border-gray-200">
              <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                <div className="w-10 h-10 bg-[#10B5DB] rounded-full flex items-center justify-center text-white text-sm font-medium">
                  {agent?.name?.charAt(0) || <User className="w-5 h-5" />}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-gray-800 truncate">
                    {agent?.name || "Agent"}
                  </p>
                  <p className="text-xs text-gray-500 truncate">Agent Dashboard</p>
                </div>
              </div>
            </div>
          )}

          <Separator className="border-gray-200" />

          {/* Footer Logout */}
          <div className="p-4">
            <button
              onClick={handleLogout}
              className={cn(
                "w-full flex items-center gap-3 text-[15px] font-medium rounded-xl px-4 py-3 text-red-600 hover:bg-red-100 transition-colors",
                !isMobile && collapsed ? "justify-center" : "justify-start"
              )}
            >
              <LogOut size={20} />
              {(!isMobile || isOpen) && !collapsed && <span>Logout</span>}
            </button>
          </div>
        </motion.aside>

        {/* Desktop Toggle Button */}
        {!isMobile && (
          <Button
            variant="outline"
            size="icon"
            className="fixed top-4 left-4 hidden lg:flex z-50"
            onClick={() => setCollapsed(!collapsed)}
          >
            <Menu size={20} />
          </Button>
        )}

        {/* Page Content */}
        <div
          className={cn(
            "transition-all duration-300 min-h-screen",
            isMobile
              ? "pt-14 p-4"
              : collapsed
                ? "ml-20 pt-20 p-8"
                : "ml-80 pt-20 p-8"
          )}
        >
          {children}
        </div>
      </div>
    </TooltipProvider>
  );
}