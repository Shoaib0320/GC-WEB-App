// import React, { useContext } from 'react';
// import { ThemeContext } from '../context/ThemeContext';

// const TodayDetailsCard = ({ todayAttendance }) => {
//   const { theme } = useContext(ThemeContext);

//   const formatTime = (dateString) => {
//     if (!dateString) return '--:--';
//     return new Date(dateString).toLocaleTimeString('en-US', {
//       hour: '2-digit',
//       minute: '2-digit',
//     });
//   };

//   return (
//     <div style={{
//       padding: 20,
//       borderRadius: 12,
//       marginBottom: 16,
//       border: `1px solid ${theme.colors.border}`,
//       backgroundColor: theme.colors.card,
//       color: theme.colors.text,
//     }}>
//       <h3 style={{
//         fontSize: 18,
//         fontWeight: 'bold',
//         marginBottom: 16,
//         textAlign: 'center',
//         color: theme.colors.text,
//       }}>
//         📊 Today's Details
//       </h3>

//       <div style={{
//         display: 'flex',
//         justifyContent: 'space-between',
//         alignItems: 'center',
//         padding: '8px 0',
//       }}>
//         <span style={{ fontSize: 14, flex: 1, color: theme.colors.textSecondary }}>
//           Check-in Time:
//         </span>
//         <span style={{ fontSize: 14, flex: 1, fontWeight: '600', textAlign: 'right', color: theme.colors.text }}>
//           {formatTime(todayAttendance.checkInTime)}
//         </span>
//       </div>

//       {todayAttendance.checkOutTime && (
//         <div style={{
//           display: 'flex',
//           justifyContent: 'space-between',
//           alignItems: 'center',
//           padding: '8px 0',
//         }}>
//           <span style={{ fontSize: 14, flex: 1, color: theme.colors.textSecondary }}>
//             Check-out Time:
//           </span>
//           <span style={{ fontSize: 14, flex: 1, fontWeight: '600', textAlign: 'right', color: theme.colors.text }}>
//             {formatTime(todayAttendance.checkOutTime)}
//           </span>
//         </div>
//       )}

//       {todayAttendance.isLate && (
//         <div style={{
//           display: 'flex',
//           justifyContent: 'space-between',
//           alignItems: 'center',
//           padding: '8px 0',
//         }}>
//           <span style={{ fontSize: 14, flex: 1, color: theme.colors.textSecondary }}>
//             Late Duration:
//           </span>
//           <span style={{ fontSize: 14, fontWeight: 'bold', color: '#FF6B6B', flex: 1, textAlign: 'right' }}>
//             {todayAttendance.lateMinutes} minutes
//           </span>
//         </div>
//       )}

//       {todayAttendance.isOvertime && (
//         <div style={{
//           display: 'flex',
//           justifyContent: 'space-between',
//           alignItems: 'center',
//           padding: '8px 0',
//         }}>
//           <span style={{ fontSize: 14, flex: 1, color: theme.colors.textSecondary }}>
//             Overtime:
//           </span>
//           <span style={{ fontSize: 14, fontWeight: 'bold', color: '#4CAF50', flex: 1, textAlign: 'right' }}>
//             {todayAttendance.overtimeMinutes} minutes
//           </span>
//         </div>
//       )}

//       <div style={{
//         display: 'flex',
//         justifyContent: 'space-between',
//         alignItems: 'center',
//         padding: '8px 0',
//       }}>
//         <span style={{ fontSize: 14, flex: 1, color: theme.colors.textSecondary }}>
//           Status:
//         </span>
//         <span style={{
//           fontSize: 14,
//           fontWeight: 'bold',
//           color: todayAttendance.status === 'present' ? '#4CAF50' : '#FF9800',
//           flex: 1,
//           textAlign: 'right',
//         }}>
//           {(todayAttendance.status || 'PRESENT').toUpperCase()}
//         </span>
//       </div>
//     </div>
//   );
// };

// export default TodayDetailsCard;





import React, { useContext } from 'react';
import { ThemeContext } from '../context/ThemeContext';

const TodayDetailsCard = ({ todayAttendance }) => {
  const { theme } = useContext(ThemeContext);

  const formatTime = (dateString) => {
    if (!dateString) return '--:--';
    return new Date(dateString).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div style={{
      padding: 20,
      borderRadius: 12,
      marginBottom: 16,
      border: `1px solid ${theme.colors.border}`,
      backgroundColor: theme.colors.card,
      color: theme.colors.text,
    }}>
      <h3 style={{
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 16,
        textAlign: 'center',
        color: theme.colors.text,
      }}>
        📊 Today's Details
      </h3>

      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: '8px 0',
      }}>
        <span style={{ fontSize: 14, flex: 1, color: theme.colors.textSecondary }}>
          Check-in Time:
        </span>
        <span style={{ fontSize: 14, flex: 1, fontWeight: '600', textAlign: 'right', color: theme.colors.text }}>
          {formatTime(todayAttendance.checkInTime)}
        </span>
      </div>

      {todayAttendance.checkOutTime && (
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          padding: '8px 0',
        }}>
          <span style={{ fontSize: 14, flex: 1, color: theme.colors.textSecondary }}>
            Check-out Time:
          </span>
          <span style={{ fontSize: 14, flex: 1, fontWeight: '600', textAlign: 'right', color: theme.colors.text }}>
            {formatTime(todayAttendance.checkOutTime)}
          </span>
        </div>
      )}

      {todayAttendance.isLate && (
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          padding: '8px 0',
        }}>
          <span style={{ fontSize: 14, flex: 1, color: theme.colors.textSecondary }}>
            Late Duration:
          </span>
          <span style={{ fontSize: 14, fontWeight: 'bold', color: '#FF6B6B', flex: 1, textAlign: 'right' }}>
            {todayAttendance.lateMinutes} minutes
          </span>
        </div>
      )}

      {todayAttendance.isOvertime && (
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          padding: '8px 0',
        }}>
          <span style={{ fontSize: 14, flex: 1, color: theme.colors.textSecondary }}>
            Overtime:
          </span>
          <span style={{ fontSize: 14, fontWeight: 'bold', color: '#4CAF50', flex: 1, textAlign: 'right' }}>
            {todayAttendance.overtimeMinutes} minutes
          </span>
        </div>
      )}

      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: '8px 0',
      }}>
        <span style={{ fontSize: 14, flex: 1, color: theme.colors.textSecondary }}>
          Status:
        </span>
        <span style={{
          fontSize: 14,
          fontWeight: 'bold',
          color: todayAttendance.status === 'present' ? '#4CAF50' : '#FF9800',
          flex: 1,
          textAlign: 'right',
        }}>
          {(todayAttendance.status || 'PRESENT').toUpperCase()}
        </span>
      </div>
    </div>
  );
};

export default TodayDetailsCard;