"use client";

import { useState, useEffect } from "react";
import axios from "axios";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import { Calendar } from "@/components/ui/calendar";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

// ⏰ Available time slots
const TIME_SLOTS = [
  "09:00 AM - 11:00 AM",
  "11:00 AM - 01:00 PM",
  "01:00 PM - 03:00 PM",
  "03:00 PM - 05:00 PM",
];

export function RescheduleBooking({ booking, isOpen, onClose, onSuccess }) {
  const [newDate, setNewDate] = useState(null);
  const [newTimeSlot, setNewTimeSlot] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  // 📅 Initialize form with existing booking data

  // Safter initialization
  const initialDate = booking?.formData?.date
    ? new Date(booking.formData.date)
    : null;
  const initialTimeSlot = booking?.formData?.timeSlot || "";

  useEffect(() => {
    setNewDate(initialDate);
    setNewTimeSlot(initialTimeSlot);
  }, [booking]);
  

  if (!booking) return null;

  const formatDateToYYYYMMDD = (date) => {
    if (!date) return "";
    // Get date parts based on the local time of the Date object
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  };

  // 📨 Handle form submission
  const handleSubmit = async () => {
    const formattedDate = formatDateToYYYYMMDD(newDate);
    setIsLoading(true);
    try {
      const response = await axios.put(
        `/api/booking/reschedule/${booking._id}`,
        {
          newDate: formattedDate,
          newTimeSlot,
        }
      );

      console.log("📦 Reschedule API response:", response.data);
      // 🟢 Check API response success
      if (response.data?.success) {
        const updatedBooking = response.data.data;

        toast.success(
          `Booking #${updatedBooking.bookingId} rescheduled successfully! ✅`
        );

        // 🔄 Update parent data + close dialog
        if (onSuccess) onSuccess(updatedBooking);
        onClose();
      } else {
        toast.error(response.data?.error || "Failed to reschedule booking.");
      }
    } catch (error) {
      console.error("❌ Reschedule failed:", error);
      const msg =
        error.response?.data?.error || "Failed to reschedule booking.";

      toast.error(msg);
    } finally {
      setIsLoading(false);
    }
  };

  // 🛑 Allow only reschedulable bookings
  const isReschedulable = ["pending", "confirmed", "rescheduled"].includes(
    booking.status
  );

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Reschedule Booking</DialogTitle>
          <DialogDescription>
            Change the booking date and time for #{booking.bookingId}.
          </DialogDescription>
        </DialogHeader>

        {!isReschedulable ? (
          <p className="text-red-600 text-center py-6">
            ❌ Only pending, confirmed, or already rescheduled bookings can be
            rescheduled.
          </p>
        ) : (
          <div className="grid gap-6 py-4">
            {/* 📅 Date Picker */}
            <div className="flex justify-center">
              <Calendar
                mode="single"
                selected={newDate}
                onSelect={setNewDate}
                disabled={{ before: new Date() }}
                className="rounded-md border"
              />
            </div>

            {/* ⏰ Time Slot Picker */}
            <div>
              <label className="text-sm font-medium mb-2 block">
                Select Time Slot
              </label>
              <Select
                onValueChange={setNewTimeSlot}
                value={newTimeSlot}
                disabled={!isReschedulable}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select a time slot" />
                </SelectTrigger>
                <SelectContent>
                  {TIME_SLOTS.map((slot) => (
                    <SelectItem key={slot} value={slot}>
                      {slot}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        )}

        {/* ⚙️ Buttons */}
        <DialogFooter>
          <DialogClose asChild>
            <Button variant="outline" disabled={isLoading}>
              Cancel
            </Button>
          </DialogClose>
          <Button
            onClick={handleSubmit}
            disabled={!newDate || !newTimeSlot || isLoading || !isReschedulable}
          >
            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Save Changes
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
