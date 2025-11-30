"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { useAuth } from '@/context/AuthContext';
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
  const [recent, setRecent] = useState([]); // recent bookings
  const [recentLoading, setRecentLoading] = useState(true);
  const [recentError, setRecentError] = useState(null);
  const [attendanceRows, setAttendanceRows] = useState([]);
  const [attendanceLoading, setAttendanceLoading] = useState(true);
  const [promoCodes, setPromoCodes] = useState([]);
  const [promoLoading, setPromoLoading] = useState(true);
  const [contacts, setContacts] = useState([]);
  const [contactsLoading, setContactsLoading] = useState(true);
  const [pendingLeaves, setPendingLeaves] = useState([]);
  const [leavesLoading, setLeavesLoading] = useState(true);

  // Permissions (frontend gating only)
  const { hasPermission } = useAuth();
  const canCreateUser = hasPermission('user', 'create');
  const canCreateBooking = hasPermission('booking', 'create');
  const canViewAgents = hasPermission('agent', 'view');
  const canViewContacts = hasPermission('contact', 'view');
  const canViewAttendance = hasPermission('attendance', 'view');
  const canViewPromo = hasPermission('promoCode', 'view');
  const canManagePromo = hasPermission('promoCode', 'create') || hasPermission('promoCode', 'edit') || hasPermission('promoCode', 'delete');
  const canViewLeaves = hasPermission('leaveRequest', 'view');
  const canViewBookings = hasPermission('booking', 'view');

  useEffect(() => {
    let mounted = true;
    async function load() {
      setLoading(true);
      setRecentLoading(true);
      setAttendanceLoading(true);
      setPromoLoading(true);
      setContactsLoading(true);
      setLeavesLoading(true);
      try {
        const res = await fetch('/api/dashboard', { cache: 'no-store' });
        const json = await res.json();
        if (!mounted) return;
        if (!res.ok || !json.success) {
          throw new Error(json.error || 'Failed to load dashboard');
        }

        const d = json.data || {};
        // counts and small datasets
        setStats(d);

        setRecent(Array.isArray(d.recentBookings) ? d.recentBookings.slice(0, 10) : []);
        setAttendanceRows(Array.isArray(d.todaysAttendance) ? d.todaysAttendance : []);
        setPromoCodes(Array.isArray(d.topPromoCodes) ? d.topPromoCodes : []);
        setContacts(Array.isArray(d.recentContacts) ? d.recentContacts : []);
        setPendingLeaves(Array.isArray(d.pendingLeaveRequests) ? d.pendingLeaveRequests : []);
      } catch (err) {
        if (!mounted) return;
        console.error('Dashboard load error', err);
        setError(err.message || 'Failed to load dashboard');
        setStats(null);
        setRecent([]);
        setAttendanceRows([]);
        setPromoCodes([]);
        setContacts([]);
        setPendingLeaves([]);
        setRecentError(err.message || null);
      } finally {
        if (!mounted) return;
        setLoading(false);
        setRecentLoading(false);
        setAttendanceLoading(false);
        setPromoLoading(false);
        setContactsLoading(false);
        setLeavesLoading(false);
      }
    }

    load();
    return () => {
      mounted = false;
    };
  }, []);

  // recent bookings are loaded from the main /api/dashboard call above

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
                {canCreateUser && (
                  <Button aria-label="Add user" className="w-full justify-between" variant="outline" size="sm" onClick={() => (window.location.href = '/dashboard/users')}>
                    <div className="flex items-center">
                      <Users className="h-4 w-4 mr-2" />
                      <span>Add User</span>
                    </div>
                    <span className="inline-flex items-center justify-center rounded-full bg-[#10B5DB]/10 text-[#10B5DB] text-xs px-2 py-0.5">{stats ? formatNumber(stats.totalUsers) : '—'}</span>
                  </Button>
                )}

                {canCreateBooking && (
                  <Button aria-label="New booking" className="w-full justify-between" variant="outline" size="sm" onClick={() => (window.location.href = '/dashboard/bookings')}>
                    <div className="flex items-center">
                      <CalendarDays className="h-4 w-4 mr-2" />
                      <span>New Booking</span>
                    </div>
                    <span className="inline-flex items-center justify-center rounded-full bg-green-100 text-green-800 text-xs px-2 py-0.5">{stats ? formatNumber(stats.pendingBookings) : '—'}</span>
                  </Button>
                )}

                {canViewAgents && (
                  <Button aria-label="Agents" className="w-full justify-between" variant="outline" size="sm" onClick={() => (window.location.href = '/dashboard/agents')}>
                    <div className="flex items-center">
                      <Users className="h-4 w-4 mr-2" />
                      <span>Agents</span>
                    </div>
                    <span className="inline-flex items-center justify-center rounded-full bg-indigo-100 text-indigo-800 text-xs px-2 py-0.5">{stats ? formatNumber(stats.activeAgents) : '—'}</span>
                  </Button>
                )}

                {canViewContacts && (
                  <Button aria-label="Contacts" className="w-full justify-between" variant="outline" size="sm" onClick={() => (window.location.href = '/dashboard/contacts')}>
                    <div className="flex items-center">
                      <Users className="h-4 w-4 mr-2" />
                      <span>Contacts</span>
                    </div>
                    <span className="inline-flex items-center justify-center rounded-full bg-rose-100 text-rose-800 text-xs px-2 py-0.5">{stats ? formatNumber(stats.newContacts) : '—'}</span>
                  </Button>
                )}
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
                  <Users className="h-5 w-5 text-[#10B5DB]" />
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

      {/* Today's Attendance Preview */}
      <motion.div initial="hidden" animate="visible" variants={fadeUp} className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold">Today's Attendance</h2>
          <Button variant="outline" size="sm" onClick={() => (window.location.href = '/dashboard/attendance')}>View All</Button>
        </div>

        <div className="hidden sm:block overflow-x-auto rounded-xl border">
          <table className="min-w-full bg-white text-sm">
            <thead className="bg-gray-50 text-gray-600">
              <tr>
                <th className="text-left px-4 py-3 font-medium">Agent / User</th>
                <th className="text-left px-4 py-3 font-medium">Shift</th>
                <th className="text-left px-4 py-3 font-medium">Check In</th>
                <th className="text-left px-4 py-3 font-medium">Check Out</th>
                <th className="text-left px-4 py-3 font-medium">Status</th>
                <th className="text-left px-4 py-3 font-medium">Late (min)</th>
              </tr>
            </thead>
            <tbody>
              {attendanceLoading ? (
                [0,1,2,3,4].map(i => (
                  <tr key={i} className="border-t">
                    <td className="px-4 py-4"><div className="h-4 w-32 bg-gray-200 rounded animate-pulse"/></td>
                    <td className="px-4 py-4"><div className="h-4 w-20 bg-gray-200 rounded animate-pulse"/></td>
                    <td className="px-4 py-4"><div className="h-4 w-24 bg-gray-200 rounded animate-pulse"/></td>
                    <td className="px-4 py-4"><div className="h-4 w-24 bg-gray-200 rounded animate-pulse"/></td>
                    <td className="px-4 py-4"><div className="h-4 w-20 bg-gray-200 rounded animate-pulse"/></td>
                    <td className="px-4 py-4"><div className="h-4 w-12 bg-gray-200 rounded animate-pulse"/></td>
                  </tr>
                ))
              ) : attendanceRows.length === 0 ? (
                <tr><td colSpan={6} className="px-4 py-4 text-gray-600">No attendance records for today</td></tr>
              ) : (
                attendanceRows.map((r, idx) => {
                  const person = r.agent?.agentName || r.user?.name || r.user?.email || 'Unknown';
                  const shiftName = r.shift?.name || (r.shift?._id ? 'Assigned' : '-');
                  const inTime = r.checkInTime ? format(new Date(r.checkInTime), 'p') : '-';
                  const outTime = r.checkOutTime ? format(new Date(r.checkOutTime), 'p') : '-';
                  return (
                    <tr key={idx} className="border-t hover:bg-gray-50 transition">
                      <td className="px-4 py-3 font-medium">{person}</td>
                      <td className="px-4 py-3 text-gray-700">{shiftName}</td>
                      <td className="px-4 py-3 text-gray-500">{inTime}</td>
                      <td className="px-4 py-3 text-gray-500">{outTime}</td>
                      <td className="px-4 py-3">
                        <span className={`px-2 py-1 text-xs rounded-full ${r.status === 'present' ? 'bg-green-100 text-green-700' : r.status === 'late' ? 'bg-yellow-100 text-yellow-700' : 'bg-gray-100 text-gray-700'}`}>
                          {r.status || '-'}
                        </span>
                      </td>
                      <td className="px-4 py-3">{r.lateMinutes || 0}</td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Mobile */}
        <div className="sm:hidden space-y-3">
          {attendanceLoading ? (
            [0,1,2].map(i => (
              <div key={i} className="border rounded-lg p-3 bg-white">
                <div className="h-4 w-32 bg-gray-200 rounded mb-2 animate-pulse" />
                <div className="h-3 w-48 bg-gray-100 rounded animate-pulse" />
              </div>
            ))
          ) : attendanceRows.length === 0 ? (
            <div className="text-gray-600">No attendance records</div>
          ) : (
            attendanceRows.map((r, i) => (
              <div key={i} className="border rounded-lg p-3 bg-white">
                <div className="flex items-start justify-between">
                  <div>
                    <div className="font-medium">{r.agent?.agentName || r.user?.name || 'Unknown'}</div>
                    <div className="text-sm text-gray-600">{r.shift?.name || '-'}</div>
                    <div className="text-xs text-gray-400 mt-1">In: {r.checkInTime ? format(new Date(r.checkInTime), 'p') : '-'} • Out: {r.checkOutTime ? format(new Date(r.checkOutTime), 'p') : '-'}</div>
                  </div>
                  <div>
                    <span className={`px-2 py-1 text-xs rounded-full ${r.status === 'present' ? 'bg-green-100 text-green-700' : r.status === 'late' ? 'bg-yellow-100 text-yellow-700' : 'bg-gray-100 text-gray-700'}`}>{r.status || '-'}</span>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </motion.div>

      <Separator />

      {/* Top Promo Codes */}
      <motion.div initial="hidden" animate="visible" variants={fadeUp} className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold">Top Promo Codes</h2>
          <Button variant="outline" size="sm" onClick={() => (window.location.href = '/dashboard/promocodes')}>Manage</Button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
          {promoLoading ? (
            [0,1,2,3].map(i => (
              <div key={i} className="rounded-md border bg-white p-3 h-24 animate-pulse" />
            ))
          ) : promoCodes.length === 0 ? (
            <div className="text-gray-600">No promo codes</div>
          ) : (
            promoCodes.map((p, i) => (
              <div key={i} className="rounded-md border bg-white p-3">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-medium">{p.promoCode || p.promoCode?.toUpperCase()}</div>
                    <div className="text-sm text-gray-600">{p.description || ''}</div>
                  </div>
                  <div className="text-right">
                    <div className="text-lg font-semibold">{p.discountPercentage ? `${p.discountPercentage}%` : '-'}</div>
                    <div className="text-xs text-gray-500">Used: {p.usedCount || 0}</div>
                  </div>
                </div>
                <div className="mt-2 text-xs text-gray-400">{p.isActive ? 'Active' : 'Inactive'} • Valid until: {p.validUntil ? format(new Date(p.validUntil), 'PPP') : 'Never'}</div>
              </div>
            ))
          )}
        </div>
      </motion.div>

      <Separator />

      {/* Recent Contacts */}
      <motion.div initial="hidden" animate="visible" variants={fadeUp} className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold">Recent Contacts (Today)</h2>
          <Button variant="outline" size="sm" onClick={() => (window.location.href = '/dashboard/contacts')}>View All</Button>
        </div>

        <div className="hidden sm:block overflow-x-auto rounded-xl border">
          <table className="min-w-full bg-white text-sm">
            <thead className="bg-gray-50 text-gray-600">
              <tr>
                <th className="text-left px-4 py-3 font-medium">Name</th>
                <th className="text-left px-4 py-3 font-medium">Email</th>
                <th className="text-left px-4 py-3 font-medium">Message</th>
                <th className="text-left px-4 py-3 font-medium">Date</th>
                <th className="text-left px-4 py-3 font-medium">Status</th>
              </tr>
            </thead>
            <tbody>
              {contactsLoading ? (
                [0,1,2,3].map(i => (
                  <tr key={i} className="border-t">
                    <td className="px-4 py-4"><div className="h-4 w-24 bg-gray-200 rounded animate-pulse"/></td>
                    <td className="px-4 py-4"><div className="h-4 w-32 bg-gray-200 rounded animate-pulse"/></td>
                    <td className="px-4 py-4"><div className="h-4 w-48 bg-gray-200 rounded animate-pulse"/></td>
                    <td className="px-4 py-4"><div className="h-4 w-20 bg-gray-200 rounded animate-pulse"/></td>
                    <td className="px-4 py-4"><div className="h-4 w-16 bg-gray-200 rounded animate-pulse"/></td>
                  </tr>
                ))
              ) : contacts.length === 0 ? (
                <tr><td colSpan={5} className="px-4 py-4 text-gray-600">No contacts for today</td></tr>
              ) : (
                contacts.map((c, idx) => (
                  <tr key={idx} className="border-t hover:bg-gray-50 transition">
                    <td className="px-4 py-3 font-medium">{c.name}</td>
                    <td className="px-4 py-3 text-gray-700">{c.email}</td>
                    <td className="px-4 py-3 text-gray-700">{(c.message || '').slice(0, 80)}{(c.message || '').length > 80 ? '…' : ''}</td>
                    <td className="px-4 py-3 text-gray-500">{c.createdAt ? format(new Date(c.createdAt), 'PPP p') : '-'}</td>
                    <td className="px-4 py-3"><span className="px-2 py-1 text-xs rounded-full bg-blue-100 text-blue-700">{c.status || 'new'}</span></td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Mobile contacts */}
        <div className="sm:hidden space-y-3">
          {contactsLoading ? (
            [0,1].map(i => (
              <div key={i} className="border rounded-lg p-3 bg-white animate-pulse" />
            ))
          ) : contacts.length === 0 ? (
            <div className="text-gray-600">No contacts</div>
          ) : (
            contacts.map((c, idx) => (
              <div key={idx} className="border rounded-lg p-3 bg-white">
                <div className="font-medium">{c.name}</div>
                <div className="text-xs text-gray-500">{c.email} • {c.createdAt ? format(new Date(c.createdAt), 'PPP p') : '-'}</div>
                <div className="text-sm text-gray-700 mt-2">{(c.message || '').slice(0, 200)}</div>
              </div>
            ))
          )}
        </div>
      </motion.div>

      <Separator />

      {/* Pending Leave Requests */}
      <motion.div initial="hidden" animate="visible" variants={fadeUp} className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold">Pending Leave Requests</h2>
          <Button variant="outline" size="sm" onClick={() => (window.location.href = '/dashboard/view-attendance')}>Review</Button>
        </div>

        <div className="hidden sm:block overflow-x-auto rounded-xl border">
          <table className="min-w-full bg-white text-sm">
            <thead className="bg-gray-50 text-gray-600">
              <tr>
                <th className="text-left px-4 py-3 font-medium">Agent / User</th>
                <th className="text-left px-4 py-3 font-medium">Type</th>
                <th className="text-left px-4 py-3 font-medium">Start - End</th>
                <th className="text-left px-4 py-3 font-medium">Reason</th>
                <th className="text-left px-4 py-3 font-medium">Submitted</th>
              </tr>
            </thead>
            <tbody>
              {leavesLoading ? (
                [0,1,2].map(i => (
                  <tr key={i} className="border-t">
                    <td className="px-4 py-4"><div className="h-4 w-24 bg-gray-200 rounded animate-pulse"/></td>
                    <td className="px-4 py-4"><div className="h-4 w-20 bg-gray-200 rounded animate-pulse"/></td>
                    <td className="px-4 py-4"><div className="h-4 w-32 bg-gray-200 rounded animate-pulse"/></td>
                    <td className="px-4 py-4"><div className="h-4 w-48 bg-gray-200 rounded animate-pulse"/></td>
                    <td className="px-4 py-4"><div className="h-4 w-20 bg-gray-200 rounded animate-pulse"/></td>
                  </tr>
                ))
              ) : pendingLeaves.length === 0 ? (
                <tr><td colSpan={5} className="px-4 py-4 text-gray-600">No pending leaves</td></tr>
              ) : (
                pendingLeaves.map((l, idx) => (
                  <tr key={idx} className="border-t hover:bg-gray-50 transition">
                    <td className="px-4 py-3 font-medium">{l.agent?.agentId || l.user?.name || 'Unknown'}</td>
                    <td className="px-4 py-3 text-gray-700">{l.leaveType}</td>
                    <td className="px-4 py-3 text-gray-500">{l.startDate ? format(new Date(l.startDate), 'PPP') : '-'} • {l.endDate ? format(new Date(l.endDate), 'PPP') : '-'}</td>
                    <td className="px-4 py-3 text-gray-700">{(l.reason || '').slice(0, 80)}{(l.reason || '').length > 80 ? '…' : ''}</td>
                    <td className="px-4 py-3 text-gray-500">{l.createdAt ? format(new Date(l.createdAt), 'PPP p') : '-'}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Mobile leaves */}
        <div className="sm:hidden space-y-3">
          {leavesLoading ? (
            [0,1].map(i => (
              <div key={i} className="border rounded-lg p-3 bg-white animate-pulse" />
            ))
          ) : pendingLeaves.length === 0 ? (
            <div className="text-gray-600">No pending leaves</div>
          ) : (
            pendingLeaves.map((l, idx) => (
              <div key={idx} className="border rounded-lg p-3 bg-white">
                <div className="font-medium">{l.agent?.agentName || l.user?.name || 'Unknown'}</div>
                <div className="text-xs text-gray-500">{l.leaveType} • {l.startDate ? format(new Date(l.startDate), 'PPP') : '-'} to {l.endDate ? format(new Date(l.endDate), 'PPP') : '-'}</div>
                <div className="text-sm text-gray-700 mt-2">{(l.reason || '').slice(0, 200)}</div>
              </div>
            ))
          )}
        </div>
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
              color: "text-[#10B5DB]",
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
              { title: 'Active Users', value: stats?.activeUsers, icon: UserCheck, color: 'text-[#10B5DB]' },
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
                        <span className={`px-2 py-1 text-xs rounded-full ${item.status === "confirmed" ? "bg-green-100 text-green-700" : item.status === "pending" ? "bg-yellow-100 text-yellow-700" : "bg-[#10B5DB]/10 text-[#10B5DB]"}`}>
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
                      <span className={`px-2 py-1 text-xs rounded-full ${item.status === "confirmed" ? "bg-green-100 text-green-700" : item.status === "pending" ? "bg-yellow-100 text-yellow-700" : "bg-[#10B5DB]/10 text-[#10B5DB]"}`}>
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
