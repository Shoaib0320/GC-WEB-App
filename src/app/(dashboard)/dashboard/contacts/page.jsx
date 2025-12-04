//src/app/(dashboard)/dashboard/contacts/page.jsx
"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Phone,
  MessageSquare,
  Mail,
  User,
  Eye,
  CheckCircle,
  Loader2,
  Reply,
  Calendar,
  Search,
  ChevronLeft,
  ChevronRight,
  Trash2,
} from "lucide-react";
import { toast } from "sonner";
import { format } from "date-fns";
import { fetchContacts, deleteContact, replyContact, updateContactStatus } from "@/action/contactActions";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export default function ContactsPage() {
  const [allContacts, setAllContacts] = useState([]); // ALL contacts loaded
  const [loading, setLoading] = useState(true);
  const [selectedContact, setSelectedContact] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isReplyMode, setIsReplyMode] = useState(false);
  const [replySubject, setReplySubject] = useState("");
  const [replyMessage, setReplyMessage] = useState("");
  const [isSendingReply, setIsSendingReply] = useState(false);
  
  // Pagination states - CLIENT SIDE
  const [currentPage, setCurrentPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const auth = useAuth();

  // Load ALL contacts initially
  useEffect(() => {
    loadAllContacts();
  }, []);

  const loadAllContacts = async () => {
    try {
      setLoading(true);
      // Load ALL contacts at once (without pagination params)
      const data = await fetchContacts();
      
      if (data.success) {
        const contactsData = data.data || [];
        setAllContacts(contactsData);
      } else {
        setAllContacts([]);
        toast.error("Failed to load contacts");
      }
    } catch (error) {
      console.error("Error fetching contacts:", error);
      toast.error("Failed to load contacts");
      setAllContacts([]);
    } finally {
      setLoading(false);
    }
  };

  // Client-side filtering and pagination
  const getFilteredAndPaginatedContacts = () => {
    let filtered = [...allContacts];
    
    // Apply search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(contact => 
        contact.name?.toLowerCase().includes(query) ||
        contact.email?.toLowerCase().includes(query) ||
        contact.phone?.toLowerCase().includes(query) ||
        contact.message?.toLowerCase().includes(query) ||
        contact.webName?.toLowerCase().includes(query)
      );
    }
    
    // Apply status filter
    if (statusFilter !== "all") {
      filtered = filtered.filter(contact => contact.status === statusFilter);
    }
    
    // Calculate pagination
    const itemsPerPage = 5;
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    
    // Get current page items
    const paginatedContacts = filtered.slice(startIndex, endIndex);
    const totalPages = Math.ceil(filtered.length / itemsPerPage);
    
    return {
      contacts: paginatedContacts,
      total: filtered.length,
      totalPages: totalPages
    };
  };

  // Get current contacts for display
  const { contacts: currentContacts, total: filteredTotal, totalPages } = getFilteredAndPaginatedContacts();

  const handleReply = async () => {
    if (!replySubject.trim() || !replyMessage.trim()) {
      toast.warning("Please fill in both subject and message fields.");
      return;
    }

    setIsSendingReply(true);
    try {
      await replyContact(selectedContact._id, replySubject, replyMessage);
      
      // Update contact status to "replied"
      await updateContactStatus(selectedContact._id, "replied");
      
      // Refresh ALL contacts
      await loadAllContacts();
      
      setReplySubject("");
      setReplyMessage("");
      setIsReplyMode(false);
      
      toast.success("Reply sent successfully!");
    } catch (error) {
      console.error("Error sending reply:", error);
      toast.error("Failed to send reply. Please try again.");
    } finally {
      setIsSendingReply(false);
    }
  };

  useEffect(() => {
    if (isModalOpen && selectedContact) {
      setReplySubject(`Re: Contact from ${selectedContact.name}`);
      setReplyMessage(`Dear ${selectedContact.name},\n\nThank you for your message. We have received your inquiry and will respond shortly.\n\nBest regards,\nYour Support Team`);
    } else {
      setIsReplyMode(false);
      setReplySubject("");
      setReplyMessage("");
    }
  }, [isModalOpen, selectedContact]);

  const handleSearch = (e) => {
    e.preventDefault();
    setCurrentPage(1); // Reset to first page when searching
  };

  const handleDeleteContact = async (contactId) => {
    if (!window.confirm("Are you sure you want to delete this contact message?")) return;
    try {
      await deleteContact(contactId);
      toast.success("Contact deleted successfully");
      loadAllContacts(); // Reload ALL contacts
    } catch (error) {
      console.error("Error deleting contact:", error);
      toast.error("Failed to delete contact");
    }
  };

  const handleUpdateStatus = async (contactId, newStatus) => {
    try {
      await updateContactStatus(contactId, newStatus);
      toast.success(`Status updated to ${newStatus}`);
      loadAllContacts(); // Reload ALL contacts
      
      // If modal is open for this contact, update it
      if (selectedContact && selectedContact._id === contactId) {
        setSelectedContact(prev => ({
          ...prev,
          status: newStatus
        }));
      }
    } catch (error) {
      console.error("Error updating status:", error);
      toast.error("Failed to update status");
    }
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      new: { variant: "default", label: "New", className: "bg-blue-100 text-blue-800" },
      replied: { variant: "secondary", label: "Replied", className: "bg-purple-100 text-purple-800" },
      read: { variant: "outline", label: "Read", className: "bg-gray-100 text-gray-800" },
      resolved: { variant: "success", label: "Resolved", className: "bg-green-100 text-green-800" }
    };

    const config = statusConfig[status] || { variant: "outline", label: status, className: "bg-gray-100 text-gray-800" };
    
    return (
      <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${config.className}`}>
        {config.label}
      </span>
    );
  };

  // Summary statistics - calculated from ALL contacts
  const summaryStats = {
    total: allContacts.length,
    new: allContacts.filter(c => c.status === "new").length,
    replied: allContacts.filter(c => c.status === "replied").length,
    resolved: allContacts.filter(c => c.status === "resolved").length
  };

  const columns = [
    { 
      label: "Name", 
      key: "name", 
      render: (contact) => (
        <div className="flex items-center gap-3 min-w-[180px]">
          <div className="shrink-0 w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
            <User className="h-4 w-4 text-blue-600" />
          </div>
          <div className="min-w-0">
            <p className="font-medium text-gray-900 truncate">{contact.name}</p>
            {contact.phone && (
              <p className="text-sm text-gray-500 truncate">{contact.phone}</p>
            )}
          </div>
        </div>
      ) 
    },
    { 
      label: "Web Name", 
      key: "webName", 
      render: (contact) => (
        <div className="flex items-center gap-2 min-w-[200px]">
          <Mail className="h-4 w-4 text-gray-400 shrink-0" />
          <span className="text-gray-600 truncate">{contact.webName}</span>
        </div>
      ) 
    },
    { 
      label: "Status", 
      key: "status", 
      render: (contact) => getStatusBadge(contact.status)
    },
    {
      label: "Actions",
      key: "actions",
      align: "right",
      render: (contact) => (
        <div className="flex items-center justify-end gap-2">
          {auth.hasPermission("contact", "view") && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setSelectedContact(contact);
                setIsModalOpen(true);
              }}
              className="h-8 w-8 p-0 md:h-auto md:w-auto md:px-3 md:py-2"
            >
              <Eye className="h-4 w-4 md:mr-1" />
              <span className="hidden md:inline">View</span>
            </Button>
          )}

          {auth.hasPermission("contact", "edit") && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                setSelectedContact(contact);
                setIsModalOpen(true);
                setIsReplyMode(true);
              }}
              className="h-8 w-8 p-0 md:h-auto md:w-auto md:px-3 md:py-2"
            >
              <Reply className="h-4 w-4" />
              <span className="hidden md:inline ml-1">Reply</span>
            </Button>
          )}

          {auth.hasPermission("contact", "delete") && (
            <Button
              variant="destructive"
              size="sm"
              onClick={() => handleDeleteContact(contact._id)}
              className="h-8 w-8 p-0 md:h-auto md:w-auto md:px-3 md:py-2"
            >
              <Trash2 className="h-4 w-4" />
              <span className="hidden md:inline ml-1">Delete</span>
            </Button>
          )}
        </div>
      )
    },
  ];

  // Pagination component
  const Pagination = ({ currentPage, totalPages, onPageChange, totalItems, itemsPerPage }) => {
    const startItem = (currentPage - 1) * itemsPerPage + 1;
    const endItem = Math.min(currentPage * itemsPerPage, totalItems);

    const getPageNumbers = () => {
      const pages = [];
      if (totalPages <= 5) {
        for (let i = 1; i <= totalPages; i++) pages.push(i);
      } else if (currentPage <= 3) {
        pages.push(1, 2, 3, 4, '...', totalPages);
      } else if (currentPage >= totalPages - 2) {
        pages.push(1, '...', totalPages - 3, totalPages - 2, totalPages - 1, totalPages);
      } else {
        pages.push(1, '...', currentPage - 1, currentPage, currentPage + 1, '...', totalPages);
      }
      return pages;
    };

    return (
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mt-6 px-4 border-t pt-6">
        <div className="text-sm text-gray-700">
          Showing <span className="font-medium">{startItem}</span> to{" "}
          <span className="font-medium">{endItem}</span> of{" "}
          <span className="font-medium">{totalItems}</span> contacts
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => onPageChange(currentPage - 1)}
            disabled={currentPage === 1}
            className="flex items-center gap-1"
          >
            <ChevronLeft className="h-4 w-4" />
            <span className="hidden sm:inline">Previous</span>
          </Button>
          
          <div className="flex items-center gap-1">
            {getPageNumbers().map((page, index) => (
              page === '...' ? (
                <span key={`dots-${index}`} className="px-2 py-1">...</span>
              ) : (
                <Button
                  key={page}
                  variant={currentPage === page ? "default" : "outline"}
                  size="sm"
                  onClick={() => onPageChange(page)}
                  className={`h-8 w-8 p-0 ${
                    currentPage === page ? 'bg-blue-600 text-white hover:bg-blue-700' : ''
                  }`}
                >
                  {page}
                </Button>
              )
            ))}
          </div>
          
          <Button
            variant="outline"
            size="sm"
            onClick={() => onPageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
            className="flex items-center gap-1"
          >
            <span className="hidden sm:inline">Next</span>
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-white p-4 md:p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <Card className="shadow-lg border-0 bg-white text-black">
          <CardHeader className="pb-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-white/20 rounded-lg backdrop-blur-sm">
                <Phone className="h-6 w-6" />
              </div>
              <div className="min-w-0 flex-1">
                <CardTitle className="text-xl md:text-2xl font-bold truncate">Contact Center</CardTitle>
                <CardDescription className="text-black text-sm md:text-base">
                  Manage customer inquiries, messages, and feedback
                </CardDescription>
              </div>
            </div>
          </CardHeader>
        </Card>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="border-0 shadow-sm">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Contacts</p>
                  <p className="text-2xl font-bold mt-2">{summaryStats.total}</p>
                </div>
                <div className="p-3 bg-blue-100 rounded-full">
                  <Mail className="h-6 w-6 text-blue-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-sm">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">New Contacts</p>
                  <p className="text-2xl font-bold mt-2">{summaryStats.new}</p>
                </div>
                <div className="p-3 bg-green-100 rounded-full">
                  <MessageSquare className="h-6 w-6 text-green-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-sm">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Replied</p>
                  <p className="text-2xl font-bold mt-2">{summaryStats.replied}</p>
                </div>
                <div className="p-3 bg-purple-100 rounded-full">
                  <CheckCircle className="h-6 w-6 text-purple-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-sm">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Resolved</p>
                  <p className="text-2xl font-bold mt-2">{summaryStats.resolved}</p>
                </div>
                <div className="p-3 bg-emerald-100 rounded-full">
                  <CheckCircle className="h-6 w-6 text-emerald-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content Card */}
        <Card className="shadow-xl border-0 overflow-hidden">
          <CardHeader className="pb-4 border-b bg-white/50">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div className="min-w-0 flex-1">
                <CardTitle className="text-lg md:text-xl font-semibold text-gray-900">Contact Messages</CardTitle>
                <CardDescription className="text-sm">
                  Manage and respond to customer inquiries
                </CardDescription>
              </div>
              
              {/* Search and Filter Controls */}
             <div className="flex flex-col sm:flex-row gap-3">
  <div className="relative">
    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
    <Input
      placeholder="Search contacts..."
      value={searchQuery}
      onChange={(e) => setSearchQuery(e.target.value)}
      className="pl-9 w-full sm:w-64"
      onKeyPress={(e) => e.key === 'Enter' && handleSearch(e)}
    />
  </div>
  
  {/* Shadcn Select Component */}
  <Select
    value={statusFilter}
    onValueChange={(value) => {
      setStatusFilter(value);
      setCurrentPage(1); // Reset to first page when filtering
    }}
  >
    <SelectTrigger className="w-full sm:w-[180px] border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500">
      <SelectValue placeholder="All Status" />
    </SelectTrigger>
    <SelectContent>
      <SelectGroup>
        <SelectLabel>Status Filter</SelectLabel>
        <SelectItem value="all">All Status</SelectItem>
        <SelectItem value="new">New</SelectItem>
        <SelectItem value="read">Read</SelectItem>
        <SelectItem value="replied">Replied</SelectItem>
        <SelectItem value="resolved">Resolved</SelectItem>
      </SelectGroup>
    </SelectContent>
  </Select>
</div>
            </div>
          </CardHeader>

          <CardContent className="p-0 md:p-6">
            {/* Contacts Table */}
            <div className="overflow-x-auto">
              <div className="min-w-full inline-block align-middle">
                <div className="overflow-hidden">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        {columns.map((column) => (
                          <th
                            key={column.key}
                            scope="col"
                            className={`px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap ${
                              column.align === 'right' ? 'text-right' : ''
                            }`}
                          >
                            {column.label}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {loading ? (
                        <tr>
                          <td colSpan={columns.length} className="px-4 py-8 text-center">
                            <div className="flex justify-center">
                              <Loader2 className="h-6 w-6 animate-spin text-blue-600" />
                            </div>
                          </td>
                        </tr>
                      ) : currentContacts.length > 0 ? (
                        currentContacts.map((contact) => (
                          <tr key={contact._id} className="hover:bg-gray-50 transition-colors">
                            {columns.map((column) => (
                              <td
                                key={column.key}
                                className={`px-4 py-4 whitespace-nowrap ${
                                  column.align === 'right' ? 'text-right' : ''
                                }`}
                              >
                                {column.render(contact)}
                              </td>
                            ))}
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan={columns.length} className="px-4 py-8 text-center text-gray-500">
                            {searchQuery || statusFilter !== "all" ? "No matching contacts found" : "No contacts found"}
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

            {/* Pagination Controls */}
            {totalPages > 1 && (
              <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={setCurrentPage}
                totalItems={filteredTotal}
                itemsPerPage={5}
              />
            )}
          </CardContent>
        </Card>
      </div>

      {/* Contact Details Modal */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="max-w-[95vw] md:max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-lg md:text-xl">
              <User className="h-5 w-5 text-blue-600" />
              Contact Details
            </DialogTitle>
            <DialogDescription className="text-sm md:text-base">
              Complete information about this contact inquiry
            </DialogDescription>
          </DialogHeader>

          {selectedContact && (
            <div className="space-y-6 mt-4">
              {/* Contact Information */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Contact Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-gray-500">Name</label>
                      <p className="text-base font-semibold break-all">{selectedContact.name}</p>
                    </div>
                    
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-gray-500">Email</label>
                      <p className="text-base font-semibold break-all">{selectedContact.email}</p>
                    </div>

                    {selectedContact.phone && (
                      <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-500">Phone</label>
                        <p className="text-base font-semibold break-all">{selectedContact.phone}</p>
                      </div>
                    )}

                    <div className="space-y-2">
                      <label className="text-sm font-medium text-gray-500">Web Name</label>
                      <p className="text-base font-semibold break-all">{selectedContact.webName}</p>
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-medium text-gray-500">Status</label>
                      <div className="flex items-center gap-2">
                        {getStatusBadge(selectedContact.status)}
                        {auth.hasPermission("contact", "edit") && (
                          <Select
                            value={selectedContact.status}
                            onValueChange={(value) => handleUpdateStatus(selectedContact._id, value)}
                          >
                            <SelectTrigger className="w-[120px]">
                              <SelectValue placeholder="Select status" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectGroup>
                                <SelectLabel>Update Status</SelectLabel>
                                <SelectItem value="new">New</SelectItem>
                                <SelectItem value="read">Read</SelectItem>
                                <SelectItem value="replied">Replied</SelectItem>
                                <SelectItem value="resolved">Resolved</SelectItem>
                              </SelectGroup>
                            </SelectContent>
                          </Select>
                        )}
                      </div>
                    </div>

                    {selectedContact.createdAt && (
                      <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-500">Received</label>
                        <p className="text-sm">
                          {format(new Date(selectedContact.createdAt), "PPpp")}
                        </p>
                      </div>
                    )}
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-500">Message</label>
                    <div className="bg-gray-50 rounded-lg p-4">
                      <p className="text-gray-700 whitespace-pre-wrap leading-relaxed break-all">
                        {selectedContact.message}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Reply Section */}
              {!isReplyMode ? (
                auth.hasPermission?.("contact", "edit") && (
                  <div className="flex justify-center">
                    <Button
                      onClick={() => setIsReplyMode(true)}
                      className="bg-blue-600 hover:bg-blue-700 w-full sm:w-auto"
                    >
                      <Reply className="h-4 w-4 mr-2" />
                      Reply to Contact
                    </Button>
                  </div>
                )
              ) : (
                auth.hasPermission?.("contact", "edit") ? (
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2 text-green-700">
                        <Mail className="h-5 w-5" />
                        Reply to {selectedContact.name}
                      </CardTitle>
                      <CardDescription>
                        Send a response to this contact inquiry
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-700">Subject</label>
                        <Input
                          value={replySubject}
                          onChange={(e) => setReplySubject(e.target.value)}
                          placeholder="Enter subject line"
                        />
                      </div>

                      <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-700">Message</label>
                        <Textarea
                          value={replyMessage}
                          onChange={(e) => setReplyMessage(e.target.value)}
                          placeholder="Type your reply message here..."
                          rows={6}
                          className="resize-none"
                        />
                      </div>

                      <div className="flex flex-col sm:flex-row gap-3 justify-end">
                        <Button
                          variant="outline"
                          onClick={() => setIsReplyMode(false)}
                          disabled={isSendingReply}
                          className="w-full sm:w-auto"
                        >
                          Cancel
                        </Button>
                        <Button
                          onClick={handleReply}
                          disabled={isSendingReply || !replySubject.trim() || !replyMessage.trim()}
                          className="bg-green-600 hover:bg-green-700 w-full sm:w-auto"
                        >
                          {isSendingReply ? (
                            <>
                              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                              Sending...
                            </>
                          ) : (
                            <>
                              <Mail className="h-4 w-4 mr-2" />
                              Send Reply
                            </>
                          )}
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ) : (
                  <div className="p-4 rounded bg-yellow-50 border border-yellow-100 text-sm text-yellow-800">
                    You don't have permission to reply to this contact.
                  </div>
                )
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

