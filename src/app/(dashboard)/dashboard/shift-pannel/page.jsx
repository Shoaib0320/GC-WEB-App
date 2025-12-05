//src/app/(dashboard)/dashboard/shift-pannel/page.jsx   
"use client";
import React, { useState, useEffect } from "react";
import { useAuth } from '@/context/AuthContext';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Card, CardContent, CardHeader, CardTitle , CardDescription} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  MoreVertical, Edit, Trash2, Clock, Plus, Search, ChevronLeft, ChevronRight, Loader2
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { toast } from "sonner";
import { shiftService } from "@/services/shiftService";

const DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

export default function AdminCreateShift() {
  const [form, setForm] = useState({ 
    name: "", 
    startTime: "", 
    endTime: "", 
    days: [],
    isActive: true 
  });
  
  // All shifts loaded at once
  const [allShifts, setAllShifts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const { hasPermission } = useAuth();

  // UI states for dialogs
  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deleteId, setDeleteId] = useState(null);
  
  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  // Load ALL shifts initially
  useEffect(() => {
    loadAllShifts();
  }, []);

  const loadAllShifts = async () => {
    try {
      setLoading(true);
      // Use shiftService to load all shifts
      const response = await shiftService.getAllShifts({ limit: 1000, page: 1 });
      
      if (response.success) {
        setAllShifts(response.data || []);
        toast.success("Shifts loaded successfully");
      } else {
        toast.error("Failed to load shifts");
        setAllShifts([]);
      }
    } catch (error) {
      console.error("Error loading shifts:", error);
      toast.error("Failed to load shifts");
      setAllShifts([]);
    } finally {
      setLoading(false);
    }
  };

  // Client-side filtering and pagination
  const getFilteredAndPaginatedShifts = () => {
    let filtered = [...allShifts];
    
    // Apply search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(shift => 
        shift.name?.toLowerCase().includes(query)
      );
    }
    
    // Apply status filter
    if (statusFilter === "active") {
      filtered = filtered.filter(shift => shift.isActive === true);
    } else if (statusFilter === "inactive") {
      filtered = filtered.filter(shift => shift.isActive === false);
    }
    
    // Calculate pagination
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    
    // Get current page items
    const paginatedShifts = filtered.slice(startIndex, endIndex);
    const totalPages = Math.ceil(filtered.length / itemsPerPage);
    
    return {
      shifts: paginatedShifts,
      total: filtered.length,
      totalPages: totalPages
    };
  };

  // Get current shifts for display
  const { shifts: currentShifts, total: filteredTotal, totalPages } = getFilteredAndPaginatedShifts();

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm(prev => ({ 
      ...prev, 
      [name]: type === 'checkbox' ? checked : value 
    }));
  };

  const toggleDay = (day) => {
    setForm((prev) => ({
      ...prev,
      days: prev.days.includes(day) 
        ? prev.days.filter(d => d !== day) 
        : [...prev.days, day],
    }));
  };

  const resetForm = () => {
    setForm({ 
      name: "", 
      startTime: "", 
      endTime: "", 
      days: [],
      isActive: true 
    });
    setEditingId(null);
  };

  const openCreate = () => {
    resetForm();
    setDialogOpen(true);
  };

  const [editingId, setEditingId] = useState(null);
  const startEdit = (shift) => {
    setEditingId(shift._id);
    setForm({
      name: shift.name,
      startTime: shift.startTime,
      endTime: shift.endTime,
      days: Array.isArray(shift.days) ? shift.days : [],
      isActive: shift.isActive !== false
    });
    setDialogOpen(true);
  };

  const confirmDelete = (id) => {
    setDeleteId(id);
    setDeleteDialogOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const payload = { ...form };
      
      // Use shiftService for create/update
      let response;
      if (editingId) {
        response = await shiftService.updateShift(editingId, payload);
      } else {
        response = await shiftService.createShift(payload);
      }
      
      if (response.success) {
        toast.success(editingId ? "Shift updated successfully" : "Shift created successfully");
        resetForm();
        setDialogOpen(false);
        // Refresh all shifts
        await loadAllShifts();
      } else {
        toast.error(response.message || "Operation failed");
      }
    } catch (error) {
      console.error("Submit error:", error);
      toast.error("Server error while saving");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    try {
      // Use shiftService for delete
      const response = await shiftService.deleteShift(deleteId);
      
      if (response.success) {
        toast.success("Shift deleted successfully");
        await loadAllShifts();
      } else {
        toast.error(response.message || "Error deleting shift");
      }
    } catch (error) {
      console.error("Delete error:", error);
      toast.error("Server error while deleting");
    } finally {
      setDeleteDialogOpen(false);
      setDeleteId(null);
    }
  };

  const handleToggleStatus = async (shiftId, currentStatus) => {
    try {
      // Use shiftService for status update
      const response = await shiftService.updateShiftStatus(shiftId, !currentStatus);
      
      if (response.success) {
        toast.success(`Shift ${!currentStatus ? 'activated' : 'deactivated'} successfully`);
        await loadAllShifts();
      } else {
        toast.error(response.message || "Failed to update status");
      }
    } catch (error) {
      console.error("Status toggle error:", error);
      toast.error("Server error while updating status");
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    setCurrentPage(1); // Reset to first page when searching
  };

  // Pagination component
  const Pagination = ({ currentPage, totalPages, onPageChange, totalItems }) => {
    const startItem = (currentPage - 1) * itemsPerPage + 1;
    const endItem = Math.min(currentPage * itemsPerPage, totalItems);

    const getPageNumbers = () => {
      const pages = [];
      if (totalPages <= 5) {
        for (let i = 1; i <= totalPages; i++) pages.push(i);
      } else if (currentPage <= 3) {
        pages.push(1, 2, 3, 4, '...', totalPages);
      } else if (currentPage >= totalPages - 2) {
        pages.push(1, '...', totalPages - 3, totalPages - 2, totalPages - 1, totalPages);
      } else {
        pages.push(1, '...', currentPage - 1, currentPage, currentPage + 1, '...', totalPages);
      }
      return pages;
    };

    return (
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mt-6 px-4 border-t pt-6">
        <div className="text-sm text-gray-700">
          Showing <span className="font-medium">{startItem}</span> to{" "}
          <span className="font-medium">{endItem}</span> of{" "}
          <span className="font-medium">{totalItems}</span> shifts
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => onPageChange(currentPage - 1)}
            disabled={currentPage === 1}
            className="flex items-center gap-1"
          >
            <ChevronLeft className="h-4 w-4" />
            <span className="hidden sm:inline">Previous</span>
          </Button>
          
          <div className="flex items-center gap-1">
            {getPageNumbers().map((page, index) => (
              page === '...' ? (
                <span key={`dots-${index}`} className="px-2 py-1">...</span>
              ) : (
                <Button
                  key={page}
                  variant={currentPage === page ? "default" : "outline"}
                  size="sm"
                  onClick={() => onPageChange(page)}
                  className={`h-8 w-8 p-0 ${
                    currentPage === page ? 'bg-blue-600 text-white hover:bg-blue-700' : ''
                  }`}
                >
                  {page}
                </Button>
              )
            ))}
          </div>
          
          <Button
            variant="outline"
            size="sm"
            onClick={() => onPageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
            className="flex items-center gap-1"
          >
            <span className="hidden sm:inline">Next</span>
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
    );
  };

  // Mobile-friendly columns
  const columns = [
    { 
      label: "Shift Details", 
      key: "name", 
      render: (s) => (
        <div className="min-w-0">
          <div className="font-semibold text-sm md:text-base truncate">{s.name}</div>
          <div className="text-xs md:text-sm text-gray-600 mt-1">
            <div className="flex items-center gap-1">
              <Clock className="h-3 w-3" />
              <span className="truncate">{s.startTime} - {s.endTime}</span>
            </div>
            <div className="flex flex-wrap gap-1 mt-1">
              {(s.days || []).map(d => (
                <Badge key={d} variant="secondary" className="text-xs truncate">{d}</Badge>
              ))}
            </div>
          </div>
        </div>
      ) 
    },
    { 
      label: "Actions", 
      key: "actions", 
      render: (s) => (
        <div className="flex items-center justify-end gap-2">
          {hasPermission('shift', 'edit') && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => startEdit(s)}
              className="h-8 w-8 p-0 md:h-auto md:w-auto md:px-3 md:py-2"
            >
              <Edit className="h-4 w-4 md:mr-1" />
              <span className="hidden md:inline">Edit</span>
            </Button>
          )}
          
          {/* {hasPermission('shift', 'edit') && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleToggleStatus(s._id, s.isActive)}
              className={`h-8 w-8 p-0 md:h-auto md:w-auto md:px-3 md:py-2 ${
                s.isActive ? 'text-orange-600 hover:text-orange-700 hover:bg-orange-50' : 'text-green-600 hover:text-green-700 hover:bg-green-50'
              }`}
            >
              <span className="hidden md:inline">{s.isActive ? 'Deactivate' : 'Activate'}</span>
            </Button>
          )} */}
          
          {hasPermission('shift', 'delete') && (
            <Button
              variant="destructive"
              size="sm"
              onClick={() => confirmDelete(s._id)}
              className="h-8 w-8 p-0 md:h-auto md:w-auto md:px-3 md:py-2"
            >
              <Trash2 className="h-4 w-4 md:mr-1" />
              <span className="hidden md:inline">Delete</span>
            </Button>
          )}
        </div>
      ), 
      align: 'right' 
    },
  ];

  return (
    <div className="min-h-screen bg-white p-4 md:p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header Card */}
        <Card className="shadow-lg border-0 bg-white text-black">
          <CardHeader className="pb-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-white/20 rounded-lg backdrop-blur-sm">
                <Clock className="h-6 w-6" />
              </div>
              <div className="min-w-0 flex-1">
                <CardTitle className="text-xl md:text-2xl font-bold truncate">Shift Management</CardTitle>
                <CardDescription className="text-black text-sm md:text-base">
                  Create and manage shifts for your team
                </CardDescription>
              </div>
            </div>
          </CardHeader>
        </Card>

        {/* Main Content Card */}
        <Card className="shadow-xl border-0 overflow-hidden">
          <CardHeader className="pb-4 border-b bg-white/50">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div className="min-w-0 flex-1">
                <CardTitle className="text-lg md:text-xl font-semibold text-gray-900">All Shifts</CardTitle>
                <CardDescription className="text-sm">
                  Manage shifts, timings, and working days
                </CardDescription>
              </div>
              
              {/* Search and Filter Controls */}
              <div className="flex flex-col sm:flex-row gap-3">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="Search shifts..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleSearch(e)}
                    className="pl-9 w-full sm:w-64"
                  />
                </div>
                
                {/* <Select
                  value={statusFilter}
                  onValueChange={(value) => {
                    setStatusFilter(value);
                    setCurrentPage(1);
                  }}
                >
                  <SelectTrigger className="w-full sm:w-[180px]">
                    <SelectValue placeholder="All Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectGroup>
                      <SelectLabel>Status Filter</SelectLabel>
                      <SelectItem value="all">All Status</SelectItem>
                      <SelectItem value="active">Active</SelectItem>
                      <SelectItem value="inactive">Inactive</SelectItem>
                    </SelectGroup>
                  </SelectContent>
                </Select> */}

                {hasPermission('shift', 'create') && (
                  <Button
                    onClick={openCreate}
                    className="blue-button flex items-center gap-2 w-full sm:w-auto justify-center"
                  >
                    <Plus className="h-4 w-4" />
                    Add Shift
                  </Button>
                )}
              </div>
            </div>
          </CardHeader>

          <CardContent className="p-0 md:p-6">
            {/* Shifts Table */}
            <div className="overflow-x-auto">
              <div className="min-w-full inline-block align-middle">
                <div className="overflow-hidden">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        {columns.map((column) => (
                          <th
                            key={column.key}
                            scope="col"
                            className={`px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap ${
                              column.align === 'right' ? 'text-right' : ''
                            }`}
                          >
                            {column.label}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {loading ? (
                        <tr>
                          <td colSpan={columns.length} className="px-4 py-8 text-center">
                            <div className="flex justify-center">
                              <Loader2 className="h-6 w-6 animate-spin text-blue-600" />
                            </div>
                          </td>
                        </tr>
                      ) : currentShifts.length > 0 ? (
                        currentShifts.map((shift) => (
                          <tr key={shift._id} className="hover:bg-gray-50 transition-colors">
                            {columns.map((column) => (
                              <td
                                key={column.key}
                                className={`px-4 py-4 whitespace-nowrap ${
                                  column.align === 'right' ? 'text-right' : ''
                                }`}
                              >
                                {column.render(shift)}
                              </td>
                            ))}
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan={columns.length} className="px-4 py-8 text-center text-gray-500">
                            {searchQuery || statusFilter !== "all" ? "No matching shifts found" : "No shifts found"}
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

            {/* Pagination Controls */}
            {totalPages > 1 && (
              <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={setCurrentPage}
                totalItems={filteredTotal}
              />
            )}
          </CardContent>
        </Card>
      </div>

      {/* Create/Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-[95vw] md:max-w-md max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-lg md:text-xl">
              {editingId ? <Edit className="h-5 w-5" /> : <Plus className="h-5 w-5" />}
              {editingId ? "Edit Shift" : "Create New Shift"}
            </DialogTitle>
            <DialogDescription className="text-sm md:text-base">
              {editingId ? "Update shift details below" : "Fill the details to create a new shift"}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name" className="text-sm font-medium text-gray-700">Shift Name *</Label>
              <Input 
                id="name" 
                required 
                name="name" 
                value={form.name} 
                onChange={handleChange} 
                placeholder="Enter shift name"
                className="focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="startTime" className="text-sm font-medium text-gray-700">Start Time *</Label>
                <Input 
                  id="startTime" 
                  required 
                  type="time" 
                  name="startTime" 
                  value={form.startTime} 
                  onChange={handleChange}
                  className="focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="endTime" className="text-sm font-medium text-gray-700">End Time *</Label>
                <Input 
                  id="endTime" 
                  required 
                  type="time" 
                  name="endTime" 
                  value={form.endTime} 
                  onChange={handleChange}
                  className="focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label className="text-sm font-medium text-gray-700">Working Days *</Label>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {DAYS.map(day => (
                  <label key={day} className="flex items-center space-x-2 p-2 rounded-lg hover:bg-slate-50 cursor-pointer transition-colors">
                    <input 
                      type="checkbox" 
                      id={`day-${day}`} 
                      checked={form.days.includes(day)} 
                      onChange={() => toggleDay(day)} 
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500 focus:ring-2"
                    />
                    <span className="text-sm font-medium text-gray-700">{day}</span>
                  </label>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <Label className="flex items-center space-x-2">
                <input 
                  type="checkbox" 
                  name="isActive" 
                  checked={form.isActive} 
                  onChange={handleChange}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500 focus:ring-2"
                />
                <span className="text-sm font-medium text-gray-700">Active Shift</span>
              </Label>
            </div>

            <DialogFooter className="flex flex-col sm:flex-row gap-3 pt-4 border-t">
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => setDialogOpen(false)}
                className="border-gray-300 text-gray-700 hover:bg-gray-50 font-medium py-2.5 px-6 rounded-lg transition-colors order-2 sm:order-1 w-full sm:w-auto"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={loading}
                className="blue-button w-full sm:w-auto order-1 sm:order-2"
              >
                {loading ? (
                  <div className="flex items-center gap-2">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    {editingId ? 'Updating...' : 'Creating...'}
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    {editingId ? <Edit className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
                    {editingId ? 'Update Shift' : 'Create Shift'}
                  </div>
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent className="max-w-[95vw] md:max-w-md">
          <DialogHeader>
            <DialogTitle>Confirm Delete</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this shift? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="flex flex-col sm:flex-row gap-2">
            <Button 
              variant="outline" 
              onClick={() => setDeleteDialogOpen(false)}
              className="w-full sm:w-auto"
            >
              Cancel
            </Button>
            <Button 
              variant="destructive" 
              onClick={handleDelete}
              className="w-full sm:w-auto"
            >
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}