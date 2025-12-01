"use client";

import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Loader2, User, Car, Calendar, CreditCard, Database } from 'lucide-react';

const SaleDetailsModal = ({ isOpen, onClose, saleData, loading = false }) => {
  // Close on Escape key
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isOpen, onClose]);

  // Prevent body scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  const formatCurrency = (amount) => {
    if (!amount && amount !== 0) return '₹0';
    return `₹${Number(amount).toLocaleString('en-IN')}`;
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });
  };

  const formatDateTime = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      pending: { bg: 'bg-yellow-100', text: 'text-yellow-800', label: 'Pending' },
      confirmed: { bg: 'bg-blue-100', text: 'text-blue-800', label: 'Confirmed' },
      completed: { bg: 'bg-green-100', text: 'text-green-800', label: 'Completed' },
      cancelled: { bg: 'bg-red-100', text: 'text-red-800', label: 'Cancelled' },
      rescheduled: { bg: 'bg-purple-100', text: 'text-purple-800', label: 'Rescheduled' },
      'in-progress': { bg: 'bg-orange-100', text: 'text-orange-800', label: 'In Progress' },
    };

    const config = statusConfig[status?.toLowerCase()] || { bg: 'bg-gray-100', text: 'text-gray-800', label: status || 'Unknown' };
    return (
      <span className={`px-2 py-1 text-xs font-semibold rounded ${config.bg} ${config.text}`}>
        {config.label}
      </span>
    );
  };

  const getPaymentStatusBadge = (status) => {
    const paymentStatus = saleData?.paymentStatus || (status === 'completed' ? 'paid' : 'pending');
    const statusConfig = {
      paid: { bg: 'bg-green-100', text: 'text-green-800', label: 'Paid' },
      pending: { bg: 'bg-orange-100', text: 'text-orange-800', label: 'Pending' },
      partial: { bg: 'bg-blue-100', text: 'text-blue-800', label: 'Partial' },
    };

    const config = statusConfig[paymentStatus?.toLowerCase()] || { bg: 'bg-gray-100', text: 'text-gray-800', label: paymentStatus || 'Unknown' };
    return (
      <span className={`px-2 py-1 text-xs font-semibold rounded ${config.bg} ${config.text}`}>
        {config.label}
      </span>
    );
  };

  const vehicleData = saleData?.formData?.vehicleBookings?.[0] || saleData?.formData?.bookingDetails || {};

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center p-2 bg-black/50"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.95, opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="relative w-full max-w-[95vw] lg:max-w-[90vw] max-h-[60vh] overflow-y-auto bg-white rounded-lg shadow-2xl border border-gray-200"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between p-3 border-b border-gray-200 bg-gray-50">
            <div className="flex items-center gap-2">
              <h2 className="text-base font-semibold text-gray-900">Sale Details</h2>
              {saleData?.bookingId && (
                <span className="text-xs text-gray-600 bg-gray-100 px-2 py-1 rounded">
                  {saleData.bookingId}
                </span>
              )}
            </div>
            <button
              onClick={onClose}
              className="p-1 hover:bg-gray-200 rounded transition-colors"
              aria-label="Close modal"
            >
              <X className="h-4 w-4 text-gray-600" />
            </button>
          </div>

          {/* Content - Horizontal Layout */}
          <div className="p-4">
            {loading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-6 w-6 animate-spin text-blue-600" />
                <span className="ml-2 text-sm text-gray-600">Loading sale details...</span>
              </div>
            ) : !saleData ? (
              <div className="text-center py-8">
                <p className="text-gray-500">No sale data available</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 h-full">
                {/* Left Column - Customer & Vehicle */}
                <div className="space-y-3">
                  {/* Customer Section */}
                  <div className="bg-gray-50 rounded p-3 border border-gray-200">
                    <div className="flex items-center gap-2 mb-2">
                      <User className="h-4 w-4 text-blue-600" />
                      <h3 className="text-sm font-medium text-gray-900">Customer Information</h3>
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <p className="text-xs text-gray-500">Name</p>
                        <p className="text-sm font-medium text-gray-900">
                          {saleData.formData?.firstName || 'N/A'} {saleData.formData?.lastName || ''}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500">Phone</p>
                        <p className="text-sm font-medium text-gray-900">{saleData.formData?.phone || 'N/A'}</p>
                      </div>
                    </div>
                  </div>

                  {/* Vehicle Section */}
                  <div className="bg-gray-50 rounded p-3 border border-gray-200">
                    <div className="flex items-center gap-2 mb-2">
                      <Car className="h-4 w-4 text-green-600" />
                      <h3 className="text-sm font-medium text-gray-900">Vehicle Details</h3>
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <p className="text-xs text-gray-500">Make</p>
                        <p className="text-sm font-medium text-gray-900">{vehicleData.vehicleMake || 'N/A'}</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500">Model</p>
                        <p className="text-sm font-medium text-gray-900">{vehicleData.vehicleModel || 'N/A'}</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500">Year</p>
                        <p className="text-sm font-medium text-gray-900">{vehicleData.vehicleYear || 'N/A'}</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500">Color</p>
                        <p className="text-sm font-medium text-gray-900">{vehicleData.vehicleColor || 'N/A'}</p>
                      </div>
                      <div className="col-span-2">
                        <p className="text-xs text-gray-500">Plate Number</p>
                        <p className="text-sm font-medium text-gray-900">{vehicleData.vehicleLength || 'N/A'}</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Right Column - Service, Payment & System */}
                <div className="space-y-3">
                  {/* Service Section */}
                  <div className="bg-gray-50 rounded p-3 border border-gray-200">
                    <div className="flex items-center gap-2 mb-2">
                      <Calendar className="h-4 w-4 text-purple-600" />
                      <h3 className="text-sm font-medium text-gray-900">Service Information</h3>
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <p className="text-xs text-gray-500">Service Type</p>
                        <p className="text-sm font-medium text-gray-900">{saleData.bookingType || vehicleData.serviceType || 'N/A'}</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500">Booking Date</p>
                        <p className="text-sm font-medium text-gray-900">{formatDate(saleData.createdAt)}</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500">Service Date</p>
                        <p className="text-sm font-medium text-gray-900">{formatDate(saleData.formData?.date)}</p>
                      </div>
                      <div className="col-span-2">
                        <p className="text-xs text-gray-500">Notes</p>
                        <p className="text-sm font-medium text-gray-900 truncate" title={saleData.formData?.notes || saleData.notes || 'No notes'}>
                          {saleData.formData?.notes || saleData.notes || 'No notes'}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Payment & Status Section */}
                  <div className="bg-gray-50 rounded p-3 border border-gray-200">
                    <div className="flex items-center gap-2 mb-2">
                      <CreditCard className="h-4 w-4 text-indigo-600" />
                      <h3 className="text-sm font-medium text-gray-900">Payment & Status</h3>
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <p className="text-xs text-gray-500">Total Amount</p>
                        <p className="text-sm font-semibold text-gray-900">{formatCurrency(saleData.totalPrice)}</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500">Agent Commission</p>
                        <p className="text-sm font-semibold text-gray-900">
                          {saleData.agentCommission ? formatCurrency(saleData.agentCommission) : 'N/A'}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500">Status</p>
                        <div className="mt-0.5">{getStatusBadge(saleData.status)}</div>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500">Payment Status</p>
                        <div className="mt-0.5">{getPaymentStatusBadge(saleData.status)}</div>
                      </div>
                    </div>
                  </div>

                  {/* System Information */}
                  <div className="bg-gray-50 rounded p-3 border border-gray-200">
                    <div className="flex items-center gap-2 mb-2">
                      <Database className="h-4 w-4 text-gray-600" />
                      <h3 className="text-sm font-medium text-gray-900">System Information</h3>
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <p className="text-xs text-gray-500">Created</p>
                        <p className="text-xs font-medium text-gray-900">{formatDateTime(saleData.createdAt)}</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500">Updated</p>
                        <p className="text-xs font-medium text-gray-900">{formatDateTime(saleData.updatedAt)}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default SaleDetailsModal;