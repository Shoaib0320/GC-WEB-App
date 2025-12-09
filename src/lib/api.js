import axios from "axios";

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || "https://gc-web-app.vercel.app/api",
  timeout: 300000,
});

// Global loader management
let showLoader = null;
let hideLoader = null;

export const registerLoaderHandlers = (showFn, hideFn) => {
  showLoader = showFn;
  hideLoader = hideFn;
};

// Request interceptor to add auth token and show loader
api.interceptors.request.use(
  (config) => {
    if (showLoader) showLoader();

    // Add authorization header if token exists
    const token = localStorage.getItem('agentToken') || localStorage.getItem('accessToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to hide loader
api.interceptors.response.use(
  (response) => {
    if (hideLoader) hideLoader();
    return response;
  },
  (error) => {
    if (hideLoader) hideLoader();
    return Promise.reject(error);
  }
);

export default api;