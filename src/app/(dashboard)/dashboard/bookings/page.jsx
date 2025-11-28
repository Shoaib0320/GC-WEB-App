// src/app/(dashboard)/dashboard/bookings/page.jsx
"use client";

import { useEffect, useState } from "react";
import { useAuth } from '@/context/AuthContext';
import DataTable from "@/components/common/DataTable";
import GlobalData from "@/components/common/GlobalData";
import PageHeader from "@/components/common/PageHeader";
import BookingSearchBar from "@/components/SearchBar";
import SearchResultCard from "@/components/common/SearchResultCard";
import BookingDetailsDialog from "@/components/BookingDetailsDialog";
import CreateBookingDialog from "@/components/CreateBookingDialog";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from "@/components/ui/select";
import { fetchBookings, addBooking } from "@/action/bookingActions";
import {
  CalendarDays,
  CheckCircle,
  Clock,
  XCircle,
  RefreshCcw,
  CheckSquare,
  Plus,
} from "lucide-react";
import { toast } from "sonner";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

// Status configuration lookup map
const STATUS_CONFIG = {
  confirmed: { colorClass: "bg-green-100 text-green-700", Icon: CheckCircle },
  pending: { colorClass: "bg-yellow-100 text-yellow-700", Icon: Clock },
  cancelled: { colorClass: "bg-red-100 text-red-700", Icon: XCircle },
  rescheduled: { colorClass: "bg-blue-100 text-blue-700", Icon: RefreshCcw },
  completed: { colorClass: "bg-purple-100 text-purple-700", Icon: CheckSquare },
  default: { colorClass: "bg-gray-100 text-gray-700", Icon: null },
};

export default function BookingsPage() {
  const [bookings, setBookings] = useState([]);
  const [mobileFilter, setMobileFilter] = useState("all");
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);

  const { hasPermission } = useAuth();
  const canCreateBooking = hasPermission('booking', 'create');
  const canViewBooking = hasPermission('booking', 'view');

  const fadeUp = {
    hidden: { opacity: 0, y: 20 },
    visible: (i = 1) => ({ opacity: 1, y: 0, transition: { delay: i * 0.1, duration: 0.4, ease: "easeOut" } }),
  };

  // Fetch bookings
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

  const handleSearch = (query) => setSearch(query);

  const handleCreateBooking = async (bookingData) => {
    try {
      const response = await addBooking(bookingData);
      if (response.success) {
        toast.success("Booking created successfully!");
        setBookings([response.data, ...bookings]);
        setCreateDialogOpen(false);
        fetchBookings();
        return response;
      } else {
        toast.error(response.message || "Failed to create booking");
        return response;
      }
    } catch (error) {
      console.error("Error creating booking:", error);
      toast.error("Failed to create booking");
      return { success: false, message: error?.message || "Failed to create booking" };
    }
  };

  const filteredBookings = bookings.filter((b) =>
    b.formData?.firstName?.toLowerCase().includes(search.toLowerCase())
  );

  const isSearching = search.trim().length > 0;

  return (
    <div className="space-y-8 p-4 md:p-6">
      {/* Header */}
      <PageHeader
        title="Bookings Overview"
        description="Manage, track, and monitor all bookings in one place."
        icon={CalendarDays}
        className="mb-4"
      />

      {/* Create Booking Button */}
      <div className="flex justify-end">
        {canCreateBooking && (
          <Button
            onClick={() => setCreateDialogOpen(true)}
            className="flex items-center gap-2 w-full sm:w-auto bg-[#10B5DB] text-white hover:bg-[#10B5DB]/90 transition-colors rounded-lg"
          >
            <Plus className="w-4 h-4" />
            Create Booking
          </Button>
        )}
      </div>

      <Separator />

      {/* Search & Filter Section (Optional Search Bar) */}
      {/* <BookingSearchBar onSearch={handleSearch} /> */}

      {/* If searching → show search results */}
      {isSearching ? (
        <motion.div
          initial="hidden"
          animate="visible"
          variants={fadeUp}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6 py-6"
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
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">
            {[
              { title: "Total Bookings", value: bookings.length, color: "text-blue-600", desc: "All bookings to date" },
              { title: "Confirmed", value: bookings.filter(b => b.status === "confirmed").length, color: "text-green-600", desc: "Active and approved" },
              { title: "Pending", value: bookings.filter(b => b.status === "pending").length, color: "text-yellow-600", desc: "Awaiting confirmation" },
              { title: "Completed", value: bookings.filter(b => b.status === "completed").length, color: "text-purple-600", desc: "Finished bookings" },
              { title: "Rescheduled", value: bookings.filter(b => b.status === "rescheduled").length, color: "text-blue-600", desc: "Changed date/time" },
              { title: "Cancelled", value: bookings.filter(b => b.status === "cancelled").length, color: "text-red-600", desc: "Declined or cancelled" },
            ].map((card, idx) => (
              <Card key={idx} className="rounded-xl shadow-md hover:shadow-lg transition-shadow">
                <CardHeader>
                  <CardTitle className="text-sm font-medium">{card.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className={`text-2xl sm:text-3xl font-bold ${card.color}`}>{card.value}</div>
                  <div className="text-xs text-muted-foreground mt-1">{card.desc}</div>
                </CardContent>
              </Card>
            ))}
          </div>

          <Separator />

          {/* Desktop Table */}
          <Card>
            <CardHeader className="flex flex-wrap items-center justify-between">
              <div>
                <CardTitle>Bookings Management</CardTitle>
                <CardDescription>Manage All Bookings in the System</CardDescription>
              </div>
            </CardHeader>
            <CardContent>
              <div className="hidden sm:block">
                <GlobalData
                  title="Recent Bookings"
                  icon={CalendarDays}
                  fetcher={async () => await fetchBookings()}
                  columns={[
                    { key: "bookingId", label: "Booking ID" },
                    { label: "Customer", render: b => `${b.formData?.firstName || ""} ${b.formData?.lastName || ""}` },
                    { label: "Email", render: b => b.formData?.email || "N/A" },
                    { label: "Appointment Date", render: b => new Date(b.formData?.date).toLocaleDateString() },
                    { label: "Status", render: b => {
                        const config = STATUS_CONFIG[b.status] || STATUS_CONFIG.default;
                        const { colorClass, Icon } = config;
                        return (
                          <span className={`px-2 py-1 text-xs rounded-full flex items-center gap-1 w-fit ${colorClass}`}>
                            {Icon && <Icon className="w-3.5 h-3.5" />}
                            <span className="capitalize">{b.status}</span>
                          </span>
                        );
                      }
                    },
                    { label: "Action", align: "right", render: b => (
                        canViewBooking ? (
                          <Button variant="ghost" size="sm" onClick={() => { setSelectedBooking(b); setDialogOpen(true); }}>
                            View
                          </Button>
                        ) : null
                      )
                    },
                  ]}
                  serverSide={false}
                  rowsPerPage={5}
                  searchEnabled={false}
                  filterKeys={["status"]}
                  filterOptionsMap={{
                    status: Object.keys(STATUS_CONFIG).filter(k => k !== "default").map(s => ({ label: s.charAt(0).toUpperCase() + s.slice(1), value: s }))
                  }}
                />
              </div>

              {/* Mobile Cards */}
              <div className="sm:hidden">
                <div className="flex items-center justify-between mb-3">
                  <div className="text-sm font-medium">Recent Bookings</div>
                  <div className="w-40">
                    <Select value={mobileFilter} onValueChange={(v) => setMobileFilter(v)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Filter status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All</SelectItem>
                        {Object.keys(STATUS_CONFIG).filter(k => k !== "default").map(s => (
                          <SelectItem key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-3">
                  {bookings.filter(b => mobileFilter === 'all' ? true : b.status === mobileFilter).map(b => (
                    <Card key={b._id} className="rounded-lg shadow hover:shadow-md transition-shadow">
                      <CardHeader>
                        <div className="flex items-center justify-between">
                          <div>
                            <div className="font-semibold">{b.formData?.firstName} {b.formData?.lastName}</div>
                            <div className="text-xs text-muted-foreground">{new Date(b.createdAt).toLocaleDateString()}</div>
                          </div>
                          <span className={`px-2 py-1 text-xs rounded-full ${STATUS_CONFIG[b.status]?.colorClass || "bg-gray-100 text-gray-700"}`}>
                            {b.status}
                          </span>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <div className="flex items-center justify-between text-sm text-muted-foreground">
                          <span>{b.formData?.email || "N/A"}</span>
                          {canViewBooking && (
                            <Button variant="ghost" size="sm" onClick={() => { setSelectedBooking(b); setDialogOpen(true); }}>View</Button>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            </CardContent>

            {/* Dialogs */}
            <CreateBookingDialog open={createDialogOpen} onClose={() => setCreateDialogOpen(false)} onSubmit={handleCreateBooking} />
          </Card>
        </>
      )}

      <BookingDetailsDialog
        booking={selectedBooking}
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        onStatusChange={(updatedBooking) => {
          setBookings(prev => prev.map(b => b._id === updatedBooking._id ? updatedBooking : b));
          setSelectedBooking(updatedBooking);
        }}
      />
    </div>
  );
}
