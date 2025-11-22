//src/components/BookingDetailsDialog.jsx
"use client";

import { useState, useEffect } from "react";
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
        return (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
              <Car className="w-5 h-5 text-blue-600" />
              Vehicle Details
            </h3>
            {formData.vehicleBookings?.map((v, index) => (
              <div
                key={v.id || index}
                className="bg-white border border-gray-200 rounded-lg p-4 space-y-3"
              >
                <div className="flex items-center justify-between">
                  <h4 className="font-medium text-gray-900 flex items-center gap-2">
                    <Car className="w-4 h-4 text-blue-500" />
                    Vehicle #{index + 1}
                  </h4>
                  <span className="bg-blue-50 text-blue-700 px-2 py-1 rounded text-xs font-medium">
                    {v.serviceType}
                  </span>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                  <div className="space-y-1">
                    <p className="text-gray-600">Main Service</p>
                    <p className="font-medium text-gray-900">{v.mainService || "—"}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-gray-600">Variant</p>
                    <p className="font-medium text-gray-900">{v.variant || "—"}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-gray-600">Package</p>
                    <p className="font-medium text-gray-900">{v.package || "—"}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-gray-600">Additional Services</p>
                    <p className="font-medium text-gray-900">
                      {v.additionalServices?.length > 0
                        ? v.additionalServices.join(", ")
                        : "None"}
                    </p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-gray-600">Make & Model</p>
                    <p className="font-medium text-gray-900">{v.vehicleMake} {v.vehicleModel}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-gray-600">Year & Color</p>
                    <p className="font-medium text-gray-900">{v.vehicleYear} • {v.vehicleColor}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        );

      case "chimney":
        return (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
              <Home className="w-5 h-5 text-orange-600" />
              Chimney Cleaning Details
            </h3>
            <div className="bg-white border border-gray-200 rounded-lg p-4 space-y-3">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                <div className="space-y-1">
                  <p className="text-gray-600">Service Type</p>
                  <p className="font-medium text-gray-900">{formData.bookingDetails?.serviceType || "—"}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-gray-600">Chimney Type</p>
                  <p className="font-medium text-gray-900">{formData.bookingDetails?.chimneyType || "—"}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-gray-600">Package</p>
                  <p className="font-medium text-gray-900">{formData.bookingDetails?.package || "—"}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-gray-600">Chimney Size</p>
                  <p className="font-medium text-gray-900">{formData.bookingDetails?.chimneySize || "—"}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-gray-600">Location</p>
                  <p className="font-medium text-gray-900">{formData.bookingDetails?.location || "—"}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-gray-600">Additional Services</p>
                  <p className="font-medium text-gray-900">
                    {formData.bookingDetails?.additionalServices?.length > 0
                      ? formData.bookingDetails.additionalServices.join(", ")
                      : "None"}
                  </p>
                </div>
              </div>
              {formData.bookingDetails?.specialRequirements && (
                <div className="bg-orange-50 p-3 rounded border border-orange-200">
                  <p className="text-sm text-orange-700 font-medium">Special Requirements</p>
                  <p className="text-orange-800 mt-1 text-sm">{formData.bookingDetails.specialRequirements}</p>
                </div>
              )}
            </div>
          </div>
        );

      case "duck-cleaning":
        return (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
              <Bird className="w-5 h-5 text-green-600" />
              Duck Cleaning Details
            </h3>
            <div className="bg-white border border-gray-200 rounded-lg p-4 space-y-3">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                <div className="space-y-1">
                  <p className="text-gray-600">Service Type</p>
                  <p className="font-medium text-gray-900">{formData.bookingDetails?.serviceType || "—"}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-gray-600">Package</p>
                  <p className="font-medium text-gray-900">{formData.bookingDetails?.package || "—"}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-gray-600">Duck Count</p>
                  <p className="font-medium text-gray-900">{formData.bookingDetails?.duckCount || "—"}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-gray-600">Area Size</p>
                  <p className="font-medium text-gray-900">{formData.bookingDetails?.areaSize || "—"}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-gray-600">Additional Services</p>
                  <p className="font-medium text-gray-900">
                    {formData.bookingDetails?.additionalServices?.length > 0
                      ? formData.bookingDetails.additionalServices.join(", ")
                      : "None"}
                  </p>
                </div>
              </div>
              {formData.bookingDetails?.specialRequirements && (
                <div className="bg-green-50 p-3 rounded border border-green-200">
                  <p className="text-sm text-green-700 font-medium">Special Requirements</p>
                  <p className="text-green-800 mt-1 text-sm">{formData.bookingDetails.specialRequirements}</p>
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
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Appointment Card */}
                <div className="bg-white border border-gray-200 rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Calendar className="w-4 h-4 text-blue-600" />
                    <h3 className="font-medium text-gray-900 text-sm">Appointment</h3>
                  </div>
                  <p className="text-lg font-semibold text-gray-900">{formData.date}</p>
                  <p className="text-gray-600 text-sm">{formData.timeSlot}</p>
                </div>

                {/* Customer Card */}
                <div className="bg-white border border-gray-200 rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <User className="w-4 h-4 text-green-600" />
                    <h3 className="font-medium text-gray-900 text-sm">Customer</h3>
                  </div>
                  <p className="font-semibold text-gray-900">{formData.firstName} {formData.lastName}</p>
                  <div className="space-y-1 mt-1">
                    <p className="text-gray-600 text-sm flex items-center gap-1">
                      <Phone className="w-3 h-3" />
                      {formData.phone}
                    </p>
                    <p className="text-gray-600 text-sm flex items-center gap-1">
                      <Mail className="w-3 h-3" />
                      {formData.email}
                    </p>
                  </div>
                </div>

                {/* Pricing Card */}
                <div className="bg-white border border-gray-200 rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <DollarSign className="w-4 h-4 text-purple-600" />
                    <h3 className="font-medium text-gray-900 text-sm">Payment</h3>
                  </div>
                  <div className="space-y-1">
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600 text-sm">Total:</span>
                      <span className="font-semibold text-gray-900">${totalPrice}</span>
                    </div>
                    {discountApplied && (
                      <div className="flex justify-between items-center">
                        <span className="text-gray-600 text-sm">Discount:</span>
                        <span className="font-semibold text-green-600">-${totalPrice - discountedPrice}</span>
                      </div>
                    )}
                    <div className="flex justify-between items-center border-t pt-1">
                      <span className="text-gray-700 text-sm font-medium">Final:</span>
                      <span className="text-lg font-bold text-purple-600">${discountedPrice}</span>
                    </div>
                  </div>
                </div>
              </div>

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
                      <p className="text-gray-600">Address</p>
                      <p className="font-medium text-gray-900">{formData.address}</p>
                    </div>
                    <div className="grid grid-cols-3 gap-3">
                      <div className="space-y-1">
                        <p className="text-gray-600">City</p>
                        <p className="font-medium text-gray-900">{formData.city}</p>
                      </div>
                      <div className="space-y-1">
                        <p className="text-gray-600">State</p>
                        <p className="font-medium text-gray-900">{formData.state}</p>
                      </div>
                      <div className="space-y-1">
                        <p className="text-gray-600">ZIP</p>
                        <p className="font-medium text-gray-900">{formData.zip}</p>
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