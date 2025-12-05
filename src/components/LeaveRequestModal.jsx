// import React, { useState, useContext } from 'react';
// import { ThemeContext } from '../context/ThemeContext';

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

//   const CustomButton = ({ title, onPress, disabled, style, ...props }) => (
//     <button
//       onClick={onPress}
//       disabled={disabled}
//       style={{
//         padding: '12px 16px',
//         backgroundColor: theme.colors.primary,
//         border: 'none',
//         borderRadius: 8,
//         color: '#fff',
//         fontSize: 16,
//         fontWeight: '600',
//         cursor: disabled ? 'not-allowed' : 'pointer',
//         opacity: disabled ? 0.6 : 1,
//         ...style,
//       }}
//       {...props}
//     >
//       {title}
//     </button>
//   );

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
//         <CustomButton title="Submit Leave Request" onPress={handleSubmit} />
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



// components/web/LeaveRequestModal.jsx - FULLY RESPONSIVE SHADCN UI VERSION
import React, { useState, useCallback, useRef, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";

const LeaveRequestModal = ({ visible, onClose, onSubmit }) => {
  const [leaveType, setLeaveType] = useState('casual');
  const [startDate, setStartDate] = useState(() => {
    const today = new Date();
    return today.toISOString().split('T')[0];
  });
  const [endDate, setEndDate] = useState('');
  const reasonRef = useRef(null);
  const badgeRef = useRef(null);
  const [hasReason, setHasReason] = useState(false);

  useEffect(() => {
    if (visible && reasonRef.current) {
      reasonRef.current.focus();
    }
  }, [visible]);

  const getTodayISO = () => {
    return new Date().toISOString().split('T')[0];
  };

  const handleStartDateChange = (e) => {
    const selectedDate = e.target.value;
    if (selectedDate < getTodayISO()) {
      alert('Start date cannot be in the past.');
      return;
    }
    setStartDate(selectedDate);
    if (endDate && endDate < selectedDate) {
      setEndDate('');
    }
  };

  const handleEndDateChange = (e) => {
    const selectedDate = e.target.value;
    if (selectedDate && selectedDate < startDate) {
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
    const reasonValue = reasonRef.current?.value?.trim();
    if (!reasonValue) {
      alert('Please provide a reason');
      return;
    }

    const submitData = {
      leaveType,
      startDate,
      reason: reasonValue,
    };

    if (endDate && endDate !== startDate) {
      submitData.endDate = endDate;
    }

    console.log('Submitting leave data:', submitData);
    onSubmit(submitData);
    resetForm();
  };

  const resetForm = () => {
    setLeaveType('casual');
    setStartDate(getTodayISO());
    setEndDate('');
    setHasReason(false);
    if (reasonRef.current) {
      reasonRef.current.value = '';
    }
    if (badgeRef.current) {
      badgeRef.current.textContent = '0/500';
    }
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  const getDaysDifference = () => {
    if (!endDate) return 1;
    
    const start = new Date(startDate);
    const end = new Date(endDate);
    const diffTime = Math.abs(end - start);
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
  };

  const leaveTypes = [
    { value: 'casual', label: 'Casual', icon: '🌴' },
    { value: 'sick', label: 'Sick', icon: '🤒' },
    { value: 'emergency', label: 'Emergency', icon: '🚨' },
    { value: 'other', label: 'Other', icon: '📝' }
  ];

  const getLeaveTypeColor = (type) => {
    const colors = {
      casual: "bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-100",
      sick: "bg-orange-50 text-orange-700 border-orange-200 hover:bg-orange-100",
      emergency: "bg-red-50 text-red-700 border-red-200 hover:bg-red-100",
      other: "bg-gray-50 text-gray-700 border-gray-200 hover:bg-gray-100"
    };
    return colors[type] || colors.other;
  };

  return (
    <Dialog open={visible} onOpenChange={handleClose}>
      <DialogContent className="
        w-[95vw] 
        max-w-lg 
        max-h-[90vh] 
        sm:max-h-[85vh]
        md:max-w-2xl
        lg:max-w-3xl
        p-4 
        sm:p-6
      ">
        <DialogHeader className="pb-4 border-b">
          <DialogTitle className="flex items-center gap-3 text-xl sm:text-2xl font-bold">
            <div className="flex items-center justify-center w-10 h-10 bg-primary/10 rounded-full">
              📝
            </div>
            Apply for Leave
          </DialogTitle>
        </DialogHeader>

        <ScrollArea className="h-auto max-h-[60vh] sm:max-h-[50vh] pr-4">
          <div className="grid gap-6 py-4">
            {/* Leave Type Section */}
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <Label htmlFor="leaveType" className="text-base font-semibold">
                  Leave Type
                </Label>
                <Badge variant="destructive" className="text-xs">
                  Required
                </Badge>
              </div>
              
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {leaveTypes.map((type) => (
                  <Button
                    key={type.value}
                    type="button"
                    variant={leaveType === type.value ? "default" : "outline"}
                    size="sm"
                    onClick={() => setLeaveType(type.value)}
                    className={`
                      h-16 sm:h-20
                      flex flex-col gap-1
                      transition-all duration-200
                      ${leaveType === type.value 
                        ? "bg-primary text-primary-foreground shadow-md scale-95" 
                        : "hover:scale-105"
                      }
                    `}
                  >
                    <span className="text-lg">{type.icon}</span>
                    <span className="text-xs font-medium whitespace-nowrap">
                      {type.label}
                    </span>
                  </Button>
                ))}
              </div>
            </div>

            {/* Dates Section */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Start Date */}
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <Label htmlFor="startDate" className="text-base font-semibold">
                    Start Date
                  </Label>
                  <Badge variant="destructive" className="text-xs">
                    Required
                  </Badge>
                </div>
                <div className="relative">
                  <Input
                    id="startDate"
                    type="date"
                    value={startDate}
                    min={getTodayISO()}
                    onChange={handleStartDateChange}
                    className="h-12 text-base"
                  />
                </div>
                <p className="text-xs text-muted-foreground">
                  Select the first day of your leave
                </p>
              </div>

              {/* End Date */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <Label htmlFor="endDate" className="text-base font-semibold">
                    End Date
                  </Label>
                  <Badge variant="secondary" className="text-xs">
                    Optional
                  </Badge>
                </div>
                <div className="space-y-2">
                  <div className="flex gap-2">
                    <Input
                      id="endDate"
                      type="date"
                      value={endDate}
                      min={startDate}
                      onChange={handleEndDateChange}
                      className="h-12 text-base flex-1"
                      placeholder="Select end date"
                    />
                    {endDate && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setEndDate('')}
                        className="h-12 px-4 border-destructive text-destructive hover:bg-destructive/10"
                      >
                        Clear
                      </Button>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Leave empty for single day leave
                  </p>
                </div>
              </div>
            </div>

            {/* Duration Info */}
            <Card className={`border-2 ${!endDate ? 'border-blue-200 bg-blue-50' : 'border-green-200 bg-green-50'}`}>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-full ${!endDate ? 'bg-blue-100' : 'bg-green-100'}`}>
                      <span className="text-lg">
                        {!endDate ? '📅' : '⏱️'}
                      </span>
                    </div>
                    <div>
                      <p className="font-semibold text-base">
                        {getDaysDifference()} day{getDaysDifference() !== 1 ? 's' : ''}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {!endDate ? 'Single day leave' : 'Multiple days leave'}
                      </p>
                    </div>
                  </div>
                  <Badge 
                    variant={!endDate ? "secondary" : "default"}
                    className="text-xs"
                  >
                    {!endDate ? '1 Day' : `${getDaysDifference()} Days`}
                  </Badge>
                </div>
              </CardContent>
            </Card>

            {/* Reason Section */}
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <Label htmlFor="reason" className="text-base font-semibold">
                  Reason for Leave
                </Label>
                <Badge variant="destructive" className="text-xs">
                  Required
                </Badge>
              </div>
              
              <div className="space-y-3">
                <textarea
                  ref={reasonRef}
                  id="reason"
                  placeholder="Please provide a detailed reason for your leave request..."
                  maxLength={500}
                  rows={5}
                  onInput={(e) => {
                    const length = e.target.value.length;
                    if (badgeRef.current) {
                      badgeRef.current.textContent = `${length}/500`;
                    }
                    setHasReason(length > 0);
                  }}
                  className="w-full min-h-[120px] resize-vertical text-base p-3 border border-input bg-background rounded-md focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                />

                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2">
                  <p className="text-sm text-muted-foreground">
                    Please be specific about your leave reason
                  </p>
                  <div className="flex items-center gap-2">
                    <div
                      ref={badgeRef}
                      className="inline-flex items-center rounded-md border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 border-transparent bg-secondary text-secondary-foreground hover:bg-secondary/80"
                    >
                      0/500
                    </div>
                    <span className="text-xs text-muted-foreground">
                      characters
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </ScrollArea>

        {/* Action Buttons */}
        <div className="flex flex-col-reverse sm:flex-row gap-3 pt-4 border-t mt-4">
          <Button 
            variant="outline" 
            onClick={handleClose}
            className="flex-1 h-12 text-base sm:order-1 order-2"
          >
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            className="flex-1 h-12 text-base font-semibold sm:order-2 order-1"
            disabled={!hasReason}
          >
            <span className="flex items-center gap-2">
              📨 Submit Leave Request
            </span>
          </Button>
        </div>

        {/* Footer Note */}
        <div className="text-center pt-2">
          <p className="text-xs text-muted-foreground">
            Your leave request will be reviewed by management
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default LeaveRequestModal;