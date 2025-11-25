// import React from 'react';
// import { ThemeContext } from '../context/ThemeContext';

// const styles = {
//   infoCard: {
//     padding: '20px',
//     marginBottom: '16px',
//     borderRadius: '16px',
//     borderWidth: '1px',
//     borderStyle: 'solid',
//   },
//   cardTitle: {
//     fontSize: '18px',
//     fontWeight: 'bold',
//     marginBottom: '16px',
//     textAlign: 'center',
//   },
//   detailRow: {
//     display: 'flex',
//     flexDirection: 'row',
//     justifyContent: 'space-between',
//     alignItems: 'center',
//     padding: '8px 0',
//   },
//   detailLabel: {
//     fontSize: '14px',
//     flex: 1,
//   },
//   detailValue: {
//     fontSize: '14px',
//     fontWeight: 600,
//     textAlign: 'right',
//     flex: 1,
//   },
// };

// const TodayStatusCard = ({ todayAttendance, agentShift, workingTime }) => {
//   const { theme } = React.useContext(ThemeContext);

//   const getShiftTiming = () => {
//     if (!agentShift) return 'No shift assigned';

//     const formatTime = (timeStr) => {
//       if (!timeStr) return '--:--';
//       const [hours, minutes] = timeStr.split(':');
//       return `${hours}:${minutes}`;
//     };

//     return `${formatTime(agentShift.startTime)} - ${formatTime(agentShift.endTime)}`;
//   };

//   const getCurrentStatus = () => {
//     if (!todayAttendance) return 'Not Checked In';
//     if (todayAttendance.checkOutTime) return 'Checked Out';
//     return 'Checked In - Working';
//   };

//   const getStatusIcon = () => {
//     if (!todayAttendance) return '❌';
//     if (todayAttendance.checkOutTime) return '✅';
//     return '🟢';
//   };

//   return (
//     <div
//       style={{
//         ...styles.infoCard,
//         backgroundColor: theme.colors.card,
//         borderColor: theme.colors.border,
//       }}
//     >
//       <div style={{ ...styles.cardTitle, color: theme.colors.text }}>
//         📋 Today's Status
//       </div>
//       <div style={styles.detailRow}>
//         <div style={{ ...styles.detailLabel, color: theme.colors.textSecondary }}>
//           Shift:
//         </div>
//         <div style={{ ...styles.detailValue, color: theme.colors.text }}>
//           {agentShift?.name || 'Not Assigned'}
//         </div>
//       </div>
//       <div style={styles.detailRow}>
//         <div style={{ ...styles.detailLabel, color: theme.colors.textSecondary }}>
//           Timing:
//         </div>
//         <div style={{ ...styles.detailValue, color: theme.colors.text }}>
//           {getShiftTiming()}
//         </div>
//       </div>
//       <div style={styles.detailRow}>
//         <div style={{ ...styles.detailLabel, color: theme.colors.textSecondary }}>
//           Status:
//         </div>
//         <div
//           style={{
//             ...styles.detailValue,
//             color: todayAttendance ? '#4CAF50' : '#FF9800',
//             fontWeight: 'bold',
//           }}
//         >
//           {getStatusIcon()} {getCurrentStatus()}
//         </div>
//       </div>
//       {todayAttendance && !todayAttendance.checkOutTime && (
//         <div style={styles.detailRow}>
//           <div style={{ ...styles.detailLabel, color: theme.colors.textSecondary }}>
//             Working Time:
//           </div>
//           <div style={{ ...styles.detailValue, color: theme.colors.primary, fontWeight: 'bold' }}>
//             ⏱️ {workingTime}
//           </div>
//         </div>
//       )}
//     </div>
//   );
// };

// export default TodayStatusCard;





import React from 'react';
import { ThemeContext } from '../context/ThemeContext';

const styles = {
  infoCard: {
    padding: '20px',
    marginBottom: '16px',
    borderRadius: '16px',
    borderWidth: '1px',
    borderStyle: 'solid',
  },
  cardTitle: {
    fontSize: '18px',
    fontWeight: 'bold',
    marginBottom: '16px',
    textAlign: 'center',
  },
  detailRow: {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '8px 0',
  },
  detailLabel: {
    fontSize: '14px',
    flex: 1,
  },
  detailValue: {
    fontSize: '14px',
    fontWeight: 600,
    textAlign: 'right',
    flex: 1,
  },
};

const TodayStatusCard = ({ todayAttendance, agentShift, workingTime }) => {
  const { theme } = React.useContext(ThemeContext);

  const getShiftTiming = () => {
    if (!agentShift) return 'No shift assigned';

    const formatTime = (timeStr) => {
      if (!timeStr) return '--:--';
      const [hours, minutes] = timeStr.split(':');
      return `${hours}:${minutes}`;
    };

    return `${formatTime(agentShift.startTime)} - ${formatTime(agentShift.endTime)}`;
  };

  const getCurrentStatus = () => {
    if (!todayAttendance) return 'Not Checked In';
    if (todayAttendance.checkOutTime) return 'Checked Out';
    return 'Checked In - Working';
  };

  const getStatusIcon = () => {
    if (!todayAttendance) return '❌';
    if (todayAttendance.checkOutTime) return '✅';
    return '🟢';
  };

  return (
    <div
      style={{
        ...styles.infoCard,
        backgroundColor: theme.colors.card,
        borderColor: theme.colors.border,
      }}
    >
      <div style={{ ...styles.cardTitle, color: theme.colors.text }}>
        📋 Today's Status
      </div>
      <div style={styles.detailRow}>
        <div style={{ ...styles.detailLabel, color: theme.colors.textSecondary }}>
          Shift:
        </div>
        <div style={{ ...styles.detailValue, color: theme.colors.text }}>
          {agentShift?.name || 'Not Assigned'}
        </div>
      </div>
      <div style={styles.detailRow}>
        <div style={{ ...styles.detailLabel, color: theme.colors.textSecondary }}>
          Timing:
        </div>
        <div style={{ ...styles.detailValue, color: theme.colors.text }}>
          {getShiftTiming()}
        </div>
      </div>
      <div style={styles.detailRow}>
        <div style={{ ...styles.detailLabel, color: theme.colors.textSecondary }}>
          Status:
        </div>
        <div
          style={{
            ...styles.detailValue,
            color: todayAttendance ? '#4CAF50' : '#FF9800',
            fontWeight: 'bold',
          }}
        >
          {getStatusIcon()} {getCurrentStatus()}
        </div>
      </div>
      {todayAttendance && !todayAttendance.checkOutTime && (
        <div style={styles.detailRow}>
          <div style={{ ...styles.detailLabel, color: theme.colors.textSecondary }}>
            Working Time:
          </div>
          <div style={{ ...styles.detailValue, color: theme.colors.primary, fontWeight: 'bold' }}>
            ⏱️ {workingTime}
          </div>
        </div>
      )}
    </div>
  );
};

export default TodayStatusCard;