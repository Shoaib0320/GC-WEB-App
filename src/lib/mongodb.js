// import mongoose from "mongoose";

// const MONGODB_URI = process.env.MONGODB_URI;

// if (!MONGODB_URI) {
//   throw new Error(
//     "⚠️ Please define the MONGODB_URI environment variable in .env.local"
//   );
// }

// let isConnected = false; // track connection

// export default async function connectDB() {
//   if (isConnected) {
//     console.log("✅ MongoDB already connected");
//     return;
//   }

//   try {
//     const db = await mongoose.connect(MONGODB_URI, {
//       bufferCommands: false,
//     });
//     isConnected = db.connections[0].readyState;
//     console.log("✅ MongoDB connected successfully");
//   } catch (err) {
//     console.error("❌ MongoDB connection failed:", err);
//     throw err;
//   }
// }




import mongoose from "mongoose";

// MONGODB_URI ko .env file se lein
const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  throw new Error(
    "Please define the MONGODB_URI environment variable inside .env.local"
  );
}

/**
 * Global is used here to maintain a cached connection across hot reloads
 * in development. This prevents connections from multiplying during
 * development server restarts.
 */
let cached = global.mongoose;

if (!cached) {
  cached = global.mongoose = { conn: null, promise: null };
}

async function connectDB() {
  // 1. Agar connection pehle se hai, usko return karo
  if (cached.conn) {
    console.log("🚀 Using cached MongoDB connection");
    return cached.conn; // <-- DEKHEIN: Yeh connection instance RETURN kar raha hai
  }

  // 2. Agar connection ho raha hai, to uske promise ka intezar karo
  if (cached.promise) {
    console.log("⏳ Waiting for existing MongoDB connection promise");
    return cached.promise; // <-- DEKHEIN: Yeh purana promise RETURN kar raha hai
  }

  // 3. Naya connection banao (aur promise ko cache karo)
  console.log("✨ Creating new MongoDB connection");
  const opts = {
    bufferCommands: false, // Yeh zaroori hai aapke error ko rokne ke liye
  };

  cached.promise = mongoose.connect(MONGODB_URI, opts).then((mongooseInstance) => {
    console.log("✅ MongoDB connected successfully!");
    cached.conn = mongooseInstance; // Connection ko cache karo
    return mongooseInstance; // Connection ko return karo
  }).catch((error) => {
    console.error("❌ MongoDB connection error:", error);
    cached.promise = null; // Connection fail hua, promise reset karo
    throw error; // Error ko aage bhej do
  });

  // Naye promise ko return karo
  return cached.promise;
}

export default connectDB;