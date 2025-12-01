

// // "use client";

// // import { AgentProvider } from "@/context/AgentContext";
// // import { usePathname } from "next/navigation";
// // import { useAgent } from "@/context/AgentContext";
// // import { useState } from "react";
// // import AgentSidebar from "@/components/AgentSidebar";
// // import AgentTopbar from "@/components/AgentTopbar";

// // function AgentLayoutContent({ children }) {
// //   const pathname = usePathname();
// //   const { isLoggedIn, isLoading } = useAgent();
// //   const [isOpen, setIsOpen] = useState(false);

// //   const toggleSidebar = () => setIsOpen(!isOpen);

// //   // Hide sidebar and topbar on login, forgot-password, reset-password pages
// //   if (
// //     pathname.includes("/agent/login") ||
// //     pathname.includes("/agent/forgot-password") ||
// //     pathname.includes("/agent/reset-password")
// //   ) {
// //     return children;
// //   }

// //   // Show loading state while checking authentication
// //   if (isLoading) {
// //     return (
// //       <div className="flex items-center justify-center h-screen bg-gradient-to-br from-gray-50 to-gray-100">
// //         <div className="text-center">
// //           <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
// //           <p className="text-gray-600">Loading...</p>
// //         </div>
// //       </div>
// //     );
// //   }

// //   // Only show sidebar and topbar if logged in
// //   if (isLoggedIn) {
// //     return (
// //       <AgentSidebar isOpen={isOpen} setIsOpen={setIsOpen}>
// //         <div className="flex flex-col h-full">
// //           {/* Topbar */}
// //           <AgentTopbar toggleSidebar={toggleSidebar} />

// //           {/* Main content */}
// //           <main className="flex-1 p-0 md:p-6">{children}</main>
// //         </div>
// //       </AgentSidebar>
// //     );
// //   }

// //   // If not logged in and not on auth pages, show children without sidebar/topbar
// //   return children;
// // }

// // import { ThemeProvider } from '@/context/ThemeContext';
// // import { AuthProvider } from '@/context/AuthContext';

// // export default function AgentLayout({ children }) {
// //   return (
// //     <AgentProvider>
// //       <AuthProvider>
// //         <ThemeProvider>
// //           <AgentLayoutContent>{children}</AgentLayoutContent>
// //         </ThemeProvider>
// //       </AuthProvider>
// //     </AgentProvider>
// //   );
// // }


// // "use client";

// // import { useState } from "react";
// // import { usePathname } from "next/navigation";
// // import { AgentProvider, useAgent } from "@/context/AgentContext";
// // import { AuthProvider } from "@/context/AuthContext";
// // import { ThemeProvider } from "@/context/ThemeContext";
// // import AgentSidebar from "@/components/AgentSidebar";
// // import AgentTopbar from "@/components/AgentTopbar";

// // function AgentLayoutContent({ children }) {
// //   const pathname = usePathname();
// //   const { isLoggedIn, isLoading } = useAgent();
// //   const [isOpen, setIsOpen] = useState(false);

// //   const toggleSidebar = () => setIsOpen(!isOpen);

// //   // Hide sidebar/topbar on auth pages
// //   if (
// //     pathname.includes("/agent/login") ||
// //     pathname.includes("/agent/forgot-password") ||
// //     pathname.includes("/agent/reset-password")
// //   ) {
// //     return children;
// //   }

// //   // Loading state while checking authentication
// //   if (isLoading) {
// //     return (
// //       <div className="flex items-center justify-center h-screen bg-gradient-to-br from-gray-50 to-gray-100">
// //         <div className="text-center">
// //           <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
// //           <p className="text-gray-600">Loading...</p>
// //         </div>
// //       </div>
// //     );
// //   }

// //   // Show sidebar/topbar if logged in
// //   if (isLoggedIn) {
// //     return (
// //       <AgentSidebar isOpen={isOpen} setIsOpen={setIsOpen}>
// //         <div className="flex flex-col h-full">
// //           <AgentTopbar toggleSidebar={toggleSidebar} />
// //           <main className="flex-1 p-0 md:p-6">{children}</main>
// //         </div>
// //       </AgentSidebar>
// //     );
// //   }

// //   // Not logged in: render children without sidebar/topbar
// //   return children;
// // }

// // export default function AgentLayout({ children }) {
// //   return (
// //     <AgentProvider>
// //       <AuthProvider>
// //         <ThemeProvider>
// //           <AgentLayoutContent>{children}</AgentLayoutContent>
// //         </ThemeProvider>
// //       </AuthProvider>
// //     </AgentProvider>
// //   );
// // }



// "use client";

// import { useState } from "react";
// import { usePathname } from "next/navigation";
// import { AgentProvider, useAgent } from "@/context/AgentContext";
// import { AuthProvider } from "@/context/AuthContext";
// import { ThemeProvider } from "@/context/ThemeContext";
// import { LocationProvider } from "@/context/LocationContext"; // اضافہ کریں
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
//           <LocationProvider> {/* اضافہ کریں */}
//             <AgentLayoutContent>{children}</AgentLayoutContent>
//           </LocationProvider>
//         </ThemeProvider>
//       </AuthProvider>
//     </AgentProvider>
//   );
// }
// src/app/(agent)/agent/layout.js
"use client";

import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import { AgentProvider, useAgent } from "@/context/AgentContext";
import { AuthProvider } from "@/context/AuthContext";
import { ThemeProvider } from "@/context/ThemeContext";
import { LocationProvider } from "@/context/LocationContext";
import AgentSidebar from "@/components/AgentSidebar";
import AgentTopbar from "@/components/AgentTopbar";
import LocationPermissionPrompt from "@/components/LocationPermissionPrompt";

function AgentLayoutContent({ children }) {
  const pathname = usePathname();
  const { isLoggedIn, isLoading, agent } = useAgent();
  const [isOpen, setIsOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(false);
  const [showLocationPrompt, setShowLocationPrompt] = useState(false);
  const [hasCheckedLocation, setHasCheckedLocation] = useState(false);

  const toggleSidebar = () => setIsOpen(!isOpen);

  // Automatic location permission check
  useEffect(() => {
    if (isLoggedIn && agent && !isLoading) {
      // Request location immediately (no delay)
      checkLocationPermission();
    }
  }, [isLoggedIn, agent, isLoading]);

  const checkLocationPermission = async () => {
    console.log('🔍 Checking location permission...');
    
    // Check if we're on a page that needs location
    const locationRequiredPages = [
      '/agent/dashboard',
      '/agent/attendance'
    ];
    
    const needsLocation = locationRequiredPages.some(page => 
      pathname.includes(page)
    );
    
    if (!needsLocation) {
      console.log('📍 Location not required for this page:', pathname);
      return;
    }

    // Check current permission state
    let currentPermission = 'prompt';
    if (navigator.permissions) {
      try {
        const result = await navigator.permissions.query({ name: 'geolocation' });
        currentPermission = result.state;
        console.log('📍 Current permission state:', currentPermission);
      } catch (error) {
        console.warn('📍 Permission query not supported, will request location directly');
        currentPermission = 'unknown';
      }
    }

    // Show prompt if permission is not already granted or we're on dashboard/attendance
    if (currentPermission === 'prompt' || currentPermission === 'unknown') {
      console.log('📍 Showing location permission prompt');
      setShowLocationPrompt(true);
      setHasCheckedLocation(true);
    } else if (currentPermission === 'denied') {
      console.log('📍 Location permission denied by user');
      setHasCheckedLocation(true);
    } else {
      console.log('📍 Location permission already granted');
      setHasCheckedLocation(true);
    }
  };

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
      <>
        <AgentTopbar toggleSidebar={toggleSidebar} collapsed={collapsed} isOpen={isOpen} />
        <AgentSidebar isOpen={isOpen} setIsOpen={setIsOpen} collapsed={collapsed} setCollapsed={setCollapsed}>
          {children}
        </AgentSidebar>

        {/* Location Permission Prompt */}
        <LocationPermissionPrompt
          visible={showLocationPrompt}
          onClose={() => {
            console.log('📍 Prompt closed by user');
            setShowLocationPrompt(false);
          }}
          onPermissionGranted={(coords) => {
            console.log('📍 Location permission granted with coords:', coords);
            setShowLocationPrompt(false);

            // Trigger location refresh in all components
            if (typeof window !== 'undefined') {
              window.dispatchEvent(new CustomEvent('locationPermissionGranted', {
                detail: { coords }
              }));
            }
          }}
          onPermissionDenied={(error) => {
            console.log('📍 Location permission denied:', error);
            setShowLocationPrompt(false);

            // Show notification about limited functionality
            if (typeof window !== 'undefined') {
              window.dispatchEvent(new CustomEvent('locationPermissionDenied', {
                detail: { error }
              }));
            }
          }}
        />
      </>
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
          <LocationProvider>
            <AgentLayoutContent>{children}</AgentLayoutContent>
          </LocationProvider>
        </ThemeProvider>
      </AuthProvider>
    </AgentProvider>
  );
}