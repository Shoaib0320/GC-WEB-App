import React from 'react';

const styles = {
  section: { marginBottom: 24 },
  sectionTitle: { fontSize: 18, fontWeight: 'bold', marginBottom: 12 },
  noData: { textAlign: 'center', fontStyle: 'italic', padding: 20 },
  promoCard: {
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    boxShadow: '0 4px 12px rgba(0,0,0,0.10)',
    display: 'flex',
    flexDirection: 'column',
    width: '50%',
    boxSizing: 'border-box',
  },
  promoHeader: {
    display: 'flex',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
    gap: 8,
  },
  promoCode: { fontSize: 16, fontWeight: 'bold' },
  discount: { fontSize: 14, fontWeight: 600, color: '#10B981' },
  statsRow: {
    display: 'flex',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 8,
    gap: 8,
  },
  stat: {
    alignItems: 'center',
    flex: '1 1 45%',
    display: 'flex',
    flexDirection: 'column',
  },
  statValue: { fontSize: 16, fontWeight: 'bold', marginBottom: 2 },
  statLabel: { fontSize: 12, textAlign: 'center' },
  usageRow: {
    display: 'flex',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginTop: 8,
    paddingTop: 8,
    borderTop: '1px solid #E5E7EB',
    gap: 8,
  },
  usageText: { fontSize: 11 },
};

const PromoCodesList = ({ promoCodes = [], theme = {} }) => {
  const colors = {
    text: theme.colors?.text || '#000',
    textSecondary: theme.colors?.textSecondary || '#666',
    primary: theme.colors?.primary || '#1D4ED8',
    surface: theme.colors?.surface || '#fff',
  };

  if (!promoCodes.length) {
    return (
      <section style={styles.section}>
        <h2 style={{ ...styles.sectionTitle, color: colors.text }}>
          Promo Codes Performance (0)
        </h2>
        <p style={{ ...styles.noData, color: colors.textSecondary }}>
          No promo codes found
        </p>
      </section>
    );
  }

  return (
    // <section style={styles.section}>
    //   <h2 style={{ ...styles.sectionTitle, color: colors.text }}>
    //     Promo Codes Performance ({promoCodes.length})
    //   </h2>
    //   {promoCodes.map((item) => (
    //     <div
    //       key={item.promoCodeId?.toString() || item.promoCode}
    //       style={{ ...styles.promoCard, backgroundColor: colors.surface }}
    //     >
    //       <div style={styles.promoHeader}>
    //         <p style={{ ...styles.promoCode, color: colors.primary }}>
    //           {item.promoCode || 'N/A'}
    //         </p>
    //         <p style={styles.discount}>
    //           {item.discountPercentage ?? 0}% OFF
    //         </p>
    //       </div>

    //       <div style={styles.statsRow}>
    //         <div style={styles.stat}>
    //           <p style={{ ...styles.statValue, color: colors.text }}>
    //             {item.totalBookings ?? 0}
    //           </p>
    //           <p style={{ ...styles.statLabel, color: colors.textSecondary }}>
    //             Bookings
    //           </p>
    //         </div>
    //       </div>

    //       <div style={styles.usageRow}>
    //         <p style={{ ...styles.usageText, color: colors.textSecondary }}>
    //           Used: {item.usedCount ?? 0} times
    //         </p>
    //         {item.maxUsage != null && (
    //           <p style={{ ...styles.usageText, color: colors.textSecondary }}>
    //             Limit: {item.maxUsage}
    //           </p>
    //         )}
    //       </div>
    //     </div>
    //   ))}
    // </section>

    <section style={{ marginBottom: 24 }}>
  <h2 style={{
    fontSize: "18px",
    fontWeight: 700,
    marginBottom: 16,
    color: colors.text,
    textAlign: "left",
  }}>
    Promo Codes Performance ({promoCodes.length})
  </h2>

  {promoCodes.map((item) => (
    <div
      key={item.promoCodeId?.toString() || item.promoCode}
      style={{
        width: "100%",
        maxWidth: 1000,
        margin: "0 auto 12px auto",
        padding: "16px",
        borderRadius: "12px",
        backgroundColor: colors.surface,
        boxShadow: "0 2px 6px rgba(0,0,0,0.08)",
      }}
    >
      {/* Header */}
      <div style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: 8,
        flexWrap: "wrap",
        gap: 8,
      }}>
        <p style={{ fontSize: "16px", fontWeight: 600, color: colors.primary }}>
          {item.promoCode || 'N/A'}
        </p>
        <p style={{ fontSize: "14px", fontWeight: 500, color: colors.textSecondary }}>
          {item.discountPercentage ?? 0}% OFF
        </p>
      </div>

      {/* Stats */}
      <div style={{
        display: "flex",
        justifyContent: "center",
        marginBottom: 8,
      }}>
        <div style={{ textAlign: "center" }}>
          <p style={{ fontSize: "14px", fontWeight: 600, color: colors.text }}>
            {item.totalBookings ?? 0}
          </p>
          <p style={{ fontSize: "12px", color: colors.textSecondary }}>Bookings</p>
        </div>
      </div>

      {/* Usage */}
      <div style={{
        display: "flex",
        justifyContent: "space-between",
        fontSize: "12px",
        color: colors.textSecondary,
      }}>
        <p>Used: {item.usedCount ?? 0} times</p>
        {item.maxUsage != null && <p>Limit: {item.maxUsage}</p>}
      </div>
    </div>
  ))}
</section>

  );
};

export default PromoCodesList;
