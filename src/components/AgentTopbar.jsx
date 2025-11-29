// // "use client";

// // import { useAgent } from "@/context/AgentContext";
// // import Link from "next/link";
// // import { User, Bell, LogOut } from "lucide-react";
// // import { Button } from "@/components/ui/button";
// // import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

// // export default function AgentTopbar() {
// //   const { agent, logout } = useAgent();

// //   const handleLogout = () => {
// //     logout();
// //   };

// //   return (
// //     <div className="bg-white shadow-sm border-b px-6 py-3 flex items-center justify-between">
// //       <div className="flex items-center space-x-4">
// //         <h1 className="text-xl font-semibold text-gray-900">Agent Dashboard</h1>
// //       </div>

// //       <div className="flex items-center space-x-4">
// //         {/* Profile */}
// //         <Link href="/agent/profile">
// //           <Button variant="ghost" size="sm" className="flex items-center space-x-2">
// //             <Avatar className="h-8 w-8">
// //               <AvatarImage src={agent?.profileImage} alt={agent?.name} />
// //               <AvatarFallback>
// //                 <User className="h-4 w-4" />
// //               </AvatarFallback>
// //             </Avatar>
// //             <span className="hidden md:block">{agent?.name || "Profile"}</span>
// //           </Button>
// //         </Link>

// //         {/* Notification */}
// //         <Link href="/agent/notification">
// //           <Button variant="ghost" size="sm" className="relative">
// //             <Bell className="h-5 w-5" />
// //             {/* Add notification count if needed */}
// //             <span className="absolute -top-1 -right-1 h-4 w-4 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
// //               0
// //             </span>
// //           </Button>
// //         </Link>

// //         {/* Logout */}
// //         <Button
// //           variant="ghost"
// //           size="sm"
// //           onClick={handleLogout}
// //           className="flex items-center space-x-2 text-red-600 hover:text-red-700 hover:bg-red-50"
// //         >
// //           <LogOut className="h-5 w-5" />
// //           <span className="hidden md:block">Logout</span>
// //         </Button>
// //       </div>
// //     </div>
// //   );
// // }


// "use client";

// import { useState } from "react";
// import { useRouter } from "next/navigation";
// import { Menu, Bell, User, LogOut } from "lucide-react";
// import { Button } from "@/components/ui/button";

// export default function AgentTopbar() {
//   const router = useRouter();
//   const [dropdownOpen, setDropdownOpen] = useState(false);

//   const handleLogout = () => {
//     // Remove agent data from localStorage or cookies
//     localStorage.removeItem("agentData");
//     document.cookie = "agentToken=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
//     router.push("/agent/login");
//   };

//   return (
//     <div className="flex justify-between items-center bg-white/80 backdrop-blur-sm shadow-md rounded-2xl p-4 mb-6">
//       {/* Left: Menu or Logo */}
//       <div className="flex items-center space-x-4">
//         {/* <Menu className="h-6 w-6 text-gray-700" /> */}
//         <h2 className="text-lg font-semibold text-gray-800">Dashboard</h2>
//       </div>

//       {/* Right: Notifications + Profile */}
//       <div className="flex items-center space-x-4 relative">
//         {/* Notification */}
//         <button
//           onClick={() => router.push("/agent/notification")}
//           className="relative p-2 rounded-full hover:bg-gray-100 transition"
//         >
//           <Bell className="h-6 w-6 text-gray-700" />
//           <span className="absolute top-0 right-0 inline-block w-2 h-2 bg-red-500 rounded-full"></span>
//         </button>

//         {/* Profile Dropdown */}
//         <div className="relative">
//           <button
//             onClick={() => setDropdownOpen(!dropdownOpen)}
//             className="flex items-center space-x-2 p-2 rounded-full hover:bg-gray-100 transition"
//           >
//             <User className="h-6 w-6 text-gray-700" />
//           </button>

//           {dropdownOpen && (
//             <div className="absolute right-0 mt-2 w-40 bg-white rounded-xl shadow-lg border border-gray-200 z-50">
//               <button
//                 onClick={() => router.push("/agent/profile")}
//                 className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 space-x-2"
//               >
//                 <User className="h-4 w-4" />
//                 <span>My Profile</span>
//               </button>
//               <button
//                 onClick={handleLogout}
//                 className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 space-x-2"
//               >
//                 <LogOut className="h-4 w-4" />
//                 <span>Logout</span>
//               </button>
//             </div>
//           )}
//         </div>
//       </div>
//     </div>
//   );
// }


// "use client";

// import { useState } from "react";
// import { useRouter } from "next/navigation";
// import { Menu, Bell, User, LogOut } from "lucide-react";
// import { Button } from "@/components/ui/button";

// export default function AgentTopbar({ toggleSidebar }) {
//   const router = useRouter();
//   const [dropdownOpen, setDropdownOpen] = useState(false);

//   const handleLogout = () => {
//     // Remove agent data from localStorage or cookies
//     localStorage.removeItem("agentData");
//     document.cookie = "agentToken=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
//     router.push("/agent/login");
//   };

//   return (
//     <div className="flex justify-between items-center bg-white/80 backdrop-blur-sm shadow-md rounded-2xl p-4 mb-6">
//       {/* Left: Hamburger + Title */}
//       <div className="flex items-center space-x-4">
//         {/* Hamburger to toggle sidebar */}
//         <button
//           onClick={toggleSidebar}
//           className="p-2 rounded-md hover:bg-gray-100 transition"
//         >
//           <Menu className="h-6 w-6 text-gray-700" />
//         </button>

//         <h2 className="text-lg font-semibold text-gray-800">Dashboard</h2>
//       </div>

//       {/* Right: Notifications + Profile */}
//       <div className="flex items-center space-x-4 relative">
//         {/* Notification */}
//         <button
//           onClick={() => router.push("/agent/notification")}
//           className="relative p-2 rounded-full hover:bg-gray-100 transition"
//         >
//           <Bell className="h-6 w-6 text-gray-700" />
//           <span className="absolute top-0 right-0 inline-block w-2 h-2 bg-red-500 rounded-full"></span>
//         </button>

//         {/* Profile Dropdown */}
//         <div className="relative">
//           <button
//             onClick={() => setDropdownOpen(!dropdownOpen)}
//             className="flex items-center space-x-2 p-2 rounded-full hover:bg-gray-100 transition"
//           >
//             <User className="h-6 w-6 text-gray-700" />
//           </button>

//           {dropdownOpen && (
//             <div className="absolute right-0 mt-2 w-40 bg-white rounded-xl shadow-lg border border-gray-200 z-50">
//               <button
//                 onClick={() => router.push("/agent/profile")}
//                 className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 space-x-2"
//               >
//                 <User className="h-4 w-4" />
//                 <span>My Profile</span>
//               </button>
//               <button
//                 onClick={handleLogout}
//                 className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 space-x-2"
//               >
//                 <LogOut className="h-4 w-4" />
//                 <span>Logout</span>
//               </button>
//             </div>
//           )}
//         </div>
//       </div>
//     </div>
//   );
// }


"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { Bell, User, LogOut, Settings, Search, ChevronDown } from "lucide-react";

export default function AgentTopbar() {
  const router = useRouter();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [agentData, setAgentData] = useState(null);
  const dropdownRef = useRef(null);

  useEffect(() => {
    // Get agent data from localStorage
    const agent = JSON.parse(localStorage.getItem("agentData") || "{}");
    setAgentData(agent);

    // Handle scroll effect
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("agentData");
    document.cookie = "agentToken=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
    router.push("/agent/login");
  };

  // Close dropdown if click outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className={`sticky top-0 z-30 transition-all duration-300 ${
      isScrolled 
        ? "bg-white/95 backdrop-blur-xl shadow-lg border-b border-gray-100/80" 
        : "bg-white/80 backdrop-blur-md shadow-sm"
    }`}>
      <div className="flex justify-between items-center p-4 lg:p-6">
        
        {/* Left: Title */}
        <div className="flex items-center">
          {/* Title with Breadcrumb */}
          <div className="flex flex-col">
            <h1 className="text-xl lg:text-2xl font-bold bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent">
              Dashboard
            </h1>
            <p className="text-xs text-gray-500 hidden sm:block">
              Welcome back, {agentData?.name || "Agent"}!
            </p>
          </div>
        </div>

        {/* Right: Search + Notifications + Profile */}
        <div className="flex items-center space-x-3 lg:space-x-6">
          
          {/* Search Bar - Hidden on mobile */}
          <div className="hidden md:flex items-center relative">
            <Search className="absolute left-3 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search..."
              className="pl-10 pr-4 py-2.5 w-48 lg:w-64 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-200 text-sm"
            />
          </div>

          {/* Mobile Search Button */}
          <button className="md:hidden p-2.5 rounded-xl bg-gray-50 border border-gray-200 hover:bg-gray-100 transition-all duration-200">
            <Search className="h-5 w-5 text-gray-600" />
          </button>

          {/* Notification Bell */}
          <button
            onClick={() => router.push("/agent/notification")}
            className="relative p-2.5 rounded-xl bg-white shadow-sm border border-gray-200 hover:shadow-md hover:border-gray-300 transition-all duration-200 group"
          >
            <Bell className="h-5 w-5 text-gray-600 group-hover:text-blue-600 transition-colors" />
            <span className="absolute top-1.5 right-1.5 inline-block w-2 h-2 bg-red-500 rounded-full ring-2 ring-white"></span>
            <div className="absolute -top-1 -right-1 w-3 h-3 bg-red-400 rounded-full animate-ping opacity-75"></div>
          </button>

          {/* Profile Dropdown */}
          <div ref={dropdownRef} className="relative">
            <button
              onClick={() => setDropdownOpen(!dropdownOpen)}
              className="flex items-center space-x-2 p-1.5 rounded-xl bg-white shadow-sm border border-gray-200 hover:shadow-md hover:border-gray-300 transition-all duration-200 group"
            >
              <div className="w-8 h-8 lg:w-9 lg:h-9 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white text-sm font-semibold shadow-md">
                {agentData?.name?.charAt(0)?.toUpperCase() || "A"}
              </div>
              <div className="hidden lg:flex items-center space-x-1">
                <span className="text-sm font-medium text-gray-700 max-w-24 truncate">
                  {agentData?.name?.split(' ')[0] || "Agent"}
                </span>
                <ChevronDown className={`h-4 w-4 text-gray-500 transition-transform duration-200 ${
                  dropdownOpen ? "rotate-180" : ""
                }`} />
              </div>
            </button>

            {/* Dropdown Menu */}
            {dropdownOpen && (
              <div className="absolute right-0 mt-2 w-56 bg-white rounded-2xl shadow-xl border border-gray-200/80 backdrop-blur-sm z-50 animate-in fade-in-0 zoom-in-95">
                {/* User Info Section */}
                <div className="p-4 border-b border-gray-100">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-semibold shadow-md">
                      {agentData?.name?.charAt(0)?.toUpperCase() || "A"}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-gray-800 truncate">
                        {agentData?.name || "Agent"}
                      </p>
                      <p className="text-xs text-gray-500 truncate">
                        {agentData?.email || "agent@example.com"}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Menu Items */}
                <div className="p-2">
                  <button
                    onClick={() => {
                      router.push("/agent/profile");
                      setDropdownOpen(false);
                    }}
                    className="flex items-center w-full px-3 py-2.5 text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-600 rounded-lg transition-all duration-200 group"
                  >
                    <User className="h-4 w-4 mr-3 text-gray-400 group-hover:text-blue-500" />
                    <span>My Profile</span>
                  </button>
                  
                  <button
                    onClick={() => {
                      router.push("/agent/settings");
                      setDropdownOpen(false);
                    }}
                    className="flex items-center w-full px-3 py-2.5 text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-600 rounded-lg transition-all duration-200 group"
                  >
                    <Settings className="h-4 w-4 mr-3 text-gray-400 group-hover:text-blue-500" />
                    <span>Settings</span>
                  </button>
                </div>

                {/* Logout Section */}
                <div className="p-2 border-t border-gray-100">
                  <button
                    onClick={handleLogout}
                    className="flex items-center w-full px-3 py-2.5 text-sm text-red-600 hover:bg-red-50 rounded-lg transition-all duration-200 group"
                  >
                    <LogOut className="h-4 w-4 mr-3" />
                    <span>Sign Out</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Mobile Search Expanded - Can be toggled if needed */}
      {/* <div className="px-4 pb-4 md:hidden">
        <div className="flex items-center relative">
          <Search className="absolute left-3 h-4 w-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search..."
            className="pl-10 pr-4 py-2.5 w-full bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-200 text-sm"
          />
        </div>
      </div> */}
    </div>
  );
}