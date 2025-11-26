"use client";

import React, { useEffect, useState } from "react";
import { adminService } from "@/services/adminService";
import { shiftService } from "@/services/shiftService";
import { attendanceService } from "@/services/attendanceService";
import { weeklyOffService } from "@/services/weeklyOffService";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Loader2, Calendar, Users, CheckCircle, XCircle, Clock, Plus, Trash2, PlayCircle, ToggleLeft, ToggleRight, Edit, ChevronLeft, ChevronRight, Download, X, RefreshCw, ChevronDown, UserPlus, FileText, PartyPopper, CalendarDays, Search } from "lucide-react";
import { toast } from "sonner";
import GlobalData from "@/components/common/GlobalData";
import CustomModal from "@/components/ui/customModal";

export default function AdminAttendancePage() {
  // State variables
  const [attendance, setAttendance] = useState([]);
  const [leaveRequests, setLeaveRequests] = useState([]);
  const [holidays, setHolidays] = useState([]);
  const [weeklyOffs, setWeeklyOffs] = useState([]);
  const [agents, setAgents] = useState([]);
  const [shifts, setShifts] = useState([]);
  const [loading, setLoading] = useState({
    attendance: false,
    leave: false,
    manual: false,
    assign: false,
    holidays: false,
    weeklyOff: false,
    auto: false,
    edit: false,
    shiftAuto: false
  });
  const [page, setPage] = useState(1);
  const [meta, setMeta] = useState({ total: 0, totalPages: 0 });
  const [filters, setFilters] = useState({
    userType: "all",
    status: "all",
    date: "",
    search: ""
  });
  const [activeTab, setActiveTab] = useState("attendance");
  const [showManualModal, setShowManualModal] = useState(false);
  const [showLeaveModal, setShowLeaveModal] = useState(false);
  const [showHolidayModal, setShowHolidayModal] = useState(false);
  const [showWeeklyOffModal, setShowWeeklyOffModal] = useState(false);
  const [showAutoModal, setShowAutoModal] = useState(false);
  const [showShiftAutoModal, setShowShiftAutoModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingAttendance, setEditingAttendance] = useState(null);

  const [manualForm, setManualForm] = useState({
    userType: "agent",
    userId: "",
    agentId: "",
    shiftId: "",
    date: new Date().toISOString().split('T')[0],
    status: "present",
    checkInTime: "",
    checkOutTime: "",
    notes: ""
  });
  const [leaveForm, setLeaveForm] = useState({
    userType: "agent",
    userId: "",
    agentId: "",
    startDate: new Date().toISOString().split('T')[0],
    endDate: new Date().toISOString().split('T')[0],
    leaveType: "casual",
    reason: ""
  });
  const [holidayForm, setHolidayForm] = useState({
    name: "",
    date: new Date().toISOString().split('T')[0],
    description: "",
    isRecurring: false
  });
  const [weeklyOffForm, setWeeklyOffForm] = useState({
    day: "sunday",
    name: "Sunday",
    description: "Weekly off day"
  });
  const [autoForm, setAutoForm] = useState({
    date: new Date().toISOString().split('T')[0]
  });
  const [shiftAutoForm, setShiftAutoForm] = useState({
    date: new Date().toISOString().split('T')[0],
    userType: "all"
  });

  const LIMIT = 10;

  // ✅ Fetch All Data
  useEffect(() => {
    fetchInitialData();
    fetchAttendance();
  }, [page, filters]);

  useEffect(() => {
    if (activeTab === "holidays") {
      fetchHolidays();
    } else if (activeTab === "leave") {
      fetchLeaveRequests();
    } else if (activeTab === "weekly-off") {
      fetchWeeklyOffs();
    }
  }, [activeTab]);

  const fetchInitialData = async () => {
    try {
      setLoading(prev => ({ ...prev, attendance: true }));
      const usersResponse = await adminService.getUsersAndAgents("all");
      if (usersResponse.success) {
        setAgents(usersResponse.data.agents || []);
      }
      const shiftsResponse = await shiftService.getShiftsForDropdown();
      setShifts(shiftsResponse);
    } catch (error) {
      console.error("Error fetching initial data:", error);
      toast.error("Error loading data");
    } finally {
      setLoading(prev => ({ ...prev, attendance: false }));
    }
  };

  // ✅ Fetch Attendance Data
  const fetchAttendance = async (pageNum = 1) => {
    try {
      setLoading(prev => ({ ...prev, attendance: true }));
      const response = await adminService.getAllAttendance({
        page: pageNum,
        limit: LIMIT,
        ...filters
      });

      if (response.success) {
        setAttendance(response.data || []);
        setMeta(response.meta || { total: response.data?.length || 0, totalPages: 1 });
      } else {
        toast.error("Failed to load attendance");
      }
    } catch (err) {
      console.error(err);
      toast.error("Server error while fetching data");
    } finally {
      setLoading(prev => ({ ...prev, attendance: false }));
    }
  };

  // ✅ Fetch Leave Requests
  const fetchLeaveRequests = async () => {
    try {
      setLoading(prev => ({ ...prev, leave: true }));
      const response = await attendanceService.getAllLeaveRequests("all");
      if (response.success) {
        setLeaveRequests(response.data || []);
      }
    } catch (error) {
      console.error("Error fetching leave requests:", error);
      toast.error("Error loading leave requests");
    } finally {
      setLoading(prev => ({ ...prev, leave: false }));
    }
  };

  // ✅ Fetch Holidays
  const fetchHolidays = async () => {
    try {
      setLoading(prev => ({ ...prev, holidays: true }));
      const response = await attendanceService.getHolidays();
      if (response.success) {
        setHolidays(response.data || []);
      }
    } catch (error) {
      console.error("Error fetching holidays:", error);
      toast.error("Error loading holidays");
    } finally {
      setLoading(prev => ({ ...prev, holidays: false }));
    }
  };

  // ✅ Fetch Weekly Offs
  const fetchWeeklyOffs = async () => {
    try {
      setLoading(prev => ({ ...prev, weeklyOff: true }));
      const response = await weeklyOffService.getAll();
      if (response.success) {
        setWeeklyOffs(response.data || []);
      }
    } catch (error) {
      console.error("Error fetching weekly offs:", error);
      toast.error("Error loading weekly offs");
    } finally {
      setLoading(prev => ({ ...prev, weeklyOff: false }));
    }
  };

  // ✅ Handle Manual Attendance Submission
  const handleManualAttendance = async (e) => {
    e.preventDefault();
    try {
      setLoading(prev => ({ ...prev, manual: true }));
      const submitData = {
        ...manualForm,
        shiftId: manualForm.shiftId || null
      };

      const response = await adminService.manualAttendance(submitData);
      if (response.success) {
        toast.success("Attendance updated successfully");
        setShowManualModal(false);
        setManualForm({
          userType: "agent",
          userId: "",
          agentId: "",
          shiftId: "",
          date: new Date().toISOString().split('T')[0],
          status: "present",
          checkInTime: "",
          checkOutTime: "",
          notes: ""
        });
        fetchAttendance();
      } else {
        toast.error(response.message || "Error updating attendance");
      }
    } catch (error) {
      console.error("Error submitting manual attendance:", error);
      toast.error("Error updating attendance");
    } finally {
      setLoading(prev => ({ ...prev, manual: false }));
    }
  };

  // ✅ Handle Leave Assignment
  const handleAssignLeave = async (e) => {
    e.preventDefault();
    try {
      setLoading(prev => ({ ...prev, assign: true }));
      const response = await adminService.assignLeave(leaveForm);
      if (response.success) {
        toast.success("Leave assigned successfully");
        setShowLeaveModal(false);
        setLeaveForm({
          userType: "agent",
          userId: "",
          agentId: "",
          startDate: new Date().toISOString().split('T')[0],
          endDate: new Date().toISOString().split('T')[0],
          leaveType: "casual",
          reason: ""
        });
        fetchAttendance();
      } else {
        toast.error(response.message || "Error assigning leave");
      }
    } catch (error) {
      console.error("Error assigning leave:", error);
      toast.error("Error assigning leave");
    } finally {
      setLoading(prev => ({ ...prev, assign: false }));
    }
  };

  // ✅ Handle Holiday Creation
  const handleCreateHoliday = async (e) => {
    e.preventDefault();
    try {
      setLoading(prev => ({ ...prev, holidays: true }));
      const response = await attendanceService.createHoliday(holidayForm);
      if (response.success) {
        toast.success("Holiday created successfully");
        setShowHolidayModal(false);
        setHolidayForm({
          name: "",
          date: new Date().toISOString().split('T')[0],
          description: "",
          isRecurring: false
        });
        fetchHolidays();
        fetchAttendance();
      } else {
        toast.error(response.message || "Error creating holiday");
      }
    } catch (error) {
      console.error("Error creating holiday:", error);
      toast.error("Error creating holiday");
    } finally {
      setLoading(prev => ({ ...prev, holidays: false }));
    }
  };

  // ✅ Handle Weekly Off Creation
  const handleCreateWeeklyOff = async (e) => {
    e.preventDefault();
    try {
      setLoading(prev => ({ ...prev, weeklyOff: true }));
      const response = await weeklyOffService.create(weeklyOffForm);
      if (response.success) {
        toast.success("Weekly off day added successfully");
        setShowWeeklyOffModal(false);
        setWeeklyOffForm({
          day: "sunday",
          name: "Sunday",
          description: "Weekly off day"
        });
        fetchWeeklyOffs();
      } else {
        toast.error(response.message || "Error adding weekly off day");
      }
    } catch (error) {
      console.error("Error creating weekly off:", error);
      toast.error("Error creating weekly off");
    } finally {
      setLoading(prev => ({ ...prev, weeklyOff: false }));
    }
  };

  // ✅ Handle Weekly Off Toggle
  const handleToggleWeeklyOff = async (id, isActive) => {
    try {
      const response = await weeklyOffService.updateStatus(id, isActive);
      if (response.success) {
        toast.success(`Weekly off ${isActive ? 'activated' : 'deactivated'}`);
        fetchWeeklyOffs();
      } else {
        toast.error(response.message || "Error updating weekly off");
      }
    } catch (error) {
      console.error("Error updating weekly off:", error);
      toast.error("Error updating weekly off");
    }
  };

  // ✅ Handle Weekly Off Deletion
  const handleDeleteWeeklyOff = async (id) => {
    if (!confirm("Are you sure you want to delete this weekly off day?")) return;

    try {
      const response = await weeklyOffService.delete(id);
      if (response.success) {
        toast.success("Weekly off day deleted successfully");
        fetchWeeklyOffs();
      } else {
        toast.error(response.message || "Error deleting weekly off");
      }
    } catch (error) {
      console.error("Error deleting weekly off:", error);
      toast.error("Error deleting weekly off");
    }
  };

  // ✅ Handle Auto Attendance Processing
  const handleAutoAttendance = async (e) => {
    e.preventDefault();
    try {
      setLoading(prev => ({ ...prev, auto: true }));
      const response = await attendanceService.processAutoAttendanceForDate(autoForm.date);
      if (response.success) {
        toast.success(response.message || "Auto attendance processed successfully");
        setShowAutoModal(false);
        setAutoForm({
          date: new Date().toISOString().split('T')[0]
        });
        fetchAttendance();
      } else {
        toast.error(response.message || "Error processing auto attendance");
      }
    } catch (error) {
      console.error("Error processing auto attendance:", error);
      toast.error("Error processing auto attendance");
    } finally {
      setLoading(prev => ({ ...prev, auto: false }));
    }
  };

  // ✅ Handle Holiday Deletion
  const handleDeleteHoliday = async (holidayId) => {
    if (!confirm("Are you sure you want to delete this holiday?")) return;

    try {
      const response = await attendanceService.deleteHoliday(holidayId);
      if (response.success) {
        toast.success("Holiday deleted successfully");
        fetchHolidays();
        fetchAttendance();
      } else {
        toast.error(response.message || "Error deleting holiday");
      }
    } catch (error) {
      console.error("Error deleting holiday:", error);
      toast.error("Error deleting holiday");
    }
  };

  // ✅ Handle Leave Request Action
  const handleLeaveAction = async (requestId, status, comments = "") => {
    try {
      const response = await attendanceService.updateLeaveRequest(requestId, { status, comments });
      if (response.success) {
        toast.success(`Leave request ${status}`);
        fetchLeaveRequests();
        fetchAttendance();
      } else {
        toast.error(response.message || "Error processing request");
      }
    } catch (error) {
      console.error("Error updating leave request:", error);
      toast.error("Error processing request");
    }
  };

  // ✅ Handle Edit Attendance
  const handleEditAttendance = (attendance) => {
    const toISOString = (val) => {
      if (!val) return null;
      try {
        return (typeof val === 'string') ? new Date(val).toISOString() : new Date(val).toISOString();
      } catch (e) {
        return null;
      }
    };

    const formatDateOnly = (val) => {
      const iso = toISOString(val);
      return iso ? iso.split('T')[0] : '';
    };

    const formatTimeOnly = (val) => {
      const iso = toISOString(val);
      return iso ? iso.split('T')[1]?.substring(0, 5) || '' : '';
    };

    setEditingAttendance(attendance);
    setManualForm({
      userType: attendance.user ? "user" : "agent",
      userId: attendance.user?._id || "",
      agentId: attendance.agent?._id || "",
      shiftId: attendance.shift?._id || "",
      date: formatDateOnly(attendance.date) || formatDateOnly(attendance.checkInTime) || formatDateOnly(attendance.createdAt) || new Date().toISOString().split('T')[0],
      status: attendance.status,
      checkInTime: formatTimeOnly(attendance.checkInTime),
      checkOutTime: formatTimeOnly(attendance.checkOutTime),
      notes: attendance.notes || ""
    });
    setShowEditModal(true);
  };

  // ✅ Handle Update Attendance
  const handleUpdateAttendance = async (e) => {
    e.preventDefault();
    try {
      setLoading(prev => ({ ...prev, edit: true }));
      const updateData = {
        ...manualForm,
        attendanceId: editingAttendance._id
      };

      const response = await adminService.updateAttendance(updateData);
      if (response.success) {
        toast.success("Attendance updated successfully");
        setShowEditModal(false);
        fetchAttendance();
      } else {
        toast.error(response.message || "Error updating attendance");
      }
    } catch (error) {
      console.error("Error updating attendance:", error);
      toast.error("Error updating attendance");
    } finally {
      setLoading(prev => ({ ...prev, edit: false }));
    }
  };

  // ✅ Handle Shift-based Auto Attendance
  const handleShiftAutoAttendance = async (e) => {
    e.preventDefault();
    try {
      setLoading(prev => ({ ...prev, shiftAuto: true }));
      const response = await attendanceService.processShiftAutoAttendance(shiftAutoForm);
      if (response.success) {
        toast.success(response.message || "Shift-based auto attendance processed successfully");
        setShowShiftAutoModal(false);
        setShiftAutoForm({
          date: new Date().toISOString().split('T')[0],
          userType: "all"
        });
        fetchAttendance();
      } else {
        toast.error(response.message || "Error processing shift auto attendance");
      }
    } catch (error) {
      console.error("Error processing shift auto attendance:", error);
      toast.error("Error processing shift auto attendance");
    } finally {
      setLoading(prev => ({ ...prev, shiftAuto: false }));
    }
  };

  // ✅ Check if attendance can be edited
  const canEditAttendance = (attendance) => {
    return !["holiday", "weekly_off"].includes(attendance.status);
  };

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
    setPage(1);
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      present: "bg-green-100 text-green-700 border-green-200",
      absent: "bg-red-100 text-red-700 border-red-200",
      leave: "bg-yellow-100 text-yellow-700 border-yellow-200",
      late: "bg-orange-100 text-orange-700 border-orange-200",
      holiday: "bg-purple-100 text-purple-700 border-purple-200",
      weekly_off: "bg-indigo-100 text-indigo-700 border-indigo-200",
      approved_leave: "bg-blue-100 text-blue-700 border-blue-200",
      pending_leave: "bg-gray-100 text-gray-700 border-gray-200"
    };

    return (
      <Badge variant="outline" className={`${statusConfig[status] || "bg-gray-100 text-gray-700 border-gray-200"} text-xs px-2 py-1`}>
        {status.replace('_', ' ')}
      </Badge>
    );
  };

  const getLeaveStatusBadge = (status) => {
    const statusConfig = {
      pending: "bg-yellow-100 text-yellow-700 border-yellow-200",
      approved: "bg-green-100 text-green-700 border-green-200",
      rejected: "bg-red-100 text-red-700 border-red-200"
    };

    return (
      <Badge variant="outline" className={`${statusConfig[status] || "bg-gray-100 text-gray-700 border-gray-200"} text-xs px-2 py-1`}>
        {status}
      </Badge>
    );
  };

  // ✅ Stats Cards Component
  const StatsCards = () => (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
      <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 p-4">
          <CardTitle className="text-sm font-medium text-blue-800">Total Records</CardTitle>
          <Calendar className="h-4 w-4 text-blue-600" />
        </CardHeader>
        <CardContent className="p-4 pt-0">
          <div className="text-2xl font-bold text-blue-700">{meta.total}</div>
        </CardContent>
      </Card>

      <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 p-4">
          <CardTitle className="text-sm font-medium text-green-800">Present Today</CardTitle>
          <CheckCircle className="h-4 w-4 text-green-600" />
        </CardHeader>
        <CardContent className="p-4 pt-0">
          <div className="text-2xl font-bold text-green-700">
            {attendance.filter(a => a.status === 'present').length}
          </div>
        </CardContent>
      </Card>

      <Card className="bg-gradient-to-br from-red-50 to-red-100 border-red-200">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 p-4">
          <CardTitle className="text-sm font-medium text-red-800">Absent Today</CardTitle>
          <XCircle className="h-4 w-4 text-red-600" />
        </CardHeader>
        <CardContent className="p-4 pt-0">
          <div className="text-2xl font-bold text-red-700">
            {attendance.filter(a => a.status === 'absent').length}
          </div>
        </CardContent>
      </Card>

      <Card className="bg-gradient-to-br from-yellow-50 to-yellow-100 border-yellow-200">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 p-4">
          <CardTitle className="text-sm font-medium text-yellow-800">On Leave/Off</CardTitle>
          <Clock className="h-4 w-4 text-yellow-600" />
        </CardHeader>
        <CardContent className="p-4 pt-0">
          <div className="text-2xl font-bold text-yellow-700">
            {attendance.filter(a =>
              a.status.includes('leave') ||
              a.status === 'holiday' ||
              a.status === 'weekly_off'
            ).length}
          </div>
        </CardContent>
      </Card>
    </div>
  );

  // ✅ Filters Component
  const FiltersSection = () => (
    <Card className="mb-6">
      <CardContent className="p-4">
        <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-end">
          {/* Search */}
          <div className="flex-1 min-w-[200px]">
            <Label htmlFor="search" className="text-sm font-medium mb-2 block">Search</Label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                id="search"
                placeholder="Search by name or ID..."
                value={filters.search}
                onChange={(e) => handleFilterChange('search', e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          {/* Status Filter */}
          <div className="w-full lg:w-48">
            <Label htmlFor="status" className="text-sm font-medium mb-2 block">Status</Label>
            <Select
              value={filters.status}
              onValueChange={(value) => handleFilterChange('status', value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="All Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="present">Present</SelectItem>
                <SelectItem value="absent">Absent</SelectItem>
                <SelectItem value="leave">Leave</SelectItem>
                <SelectItem value="late">Late</SelectItem>
                <SelectItem value="holiday">Holiday</SelectItem>
                <SelectItem value="weekly_off">Weekly Off</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Date Filter */}
          <div className="w-full lg:w-48">
            <Label htmlFor="date" className="text-sm font-medium mb-2 block">Date</Label>
            <Input
              type="date"
              value={filters.date}
              onChange={(e) => handleFilterChange('date', e.target.value)}
            />
          </div>

          {/* Clear Filters */}
          {(filters.search || filters.status !== 'all' || filters.date) && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => setFilters({ userType: "all", status: "all", date: "", search: "" })}
              className="h-10"
            >
              <X className="h-4 w-4 mr-1" />
              Clear
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );

  // Columns for GlobalData / attendance table
  const attendanceColumns = [
    {
      label: "Type",
      render: (a) => (
        <Badge variant={a.user ? "default" : "secondary"}>
          {a.user ? "User" : "Agent"}
        </Badge>
      ),
    },
    {
      label: "Agent ID",
      render: (a) => (
        <div>
          <div className="font-medium">
            {a.user
              ? `${a.user?.firstName || ""} ${a.user?.lastName || ""}`
              : a.agent?.agentId || "—"}
          </div>
        </div>
      ),
    },
    { label: "Shift", render: (a) => a.shift?.name || "—" },
    {
      label: "Check In",
      render: (a) => (a.checkInTime ? new Date(a.checkInTime).toLocaleTimeString() : "—"),
    },
    {
      label: "Check Out",
      render: (a) => (a.checkOutTime ? new Date(a.checkOutTime).toLocaleTimeString() : "—"),
    },
    { label: "Status", render: (a) => getStatusBadge(a.status) },
    {
      label: "Remarks",
      render: (a) => (
        <div>
          {a.isLate ? (
            <span className="text-yellow-600 text-sm">Late ({a.lateMinutes}m)</span>
          ) : a.isOvertime ? (
            <span className="text-green-600 text-sm">Overtime (+{a.overtimeMinutes}m)</span>
          ) : a.leaveReason ? (
            <span className="text-blue-600 text-sm">{a.leaveType}: {a.leaveReason}</span>
          ) : (
            <span className="text-muted-foreground text-sm">—</span>
          )}
        </div>
      ),
    },
    { label: "Date", render: (a) => new Date(a.createdAt).toLocaleDateString() },
    {
      label: "Actions",
      align: "right",
      render: (a) => (
        <Button
          variant="outline"
          size="sm"
          onClick={() => handleEditAttendance(a)}
          disabled={!canEditAttendance(a)}
          title={
            !canEditAttendance(a)
              ? a.status === "holiday" || a.status === "weekly_off"
                ? "Cannot edit holiday/weekly off records"
                : "Cannot edit this record"
              : "Edit attendance"
          }
        >
          <Edit className="h-4 w-4" />
        </Button>
      ),
    },
  ];

  // Columns for Holidays
  const holidayColumns = [
    { label: "Name", render: (h) => <div className="font-medium">{h.name}</div> },
    { label: "Date", render: (h) => new Date(h.date).toLocaleDateString() },
    { label: "Description", render: (h) => <div className="max-w-xs truncate" title={h.description}>{h.description || '—'}</div> },
    { label: "Recurring", render: (h) => (<Badge variant={h.isRecurring ? 'default' : 'secondary'}>{h.isRecurring ? 'Yes' : 'No'}</Badge>) },
    {
      label: "Actions", align: "right", render: (h) => (
        <Button variant="destructive" size="sm" onClick={() => handleDeleteHoliday(h._id)}>
          <Trash2 className="h-4 w-4" />
        </Button>
      )
    },
  ];

  // Columns for Weekly Offs
  const weeklyOffColumns = [
    { label: "Day", render: (w) => <div className="font-medium capitalize">{w.day}</div> },
    { label: "Name", render: (w) => w.name },
    { label: "Description", render: (w) => <div className="max-w-xs truncate" title={w.description}>{w.description || '—'}</div> },
    { label: "Status", render: (w) => (<Badge variant={w.isActive ? 'default' : 'secondary'}>{w.isActive ? 'Active' : 'Inactive'}</Badge>) },
    {
      label: "Actions", align: "right", render: (w) => (
        <div className="flex gap-2">
          <Button
            variant={w.isActive ? "outline" : "default"}
            size="sm"
            onClick={() => handleToggleWeeklyOff(w._id, !w.isActive)}
          >
            {w.isActive ? <ToggleLeft className="h-4 w-4 mr-1" /> : <ToggleRight className="h-4 w-4 mr-1" />}
            {w.isActive ? "Deactivate" : "Activate"}
          </Button>
          <Button variant="destructive" size="sm" onClick={() => handleDeleteWeeklyOff(w._id)}>
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      )
    },
  ];

  // Columns for Leave Requests
  const leaveColumns = [
    { label: "Type", render: (r) => (<Badge variant={r.user ? 'default' : 'secondary'}>{r.user ? 'User' : 'Agent'}</Badge>) },
    {
      label: "Name", render: (r) => (
        <div>
          <div className="font-medium">{r.user ? `${r.user?.firstName || ''} ${r.user?.lastName || ''}` : r.agent?.agentName || '—'}</div>
          <div className="text-xs text-muted-foreground">{r.user ? r.user.email : r.agent?.email}</div>
        </div>
      )
    },
    { label: "Leave Type", render: (r) => <span className="capitalize">{r.leaveType}</span> },
    { label: "Period", render: (r) => `${new Date(r.startDate).toLocaleDateString()} - ${new Date(r.endDate).toLocaleDateString()}` },
    { label: "Reason", render: (r) => <div className="max-w-xs truncate" title={r.reason}>{r.reason}</div> },
    { label: "Status", render: (r) => getLeaveStatusBadge(r.status) },
    {
      label: "Actions", align: "right", render: (r) => (
        <div className="flex gap-2">
          {r.status === 'pending' ? (
            <>
              <Button size="sm" onClick={() => handleLeaveAction(r._id, 'approved')}>
                Approve
              </Button>
              <Button size="sm" variant="destructive" onClick={() => handleLeaveAction(r._id, 'rejected')}>
                Reject
              </Button>
            </>
          ) : (
            <span className="text-sm text-muted-foreground italic">
              {r.status === 'approved' ? 'Already Approved' :
                r.status === 'rejected' ? 'Already Rejected' : 'Processed'}
            </span>
          )}
        </div>
      )
    },
  ];

  // ✅ MODALS COMPONENTS

  // Manual Attendance Modal
  const ManualAttendanceModal = () => (
    <CustomModal
      isOpen={showManualModal}
      onClose={() => setShowManualModal(false)}
      title="Manual Attendance Entry"
      description="Add or update attendance record manually"
      size="md"
      preventClose={loading.manual}
    >
      <form onSubmit={handleManualAttendance} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="userType">User Type</Label>
            <Select
              value={manualForm.userType}
              onValueChange={(value) => setManualForm({ ...manualForm, userType: value, userId: "", agentId: "" })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Agent" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="agent">Agent</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="person">Select Agent</Label>
            <Select
              value={manualForm.agentId}
              onValueChange={(value) => setManualForm({ ...manualForm, agentId: value })}
              disabled={!agents || agents.length === 0}
            >
              <SelectTrigger>
                <SelectValue placeholder={agents && agents.length ? 'Select Agent' : 'No agents available'} />
              </SelectTrigger>
              <SelectContent>
                {agents.map(person => (
                  <SelectItem key={person._id || person.id} value={person._id || person.id}>
                    {`${person.agentName || person.name} (${person.agentId || person.email})`}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="date">Date</Label>
          <Input
            type="date"
            value={manualForm.date}
            onChange={(e) => setManualForm({ ...manualForm, date: e.target.value })}
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="status">Status</Label>
          <Select
            value={manualForm.status}
            onValueChange={(value) => setManualForm({ ...manualForm, status: value })}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="present">Present</SelectItem>
              <SelectItem value="absent">Absent</SelectItem>
              <SelectItem value="leave">Leave</SelectItem>
              <SelectItem value="late">Late</SelectItem>
              <SelectItem value="holiday">Holiday</SelectItem>
              <SelectItem value="weekly_off">Weekly Off</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="checkInTime">Check In Time</Label>
            <Input
              type="time"
              value={manualForm.checkInTime}
              onChange={(e) => setManualForm({ ...manualForm, checkInTime: e.target.value })}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="checkOutTime">Check Out Time</Label>
            <Input
              type="time"
              value={manualForm.checkOutTime}
              onChange={(e) => setManualForm({ ...manualForm, checkOutTime: e.target.value })}
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="notes">Notes</Label>
          <Textarea
            value={manualForm.notes}
            onChange={(e) => setManualForm({ ...manualForm, notes: e.target.value })}
            placeholder="Additional notes..."
            rows={3}
          />
        </div>

        <div className="flex flex-col sm:flex-row gap-2 pt-4">
          <Button
            type="submit"
            className="flex-1"
            disabled={loading.manual || !manualForm.agentId || !manualForm.date || !manualForm.status}
          >
            {loading.manual && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Save Attendance
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={() => setShowManualModal(false)}
            className="flex-1"
            disabled={loading.manual}
          >
            Cancel
          </Button>
        </div>
      </form>
    </CustomModal>
  );

  // Leave Modal
  const LeaveModal = () => (
    <CustomModal
      isOpen={showLeaveModal}
      onClose={() => setShowLeaveModal(false)}
      title="Assign Leave"
      description="Assign leave to user or agent"
      size="md"
      preventClose={loading.assign}
    >
      <form onSubmit={handleAssignLeave} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="userType">User Type</Label>
            <Select
              value={leaveForm.userType}
              onValueChange={(value) => setLeaveForm({ ...leaveForm, userType: value, userId: "", agentId: "" })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Agent" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="agent">Agent</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="person">Select Agent</Label>
            <Select
              value={leaveForm.agentId}
              onValueChange={(value) => setLeaveForm({ ...leaveForm, agentId: value })}
              disabled={!agents || agents.length === 0}
            >
              <SelectTrigger>
                <SelectValue placeholder={agents && agents.length ? 'Select Agent' : 'No agents available'} />
              </SelectTrigger>
              <SelectContent>
                {agents.map(person => (
                  <SelectItem key={person._id || person.id} value={person._id || person.id}>
                    {`${person.agentName || person.name} (${person.agentId || person.email})`}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="startDate">Start Date</Label>
            <Input
              type="date"
              value={leaveForm.startDate}
              onChange={(e) => setLeaveForm({ ...leaveForm, startDate: e.target.value })}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="endDate">End Date</Label>
            <Input
              type="date"
              value={leaveForm.endDate}
              onChange={(e) => setLeaveForm({ ...leaveForm, endDate: e.target.value })}
              required
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="leaveType">Leave Type</Label>
          <Select
            value={leaveForm.leaveType}
            onValueChange={(value) => setLeaveForm({ ...leaveForm, leaveType: value })}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select Leave Type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="sick">Sick Leave</SelectItem>
              <SelectItem value="casual">Casual Leave</SelectItem>
              <SelectItem value="emergency">Emergency Leave</SelectItem>
              <SelectItem value="other">Other</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="reason">Reason</Label>
          <Textarea
            value={leaveForm.reason}
            onChange={(e) => setLeaveForm({ ...leaveForm, reason: e.target.value })}
            placeholder="Reason for leave..."
            rows={3}
            required
          />
        </div>

        <div className="flex flex-col sm:flex-row gap-2 pt-4">
          <Button
            type="submit"
            className="flex-1"
            disabled={loading.assign || !leaveForm.agentId || !leaveForm.startDate || !leaveForm.endDate || !leaveForm.leaveType || !leaveForm.reason}
          >
            {loading.assign && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Assign Leave
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={() => setShowLeaveModal(false)}
            className="flex-1"
            disabled={loading.assign}
          >
            Cancel
          </Button>
        </div>
      </form>
    </CustomModal>
  );

  // Holiday Modal
  const HolidayModal = () => (
    <CustomModal
      isOpen={showHolidayModal}
      onClose={() => setShowHolidayModal(false)}
      title="Create Holiday"
      description="Add a new holiday to the system. Recurring holidays will automatically repeat every year."
      size="lg"
      preventClose={loading.holidays}
    >
      <form onSubmit={handleCreateHoliday} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="name">Holiday Name *</Label>
          <Input
            type="text"
            value={holidayForm.name}
            onChange={(e) => setHolidayForm({ ...holidayForm, name: e.target.value })}
            placeholder="Enter holiday name"
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="date">Date *</Label>
          <Input
            type="date"
            value={holidayForm.date}
            onChange={(e) => setHolidayForm({ ...holidayForm, date: e.target.value })}
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="description">Description</Label>
          <Textarea
            value={holidayForm.description}
            onChange={(e) => setHolidayForm({ ...holidayForm, description: e.target.value })}
            placeholder="Holiday description..."
            rows={3}
          />
        </div>

        <div className="flex items-center space-x-2">
          <input
            type="checkbox"
            id="isRecurring"
            checked={holidayForm.isRecurring}
            onChange={(e) => setHolidayForm({ ...holidayForm, isRecurring: e.target.checked })}
            className="rounded border-gray-300"
          />
          <Label htmlFor="isRecurring" className="text-sm">
            Recurring Holiday (will repeat every year)
          </Label>
        </div>

        <div className="flex flex-col sm:flex-row gap-2 pt-4">
          <Button
            type="submit"
            className="flex-1"
            disabled={loading.holidays || !holidayForm.name || !holidayForm.date}
          >
            {loading.holidays && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Create Holiday
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={() => setShowHolidayModal(false)}
            className="flex-1"
            disabled={loading.holidays}
          >
            Cancel
          </Button>
        </div>
      </form>
    </CustomModal>
  );

  // Weekly Off Modal
  const WeeklyOffModal = () => (
    <CustomModal
      isOpen={showWeeklyOffModal}
      onClose={() => setShowWeeklyOffModal(false)}
      title="Add Weekly Off Day"
      description="Set a weekly off day that will automatically mark as off every week"
      size="md"
      preventClose={loading.weeklyOff}
    >
      <form onSubmit={handleCreateWeeklyOff} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="day">Day of Week</Label>
          <Select
            value={weeklyOffForm.day}
            onValueChange={(value) => setWeeklyOffForm({
              ...weeklyOffForm,
              day: value,
              name: value.charAt(0).toUpperCase() + value.slice(1) + " - Weekly Off"
            })}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select day" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="sunday">Sunday</SelectItem>
              <SelectItem value="monday">Monday</SelectItem>
              <SelectItem value="tuesday">Tuesday</SelectItem>
              <SelectItem value="wednesday">Wednesday</SelectItem>
              <SelectItem value="thursday">Thursday</SelectItem>
              <SelectItem value="friday">Friday</SelectItem>
              <SelectItem value="saturday">Saturday</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="name">Display Name</Label>
          <Input
            type="text"
            value={weeklyOffForm.name}
            onChange={(e) => setWeeklyOffForm({ ...weeklyOffForm, name: e.target.value })}
            placeholder="e.g., Sunday, Weekly Off"
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="description">Description</Label>
          <Textarea
            value={weeklyOffForm.description}
            onChange={(e) => setWeeklyOffForm({ ...weeklyOffForm, description: e.target.value })}
            placeholder="Description for this weekly off..."
            rows={2}
          />
        </div>

        <div className="flex flex-col sm:flex-row gap-2 pt-4">
          <Button
            type="submit"
            className="flex-1"
            disabled={loading.weeklyOff || !weeklyOffForm.day || !weeklyOffForm.name}
          >
            {loading.weeklyOff && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Add Weekly Off
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={() => setShowWeeklyOffModal(false)}
            className="flex-1"
            disabled={loading.weeklyOff}
          >
            Cancel
          </Button>
        </div>
      </form>
    </CustomModal>
  );

  // Auto Attendance Modal
  const AutoAttendanceModal = () => (
    <CustomModal
      isOpen={showAutoModal}
      onClose={() => setShowAutoModal(false)}
      title="Process Auto Attendance"
      description="Automatically mark absent for users/agents without attendance on the selected date."
      size="md"
      preventClose={loading.auto}
    >
      <form onSubmit={handleAutoAttendance} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="date">Date</Label>
          <Input
            type="date"
            value={autoForm.date}
            onChange={(e) => setAutoForm({ ...autoForm, date: e.target.value })}
            required
          />
        </div>

        <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
          <h4 className="font-medium text-blue-800 mb-2">How Auto Attendance Works:</h4>
          <ul className="text-sm text-blue-700 space-y-1">
            <li>• Users/Agents without attendance will be marked as <strong>Absent</strong></li>
            <li>• If date is a holiday, they will be marked as <strong>Holiday</strong></li>
            <li>• If date is weekly off, they will be marked as <strong>Weekly Off</strong></li>
            <li>• Existing attendance records will not be modified</li>
          </ul>
        </div>

        <div className="flex flex-col sm:flex-row gap-2 pt-4">
          <Button
            type="submit"
            className="flex-1"
            disabled={loading.auto || !autoForm.date}
          >
            {loading.auto && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Process Auto Attendance
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={() => setShowAutoModal(false)}
            className="flex-1"
            disabled={loading.auto}
          >
            Cancel
          </Button>
        </div>
      </form>
    </CustomModal>
  );

  // Shift Auto Attendance Modal
  const ShiftAutoAttendanceModal = () => (
    <CustomModal
      isOpen={showShiftAutoModal}
      onClose={() => setShowShiftAutoModal(false)}
      title="Process Shift-based Auto Attendance"
      description="Mark absent for users/agents whose shifts have ended and no check-in recorded."
      size="md"
      preventClose={loading.shiftAuto}
    >
      <form onSubmit={handleShiftAutoAttendance} className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="date">Date</Label>
            <Input
              type="date"
              value={shiftAutoForm.date}
              onChange={(e) => setShiftAutoForm({ ...shiftAutoForm, date: e.target.value })}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="userType">Select</Label>
            <Select
              value={shiftAutoForm.userType}
              onValueChange={(value) => setShiftAutoForm({ ...shiftAutoForm, userType: value })}
            >
              <SelectTrigger>
                <SelectValue placeholder="All Agents" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="agent">Agents Only</SelectItem>
                <SelectItem value="all">All Agents</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="bg-green-50 p-4 rounded-lg border border-green-200">
          <h4 className="font-medium text-green-800 mb-2">How Shift-based Auto Attendance Works:</h4>
          <ul className="text-sm text-green-700 space-y-1">
            <li>• Checks if user/agent has a shift assigned</li>
            <li>• Verifies if shift end time has passed</li>
            <li>• Marks as <strong>Absent</strong> only if shift ended and no check-in</li>
            <li>• Respects holidays and weekly offs automatically</li>
            <li>• Only processes selected user type</li>
          </ul>
        </div>

        <div className="flex gap-2 pt-4">
          <Button type="submit" className="flex-1" disabled={loading.shiftAuto}>
            {loading.shiftAuto && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Process Shift Auto Attendance
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={() => setShowShiftAutoModal(false)}
            className="flex-1"
            disabled={loading.shiftAuto}
          >
            Cancel
          </Button>
        </div>
      </form>
    </CustomModal>
  );

  // Edit Attendance Modal
  const EditAttendanceModal = () => (
    <CustomModal
      isOpen={showEditModal}
      onClose={() => setShowEditModal(false)}
      title="Edit Attendance"
      description={`Update attendance record for ${editingAttendance?.user ?
        `${editingAttendance.user.firstName} ${editingAttendance.user.lastName}` :
        editingAttendance?.agent?.agentName}`}
      size="lg"
      preventClose={loading.edit}
    >
      <form onSubmit={handleUpdateAttendance} className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="status">Status</Label>
            <Select
              value={manualForm.status}
              onValueChange={(value) => setManualForm({ ...manualForm, status: value })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="present">Present</SelectItem>
                <SelectItem value="absent">Absent</SelectItem>
                <SelectItem value="leave">Leave</SelectItem>
                <SelectItem value="late">Late</SelectItem>
                <SelectItem value="holiday">Holiday</SelectItem>
                <SelectItem value="half_day">Half Day</SelectItem>
                <SelectItem value="weekly_off">Weekly Off</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="shift">Shift</Label>
            <Select
              value={manualForm.shiftId}
              onValueChange={(value) => setManualForm({ ...manualForm, shiftId: value })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select Shift" />
              </SelectTrigger>
              <SelectContent>
                {shifts.map(shift => (
                  <SelectItem key={shift._id} value={shift._id}>
                    {shift.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="checkInTime">Check In Time</Label>
            <Input
              type="time"
              value={manualForm.checkInTime}
              onChange={(e) => setManualForm({ ...manualForm, checkInTime: e.target.value })}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="checkOutTime">Check Out Time</Label>
            <Input
              type="time"
              value={manualForm.checkOutTime}
              onChange={(e) => setManualForm({ ...manualForm, checkOutTime: e.target.value })}
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="notes">Notes</Label>
          <Textarea
            value={manualForm.notes}
            onChange={(e) => setManualForm({ ...manualForm, notes: e.target.value })}
            placeholder="Additional notes..."
            rows={3}
          />
        </div>

        <div className="flex gap-2 pt-4">
          <Button type="submit" className="flex-1" disabled={loading.edit}>
            {loading.edit && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Update Attendance
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={() => setShowEditModal(false)}
            className="flex-1"
          >
            Cancel
          </Button>
        </div>
      </form>
    </CustomModal>
  );

  // ✅ Holidays Management Section
  const HolidaysSection = () => (
    <Card>
      <CardHeader className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <CardTitle>Holidays Management</CardTitle>
          <CardDescription>
            Manage system holidays. Recurring holidays automatically repeat every year.
          </CardDescription>
        </div>
        <Button onClick={() => setShowHolidayModal(true)} className="w-full sm:w-auto">
          <Plus className="h-4 w-4 mr-2" />
          Add Holiday
        </Button>
      </CardHeader>
      <CardContent>
        {loading.holidays ? (
          <div className="flex justify-center items-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
            <span className="ml-2">Loading holidays...</span>
          </div>
        ) : holidays.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <PartyPopper className="h-12 w-12 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-600 mb-2">No holidays found</h3>
            <p className="text-gray-500">Add your first holiday to get started</p>
          </div>
        ) : (
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead className="hidden sm:table-cell">Description</TableHead>
                  <TableHead>Recurring</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {holidays.map((holiday) => (
                  <TableRow key={holiday._id}>
                    <TableCell className="font-medium">{holiday.name}</TableCell>
                    <TableCell>
                      {new Date(holiday.date).toLocaleDateString()}
                    </TableCell>
                    <TableCell className="hidden sm:table-cell">
                      <div className="max-w-xs truncate" title={holiday.description}>
                        {holiday.description || "—"}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant={holiday.isRecurring ? "default" : "secondary"}>
                        {holiday.isRecurring ? "Yes" : "No"}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => handleDeleteHoliday(holiday._id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>
    </Card>
  );

  // ✅ Weekly Off Management Section
  const WeeklyOffSection = () => (
    <Card>
      <CardHeader className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <CardTitle>Weekly Off Days</CardTitle>
          <CardDescription>
            Manage weekly off days that automatically mark as off every week
          </CardDescription>
        </div>
        <Button onClick={() => setShowWeeklyOffModal(true)} className="w-full sm:w-auto">
          <Plus className="h-4 w-4 mr-2" />
          Add Weekly Off
        </Button>
      </CardHeader>
      <CardContent>
        {loading.weeklyOff ? (
          <div className="flex justify-center items-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
            <span className="ml-2">Loading weekly off days...</span>
          </div>
        ) : weeklyOffs.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <CalendarDays className="h-12 w-12 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-600 mb-2">No weekly off days configured</h3>
            <p className="text-gray-500">Add Sunday, Friday, or other weekly off days</p>
          </div>
        ) : (
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Day</TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead className="hidden sm:table-cell">Description</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {weeklyOffs.map((weeklyOff) => (
                  <TableRow key={weeklyOff._id}>
                    <TableCell className="font-medium capitalize">{weeklyOff.day}</TableCell>
                    <TableCell>{weeklyOff.name}</TableCell>
                    <TableCell className="hidden sm:table-cell">
                      <div className="max-w-xs truncate" title={weeklyOff.description}>
                        {weeklyOff.description || "—"}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant={weeklyOff.isActive ? "default" : "secondary"}>
                        {weeklyOff.isActive ? "Active" : "Inactive"}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex gap-2 justify-end">
                        <Button
                          variant={weeklyOff.isActive ? "outline" : "default"}
                          size="sm"
                          onClick={() => handleToggleWeeklyOff(weeklyOff._id, !weeklyOff.isActive)}
                        >
                          {weeklyOff.isActive ? <ToggleLeft className="h-4 w-4 mr-1" /> : <ToggleRight className="h-4 w-4 mr-1" />}
                          {weeklyOff.isActive ? "Deactivate" : "Activate"}
                        </Button>
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => handleDeleteWeeklyOff(weeklyOff._id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>
    </Card>
  );

  return (
    <div className="min-h-screen bg-gray-50/30">
      <div className="container mx-auto px-3 sm:px-4 py-4 sm:py-6 space-y-4 sm:space-y-6">
        {/* All Modals */}
        <ManualAttendanceModal />
        <LeaveModal />
        <HolidayModal />
        <WeeklyOffModal />
        <AutoAttendanceModal />
        <ShiftAutoAttendanceModal />
        <EditAttendanceModal />

        {/* Header */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 sm:gap-6">
          <div className="text-center lg:text-left">
            <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900 tracking-tight">
              Admin Attendance Management
            </h1>
            <p className="text-gray-600 mt-1 sm:mt-2 text-sm sm:text-base">
              Manage attendance records, leave requests, holidays, and weekly off days
            </p>
          </div>

          <div className="flex flex-wrap items-center justify-center lg:justify-end gap-2 sm:gap-3">
            <Button
              onClick={() => setShowLeaveModal(true)}
              className="bg-green-600 hover:bg-green-700 text-white text-xs sm:text-sm"
              size="sm"
            >
              <UserPlus className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
              Assign Leave
            </Button>

            <Button
              onClick={() => setShowManualModal(true)}
              className="bg-blue-600 hover:bg-blue-700 text-white text-xs sm:text-sm"
              size="sm"
            >
              <Edit className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
              Manual Entry
            </Button>

            <Button
              onClick={() => setShowAutoModal(true)}
              variant="outline"
              className="border-blue-600 text-blue-600 hover:bg-blue-50 text-xs sm:text-sm"
              size="sm"
            >
              <PlayCircle className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
              Auto Attendance
            </Button>

            <Button
              onClick={() => fetchAttendance(page)}
              variant="outline"
              size="sm"
              className="text-xs sm:text-sm"
            >
              <RefreshCw className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
              Refresh
            </Button>
          </div>
        </div>

        {/* Stats Cards */}
        <StatsCards />

        {/* Filters Section */}
        <FiltersSection />

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4 sm:space-y-6">
          <div className="relative w-full">
            {/* Scrollable Wrapper (Mobile Only) */}
            <div className="overflow-x-auto sm:overflow-visible pb-2 -mx-3 sm:mx-0 sm:px-0">
              <div className="w-max sm:w-full min-w-full">
                <TabsList className="flex sm:grid sm:grid-cols-2 lg:grid-cols-4 gap-1 p-1 bg-muted/50 w-max sm:w-full rounded-md">
                  {/* Attendance */}
                  <TabsTrigger
                    value="attendance"
                    className="flex flex-col sm:flex-row items-center justify-center gap-1 sm:gap-2 px-3 py-2 text-xs sm:text-sm whitespace-nowrap min-w-[100px] sm:min-w-0"
                  >
                    <Calendar className="h-3 w-3 sm:h-4 sm:w-4" />
                    <span className="text-center">
                      Attendance <span className="hidden sm:inline">Records</span>
                    </span>
                  </TabsTrigger>

                  {/* Leave Requests */}
                  <TabsTrigger
                    value="leave"
                    className="flex flex-col sm:flex-row items-center justify-center gap-1 sm:gap-2 px-3 py-2 text-xs sm:text-sm relative whitespace-nowrap min-w-[100px] sm:min-w-0"
                  >
                    <FileText className="h-3 w-3 sm:h-4 sm:w-4" />
                    <span className="text-center">
                      Leave Requests
                    </span>
                    {leaveRequests.filter(r => r.status === "pending").length > 0 && (
                      <Badge
                        variant="destructive"
                        className="absolute -top-1 -right-1 h-4 w-4 p-0 text-[10px] flex items-center justify-center"
                      >
                        {leaveRequests.filter(r => r.status === "pending").length}
                      </Badge>
                    )}
                  </TabsTrigger>

                  {/* Holidays */}
                  <TabsTrigger
                    value="holidays"
                    className="flex flex-col sm:flex-row items-center justify-center gap-1 sm:gap-2 px-3 py-2 text-xs sm:text-sm whitespace-nowrap min-w-[100px] sm:min-w-0"
                  >
                    <PartyPopper className="h-3 w-3 sm:h-4 sm:w-4" />
                    <span className="text-center">
                      Holidays <span className="hidden sm:inline">({holidays.length})</span>
                    </span>
                  </TabsTrigger>

                  {/* Weekly Off */}
                  <TabsTrigger
                    value="weekly-off"
                    className="flex flex-col sm:flex-row items-center justify-center gap-1 sm:gap-2 px-3 py-2 text-xs sm:text-sm whitespace-nowrap min-w-[100px] sm:min-w-0"
                  >
                    <CalendarDays className="h-3 w-3 sm:h-4 sm:w-4" />
                    <span className="text-center">
                      Weekly Off <span className="hidden sm:inline">({weeklyOffs.length})</span>
                    </span>
                  </TabsTrigger>
                </TabsList>
              </div>
            </div>

            {/* Scroll Hint Only for Mobile */}
            <div className="sm:hidden text-center mt-1">
              <div className="inline-flex items-center gap-1 text-xs text-muted-foreground">
                <ChevronLeft className="h-3 w-3" />
                <span>Scroll for more</span>
                <ChevronRight className="h-3 w-3" />
              </div>
            </div>
          </div>

          <TabsContent value="attendance" className="space-y-4">
            <Card>
              <CardHeader className="p-4 sm:p-6">
                <CardTitle className="text-lg sm:text-xl">Attendance Records</CardTitle>
                <CardDescription className="text-sm sm:text-base">
                  View and manage all attendance records
                </CardDescription>
              </CardHeader>
              <CardContent className="p-4 sm:p-6 pt-0">
                <GlobalData
                  title="Attendance Records"
                  fetcher={async ({ page, limit, search, ...rest } = {}) => {
                    const params = { page: page || 1, limit: limit || 10, ...rest };
                    if (search) params.search = search;

                    try {
                      if (params.fromDate) params.startDate = params.fromDate;
                      if (params.toDate) params.endDate = params.toDate;

                      if (params.month && (params.month === '' || params.month === null)) {
                        delete params.month;
                      }
                    } catch (e) {
                      console.warn('Date normalization failed', e);
                    }

                    Object.keys(params).forEach((k) => {
                      if (params[k] === '' || params[k] === null || params[k] === undefined) delete params[k];
                    });

                    const res = await adminService.getAllAttendance(params);
                    console.log("GlobalData -> attendance fetcher result:", res);

                    if (res && res.success && (Array.isArray(res.data) || res.data == null)) return res;
                    if (res && res.data && Array.isArray(res.data)) return res;
                    if (res && res.data && res.data.data && Array.isArray(res.data.data)) return res.data;
                    return res;
                  }}
                  columns={attendanceColumns}
                  serverSide={true}
                  rowsPerPage={5}
                  searchEnabled={true}
                  filterKeys={["status"]}
                  filterOptionsMap={{
                    userType: [
                      { label: "Agents", value: "agent" },
                    ],
                    status: [
                      { label: "Present", value: "present" },
                      { label: "Absent", value: "absent" },
                      { label: "Half Day", value: "half_day" },
                      { label: "Leave", value: "leave" },
                      { label: "Late", value: "late" },
                      { label: "Holiday", value: "holiday" },
                      { label: "Weekly Off", value: "weekly_off" },
                      { label: "Approved Leave", value: "approved_leave" },
                    ],
                  }}
                  initialFilters={{ userType: "all", status: "all", month: "" }}
                  customFilters={(filters, onFilterChange) => (
                    <div className="mb-4 flex flex-wrap gap-3 items-end">
                      <div className="space-y-1">
                        <Label className="text-sm">Select Month</Label>
                        <input
                          type="month"
                          value={filters.month || ''}
                          onChange={(e) => onFilterChange('month', e.target.value)}
                          className="border rounded px-3 py-2 text-sm w-40"
                        />
                      </div>

                      {filters.month && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => onFilterChange('month', '')}
                          className="h-10"
                        >
                          <X className="h-4 w-4 mr-1" />
                          Clear Month
                        </Button>
                      )}
                    </div>
                  )}
                />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="leave">
            <Card>
              <CardHeader className="p-4 sm:p-6">
                <CardTitle className="text-lg sm:text-xl">Leave Requests Management</CardTitle>
                <CardDescription className="text-sm sm:text-base">
                  Review and manage all leave requests
                </CardDescription>
              </CardHeader>
              <CardContent className="p-4 sm:p-6 pt-0">
                <GlobalData
                  title="Leave Requests"
                  fetcher={async () => attendanceService.getAllLeaveRequests("all")}
                  columns={leaveColumns}
                  rowsPerPage={5}
                  serverSide={false}
                  searchEnabled={true}
                  filterKeys={["status"]}
                  filterOptionsMap={{
                    status: [
                      { label: "Pending", value: "pending" },
                      { label: "Approved", value: "approved" },
                      { label: "Rejected", value: "rejected" },
                    ],
                  }}
                />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="holidays">
            <HolidaysSection />
          </TabsContent>

          <TabsContent value="weekly-off">
            <WeeklyOffSection />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}