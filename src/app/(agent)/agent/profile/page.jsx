"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Separator } from "@/components/ui/separator";
import {
  User,
  Mail,
  Phone,
  MapPin,
  Calendar,
  Target,
  Edit,
  Save,
  X,
  Loader,
  Shield,
  Clock,
  Award,
  TrendingUp,
  CheckCircle
} from "lucide-react";
import { useAgent } from "@/context/AgentContext";
import { agentAuthService } from "@/services/agentAuthService";

export default function AgentProfilePage() {
  const {
    agent,
    isLoggedIn,
    refreshagentData,
    isLoading: contextLoading
  } = useAgent();

  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [formData, setFormData] = useState({
    agentName: "",
    email: "",
    phone: "",
    address: "",
    city: "",
    state: "",
    zip: ""
  });

  useEffect(() => {
    if (agent) {
      setFormData({
        agentName: agent.agentName || "",
        email: agent.email || "",
        phone: agent.phone || "",
        address: agent.address || "",
        city: agent.city || "",
        state: agent.state || "",
        zip: agent.zip || ""
      });
    }
  }, [agent]);

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSave = async () => {
    setError("");
    setSuccess("");
    setIsSaving(true);

    try {
      await agentAuthService.updateProfile(formData);
      await refreshagentData();
      setSuccess("Profile updated successfully!");
      setIsEditing(false);
    } catch (err) {
      setError("Failed to update profile. Please try again.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    if (agent) {
      setFormData({
        agentName: agent.agentName || "",
        email: agent.email || "",
        phone: agent.phone || "",
        address: agent.address || "",
        city: agent.city || "",
        state: agent.state || "",
        zip: agent.zip || ""
      });
    }
    setIsEditing(false);
    setError("");
    setSuccess("");
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
        <div className="text-center bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-xl">
          <Loader className="h-8 w-8 animate-spin mx-auto mb-4 text-blue-600" />
          <p className="text-slate-700 font-medium text-base">Loading profile...</p>
          <p className="text-slate-500 text-xs mt-2">Preparing your information</p>
        </div>
      </div>
    );
  }

  if (!isLoggedIn || !agent) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
        <div className="text-center bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-xl">
          <p className="text-slate-700 font-medium">Please login to view your profile.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/50 p-2 sm:p-4 space-y-4 sm:space-y-6">
      {/* Header */}
      <motion.div
        initial="hidden"
        animate="visible"
        variants={fadeUp}
        custom={1}
        className="bg-white/70 backdrop-blur-sm rounded-xl p-3 sm:p-6 shadow-lg"
      >
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div className="flex items-center">
            <div className="p-2 bg-indigo-100 rounded-lg mr-3">
              <User className="h-4 w-4 sm:h-5 sm:w-5 text-indigo-600" />
            </div>
            <div>
              <h1 className="text-lg sm:text-xl lg:text-2xl font-bold bg-gradient-to-r from-slate-900 to-slate-700 bg-clip-text text-transparent">
                My Profile
              </h1>
              <p className="text-slate-600 mt-1 text-xs sm:text-sm">
                Manage your account information
              </p>
            </div>
          </div>
          {!isEditing && (
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Button
                onClick={() => setIsEditing(true)}
                className="bg-indigo-600 hover:bg-indigo-700 px-3 sm:px-4 py-2 rounded-lg font-semibold shadow-lg hover:shadow-xl transition-all duration-200 text-xs sm:text-sm"
              >
                <Edit className="h-3 w-3 mr-2" />
                Edit Profile
              </Button>
            </motion.div>
          )}
        </div>
      </motion.div>

      {/* Success/Error Messages */}
      {error && (
        <motion.div
          initial="hidden"
          animate="visible"
          variants={fadeUp}
          custom={2}
        >
          <Alert variant="destructive" className="border-red-200 bg-red-50">
            <AlertDescription className="text-red-800">{error}</AlertDescription>
          </Alert>
        </motion.div>
      )}

      {success && (
        <motion.div
          initial="hidden"
          animate="visible"
          variants={fadeUp}
          custom={2}
        >
          <Alert className="border-emerald-200 bg-emerald-50">
            <AlertDescription className="text-emerald-800 flex items-center">
              <CheckCircle className="h-4 w-4 mr-2" />
              {success}
            </AlertDescription>
          </Alert>
        </motion.div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
        {/* Profile Overview */}
        <motion.div
          initial="hidden"
          animate="visible"
          variants={fadeUp}
          custom={3}
        >
          <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-xl rounded-2xl overflow-hidden h-full">
            <CardHeader className=" pb-4 sm:pb-6">
              <CardTitle className="flex items-center text-lg sm:text-xl font-bold text-slate-800">
                <div className="p-2 bg-indigo-100 rounded-lg mr-3">
                  <User className="h-5 w-5 sm:h-6 sm:w-6 text-indigo-600" />
                </div>
                Profile Overview
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4 sm:p-6 space-y-6">
              <div className="text-center">
                <div className="w-20 h-20 bg-indigo-600 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
                  <User className="h-10 w-10 text-white" />
                </div>
                <h3 className="text-xl font-semibold text-slate-900">
                  {agent.agentName}
                </h3>
                <p className="text-slate-600">Agent ID: {agent.agentId}</p>
              </div>

              <Separator className="bg-slate-200" />

              <div className="space-y-4">
                <div className="flex items-center justify-between p-3 bg-slate-50 rounded-xl">
                  <div className="flex items-center text-sm">
                    <Shield className="h-4 w-4 mr-2 text-emerald-600" />
                    <span className="text-slate-600">Status:</span>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                    agent.isActive
                      ? 'bg-emerald-100 text-emerald-700'
                      : 'bg-red-100 text-red-700'
                  }`}>
                    {agent.isActive ? 'Active' : 'Inactive'}
                  </span>
                </div>

                {agent.shift && (
                  <div className="flex items-center justify-between p-3 bg-slate-50 rounded-xl">
                    <div className="flex items-center text-sm">
                      <Clock className="h-4 w-4 mr-2 text-blue-600" />
                      <span className="text-slate-600">Shift:</span>
                    </div>
                    <span className="font-medium text-slate-900">{agent.shift.name}</span>
                  </div>
                )}

                {agent.monthlyTarget && (
                  <div className="flex items-center justify-between p-3 bg-slate-50 rounded-xl">
                    <div className="flex items-center text-sm">
                      <Target className="h-4 w-4 mr-2 text-purple-600" />
                      <span className="text-slate-600">Monthly Target:</span>
                    </div>
                    <span className="font-medium text-slate-900">${agent.monthlyTarget}</span>
                  </div>
                )}

                {agent.createdAt && (
                  <div className="flex items-center justify-between p-3 bg-slate-50 rounded-xl">
                    <div className="flex items-center text-sm">
                      <Calendar className="h-4 w-4 mr-2 text-slate-600" />
                      <span className="text-slate-600">Joined:</span>
                    </div>
                    <span className="font-medium text-slate-900">
                      {new Date(agent.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                )}
              </div>

              {/* Performance Summary */}
              <div className="bg-gradient-to-r from-emerald-50 to-teal-50 rounded-xl p-4">
                <h4 className="text-sm font-semibold text-slate-800 mb-3 flex items-center">
                  <Award className="h-4 w-4 mr-2 text-emerald-600" />
                  Performance Summary
                </h4>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-600">Total Bookings:</span>
                    <span className="font-semibold text-slate-900">45</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-600">Revenue:</span>
                    <span className="font-semibold text-slate-900">$12,500</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-600">Rating:</span>
                    <span className="font-semibold text-slate-900">4.8 ⭐</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Profile Details */}
        <motion.div
          initial="hidden"
          animate="visible"
          variants={fadeUp}
          custom={4}
          className="lg:col-span-2"
        >
          <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-xl rounded-2xl overflow-hidden">
            <CardHeader className="bg-gradient-to-r from-slate-50 to-slate-100/50 pb-4 sm:pb-6">
              <CardTitle className="flex items-center text-lg sm:text-xl font-bold text-slate-800">
                <div className="p-2 bg-slate-100 rounded-lg mr-3">
                  <Edit className="h-5 w-5 sm:h-6 sm:w-6 text-slate-600" />
                </div>
                Personal Information
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4 sm:p-6 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Agent Name */}
                <div className="space-y-2">
                  <Label htmlFor="agentName" className="text-sm font-semibold text-slate-700">Full Name</Label>
                  {isEditing ? (
                    <Input
                      id="agentName"
                      value={formData.agentName}
                      onChange={(e) => handleInputChange('agentName', e.target.value)}
                      disabled={isSaving}
                      className="bg-white/50 border-slate-300 focus:border-indigo-500 focus:ring-indigo-500"
                    />
                  ) : (
                    <div className="flex items-center p-4 bg-slate-50 rounded-xl border border-slate-200">
                      <User className="h-5 w-5 mr-3 text-slate-500" />
                      <span className="text-slate-900 font-medium">{agent.agentName || 'Not provided'}</span>
                    </div>
                  )}
                </div>

                {/* Email */}
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-sm font-semibold text-slate-700">Email Address</Label>
                  {isEditing ? (
                    <Input
                      id="email"
                      type="email"
                      value={formData.email}
                      onChange={(e) => handleInputChange('email', e.target.value)}
                      disabled={isSaving}
                      className="bg-white/50 border-slate-300 focus:border-indigo-500 focus:ring-indigo-500"
                    />
                  ) : (
                    <div className="flex items-center p-4 bg-slate-50 rounded-xl border border-slate-200">
                      <Mail className="h-5 w-5 mr-3 text-slate-500" />
                      <span className="text-slate-900 font-medium">{agent.email || 'Not provided'}</span>
                    </div>
                  )}
                </div>

                {/* Phone */}
                <div className="space-y-2">
                  <Label htmlFor="phone" className="text-sm font-semibold text-slate-700">Phone Number</Label>
                  {isEditing ? (
                    <Input
                      id="phone"
                      value={formData.phone}
                      onChange={(e) => handleInputChange('phone', e.target.value)}
                      disabled={isSaving}
                      className="bg-white/50 border-slate-300 focus:border-indigo-500 focus:ring-indigo-500"
                    />
                  ) : (
                    <div className="flex items-center p-4 bg-slate-50 rounded-xl border border-slate-200">
                      <Phone className="h-5 w-5 mr-3 text-slate-500" />
                      <span className="text-slate-900 font-medium">{agent.phone || 'Not provided'}</span>
                    </div>
                  )}
                </div>

                {/* Agent ID (Read-only) */}
                <div className="space-y-2">
                  <Label className="text-sm font-semibold text-slate-700">Agent ID</Label>
                  <div className="flex items-center p-4 bg-slate-100 rounded-xl border border-slate-300">
                    <Shield className="h-5 w-5 mr-3 text-slate-500" />
                    <span className="font-mono text-slate-900 font-medium">{agent.agentId}</span>
                  </div>
                </div>
              </div>

              {/* Address Section */}
              <div className="space-y-4">
                <h4 className="text-lg font-medium text-slate-900 flex items-center">
                  <MapPin className="h-5 w-5 mr-2 text-slate-600" />
                  Address Information
                </h4>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Address */}
                  <div className="space-y-2 md:col-span-2">
                    <Label htmlFor="address" className="text-sm font-semibold text-slate-700">Street Address</Label>
                    {isEditing ? (
                      <Input
                        id="address"
                        value={formData.address}
                        onChange={(e) => handleInputChange('address', e.target.value)}
                        disabled={isSaving}
                        className="bg-white/50 border-slate-300 focus:border-indigo-500 focus:ring-indigo-500"
                      />
                    ) : (
                      <div className="flex items-center p-4 bg-slate-50 rounded-xl border border-slate-200">
                        <MapPin className="h-5 w-5 mr-3 text-slate-500" />
                        <span className="text-slate-900 font-medium">{agent.address || 'Not provided'}</span>
                      </div>
                    )}
                  </div>

                  {/* City */}
                  <div className="space-y-2">
                    <Label htmlFor="city" className="text-sm font-semibold text-slate-700">City</Label>
                    {isEditing ? (
                      <Input
                        id="city"
                        value={formData.city}
                        onChange={(e) => handleInputChange('city', e.target.value)}
                        disabled={isSaving}
                        className="bg-white/50 border-slate-300 focus:border-indigo-500 focus:ring-indigo-500"
                      />
                    ) : (
                      <div className="flex items-center p-4 bg-slate-50 rounded-xl border border-slate-200">
                        <MapPin className="h-5 w-5 mr-3 text-slate-500" />
                        <span className="text-slate-900 font-medium">{agent.city || 'Not provided'}</span>
                      </div>
                    )}
                  </div>

                  {/* State */}
                  <div className="space-y-2">
                    <Label htmlFor="state" className="text-sm font-semibold text-slate-700">State</Label>
                    {isEditing ? (
                      <Input
                        id="state"
                        value={formData.state}
                        onChange={(e) => handleInputChange('state', e.target.value)}
                        disabled={isSaving}
                        className="bg-white/50 border-slate-300 focus:border-indigo-500 focus:ring-indigo-500"
                      />
                    ) : (
                      <div className="flex items-center p-4 bg-slate-50 rounded-xl border border-slate-200">
                        <MapPin className="h-5 w-5 mr-3 text-slate-500" />
                        <span className="text-slate-900 font-medium">{agent.state || 'Not provided'}</span>
                      </div>
                    )}
                  </div>

                  {/* ZIP Code */}
                  <div className="space-y-2">
                    <Label htmlFor="zip" className="text-sm font-semibold text-slate-700">ZIP Code</Label>
                    {isEditing ? (
                      <Input
                        id="zip"
                        value={formData.zip}
                        onChange={(e) => handleInputChange('zip', e.target.value)}
                        disabled={isSaving}
                        className="bg-white/50 border-slate-300 focus:border-indigo-500 focus:ring-indigo-500"
                      />
                    ) : (
                      <div className="flex items-center p-4 bg-slate-50 rounded-xl border border-slate-200">
                        <MapPin className="h-5 w-5 mr-3 text-slate-500" />
                        <span className="text-slate-900 font-medium">{agent.zip || 'Not provided'}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              {isEditing && (
                <div className="flex flex-col sm:flex-row gap-3 pt-6 border-t border-slate-200">
                  <Button
                    onClick={handleCancel}
                    variant="outline"
                    disabled={isSaving}
                    className="flex-1 bg-white/50 border-slate-300 hover:bg-slate-50 rounded-xl font-semibold py-3"
                  >
                    <X className="h-4 w-4 mr-2" />
                    Cancel
                  </Button>
                  <Button
                    onClick={handleSave}
                    disabled={isSaving}
                    className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-semibold py-3 shadow-lg hover:shadow-xl transition-all duration-200"
                  >
                    {isSaving ? (
                      <>
                        <Loader className="h-4 w-4 mr-2 animate-spin" />
                        Saving...
                      </>
                    ) : (
                      <>
                        <Save className="h-4 w-4 mr-2" />
                        Save Changes
                      </>
                    )}
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}
