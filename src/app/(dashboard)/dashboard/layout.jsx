"use client";

import Sidebar from "../../../components/Sidebar";
import Topbar from "../../../components/Topbar";
import { Toaster } from "../../../components/ui/sonner";
import { useState } from "react";
import { cn } from "../../../lib/utils";

export default function DashboardLayout({ children }) {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <div className="min-h-screen bg-gray-100">
      <Topbar collapsed={collapsed} />
      <div className="flex">
        {/* Sidebar */}
        <Sidebar collapsed={collapsed} setCollapsed={setCollapsed} />

        {/* Main content area */}
        <main className={cn("flex-1 pt-16 px-4 lg:px-6 pb-6 transition-all duration-300", collapsed ? "lg:ml-20" : "lg:ml-60")}>{children}</main>
      </div>
      <Toaster/>
    </div>
  );
}
