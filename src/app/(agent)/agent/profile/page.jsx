"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
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
  Shield,
  Clock,
  Award
} from "lucide-react";
import { useAgent } from "@/context/AgentContext";
import { agentAuthService } from "@/services/agentAuthService";

export default function AgentProfilePage() {
  const {
    agent,
    isLoggedIn,
    refreshAgentData,
    isLoading: contextLoading
  } = useAgent();

  const router = useRouter();
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
      await refreshAgentData();
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

  if (contextLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
          <p className="text-gray-600">Loading profile...</p>
        </div>
      </div>
    );
  }

  if (!isLoggedIn || !agent) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center bg-white rounded-lg p-6 shadow-sm border border-gray-200 max-w-md w-full">
          <p className="text-gray-700 mb-4">Please login to view your profile.</p>
          <button
            onClick={() => router.push('/agent/login')}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-blue-700 transition-colors"
          >
            Go to Login
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4 sm:p-6">
      {/* Header */}
      <div className="max-w-6xl mx-auto mb-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">My Profile</h1>
            <p className="text-gray-600 mt-1">Manage your account information</p>
          </div>
          {!isEditing && (
            <button
              onClick={() => setIsEditing(true)}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-blue-700 transition-colors flex items-center gap-2"
            >
              <Edit className="h-4 w-4" />
              Edit Profile
            </button>
          )}
        </div>
      </div>

      {/* Success/Error Messages */}
      {error && (
        <div className="max-w-6xl mx-auto mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-red-800">{error}</p>
        </div>
      )}

      {success && (
        <div className="max-w-6xl mx-auto mb-4 p-4 bg-green-50 border border-green-200 rounded-lg">
          <p className="text-green-800">{success}</p>
        </div>
      )}

      <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Profile Overview */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <User className="h-5 w-5 text-blue-600" />
              Profile Overview
            </h2>
            
            <div className="text-center mb-6">
              <div className="w-20 h-20 bg-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <User className="h-10 w-10 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900">
                {agent.agentName}
              </h3>
              <p className="text-gray-600 text-sm">Agent ID: {agent.agentId}</p>
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center text-sm">
                  <Shield className="h-4 w-4 mr-2 text-green-600" />
                  <span className="text-gray-600">Status:</span>
                </div>
                <span className={`px-2 py-1 rounded text-xs font-medium ${
                  agent.isActive
                    ? 'bg-green-100 text-green-800'
                    : 'bg-red-100 text-red-800'
                }`}>
                  {agent.isActive ? 'Active' : 'Inactive'}
                </span>
              </div>

              {agent.shift && (
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center text-sm">
                    <Clock className="h-4 w-4 mr-2 text-blue-600" />
                    <span className="text-gray-600">Shift:</span>
                  </div>
                  <span className="font-medium text-gray-900">{agent.shift.name}</span>
                </div>
              )}

              {agent.monthlyTarget && (
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center text-sm">
                    <Target className="h-4 w-4 mr-2 text-purple-600" />
                    <span className="text-gray-600">Monthly Target:</span>
                  </div>
                  <span className="font-medium text-gray-900">${agent.monthlyTarget}</span>
                </div>
              )}

              {agent.createdAt && (
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center text-sm">
                    <Calendar className="h-4 w-4 mr-2 text-gray-600" />
                    <span className="text-gray-600">Joined:</span>
                  </div>
                  <span className="font-medium text-gray-900">
                    {new Date(agent.createdAt).toLocaleDateString()}
                  </span>
                </div>
              )}
            </div>

            {/* Performance Summary */}
            <div className="mt-6 bg-blue-50 rounded-lg p-4">
              <h4 className="text-sm font-semibold text-gray-800 mb-3 flex items-center gap-2">
                <Award className="h-4 w-4 text-blue-600" />
                Performance Summary
              </h4>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Total Bookings:</span>
                  <span className="font-semibold text-gray-900">45</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Revenue:</span>
                  <span className="font-semibold text-gray-900">$12,500</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Rating:</span>
                  <span className="font-semibold text-gray-900">4.8 ⭐</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Profile Details */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <User className="h-5 w-5 text-gray-600" />
              Personal Information
            </h2>

            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Agent Name */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Full Name</label>
                  {isEditing ? (
                    <input
                      value={formData.agentName}
                      onChange={(e) => handleInputChange('agentName', e.target.value)}
                      disabled={isSaving}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  ) : (
                    <div className="flex items-center p-3 bg-gray-50 rounded-lg border border-gray-200">
                      <User className="h-4 w-4 mr-2 text-gray-500" />
                      <span className="text-gray-900">{agent.agentName || 'Not provided'}</span>
                    </div>
                  )}
                </div>

                {/* Email */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Email Address</label>
                  {isEditing ? (
                    <input
                      type="email"
                      value={formData.email}
                      onChange={(e) => handleInputChange('email', e.target.value)}
                      disabled={isSaving}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  ) : (
                    <div className="flex items-center p-3 bg-gray-50 rounded-lg border border-gray-200">
                      <Mail className="h-4 w-4 mr-2 text-gray-500" />
                      <span className="text-gray-900">{agent.email || 'Not provided'}</span>
                    </div>
                  )}
                </div>

                {/* Phone */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Phone Number</label>
                  {isEditing ? (
                    <input
                      value={formData.phone}
                      onChange={(e) => handleInputChange('phone', e.target.value)}
                      disabled={isSaving}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  ) : (
                    <div className="flex items-center p-3 bg-gray-50 rounded-lg border border-gray-200">
                      <Phone className="h-4 w-4 mr-2 text-gray-500" />
                      <span className="text-gray-900">{agent.phone || 'Not provided'}</span>
                    </div>
                  )}
                </div>

                {/* Agent ID (Read-only) */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Agent ID</label>
                  <div className="flex items-center p-3 bg-gray-100 rounded-lg border border-gray-300">
                    <Shield className="h-4 w-4 mr-2 text-gray-500" />
                    <span className="font-mono text-gray-900">{agent.agentId}</span>
                  </div>
                </div>
              </div>

              {/* Address Section */}
              <div>
                <h4 className="text-md font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-gray-600" />
                  Address Information
                </h4>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Address */}
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">Street Address</label>
                    {isEditing ? (
                      <input
                        value={formData.address}
                        onChange={(e) => handleInputChange('address', e.target.value)}
                        disabled={isSaving}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                    ) : (
                      <div className="flex items-center p-3 bg-gray-50 rounded-lg border border-gray-200">
                        <MapPin className="h-4 w-4 mr-2 text-gray-500" />
                        <span className="text-gray-900">{agent.address || 'Not provided'}</span>
                      </div>
                    )}
                  </div>

                  {/* City */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">City</label>
                    {isEditing ? (
                      <input
                        value={formData.city}
                        onChange={(e) => handleInputChange('city', e.target.value)}
                        disabled={isSaving}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                    ) : (
                      <div className="flex items-center p-3 bg-gray-50 rounded-lg border border-gray-200">
                        <MapPin className="h-4 w-4 mr-2 text-gray-500" />
                        <span className="text-gray-900">{agent.city || 'Not provided'}</span>
                      </div>
                    )}
                  </div>

                  {/* State */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">State</label>
                    {isEditing ? (
                      <input
                        value={formData.state}
                        onChange={(e) => handleInputChange('state', e.target.value)}
                        disabled={isSaving}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                    ) : (
                      <div className="flex items-center p-3 bg-gray-50 rounded-lg border border-gray-200">
                        <MapPin className="h-4 w-4 mr-2 text-gray-500" />
                        <span className="text-gray-900">{agent.state || 'Not provided'}</span>
                      </div>
                    )}
                  </div>

                  {/* ZIP Code */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">ZIP Code</label>
                    {isEditing ? (
                      <input
                        value={formData.zip}
                        onChange={(e) => handleInputChange('zip', e.target.value)}
                        disabled={isSaving}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                    ) : (
                      <div className="flex items-center p-3 bg-gray-50 rounded-lg border border-gray-200">
                        <MapPin className="h-4 w-4 mr-2 text-gray-500" />
                        <span className="text-gray-900">{agent.zip || 'Not provided'}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              {isEditing && (
                <div className="flex gap-3 pt-4 border-t border-gray-200">
                  <button
                    onClick={handleCancel}
                    disabled={isSaving}
                    className="flex-1 bg-gray-100 text-gray-700 px-4 py-2 rounded-lg font-medium hover:bg-gray-200 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    <X className="h-4 w-4" />
                    Cancel
                  </button>
                  <button
                    onClick={handleSave}
                    disabled={isSaving}
                    className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-blue-700 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    <Save className="h-4 w-4" />
                    {isSaving ? "Saving..." : "Save Changes"}
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}