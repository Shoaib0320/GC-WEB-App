// // "use client";
// // import { createContext, useContext, useEffect, useState } from 'react';

// // export const LocationContext = createContext();

// // export const LocationProvider = ({ children }) => {
// //   const [officeLocation, setOfficeLocation] = useState({
// //     latitude: 24.96146,
// //     longitude: 67.07115,
// //     address: "R-84, Sector 15-A/4, North Karachi, Karachi"
// //   });
// //   const [checkRadius, setCheckRadius] = useState(10); // meters

// //   // Load saved location from localStorage synchronously without async/await
// //   useEffect(() => {
// //     try {
// //       const savedLocation = localStorage.getItem('officeLocation');
// //       if (savedLocation) {
// //         setOfficeLocation(JSON.parse(savedLocation));
// //       }

// //       const savedRadius = localStorage.getItem('checkRadius');
// //       if (savedRadius) {
// //         setCheckRadius(JSON.parse(savedRadius));
// //       }
// //     } catch (error) {
// //       console.error('Error loading office location:', error);
// //     }
// //   }, []);

// //   // Update office location synchronously in localStorage
// //   const updateOfficeLocation = (newLocation) => {
// //     setOfficeLocation(newLocation);
// //     try {
// //       localStorage.setItem('officeLocation', JSON.stringify(newLocation));
// //     } catch (error) {
// //       console.error('Error saving office location:', error);
// //     }
// //   };

// //   // Update check radius synchronously in localStorage
// //   const updateCheckRadius = (newRadius) => {
// //     setCheckRadius(newRadius);
// //     try {
// //       localStorage.setItem('checkRadius', JSON.stringify(newRadius));
// //     } catch (error) {
// //       console.error('Error saving check radius:', error);
// //     }
// //   };

// //   return (
// //     <LocationContext.Provider value={{
// //       officeLocation,
// //       checkRadius,
// //       updateOfficeLocation,
// //       updateCheckRadius
// //     }}>
// //       {children}
// //     </LocationContext.Provider>
// //   );
// // };

// // // Custom hook for easy access
// // export const useOfficeLocation = () => {
// //   const context = useContext(LocationContext);
// //   if (!context) {
// //     throw new Error('useOfficeLocation must be used within LocationProvider');
// //   }
// //   return context;
// // };




// "use client";
// import { createContext, useContext, useEffect, useState } from 'react';

// export const LocationContext = createContext();

// export const LocationProvider = ({ children }) => {
//   // const [officeLocation, setOfficeLocation] = useState({
//   //   latitude: 24.96146,
//   //   longitude: 67.07115,
//   //   address: "R-84, Sector 15-A/4, North Karachi, Karachi"
//   // });
//   const [officeLocation, setOfficeLocation] = useState({ 
//     latitude: 24.980667, 
//     longitude: 67.133553, 
//     address: "Halari Memon Society, Karachi" 
//   });
//   const [checkRadius, setCheckRadius] = useState(100); // meters - changed from 10 to 100 for better usability

//   // Load saved location from localStorage
//   useEffect(() => {
//     try {
//       const savedLocation = localStorage.getItem('officeLocation');
//       if (savedLocation) {
//         setOfficeLocation(JSON.parse(savedLocation));
//       }

//       const savedRadius = localStorage.getItem('checkRadius');
//       if (savedRadius) {
//         setCheckRadius(JSON.parse(savedRadius));
//       }
//     } catch (error) {
//       console.error('Error loading office location:', error);
//     }
//   }, []);

//   // Update office location
//   const updateOfficeLocation = (newLocation) => {
//     setOfficeLocation(newLocation);
//     try {
//       localStorage.setItem('officeLocation', JSON.stringify(newLocation));
//     } catch (error) {
//       console.error('Error saving office location:', error);
//     }
//   };

//   // Update check radius
//   const updateCheckRadius = (newRadius) => {
//     setCheckRadius(newRadius);
//     try {
//       localStorage.setItem('checkRadius', JSON.stringify(newRadius));
//     } catch (error) {
//       console.error('Error saving check radius:', error);
//     }
//   };

//   return (
//     <LocationContext.Provider value={{
//       officeLocation,
//       checkRadius,
//       updateOfficeLocation,
//       updateCheckRadius
//     }}>
//       {children}
//     </LocationContext.Provider>
//   );
// };

// // Custom hook for easy access
// export const useOfficeLocation = () => {
//   const context = useContext(LocationContext);
//   if (!context) {
//     throw new Error('useOfficeLocation must be used within LocationProvider');
//   }
//   return context;
// };

// src/context/LocationContext.js
"use client";
import { createContext, useContext, useEffect, useState } from 'react';

export const LocationContext = createContext();

export const LocationProvider = ({ children }) => {
  // Default office location - will be overridden by localStorage
  const [officeLocation, setOfficeLocation] = useState({
    latitude: 24.96146,
    longitude: 67.07115,
    address: "Office Location, Karachi"
  });

  const [checkRadius, setCheckRadius] = useState(10); // meters (10m radius for "At Office" detection)
  const [isLoading, setIsLoading] = useState(true);

  // Load saved location from localStorage on mount
  useEffect(() => {
    try {
      setIsLoading(true);
      const savedLocation = localStorage.getItem('officeLocation');
      if (savedLocation) {
        const parsed = JSON.parse(savedLocation);
        if (parsed && parsed.latitude && parsed.longitude) {
          setOfficeLocation(parsed);
          console.log('📍 Office location loaded from storage:', parsed);
        }
      }

      const savedRadius = localStorage.getItem('checkRadius');
      if (savedRadius) {
        const radius = JSON.parse(savedRadius);
        if (typeof radius === 'number' && radius > 0) {
          setCheckRadius(radius);
          console.log('📍 Check radius loaded from storage:', radius);
        }
      }
    } catch (error) {
      console.error('Error loading office location:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Update office location
  const updateOfficeLocation = (newLocation) => {
    if (!newLocation || !newLocation.latitude || !newLocation.longitude) {
      console.warn('Invalid location provided to updateOfficeLocation');
      return;
    }
    setOfficeLocation(newLocation);
    try {
      localStorage.setItem('officeLocation', JSON.stringify(newLocation));
      console.log('📍 Office location updated and saved:', newLocation);
    } catch (error) {
      console.error('Error saving office location:', error);
    }
  };

  // Update check radius
  const updateCheckRadius = (newRadius) => {
    if (typeof newRadius !== 'number' || newRadius <= 0) {
      console.warn('Invalid radius provided to updateCheckRadius');
      return;
    }
    setCheckRadius(newRadius);
    try {
      localStorage.setItem('checkRadius', JSON.stringify(newRadius));
      console.log('📍 Check radius updated and saved:', newRadius);
    } catch (error) {
      console.error('Error saving check radius:', error);
    }
  };

  return (
    <LocationContext.Provider value={{
      officeLocation,
      checkRadius,
      updateOfficeLocation,
      updateCheckRadius,
      isLoading
    }}>
      {children}
    </LocationContext.Provider>
  );
};

// Custom hook for easy access
export const useOfficeLocation = () => {
  const context = useContext(LocationContext);
  if (!context) {
    throw new Error('useOfficeLocation must be used within LocationProvider');
  }
  return context;
};