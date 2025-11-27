"use client";
import React, { useState } from "react";
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
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import GlobalData from "@/components/common/GlobalData";
import { MoreVertical, Edit, Trash2, Clock } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const LIMIT = 10;
const DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

export default function AdminCreateShift() {
  const [form, setForm] = useState({ name: "", startTime: "", endTime: "", days: [] });
  const [reloadKey, setReloadKey] = useState(0);
  const [editingId, setEditingId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const { hasPermission } = useAuth();

  // UI states for dialogs
  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deleteId, setDeleteId] = useState(null);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((s) => ({ ...s, [name]: value }));
  };

  const toggleDay = (day) => {
    setForm((prev) => ({
      ...prev,
      days: prev.days.includes(day) ? prev.days.filter(d => d !== day) : [...prev.days, day],
    }));
  };

  const resetForm = () => setForm({ name: "", startTime: "", endTime: "", days: [] });

  const openCreate = () => {
    resetForm();
    setEditingId(null);
    setDialogOpen(true);
  };

  const startEdit = (shift) => {
    setEditingId(shift._id);
    setForm({
      name: shift.name,
      startTime: shift.startTime,
      endTime: shift.endTime,
      days: Array.isArray(shift.days) ? shift.days : [],
    });
    setDialogOpen(true);
  };

  // Helper to fetch latest shifts immediately and update local state
  const fetchShiftsNow = async (params = {}) => {
    try {
      const url = new URL("/api/shifts", window.location.origin);
      const p = params.page || meta.page || 1;
      const l = params.limit || meta.limit || LIMIT;
      url.searchParams.set("page", p);
      url.searchParams.set("limit", l);
      if (params.search) url.searchParams.set("q", params.search);

      const res = await fetch(url.toString());
      const json = await res.json();
      if (json.success) {
        setShifts(json.data || []);
        setMeta(json.meta || { total: 0, totalPages: 1, page: p, limit: l });
      }
    } catch (err) {
      console.error("fetchShiftsNow error", err);
    }
  };

  const confirmDelete = (id) => {
    setDeleteId(id);
    setDeleteDialogOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    try {
      const payload = { ...form };
      const res = await fetch(editingId ? `/api/shifts/${editingId}` : `/api/shifts`, {
        method: editingId ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const json = await res.json();
      setMessage(json.message || (json.success ? "Operation successful" : "Error occurred"));

      if (json.success) {
        resetForm();
        setEditingId(null);
        setDialogOpen(false);
        // refresh list immediately
        await fetchShiftsNow();
      }
    } catch (err) {
      console.error("submit error", err);
      setMessage("Server error while saving");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    try {
      const res = await fetch(`/api/shifts/${deleteId}`, { method: "DELETE" });
      const json = await res.json();
      setMessage(json.message || (json.success ? "Deleted successfully" : "Error deleting"));
      if (json.success) {
        await fetchShiftsNow();
      }
    } catch (err) {
      console.error("delete error", err);
      setMessage("Server error while deleting");
    } finally {
      setDeleteDialogOpen(false);
      setDeleteId(null);
    }
  };

  const shiftsFetcher = async (params = {}) => {
    try {
      const url = new URL("/api/shifts", window.location.origin);
      Object.entries(params).forEach(([k, v]) => v !== undefined && url.searchParams.set(k, v));
      const res = await fetch(url.toString());
      const json = await res.json();
      if (json.success) return { data: json.data || [], meta: json.meta || { total: 0, totalPages: 1, page: 1, limit: LIMIT } };
      return { data: [], meta: { total: 0, totalPages: 1, page: 1, limit: LIMIT } };
    } catch (err) { console.error(err); return { data: [], meta: { total: 0, totalPages: 1, page: 1, limit: LIMIT } }; }
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
              {s.startTime} - {s.endTime}
            </div>
            <div className="flex flex-wrap gap-1 mt-1">
              {(s.days || []).map(d => (
                <Badge key={d} variant="secondary" className="text-xs">{d}</Badge>
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
        <>
          {/* Desktop Actions */}
          <div className="hidden md:flex gap-2">
            {hasPermission('shift', 'edit') && (
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => startEdit(s)}
                className="text-xs"
              >
                <Edit className="h-3 w-3 mr-1" />
                Edit
              </Button>
            )}
            {hasPermission('shift', 'delete') && (
              <Button 
                variant="destructive" 
                size="sm"
                onClick={() => confirmDelete(s._id)}
                className="text-xs"
              >
                <Trash2 className="h-3 w-3 mr-1" />
                Delete
              </Button>
            )}
          </div>

          {/* Mobile Actions Dropdown */}
          <div className="md:hidden">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                {hasPermission('shift', 'edit') && (
                  <DropdownMenuItem onClick={() => startEdit(s)}>
                    <Edit className="h-4 w-4 mr-2" />
                    Edit Shift
                  </DropdownMenuItem>
                )}
                {hasPermission('shift', 'delete') && (
                  <>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem 
                      onClick={() => confirmDelete(s._id)}
                      className="text-red-600 focus:text-red-600"
                    >
                      <Trash2 className="h-4 w-4 mr-2" />
                      Delete Shift
                    </DropdownMenuItem>
                  </>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </>
      ), 
      align: 'right' 
    },
  ];

  return (
    <div className="max-w-6xl mx-auto p-4 md:p-6 space-y-4 md:space-y-6">
      <h2 className="text-2xl md:text-3xl font-bold text-center text-[#10B5DB]">Manage Shifts</h2>

      <Card>
        <CardHeader className="px-4 md:px-6">
          <CardTitle className="text-lg md:text-xl">Shifts Management</CardTitle>
        </CardHeader>
        <CardContent className="px-4 md:px-6">
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-4">
            <div className="flex gap-2 items-center">
              {hasPermission('shift', 'create') && (
                <Button onClick={openCreate} className="w-full sm:w-auto">
                  Create Shift
                </Button>
              )}
            </div>
          </div>

          {message && (
            <p className={`text-sm mb-4 ${message.toLowerCase().includes("error") ? "text-red-600" : "text-green-600"}`}>
              {message}
            </p>
          )}

          <div className="overflow-x-auto">
            <GlobalData
              key={reloadKey}
              title="Shifts"
              fetcher={shiftsFetcher}
              serverSide
              rowsPerPage={8}
              searchEnabled
              columns={columns}
            />
          </div>
        </CardContent>
      </Card>

      {/* Create/Edit Dialog - Mobile Responsive */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-[95vw] md:max-w-md max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-lg md:text-xl">
              {editingId ? "Edit Shift" : "Create Shift"}
            </DialogTitle>
            <DialogDescription className="text-sm md:text-base">
              {editingId ? "Update the shift details below." : "Fill the details to create a new shift."}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name" className="text-sm md:text-base">Shift Name</Label>
              <Input 
                id="name" 
                required 
                name="name" 
                value={form.name} 
                onChange={handleChange} 
                placeholder="Enter shift name" 
                className="text-sm md:text-base"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="startTime" className="text-sm md:text-base">Start Time</Label>
                <Input 
                  id="startTime" 
                  required 
                  type="time" 
                  name="startTime" 
                  value={form.startTime} 
                  onChange={handleChange} 
                  className="text-sm md:text-base"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="endTime" className="text-sm md:text-base">End Time</Label>
                <Input 
                  id="endTime" 
                  required 
                  type="time" 
                  name="endTime" 
                  value={form.endTime} 
                  onChange={handleChange} 
                  className="text-sm md:text-base"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label className="text-sm md:text-base">Days</Label>
              <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                {DAYS.map(day => (
                  <div key={day} className="flex items-center space-x-2">
                    <input 
                      type="checkbox" 
                      id={`day-${day}`} 
                      checked={form.days.includes(day)} 
                      onChange={() => toggleDay(day)} 
                      className="h-4 w-4 rounded border-gray-300" 
                    />
                    <Label htmlFor={`day-${day}`} className="text-sm whitespace-nowrap">{day}</Label>
                  </div>
                ))}
              </div>
            </div>

            <DialogFooter className="flex flex-col sm:flex-row gap-2 sm:gap-0">
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => setDialogOpen(false)}
                className="w-full sm:w-auto order-2 sm:order-1"
              >
                Cancel
              </Button>
              <Button 
                type="submit" 
                disabled={loading}
                className="w-full sm:w-auto order-1 sm:order-2"
              >
                {loading ? "Saving..." : editingId ? "Update Shift" : "Create Shift"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation - Mobile Responsive */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent className="max-w-[95vw] md:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-lg md:text-xl">Confirm Delete</DialogTitle>
            <DialogDescription className="text-sm md:text-base">
              Are you sure you want to delete this shift? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="flex flex-col sm:flex-row gap-2 sm:gap-0">
            <Button 
              variant="outline" 
              onClick={() => setDeleteDialogOpen(false)}
              className="w-full sm:w-auto order-2 sm:order-1"
            >
              Cancel
            </Button>
            <Button 
              variant="destructive" 
              onClick={handleDelete}
              className="w-full sm:w-auto order-1 sm:order-2"
            >
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}