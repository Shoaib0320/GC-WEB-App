// src/actions/bookingActions.js

// ✅ Fetch all bookings
export async function fetchBookings() {
  const response = await fetch("/api/booking");
  if (!response.ok) throw new Error("Failed to fetch bookings");
  return response.json();
}

// ✅ Add a new booking
export async function addBooking(bookingData) {
  const response = await fetch("/api/booking", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(bookingData),
  });

  if (!response.ok) throw new Error("Failed to add booking");
  return response.json();
}

// ✅ Update booking (for example: change status or details)
export async function updateBooking(updatedBooking) {
  const response = await fetch("/api/booking", {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(updatedBooking),
  });

  if (!response.ok) throw new Error("Failed to update booking");
  return response.json();
}

// ✅ Delete a booking
export async function deleteBooking(bookingId) {
  const response = await fetch(`/api/booking?id=${bookingId}`, {
    method: "DELETE",
  });

  if (!response.ok) throw new Error("Failed to delete booking");
  return response.json();
}
