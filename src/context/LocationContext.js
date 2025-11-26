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
  const [officeLocation, setOfficeLocation] = useState({ 
    latitude: 24.980667, 
    longitude: 67.133553, 
    address: "Halari Memon Society, Karachi" 
  });
  const [checkRadius, setCheckRadius] = useState(100); // meters

  // Load saved location from localStorage
  useEffect(() => {
    try {
      const savedLocation = localStorage.getItem('officeLocation');
      if (savedLocation) {
        setOfficeLocation(JSON.parse(savedLocation));
      }

      const savedRadius = localStorage.getItem('checkRadius');
      if (savedRadius) {
        setCheckRadius(JSON.parse(savedRadius));
      }
    } catch (error) {
      console.error('Error loading office location:', error);
    }
  }, []);

  // Update office location
  const updateOfficeLocation = (newLocation) => {
    setOfficeLocation(newLocation);
    try {
      localStorage.setItem('officeLocation', JSON.stringify(newLocation));
    } catch (error) {
      console.error('Error saving office location:', error);
    }
  };

  // Update check radius
  const updateCheckRadius = (newRadius) => {
    setCheckRadius(newRadius);
    try {
      localStorage.setItem('checkRadius', JSON.stringify(newRadius));
    } catch (error) {
      console.error('Error saving check radius:', error);
    }
  };

  return (
    <LocationContext.Provider value={{
      officeLocation,
      checkRadius,
      updateOfficeLocation,
      updateCheckRadius
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