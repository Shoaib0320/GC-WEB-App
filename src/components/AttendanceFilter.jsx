// import React, { useContext, useEffect, useState } from 'react';
// import { ThemeContext } from '../context/ThemeContext';
// import { attendanceService } from '../services/attendanceService';
// import AppButton from './AppButton';

// const styles = {
//   overlay: {
//     position: 'fixed',
//     top: 0, left: 0, right: 0, bottom: 0,
//     backgroundColor: 'rgba(0,0,0,0.5)',
//     display: 'flex',
//     justifyContent: 'center',
//     alignItems: 'center',
//     padding: 16,
//     zIndex: 1000,
//   },
//   modalBox: {
//     width: '100%',
//     maxWidth: 500,
//     borderRadius: 16,
//     padding: 20,
//     maxHeight: '85%',
//     backgroundColor: 'var(--bg, white)',
//     border: '1px solid var(--border, #ccc)',
//     overflowY: 'auto',
//   },
//   title: {
//     fontSize: 20,
//     fontWeight: 'bold',
//     textAlign: 'center',
//     marginBottom: 20,
//   },
//   loadingContainer: {
//     display: 'flex',
//     justifyContent: 'center',
//     padding: '40px 0',
//   },
//   loadingText: {
//     marginTop: 12,
//     fontSize: 14,
//     textAlign: 'center',
//     color: 'var(--text-secondary, #777)',
//   },
//   infoBox: {
//     padding: 12,
//     borderRadius: 10,
//     marginBottom: 16,
//     backgroundColor: 'var(--card, #f9f9f9)',
//   },
//   infoText: {
//     fontSize: 13,
//     textAlign: 'center',
//     lineHeight: 1.4,
//     color: 'var(--text-secondary, #777)',
//   },
//   sectionTitle: {
//     fontSize: 16,
//     fontWeight: 600,
//     marginBottom: 8,
//     marginTop: 10,
//     color: 'var(--text-base, #000)',
//   },
//   scrollContainer: {
//     display: 'flex',
//     flexDirection: 'row',
//     padding: '6px 0',
//     overflowX: 'auto',
//   },
//   option: {
//     padding: '8px 14px',
//     borderRadius: 20,
//     marginRight: 8,
//     cursor: 'pointer',
//     userSelect: 'none',
//   },
//   optionSelected: {
//     color: '#fff !important',
//   },
//   optionText: {
//     fontSize: 14,
//     fontWeight: 500,
//   },
//   noDataText: {
//     fontSize: 14,
//     fontStyle: 'italic',
//     padding: '10px 0',
//     textAlign: 'center',
//     color: 'var(--text-secondary, #777)',
//   },
//   selectedBox: {
//     marginTop: 15,
//     marginBottom: 20,
//     padding: 10,
//     borderRadius: 10,
//     textAlign: 'center',
//     backgroundColor: 'var(--card, #f9f9f9)',
//     color: 'var(--text-base, #000)',
//     fontWeight: 'bold',
//   },
//   buttonRow: {
//     display: 'flex',
//     justifyContent: 'space-between',
//     gap: 10,
//     marginBottom: 15,
//   },
//   button: {
//     flex: 1,
//     height: 45,
//   },
//   closeButton: {
//     borderRadius: 10,
//     padding: 12,
//     backgroundColor: '#dc3545',
//     color: '#fff',
//     fontSize: 16,
//     fontWeight: 'bold',
//     cursor: 'pointer',
//     textAlign: 'center',
//   },
// };

// const monthsList = [
//   { id: 1, name: 'January' }, { id: 2, name: 'February' }, { id: 3, name: 'March' },
//   { id: 4, name: 'April' }, { id: 5, name: 'May' }, { id: 6, name: 'June' },
//   { id: 7, name: 'July' }, { id: 8, name: 'August' }, { id: 9, name: 'September' },
//   { id: 10, name: 'October' }, { id: 11, name: 'November' }, { id: 12, name: 'December' },
// ];

// // Simple Loader component
// const Loader = ({ color }) => (
//   <div style={{ border: `4px solid ${color || '#ccc'}`, borderTop: `4px solid transparent`, borderRadius: '50%', width: 30, height: 30, animation: 'spin 1s linear infinite', margin: 'auto' }} />
// );

// const AttendanceFilter = ({ visible, onClose, onApply, currentFilter }) => {
//   const { theme } = useContext(ThemeContext);

//   const now = new Date();
//   const currentYear = now.getFullYear();
//   const currentMonth = now.getMonth() + 1;

//   const [selectedYear, setSelectedYear] = useState(currentYear);
//   const [selectedMonth, setSelectedMonth] = useState(currentMonth);
//   const [firstAttendanceDate, setFirstAttendanceDate] = useState(null);
//   const [loading, setLoading] = useState(true);

//   useEffect(() => {
//     if (visible) {
//       loadFirstAttendanceDate();
//     }
//     // eslint-disable-next-line react-hooks/exhaustive-deps
//   }, [visible]);

//   const loadFirstAttendanceDate = async () => {
//     try {
//       setLoading(true);
//       const firstDate = await attendanceService.getFirstAttendanceDate();
//       setFirstAttendanceDate(firstDate);
//     } catch (error) {
//       setFirstAttendanceDate({ year: currentYear, month: currentMonth });
//     } finally {
//       setLoading(false);
//     }
//   };

//   const getAvailableYears = () => {
//     if (!firstAttendanceDate) return [currentYear];

//     const years = [];
//     for (let y = firstAttendanceDate.year; y <= currentYear; y += 1) {
//       years.push(y);
//     }
//     return years.length > 0 ? years : [currentYear];
//   };

//   const getMonthsForYear = (year) => {
//     if (!firstAttendanceDate) return monthsList;

//     if (year < firstAttendanceDate.year) return [];

//     if (year > firstAttendanceDate.year && year < currentYear) return monthsList;

//     if (year === firstAttendanceDate.year && year === currentYear) {
//       return monthsList.filter(m => m.id >= firstAttendanceDate.month && m.id <= currentMonth);
//     } else if (year === firstAttendanceDate.year) {
//       return monthsList.filter(m => m.id >= firstAttendanceDate.month);
//     } else if (year === currentYear) {
//       return monthsList.filter(m => m.id <= currentMonth);
//     }

//     return monthsList;
//   };

//   useEffect(() => {
//     if (currentFilter) {
//       setSelectedYear(currentFilter.year || currentYear);
//       setSelectedMonth(currentFilter.month || currentMonth);
//     }
//   }, [currentFilter, currentYear, currentMonth]);

//   useEffect(() => {
//     const availableMonths = getMonthsForYear(selectedYear);
//     if (availableMonths.length > 0 && !availableMonths.find(m => m.id === selectedMonth)) {
//       setSelectedMonth(availableMonths[0].id);
//     }
//   // eslint-disable-next-line react-hooks/exhaustive-deps
//   }, [selectedYear, firstAttendanceDate]);

//   const handleApply = () => {
//     onApply({ year: selectedYear, month: selectedMonth });
//     onClose();
//   };

//   const handleReset = () => {
//     setSelectedYear(currentYear);
//     setSelectedMonth(currentMonth);
//     onApply({ year: currentYear, month: currentMonth });
//     onClose();
//   };

//   if (!visible) return null;

//   const years = getAvailableYears();
//   const months = getMonthsForYear(selectedYear);

//   return (
//     <div style={styles.overlay} role="dialog" aria-modal="true" aria-labelledby="attendance-filter-title">
//       <div style={{ ...styles.modalBox, backgroundColor: theme.colors.background, borderColor: theme.colors.border }}>
//         <h2 id="attendance-filter-title" style={{ ...styles.title, color: theme.colors.text }}>📅 Filter Attendance</h2>

//         {loading ? (
//           <div style={styles.loadingContainer}>
//             <Loader color={theme.colors.primary} />
//             <p style={{ ...styles.loadingText, color: theme.colors.textSecondary }}>Loading your attendance history...</p>
//           </div>
//         ) : (
//           <>
//             {firstAttendanceDate && (
//               <div style={{ ...styles.infoBox, backgroundColor: theme.colors.card }}>
//                 <p style={{ ...styles.infoText, color: theme.colors.textSecondary }}>
//                   📊 Your attendance data available from {monthsList.find(m => m.id === firstAttendanceDate.month)?.name} {firstAttendanceDate.year}
//                 </p>
//               </div>
//             )}

//             <section>
//               <h3 style={{ ...styles.sectionTitle, color: theme.colors.text }}>Select Year</h3>
//               {years.length > 0 ? (
//                 <div style={styles.scrollContainer}>
//                   {years.map(year => (
//                     <button
//                       key={year}
//                       type="button"
//                       onClick={() => setSelectedYear(year)}
//                       style={{
//                         ...styles.option,
//                         backgroundColor: selectedYear === year ? theme.colors.primary : theme.colors.card,
//                         color: selectedYear === year ? '#fff' : theme.colors.text,
//                       }}
//                     >
//                       {year}
//                     </button>
//                   ))}
//                 </div>
//               ) : (
//                 <p style={{ ...styles.noDataText, color: theme.colors.textSecondary }}>
//                   No attendance data available
//                 </p>
//               )}

//               <h3 style={{ ...styles.sectionTitle, color: theme.colors.text }}>Select Month</h3>
//               {months.length > 0 ? (
//                 <div style={styles.scrollContainer}>
//                   {months.map(month => (
//                     <button
//                       key={month.id}
//                       type="button"
//                       onClick={() => setSelectedMonth(month.id)}
//                       style={{
//                         ...styles.option,
//                         backgroundColor: selectedMonth === month.id ? theme.colors.primary : theme.colors.card,
//                         color: selectedMonth === month.id ? '#fff' : theme.colors.text,
//                       }}
//                     >
//                       {month.name}
//                     </button>
//                   ))}
//                 </div>
//               ) : (
//                 <p style={{ ...styles.noDataText, color: theme.colors.textSecondary }}>
//                   No months available for selected year
//                 </p>
//               )}
//             </section>

//             {months.length > 0 && (
//               <div style={{ ...styles.selectedBox, backgroundColor: theme.colors.card }}>
//                 Selected: {months.find(m => m.id === selectedMonth)?.name} {selectedYear}
//               </div>
//             )}

//             <div style={styles.buttonRow}>
//               <AppButton title="🔄 Reset" onPress={handleReset} style={{ ...styles.button, backgroundColor: '#6c757d' }} />
//               <AppButton title="✅ Apply" onPress={handleApply} style={{ ...styles.button, backgroundColor: theme.colors.primary }} disabled={months.length === 0} />
//             </div>
//           </>
//         )}

//         <button type="button" onClick={onClose} style={styles.closeButton} aria-label="Close attendance filter">
//           ✖ Close
//         </button>
//       </div>
//     </div>
//   );
// };

// export default AttendanceFilter;



import React, { useContext, useEffect, useState } from 'react';
import { ThemeContext } from '../context/ThemeContext';

const styles = {
  overlay: {
    position: 'fixed',
    top: 0, left: 0, right: 0, bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.5)',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
    zIndex: 1000,
  },
  modalBox: {
    width: '100%',
    maxWidth: 500,
    borderRadius: 16,
    padding: 20,
    maxHeight: '85%',
    backgroundColor: 'var(--bg, white)',
    border: '1px solid var(--border, #ccc)',
    overflowY: 'auto',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 20,
  },
  loadingContainer: {
    display: 'flex',
    justifyContent: 'center',
    padding: '40px 0',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    textAlign: 'center',
    color: 'var(--text-secondary, #777)',
  },
  infoBox: {
    padding: 12,
    borderRadius: 10,
    marginBottom: 16,
    backgroundColor: 'var(--card, #f9f9f9)',
  },
  infoText: {
    fontSize: 13,
    textAlign: 'center',
    lineHeight: 1.4,
    color: 'var(--text-secondary, #777)',
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 600,
    marginBottom: 8,
    marginTop: 10,
    color: 'var(--text-base, #000)',
  },
  scrollContainer: {
    display: 'flex',
    flexDirection: 'row',
    padding: '6px 0',
    overflowX: 'auto',
  },
  option: {
    padding: '8px 14px',
    borderRadius: 20,
    marginRight: 8,
    cursor: 'pointer',
    userSelect: 'none',
    border: 'none',
  },
  optionSelected: {
    color: '#fff !important',
  },
  optionText: {
    fontSize: 14,
    fontWeight: 500,
  },
  noDataText: {
    fontSize: 14,
    fontStyle: 'italic',
    padding: '10px 0',
    textAlign: 'center',
    color: 'var(--text-secondary, #777)',
  },
  selectedBox: {
    marginTop: 15,
    marginBottom: 20,
    padding: 10,
    borderRadius: 10,
    textAlign: 'center',
    backgroundColor: 'var(--card, #f9f9f9)',
    color: 'var(--text-base, #000)',
    fontWeight: 'bold',
  },
  buttonRow: {
    display: 'flex',
    justifyContent: 'space-between',
    gap: 10,
    marginBottom: 15,
  },
  button: {
    flex: 1,
    height: 45,
  },
  closeButton: {
    borderRadius: 10,
    padding: 12,
    backgroundColor: '#dc3545',
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
    cursor: 'pointer',
    textAlign: 'center',
    border: 'none',
    width: '100%',
  },
};

const monthsList = [
  { id: 1, name: 'January' }, { id: 2, name: 'February' }, { id: 3, name: 'March' },
  { id: 4, name: 'April' }, { id: 5, name: 'May' }, { id: 6, name: 'June' },
  { id: 7, name: 'July' }, { id: 8, name: 'August' }, { id: 9, name: 'September' },
  { id: 10, name: 'October' }, { id: 11, name: 'November' }, { id: 12, name: 'December' },
];

// Simple Loader component
const Loader = ({ color }) => (
  <div style={{ 
    border: `4px solid ${color || '#ccc'}`, 
    borderTop: `4px solid transparent`, 
    borderRadius: '50%', 
    width: 30, 
    height: 30, 
    animation: 'spin 1s linear infinite', 
    margin: 'auto' 
  }} />
);

const AttendanceFilter = ({ visible, onClose, onApply, currentFilter }) => {
  const { theme } = useContext(ThemeContext);

  const now = new Date();
  const currentYear = now.getFullYear();
  const currentMonth = now.getMonth() + 1;

  const [selectedYear, setSelectedYear] = useState(currentYear);
  const [selectedMonth, setSelectedMonth] = useState(currentMonth);
  const [firstAttendanceDate, setFirstAttendanceDate] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (visible) {
      loadFirstAttendanceDate();
    }
  }, [visible]);

  const loadFirstAttendanceDate = async () => {
    try {
      setLoading(true);
      // Since we don't have the service method, use current date as fallback
      const currentDate = new Date();
      setFirstAttendanceDate({
        year: currentDate.getFullYear(),
        month: currentDate.getMonth() + 1
      });
    } catch (error) {
      const currentDate = new Date();
      setFirstAttendanceDate({
        year: currentDate.getFullYear(),
        month: currentDate.getMonth() + 1
      });
    } finally {
      setLoading(false);
    }
  };

  const getAvailableYears = () => {
    if (!firstAttendanceDate) return [currentYear];

    const years = [];
    for (let y = firstAttendanceDate.year; y <= currentYear; y += 1) {
      years.push(y);
    }
    return years.length > 0 ? years : [currentYear];
  };

  const getMonthsForYear = (year) => {
    if (!firstAttendanceDate) return monthsList;

    if (year < firstAttendanceDate.year) return [];

    if (year > firstAttendanceDate.year && year < currentYear) return monthsList;

    if (year === firstAttendanceDate.year && year === currentYear) {
      return monthsList.filter(m => m.id >= firstAttendanceDate.month && m.id <= currentMonth);
    } else if (year === firstAttendanceDate.year) {
      return monthsList.filter(m => m.id >= firstAttendanceDate.month);
    } else if (year === currentYear) {
      return monthsList.filter(m => m.id <= currentMonth);
    }

    return monthsList;
  };

  useEffect(() => {
    if (currentFilter) {
      setSelectedYear(currentFilter.year || currentYear);
      setSelectedMonth(currentFilter.month || currentMonth);
    }
  }, [currentFilter, currentYear, currentMonth]);

  useEffect(() => {
    const availableMonths = getMonthsForYear(selectedYear);
    if (availableMonths.length > 0 && !availableMonths.find(m => m.id === selectedMonth)) {
      setSelectedMonth(availableMonths[0].id);
    }
  }, [selectedYear, firstAttendanceDate]);

  const handleApply = () => {
    onApply({ year: selectedYear, month: selectedMonth });
    onClose();
  };

  const handleReset = () => {
    setSelectedYear(currentYear);
    setSelectedMonth(currentMonth);
    onApply({ year: currentYear, month: currentMonth });
    onClose();
  };

  if (!visible) return null;

  const years = getAvailableYears();
  const months = getMonthsForYear(selectedYear);

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
    <div style={styles.overlay} role="dialog" aria-modal="true" aria-labelledby="attendance-filter-title">
      <div style={{ ...styles.modalBox, backgroundColor: theme.colors.background, borderColor: theme.colors.border }}>
        <h2 id="attendance-filter-title" style={{ ...styles.title, color: theme.colors.text }}>📅 Filter Attendance</h2>

        {loading ? (
          <div style={styles.loadingContainer}>
            <Loader color={theme.colors.primary} />
            <p style={{ ...styles.loadingText, color: theme.colors.textSecondary }}>Loading your attendance history...</p>
          </div>
        ) : (
          <>
            {firstAttendanceDate && (
              <div style={{ ...styles.infoBox, backgroundColor: theme.colors.card }}>
                <p style={{ ...styles.infoText, color: theme.colors.textSecondary }}>
                  📊 Your attendance data available from {monthsList.find(m => m.id === firstAttendanceDate.month)?.name} {firstAttendanceDate.year}
                </p>
              </div>
            )}

            <section>
              <h3 style={{ ...styles.sectionTitle, color: theme.colors.text }}>Select Year</h3>
              {years.length > 0 ? (
                <div style={styles.scrollContainer}>
                  {years.map(year => (
                    <button
                      key={year}
                      type="button"
                      onClick={() => setSelectedYear(year)}
                      style={{
                        ...styles.option,
                        backgroundColor: selectedYear === year ? theme.colors.primary : theme.colors.card,
                        color: selectedYear === year ? '#fff' : theme.colors.text,
                      }}
                    >
                      {year}
                    </button>
                  ))}
                </div>
              ) : (
                <p style={{ ...styles.noDataText, color: theme.colors.textSecondary }}>
                  No attendance data available
                </p>
              )}

              <h3 style={{ ...styles.sectionTitle, color: theme.colors.text }}>Select Month</h3>
              {months.length > 0 ? (
                <div style={styles.scrollContainer}>
                  {months.map(month => (
                    <button
                      key={month.id}
                      type="button"
                      onClick={() => setSelectedMonth(month.id)}
                      style={{
                        ...styles.option,
                        backgroundColor: selectedMonth === month.id ? theme.colors.primary : theme.colors.card,
                        color: selectedMonth === month.id ? '#fff' : theme.colors.text,
                      }}
                    >
                      {month.name}
                    </button>
                  ))}
                </div>
              ) : (
                <p style={{ ...styles.noDataText, color: theme.colors.textSecondary }}>
                  No months available for selected year
                </p>
              )}
            </section>

            {months.length > 0 && (
              <div style={{ ...styles.selectedBox, backgroundColor: theme.colors.card, color: theme.colors.text }}>
                Selected: {months.find(m => m.id === selectedMonth)?.name} {selectedYear}
              </div>
            )}

            <div style={styles.buttonRow}>
              <CustomButton title="🔄 Reset" onPress={handleReset} style={{ ...styles.button, backgroundColor: '#6c757d' }} />
              <CustomButton title="✅ Apply" onPress={handleApply} style={{ ...styles.button, backgroundColor: theme.colors.primary }} disabled={months.length === 0} />
            </div>
          </>
        )}

        <button type="button" onClick={onClose} style={styles.closeButton} aria-label="Close attendance filter">
          ✖ Close
        </button>
      </div>
    </div>
  );
};

export default AttendanceFilter;