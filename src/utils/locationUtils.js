// Haversine formula to calculate distance in meters
export const getDistance = (lat1, lon1, lat2, lon2) => {
  const R = 6371e3; // Earth's radius in meters
  const φ1 = (lat1 * Math.PI) / 180;
  const φ2 = (lat2 * Math.PI) / 180;
  const Δφ = ((lat2 - lat1) * Math.PI) / 180;
  const Δλ = ((lon2 - lon1) * Math.PI) / 180;
  const a = Math.sin(Δφ / 2) * Math.sin(Δφ / 2) + Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
};

export const getCurrentLocation = async () => {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error('Geolocation is not supported by this browser.'));
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        resolve({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
        });
      },
      (error) => {
        console.error('Error getting location:', error);
        reject(error);
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 60000 }
    );
  });
};

// Reverse Geocoding function using Nominatim (OpenStreetMap) for web
export const getAddressFromCoords = async (latitude, longitude) => {
  try {
    // Add timeout to prevent hanging
    const timeoutPromise = new Promise((_, reject) =>
      setTimeout(() => reject(new Error('Geocoding timeout')), 5000)
    );

    const geocodePromise = fetch(
      `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&zoom=18&addressdetails=1`,
      {
        headers: {
          'User-Agent': 'AgentApp/1.0 (contact@example.com)', // Required by Nominatim
        },
      }
    ).then(async (response) => {
      if (!response.ok) {
        throw new Error('Geocoding API error');
      }
      return response.json();
    });

    // Race between geocoding and timeout
    const data = await Promise.race([geocodePromise, timeoutPromise]);

    if (data && data.display_name) {
      return data.display_name;
    }
    return 'Address not found';
  } catch (error) {
    // Log error but don't crash
    console.log('⚠️ Address fetch failed (using coordinates instead):', error.message);
    // Return coordinates as fallback
    return `${latitude.toFixed(6)}, ${longitude.toFixed(6)}`;
  }
};
