// // lib/auth.js
// import jwt from 'jsonwebtoken';

// const JWT_SECRET = process.env.JWT_SECRET || 'your-super-secret-jwt-key-change-in-production';

// export const verifyAuth = async (request) => {
//   try {
//     console.log('🔐 Starting authentication verification...');

//     // Get token from header
//     const authHeader = request.headers.get('authorization');
//     console.log('📨 Authorization header:', authHeader);

//     if (!authHeader || !authHeader.startsWith('Bearer ')) {
//       console.log('❌ No Bearer token found in header');
//       return { error: 'No token provided', status: 401 };
//     }

//     const token = authHeader.split(' ')[1];
//     console.log('🔑 Token extracted:', token ? `${token.substring(0, 10)}...` : 'NULL');

//     if (!token) {
//       console.log('❌ Token is empty');
//       return { error: 'Invalid token format', status: 401 };
//     }

//     // Verify token
//     const decoded = jwt.verify(token, JWT_SECRET);
//     console.log('✅ Token verified successfully, decoded:', {
//       id: decoded.id,
//       userId: decoded.userId,
//       type: decoded.type,
//       email: decoded.email
//     });

//     return {
//       user: decoded,
//       userId: decoded.id || decoded.userId,
//       userType: decoded.type || 'user'
//     };
//   } catch (error) {
//     console.error('❌ Token verification failed:', error.message);

//     if (error.name === 'JsonWebTokenError') {
//       return { error: 'Invalid token', status: 401 };
//     } else if (error.name === 'TokenExpiredError') {
//       return { error: 'Token expired', status: 401 };
//     }

//     return { error: 'Authentication failed', status: 401 };
//   }
// };





// // import jwt from "jsonwebtoken";

// // const JWT_SECRET =
// //   process.env.JWT_SECRET || "your-super-secret-jwt-key-change-in-production";

// // export const verifyAuth = async (request) => {
// //   try {
// //     console.log("🔐 Starting authentication verification..."); // Get token from header
// //     const authHeader = request.headers.get("authorization");
// //     console.log("📨 Authorization header:", authHeader);
// //     if (!authHeader || !authHeader.startsWith("Bearer ")) {
// //       console.log("❌ No Bearer token found in header");
// //       return { error: "No token provided", status: 401 };
// //     }

// //     const token = authHeader.split(" ")[1];
// //     console.log(
// //       "🔑 Token extracted:",
// //       token ? `${token.substring(0, 10)}...` : "NULL"
// //     );
// //     if (!token) {
// //       console.log("❌ Token is empty");
// //       return { error: "Invalid token format", status: 401 };
// //     } // Verify token

// //     const decoded = jwt.verify(token, JWT_SECRET); // <-- YAHAN CHANGE HUA: Ab hum 'role' ko log kar rahe hain
// //     console.log("✅ Token verified successfully, decoded:", {
// //       id: decoded.id,
// //       userId: decoded.userId,
// //       role: decoded.role, // 'type' ke bajaye 'role'
// //       email: decoded.email,
// //     });
// //     return {
// //       user: decoded,
// //       userId: decoded.id || decoded.userId,
// //       userType: decoded.role || "user", // <-- YAHAN CHANGE HUA: 'type' ko 'role' se badla
// //     };
// //   } catch (error) {
// //     console.error("❌ Token verification failed:", error.message);
// //     if (error.name === "JsonWebTokenError") {
// //       return { error: "Invalid token", status: 401 };
// //     } else if (error.name === "TokenExpiredError") {
// //       return { error: "Token expired", status: 401 };
// //     }
// //     return { error: "Authentication failed", status: 401 };
// //   }
// // };






// lib/auth.js
import jwt from 'jsonwebtoken';

// ✅ YEH WAHI SECRET HONA CHAHIYE JO .env FILE MEIN HAI
const JWT_SECRET = process.env.JWT_SECRET;

if (!JWT_SECRET) {
  console.error('❌ JWT_SECRET is missing in environment variables');
  throw new Error('JWT_SECRET is required');
}

console.log('🔑 JWT_SECRET loaded:', JWT_SECRET ? '✅ Present' : '❌ Missing');

export const verifyAuth = async (request) => {
  try {
    console.log('🔐 Starting authentication verification...');
    console.log('🔑 JWT_SECRET being used:', JWT_SECRET ? '✅ Set' : '❌ Not set');

    // Get token from header
    const authHeader = request.headers.get('authorization');
    console.log('📨 Authorization header present:', !!authHeader);

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      console.log('❌ No Bearer token found in header');
      return { error: 'No token provided', status: 401 };
    }

    const token = authHeader.split(' ')[1];
    console.log('🔑 Token extracted length:', token?.length || 0);

    if (!token) {
      console.log('❌ Token is empty');
      return { error: 'Invalid token format', status: 401 };
    }

    // Verify token with proper error handling
    console.log('🔄 Verifying token...');
    const decoded = jwt.verify(token, JWT_SECRET);
    
    console.log('✅ Token verified successfully, decoded:', {
      id: decoded.id,
      userId: decoded.userId,
      role: decoded.role,
      email: decoded.email,
      type: decoded.type
    });

    return {
      user: decoded,
      userId: decoded.id || decoded.userId,
      userRole: decoded.role || decoded.type || 'user'
    };
  } catch (error) {
    console.error('❌ Token verification failed:', error.message);
    console.error('🔍 Error details:', {
      name: error.name,
      message: error.message
    });

    if (error.name === 'JsonWebTokenError') {
      return { error: 'Invalid token signature', status: 401 };
    } else if (error.name === 'TokenExpiredError') {
      return { error: 'Token expired', status: 401 };
    }

    return { error: 'Authentication failed: ' + error.message, status: 401 };
  }
};