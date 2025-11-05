"use client";
import { useRouter } from "next/navigation";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
} from "@/components/ui/card";
import { User } from "lucide-react";

export default function AdminOverviewCard() {
  const router = useRouter();

  return (
    <div className="w-full max-w-md">
      <Card
        className="bg-blue-50 shadow-sm hover:shadow-md transition-all cursor-pointer"
        onClick={() => router.push("/admin-overview")}
      >
        <CardHeader className="flex flex-row items-center space-y-0 pb-2">
          <CardTitle className="text-lg font-semibold flex items-center gap-2">
            <User className="h-5 w-5 text-blue-600" />
            Admin Overview
          </CardTitle>
        </CardHeader>
      </Card>
    </div>
  );
}
