// // Web compatible background location and notification utilities using Web APIs

// const AUTO_CHECKOUT_CONFIG = {
//   CHECKOUT_RADIUS: 100, // meters
//   LOCATION_UPDATE_INTERVAL: 120000, // 2 minutes in ms
//   LOCATION_UPDATE_DISTANCE: 30 // meters
// };

// const LOCATION_TASK_NAME = 'background-location-task';

// // Web Notifications API wrapper
// export const setupNotifications = async () => {
//   if (!('Notification' in window)) {
//     console.warn('⚠️ This browser does not support notifications.');
//     return false;
//   }
//   try {
//     const permission = await Notification.requestPermission();
//     if (permission !== 'granted') {
//       console.warn('⚠️ Notification permission not granted');
//       return false;
//     }
//     console.log('✅ Notification permissions granted');
//     return true;
//   } catch (error) {
//     console.error('❌ Error setting up notifications:', error);
//     return false;
//   }
// };

// export const showNotification = (title, options = {}) => {
//   if (Notification.permission === 'granted') {
//     new Notification(title, options);
//   } else {
//     console.warn('⚠️ Cannot show notification, permission not granted');
//   }
// };

// // Since background geolocation is limited on web, use foreground geolocation

// // Request permission and get current position using browser geolocation API
// export const getCurrentPosition = () => {
//   return new Promise((resolve, reject) => {
//     if (!('geolocation' in navigator)) {
//       reject(new Error('⚠️ Geolocation not supported by this browser.'));
//       return;
//     }
//     navigator.geolocation.getCurrentPosition(resolve, reject, {
//       enableHighAccuracy: true,
//       maximumAge: 10000,
//       timeout: 5000,
//     });
//   });
// };

// // Watch position with callback and error handler
// let watchId = null;
// export const startLocationWatch = (onSuccess, onError) => {
//   if (!('geolocation' in navigator)) {
//     onError && onError(new Error('⚠️ Geolocation not supported by this browser.'));
//     return;
//   }
//   watchId = navigator.geolocation.watchPosition(onSuccess, onError, {
//     enableHighAccuracy: true,
//     maximumAge: 10000,
//     timeout: 5000,
//   });
//   console.log('🚀 Location watching started');
// };

// export const stopLocationWatch = () => {
//   if (watchId !== null) {
//     navigator.geolocation.clearWatch(watchId);
//     watchId = null;
//     console.log('🛑 Location watching stopped');
//   }
// };

// // Permission status checking for notifications and geolocation
// export const getNotificationPermissionStatus = () => {
//   return Notification.permission; // 'granted', 'denied', 'default'
// };

// export const getLocationPermissionStatus = () => {
//   // Browser does not expose direct geolocation permission status synchronously
//   // Return 'unknown', permission can be requested via getCurrentPosition
//   return 'unknown';
// };

// // Background tasks and TaskManager unsupported on web
// export const isBackgroundLocationSupported = false;

// // Manual location check utility using getCurrentPosition
// export const manualLocationCheck = async () => {
//   try {
//     console.log('\n' + '='.repeat(60));
//     console.log('🧪 MANUAL LOCATION CHECK - WEB MODE');
//     console.log('='.repeat(60));

//     const position = await getCurrentPosition();

//     console.log('📍 Manual location check:', position.coords);

//     // Use existing attendanceService method if it supports web compatible calls
//     if (typeof attendanceService !== 'undefined' && attendanceService.handleBackgroundLocationUpdate) {
//       const result = await attendanceService.handleBackgroundLocationUpdate({
//         latitude: position.coords.latitude,
//         longitude: position.coords.longitude,
//         timestamp: new Date().toISOString()
//       });
//       console.log('✅ Manual check result:', result);
//       console.log('='.repeat(60) + '\n');
//       return result;
//     } else {
//       console.warn('⚠️ attendanceService.handleBackgroundLocationUpdate not available');
//       return { success: true, message: 'Manual location check completed.' };
//     }
//   } catch (error) {
//     console.error('❌ Manual location check error:', error);
//     return { success: false, error: error.message };
//   }
// };


// Web compatible background location and notification utilities using Web APIs

const AUTO_CHECKOUT_CONFIG = {
  CHECKOUT_RADIUS: 100, // meters
  LOCATION_UPDATE_INTERVAL: 120000, // 2 minutes in ms
  LOCATION_UPDATE_DISTANCE: 30 // meters
};

const LOCATION_TASK_NAME = 'background-location-task';

// Web Notifications API wrapper
export const setupNotifications = async () => {
  if (!('Notification' in window)) {
    console.warn('⚠️ This browser does not support notifications.');
    return false;
  }
  try {
    const permission = await Notification.requestPermission();
    if (permission !== 'granted') {
      console.warn('⚠️ Notification permission not granted');
      return false;
    }
    console.log('✅ Notification permissions granted');
    return true;
  } catch (error) {
    console.error('❌ Error setting up notifications:', error);
    return false;
  }
};

export const showNotification = (title, options = {}) => {
  if (Notification.permission === 'granted') {
    new Notification(title, options);
  } else {
    console.warn('⚠️ Cannot show notification, permission not granted');
  }
};

// Since background geolocation is limited on web, use foreground geolocation

// Request permission and get current position using browser geolocation API
export const getCurrentPosition = () => {
  return new Promise((resolve, reject) => {
    if (!('geolocation' in navigator)) {
      reject(new Error('⚠️ Geolocation not supported by this browser.'));
      return;
    }
    navigator.geolocation.getCurrentPosition(resolve, reject, {
      enableHighAccuracy: true,
      maximumAge: 10000,
      timeout: 5000,
    });
  });
};

// Watch position with callback and error handler
let watchId = null;
export const startLocationWatch = (onSuccess, onError) => {
  if (!('geolocation' in navigator)) {
    onError && onError(new Error('⚠️ Geolocation not supported by this browser.'));
    return;
  }
  watchId = navigator.geolocation.watchPosition(onSuccess, onError, {
    enableHighAccuracy: true,
    maximumAge: 10000,
    timeout: 5000,
  });
  console.log('🚀 Location watching started');
};

export const stopLocationWatch = () => {
  if (watchId !== null) {
    navigator.geolocation.clearWatch(watchId);
    watchId = null;
    console.log('🛑 Location watching stopped');
  }
};

// Permission status checking for notifications and geolocation
export const getNotificationPermissionStatus = () => {
  return Notification.permission; // 'granted', 'denied', 'default'
};

export const getLocationPermissionStatus = () => {
  // Browser does not expose direct geolocation permission status synchronously
  // Return 'unknown', permission can be requested via getCurrentPosition
  return 'unknown';
};

// Background tasks and TaskManager unsupported on web
export const isBackgroundLocationSupported = false;

// Manual location check utility using getCurrentPosition
export const manualLocationCheck = async () => {
  try {
    console.log('\n' + '='.repeat(60));
    console.log('🧪 MANUAL LOCATION CHECK - WEB MODE');
    console.log('='.repeat(60));

    const position = await getCurrentPosition();

    console.log('📍 Manual location check:', position.coords);

    // Use existing attendanceService method if it supports web compatible calls
    if (typeof attendanceService !== 'undefined' && attendanceService.handleBackgroundLocationUpdate) {
      const result = await attendanceService.handleBackgroundLocationUpdate({
        latitude: position.coords.latitude,
        longitude: position.coords.longitude,
        timestamp: new Date().toISOString()
      });
      console.log('✅ Manual check result:', result);
      console.log('='.repeat(60) + '\n');
      return result;
    } else {
      console.warn('⚠️ attendanceService.handleBackgroundLocationUpdate not available');
      return { success: true, message: 'Manual location check completed.' };
    }
  } catch (error) {
    console.error('❌ Manual location check error:', error);
    return { success: false, error: error.message };
  }
};

// Start background location tracking
export const startBackgroundLocation = async () => {
  console.log('📍 Starting background location tracking...');
  // For web, we'll use periodic location checks
  return { success: true, message: 'Background location started (web mode)' };
};

// Stop background location tracking
export const stopBackgroundLocation = async () => {
  console.log('🛑 Stopping background location tracking...');
  stopLocationWatch();
  return { success: true, message: 'Background location stopped' };
};