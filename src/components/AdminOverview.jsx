"use client";
import { useRouter } from "next/navigation";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
} from "@/components/ui/card";

export default function AdminOverview({ bookings, messages }) {
  const router = useRouter();

  return (
    <Card className="w-full max-w-5xl shadow-xl">
      <CardHeader>
        <CardTitle className="text-3xl font-extrabold text-center text-gray-900 dark:text-gray-100">
          Admin Overview
        </CardTitle>
      </CardHeader>
      <CardContent>
        {/* Stats Section */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 mb-12">
          <div className="bg-gradient-to-r from-blue-600 to-blue-500 text-white p-8 rounded-xl shadow-lg hover:scale-105 transform transition-transform cursor-default">
            <h2 className="text-lg font-semibold tracking-wide">Total Bookings</h2>
            <p className="text-4xl font-extrabold mt-3">{bookings.length}</p>
          </div>
          <div className="bg-gradient-to-r from-green-600 to-green-500 text-white p-8 rounded-xl shadow-lg hover:scale-105 transform transition-transform cursor-default">
            <h2 className="text-lg font-semibold tracking-wide">Contact Messages</h2>
            <p className="text-4xl font-extrabold mt-3">{messages.length}</p>
          </div>
        </div>

        {/* Quick Links */}
        <div className="flex flex-wrap justify-center gap-6">
          <a
            href="/api/booking"
            target="_blank"
            rel="noopener noreferrer"
            className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-6 py-3 rounded-lg shadow-md transition-colors focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-offset-2"
          >
            🔗 View Bookings API
          </a>
          <a
            href="/api/contact"
            target="_blank"
            rel="noopener noreferrer"
            className="bg-green-600 hover:bg-green-700 text-white font-semibold px-6 py-3 rounded-lg shadow-md transition-colors focus:outline-none focus:ring-2 focus:ring-green-400 focus:ring-offset-2"
          >
            🔗 View Contact API
          </a>
          <a
            href="https://vercel.com/dashboard"
            target="_blank"
            rel="noopener noreferrer"
            className="bg-gray-700 hover:bg-gray-800 text-white font-semibold px-6 py-3 rounded-lg shadow-md transition-colors focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
          >
            ⚙️ Vercel Dashboard
          </a>
          <button
            onClick={() => router.push("/dashboard")}
            className="bg-purple-600 hover:bg-purple-700 text-white font-semibold px-6 py-3 rounded-lg shadow-md transition-colors focus:outline-none focus:ring-2 focus:ring-purple-400 focus:ring-offset-2"
          >
            🧭 Go to Dashboard
          </button>
        </div>
      </CardContent>
    </Card>
  );
}
