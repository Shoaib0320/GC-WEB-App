// // components/ui/CustomModal.jsx
// "use client";
// import React from 'react';
// import { X } from 'lucide-react';

// const CustomModal = ({ 
//   isOpen, 
//   onClose, 
//   title, 
//   description, 
//   children, 
//   size = 'md',
//   preventClose = false 
// }) => {
//   if (!isOpen) return null;

//   const sizeClasses = {
//     sm: 'max-w-md',
//     md: 'max-w-2xl', 
//     lg: 'max-w-4xl',
//     xl: 'max-w-6xl'
//   };

//   const handleBackdropClick = (e) => {
//     if (e.target === e.currentTarget && !preventClose) {
//       onClose();
//     }
//   };

//   const handleKeyDown = (e) => {
//     if (e.key === 'Escape' && !preventClose) {
//       onClose();
//     }
//   };

//   React.useEffect(() => {
//     if (isOpen) {
//       document.addEventListener('keydown', handleKeyDown);
//       document.body.style.overflow = 'hidden';
//     }

//     return () => {
//       document.removeEventListener('keydown', handleKeyDown);
//       document.body.style.overflow = 'unset';
//     };
//   }, [isOpen, preventClose]);

//   return (
//     <div 
//       className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4"
//       onClick={handleBackdropClick}
//     >
//       <div 
//         className={`bg-white rounded-lg shadow-lg w-full ${sizeClasses[size]} max-h-[90vh] overflow-y-auto`}
//         onClick={(e) => e.stopPropagation()}
//       >
//         {/* Header */}
//         <div className="flex items-center justify-between p-6 border-b">
//           <div>
//             <h2 className="text-xl font-semibold">{title}</h2>
//             {description && (
//               <p className="text-sm text-gray-600 mt-1">{description}</p>
//             )}
//           </div>
//           {!preventClose && (
//             <button
//               onClick={onClose}
//               className="rounded-full p-2 hover:bg-gray-100 transition-colors"
//             >
//               <X className="h-5 w-5" />
//             </button>
//           )}
//         </div>

//         {/* Content */}
//         <div className="p-6">
//           {children}
//         </div>
//       </div>
//     </div>
//   );
// };

// export default CustomModal;

// components/ui/CustomModal.jsx
"use client";
import React, { useEffect, useCallback } from 'react';
import { X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const CustomModal = ({ 
  isOpen, 
  onClose, 
  title, 
  description, 
  children, 
  size = 'md',
  preventClose = false 
}) => {
  const sizeClasses = {
    sm: 'max-w-md',
    md: 'max-w-2xl', 
    lg: 'max-w-4xl',
    xl: 'max-w-6xl',
    full: 'max-w-full mx-4'
  };

  const handleBackdropClick = useCallback((e) => {
    if (e.target === e.currentTarget && !preventClose) {
      onClose();
    }
  }, [onClose, preventClose]);

  const handleKeyDown = useCallback((e) => {
    if (e.key === 'Escape' && !preventClose) {
      onClose();
    }
  }, [onClose, preventClose]);

  useEffect(() => {
    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'hidden';
      document.body.style.paddingRight = '0px'; // Scrollbar compensation
    } else {
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'unset';
      document.body.style.paddingRight = '0px';
    };
  }, [isOpen, handleKeyDown]);

  // Modal animations
  const backdropVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1 }
  };

  const modalVariants = {
    hidden: { 
      opacity: 0,
      scale: 0.9,
      y: 20
    },
    visible: { 
      opacity: 1,
      scale: 1,
      y: 0,
      transition: {
        type: "spring",
        damping: 25,
        stiffness: 300
      }
    }
  };

  return (
    <AnimatePresence mode="wait">
      {isOpen && (
        <motion.div
          className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4"
          onClick={handleBackdropClick}
          initial="hidden"
          animate="visible"
          exit="hidden"
          variants={backdropVariants}
        >
          <motion.div 
            className={`bg-white rounded-lg shadow-xl w-full ${sizeClasses[size]} max-h-[90vh] overflow-hidden flex flex-col`}
            onClick={(e) => e.stopPropagation()}
            initial="hidden"
            animate="visible"
            exit="hidden"
            variants={modalVariants}
          >
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b bg-white sticky top-0 z-10">
              <div className="flex-1 min-w-0">
                <h2 className="text-xl font-semibold text-gray-900 truncate">
                  {title}
                </h2>
                {description && (
                  <p className="text-sm text-gray-600 mt-1 line-clamp-2">
                    {description}
                  </p>
                )}
              </div>
              {!preventClose && (
                <button
                  onClick={onClose}
                  className="flex-shrink-0 ml-4 rounded-full p-2 hover:bg-gray-100 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                  aria-label="Close modal"
                >
                  <X className="h-5 w-5 text-gray-500" />
                </button>
              )}
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-6 bg-gray-50">
              {children}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default React.memo(CustomModal);