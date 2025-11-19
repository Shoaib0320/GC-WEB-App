//src/app/(dashboard)/dashboard/contacts/page.jsx
"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import PageHeader from "@/components/common/PageHeader";
import SummaryCards from "@/components/common/SummaryCards";
import GlobalData from "@/components/common/GlobalData";
import { fetchContacts } from "@/action/contactActions";
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
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
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
} from "lucide-react";
import { toast } from "sonner";
import { format } from "date-fns";

export default function ContactsPage() {
  const [contacts, setContacts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedContact, setSelectedContact] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isReplyMode, setIsReplyMode] = useState(false);
  const [replySubject, setReplySubject] = useState("");
  const [replyMessage, setReplyMessage] = useState("");
  const [isSendingReply, setIsSendingReply] = useState(false);

  const fadeUp = {
    hidden: { opacity: 0, y: 20 },
    visible: (i = 1) => ({
      opacity: 1,
      y: 0,
      transition: { delay: i * 0.1, duration: 0.5, ease: "easeOut" },
    }),
  };

  useEffect(() => {
    loadContacts();
  }, []);

  const loadContacts = async () => {
    try {
      setLoading(true);
      const data = await fetchContacts();
      setContacts(data.data || []);
      console.log('Contact Data', data);
    } catch (error) {
      console.error("Error fetching contacts:", error);
      toast.error("Failed to load contacts");
    } finally {
      setLoading(false);
    }
  };

  const handleReply = async () => {
    if (!replySubject.trim() || !replyMessage.trim()) {
      toast.warning("Please fill in both subject and message fields.");
      return;
    }

    setIsSendingReply(true);
    try {
      const response = await fetch("/api/contact/reply", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          contactId: selectedContact._id,
          subject: replySubject,
          message: replyMessage,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to send reply");
      }

      setContacts(prevContacts =>
        prevContacts.map(contact =>
          contact._id === selectedContact._id
            ? { ...contact, status: "replied" }
            : contact
        )
      );

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

  const contactsFetcher = async (params = {}) => {
    try {
      const url = new URL("/api/contact", window.location.origin);
      if (params.page) url.searchParams.set("page", params.page);
      if (params.limit) url.searchParams.set("limit", params.limit);
      if (params.search) url.searchParams.set("search", params.search);
      
      Object.keys(params).forEach((k) => {
        if (["page", "limit", "search"].includes(k)) return;
        const v = params[k];
        if (v === undefined || v === null) return;
        url.searchParams.set(k, v);
      });

      const res = await fetch(url.toString());
      const json = await res.json();
      
      if (json.success) {
        return { 
          data: json.data || [], 
          meta: json.meta || { 
            total: 0, 
            totalPages: 1, 
            page: params.page || 1, 
            limit: params.limit || 10 
          } 
        };
      }
      return { 
        data: [], 
        meta: { 
          total: 0, 
          totalPages: 1, 
          page: params.page || 1, 
          limit: params.limit || 10 
        } 
      };
    } catch (err) {
      console.error("contactsFetcher error", err);
      return { 
        data: [], 
        meta: { 
          total: 0, 
          totalPages: 1, 
          page: params.page || 1, 
          limit: params.limit || 10 
        } 
      };
    }
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      new: { variant: "default", label: "New" },
      replied: { variant: "secondary", label: "Replied" },
      read: { variant: "outline", label: "Read" },
      resolved: { variant: "success", label: "Resolved" }
    };

    const config = statusConfig[status] || { variant: "outline", label: status };
    
    return (
      <Badge variant={config.variant} className="capitalize">
        {config.label}
      </Badge>
    );
  };

  const columns = [
    { 
      label: "Name", 
      key: "name", 
      render: (contact) => (
        <div className="flex items-center gap-3">
          <div className="flex-shrink-0 w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
            <User className="h-4 w-4 text-blue-600" />
          </div>
          <div>
            <p className="font-medium text-gray-900">{contact.name}</p>
            {contact.phone && (
              <p className="text-sm text-gray-500">{contact.phone}</p>
            )}
          </div>
        </div>
      ) 
    },
    { 
      label: "Email", 
      key: "email", 
      render: (contact) => (
        <div className="flex items-center gap-2">
          <Mail className="h-4 w-4 text-gray-400" />
          <span className="text-gray-600">{contact.email}</span>
        </div>
      ) 
    },
    { 
      label: "Message", 
      key: "message", 
      render: (contact) => (
        <p className="text-gray-600 line-clamp-2 max-w-xs">
          {contact.message || "No message"}
        </p>
      ) 
    },
    { 
      label: "Status", 
      key: "status", 
      render: (contact) => getStatusBadge(contact.status)
    },
    { 
      label: "Date", 
      key: "createdAt", 
      render: (contact) => (
        <div className="flex items-center gap-2 text-sm text-gray-500">
          <Calendar className="h-4 w-4" />
          {contact.createdAt ? format(new Date(contact.createdAt), "MMM dd, yyyy") : "N/A"}
        </div>
      ) 
    },
    { 
      label: "Actions", 
      key: "actions", 
      render: (contact) => (
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              setSelectedContact(contact);
              setIsModalOpen(true);
            }}
          >
            <Eye className="h-4 w-4 mr-1" />
            View
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              setSelectedContact(contact);
              setIsModalOpen(true);
              setIsReplyMode(true);
            }}
          >
            <Reply className="h-4 w-4" />
          </Button>
        </div>
      ),
      align: 'right'
    },
  ];

  return (
    <div className="space-y-6 p-4 md:p-6 max-w-full overflow-x-hidden">
      {/* Header */}
      <PageHeader
        title="Contact Center"
        description="Manage customer inquiries, messages, and feedback."
        icon={Phone}
      />

      <Separator />

      {/* Summary Cards */}
      <SummaryCards
        cards={[
          {
            title: "Total Contacts",
            value: contacts.length,
            description: "All received messages",
            color: "from-blue-500/10 to-blue-500/5 text-blue-700",
            icon: Mail,
          },
          {
            title: "New Contacts",
            value: contacts.filter((c) => c.status === "new").length,
            description: "Unread messages",
            color: "from-green-500/10 to-green-500/5 text-green-700",
            icon: MessageSquare,
          },
          {
            title: "Replied",
            value: contacts.filter((c) => c.status === "replied").length,
            description: "Messages with replies",
            color: "from-purple-500/10 to-purple-500/5 text-purple-700",
            icon: CheckCircle,
          },
          {
            title: "Resolved",
            value: contacts.filter((c) => c.status === "resolved").length,
            description: "Completed inquiries",
            color: "from-emerald-500/10 to-emerald-500/5 text-emerald-700",
            icon: CheckCircle,
          },
        ]}
      />

      <Separator />

      {/* Contacts Table with GlobalData */}
      <Card className="w-full">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MessageSquare className="h-5 w-5" />
            Contact Messages
          </CardTitle>
          <CardDescription>
            Manage and respond to customer inquiries
          </CardDescription>
        </CardHeader>
        <CardContent className="p-0 sm:p-6">
          <GlobalData
            title="Contacts"
            fetcher={contactsFetcher}
            columns={columns}
            serverSide={true}
            rowsPerPage={10}
            searchEnabled={true}
            searchPlaceholder="Search contacts by name, email, or message..."
            onDataFetched={(items, metaData) => {
              setContacts(items || []);
            }}
          />
        </CardContent>
      </Card>

      {/* Contact Details Modal - FIXED for mobile */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="sm:max-w-2xl max-w-[95vw] max-h-[90vh] overflow-hidden flex flex-col p-0">
          <DialogHeader className="p-6 pb-4">
            <DialogTitle className="flex items-center gap-2">
              <User className="h-5 w-5 text-blue-600" />
              Contact Details
            </DialogTitle>
            <DialogDescription>
              Complete information about this contact inquiry
            </DialogDescription>
          </DialogHeader>
          
          {/* FIXED: Scrollable content area */}
          <div className="overflow-y-auto flex-1 px-6 pb-6">
            {selectedContact && (
              <div className="space-y-6">
                {/* Contact Information */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Contact Information</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-500">Name</label>
                        <p className="text-base font-semibold break-words">{selectedContact.name}</p>
                      </div>
                      
                      <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-500">Email</label>
                        <p className="text-base font-semibold break-all">{selectedContact.email}</p>
                      </div>

                      {selectedContact.phone && (
                        <div className="space-y-2">
                          <label className="text-sm font-medium text-gray-500">Phone</label>
                          <p className="text-base font-semibold">{selectedContact.phone}</p>
                        </div>
                      )}

                      <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-500">Status</label>
                        <div>{getStatusBadge(selectedContact.status)}</div>
                      </div>

                      {selectedContact.createdAt && (
                        <div className="space-y-2">
                          <label className="text-sm font-medium text-gray-500">Received</label>
                          <p className="text-base text-sm">
                            {format(new Date(selectedContact.createdAt), "PPpp")}
                          </p>
                        </div>
                      )}
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-medium text-gray-500">Message</label>
                      <div className="bg-gray-50 rounded-lg p-4">
                        <p className="text-gray-700 whitespace-pre-wrap leading-relaxed break-words">
                          {selectedContact.message}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Reply Section */}
                {!isReplyMode ? (
                  <div className="flex justify-center">
                    <Button
                      onClick={() => setIsReplyMode(true)}
                      className="bg-blue-600 hover:bg-blue-700 w-full sm:w-auto"
                    >
                      <Reply className="h-4 w-4 mr-2" />
                      Reply to Contact
                    </Button>
                  </div>
                ) : (
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
                )}
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}



