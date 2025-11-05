"use client";
import { useEffect, useState } from "react";
import PreferredAdminOverview from "@/components/PreferredAdminOverview";
import Header from "@/components/Header";

export default function AdminOverviewPage() {
  const [bookings, setBookings] = useState([]);
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        const [bookingsRes, messagesRes] = await Promise.all([
          fetch("/api/booking"),
          fetch("/api/contact"),
        ]);

        const bookingsData = await bookingsRes.json();
        const messagesData = await messagesRes.json();

        setBookings(bookingsData?.data || []);
        setMessages(messagesData?.data || []);
      } catch (err) {
        console.error("Dashboard Fetch Error:", err);
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, []);

  if (loading)
    return (
      <div className="p-8 text-center text-gray-500">
        Loading admin overview...
      </div>
    );

  return (
    <div className="min-h-screen bg-gray-100">
      <Header />
      <main className="flex flex-col items-center py-12">
        <PreferredAdminOverview bookings={bookings} messages={messages} />

        <footer className="mt-10 text-gray-500 text-sm">
          Built with Gobium Cloud | Powered by Next.js + MongoDB
        </footer>
      </main>
    </div>
  );
}
