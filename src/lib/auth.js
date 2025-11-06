// lib/auth.js
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'your-super-secret-jwt-key-change-in-production';

export const verifyAuth = async (request) => {
  try {
    // Get token from header
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return { error: 'No token provided', status: 401 };
    }

    const token = authHeader.split(' ')[1];
    
    // Verify token
    const decoded = jwt.verify(token, JWT_SECRET);
    
    return { 
      user: decoded,
      userId: decoded.id || decoded.userId,
      userType: decoded.type || 'user'
    };
  } catch (error) {
    return { error: 'Invalid token', status: 401 };
  }
};