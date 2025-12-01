//src/components/BookingDetailsDialog.jsx
"use client";

import { useState, useEffect } from "react";
import { useAuth } from '@/context/AuthContext';
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { X, Loader2, Car, Home, Bird, Calendar, Clock, User, Phone, Mail, MapPin, DollarSign } from "lucide-react";
import { toast } from "sonner";
import { RescheduleBooking } from "@/components/RescheduleBooking";

export default function BookingDetailsDialog({
  booking,
  open,
  onClose,
  onStatusChange,
}) {
  const [loading, setLoading] = useState(false);
  const [showReschedule, setShowReschedule] = useState(false);
  const [reason, setReason] = useState("");
  const [showCancelDialog, setShowCancelDialog] = useState(false);

  // Permissions
  const { hasPermission } = useAuth();
  const canChangeStatus = hasPermission('booking', 'update_status') || hasPermission('booking', 'edit');

  // Close on escape key
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape' && open) {
        handleClose();
      }
    };
    
    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [open]);

  // Disable body scroll when modal is open
  useEffect(() => {
    if (open) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [open]);

  if (!open || !booking) return null;

  const {
    _id,
    bookingId,
    status,
    totalPrice,
    discountedPrice,
    discountApplied,
    discountPercent,
    promoCode,
    promoCodeId,
    submittedAt,
    webName,
    vendorName,
    bookingType,
    formData,
    vehicleCount,
    serviceCount,
    createdAt,
    cancellationReason,
  } = booking;

  // 🔹 Get booking type icon and color
  const getBookingTypeInfo = (type) => {
    switch (type) {
      case "vehicle":
        return { icon: Car, color: "text-blue-600", bgColor: "bg-blue-50", label: "Vehicle Cleaning" };
      case "chimney":
        return { icon: Home, color: "text-orange-600", bgColor: "bg-orange-50", label: "Chimney Cleaning" };
      case "duck-cleaning":
        return { icon: Bird, color: "text-green-600", bgColor: "bg-green-50", label: "Duck Cleaning" };
      default:
        return { icon: Car, color: "text-gray-600", bgColor: "bg-gray-50", label: "Service" };
    }
  };

  const bookingTypeInfo = getBookingTypeInfo(bookingType);
  const BookingTypeIcon = bookingTypeInfo.icon;

  // 🔹 Get status color
  const getStatusColor = (status) => {
    switch (status) {
      case 'confirmed': return 'bg-green-100 text-green-800 border-green-200';
      case 'completed': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'cancelled': return 'bg-red-100 text-red-800 border-red-200';
      case 'rescheduled': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  // 🔹 Render booking details based on type
  const renderBookingDetails = () => {
    switch (bookingType) {
      case "vehicle":
        // ✅ Check if using new bookingDetails format or old vehicleBookings format
        if (formData.bookingDetails) {
          // New format - single service booking
          const details = formData.bookingDetails;
          return (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                <Car className="w-5 h-5 text-blue-600" />
                Vehicle Details
              </h3>
              <div className="bg-white border border-gray-200 rounded-lg p-4 space-y-3">
                <div className="flex items-center justify-between mb-3 pb-3 border-b">
                  <h4 className="font-medium text-gray-900 flex items-center gap-2">
                    <Car className="w-4 h-4 text-blue-500" />
                    {details.serviceName || "Vehicle Service"}
                  </h4>
                  <span className="bg-blue-50 text-blue-700 px-3 py-1 rounded-full text-xs font-medium">
                    {details.variant ? details.variant.toUpperCase() : bookingType.toUpperCase()}
                  </span>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 text-sm">
                  <div className="space-y-1">
                    <p className="text-gray-600 font-medium">Service Type</p>
                    <p className="text-gray-900">{details.serviceName || details.serviceType || "—"}</p>
                  </div>
                  {details.variant && (
                    <div className="space-y-1">
                      <p className="text-gray-600 font-medium">Vehicle Variant</p>
                      <p className="text-gray-900 capitalize">{details.variant}</p>
                    </div>
                  )}
                  <div className="space-y-1">
                    <p className="text-gray-600 font-medium">Package</p>
                    <p className="text-gray-900">{details.packageName || details.package || "—"}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-gray-600 font-medium">Make & Model</p>
                    <p className="text-gray-900">{details.vehicleMake} {details.vehicleModel}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-gray-600 font-medium">Year</p>
                    <p className="text-gray-900">{details.vehicleYear || "—"}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-gray-600 font-medium">Color</p>
                    <p className="text-gray-900 capitalize">{details.vehicleColor || "—"}</p>
                  </div>
                  {details.vehicleLength && (
                    <div className="space-y-1">
                      <p className="text-gray-600 font-medium">Vehicle Length</p>
                      <p className="text-gray-900">{details.vehicleLength} feet</p>
                    </div>
                  )}
                </div>

                {/* Additional Services */}
                {details.additionalServices && details.additionalServices.length > 0 && (
                  <div className="bg-blue-50 p-3 rounded-lg border border-blue-200 mt-3">
                    <p className="text-sm text-blue-700 font-medium mb-2">Additional Services</p>
                    <div className="flex flex-wrap gap-2">
                      {details.additionalServices.map((service, idx) => (
                        <span key={idx} className="bg-white text-blue-700 px-2 py-1 rounded text-xs border border-blue-300">
                          {service}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Special Requirements */}
                {details.specialRequirements && (
                  <div className="bg-yellow-50 p-3 rounded-lg border border-yellow-200 mt-3">
                    <p className="text-sm text-yellow-700 font-medium">Special Requirements</p>
                    <p className="text-yellow-800 mt-1 text-sm">{details.specialRequirements}</p>
                  </div>
                )}
              </div>
            </div>
          );
        }
        
        // Old format - multiple vehicle bookings
        return (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
              <Car className="w-5 h-5 text-blue-600" />
              Vehicle Details ({vehicleCount} {vehicleCount === 1 ? 'Vehicle' : 'Vehicles'})
            </h3>
            {formData.vehicleBookings?.map((v, index) => (
              <div
                key={v.id || index}
                className="bg-white border border-gray-200 rounded-lg p-4 space-y-3"
              >
                <div className="flex items-center justify-between mb-3 pb-3 border-b">
                  <h4 className="font-medium text-gray-900 flex items-center gap-2">
                    <Car className="w-4 h-4 text-blue-500" />
                    Vehicle #{index + 1}
                  </h4>
                  <span className="bg-blue-50 text-blue-700 px-3 py-1 rounded-full text-xs font-medium">
                    {v.variant ? v.variant.toUpperCase() : v.serviceType.toUpperCase()}
                  </span>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 text-sm">
                  <div className="space-y-1">
                    <p className="text-gray-600 font-medium">Service Type</p>
                    <p className="text-gray-900">{v.serviceType || "—"}</p>
                  </div>
                  {v.variant && (
                    <div className="space-y-1">
                      <p className="text-gray-600 font-medium">Vehicle Variant</p>
                      <p className="text-gray-900 capitalize">{v.variant}</p>
                    </div>
                  )}
                  <div className="space-y-1">
                    <p className="text-gray-600 font-medium">Main Service</p>
                    <p className="text-gray-900">{v.mainService || "—"}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-gray-600 font-medium">Package</p>
                    <p className="text-gray-900">{v.package || "—"}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-gray-600 font-medium">Make & Model</p>
                    <p className="text-gray-900">{v.vehicleMake} {v.vehicleModel}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-gray-600 font-medium">Year</p>
                    <p className="text-gray-900">{v.vehicleYear || "—"}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-gray-600 font-medium">Color</p>
                    <p className="text-gray-900 capitalize">{v.vehicleColor || "—"}</p>
                  </div>
                  {v.vehicleLength && (
                    <div className="space-y-1">
                      <p className="text-gray-600 font-medium">Vehicle Length</p>
                      <p className="text-gray-900">{v.vehicleLength} feet</p>
                    </div>
                  )}
                </div>

                {/* Additional Services */}
                {v.additionalServices && v.additionalServices.length > 0 && (
                  <div className="bg-blue-50 p-3 rounded-lg border border-blue-200 mt-3">
                    <p className="text-sm text-blue-700 font-medium mb-2">Additional Services</p>
                    <div className="flex flex-wrap gap-2">
                      {v.additionalServices.map((service, idx) => (
                        <span key={idx} className="bg-white text-blue-700 px-2 py-1 rounded text-xs border border-blue-300">
                          {service}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        );

      case "chimney":
        const chimneyDetails = formData.bookingDetails || {};
        return (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
              <Home className="w-5 h-5 text-orange-600" />
              Chimney Cleaning Details
            </h3>
            <div className="bg-white border border-gray-200 rounded-lg p-4 space-y-3">
              <div className="flex items-center justify-between mb-3 pb-3 border-b">
                <h4 className="font-medium text-gray-900 flex items-center gap-2">
                  <Home className="w-4 h-4 text-orange-500" />
                  {chimneyDetails.serviceName || "Chimney Service"}
                </h4>
                <span className="bg-orange-50 text-orange-700 px-3 py-1 rounded-full text-xs font-medium">
                  CHIMNEY
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 text-sm">
                <div className="space-y-1">
                  <p className="text-gray-600 font-medium">Service Type</p>
                  <p className="text-gray-900">{chimneyDetails.serviceName || chimneyDetails.serviceType || "—"}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-gray-600 font-medium">Package</p>
                  <p className="text-gray-900">{chimneyDetails.packageName || chimneyDetails.package || "—"}</p>
                </div>
                {chimneyDetails.chimneyType && (
                  <div className="space-y-1">
                    <p className="text-gray-600 font-medium">Chimney Type</p>
                    <p className="text-gray-900 capitalize">{chimneyDetails.chimneyType}</p>
                  </div>
                )}
                {chimneyDetails.chimneySize && (
                  <div className="space-y-1">
                    <p className="text-gray-600 font-medium">Chimney Size</p>
                    <p className="text-gray-900 capitalize">{chimneyDetails.chimneySize}</p>
                  </div>
                )}
                {chimneyDetails.location && (
                  <div className="space-y-1">
                    <p className="text-gray-600 font-medium">Location in Property</p>
                    <p className="text-gray-900">{chimneyDetails.location}</p>
                  </div>
                )}
              </div>

              {/* Additional Services */}
              {chimneyDetails.additionalServices && chimneyDetails.additionalServices.length > 0 && (
                <div className="bg-orange-50 p-3 rounded-lg border border-orange-200 mt-3">
                  <p className="text-sm text-orange-700 font-medium mb-2">Additional Services</p>
                  <div className="flex flex-wrap gap-2">
                    {chimneyDetails.additionalServices.map((service, idx) => (
                      <span key={idx} className="bg-white text-orange-700 px-2 py-1 rounded text-xs border border-orange-300">
                        {service}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Special Requirements */}
              {chimneyDetails.specialRequirements && (
                <div className="bg-yellow-50 p-3 rounded-lg border border-yellow-200 mt-3">
                  <p className="text-sm text-yellow-700 font-medium">Special Requirements</p>
                  <p className="text-yellow-800 mt-1 text-sm">{chimneyDetails.specialRequirements}</p>
                </div>
              )}
            </div>
          </div>
        );

      case "duck-cleaning":
        const duckDetails = formData.bookingDetails || {};
        return (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
              <Bird className="w-5 h-5 text-green-600" />
              Duck Cleaning / Pond Maintenance Details
            </h3>
            <div className="bg-white border border-gray-200 rounded-lg p-4 space-y-3">
              <div className="flex items-center justify-between mb-3 pb-3 border-b">
                <h4 className="font-medium text-gray-900 flex items-center gap-2">
                  <Bird className="w-4 h-4 text-green-500" />
                  {duckDetails.serviceName || "Duck Cleaning Service"}
                </h4>
                <span className="bg-green-50 text-green-700 px-3 py-1 rounded-full text-xs font-medium">
                  DUCK CLEANING
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 text-sm">
                <div className="space-y-1">
                  <p className="text-gray-600 font-medium">Service Type</p>
                  <p className="text-gray-900">{duckDetails.serviceName || duckDetails.serviceType || "—"}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-gray-600 font-medium">Package</p>
                  <p className="text-gray-900">{duckDetails.packageName || duckDetails.package || "—"}</p>
                </div>
                {duckDetails.duckCount && (
                  <div className="space-y-1">
                    <p className="text-gray-600 font-medium">Duck Count</p>
                    <p className="text-gray-900">{duckDetails.duckCount} ducks</p>
                  </div>
                )}
                {duckDetails.areaSize && (
                  <div className="space-y-1">
                    <p className="text-gray-600 font-medium">Area Size</p>
                    <p className="text-gray-900 capitalize">{duckDetails.areaSize}</p>
                  </div>
                )}
              </div>

              {/* Additional Services */}
              {duckDetails.additionalServices && duckDetails.additionalServices.length > 0 && (
                <div className="bg-green-50 p-3 rounded-lg border border-green-200 mt-3">
                  <p className="text-sm text-green-700 font-medium mb-2">Additional Services</p>
                  <div className="flex flex-wrap gap-2">
                    {duckDetails.additionalServices.map((service, idx) => (
                      <span key={idx} className="bg-white text-green-700 px-2 py-1 rounded text-xs border border-green-300">
                        {service}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Special Requirements */}
              {duckDetails.specialRequirements && (
                <div className="bg-yellow-50 p-3 rounded-lg border border-yellow-200 mt-3">
                  <p className="text-sm text-yellow-700 font-medium">Special Requirements</p>
                  <p className="text-yellow-800 mt-1 text-sm">{duckDetails.specialRequirements}</p>
                </div>
              )}
            </div>
          </div>
        );

      default:
        return (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900">
              Service Details
            </h3>
            <div className="bg-white border border-gray-200 rounded-lg p-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div className="space-y-1">
                  <p className="text-gray-600">Service Type</p>
                  <p className="font-medium text-gray-900">{formData.bookingDetails?.serviceType || "—"}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-gray-600">Package</p>
                  <p className="font-medium text-gray-900">{formData.bookingDetails?.package || "—"}</p>
                </div>
              </div>
            </div>
          </div>
        );
    }
  };

  // 🔹 Booking status update function
  const updateBookingStatus = async (newStatus, cancellationReason = null) => {
    // Client-side guard: ensure user has permission to change status
    if (!hasPermission('booking', 'update_status') && !hasPermission('booking', 'edit')) {
      toast.error("You don't have permission to change booking status");
      return;
    }

    try {
      setLoading(true);
      const bodyPayload = {
        status: newStatus,
      };
      if (newStatus === "cancelled" && cancellationReason) {
        bodyPayload.cancellationReason = cancellationReason;
      }
      
      const response = await fetch(`/api/booking/${_id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(bodyPayload),
      });

      if (!response.ok) throw new Error(`Failed to ${newStatus} booking`);
      const data = await response.json();

      if (onStatusChange) {
        onStatusChange({
          ...booking,
          status: newStatus,
          cancellationReason: cancellationReason,
        });
      }

      toast.success(
        newStatus === "confirmed"
          ? `Booking ID ${bookingId} confirmed ✅`
          : newStatus === "completed"
          ? `Booking ID ${bookingId} marked as completed ✅`
          : `Booking ID ${bookingId} cancelled ❌`
      );
      setReason("");
      setShowCancelDialog(false);
      onClose();
    } catch (err) {
      console.error(err);
      toast.error(`Failed to ${newStatus} booking ❌`);
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setReason("");
    setShowCancelDialog(false);
    onClose();    
  };

  // Custom Cancel Dialog Component
  const CancelDialog = () => (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[100] p-4">
      <div className="bg-white rounded-lg max-w-md w-full p-6">
        <div className="space-y-4">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Cancel this booking?</h3>
            <p className="text-gray-600 mt-1 text-sm">
              This action cannot be undone. The booking will be marked as cancelled.
            </p>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="cancellationReason" className="text-sm font-medium">
              Reason for Cancellation
            </Label>
            <Textarea
              placeholder="e.g., Customer request, scheduling conflict..."
              id="cancellationReason"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              className="min-h-[80px] resize-none text-sm"
            />
          </div>
          
          <div className="flex gap-3 justify-end pt-2">
            <Button
              variant="outline"
              onClick={() => setShowCancelDialog(false)}
              className="px-4 text-sm"
            >
              Go Back
            </Button>
            <Button
              onClick={() => updateBookingStatus("cancelled", reason)}
              disabled={!reason.trim() || loading}
              className="bg-red-600 hover:bg-red-700 px-4 text-sm"
            >
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Yes, Cancel"}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* Main Modal Overlay */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        {/* Backdrop */}
        <div 
          className="absolute inset-0 bg-black/50 backdrop-blur-sm"
          onClick={handleClose}
        />
        
        {/* Modal Container */}
        <div className="relative bg-white rounded-lg w-full h-full max-w-6xl max-h-[90vh] flex flex-col shadow-xl overflow-hidden">
          {/* Header */}
          <div className="flex-shrink-0 bg-white border-b border-gray-200 px-6 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className={`p-2 rounded-lg ${bookingTypeInfo.bgColor}`}>
                  <BookingTypeIcon className={`w-5 h-5 ${bookingTypeInfo.color}`} />
                </div>
                <div>
                  <h1 className="text-xl font-semibold text-gray-900">Booking Details</h1>
                  <div className="flex items-center gap-2 mt-1 flex-wrap">
                    <span className="bg-gray-100 text-gray-700 px-2 py-1 rounded text-xs font-medium">
                      ID: {bookingId}
                    </span>
                    <span className={`px-2 py-1 rounded text-xs font-medium border ${getStatusColor(status)}`}>
                      {status}
                    </span>
                    <span className="text-xs text-gray-600">
                      {bookingTypeInfo.label} • {vendorName}
                    </span>
                  </div>
                </div>
              </div>
              
              <Button
                variant="ghost"
                size="icon"
                onClick={handleClose}
                className="text-gray-500 hover:bg-gray-100 rounded-lg h-8 w-8"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Content Area - Scrollable */}
          <div className="flex-1 overflow-auto">
            <div className="p-6 space-y-6">
              {/* Quick Overview Cards */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                {/* Booking Type Card */}
                <div className={`${bookingTypeInfo.bgColor} border border-gray-200 rounded-lg p-4`}>
                  <div className="flex items-center gap-2 mb-2">
                    <BookingTypeIcon className={`w-4 h-4 ${bookingTypeInfo.color}`} />
                    <h3 className="font-medium text-gray-900 text-sm">Service Type</h3>
                  </div>
                  <p className={`text-sm font-semibold ${bookingTypeInfo.color}`}>{bookingTypeInfo.label}</p>
                  <p className="text-gray-600 text-xs mt-1">
                    {bookingType === 'vehicle' 
                      ? `${vehicleCount || serviceCount} ${vehicleCount === 1 ? 'Vehicle' : 'Vehicles'}`
                      : `${serviceCount} Service${serviceCount === 1 ? '' : 's'}`
                    }
                  </p>
                </div>

                {/* Appointment Card */}
                <div className="bg-white border border-gray-200 rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Calendar className="w-4 h-4 text-blue-600" />
                    <h3 className="font-medium text-gray-900 text-sm">Appointment</h3>
                  </div>
                  <p className="text-sm font-semibold text-gray-900">{formData.date}</p>
                  <p className="text-gray-600 text-xs mt-1">{formData.timeSlot}</p>
                </div>

                {/* Customer Card */}
                <div className="bg-white border border-gray-200 rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <User className="w-4 h-4 text-green-600" />
                    <h3 className="font-medium text-gray-900 text-sm">Customer</h3>
                  </div>
                  <p className="text-sm font-semibold text-gray-900">{formData.firstName} {formData.lastName}</p>
                  <p className="text-gray-600 text-xs mt-1 flex items-center gap-1">
                    <Phone className="w-3 h-3" />
                    {formData.phone}
                  </p>
                </div>

                {/* Pricing Card */}
                <div className="bg-white border border-gray-200 rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <DollarSign className="w-4 h-4 text-purple-600" />
                    <h3 className="font-medium text-gray-900 text-sm">Payment</h3>
                  </div>
                  <div className="space-y-1">
                    {discountApplied ? (
                      <>
                        <div className="flex justify-between items-center text-xs">
                          <span className="text-gray-600">Original:</span>
                          <span className="line-through text-gray-500">${totalPrice}</span>
                        </div>
                        <div className="flex justify-between items-center text-xs">
                          <span className="text-green-600">Saved:</span>
                          <span className="font-semibold text-green-600">-${(totalPrice - discountedPrice).toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between items-center pt-1 border-t">
                          <span className="text-gray-700 text-xs font-medium">Final:</span>
                          <span className="text-sm font-bold text-purple-600">${discountedPrice}</span>
                        </div>
                      </>
                    ) : (
                      <div className="flex justify-between items-center">
                        <span className="text-gray-700 text-xs font-medium">Total:</span>
                        <span className="text-sm font-bold text-purple-600">${totalPrice}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Promo Code Info */}
              {promoCodeId && discountApplied && (
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="bg-green-100 p-2 rounded-lg">
                        <DollarSign className="w-4 h-4 text-green-600" />
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-green-900">Promo Code Applied</p>
                        <p className="text-xs text-green-700 mt-0.5">
                          Code: <span className="font-mono font-bold">{promoCodeId.promoCode}</span> • {discountPercent}% discount
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-bold text-green-600">-${(totalPrice - discountedPrice).toFixed(2)}</p>
                      <p className="text-xs text-green-700">You saved!</p>
                    </div>
                  </div>
                </div>
              )}

              <Separator />

              {/* Service Details */}
              {renderBookingDetails()}

              <Separator />

              {/* Address Section */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                  <MapPin className="w-5 h-5 text-red-600" />
                  Service Location
                </h3>
                <div className="bg-white border border-gray-200 rounded-lg p-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                    <div className="space-y-1">
                      <p className="text-gray-600 font-medium">Street Address</p>
                      <p className="text-gray-900">{formData.address || "—"}</p>
                    </div>
                    <div className="grid grid-cols-3 gap-3">
                      <div className="space-y-1">
                        <p className="text-gray-600 font-medium">City</p>
                        <p className="text-gray-900">{formData.city || "—"}</p>
                      </div>
                      <div className="space-y-1">
                        <p className="text-gray-600 font-medium">State</p>
                        <p className="text-gray-900">{formData.state || "—"}</p>
                      </div>
                      <div className="space-y-1">
                        <p className="text-gray-600 font-medium">ZIP</p>
                        <p className="text-gray-900">{formData.zip || "—"}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Contact Information */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                  <Mail className="w-5 h-5 text-blue-600" />
                  Contact Information
                </h3>
                <div className="bg-white border border-gray-200 rounded-lg p-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="flex items-center gap-3">
                      <div className="bg-blue-50 p-2 rounded-lg">
                        <Mail className="w-4 h-4 text-blue-600" />
                      </div>
                      <div>
                        <p className="text-xs text-gray-600 font-medium">Email Address</p>
                        <p className="text-sm text-gray-900 font-medium">{formData.email}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="bg-green-50 p-2 rounded-lg">
                        <Phone className="w-4 h-4 text-green-600" />
                      </div>
                      <div>
                        <p className="text-xs text-gray-600 font-medium">Phone Number</p>
                        <p className="text-sm text-gray-900 font-medium">{formData.phone}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Additional Notes */}
              {formData.notes && (
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-gray-900">Customer Notes</h3>
                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                    <p className="text-gray-700 text-sm">{formData.notes}</p>
                  </div>
                </div>
              )}

              {/* Cancellation Reason */}
              {cancellationReason && (
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-gray-900">Cancellation Reason</h3>
                  <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                    <p className="text-red-700 text-sm">{cancellationReason}</p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Footer Actions */}
          <div className="flex-shrink-0 bg-gray-50 border-t border-gray-200 px-6 py-4">
              <div className="flex flex-wrap gap-2 justify-end">
                {canChangeStatus ? (
                  <>
                    <Button
                      variant="outline"
                      onClick={() => setShowCancelDialog(true)}
                      disabled={loading || status === "cancelled" || status === "completed"}
                      className="border-red-300 text-red-700 hover:bg-red-50 hover:text-red-800 px-4 py-2 text-sm"
                    >
                      Cancel Booking
                    </Button>

                    <Button
                      onClick={() => updateBookingStatus("confirmed")}
                      disabled={loading || status === "confirmed" || status === "completed" || status === "rescheduled"}
                      className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 text-sm"
                    >
                      Confirm Booking
                    </Button>

                    <Button
                      onClick={() => updateBookingStatus("completed")}
                      disabled={loading || status === "completed" || status === "cancelled"}
                      className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 text-sm"
                    >
                      {loading ? <Loader2 className="w-4 h-4 animate-spin mr-1" /> : null}
                      Complete Booking
                    </Button>

                    <Button
                      onClick={() => setShowReschedule(true)}
                      disabled={loading || status === "completed" || status === "cancelled"}
                      className="bg-yellow-500 hover:bg-yellow-600 text-white px-4 py-2 text-sm"
                    >
                      Reschedule
                    </Button>
                  </>
                ) : (
                  <div className="text-sm text-gray-600 py-2">You don't have permission to change booking status.</div>
                )}
              </div>
          </div>
        </div>
      </div>

      {/* Cancel Confirmation Dialog */}
      {showCancelDialog && <CancelDialog />}

      {/* Reschedule Component */}
      {showReschedule && (
        <RescheduleBooking
          booking={booking}
          isOpen={showReschedule}
          onClose={() => setShowReschedule(false)}
          onSuccess={(updatedBooking) => {
            if (onStatusChange) onStatusChange(updatedBooking);
            setShowReschedule(false);
            onClose();
          }}
        />
      )}
    </>
  );
}