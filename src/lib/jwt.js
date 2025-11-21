import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'your-super-secret-jwt-key-change-in-production';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '7d';
const JWT_COOKIE_EXPIRES = process.env.JWT_COOKIE_EXPIRES || 7;

// Generate token
export const generateToken = (payload) => {
  return jwt.sign(payload, JWT_SECRET, {
    expiresIn: JWT_EXPIRES_IN
  });
};

// Generate token for agent
export const generateAgentToken = (agent) => {
  return jwt.sign(
    { 
      agentId: agent.agentId,
      id: agent._id,           // ✅ Use _id for consistency
      email: agent.email,
      type: 'agent'            // ✅ Add type to distinguish
    }, 
    JWT_SECRET, 
    { expiresIn: '24h' }
  );
};

// Get user ID from token (works for both user and agent)
export const getUserIdFromToken = (decoded) => {
  if (decoded.type === 'agent') {
    return decoded.id;  // ✅ Agent ke liye id use karo
  }
  return decoded.userId || decoded.id;
};

// Verify token
export const verifyToken = (token) => {
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch (error) {
    return null;
  }
};

// Generate cookie options
export const getCookieOptions = () => {
  const isProduction = process.env.NODE_ENV === 'production';
  
  return {
    expires: new Date(Date.now() + JWT_COOKIE_EXPIRES * 24 * 60 * 60 * 1000),
    httpOnly: true,
    secure: isProduction,
    sameSite: isProduction ? 'strict' : 'lax'
  };
};
