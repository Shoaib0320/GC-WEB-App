// import React, { useState, useEffect, useContext } from 'react';
// import { ThemeContext } from '../context/ThemeContext';

// const months = [
//   'January', 'February', 'March', 'April', 'May', 'June',
//   'July', 'August', 'September', 'October', 'November', 'December'
// ];

// const AttendanceSummary = ({ monthlySummary, filter, attendanceHistory }) => {
//   const { theme, isDarkMode } = useContext(ThemeContext);

//   const [currentPage, setCurrentPage] = useState(1);
//   const recordsPerPage = 5;

//   useEffect(() => {
//     setCurrentPage(1);
//   }, [monthlySummary]);

//   const getMonthName = (monthNumber) => months[monthNumber - 1] || '';

//   const getStatusColor = (status) => {
//     switch (status) {
//       case 'present': return theme.colors.success;
//       case 'late': return '#F59E0B';
//       case 'absent': return theme.colors.error;
//       case 'holiday': return '#8B5CF6';
//       case 'weekly_off': return theme.colors.textSecondary;
//       case 'approved_leave':
//       case 'leave': return '#EC4899';
//       default: return theme.colors.textSecondary;
//     }
//   };

//   const getStatusBackgroundColor = (status) => {
//     const color = getStatusColor(status);
//     return isDarkMode ? `${color}20` : `${color}10`;
//   };

//   const getStatusIcon = (status) => {
//     switch (status) {
//       case 'present': return '✅';
//       case 'late': return '⏰';
//       case 'absent': return '❌';
//       case 'holiday': return '🎉';
//       case 'weekly_off': return '🏖️';
//       case 'approved_leave':
//       case 'leave': return '📝';
//       default: return '📅';
//     }
//   };

//   const getStatusText = (status) => {
//     switch (status) {
//       case 'present': return 'Present';
//       case 'late': return 'Late';
//       case 'absent': return 'Absent';
//       case 'holiday': return 'Holiday';
//       case 'weekly_off': return 'Weekly Off';
//       case 'approved_leave': return 'Approved Leave';
//       case 'leave': return 'Leave';
//       default: return status;
//     }
//   };

//   const formatTableDate = (dateString) => {
//     const date = new Date(dateString);
//     return date.toLocaleDateString('en-PK', { day: '2-digit', month: 'short' });
//   };

//   const calculateStats = () => {
//     if (!monthlySummary?.records) return null;

//     const records = monthlySummary.records;
//     const present = records.filter(r => r.status === 'present').length;
//     const late = records.filter(r => r.status === 'late').length;
//     const absent = records.filter(r => r.status === 'absent').length;
//     const holiday = records.filter(r => r.status === 'holiday').length;
//     const weeklyOff = records.filter(r => r.status === 'weekly_off').length;
//     const leave = records.filter(r => r.status === 'leave').length;

//     const workingDays = records.filter(r => !['holiday', 'weekly_off'].includes(r.status)).length;
//     const attendanceRate = workingDays > 0 ? (present / workingDays * 100).toFixed(1) : 0;

//     return {
//       present, late, absent, holiday, weeklyOff, leave,
//       workingDays, totalDays: records.length,
//       attendanceRate: parseFloat(attendanceRate),
//     };
//   };

//   const paginatedRecords = () => {
//     if (!monthlySummary?.records) return [];

//     const startIndex = (currentPage - 1) * recordsPerPage;
//     const endIndex = startIndex + recordsPerPage;
//     return monthlySummary.records.slice(startIndex, endIndex);
//   };

//   const getPerformanceColor = (rate) => {
//     if (rate >= 90) return theme.colors.success;
//     if (rate >= 70) return '#F59E0B';
//     return theme.colors.error;
//   };

//   const stats = calculateStats();
//   const recordsToShow = paginatedRecords();
//   const totalPages = monthlySummary?.records ? Math.ceil(monthlySummary.records.length / recordsPerPage) : 0;

//   const goToPage = (page) => {
//     setCurrentPage(page);
//   };
//   const goToNextPage = () => {
//     if (currentPage < totalPages) setCurrentPage(currentPage + 1);
//   };
//   const goToPrevPage = () => {
//     if (currentPage > 1) setCurrentPage(currentPage - 1);
//   };

//   const getPageNumbers = () => {
//     const pages = [];
//     const maxVisiblePages = 5;

//     if (totalPages <= maxVisiblePages) {
//       for (let i = 1; i <= totalPages; i++) pages.push(i);
//     } else {
//       const startPage = Math.max(1, currentPage - 2);
//       const endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);
//       for (let i = startPage; i <= endPage; i++) pages.push(i);
//     }
//     return pages;
//   };

//   return (
//     <div style={{
//       padding: 20,
//       borderRadius: 16,
//       marginBottom: 20,
//       border: `1px solid ${theme.colors.border}`,
//       backgroundColor: theme.colors.card || theme.colors.surface,
//     }}>
//       <div style={{
//         display: 'flex',
//         justifyContent: 'space-between',
//         alignItems: 'center',
//         marginBottom: 20,
//       }}>
//         <h2 style={{ fontSize: 18, fontWeight: '700', flex: 1, color: theme.colors.text }}>
//           📊 Monthly Summary
//         </h2>
//         {filter && (
//           <div style={{ alignItems: 'flex-end' }}>
//             <p style={{ fontSize: 14, fontWeight: '600', color: theme.colors.primary }}>
//               {getMonthName(filter.month)} {filter.year}
//             </p>
//           </div>
//         )}
//       </div>

//       {monthlySummary && (
//         <>
//           <div style={{
//             display: 'flex',
//             justifyContent: 'space-between',
//             marginBottom: 20,
//           }}>
//             {['present', 'late', 'absent'].map((status) => (
//               <div key={status} style={{ alignItems: 'center', flex: 1, textAlign: 'center' }}>
//                 <div style={{
//                   width: 48, height: 48, borderRadius: 24,
//                   display: 'flex', justifyContent: 'center', alignItems: 'center',
//                   marginBottom: 8,
//                   backgroundColor: getStatusBackgroundColor(status),
//                 }}>
//                   <span style={{ fontSize: 20, color: getStatusColor(status) }}>
//                     {getStatusIcon(status)}
//                   </span>
//                 </div>
//                 <p style={{ fontSize: 20, fontWeight: '700', color: getStatusColor(status), margin: 0 }}>
//                   {stats?.[status] || 0}
//                 </p>
//                 <p style={{ fontSize: 12, textAlign: 'center', color: theme.colors.textSecondary, margin: 0 }}>
//                   {getStatusText(status)}
//                 </p>
//               </div>
//             ))}
//           </div>

//           <div style={{
//             marginTop: 10,
//             paddingTop: 20,
//             borderTop: `1px solid ${theme.colors.border}`,
//           }}>
//             <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
//               <div style={{ flex: 1 }}>
//                 <p style={{ fontSize: 14, marginBottom: 4, fontWeight: '500', color: theme.colors.textSecondary }}>
//                   Working Days:
//                 </p>
//                 <p style={{ fontSize: 16, fontWeight: '600', color: theme.colors.text }}>
//                   {stats?.workingDays || 0}
//                 </p>
//               </div>

//               <div style={{ flex: 1 }}>
//                 <p style={{ fontSize: 14, marginBottom: 4, fontWeight: '500', color: theme.colors.textSecondary }}>
//                   Total Days:
//                 </p>
//                 <p style={{ fontSize: 16, fontWeight: '600', color: theme.colors.text }}>
//                   {stats?.totalDays || 0}
//                 </p>
//               </div>
//             </div>

//             <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
//               <div style={{ flex: 1 }}>
//                 <p style={{ fontSize: 14, marginBottom: 4, fontWeight: '500', color: theme.colors.textSecondary }}>
//                   Attendance Rate:
//                 </p>
//                 <p style={{
//                   fontSize: 16,
//                   fontWeight: 'bold',
//                   color: getPerformanceColor(stats?.attendanceRate || 0),
//                   margin: 0,
//                 }}>
//                   {stats?.attendanceRate || 0}%
//                 </p>
//               </div>

//               <div style={{ flex: 1 }}>
//                 <p style={{ fontSize: 14, marginBottom: 4, fontWeight: '500', color: theme.colors.textSecondary }}>
//                   Holidays:
//                 </p>
//                 <p style={{ fontSize: 16, fontWeight: '600', color: getStatusColor('holiday'), margin: 0 }}>
//                   {stats?.holiday || 0}
//                 </p>
//               </div>
//             </div>
//           </div>

//           {monthlySummary.records && monthlySummary.records.length > 0 && (
//             <>
//               <div style={{
//                 marginTop: 20,
//                 paddingTop: 20,
//                 borderTop: `1px solid ${theme.colors.border}`,
//               }}>
//                 <div style={{
//                   display: 'flex',
//                   justifyContent: 'space-between',
//                   alignItems: 'center',
//                   marginBottom: 12,
//                 }}>
//                   <p style={{ fontSize: 16, fontWeight: '700', color: theme.colors.text }}>
//                     📋 Daily Attendance Records
//                   </p>
//                   <p style={{ fontSize: 12, fontWeight: '500', color: theme.colors.textSecondary }}>
//                     {monthlySummary.records.length} records
//                   </p>
//                 </div>

//                 <div style={{ overflowX: 'auto' }}>
//                   <table style={{ minWidth: '650px', borderCollapse: 'collapse', width: '100%' }}>
//                     <thead style={{ backgroundColor: isDarkMode ? theme.colors.surface : '#F9FAFB' }}>
//                       <tr>
//                         <th style={{ width: '70px', fontSize: 12, fontWeight: '700', textAlign: 'center', padding: '8px' }}>Date</th>
//                         <th style={{ width: '50px', fontSize: 12, fontWeight: '700', textAlign: 'center' }}>Day</th>
//                         <th style={{ width: '80px', fontSize: 12, fontWeight: '700', textAlign: 'center' }}>Check In</th>
//                         <th style={{ width: '80px', fontSize: 12, fontWeight: '700', textAlign: 'center' }}>Check Out</th>
//                         <th style={{ width: '120px', fontSize: 12, fontWeight: '700', textAlign: 'center' }}>Status</th>
//                         <th style={{ width: '150px', fontSize: 12, fontWeight: '700', textAlign: 'left' }}>Remarks</th>
//                       </tr>
//                     </thead>
//                     <tbody>
//                       {recordsToShow.map((record, index) => {
//                         const globalIndex = (currentPage - 1) * recordsPerPage + index;
//                         const rowBg = globalIndex % 2 === 0 ? (isDarkMode ? theme.colors.background + '20' : 'rgba(249, 250, 251, 0.5)') : 'transparent';
//                         return (
//                           <tr key={globalIndex} style={{ backgroundColor: rowBg, minHeight: 50 }}>
//                             <td style={{ padding: '8px', textAlign: 'center', color: theme.colors.text }}>{formatTableDate(record.date)}</td>
//                             <td style={{ padding: '8px', textAlign: 'center', color: theme.colors.text }}>{record.day}</td>
//                             <td style={{ padding: '8px', textAlign: 'center', color: record.checkInTime ? theme.colors.text : theme.colors.textSecondary, fontFamily: 'monospace' }}>
//                               {record.checkInTime || '--:--'}
//                             </td>
//                             <td style={{ padding: '8px', textAlign: 'center', color: record.checkOutTime ? theme.colors.text : theme.colors.textSecondary, fontFamily: 'monospace' }}>
//                               {record.checkOutTime || '--:--'}
//                             </td>
//                             <td style={{ padding: '8px', textAlign: 'center' }}>
//                               <div style={{
//                                 display: 'flex',
//                                 alignItems: 'center',
//                                 justifyContent: 'center',
//                                 padding: '4px 8px',
//                                 borderRadius: 12,
//                                 border: '1px solid',
//                                 borderColor: getStatusColor(record.status),
//                                 alignSelf: 'center',
//                               }}>
//                                 <span style={{ fontSize: 10, marginRight: 4 }}>{getStatusIcon(record.status)}</span>
//                                 <span style={{ fontSize: 10, fontWeight: '700', color: getStatusColor(record.status) }}>{getStatusText(record.status)}</span>
//                               </div>
//                             </td>
//                             <td style={{ padding: '8px', color: theme.colors.textSecondary, textAlign: 'left' }}>
//                               {record.remarks || '-'}
//                             </td>
//                           </tr>
//                         );
//                       })}
//                     </tbody>
//                   </table>
//                 </div>

//                 {totalPages > 1 && (
//                   <div style={{
//                     marginTop: 16,
//                     paddingTop: 16,
//                     borderTop: `1px solid ${theme.colors.border}`,
//                   }}>
//                     <div style={{ textAlign: 'center', marginBottom: 12 }}>
//                       <p style={{ fontSize: 12, fontWeight: '500', color: theme.colors.textSecondary }}>
//                         Showing {((currentPage - 1) * recordsPerPage) + 1} to {Math.min(currentPage * recordsPerPage, monthlySummary.records.length)} of {monthlySummary.records.length} records
//                       </p>
//                     </div>

//                     <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
//                       <button
//                         type="button"
//                         style={{
//                           padding: '8px 12px',
//                           borderRadius: 8,
//                           border: `1px solid ${theme.colors.border}`,
//                           minWidth: 80,
//                           opacity: currentPage === 1 ? 0.5 : 1,
//                           cursor: currentPage === 1 ? 'not-allowed' : 'pointer',
//                           color: currentPage === 1 ? theme.colors.textSecondary : theme.colors.primary,
//                           fontWeight: '600',
//                           fontSize: 12,
//                         }}
//                         onClick={goToPrevPage}
//                         disabled={currentPage === 1}
//                       >
//                         ◀️ Prev
//                       </button>

//                       <div style={{ display: 'flex', alignItems: 'center' }}>
//                         {getPageNumbers().map(page => (
//                           <button
//                             key={page}
//                             type="button"
//                             onClick={() => goToPage(page)}
//                             style={{
//                               width: 32,
//                               height: 32,
//                               borderRadius: 6,
//                               margin: '0 2px',
//                               borderWidth: 1,
//                               borderStyle: 'solid',
//                               borderColor: page === currentPage ? 'transparent' : theme.colors.border,
//                               backgroundColor: page === currentPage ? theme.colors.primary : 'transparent',
//                               color: page === currentPage ? '#FFFFFF' : theme.colors.text,
//                               fontSize: 12,
//                               fontWeight: '600',
//                               cursor: 'pointer',
//                             }}
//                           >
//                             {page}
//                           </button>
//                         ))}
//                       </div>

//                       <button
//                         type="button"
//                         style={{
//                           padding: '8px 12px',
//                           borderRadius: 8,
//                           border: `1px solid ${theme.colors.border}`,
//                           minWidth: 80,
//                           opacity: currentPage === totalPages ? 0.5 : 1,
//                           cursor: currentPage === totalPages ? 'not-allowed' : 'pointer',
//                           color: currentPage === totalPages ? theme.colors.textSecondary : theme.colors.primary,
//                           fontWeight: '600',
//                           fontSize: 12,
//                         }}
//                         onClick={goToNextPage}
//                         disabled={currentPage === totalPages}
//                       >
//                         Next ▶️
//                       </button>
//                     </div>
//                   </div>
//                 )}
//               </div>
//             </>
//           )}
//         </>
//       )}

//       {/* Fallback for attendanceHistory without monthlySummary */}
//       {!monthlySummary && attendanceHistory && (
//         <div style={{ display: 'flex', justifyContent: 'space-between' }}>
//           <div style={{ textAlign: 'center', flex: 1 }}>
//             <p style={{ fontSize: 24, fontWeight: '700', color: theme.colors.primary }}>
//               {attendanceHistory.length}
//             </p>
//             <p style={{ fontSize: 12, color: theme.colors.textSecondary }}>Total Records</p>
//           </div>
//           <div style={{ textAlign: 'center', flex: 1 }}>
//             <p style={{ fontSize: 24, fontWeight: '700', color: theme.colors.success }}>
//               {attendanceHistory.filter(a => a.checkOutTime).length}
//             </p>
//             <p style={{ fontSize: 12, color: theme.colors.textSecondary }}>Completed</p>
//           </div>
//           <div style={{ textAlign: 'center', flex: 1 }}>
//             <p style={{ fontSize: 24, fontWeight: '700', color: '#F59E0B' }}>
//               {attendanceHistory.filter(a => a.isLate).length}
//             </p>
//             <p style={{ fontSize: 12, color: theme.colors.textSecondary }}>Late Days</p>
//           </div>
//         </div>
//       )}

//       {/* No data fallback */}
//       {!monthlySummary && !attendanceHistory && (
//         <div style={{ textAlign: 'center', padding: 40, color: theme.colors.textSecondary }}>
//           <p style={{ fontSize: 48, margin: '0 0 16px' }}>📭</p>
//           <p style={{ fontSize: 16, fontWeight: '600', marginBottom: 8 }}>No attendance data available</p>
//           <p style={{ fontSize: 14, opacity: 0.7 }}>Select a month to view attendance records</p>
//         </div>
//       )}
//     </div>
//   );
// };

// export default AttendanceSummary;


import React, { useState, useEffect, useContext } from 'react';
import { ThemeContext } from '../context/ThemeContext';

const months = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

const AttendanceSummary = ({ monthlySummary, filter, attendanceHistory }) => {
  const { theme, isDarkMode } = useContext(ThemeContext);

  const [currentPage, setCurrentPage] = useState(1);
  const recordsPerPage = 5;

  useEffect(() => {
    setCurrentPage(1);
  }, [monthlySummary]);

  const getMonthName = (monthNumber) => months[monthNumber - 1] || '';

  const getStatusColor = (status) => {
    switch (status) {
      case 'present': return theme.colors.success;
      case 'late': return '#F59E0B';
      case 'absent': return theme.colors.error;
      case 'holiday': return '#8B5CF6';
      case 'weekly_off': return theme.colors.textSecondary;
      case 'approved_leave':
      case 'leave': return '#EC4899';
      default: return theme.colors.textSecondary;
    }
  };

  const getStatusBackgroundColor = (status) => {
    const color = getStatusColor(status);
    return isDarkMode ? `${color}20` : `${color}10`;
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'present': return '✅';
      case 'late': return '⏰';
      case 'absent': return '❌';
      case 'holiday': return '🎉';
      case 'weekly_off': return '🏖️';
      case 'approved_leave':
      case 'leave': return '📝';
      default: return '📅';
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'present': return 'Present';
      case 'late': return 'Late';
      case 'absent': return 'Absent';
      case 'holiday': return 'Holiday';
      case 'weekly_off': return 'Weekly Off';
      case 'approved_leave': return 'Approved Leave';
      case 'leave': return 'Leave';
      default: return status;
    }
  };

  const formatTableDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-PK', { day: '2-digit', month: 'short' });
  };

  const calculateStats = () => {
    if (!monthlySummary?.records) return null;

    const records = monthlySummary.records;
    const present = records.filter(r => r.status === 'present').length;
    const late = records.filter(r => r.status === 'late').length;
    const absent = records.filter(r => r.status === 'absent').length;
    const holiday = records.filter(r => r.status === 'holiday').length;
    const weeklyOff = records.filter(r => r.status === 'weekly_off').length;
    const leave = records.filter(r => r.status === 'leave').length;

    const workingDays = records.filter(r => !['holiday', 'weekly_off'].includes(r.status)).length;
    const attendanceRate = workingDays > 0 ? (present / workingDays * 100).toFixed(1) : 0;

    return {
      present, late, absent, holiday, weeklyOff, leave,
      workingDays, totalDays: records.length,
      attendanceRate: parseFloat(attendanceRate),
    };
  };

  const paginatedRecords = () => {
    if (!monthlySummary?.records) return [];

    const startIndex = (currentPage - 1) * recordsPerPage;
    const endIndex = startIndex + recordsPerPage;
    return monthlySummary.records.slice(startIndex, endIndex);
  };

  const getPerformanceColor = (rate) => {
    if (rate >= 90) return theme.colors.success;
    if (rate >= 70) return '#F59E0B';
    return theme.colors.error;
  };

  const stats = calculateStats();
  const recordsToShow = paginatedRecords();
  const totalPages = monthlySummary?.records ? Math.ceil(monthlySummary.records.length / recordsPerPage) : 0;

  const goToPage = (page) => {
    setCurrentPage(page);
  };
  const goToNextPage = () => {
    if (currentPage < totalPages) setCurrentPage(currentPage + 1);
  };
  const goToPrevPage = () => {
    if (currentPage > 1) setCurrentPage(currentPage - 1);
  };

  const getPageNumbers = () => {
    const pages = [];
    const maxVisiblePages = 5;

    if (totalPages <= maxVisiblePages) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
      const startPage = Math.max(1, currentPage - 2);
      const endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);
      for (let i = startPage; i <= endPage; i++) pages.push(i);
    }
    return pages;
  };

  return (
    <div style={{
      padding: 20,
      borderRadius: 16,
      marginBottom: 20,
      border: `1px solid ${theme.colors.border}`,
      backgroundColor: theme.colors.card || theme.colors.surface,
    }}>
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 20,
      }}>
        <h2 style={{ fontSize: 18, fontWeight: '700', flex: 1, color: theme.colors.text }}>
          📊 Monthly Summary
        </h2>
        {filter && (
          <div style={{ alignItems: 'flex-end' }}>
            <p style={{ fontSize: 14, fontWeight: '600', color: theme.colors.primary }}>
              {getMonthName(filter.month)} {filter.year}
            </p>
          </div>
        )}
      </div>

      {monthlySummary && (
        <>
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            marginBottom: 20,
          }}>
            {['present', 'late', 'absent'].map((status) => (
              <div key={status} style={{ alignItems: 'center', flex: 1, textAlign: 'center' }}>
                <div style={{
                  width: 48, height: 48, borderRadius: 24,
                  display: 'flex', justifyContent: 'center', alignItems: 'center',
                  marginBottom: 8,
                  backgroundColor: getStatusBackgroundColor(status),
                }}>
                  <span style={{ fontSize: 20, color: getStatusColor(status) }}>
                    {getStatusIcon(status)}
                  </span>
                </div>
                <p style={{ fontSize: 20, fontWeight: '700', color: getStatusColor(status), margin: 0 }}>
                  {stats?.[status] || 0}
                </p>
                <p style={{ fontSize: 12, textAlign: 'center', color: theme.colors.textSecondary, margin: 0 }}>
                  {getStatusText(status)}
                </p>
              </div>
            ))}
          </div>

          <div style={{
            marginTop: 10,
            paddingTop: 20,
            borderTop: `1px solid ${theme.colors.border}`,
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
              <div style={{ flex: 1 }}>
                <p style={{ fontSize: 14, marginBottom: 4, fontWeight: '500', color: theme.colors.textSecondary }}>
                  Working Days:
                </p>
                <p style={{ fontSize: 16, fontWeight: '600', color: theme.colors.text }}>
                  {stats?.workingDays || 0}
                </p>
              </div>

              <div style={{ flex: 1 }}>
                <p style={{ fontSize: 14, marginBottom: 4, fontWeight: '500', color: theme.colors.textSecondary }}>
                  Total Days:
                </p>
                <p style={{ fontSize: 16, fontWeight: '600', color: theme.colors.text }}>
                  {stats?.totalDays || 0}
                </p>
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
              <div style={{ flex: 1 }}>
                <p style={{ fontSize: 14, marginBottom: 4, fontWeight: '500', color: theme.colors.textSecondary }}>
                  Attendance Rate:
                </p>
                <p style={{
                  fontSize: 16,
                  fontWeight: 'bold',
                  color: getPerformanceColor(stats?.attendanceRate || 0),
                  margin: 0,
                }}>
                  {stats?.attendanceRate || 0}%
                </p>
              </div>

              <div style={{ flex: 1 }}>
                <p style={{ fontSize: 14, marginBottom: 4, fontWeight: '500', color: theme.colors.textSecondary }}>
                  Holidays:
                </p>
                <p style={{ fontSize: 16, fontWeight: '600', color: getStatusColor('holiday'), margin: 0 }}>
                  {stats?.holiday || 0}
                </p>
              </div>
            </div>
          </div>

          {monthlySummary.records && monthlySummary.records.length > 0 && (
            <>
              <div style={{
                marginTop: 20,
                paddingTop: 20,
                borderTop: `1px solid ${theme.colors.border}`,
              }}>
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  marginBottom: 12,
                }}>
                  <p style={{ fontSize: 16, fontWeight: '700', color: theme.colors.text }}>
                    📋 Daily Attendance Records
                  </p>
                  <p style={{ fontSize: 12, fontWeight: '500', color: theme.colors.textSecondary }}>
                    {monthlySummary.records.length} records
                  </p>
                </div>

                <div style={{ overflowX: 'auto' }}>
                  <table style={{ minWidth: '650px', borderCollapse: 'collapse', width: '100%' }}>
                    <thead style={{ backgroundColor: isDarkMode ? theme.colors.surface : '#F9FAFB' }}>
                      <tr>
                        <th style={{ width: '70px', fontSize: 12, fontWeight: '700', textAlign: 'center', padding: '8px', color: theme.colors.text }}>Date</th>
                        <th style={{ width: '50px', fontSize: 12, fontWeight: '700', textAlign: 'center', color: theme.colors.text }}>Day</th>
                        <th style={{ width: '80px', fontSize: 12, fontWeight: '700', textAlign: 'center', color: theme.colors.text }}>Check In</th>
                        <th style={{ width: '80px', fontSize: 12, fontWeight: '700', textAlign: 'center', color: theme.colors.text }}>Check Out</th>
                        <th style={{ width: '120px', fontSize: 12, fontWeight: '700', textAlign: 'center', color: theme.colors.text }}>Status</th>
                        <th style={{ width: '150px', fontSize: 12, fontWeight: '700', textAlign: 'left', color: theme.colors.text }}>Remarks</th>
                      </tr>
                    </thead>
                    <tbody>
                      {recordsToShow.map((record, index) => {
                        const globalIndex = (currentPage - 1) * recordsPerPage + index;
                        const rowBg = globalIndex % 2 === 0 ? (isDarkMode ? theme.colors.background + '20' : 'rgba(249, 250, 251, 0.5)') : 'transparent';
                        return (
                          <tr key={globalIndex} style={{ backgroundColor: rowBg, minHeight: 50 }}>
                            <td style={{ padding: '8px', textAlign: 'center', color: theme.colors.text }}>{formatTableDate(record.date)}</td>
                            <td style={{ padding: '8px', textAlign: 'center', color: theme.colors.text }}>{record.day}</td>
                            <td style={{ padding: '8px', textAlign: 'center', color: record.checkInTime ? theme.colors.text : theme.colors.textSecondary, fontFamily: 'monospace' }}>
                              {record.checkInTime || '--:--'}
                            </td>
                            <td style={{ padding: '8px', textAlign: 'center', color: record.checkOutTime ? theme.colors.text : theme.colors.textSecondary, fontFamily: 'monospace' }}>
                              {record.checkOutTime || '--:--'}
                            </td>
                            <td style={{ padding: '8px', textAlign: 'center' }}>
                              <div style={{
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                padding: '4px 8px',
                                borderRadius: 12,
                                border: '1px solid',
                                borderColor: getStatusColor(record.status),
                                alignSelf: 'center',
                              }}>
                                <span style={{ fontSize: 10, marginRight: 4 }}>{getStatusIcon(record.status)}</span>
                                <span style={{ fontSize: 10, fontWeight: '700', color: getStatusColor(record.status) }}>{getStatusText(record.status)}</span>
                              </div>
                            </td>
                            <td style={{ padding: '8px', color: theme.colors.textSecondary, textAlign: 'left' }}>
                              {record.remarks || '-'}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>

                {totalPages > 1 && (
                  <div style={{
                    marginTop: 16,
                    paddingTop: 16,
                    borderTop: `1px solid ${theme.colors.border}`,
                  }}>
                    <div style={{ textAlign: 'center', marginBottom: 12 }}>
                      <p style={{ fontSize: 12, fontWeight: '500', color: theme.colors.textSecondary }}>
                        Showing {((currentPage - 1) * recordsPerPage) + 1} to {Math.min(currentPage * recordsPerPage, monthlySummary.records.length)} of {monthlySummary.records.length} records
                      </p>
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <button
                        type="button"
                        style={{
                          padding: '8px 12px',
                          borderRadius: 8,
                          border: `1px solid ${theme.colors.border}`,
                          minWidth: 80,
                          opacity: currentPage === 1 ? 0.5 : 1,
                          cursor: currentPage === 1 ? 'not-allowed' : 'pointer',
                          color: currentPage === 1 ? theme.colors.textSecondary : theme.colors.primary,
                          fontWeight: '600',
                          fontSize: 12,
                          backgroundColor: 'transparent',
                        }}
                        onClick={goToPrevPage}
                        disabled={currentPage === 1}
                      >
                        ◀️ Prev
                      </button>

                      <div style={{ display: 'flex', alignItems: 'center' }}>
                        {getPageNumbers().map(page => (
                          <button
                            key={page}
                            type="button"
                            onClick={() => goToPage(page)}
                            style={{
                              width: 32,
                              height: 32,
                              borderRadius: 6,
                              margin: '0 2px',
                              borderWidth: 1,
                              borderStyle: 'solid',
                              borderColor: page === currentPage ? 'transparent' : theme.colors.border,
                              backgroundColor: page === currentPage ? theme.colors.primary : 'transparent',
                              color: page === currentPage ? '#FFFFFF' : theme.colors.text,
                              fontSize: 12,
                              fontWeight: '600',
                              cursor: 'pointer',
                            }}
                          >
                            {page}
                          </button>
                        ))}
                      </div>

                      <button
                        type="button"
                        style={{
                          padding: '8px 12px',
                          borderRadius: 8,
                          border: `1px solid ${theme.colors.border}`,
                          minWidth: 80,
                          opacity: currentPage === totalPages ? 0.5 : 1,
                          cursor: currentPage === totalPages ? 'not-allowed' : 'pointer',
                          color: currentPage === totalPages ? theme.colors.textSecondary : theme.colors.primary,
                          fontWeight: '600',
                          fontSize: 12,
                          backgroundColor: 'transparent',
                        }}
                        onClick={goToNextPage}
                        disabled={currentPage === totalPages}
                      >
                        Next ▶️
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </>
          )}
        </>
      )}

      {/* Fallback for attendanceHistory without monthlySummary */}
      {!monthlySummary && attendanceHistory && (
        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
          <div style={{ textAlign: 'center', flex: 1 }}>
            <p style={{ fontSize: 24, fontWeight: '700', color: theme.colors.primary }}>
              {attendanceHistory.length}
            </p>
            <p style={{ fontSize: 12, color: theme.colors.textSecondary }}>Total Records</p>
          </div>
          <div style={{ textAlign: 'center', flex: 1 }}>
            <p style={{ fontSize: 24, fontWeight: '700', color: theme.colors.success }}>
              {attendanceHistory.filter(a => a.checkOutTime).length}
            </p>
            <p style={{ fontSize: 12, color: theme.colors.textSecondary }}>Completed</p>
          </div>
          <div style={{ textAlign: 'center', flex: 1 }}>
            <p style={{ fontSize: 24, fontWeight: '700', color: '#F59E0B' }}>
              {attendanceHistory.filter(a => a.isLate).length}
            </p>
            <p style={{ fontSize: 12, color: theme.colors.textSecondary }}>Late Days</p>
          </div>
        </div>
      )}

      {/* No data fallback */}
      {!monthlySummary && !attendanceHistory && (
        <div style={{ textAlign: 'center', padding: 40, color: theme.colors.textSecondary }}>
          <p style={{ fontSize: 48, margin: '0 0 16px' }}>📭</p>
          <p style={{ fontSize: 16, fontWeight: '600', marginBottom: 8 }}>No attendance data available</p>
          <p style={{ fontSize: 14, opacity: 0.7 }}>Select a month to view attendance records</p>
        </div>
      )}
    </div>
  );
};

export default AttendanceSummary;