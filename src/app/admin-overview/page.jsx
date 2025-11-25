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
      <div className="flex items-center justify-center min-h-screen p-8 text-gray-500 dark:text-gray-400">
        Loading admin overview...
      </div>
    );

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-900 transition-colors duration-300">
      <Header />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-12 flex flex-col items-center">
        <PreferredAdminOverview bookings={bookings} messages={messages} />
        <footer className="mt-16 text-gray-400 text-center text-sm select-none">
          Built with Gobium Cloud | Powered by Next.js + MongoDB
        </footer>
      </main>
    </div>
  );
}
