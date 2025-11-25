// import React, { useContext } from 'react';
// import { ThemeContext } from '../context/ThemeContext';

// const LocationStatusCard = ({ distance, checkRadius, loading }) => {
//   const { theme } = useContext(ThemeContext);

//   const getStatusColor = () => {
//     if (loading) return theme.colors.textSecondary;
//     if (distance === null || distance === undefined) return '#FF6B6B';
//     if (distance <= checkRadius) return '#4CAF50';
//     return '#FF9800';
//   };

//   const getStatusText = () => {
//     if (loading) return 'Checking location...';
//     if (distance === null || distance === undefined) return '📍 Location unavailable';
//     if (distance <= checkRadius) return '✅ Within office range';
//     return '❌ Out of office range';
//   };

//   const statusColor = getStatusColor();

//   return (
//     <div style={{
//       padding: 20,
//       borderRadius: 16,
//       marginBottom: 16,
//       border: `1px solid ${theme.colors.border}`,
//       backgroundColor: theme.colors.card,
//       textAlign: 'center',
//     }}>
//       <h3 style={{
//         fontSize: 18,
//         fontWeight: 'bold',
//         marginBottom: 16,
//         color: theme.colors.text,
//       }}>
//         📍 Location Status
//       </h3>
//       <div style={{
//         display: 'flex',
//         alignItems: 'center',
//         justifyContent: 'center',
//         marginBottom: 12,
//       }}>
//         <div style={{
//           width: 12,
//           height: 12,
//           borderRadius: 6,
//           marginRight: 8,
//           backgroundColor: statusColor,
//         }}></div>
//         <p style={{
//           fontSize: 16,
//           fontWeight: 600,
//           color: statusColor,
//           margin: 0,
//         }}>
//           {getStatusText()}
//         </p>
//       </div>
//       <div style={{
//         display: 'flex',
//         justifyContent: 'space-between',
//         padding: '8px 0',
//         color: theme.colors.text,
//       }}>
//         <span style={{ fontSize: 14, flex: 1, color: theme.colors.textSecondary, textAlign: 'left' }}>
//           Distance:
//         </span>
//         <span style={{ fontSize: 14, fontWeight: '600', flex: 1, textAlign: 'right' }}>
//           {distance !== null && distance !== undefined ? `${distance.toFixed(0)} meters` : 'Unknown'}
//         </span>
//       </div>
//       <div style={{
//         display: 'flex',
//         justifyContent: 'space-between',
//         padding: '8px 0',
//         color: theme.colors.text,
//       }}>
//         <span style={{ fontSize: 14, flex: 1, color: theme.colors.textSecondary, textAlign: 'left' }}>
//           Required Range:
//         </span>
//         <span style={{ fontSize: 14, fontWeight: '600', flex: 1, textAlign: 'right' }}>
//           Within {checkRadius} meters
//         </span>
//       </div>
//     </div>
//   );
// };

// export default LocationStatusCard;


import React, { useContext } from 'react';
import { ThemeContext } from '../context/ThemeContext';

const LocationStatusCard = ({ distance, checkRadius, loading }) => {
  const { theme } = useContext(ThemeContext);

  const getStatusColor = () => {
    if (loading) return theme.colors.textSecondary;
    if (distance === null || distance === undefined) return '#FF6B6B';
    if (distance <= checkRadius) return '#4CAF50';
    return '#FF9800';
  };

  const getStatusText = () => {
    if (loading) return 'Checking location...';
    if (distance === null || distance === undefined) return '📍 Location unavailable';
    if (distance <= checkRadius) return '✅ Within office range';
    return '❌ Out of office range';
  };

  const statusColor = getStatusColor();

  return (
    <div style={{
      padding: 20,
      borderRadius: 16,
      marginBottom: 16,
      border: `1px solid ${theme.colors.border}`,
      backgroundColor: theme.colors.card,
      textAlign: 'center',
    }}>
      <h3 style={{
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 16,
        color: theme.colors.text,
      }}>
        📍 Location Status
      </h3>
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 12,
      }}>
        <div style={{
          width: 12,
          height: 12,
          borderRadius: 6,
          marginRight: 8,
          backgroundColor: statusColor,
        }}></div>
        <p style={{
          fontSize: 16,
          fontWeight: 600,
          color: statusColor,
          margin: 0,
        }}>
          {getStatusText()}
        </p>
      </div>
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        padding: '8px 0',
        color: theme.colors.text,
      }}>
        <span style={{ fontSize: 14, flex: 1, color: theme.colors.textSecondary, textAlign: 'left' }}>
          Distance:
        </span>
        <span style={{ fontSize: 14, fontWeight: '600', flex: 1, textAlign: 'right' }}>
          {distance !== null && distance !== undefined ? `${distance.toFixed(0)} meters` : 'Unknown'}
        </span>
      </div>
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        padding: '8px 0',
        color: theme.colors.text,
      }}>
        <span style={{ fontSize: 14, flex: 1, color: theme.colors.textSecondary, textAlign: 'left' }}>
          Required Range:
        </span>
        <span style={{ fontSize: 14, fontWeight: '600', flex: 1, textAlign: 'right' }}>
          Within {checkRadius} meters
        </span>
      </div>
    </div>
  );
};

export default LocationStatusCard;