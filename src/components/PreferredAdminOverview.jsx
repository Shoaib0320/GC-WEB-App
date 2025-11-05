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
    <Card className="w-full max-w-5xl shadow-lg border-2 border-blue-500 relative">
      <CardHeader className="bg-blue-50">
        <CardTitle className="text-2xl font-bold text-center flex items-center justify-center gap-2">
          <Star className="h-6 w-6 text-yellow-500" />
          Preferred Admin Overview
          <Star className="h-6 w-6 text-yellow-500" />
        </CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <AdminOverview bookings={bookings} messages={messages} />
      </CardContent>
    </Card>
  );
}
