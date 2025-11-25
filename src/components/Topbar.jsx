"use client";

import { useState } from "react";
import { useAuth } from '@/context/AuthContext';
import {
  Bell,
  LogOut,
  Settings,
  User,
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

export default function Topbar({ collapsed }) {
  const { user, logout } = useAuth();
  const [showNoti, setShowNoti] = useState(false);

  const notifications = [
    {
      id: 1,
      title: "New message from Ali",
      description: "Hey! Can we schedule a quick meeting?",
      icon: <MessageCircle className="w-5 h-5 text-blue-500" />,
      time: "2m ago",
    },
    {
      id: 2,
      title: "Booking Confirmed",
      description: "Your booking for Oct 12 has been confirmed.",
      icon: <CheckCircle2 className="w-5 h-5 text-green-500" />,
      time: "1h ago",
    },
  ];

  return (
    <header
      className={`flex items-center justify-between fixed top-0 left-0 right-0 z-50 bg-white dark:bg-gray-900 shadow-md rounded-b-xl px-4 sm:px-6 py-3 transition-all duration-300 ${
        collapsed ? "lg:ml-20" : "lg:ml-60"
      }`}
    >
      {/* Left Section */}
      <div className="flex items-center gap-4 sm:gap-6">
        {/* Mobile Menu Toggle */}
        <Button variant="ghost" size="icon" className="lg:hidden">
          <Menu size={20} />
        </Button>

        <h1 className="text-lg sm:text-xl font-semibold tracking-tight text-gray-900 dark:text-gray-100">
          Dashboard
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
        <div className="relative">
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
                <AvatarImage src="/avatars/default.png" alt="User" />
                <AvatarFallback>
                  {user?.firstName?.charAt(0)}
                  {user?.lastName?.charAt(0)}
                </AvatarFallback>
              </Avatar>
              <span className="hidden sm:inline text-sm font-medium text-gray-900 dark:text-gray-100">
                {user?.firstName} {user?.lastName}
              </span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48 sm:w-56 rounded-lg">
            <DropdownMenuLabel>My Account</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem>
              <User size={16} className="mr-2" /> Profile
            </DropdownMenuItem>
            <DropdownMenuItem>
              <Settings size={16} className="mr-2" /> Settings
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              className="text-red-500"
              onClick={logout}
            >
              <LogOut size={16} className="mr-2" /> Logout
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
