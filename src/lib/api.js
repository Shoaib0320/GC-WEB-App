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
    // Add auth token from localStorage or cookies if available
    if (typeof window !== 'undefined') {
      let token = localStorage.getItem('token');
      if (!token) {
        token = document.cookie
          .split('; ')
          .find(row => row.startsWith('token='))
          ?.split('=')[1];
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
