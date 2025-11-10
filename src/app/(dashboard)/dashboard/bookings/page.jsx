// src/app/%28dashboard%29/dashboard/bookings/page.jsx
"use client";

import { useEffect, useState } from "react";
import DataTable from "@/components/common/DataTable";
import SummaryCards from "@/components/common/SummaryCards";
import PageHeader from "@/components/common/PageHeader";
import BookingSearchBar from "@/components/SearchBar";
import SearchResultCard from "@/components/common/SearchResultCard";
import BookingDetailsDialog from "@/components/BookingDetailsDialog";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { fetchBookings } from "@/action/bookingActions";
import {
  CalendarDays,
  CheckCircle,
  Clock,
  XCircle,
  RefreshCcw,
  CheckSquare,
} from "lucide-react";

// 1. Status configuration lookup map (Optimized logic)
const STATUS_CONFIG = {
  confirmed: {
    colorClass: "bg-green-100 text-green-700",
    Icon: CheckCircle,
  },
  pending: {
    colorClass: "bg-yellow-100 text-yellow-700",
    Icon: Clock,
  },
  cancelled: {
    colorClass: "bg-red-100 text-red-700",
    Icon: XCircle,
  },
  rescheduled: {
    colorClass: "bg-blue-100 text-blue-700",
    Icon: RefreshCcw,
  },
  completed: {
    colorClass: "bg-purple-100 text-purple-700",
    Icon: CheckSquare,
  },
  // Default fallback configuration
  default: {
    colorClass: "bg-gray-100 text-gray-700",
    Icon: null, // Or a default icon
  },
};

export default function BookingsPage() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [dialogOpen, setDialogOpen] = useState(false);

  const fadeUp = {
    hidden: { opacity: 0, y: 20 },
    visible: (i = 1) => ({
      opacity: 1,
      y: 0,
      transition: { delay: i * 0.1, duration: 0.4, ease: "easeOut" },
    }),
  };

  // 🧠 Fetch bookings
  useEffect(() => {
    async function loadBookings() {
      try {
        const res = await fetchBookings();
        setBookings(res.data || []);
      } catch (err) {
        console.error("Error fetching bookings:", err);
      } finally {
        setLoading(false);
      }
    }
    loadBookings();
  }, []);

  // 🔍 Search handler
  const handleSearch = (query) => setSearch(query);

  // 🔎 Filter bookings
  const filteredBookings = bookings.filter((b) =>
    b.formData?.firstName?.toLowerCase().includes(search.toLowerCase())
  );

  const isSearching = search.trim().length > 0;

  return (
    <div className="space-y-8">
      {/* Header */}
      <PageHeader
        title="Bookings Overview"
        description="Manage, track, and monitor all bookings in one place."
        icon={CalendarDays}
      />

      {/* Search Bar */}
      <motion.div
        initial="hidden"
        animate="visible"
        custom={1}
        variants={fadeUp}
        className="flex flex-col sm:flex-row gap-3"
      >
        <BookingSearchBar onSearch={handleSearch} />
      </motion.div>

      <Separator />

      {/* If searching → show search results */}
      {isSearching ? (
        <motion.div
          initial="hidden"
          animate="visible"
          variants={fadeUp}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6 justify-center items-center py-6"
        >
          {filteredBookings.length === 0 ? (
            <p className="text-center text-gray-500 col-span-full">
              No results found for <strong>{search}</strong>.
            </p>
          ) : (
            filteredBookings.map((booking, index) => (
              <SearchResultCard
                key={booking._id}
                item={booking}
                index={index}
                fadeUp={fadeUp}
                type="booking"
                onViewDetails={(b) => {
                  setSelectedBooking(b);
                  setDialogOpen(true);
                }}
              />
            ))
          )}
        </motion.div>
      ) : (
        <>
          {/* Summary Cards */}
          <SummaryCards
            cards={[
              {
                title: "Total Bookings",
                description: "All bookings to date",
                value: bookings.length,
                icon: CalendarDays,
                color: "from-blue-500/10 to-blue-500/5 text-blue-700",
              },
              {
                title: "Confirmed",
                description: "Active and approved",
                value: bookings.filter((b) => b.status === "confirmed").length,
                icon: CheckCircle,
                color: "from-green-500/10 to-green-500/5 text-green-700",
              },
              {
                title: "Pending",
                description: "Awaiting confirmation",
                value: bookings.filter((b) => b.status === "pending").length,
                icon: Clock,
                color: "from-yellow-500/10 to-yellow-500/5 text-yellow-700",
              },
              // ✅ ADDED: Completed Card
              {
                title: "Completed",
                description: "Finished bookings",
                value: bookings.filter((b) => b.status === "completed").length,
                icon: CheckSquare,
                color: "from-purple-500/10 to-purple-500/5 text-purple-700",
              },
              // ✅ ADDED: Rescheduled Card
              {
                title: "Rescheduled",
                description: "Changed date/time",
                value: bookings.filter((b) => b.status === "rescheduled")
                  .length,
                icon: RefreshCcw,
                color: "from-blue-500/10 to-blue-500/5 text-blue-700",
              },
              {
                title: "Cancelled",
                description: "Declined or cancelled",
                value: bookings.filter((b) => b.status === "cancelled").length,
                icon: XCircle,
                color: "from-red-500/10 to-red-500/5 text-red-700",
              },
            ]}
          />

          <Separator />

          {/* Normal Table (only visible when not searching) */}
          <DataTable
            title="Recent Bookings"
            icon={Clock}
            loading={loading}
            data={bookings}
            columns={[
              { key: "bookingId", label: "Booking ID" },
              {
                label: "Customer",
                render: (b) =>
                  `${b.formData?.firstName || ""} ${b.formData?.lastName || ""
                  }`,
              },
              { label: "Email", render: (b) => b.formData?.email || "N/A" },
              {
                label: "Date",
                render: (b) => new Date(b.createdAt).toLocaleDateString(),
              },
              {
                label: "Appointment Date",
                render: (b) => new Date(b.formData?.date).toLocaleDateString(),
              },
              // ✅ UPDATED: Status column using STATUS_CONFIG
              {
                label: "Status",
                render: (b) => {
                  // Look up the configuration based on status, or use default
                  const config =
                    STATUS_CONFIG[b.status] || STATUS_CONFIG.default;
                  const { colorClass, Icon } = config;

                  return (
                    <span
                      className={`px-2 py-1 text-xs rounded-full flex items-center gap-1 w-fit ${colorClass}`}
                    >
                      {/* Render Icon component if it exists */}
                      {Icon && <Icon className="w-3.5 h-3.5" />}
                      <span className="capitalize">{b.status}</span>
                    </span>
                  );
                },
              },
              {
                label: "Action",
                align: "right",
                render: (b) => (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      setSelectedBooking(b);
                      setDialogOpen(true);
                    }}
                  // ✅ Disabled logic yahan se hata diya gaya hai
                  >
                    {/* Ab yeh hamesha "View" hi dikhayega */}
                    View
                  </Button>
                ),
              },
            ]}
          />
        </>
      )}

      {/* Dialog */}
      <BookingDetailsDialog
        booking={selectedBooking}
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        onStatusChange={(updatedBooking) => {
          setBookings((prev) =>
            prev.map(
              (b) => (b._id === updatedBooking._id ? updatedBooking : b) // ✅ pura updated object lagao
            )
          );

          // ✅ Dialog me bhi updated booking show karne ke liye
          setSelectedBooking(updatedBooking);
        }}
      />
    </div>
  );
}







// // src/app/%28dashboard%29/dashboard/bookings/page.jsx
// "use client";

// import { useEffect, useState } from "react";
// import DataView from "@/components/common/DataView";
// import SummaryCards from "@/components/common/SummaryCards";
// import PageHeader from "@/components/common/PageHeader";
// import BookingDetailsDialog from "@/components/BookingDetailsDialog";
// import CreateBookingDialog from "@/components/CreateBookingDialog";
// import { motion } from "framer-motion";
// import { Button } from "@/components/ui/button";
// import { Separator } from "@/components/ui/separator";
// import { fetchBookings } from "@/action/bookingActions";
// import { agentService } from "@/services/agentService";
// import {
//   CalendarDays,
//   CheckCircle,
//   Clock,
//   XCircle,
//   RefreshCcw,
//   CheckSquare,
//   User,
//   Phone,
//   MapPin,
//   Calendar,
//   DollarSign,
//   Wrench,
// } from "lucide-react";

// // Status configuration lookup map
// const STATUS_CONFIG = {
//   confirmed: {
//     colorClass: "bg-green-100 text-green-700 border border-green-200",
//     Icon: CheckCircle,
//   },
//   pending: {
//     colorClass: "bg-yellow-100 text-yellow-700 border border-yellow-200",
//     Icon: Clock,
//   },
//   cancelled: {
//     colorClass: "bg-red-100 text-red-700 border border-red-200",
//     Icon: XCircle,
//   },
//   rescheduled: {
//     colorClass: "bg-blue-100 text-blue-700 border border-blue-200",
//     Icon: RefreshCcw,
//   },
//   completed: {
//     colorClass: "bg-purple-100 text-purple-700 border border-purple-200",
//     Icon: CheckSquare,
//   },
//   default: {
//     colorClass: "bg-gray-100 text-gray-700 border border-gray-200",
//     Icon: null,
//   },
// };

// export default function BookingsPage() {
//   const [bookings, setBookings] = useState([]);
//   const [agents, setAgents] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [selectedBooking, setSelectedBooking] = useState(null);
//   const [dialogOpen, setDialogOpen] = useState(false);
//   const [createDialogOpen, setCreateDialogOpen] = useState(false);
//   const [searchQuery, setSearchQuery] = useState("");

//   const fadeUp = {
//     hidden: { opacity: 0, y: 20 },
//     visible: (i = 1) => ({
//       opacity: 1,
//       y: 0,
//       transition: { delay: i * 0.1, duration: 0.4, ease: "easeOut" },
//     }),
//   };

//   // Fetch bookings and agents
//   useEffect(() => {
//     async function loadData() {
//       try {
//         setLoading(true);
//         const [bookingsRes, agentsRes] = await Promise.all([
//           fetchBookings(),
//           agentService.getAllAgents()
//         ]);
        
//         setBookings(bookingsRes.data || []);
//         setAgents(agentsRes.data || []);
//       } catch (err) {
//         console.error("Error fetching data:", err);
//       } finally {
//         setLoading(false);
//       }
//     }
//     loadData();
//   }, []);

//   // Get agent name by ID
//   const getAgentName = (agentId) => {
//     if (!agentId) return "Not Assigned";
//     const agent = agents.find(a => a._id === agentId || a.agentId === agentId);
//     return agent ? `${agent.agentName} (${agent.agentId})` : "Not Assigned";
//   };

//   // Filter bookings based on search
//   const filteredBookings = bookings.filter((booking) => {
//     if (!searchQuery) return true;
    
//     const searchLower = searchQuery.toLowerCase();
//     const customerName = `${booking.formData?.firstName || ""} ${booking.formData?.lastName || ""}`.toLowerCase();
//     const address = `${booking.formData?.address || ""} ${booking.formData?.city || ""} ${booking.formData?.state || ""}`.toLowerCase();
    
//     return (
//       customerName.includes(searchLower) ||
//       booking.formData?.phone?.includes(searchQuery) ||
//       booking.formData?.email?.toLowerCase().includes(searchLower) ||
//       booking.bookingId?.toLowerCase().includes(searchLower) ||
//       address.includes(searchLower)
//     );
//   });

//   // Handle search
//   const handleSearch = (query) => {
//     setSearchQuery(query);
//   };

//   // Handle booking creation
//   const handleCreateBooking = async (bookingData) => {
//     try {
//       // Add your create booking logic here
//       console.log("Creating booking:", bookingData);
//       // Refresh bookings after creation
//       const res = await fetchBookings();
//       setBookings(res.data || []);
//       setCreateDialogOpen(false);
//     } catch (error) {
//       console.error("Error creating booking:", error);
//     }
//   };

//   // Handle status update
//   const handleStatusUpdate = (updatedBooking) => {
//     setBookings((prev) =>
//       prev.map((b) => (b._id === updatedBooking._id ? updatedBooking : b))
//     );
//     setSelectedBooking(updatedBooking);
//   };

//   // Handle export
//   const handleExport = () => {
//     // Add export logic here
//     const csvData = filteredBookings.map(booking => ({
//       'Booking ID': booking.bookingId,
//       'Customer Name': `${booking.formData?.firstName} ${booking.formData?.lastName}`,
//       'Phone': booking.formData?.phone,
//       'Email': booking.formData?.email,
//       'Address': `${booking.formData?.address}, ${booking.formData?.city}, ${booking.formData?.state} ${booking.formData?.zip}`,
//       'Appointment Date': new Date(booking.formData?.date).toLocaleDateString(),
//       'Time Slot': booking.formData?.timeSlot,
//       'Main Service': booking.formData?.vehicleBookings?.[0]?.mainService || 'N/A',
//       'Discounted Price': `$${booking.discountedPrice?.toFixed(2)}`,
//       'Status': booking.status,
//       'Agent': getAgentName(booking.assignedAgent),
//     }));

//     const headers = Object.keys(csvData[0]);
//     const csvContent = [
//       headers.join(','),
//       ...csvData.map(row => headers.map(header => `"${row[header]}"`).join(','))
//     ].join('\n');

//     const blob = new Blob([csvContent], { type: 'text/csv' });
//     const url = window.URL.createObjectURL(blob);
//     const a = document.createElement('a');
//     a.href = url;
//     a.download = `bookings-${new Date().toISOString().split('T')[0]}.csv`;
//     a.click();
//     window.URL.revokeObjectURL(url);
//   };

//   // Columns configuration for DataView
//   const columns = [
//     {
//       label: "Customer",
//       render: (b) => (
//         <div className="flex items-center gap-2 min-w-[150px]">
//           <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
//             <User className="w-4 h-4 text-blue-600" />
//           </div>
//           <div className="min-w-0 flex-1">
//             <p className="font-medium text-sm truncate">
//               {`${b.formData?.firstName || ""} ${b.formData?.lastName || ""}`.trim() || "N/A"}
//             </p>
//             <p className="text-xs text-gray-500 truncate">{b.bookingId}</p>
//           </div>
//         </div>
//       ),
//     },
//     {
//       label: "Contact",
//       render: (b) => (
//         <div className="space-y-1 min-w-[140px]">
//           <div className="flex items-center gap-1">
//             <Phone className="w-3 h-3 text-gray-500 flex-shrink-0" />
//             <span className="text-sm truncate">{b.formData?.phone || "N/A"}</span>
//           </div>
//           <div className="text-xs text-gray-500 truncate">{b.formData?.email}</div>
//         </div>
//       ),
//     },
//     {
//       label: "Address",
//       render: (b) => {
//         const address = [
//           b.formData?.address,
//           b.formData?.city,
//           b.formData?.state
//         ].filter(Boolean).join(", ");
//         return (
//           <div className="flex items-start gap-1 min-w-[180px] max-w-[250px]">
//             <MapPin className="w-3 h-3 text-gray-500 mt-0.5 flex-shrink-0" />
//             <span className="text-sm line-clamp-2">{address || "N/A"}</span>
//           </div>
//         );
//       },
//     },
//     {
//       label: "Appointment",
//       render: (b) => (
//         <div className="space-y-1 min-w-[120px]">
//           <div className="flex items-center gap-1">
//             <Calendar className="w-3 h-3 text-gray-500 flex-shrink-0" />
//             <span className="text-sm">{new Date(b.formData?.date).toLocaleDateString()}</span>
//           </div>
//           <div className="text-xs text-gray-500">{b.formData?.timeSlot || "N/A"}</div>
//         </div>
//       ),
//     },
//     {
//       label: "Agent",
//       render: (b) => (
//         <div className="min-w-[120px]">
//           <span className="text-sm bg-gray-100 px-2 py-1 rounded-md inline-block">
//             {getAgentName(b.assignedAgent)}
//           </span>
//         </div>
//       ),
//     },
//     {
//       label: "Price",
//       render: (b) => (
//         <div className="flex items-center gap-1 min-w-[100px]">
//           <DollarSign className="w-3 h-3 text-green-600 flex-shrink-0" />
//           <span className="text-sm font-semibold text-green-700">
//             {b.discountedPrice?.toFixed(2) || "0.00"}
//           </span>
//         </div>
//       ),
//     },
//     {
//       label: "Service",
//       render: (b) => {
//         const firstVehicle = b.formData?.vehicleBookings?.[0];
//         return (
//           <div className="flex items-center gap-1 min-w-[120px]">
//             <Wrench className="w-3 h-3 text-gray-500 flex-shrink-0" />
//             <span className="text-sm truncate">{firstVehicle?.mainService || "N/A"}</span>
//           </div>
//         );
//       },
//     },
//     {
//       label: "Status",
//       render: (b) => {
//         const config = STATUS_CONFIG[b.status] || STATUS_CONFIG.default;
//         const { colorClass, Icon } = config;

//         return (
//           <span
//             className={`px-3 py-1 text-xs rounded-full flex items-center gap-1 w-fit ${colorClass}`}
//           >
//             {Icon && <Icon className="w-3 h-3 flex-shrink-0" />}
//             <span className="capitalize font-medium">{b.status}</span>
//           </span>
//         );
//       },
//     },
//   ];

//   return (
//     <div className="space-y-6 p-4 sm:p-6">
//       {/* Header */}
//       <PageHeader
//         title="Bookings Management"
//         description="Manage, track, and monitor all bookings in one place."
//         icon={CalendarDays}
//       />

//       {/* Summary Cards */}
//       <div className="block md:grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
//         <div className="flex md:hidden overflow-x-auto pb-2 space-x-4 scrollbar-hide">
//           <SummaryCards
//             cards={[
//               {
//                 title: "Total Bookings",
//                 description: "All bookings to date",
//                 value: bookings.length,
//                 icon: CalendarDays,
//                 color: "from-blue-500/10 to-blue-500/5 text-blue-700",
//               },
//               {
//                 title: "Confirmed",
//                 description: "Active and approved",
//                 value: bookings.filter((b) => b.status === "confirmed").length,
//                 icon: CheckCircle,
//                 color: "from-green-500/10 to-green-500/5 text-green-700",
//               },
//               {
//                 title: "Pending",
//                 description: "Awaiting confirmation",
//                 value: bookings.filter((b) => b.status === "pending").length,
//                 icon: Clock,
//                 color: "from-yellow-500/10 to-yellow-500/5 text-yellow-700",
//               },
//               {
//                 title: "Completed",
//                 description: "Finished bookings",
//                 value: bookings.filter((b) => b.status === "completed").length,
//                 icon: CheckSquare,
//                 color: "from-purple-500/10 to-purple-500/5 text-purple-700",
//               },
//               {
//                 title: "Rescheduled",
//                 description: "Changed date/time",
//                 value: bookings.filter((b) => b.status === "rescheduled").length,
//                 icon: RefreshCcw,
//                 color: "from-blue-500/10 to-blue-500/5 text-blue-700",
//               },
//               {
//                 title: "Cancelled",
//                 description: "Declined or cancelled",
//                 value: bookings.filter((b) => b.status === "cancelled").length,
//                 icon: XCircle,
//                 color: "from-red-500/10 to-red-500/5 text-red-700",
//               },
//             ]}
//           />
//         </div>
//         <div className="hidden md:block">
//           <SummaryCards
//             cards={[
//               {
//                 title: "Total Bookings",
//                 description: "All bookings to date",
//                 value: bookings.length,
//                 icon: CalendarDays,
//                 color: "from-blue-500/10 to-blue-500/5 text-blue-700",
//               },
//               {
//                 title: "Confirmed",
//                 description: "Active and approved",
//                 value: bookings.filter((b) => b.status === "confirmed").length,
//                 icon: CheckCircle,
//                 color: "from-green-500/10 to-green-500/5 text-green-700",
//               },
//               {
//                 title: "Pending",
//                 description: "Awaiting confirmation",
//                 value: bookings.filter((b) => b.status === "pending").length,
//                 icon: Clock,
//                 color: "from-yellow-500/10 to-yellow-500/5 text-yellow-700",
//               },
//               {
//                 title: "Completed",
//                 description: "Finished bookings",
//                 value: bookings.filter((b) => b.status === "completed").length,
//                 icon: CheckSquare,
//                 color: "from-purple-500/10 to-purple-500/5 text-purple-700",
//               },
//               {
//                 title: "Rescheduled",
//                 description: "Changed date/time",
//                 value: bookings.filter((b) => b.status === "rescheduled").length,
//                 icon: RefreshCcw,
//                 color: "from-blue-500/10 to-blue-500/5 text-blue-700",
//               },
//               {
//                 title: "Cancelled",
//                 description: "Declined or cancelled",
//                 value: bookings.filter((b) => b.status === "cancelled").length,
//                 icon: XCircle,
//                 color: "from-red-500/10 to-red-500/5 text-red-700",
//               },
//             ]}
//           />
//         </div>
//       </div>

//       <Separator />

//       {/* Data View Component */}
//       <DataView
//         title="All Bookings"
//         data={filteredBookings}
//         columns={columns}
//         loading={loading}
//         searchable={true}
//         filterable={true}
//         onSearch={handleSearch}
//         onView={(booking) => {
//           setSelectedBooking(booking);
//           setDialogOpen(true);
//         }}
//         onCreate={() => setCreateDialogOpen(true)}
//         onExport={handleExport}
//         searchPlaceholder="Search by name, phone, email, or address..."
//         className="min-h-screen"
//         mobileView={true}
//       />

//       {/* Booking Details Dialog */}
//       {selectedBooking && (
//         <BookingDetailsDialog
//           booking={selectedBooking}
//           open={dialogOpen}
//           onClose={() => {
//             setDialogOpen(false);
//             // Dialog close hone ke baad selectedBooking clear karo
//             setTimeout(() => setSelectedBooking(null), 300);
//           }}
//           onStatusChange={handleStatusUpdate}
//           agents={agents}
//         />
//       )}

//       {/* Create Booking Dialog */}
//       <CreateBookingDialog
//         open={createDialogOpen}
//         onClose={() => setCreateDialogOpen(false)}
//         onSubmit={handleCreateBooking}
//         agents={agents}
//       />
//     </div>
//   );
// }