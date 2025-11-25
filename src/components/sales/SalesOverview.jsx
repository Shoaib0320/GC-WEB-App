import React from 'react';

const styles = {
  section: { marginBottom: 20 },
  sectionTitle: { fontSize: 16, fontWeight: 'bold', marginBottom: 12 },
  overviewGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(50%, 1fr))',
    gap: 12,
  },
  overviewCard: {
    padding: 14,
    borderRadius: 12,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    boxShadow: '0 4px 12px rgba(0,0,0,0.10)',
    backgroundColor: '#fff',
    width: '100%',
    boxSizing: 'border-box',
  },
  overviewValue: { fontSize: 18, fontWeight: '700', marginBottom: 4 },
  overviewLabel: { fontSize: 12, textAlign: 'center', color: '#666' },
};

const SalesOverview = ({ data = {}, theme = {}, timeRange = 'All Time' }) => {
  const colors = {
    text: theme.colors?.text || '#000',
    textSecondary: theme.colors?.textSecondary || '#666',
    primary: theme.colors?.primary || '#1D4ED8',
    surface: theme.colors?.surface || '#fff',
  };

  const overview = data.overview || {};

  // return (
  //   <section style={styles.section}>
  //     <h2 style={{ ...styles.sectionTitle, color: colors.text }}>
  //       Sales Overview ({timeRange})
  //     </h2>
  //     <div style={styles.overviewGrid}>
  //       <div style={{ ...styles.overviewCard, backgroundColor: colors.surface }}>
  //         <p style={{ ...styles.overviewValue, color: colors.primary }}>
  //           {overview.totalPromoCodes || 0}
  //         </p>
  //         <p style={styles.overviewLabel}>
  //           Total Promo Codes
  //         </p>
  //       </div>
  //       <div style={{ ...styles.overviewCard, backgroundColor: colors.surface }}>
  //         <p style={{ ...styles.overviewValue, color: colors.primary }}>
  //           {overview.totalBookings || 0}
  //         </p>
  //         <p style={styles.overviewLabel}>
  //           Total Sales
  //         </p>
  //       </div>
  //     </div>
  //   </section>
  // );

return (
  <section style={{ marginBottom: 24 }}>
    <h2 style={{ 
      fontSize: 20, 
      fontWeight: 500, 
      marginBottom: 16, 
      textAlign: "left", 
      color: colors.text 
    }}>
      Sales Overview ({timeRange})
    </h2>

    <div style={{
      display: "grid",
      gridTemplateColumns: "repeat(2, 1fr)",  // 2 columns
      gap: 20,
      justifyContent: "left",
      alignItems: "left",
    }}>
      {/* Total Promo Codes Card */}
      <div style={{
        padding: "18px 16px",
        borderRadius: 10,
        backgroundColor: colors.surface,
        boxShadow: "0 2px 6px rgba(0,0,0,0.08)",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
      }}>
        <p style={{ fontSize: 26, fontWeight: 500, marginBottom: 6, color: colors.primary }}>
          {overview.totalPromoCodes || 0}
        </p>
        <p style={{ fontSize: 14, opacity: 0.8, textAlign: "center" }}>
          Total Promo Codes
        </p>
      </div>

      {/* Total Sales Card */}
      <div style={{
        padding: "18px 16px",
        borderRadius: 12,
        backgroundColor: colors.surface,
        boxShadow: "0 2px 6px rgba(0,0,0,0.08)",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
      }}>
        <p style={{ fontSize: 26, fontWeight: 500, marginBottom: 6, color: colors.primary }}>
          {overview.totalBookings || 0}
        </p>
        <p style={{ fontSize: 14, opacity: 0.8, textAlign: "center" }}>
          Total Sales
        </p>
      </div>
    </div>
  </section>
);



};

export default SalesOverview;
