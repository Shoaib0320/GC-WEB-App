"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { 
  Settings, 
  User, 
  Bell, 
  Shield, 
  Save, 
  Loader, 
  Mail,
  Smartphone,
  Globe,
  Clock,
  Eye,
  EyeOff,
  Users,
  CheckCircle2,
  ArrowLeft
} from "lucide-react";
import { useAgent } from "@/context/AgentContext";

export default function AgentSettingsPage() {
  const { isLoggedIn, agent, isLoading: contextLoading } = useAgent();
  const router = useRouter();

  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [activeSection, setActiveSection] = useState("profile");
  const [settings, setSettings] = useState({
    emailNotifications: true,
    pushNotifications: false,
    smsNotifications: false,
    profileVisibility: "private",
    language: "en",
    timezone: "UTC",
    twoFactorAuth: false,
    autoBackup: true,
    darkMode: false,
  });

  useEffect(() => {
    if (isLoggedIn && agent) loadSettings();
  }, [isLoggedIn, agent]);

  const loadSettings = async () => {
    try {
      setLoading(true);
      await new Promise((resolve) => setTimeout(resolve, 800));
      setSettings({
        emailNotifications: true,
        pushNotifications: false,
        smsNotifications: false,
        profileVisibility: "private",
        language: "en",
        timezone: "UTC",
        twoFactorAuth: false,
        autoBackup: true,
        darkMode: false,
      });
    } catch (error) {
      console.error("Error loading settings:", error);
    } finally {
      setLoading(false);
    }
  };

  const saveSettings = async () => {
    try {
      setSaving(true);
      await new Promise((resolve) => setTimeout(resolve, 1500));
      console.log("Settings saved:", settings);
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (error) {
      console.error("Error saving settings:", error);
    } finally {
      setSaving(false);
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

  const slideIn = {
    hidden: { opacity: 0, x: -20 },
    visible: { opacity: 1, x: 0, transition: { duration: 0.4 } }
  };

  const sections = [
    { id: "profile", label: "Profile", icon: User, color: "blue" },
    { id: "notifications", label: "Notifications", icon: Bell, color: "orange" },
    { id: "system", label: "System", icon: Shield, color: "green" },
    { id: "privacy", label: "Privacy", icon: Eye, color: "purple" },
  ];

  const getColorClasses = (color) => {
    const colors = {
      blue: { bg: "bg-blue-100", text: "text-blue-600", gradient: "from-blue-50 to-blue-100/50" },
      orange: { bg: "bg-orange-100", text: "text-orange-600", gradient: "from-orange-50 to-orange-100/50" },
      green: { bg: "bg-green-100", text: "text-green-600", gradient: "from-green-50 to-green-100/50" },
      purple: { bg: "bg-purple-100", text: "text-purple-600", gradient: "from-purple-50 to-purple-100/50" },
    };
    return colors[color] || colors.blue;
  };

  if (contextLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/20 to-indigo-50/10 flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center bg-white/80 backdrop-blur-lg rounded-2xl p-8 shadow-xl border border-white/50"
        >
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
            className="w-16 h-16 border-4 border-blue-200 border-t-blue-600 rounded-full mx-auto mb-4"
          />
          <p className="text-slate-700 font-medium text-lg">Loading your settings...</p>
          <p className="text-slate-500 text-sm mt-2">Please wait a moment</p>
        </motion.div>
      </div>
    );
  }

  if (!isLoggedIn || !agent) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/20 to-indigo-50/10 flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center bg-white/80 backdrop-blur-lg rounded-2xl p-8 shadow-xl border border-white/50 max-w-md w-full"
        >
          <Settings className="h-16 w-16 text-slate-400 mx-auto mb-4" />
          <h3 className="text-xl font-bold text-slate-800 mb-2">Access Required</h3>
          <p className="text-slate-600 mb-6">Please login to view settings</p>
          <Button
            onClick={() => router.push('/agent/login')}
            className="bg-gradient-to-r from-blue-500 to-blue-600 text-white px-6 py-3 rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all duration-200"
          >
            Go to Login
          </Button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/20 to-indigo-50/10 p-4 sm:p-6 lg:p-8">
      {/* Header */}
      <motion.div
        initial="hidden"
        animate="visible"
        variants={fadeUp}
        className="max-w-7xl mx-auto mb-6 lg:mb-8"
      >
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div className="flex items-center gap-4">
            <motion.button
              whileHover={{ scale: 1.05, x: -2 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => router.back()}
              className="p-3 bg-white/80 backdrop-blur-sm border border-slate-200 rounded-xl shadow-sm hover:shadow-md transition-all duration-200"
            >
              <ArrowLeft className="h-5 w-5 text-slate-600" />
            </motion.button>
            <div>
              <h1 className="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-slate-900 to-slate-700 bg-clip-text text-transparent">
                Settings
              </h1>
              <p className="text-slate-600 mt-2 text-lg">
                Manage your account preferences and notifications
              </p>
            </div>
          </div>
          
          <AnimatePresence>
            {saveSuccess && (
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                className="flex items-center gap-2 bg-emerald-100 text-emerald-700 px-4 py-3 rounded-xl border border-emerald-200"
              >
                <CheckCircle2 className="h-5 w-5" />
                <span className="font-medium">Settings saved successfully!</span>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>

      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-4 gap-6 lg:gap-8">
        {/* Sidebar Navigation */}
        <motion.div
          initial="hidden"
          animate="visible"
          variants={slideIn}
          className="lg:col-span-1"
        >
          <div className="bg-white/80 backdrop-blur-lg rounded-2xl shadow-lg border border-white/50 p-4 sticky top-6">
            <nav className="space-y-2">
              {sections.map((section) => {
                const Icon = section.icon;
                const colorClasses = getColorClasses(section.color);
                const isActive = activeSection === section.id;
                
                return (
                  <motion.button
                    key={section.id}
                    whileHover={{ scale: 1.02, x: 4 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => setActiveSection(section.id)}
                    className={`w-full text-left p-3 rounded-xl transition-all duration-200 flex items-center gap-3 ${
                      isActive
                        ? `${colorClasses.bg} ${colorClasses.text} font-semibold shadow-sm`
                        : "text-slate-600 hover:text-slate-800 hover:bg-slate-100"
                    }`}
                  >
                    <Icon className="h-5 w-5" />
                    <span className="font-medium">{section.label}</span>
                  </motion.button>
                );
              })}
            </nav>
          </div>
        </motion.div>

        {/* Main Content */}
        <motion.div
          initial="hidden"
          animate="visible"
          variants={fadeUp}
          custom={1}
          className="lg:col-span-3 space-y-6"
        >
          {/* Profile Settings */}
          <AnimatePresence mode="wait">
            {activeSection === "profile" && (
              <motion.div
                key="profile"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
              >
                <Card className="bg-white/80 backdrop-blur-lg rounded-2xl shadow-lg border border-white/50 overflow-hidden">
                  <CardHeader className={`bg-gradient-to-r ${getColorClasses('blue').gradient} pb-6`}>
                    <CardTitle className="flex items-center text-xl font-bold text-slate-800">
                      <div className="p-2 bg-blue-100 rounded-lg mr-3">
                        <User className="h-6 w-6 text-blue-600" />
                      </div>
                      Profile Settings
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-6 space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <Label htmlFor="name" className="text-slate-700 font-medium">Full Name</Label>
                        <Input 
                          id="name" 
                          value={agent?.name || ""} 
                          readOnly 
                          className="bg-slate-50/50 border-slate-200 rounded-xl h-12"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="email" className="text-slate-700 font-medium">Email Address</Label>
                        <Input
                          id="email"
                          type="email"
                          value={agent?.email || ""}
                          readOnly
                          className="bg-slate-50/50 border-slate-200 rounded-xl h-12"
                        />
                      </div>
                      <div className="md:col-span-2 space-y-2">
                        <Label htmlFor="profileVisibility" className="text-slate-700 font-medium">Profile Visibility</Label>
                        <select
                          id="profileVisibility"
                          value={settings.profileVisibility}
                          onChange={(e) =>
                            setSettings({ ...settings, profileVisibility: e.target.value })
                          }
                          className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white/50 backdrop-blur-sm h-12"
                        >
                          <option value="public">Public - Visible to everyone</option>
                          <option value="private">Private - Only visible to you</option>
                          <option value="team">Team Only - Visible to team members</option>
                        </select>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            )}

            {/* Notification Settings */}
            {activeSection === "notifications" && (
              <motion.div
                key="notifications"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
              >
                <Card className="bg-white/80 backdrop-blur-lg rounded-2xl shadow-lg border border-white/50 overflow-hidden">
                  <CardHeader className={`bg-gradient-to-r ${getColorClasses('orange').gradient} pb-6`}>
                    <CardTitle className="flex items-center text-xl font-bold text-slate-800">
                      <div className="p-2 bg-orange-100 rounded-lg mr-3">
                        <Bell className="h-6 w-6 text-orange-600" />
                      </div>
                      Notification Preferences
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-6 space-y-6">
                    {[
                      { 
                        label: "Email Notifications", 
                        desc: "Receive important updates via email", 
                        key: "emailNotifications",
                        icon: Mail 
                      },
                      { 
                        label: "Push Notifications", 
                        desc: "Get real-time browser notifications", 
                        key: "pushNotifications",
                        icon: Bell 
                      },
                      { 
                        label: "SMS Notifications", 
                        desc: "Receive text message alerts", 
                        key: "smsNotifications",
                        icon: Smartphone 
                      },
                    ].map((item, index) => (
                      <motion.div
                        key={item.key}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.1 }}
                        className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 bg-slate-50/50 rounded-xl border border-slate-200/50"
                      >
                        <div className="flex items-center gap-3 flex-1">
                          <div className="p-2 bg-white rounded-lg shadow-sm">
                            <item.icon className="h-5 w-5 text-slate-600" />
                          </div>
                          <div className="flex-1">
                            <Label className="text-slate-800 font-medium block mb-1">{item.label}</Label>
                            <p className="text-slate-600 text-sm">{item.desc}</p>
                          </div>
                        </div>
                        <Switch
                          checked={settings[item.key]}
                          onCheckedChange={(checked) =>
                            setSettings({ ...settings, [item.key]: checked })
                          }
                        />
                      </motion.div>
                    ))}
                  </CardContent>
                </Card>
              </motion.div>
            )}

            {/* System Settings */}
            {activeSection === "system" && (
              <motion.div
                key="system"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
              >
                <Card className="bg-white/80 backdrop-blur-lg rounded-2xl shadow-lg border border-white/50 overflow-hidden">
                  <CardHeader className={`bg-gradient-to-r ${getColorClasses('green').gradient} pb-6`}>
                    <CardTitle className="flex items-center text-xl font-bold text-slate-800">
                      <div className="p-2 bg-green-100 rounded-lg mr-3">
                        <Shield className="h-6 w-6 text-green-600" />
                      </div>
                      System Preferences
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <Label htmlFor="language" className="text-slate-700 font-medium flex items-center gap-2">
                          <Globe className="h-4 w-4" />
                          Language
                        </Label>
                        <select
                          id="language"
                          value={settings.language}
                          onChange={(e) => setSettings({ ...settings, language: e.target.value })}
                          className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white/50 backdrop-blur-sm h-12"
                        >
                          <option value="en">English</option>
                          <option value="es">Español</option>
                          <option value="fr">Français</option>
                          <option value="de">Deutsch</option>
                        </select>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="timezone" className="text-slate-700 font-medium flex items-center gap-2">
                          <Clock className="h-4 w-4" />
                          Timezone
                        </Label>
                        <select
                          id="timezone"
                          value={settings.timezone}
                          onChange={(e) => setSettings({ ...settings, timezone: e.target.value })}
                          className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white/50 backdrop-blur-sm h-12"
                        >
                          <option value="UTC">UTC</option>
                          <option value="EST">Eastern Time (EST)</option>
                          <option value="PST">Pacific Time (PST)</option>
                          <option value="GMT">Greenwich Mean Time (GMT)</option>
                        </select>
                      </div>
                    </div>
                    
                    <Separator className="my-6" />
                    
                    <div className="space-y-4">
                      {[
                        { label: "Two-Factor Authentication", desc: "Add an extra layer of security", key: "twoFactorAuth" },
                        { label: "Automatic Backup", desc: "Automatically backup your data", key: "autoBackup" },
                        { label: "Dark Mode", desc: "Use dark theme across the app", key: "darkMode" },
                      ].map((item, index) => (
                        <motion.div
                          key={item.key}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: index * 0.1 }}
                          className="flex items-center justify-between p-4 bg-slate-50/50 rounded-xl border border-slate-200/50"
                        >
                          <div>
                            <Label className="text-slate-800 font-medium block mb-1">{item.label}</Label>
                            <p className="text-slate-600 text-sm">{item.desc}</p>
                          </div>
                          <Switch
                            checked={settings[item.key]}
                            onCheckedChange={(checked) =>
                              setSettings({ ...settings, [item.key]: checked })
                            }
                          />
                        </motion.div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            )}

            {/* Privacy Settings */}
            {activeSection === "privacy" && (
              <motion.div
                key="privacy"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
              >
                <Card className="bg-white/80 backdrop-blur-lg rounded-2xl shadow-lg border border-white/50 overflow-hidden">
                  <CardHeader className={`bg-gradient-to-r ${getColorClasses('purple').gradient} pb-6`}>
                    <CardTitle className="flex items-center text-xl font-bold text-slate-800">
                      <div className="p-2 bg-purple-100 rounded-lg mr-3">
                        <Eye className="h-6 w-6 text-purple-600" />
                      </div>
                      Privacy & Security
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-6 space-y-6">
                    <div className="bg-blue-50/50 border border-blue-200 rounded-xl p-4">
                      <div className="flex items-start gap-3">
                        <Shield className="h-5 w-5 text-blue-600 mt-0.5" />
                        <div>
                          <h4 className="font-semibold text-blue-800 mb-1">Privacy Protection</h4>
                          <p className="text-blue-700 text-sm">
                            Your privacy is important to us. These settings help you control how your information is shared and used.
                          </p>
                        </div>
                      </div>
                    </div>
                    
                    <div className="space-y-4">
                      {[
                        { label: "Data Sharing", desc: "Allow anonymous data sharing to improve services", key: "dataSharing" },
                        { label: "Marketing Emails", desc: "Receive promotional emails and offers", key: "marketingEmails" },
                        { label: "Activity Tracking", desc: "Track your activity for personalized experience", key: "activityTracking" },
                      ].map((item, index) => (
                        <motion.div
                          key={item.key}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: index * 0.1 }}
                          className="flex items-center justify-between p-4 bg-slate-50/50 rounded-xl border border-slate-200/50"
                        >
                          <div>
                            <Label className="text-slate-800 font-medium block mb-1">{item.label}</Label>
                            <p className="text-slate-600 text-sm">{item.desc}</p>
                          </div>
                          <Switch
                            checked={settings[item.key] || false}
                            onCheckedChange={(checked) =>
                              setSettings({ ...settings, [item.key]: checked })
                            }
                          />
                        </motion.div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Save Button */}
          <motion.div
            initial="hidden"
            animate="visible"
            variants={fadeUp}
            custom={2}
            className="flex justify-end pt-4"
          >
            <Button
              onClick={saveSettings}
              disabled={saving}
              size="lg"
              className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white px-8 py-3 rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all duration-200 flex items-center gap-3"
            >
              {saving ? (
                <>
                  <Loader className="h-5 w-5 animate-spin" />
                  Saving Changes...
                </>
              ) : (
                <>
                  <Save className="h-5 w-5" />
                  Save All Changes
                </>
              )}
            </Button>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
}