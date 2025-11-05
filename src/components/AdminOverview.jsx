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
    <Card className="w-full max-w-5xl shadow-lg">
      <CardHeader>
        <CardTitle className="text-3xl font-bold text-center">Admin Overview</CardTitle>
      </CardHeader>
      <CardContent>
        {/* Stats Section */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-10">
          <div className="bg-blue-500 text-white p-6 rounded-xl shadow hover:scale-105 transition">
            <h2 className="text-lg font-semibold">Total Bookings</h2>
            <p className="text-3xl font-bold mt-2">{bookings.length}</p>
          </div>
          <div className="bg-green-500 text-white p-6 rounded-xl shadow hover:scale-105 transition">
            <h2 className="text-lg font-semibold">Contact Messages</h2>
            <p className="text-3xl font-bold mt-2">{messages.length}</p>
          </div>
        </div>

        {/* Quick Links */}
        <div className="flex flex-wrap justify-center gap-4">
          <a
            href="/api/booking"
            target="_blank"
            className="bg-blue-600 text-white px-5 py-2 rounded-lg hover:bg-blue-700 transition"
          >
            🔗 View Bookings API
          </a>
          <a
            href="/api/contact"
            target="_blank"
            className="bg-green-600 text-white px-5 py-2 rounded-lg hover:bg-green-700 transition"
          >
            🔗 View Contact API
          </a>
          <a
            href="https://vercel.com/dashboard"
            target="_blank"
            className="bg-gray-700 text-white px-5 py-2 rounded-lg hover:bg-gray-800 transition"
          >
            ⚙️ Vercel Dashboard
          </a>

          {/* 🧭 Go to Dashboard Button */}
          <button
            onClick={() => router.push("/dashboard")}
            className="bg-purple-600 text-white px-5 py-2 rounded-lg hover:bg-purple-700 transition"
          >
            🧭 Go to Dashboard
          </button>
        </div>
      </CardContent>
    </Card>
  );
}
