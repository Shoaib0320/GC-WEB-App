import React from 'react';

const styles = {
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  metricsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(50%, 1fr))',
    gap: 10,
  },
  metricCard: {
    padding: 14,
    borderRadius: 12,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    marginBottom: 12,
    boxShadow: '0 4px 12px rgba(0,0,0,0.10)',
    transition: 'transform 0.2s ease, box-shadow 0.2s ease',
    textAlign: 'center',
    width: '100%',
    boxSizing: 'border-box',
  },
  metricValue: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 4,
  },
  metricLabel: {
    fontSize: 12,
    color: '#666',
  },
};

const PerformanceMetrics = ({ data = {}, theme }) => {
  const metrics = [
    { label: 'Completed', value: data.completedBookings || 0, color: '#10B981' },
    { label: 'Total Bookings', value: data.totalBookings || 0, color: '#F59E0B' },
  ];

  return (
    <section style={styles.section}>
      <h2 style={{ ...styles.sectionTitle, color: theme?.colors?.text || '#000' }}>
        Performance Metrics
      </h2>
      <div style={styles.metricsGrid}>
        {metrics.map((metric) => (
          <div
            key={metric.label}
            style={{
              ...styles.metricCard,
              backgroundColor: theme?.colors?.surface || '#fff',
              color: theme?.colors?.textSecondary || '#666',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-3px)';
              e.currentTarget.style.boxShadow = '0 4px 10px rgba(0,0,0,0.12)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = '0 2px 6px rgba(0,0,0,0.08)';
            }}
          >
            <p style={{ ...styles.metricValue, color: metric.color }}>{metric.value}</p>
            <p style={styles.metricLabel}>{metric.label}</p>
          </div>
        ))}
      </div>
    </section>
  );
};

export default PerformanceMetrics;
