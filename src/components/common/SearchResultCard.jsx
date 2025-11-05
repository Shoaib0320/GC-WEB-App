// "use client";

// import { motion } from "framer-motion";
// import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
// import { Button } from "@/components/ui/button";

// export default function SearchResultCard({ booking, index, fadeUp, onViewDetails }) {
//   // Define color based on status
//   const getStatusColor = (status) => {
//     switch (status) {
//       case "confirmed":
//         return "bg-green-100 text-green-700";
//       case "pending":
//         return "bg-yellow-100 text-yellow-700";
//       default:
//         return "bg-red-100 text-red-700";
//     }
//   };

//   return (
//     <motion.div
//       key={booking._id}
//       custom={index}
//       initial="hidden"
//       animate="visible"
//       variants={fadeUp}
//     >
//       <Card className="shadow-md hover:shadow-lg transition border border-blue-100">
//         <CardHeader>
//           <CardTitle className="flex justify-between items-center">
//             {booking.formData?.firstName} {booking.formData?.lastName}
//             <span
//               className={`px-2 py-1 text-xs rounded-full ${getStatusColor(booking.status)}`}
//             >
//               {booking.status}
//             </span>
//           </CardTitle>
//           <CardDescription>Booking ID: {booking.bookingId}</CardDescription>
//         </CardHeader>

//         <CardContent className="space-y-2 text-sm">
//           <p>
//             <strong>Email:</strong> {booking.formData?.email}
//           </p>
//           <p>
//             <strong>Phone:</strong> {booking.formData?.phone}
//           </p>
//           <p>
//             <strong>Date:</strong>{" "}
//             {new Date(booking.createdAt).toLocaleDateString()}
//           </p>
//           <Button
//             className="w-full mt-2"
//             variant="outline"
//             onClick={() => onViewDetails(booking)}
//           >
//             View Details
//           </Button>
//         </CardContent>
//       </Card>
//     </motion.div>
//   );
// }

"use client";

import { motion } from "framer-motion";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default function SearchResultCard({
  item,
  index,
  fadeUp,
  onViewDetails,
  type = "booking", // "booking" | "contact"
}) {
  const isBooking = type === "booking";

  // 🎨 Status color helper
  const getStatusColor = (status) => {
    if (!status) return "bg-gray-100 text-gray-700";

    const s = status.toLowerCase();
    if (s.includes("confirm")) return "bg-green-100 text-green-700";
    if (s.includes("pend")) return "bg-yellow-100 text-yellow-700";
    if (s.includes("cancel")) return "bg-red-100 text-red-700";
    if (s.includes("progress")) return "bg-yellow-100 text-yellow-700";
    if (s.includes("resolve")) return "bg-green-100 text-green-700";
    if (s.includes("new")) return "bg-blue-100 text-blue-700";
    return "bg-gray-100 text-gray-700";
  };

  // 🧠 Extract data safely
  const name = isBooking
    ? `${item?.formData?.firstName || ""} ${item?.formData?.lastName || ""}`.trim() ||
      "Unnamed Booking"
    : item?.name || "Unknown";

  const email = isBooking
    ? item?.formData?.email || "N/A"
    : item?.email || "N/A";

  const phone = isBooking
    ? item?.formData?.phone || "N/A"
    : item?.phone || "N/A";

  const date = isBooking
    ? item?.createdAt
      ? new Date(item.createdAt).toLocaleDateString()
      : "N/A"
    : null;

  // 🪄 Limit message to 4 words for contacts
  let message = null;
  if (!isBooking) {
    const fullMessage = item?.message || "No message";
    const words = fullMessage.split(" ");
    message =
      words.length > 4 ? `${words.slice(0, 4).join(" ")}...` : fullMessage;
  }

  return (
    <motion.div
      key={item?._id}
      custom={index}
      initial="hidden"
      animate="visible"
      variants={fadeUp}
    >
      <Card className="shadow-md hover:shadow-lg transition border border-blue-100 h-full flex flex-col justify-between">
        {/* Header */}
        <CardHeader className="flex justify-between items-start">
          <CardTitle className="text-base font-semibold">{name}</CardTitle>
          <span
            className={`px-2 py-1 text-xs rounded-full ${getStatusColor(
              item?.status
            )}`}
          >
            {item?.status || "N/A"}
          </span>
        </CardHeader>

        {/* Content */}
        <CardContent className="space-y-2 text-sm flex-1">
          <p>
            <strong>Email:</strong> {email}
          </p>
          <p>
            <strong>Phone:</strong> {phone}
          </p>

          {isBooking ? (
            <>
              <p>
                <strong>Date:</strong> {date}
              </p>
              <p className="text-xs text-gray-500">
                Booking ID: {item?.bookingId || "N/A"}
              </p>
            </>
          ) : (
            <p>
              <strong>Message:</strong> {message}
            </p>
          )}
        </CardContent>

        {/* Action */}
        <Button
          variant="outline"
          className="mt-2 w-full"
          onClick={() => onViewDetails?.(item)}
        >
          {isBooking ? "View Details" : "View Message"}
        </Button>
      </Card>
    </motion.div>
  );
}
