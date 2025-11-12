"use client";

import { useState, useEffect } from "react";
import DataView from "@/components/common/DataView";
import PageHeader from "@/components/common/PageHeader";
import { Badge } from "@/components/ui/badge";
import { BookCopy, User, Calendar, DollarSign } from "lucide-react";

// Mock data simulating what you might get from an API
const mockBookings = [
  { id: 'bk_001', customerName: 'Alice Johnson', service: 'Deep Cleaning', date: '2024-08-15T10:00:00Z', amount: 250, status: 'Confirmed' },
  { id: 'bk_002', customerName: 'Bob Williams', service: 'Standard Cleaning', date: '2024-08-16T14:30:00Z', amount: 150, status: 'Pending' },
  { id: 'bk_003', customerName: 'Charlie Brown', service: 'Move-out Cleaning', date: '2024-08-17T09:00:00Z', amount: 400, status: 'Completed' },
  { id: 'bk_004', customerName: 'Diana Prince', service: 'Office Cleaning', date: '2024-08-18T11:00:00Z', amount: 300, status: 'Cancelled' },
  { id: 'bk_005', customerName: 'Ethan Hunt', service: 'Deep Cleaning', date: '2024-08-19T13:00:00Z', amount: 280, status: 'Confirmed' },
  { id: 'bk_006', customerName: 'Fiona Glenanne', service: 'Standard Cleaning', date: '2024-08-20T16:00:00Z', amount: 160, status: 'Pending' },
];

const getStatusVariant = (status) => {
  switch (status?.toLowerCase()) {
    case 'confirmed': return 'default';
    case 'completed': return 'success';
    case 'pending': return 'secondary';
    case 'cancelled': return 'destructive';
    default: return 'outline';
  }
};

export default function BookingsPage() {
  const [bookings, setBookings] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // Simulate fetching data from an API
  useEffect(() => {
    setIsLoading(true);
    const timer = setTimeout(() => {
      setBookings(mockBookings);
      setIsLoading(false);
    }, 1500); // Simulate 1.5 second network delay

    return () => clearTimeout(timer);
  }, []);

  // Define the columns for the DataView
  const columns = [
    {
      key: 'customerName',
      label: 'Customer',
      sortable: true,
      render: (item) => (
        <div className="flex items-center gap-2">
          <User className="h-4 w-4 text-muted-foreground" />
          <span>{item.customerName}</span>
        </div>
      ),
    },
    {
      key: 'service',
      label: 'Service',
      sortable: true,
    },
    {
      key: 'date',
      label: 'Booking Date',
      sortable: true,
      render: (item) => new Date(item.date).toLocaleDateString(),
    },
    {
      key: 'amount',
      label: 'Amount',
      sortable: true,
      render: (item) => `$${item.amount.toFixed(2)}`,
    },
    {
      key: 'status',
      label: 'Status',
      sortable: true,
      render: (item) => (
        <Badge variant={getStatusVariant(item.status)}>{item.status}</Badge>
      ),
    },
  ];

  // Define filter options for the DataView
  const filterOptions = [
    {
      key: 'status',
      label: 'Status',
      options: [
        { value: 'Confirmed', label: 'Confirmed' },
        { value: 'Pending', label: 'Pending' },
        { value: 'Completed', label: 'Completed' },
        { value: 'Cancelled', label: 'Cancelled' },
      ],
    },
  ];

  // Define bulk action options
  const bulkActionOptions = [
    { label: 'Mark as Completed', value: 'mark-completed' },
    { label: 'Delete Selected', value: 'delete-selected' },
  ];

  // Action Handlers
  const handleViewDetails = (item) => alert(`Viewing details for ${item.customerName}`);
  const handleEditItem = (item) => alert(`Editing booking for ${item.customerName}`);
  const handleDeleteItem = (item) => alert(`Deleting booking for ${item.customerName}`);
  const handleCreateItem = () => alert('Creating a new booking...');
  const handleExportData = () => alert('Exporting data...');
  const handleBulkAction = (action, selectedItems) => {
    alert(`Performing bulk action "${action}" on ${selectedItems.length} items.`);
    console.log(selectedItems);
  };

  return (
    <div className="container mx-auto py-8 px-4 md:px-6">
      <PageHeader
        title="Manage Bookings"
        description="View, edit, and manage all customer bookings."
        icon={BookCopy}
      />
      <div className="mt-6">
        <DataView
          data={bookings}
          columns={columns}
          loading={isLoading}
          // Features
          searchable={true}
          filterable={true}
          sortable={true}
          paginated={true}
          actionable={true}
          bulkActions={true}
          // Configurations
          filterOptions={filterOptions}
          bulkActionOptions={bulkActionOptions}
          searchPlaceholder="Search by customer or service..."
          emptyStateMessage="No bookings found. Try adjusting your filters."
          // Event Handlers
          onCreate={handleCreateItem}
          onExport={handleExportData}
          onView={handleViewDetails}
          onEdit={handleEditItem}
          onDelete={handleDeleteItem}
          onBulkAction={handleBulkAction}
        />
      </div>
    </div>
  );
}