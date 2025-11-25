// src/config/autoCheckoutConfig.js
// 🎯 Auto Checkout Configuration
// Yahan se easily auto checkout settings change kar sakte hain

/**
 * ⚙️ AUTO CHECKOUT RADIUS CONFIGURATION
 * 
 * Yeh distance office location se kitne meters bahar jane pe auto checkout trigger hoga
 * 
 * Examples:
 * - 1 meter   = Bilkul accurate, office boundary pe hi checkout
 * - 50 meters = Thoda flexibility (recommended for testing)
 * - 100 meters = Office area + parking (recommended for production)
 * - 200 meters = Zyada area cover (for large offices)
 */

export const AUTO_CHECKOUT_CONFIG = {
  // 🔥 CHECKOUT RADIUS (in meters)
  // Office se itne meter bahar jane pe auto checkout hoga
  CHECKOUT_RADIUS: 1, // ✅ Abhi 1 meter rakha hai
  
  // 📍 Location tracking frequency
  LOCATION_UPDATE_INTERVAL: 120000, // 2 minutes (in milliseconds)
  LOCATION_UPDATE_DISTANCE: 30,     // 30 meters movement
  
  // 🔋 Battery optimization
  DEFERRED_UPDATES_INTERVAL: 120000, // 2 minutes
  DEFERRED_UPDATES_DISTANCE: 50,     // 50 meters
  
  // ⏰ Shift time check
  ENABLE_SHIFT_TIME_CHECK: true,     // Shift end check enable/disable
  
  // 🎯 Other settings
  ENABLE_NOTIFICATIONS: true,        // Auto checkout notifications
  ENABLE_RETRY_ON_ERROR: true,       // Network error pe retry
};

/**
 * 📊 RECOMMENDED RADIUS VALUES
 * 
 * Small Office (1-2 rooms):
 *   CHECKOUT_RADIUS: 10-20 meters
 * 
 * Medium Office (Multi-floor):
 *   CHECKOUT_RADIUS: 50-100 meters
 * 
 * Large Office Campus:
 *   CHECKOUT_RADIUS: 100-200 meters
 * 
 * Testing Purpose:
 *   CHECKOUT_RADIUS: 1 meter (most accurate)
 */

/**
 * 🔧 Helper function to get checkout radius
 */
export const getCheckoutRadius = () => {
  return AUTO_CHECKOUT_CONFIG.CHECKOUT_RADIUS;
};

/**
 * 🔧 Helper function to update checkout radius (runtime)
 */
export const updateCheckoutRadius = (newRadius) => {
  if (newRadius && newRadius > 0) {
    AUTO_CHECKOUT_CONFIG.CHECKOUT_RADIUS = newRadius;
    console.log(`✅ Checkout radius updated to ${newRadius} meters`);
    return true;
  }
  console.error('❌ Invalid radius value');
  return false;
};

/**
 * 🔧 Get all config
 */
export const getAutoCheckoutConfig = () => {
  return { ...AUTO_CHECKOUT_CONFIG };
};

export default AUTO_CHECKOUT_CONFIG;