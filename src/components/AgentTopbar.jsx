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
import { Menu, Bell, User, LogOut } from "lucide-react";

export default function AgentTopbar({ toggleSidebar }) {
  const router = useRouter();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  const handleLogout = () => {
    // Remove agent data from localStorage or cookies
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
    <div className="flex justify-between items-center bg-white/80 backdrop-blur-sm shadow-md rounded-2xl p-4 mb-6">
      
      {/* Left: Hamburger + Title */}
      <div className="flex items-center space-x-4">
        <button
          onClick={toggleSidebar}
          className="p-2 rounded-md hover:bg-gray-100 transition"
        >
          <Menu className="h-6 w-6 text-gray-700" />
        </button>
        <h2 className="text-lg font-semibold text-gray-800">Dashboard</h2>
      </div>

      {/* Right: Notifications + Profile */}
      <div className="flex items-center space-x-4 relative">
        
        {/* Notification */}
        <button
          onClick={() => router.push("/agent/notification")}
          className="relative p-2 rounded-full hover:bg-gray-100 transition"
        >
          <Bell className="h-6 w-6 text-gray-700" />
          <span className="absolute top-0 right-0 inline-block w-2 h-2 bg-red-500 rounded-full"></span>
        </button>

        {/* Profile Dropdown */}
        <div ref={dropdownRef} className="relative">
          <button
            onClick={() => setDropdownOpen(!dropdownOpen)}
            className="flex items-center space-x-2 p-2 rounded-full hover:bg-gray-100 transition"
          >
            <User className="h-6 w-6 text-gray-700" />
          </button>

          {dropdownOpen && (
            <div className="absolute right-0 mt-2 w-44 bg-white rounded-xl shadow-lg border border-gray-200 z-50">
              <button
                onClick={() => {
                  router.push("/agent/profile");
                  setDropdownOpen(false);
                }}
                className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 space-x-2"
              >
                <User className="h-4 w-4" />
                <span>My Profile</span>
              </button>
              <button
                onClick={handleLogout}
                className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 space-x-2"
              >
                <LogOut className="h-4 w-4" />
                <span>Logout</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
