"use client";

import Sidebar from "../../../components/Sidebar";
import Topbar from "../../../components/Topbar";
import { Toaster } from "../../../components/ui/sonner";
import { useState } from "react";
import { cn } from "../../../lib/utils";

export default function DashboardLayout({ children }) {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-500">
      <Topbar collapsed={collapsed} />
      <div className="flex">
        {/* Sidebar */}
        <Sidebar collapsed={collapsed} setCollapsed={setCollapsed} />

        {/* Main content area */}
        <main
          className={cn(
            "flex-1 bg-white dark:bg-gray-800 pt-20 px-4 sm:px-6 lg:px-8 pb-6 transition-all duration-300",
            collapsed ? "lg:ml-20" : "lg:ml-60"
          )}
        >
          {children}
        </main>
      </div>
      <Toaster />
    </div>
  );
}
