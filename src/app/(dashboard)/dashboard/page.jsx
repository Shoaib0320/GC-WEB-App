"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import { Users, CalendarDays, BarChart3, DollarSign, LayoutDashboard } from "lucide-react";
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

  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let mounted = true;
    import("@/services/dashboardService")
      .then((mod) => mod.getDashboardStats())
      .then((data) => {
        if (!mounted) return;
        setStats(data);
        setLoading(false);
      })
      .catch((err) => {
        if (!mounted) return;
        console.error(err);
        setError(err.message || "Failed to load dashboard");
        setLoading(false);
      });
    return () => {
      mounted = false;
    };
  }, []);

  const formatNumber = (n) => {
    if (n === undefined || n === null) return "-";
    return n.toLocaleString();
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
      <motion.div initial="hidden" animate="visible" custom={4} variants={fadeUp}>
        <Card className="shadow-sm hover:shadow-md transition-all">
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>Common tasks to get you started</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col gap-4">
              {/* Buttons: stack full-width on mobile, inline on larger screens */}
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-2">
                <Button aria-label="Add user" className="w-full justify-between" variant="outline" size="sm" onClick={() => (window.location.href = '/dashboard/users')}>
                  <div className="flex items-center">
                    <Users className="h-4 w-4 mr-2" />
                    <span>Add User</span>
                  </div>
                  <span className="inline-flex items-center justify-center rounded-full bg-blue-100 text-blue-800 text-xs px-2 py-0.5">{stats ? formatNumber(stats.totalUsers) : '—'}</span>
                </Button>

                <Button aria-label="New booking" className="w-full justify-between" variant="outline" size="sm" onClick={() => (window.location.href = '/dashboard/bookings')}>
                  <div className="flex items-center">
                    <CalendarDays className="h-4 w-4 mr-2" />
                    <span>New Booking</span>
                  </div>
                  <span className="inline-flex items-center justify-center rounded-full bg-green-100 text-green-800 text-xs px-2 py-0.5">{stats ? formatNumber(stats.pendingBookings) : '—'}</span>
                </Button>

                <Button aria-label="Agents" className="w-full justify-between" variant="outline" size="sm" onClick={() => (window.location.href = '/dashboard/agents')}>
                  <div className="flex items-center">
                    <Users className="h-4 w-4 mr-2" />
                    <span>Agents</span>
                  </div>
                  <span className="inline-flex items-center justify-center rounded-full bg-indigo-100 text-indigo-800 text-xs px-2 py-0.5">{stats ? formatNumber(stats.activeAgents) : '—'}</span>
                </Button>

                <Button aria-label="Contacts" className="w-full justify-between" variant="outline" size="sm" onClick={() => (window.location.href = '/dashboard/contacts')}>
                  <div className="flex items-center">
                    <Users className="h-4 w-4 mr-2" />
                    <span>Contacts</span>
                  </div>
                  <span className="inline-flex items-center justify-center rounded-full bg-rose-100 text-rose-800 text-xs px-2 py-0.5">{stats ? formatNumber(stats.newContacts) : '—'}</span>
                </Button>
              </div>

              {/* mini stat chips: responsive grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                <div className="flex items-center gap-3 rounded-md border px-3 py-2 bg-gray-50">
                  <CalendarDays className="h-5 w-5 text-green-600" />
                  <div>
                    <div className="text-sm font-semibold">{stats ? formatNumber(stats.attendanceToday) : '—'}</div>
                    <div className="text-xs text-muted-foreground">Present Today</div>
                  </div>
                </div>

                <div className="flex items-center gap-3 rounded-md border px-3 py-2 bg-gray-50">
                  <Users className="h-5 w-5 text-blue-600" />
                  <div>
                    <div className="text-sm font-semibold">{stats ? formatNumber(stats.totalUsers) : '—'}</div>
                    <div className="text-xs text-muted-foreground">Total Users</div>
                  </div>
                </div>

                <div className="flex items-center gap-3 rounded-md border px-3 py-2 bg-gray-50">
                  <BarChart3 className="h-5 w-5 text-purple-600" />
                  <div>
                    <div className="text-sm font-semibold">{stats ? formatNumber(stats.totalPromoCodes) : '—'}</div>
                    <div className="text-xs text-muted-foreground">Promo Codes</div>
                  </div>
                </div>

                <div className="flex items-center gap-3 rounded-md border px-3 py-2 bg-gray-50">
                  <DollarSign className="h-5 w-5 text-yellow-600" />
                  <div>
                    <div className="text-sm font-semibold">{stats ? formatNumber(stats.upcomingHolidays) : '—'}</div>
                    <div className="text-xs text-muted-foreground">Holidays (30d)</div>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      <Separator />

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
        {loading ? (
          // skeletons
          [0, 1, 2, 3].map((i) => (
            <div key={i} className="animate-pulse">
              <Card className="shadow-sm">
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <div className="h-4 w-32 bg-gray-200 rounded" />
                  <div className="h-5 w-5 bg-gray-200 rounded" />
                </CardHeader>
                <CardContent>
                  <div className="h-8 w-24 bg-gray-200 rounded mb-2" />
                  <div className="h-3 w-40 bg-gray-100 rounded" />
                </CardContent>
              </Card>
            </div>
          ))
        ) : error ? (
          <div className="col-span-full text-red-600">{error}</div>
        ) : (
          [
            {
              title: "Total Users",
              value: formatNumber(stats?.totalUsers),
              icon: Users,
              color: "text-blue-600",
            },
            {
              title: "Bookings",
              value: formatNumber(stats?.totalBookings),
              icon: CalendarDays,
              color: "text-green-600",
            },
            {
              title: "Promo Codes",
              value: formatNumber(stats?.totalPromoCodes),
              icon: DollarSign,
              color: "text-yellow-600",
            },
            {
              title: "Attendance Today",
              value: formatNumber(stats?.attendanceToday),
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
                  <p className="text-xs text-muted-foreground">{/* optional change */}</p>
                </CardContent>
              </Card>
            </motion.div>
          ))
        )}
      </div>

      <Separator />

      {/* Recent Activity */}
      <motion.div initial="hidden" animate="visible" variants={fadeUp} className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <h2 className="text-xl font-semibold">Recent Activity</h2>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm">View All</Button>
          </div>
        </div>

        {/* Desktop table */}
        <div className="hidden sm:block overflow-x-auto rounded-xl border">
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
                <motion.tr key={index} custom={index} initial="hidden" animate="visible" variants={fadeUp} className="border-t hover:bg-gray-50 transition">
                  <td className="px-4 py-3 font-medium">{item.user}</td>
                  <td className="px-4 py-3 text-gray-700">{item.action}</td>
                  <td className="px-4 py-3 text-gray-500">{item.date}</td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-1 text-xs rounded-full ${item.status === "Completed" ? "bg-green-100 text-green-700" : item.status === "Pending" ? "bg-yellow-100 text-yellow-700" : "bg-blue-100 text-blue-700"}`}>
                      {item.status}
                    </span>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Mobile list */}
        <div className="sm:hidden space-y-3">
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
          ].map((item, idx) => (
            <motion.div key={idx} custom={idx} initial="hidden" animate="visible" variants={fadeUp} className="border rounded-lg p-3 bg-white">
              <div className="flex items-start justify-between">
                <div>
                  <div className="font-medium">{item.user}</div>
                  <div className="text-sm text-gray-600">{item.action}</div>
                  <div className="text-xs text-gray-400 mt-1">{item.date}</div>
                </div>
                <div>
                  <span className={`px-2 py-1 text-xs rounded-full ${item.status === "Completed" ? "bg-green-100 text-green-700" : item.status === "Pending" ? "bg-yellow-100 text-yellow-700" : "bg-blue-100 text-blue-700"}`}>
                    {item.status}
                  </span>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </motion.div>
    </div>
  );
}
