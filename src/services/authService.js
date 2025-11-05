import api from "../lib/api";

export const authService = {
  // Super Admin signup (only for initial setup)
  superAdminSignup: async (userData) => {
    const response = await api.post("/auth/super-admin-signup", userData);
    return response.data;
  },

  // User login
  login: async (email, password) => {
    const response = await api.post("/auth/login", { email, password });
    return response.data;
  },

  // User logout
  logout: async () => {
    const response = await api.post("/auth/logout");
    return response.data;
  },

  // Get current user
  getCurrentUser: async () => {
    const response = await api.get("/auth/me");
    return response.data;
  },

  // Refresh token
  refreshToken: async () => {
    const response = await api.post("/auth/refresh");
    return response.data;
  },

  // Forgot password
  forgotPassword: async (email) => {
    const response = await api.post("/auth/forgot-password", { email });
    return response.data;
  },

  // Reset password
  resetPassword: async (token, password) => {
    const response = await api.patch(`/auth/reset-password/${token}`, {
      password,
    });
    return response.data;
  },

  // Update password
  updatePassword: async (currentPassword, newPassword) => {
    const response = await api.patch("/auth/update-password", {
      currentPassword,
      newPassword,
    });
    return response.data;
  },
};
