
// "use client";

// import { useState, useEffect } from "react";
// import { useRouter } from "next/navigation";
// import { motion } from "framer-motion";
// import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
// import { Button } from "@/components/ui/button";
// import { Input } from "@/components/ui/input";
// import { Label } from "@/components/ui/label";
// import { Switch } from "@/components/ui/switch";
// import { Separator } from "@/components/ui/separator";
// import {
//   Settings,
//   User,
//   Bell,
//   Shield,
//   Save,
//   Loader
// } from "lucide-react";
// import { useAgent } from "@/context/AgentContext";

// export default function AgentSettingsPage() {
//   const { isLoggedIn, agent, isLoading: contextLoading } = useAgent();
//   const router = useRouter();

//   const [loading, setLoading] = useState(false);
//   const [settings, setSettings] = useState({
//     emailNotifications: true,
//     pushNotifications: false,
//     smsNotifications: false,
//     profileVisibility: 'private',
//     language: 'en',
//     timezone: 'UTC'
//   });

//   useEffect(() => {
//     if (isLoggedIn && agent) {
//       // Load current settings (mock for now)
//       loadSettings();
//     }
//   }, [isLoggedIn, agent]);

//   const loadSettings = async () => {
//     try {
//       setLoading(true);
//       // Mock loading settings
//       await new Promise(resolve => setTimeout(resolve, 500));
//       // In real app, fetch from API
//       setSettings({
//         emailNotifications: true,
//         pushNotifications: false,
//         smsNotifications: false,
//         profileVisibility: 'private',
//         language: 'en',
//         timezone: 'UTC'
//       });
//     } catch (error) {
//       console.error("Error loading settings:", error);
//     } finally {
//       setLoading(false);
//     }
//   };

//   const saveSettings = async () => {
//     try {
//       setLoading(true);
//       // Mock saving settings
//       await new Promise(resolve => setTimeout(resolve, 1000));
//       // In real app, save to API
//       console.log("Settings saved:", settings);
//     } catch (error) {
//       console.error("Error saving settings:", error);
//     } finally {
//       setLoading(false);
//     }
//   };

//   const fadeUp = {
//     hidden: { opacity: 0, y: 20 },
//     visible: (i = 1) => ({
//       opacity: 1,
//       y: 0,
//       transition: { delay: i * 0.1, duration: 0.5, ease: "easeOut" },
//     }),
//   };

//   if (contextLoading) {
//     return (
//       <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
//         <div className="text-center bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-xl">
//           <Loader className="h-8 w-8 animate-spin mx-auto mb-4 text-blue-600" />
//           <p className="text-slate-700 font-medium text-base">Loading settings...</p>
//           <p className="text-slate-500 text-xs mt-2">Preparing your preferences</p>
//         </div>
//       </div>
//     );
//   }

//   if (!isLoggedIn || !agent) {
//     return (
//       <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
//         <div className="text-center bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-xl">
//           <p className="text-slate-700 font-medium">Please login to view settings.</p>
//         </div>
//       </div>
//     );
//   }

//   return (
//     <div className="w-full max-w-4xl mx-auto bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/50 p-2 space-y-6 xl:p-10 text-left">
//       {/* Header */}
//       <motion.div
//         initial="hidden"
//         animate="visible"
//         variants={fadeUp}
//         custom={1}
//         className="bg-white/70 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-white/20"
//       >
//         <div className="flex items-center">
//           <div className="p-3 bg-blue-100 rounded-xl mr-4">
//             <Settings className="h-8 w-8 text-blue-600" />
//           </div>
//           <div>
//             <h1 className="text-3xl font-bold bg-gradient-to-r from-slate-900 to-slate-700 bg-clip-text text-transparent">
//               Settings
//             </h1>
//             <p className="text-slate-600 mt-2 text-lg">
//               Manage your account preferences and notifications
//             </p>
//           </div>
//         </div>
//       </motion.div>

//       {/* Profile Settings */}
//       <motion.div
//         initial="hidden"
//         animate="visible"
//         variants={fadeUp}
//         custom={2}
//         className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 overflow-hidden"
//       >
//         <CardHeader className="bg-gradient-to-r from-slate-50 to-slate-100/50 pb-6">
//           <CardTitle className="flex items-center text-xl font-bold text-slate-800">
//             <div className="p-2 bg-blue-100 rounded-lg mr-3">
//               <User className="h-6 w-6 text-blue-600" />
//             </div>
//             Profile Settings
//           </CardTitle>
//         </CardHeader>
//         <CardContent className="p-6 space-y-6">
//           <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
//             <div className="space-y-2">
//               <Label htmlFor="name">Full Name</Label>
//               <Input
//                 id="name"
//                 value={agent?.name || ''}
//                 readOnly
//                 className="bg-slate-50"
//               />
//             </div>
//             <div className="space-y-2">
//               <Label htmlFor="email">Email</Label>
//               <Input
//                 id="email"
//                 type="email"
//                 value={agent?.email || ''}
//                 readOnly
//                 className="bg-slate-50"
//               />
//             </div>
//           </div>
//           <div className="space-y-2">
//             <Label htmlFor="profileVisibility">Profile Visibility</Label>
//             <select
//               id="profileVisibility"
//               value={settings.profileVisibility}
//               onChange={(e) => setSettings({...settings, profileVisibility: e.target.value})}
//               className="w-full px-3 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white/50 backdrop-blur-sm"
//             >
//               <option value="public">Public</option>
//               <option value="private">Private</option>
//               <option value="team">Team Only</option>
//             </select>
//           </div>
//         </CardContent>
//       </motion.div>

//       {/* Notification Settings */}
//       <motion.div
//         initial="hidden"
//         animate="visible"
//         variants={fadeUp}
//         custom={3}
//         className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 overflow-hidden"
//       >
//         <CardHeader className="bg-gradient-to-r from-slate-50 to-slate-100/50 pb-6">
//           <CardTitle className="flex items-center text-xl font-bold text-slate-800">
//             <div className="p-2 bg-orange-100 rounded-lg mr-3">
//               <Bell className="h-6 w-6 text-orange-600" />
//             </div>
//             Notification Preferences
//           </CardTitle>
//         </CardHeader>
//         <CardContent className="p-6 space-y-6">
//           <div className="space-y-4">
//             <div className="flex items-center justify-between">
//               <div className="space-y-1">
//                 <Label>Email Notifications</Label>
//                 <p className="text-sm text-slate-600">Receive notifications via email</p>
//               </div>
//               <Switch
//                 checked={settings.emailNotifications}
//                 onCheckedChange={(checked) => setSettings({...settings, emailNotifications: checked})}
//               />
//             </div>
//             <Separator />
//             <div className="flex items-center justify-between">
//               <div className="space-y-1">
//                 <Label>Push Notifications</Label>
//                 <p className="text-sm text-slate-600">Receive push notifications in browser</p>
//               </div>
//               <Switch
//                 checked={settings.pushNotifications}
//                 onCheckedChange={(checked) => setSettings({...settings, pushNotifications: checked})}
//               />
//             </div>
//             <Separator />
//             <div className="flex items-center justify-between">
//               <div className="space-y-1">
//                 <Label>SMS Notifications</Label>
//                 <p className="text-sm text-slate-600">Receive notifications via SMS</p>
//               </div>
//               <Switch
//                 checked={settings.smsNotifications}
//                 onCheckedChange={(checked) => setSettings({...settings, smsNotifications: checked})}
//               />
//             </div>
//           </div>
//         </CardContent>
//       </motion.div>

//       {/* System Settings */}
//       <motion.div
//         initial="hidden"
//         animate="visible"
//         variants={fadeUp}
//         custom={4}
//         className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 overflow-hidden"
//       >
//         <CardHeader className="bg-gradient-to-r from-slate-50 to-slate-100/50 pb-6">
//           <CardTitle className="flex items-center text-xl font-bold text-slate-800">
//             <div className="p-2 bg-green-100 rounded-lg mr-3">
//               <Shield className="h-6 w-6 text-green-600" />
//             </div>
//             System Preferences
//           </CardTitle>
//         </CardHeader>
//         <CardContent className="p-6 space-y-6">
//           <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
//             <div className="space-y-2">
//               <Label htmlFor="language">Language</Label>
//               <select
//                 id="language"
//                 value={settings.language}
//                 onChange={(e) => setSettings({...settings, language: e.target.value})}
//                 className="w-full px-3 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white/50 backdrop-blur-sm"
//               >
//                 <option value="en">English</option>
//                 <option value="es">Spanish</option>
//                 <option value="fr">French</option>
//                 <option value="de">German</option>
//               </select>
//             </div>
//             <div className="space-y-2">
//               <Label htmlFor="timezone">Timezone</Label>
//               <select
//                 id="timezone"
//                 value={settings.timezone}
//                 onChange={(e) => setSettings({...settings, timezone: e.target.value})}
//                 className="w-full px-3 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white/50 backdrop-blur-sm"
//               >
//                 <option value="UTC">UTC</option>
//                 <option value="EST">Eastern Time</option>
//                 <option value="PST">Pacific Time</option>
//                 <option value="GMT">GMT</option>
//               </select>
//             </div>
//           </div>
//         </CardContent>
//       </motion.div>

//       {/* Save Button */}
//       <motion.div
//         initial="hidden"
//         animate="visible"
//         variants={fadeUp}
//         custom={5}
//         className="flex justify-end"
//       >
//         <Button
//           onClick={saveSettings}
//           disabled={loading}
//           className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-xl font-semibold shadow-lg"
//         >
//           {loading ? (
//             <>
//               <Loader className="h-5 w-5 mr-2 animate-spin" />
//               Saving...
//             </>
//           ) : (
//             <>
//               <Save className="h-5 w-5 mr-2" />
//               Save Settings
//             </>
//           )}
//         </Button>
//       </motion.div>
//     </div>
//   );
// }


"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { Settings, User, Bell, Shield, Save, Loader } from "lucide-react";
import { useAgent } from "@/context/AgentContext";

export default function AgentSettingsPage() {
  const { isLoggedIn, agent, isLoading: contextLoading } = useAgent();
  const router = useRouter();

  const [loading, setLoading] = useState(false);
  const [settings, setSettings] = useState({
    emailNotifications: true,
    pushNotifications: false,
    smsNotifications: false,
    profileVisibility: "private",
    language: "en",
    timezone: "UTC",
  });

  useEffect(() => {
    if (isLoggedIn && agent) loadSettings();
  }, [isLoggedIn, agent]);

  const loadSettings = async () => {
    try {
      setLoading(true);
      await new Promise((resolve) => setTimeout(resolve, 500));
      setSettings({
        emailNotifications: true,
        pushNotifications: false,
        smsNotifications: false,
        profileVisibility: "private",
        language: "en",
        timezone: "UTC",
      });
    } catch (error) {
      console.error("Error loading settings:", error);
    } finally {
      setLoading(false);
    }
  };

  const saveSettings = async () => {
    try {
      setLoading(true);
      await new Promise((resolve) => setTimeout(resolve, 1000));
      console.log("Settings saved:", settings);
    } catch (error) {
      console.error("Error saving settings:", error);
    } finally {
      setLoading(false);
    }
  };

  const fadeUp = {
    hidden: { opacity: 0, y: 20 },
    visible: (i = 1) => ({
      opacity: 1,
      y: 0,
      transition: { delay: i * 0.1, duration: 0.5, ease: "easeOut" },
    }),
  };

  if (contextLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
        <div className="text-center bg-white/80 backdrop-blur-md rounded-2xl p-6 shadow-xl">
          <Loader className="h-8 w-8 animate-spin mx-auto mb-4 text-blue-600" />
          <p className="text-slate-700 font-medium text-base">Loading settings...</p>
        </div>
      </div>
    );
  }

  if (!isLoggedIn || !agent) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
        <div className="text-center bg-white/80 backdrop-blur-md rounded-2xl p-6 shadow-xl">
          <p className="text-slate-700 font-medium">Please login to view settings.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-5xl mx-auto p-4 md:p-8 space-y-6">
      {/* Header */}
      <motion.div
        initial="hidden"
        animate="visible"
        variants={fadeUp}
        custom={1}
        className="bg-white/70 backdrop-blur-md rounded-2xl p-6 shadow-lg border border-white/20"
      >
        <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4 sm:gap-6">
          <div className="p-3 bg-blue-100 rounded-xl">
            <Settings className="h-8 w-8 text-blue-600" />
          </div>
          <div className="text-center sm:text-left">
            <h1 className="text-2xl md:text-3xl font-bold text-slate-900">Settings</h1>
            <p className="text-slate-600 mt-1 md:mt-2 text-sm md:text-base">
              Manage your account preferences and notifications
            </p>
          </div>
        </div>
      </motion.div>

      {/* Profile Settings */}
      <motion.div
        initial="hidden"
        animate="visible"
        variants={fadeUp}
        custom={2}
        className="bg-white/80 backdrop-blur-md rounded-2xl shadow-lg border border-white/20"
      >
        <CardHeader className="bg-gradient-to-r from-slate-50 to-slate-100/50 pb-4">
          <CardTitle className="flex items-center text-lg md:text-xl font-bold text-slate-800">
            <div className="p-2 bg-blue-100 rounded-lg mr-2">
              <User className="h-5 w-5 md:h-6 md:w-6 text-blue-600" />
            </div>
            Profile Settings
          </CardTitle>
        </CardHeader>
        <CardContent className="p-4 md:p-6 space-y-4 md:space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
            <div>
              <Label htmlFor="name">Full Name</Label>
              <Input id="name" value={agent?.name || ""} readOnly className="bg-slate-50" />
            </div>
            <div>
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={agent?.email || ""}
                readOnly
                className="bg-slate-50"
              />
            </div>
            <div className="md:col-span-2">
              <Label htmlFor="profileVisibility">Profile Visibility</Label>
              <select
                id="profileVisibility"
                value={settings.profileVisibility}
                onChange={(e) =>
                  setSettings({ ...settings, profileVisibility: e.target.value })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white/50 backdrop-blur-sm"
              >
                <option value="public">Public</option>
                <option value="private">Private</option>
                <option value="team">Team Only</option>
              </select>
            </div>
          </div>
        </CardContent>
      </motion.div>

      {/* Notification Settings */}
      <motion.div
        initial="hidden"
        animate="visible"
        variants={fadeUp}
        custom={3}
        className="bg-white/80 backdrop-blur-md rounded-2xl shadow-lg border border-white/20"
      >
        <CardHeader className="bg-gradient-to-r from-slate-50 to-slate-100/50 pb-4">
          <CardTitle className="flex items-center text-lg md:text-xl font-bold text-slate-800">
            <div className="p-2 bg-orange-100 rounded-lg mr-2">
              <Bell className="h-5 w-5 md:h-6 md:w-6 text-orange-600" />
            </div>
            Notification Preferences
          </CardTitle>
        </CardHeader>
        <CardContent className="p-4 md:p-6 space-y-4 md:space-y-6">
          {[
            { label: "Email Notifications", desc: "Receive notifications via email", key: "emailNotifications" },
            { label: "Push Notifications", desc: "Receive push notifications in browser", key: "pushNotifications" },
            { label: "SMS Notifications", desc: "Receive notifications via SMS", key: "smsNotifications" },
          ].map((item) => (
            <div key={item.key} className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 md:gap-4">
              <div>
                <Label>{item.label}</Label>
                <p className="text-sm text-slate-600">{item.desc}</p>
              </div>
              <Switch
                checked={settings[item.key]}
                onCheckedChange={(checked) =>
                  setSettings({ ...settings, [item.key]: checked })
                }
              />
              {item !== "smsNotifications" && <Separator className="my-2 sm:hidden" />}
            </div>
          ))}
        </CardContent>
      </motion.div>

      {/* System Settings */}
      <motion.div
        initial="hidden"
        animate="visible"
        variants={fadeUp}
        custom={4}
        className="bg-white/80 backdrop-blur-md rounded-2xl shadow-lg border border-white/20"
      >
        <CardHeader className="bg-gradient-to-r from-slate-50 to-slate-100/50 pb-4">
          <CardTitle className="flex items-center text-lg md:text-xl font-bold text-slate-800">
            <div className="p-2 bg-green-100 rounded-lg mr-2">
              <Shield className="h-5 w-5 md:h-6 md:w-6 text-green-600" />
            </div>
            System Preferences
          </CardTitle>
        </CardHeader>
        <CardContent className="p-4 md:p-6 space-y-4 md:space-y-6 grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
          <div>
            <Label htmlFor="language">Language</Label>
            <select
              id="language"
              value={settings.language}
              onChange={(e) => setSettings({ ...settings, language: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white/50 backdrop-blur-sm"
            >
              <option value="en">English</option>
              <option value="es">Spanish</option>
              <option value="fr">French</option>
              <option value="de">German</option>
            </select>
          </div>
          <div>
            <Label htmlFor="timezone">Timezone</Label>
            <select
              id="timezone"
              value={settings.timezone}
              onChange={(e) => setSettings({ ...settings, timezone: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white/50 backdrop-blur-sm"
            >
              <option value="UTC">UTC</option>
              <option value="EST">Eastern Time</option>
              <option value="PST">Pacific Time</option>
              <option value="GMT">GMT</option>
            </select>
          </div>
        </CardContent>
      </motion.div>

      {/* Save Button */}
      <motion.div
        initial="hidden"
        animate="visible"
        variants={fadeUp}
        custom={5}
        className="flex justify-end"
      >
        <Button
          onClick={saveSettings}
          disabled={loading}
          className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl font-semibold shadow-lg flex items-center gap-2"
        >
          {loading ? <Loader className="h-5 w-5 animate-spin" /> : <Save className="h-5 w-5" />}
          {loading ? "Saving..." : "Save Settings"}
        </Button>
      </motion.div>
    </div>
  );
}
