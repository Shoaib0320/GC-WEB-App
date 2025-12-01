// // import axios from 'axios';

// // const baseURL = process.env.NEXT_PUBLIC_API_URL || '/api';

// // const api = axios.create({
// //   baseURL,
// //   headers: {
// //     'Content-Type': 'application/json',
// //   },
// // });

// // // Request interceptor
// // api.interceptors.request.use(
// //   (config) => {
// //     // Add auth token from localStorage or cookies if available
// //     if (typeof window !== 'undefined') {
// //       // Check for agent token first, then regular token
// //       let token = localStorage.getItem('agentToken') || localStorage.getItem('token');
// //       if (!token) {
// //         // Check cookies for agentToken or token
// //         token = document.cookie
// //           .split('; ')
// //           .find(row => row.startsWith('agentToken='))?.split('=')[1] ||
// //           document.cookie
// //             .split('; ')
// //             .find(row => row.startsWith('token='))?.split('=')[1];
// //       }
// //       if (token) {
// //         config.headers.Authorization = `Bearer ${token}`;
// //       }
// //     }
// //     return config;
// //   },
// //   (error) => {
// //     return Promise.reject(error);
// //   }
// // );

// // // Response interceptor
// // api.interceptors.response.use(
// //   (response) => response,
// //   (error) => {
// //     if (error.response) {
// //       // Server responded with error status
// //       const errorData = error.response.data;
// //       if (errorData && Object.keys(errorData).length > 0) {
// //         console.error('API Error:', errorData);
// //       } else {
// //         console.error('API Error:', `Status: ${error.response.status} ${error.response.statusText}, Message: ${error.message}`);
// //       }

// //       // If 401 Unauthorized, clear tokens and redirect to login (only if not already on login page)
// //       if (error.response.status === 401) {
// //         if (typeof window !== 'undefined') {
// //           localStorage.removeItem('agentToken');
// //           localStorage.removeItem('token');
// //           document.cookie = 'agentToken=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
// //           document.cookie = 'token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
// //           // Avoid redirect loop: only redirect if not already on login page
// //           if (!window.location.pathname.includes('/agent/login')) {
// //             window.location.href = '/agent/login';
// //           }
// //         }
// //       }

// //       return Promise.reject(error);
// //     } else if (error.request) {
// //       // Request was made but no response received
// //       console.error('Network Error:', error.message);
// //       return Promise.reject(new Error('Network error - please check your connection'));
// //     } else {
// //       // Something else happened
// //       console.error('Request Error:', error.message);
// //       return Promise.reject(error);
// //     }
// //   }
// // );

// // export default api;

// import axios from 'axios';

// const instance = axios.create({
//   baseURL: 'https://gc-web-app.vercel.app/api',
//   timeout: 300000,
// });

// // Optional: a place to register a logout handler from AuthContext
// let logoutHandler = null;
// export const registerLogoutHandler = (fn) => {
//   logoutHandler = typeof fn === 'function' ? fn : null;
// };

// // Enhanced request interceptor with better debugging
// instance.interceptors.request.use(
//   (config) => {
//     // Add auth token from localStorage or cookies if available.
//     // Support both generic 'token' key and 'agentToken' which agentService uses.
//     if (typeof window !== 'undefined') {
//       let token = localStorage.getItem('token') || localStorage.getItem('agentToken');

//       if (!token) {
//         // Check cookies for either 'token' or 'agentToken'
//         const cookieMap = document.cookie.split('; ').reduce((acc, pair) => {
//           const [k, v] = pair.split('=');
//           acc[k] = v;
//           return acc;
//         }, {});
//         token = cookieMap.token || cookieMap.agentToken;
//       }

//       if (token) {
//         config.headers.Authorization = `Bearer ${token}`;
//       }
//     }
//     return config;
//   },
//   (err) => {
//     console.error('❌ Request Interceptor Error:', err);
//     return Promise.reject(err);
//   }
// );

// // Response interceptor
// api.interceptors.response.use(
//   (response) => response,
//   (error) => {
//     if (error.response) {
//       // Server responded with error status
//       const errorData = error.response.data;

//       // Detect expired token and proactively clear client state + redirect to login
//       try {
//         const status = error.response.status;
//         const errMsg = (errorData && (errorData.error || errorData.message)) || error.message || '';
//         if (status === 401 && /expired/i.test(String(errMsg))) {
//           console.warn('Auth token expired - clearing local session and redirecting to login.');
//           if (typeof window !== 'undefined') {
//             try {
//               localStorage.removeItem('token');
//               localStorage.removeItem('user');
//             } catch (e) {}
//             // Redirect to login page after a brief pause so caller can see message
//             setTimeout(() => {
//               window.location.href = '/auth/login';
//             }, 300);
//           }
//         }
//       } catch (e) {
//         // ignore errors in error handling
//       }

//       if (errorData && Object.keys(errorData).length > 0) {
//         console.error('API Error:', errorData);
// instance.interceptors.response.use(
//   (response) => {
//     console.log('✅ API Success:', {
//       status: response.status,
//       url: response.config?.url,
//       data: response.data
//     });
//     return response;
//   },
//   async (error) => {
//     const config = error.config || {};
//     const url = config.url;
//     const status = error.response?.status;
//     const message = error.message;

//     console.error('❌ API Error Details:', {
//       url,
//       status,
//       message,
//       fullURL: `${config.baseURL || ''}${url || ''}`,
//       requestHeaders: config.headers,
//       responseData: error.response?.data,
//       errorMessage: error.message
//     });

//     // If server sent 401 and claims token expired, optionally notify auth to logout
//     if (status === 401) {
//       const errorMsg =
//         (error.response?.data && (error.response.data.error || error.response.data.message)) ||
//         '';

//       console.log('🔐 401 Unauthorized - Token might be invalid/expired');

//       // If the server explicitly says token expired, let auth layer handle it (via handler)
//       if (logoutHandler && /expired|token|unauthorized/i.test(String(errorMsg).toLowerCase())) {
//         try {
//           await logoutHandler({
//             reason: 'token_expired',
//             url,
//             responseData: error.response?.data
//           });
//         } catch (e) {
//           console.error('Error while calling registered logout handler:', e);
//         }
//       } else {
//         // fallback: clear tokens and redirect to login if no logoutHandler registered
//         if (typeof window !== 'undefined') {
//           try {
//             localStorage.removeItem('token');
//             localStorage.removeItem('agentToken');
//             localStorage.removeItem('user');
//           } catch (e) {
//             console.error('Error clearing local storage tokens:', e);
//           }
//           setTimeout(() => {
//             window.location.href = '/auth/login';
//           }, 300);
//         }
//       }
//     }

//     // Network errors
//     if (error.code === 'NETWORK_ERROR' || error.message === 'Network Error') {
//       console.error('🌐 Network Error - Check internet connection and server status');
//     }

//     return Promise.reject(error);
//   }
// );

// export default instance;





import axios from "axios";

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || "https://gc-web-app.vercel.app/api",
  timeout: 300000,
});

// ===============================
// Optional logout handler support
// ===============================
let logoutHandler = null;
let tokenRefreshHandler = null;

export const registerLogoutHandler = (fn) => {
  logoutHandler = typeof fn === "function" ? fn : null;
};

export const registerTokenRefreshHandler = (fn) => {
  tokenRefreshHandler = typeof fn === "function" ? fn : null;
};

// ===============================
// REQUEST INTERCEPTOR
// ===============================
api.interceptors.request.use(
  (config) => {
    if (typeof window !== "undefined") {
      // Try localStorage first
      let token = localStorage.getItem("token") || localStorage.getItem("agentToken");

      // Try cookies also
      if (!token) {
        const cookies = document.cookie.split("; ").reduce((acc, row) => {
          const [k, v] = row.split("=");
          acc[k] = v;
          return acc;
        }, {});
        token = cookies.token || cookies.agentToken;
      }

      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }

    return config;
  },
  (error) => Promise.reject(error)
);

// ===============================
// RESPONSE INTERCEPTOR
// ===============================
api.interceptors.response.use(
  (response) => {
    // console.log("✅ API Success:", {
    //   url: response.config.url,
    //   status: response.status,
    // });
    return response;
  },

  async (error) => {
    const status = error.response?.status;
    const url = error.config?.url;
    const errorMsg =
      error.response?.data?.error ||
      error.response?.data?.message ||
      error.message ||
      "";

    console.error("❌ API Error:", {
      url,
      status,
      message: errorMsg,
      response: error.response?.data,
    });

    // ===============================
    // HANDLE 401 (TOKEN EXPIRED / INVALID)
    // ===============================
    if (status === 401) {
      console.warn("🔐 401 Unauthorized – Token expired or invalid");

      // Try to refresh token first
      if (tokenRefreshHandler && /expired|token|unauthorized/i.test(errorMsg.toLowerCase())) {
        try {
          console.log('🔄 Attempting to refresh token via handler...');
          const refreshed = await tokenRefreshHandler({
            reason: "token_expired",
            url,
            response: error.response?.data,
          });

          if (refreshed) {
            console.log('✅ Token refreshed successfully, retrying request...');
            // Retry the original request with new token
            return api(error.config);
          } else {
            throw new Error('Token refresh failed');
          }
        } catch (e) {
          console.error("❌ Token refresh failed:", e.message);
          // Token refresh failed, proceed to logout
        }
      }

      // If logoutHandler exists
      if (logoutHandler && /expired|token|unauthorized/i.test(errorMsg.toLowerCase())) {
        try {
          await logoutHandler({
            reason: "token_expired",
            url,
            response: error.response?.data,
          });
        } catch (e) {
          console.error("Error in logout handler:", e);
        }
      } else {
        // Fallback (default logout)
        if (typeof window !== "undefined") {
          localStorage.removeItem("token");
          localStorage.removeItem("agentToken");
          localStorage.removeItem("user");

          document.cookie = "token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
          document.cookie = "agentToken=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";

          // setTimeout(() => {
          //   window.location.href = "/login";
          // }, 300);
        }
      }
    }

    // ===============================
    // NETWORK ERRORS
    // ===============================
    if (error.code === "NETWORK_ERROR" || error.message === "Network Error") {
      console.error("🌐 Network Error - Check connection");
    }

    return Promise.reject(error);
  }
);

export default api;
