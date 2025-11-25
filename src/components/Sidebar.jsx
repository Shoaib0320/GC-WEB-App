"use client";

import {
  Home,
  Settings,
  Users,
  LogOut,
  Menu,
  Phone,
  CalendarDays,
  User,
  Code2Icon,
  TrendingUp,
  Bell,
  Clock,
  DollarSign,
  ClipboardList,
} from "lucide-react";

import { useState, useEffect } from "react";
import { useMediaQuery } from "react-responsive";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
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

  const { user, hasPermission } = useAuth();

  // Define nav items and attach permission requirements (module/action)
  const navItems = [
    { label: "Dashboard", href: "/dashboard", icon: Home },
    { label: "Users", href: "/dashboard/users", icon: Users, permission: { module: "user", action: "view" } },
    { label: "Contacts MSG", href: "/dashboard/contacts", icon: Phone, permission: { module: "contact", action: "view" } },
    { label: "Bookings", href: "/dashboard/bookings", icon: CalendarDays, permission: { module: "booking", action: "view" } },
    { label: "Shift Panel", href: "/dashboard/shift-pannel", icon: Clock, permission: { module: "shift", action: "view" } },
    { label: "Agents", href: "/dashboard/agents", icon: User, permission: { module: "agent", action: "view" } },
    { label: "Promo Code", href: "/dashboard/promo-codes", icon: Code2Icon, permission: { module: "promoCode", action: "view" } },
    { label: "Sales", href: "/dashboard/sales", icon: DollarSign, permission: { module: "reports", action: "finance" } },
    { label: "Attedance", href: "/dashboard/view-attendance", icon: ClipboardList, permission: { module: "attendance", action: "view" } },
    { label: "Notifications", href: "/dashboard/notifications", icon: Bell, permission: { module: "notification", action: "view" } },
    { label: "Analytics", href: "/dashboard/analytics", icon: TrendingUp, permission: { module: "analytics", action: "view" } },
    { label: "Setting", href: "/dashboard/settings", icon: Settings, permission: { module: "settings", action: "view" } },
  ];

  // Filter nav items based on permissions. If auth not loaded yet, show minimal items (dashboard)
  const allowedNavItems = navItems.filter((item) => {
    if (!item.permission) return true;
    // if user not loaded yet, hide permissioned items
    if (!user) return false;
    const { module, action = "view" } = item.permission;
    try {
      return hasPermission(module, action);
    } catch (e) {
      return false;
    }
  });

  return (
    <TooltipProvider>
      {/* Mobile Overlay */}
      {openMobile && (
        <div
          onClick={() => setOpenMobile(false)}
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 lg:hidden"
        />
      )}

      {/* Sidebar */}
      <motion.aside
        initial={{ width: 80 }}
        animate={{
          width: openMobile ? "80vw" : collapsed ? 80 : 260,
        }}
        transition={{ duration: 0.28, ease: "easeInOut" }}
        className={cn(
          "fixed z-50 flex flex-col h-full border-r shadow-xl bg-white/90 dark:bg-slate-900/80 backdrop-blur-2xl",
          "border-gray-200 dark:border-slate-700",
          // FIXED: On desktop, sidebar always left-0 (NO half-visible issue)
          openMobile ? "left-0" : "left-0",
          "lg:left-0 lg:top-0 lg:h-screen rounded-r-2xl"
        )}
      >
        {/* Header (hide when collapsed) */}
        <div
          className={cn(
            "flex items-center justify-center py-6 px-4 border-b border-gray-200 dark:border-slate-700 transition-all duration-200 gap-8",
            collapsed ? "opacity-0 pointer-events-none" : "opacity-100"
          )}
        >
          <h1 className="text-2xl font-semibold tracking-tight text-blue-600 dark:text-blue-400 select-none">
            My Dashboard
          </h1>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-3 space-y-2 overflow-y-auto">
          {allowedNavItems.map((item, index) => {
            const isActive = pathname === item.href;

            return (
              <Tooltip key={index}> {/* YAHAN PAR CHANGE KARNA HAI - idx se index */}
                <TooltipTrigger asChild>
                  <Link
                    href={item.href}
                    className={cn(
                      "flex items-center gap-3 rounded-xl px-4 py-3 text-[15px] font-medium group transition-all duration-200 overflow-hidden",

                      // Active styles
                      isActive
                        ? "bg-blue-600/10 text-blue-700 dark:text-blue-300 dark:bg-blue-900/30 border border-blue-600/20 shadow"
                        : "text-gray-700 dark:text-gray-300 hover:bg-gray-100/60 dark:hover:bg-slate-800/70",

                      // Collapsed icon mode
                      collapsed ? "justify-center px-3" : "justify-start"
                    )}
                  >
                    <item.icon
                      size={22}
                      className={cn(
                        "transition-all duration-200",
                        isActive && "text-blue-600 dark:text-blue-300"
                      )}
                    />

                    {(isMobile || !collapsed) && (
                      <span className="truncate transition-opacity duration-200">
                        {item.label}
                      </span>
                    )}
                  </Link>
                </TooltipTrigger>

                {/* Tooltip only in collapsed mode */}
                {collapsed && (
                  <TooltipContent side="right" className="text-sm">
                    {item.label}
                  </TooltipContent>
                )}
              </Tooltip>
            );
          })}
        </nav>

        <Separator className="dark:border-slate-700" />

        {/* Footer Logout */}
        <div className="p-4">
          <button
            className="w-full flex items-center gap-3 justify-center md:justify-start 
            text-[15px] font-medium rounded-xl px-4 py-3 text-red-600 dark:text-red-400 
            hover:bg-red-100 dark:hover:bg-red-900/40 transition-colors"
          >
            <LogOut size={20} />
            {(isMobile || !collapsed) && <span>Logout</span>}
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
        className="fixed top-4 left-4 hidden lg:flex z-50"
        onClick={() => setCollapsed(!collapsed)}
      >
        <Menu size={20} />
      </Button>
    </TooltipProvider>
  );
}