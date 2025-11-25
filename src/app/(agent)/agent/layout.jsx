

// "use client";

// import { AgentProvider } from "@/context/AgentContext";
// import { usePathname } from "next/navigation";
// import { useAgent } from "@/context/AgentContext";
// import { useState } from "react";
// import AgentSidebar from "@/components/AgentSidebar";
// import AgentTopbar from "@/components/AgentTopbar";

// function AgentLayoutContent({ children }) {
//   const pathname = usePathname();
//   const { isLoggedIn, isLoading } = useAgent();
//   const [isOpen, setIsOpen] = useState(false);

//   const toggleSidebar = () => setIsOpen(!isOpen);

//   // Hide sidebar and topbar on login, forgot-password, reset-password pages
//   if (
//     pathname.includes("/agent/login") ||
//     pathname.includes("/agent/forgot-password") ||
//     pathname.includes("/agent/reset-password")
//   ) {
//     return children;
//   }

//   // Show loading state while checking authentication
//   if (isLoading) {
//     return (
//       <div className="flex items-center justify-center h-screen bg-gradient-to-br from-gray-50 to-gray-100">
//         <div className="text-center">
//           <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
//           <p className="text-gray-600">Loading...</p>
//         </div>
//       </div>
//     );
//   }

//   // Only show sidebar and topbar if logged in
//   if (isLoggedIn) {
//     return (
//       <AgentSidebar isOpen={isOpen} setIsOpen={setIsOpen}>
//         <div className="flex flex-col h-full">
//           {/* Topbar */}
//           <AgentTopbar toggleSidebar={toggleSidebar} />

//           {/* Main content */}
//           <main className="flex-1 p-0 md:p-6">{children}</main>
//         </div>
//       </AgentSidebar>
//     );
//   }

//   // If not logged in and not on auth pages, show children without sidebar/topbar
//   return children;
// }

// import { ThemeProvider } from '@/context/ThemeContext';
// import { AuthProvider } from '@/context/AuthContext';

// export default function AgentLayout({ children }) {
//   return (
//     <AgentProvider>
//       <AuthProvider>
//         <ThemeProvider>
//           <AgentLayoutContent>{children}</AgentLayoutContent>
//         </ThemeProvider>
//       </AuthProvider>
//     </AgentProvider>
//   );
// }


// "use client";

// import { useState } from "react";
// import { usePathname } from "next/navigation";
// import { AgentProvider, useAgent } from "@/context/AgentContext";
// import { AuthProvider } from "@/context/AuthContext";
// import { ThemeProvider } from "@/context/ThemeContext";
// import AgentSidebar from "@/components/AgentSidebar";
// import AgentTopbar from "@/components/AgentTopbar";

// function AgentLayoutContent({ children }) {
//   const pathname = usePathname();
//   const { isLoggedIn, isLoading } = useAgent();
//   const [isOpen, setIsOpen] = useState(false);

//   const toggleSidebar = () => setIsOpen(!isOpen);

//   // Hide sidebar/topbar on auth pages
//   if (
//     pathname.includes("/agent/login") ||
//     pathname.includes("/agent/forgot-password") ||
//     pathname.includes("/agent/reset-password")
//   ) {
//     return children;
//   }

//   // Loading state while checking authentication
//   if (isLoading) {
//     return (
//       <div className="flex items-center justify-center h-screen bg-gradient-to-br from-gray-50 to-gray-100">
//         <div className="text-center">
//           <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
//           <p className="text-gray-600">Loading...</p>
//         </div>
//       </div>
//     );
//   }

//   // Show sidebar/topbar if logged in
//   if (isLoggedIn) {
//     return (
//       <AgentSidebar isOpen={isOpen} setIsOpen={setIsOpen}>
//         <div className="flex flex-col h-full">
//           <AgentTopbar toggleSidebar={toggleSidebar} />
//           <main className="flex-1 p-0 md:p-6">{children}</main>
//         </div>
//       </AgentSidebar>
//     );
//   }

//   // Not logged in: render children without sidebar/topbar
//   return children;
// }

// export default function AgentLayout({ children }) {
//   return (
//     <AgentProvider>
//       <AuthProvider>
//         <ThemeProvider>
//           <AgentLayoutContent>{children}</AgentLayoutContent>
//         </ThemeProvider>
//       </AuthProvider>
//     </AgentProvider>
//   );
// }



"use client";

import { useState } from "react";
import { usePathname } from "next/navigation";
import { AgentProvider, useAgent } from "@/context/AgentContext";
import { AuthProvider } from "@/context/AuthContext";
import { ThemeProvider } from "@/context/ThemeContext";
import { LocationProvider } from "@/context/LocationContext"; // اضافہ کریں
import AgentSidebar from "@/components/AgentSidebar";
import AgentTopbar from "@/components/AgentTopbar";

function AgentLayoutContent({ children }) {
  const pathname = usePathname();
  const { isLoggedIn, isLoading } = useAgent();
  const [isOpen, setIsOpen] = useState(false);

  const toggleSidebar = () => setIsOpen(!isOpen);

  // Hide sidebar/topbar on auth pages
  if (
    pathname.includes("/agent/login") ||
    pathname.includes("/agent/forgot-password") ||
    pathname.includes("/agent/reset-password")
  ) {
    return children;
  }

  // Loading state while checking authentication
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen bg-gradient-to-br from-gray-50 to-gray-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  // Show sidebar/topbar if logged in
  if (isLoggedIn) {
    return (
      <AgentSidebar isOpen={isOpen} setIsOpen={setIsOpen}>
        <div className="flex flex-col h-full">
          <AgentTopbar toggleSidebar={toggleSidebar} />
          <main className="flex-1 p-0 md:p-6">{children}</main>
        </div>
      </AgentSidebar>
    );
  }

  // Not logged in: render children without sidebar/topbar
  return children;
}

export default function AgentLayout({ children }) {
  return (
    <AgentProvider>
      <AuthProvider>
        <ThemeProvider>
          <LocationProvider> {/* اضافہ کریں */}
            <AgentLayoutContent>{children}</AgentLayoutContent>
          </LocationProvider>
        </ThemeProvider>
      </AuthProvider>
    </AgentProvider>
  );
}