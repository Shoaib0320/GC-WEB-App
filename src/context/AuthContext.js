//src/context/AuthContext.js

"use client";

import { createContext, useContext, useState, useEffect } from "react";
import { authService } from "../services/authService";
import { useRouter } from "next/navigation";

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  const router = useRouter();

  useEffect(() => {
    checkAuthStatus();
  }, []);

  const checkAuthStatus = async () => {
    try {
      const response = await authService.getCurrentUser();

      if (response.success) {       
        setUser(response.data.user);
        setIsAuthenticated(true);
      } else {
        setUser(null);
        setIsAuthenticated(false);
      }
    } catch (error) {
      console.log("Auth check: User is not authenticated.");
      setUser(null);
      setIsAuthenticated(false);
    } finally {
      setLoading(false);
    }
  };

  const login = async (email, password) => {
    try {
      setLoading(true);
      const response = await authService.login(email, password);

      if (response.success) {
        setUser(response.data.user);
        setIsAuthenticated(true);
        return { success: true, message: response.message };
      }
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.error || "Login failed",
      };
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    try {
      await authService.logout();
    } catch (error) {
      console.error("Logout error:", error);
    } finally {
      setUser(null);
      setIsAuthenticated(false);
      router.replace("/login");
    }
  };

  const updateUser = (userData) => {
    setUser((prev) => ({ ...prev, ...userData }));
  };

  const hasPermission = (module, action) => {
    if (!user) return false;
    // Prefer role-level permission if present (role may be populated on the user object)
    try {
      const rolePerm = user.role && user.role.permissions && user.role.permissions[module] ? !!user.role.permissions[module]?.[action] : null;
      const userPerm = user.permissions && user.permissions[module] ? !!user.permissions[module]?.[action] : null;

      // If role explicitly grants or denies (boolean), respect it; otherwise fall back to user-specific permission
      if (rolePerm === true) return true;
      if (rolePerm === false && userPerm === true) return true; // user can still have explicit true

      return !!userPerm;
    } catch (err) {
      // In case of unexpected shape, fall back to checking user.permissions
      return user.permissions && !!user.permissions[module]?.[action];
    }
  };

  const value = {
    user,
    loading,
    isAuthenticated,
    login,
    logout,
    updateUser,
    hasPermission,
    checkAuthStatus,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};