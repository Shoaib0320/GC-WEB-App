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
import { Users, CalendarDays, BarChart3, DollarSign, LayoutDashboard, Bell, CheckSquare, UserCheck, Layers } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import PageHeader from "@/components/common/PageHeader";
import { format } from "date-fns";

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
  const [recent, setRecent] = useState([]);
  const [recentLoading, setRecentLoading] = useState(true);
  const [recentError, setRecentError] = useState(null);

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

  // Fetch recent bookings for Recent Activity
  useEffect(() => {
    let mounted = true;
    async function loadRecent() {
      setRecentLoading(true);
      try {
        const res = await fetch('/api/booking?status=&limit=6', { cache: 'no-store' });
        const json = await res.json();
        if (!mounted) return;
        if (!res.ok || !json.success) {
          throw new Error(json.error || 'Failed to load bookings');
        }
        const items = Array.isArray(json.data) ? json.data.slice(0, 6) : [];
        setRecent(items);
      } catch (e) {
        console.error('Failed to load recent bookings', e);
        if (!mounted) return;
        setRecentError(e.message || 'Error');
        setRecent([]);
      } finally {
        if (mounted) setRecentLoading(false);
      }
    }

    loadRecent();
    return () => {
      mounted = false;
    };
  }, []);

  const formatNumber = (n) => {
    if (n === undefined || n === null) return "-";
    return n.toLocaleString();
  };

  return (
    <div className="space-y-10 bg-white dark:bg-gray-900 p-6 rounded-lg shadow-lg">
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

      {/* More metrics (small cards) */}
      <motion.div initial="hidden" animate="visible" variants={fadeUp} className="space-y-4">
        <h3 className="text-lg font-semibold">More metrics</h3>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
          {loading ? (
            [0,1,2,3,4,5].map((i) => (
              <div key={i} className="animate-pulse">
                <div className="rounded-md border bg-gray-50 p-3 h-20" />
              </div>
            ))
          ) : (
            [
              { title: 'Confirmed Bookings', value: stats?.confirmedBookings, icon: CheckSquare, color: 'text-green-600' },
              { title: 'Active Users', value: stats?.activeUsers, icon: UserCheck, color: 'text-blue-600' },
              { title: 'Total Agents', value: stats?.totalAgents, icon: Users, color: 'text-indigo-600' },
              { title: 'Pending Leaves', value: stats?.pendingLeaves, icon: Layers, color: 'text-yellow-600' },
              { title: 'Notifications', value: stats?.totalNotifications, icon: Bell, color: 'text-rose-600' },
              { title: 'Roles', value: stats?.totalRoles, icon: CheckSquare, color: 'text-purple-600' },
            ].map((m, idx) => (
              <div key={idx} className="rounded-md border bg-white p-3">
                <div className="flex items-start justify-between">
                  <div>
                    <div className="text-sm font-medium text-muted-foreground">{m.title}</div>
                    <div className="text-lg font-semibold">{m.value !== undefined && m.value !== null ? String(m.value) : '-'}</div>
                  </div>
                  <m.icon className={`h-6 w-6 ${m.color}`} />
                </div>
              </div>
            ))
          )}
        </div>
      </motion.div>

      {/* Recent Activity */}
      <motion.div initial="hidden" animate="visible" variants={fadeUp} className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <h2 className="text-xl font-semibold">Recent Activity</h2>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm">View All</Button>
          </div>
        </div>

        {/* Desktop table (live bookings) */}
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
              {recentLoading ? (
                [0,1,2,3,4,5].map((i) => (
                  <tr key={i} className="border-t">
                    <td className="px-4 py-4"><div className="h-4 w-24 bg-gray-200 rounded animate-pulse"/></td>
                    <td className="px-4 py-4"><div className="h-4 w-40 bg-gray-200 rounded animate-pulse"/></td>
                    <td className="px-4 py-4"><div className="h-4 w-28 bg-gray-200 rounded animate-pulse"/></td>
                    <td className="px-4 py-4"><div className="h-4 w-16 bg-gray-200 rounded animate-pulse"/></td>
                  </tr>
                ))
              ) : recentError ? (
                <tr><td colSpan={4} className="px-4 py-4 text-red-600">{recentError}</td></tr>
              ) : recent.length === 0 ? (
                <tr><td colSpan={4} className="px-4 py-4 text-gray-600">No recent activity</td></tr>
              ) : (
                recent.map((item, index) => {
                  const user = item.formData?.firstName ? `${item.formData.firstName} ${item.formData.lastName || ''}`.trim() : item.formData?.email || 'Unknown';
                  const action = item.bookingType ? `Booking (${item.bookingType})` : 'Booking';
                  const dateStr = item.submittedAt ? format(new Date(item.submittedAt), 'PPP p') : item.formData?.date ? format(new Date(item.formData.date), 'PPP') : '-';
                  return (
                    <motion.tr key={index} custom={index} initial="hidden" animate="visible" variants={fadeUp} className="border-t hover:bg-gray-50 transition">
                      <td className="px-4 py-3 font-medium">{user}</td>
                      <td className="px-4 py-3 text-gray-700">{action}</td>
                      <td className="px-4 py-3 text-gray-500">{dateStr}</td>
                      <td className="px-4 py-3">
                        <span className={`px-2 py-1 text-xs rounded-full ${item.status === "confirmed" ? "bg-green-100 text-green-700" : item.status === "pending" ? "bg-yellow-100 text-yellow-700" : "bg-blue-100 text-blue-700"}`}>
                          {item.status || 'N/A'}
                        </span>
                      </td>
                    </motion.tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Mobile list (live bookings) */}
        <div className="sm:hidden space-y-3">
          {recentLoading ? (
            [0,1,2].map((i) => (
              <motion.div key={i} custom={i} initial="hidden" animate="visible" variants={fadeUp} className="border rounded-lg p-3 bg-white">
                <div className="h-4 w-32 bg-gray-200 rounded mb-2 animate-pulse" />
                <div className="h-3 w-48 bg-gray-100 rounded animate-pulse" />
              </motion.div>
            ))
          ) : recentError ? (
            <div className="text-red-600">{recentError}</div>
          ) : recent.length === 0 ? (
            <div className="text-gray-600">No recent activity</div>
          ) : (
            recent.map((item, idx) => {
              const user = item.formData?.firstName ? `${item.formData.firstName} ${item.formData.lastName || ''}`.trim() : item.formData?.email || 'Unknown';
              const action = item.bookingType ? `Booking (${item.bookingType})` : 'Booking';
              const dateStr = item.submittedAt ? format(new Date(item.submittedAt), 'PPP p') : item.formData?.date ? format(new Date(item.formData.date), 'PPP') : '-';
              return (
                <motion.div key={idx} custom={idx} initial="hidden" animate="visible" variants={fadeUp} className="border rounded-lg p-3 bg-white">
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="font-medium">{user}</div>
                      <div className="text-sm text-gray-600">{action}</div>
                      <div className="text-xs text-gray-400 mt-1">{dateStr}</div>
                    </div>
                    <div>
                      <span className={`px-2 py-1 text-xs rounded-full ${item.status === "confirmed" ? "bg-green-100 text-green-700" : item.status === "pending" ? "bg-yellow-100 text-yellow-700" : "bg-blue-100 text-blue-700"}`}>
                        {item.status || 'N/A'}
                      </span>
                    </div>
                  </div>
                </motion.div>
              );
            })
          )}
        </div>
      </motion.div>
    </div>
  );
}
