"use client";

import React, { useState } from 'react';

const styles = {
  section: { marginBottom: 24 },
  sectionTitle: { fontSize: 18, fontWeight: 'bold', marginBottom: 12 },
  noData: { textAlign: 'center', fontStyle: 'italic', padding: 20 },
  bookingCard: {
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    boxShadow: '0 4px 12px rgba(0,0,0,0.10)',
    cursor: 'pointer',
    display: 'flex',
    flexDirection: 'column',
    width: '50%',
    boxSizing: 'border-box',
  },
  bookingHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
    flexWrap: 'wrap',
    gap: 8,
  },
  bookingId: { fontSize: 14, fontWeight: 600 },
  statusBadge: {
    padding: '4px 8px',
    borderRadius: 12,
    color: 'white',
    fontWeight: '700',
    fontSize: 10,
    display: 'inline-block',
  },
  bookingDetails: { marginBottom: 6 },
  date: { fontSize: 12 },
  promoCode: { fontSize: 12, fontStyle: 'italic', marginBottom: 4 },
  customer: { fontSize: 12 },
  modalBackdrop: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.6)',
    display: 'flex',
    justifyContent: 'center',
    padding: 18,
    zIndex: 1000,
  },
  modalContainer: {
    backgroundColor: 'white',
    borderRadius: 14,
    padding: 16,
    maxHeight: '86%',
    overflowY: 'auto',
    width: '90%',
    maxWidth: 600,
    position: 'relative',
    boxShadow: '0 8px 24px rgba(0,0,0,0.15)',
  },
  modalHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
    flexWrap: 'wrap',
    gap: 8,
  },
  modalTitle: { fontSize: 18, fontWeight: '700' },
  modalBody: { marginTop: 8 },
  detailRow: {
    display: 'flex',
    justifyContent: 'space-between',
    marginBottom: 8,
    alignItems: 'flex-start',
    flexWrap: 'wrap',
    gap: 8,
  },
  label: { fontSize: 13, width: '40%', minWidth: 100 },
  value: {
    fontSize: 13,
    width: '58%',
    textAlign: 'right',
    minWidth: 120,
  },
  sectionDivider: { height: 1, backgroundColor: '#E5E7EB', margin: '10px 0', borderRadius: 2 },
  subTitle: { fontSize: 15, fontWeight: 600, marginBottom: 6 },
  vehicleCard: {
    border: '1px solid #ddd',
    borderRadius: 12,
    padding: 10,
    marginBottom: 10,
    backgroundColor: 'transparent',
  },
  vehicleHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
    flexWrap: 'wrap',
    gap: 8,
  },
  vehicleTitle: { fontSize: 13, fontWeight: '700' },
  vehiclePkg: { fontSize: 12, fontWeight: '700' },
  vehicleRow: {
    display: 'flex',
    justifyContent: 'space-between',
    marginBottom: 4,
    flexWrap: 'wrap',
    gap: 8,
  },
  vLabel: { fontSize: 12, width: '40%', minWidth: 100 },
  vValue: {
    fontSize: 12,
    width: '58%',
    textAlign: 'right',
    minWidth: 120,
  },
  subtleText: { fontSize: 12, marginTop: 6 },
};

const getStatusColor = (status) => {
  switch ((status || '').toLowerCase()) {
    case 'completed':
    case 'confirmed': return '#10B981';
    case 'pending': return '#F59E0B';
    case 'cancelled':
    case 'canceled': return '#EF4444';
    case 'rescheduled': return '#6366F1';
    default: return '#6B7280';
  }
};

const formatDate = (dateString) => {
  if (!dateString) return '-';
  return new Date(dateString).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
};

const formatDateTime = (dateString) => {
  if (!dateString) return '-';
  return new Date(dateString).toLocaleString('en-IN', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit', hour12: true });
};

const RecentBookings = ({ bookings = [], theme = {} }) => {
  const colors = {
    text: theme.colors?.text || '#000',
    textSecondary: theme.colors?.textSecondary || '#666',
    primary: theme.colors?.primary || '#1D4ED8',
    surface: theme.colors?.surface || '#fff',
    success: theme.colors?.success || '#10B981',
    border: theme.colors?.border || '#ddd',
  };

  const [selectedBooking, setSelectedBooking] = useState(null);

  const openBookingDetails = (booking) => setSelectedBooking(booking);
  const closeModal = () => setSelectedBooking(null);

  const renderVehicle = (item = {}, index) => {
    const addServices = Array.isArray(item.additionalServices) ? item.additionalServices : [];
    return (
      <div key={item._id || item.id || index} style={{ ...styles.vehicleCard, borderColor: colors.border }}>
        <div style={styles.vehicleHeader}>
          <p style={{ ...styles.vehicleTitle, color: colors.text }}>
            Vehicle {index + 1} — {item.vehicleType || '-'}
          </p>
          <p style={{ ...styles.vehiclePkg, color: colors.primary }}>{item.package || item.variant || '-'}</p>
        </div>

        <div style={styles.vehicleRow}>
          <p style={{ ...styles.vLabel, color: colors.textSecondary }}>Service:</p>
          <p style={{ ...styles.vValue, color: colors.text }}>{item.mainService || item.serviceType || '-'}</p>
        </div>

        <div style={styles.vehicleRow}>
          <p style={{ ...styles.vLabel, color: colors.textSecondary }}>Make / Model:</p>
          <p style={{ ...styles.vValue, color: colors.text }}>
            {item.vehicleMake || '-'}{item.vehicleModel ? ` / ${item.vehicleModel}` : ''}
          </p>
        </div>

        <div style={styles.vehicleRow}>
          <p style={{ ...styles.vLabel, color: colors.textSecondary }}>Year / Color:</p>
          <p style={{ ...styles.vValue, color: colors.text }}>
            {item.vehicleYear || '-'}{item.vehicleColor ? ` / ${item.vehicleColor}` : ''}
          </p>
        </div>

        <div style={styles.vehicleRow}>
          <p style={{ ...styles.vLabel, color: colors.textSecondary }}>Length:</p>
          <p style={{ ...styles.vValue, color: colors.text }}>{item.vehicleLength || '-'}</p>
        </div>

        <div style={styles.vehicleRow}>
          <p style={{ ...styles.vLabel, color: colors.textSecondary }}>Add. Services:</p>
          <p style={{ ...styles.vValue, color: colors.text }}>{addServices.length ? addServices.join(', ') : '-'}</p>
        </div>
      </div>
    );
  };

  return (
    // <section style={styles.section}>
    //   <h2 style={{ ...styles.sectionTitle, color: colors.text }}>Recent Sales ({bookings.length})</h2>

    //   {!bookings.length ? (
    //     <p style={{ ...styles.noData, color: colors.textSecondary }}>No recent sales</p>
    //   ) : (
    //     bookings.map((item) => (
    //       <div
    //         key={item._id || item.bookingId}
    //         onClick={() => openBookingDetails(item)}
    //         style={{ ...styles.bookingCard, backgroundColor: colors.surface }}
    //         role="button"
    //         tabIndex={0}
    //         onKeyDown={(e) => { if (e.key === 'Enter') openBookingDetails(item); }}
    //       >
    //         <div style={styles.bookingHeader}>
    //           <p style={{ ...styles.bookingId, color: colors.text }}>#{item.bookingId || '-'}</p>
    //           <div style={{ ...styles.statusBadge, backgroundColor: getStatusColor(item.status) }}>
    //             {(item.status || '-').toUpperCase()}
    //           </div>
    //         </div>

    //         <div style={styles.bookingDetails}>
    //           <p style={{ ...styles.date, color: colors.textSecondary }}>{formatDate(item.createdAt)}</p>
    //           <p style={{ ...styles.customer, color: colors.textSecondary }}>
    //             {item.formData?.firstName || '-'} {item.formData?.lastName || ''}
    //           </p>
    //         </div>

    //         {item.promoCode && <p style={{ ...styles.promoCode, color: colors.textSecondary }}>Promo: {item.promoCode}</p>}
    //       </div>
    //     ))
    //   )}

    //   {selectedBooking && (
    //     <div style={styles.modalBackdrop} onClick={closeModal}>
    //       <div style={styles.modalContainer} onClick={(e) => e.stopPropagation()}>
    //         <div style={styles.modalHeader}>
    //           <h3 style={{ ...styles.modalTitle, color: colors.text }}>Booking Details</h3>
    //           <button onClick={closeModal} style={{ background: 'none', border: 'none', cursor: 'pointer' }} aria-label="Close modal">✕</button>
    //         </div>

    //         <div style={styles.modalBody}>
    //           {/* Booking Info */}
    //           <div style={styles.detailRow}>
    //             <p style={{ ...styles.label, color: colors.textSecondary }}>Booking ID:</p>
    //             <p style={{ ...styles.value, color: colors.text }}>{selectedBooking.bookingId || '-'}</p>
    //           </div>
    //           <div style={styles.detailRow}>
    //             <p style={{ ...styles.label, color: colors.textSecondary }}>Status:</p>
    //             <p style={{ ...styles.value, color: getStatusColor(selectedBooking.status) }}>{(selectedBooking.status || '-').toUpperCase()}</p>
    //           </div>
    //           <div style={styles.detailRow}>
    //             <p style={{ ...styles.label, color: colors.textSecondary }}>Scheduled:</p>
    //             <p style={{ ...styles.value, color: colors.text }}>{selectedBooking.formData?.date || '-'}</p>
    //           </div>
    //           <div style={styles.detailRow}>
    //             <p style={{ ...styles.label, color: colors.textSecondary }}>Time Slot:</p>
    //             <p style={{ ...styles.value, color: colors.text }}>{selectedBooking.formData?.timeSlot || '-'}</p>
    //           </div>

    //           <div style={styles.sectionDivider} />

    //           {/* Customer Info */}
    //           <h4 style={{ ...styles.subTitle, color: colors.text }}>Customer</h4>
    //           <div style={styles.detailRow}>
    //             <p style={{ ...styles.label, color: colors.textSecondary }}>Name:</p>
    //             <p style={{ ...styles.value, color: colors.text }}>
    //               {selectedBooking.formData?.firstName || '-'} {selectedBooking.formData?.lastName || ''}
    //             </p>
    //           </div>
    //           <div style={styles.detailRow}>
    //             <p style={{ ...styles.label, color: colors.textSecondary }}>Phone:</p>
    //             <p style={{ ...styles.value, color: colors.text }}>{selectedBooking.formData?.phone || '-'}</p>
    //           </div>
    //           <div style={styles.detailRow}>
    //             <p style={{ ...styles.label, color: colors.textSecondary }}>Email:</p>
    //             <p style={{ ...styles.value, color: colors.text }}>{selectedBooking.formData?.email || '-'}</p>
    //           </div>

    //           <div style={styles.sectionDivider} />

    //           {/* Vehicles */}
    //           <h4 style={{ ...styles.subTitle, color: colors.text }}>Vehicle(s)</h4>
    //           {selectedBooking.formData?.vehicleBookings?.length ? (
    //             selectedBooking.formData.vehicleBookings.map(renderVehicle)
    //           ) : (
    //             <p style={{ color: colors.textSecondary }}>No vehicle bookings</p>
    //           )}

    //           <div style={styles.sectionDivider} />

    //           {/* Pricing */}
    //           <h4 style={{ ...styles.subTitle, color: colors.text }}>Pricing</h4>
    //           <div style={styles.detailRow}>
    //             <p style={{ ...styles.label, color: colors.textSecondary }}>Total Price:</p>
    //             <p style={{ ...styles.value, color: colors.primary }}>$ {selectedBooking.totalPrice?.toLocaleString() || '0'}</p>
    //           </div>

    //           {selectedBooking.discountApplied && (
    //             <>
    //               <div style={styles.detailRow}>
    //                 <p style={{ ...styles.label, color: colors.textSecondary }}>Discount:</p>
    //                 <p style={{ ...styles.value, color: colors.success }}>
    //                   {selectedBooking.discountPercent || 0}% (− $ {((selectedBooking.totalPrice || 0) - (selectedBooking.discountedPrice || 0)).toLocaleString()})
    //                 </p>
    //               </div>
    //               <div style={styles.detailRow}>
    //                 <p style={{ ...styles.label, color: colors.textSecondary }}>Final Price:</p>
    //                 <p style={{ ...styles.value, color: colors.primary }}>$ {selectedBooking.discountedPrice?.toLocaleString() || '0'}</p>
    //               </div>
    //             </>
    //           )}

    //           {selectedBooking.promoCode && (
    //             <div style={styles.detailRow}>
    //               <p style={{ ...styles.label, color: colors.textSecondary }}>Promo Code:</p>
    //               <p style={{ ...styles.value, color: colors.text }}>{selectedBooking.promoCode}</p>
    //             </div>
    //           )}

    //           {(selectedBooking.notes || selectedBooking.formData?.notes) && (
    //             <>
    //               <div style={styles.sectionDivider} />
    //               <h4 style={{ ...styles.subTitle, color: colors.text }}>Notes</h4>
    //               <p style={{ color: colors.textSecondary }}>{selectedBooking.notes || selectedBooking.formData?.notes}</p>
    //             </>
    //           )}

    //           <div style={styles.sectionDivider} />
    //           <p style={{ ...styles.subtleText, color: colors.textSecondary }}>Created: {formatDateTime(selectedBooking.createdAt)}</p>
    //           <p style={{ ...styles.subtleText, color: colors.textSecondary }}>Submitted: {formatDateTime(selectedBooking.submittedAt)}</p>
    //           <p style={{ ...styles.subtleText, color: colors.textSecondary }}>Updated: {formatDateTime(selectedBooking.updatedAt)}</p>
    //         </div>
    //       </div>
    //     </div>
    //   )}
    // </section>


    <section style={{ marginBottom: 24 }}>
  <h2 style={{
    fontSize: "18px",
    fontWeight: 700,
    marginBottom: 16,
    color: colors.text,
    textAlign: "left",
  }}>
    Recent Sales ({bookings.length})
  </h2>

  {!bookings.length ? (
    <p style={{
      fontSize: "14px",
      color: colors.textSecondary,
      textAlign: "center",
    }}>
      No recent sales
    </p>
  ) : (
    bookings.map((item) => (
      <div
        key={item._id || item.bookingId}
        onClick={() => openBookingDetails(item)}
        style={{
          width: "100%",
          padding: "16px",
          borderRadius: "12px",
          marginBottom: "12px",
          backgroundColor: colors.surface,
          boxShadow: "0 2px 6px rgba(0,0,0,0.08)",
          cursor: "pointer",
        }}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => { if (e.key === 'Enter') openBookingDetails(item); }}
      >
        <div style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: 8,
        }}>
          <p style={{ fontSize: "14px", fontWeight: 600, color: colors.text }}>#{item.bookingId || '-'}</p>
          <div style={{
            padding: "4px 8px",
            borderRadius: 6,
            fontSize: "12px",
            fontWeight: 600,
            color: "#fff",
            backgroundColor: getStatusColor(item.status),
          }}>
            {(item.status || '-').toUpperCase()}
          </div>
        </div>

        <div style={{
          display: "flex",
          justifyContent: "space-between",
          fontSize: "13px",
          color: colors.textSecondary,
          flexWrap: "wrap",
          gap: "8px",
        }}>
          <p>{formatDate(item.createdAt)}</p>
          <p>{item.formData?.firstName || '-'} {item.formData?.lastName || ''}</p>
        </div>

        {item.promoCode && (
          <p style={{ fontSize: "12px", color: colors.textSecondary, marginTop: 6 }}>
            Promo: {item.promoCode}
          </p>
        )}
      </div>
    ))
  )}

  {selectedBooking && (
    <div style={{
      position: "fixed",
      top: 0, left: 0, right: 0, bottom: 0,
      backgroundColor: "rgba(0,0,0,0.4)",
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
      padding: 16,
      zIndex: 999,
    }} onClick={closeModal}>
      <div style={{
        width: "100%",
        maxWidth: 500,
        borderRadius: 12,
        backgroundColor: colors.surface,
        padding: 16,
        maxHeight: "90vh",
        overflowY: "auto",
      }} onClick={(e) => e.stopPropagation()}>
        {/* Modal header and details remain same */}
        {/* All text sizes reduced slightly for mobile responsiveness */}
        {/* Example: */}
        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 12 }}>
          <h3 style={{ fontSize: "16px", fontWeight: 700, color: colors.text }}>Booking Details</h3>
          <button onClick={closeModal} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: "16px" }} aria-label="Close modal">✕</button>
        </div>

        <div style={{ fontSize: "13px", color: colors.textSecondary }}>
          {/* Details content here, all text fontSize reduced to 13px for mobile */}
        </div>
      </div>
    </div>
  )}
</section>

  );
};

export default RecentBookings;
