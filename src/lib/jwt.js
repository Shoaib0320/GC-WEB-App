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
// Supports two usages:
// 1) verifyToken(tokenString) -> returns decoded payload or null (backwards compatible)
// 2) verifyToken(requestObject) -> extracts token from Authorization header or cookies
//    and returns an object: { user: decodedPayload } on success OR { error: '...', status: 401 }
export const verifyToken = (input) => {
  // If input looks like a Request/NextRequest object (has headers or cookies), handle it
  const isRequestLike = input && (typeof input === 'object') && (input.headers || input.cookies || (typeof input.get === 'function'));

  if (isRequestLike) {
    try {
      // Try to get Authorization header first
      let token = null;

      // Next.js Request headers are accessible via input.headers.get('authorization')
      try {
        const authHeader = input.headers?.get ? input.headers.get('authorization') : (input.headers && input.headers.authorization);
        if (authHeader) token = authHeader;
      } catch (e) {}

      // If not found in header, try cookies
      try {
        // Next.js route handlers can use request.cookies.get('token') returning { value }
        if (!token && input.cookies?.get) {
          token = input.cookies.get('token')?.value || null;
        }
        // Older shape: input.cookies.token
        if (!token && input.cookies && input.cookies.token) {
          token = input.cookies.token;
        }
      } catch (e) {}

      if (!token) {
        return { error: 'Not authenticated', status: 401 };
      }

      // If header value is like 'Bearer <token>' extract token
      if (typeof token === 'string' && token.toLowerCase().startsWith('bearer ')) {
        token = token.split(' ')[1];
      }

      try {
        const decoded = jwt.verify(token, JWT_SECRET);
        // Return decoded payload under `user` for route handlers that expect authData.user
        return { user: decoded };
      } catch (err) {
        if (err && err.name === 'TokenExpiredError') {
          return { error: 'TokenExpiredError: jwt expired', status: 401 };
        }
        return { error: 'Invalid token', status: 401 };
      }
    } catch (err) {
      return { error: 'Authentication error', status: 401 };
    }
  }

  // Otherwise assume input is a raw token string for backwards compatibility
  try {
    return jwt.verify(String(input), JWT_SECRET);
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
