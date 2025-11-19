"use client";

import { motion } from "framer-motion";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import { Users, CalendarDays, BarChart3, DollarSign,LayoutDashboard  } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import PageHeader from "@/components/common/PageHeader";

export default function DashboardPage() {
  // animation variant
  const fadeUp = {
    hidden: { opacity: 0, y: 30 },
    visible: (i = 1) => ({
      opacity: 1,
      y: 0,
      transition: {
        delay: i * 0.15,
        duration: 0.6,
        ease: "easeOut",
      },
    }),
  };

  return (
    <div className="space-y-8 bg-white">
      {/* Header */}
      <PageHeader
              title=" Dashboard Overview"
              description=" Welcome Back  Let’s check your latest insights and stats."
              icon={LayoutDashboard }
            />
      <Separator />

      {/* Quick Actions */}
      <motion.div
        initial="hidden"
        animate="visible"
        custom={4}
        variants={fadeUp}
      >
        <Card className="shadow-sm hover:shadow-md transition-all">
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>Common tasks to get you started</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-3">
              <Button variant="outline" size="sm" onClick={() => window.location.href = '/dashboard/users'}>
                <Users className="h-4 w-4 mr-2" />
                Add User
              </Button>
              <Button variant="outline" size="sm" onClick={() => window.location.href = '/dashboard/bookings'}>
                <CalendarDays className="h-4 w-4 mr-2" />
                New Booking
              </Button>
              <Button variant="outline" size="sm" onClick={() => window.location.href = '/dashboard/analytics'}>
                <BarChart3 className="h-4 w-4 mr-2" />
                View Analytics
              </Button>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      <Separator />

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
        {[
          {
            title: "Total Users",
            value: "1,245",
            change: "+12%",
            icon: Users,
            color: "text-blue-600",
          },
          {
            title: "Bookings",
            value: "342",
            change: "+8%",
            icon: CalendarDays,
            color: "text-green-600",
          },
          {
            title: "Revenue",
            value: "$4,520",
            change: "+5.4%",
            icon: DollarSign,
            color: "text-yellow-600",
          },
          {
            title: "Growth",
            value: "23%",
            change: "+3.2%",
            icon: BarChart3,
            color: "text-purple-600",
          },
        ].map((stat, i) => (
          <motion.div key={i} custom={i} initial="hidden" animate="visible" variants={fadeUp}>
            <Card className="shadow-sm hover:shadow-md transition-all">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  {stat.title}
                </CardTitle>
                <stat.icon className={`h-5 w-5 ${stat.color}`} />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stat.value}</div>
                <p className="text-xs text-muted-foreground">{stat.change} from last week</p>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      <Separator />

      {/* Recent Activity */}
      <motion.div
        initial="hidden"
        animate="visible"
        variants={fadeUp}
        className="space-y-4"
      >
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <h2 className="text-xl font-semibold">Recent Activity</h2>
          <Button variant="outline" size="sm">View All</Button>
        </div>

        <div className="overflow-x-auto rounded-xl border">
          <table className="min-w-full bg-white text-sm">
            <thead className="bg-gray-50 text-gray-600">
              <tr>
                <th className="text-left px-4 py-3 font-medium">User</th>
                <th className="text-left px-4 py-3 font-medium">Activity</th>
                <th className="text-left px-4 py-3 font-medium">Date</th>
                <th className="text-left px-4 py-3 font-medium">Status</th>
              </tr>
            </thead>
            <tbody>
              {[
                {
                  user: "Ali",
                  action: "Booked Appointment",
                  date: "Oct 8, 2025",
                  status: "Completed",
                },
                {
                  user: "Sarah Smith",
                  action: "Created Account",
                  date: "Oct 7, 2025",
                  status: "New",
                },
                {
                  user: "Mike Johnson",
                  action: "Updated Profile",
                  date: "Oct 6, 2025",
                  status: "Pending",
                },
              ].map((item, index) => (
                <motion.tr
                  key={index}
                  custom={index}
                  initial="hidden"
                  animate="visible"
                  variants={fadeUp}
                  className="border-t hover:bg-gray-50 transition"
                >
                  <td className="px-4 py-3 font-medium">{item.user}</td>
                  <td className="px-4 py-3 text-gray-700">{item.action}</td>
                  <td className="px-4 py-3 text-gray-500">{item.date}</td>
                  <td className="px-4 py-3">
                    <span
                      className={`px-2 py-1 text-xs rounded-full ${
                        item.status === "Completed"
                          ? "bg-green-100 text-green-700"
                          : item.status === "Pending"
                          ? "bg-yellow-100 text-yellow-700"
                          : "bg-blue-100 text-blue-700"
                      }`}
                    >
                      {item.status}
                    </span>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
      </motion.div>
    </div>
  );
}
