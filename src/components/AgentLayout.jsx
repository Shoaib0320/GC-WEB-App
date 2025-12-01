"use client";

import { useState } from "react";
import AgentSidebar from "./AgentSidebar";
import AgentTopbar from "./AgentTopbar";

export default function AgentLayout({ children }) {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <AgentTopbar collapsed={sidebarCollapsed} />
      <AgentSidebar
        isOpen={sidebarOpen}
        setIsOpen={setSidebarOpen}
        collapsed={sidebarCollapsed}
        setCollapsed={setSidebarCollapsed}
      >
        <div className="pt-16">
          {children}
        </div>
      </AgentSidebar>
    </div>
  );
}
