// import axios from 'axios';

// const baseURL = process.env.NEXT_PUBLIC_API_URL || '/api';

// const api = axios.create({
//   baseURL,
//   headers: {
//     'Content-Type': 'application/json',
//   },
// });

// // Request interceptor
// api.interceptors.request.use(
//   (config) => {
//     // Add auth token from localStorage or cookies if available
//     if (typeof window !== 'undefined') {
//       let token = localStorage.getItem('token');
//       if (!token) {
//         token = document.cookie
//           .split('; ')
//           .find(row => row.startsWith('token='))
//           ?.split('=')[1];
//       }
//       if (token) {
//         config.headers.Authorization = `Bearer ${token}`;
//       }
//     }
//     return config;
//   },
//   (error) => {
//     return Promise.reject(error);
//   }
// );

// // Response interceptor
// api.interceptors.response.use(
//   (response) => response,
//   (error) => {
//     if (error.response) {
//       // Server responded with error status
//       const errorData = error.response.data;
//       if (errorData && Object.keys(errorData).length > 0) {
//         console.error('API Error:', errorData);
//       } else {
//         console.error('API Error:', `Status: ${error.response.status} ${error.response.statusText}, Message: ${error.message}`);
//       }
//       return Promise.reject(error);
//     } else if (error.request) {
//       // Request was made but no response received
//       console.error('Network Error:', error.message);
//       return Promise.reject(new Error('Network error - please check your connection'));
//     } else {
//       // Something else happened
//       console.error('Request Error:', error.message);
//       return Promise.reject(error);
//     }
//   }
// );

// export default api;
// lib/api.js
import axios from 'axios';

const baseURL = process.env.NEXT_PUBLIC_API_URL || '/api';

const api = axios.create({
  baseURL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 30000, // 30 seconds timeout
});

// Request interceptor with better token handling
api.interceptors.request.use(
  (config) => {
    console.log('🚀 API Request:', {
      url: config.url,
      method: config.method,
      baseURL: config.baseURL
    });

    // Add auth token from multiple sources
    if (typeof window !== 'undefined') {
      let token = null;

      // Try localStorage first
      token = localStorage.getItem('token');
      console.log('🔑 Token from localStorage:', token ? `${token.substring(0, 10)}...` : 'Not found');

      // If not in localStorage, try cookies
      if (!token) {
        const cookieToken = document.cookie
          .split('; ')
          .find(row => row.startsWith('token='))
          ?.split('=')[1];
        
        if (cookieToken) {
          token = cookieToken;
          console.log('🍪 Token from cookie:', `${token.substring(0, 10)}...`);
          
          // Also save to localStorage for future use
          localStorage.setItem('token', cookieToken);
        }
      }

      // If still no token, try sessionStorage
      if (!token) {
        token = sessionStorage.getItem('token');
        console.log('💾 Token from sessionStorage:', token ? `${token.substring(0, 10)}...` : 'Not found');
      }

      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
        console.log('✅ Token added to request headers');
      } else {
        console.warn('⚠️ No authentication token found');
      }
    }

    return config;
  },
  (error) => {
    console.error('❌ Request interceptor error:', error);
    return Promise.reject(error);
  }
);

// Response interceptor with better error handling
api.interceptors.response.use(
  (response) => {
    console.log('✅ API Response Success:', {
      url: response.config.url,
      status: response.status,
      data: response.data
    });
    return response;
  },
  (error) => {
    console.error('❌ API Response Error:', {
      url: error.config?.url,
      status: error.response?.status,
      message: error.message,
      data: error.response?.data
    });

    if (error.response) {
      // Server responded with error status
      const { status, data } = error.response;
      
      if (status === 401) {
        console.log('🔐 401 Unauthorized - Clearing tokens');
        // Clear tokens and redirect to login
        if (typeof window !== 'undefined') {
          localStorage.removeItem('token');
          sessionStorage.removeItem('token');
          document.cookie = 'token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
          
          // Redirect to login page
          if (window.location.pathname !== '/login') {
            window.location.href = '/login';
          }
        }
      }
      
      // Create a better error message
      const errorMessage = data?.error || data?.message || `Request failed with status ${status}`;
      error.userMessage = errorMessage;
      
    } else if (error.request) {
      // Request was made but no response received
      console.error('🌐 Network Error:', error.message);
      error.userMessage = 'Network error - please check your internet connection';
    } else {
      // Something else happened
      console.error('⚡ Request Setup Error:', error.message);
      error.userMessage = 'Request failed - please try again';
    }

    return Promise.reject(error);
  }
);

export default api;