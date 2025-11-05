"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import PageHeader from "@/components/common/PageHeader";
import SummaryCards from "@/components/common/SummaryCards";
import DataTable from "@/components/common/DataTable";
import SearchResultCard from "@/components/common/SearchResultCard";
import BookingSearchBar from "@/components/SearchBar";
import { fetchContacts } from "@/action/contactActions";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import {
  Phone,
  MessageSquare,
  UserPlus,
  Search,
  Inbox,
  CheckCircle,
  Loader,
  Eye,
} from "lucide-react";

export default function ContactsPage() {
  const [contacts, setContacts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  const fadeUp = {
    hidden: { opacity: 0, y: 20 },
    visible: (i = 1) => ({
      opacity: 1,
      y: 0,
      transition: { delay: i * 0.1, duration: 0.5, ease: "easeOut" },
    }),
  };

  useEffect(() => {
    const loadContacts = async () => {
      try {
        setLoading(true);
        const data = await fetchContacts();
        setContacts(
          Array.isArray(data) ? data : data.contacts || data.data || []
        );
      } catch (error) {
        console.error("Error fetching contacts:", error);
      } finally {
        setLoading(false);
      }
    };

    loadContacts();
  }, []);

  // 🔍 Search handler
  const handleSearch = (query) => setSearch(query);

  // 🔎 Filter contacts
  const filteredContacts = contacts.filter(
    (c) =>
      c.name?.toLowerCase().includes(search.toLowerCase()) ||
      c.email?.toLowerCase().includes(search.toLowerCase()) ||
      c.phone?.toLowerCase().includes(search.toLowerCase())
  );

  const isSearching = search.trim().length > 0;

  return (
    <div className="space-y-8">
      {/* Header */}

      <PageHeader
        title="Contact Center"
        description="Manage customer inquiries, messages, and feedback."
        icon={Phone}
      />

      {/* Search Bar */}
      <motion.div
        initial="hidden"
        animate="visible"
        custom={1}
        variants={fadeUp}
        className="flex flex-col sm:flex-row gap-3"
      >
        <BookingSearchBar
          onSearch={handleSearch}
          placeholder="Search contacts..."
        />
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
          {filteredContacts.length === 0 ? (
            <p className="text-center text-gray-500 col-span-full">
              No results found for 
            </p>
          ) : (
            filteredContacts.map((contact, index) => (
              <SearchResultCard
                key={contact._id}
                item={contact}
                index={index}
                fadeUp={fadeUp}
                type="contact"
                onViewDetails={(c) => console.log("Contact details:", c)}
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
                title: "Total Contacts",
                value: contacts.length,
                description: "All received messages",
                color: "from-blue-500/10 to-blue-500/5 text-blue-700",
                icon: Inbox,
              },
              {
                title: "New Contacts",
                value: contacts.filter((c) => c.status === "New").length,
                description: "Unread messages",
                color: "from-green-500/10 to-green-500/5 text-green-700",
                icon: MessageSquare,
              },
              {
                title: "In Progress",
                value: contacts.filter((c) => c.status === "In Progress")
                  .length,
                description: "Currently managed",
                color: "from-yellow-500/10 to-yellow-500/5 text-yellow-700",
                icon: Loader,
              },
              {
                title: "Resolved",
                value: contacts.filter((c) => c.status === "Resolved").length,
                description: "Handled successfully",
                color: "from-red-500/10 to-red-500/5 text-red-700",
                icon: CheckCircle,
              },
            ]}
          />

          <Separator />

          {/* Contact Messages */}
          <motion.div
            initial="hidden"
            animate="visible"
            custom={3}
            variants={fadeUp}
            className="space-y-4"
          >
            <h2 className="text-xl font-semibold flex items-center gap-2">
              <MessageSquare className="h-5 w-5" />
              Recent Messages
            </h2>

            {/* Mobile Card View */}
            <div className="block sm:hidden space-y-4">
              {loading ? (
                <div className="text-center py-8">
                  <Loader className="h-8 w-8 animate-spin mx-auto mb-4" />
                  <p>Loading contacts...</p>
                </div>
              ) : contacts.length === 0 ? (
                <p className="text-center text-gray-500 py-8">
                  No contacts found.
                </p>
              ) : (
                contacts.map((contact, index) => (
                  <motion.div
                    key={contact._id}
                    custom={index}
                    initial="hidden"
                    animate="visible"
                    variants={fadeUp}
                    className="bg-white border rounded-lg p-4 shadow-sm hover:shadow-md transition"
                  >
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="font-medium text-gray-900">
                        {contact.name}
                      </h3>
                      <span
                        className={`px-2 py-1 text-xs rounded-full ${
                          contact.status === "New"
                            ? "bg-blue-100 text-blue-700"
                            : contact.status === "In Progress"
                            ? "bg-yellow-100 text-yellow-700"
                            : "bg-green-100 text-green-700"
                        }`}
                      >
                        {contact.status}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 mb-1">
                      {contact.email}
                    </p>
                    <p className="text-sm text-gray-500 mb-3">
                      {contact.message
                        ? contact.message.length > 50
                          ? contact.message.substring(0, 50) + "..."
                          : contact.message
                        : "No message"}
                    </p>
                    <Button variant="ghost" size="sm">
                      <Eye className="h-4 w-4 mr-1" />
                      View
                    </Button>
                  </motion.div>
                ))
              )}
            </div>

            {/* Desktop Table View */}
            <div className="hidden sm:block overflow-x-auto rounded-xl border">
              <table className="min-w-full bg-white text-sm">
                <thead className="bg-gray-50 text-gray-600">
                  <tr>
                    <th className="text-left px-4 py-3 font-medium">Name</th>
                    <th className="text-left px-4 py-3 font-medium">Email</th>
                    <th className="text-left px-4 py-3 font-medium">Message</th>
                    <th className="text-left px-4 py-3 font-medium">Status</th>
                    <th className="text-right px-4 py-3 font-medium">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    <tr>
                      <td colSpan="5" className="text-center py-8">
                        <Loader className="h-6 w-6 animate-spin mx-auto mb-2" />
                        Loading contacts...
                      </td>
                    </tr>
                  ) : contacts.length === 0 ? (
                    <tr>
                      <td colSpan="5" className="text-center py-8 text-gray-500">
                        No contacts found.
                      </td>
                    </tr>
                  ) : (
                    contacts.map((contact, index) => (
                      <motion.tr
                        key={contact._id}
                        custom={index}
                        initial="hidden"
                        animate="visible"
                        variants={fadeUp}
                        className="border-t hover:bg-gray-50 transition"
                      >
                        <td className="px-4 py-3 font-medium">
                          {contact.name}
                        </td>
                        <td className="px-4 py-3 text-gray-600">
                          {contact.email}
                        </td>
                        <td className="px-4 py-3">
                          {contact.message
                            ? contact.message.length > 50
                              ? contact.message.substring(0, 50) + "..."
                              : contact.message
                            : "No message"}
                        </td>
                        <td className="px-4 py-3">
                          <span
                            className={`px-2 py-1 text-xs rounded-full ${
                              contact.status === "New"
                                ? "bg-blue-100 text-blue-700"
                                : contact.status === "In Progress"
                                ? "bg-yellow-100 text-yellow-700"
                                : "bg-green-100 text-green-700"
                            }`}
                          >
                            {contact.status}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-right">
                          <Button variant="ghost" size="sm">
                            View
                          </Button>
                        </td>
                      </motion.tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </motion.div>
        </>
      )}
    </div>
  );
}
