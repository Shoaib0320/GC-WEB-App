
// "use client";

// import React, { useCallback, useEffect, useState } from "react";
// import { adminService } from "@/services/adminService";
// import { shiftService } from "@/services/shiftService";
// import { attendanceService } from "@/services/attendanceService";
// import { weeklyOffService } from "@/services/weeklyOffService";
// import { Button } from "@/components/ui/button";
// import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
// import { Input } from "@/components/ui/input";
// import { Label } from "@/components/ui/label";
// import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
// import { Textarea } from "@/components/ui/textarea";
// import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
// import { Badge } from "@/components/ui/badge";
// import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
// import {
//   Loader2, Calendar, Users, CheckCircle, XCircle, Clock, Plus, Trash2,
//   PlayCircle, ToggleLeft, ToggleRight, Edit, ChevronLeft, ChevronRight,
//   Download, X, RefreshCw, ChevronDown, UserPlus, FileText, PartyPopper,
//   CalendarDays, Search
// } from "lucide-react";
// import { toast } from "sonner";
// import CustomModal from "@/components/ui/customModal";
// import { useAuth } from "@/context/AuthContext";
// import {
//   Pagination,
//   PaginationContent,
//   PaginationItem,
//   PaginationLink,
//   PaginationNext,
//   PaginationPrevious,
// } from "@/components/ui/pagination";
// export default function AdminAttendancePage() {
//   const { hasPermission } = useAuth();
//   // State variables
//   const [attendance, setAttendance] = useState([]);
//   const [leaveRequests, setLeaveRequests] = useState([]);
//   const [holidays, setHolidays] = useState([]);
//   const [weeklyOffs, setWeeklyOffs] = useState([]);
//   const [agents, setAgents] = useState([]);
//   const [shifts, setShifts] = useState([]);
//   const [loading, setLoading] = useState({
//     attendance: false,
//     leave: false,
//     manual: false,
//     assign: false,
//     holidays: false,
//     weeklyOff: false,
//     auto: false,
//     edit: false,
//     shiftAuto: false
//   });
//   const [page, setPage] = useState(1);
//   const [limit, setLimit] = useState(10);
//   const [total, setTotal] = useState(0);
//   const [searchQuery, setSearchQuery] = useState("");
//   const [filters, setFilters] = useState({
//     userType: "all",
//     status: "all",
//     date: "",
//     month: ""
//   });
//   const [activeTab, setActiveTab] = useState("attendance");
//   // Permission checks
//   const canViewAttendance = hasPermission('attendance', 'view');
//   const canCreateAttendance = hasPermission('attendance', 'create');
//   const canEditAttendance = hasPermission('attendance', 'edit');
//   const canDeleteAttendance = hasPermission('attendance', 'delete');
//   const canViewLeave = hasPermission('leaveRequest', 'view');
//   const canCreateLeave = hasPermission('leaveRequest', 'create');
//   const canApproveLeave = hasPermission('leaveRequest', 'approve');
//   const canViewHolidays = hasPermission('holiday', 'view');
//   const canCreateHolidays = hasPermission('holiday', 'create');
//   const canEditHolidays = hasPermission('holiday', 'edit');
//   const canDeleteHolidays = hasPermission('holiday', 'delete');
//   const canViewWeeklyOff = hasPermission('weeklyOff', 'view');
//   const canCreateWeeklyOff = hasPermission('weeklyOff', 'create');
//   const canEditWeeklyOff = hasPermission('weeklyOff', 'edit');
//   const canDeleteWeeklyOff = hasPermission('weeklyOff', 'delete');
//   // Modal states
//   const [showManualModal, setShowManualModal] = useState(false);
//   const [showLeaveModal, setShowLeaveModal] = useState(false);
//   const [showHolidayModal, setShowHolidayModal] = useState(false);
//   const [showWeeklyOffModal, setShowWeeklyOffModal] = useState(false);
//   const [showAutoModal, setShowAutoModal] = useState(false);
//   const [showShiftAutoModal, setShowShiftAutoModal] = useState(false);
//   const [showEditModal, setShowEditModal] = useState(false);
//   const [editingAttendance, setEditingAttendance] = useState(null);
//   const [manualForm, setManualForm] = useState({
//     userType: "agent",
//     userId: "",
//     agentId: "",
//     shiftId: "",
//     date: new Date().toISOString().split('T')[0],
//     status: "present",
//     checkInTime: "",
//     checkOutTime: "",
//     notes: ""
//   });
//   const [leaveForm, setLeaveForm] = useState({
//     userType: "agent",
//     userId: "",
//     agentId: "",
//     startDate: new Date().toISOString().split('T')[0],
//     endDate: new Date().toISOString().split('T')[0],
//     leaveType: "casual",
//     reason: ""
//   });
//   const [holidayForm, setHolidayForm] = useState({
//     name: "",
//     date: new Date().toISOString().split('T')[0],
//     description: "",
//     isRecurring: false
//   });
//   const [weeklyOffForm, setWeeklyOffForm] = useState({
//     day: "sunday",
//     name: "Sunday",
//     description: "Weekly off day"
//   });
//   const [autoForm, setAutoForm] = useState({
//     date: new Date().toISOString().split('T')[0]
//   });
//   const [shiftAutoForm, setShiftAutoForm] = useState({
//     date: new Date().toISOString().split('T')[0],
//     userType: "agent"
//   });
//   // Fetch data
//   useEffect(() => {
//     fetchInitialData();
//   }, []);
//   useEffect(() => {
//     if (activeTab === "attendance") {
//       fetchAttendance();
//     } else if (activeTab === "holidays") {
//       fetchHolidays();
//     } else if (activeTab === "leave") {
//       fetchLeaveRequests();
//     } else if (activeTab === "weekly-off") {
//       fetchWeeklyOffs();
//     }
//   }, [activeTab, page, limit, filters, searchQuery]);
//   const fetchInitialData = async () => {
//     try {
//       const usersResponse = await adminService.getUsersAndAgents("all");
//       if (usersResponse.success) {
//         setAgents(usersResponse.data.agents || []);
//       }
//       const shiftsResponse = await shiftService.getShiftsForDropdown();
//       setShifts(shiftsResponse);
//     } catch (error) {
//       console.error("Error fetching initial data:", error);
//       toast.error("Error loading data");
//     }
//   };
//   const fetchAttendance = async () => {
//     try {
//       setLoading(prev => ({ ...prev, attendance: true }));
//       const params = {
//         page,
//         limit,
//         ...filters,
//         search: searchQuery
//       };
//       if (filters.month) {
//         const [year, month] = filters.month.split('-');
//         params.month = month;
//         params.year = year;
//         params.date = ""; // Clear date if month is selected
//       } else if (filters.date) {
//         params.date = filters.date;
//       }
//       if (filters.status === "all") {
//         delete params.status;
//       }
//       const response = await adminService.getAllAttendance(params);
//       if (response.success) {
//         setAttendance(response.data || []);
//         setTotal(response.meta?.total || response.data?.length || 0);
//       } else {
//         toast.error("Failed to load attendance");
//       }
//     } catch (err) {
//       console.error(err);
//       toast.error("Server error while fetching data");
//     } finally {
//       setLoading(prev => ({ ...prev, attendance: false }));
//     }
//   };
//   const fetchLeaveRequests = async () => {
//     try {
//       setLoading(prev => ({ ...prev, leave: true }));
//       const response = await attendanceService.getAllLeaveRequests("all");
//       if (response.success) {
//         setLeaveRequests(response.data || []);
//       }
//     } catch (error) {
//       console.error("Error fetching leave requests:", error);
//       toast.error("Error loading leave requests");
//     } finally {
//       setLoading(prev => ({ ...prev, leave: false }));
//     }
//   };
//   const fetchHolidays = async () => {
//     try {
//       setLoading(prev => ({ ...prev, holidays: true }));
//       const response = await attendanceService.getHolidays();
//       if (response.success) {
//         setHolidays(response.data || []);
//       }
//     } catch (error) {
//       console.error("Error fetching holidays:", error);
//       toast.error("Error loading holidays");
//     } finally {
//       setLoading(prev => ({ ...prev, holidays: false }));
//     }
//   };
//   const fetchWeeklyOffs = async () => {
//     try {
//       setLoading(prev => ({ ...prev, weeklyOff: true }));
//       const response = await weeklyOffService.getAll();
//       if (response.success) {
//         setWeeklyOffs(response.data || []);
//       }
//     } catch (error) {
//       console.error("Error fetching weekly offs:", error);
//       toast.error("Error loading weekly offs");
//     } finally {
//       setLoading(prev => ({ ...prev, weeklyOff: false }));
//     }
//   };
//   // Handler functions (same as before, shortened for brevity)
//   const handleManualAttendance = async (e) => {
//     e.preventDefault();
//     try {
//       setLoading(prev => ({ ...prev, manual: true }));
//       const submitData = { ...manualForm, shiftId: manualForm.shiftId || null };
//       const response = await adminService.manualAttendance(submitData);
//       if (response.success) {
//         toast.success("Attendance updated successfully");
//         setShowManualModal(false);
//         setManualForm({
//           userType: "agent",
//           userId: "",
//           agentId: "",
//           shiftId: "",
//           date: new Date().toISOString().split('T')[0],
//           status: "present",
//           checkInTime: "",
//           checkOutTime: "",
//           notes: ""
//         });
//         fetchAttendance();
//       } else {
//         toast.error(response.message || "Error updating attendance");
//       }
//     } catch (error) {
//       console.error("Error submitting manual attendance:", error);
//       toast.error("Error updating attendance");
//     } finally {
//       setLoading(prev => ({ ...prev, manual: false }));
//     }
//   };
//   const handleAssignLeave = async (e) => {
//     e.preventDefault();
//     try {
//       setLoading(prev => ({ ...prev, assign: true }));
//       const response = await adminService.assignLeave(leaveForm);
//       if (response.success) {
//         toast.success("Leave assigned successfully");
//         setShowLeaveModal(false);
//         fetchAttendance();
//       } else {
//         toast.error(response.message || "Error assigning leave");
//       }
//     } catch (error) {
//       console.error("Error assigning leave:", error);
//       toast.error("Error assigning leave");
//     } finally {
//       setLoading(prev => ({ ...prev, assign: false }));
//     }
//   };
//   const handleCreateHoliday = async (e) => {
//     e.preventDefault();
//     try {
//       setLoading(prev => ({ ...prev, holidays: true }));
//       const response = await attendanceService.createHoliday(holidayForm);
//       if (response.success) {
//         toast.success("Holiday created successfully");
//         setShowHolidayModal(false);
//         fetchHolidays();
//         fetchAttendance();
//       } else {
//         toast.error(response.message || "Error creating holiday");
//       }
//     } catch (error) {
//       console.error("Error creating holiday:", error);
//       toast.error("Error creating holiday");
//     } finally {
//       setLoading(prev => ({ ...prev, holidays: false }));
//     }
//   };
//   const handleCreateWeeklyOff = async (e) => {
//     e.preventDefault();
//     try {
//       setLoading(prev => ({ ...prev, weeklyOff: true }));
//       const response = await weeklyOffService.create(weeklyOffForm);
//       if (response.success) {
//         toast.success("Weekly off day added successfully");
//         setShowWeeklyOffModal(false);
//         fetchWeeklyOffs();
//       } else {
//         toast.error(response.message || "Error adding weekly off day");
//       }
//     } catch (error) {
//       console.error("Error creating weekly off:", error);
//       toast.error("Error creating weekly off");
//     } finally {
//       setLoading(prev => ({ ...prev, weeklyOff: false }));
//     }
//   };
//   const handleToggleWeeklyOff = async (id, isActive) => {
//     try {
//       const response = await weeklyOffService.updateStatus(id, isActive);
//       if (response.success) {
//         toast.success(`Weekly off ${isActive ? 'activated' : 'deactivated'}`);
//         fetchWeeklyOffs();
//       } else {
//         toast.error(response.message || "Error updating weekly off");
//       }
//     } catch (error) {
//       console.error("Error updating weekly off:", error);
//       toast.error("Error updating weekly off");
//     }
//   };
//   const handleDeleteWeeklyOff = async (id) => {
//     if (!confirm("Are you sure you want to delete this weekly off day?")) return;
//     try {
//       const response = await weeklyOffService.delete(id);
//       if (response.success) {
//         toast.success("Weekly off day deleted successfully");
//         fetchWeeklyOffs();
//       } else {
//         toast.error(response.message || "Error deleting weekly off");
//       }
//     } catch (error) {
//       console.error("Error deleting weekly off:", error);
//       toast.error("Error deleting weekly off");
//     }
//   };
//   const handleAutoAttendance = async (e) => {
//     e.preventDefault();
//     try {
//       setLoading(prev => ({ ...prev, auto: true }));
//       const response = await attendanceService.processAutoAttendance({ date: autoForm.date, userType: 'agent' });
//       if (response.success) {
//         toast.success(response.message || "Auto attendance processed successfully");
//         setShowAutoModal(false);
//         fetchAttendance();
//       } else {
//         toast.error(response.message || "Error processing auto attendance");
//       }
//     } catch (error) {
//       console.error("Error processing auto attendance:", error);
//       toast.error("Error processing auto attendance");
//     } finally {
//       setLoading(prev => ({ ...prev, auto: false }));
//     }
//   };
//   const handleDeleteHoliday = async (holidayId) => {
//     if (!confirm("Are you sure you want to delete this holiday?")) return;
//     try {
//       const response = await attendanceService.deleteHoliday(holidayId);
//       if (response.success) {
//         toast.success("Holiday deleted successfully");
//         fetchHolidays();
//         fetchAttendance();
//       } else {
//         toast.error(response.message || "Error deleting holiday");
//       }
//     } catch (error) {
//       console.error("Error deleting holiday:", error);
//       toast.error("Error deleting holiday");
//     }
//   };
//   const handleLeaveAction = async (requestId, status, comments = "") => {
//     try {
//       const response = await attendanceService.updateLeaveRequest(requestId, { status, comments });
//       if (response.success) {
//         toast.success(`Leave request ${status}`);
//         fetchLeaveRequests();
//         fetchAttendance();
//       } else {
//         toast.error(response.message || "Error processing request");
//       }
//     } catch (error) {
//       console.error("Error updating leave request:", error);
//       toast.error("Error processing request");
//     }
//   };
//   const handleEditAttendance = (attendance) => {
//     const formatDateOnly = (val) => {
//       if (!val) return '';
//       try {
//         return new Date(val).toISOString().split('T')[0];
//       } catch {
//         return '';
//       }
//     };
//     const formatTimeOnly = (val) => {
//       if (!val) return '';
//       try {
//         return new Date(val).toISOString().split('T')[1]?.substring(0, 5) || '';
//       } catch {
//         return '';
//       }
//     };
//     setEditingAttendance(attendance);
//     setManualForm({
//       userType: attendance.user ? "user" : "agent",
//       userId: attendance.user?._id || "",
//       agentId: attendance.agent?._id || "",
//       shiftId: attendance.shift?._id || "",
//       date: formatDateOnly(attendance.date) || formatDateOnly(attendance.checkInTime) || new Date().toISOString().split('T')[0],
//       status: attendance.status,
//       checkInTime: formatTimeOnly(attendance.checkInTime),
//       checkOutTime: formatTimeOnly(attendance.checkOutTime),
//       notes: attendance.notes || ""
//     });
//     setShowEditModal(true);
//   };
//   const handleUpdateAttendance = async (e) => {
//     e.preventDefault();
//     try {
//       setLoading(prev => ({ ...prev, edit: true }));
//       const updateData = {
//         ...manualForm,
//         attendanceId: editingAttendance._id
//       };
//       const response = await adminService.updateAttendance(updateData);
//       if (response.success) {
//         toast.success("Attendance updated successfully");
//         setShowEditModal(false);
//         fetchAttendance();
//       } else {
//         toast.error(response.message || "Error updating attendance");
//       }
//     } catch (error) {
//       console.error("Error updating attendance:", error);
//       toast.error("Error updating attendance");
//     } finally {
//       setLoading(prev => ({ ...prev, edit: false }));
//     }
//   };
//   const handleShiftAutoAttendance = async (e) => {
//     e.preventDefault();
//     try {
//       setLoading(prev => ({ ...prev, shiftAuto: true }));
//       const response = await attendanceService.processShiftAutoAttendance(shiftAutoForm.date, "agent");
//       if (response.success) {
//         toast.success(response.message || "Shift-based auto attendance processed successfully");
//         setShowShiftAutoModal(false);
//         fetchAttendance();
//       } else {
//         toast.error(response.message || "Error processing shift auto attendance");
//       }
//     } catch (error) {
//       console.error("Error processing shift auto attendance:", error);
//       toast.error("Error processing shift auto attendance");
//     } finally {
//       setLoading(prev => ({ ...prev, shiftAuto: false }));
//     }
//   };
//   const canEditAttendanceRecord = (attendance) => {
//     return !["holiday", "weekly_off"].includes(attendance.status);
//   };
//   const getStatusBadge = (status) => {
//     const statusConfig = {
//       present: "bg-green-100 text-green-700 border-green-200",
//       absent: "bg-red-100 text-red-700 border-red-200",
//       leave: "bg-yellow-100 text-yellow-700 border-yellow-200",
//       late: "bg-orange-100 text-orange-700 border-orange-200",
//       holiday: "bg-purple-100 text-purple-700 border-purple-200",
//       weekly_off: "bg-indigo-100 text-indigo-700 border-indigo-200",
//       approved_leave: "bg-blue-100 text-blue-700 border-blue-200",
//       pending_leave: "bg-gray-100 text-gray-700 border-gray-200"
//     };
//     return (
//       <Badge variant="outline" className={`${statusConfig[status] || "bg-gray-100 text-gray-700 border-gray-200"} text-xs px-2 py-1`}>
//         {status.replace('_', ' ')}
//       </Badge>
//     );
//   };
//   const getLeaveStatusBadge = (status) => {
//     const statusConfig = {
//       pending: "bg-yellow-100 text-yellow-700 border-yellow-200",
//       approved: "bg-green-100 text-green-700 border-green-200",
//       rejected: "bg-red-100 text-red-700 border-red-200"
//     };
//     return (
//       <Badge variant="outline" className={`${statusConfig[status] || "bg-gray-100 text-gray-700 border-gray-200"} text-xs px-2 py-1`}>
//         {status}
//       </Badge>
//     );
//   };
// // ✅ Custom Table Component for Responsive Design
// const ResponsiveTable = ({
//   data,
//   columns,
//   loading,
//   emptyMessage = "No data found",
//   className = ""
// }) => {
//   return (
//     <div className={`w-full overflow-x-auto ${className}`}>
//       <div className="min-w-full inline-block align-middle">
//         <div className="overflow-hidden border rounded-lg">
//           <Table>
//             <TableHeader>
//               <TableRow>
//                 {columns.map((column, index) => (
//                   <TableHead
//                     key={index}
//                     style={column.minWidth ? { minWidth: column.minWidth } : {}}
//                     className="whitespace-nowrap px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
//                   >
//                     {column.label}
//                   </TableHead>
//                 ))}
//               </TableRow>
//             </TableHeader>
//             <TableBody>
//               {loading ? (
//                 <TableRow>
//                   <TableCell colSpan={columns.length} className="text-center py-8">
//                     <Loader2 className="h-8 w-8 animate-spin mx-auto text-blue-600" />
//                     <p className="mt-2 text-muted-foreground">Loading data...</p>
//                   </TableCell>
//                 </TableRow>
//               ) : data.length === 0 ? (
//                 <TableRow>
//                   <TableCell colSpan={columns.length} className="text-center py-8">
//                     <div className="text-muted-foreground">{emptyMessage}</div>
//                   </TableCell>
//                 </TableRow>
//               ) : (
//                 data.map((item, index) => (
//                   <TableRow key={item._id || index} className="hover:bg-gray-50/50">
//                     {columns.map((column, colIndex) => (
//                       <TableCell
//                         key={colIndex}
//                         className={`px-4 py-3 text-sm ${column.cellClassName || ""}`}
//                         style={column.minWidth ? { minWidth: column.minWidth } : {}}
//                       >
//                         {column.render ? column.render(item) : item[column.key]}
//                       </TableCell>
//                     ))}
//                   </TableRow>
//                 ))
//               )}
//             </TableBody>
//           </Table>
//         </div>
//       </div>
//     </div>
//   );
// };
//   // ✅ Stats Cards Component
//   const StatsCards = () => (
//     <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
//       <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200 shadow-sm overflow-hidden">
//         <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 p-4">
//           <CardTitle className="text-sm font-medium text-blue-800">Total Records</CardTitle>
//           <Calendar className="h-4 w-4 text-blue-600" />
//         </CardHeader>
//         <CardContent className="p-4 pt-0">
//           <div className="text-2xl font-bold text-blue-700">{total}</div>
//         </CardContent>
//       </Card>
//       <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200 shadow-sm overflow-hidden">
//         <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 p-4">
//           <CardTitle className="text-sm font-medium text-green-800">Present Today</CardTitle>
//           <CheckCircle className="h-4 w-4 text-green-600" />
//         </CardHeader>
//         <CardContent className="p-4 pt-0">
//           <div className="text-2xl font-bold text-green-700">
//             {attendance.filter(a => a.status === 'present').length}
//           </div>
//         </CardContent>
//       </Card>
//       <Card className="bg-gradient-to-br from-red-50 to-red-100 border-red-200 shadow-sm overflow-hidden">
//         <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 p-4">
//           <CardTitle className="text-sm font-medium text-red-800">Absent Today</CardTitle>
//           <XCircle className="h-4 w-4 text-red-600" />
//         </CardHeader>
//         <CardContent className="p-4 pt-0">
//           <div className="text-2xl font-bold text-red-700">
//             {attendance.filter(a => a.status === 'absent').length}
//           </div>
//         </CardContent>
//       </Card>
//       <Card className="bg-gradient-to-br from-yellow-50 to-yellow-100 border-yellow-200 shadow-sm overflow-hidden">
//         <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 p-4">
//           <CardTitle className="text-sm font-medium text-yellow-800">On Leave/Off</CardTitle>
//           <Clock className="h-4 w-4 text-yellow-600" />
//         </CardHeader>
//         <CardContent className="p-4 pt-0">
//           <div className="text-2xl font-bold text-yellow-700">
//             {attendance.filter(a =>
//               a.status.includes('leave') ||
//               a.status === 'holiday' ||
//               a.status === 'weekly_off'
//             ).length}
//           </div>
//         </CardContent>
//       </Card>
//     </div>
//   );
//   const handleLeaveReasonChange = (e) => {
//     const value = e.target.value;
//     setLeaveForm(prev => ({
//       ...prev,
//       reason: value
//     }));
//   };
//   // ✅ Attendance Table Columns
//   const attendanceColumns = [
//     {
//       label: "Agent",
//       minWidth: "180px",
//       render: (a) => (
//         <div>
//           <div className="font-medium">
//             {a.user
//               ? `${a.user?.firstName || ""} ${a.user?.lastName || ""}`
//               : a.agent?.agentName || "—"}
//           </div>
//           <div className="text-xs text-muted-foreground">
//             {a.user ? "User" : "Agent"} • {a.user ? a.user.email : a.agent?.email || ""}
//           </div>
//         </div>
//       ),
//     },
//     {
//       label: "Shift",
//       minWidth: "120px",
//       render: (a) => a.shift?.name || "—"
//     },
//     {
//       label: "Check In",
//       minWidth: "100px",
//       render: (a) => (a.checkInTime ? new Date(a.checkInTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : "—")
//     },
//     {
//       label: "Check Out",
//       minWidth: "100px",
//       render: (a) => (a.checkOutTime ? new Date(a.checkOutTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : "—")
//     },
//     {
//       label: "Status",
//       minWidth: "100px",
//       render: (a) => getStatusBadge(a.status)
//     },
//     {
//       label: "Date",
//       minWidth: "120px",
//       render: (a) => new Date(a.createdAt).toLocaleDateString()
//     },
//     ...(canEditAttendance ? [{
//       label: "Actions",
//       minWidth: "100px",
//       render: (a) => (
//         <Button
//           variant="outline"
//           size="sm"
//           onClick={() => handleEditAttendance(a)}
//           disabled={!canEditAttendanceRecord(a)}
//           title={
//             !canEditAttendanceRecord(a)
//               ? "Cannot edit holiday/weekly off records"
//               : "Edit attendance"
//           }
//         >
//           <Edit className="h-4 w-4" />
//         </Button>
//       ),
//     }] : []),
//   ];
//   // ✅ Leave Requests Table Columns
//   const leaveColumns = [
//     {
//       label: "Agent",
//       minWidth: "200px",
//       render: (r) => (
//         <div>
//           <div className="font-medium">{r.user ? `${r.user?.firstName || ''} ${r.user?.lastName || ''}` : r.agent?.agentName || '—'}</div>
//           <div className="text-xs text-muted-foreground">{r.user ? r.user.email : r.agent?.email}</div>
//         </div>
//       )
//     },
//     {
//       label: "Leave Type",
//       minWidth: "100px",
//       render: (r) => <span className="capitalize">{r.leaveType}</span>
//     },
//     {
//       label: "Period",
//       minWidth: "150px",
//       render: (r) => (
//         <div>
//           <div className="text-sm">{new Date(r.startDate).toLocaleDateString()}</div>
//           <div className="text-xs text-muted-foreground">to</div>
//           <div className="text-sm">{new Date(r.endDate).toLocaleDateString()}</div>
//         </div>
//       )
//     },
//     {
//       label: "Reason",
//       minWidth: "150px",
//       render: (r) => (
//         <div className="max-w-[200px] truncate" title={r.reason}>
//           {r.reason}
//         </div>
//       )
//     },
//     {
//       label: "Status",
//       minWidth: "100px",
//       render: (r) => getLeaveStatusBadge(r.status)
//     },
//     ...(canApproveLeave ? [{
//       label: "Actions",
//       minWidth: "150px",
//       render: (r) => (
//         <div className="flex gap-2">
//           {r.status === 'pending' ? (
//             <>
//               <Button size="sm" onClick={() => handleLeaveAction(r._id, 'approved')}>
//                 Approve
//               </Button>
//               <Button size="sm" variant="destructive" onClick={() => handleLeaveAction(r._id, 'rejected')}>
//                 Reject
//               </Button>
//             </>
//           ) : (
//             <span className="text-sm text-muted-foreground italic">
//               {r.status === 'approved' ? 'Approved' :
//                 r.status === 'rejected' ? 'Rejected' : 'Processed'}
//             </span>
//           )}
//         </div>
//       )
//     }] : [{
//       label: "Status Info",
//       minWidth: "100px",
//       render: (r) => (
//         <span className="text-sm text-muted-foreground">
//           {r.status === 'pending' ? 'Pending' :
//             r.status === 'approved' ? 'Approved' :
//               r.status === 'rejected' ? 'Rejected' : r.status}
//         </span>
//       )
//     }]),
//   ];
//   // ✅ Holidays Table Columns
//   const holidayColumns = [
//     {
//       label: "Name",
//       minWidth: "150px",
//       render: (h) => <div className="font-medium">{h.name}</div>
//     },
//     {
//       label: "Date",
//       minWidth: "120px",
//       render: (h) => new Date(h.date).toLocaleDateString()
//     },
//     {
//       label: "Description",
//       minWidth: "200px",
//       render: (h) => (
//         <div className="max-w-[250px] truncate" title={h.description}>
//           {h.description || '—'}
//         </div>
//       )
//     },
//     {
//       label: "Recurring",
//       minWidth: "100px",
//       render: (h) => (
//         <Badge variant={h.isRecurring ? 'default' : 'secondary'}>
//           {h.isRecurring ? 'Yes' : 'No'}
//         </Badge>
//       )
//     },
//     ...(canDeleteHolidays ? [{
//       label: "Actions",
//       minWidth: "100px",
//       render: (h) => (
//         <Button variant="destructive" size="sm" onClick={() => handleDeleteHoliday(h._id)}>
//           <Trash2 className="h-4 w-4" />
//         </Button>
//       )
//     }] : []),
//   ];
//   // ✅ Weekly Offs Table Columns
//   const weeklyOffColumns = [
//     {
//       label: "Day",
//       minWidth: "120px",
//       render: (w) => <div className="font-medium capitalize">{w.day}</div>
//     },
//     {
//       label: "Name",
//       minWidth: "150px",
//       render: (w) => w.name
//     },
//     {
//       label: "Description",
//       minWidth: "200px",
//       render: (w) => (
//         <div className="max-w-[250px] truncate" title={w.description}>
//           {w.description || '—'}
//         </div>
//       )
//     },
//     {
//       label: "Status",
//       minWidth: "100px",
//       render: (w) => (
//         <Badge variant={w.isActive ? 'default' : 'secondary'}>
//           {w.isActive ? 'Active' : 'Inactive'}
//         </Badge>
//       )
//     },
//     ...((canEditWeeklyOff || canDeleteWeeklyOff) ? [{
//       label: "Actions",
//       minWidth: "150px",
//       render: (w) => (
//         <div className="flex gap-2">
//           {canEditWeeklyOff && (
//             <Button
//               variant={w.isActive ? "outline" : "default"}
//               size="sm"
//               onClick={() => handleToggleWeeklyOff(w._id, !w.isActive)}
//             >
//               {w.isActive ? <ToggleLeft className="h-4 w-4 mr-1" /> : <ToggleRight className="h-4 w-4 mr-1" />}
//               {w.isActive ? "Deactivate" : "Activate"}
//             </Button>
//           )}
//           {canDeleteWeeklyOff && (
//             <Button variant="destructive" size="sm" onClick={() => handleDeleteWeeklyOff(w._id)}>
//               <Trash2 className="h-4 w-4" />
//             </Button>
//           )}
//         </div>
//       )
//     }] : []),
//   ];
//   // ✅ Pagination Component
//   const CustomPagination = () => {
//     const totalPages = Math.ceil(total / limit);
//     return (
//       <Pagination className="mt-6">
//         <PaginationContent className="flex-wrap">
//           <PaginationItem>
//             <PaginationPrevious
//               onClick={() => page > 1 && setPage(page - 1)}
//               className={page === 1 ? "pointer-events-none opacity-50" : "cursor-pointer"}
//             />
//           </PaginationItem>
//           {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
//             let pageNum;
//             if (totalPages <= 5) {
//               pageNum = i + 1;
//             } else if (page <= 3) {
//               pageNum = i + 1;
//             } else if (page >= totalPages - 2) {
//               pageNum = totalPages - 4 + i;
//             } else {
//               pageNum = page - 2 + i;
//             }
//             return (
//               <PaginationItem key={pageNum}>
//                 <PaginationLink
//                   onClick={() => setPage(pageNum)}
//                   isActive={page === pageNum}
//                   className="cursor-pointer"
//                 >
//                   {pageNum}
//                 </PaginationLink>
//               </PaginationItem>
//             );
//           })}
//           <PaginationItem>
//             <PaginationNext
//               onClick={() => page < totalPages && setPage(page + 1)}
//               className={page === totalPages ? "pointer-events-none opacity-50" : "cursor-pointer"}
//             />
//           </PaginationItem>
//           <PaginationItem className="ml-4">
//             <div className="flex items-center gap-2">
//               <span className="text-sm text-muted-foreground">Rows per page:</span>
//               <Select value={limit.toString()} onValueChange={(value) => { setLimit(Number(value)); setPage(1); }}>
//                 <SelectTrigger className="h-8 w-16">
//                   <SelectValue />
//                 </SelectTrigger>
//                 <SelectContent>
//                   <SelectItem value="5">5</SelectItem>
//                   <SelectItem value="10">10</SelectItem>
//                   <SelectItem value="25">25</SelectItem>
//                   <SelectItem value="50">50</SelectItem>
//                 </SelectContent>
//               </Select>
//             </div>
//           </PaginationItem>
//           <PaginationItem className="ml-4">
//             <div className="text-sm text-muted-foreground">
//               Showing {((page - 1) * limit) + 1} to {Math.min(page * limit, total)} of {total} entries
//             </div>
//           </PaginationItem>
//         </PaginationContent>
//       </Pagination>
//     );
//   };
//   // Manual Attendance Modal
//   const ManualAttendanceModal = () => (
//     <CustomModal
//       isOpen={showManualModal}
//       onClose={() => setShowManualModal(false)}
//       title="Manual Attendance Entry"
//       description="Add or update attendance record manually"
//       size="md"
//       preventClose={loading.manual}
//     >
//       <form onSubmit={handleManualAttendance} className="space-y-4">
//         <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//           <div className="space-y-2">
//             <Label htmlFor="userType">User Type</Label>
//             <Select
//               value={manualForm.userType}
//               onValueChange={(value) => setManualForm({ ...manualForm, userType: value, userId: "", agentId: "" })}
//             >
//               <SelectTrigger className="w-full">
//                 <SelectValue placeholder="Agent" />
//               </SelectTrigger>
//               <SelectContent>
//                 <SelectItem value="agent">Agent</SelectItem>
//               </SelectContent>
//             </Select>
//           </div>
//           <div className="space-y-2">
//             <Label htmlFor="person">Select Agent</Label>
//             <Select
//               value={manualForm.agentId}
//               onValueChange={(value) => setManualForm({ ...manualForm, agentId: value })}
//               disabled={!agents || agents.length === 0}
//             >
//               <SelectTrigger className="w-full">
//                 <SelectValue placeholder={agents && agents.length ? 'Select Agent' : 'No agents available'} />
//               </SelectTrigger>
//               <SelectContent>
//                 {agents.map(person => (
//                   <SelectItem key={person._id || person.id} value={person._id || person.id}>
//                     {`${person.agentName || person.name} (${person.agentId || person.email})`}
//                   </SelectItem>
//                 ))}
//               </SelectContent>
//             </Select>
//           </div>
//         </div>
//         <div className="space-y-2">
//           <Label htmlFor="date">Date</Label>
//           <Input
//             type="date"
//             value={manualForm.date}
//             onChange={(e) => setManualForm({ ...manualForm, date: e.target.value })}
//             required
//             className="w-full"
//           />
//         </div>
//         <div className="space-y-2">
//           <Label htmlFor="status">Status</Label>
//           <Select
//             value={manualForm.status}
//             onValueChange={(value) => setManualForm({ ...manualForm, status: value })}
//           >
//             <SelectTrigger className="w-full">
//               <SelectValue placeholder="Select Status" />
//             </SelectTrigger>
//             <SelectContent>
//               <SelectItem value="present">Present</SelectItem>
//               <SelectItem value="absent">Absent</SelectItem>
//               <SelectItem value="leave">Leave</SelectItem>
//               <SelectItem value="late">Late</SelectItem>
//               <SelectItem value="holiday">Holiday</SelectItem>
//               <SelectItem value="weekly_off">Weekly Off</SelectItem>
//             </SelectContent>
//           </Select>
//         </div>
//         <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//           <div className="space-y-2">
//             <Label htmlFor="checkInTime">Check In Time</Label>
//             <Input
//               type="time"
//               value={manualForm.checkInTime}
//               onChange={(e) => setManualForm({ ...manualForm, checkInTime: e.target.value })}
//               className="w-full"
//             />
//           </div>
//           <div className="space-y-2">
//             <Label htmlFor="checkOutTime">Check Out Time</Label>
//             <Input
//               type="time"
//               value={manualForm.checkOutTime}
//               onChange={(e) => setManualForm({ ...manualForm, checkOutTime: e.target.value })}
//               className="w-full"
//             />
//           </div>
//         </div>
//         <div className="flex flex-col sm:flex-row gap-2 pt-4">
//           <Button
//             type="submit"
//             className="flex-1 w-full"
//             disabled={loading.manual || !manualForm.agentId || !manualForm.date || !manualForm.status}
//           >
//             {loading.manual && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
//             Save Attendance
//           </Button>
//           <Button
//             type="button"
//             variant="outline"
//             onClick={() => setShowManualModal(false)}
//             className="flex-1 w-full"
//             disabled={loading.manual}
//           >
//             Cancel
//           </Button>
//         </div>
//       </form>
//     </CustomModal>
//   );
//   // Leave Modal
//   const LeaveModal = () => (
//     <CustomModal
//       isOpen={showLeaveModal}
//       onClose={() => setShowLeaveModal(false)}
//       title="Assign Leave"
//       description="Assign leave to user or agent"
//       size="md"
//       preventClose={loading.assign}
//     >
//       <form onSubmit={handleAssignLeave} className="space-y-4">
//         <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//           <div className="space-y-2">
//             <Label htmlFor="userType">User Type</Label>
//             <Select
//               value={leaveForm.userType}
//               onValueChange={(value) => setLeaveForm({ ...leaveForm, userType: value, userId: "", agentId: "" })}
//             >
//               <SelectTrigger className="w-full">
//                 <SelectValue placeholder="Agent" />
//               </SelectTrigger>
//               <SelectContent>
//                 <SelectItem value="agent">Agent</SelectItem>
//               </SelectContent>
//             </Select>
//           </div>
//           <div className="space-y-2">
//             <Label htmlFor="person">Select Agent</Label>
//             <Select
//               value={leaveForm.agentId}
//               onValueChange={(value) => setLeaveForm({ ...leaveForm, agentId: value })}
//               disabled={!agents || agents.length === 0}
//             >
//               <SelectTrigger className="w-full">
//                 <SelectValue placeholder={agents && agents.length ? 'Select Agent' : 'No agents available'} />
//               </SelectTrigger>
//               <SelectContent>
//                 {agents.map(person => (
//                   <SelectItem key={person._id || person.id} value={person._id || person.id}>
//                     {`${person.agentName || person.name} (${person.agentId || person.email})`}
//                   </SelectItem>
//                 ))}
//               </SelectContent>
//             </Select>
//           </div>
//         </div>
//         <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//           <div className="space-y-2">
//             <Label htmlFor="startDate">Start Date</Label>
//             <Input
//               type="date"
//               value={leaveForm.startDate}
//               onChange={(e) => setLeaveForm({ ...leaveForm, startDate: e.target.value })}
//               required
//               className="w-full"
//             />
//           </div>
//           <div className="space-y-2">
//             <Label htmlFor="endDate">End Date</Label>
//             <Input
//               type="date"
//               value={leaveForm.endDate}
//               onChange={(e) => setLeaveForm({ ...leaveForm, endDate: e.target.value })}
//               required
//               className="w-full"
//             />
//           </div>
//         </div>
//         <div className="space-y-2">
//           <Label htmlFor="leaveType">Leave Type</Label>
//           <Select
//             value={leaveForm.leaveType}
//             onValueChange={(value) => setLeaveForm({ ...leaveForm, leaveType: value })}
//           >
//             <SelectTrigger className="w-full">
//               <SelectValue placeholder="Select Leave Type" />
//             </SelectTrigger>
//             <SelectContent>
//               <SelectItem value="sick">Sick Leave</SelectItem>
//               <SelectItem value="casual">Casual Leave</SelectItem>
//               <SelectItem value="emergency">Emergency Leave</SelectItem>
//               <SelectItem value="other">Other</SelectItem>
//             </SelectContent>
//           </Select>
//         </div>
//         <div className="space-y-2">
//           <Label htmlFor="reason">Reason</Label>
//           <Textarea
//             value={leaveForm.reason}
//             onChange={handleLeaveReasonChange}
//             placeholder="Reason for leave..."
//             rows={3}
//             required
//             className="w-full resize-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
//           />
//         </div>
//         <div className="flex flex-col sm:flex-row gap-2 pt-4">
//           <Button
//             type="submit"
//             className="flex-1 w-full"
//             disabled={loading.assign || !leaveForm.agentId || !leaveForm.startDate || !leaveForm.endDate || !leaveForm.leaveType || !leaveForm.reason}
//           >
//             {loading.assign && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
//             Assign Leave
//           </Button>
//           <Button
//             type="button"
//             variant="outline"
//             onClick={() => setShowLeaveModal(false)}
//             className="flex-1 w-full"
//             disabled={loading.assign}
//           >
//             Cancel
//           </Button>
//         </div>
//       </form>
//     </CustomModal>
//   );
//   // Holiday Modal
//   const HolidayModal = () => (
//     <CustomModal
//       isOpen={showHolidayModal}
//       onClose={() => setShowHolidayModal(false)}
//       title="Create Holiday"
//       description="Add a new holiday to the system. Recurring holidays will automatically repeat every year."
//       size="lg"
//       preventClose={loading.holidays}
//     >
//       <form onSubmit={handleCreateHoliday} className="space-y-4">
//         <div className="space-y-2">
//           <Label htmlFor="name">Holiday Name *</Label>
//           <Input
//             type="text"
//             value={holidayForm.name}
//             onChange={(e) => setHolidayForm({ ...holidayForm, name: e.target.value })}
//             placeholder="Enter holiday name"
//             required
//             className="w-full"
//           />
//         </div>
//         <div className="space-y-2">
//           <Label htmlFor="date">Date *</Label>
//           <Input
//             type="date"
//             value={holidayForm.date}
//             onChange={(e) => setHolidayForm({ ...holidayForm, date: e.target.value })}
//             required
//             className="w-full"
//           />
//         </div>
//         <div className="space-y-2">
//           <Label htmlFor="description">Description</Label>
//           <Textarea
//             value={holidayForm.description}
//             onChange={(e) => setHolidayForm({ ...holidayForm, description: e.target.value })}
//             placeholder="Holiday description..."
//             rows={3}
//             className="w-full"
//           />
//         </div>
//         <div className="flex items-center space-x-2">
//           <input
//             type="checkbox"
//             id="isRecurring"
//             checked={holidayForm.isRecurring}
//             onChange={(e) => setHolidayForm({ ...holidayForm, isRecurring: e.target.checked })}
//             className="rounded border-gray-300"
//           />
//           <Label htmlFor="isRecurring" className="text-sm">
//             Recurring Holiday (will repeat every year)
//           </Label>
//         </div>
//         <div className="flex flex-col sm:flex-row gap-2 pt-4">
//           <Button
//             type="submit"
//             className="flex-1 w-full"
//             disabled={loading.holidays || !holidayForm.name || !holidayForm.date}
//           >
//             {loading.holidays && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
//             Create Holiday
//           </Button>
//           <Button
//             type="button"
//             variant="outline"
//             onClick={() => setShowHolidayModal(false)}
//             className="flex-1 w-full"
//             disabled={loading.holidays}
//           >
//             Cancel
//           </Button>
//         </div>
//       </form>
//     </CustomModal>
//   );
//   // Weekly Off Modal
//   const WeeklyOffModal = () => (
//     <CustomModal
//       isOpen={showWeeklyOffModal}
//       onClose={() => setShowWeeklyOffModal(false)}
//       title="Add Weekly Off Day"
//       description="Set a weekly off day that will automatically mark as off every week"
//       size="md"
//       preventClose={loading.weeklyOff}
//     >
//       <form onSubmit={handleCreateWeeklyOff} className="space-y-4">
//         <div className="space-y-2">
//           <Label htmlFor="day">Day of Week</Label>
//           <Select
//             value={weeklyOffForm.day}
//             onValueChange={(value) => setWeeklyOffForm({
//               ...weeklyOffForm,
//               day: value,
//               name: value.charAt(0).toUpperCase() + value.slice(1) + " - Weekly Off"
//             })}
//           >
//             <SelectTrigger className="w-full">
//               <SelectValue placeholder="Select day" />
//             </SelectTrigger>
//             <SelectContent>
//               <SelectItem value="sunday">Sunday</SelectItem>
//               <SelectItem value="monday">Monday</SelectItem>
//               <SelectItem value="tuesday">Tuesday</SelectItem>
//               <SelectItem value="wednesday">Wednesday</SelectItem>
//               <SelectItem value="thursday">Thursday</SelectItem>
//               <SelectItem value="friday">Friday</SelectItem>
//               <SelectItem value="saturday">Saturday</SelectItem>
//             </SelectContent>
//           </Select>
//         </div>
//         <div className="space-y-2">
//           <Label htmlFor="name">Display Name</Label>
//           <Input
//             type="text"
//             value={weeklyOffForm.name}
//             onChange={(e) => setWeeklyOffForm({ ...weeklyOffForm, name: e.target.value })}
//             placeholder="e.g., Sunday, Weekly Off"
//             required
//             className="w-full"
//           />
//         </div>
//         <div className="space-y-2">
//           <Label htmlFor="description">Description</Label>
//           <Textarea
//             value={weeklyOffForm.description}
//             onChange={(e) => setWeeklyOffForm({ ...weeklyOffForm, description: e.target.value })}
//             placeholder="Description for this weekly off..."
//             rows={2}
//             className="w-full"
//           />
//         </div>
//         <div className="flex flex-col sm:flex-row gap-2 pt-4">
//           <Button
//             type="submit"
//             className="flex-1 w-full"
//             disabled={loading.weeklyOff || !weeklyOffForm.day || !weeklyOffForm.name}
//           >
//             {loading.weeklyOff && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
//             Add Weekly Off
//           </Button>
//           <Button
//             type="button"
//             variant="outline"
//             onClick={() => setShowWeeklyOffModal(false)}
//             className="flex-1 w-full"
//             disabled={loading.weeklyOff}
//           >
//             Cancel
//           </Button>
//         </div>
//       </form>
//     </CustomModal>
//   );
//   // Auto Attendance Modal
//   const AutoAttendanceModal = () => (
//     <CustomModal
//       isOpen={showAutoModal}
//       onClose={() => setShowAutoModal(false)}
//       title="Process Auto Attendance (Agents)"
//       description="Automatically mark absent for agents without attendance on the selected date. Holidays and weekly offs are respected."
//       size="md"
//       preventClose={loading.auto}
//     >
//       <form onSubmit={handleAutoAttendance} className="space-y-4">
//         <div className="space-y-2">
//           <Label htmlFor="date">Date</Label>
//           <Input
//             type="date"
//             value={autoForm.date}
//             onChange={(e) => setAutoForm({ ...autoForm, date: e.target.value })}
//             required
//             className="w-full"
//           />
//         </div>
//         <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
//           <h4 className="font-medium text-blue-800 mb-2">How Auto Attendance (Agents) Works:</h4>
//           <ul className="text-sm text-blue-700 space-y-1">
//             <li>• Agents without attendance will be marked as <strong>Absent</strong></li>
//             <li>• If date is a holiday, agents will be marked as <strong>Holiday</strong></li>
//             <li>• If date is weekly off, agents will be marked as <strong>Weekly Off</strong></li>
//             <li>• Existing attendance records will not be modified</li>
//           </ul>
//         </div>
//         <div className="flex flex-col sm:flex-row gap-2 pt-4">
//           <Button
//             type="submit"
//             className="flex-1 w-full"
//             disabled={loading.auto || !autoForm.date}
//           >
//             {loading.auto && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
//             Process Auto Attendance
//           </Button>
//           <Button
//             type="button"
//             variant="outline"
//             onClick={() => setShowAutoModal(false)}
//             className="flex-1 w-full"
//             disabled={loading.auto}
//           >
//             Cancel
//           </Button>
//         </div>
//       </form>
//     </CustomModal>
//   );
//   // Shift Auto Attendance Modal
//   const ShiftAutoAttendanceModal = () => (
//     <CustomModal
//       isOpen={showShiftAutoModal}
//       onClose={() => setShowShiftAutoModal(false)}
//       title="Process Shift-based Auto Attendance"
//       description="Mark absent for agents whose shifts have ended and no check-in recorded."
//       size="md"
//       preventClose={loading.shiftAuto}
//     >
//       <form onSubmit={handleShiftAutoAttendance} className="space-y-4">
//         <div className="space-y-2">
//           <Label htmlFor="date">Date</Label>
//           <Input
//             type="date"
//             value={shiftAutoForm.date}
//             onChange={(e) => setShiftAutoForm({ ...shiftAutoForm, date: e.target.value })}
//             required
//             className="w-full"
//           />
//         </div>
//         <div className="bg-green-50 p-4 rounded-lg border border-green-200">
//           <h4 className="font-medium text-green-800 mb-2">How Shift-based Auto Attendance Works:</h4>
//           <ul className="text-sm text-green-700 space-y-1">
//             <li>• Checks if agent has a shift assigned</li>
//             <li>• Verifies if shift end time has passed</li>
//             <li>• Marks as <strong>Absent</strong> only if shift ended and no check-in</li>
//             <li>• Respects holidays and weekly offs automatically</li>
//             <li>• Only processes agents</li>
//           </ul>
//         </div>
//         <div className="flex flex-col sm:flex-row gap-2 pt-4">
//           <Button type="submit" className="flex-1 w-full" disabled={loading.shiftAuto}>
//             {loading.shiftAuto && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
//             Process Shift Auto Attendance
//           </Button>
//           <Button
//             type="button"
//             variant="outline"
//             onClick={() => setShowShiftAutoModal(false)}
//             className="flex-1 w-full"
//             disabled={loading.shiftAuto}
//           >
//             Cancel
//           </Button>
//         </div>
//       </form>
//     </CustomModal>
//   );
//   // Edit Attendance Modal
//   const EditAttendanceModal = () => (
//     <CustomModal
//       isOpen={showEditModal}
//       onClose={() => setShowEditModal(false)}
//       title="Edit Attendance"
//       description={`Update attendance record for ${editingAttendance?.user ?
//         `${editingAttendance.user.firstName} ${editingAttendance.user.lastName}` :
//         editingAttendance?.agent?.agentName}`}
//       size="lg"
//       preventClose={loading.edit}
//     >
//       <form onSubmit={handleUpdateAttendance} className="space-y-4">
//         <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//           <div className="space-y-2">
//             <Label htmlFor="status">Status</Label>
//             <Select
//               value={manualForm.status}
//               onValueChange={(value) => setManualForm({ ...manualForm, status: value })}
//             >
//               <SelectTrigger className="w-full">
//                 <SelectValue placeholder="Select Status" />
//               </SelectTrigger>
//               <SelectContent>
//                 <SelectItem value="present">Present</SelectItem>
//                 <SelectItem value="absent">Absent</SelectItem>
//                 <SelectItem value="leave">Leave</SelectItem>
//                 <SelectItem value="late">Late</SelectItem>
//                 <SelectItem value="holiday">Holiday</SelectItem>
//                 <SelectItem value="half_day">Half Day</SelectItem>
//                 <SelectItem value="weekly_off">Weekly Off</SelectItem>
//                 <SelectItem value="approved_leave">Approved Leave</SelectItem>
//               </SelectContent>
//             </Select>
//           </div>
//           <div className="space-y-2">
//             <Label htmlFor="shift">Shift</Label>
//             <Select
//               value={manualForm.shiftId}
//               onValueChange={(value) => setManualForm({ ...manualForm, shiftId: value })}
//             >
//               <SelectTrigger className="w-full">
//                 <SelectValue placeholder="Select Shift" />
//               </SelectTrigger>
//               <SelectContent>
//                 {shifts.map(shift => (
//                   <SelectItem key={shift._id} value={shift._id}>
//                     {shift.name}
//                   </SelectItem>
//                 ))}
//               </SelectContent>
//             </Select>
//           </div>
//         </div>
//         <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//           <div className="space-y-2">
//             <Label htmlFor="checkInTime">Check In Time</Label>
//             <Input
//               type="time"
//               value={manualForm.checkInTime}
//               onChange={(e) => setManualForm({ ...manualForm, checkInTime: e.target.value })}
//               className="w-full"
//             />
//           </div>
//           <div className="space-y-2">
//             <Label htmlFor="checkOutTime">Check Out Time</Label>
//             <Input
//               type="time"
//               value={manualForm.checkOutTime}
//               onChange={(e) => setManualForm({ ...manualForm, checkOutTime: e.target.value })}
//               className="w-full"
//             />
//           </div>
//         </div>
//         <div className="flex flex-col sm:flex-row gap-2 pt-4">
//           <Button type="submit" className="flex-1 w-full" disabled={loading.edit}>
//             {loading.edit && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
//             Update Attendance
//           </Button>
//           <Button
//             type="button"
//             variant="outline"
//             onClick={() => setShowEditModal(false)}
//             className="flex-1 w-full"
//           >
//             Cancel
//           </Button>
//         </div>
//       </form>
//     </CustomModal>
//   );
//   return (
//     <div className="min-h-screen bg-gray-50/30">
//       <div className="container mx-auto px-3 sm:px-4 py-4 sm:py-6 space-y-6">
//         {/* All Modals */}
//         <ManualAttendanceModal />
//         <LeaveModal />
//         <HolidayModal />
//         <WeeklyOffModal />
//         <AutoAttendanceModal />
//         <ShiftAutoAttendanceModal />
//         <EditAttendanceModal />
//         {/* Header */}
//         <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 sm:gap-6">
//           <div className="text-center lg:text-left">
//             <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900 tracking-tight">
//               Admin Attendance Management
//             </h1>
//             <p className="text-gray-600 mt-1 sm:mt-2 text-sm sm:text-base">
//               Manage attendance records, leave requests, holidays, and weekly off days
//             </p>
//           </div>
//           <div className="flex flex-wrap items-center justify-center lg:justify-end gap-2 sm:gap-3">
//             {canCreateLeave && (
//               <Button
//                 onClick={() => setShowLeaveModal(true)}
//                 className="bg-green-600 hover:bg-green-700 text-white text-xs sm:text-sm w-auto min-w-[120px]"
//                 size="sm"
//               >
//                 <UserPlus className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
//                 Assign Leave
//               </Button>
//             )}
//             {canCreateAttendance && (
//               <Button
//                 onClick={() => setShowManualModal(true)}
//                 className="bg-blue-600 hover:bg-blue-700 text-white text-xs sm:text-sm w-auto min-w-[120px]"
//                 size="sm"
//               >
//                 <Edit className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
//                 Manual Entry
//               </Button>
//             )}
//             {canCreateAttendance && (
//               <Button
//                 onClick={() => setShowAutoModal(true)}
//                 variant="outline"
//                 className="border-blue-600 text-blue-600 hover:bg-blue-50 text-xs sm:text-sm w-auto min-w-[120px]"
//                 size="sm"
//               >
//                 <PlayCircle className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
//                 Auto Attendance
//               </Button>
//             )}
//             {canCreateAttendance && (
//               <Button
//                 onClick={() => setShowShiftAutoModal(true)}
//                 variant="outline"
//                 className="border-purple-600 text-purple-600 hover:bg-purple-50 text-xs sm:text-sm w-auto min-w-[120px]"
//                 size="sm"
//               >
//                 <Clock className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
//                 Shift Wise
//               </Button>
//             )}
//             <Button
//               onClick={() => fetchAttendance()}
//               variant="outline"
//               size="sm"
//               className="text-xs sm:text-sm w-auto min-w-[120px]"
//             >
//               <RefreshCw className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
//               Refresh
//             </Button>
//           </div>
//         </div>
//         {/* Stats Cards */}
//         <StatsCards />
//         {/* Tabs */}
//         <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
//           <TabsList className="grid grid-cols-2 md:grid-cols-4 gap-1 p-1 bg-muted/50 rounded-md w-full">
//             {canViewAttendance && (
//               <TabsTrigger
//                 value="attendance"
//                 className="flex items-center justify-center gap-2 px-3 py-2 text-sm"
//               >
//                 <Calendar className="h-4 w-4" />
//                 <span>Attendance</span>
//               </TabsTrigger>
//             )}
//             {canViewLeave && (
//               <TabsTrigger
//                 value="leave"
//                 className="flex items-center justify-center gap-2 px-3 py-2 text-sm relative"
//               >
//                 <FileText className="h-4 w-4" />
//                 <span>Leave</span>
//                 {leaveRequests.filter(r => r.status === "pending").length > 0 && (
//                   <Badge
//                     variant="destructive"
//                     className="absolute -top-1 -right-1 h-5 w-5 p-0 text-xs flex items-center justify-center"
//                   >
//                     {leaveRequests.filter(r => r.status === "pending").length}
//                   </Badge>
//                 )}
//               </TabsTrigger>
//             )}
//             {canViewHolidays && (
//               <TabsTrigger
//                 value="holidays"
//                 className="flex items-center justify-center gap-2 px-3 py-2 text-sm"
//               >
//                 <PartyPopper className="h-4 w-4" />
//                 <span>Holidays</span>
//               </TabsTrigger>
//             )}
//             {canViewWeeklyOff && (
//               <TabsTrigger
//                 value="weekly-off"
//                 className="flex items-center justify-center gap-2 px-3 py-2 text-sm"
//               >
//                 <CalendarDays className="h-4 w-4" />
//                 <span>Weekly Off</span>
//               </TabsTrigger>
//             )}
//           </TabsList>
//           {/* Attendance Tab */}
//           {canViewAttendance && (
//             <TabsContent value="attendance" className="space-y-4">
//               <Card className="shadow-sm overflow-hidden">
//                 <CardHeader className="p-4 sm:p-6">
//                   <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
//                     <div>
//                       <CardTitle className="text-lg sm:text-xl">Attendance Records</CardTitle>
//                       <CardDescription className="text-sm sm:text-base">
//                         View and manage all attendance records
//                       </CardDescription>
//                     </div>
//                     <div className="flex flex-col sm:flex-row gap-3">
//                       {/* Search */}
//                       <div className="relative w-full sm:w-64">
//                         <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
//                         <Input
//                           placeholder="Search by name..."
//                           value={searchQuery}
//                           onChange={(e) => setSearchQuery(e.target.value)}
//                           className="pl-10"
//                         />
//                       </div>
//                       {/* Filters */}
//                       <div className="flex gap-2">
//                         <Select
//                           value={filters.status}
//                           onValueChange={(value) => setFilters(prev => ({ ...prev, status: value }))}
//                         >
//                           <SelectTrigger className="w-full md:w-32">
//                             <SelectValue placeholder="Status" />
//                           </SelectTrigger>
//                           <SelectContent>
//                             <SelectItem value="all">All Status</SelectItem>
//                             <SelectItem value="present">Present</SelectItem>
//                             <SelectItem value="absent">Absent</SelectItem>
//                             <SelectItem value="leave">Leave</SelectItem>
//                             <SelectItem value="late">Late</SelectItem>
//                             <SelectItem value="holiday">Holiday</SelectItem>
//                             <SelectItem value="weekly_off">Weekly Off</SelectItem>
//                           </SelectContent>
//                         </Select>
//                         <Input
//                           type="date"
//                           value={filters.date || ''}
//                           onChange={(e) => setFilters(prev => ({ ...prev, date: e.target.value, month: "" }))}
//                           className="border rounded px-3 py-2 text-sm w-full md:w-40"
//                         />
//                         <input
//                           type="month"
//                           value={filters.month || ''}
//                           onChange={(e) => setFilters(prev => ({ ...prev, month: e.target.value, date: "" }))}
//                           className="border rounded px-3 py-2 text-sm w-full md:w-40"
//                         />
//                         {(filters.status !== 'all' || filters.date || filters.month || searchQuery) && (
//                           <Button
//                             variant="outline"
//                             size="sm"
//                             onClick={() => {
//                               setFilters({ userType: "all", status: "all", date: "", month: "" });
//                               setSearchQuery("");
//                             }}
//                             className="h-10"
//                           >
//                             <X className="h-4 w-4 mr-1" />
//                             Clear
//                           </Button>
//                         )}
//                       </div>
//                     </div>
//                   </div>
//                 </CardHeader>
//                 <CardContent className="p-4 sm:p-6 pt-0">
//                   <div className="rounded-md border overflow-hidden">
//                     <ResponsiveTable
//                       data={attendance}
//                       columns={attendanceColumns}
//                       loading={loading.attendance}
//                       emptyMessage="No attendance records found"
//                     />
//                   </div>
//                   <CustomPagination />
//                 </CardContent>
//               </Card>
//             </TabsContent>
//           )}
//           {/* Leave Tab */}
//           {canViewLeave && (
//             <TabsContent value="leave">
//               <Card className="shadow-sm overflow-hidden">
//                 <CardHeader className="p-4 sm:p-6">
//                   <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
//                     <div>
//                       <CardTitle className="text-lg sm:text-xl">Leave Requests</CardTitle>
//                       <CardDescription className="text-sm sm:text-base">
//                         Review and manage all leave requests
//                       </CardDescription>
//                     </div>
//                     <div className="text-sm text-muted-foreground">
//                       Pending: {leaveRequests.filter(r => r.status === "pending").length}
//                     </div>
//                   </div>
//                 </CardHeader>
//                 <CardContent className="p-4 sm:p-6 pt-0">
//                   <div className="rounded-md border overflow-hidden">
//                     <ResponsiveTable
//                       data={leaveRequests}
//                       columns={leaveColumns}
//                       loading={loading.leave}
//                       emptyMessage="No leave requests found"
//                     />
//                   </div>
//                 </CardContent>
//               </Card>
//             </TabsContent>
//           )}
//           {/* Holidays Tab */}
//           {canViewHolidays && (
//             <TabsContent value="holidays">
//               <Card className="shadow-sm overflow-hidden">
//                 <CardHeader className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 p-4 sm:p-6">
//                   <div>
//                     <CardTitle className="text-lg sm:text-xl">Holidays Management</CardTitle>
//                     <CardDescription className="text-sm sm:text-base">
//                       Manage system holidays
//                     </CardDescription>
//                   </div>
//                   {canCreateHolidays && (
//                     <Button onClick={() => setShowHolidayModal(true)} className="w-full sm:w-auto">
//                       <Plus className="h-4 w-4 mr-2" />
//                       Add Holiday
//                     </Button>
//                   )}
//                 </CardHeader>
//                 <CardContent className="p-4 sm:p-6 pt-0">
//                   {loading.holidays ? (
//                     <div className="flex justify-center items-center py-12">
//                       <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
//                       <span className="ml-2">Loading holidays...</span>
//                     </div>
//                   ) : holidays.length === 0 ? (
//                     <div className="text-center py-8 text-muted-foreground">
//                       <PartyPopper className="h-12 w-12 text-gray-300 mx-auto mb-4" />
//                       <h3 className="text-lg font-semibold text-gray-600 mb-2">No holidays found</h3>
//                       <p className="text-gray-500">Add your first holiday to get started</p>
//                     </div>
//                   ) : (
//                     <div className="rounded-md border overflow-hidden">
//                       <ResponsiveTable
//                         data={holidays}
//                         columns={holidayColumns}
//                         loading={false}
//                         emptyMessage="No holidays found"
//                       />
//                     </div>
//                   )}
//                 </CardContent>
//               </Card>
//             </TabsContent>
//           )}
//           {/* Weekly Off Tab */}
//           {canViewWeeklyOff && (
//             <TabsContent value="weekly-off">
//               <Card className="shadow-sm overflow-hidden">
//                 <CardHeader className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 p-4 sm:p-6">
//                   <div>
//                     <CardTitle className="text-lg sm:text-xl">Weekly Off Days</CardTitle>
//                     <CardDescription className="text-sm sm:text-base">
//                       Manage weekly off days
//                     </CardDescription>
//                   </div>
//                   {canCreateWeeklyOff && (
//                     <Button onClick={() => setShowWeeklyOffModal(true)} className="w-full sm:w-auto">
//                       <Plus className="h-4 w-4 mr-2" />
//                       Add Weekly Off
//                     </Button>
//                   )}
//                 </CardHeader>
//                 <CardContent className="p-4 sm:p-6 pt-0">
//                   {loading.weeklyOff ? (
//                     <div className="flex justify-center items-center py-12">
//                       <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
//                       <span className="ml-2">Loading weekly off days...</span>
//                     </div>
//                   ) : weeklyOffs.length === 0 ? (
//                     <div className="text-center py-8 text-muted-foreground">
//                       <CalendarDays className="h-12 w-12 text-gray-300 mx-auto mb-4" />
//                       <h3 className="text-lg font-semibold text-gray-600 mb-2">No weekly off days configured</h3>
//                       <p className="text-gray-500">Add Sunday, Friday, or other weekly off days</p>
//                     </div>
//                   ) : (
//                     <div className="rounded-md border overflow-hidden">
//                       <ResponsiveTable
//                         data={weeklyOffs}
//                         columns={weeklyOffColumns}
//                         loading={false}
//                         emptyMessage="No weekly off days found"
//                       />
//                     </div>
//                   )}
//                 </CardContent>
//               </Card>
//             </TabsContent>
//           )}
//         </Tabs>
//       </div>
//     </div>
//   );
// }










"use client";
import React, { useCallback, useEffect, useState } from "react";
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
import {
  Loader2, Calendar, Users, CheckCircle, XCircle, Clock, Plus, Trash2,
  PlayCircle, ToggleLeft, ToggleRight, Edit, ChevronLeft, ChevronRight,
  Download, X, RefreshCw, ChevronDown, UserPlus, FileText, PartyPopper,
  CalendarDays, Search, Menu, Filter, MoreVertical
} from "lucide-react";
import { toast } from "sonner";
import CustomModal from "@/components/ui/customModal";
import { useAuth } from "@/context/AuthContext";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export default function AdminAttendancePage() {
  const { hasPermission } = useAuth();
  
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
  const [limit, setLimit] = useState(10);
  const [total, setTotal] = useState(0);
  const [searchQuery, setSearchQuery] = useState("");
  const [filters, setFilters] = useState({
    userType: "all",
    status: "all",
    date: "",
    month: ""
  });
  const [activeTab, setActiveTab] = useState("attendance");
  const [showFilters, setShowFilters] = useState(false);

  // Permission checks
  const canViewAttendance = hasPermission('attendance', 'view');
  const canCreateAttendance = hasPermission('attendance', 'create');
  const canEditAttendance = hasPermission('attendance', 'edit');
  const canDeleteAttendance = hasPermission('attendance', 'delete');
  const canViewLeave = hasPermission('leaveRequest', 'view');
  const canCreateLeave = hasPermission('leaveRequest', 'create');
  const canApproveLeave = hasPermission('leaveRequest', 'approve');
  const canViewHolidays = hasPermission('holiday', 'view');
  const canCreateHolidays = hasPermission('holiday', 'create');
  const canEditHolidays = hasPermission('holiday', 'edit');
  const canDeleteHolidays = hasPermission('holiday', 'delete');
  const canViewWeeklyOff = hasPermission('weeklyOff', 'view');
  const canCreateWeeklyOff = hasPermission('weeklyOff', 'create');
  const canEditWeeklyOff = hasPermission('weeklyOff', 'edit');
  const canDeleteWeeklyOff = hasPermission('weeklyOff', 'delete');

  // Modal states
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
    userType: "agent"
  });

  // Fetch data
  useEffect(() => {
    fetchInitialData();
  }, []);

  useEffect(() => {
    if (activeTab === "attendance") {
      fetchAttendance();
    } else if (activeTab === "holidays") {
      fetchHolidays();
    } else if (activeTab === "leave") {
      fetchLeaveRequests();
    } else if (activeTab === "weekly-off") {
      fetchWeeklyOffs();
    }
  }, [activeTab, page, limit, filters, searchQuery]);

  const fetchInitialData = async () => {
    try {
      const usersResponse = await adminService.getUsersAndAgents("all");
      if (usersResponse.success) {
        setAgents(usersResponse.data.agents || []);
      }
      const shiftsResponse = await shiftService.getShiftsForDropdown();
      setShifts(shiftsResponse);
    } catch (error) {
      console.error("Error fetching initial data:", error);
      toast.error("Error loading data");
    }
  };

  const fetchAttendance = async () => {
    try {
      setLoading(prev => ({ ...prev, attendance: true }));
      const params = {
        page,
        limit,
        ...filters,
        search: searchQuery
      };
      if (filters.month) {
        const [year, month] = filters.month.split('-');
        params.month = month;
        params.year = year;
        params.date = "";
      } else if (filters.date) {
        params.date = filters.date;
      }
      if (filters.status === "all") {
        delete params.status;
      }
      const response = await adminService.getAllAttendance(params);
      if (response.success) {
        setAttendance(response.data || []);
        setTotal(response.meta?.total || response.data?.length || 0);
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

  // Handler functions
  const handleManualAttendance = async (e) => {
    e.preventDefault();
    try {
      setLoading(prev => ({ ...prev, manual: true }));
      const submitData = { ...manualForm, shiftId: manualForm.shiftId || null };
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

  const handleAssignLeave = async (e) => {
    e.preventDefault();
    try {
      setLoading(prev => ({ ...prev, assign: true }));
      const response = await adminService.assignLeave(leaveForm);
      if (response.success) {
        toast.success("Leave assigned successfully");
        setShowLeaveModal(false);
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

  const handleCreateHoliday = async (e) => {
    e.preventDefault();
    try {
      setLoading(prev => ({ ...prev, holidays: true }));
      const response = await attendanceService.createHoliday(holidayForm);
      if (response.success) {
        toast.success("Holiday created successfully");
        setShowHolidayModal(false);
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

  const handleCreateWeeklyOff = async (e) => {
    e.preventDefault();
    try {
      setLoading(prev => ({ ...prev, weeklyOff: true }));
      const response = await weeklyOffService.create(weeklyOffForm);
      if (response.success) {
        toast.success("Weekly off day added successfully");
        setShowWeeklyOffModal(false);
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

  const handleAutoAttendance = async (e) => {
    e.preventDefault();
    try {
      setLoading(prev => ({ ...prev, auto: true }));
      const response = await attendanceService.processAutoAttendance({ date: autoForm.date, userType: 'agent' });
      if (response.success) {
        toast.success(response.message || "Auto attendance processed successfully");
        setShowAutoModal(false);
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

  const handleEditAttendance = (attendance) => {
    const formatDateOnly = (val) => {
      if (!val) return '';
      try {
        return new Date(val).toISOString().split('T')[0];
      } catch {
        return '';
      }
    };

    const formatTimeOnly = (val) => {
      if (!val) return '';
      try {
        return new Date(val).toISOString().split('T')[1]?.substring(0, 5) || '';
      } catch {
        return '';
      }
    };

    setEditingAttendance(attendance);
    setManualForm({
      userType: attendance.user ? "user" : "agent",
      userId: attendance.user?._id || "",
      agentId: attendance.agent?._id || "",
      shiftId: attendance.shift?._id || "",
      date: formatDateOnly(attendance.date) || formatDateOnly(attendance.checkInTime) || new Date().toISOString().split('T')[0],
      status: attendance.status,
      checkInTime: formatTimeOnly(attendance.checkInTime),
      checkOutTime: formatTimeOnly(attendance.checkOutTime),
      notes: attendance.notes || ""
    });
    setShowEditModal(true);
  };

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

  const handleShiftAutoAttendance = async (e) => {
    e.preventDefault();
    try {
      setLoading(prev => ({ ...prev, shiftAuto: true }));
      const response = await attendanceService.processShiftAutoAttendance(shiftAutoForm.date, "agent");
      if (response.success) {
        toast.success(response.message || "Shift-based auto attendance processed successfully");
        setShowShiftAutoModal(false);
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

  const canEditAttendanceRecord = (attendance) => {
    return !["holiday", "weekly_off"].includes(attendance.status);
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

  // ✅ Custom Responsive Table Component
  const ResponsiveTable = ({
    data,
    columns,
    loading,
    emptyMessage = "No data found",
    className = ""
  }) => {
    const [isMobile, setIsMobile] = useState(false);

    useEffect(() => {
      const checkMobile = () => {
        setIsMobile(window.innerWidth < 768);
      };
      
      checkMobile();
      window.addEventListener('resize', checkMobile);
      
      return () => window.removeEventListener('resize', checkMobile);
    }, []);

    if (isMobile && activeTab === "attendance") {
      return (
        <div className="space-y-3">
          {loading ? (
            <div className="text-center py-8">
              <Loader2 className="h-8 w-8 animate-spin mx-auto text-blue-600" />
              <p className="mt-2 text-muted-foreground">Loading data...</p>
            </div>
          ) : data.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              {emptyMessage}
            </div>
          ) : (
            data.map((item) => (
              <Card key={item._id} className="overflow-hidden">
                <CardContent className="p-4">
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="font-medium">
                          {item.user
                            ? `${item.user?.firstName || ""} ${item.user?.lastName || ""}`
                            : item.agent?.agentName || "—"}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {item.shift?.name || "No shift"} • {new Date(item.createdAt).toLocaleDateString()}
                        </div>
                      </div>
                      {getStatusBadge(item.status)}
                    </div>
                    
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      <div>
                        <span className="text-muted-foreground">Check In:</span>
                        <div className="font-medium">
                          {item.checkInTime ? new Date(item.checkInTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : "—"}
                        </div>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Check Out:</span>
                        <div className="font-medium">
                          {item.checkOutTime ? new Date(item.checkOutTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : "—"}
                        </div>
                      </div>
                    </div>

                    {canEditAttendance && (
                      <div className="flex justify-end pt-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleEditAttendance(item)}
                          disabled={!canEditAttendanceRecord(item)}
                          className="text-xs"
                        >
                          <Edit className="h-3 w-3 mr-1" />
                          Edit
                        </Button>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      );
    }

    return (
      <div className={`w-full overflow-x-auto ${className}`}>
        <div className="min-w-[800px] md:min-w-0 inline-block align-middle">
          <div className="overflow-hidden border rounded-lg">
            <Table>
              <TableHeader>
                <TableRow>
                  {columns.map((column, index) => (
                    <TableHead
                      key={index}
                      style={column.minWidth ? { minWidth: column.minWidth } : {}}
                      className="whitespace-nowrap px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      {column.label}
                    </TableHead>
                  ))}
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={columns.length} className="text-center py-8">
                      <Loader2 className="h-8 w-8 animate-spin mx-auto text-blue-600" />
                      <p className="mt-2 text-muted-foreground">Loading data...</p>
                    </TableCell>
                  </TableRow>
                ) : data.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={columns.length} className="text-center py-8">
                      <div className="text-muted-foreground">{emptyMessage}</div>
                    </TableCell>
                  </TableRow>
                ) : (
                  data.map((item, index) => (
                    <TableRow key={item._id || index} className="hover:bg-gray-50/50">
                      {columns.map((column, colIndex) => (
                        <TableCell
                          key={colIndex}
                          className={`px-4 py-3 text-sm ${column.cellClassName || ""}`}
                          style={column.minWidth ? { minWidth: column.minWidth } : {}}
                        >
                          {column.render ? column.render(item) : item[column.key]}
                        </TableCell>
                      ))}
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </div>
      </div>
    );
  };

  // ✅ Stats Cards Component
  const StatsCards = () => {
    const [isMobile, setIsMobile] = useState(false);

    useEffect(() => {
      const checkMobile = () => {
        setIsMobile(window.innerWidth < 640);
      };
      
      checkMobile();
      window.addEventListener('resize', checkMobile);
      
      return () => window.removeEventListener('resize', checkMobile);
    }, []);

    if (isMobile) {
      return (
        <div className="space-y-3 mb-6">
          <div className="grid grid-cols-2 gap-3">
            <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
              <CardHeader className="p-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-xs font-medium text-blue-800">Total</CardTitle>
                  <Calendar className="h-3 w-3 text-blue-600" />
                </div>
              </CardHeader>
              <CardContent className="p-3 pt-0">
                <div className="text-lg font-bold text-blue-700">{total}</div>
              </CardContent>
            </Card>
            
            <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200">
              <CardHeader className="p-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-xs font-medium text-green-800">Present</CardTitle>
                  <CheckCircle className="h-3 w-3 text-green-600" />
                </div>
              </CardHeader>
              <CardContent className="p-3 pt-0">
                <div className="text-lg font-bold text-green-700">
                  {attendance.filter(a => a.status === 'present').length}
                </div>
              </CardContent>
            </Card>
          </div>
          
          <div className="grid grid-cols-2 gap-3">
            <Card className="bg-gradient-to-br from-red-50 to-red-100 border-red-200">
              <CardHeader className="p-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-xs font-medium text-red-800">Absent</CardTitle>
                  <XCircle className="h-3 w-3 text-red-600" />
                </div>
              </CardHeader>
              <CardContent className="p-3 pt-0">
                <div className="text-lg font-bold text-red-700">
                  {attendance.filter(a => a.status === 'absent').length}
                </div>
              </CardContent>
            </Card>
            
            <Card className="bg-gradient-to-br from-yellow-50 to-yellow-100 border-yellow-200">
              <CardHeader className="p-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-xs font-medium text-yellow-800">Leave/Off</CardTitle>
                  <Clock className="h-3 w-3 text-yellow-600" />
                </div>
              </CardHeader>
              <CardContent className="p-3 pt-0">
                <div className="text-lg font-bold text-yellow-700">
                  {attendance.filter(a =>
                    a.status.includes('leave') ||
                    a.status === 'holiday' ||
                    a.status === 'weekly_off'
                  ).length}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      );
    }

    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
        <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200 shadow-sm overflow-hidden">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 p-4">
            <CardTitle className="text-sm font-medium text-blue-800">Total Records</CardTitle>
            <Calendar className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent className="p-4 pt-0">
            <div className="text-2xl font-bold text-blue-700">{total}</div>
          </CardContent>
        </Card>
        
        <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200 shadow-sm overflow-hidden">
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
        
        <Card className="bg-gradient-to-br from-red-50 to-red-100 border-red-200 shadow-sm overflow-hidden">
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
        
        <Card className="bg-gradient-to-br from-yellow-50 to-yellow-100 border-yellow-200 shadow-sm overflow-hidden">
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
  };

  const handleLeaveReasonChange = (e) => {
    const value = e.target.value;
    setLeaveForm(prev => ({
      ...prev,
      reason: value
    }));
  };

  // ✅ Attendance Table Columns (Desktop)
  const attendanceColumns = [
    {
      label: "Agent",
      minWidth: "180px",
      render: (a) => (
        <div>
          <div className="font-medium">
            {a.user
              ? `${a.user?.firstName || ""} ${a.user?.lastName || ""}`
              : a.agent?.agentName || "—"}
          </div>
          <div className="text-xs text-muted-foreground">
            {a.user ? "User" : "Agent"} • {a.user ? a.user.agentId : a.agent?.email || ""}
          </div>
        </div>
      ),
    },
    {
      label: "Shift",
      minWidth: "120px",
      render: (a) => a.shift?.name || "—"
    },
    {
      label: "Check In",
      minWidth: "100px",
      render: (a) => (a.checkInTime ? new Date(a.checkInTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : "—")
    },
    {
      label: "Check Out",
      minWidth: "100px",
      render: (a) => (a.checkOutTime ? new Date(a.checkOutTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : "—")
    },
    {
      label: "Status",
      minWidth: "100px",
      render: (a) => getStatusBadge(a.status)
    },
    {
      label: "Date",
      minWidth: "120px",
      render: (a) => new Date(a.createdAt).toLocaleDateString()
    },
    ...(canEditAttendance ? [{
      label: "Actions",
      minWidth: "100px",
      render: (a) => (
        <Button
          variant="outline"
          size="sm"
          onClick={() => handleEditAttendance(a)}
          disabled={!canEditAttendanceRecord(a)}
          title={
            !canEditAttendanceRecord(a)
              ? "Cannot edit holiday/weekly off records"
              : "Edit attendance"
          }
        >
          <Edit className="h-4 w-4" />
        </Button>
      ),
    }] : []),
  ];

  // ✅ Leave Requests Table Columns
  const leaveColumns = [
    {
      label: "Agent",
      minWidth: "200px",
      render: (r) => (
        <div>
          <div className="font-medium">{r.user ? `${r.user?.firstName || ''} ${r.user?.lastName || ''}` : r.agent?.agentName || '—'}</div>
          <div className="text-xs text-muted-foreground">{r.user ? r.user.email : r.agent?.email}</div>
        </div>
      )
    },
    {
      label: "Leave Type",
      minWidth: "100px",
      render: (r) => <span className="capitalize">{r.leaveType}</span>
    },
    {
      label: "Period",
      minWidth: "150px",
      render: (r) => (
        <div>
          <div className="text-sm">{new Date(r.startDate).toLocaleDateString()}</div>
          <div className="text-xs text-muted-foreground">to</div>
          <div className="text-sm">{new Date(r.endDate).toLocaleDateString()}</div>
        </div>
      )
    },
    {
      label: "Reason",
      minWidth: "150px",
      render: (r) => (
        <div className="max-w-[200px] truncate" title={r.reason}>
          {r.reason}
        </div>
      )
    },
    {
      label: "Status",
      minWidth: "100px",
      render: (r) => getLeaveStatusBadge(r.status)
    },
    ...(canApproveLeave ? [{
      label: "Actions",
      minWidth: "150px",
      render: (r) => (
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
              {r.status === 'approved' ? 'Approved' :
                r.status === 'rejected' ? 'Rejected' : 'Processed'}
            </span>
          )}
        </div>
      )
    }] : [{
      label: "Status Info",
      minWidth: "100px",
      render: (r) => (
        <span className="text-sm text-muted-foreground">
          {r.status === 'pending' ? 'Pending' :
            r.status === 'approved' ? 'Approved' :
              r.status === 'rejected' ? 'Rejected' : r.status}
        </span>
      )
    }]),
  ];

  // ✅ Holidays Table Columns
  const holidayColumns = [
    {
      label: "Name",
      minWidth: "150px",
      render: (h) => <div className="font-medium">{h.name}</div>
    },
    {
      label: "Date",
      minWidth: "120px",
      render: (h) => new Date(h.date).toLocaleDateString()
    },
    {
      label: "Description",
      minWidth: "200px",
      render: (h) => (
        <div className="max-w-[250px] truncate" title={h.description}>
          {h.description || '—'}
        </div>
      )
    },
    {
      label: "Recurring",
      minWidth: "100px",
      render: (h) => (
        <Badge variant={h.isRecurring ? 'default' : 'secondary'}>
          {h.isRecurring ? 'Yes' : 'No'}
        </Badge>
      )
    },
    ...(canDeleteHolidays ? [{
      label: "Actions",
      minWidth: "100px",
      render: (h) => (
        <Button variant="destructive" size="sm" onClick={() => handleDeleteHoliday(h._id)}>
          <Trash2 className="h-4 w-4" />
        </Button>
      )
    }] : []),
  ];

  // ✅ Weekly Offs Table Columns
  const weeklyOffColumns = [
    {
      label: "Day",
      minWidth: "120px",
      render: (w) => <div className="font-medium capitalize">{w.day}</div>
    },
    {
      label: "Name",
      minWidth: "150px",
      render: (w) => w.name
    },
    {
      label: "Description",
      minWidth: "200px",
      render: (w) => (
        <div className="max-w-[250px] truncate" title={w.description}>
          {w.description || '—'}
        </div>
      )
    },
    {
      label: "Status",
      minWidth: "100px",
      render: (w) => (
        <Badge variant={w.isActive ? 'default' : 'secondary'}>
          {w.isActive ? 'Active' : 'Inactive'}
        </Badge>
      )
    },
    ...((canEditWeeklyOff || canDeleteWeeklyOff) ? [{
      label: "Actions",
      minWidth: "150px",
      render: (w) => (
        <div className="flex gap-2">
          {canEditWeeklyOff && (
            <Button
              variant={w.isActive ? "outline" : "default"}
              size="sm"
              onClick={() => handleToggleWeeklyOff(w._id, !w.isActive)}
            >
              {w.isActive ? <ToggleLeft className="h-4 w-4 mr-1" /> : <ToggleRight className="h-4 w-4 mr-1" />}
              {w.isActive ? "Deactivate" : "Activate"}
            </Button>
          )}
          {canDeleteWeeklyOff && (
            <Button variant="destructive" size="sm" onClick={() => handleDeleteWeeklyOff(w._id)}>
              <Trash2 className="h-4 w-4" />
            </Button>
          )}
        </div>
      )
    }] : []),
  ];

  // ✅ Pagination Component
  const CustomPagination = () => {
    const totalPages = Math.ceil(total / limit);
    
    if (totalPages <= 1) return null;

    return (
      <Pagination className="mt-6">
        <PaginationContent className="flex-wrap">
          <PaginationItem>
            <PaginationPrevious
              onClick={() => page > 1 && setPage(page - 1)}
              className={page === 1 ? "pointer-events-none opacity-50" : "cursor-pointer"}
            />
          </PaginationItem>
          
          {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
            let pageNum;
            if (totalPages <= 5) {
              pageNum = i + 1;
            } else if (page <= 3) {
              pageNum = i + 1;
            } else if (page >= totalPages - 2) {
              pageNum = totalPages - 4 + i;
            } else {
              pageNum = page - 2 + i;
            }
            return (
              <PaginationItem key={pageNum}>
                <PaginationLink
                  onClick={() => setPage(pageNum)}
                  isActive={page === pageNum}
                  className="cursor-pointer"
                >
                  {pageNum}
                </PaginationLink>
              </PaginationItem>
            );
          })}
          
          <PaginationItem>
            <PaginationNext
              onClick={() => page < totalPages && setPage(page + 1)}
              className={page === totalPages ? "pointer-events-none opacity-50" : "cursor-pointer"}
            />
          </PaginationItem>
          
          <PaginationItem className="ml-2 sm:ml-4">
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground hidden sm:inline">Rows:</span>
              <Select value={limit.toString()} onValueChange={(value) => { setLimit(Number(value)); setPage(1); }}>
                <SelectTrigger className="h-8 w-16">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="5">5</SelectItem>
                  <SelectItem value="10">10</SelectItem>
                  <SelectItem value="25">25</SelectItem>
                  <SelectItem value="50">50</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </PaginationItem>
          
          <PaginationItem className="ml-2 sm:ml-4">
            <div className="text-sm text-muted-foreground hidden md:inline">
              Showing {((page - 1) * limit) + 1} to {Math.min(page * limit, total)} of {total}
            </div>
            <div className="text-sm text-muted-foreground md:hidden">
              {page}/{totalPages}
            </div>
          </PaginationItem>
        </PaginationContent>
      </Pagination>
    );
  };

  // Mobile Header Actions Dropdown
  const MobileHeaderActions = () => (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm" className="md:hidden">
          <Menu className="h-4 w-4" />
          <span className="ml-2">Actions</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48">
        {canCreateLeave && (
          <DropdownMenuItem onClick={() => setShowLeaveModal(true)}>
            <UserPlus className="h-4 w-4 mr-2" />
            Assign Leave
          </DropdownMenuItem>
        )}
        {canCreateAttendance && (
          <DropdownMenuItem onClick={() => setShowManualModal(true)}>
            <Edit className="h-4 w-4 mr-2" />
            Manual Entry
          </DropdownMenuItem>
        )}
        {canCreateAttendance && (
          <DropdownMenuItem onClick={() => setShowAutoModal(true)}>
            <PlayCircle className="h-4 w-4 mr-2" />
            Auto Attendance
          </DropdownMenuItem>
        )}
        {canCreateAttendance && (
          <DropdownMenuItem onClick={() => setShowShiftAutoModal(true)}>
            <Clock className="h-4 w-4 mr-2" />
            Shift Wise
          </DropdownMenuItem>
        )}
        <DropdownMenuItem onClick={() => fetchAttendance()}>
          <RefreshCw className="h-4 w-4 mr-2" />
          Refresh
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );

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
              <SelectTrigger className="w-full">
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
              <SelectTrigger className="w-full">
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
            className="w-full"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="status">Status</Label>
          <Select
            value={manualForm.status}
            onValueChange={(value) => setManualForm({ ...manualForm, status: value })}
          >
            <SelectTrigger className="w-full">
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
              className="w-full"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="checkOutTime">Check Out Time</Label>
            <Input
              type="time"
              value={manualForm.checkOutTime}
              onChange={(e) => setManualForm({ ...manualForm, checkOutTime: e.target.value })}
              className="w-full"
            />
          </div>
        </div>
        <div className="flex flex-col sm:flex-row gap-2 pt-4">
          <Button
            type="submit"
            className="flex-1 w-full"
            disabled={loading.manual || !manualForm.agentId || !manualForm.date || !manualForm.status}
          >
            {loading.manual && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Save Attendance
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={() => setShowManualModal(false)}
            className="flex-1 w-full"
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
              <SelectTrigger className="w-full">
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
              <SelectTrigger className="w-full">
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
              className="w-full"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="endDate">End Date</Label>
            <Input
              type="date"
              value={leaveForm.endDate}
              onChange={(e) => setLeaveForm({ ...leaveForm, endDate: e.target.value })}
              required
              className="w-full"
            />
          </div>
        </div>
        <div className="space-y-2">
          <Label htmlFor="leaveType">Leave Type</Label>
          <Select
            value={leaveForm.leaveType}
            onValueChange={(value) => setLeaveForm({ ...leaveForm, leaveType: value })}
          >
            <SelectTrigger className="w-full">
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
            onChange={handleLeaveReasonChange}
            placeholder="Reason for leave..."
            rows={3}
            required
            className="w-full resize-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
        <div className="flex flex-col sm:flex-row gap-2 pt-4">
          <Button
            type="submit"
            className="flex-1 w-full"
            disabled={loading.assign || !leaveForm.agentId || !leaveForm.startDate || !leaveForm.endDate || !leaveForm.leaveType || !leaveForm.reason}
          >
            {loading.assign && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Assign Leave
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={() => setShowLeaveModal(false)}
            className="flex-1 w-full"
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
            className="w-full"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="date">Date *</Label>
          <Input
            type="date"
            value={holidayForm.date}
            onChange={(e) => setHolidayForm({ ...holidayForm, date: e.target.value })}
            required
            className="w-full"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="description">Description</Label>
          <Textarea
            value={holidayForm.description}
            onChange={(e) => setHolidayForm({ ...holidayForm, description: e.target.value })}
            placeholder="Holiday description..."
            rows={3}
            className="w-full"
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
            className="flex-1 w-full"
            disabled={loading.holidays || !holidayForm.name || !holidayForm.date}
          >
            {loading.holidays && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Create Holiday
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={() => setShowHolidayModal(false)}
            className="flex-1 w-full"
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
            <SelectTrigger className="w-full">
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
            className="w-full"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="description">Description</Label>
          <Textarea
            value={weeklyOffForm.description}
            onChange={(e) => setWeeklyOffForm({ ...weeklyOffForm, description: e.target.value })}
            placeholder="Description for this weekly off..."
            rows={2}
            className="w-full"
          />
        </div>
        <div className="flex flex-col sm:flex-row gap-2 pt-4">
          <Button
            type="submit"
            className="flex-1 w-full"
            disabled={loading.weeklyOff || !weeklyOffForm.day || !weeklyOffForm.name}
          >
            {loading.weeklyOff && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Add Weekly Off
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={() => setShowWeeklyOffModal(false)}
            className="flex-1 w-full"
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
      title="Process Auto Attendance (Agents)"
      description="Automatically mark absent for agents without attendance on the selected date. Holidays and weekly offs are respected."
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
            className="w-full"
          />
        </div>
        <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
          <h4 className="font-medium text-blue-800 mb-2">How Auto Attendance (Agents) Works:</h4>
          <ul className="text-sm text-blue-700 space-y-1">
            <li>• Agents without attendance will be marked as <strong>Absent</strong></li>
            <li>• If date is a holiday, agents will be marked as <strong>Holiday</strong></li>
            <li>• If date is weekly off, agents will be marked as <strong>Weekly Off</strong></li>
            <li>• Existing attendance records will not be modified</li>
          </ul>
        </div>
        <div className="flex flex-col sm:flex-row gap-2 pt-4">
          <Button
            type="submit"
            className="flex-1 w-full"
            disabled={loading.auto || !autoForm.date}
          >
            {loading.auto && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Process Auto Attendance
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={() => setShowAutoModal(false)}
            className="flex-1 w-full"
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
      description="Mark absent for agents whose shifts have ended and no check-in recorded."
      size="md"
      preventClose={loading.shiftAuto}
    >
      <form onSubmit={handleShiftAutoAttendance} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="date">Date</Label>
          <Input
            type="date"
            value={shiftAutoForm.date}
            onChange={(e) => setShiftAutoForm({ ...shiftAutoForm, date: e.target.value })}
            required
            className="w-full"
          />
        </div>
        <div className="bg-green-50 p-4 rounded-lg border border-green-200">
          <h4 className="font-medium text-green-800 mb-2">How Shift-based Auto Attendance Works:</h4>
          <ul className="text-sm text-green-700 space-y-1">
            <li>• Checks if agent has a shift assigned</li>
            <li>• Verifies if shift end time has passed</li>
            <li>• Marks as <strong>Absent</strong> only if shift ended and no check-in</li>
            <li>• Respects holidays and weekly offs automatically</li>
            <li>• Only processes agents</li>
          </ul>
        </div>
        <div className="flex flex-col sm:flex-row gap-2 pt-4">
          <Button type="submit" className="flex-1 w-full" disabled={loading.shiftAuto}>
            {loading.shiftAuto && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Process Shift Auto Attendance
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={() => setShowShiftAutoModal(false)}
            className="flex-1 w-full"
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
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="status">Status</Label>
            <Select
              value={manualForm.status}
              onValueChange={(value) => setManualForm({ ...manualForm, status: value })}
            >
              <SelectTrigger className="w-full">
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
                <SelectItem value="approved_leave">Approved Leave</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="shift">Shift</Label>
            <Select
              value={manualForm.shiftId}
              onValueChange={(value) => setManualForm({ ...manualForm, shiftId: value })}
            >
              <SelectTrigger className="w-full">
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
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="checkInTime">Check In Time</Label>
            <Input
              type="time"
              value={manualForm.checkInTime}
              onChange={(e) => setManualForm({ ...manualForm, checkInTime: e.target.value })}
              className="w-full"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="checkOutTime">Check Out Time</Label>
            <Input
              type="time"
              value={manualForm.checkOutTime}
              onChange={(e) => setManualForm({ ...manualForm, checkOutTime: e.target.value })}
              className="w-full"
            />
          </div>
        </div>
        <div className="flex flex-col sm:flex-row gap-2 pt-4">
          <Button type="submit" className="flex-1 w-full" disabled={loading.edit}>
            {loading.edit && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Update Attendance
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={() => setShowEditModal(false)}
            className="flex-1 w-full"
          >
            Cancel
          </Button>
        </div>
      </form>
    </CustomModal>
  );

  // Main Render
  return (
    <div className="min-h-screen bg-gray-50/30 overflow-x-hidden">
      <div className="container mx-auto px-3 sm:px-4 py-4 sm:py-6 space-y-6">
        {/* All Modals */}
        <ManualAttendanceModal />
        <LeaveModal />
        <HolidayModal />
        <WeeklyOffModal />
        <AutoAttendanceModal />
        <ShiftAutoAttendanceModal />
        <EditAttendanceModal />
        
        {/* Header - Fully Responsive */}
        <div className="flex flex-col gap-4 sm:gap-6">
          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
            <div className="text-center sm:text-left">
              <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900 tracking-tight">
                Admin Attendance
              </h1>
              <p className="text-gray-600 mt-1 sm:mt-2 text-sm sm:text-base">
                Manage attendance records, leave requests, and holidays
              </p>
            </div>
            
            {/* Mobile Actions Dropdown */}
            <div className="block md:hidden self-center">
              <MobileHeaderActions />
            </div>
            
            {/* Desktop Actions Buttons */}
            <div className="hidden md:flex flex-wrap items-center justify-end gap-2 sm:gap-3">
              {canCreateLeave && (
                <Button
                  onClick={() => setShowLeaveModal(true)}
                  className="bg-green-600 hover:bg-green-700 text-white text-sm"
                  size="sm"
                >
                  <UserPlus className="h-4 w-4 mr-2" />
                  Assign Leave
                </Button>
              )}
              {canCreateAttendance && (
                <Button
                  onClick={() => setShowManualModal(true)}
                  className="bg-blue-600 hover:bg-blue-700 text-white text-sm"
                  size="sm"
                >
                  <Edit className="h-4 w-4 mr-2" />
                  Manual Entry
                </Button>
              )}
              {canCreateAttendance && (
                <Button
                  onClick={() => setShowAutoModal(true)}
                  variant="outline"
                  className="border-blue-600 text-blue-600 hover:bg-blue-50 text-sm"
                  size="sm"
                >
                  <PlayCircle className="h-4 w-4 mr-2" />
                  Auto
                </Button>
              )}
              {canCreateAttendance && (
                <Button
                  onClick={() => setShowShiftAutoModal(true)}
                  variant="outline"
                  className="border-purple-600 text-purple-600 hover:bg-purple-50 text-sm"
                  size="sm"
                >
                  <Clock className="h-4 w-4 mr-2" />
                  Shift Wise
                </Button>
              )}
              <Button
                onClick={() => fetchAttendance()}
                variant="outline"
                size="sm"
                className="text-sm"
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                Refresh
              </Button>
            </div>
          </div>
          
          {/* Stats Cards */}
          <StatsCards />
        </div>

        {/* Tabs - Responsive */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid grid-cols-2 sm:grid-cols-4 gap-1 p-1 bg-muted/50 rounded-md w-full">
            {canViewAttendance && (
              <TabsTrigger
                value="attendance"
                className="flex items-center justify-center gap-1 sm:gap-2 px-2 sm:px-3 py-2 text-xs sm:text-sm"
              >
                <Calendar className="h-3 w-3 sm:h-4 sm:w-4" />
                <span>Attendance</span>
              </TabsTrigger>
            )}
            {canViewLeave && (
              <TabsTrigger
                value="leave"
                className="flex items-center justify-center gap-1 sm:gap-2 px-2 sm:px-3 py-2 text-xs sm:text-sm relative"
              >
                <FileText className="h-3 w-3 sm:h-4 sm:w-4" />
                <span>Leave</span>
                {leaveRequests.filter(r => r.status === "pending").length > 0 && (
                  <Badge
                    variant="destructive"
                    className="absolute -top-1 -right-1 h-4 w-4 sm:h-5 sm:w-5 p-0 text-[10px] sm:text-xs flex items-center justify-center"
                  >
                    {leaveRequests.filter(r => r.status === "pending").length}
                  </Badge>
                )}
              </TabsTrigger>
            )}
            {canViewHolidays && (
              <TabsTrigger
                value="holidays"
                className="flex items-center justify-center gap-1 sm:gap-2 px-2 sm:px-3 py-2 text-xs sm:text-sm"
              >
                <PartyPopper className="h-3 w-3 sm:h-4 sm:w-4" />
                <span>Holidays</span>
              </TabsTrigger>
            )}
            {canViewWeeklyOff && (
              <TabsTrigger
                value="weekly-off"
                className="flex items-center justify-center gap-1 sm:gap-2 px-2 sm:px-3 py-2 text-xs sm:text-sm"
              >
                <CalendarDays className="h-3 w-3 sm:h-4 sm:w-4" />
                <span>Weekly Off</span>
              </TabsTrigger>
            )}
          </TabsList>

          {/* Attendance Tab */}
          {canViewAttendance && (
            <TabsContent value="attendance" className="space-y-4">
              <Card className="shadow-sm overflow-hidden">
                <CardHeader className="p-4 sm:p-6">
                  <div className="flex flex-col gap-4">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                      <div>
                        <CardTitle className="text-lg sm:text-xl">Attendance Records</CardTitle>
                        <CardDescription className="text-sm sm:text-base">
                          View and manage all attendance records
                        </CardDescription>
                      </div>
                      
                      {/* Mobile Filter Toggle */}
                      <div className="block sm:hidden">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setShowFilters(!showFilters)}
                          className="w-full"
                        >
                          <Filter className="h-4 w-4 mr-2" />
                          {showFilters ? 'Hide Filters' : 'Show Filters'}
                        </Button>
                      </div>
                    </div>

                    {/* Search Bar */}
                    <div className="relative w-full">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                      <Input
                        placeholder="Search by name..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-10 w-full"
                      />
                    </div>

                    {/* Filters - Responsive */}
                    <div className={`${showFilters ? 'block' : 'hidden'} sm:block`}>
                      <div className="flex flex-col sm:flex-row gap-3">
                        <div className="grid grid-cols-2 sm:flex gap-2 w-full">
                          <Select
                            value={filters.status}
                            onValueChange={(value) => setFilters(prev => ({ ...prev, status: value }))}
                          >
                            <SelectTrigger className="w-full">
                              <SelectValue placeholder="Status" />
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
                          
                          <div className="grid grid-cols-1 gap-2 sm:flex sm:gap-2">
                            <Input
                              type="date"
                              value={filters.date || ''}
                              onChange={(e) => setFilters(prev => ({ ...prev, date: e.target.value, month: "" }))}
                              className="border rounded px-3 py-2 text-sm w-full"
                            />
                            <input
                              type="month"
                              value={filters.month || ''}
                              onChange={(e) => setFilters(prev => ({ ...prev, month: e.target.value, date: "" }))}
                              className="border rounded px-3 py-2 text-sm w-full"
                            />
                          </div>
                        </div>
                        
                        {(filters.status !== 'all' || filters.date || filters.month || searchQuery) && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              setFilters({ userType: "all", status: "all", date: "", month: "" });
                              setSearchQuery("");
                              setShowFilters(false);
                            }}
                            className="h-10 w-full sm:w-auto"
                          >
                            <X className="h-4 w-4 mr-1" />
                            Clear Filters
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                </CardHeader>
                
                <CardContent className="p-4 sm:p-6 pt-0">
                  <div className="rounded-md overflow-hidden">
                    <ResponsiveTable
                      data={attendance}
                      columns={attendanceColumns}
                      loading={loading.attendance}
                      emptyMessage="No attendance records found"
                    />
                  </div>
                  <CustomPagination />
                </CardContent>
              </Card>
            </TabsContent>
          )}

          {/* Leave Tab */}
          {canViewLeave && (
            <TabsContent value="leave">
              <Card className="shadow-sm overflow-hidden">
                <CardHeader className="p-4 sm:p-6">
                  <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                    <div>
                      <CardTitle className="text-lg sm:text-xl">Leave Requests</CardTitle>
                      <CardDescription className="text-sm sm:text-base">
                        Review and manage all leave requests
                      </CardDescription>
                    </div>
                    <div className="text-sm text-muted-foreground">
                      Pending: {leaveRequests.filter(r => r.status === "pending").length}
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="p-4 sm:p-6 pt-0">
                  <div className="rounded-md border overflow-hidden">
                    <ResponsiveTable
                      data={leaveRequests}
                      columns={leaveColumns}
                      loading={loading.leave}
                      emptyMessage="No leave requests found"
                    />
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          )}

          {/* Holidays Tab */}
          {canViewHolidays && (
            <TabsContent value="holidays">
              <Card className="shadow-sm overflow-hidden">
                <CardHeader className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 p-4 sm:p-6">
                  <div>
                    <CardTitle className="text-lg sm:text-xl">Holidays Management</CardTitle>
                    <CardDescription className="text-sm sm:text-base">
                      Manage system holidays
                    </CardDescription>
                  </div>
                  {canCreateHolidays && (
                    <Button onClick={() => setShowHolidayModal(true)} className="w-full sm:w-auto">
                      <Plus className="h-4 w-4 mr-2" />
                      Add Holiday
                    </Button>
                  )}
                </CardHeader>
                <CardContent className="p-4 sm:p-6 pt-0">
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
                    <div className="rounded-md border overflow-hidden">
                      <ResponsiveTable
                        data={holidays}
                        columns={holidayColumns}
                        loading={false}
                        emptyMessage="No holidays found"
                      />
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          )}

          {/* Weekly Off Tab */}
          {canViewWeeklyOff && (
            <TabsContent value="weekly-off">
              <Card className="shadow-sm overflow-hidden">
                <CardHeader className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 p-4 sm:p-6">
                  <div>
                    <CardTitle className="text-lg sm:text-xl">Weekly Off Days</CardTitle>
                    <CardDescription className="text-sm sm:text-base">
                      Manage weekly off days
                    </CardDescription>
                  </div>
                  {canCreateWeeklyOff && (
                    <Button onClick={() => setShowWeeklyOffModal(true)} className="w-full sm:w-auto">
                      <Plus className="h-4 w-4 mr-2" />
                      Add Weekly Off
                    </Button>
                  )}
                </CardHeader>
                <CardContent className="p-4 sm:p-6 pt-0">
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
                    <div className="rounded-md border overflow-hidden">
                      <ResponsiveTable
                        data={weeklyOffs}
                        columns={weeklyOffColumns}
                        loading={false}
                        emptyMessage="No weekly off days found"
                      />
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          )}
        </Tabs>
      </div>
    </div>
  );
}