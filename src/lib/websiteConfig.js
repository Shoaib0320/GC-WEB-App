const APP_URL = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

// ✅ 2. Logo ka poora path ab yahan se banega
const LOGO_PATH = `${APP_URL}/Web_logo`;

export const WEBSITE_CONFIG = {
  // --- 1. Decent Auto Detailing ---
  "Decent Auto Detailing": {
    name: "Decent Auto Detailing",
    brandColor: "#007BFF",
    contrastColor: "#121733",
    bgColor: "#CFCFCF",
    // ✅ FIXED: Full URL ab email mein kaam karega
    logoUrl: `${LOGO_PATH}/Decent-Auto-Detailing_logo.png`,
    ownerEmail: "shoaibrazamemon170@gmail.com",
  },

  // --- 2. Quality Auto Care ---
  "Quality Auto Care": {
    name: "Quality Auto Care",
    brandColor: "#28A745",
    contrastColor: "#ffffff",
    bgColor: "#e8f5e9",
    // ✅ FIXED: Path screenshot ke mutabik
    logoUrl: `${LOGO_PATH}/Qulaity-Auto-clear_logo.png`,
    ownerEmail: "shoaibrazamemon170@gmail.com",
  },

  // --- 3. Spark Ride ---
  "Spark Ride": {
    name: "Spark Ride",
    brandColor: "#FF9800",
    contrastColor: "#ffffff",
    bgColor: "#fff3e0",
    // ⚠️ NOTE: Yeh file screenshot mein nahi thi, file name check kar lein
    logoUrl: `${LOGO_PATH}/spark-ride.png`,
    ownerEmail: "shoaibrazamemon170@gmail.com",
  },

  // --- 4. Local Auto SPA ---
  "Local Auto SPA": {
    name: "Local Auto SPA",
    brandColor: "#17A2B8",
    contrastColor: "#ffffff",
    bgColor: "#e0f7fa",
    // ✅ FIXED: Path screenshot ke mutabik
    logoUrl: `${LOGO_PATH}/Local-auto-spa_logo.png`,
    ownerEmail: "shoaibrazamemon170@gmail.com",
  },

  // --- 5. Impereal Auto Detailing ---
  "Impereal Auto Detailing": {
    name: "Impereal Auto Detailing",
    brandColor: "#6F42C1",
    contrastColor: "#ffffff",
    bgColor: "#f3e8ff",
    // ✅ FIXED: Path screenshot ke mutabik (file ka naam imperial hai)
    logoUrl: `${LOGO_PATH}/imperial_logo.png`,
    ownerEmail: "shoaibrazamemon170@gmail.com",
  },

  // --- 6. Home Town Detailing ---
  "Home Town Detailing": {
    name: "Home Town Detailing",
    brandColor: "#DC3545",
    contrastColor: "#ffffff",
    bgColor: "#fdecea",
    // ⚠️ NOTE: Yeh file screenshot mein nahi thi, file name check kar lein
    logoUrl: `${LOGO_PATH}/home-town-detailing.png`,
    ownerEmail: "shoaibrazamemon170@gmail.com",
  },

  // --- 7. Decent Detailers ---
  "Decent Detailers": {
    name: "Decent Detailers",
    brandColor: "#343A40",
    contrastColor: "#f8f9fa",
    bgColor: "#e9ecef",
    // ✅ FIXED: Path screenshot ke mutabik
    logoUrl: `${LOGO_PATH}/Decent-Detailers_logo.png`,
    ownerEmail: "shoaibrazamemon170@gmail.com",
  },

  // --- 8. Car Wash Pro ---
  "Car Wash Pro": {
    name: "Car Wash Pro",
    brandColor: "#009688",
    contrastColor: "#ffffff",
    bgColor: "#e0f2f1",
    // ⚠️ NOTE: Yeh file screenshot mein nahi thi, file name check kar lein
    logoUrl: `${LOGO_PATH}/car-wash-pro.png`,
    ownerEmail: "support@carwashpro.com",
  },
};

// Helper function to fetch config
export function getWebsiteConfig(webName) {
  return WEBSITE_CONFIG[webName] || WEBSITE_CONFIG["Decent Auto Detailing"];
}


