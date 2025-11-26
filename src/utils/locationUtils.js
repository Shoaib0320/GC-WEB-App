// // Haversine formula to calculate distance in meters
// export const getDistance = (lat1, lon1, lat2, lon2) => {
//   const R = 6371e3; // Earth's radius in meters
//   const φ1 = (lat1 * Math.PI) / 180;
//   const φ2 = (lat2 * Math.PI) / 180;
//   const Δφ = ((lat2 - lat1) * Math.PI) / 180;
//   const Δλ = ((lon2 - lon1) * Math.PI) / 180;
//   const a = Math.sin(Δφ / 2) * Math.sin(Δφ / 2) + Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
//   const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
//   return R * c;
// };

// export const getCurrentLocation = async () => {
//   return new Promise((resolve, reject) => {
//     if (!navigator.geolocation) {
//       reject(new Error('Geolocation is not supported by this browser.'));
//       return;
//     }

//     navigator.geolocation.getCurrentPosition(
//       (position) => {
//         resolve({
//           latitude: position.coords.latitude,
//           longitude: position.coords.longitude,
//         });
//       },
//       (error) => {
//         console.error('Error getting location:', error);
//         reject(error);
//       },
//       { enableHighAccuracy: true, timeout: 10000, maximumAge: 60000 }
//     );
//   });
// };

// // Reverse Geocoding function using Nominatim (OpenStreetMap) for web
// export const getAddressFromCoords = async (latitude, longitude) => {
//   try {
//     // Add timeout to prevent hanging
//     const timeoutPromise = new Promise((_, reject) =>
//       setTimeout(() => reject(new Error('Geocoding timeout')), 5000)
//     );

//     const geocodePromise = fetch(
//       `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&zoom=18&addressdetails=1`,
//       {
//         headers: {
//           'User-Agent': 'AgentApp/1.0 (contact@example.com)', // Required by Nominatim
//         },
//       }
//     ).then(async (response) => {
//       if (!response.ok) {
//         throw new Error('Geocoding API error');
//       }
//       return response.json();
//     });

//     // Race between geocoding and timeout
//     const data = await Promise.race([geocodePromise, timeoutPromise]);

//     if (data && data.display_name) {
//       return data.display_name;
//     }
//     return 'Address not found';
//   } catch (error) {
//     // Log error but don't crash
//     console.log('⚠️ Address fetch failed (using coordinates instead):', error.message);
//     // Return coordinates as fallback
//     return `${latitude.toFixed(6)}, ${longitude.toFixed(6)}`;
//   }
// };




// src/utils/locationUtils.js

/**
 * Get current location using browser's Geolocation API
 */
export const getCurrentLocation = () => {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error('Geolocation is not supported by this browser'));
      return;
    }

    const options = {
      enableHighAccuracy: true,
      timeout: 15000,
      maximumAge: 60000
    };

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude, accuracy } = position.coords;
        console.log('📍 Location fetched successfully:', { latitude, longitude, accuracy });
        resolve({
          latitude,
          longitude,
          accuracy
        });
      },
      (error) => {
        console.error('❌ Location error:', error);
        
        let errorMessage = 'Failed to get location';
        switch (error.code) {
          case error.PERMISSION_DENIED:
            errorMessage = 'Location access denied. Please enable location permissions in your browser.';
            break;
          case error.POSITION_UNAVAILABLE:
            errorMessage = 'Location information unavailable.';
            break;
          case error.TIMEOUT:
            errorMessage = 'Location request timed out. Please try again.';
            break;
          default:
            errorMessage = 'An unknown error occurred while getting location.';
            break;
        }
        
        reject(new Error(errorMessage));
      },
      options
    );
  });
};

/**
 * Calculate distance between two coordinates using Haversine formula
 */
export const getDistance = (lat1, lon1, lat2, lon2) => {
  const R = 6371e3; // Earth's radius in meters
  const φ1 = (lat1 * Math.PI) / 180;
  const φ2 = (lat2 * Math.PI) / 180;
  const Δφ = ((lat2 - lat1) * Math.PI) / 180;
  const Δλ = ((lon2 - lon1) * Math.PI) / 180;

  const a = Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
            Math.cos(φ1) * Math.cos(φ2) *
            Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
  
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distance = R * c;
  
  console.log('📏 Distance calculated:', distance, 'meters');
  return distance;
};

/**
 * Get address from coordinates using Nominatim (OpenStreetMap)
 */
export const getAddressFromCoords = async (latitude, longitude) => {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000);

    const response = await fetch(
      `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&zoom=18&addressdetails=1`,
      {
        signal: controller.signal,
        headers: {
          'User-Agent': 'AgentApp/1.0',
        },
      }
    );
    
    clearTimeout(timeoutId);

    if (!response.ok) {
      throw new Error('Geocoding API error');
    }
    
    const data = await response.json();
    
    if (data && data.display_name) {
      return data.display_name;
    }
    
    return 'Address not found';
  } catch (error) {
    console.error('❌ Reverse geocoding error:', error);
    return `${latitude.toFixed(6)}, ${longitude.toFixed(6)}`;
  }
};

/**
 * Check if location permissions are granted
 */
export const checkLocationPermissions = async () => {
  if (!navigator.permissions) {
    return 'prompt';
  }

  try {
    const result = await navigator.permissions.query({ name: 'geolocation' });
    return result.state;
  } catch (error) {
    console.error('❌ Permission check error:', error);
    return 'prompt';
  }
};

/**
 * Enhanced location fetcher with fallbacks
 */
export const getEnhancedLocation = async () => {
  try {
    // Check permissions first
    const permission = await checkLocationPermissions();
    if (permission === 'denied') {
      throw new Error('Location access denied by user');
    }

    // Try to get fresh location
    const location = await getCurrentLocation();
    const address = await getAddressFromCoords(location.latitude, location.longitude);
    
    return {
      ...location,
      address,
      timestamp: Date.now(),
      source: 'fresh'
    };
  } catch (error) {
    console.error('❌ Enhanced location failed:', error);
    
    // Try to get cached location from localStorage
    try {
      const cachedLocation = localStorage.getItem('agentLocation');
      if (cachedLocation) {
        const parsed = JSON.parse(cachedLocation);
        // Use cached location if it's less than 10 minutes old
        if (Date.now() - (parsed.timestamp || 0) < 10 * 60 * 1000) {
          console.log('📍 Using cached location');
          return { ...parsed, source: 'cached' };
        }
      }
    } catch (cacheError) {
      console.error('❌ Cache read error:', cacheError);
    }
    
    throw error;
  }
};

// src/utils/locationUtils.js mein yeh function add karen

export const getHighAccuracyLocation = () => {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error('Geolocation is not supported by this browser'));
      return;
    }

    const options = {
      enableHighAccuracy: true, // Force high accuracy
      timeout: 20000, // 20 seconds
      maximumAge: 0 // Don't use cached location
    };

    console.log('📍 Requesting high accuracy location...');

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude, accuracy } = position.coords;
        console.log('📍 High accuracy location fetched:', { 
          latitude, 
          longitude, 
          accuracy: `${accuracy} meters` 
        });
        
        resolve({
          latitude,
          longitude,
          accuracy
        });
      },
      (error) => {
        console.error('❌ High accuracy location error:', error);
        
        let errorMessage = 'Failed to get accurate location';
        switch (error.code) {
          case error.PERMISSION_DENIED:
            errorMessage = 'Location access denied. Please enable location permissions.';
            break;
          case error.POSITION_UNAVAILABLE:
            errorMessage = 'High accuracy location unavailable. Please check your device location settings and ensure GPS is enabled.';
            break;
          case error.TIMEOUT:
            errorMessage = 'Location request timed out. Please ensure you have good GPS signal.';
            break;
          default:
            errorMessage = 'An unknown error occurred while getting location.';
            break;
        }
        
        reject(new Error(errorMessage));
      },
      options
    );
  });
};