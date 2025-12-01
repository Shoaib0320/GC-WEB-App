"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { useAgent } from "../context/AgentContext";
import {
  Bell,
  User,
  LogOut,
  Settings,
  Search,
  Menu,
  CheckCircle2,
  MessageCircle,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { AnimatePresence, motion } from "framer-motion";

export default function AgentTopbar({ collapsed, toggleSidebar, isOpen }) {
  const router = useRouter();
  const { agent, logout } = useAgent();
  const [showNoti, setShowNoti] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const notificationRef = useRef(null);

  // Close notifications when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (notificationRef.current && !notificationRef.current.contains(event.target)) {
        setShowNoti(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const notifications = [
    {
      id: 1,
      title: "New message received",
      description: "You have a new customer message",
      icon: <MessageCircle className="w-5 h-5 text-[#10B5DB]" />,
      time: "2m ago",
    },
    {
      id: 2,
      title: "Sale Completed",
      description: "Your recent sale has been confirmed.",
      icon: <CheckCircle2 className="w-5 h-5 text-green-500" />,
      time: "1h ago",
    },
  ];

  const handleLogout = async () => {
    await logout();
    router.push("/agent/login");
  };

  // Hide topbar on mobile when sidebar is open
  if (isOpen && typeof window !== "undefined" && window.innerWidth < 768) {
    return null;
  }

  return (
    <header
      className={`flex items-center justify-between fixed top-0 left-0 right-0 z-40 bg-white dark:bg-gray-900 shadow-md rounded-b-xl py-3 transition-all duration-300 overflow-visible ${
        collapsed ? "lg:left-[80px] lg:right-0 lg:px-4 lg:sm:px-6" : "lg:left-[300px] lg:right-0 lg:px-4 lg:sm:px-6"
      }`}
    >
      {/* Left Section */}
      <div className="flex items-center gap-4 sm:gap-6">
        {/* Mobile Menu Button */}
        <Button
          variant="ghost"
          size="icon"
          onClick={toggleSidebar}
          className="lg:hidden hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full p-2"
          aria-label="Toggle sidebar"
        >
          <Menu size={20} />
        </Button>
        <h1 className="text-lg sm:text-xl font-semibold tracking-tight text-gray-900 dark:text-gray-100">
          <span className="font-bold text-[#10B5DB]">Agent</span> Dashboard
        </h1>
      </div>

      {/* Center Section (Search Bar) */}
      <div className="flex-1 max-w-full sm:max-w-md mx-4 hidden md:flex">
        <div className="relative w-full">
          <Search className="absolute left-3 top-2.5 h-5 w-5 text-muted-foreground" />
          <Input
            placeholder="Search..."
            className="pl-10 pr-3 py-2 bg-gray-50 border border-gray-200 dark:bg-gray-800 dark:border-gray-700 focus-visible:ring-2 focus-visible:ring-blue-500 rounded-lg w-full"
          />
        </div>
      </div>

      {/* Right Section */}
      <div className="flex items-center gap-3 sm:gap-4 relative">
        {/* 🔔 Notifications */}
        <div className="relative" ref={notificationRef}>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setShowNoti(!showNoti)}
            aria-label="Toggle notifications"
            className="relative hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full p-2"
          >
            <Bell size={20} />
            <span className="absolute top-1 right-1 h-2.5 w-2.5 rounded-full bg-red-500 border border-white dark:border-gray-900" />
          </Button>

          <AnimatePresence>
            {showNoti && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.25 }}
                className="absolute right-0 mt-3 w-80 sm:w-96 rounded-xl border border-gray-200 bg-white shadow-xl overflow-hidden dark:border-gray-700 dark:bg-gray-800 z-50"
                style={{ zIndex: 1000 }} // Explicit z-index for notification
              >
                <div className="border-b p-3 font-semibold text-gray-700 dark:text-gray-300">
                  Notifications
                </div>
                <div className="max-h-64 overflow-y-auto">
                  {notifications.length > 0 ? (
                    notifications.map((n) => (
                      <div
                        key={n.id}
                        className="flex items-start gap-3 px-4 py-3 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors duration-150"
                      >
                        {n.icon}
                        <div className="flex-1">
                          <p className="text-sm font-medium text-gray-800 dark:text-gray-100">
                            {n.title}
                          </p>
                          <p className="text-xs text-gray-500 dark:text-gray-400">
                            {n.description}
                          </p>
                          <p className="mt-1 text-xs text-gray-400 dark:text-gray-500">
                            {n.time}
                          </p>
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="p-4 text-center text-sm text-gray-500 dark:text-gray-400">
                      No notifications
                    </p>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <Separator orientation="vertical" className="h-6 dark:bg-gray-700" />

        {/* Profile Dropdown */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              className="flex items-center gap-2 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors duration-200 rounded-lg px-2 py-1"
              aria-label="Open profile menu"
            >
              <Avatar className="h-8 w-8">
                <AvatarImage src="/avatars/default.png" alt="Agent" />
                <AvatarFallback>
                  {agent?.name?.charAt(0) || "A"}
                </AvatarFallback>
              </Avatar>
              <span className="hidden sm:inline text-sm font-medium text-gray-900 dark:text-gray-100">
                {agent?.name || "Agent"}
              </span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent 
            align="end" 
            className="w-48 sm:w-56 rounded-lg"
            style={{ zIndex: 1000 }} // Explicit z-index for dropdown
          >
            <DropdownMenuLabel>My Account</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => router.push("/agent/profile")}>
              <User size={16} className="mr-2" /> Profile
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => router.push("/agent/settings")}>
              <Settings size={16} className="mr-2" /> Settings
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              className="text-red-500"
              onClick={handleLogout}
            >
              <LogOut size={16} className="mr-2" /> Logout
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}