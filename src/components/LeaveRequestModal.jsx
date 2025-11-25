// import React, { useState, useContext } from 'react';
// import { ThemeContext } from '../context/ThemeContext';
// import AppButton from './AppButton';

// const LeaveRequestModal = ({ visible, onClose, onSubmit }) => {
//   const { theme } = useContext(ThemeContext);
//   const [leaveType, setLeaveType] = useState('casual');
//   const [startDate, setStartDate] = useState(() => new Date().toISOString().slice(0, 10));
//   const [endDate, setEndDate] = useState('');
//   const [reason, setReason] = useState('');

//   if (!visible) return null;

//   const getTodayISO = () => {
//     return new Date().toISOString().slice(0, 10);
//   };

//   const handleStartDateChange = (e) => {
//     const selectedDate = e.target.value;
//     if (selectedDate < getTodayISO()) {
//       alert('Start date cannot be in the past.');
//       return;
//     }
//     setStartDate(selectedDate);
//     if (endDate && endDate < selectedDate) setEndDate('');
//   };

//   const handleEndDateChange = (e) => {
//     const selectedDate = e.target.value;
//     if (selectedDate < startDate) {
//       alert('End date cannot be before start date.');
//       return;
//     }
//     setEndDate(selectedDate);
//   };

//   const handleSubmit = () => {
//     if (!leaveType.trim()) {
//       alert('Please select a leave type');
//       return;
//     }
//     if (!reason.trim()) {
//       alert('Please provide a reason');
//       return;
//     }

//     const submitData = {
//       leaveType,
//       startDate: new Date(startDate).toISOString(),
//       reason: reason.trim(),
//     };
//     if (endDate) submitData.endDate = new Date(endDate).toISOString();

//     onSubmit(submitData);
//     resetForm();
//   };

//   const resetForm = () => {
//     setLeaveType('casual');
//     setStartDate(getTodayISO());
//     setEndDate('');
//     setReason('');
//   };

//   const handleClose = () => {
//     resetForm();
//     onClose();
//   };

//   const getDaysDifference = () => {
//     if (!endDate) return 1;
//     const diffTime = Math.abs(new Date(endDate) - new Date(startDate));
//     return Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
//   };

//   const leaveTypes = ['casual', 'sick', 'emergency', 'other'];

//   return (
//     <div
//       role="dialog"
//       aria-modal="true"
//       style={{
//         position: 'fixed',
//         inset: 0,
//         backgroundColor: 'rgba(0,0,0,0.6)',
//         display: 'flex',
//         justifyContent: 'center',
//         alignItems: 'center',
//         zIndex: 1000,
//         padding: 16,
//       }}
//       onClick={handleClose}
//     >
//       <div
//         style={{
//           backgroundColor: theme.colors.surface,
//           maxWidth: 420,
//           width: '100%',
//           borderRadius: 16,
//           padding: '40px 20px 20px',
//           position: 'relative',
//           maxHeight: '90%',
//           overflowY: 'auto',
//         }}
//         onClick={(e) => e.stopPropagation()}
//       >
//         {/* Close Button */}
//         <button
//           onClick={handleClose}
//           aria-label="Close leave request modal"
//           style={{
//             position: 'absolute',
//             top: 10,
//             right: 10,
//             zIndex: 10,
//             padding: 8,
//             background: 'transparent',
//             border: 'none',
//             cursor: 'pointer',
//             color: theme.colors.error,
//             fontSize: 20,
//             fontWeight: 'bold',
//           }}
//         >
//           ✖
//         </button>

//         {/* Title */}
//         <h2 style={{
//           fontSize: 22,
//           fontWeight: 'bold',
//           marginBottom: 20,
//           textAlign: 'center',
//           color: theme.colors.text,
//         }}>
//           📝 Apply for Leave
//         </h2>

//         {/* Leave Type */}
//         <section style={{ marginBottom: 16 }}>
//           <label style={{
//             fontSize: 14,
//             fontWeight: 600,
//             marginBottom: 8,
//             display: 'block',
//             color: theme.colors.text,
//           }}>Leave Type *</label>
//           <div style={{
//             display: 'flex',
//             flexWrap: 'wrap',
//             gap: 8,
//           }}>
//             {leaveTypes.map(type => (
//               <button
//                 key={type}
//                 type="button"
//                 onClick={() => setLeaveType(type)}
//                 style={{
//                   padding: '8px 16px',
//                   borderRadius: 20,
//                   border: `1px solid ${theme.colors.border}`,
//                   minWidth: 80,
//                   backgroundColor: leaveType === type ? theme.colors.primary : 'transparent',
//                   color: leaveType === type ? '#fff' : theme.colors.text,
//                   fontWeight: leaveType === type ? 'bold' : 'normal',
//                   cursor: 'pointer',
//                 }}
//               >
//                 {type.charAt(0).toUpperCase() + type.slice(1)}
//               </button>
//             ))}
//           </div>
//         </section>

//         {/* Start Date */}
//         <section style={{ marginBottom: 16 }}>
//           <label style={{ fontSize: 14, fontWeight: 600, color: theme.colors.text, display: 'block', marginBottom: 8 }}>Start Date *</label>
//           <input
//             type="date"
//             value={startDate}
//             min={getTodayISO()}
//             onChange={handleStartDateChange}
//             style={{
//               width: '100%',
//               padding: 12,
//               fontSize: 14,
//               borderRadius: 8,
//               border: `1px solid ${theme.colors.border}`,
//               backgroundColor: theme.colors.background,
//               color: theme.colors.text,
//             }}
//           />
//         </section>

//         {/* End Date */}
//         <section style={{ marginBottom: 16 }}>
//           <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
//             <label style={{ fontSize: 14, fontWeight: 600, color: theme.colors.text }}>End Date (Optional)</label>
//             {endDate && (
//               <button
//                 type="button"
//                 onClick={() => setEndDate('')}
//                 style={{
//                   fontSize: 12,
//                   fontWeight: 500,
//                   color: theme.colors.error,
//                   background: 'transparent',
//                   border: 'none',
//                   cursor: 'pointer',
//                 }}
//               >
//                 Clear
//               </button>
//             )}
//           </div>
//           <input
//             type="date"
//             value={endDate}
//             min={startDate}
//             onChange={handleEndDateChange}
//             style={{
//               width: '100%',
//               padding: 12,
//               fontSize: 14,
//               borderRadius: 8,
//               border: `1px solid ${theme.colors.border}`,
//               backgroundColor: endDate ? theme.colors.surface : theme.colors.background + '80',
//               color: endDate ? theme.colors.text : theme.colors.textSecondary,
//             }}
//           />
//         </section>

//         {/* Duration Info */}
//         {(startDate || endDate) && (
//           <div style={{
//             padding: 12,
//             borderRadius: 8,
//             backgroundColor: theme.colors.primary + '20',
//             margin: '8px 0',
//             textAlign: 'center',
//           }}>
//             <p style={{ fontSize: 14, fontWeight: 600, color: theme.colors.primary, margin: 0 }}>
//               ⏱️ Duration: {getDaysDifference()} day{getDaysDifference() !== 1 ? 's' : ''}
//             </p>
//           </div>
//         )}

//         {/* Reason */}
//         <section style={{ marginBottom: 16 }}>
//           <label htmlFor="reason" style={{ fontSize: 14, fontWeight: 600, color: theme.colors.text, display: 'block', marginBottom: 8 }}>
//             Reason *
//           </label>
//           <textarea
//             id="reason"
//             value={reason}
//             onChange={(e) => setReason(e.target.value)}
//             maxLength={500}
//             rows={4}
//             placeholder="Enter reason..."
//             style={{
//               width: '100%',
//               padding: 12,
//               fontSize: 14,
//               borderRadius: 8,
//               border: `1px solid ${theme.colors.border}`,
//               backgroundColor: theme.colors.background,
//               color: theme.colors.text,
//               resize: 'vertical',
//             }}
//           />
//         </section>

//         <p style={{ fontSize: 12, textAlign: 'right', marginBottom: 16, color: theme.colors.textSecondary }}>
//           {reason.length}/500 characters
//         </p>

//         {/* Buttons */}
//         <AppButton title="Submit Leave Request" onPress={handleSubmit} />
//         <button
//           type="button"
//           onClick={handleClose}
//           style={{
//             marginTop: 8,
//             padding: 14,
//             width: '100%',
//             borderRadius: 8,
//             border: `1px solid ${theme.colors.border}`,
//             backgroundColor: 'transparent',
//             color: theme.colors.textSecondary,
//             fontSize: 16,
//             fontWeight: 600,
//             cursor: 'pointer',
//           }}
//         >
//           Cancel
//         </button>

//         <p style={{ fontSize: 12, textAlign: 'center', marginTop: 12, fontStyle: 'italic', color: theme.colors.textSecondary }}>
//           * Required fields
//         </p>
//       </div>
//     </div>
//   );
// };

// export default LeaveRequestModal;



import React, { useState, useContext } from 'react';
import { ThemeContext } from '../context/ThemeContext';

const LeaveRequestModal = ({ visible, onClose, onSubmit }) => {
  const { theme } = useContext(ThemeContext);
  const [leaveType, setLeaveType] = useState('casual');
  const [startDate, setStartDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [endDate, setEndDate] = useState('');
  const [reason, setReason] = useState('');

  if (!visible) return null;

  const getTodayISO = () => {
    return new Date().toISOString().slice(0, 10);
  };

  const handleStartDateChange = (e) => {
    const selectedDate = e.target.value;
    if (selectedDate < getTodayISO()) {
      alert('Start date cannot be in the past.');
      return;
    }
    setStartDate(selectedDate);
    if (endDate && endDate < selectedDate) setEndDate('');
  };

  const handleEndDateChange = (e) => {
    const selectedDate = e.target.value;
    if (selectedDate < startDate) {
      alert('End date cannot be before start date.');
      return;
    }
    setEndDate(selectedDate);
  };

  const handleSubmit = () => {
    if (!leaveType.trim()) {
      alert('Please select a leave type');
      return;
    }
    if (!reason.trim()) {
      alert('Please provide a reason');
      return;
    }

    const submitData = {
      leaveType,
      startDate: new Date(startDate).toISOString(),
      reason: reason.trim(),
    };
    if (endDate) submitData.endDate = new Date(endDate).toISOString();

    onSubmit(submitData);
    resetForm();
  };

  const resetForm = () => {
    setLeaveType('casual');
    setStartDate(getTodayISO());
    setEndDate('');
    setReason('');
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  const getDaysDifference = () => {
    if (!endDate) return 1;
    const diffTime = Math.abs(new Date(endDate) - new Date(startDate));
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
  };

  const leaveTypes = ['casual', 'sick', 'emergency', 'other'];

  const CustomButton = ({ title, onPress, disabled, style, ...props }) => (
    <button
      onClick={onPress}
      disabled={disabled}
      style={{
        padding: '12px 16px',
        backgroundColor: theme.colors.primary,
        border: 'none',
        borderRadius: 8,
        color: '#fff',
        fontSize: 16,
        fontWeight: '600',
        cursor: disabled ? 'not-allowed' : 'pointer',
        opacity: disabled ? 0.6 : 1,
        ...style,
      }}
      {...props}
    >
      {title}
    </button>
  );

  return (
    <div
      role="dialog"
      aria-modal="true"
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(0,0,0,0.6)',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 1000,
        padding: 16,
      }}
      onClick={handleClose}
    >
      <div
        style={{
          backgroundColor: theme.colors.surface,
          maxWidth: 420,
          width: '100%',
          borderRadius: 16,
          padding: '40px 20px 20px',
          position: 'relative',
          maxHeight: '90%',
          overflowY: 'auto',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          onClick={handleClose}
          aria-label="Close leave request modal"
          style={{
            position: 'absolute',
            top: 10,
            right: 10,
            zIndex: 10,
            padding: 8,
            background: 'transparent',
            border: 'none',
            cursor: 'pointer',
            color: theme.colors.error,
            fontSize: 20,
            fontWeight: 'bold',
          }}
        >
          ✖
        </button>

        {/* Title */}
        <h2 style={{
          fontSize: 22,
          fontWeight: 'bold',
          marginBottom: 20,
          textAlign: 'center',
          color: theme.colors.text,
        }}>
          📝 Apply for Leave
        </h2>

        {/* Leave Type */}
        <section style={{ marginBottom: 16 }}>
          <label style={{
            fontSize: 14,
            fontWeight: 600,
            marginBottom: 8,
            display: 'block',
            color: theme.colors.text,
          }}>Leave Type *</label>
          <div style={{
            display: 'flex',
            flexWrap: 'wrap',
            gap: 8,
          }}>
            {leaveTypes.map(type => (
              <button
                key={type}
                type="button"
                onClick={() => setLeaveType(type)}
                style={{
                  padding: '8px 16px',
                  borderRadius: 20,
                  border: `1px solid ${theme.colors.border}`,
                  minWidth: 80,
                  backgroundColor: leaveType === type ? theme.colors.primary : 'transparent',
                  color: leaveType === type ? '#fff' : theme.colors.text,
                  fontWeight: leaveType === type ? 'bold' : 'normal',
                  cursor: 'pointer',
                }}
              >
                {type.charAt(0).toUpperCase() + type.slice(1)}
              </button>
            ))}
          </div>
        </section>

        {/* Start Date */}
        <section style={{ marginBottom: 16 }}>
          <label style={{ fontSize: 14, fontWeight: 600, color: theme.colors.text, display: 'block', marginBottom: 8 }}>Start Date *</label>
          <input
            type="date"
            value={startDate}
            min={getTodayISO()}
            onChange={handleStartDateChange}
            style={{
              width: '100%',
              padding: 12,
              fontSize: 14,
              borderRadius: 8,
              border: `1px solid ${theme.colors.border}`,
              backgroundColor: theme.colors.background,
              color: theme.colors.text,
            }}
          />
        </section>

        {/* End Date */}
        <section style={{ marginBottom: 16 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <label style={{ fontSize: 14, fontWeight: 600, color: theme.colors.text }}>End Date (Optional)</label>
            {endDate && (
              <button
                type="button"
                onClick={() => setEndDate('')}
                style={{
                  fontSize: 12,
                  fontWeight: 500,
                  color: theme.colors.error,
                  background: 'transparent',
                  border: 'none',
                  cursor: 'pointer',
                }}
              >
                Clear
              </button>
            )}
          </div>
          <input
            type="date"
            value={endDate}
            min={startDate}
            onChange={handleEndDateChange}
            style={{
              width: '100%',
              padding: 12,
              fontSize: 14,
              borderRadius: 8,
              border: `1px solid ${theme.colors.border}`,
              backgroundColor: endDate ? theme.colors.surface : theme.colors.background + '80',
              color: endDate ? theme.colors.text : theme.colors.textSecondary,
            }}
          />
        </section>

        {/* Duration Info */}
        {(startDate || endDate) && (
          <div style={{
            padding: 12,
            borderRadius: 8,
            backgroundColor: theme.colors.primary + '20',
            margin: '8px 0',
            textAlign: 'center',
          }}>
            <p style={{ fontSize: 14, fontWeight: 600, color: theme.colors.primary, margin: 0 }}>
              ⏱️ Duration: {getDaysDifference()} day{getDaysDifference() !== 1 ? 's' : ''}
            </p>
          </div>
        )}

        {/* Reason */}
        <section style={{ marginBottom: 16 }}>
          <label htmlFor="reason" style={{ fontSize: 14, fontWeight: 600, color: theme.colors.text, display: 'block', marginBottom: 8 }}>
            Reason *
          </label>
          <textarea
            id="reason"
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            maxLength={500}
            rows={4}
            placeholder="Enter reason..."
            style={{
              width: '100%',
              padding: 12,
              fontSize: 14,
              borderRadius: 8,
              border: `1px solid ${theme.colors.border}`,
              backgroundColor: theme.colors.background,
              color: theme.colors.text,
              resize: 'vertical',
            }}
          />
        </section>

        <p style={{ fontSize: 12, textAlign: 'right', marginBottom: 16, color: theme.colors.textSecondary }}>
          {reason.length}/500 characters
        </p>

        {/* Buttons */}
        <CustomButton title="Submit Leave Request" onPress={handleSubmit} />
        <button
          type="button"
          onClick={handleClose}
          style={{
            marginTop: 8,
            padding: 14,
            width: '100%',
            borderRadius: 8,
            border: `1px solid ${theme.colors.border}`,
            backgroundColor: 'transparent',
            color: theme.colors.textSecondary,
            fontSize: 16,
            fontWeight: 600,
            cursor: 'pointer',
          }}
        >
          Cancel
        </button>

        <p style={{ fontSize: 12, textAlign: 'center', marginTop: 12, fontStyle: 'italic', color: theme.colors.textSecondary }}>
          * Required fields
        </p>
      </div>
    </div>
  );
};

export default LeaveRequestModal;