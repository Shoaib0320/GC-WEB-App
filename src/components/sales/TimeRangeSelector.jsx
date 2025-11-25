import React from 'react';

const styles = {
  container: { marginBottom: 20 },
  title: { fontSize: 16, fontWeight: 600, marginBottom: 8 },
  rangeContainer: { display: 'flex', flexWrap: 'wrap', gap: 8 },
  rangeButton: { padding: '8px 16px', borderRadius: 20, borderWidth: 1, borderStyle: 'solid', cursor: 'pointer' },
  rangeText: { fontSize: 14, fontWeight: 500, margin: 0 },
};

const TimeRangeSelector = ({ timeRange, onTimeRangeChange, theme = {} }) => {
  const colors = {
    primary: theme.colors?.primary || '#1D4ED8',
    surface: theme.colors?.surface || '#fff',
    border: theme.colors?.border || '#E5E7EB',
    text: theme.colors?.text || '#000',
  };

  const ranges = [
    { key: 'day', label: 'Today' },
    { key: 'week', label: 'Week' },
    { key: 'month', label: 'Month' },
    { key: 'year', label: 'Year' },
  ];

  return (
    <div style={styles.container}>
      <p style={{ ...styles.title, color: colors.text }}>Time Period</p>
      <div style={styles.rangeContainer}>
        {ranges.map((range) => (
          <div
            key={range.key}
            onClick={() => onTimeRangeChange && onTimeRangeChange(range.key)}
            style={{
              ...styles.rangeButton,
              backgroundColor: timeRange === range.key ? colors.primary : colors.surface,
              borderColor: colors.border,
            }}
          >
            <p
              style={{
                ...styles.rangeText,
                color: timeRange === range.key ? colors.surface : colors.text,
              }}
            >
              {range.label}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default TimeRangeSelector;
