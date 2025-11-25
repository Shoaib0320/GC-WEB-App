import React from 'react';

const MonthlyTargetProgress = ({ monthlyTarget = 0, currentBookings = 0, theme, currentMonth }) => {
  // Calculate progress safely
  const progress = monthlyTarget > 0 ? Math.min(currentBookings / monthlyTarget, 1) : 0;
  const percentage = Math.min((progress * 100).toFixed(1), 100);

  const getProgressColor = (progress) => {
    if (progress >= 1) return '#10B981'; // Green
    if (progress >= 0.7) return '#F59E0B'; // Orange
    return '#EF4444'; // Red
  };

  return (
    <div
      style={{
        padding: 12,
        borderRadius: 12,
        marginBottom: 12,
        backgroundColor: theme?.colors?.surface || '#fff',
        boxShadow: '0 4px 12px rgba(0,0,0,0.10)',
        width: '100%',
        boxSizing: 'border-box',
      }}
    >
      {/* Header */}
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: 4,
          marginBottom: 8,
        }}
      >
        <span
          style={{
            fontSize: 14,
            fontWeight: 700,
            color: theme?.colors?.text || '#000',
          }}
        >
          Monthly Target — {currentMonth || ''}
        </span>

        <span
          style={{
            fontSize: 16,
            fontWeight: 700,
            color: getProgressColor(progress),
            alignSelf: 'flex-start',
          }}
        >
          {percentage}%
        </span>
      </div>

      {/* Progress Bar Wrapper */}
      <div
        style={{
          width: '100%',
          height: 10,
          borderRadius: 6,
          backgroundColor: '#e6e6e6',
          marginBottom: 8,
          overflow: 'hidden',
        }}
      >
        <div
          style={{
            width: `${percentage}%`,
            height: '100%',
            backgroundColor: getProgressColor(progress),
            transition: 'width 0.35s ease',
          }}
        />
      </div>

      {/* Stats */}
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: 2,
          fontSize: 12,
          color: theme?.colors?.textSecondary || '#666',
        }}
      >
        <span>
          {currentBookings} / {monthlyTarget} Sales
        </span>
        <span>{Math.max(0, monthlyTarget - currentBookings)} remaining</span>
      </div>

      {/* Target Completed Message */}
      {progress >= 1 && (
        <div
          style={{
            marginTop: 8,
            padding: '6px 0',
            fontSize: 13,
            fontWeight: 'bold',
            textAlign: 'center',
            color: '#10B981',
            backgroundColor: 'rgba(16,185,129,0.10)',
            borderRadius: 6,
          }}
        >
          🎉 Target Achieved!
        </div>
      )}
    </div>
  );
};

export default MonthlyTargetProgress;