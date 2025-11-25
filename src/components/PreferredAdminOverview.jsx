"use client";
import AdminOverview from "@/components/AdminOverview";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
} from "@/components/ui/card";
import { Star } from "lucide-react";

export default function PreferredAdminOverview({ bookings, messages }) {
  return (
    <Card className="w-full max-w-5xl shadow-2xl border border-blue-400">
      <CardHeader className="bg-blue-100 dark:bg-blue-900 rounded-t-lg border-b border-blue-300 dark:border-blue-700">
        <CardTitle className="text-2xl font-semibold text-center flex items-center justify-center gap-2 text-blue-700 dark:text-blue-400 select-none">
          <Star className="h-6 w-6 text-yellow-400" />
          Preferred Admin Overview
          <Star className="h-6 w-6 text-yellow-400" />
        </CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <AdminOverview bookings={bookings} messages={messages} />
      </CardContent>
    </Card>
  );
}
