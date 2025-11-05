"use client";

import {
  Home,
  BarChart3,
  Settings,
  Users,
  LogOut,
  Menu,
  Phone,
  CalendarDays,
  User,
  Code2Icon,
} from "lucide-react";
import { useState, useEffect } from "react";
import { useMediaQuery } from "react-responsive";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";


export default function Sidebar({ collapsed, setCollapsed }) {
  const [openMobile, setOpenMobile] = useState(false);
  const pathname = usePathname();
  const isMobile = useMediaQuery({ maxWidth: 1023 });

  useEffect(() => {
    setOpenMobile(false);
  }, [pathname]);

  const navItems = [
    { label: "Dashboard", href: "/dashboard", icon: Home },
    { label: "Users", href: "/dashboard/users", icon: Users },
    { label: "Contacts MSG", href: "/dashboard/contacts", icon: Phone },
    { label: "Bookings", href: "/dashboard/bookings", icon: CalendarDays },
    { label: "Agents", href: "/dashboard/agents", icon: User },
    { label: "Promo Code", href: "/dashboard/promo-codes", icon: Code2Icon },
    { label: "Attedance", href: "/dashboard/view-attendance", icon: BarChart3 },
    { label: "Shfit Panel", href: "/dashboard/shift-pannel", icon: BarChart3 },
    { label: "Analytics", href: "/dashboard/analytics", icon: BarChart3 },
    { label: "Setting", href: "/dashboard/settings", icon: Settings },
  ];

  return (
    <TooltipProvider>
      {openMobile && (
        <div
          onClick={() => setOpenMobile(false)}
          className="fixed inset-0 bg-black/40 backdrop-blur-sm z-30 lg:hidden"
        ></div>
      )}

      <motion.aside
        initial={{ width: 80 }}
        animate={{ width: openMobile ? "80vw" : collapsed ? 80 : 240 }}
        transition={{ duration: 0.3, ease: "easeInOut" }}
        className={cn(
          "fixed z-40 flex flex-col h-full bg-white border-r shadow-sm text-black",
          openMobile ? "left-0" : "-left-80",
          "lg:left-0 lg:top-0 lg:h-screen"
        )}
      >
        {/* Header */}
        <div className="flex items-center justify-center p-4">
          <span className="text-xl font-semibold tracking-tight whitespace-nowrap">
            My<span className="text-blue-600">Dashboard</span>
          </span>
        </div>

        <Separator />

        {/* Navigation */}
        <nav className="flex-1 p-3 space-y-2 overflow-y-auto">
          {navItems.map((item, index) => {
            const isActive = pathname === item.href;
            return (
              <Tooltip key={index}>
                <TooltipTrigger asChild>
                  <Link
                    href={item.href}
                    className={cn(
                      "flex items-center w-full rounded-lg px-3 py-2 text-sm font-medium transition-all duration-200",
                      collapsed ? "justify-center" : "justify-start",
                      isActive
                        ? "bg-blue-100 text-black"
                        : "text-black hover:bg-blue-50 hover:text-gray-800"
                    )}
                  >
                    <item.icon
                      size={20}
                      className={cn("shrink-0", collapsed ? "mr-2" : "mr-0")}
                    />
                    {(isMobile || !collapsed) && (
                      <span className="inline">{item.label}</span>
                    )}
                  </Link>
                </TooltipTrigger>
                {collapsed && (
                  <TooltipContent side="right">{item.label}</TooltipContent>
                )}
              </Tooltip>
            );
          })}


        </nav>

        <Separator />

        {/* Footer */}
        <div className="p-3">
          <button className="flex items-center justify-center w-full text-sm text-red-500 hover:text-red-600 hover:bg-red-50 rounded-lg px-3 py-2 transition">
            <LogOut size={18} className={cn("mr-2", collapsed && "mr-0")} />
            {(isMobile || !collapsed) && <span className="inline">Logout</span>}
          </button>
        </div>
      </motion.aside>

      {/* Mobile Toggle Button */}
      <Button
        variant="outline"
        size="icon"
        className="fixed top-4 left-4 z-50 lg:hidden"
        onClick={() => setOpenMobile(!openMobile)}
      >
        <Menu size={20} />
      </Button>

      {/* Desktop Toggle Button */}
      <Button
        variant="outline"
        size="icon"
        className="fixed top-4 left-4 z-50 hidden lg:flex"
        onClick={() => setCollapsed(!collapsed)}
      >
        <Menu size={20} />
      </Button>
    </TooltipProvider>
  );
}
