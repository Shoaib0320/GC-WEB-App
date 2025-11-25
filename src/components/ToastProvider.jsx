// import React, { createContext, useContext, useState, useEffect, useCallback } from "react";

// const ToastContext = createContext();

// export const useToast = () => {
//   return useContext(ToastContext);
// };

// const ToastProvider = ({ children }) => {
//   const [toasts, setToasts] = useState([]);

//   const addToast = useCallback(({ type = "info", message, duration = 3000 }) => {
//     const id = Date.now();
//     setToasts((prev) => [...prev, { id, type, message }]);
//     setTimeout(() => {
//       setToasts((prev) => prev.filter((toast) => toast.id !== id));
//     }, duration);
//   }, []);

//   const success = useCallback(
//     (message, duration) => {
//       addToast({ type: "success", message, duration });
//     },
//     [addToast]
//   );

//   const error = useCallback(
//     (message, duration) => {
//       addToast({ type: "error", message, duration });
//     },
//     [addToast]
//   );

//   const info = useCallback(
//     (message, duration) => {
//       addToast({ type: "info", message, duration });
//     },
//     [addToast]
//   );

//   return (
//     <ToastContext.Provider value={{ addToast, success, error, info }}>
//       {children}
//       <div
//         aria-live="assertive"
//         style={{
//           position: "fixed",
//           top: 16,
//           right: 16,
//           zIndex: 9999,
//           display: "flex",
//           flexDirection: "column",
//           gap: 10,
//         }}
//       >
//         {toasts.map(({ id, type, message }) => (
//           <div
//             key={id}
//             style={{
//               minWidth: 250,
//               maxWidth: 300,
//               color: "white",
//               padding: "12px 16px",
//               borderRadius: 8,
//               boxShadow: "0 2px 8px rgba(0,0,0,0.15)",
//               backgroundColor:
//                 type === "success"
//                   ? "#4caf50"
//                   : type === "error"
//                   ? "#f44336"
//                   : "#2196f3",
//               fontWeight: "600",
//               fontSize: 14,
//               pointerEvents: "auto",
//             }}
//           >
//             {message}
//           </div>
//         ))}
//       </div>
//     </ToastContext.Provider>
//   );
// };

// export { ToastProvider, ToastContext };
// // export { default as toast } from "./toastSingleton";
