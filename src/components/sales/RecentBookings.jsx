"use client";

import React, { useState } from 'react';
import SaleDetailsModal from './SaleDetailsModal';



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



  return (
    <>
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
      </section>

      <SaleDetailsModal
        isOpen={!!selectedBooking}
        onClose={closeModal}
        saleData={selectedBooking}
      />
    </>
  );
};

export default RecentBookings;
