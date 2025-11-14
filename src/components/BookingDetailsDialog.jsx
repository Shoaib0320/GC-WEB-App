"use client";

import { useState } from "react";
import {
  AlertDialog,
  AlertDialogTrigger,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogFooter,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogCancel,
  AlertDialogAction,
} from "@/components/ui/alert-dialog";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogTitle,
} from "@/components/ui/dialog";
import { Calendar } from "@/components/ui/calendar";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { X, Loader2 } from "lucide-react";
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

  if (!booking) return null;

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
    formData,
    vehicleCount,
    createdAt,
  } = booking;

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
    onClose();    
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-[95vw] lg:max-w-[1400px] p-0 overflow-hidden max-h-[95vh]">
        {/* Header */}
        <div className="sticky top-0 bg-white dark:bg-gray-950 z-10 border-b flex items-center justify-between px-6 py-4">
          <div>
            <DialogTitle className="text-xl font-semibold">
              Booking Details
            </DialogTitle>
            <DialogDescription className="text-sm text-muted-foreground">
              Complete details for booking ID <strong>{bookingId}</strong>
            </DialogDescription>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            className="rounded-full hover:bg-gray-100 dark:hover:bg-gray-800"
          >
            <X className="h-5 w-5" />
          </Button>
        </div>

        {/* Content */}
        <div className="px-6 py-6 max-h-[70vh] overflow-y-auto space-y-6">
          {/* Booking Info */}
          <section className="space-y-3">
            <h3 className="text-lg font-semibold text-blue-600 dark:text-blue-400 flex items-center gap-2">
              📋 Booking Information
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 p-4 bg-muted/30 rounded-lg border">
              <div className="space-y-1">
                <p className="text-xs text-muted-foreground">Status</p>
                <p className="font-semibold capitalize">{status}</p>
              </div>
              <div className="space-y-1">
                <p className="text-xs text-muted-foreground">Website</p>
                <p className="font-semibold">{webName}</p>
              </div>
              <div className="space-y-1">
                <p className="text-xs text-muted-foreground">Vehicle Count</p>
                <p className="font-semibold">{vehicleCount}</p>
              </div>
              <div className="space-y-1">
                <p className="text-xs text-muted-foreground">Submitted At</p>
                <p className="font-semibold text-sm">
                  {new Date(submittedAt).toLocaleString()}
                </p>
              </div>
              <div className="space-y-1">
                <p className="text-xs text-muted-foreground">Created</p>
                <p className="font-semibold text-sm">
                  {new Date(createdAt).toLocaleString()}
                </p>
              </div>
            </div>
          </section>

          <Separator />

          {/* Customer Info */}
          <section className="space-y-3">
            <h3 className="text-lg font-semibold text-green-600 dark:text-green-400 flex items-center gap-2">
              👤 Customer Information
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 p-4 bg-muted/30 rounded-lg border">
              <div className="space-y-1">
                <p className="text-xs text-muted-foreground">Full Name</p>
                <p className="font-semibold">
                  {formData.firstName} {formData.lastName}
                </p>
              </div>
              <div className="space-y-1">
                <p className="text-xs text-muted-foreground">Email</p>
                <p className="font-semibold text-sm">{formData.email}</p>
              </div>
              <div className="space-y-1">
                <p className="text-xs text-muted-foreground">Phone</p>
                <p className="font-semibold">{formData.phone}</p>
              </div>
              <div className="space-y-1">
                <p className="text-xs text-muted-foreground">Address</p>
                <p className="font-semibold text-sm">{formData.address}</p>
              </div>
              <div className="space-y-1">
                <p className="text-xs text-muted-foreground">City</p>
                <p className="font-semibold">{formData.city}</p>
              </div>
              <div className="space-y-1">
                <p className="text-xs text-muted-foreground">State</p>
                <p className="font-semibold">{formData.state}</p>
              </div>
              <div className="space-y-1">
                <p className="text-xs text-muted-foreground">ZIP Code</p>
                <p className="font-semibold">{formData.zip}</p>
              </div>
              <div className="space-y-1">
                <p className="text-xs text-muted-foreground">Appointment Date</p>
                <p className="font-semibold">{formData.date}</p>
              </div>
              <div className="space-y-1">
                <p className="text-xs text-muted-foreground">Time Slot</p>
                <p className="font-semibold">{formData.timeSlot}</p>
              </div>
            </div>
          </section>

          <Separator />

          {/* Vehicle Info */}
          <section className="space-y-4">
            <h3 className="text-lg font-semibold text-yellow-600 dark:text-yellow-400 flex items-center gap-2">
              🚗 Vehicle Details
            </h3>
            {formData.vehicleBookings?.map((v, index) => (
              <div
                key={v.id || index}
                className="p-5 border-2 rounded-lg bg-muted/30 space-y-3 hover:shadow-md transition-shadow"
              >
                <p className="font-bold text-base text-gray-800 dark:text-gray-100 border-b pb-2">
                  Vehicle #{index + 1}
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div className="space-y-1">
                    <p className="text-xs text-muted-foreground">Main Service</p>
                    <p className="font-semibold">{v.mainService}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-xs text-muted-foreground">Service Type</p>
                    <p className="font-semibold capitalize">{v.serviceType}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-xs text-muted-foreground">Variant</p>
                    <p className="font-semibold capitalize">{v.variant || "—"}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-xs text-muted-foreground">Package</p>
                    <p className="font-semibold">{v.package}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-xs text-muted-foreground">Vehicle Make</p>
                    <p className="font-semibold">{v.vehicleMake}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-xs text-muted-foreground">Vehicle Model</p>
                    <p className="font-semibold">{v.vehicleModel}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-xs text-muted-foreground">Year</p>
                    <p className="font-semibold">{v.vehicleYear}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-xs text-muted-foreground">Color</p>
                    <p className="font-semibold capitalize">{v.vehicleColor}</p>
                  </div>
                  {v.vehicleLength && (
                    <div className="space-y-1">
                      <p className="text-xs text-muted-foreground">Length</p>
                      <p className="font-semibold">{v.vehicleLength} ft</p>
                    </div>
                  )}
                  {v.additionalServices && v.additionalServices.length > 0 && (
                    <div className="space-y-1 sm:col-span-2 lg:col-span-4">
                      <p className="text-xs text-muted-foreground">Additional Services</p>
                      <p className="font-semibold text-sm">
                        {v.additionalServices.join(", ")}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </section>

          <Separator />

          {/* Payment Summary */}
          <section className="space-y-3">
            <h3 className="text-lg font-semibold text-orange-600 dark:text-orange-400 flex items-center gap-2">
              💰 Payment Summary
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 p-4 bg-muted/30 rounded-lg border">
              <div className="space-y-1">
                <p className="text-xs text-muted-foreground">Total Price</p>
                <p className="font-bold text-lg">${totalPrice}</p>
              </div>
              <div className="space-y-1">
                <p className="text-xs text-muted-foreground">Discounted Price</p>
                <p className="font-bold text-lg text-green-600 dark:text-green-400">
                  ${discountedPrice}
                </p>
              </div>
              <div className="space-y-1">
                <p className="text-xs text-muted-foreground">Discount Applied</p>
                <p className="font-semibold">
                  {discountApplied ? `Yes (${discountPercent}%)` : "No"}
                </p>
              </div>
              <div className="space-y-1">
                <p className="text-xs text-muted-foreground">Promo Code</p>
                <p className="font-semibold">{promoCode || "—"}</p>
              </div>
              {discountApplied && (
                <div className="space-y-1 sm:col-span-2">
                  <p className="text-xs text-muted-foreground">Savings</p>
                  <p className="font-bold text-lg text-green-600 dark:text-green-400">
                    -${(totalPrice - discountedPrice).toFixed(2)}
                  </p>
                </div>
              )}
            </div>
          </section>

          {/* Notes Section */}
          {formData.notes && (
            <>
              <Separator />
              <section className="space-y-3">
                <h3 className="text-lg font-semibold text-purple-600 dark:text-purple-400 flex items-center gap-2">
                  📝 Additional Notes
                </h3>
                <div className="p-4 bg-muted/30 rounded-lg border">
                  <p className="text-sm">{formData.notes}</p>
                </div>
              </section>
            </>
          )}
        </div>

        {/* 🔹 Footer Buttons (4 buttons) */}
        <DialogFooter className="sticky bottom-0 bg-white dark:bg-gray-950 border-t px-6 py-4 flex flex-wrap gap-3 justify-end">
          {/*  Cancel Booking */}
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button
                variant="destructive"
                // ✅ UPDATED
                disabled={
                  loading || status === "cancelled" || status === "completed"
                }
                className="bg-red-600 hover:bg-red-700 min-w-[120px]"
              >
                Cancel
              </Button>
            </AlertDialogTrigger>

            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Cancel this booking?</AlertDialogTitle>
                <AlertDialogDescription>
                  This action cannot be undone. The booking will be marked as
                  cancelled.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <div className="grid w-full gap-1.5 py-2">
                <Label htmlFor="cancellationReason">
                  Reason for Cancellation
                </Label>
                <Textarea
                  placeholder="e.g., Customer request, scheduling conflict..."
                  id="cancellationReason"
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                />
              </div>
              <AlertDialogFooter>
                <AlertDialogCancel>Go Back</AlertDialogCancel>
                <AlertDialogAction
                  // onClick={() => updateBookingStatus("cancelled")}
                  // className="bg-red-600 hover:bg-red-700"
                  onClick={() => updateBookingStatus("cancelled", reason)}
                  disabled={!reason.trim()} 
                  className="bg-red-600 hover:bg-red-700"
                >
                  Yes, Cancel
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>

          {/* ✅ Confirm Booking */}
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button
                variant="default"
                // ✅ UPDATED
                disabled={
                  loading ||
                  status === "confirmed" ||
                  status === "completed" ||
                  status === "rescheduled"
                }
                className="bg-green-600 hover:bg-green-700 min-w-[120px]"
              >
                Confirm
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Confirm this booking?</AlertDialogTitle>
                <AlertDialogDescription>
                  Once confirmed, this booking will be finalized.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Go Back</AlertDialogCancel>
                <AlertDialogAction
                  onClick={() => updateBookingStatus("confirmed")}
                  className="bg-green-600 hover:bg-green-700"
                >
                  Yes, Confirm
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>

          {/* 🟦 Complete Booking */}
          <Button
            variant="default"
            // ✅ UPDATED: Added logic for 'cancelled'
            disabled={
              loading || status === "completed" || status === "cancelled"
            }
            onClick={() => updateBookingStatus("completed")}
            className="bg-blue-600 hover:bg-blue-700 min-w-[120px]"
          >
            {loading && status !== "completed" ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin mr-2" /> Processing...
              </>
            ) : (
              "Complete"
            )}
          </Button>

          {/* 🟨 Reschedule Booking */}
          <Button
            variant="secondary"
            onClick={() => setShowReschedule(true)}
            // ✅ UPDATED
            disabled={
              loading || status === "completed" || status === "cancelled"
            }
            className="bg-yellow-500 hover:bg-yellow-600 text-white min-w-[120px]"
          >
            Reschedule
          </Button>
        </DialogFooter>
      </DialogContent>
      {showReschedule && (
        <RescheduleBooking
          booking={booking}
          isOpen={showReschedule}
          onClose={() => setShowReschedule(false)}
          onSuccess={(updatedBooking) => {
            if (onStatusChange) onStatusChange(updatedBooking);
            setShowReschedule(false);
          }}
        />
      )}
    </Dialog>
  );
}



