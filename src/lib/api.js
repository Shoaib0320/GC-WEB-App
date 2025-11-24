import axios from 'axios';

const baseURL = process.env.NEXT_PUBLIC_API_URL || '/api';

const api = axios.create({
  baseURL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor
api.interceptors.request.use(
  (config) => {
    // Add auth token from localStorage or cookies if available.
    // Support both generic 'token' key and 'agentToken' which agentService uses.
    if (typeof window !== 'undefined') {
      let token = localStorage.getItem('token') || localStorage.getItem('agentToken');

      if (!token) {
        // Check cookies for either 'token' or 'agentToken'
        const cookieMap = document.cookie.split('; ').reduce((acc, pair) => {
          const [k, v] = pair.split('=');
          acc[k] = v;
          return acc;
        }, {});
        token = cookieMap.token || cookieMap.agentToken;
      }

      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response) {
      // Server responded with error status
      const errorData = error.response.data;

      // Detect expired token and proactively clear client state + redirect to login
      try {
        const status = error.response.status;
        const errMsg = (errorData && (errorData.error || errorData.message)) || error.message || '';
        if (status === 401 && /expired/i.test(String(errMsg))) {
          console.warn('Auth token expired - clearing local session and redirecting to login.');
          if (typeof window !== 'undefined') {
            try {
              localStorage.removeItem('token');
              localStorage.removeItem('user');
            } catch (e) {}
            // Redirect to login page after a brief pause so caller can see message
            setTimeout(() => {
              window.location.href = '/auth/login';
            }, 300);
          }
        }
      } catch (e) {
        // ignore errors in error handling
      }

      if (errorData && Object.keys(errorData).length > 0) {
        console.error('API Error:', errorData);
      } else {
        console.error('API Error:', `Status: ${error.response.status} ${error.response.statusText}, Message: ${error.message}`);
      }
      return Promise.reject(error);
    } else if (error.request) {
      // Request was made but no response received
      console.error('Network Error:', error.message);
      return Promise.reject(new Error('Network error - please check your connection'));
    } else {
      // Something else happened
      console.error('Request Error:', error.message);
      return Promise.reject(error);
    }
  }
);

export default api;