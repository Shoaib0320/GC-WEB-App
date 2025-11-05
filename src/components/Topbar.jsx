// "use client";

// import {
//   Bell,
//   LogOut,
//   Settings,
//   User,
//   Search,
//   Menu,
// } from "lucide-react";
// import {
//   DropdownMenu,
//   DropdownMenuContent,
//   DropdownMenuItem,
//   DropdownMenuLabel,
//   DropdownMenuSeparator,
//   DropdownMenuTrigger,
// } from "@/components/ui/dropdown-menu";
// import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
// import { Input } from "@/components/ui/input";
// import { Button } from "@/components/ui/button";
// import { Separator } from "@/components/ui/separator";

// export default function Topbar() {
//   return (
//     <header className="flex items-center justify-between bg-white shadow-sm rounded-lg px-4 py-3 mb-6 sticky top-3 z-30">
//       {/* Left Section */}
//       <div className="flex items-center gap-3">
//         {/* Mobile Menu Toggle */}
//         <Button variant="ghost" size="icon" className="lg:hidden">
//           <Menu size={20} />
//         </Button>

//         <h1 className="text-xl font-semibold tracking-tight hidden sm:block">
//           Dashboard
//         </h1>
//       </div>

//       {/* Center Section (Search Bar) */}
//       <div className="flex-1 max-w-md mx-4 hidden sm:flex">
//         <div className="relative w-full">
//           <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
//           <Input
//             placeholder="Search..."
//             className="pl-8 bg-gray-50 border-gray-200 focus-visible:ring-1 focus-visible:ring-blue-500"
//           />
//         </div>
//       </div>

//       {/* Right Section */}
//       <div className="flex items-center gap-4">
//         {/* Notifications */}
//         <Button variant="ghost" size="icon" className="relative">
//           <Bell size={20} />
//           <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-red-500 rounded-full"></span>
//         </Button>

//         <Separator orientation="vertical" className="h-6" />

//         {/* Profile Dropdown */}
//         <DropdownMenu>
//           <DropdownMenuTrigger asChild>
//             <Button
//               variant="ghost"
//               className="flex items-center gap-2 hover:bg-gray-100"
//             >
//               <Avatar className="h-8 w-8">
//                 <AvatarImage src="/avatars/default.png" alt="User" />
//                 <AvatarFallback>SA</AvatarFallback>
//               </Avatar>
//               <span className="hidden sm:inline text-sm font-medium">
//                 Sajood Ali
//               </span>
//             </Button>
//           </DropdownMenuTrigger>
//           <DropdownMenuContent align="end" className="w-48">
//             <DropdownMenuLabel>My Account</DropdownMenuLabel>
//             <DropdownMenuSeparator />
//             <DropdownMenuItem>
//               <User size={16} className="mr-2" /> Profile
//             </DropdownMenuItem>
//             <DropdownMenuItem>
//               <Settings size={16} className="mr-2" /> Settings
//             </DropdownMenuItem>
//             <DropdownMenuSeparator />
//             <DropdownMenuItem className="text-red-500">
//               <LogOut size={16} className="mr-2" /> Logout
//             </DropdownMenuItem>
//           </DropdownMenuContent>
//         </DropdownMenu>
//       </div>
//     </header>
//   );
// }




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
      icon: <MessageCircle className="w-4 h-4 text-blue-500" />,
      time: "2m ago",
    },
    {
      id: 2,
      title: "Booking Confirmed",
      description: "Your booking for Oct 12 has been confirmed.",
      icon: <CheckCircle2 className="w-4 h-4 text-green-500" />,
      time: "1h ago",
    },
  ];

  return (
    <header className={`flex items-center justify-between bg-white shadow-sm rounded-lg px-4 py-3 fixed top-0 left-0 right-0 z-30 ${collapsed ? 'lg:ml-20' : 'lg:ml-60'} lg:px-6`}>
      {/* Left Section */}
      <div className="flex items-center gap-3 lg:gap-10">
        <Button variant="ghost" size="icon" className="lg:hidden">
          <Menu size={20} />
        </Button>

        <h1 className="text-lg lg:text-xl font-semibold tracking-tight">
          Dashboard
        </h1>
      </div>

      {/* Center Section (Search Bar) */}
      <div className="flex-1 max-w-md mx-4 hidden md:flex">
        <div className="relative w-full">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search..."
            className="pl-8 bg-gray-50 border-gray-200 focus-visible:ring-1 focus-visible:ring-blue-500"
          />
        </div>
      </div>

      {/* Right Section */}
      <div className="flex items-center gap-2 lg:gap-4 relative">
        {/* 🔔 Notifications */}
        <div className="relative">
          <Button
            variant="ghost"
            size="icon"
            className="relative"
            onClick={() => setShowNoti(!showNoti)}
          >
            <Bell size={20} />
            <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-red-500 rounded-full"></span>
          </Button>

          <AnimatePresence>
            {showNoti && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.25 }}
                className="absolute right-0 mt-3 w-80 bg-white border border-gray-200 shadow-lg rounded-xl overflow-hidden z-50"
              >
                <div className="p-3 border-b font-semibold text-gray-700">
                  Notifications
                </div>
                <div className="max-h-60 overflow-y-auto">
                  {notifications.length > 0 ? (
                    notifications.map((n) => (
                      <div
                        key={n.id}
                        className="flex items-start gap-3 px-4 py-3 hover:bg-gray-50 transition"
                      >
                        {n.icon}
                        <div>
                          <p className="text-sm font-medium text-gray-800">
                            {n.title}
                          </p>
                          <p className="text-xs text-gray-500">
                            {n.description}
                          </p>
                          <p className="text-xs text-gray-400 mt-1">{n.time}</p>
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="text-sm text-gray-500 p-4 text-center">
                      No notifications
                    </p>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <Separator orientation="vertical" className="h-6" />

        {/* Profile Dropdown */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              className="flex items-center gap-2 hover:bg-gray-100"
            >
              <Avatar className="h-8 w-8">
                <AvatarImage src="/avatars/default.png" alt="User" />
                <AvatarFallback>
                  {user?.firstName?.charAt(0)}{user?.lastName?.charAt(0)}
                </AvatarFallback>
              </Avatar>
              <span className="hidden sm:inline text-sm font-medium">
                {user?.firstName} {user?.lastName}
              </span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48">
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
