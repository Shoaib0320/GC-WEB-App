// src/context/AgentContext.js
"use client";

import { createContext, useEffect, useState, useContext } from "react";
import { agentAuthService } from "../services/agentAuthService";
import { getEnhancedLocation, getAddressFromCoords } from "../utils/locationUtils";

// Acceptable accuracy threshold in meters. Fixes with larger accuracy will be ignored.
const ACCURACY_THRESHOLD = 1000; // configurable: 1000m by default

// Enhanced location fetching
const fetchAgentLocation = async () => {
  if (!navigator.geolocation) {
    console.warn('Geolocation not supported');
    return null;
  }

  return new Promise((resolve) => {
    const options = {
      enableHighAccuracy: true,
      timeout: 15000,
      maximumAge: 300000 // 5 minutes
    };

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude, accuracy } = position.coords;
        try {
          const address = await getAddressFromCoords(latitude, longitude);
          const locationData = {
            latitude,
            longitude,
            address,
            accuracy,
            timestamp: Date.now()
          };
          localStorage.setItem("agentLocation", JSON.stringify(locationData));
          resolve(locationData);
        } catch (error) {
          console.error('Error getting address:', error);
          resolve({
            latitude,
            longitude,
            accuracy,
            timestamp: Date.now()
          });
        }
      },
      (error) => {
        console.error('Location error:', error);
        resolve(null);
      },
      options
    );
  });
};

export const AgentContext = createContext(null);

export const AgentProvider = ({ children }) => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [agent, setAgent] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [token, setToken] = useState(null);
  const [locationWatchId, setLocationWatchId] = useState(null);

  // Start Location Tracking
  const startLocationTracking = () => {
    if (navigator.geolocation) {
      const watchId = navigator.geolocation.watchPosition(
        async (position) => {
          const { latitude, longitude, accuracy } = position.coords;
          try {
            const address = await getAddressFromCoords(latitude, longitude);
            const locationData = {
              latitude,
              longitude,
              address,
              accuracy,
              timestamp: Date.now()
            };

            localStorage.setItem("agentLocation", JSON.stringify(locationData));
            setAgent((prev) => ({
              ...prev,
              location: locationData,
            }));
          } catch (error) {
            console.error('Live location address error:', error);
            const locationData = {
              latitude,
              longitude,
              accuracy,
              timestamp: Date.now()
            };
            setAgent((prev) => ({
              ...prev,
              location: locationData,
            }));
          }
        },
        (error) => {
          console.error("Live location watch error:", error);
        },
        {
          enableHighAccuracy: true,
          maximumAge: 60000,
          timeout: 10000
        }
      );
      setLocationWatchId(watchId);
    }
  };

  // Login Function
  const login = async (agentId, password, rememberMe = false) => {
    try {
      setIsLoading(true);
      console.log('🔐 Attempting login for agent:', agentId);
      const res = await agentAuthService.login(agentId, password);

      if (!res.token) return { success: false, error: "Token missing" };

      // Store token and agent data
      localStorage.setItem("agentToken", res.token);
      if (res.agent) {
        localStorage.setItem("agentData", JSON.stringify(res.agent));
        setAgent(res.agent);
      }

      // ✅ Always store credentials for auto-login (no login required for page reload/navigation)
      localStorage.setItem("agentCredentials", JSON.stringify({ agentId, password }));

      setToken(res.token);
      setIsLoggedIn(true);

      // Fetch current location with enhanced method
      try {
        const location = await getEnhancedLocation();
        if (location) {
          setAgent((prev) => ({
            ...prev,
            location,
          }));
        }
      } catch (locationError) {
        console.error('Location fetch during login failed:', locationError);
      }

      // Start location tracking
      startLocationTracking();

      return { success: true, data: res };
    } catch (e) {
      setIsLoading(false);
      console.error('❌ Login error:', e);
      return { success: false, error: e.message };
    } finally {
      setIsLoading(false);
    }
  };

  // Logout Function
  const logout = async () => {
    // Stop location tracking
    if (locationWatchId !== null && navigator.geolocation) {
      navigator.geolocation.clearWatch(locationWatchId);
      setLocationWatchId(null);
    }

    // Clear storage
    localStorage.removeItem("agentToken");
    localStorage.removeItem("agentData");
    localStorage.removeItem("agentCredentials");
    localStorage.removeItem("agentLocation");
    localStorage.removeItem("agentCurrentLocation");

    setAgent(null);
    setIsLoggedIn(false);
    setToken(null);
  };

    // Load Auth on Refresh - IMPROVED VERSION
useEffect(() => {
  const loadAuth = async () => {
    try {
      setIsLoading(true);
      console.log('🔄 Loading authentication...');
      
      const savedToken = localStorage.getItem("agentToken");
      console.log('🔐 Saved token found:', !!savedToken);

      if (!savedToken) {
        console.log('❌ No token, checking saved credentials...');
        const savedCreds = localStorage.getItem("agentCredentials");
        if (savedCreds) {
          try {
            const { agentId, password } = JSON.parse(savedCreds);
            console.log('🔄 Attempting auto-login with saved credentials...');
            const autoLogin = await login(agentId, password, true);
            if (autoLogin.success) {
              console.log('✅ Auto-login successful');
              setIsLoading(false);
              return;
            }
          } catch (autoLoginError) {
            console.error('❌ Auto-login failed:', autoLoginError);
          }
        }
        setIsLoggedIn(false);
        setIsLoading(false);
        return;
      }

      // Validate Token with better error handling
      console.log('🔍 Validating token...');
      let valid = false;
      try {
        valid = validateToken(savedToken);
      } catch (validationError) {
        console.error('❌ Token validation error:', validationError);
        valid = false;
      }

      if (!valid) {
        console.log('❌ Token invalid, attempting auto-login...');
        const savedCreds = localStorage.getItem("agentCredentials");
        if (savedCreds) {
          try {
            const { agentId, password } = JSON.parse(savedCreds);
            const autoLogin = await login(agentId, password, true);
            if (autoLogin.success) {
              console.log('✅ Auto-login successful after token validation failed');
              setIsLoading(false);
              return;
            }
          } catch (autoLoginError) {
            console.error('❌ Auto-login failed:', autoLoginError);
          }
        }
        console.log('❌ No valid authentication method, logging out');
        await logout();
        setIsLoading(false);
        return;
      }

      // Token valid - load profile
      console.log('✅ Token valid, loading profile...');
      setToken(savedToken);
      
      const profileStr = localStorage.getItem("agentData");
      let profileAgent = null;
      
      if (profileStr) {
        try {
          profileAgent = JSON.parse(profileStr);
          console.log('✅ Profile loaded from localStorage');
        } catch (parseError) {
          console.error('❌ Error parsing profile data:', parseError);
          profileAgent = null;
        }
      }
      
      if (profileAgent) {
        setAgent(profileAgent);
        setIsLoggedIn(true);
        console.log('✅ Authentication successful');

        // Fetch fresh location if missing or old
        if (!profileAgent.location || 
            !profileAgent.location.timestamp || 
            Date.now() - profileAgent.location.timestamp > 5 * 60 * 1000) {
          try {
            console.log('🔄 Fetching fresh location...');
            const freshLocation = await getEnhancedLocation();
            setAgent((prev) => ({
              ...prev,
              location: freshLocation,
            }));
            console.log('✅ Fresh location updated');
          } catch (locationError) {
            console.error('❌ Failed to get fresh location:', locationError);
          }
        }

        // Start location tracking
        console.log('🔄 Starting location tracking...');
        startLocationTracking();
      } else {
        console.log('❌ No profile data, logging out');
        await logout();
      }
    } catch (error) {
      console.error('❌ Load auth error:', error);
      await logout();
    } finally {
      setIsLoading(false);
      console.log('🏁 Authentication loading completed');
    }
  };

  loadAuth();
}, []);

  // Refresh Profile
  const refreshAgentData = async () => {
    try {
      const savedToken = localStorage.getItem("agentToken");
      if (!savedToken) throw new Error("No token");

      const profile = await agentAuthService.getProfile(savedToken);
      if (profile.agent) {
        setAgent(profile.agent);
        localStorage.setItem("agentData", JSON.stringify(profile.agent));
        return profile.agent;
      }
      throw new Error("No agent data");
    } catch (e) {
      await logout();
      throw e;
    }
  };

  // Validate JWT Token - IMPROVED VERSION
  const validateToken = (token) => {
    try {
      if (!token) return false;

      // Check token format
      const parts = token.split(".");
      if (parts.length !== 3) return false;

      // Decode payload
      const payload = JSON.parse(atob(parts[1]));

      // Check expiration
      if (payload.exp && payload.exp * 1000 < Date.now()) {
        console.log('❌ Token expired');
        return false;
      }

      // Check if it has required fields (agent ID)
      if (!payload.id && !payload.agentId) {
        console.log('❌ Token missing agent ID');
        return false;
      }

      console.log('✅ Token is valid');
      return true;
    } catch (error) {
      console.error('❌ Token validation error:', error);
      return false;
    }
  };

  // Check Token Validity - IMPROVED
  const checkTokenValidity = () => {
    try {
      const savedToken = localStorage.getItem("agentToken");
      if (!savedToken) {
        console.log('❌ No token found');
        return false;
      }
      return validateToken(savedToken);
    } catch (error) {
      console.error('❌ Token validity check error:', error);
      return false;
    }
  };

  return (
    <AgentContext.Provider
      value={{
        isLoggedIn,
        agent,
        login,
        logout,
        isLoading,
        refreshAgentData,
        token,
        checkTokenValidity,
      }}
    >
      {children}
    </AgentContext.Provider>
  );
};

// Custom Hook
export const useAgent = () => {
  const context = useContext(AgentContext);
  if (!context)
    throw new Error("useAgent must be used within an AgentProvider");
  return context;
};