// import jwt from 'jsonwebtoken';

// const JWT_SECRET = process.env.JWT_SECRET || 'your-super-secret-jwt-key-change-in-production';
// const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '7d';
// const JWT_COOKIE_EXPIRES = process.env.JWT_COOKIE_EXPIRES || 7;

// // Generate token
// export const generateToken = (payload) => {
//   return jwt.sign(payload, JWT_SECRET, {
//     expiresIn: JWT_EXPIRES_IN
//   });
// };

// // Generate token for agent
// export const generateAgentToken = (agent) => {
//   return jwt.sign(
//     { 
//       agentId: agent.agentId,
//       id: agent._id,           // ✅ Use _id for consistency
//       email: agent.email,
//       type: 'agent'            // ✅ Add type to distinguish
//     }, 
//     JWT_SECRET, 
//     { expiresIn: '24h' }
//   );
// };

// // Get user ID from token (works for both user and agent)
// export const getUserIdFromToken = (decoded) => {
//   if (decoded.type === 'agent') {
//     return decoded.id;  // ✅ Agent ke liye id use karo
//   }
//   return decoded.userId || decoded.id;
// };

// // Verify token
// export const verifyToken = (token) => {
//   try {
//     return jwt.verify(token, JWT_SECRET);
//   } catch (error) {
//     return null;
//   }
// };

// // Generate cookie options
// export const getCookieOptions = () => {
//   const isProduction = process.env.NODE_ENV === 'production';
  
//   return {
//     expires: new Date(Date.now() + JWT_COOKIE_EXPIRES * 24 * 60 * 60 * 1000),
//     httpOnly: true,
//     secure: isProduction,
//     sameSite: isProduction ? 'strict' : 'lax'
//   };
// };





// lib/jwt.js
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'your-fallback-super-secret-key-for-development-only';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '7d';

// ✅ Generate token for regular users
export const generateToken = (user) => {
  if (!JWT_SECRET) {
    throw new Error('JWT_SECRET is not defined in environment variables');
  }

  const payload = {
    userId: user._id?.toString() || user.id,
    email: user.email,
    type: 'user',
    firstName: user.firstName,
    lastName: user.lastName
  };

  console.log('🎫 Generating User Token:', payload);

  return jwt.sign(payload, JWT_SECRET, {
    expiresIn: JWT_EXPIRES_IN
  });
};

// ✅ Generate token for agents - CONSISTENT PAYLOAD
export const generateAgentToken = (agent) => {
  if (!JWT_SECRET) {
    throw new Error('JWT_SECRET is not defined in environment variables');
  }

  const payload = {
    agentId: agent.agentId,
    id: agent._id?.toString() || agent.id,  // ✅ Always use _id as primary ID
    email: agent.email,
    type: 'agent',                          // ✅ Always include type
    agentName: agent.agentName
  };

  console.log('🎫 Generating Agent Token:', payload);

  return jwt.sign(payload, JWT_SECRET, {
    expiresIn: JWT_EXPIRES_IN
  });
};

// ✅ Verify token
export const verifyToken = (token) => {
  try {
    if (!token) {
      console.log('❌ No token provided');
      return null;
    }

    if (!JWT_SECRET) {
      console.log('❌ JWT_SECRET is missing');
      return null;
    }

    const decoded = jwt.verify(token, JWT_SECRET);
    
    console.log('✅ Token Verified Successfully:', {
      id: decoded.id,
      userId: decoded.userId,
      agentId: decoded.agentId,
      type: decoded.type,
      email: decoded.email,
      exp: new Date(decoded.exp * 1000).toLocaleString()
    });

    return decoded;
  } catch (error) {
    console.error('❌ Token Verification Failed:', {
      error: error.message,
      token: token ? `${token.substring(0, 20)}...` : 'null'
    });

    if (error.name === 'TokenExpiredError') {
      console.log('⏰ Token has expired');
    } else if (error.name === 'JsonWebTokenError') {
      console.log('🔐 Invalid token signature');
    } else if (error.name === 'NotBeforeError') {
      console.log('⏳ Token not active yet');
    }

    return null;
  }
};

// ✅ Get user ID from token - IMPROVED & ROBUST
export const getUserIdFromToken = (decoded) => {
  if (!decoded) {
    console.log('❌ getUserIdFromToken: No decoded token provided');
    throw new Error('Invalid token: no decoded data');
  }

  console.log('🔍 getUserIdFromToken - Decoded:', {
    id: decoded.id,
    userId: decoded.userId,
    agentId: decoded.agentId,
    type: decoded.type
  });

  // ✅ Priority order for ID extraction
  if (decoded.id) {
    console.log('✅ Using decoded.id:', decoded.id);
    return decoded.id;
  }

  if (decoded.userId) {
    console.log('✅ Using decoded.userId:', decoded.userId);
    return decoded.userId;
  }

  if (decoded.agentId) {
    console.log('✅ Using decoded.agentId:', decoded.agentId);
    return decoded.agentId;
  }

  console.log('❌ No valid ID found in token:', decoded);
  throw new Error('No user ID found in token payload');
};

// ✅ Check if token is about to expire (for proactive refresh)
export const isTokenExpiringSoon = (token, thresholdMinutes = 30) => {
  try {
    const decoded = verifyToken(token);
    if (!decoded || !decoded.exp) return true;

    const currentTime = Math.floor(Date.now() / 1000);
    const timeUntilExpiry = decoded.exp - currentTime;
    const thresholdSeconds = thresholdMinutes * 60;

    console.log('🕒 Token Expiry Check:', {
      currentTime: new Date(currentTime * 1000).toLocaleString(),
      expiryTime: new Date(decoded.exp * 1000).toLocaleString(),
      timeUntilExpiry: `${timeUntilExpiry} seconds`,
      threshold: `${thresholdSeconds} seconds`,
      isExpiringSoon: timeUntilExpiry < thresholdSeconds
    });

    return timeUntilExpiry < thresholdSeconds;
  } catch (error) {
    console.error('Error checking token expiry:', error);
    return true;
  }
};

// ✅ Decode token without verification (for inspection)
export const decodeToken = (token) => {
  try {
    if (!token) return null;
    
    const decoded = jwt.decode(token);
    console.log('🔍 Token Decoded (without verification):', decoded);
    return decoded;
  } catch (error) {
    console.error('Error decoding token:', error);
    return null;
  }
};

// ✅ Validate token structure (basic checks)
export const validateTokenStructure = (token) => {
  try {
    if (!token || typeof token !== 'string') {
      return { isValid: false, error: 'Token must be a string' };
    }

    const parts = token.split('.');
    if (parts.length !== 3) {
      return { isValid: false, error: 'Token must have 3 parts' };
    }

    // Check if header and payload are valid JSON
    try {
      const header = JSON.parse(atob(parts[0]));
      const payload = JSON.parse(atob(parts[1]));

      console.log('🔍 Token Structure Validation:', {
        header: header,
        payload: {
          id: payload.id,
          type: payload.type,
          exp: payload.exp ? new Date(payload.exp * 1000).toLocaleString() : 'No expiry'
        }
      });

      return { 
        isValid: true, 
        header, 
        payload 
      };
    } catch (parseError) {
      return { isValid: false, error: 'Invalid JSON in token parts' };
    }
  } catch (error) {
    return { isValid: false, error: error.message };
  }
};

// ✅ Get token expiration time
export const getTokenExpiry = (token) => {
  try {
    const decoded = verifyToken(token);
    if (!decoded || !decoded.exp) return null;

    const expiryDate = new Date(decoded.exp * 1000);
    const timeUntilExpiry = decoded.exp * 1000 - Date.now();
    const minutesUntilExpiry = Math.floor(timeUntilExpiry / (1000 * 60));
    const hoursUntilExpiry = Math.floor(timeUntilExpiry / (1000 * 60 * 60));
    const daysUntilExpiry = Math.floor(timeUntilExpiry / (1000 * 60 * 60 * 24));

    console.log('📅 Token Expiry Details:', {
      expiryDate: expiryDate.toLocaleString(),
      timeUntilExpiry: {
        milliseconds: timeUntilExpiry,
        minutes: minutesUntilExpiry,
        hours: hoursUntilExpiry,
        days: daysUntilExpiry
      }
    });

    return {
      expiryDate,
      timeUntilExpiry,
      minutesUntilExpiry,
      hoursUntilExpiry,
      daysUntilExpiry,
      isExpired: timeUntilExpiry <= 0
    };
  } catch (error) {
    console.error('Error getting token expiry:', error);
    return null;
  }
};

// ✅ Refresh token (generate new token with same payload but new expiry)
export const refreshToken = (oldToken) => {
  try {
    const decoded = verifyToken(oldToken);
    if (!decoded) {
      throw new Error('Cannot refresh invalid token');
    }

    // Remove expiry from payload
    const { exp, iat, ...payload } = decoded;

    console.log('🔄 Refreshing Token:', payload);

    const newToken = jwt.sign(payload, JWT_SECRET, {
      expiresIn: JWT_EXPIRES_IN
    });

    console.log('✅ Token Refreshed Successfully');

    return newToken;
  } catch (error) {
    console.error('Error refreshing token:', error);
    throw error;
  }
};

// ✅ Utility to check JWT secret availability
export const checkJWTConfig = () => {
  const config = {
    hasJWTSecret: !!JWT_SECRET,
    jwtExpiresIn: JWT_EXPIRES_IN,
    isUsingFallback: !process.env.JWT_SECRET,
    environment: process.env.NODE_ENV || 'development'
  };

  console.log('🔧 JWT Configuration Check:', config);

  if (!process.env.JWT_SECRET) {
    console.warn('⚠️ WARNING: Using fallback JWT secret. This is not secure for production!');
  }

  return config;
};

export default {
  generateToken,
  generateAgentToken,
  verifyToken,
  getUserIdFromToken,
  isTokenExpiringSoon,
  decodeToken,
  validateTokenStructure,
  getTokenExpiry,
  refreshToken,
  checkJWTConfig
};