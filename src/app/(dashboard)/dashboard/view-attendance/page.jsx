//src/app/(dashboard)/dashboard/view-attendance/page.jsx
"use client";
import React, { useEffect, useState } from "react";
import { adminService } from "@/services/adminService";
import { shiftService } from "@/services/shiftService";
import { attendanceService } from "@/services/attedanceService";
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
import { Loader2, Calendar, Users, CheckCircle, XCircle, Clock, Plus, Trash2, PlayCircle, ToggleLeft, ToggleRight, Edit, ChevronLeft, ChevronRight, Download } from "lucide-react";
import { toast } from "sonner";
import CustomModal from "@/components/ui/customModal";
import Link from "next/link";

export default function AdminAttendancePage() {
  // State variables
  const [attendance, setAttendance] = useState([]);
  const [leaveRequests, setLeaveRequests] = useState([]);
  const [holidays, setHolidays] = useState([]);
  const [weeklyOffs, setWeeklyOffs] = useState([]);
  const [users, setUsers] = useState([]);
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
  const [meta, setMeta] = useState({
    total: 0,
    totalPages: 0,
    page: 1,
    limit: 10,
    hasNextPage: false,
    hasPrevPage: false
  });

  const [filters, setFilters] = useState({
    userType: "all",
    status: "all",
    date: ""
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

  // Form states
  const [manualForm, setManualForm] = useState({
    userType: "user",
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
    userType: "user",
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

  const [editForm, setEditForm] = useState({
    status: "present",
    checkInTime: "",
    checkOutTime: "",
    notes: ""
  });

  const LIMIT = 10;

  // ✅ Fetch All Data on component mount and when filters/page change
  useEffect(() => {
    fetchInitialData();
  }, []);

  useEffect(() => {
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

  // ✅ Fetch initial data (users, agents, shifts)
  const fetchInitialData = async () => {
    try {
      const usersResponse = await adminService.getUsersAndAgents("all");
      if (usersResponse.success) {
        // ✅ Ensure data has proper IDs
        const usersData = Array.isArray(usersResponse.data?.users)
          ? usersResponse.data.users.map(user => ({
            ...user,
            id: user._id || user.id,
            name: `${user.firstName || ''} ${user.lastName || ''}`.trim()
          }))
          : [];

        const agentsData = Array.isArray(usersResponse.data?.agents)
          ? usersResponse.data.agents.map(agent => ({
            ...agent,
            id: agent._id || agent.id,
            name: agent.agentName || ''
          }))
          : [];

        setUsers(usersData);
        setAgents(agentsData);
      } else {
        setUsers([]);
        setAgents([]);
      }

      const shiftsResponse = await shiftService.getShiftsForDropdown();
      setShifts(Array.isArray(shiftsResponse) ? shiftsResponse : []);

    } catch (error) {
      console.error("Error fetching initial data:", error);
      toast.error("Error loading data");
      setUsers([]);
      setAgents([]);
      setShifts([]);
    }
  };

  // ✅ Fetch Attendance Data with proper pagination
  const fetchAttendance = async (pageNum = page) => {
    try {
      setLoading(prev => ({ ...prev, attendance: true }));

      const response = await adminService.getAllAttendance({
        page: pageNum,
        limit: LIMIT,
        ...filters
      });

      if (response.success) {
        setAttendance(Array.isArray(response.data) ? response.data : []);
        setMeta(response.meta || {
          total: 0,
          totalPages: 0,
          page: pageNum,
          limit: LIMIT,
          hasNextPage: false,
          hasPrevPage: false
        });
      } else {
        toast.error("Failed to load attendance");
        setAttendance([]);
        setMeta({
          total: 0,
          totalPages: 0,
          page: pageNum,
          limit: LIMIT,
          hasNextPage: false,
          hasPrevPage: false
        });
      }
    } catch (err) {
      console.error("Fetch attendance error:", err);
      toast.error("Server error while fetching data");
      setAttendance([]);
      setMeta({
        total: 0,
        totalPages: 0,
        page: pageNum,
        limit: LIMIT,
        hasNextPage: false,
        hasPrevPage: false
      });
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
        setLeaveRequests(Array.isArray(response.data) ? response.data : []);
      } else {
        setLeaveRequests([]);
      }
    } catch (error) {
      console.error("Error fetching leave requests:", error);
      toast.error("Error loading leave requests");
      setLeaveRequests([]);
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
        setHolidays(Array.isArray(response.data) ? response.data : []);
      } else {
        setHolidays([]);
      }
    } catch (error) {
      console.error("Error fetching holidays:", error);
      toast.error("Error loading holidays");
      setHolidays([]);
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
        setWeeklyOffs(Array.isArray(response.data) ? response.data : []);
      } else {
        setWeeklyOffs([]);
      }
    } catch (error) {
      console.error("Error fetching weekly offs:", error);
      toast.error("Error loading weekly offs");
      setWeeklyOffs([]);
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
        resetManualForm();
        fetchAttendance(1);
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

  // ✅ Handle Edit Attendance
  const handleEditAttendance = (attendanceRecord) => {
    // Check if attendance can be edited
    if (!canEditAttendance(attendanceRecord)) {
      if (attendanceRecord.status === 'holiday' || attendanceRecord.status === 'weekly_off') {
        toast.error("Cannot edit holiday or weekly off records");
        return;
      }
      toast.error("Cannot edit this attendance record");
      return;
    }

    setEditingAttendance(attendanceRecord);
    setEditForm({
      status: attendanceRecord.status,
      checkInTime: attendanceRecord.checkInTime ? new Date(attendanceRecord.checkInTime).toTimeString().slice(0, 5) : "",
      checkOutTime: attendanceRecord.checkOutTime ? new Date(attendanceRecord.checkOutTime).toTimeString().slice(0, 5) : "",
      notes: attendanceRecord.notes || ""
    });
    setShowEditModal(true);
  };

  // ✅ Handle Update Attendance
  const handleUpdateAttendance = async (e) => {
    e.preventDefault();
    if (!editingAttendance) return;

    try {
      setLoading(prev => ({ ...prev, edit: true }));

      const updateData = {
        attendanceId: editingAttendance._id,
        ...editForm
      };

      const response = await adminService.updateAttendance(updateData);
      if (response.success) {
        toast.success("Attendance updated successfully");
        setShowEditModal(false);
        setEditingAttendance(null);
        fetchAttendance(page);
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

  // ✅ Handle Leave Assignment
  const handleAssignLeave = async (e) => {
    e.preventDefault();
    try {
      setLoading(prev => ({ ...prev, assign: true }));
      const response = await adminService.assignLeave(leaveForm);
      if (response.success) {
        toast.success("Leave assigned successfully");
        setShowLeaveModal(false);
        resetLeaveForm();
        fetchAttendance(1);
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
        resetHolidayForm();
        fetchHolidays();
        fetchAttendance(1);
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
        resetWeeklyOffForm();
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

  // ✅ Handle Auto Attendance Processing (Original)
  const handleAutoAttendance = async (e) => {
    e.preventDefault();
    try {
      setLoading(prev => ({ ...prev, auto: true }));
      const response = await attendanceService.processAutoAttendanceForDate(autoForm.date);
      if (response.success) {
        toast.success(response.message || "Auto attendance processed successfully");
        setShowAutoModal(false);
        resetAutoForm();
        fetchAttendance(1);
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

  // ✅ Handle Shift-based Auto Attendance Processing (New)
  const handleShiftAutoAttendance = async (e) => {
    e.preventDefault();
    try {
      setLoading(prev => ({ ...prev, shiftAuto: true }));
      const response = await adminService.processShiftAutoAttendance(shiftAutoForm.date, shiftAutoForm.userType);
      if (response.success) {
        toast.success(response.message || "Shift-based auto attendance processed successfully");
        setShowShiftAutoModal(false);
        resetShiftAutoForm();
        fetchAttendance(1);
      } else {
        toast.error(response.message || "Error processing shift-based auto attendance");
      }
    } catch (error) {
      console.error("Error processing shift-based auto attendance:", error);
      toast.error("Error processing shift-based auto attendance");
    } finally {
      setLoading(prev => ({ ...prev, shiftAuto: false }));
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
        fetchAttendance(1);
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
        fetchAttendance(page);
      } else {
        toast.error(response.message || "Error processing request");
      }
    } catch (error) {
      console.error("Error updating leave request:", error);
      toast.error("Error processing request");
    }
  };

  // ✅ Check if attendance can be edited
  const canEditAttendance = (attendanceRecord) => {
    if (!attendanceRecord) return false;

    // Cannot edit holiday or weekly off records
    if (attendanceRecord.status === 'holiday' || attendanceRecord.status === 'weekly_off') {
      return false;
    }

    const recordDate = new Date(attendanceRecord.createdAt);
    const today = new Date();

    // Can only edit today's or past records
    return recordDate <= today;
  };

  // ✅ Reset Form Functions
  const resetManualForm = () => {
    setManualForm({
      userType: "user",
      userId: "",
      agentId: "",
      shiftId: "",
      date: new Date().toISOString().split('T')[0],
      status: "present",
      checkInTime: "",
      checkOutTime: "",
      notes: ""
    });
  };

  const resetLeaveForm = () => {
    setLeaveForm({
      userType: "user",
      userId: "",
      agentId: "",
      startDate: new Date().toISOString().split('T')[0],
      endDate: new Date().toISOString().split('T')[0],
      leaveType: "casual",
      reason: ""
    });
  };

  const resetHolidayForm = () => {
    setHolidayForm({
      name: "",
      date: new Date().toISOString().split('T')[0],
      description: "",
      isRecurring: false
    });
  };

  const resetWeeklyOffForm = () => {
    setWeeklyOffForm({
      day: "sunday",
      name: "Sunday",
      description: "Weekly off day"
    });
  };

  const resetAutoForm = () => {
    setAutoForm({
      date: new Date().toISOString().split('T')[0]
    });
  };

  const resetShiftAutoForm = () => {
    setShiftAutoForm({
      date: new Date().toISOString().split('T')[0],
      userType: "all"
    });
  };

  // ✅ Filter and Pagination Handlers
  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
    setPage(1);
  };

  const goToNextPage = () => {
    if (page < meta.totalPages) {
      setPage(prev => prev + 1);
    }
  };

  const goToPrevPage = () => {
    if (page > 1) {
      setPage(prev => prev - 1);
    }
  };

  const goToPage = (pageNum) => {
    if (pageNum >= 1 && pageNum <= meta.totalPages) {
      setPage(pageNum);
    }
  };

  // ✅ Utility Functions
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
      <Badge variant="outline" className={statusConfig[status] || "bg-gray-100 text-gray-700 border-gray-200"}>
        {status ? status.replace(/_/g, ' ') : 'Unknown'}
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
      <Badge variant="outline" className={statusConfig[status] || "bg-gray-100 text-gray-700 border-gray-200"}>
        {status || 'Unknown'}
      </Badge>
    );
  };

  // ✅ Safe ID function to handle missing IDs
  const getSafeId = (item, index) => {
    return item?._id || item?.id || `temp-${index}`;
  };

  // ✅ Safe name function
  const getSafeName = (item) => {
    if (item.firstName && item.lastName) {
      return `${item.firstName} ${item.lastName}`;
    }
    return item.agentName || item.name || 'Unknown';
  };

  // ✅ Safe email function
  const getSafeEmail = (item) => {
    return item.email || 'No email';
  };

  // ✅ Render Pagination Component
  const renderPagination = () => {
    if (meta.totalPages <= 1) return null;

    const pages = [];
    const maxVisiblePages = 5;
    let startPage = Math.max(1, page - Math.floor(maxVisiblePages / 2));
    let endPage = Math.min(meta.totalPages, startPage + maxVisiblePages - 1);

    if (endPage - startPage + 1 < maxVisiblePages) {
      startPage = Math.max(1, endPage - maxVisiblePages + 1);
    }

    for (let i = startPage; i <= endPage; i++) {
      pages.push(
        <Button
          key={i}
          variant={page === i ? "default" : "outline"}
          size="sm"
          onClick={() => goToPage(i)}
          className={page === i ? "bg-gray-800 text-white" : ""}
        >
          {i}
        </Button>
      );
    }

    return (
      <div className="flex justify-center items-center gap-2 mt-6 flex-wrap">
        <Button
          onClick={goToPrevPage}
          disabled={page === 1}
          variant="outline"
          size="sm"
        >
          <ChevronLeft className="h-4 w-4" />
          Previous
        </Button>

        {startPage > 1 && (
          <>
            <Button
              variant="outline"
              size="sm"
              onClick={() => goToPage(1)}
            >
              1
            </Button>
            {startPage > 2 && <span className="px-2">...</span>}
          </>
        )}

        {pages}

        {endPage < meta.totalPages && (
          <>
            {endPage < meta.totalPages - 1 && <span className="px-2">...</span>}
            <Button
              variant="outline"
              size="sm"
              onClick={() => goToPage(meta.totalPages)}
            >
              {meta.totalPages}
            </Button>
          </>
        )}

        <Button
          onClick={goToNextPage}
          disabled={page === meta.totalPages}
          variant="outline"
          size="sm"
        >
          Next
          <ChevronRight className="h-4 w-4" />
        </Button>

        <span className="text-sm text-muted-foreground ml-4">
          Page {page} of {meta.totalPages} • {meta.total} total records
        </span>
      </div>
    );
  };

  // ✅ MODALS COMPONENTS

  // Manual Attendance Modal
  const ManualAttendanceModal = () => (
    <CustomModal
      isOpen={showManualModal}
      onClose={() => setShowManualModal(false)}
      title="Manual Attendance Entry"
      description="Add or update attendance record manually"
      size="md"
      preventClose={loading.manual} // Loading state mein close na ho
    >
      <form onSubmit={handleManualAttendance} className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="userType">User Type</Label>
            <Select
              value={manualForm.userType}
              onValueChange={(value) => setManualForm({ ...manualForm, userType: value, userId: "", agentId: "" })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select user type" />
              </SelectTrigger>
              <SelectContent>
                {/* <SelectItem value="user">User</SelectItem> */}
                <SelectItem value="agent">Agent</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* <div className="space-y-2">
            <Label htmlFor="person">
              {manualForm.userType === 'user' ? 'Select User' : 'Select Agent'}
            </Label>
            <Select
              value={manualForm.userType === 'user' ? manualForm.userId : manualForm.agentId}
              onValueChange={(value) => setManualForm({
                ...manualForm,
                [manualForm.userType === 'user' ? 'userId' : 'agentId']: value
              })}
            >
              <SelectTrigger>
                <SelectValue placeholder={`Select ${manualForm.userType === 'user' ? 'User' : 'Agent'}`} />
              </SelectTrigger>
              <SelectContent>
                {(manualForm.userType === 'user' ? users : agents).map(person => (
                  <SelectItem key={person.id} value={person.id}>
                    {person.name} ({person.email})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div> */}
          <div className="space-y-2">
            <Label htmlFor="person">
              {manualForm.userType === 'user' ? 'Select User' : 'Select Agent'}
            </Label>
            <Select
              value={manualForm.userType === 'user' ? manualForm.userId : manualForm.agentId}
              onValueChange={(value) => setManualForm({
                ...manualForm,
                [manualForm.userType === 'user' ? 'userId' : 'agentId']: value
              })}
            >
              <SelectTrigger>
                <SelectValue placeholder={`Select ${manualForm.userType === 'user' ? 'User' : 'Agent'}`} />
              </SelectTrigger>
              <SelectContent>
                {(manualForm.userType === 'user' ? users : agents).map(person => (
                  <SelectItem key={person.id} value={person.id}>
                    {manualForm.userType === 'user'
                      ? `${person.name} (${person.email})`
                      : `(${person.agentId})`
                    }
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
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
                <SelectItem value="no">No Shift</SelectItem>
                {shifts.map(shift => (
                  <SelectItem key={shift._id} value={shift._id}>
                    {shift.name} ({shift.startTime} - {shift.endTime})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
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

        <div className="flex gap-2 pt-4">
          <Button type="submit" className="flex-1" disabled={loading.manual}>
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

  //✅ Leave Assignment Modal
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
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2 w-full">
            <Label htmlFor="userType">User Type</Label>
            <Select
              value={leaveForm.userType}
              onValueChange={(value) => setLeaveForm({ ...leaveForm, userType: value, userId: "", agentId: "" })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select user type" />
              </SelectTrigger>
              <SelectContent>
                {/* <SelectItem value="user">User</SelectItem> */}
                <SelectItem value="agent">Agent</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="person">
              {leaveForm.userType === 'user' ? 'Select User' : 'Select Agent'}
            </Label>
            <Select
              value={leaveForm.userType === 'user' ? leaveForm.userId : leaveForm.agentId}
              onValueChange={(value) => setLeaveForm({
                ...leaveForm,
                [leaveForm.userType === 'user' ? 'userId' : 'agentId']: value
              })}
            >
              <SelectTrigger>
                <SelectValue placeholder={`Select ${leaveForm.userType === 'user' ? 'User' : 'Agent'}`} />
              </SelectTrigger>
              <SelectContent>
                {(leaveForm.userType === 'user' ? users : agents).map(person => (
                  <SelectItem key={person.id} value={person.id}>
                    {leaveForm.userType === 'user'
                      ? `${person.name} (${person.email})`
                      : `(${person.agentId})`
                    }
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
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

        <div className="flex gap-2 pt-4">
          <Button type="submit" className="flex-1" disabled={loading.assign}>
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

  // Holiday Creation Modal
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

        <div className="flex gap-2 pt-4">
          <Button type="submit" className="flex-1" disabled={loading.holidays}>
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
              name: value.charAt(0).toUpperCase() + value.slice(1)
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

        <div className="flex gap-2 pt-4">
          <Button type="submit" className="flex-1" disabled={loading.weeklyOff}>
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

  // Original Auto Attendance Modal
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

        <div className="flex gap-2 pt-4">
          <Button type="submit" className="flex-1" disabled={loading.auto}>
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

  // New Shift-based Auto Attendance Modal
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
            <Label htmlFor="userType">User Type</Label>
            <Select
              value={shiftAutoForm.userType}
              onValueChange={(value) => setShiftAutoForm({ ...shiftAutoForm, userType: value })}
            >
              <SelectTrigger>
                <SelectValue placeholder="All Users" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Users</SelectItem>
                <SelectItem value="user">Users Only</SelectItem>
                <SelectItem value="agent">Agents Only</SelectItem>
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
              value={editForm.status}
              onValueChange={(value) => setEditForm({ ...editForm, status: value })}
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

          <div className="space-y-2">
            <Label htmlFor="date">Date</Label>
            <Input
              type="text"
              value={editingAttendance ? new Date(editingAttendance.createdAt).toLocaleDateString() : ""}
              disabled
              className="bg-gray-100"
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="checkInTime">Check In Time</Label>
            <Input
              type="time"
              value={editForm.checkInTime}
              onChange={(e) => setEditForm({ ...editForm, checkInTime: e.target.value })}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="checkOutTime">Check Out Time</Label>
            <Input
              type="time"
              value={editForm.checkOutTime}
              onChange={(e) => setEditForm({ ...editForm, checkOutTime: e.target.value })}
            />
          </div>
        </div>

        {/* <div className="space-y-2">
          <Label htmlFor="notes">Notes</Label>
          <Textarea
            value={editForm.notes}
            onChange={(e) => setEditForm({ ...editForm, notes: e.target.value })}
            placeholder="Additional notes..."
            rows={3}
          />
        </div> */}

        {editingAttendance && (
          <div className="bg-gray-50 p-3 rounded-lg border">
            <h4 className="font-medium text-sm mb-2">Current Information:</h4>
            <div className="grid grid-cols-2 gap-2 text-sm">
              <div>
                <span className="text-gray-600">Type:</span> {editingAttendance.user ? 'User' : 'Agent'}
              </div>
              <div>
                <span className="text-gray-600">Shift:</span> {editingAttendance.shift?.name || 'No Shift'}
              </div>
              <div>
                <span className="text-gray-600">Current Status:</span>
                <span className="ml-1 capitalize">{editingAttendance.status}</span>
              </div>
              <div>
                <span className="text-gray-600">Late Minutes:</span> {editingAttendance.lateMinutes || 0}
              </div>
            </div>
          </div>
        )}

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
            disabled={loading.edit}
          >
            Cancel
          </Button>
        </div>
      </form>
    </CustomModal>
  );

  // ✅ STATS CARDS
  const StatsCards = () => (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Records</CardTitle>
          <Calendar className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-blue-600">{meta.total}</div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Present Today</CardTitle>
          <CheckCircle className="h-4 w-4 text-green-600" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-green-600">
            {attendance.filter(a => a.status === 'present').length}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Absent Today</CardTitle>
          <XCircle className="h-4 w-4 text-red-600" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-red-600">
            {attendance.filter(a => a.status === 'absent').length}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">On Leave/Holiday/Off</CardTitle>
          <Clock className="h-4 w-4 text-yellow-600" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-yellow-600">
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

  // // ✅ FILTERS SECTION
  // const FiltersSection = () => (
  //   <Card className="mb-6">
  //     <CardHeader>
  //       <CardTitle className="text-lg">Filters</CardTitle>
  //     </CardHeader>
  //     <CardContent>
  //       <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
  //         <div className="space-y-2">
  //           <Label htmlFor="userType">User Type</Label>
  //           <Select
  //             value={filters.userType}
  //             onValueChange={(value) => handleFilterChange('userType', value)}
  //           >
  //             <SelectTrigger>
  //               <SelectValue placeholder="All Users" />
  //             </SelectTrigger>
  //             <SelectContent>
  //               <SelectItem value="all">All Users</SelectItem>
  //               <SelectItem value="user">Users Only</SelectItem>
  //               <SelectItem value="agent">Agents Only</SelectItem>
  //             </SelectContent>
  //           </Select>
  //         </div>

  //         <div className="space-y-2">
  //           <Label htmlFor="status">Status</Label>
  //           <Select
  //             value={filters.status}
  //             onValueChange={(value) => handleFilterChange('status', value)}
  //           >
  //             <SelectTrigger>
  //               <SelectValue placeholder="All Status" />
  //             </SelectTrigger>
  //             <SelectContent>
  //               <SelectItem value="all">All Status</SelectItem>
  //               <SelectItem value="present">Present</SelectItem>
  //               <SelectItem value="absent">Absent</SelectItem>
  //               <SelectItem value="leave">Leave</SelectItem>
  //               <SelectItem value="late">Late</SelectItem>
  //               <SelectItem value="holiday">Holiday</SelectItem>
  //               <SelectItem value="weekly_off">Weekly Off</SelectItem>
  //               <SelectItem value="approved_leave">Approved Leave</SelectItem>
  //             </SelectContent>
  //           </Select>
  //         </div>

  //         <div className="space-y-2">
  //           <Label htmlFor="date">Date</Label>
  //           <Input
  //             type="date"
  //             value={filters.date}
  //             onChange={(e) => handleFilterChange('date', e.target.value)}
  //           />
  //         </div>

  //         <div className="space-y-2">
  //           <Label htmlFor="clear">&nbsp;</Label>
  //           <Button
  //             onClick={() => {
  //               setFilters({ userType: "all", status: "all", date: "" });
  //               setPage(1);
  //             }}
  //             variant="outline"
  //             className="w-full"
  //           >
  //             Clear Filters
  //           </Button>
  //         </div>
  //       </div>
  //     </CardContent>
  //   </Card>
  // );

  // ✅ HOLIDAYS MANAGEMENT SECTION
  const HolidaysSection = () => (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle>Holidays Management</CardTitle>
          <CardDescription>
            Manage system holidays. Recurring holidays automatically repeat every year.
          </CardDescription>
        </div>
        <Button onClick={() => setShowHolidayModal(true)}>
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
            No holidays found.
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Description</TableHead>
                <TableHead>Recurring</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {holidays.map((holiday) => (
                <TableRow key={holiday._id}>
                  <TableCell className="font-medium">{holiday.name}</TableCell>
                  <TableCell>
                    {new Date(holiday.date).toLocaleDateString()}
                  </TableCell>
                  <TableCell>
                    <div className="max-w-xs truncate" title={holiday.description}>
                      {holiday.description || "—"}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant={holiday.isRecurring ? "default" : "secondary"}>
                      {holiday.isRecurring ? "Yes" : "No"}
                    </Badge>
                  </TableCell>
                  <TableCell>
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
        )}
      </CardContent>
    </Card>
  );

  // ✅ WEEKLY OFF MANAGEMENT SECTION
  const WeeklyOffSection = () => (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle>Weekly Off Days</CardTitle>
          <CardDescription>
            Manage weekly off days that automatically mark as off every week
          </CardDescription>
        </div>
        <Button onClick={() => setShowWeeklyOffModal(true)}>
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
            No weekly off days configured. Add Sunday, Friday, or other weekly off days.
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Day</TableHead>
                <TableHead>Name</TableHead>
                <TableHead>Description</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {weeklyOffs.map((weeklyOff) => (
                <TableRow key={weeklyOff._id}>
                  <TableCell className="font-medium capitalize">{weeklyOff.day}</TableCell>
                  <TableCell>{weeklyOff.name}</TableCell>
                  <TableCell>
                    <div className="max-w-xs truncate" title={weeklyOff.description}>
                      {weeklyOff.description || "—"}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant={weeklyOff.isActive ? "default" : "secondary"}>
                      {weeklyOff.isActive ? "Active" : "Inactive"}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-2">
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
        )}
      </CardContent>
    </Card>
  );

  // ✅ MAIN COMPONENT RENDER
  return (
    <div className="container mx-auto py-6 space-y-6">
      {/* All Modals */}
      <ManualAttendanceModal />
      <LeaveModal />
      <HolidayModal />
      <WeeklyOffModal />
      <AutoAttendanceModal />
      <ShiftAutoAttendanceModal />
      <EditAttendanceModal />

      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Admin Attendance Management</h1>
          <p className="text-muted-foreground">
            Manage attendance records, leave requests, holidays, and weekly off days
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            onClick={() => setShowLeaveModal(true)}
            className="bg-green-600 hover:bg-green-700"
          >
            Assign Leave
          </Button>
          <Button
            onClick={() => setShowManualModal(true)}
          >
            Manual Entry
          </Button>
          <div className="relative group">
            <Button
              onClick={() => setShowShiftAutoModal(true)}
              variant="outline"
              className="border-green-600 text-green-600 hover:bg-green-50"
            >
              <PlayCircle className="h-4 w-4 mr-2" />
              Auto Attendance
            </Button>
            <div className="absolute bottom-full left-0 mb-2 hidden group-hover:block w-48 bg-gray-800 text-white text-sm rounded p-2 z-10">
              Click for shift-based auto attendance
            </div>
          </div>
          {/* <Button
            onClick={() => setShowAutoModal(true)}
            variant="outline"
            className="border-blue-600 text-blue-600 hover:bg-blue-50"
          >
            <PlayCircle className="h-4 w-4 mr-2" />
            Simple Auto
          </Button> */}
          <Link
            href={'/api/attendance/export'}
          >
            <Button
              className="border-purple-600 text-blue-600 hover:bg-blue-50"
              variant="outline"
            >
              <Download className="h-4 w-4 mr-2" />
              Export CSV
            </Button>
          </Link>

          <Button
            onClick={() => fetchAttendance(1)}
            variant="outline"
          >
            Refresh
          </Button>
        </div>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="attendance">
            Attendance Records
          </TabsTrigger>
          <TabsTrigger value="leave">
            Leave Requests ({leaveRequests.filter(r => r.status === 'pending').length})
          </TabsTrigger>
          <TabsTrigger value="holidays">
            Holidays ({holidays.length})
          </TabsTrigger>
          <TabsTrigger value="weekly-off">
            Weekly Off ({weeklyOffs.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="attendance" className="space-y-6">
          {/* <FiltersSection /> */}
          <StatsCards />

          <Card>
            <CardHeader>
              <CardTitle>Attendance Records</CardTitle>
              <CardDescription>
                View and manage all attendance records
              </CardDescription>
            </CardHeader>
            <CardContent>
              {loading.attendance ? (
                <div className="flex justify-center items-center py-12">
                  <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
                  <span className="ml-2">Loading attendance records...</span>
                </div>
              ) : (
                <>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Type</TableHead>
                        <TableHead>Name</TableHead>
                        <TableHead>Shift</TableHead>
                        <TableHead>Check In</TableHead>
                        <TableHead>Check Out</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Remarks</TableHead>
                        <TableHead>Date</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {attendance.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={9} className="text-center py-8 text-muted-foreground">
                            No attendance records found.
                          </TableCell>
                        </TableRow>
                      ) : (
                        attendance.map((a) => (
                          <TableRow key={a._id}>
                            <TableCell>
                              <Badge variant={a.user ? "default" : "secondary"}>
                                {a.user ? 'User' : 'Agent'}
                              </Badge>
                            </TableCell>
                            <TableCell className="font-medium">
                              {a.user
                                ? `${a.user?.firstName || ''} ${a.user?.lastName || ''}`
                                : a.agent?.agentName || '—'
                              }
                            </TableCell>
                            <TableCell>{a.shift?.name || "—"}</TableCell>
                            <TableCell>
                              {a.checkInTime
                                ? new Date(a.checkInTime).toLocaleTimeString()
                                : "—"}
                            </TableCell>
                            <TableCell>
                              {a.checkOutTime
                                ? new Date(a.checkOutTime).toLocaleTimeString()
                                : "—"}
                            </TableCell>
                            <TableCell>{getStatusBadge(a.status)}</TableCell>
                            <TableCell>
                              {a.isLate ? (
                                <span className="text-yellow-600 text-sm">
                                  Late ({a.lateMinutes}m)
                                </span>
                              ) : a.isOvertime ? (
                                <span className="text-green-600 text-sm">
                                  Overtime (+{a.overtimeMinutes}m)
                                </span>
                              ) : a.leaveReason ? (
                                <span className="text-blue-600 text-sm">
                                  {a.leaveType}: {a.leaveReason}
                                </span>
                              ) : (
                                <span className="text-muted-foreground text-sm">—</span>
                              )}
                            </TableCell>
                            <TableCell className="text-sm text-muted-foreground">
                              {new Date(a.createdAt).toLocaleDateString()}
                            </TableCell>
                            <TableCell>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleEditAttendance(a)}
                                disabled={!canEditAttendance(a)}
                                title={
                                  !canEditAttendance(a)
                                    ? a.status === 'holiday' || a.status === 'weekly_off'
                                      ? 'Cannot edit holiday/weekly off records'
                                      : 'Cannot edit this record'
                                    : 'Edit attendance'
                                }
                              >
                                <Edit className="h-4 w-4" />
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))
                      )}
                    </TableBody>
                  </Table>

                  {/* Pagination */}
                  {renderPagination()}
                </>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="leave">
          <Card>
            <CardHeader>
              <CardTitle>Leave Requests Management</CardTitle>
              <CardDescription>
                Review and manage all leave requests
              </CardDescription>
            </CardHeader>
            <CardContent>
              {loading.leave ? (
                <div className="flex justify-center items-center py-12">
                  <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
                  <span className="ml-2">Loading leave requests...</span>
                </div>
              ) : leaveRequests.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  No leave requests found.
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Type</TableHead>
                      <TableHead>Name</TableHead>
                      <TableHead>Leave Type</TableHead>
                      <TableHead>Period</TableHead>
                      <TableHead>Reason</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {leaveRequests.map((request) => (
                      <TableRow key={request._id}>
                        <TableCell>
                          <Badge variant={request.user ? "default" : "secondary"}>
                            {request.user ? 'User' : 'Agent'}
                          </Badge>
                        </TableCell>
                        <TableCell className="font-medium">
                          {request.user
                            ? `${request.user?.firstName || ''} ${request.user?.lastName || ''}`
                            : request.agent?.agentName || '—'
                          }
                          <div className="text-xs text-muted-foreground">
                            {request.user ? request.user.email : request.agent?.email}
                          </div>
                        </TableCell>
                        <TableCell className="capitalize">{request.leaveType}</TableCell>
                        <TableCell className="text-sm">
                          {new Date(request.startDate).toLocaleDateString()} - {new Date(request.endDate).toLocaleDateString()}
                        </TableCell>
                        <TableCell>
                          <div className="max-w-xs" title={request.reason}>
                            {request.reason}
                          </div>
                        </TableCell>
                        <TableCell>{getLeaveStatusBadge(request.status)}</TableCell>
                        <TableCell>
                          {request.status === 'pending' && (
                            <div className="flex gap-2">
                              <Button
                                onClick={() => handleLeaveAction(request._id, 'approved')}
                                size="sm"
                                className="bg-green-600 hover:bg-green-700"
                              >
                                Approve
                              </Button>
                              <Button
                                onClick={() => {
                                  const comments = prompt('Rejection reason:');
                                  if (comments !== null) {
                                    handleLeaveAction(request._id, 'rejected', comments);
                                  }
                                }}
                                size="sm"
                                variant="destructive"
                              >
                                Reject
                              </Button>
                            </div>
                          )}
                          {request.status !== 'pending' && (
                            <span className="text-sm text-muted-foreground">
                              Reviewed by {request.reviewedBy?.firstName}
                            </span>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
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
  );
}