// import React, { useContext } from 'react';
// import { ThemeContext } from '../context/ThemeContext';

// const GlobalModal = ({
//   visible,
//   onClose,
//   title = 'Notification',
//   message = '',
//   icon = '⚠️',
//   type = 'info', // 'success', 'error', 'warning', 'info'
//   buttons = [],
//   closeButtonText = 'Close',
//   showCloseButton = true,
//   onBackdropPress = null,
// }) => {
//   const { theme } = useContext(ThemeContext);

//   if (!visible) return null;

//   const getTypeColor = () => {
//     switch (type) {
//       case 'success':
//         return '#4CAF50';
//       case 'error':
//         return '#F44336';
//       case 'warning':
//         return '#FF9800';
//       case 'info':
//         return '#2196F3';
//       default:
//         return theme.colors.primary;
//     }
//   };

//   const getTypeIcon = () => {
//     if (icon !== '⚠️') return icon; // Custom icon provided
    
//     switch (type) {
//       case 'success':
//         return '✅';
//       case 'error':
//         return '❌';
//       case 'warning':
//         return '⚠️';
//       case 'info':
//         return 'ℹ️';
//       default:
//         return '💬';
//     }
//   };

//   const handleBackdropClick = () => {
//     if (onBackdropPress) {
//       onBackdropPress();
//     } else if (showCloseButton) {
//       onClose();
//     }
//   };

//   const modalWidth = Math.min(window.innerWidth - 60, 400);

//   return (
//     <div
//       style={{
//         position: 'fixed',
//         zIndex: 1000,
//         top: 0, left: 0, right: 0, bottom: 0,
//         backgroundColor: 'rgba(0, 0, 0, 0.6)',
//         display: 'flex',
//         justifyContent: 'center',
//         alignItems: 'center',
//         padding: 20,
//       }}
//       role="dialog"
//       aria-modal="true"
//       onClick={handleBackdropClick}
//     >
//       <div
//         style={{
//           width: modalWidth,
//           borderRadius: 20,
//           padding: 24,
//           backgroundColor: theme.colors.background,
//           display: 'flex',
//           flexDirection: 'column',
//           alignItems: 'center',
//           boxShadow: '0 4px 8px rgba(0,0,0,0.3)'
//         }}
//         onClick={(e) => e.stopPropagation()}
//       >
//         {/* Icon */}
//         <div
//           style={{
//             width: 70,
//             height: 70,
//             borderRadius: 35,
//             backgroundColor: `${getTypeColor()}33`, // 20% opacity
//             display: 'flex',
//             justifyContent: 'center',
//             alignItems: 'center',
//             marginBottom: 16,
//             fontSize: 40,
//           }}
//           aria-hidden="true"
//         >
//           {getTypeIcon()}
//         </div>
//         {/* Title */}
//         <h2 style={{
//           fontSize: 20,
//           fontWeight: 'bold',
//           marginBottom: 12,
//           textAlign: 'center',
//           color: theme.colors.text,
//         }}>
//           {title}
//         </h2>
//         {/* Message */}
//         <p style={{
//           fontSize: 15,
//           lineHeight: 1.5,
//           textAlign: 'center',
//           marginBottom: 24,
//           color: theme.colors.textSecondary,
//           whiteSpace: 'pre-wrap'
//         }}>
//           {message}
//         </p>

//         {/* Custom Buttons */}
//         {buttons.length > 0 && (
//           <div style={{
//             display: 'flex',
//             gap: 10,
//             width: '100%',
//             marginBottom: 10,
//           }}>
//             {buttons.map((button, index) => (
//               <button
//                 key={index}
//                 style={{
//                   backgroundColor: button.color || theme.colors.primary,
//                   flex: buttons.length > 1 ? 1 : 'unset',
//                   minWidth: buttons.length === 1 ? '100%' : undefined,
//                   padding: '14px 20px',
//                   borderRadius: 12,
//                   border: 'none',
//                   cursor: 'pointer',
//                   color: '#fff',
//                   fontSize: 15,
//                   fontWeight: 600,
//                   display: 'flex',
//                   justifyContent: 'center',
//                   alignItems: 'center',
//                 }}
//                 onClick={() => {
//                   if (button.onPress) button.onPress();
//                   if (button.closeOnPress !== false) onClose();
//                 }}
//               >
//                 {button.icon && <span style={{ marginRight: 6 }}>{button.icon}</span>}
//                 {button.text}
//               </button>
//             ))}
//           </div>
//         )}

//         {/* Default Close Button */}
//         {showCloseButton && buttons.length === 0 && (
//           <button
//             style={{
//               width: '100%',
//               padding: '14px 0',
//               borderRadius: 12,
//               border: 'none',
//               cursor: 'pointer',
//               backgroundColor: getTypeColor(),
//               color: '#fff',
//               fontSize: 16,
//               fontWeight: 'bold',
//             }}
//             onClick={onClose}
//           >
//             {closeButtonText}
//           </button>
//         )}
//       </div>
//     </div>
//   );
// };

// export default GlobalModal;







import React, { useContext } from 'react';
import { ThemeContext } from '../context/ThemeContext';

const GlobalModal = ({
  visible,
  onClose,
  title = 'Notification',
  message = '',
  icon = '⚠️',
  type = 'info', // 'success', 'error', 'warning', 'info'
  buttons = [],
  closeButtonText = 'Close',
  showCloseButton = true,
  onBackdropPress = null,
}) => {
  const { theme } = useContext(ThemeContext);

  if (!visible) return null;

  const getTypeColor = () => {
    switch (type) {
      case 'success':
        return '#4CAF50';
      case 'error':
        return '#F44336';
      case 'warning':
        return '#FF9800';
      case 'info':
        return '#2196F3';
      default:
        return theme.colors.primary;
    }
  };

  const getTypeIcon = () => {
    if (icon !== '⚠️') return icon; // Custom icon provided
    
    switch (type) {
      case 'success':
        return '✅';
      case 'error':
        return '❌';
      case 'warning':
        return '⚠️';
      case 'info':
        return 'ℹ️';
      default:
        return '💬';
    }
  };

  const handleBackdropClick = () => {
    if (onBackdropPress) {
      onBackdropPress();
    } else if (showCloseButton) {
      onClose();
    }
  };

  const modalWidth = Math.min(window.innerWidth - 60, 400);

  return (
    <div
      style={{
        position: 'fixed',
        zIndex: 1000,
        top: 0, left: 0, right: 0, bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.6)',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
      }}
      role="dialog"
      aria-modal="true"
      onClick={handleBackdropClick}
    >
      <div
        style={{
          width: modalWidth,
          borderRadius: 20,
          padding: 24,
          backgroundColor: theme.colors.background,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          boxShadow: '0 4px 8px rgba(0,0,0,0.3)'
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Icon */}
        <div
          style={{
            width: 70,
            height: 70,
            borderRadius: 35,
            backgroundColor: `${getTypeColor()}33`, // 20% opacity
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            marginBottom: 16,
            fontSize: 40,
          }}
          aria-hidden="true"
        >
          {getTypeIcon()}
        </div>
        {/* Title */}
        <h2 style={{
          fontSize: 20,
          fontWeight: 'bold',
          marginBottom: 12,
          textAlign: 'center',
          color: theme.colors.text,
        }}>
          {title}
        </h2>
        {/* Message */}
        <p style={{
          fontSize: 15,
          lineHeight: 1.5,
          textAlign: 'center',
          marginBottom: 24,
          color: theme.colors.textSecondary,
          whiteSpace: 'pre-wrap'
        }}>
          {message}
        </p>

        {/* Custom Buttons */}
        {buttons.length > 0 && (
          <div style={{
            display: 'flex',
            gap: 10,
            width: '100%',
            marginBottom: 10,
          }}>
            {buttons.map((button, index) => (
              <button
                key={index}
                style={{
                  backgroundColor: button.color || theme.colors.primary,
                  flex: buttons.length > 1 ? 1 : 'unset',
                  minWidth: buttons.length === 1 ? '100%' : undefined,
                  padding: '14px 20px',
                  borderRadius: 12,
                  border: 'none',
                  cursor: 'pointer',
                  color: '#fff',
                  fontSize: 15,
                  fontWeight: 600,
                  display: 'flex',
                  justifyContent: 'center',
                  alignItems: 'center',
                }}
                onClick={() => {
                  if (button.onPress) button.onPress();
                  if (button.closeOnPress !== false) onClose();
                }}
              >
                {button.icon && <span style={{ marginRight: 6 }}>{button.icon}</span>}
                {button.text}
              </button>
            ))}
          </div>
        )}

        {/* Default Close Button */}
        {showCloseButton && buttons.length === 0 && (
          <button
            style={{
              width: '100%',
              padding: '14px 0',
              borderRadius: 12,
              border: 'none',
              cursor: 'pointer',
              backgroundColor: getTypeColor(),
              color: '#fff',
              fontSize: 16,
              fontWeight: 'bold',
            }}
            onClick={onClose}
          >
            {closeButtonText}
          </button>
        )}
      </div>
    </div>
  );
};

export default GlobalModal;