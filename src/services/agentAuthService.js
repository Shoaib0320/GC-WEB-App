
// services/agentAuthService.js
import api from "@/lib/api";
export const agentAuthService = {
  // ---------------------------------------------------------
  // LOGIN
  // ---------------------------------------------------------
  async login(agentId, password) {
    try {
      const res = await api.post("/agents/login", { agentId, password });
      return res.data;
    } catch (error) {
      console.error("❌ Login error:", error.response?.data || error.message);
      throw new Error(error.response?.data?.message || "Login failed");
    }
  },

  // ---------------------------------------------------------
  // GET PROFILE
  // ---------------------------------------------------------
  async getProfile(token) {
    try {
      const authToken = token || localStorage.getItem("agentToken");
      if (!authToken) throw new Error("No token available");

      const res = await api.get("/agents/profile", {
        headers: { Authorization: `Bearer ${authToken}` },
      });

      return res.data;
    } catch (error) {
      console.error("❌ Profile fetch error:", error.response?.data || error.message);
      throw new Error(error.response?.data?.message || "Failed fetching profile");
    }
  },

  // ---------------------------------------------------------
  // UPDATE PROFILE
  // ---------------------------------------------------------
  async updateProfile(profileData) {
    try {
      const authToken = localStorage.getItem("agentToken");
      if (!authToken) throw new Error("No token available");

      const res = await api.put("/agents/profile", profileData, {
        headers: { Authorization: `Bearer ${authToken}` },
      });

      return res.data;
    } catch (error) {
      console.error("❌ Profile update error:", error.response?.data || error.message);
      throw new Error(error.response?.data?.message || "Profile update failed");
    }
  },

  // ---------------------------------------------------------
  // CHANGE PASSWORD
  // ---------------------------------------------------------
  async changePassword(currentPassword, newPassword) {
    try {
      const authToken = localStorage.getItem("agentToken");
      if (!authToken) throw new Error("No token available");

      const res = await api.put(
        "/agents/change-password",
        { currentPassword, newPassword },
        { headers: { Authorization: `Bearer ${authToken}` } }
      );

      return res.data;
    } catch (error) {
      console.error("❌ Password change error:", error.response?.data || error.message);
      throw new Error(error.response?.data?.message || "Password change failed");
    }
  },

  // ---------------------------------------------------------
  // REFRESH TOKEN
  // ---------------------------------------------------------
  async refreshToken(token) {
    try {
      const authToken = token || localStorage.getItem("agentToken");
      if (!authToken) throw new Error("No token available");

      const res = await api.post("/agents/refresh-token", {}, {
        headers: { Authorization: `Bearer ${authToken}` },
      });

      // Update localStorage with new token
      if (res.data.token) {
        localStorage.setItem("agentToken", res.data.token);
      }

      return res.data;
    } catch (error) {
      console.error("❌ Token refresh error:", error.response?.data || error.message);
      throw new Error(error.response?.data?.message || "Token refresh failed");
    }
  },

  // ---------------------------------------------------------
  // UPDATE AGENT LOCATION (Lat/Long + Address)
  // ---------------------------------------------------------
  async updateLocation(locationData) {
    try {
      const authToken = localStorage.getItem("agentToken");
      if (!authToken) throw new Error("No token available");

      const res = await api.put(
        "/agents/location",
        locationData,
        {
          headers: { Authorization: `Bearer ${authToken}` },
        }
      );

      return res.data;
    } catch (error) {
      console.error("❌ Location update error:", error.response?.data || error.message);
      throw new Error(error.response?.data?.message || "Failed updating location");
    }
  },

  // ---------------------------------------------------------
  // DASHBOARD STATS
  // ---------------------------------------------------------
  async getDashboardStats() {
    try {
      const authToken = localStorage.getItem("agentToken");
      if (!authToken) throw new Error("No token available");

      const res = await api.get("/agents/dashboard", {
        headers: { Authorization: `Bearer ${authToken}` },
      });

      return res.data;
    } catch (error) {
      console.error("❌ Dashboard stats error:", error.response?.data || error.message);
      throw new Error(error.response?.data?.message || "Failed getting dashboard stats");
    }
  },
};
