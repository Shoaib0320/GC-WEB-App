// "use client";

// import { useState } from "react";
// import {
//   AlertDialog,
//   AlertDialogTrigger,
//   AlertDialogContent,
//   AlertDialogHeader,
//   AlertDialogFooter,
//   AlertDialogTitle,
//   AlertDialogDescription,
//   AlertDialogCancel,
//   AlertDialogAction,
// } from "@/components/ui/alert-dialog";
// import {
//   Dialog,
//   DialogContent,
//   DialogDescription,
//   DialogFooter,
//   DialogTitle,
// } from "@/components/ui/dialog";
// import { Calendar } from "@/components/ui/calendar";
// import { Separator } from "@/components/ui/separator";
// import { Button } from "@/components/ui/button";
// import { X, Loader2 } from "lucide-react";
// import { toast } from "sonner";
// import { RescheduleBooking } from "@/components/RescheduleBooking";

// export default function BookingDetailsDialog({
//   booking,
//   open,
//   onClose,
//   onStatusChange,
// }) {
//   const [loading, setLoading] = useState(false);
//   const [showReschedule, setShowReschedule] = useState(false);

//   if (!booking) return null;

//   const {
//     _id,
//     bookingId,
//     status,
//     totalPrice,
//     discountedPrice,
//     discountApplied,
//     discountPercent,
//     promoCode,
//     submittedAt,
//     webName,
//     formData,
//     vehicleCount,
//     createdAt,
//   } = booking;

//   // 🔹 Booking status update function
//   const updateBookingStatus = async (newStatus) => {
//     try {
//       setLoading(true);
//       const response = await fetch(`/api/booking/${_id}`, {
//         method: "PUT",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify({ status: newStatus }),
//       });

//       if (!response.ok) throw new Error(`Failed to ${newStatus} booking`);
//       const data = await response.json();

//       if (onStatusChange) onStatusChange({ ...booking, status: newStatus });

//       toast.success(
//         newStatus === "confirmed"
//           ? `Booking ID ${bookingId} confirmed ✅`
//           : newStatus === "completed"
//             ? `Booking ID ${bookingId} marked as completed ✅`
//             : `Booking ID ${bookingId} cancelled ❌`
//       );

//       onClose();
//     } catch (err) {
//       console.error(err);
//       toast.error(`Failed to ${newStatus} booking ❌`);
//     } finally {
//       setLoading(false);
//     }
//   };

//   return (
//     <Dialog open={open} onOpenChange={onClose}>
//       <DialogContent className="max-w-3xl p-0 overflow-hidden">
//         {/* Header */}
//         <div className="sticky top-0 bg-white z-10 border-b flex items-center justify-between px-6 py-4">
//           <div>
//             <DialogTitle className="text-lg font-semibold">
//               Booking Details
//             </DialogTitle>
//             <DialogDescription className="text-sm text-gray-500">
//               Complete details for booking ID <strong>{bookingId}</strong>
//             </DialogDescription>
//           </div>
//           <Button
//             variant="ghost"
//             size="icon"
//             onClick={onClose}
//             className="rounded-full hover:bg-gray-100"
//           >
//             <X className="h-5 w-5 text-gray-600" />
//           </Button>
//         </div>

//         {/* Content */}
//         <div className="px-6 py-4 max-h-[70vh] overflow-y-auto space-y-6">
//           {/* Booking Info */}
//           <section className="space-y-2 text-sm">
//             <h3 className="text-base font-semibold text-blue-600">
//               Booking Information
//             </h3>
//             <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-x-6 gap-y-2">
//               <p>
//                 <span className="font-medium">Status:</span> {status}
//               </p>
//               <p>
//                 <span className="font-medium">Website:</span> {webName}
//               </p>
//               <p>
//                 <span className="font-medium">Vehicle Count:</span>{" "}
//                 {vehicleCount}
//               </p>
//               <p>
//                 <span className="font-medium">Submitted At:</span>{" "}
//                 {new Date(submittedAt).toLocaleString()}
//               </p>
//               <p>
//                 <span className="font-medium">Created:</span>{" "}
//                 {new Date(createdAt).toLocaleString()}
//               </p>
//             </div>
//           </section>

//           <Separator />

//           {/* Customer Info */}
//           <section className="space-y-2 text-sm">
//             <h3 className="text-base font-semibold text-green-600">
//               Customer Information
//             </h3>
//             <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-x-6 gap-y-2">
//               <p>
//                 <span className="font-medium">Name:</span> {formData.firstName}{" "}
//                 {formData.lastName}
//               </p>
//               <p>
//                 <span className="font-medium">Email:</span> {formData.email}
//               </p>
//               <p>
//                 <span className="font-medium">Phone:</span> {formData.phone}
//               </p>
//               <p>
//                 <span className="font-medium">Address:</span> {formData.address}
//               </p>
//               <p>
//                 <span className="font-medium">City:</span> {formData.city}
//               </p>
//               <p>
//                 <span className="font-medium">State:</span> {formData.state}
//               </p>
//               <p>
//                 <span className="font-medium">Zip:</span> {formData.zip}
//               </p>
//               <p>
//                 <span className="font-medium">Date:</span> {formData.date}
//               </p>
//               <p>
//                 <span className="font-medium">Time Slot:</span>{" "}
//                 {formData.timeSlot}
//               </p>
//             </div>
//           </section>

//           <Separator />

//           {/* Vehicle Info */}
//           <section className="space-y-3 text-sm">
//             <h3 className="text-base font-semibold text-yellow-600">
//               Vehicle Details
//             </h3>
//             {formData.vehicleBookings?.map((v, index) => (
//               <div
//                 key={v.id || index}
//                 className="p-3 border rounded-lg bg-gray-50 space-y-1"
//               >
//                 <p className="font-semibold text-gray-800">
//                   Vehicle #{index + 1}
//                 </p>
//                 <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-x-6 gap-y-1">
//                   <p>
//                     <span className="font-medium">Main Service:</span>{" "}
//                     {v.mainService}
//                   </p>
//                   <p>
//                     <span className="font-medium">Service Type:</span>{" "}
//                     {v.serviceType}
//                   </p>
//                   <p>
//                     <span className="font-medium">Variant:</span>{" "}
//                     {v.variant || "—"}
//                   </p>
//                   <p>
//                     <span className="font-medium">Package:</span> {v.package}
//                   </p>
//                   <p>
//                     <span className="font-medium">Add. Services:</span>{" "}
//                     {v.additionalServices?.length > 0
//                       ? v.additionalServices.join(", ")
//                       : "None"}
//                   </p>
//                   <p>
//                     <span className="font-medium">Make:</span> {v.vehicleMake}
//                   </p>
//                   <p>
//                     <span className="font-medium">Model:</span> {v.vehicleModel}
//                   </p>
//                   <p>
//                     <span className="font-medium">Year:</span> {v.vehicleYear}
//                   </p>
//                   <p>
//                     <span className="font-medium">Color:</span> {v.vehicleColor}
//                   </p>
//                 </div>
//               </div>
//             ))}
//           </section>

//           <Separator />

//           {/* Payment Summary */}
//           <section className="space-y-2 text-sm">
//             <h3 className="text-base font-semibold text-orange-600">
//               Payment Summary
//             </h3>
//             <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-x-6 gap-y-2">
//               <p>
//                 <span className="font-medium">Total Price:</span> ${totalPrice}
//               </p>
//               <p>
//                 <span className="font-medium">Discounted Price:</span> $
//                 {discountedPrice}
//               </p>
//               <p>
//                 <span className="font-medium">Discount Applied:</span>{" "}
//                 {discountApplied ? `Yes (${discountPercent}%)` : "No"}
//               </p>
//               <p>
//                 <span className="font-medium">Promo Code:</span>{" "}
//                 {promoCode || "—"}
//               </p>
//             </div>
//           </section>
//         </div>

//         {/* 🔹 Footer Buttons (4 buttons) */}
//         <DialogFooter className="sticky bottom-0 bg-white border-t px-6 py-3 flex flex-wrap gap-3 justify-between">
//           {/* ❌ Cancel Booking */}
//           <AlertDialog>
//             <AlertDialogTrigger asChild>
//               <Button
//                 variant="destructive"
//                 disabled={loading || status === "cancelled"}
//                 className="bg-red-600 hover:bg-red-700"
//               >
//                 Cancel
//               </Button>
//             </AlertDialogTrigger>
//             <AlertDialogContent>
//               <AlertDialogHeader>
//                 <AlertDialogTitle>Cancel this booking?</AlertDialogTitle>
//                 <AlertDialogDescription>
//                   This action cannot be undone. The booking will be marked as
//                   cancelled.
//                 </AlertDialogDescription>
//               </AlertDialogHeader>
//               <AlertDialogFooter>
//                 <AlertDialogCancel>Go Back</AlertDialogCancel>
//                 <AlertDialogAction
//                   onClick={() => updateBookingStatus("cancelled")}
//                   className="bg-red-600 hover:bg-red-700"
//                 >
//                   Yes, Cancel
//                 </AlertDialogAction>
//               </AlertDialogFooter>
//             </AlertDialogContent>
//           </AlertDialog>

//           {/* ✅ Confirm Booking */}
//           <AlertDialog>
//             <AlertDialogTrigger asChild>
//               <Button
//                 variant="default"
//                 disabled={loading || status === "confirmed"}
//                 className="bg-green-600 hover:bg-green-700"
//               >
//                 Confirm
//               </Button>
//             </AlertDialogTrigger>
//             <AlertDialogContent>
//               <AlertDialogHeader>
//                 <AlertDialogTitle>Confirm this booking?</AlertDialogTitle>
//                 <AlertDialogDescription>
//                   Once confirmed, this booking will be finalized.
//                 </AlertDialogDescription>
//               </AlertDialogHeader>
//               <AlertDialogFooter>
//                 <AlertDialogCancel>Go Back</AlertDialogCancel>
//                 <AlertDialogAction
//                   onClick={() => updateBookingStatus("confirmed")}
//                   className="bg-green-600 hover:bg-green-700"
//                 >
//                   Yes, Confirm
//                 </AlertDialogAction>
//               </AlertDialogFooter>
//             </AlertDialogContent>
//           </AlertDialog>

//           {/* 🟦 Complete Booking */}
//           <Button
//             variant="default"
//             disabled={loading || status === "completed"}
//             onClick={() => updateBookingStatus("completed")}
//             className="bg-blue-600 hover:bg-blue-700"
//           >
//             {loading && status !== "completed" ? (
//               <>
//                 <Loader2 className="h-4 w-4 animate-spin mr-2" /> Processing...
//               </>
//             ) : (
//               "Complete"
//             )}
//           </Button>

//           {/* 🟨 Reschedule Booking */}
//           <Button
//             variant="secondary"
//             onClick={() => setShowReschedule(true)}
//             className="bg-yellow-500 hover:bg-yellow-600 text-white"
//           >
//             Reschedule
//           </Button>
//         </DialogFooter>
//       </DialogContent>
//       {showReschedule && (
//         <RescheduleBooking
//           booking={booking}
//           isOpen={showReschedule}
//           onClose={() => setShowReschedule(false)}
//           onSuccess={(updatedBooking) => {
//             if (onStatusChange) onStatusChange(updatedBooking);
//             setShowReschedule(false);
//           }}
//         />
//       )}
//     </Dialog>
//   );
// }



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
      <DialogContent className="max-w-3xl p-0 overflow-hidden">
        {/* Header */}
        <div className="sticky top-0 bg-white z-10 border-b flex items-center justify-between px-6 py-4">
          <div>
            <DialogTitle className="text-lg font-semibold">
              Booking Details
            </DialogTitle>
            <DialogDescription className="text-sm text-gray-500">
              Complete details for booking ID <strong>{bookingId}</strong>
            </DialogDescription>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            className="rounded-full hover:bg-gray-100"
          >
            <X className="h-5 w-5 text-gray-600" />
          </Button>
        </div>

        {/* Content */}
        <div className="px-6 py-4 max-h-[70vh] overflow-y-auto space-y-6">
          {/* Booking Info */}
          <section className="space-y-2 text-sm">
            <h3 className="text-base font-semibold text-blue-600">
              Booking Information
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-x-6 gap-y-2">
              <p>
                <span className="font-medium">Status:</span> {status}
              </p>
              <p>
                <span className="font-medium">Website:</span> {webName}
              </p>
              <p>
                <span className="font-medium">Vehicle Count:</span>{" "}
                {vehicleCount}
              </p>
              <p>
                <span className="font-medium">Submitted At:</span>{" "}
                {new Date(submittedAt).toLocaleString()}
              </p>
              <p>
                <span className="font-medium">Created:</span>{" "}
                {new Date(createdAt).toLocaleString()}
              </p>
            </div>
          </section>

          <Separator />

          {/* Customer Info */}
          <section className="space-y-2 text-sm">
            <h3 className="text-base font-semibold text-green-600">
              Customer Information
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-x-6 gap-y-2">
              <p>
                <span className="font-medium">Name:</span> {formData.firstName}{" "}
                {formData.lastName}
              </p>
              <p>
                <span className="font-medium">Email:</span> {formData.email}
              </p>
              <p>
                <span className="font-medium">Phone:</span> {formData.phone}
              </p>
              <p>
                <span className="font-medium">Address:</span> {formData.address}
              </p>
              <p>
                <span className="font-medium">City:</span> {formData.city}
              </p>
              <p>
                <span className="font-medium">State:</span> {formData.state}
              </p>
              <p>
                <span className="font-medium">Zip:</span> {formData.zip}
              </p>
              <p>
                <span className="font-medium">Date:</span> {formData.date}
              </p>
              <p>
                <span className="font-medium">Time Slot:</span>{" "}
                {formData.timeSlot}
              </p>
            </div>
          </section>

          <Separator />

          {/* Vehicle Info */}
          <section className="space-y-3 text-sm">
            <h3 className="text-base font-semibold text-yellow-600">
              Vehicle Details
            </h3>
            {formData.vehicleBookings?.map((v, index) => (
              <div
                key={v.id || index}
                className="p-3 border rounded-lg bg-gray-50 space-y-1"
              >
                <p className="font-semibold text-gray-800">
                  Vehicle #{index + 1}
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-x-6 gap-y-1">
                  <p>
                    <span className="font-medium">Main Service:</span>{" "}
                    {v.mainService}
                  </p>
                  <p>
                    <span className="font-medium">Service Type:</span>{" "}
                    {v.serviceType}
                  </p>
                  <p>
                    <span className="font-medium">Variant:</span>{" "}
                    {v.variant || "—"}
                  </p>
                  <p>
                    <span className="font-medium">Package:</span> {v.package}
                  </p>
                  <p>
                    <span className="font-medium">Add. Services:</span>{" "}
                    {v.additionalServices?.length > 0
                      ? v.additionalServices.join(", ")
                      : "None"}
                  </p>
                  <p>
                    <span className="font-medium">Make:</span> {v.vehicleMake}
                  </p>
                  <p>
                    <span className="font-medium">Model:</span> {v.vehicleModel}
                  </p>
                  <p>
                    <span className="font-medium">Year:</span> {v.vehicleYear}
                  </p>
                  <p>
                    <span className="font-medium">Color:</span> {v.vehicleColor}
                  </p>
                </div>
              </div>
            ))}
          </section>

          <Separator />

          {/* Payment Summary */}
          <section className="space-y-2 text-sm">
            <h3 className="text-base font-semibold text-orange-600">
              Payment Summary
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-x-6 gap-y-2">
              <p>
                <span className="font-medium">Total Price:</span> ${totalPrice}
              </p>
              <p>
                <span className="font-medium">Discounted Price:</span> $
                {discountedPrice}
              </p>
              <p>
                <span className="font-medium">Discount Applied:</span>{" "}
                {discountApplied ? `Yes (${discountPercent}%)` : "No"}
              </p>
              <p>
                <span className="font-medium">Promo Code:</span>{" "}
                {promoCode || "—"}
              </p>
            </div>
          </section>
        </div>

        {/* 🔹 Footer Buttons (4 buttons) */}
        <DialogFooter className="sticky bottom-0 bg-white border-t px-6 py-3 flex flex-wrap gap-3 justify-between">
          {/*  Cancel Booking */}
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button
                variant="destructive"
                // ✅ UPDATED
                disabled={
                  loading || status === "cancelled" || status === "completed"
                }
                className="bg-red-600 hover:bg-red-700"
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
                className="bg-green-600 hover:bg-green-700"
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
            className="bg-blue-600 hover:bg-blue-700"
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
            className="bg-yellow-500 hover:bg-yellow-600 text-white"
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
