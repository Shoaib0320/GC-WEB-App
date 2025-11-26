// // src/context/AgentContext.js
// "use client";

// import { createContext, useEffect, useState, useContext } from "react";
// import { agentAuthService } from "../services/agentAuthService";
// import { getAddressFromCoords } from "../utils/locationUtils";
// // Fetch Agent Location
// const fetchAgentLocation = async () => {
//   if (!navigator.geolocation) return null;

//   return new Promise((resolve) => {
//     navigator.geolocation.getCurrentPosition(
//       (position) => {
//         const { latitude, longitude } = position.coords;
//         localStorage.setItem("agentLocation", JSON.stringify({ latitude, longitude }));
//         resolve({ latitude, longitude });
//       },
//       () => resolve(null),
//       { enableHighAccuracy: true, timeout: 10000, maximumAge: 60000 }
//     );
//   });
// };

// export const AgentContext = createContext(null);

// export const AgentProvider = ({ children }) => {
//   const [isLoggedIn, setIsLoggedIn] = useState(false);
//   const [agent, setAgent] = useState(null);
//   const [isLoading, setIsLoading] = useState(true);
//   const [token, setToken] = useState(null);
//   const [locationWatchId, setLocationWatchId] = useState(null);

//   // Validate JWT Token
//   const validateToken = (token) => {
//     try {
//       if (!token) return false;
//       const parts = token.split(".");
//       if (parts.length !== 3) return false;
//       const payload = JSON.parse(atob(parts[1]));
//       if (payload.exp && payload.exp * 1000 < Date.now()) return false;
//       if (!payload.id && !payload.agentId) return false;
//       return true;
//     } catch {
//       return false;
//     }
//   };

//   // Load Auth on Refresh
//   useEffect(() => {
//     const loadAuth = async () => {
//       try {
//         setIsLoading(true);
//         const savedToken = localStorage.getItem("agentToken");

//         if (!savedToken) {
//           const savedCreds = localStorage.getItem("agentCredentials");
//           if (savedCreds) {
//             const { agentId, password } = JSON.parse(savedCreds);
//             const autoLogin = await login(agentId, password, true);
//             if (autoLogin.success) {
//               setIsLoading(false);
//               return;
//             }
//           }
//           setIsLoggedIn(false);
//           setIsLoading(false);
//           return;
//         }

//         // Validate Token
//         const valid = validateToken(savedToken);
//         if (!valid) {
//           const savedCreds = localStorage.getItem("agentCredentials");
//           if (savedCreds) {
//             const { agentId, password } = JSON.parse(savedCreds);
//             const autoLogin = await login(agentId, password, true);
//             if (autoLogin.success) {
//               setIsLoading(false);
//               return;
//             }
//           }
//           await logout();
//           setIsLoading(false);
//           return;
//         }

//         // Token valid - load profile
//         setToken(savedToken);
//         const profileStr = localStorage.getItem("agentData");
//         let profileAgent = null;
//         if (profileStr) {
//           try {
//             profileAgent = JSON.parse(profileStr);
//           } catch {
//             profileAgent = null;
//           }
//         }
        
//         if (profileAgent) {
//           setAgent(profileAgent);
//           setIsLoggedIn(true);

//           // Fetch address if missing
//           if (profileAgent.location && !profileAgent.location.address) {
//             const addr = await getAddressFromCoords(
//               profileAgent.location.latitude,
//               profileAgent.location.longitude
//             );
//             setAgent((prev) => ({
//               ...prev,
//               location: { ...prev.location, address: addr },
//             }));
//           }

//           // Start location tracking
//           startLocationTracking();
//         } else {
//           await logout();
//         }
//       } catch {
//         await logout();
//       } finally {
//         setIsLoading(false);
//       }
//     };

//     loadAuth();
//   }, []);

//   // Start Location Tracking
//   const startLocationTracking = () => {
//     if (navigator.geolocation) {
//       const watchId = navigator.geolocation.watchPosition(
//         async (position) => {
//           const { latitude, longitude } = position.coords;
//           const address = await getAddressFromCoords(latitude, longitude);
//           localStorage.setItem("agentLocation", JSON.stringify({ latitude, longitude }));
//           setAgent((prev) => ({
//             ...prev,
//             location: { latitude, longitude, address },
//           }));
//         },
//         (error) => {
//           console.error("Live location watch error:", error);
//         },
//         { enableHighAccuracy: true, maximumAge: 60000, timeout: 10000 }
//       );
//       setLocationWatchId(watchId);
//     }
//   };

//   // Login Function
//   const login = async (agentId, password, rememberMe = false) => {
//     try {
//       setIsLoading(true);
//       const res = await agentAuthService.login(agentId, password);

//       if (!res.token) return { success: false, error: "Token missing" };

//       // Store token and agent data
//       localStorage.setItem("agentToken", res.token);
//       if (res.agent) {
//         localStorage.setItem("agentData", JSON.stringify(res.agent));
//         setAgent(res.agent);
//       }

//       // Store credentials for auto login
//       localStorage.setItem("agentCredentials", JSON.stringify({ agentId, password }));

//       setToken(res.token);
//       setIsLoggedIn(true);

//       // Fetch current location
//       const location = await fetchAgentLocation();
//       if (location) {
//         const address = await getAddressFromCoords(location.latitude, location.longitude);
//         setAgent((prev) => ({
//           ...prev,
//           location: { ...location, address },
//         }));
//       }

//       // Start location tracking
//       startLocationTracking();

//       return { success: true, data: res };
//     } catch (e) {
//       setIsLoading(false);
//       return { success: false, error: e.message };
//     } finally {
//       setIsLoading(false);
//     }
//   };

//   // Logout Function
//   const logout = async () => {
//     // Stop location tracking
//     if (locationWatchId !== null && navigator.geolocation) {
//       navigator.geolocation.clearWatch(locationWatchId);
//       setLocationWatchId(null);
//     }

//     // Clear storage
//     localStorage.removeItem("agentToken");
//     localStorage.removeItem("agentData");
//     localStorage.removeItem("agentCredentials");
//     localStorage.removeItem("agentLocation");

//     setAgent(null);
//     setIsLoggedIn(false);
//     setToken(null);
//   };

//   // Refresh Profile
//   const refreshAgentData = async () => {
//     try {
//       const savedToken = localStorage.getItem("agentToken");
//       if (!savedToken) throw new Error("No token");

//       const profile = await agentAuthService.getProfile(savedToken);
//       if (profile.agent) {
//         setAgent(profile.agent);
//         localStorage.setItem("agentData", JSON.stringify(profile.agent));
//         return profile.agent;
//       }
//       throw new Error("No agent data");
//     } catch (e) {
//       await logout();
//       throw e;
//     }
//   };

//   // Check Token Validity
//   const checkTokenValidity = () => {
//     const savedToken = localStorage.getItem("agentToken");
//     if (!savedToken) return false;
//     return validateToken(savedToken);
//   };

//   return (
//     <AgentContext.Provider
//       value={{
//         isLoggedIn,
//         agent,
//         login,
//         logout,
//         isLoading,
//         refreshAgentData,
//         token,
//         checkTokenValidity,
//       }}
//     >
//       {children}
//     </AgentContext.Provider>
//   );
// };

// // Custom Hook
// export const useAgent = () => {
//   const context = useContext(AgentContext);
//   if (!context)
//     throw new Error("useAgent must be used within an AgentProvider");
//   return context;
// };






// src/context/AgentContext.js
"use client";

import { createContext, useEffect, useState, useContext } from "react";
import { agentAuthService } from "../services/agentAuthService";
import { getEnhancedLocation, getAddressFromCoords } from "../utils/locationUtils";

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

  // Validate JWT Token
  const validateToken = (token) => {
    try {
      if (!token) return false;
      const parts = token.split(".");
      if (parts.length !== 3) return false;
      const payload = JSON.parse(atob(parts[1]));
      if (payload.exp && payload.exp * 1000 < Date.now()) return false;
      if (!payload.id && !payload.agentId) return false;
      return true;
    } catch {
      return false;
    }
  };

  // Load Auth on Refresh
  useEffect(() => {
    const loadAuth = async () => {
      try {
        setIsLoading(true);
        const savedToken = localStorage.getItem("agentToken");

        if (!savedToken) {
          const savedCreds = localStorage.getItem("agentCredentials");
          if (savedCreds) {
            const { agentId, password } = JSON.parse(savedCreds);
            const autoLogin = await login(agentId, password, true);
            if (autoLogin.success) {
              setIsLoading(false);
              return;
            }
          }
          setIsLoggedIn(false);
          setIsLoading(false);
          return;
        }

        // Validate Token
        const valid = validateToken(savedToken);
        if (!valid) {
          const savedCreds = localStorage.getItem("agentCredentials");
          if (savedCreds) {
            const { agentId, password } = JSON.parse(savedCreds);
            const autoLogin = await login(agentId, password, true);
            if (autoLogin.success) {
              setIsLoading(false);
              return;
            }
          }
          await logout();
          setIsLoading(false);
          return;
        }

        // Token valid - load profile
        setToken(savedToken);
        const profileStr = localStorage.getItem("agentData");
        let profileAgent = null;
        if (profileStr) {
          try {
            profileAgent = JSON.parse(profileStr);
          } catch {
            profileAgent = null;
          }
        }
        
        if (profileAgent) {
          setAgent(profileAgent);
          setIsLoggedIn(true);

          // Fetch fresh location if missing or old
          if (!profileAgent.location || 
              !profileAgent.location.timestamp || 
              Date.now() - profileAgent.location.timestamp > 5 * 60 * 1000) {
            try {
              const freshLocation = await getEnhancedLocation();
              setAgent((prev) => ({
                ...prev,
                location: freshLocation,
              }));
            } catch (locationError) {
              console.error('Failed to get fresh location:', locationError);
            }
          }

          // Start location tracking
          startLocationTracking();
        } else {
          await logout();
        }
      } catch {
        await logout();
      } finally {
        setIsLoading(false);
      }
    };

    loadAuth();
  }, []);

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
      const res = await agentAuthService.login(agentId, password);

      if (!res.token) return { success: false, error: "Token missing" };

      // Store token and agent data
      localStorage.setItem("agentToken", res.token);
      if (res.agent) {
        localStorage.setItem("agentData", JSON.stringify(res.agent));
        setAgent(res.agent);
      }

      // Store credentials for auto login
      if (rememberMe) {
        localStorage.setItem("agentCredentials", JSON.stringify({ agentId, password }));
      }

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

  // Check Token Validity
  const checkTokenValidity = () => {
    const savedToken = localStorage.getItem("agentToken");
    if (!savedToken) return false;
    return validateToken(savedToken);
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