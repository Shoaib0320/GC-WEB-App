// src/app/(dashboard)/dashboard/shift-pannel/page.jsx
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

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      <h2 className="text-3xl font-bold text-center text-blue-700">Manage Shifts</h2>

      <Card>
        <CardHeader><CardTitle>Shifts Management</CardTitle></CardHeader>
        <CardContent>
          <div className="flex justify-between items-center mb-4">
              <div className="flex gap-2 items-center">
              {hasPermission('shift', 'create') && (
                <Button onClick={openCreate}>Create Shift</Button>
              )}
            </div>
          </div>

          {message && (
            <p className={`text-sm mb-4 ${message.toLowerCase().includes("error") ? "text-red-600" : "text-green-600"}`}>{message}</p>
          )}

          <GlobalData
            key={reloadKey}
            title="Shifts"
            fetcher={shiftsFetcher}
            serverSide
            rowsPerPage={LIMIT}
            searchEnabled
            columns={[
              { 
                label: "Name", 
                key: "name", 
                render: (s) => <div className="font-semibold">{s.name}</div> 
              },
              { 
                label: "Time", 
                key: "time", 
                render: (s) => `${s.startTime} - ${s.endTime}` 
              },
              { 
                label: "Days", 
                key: "days", 
                render: (s) => (
                  <div className="flex gap-1 flex-wrap">
                    {(s.days || []).map(d => (
                      <Badge key={d} variant="secondary">{d}</Badge>
                    ))}
                  </div>
                ) 
              },
              { 
                label: "Actions", 
                key: "actions", 
                render: (s) => (
                  <div className="flex gap-2">
                    {/* {hasPermission('shift', 'view') && (
                      <Button variant="ghost" size="sm" onClick={() => {
                        // simple view behaviour: open edit dialog in read-only mode
                        startEdit(s);
                      }}>
                        View
                      </Button>
                    )} */}
                    {hasPermission('shift', 'edit') && (
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => startEdit(s)}
                      >
                        Edit
                      </Button>
                    )}
                    {hasPermission('shift', 'delete') && (
                      <Button 
                        variant="destructive" 
                        size="sm"
                        onClick={() => confirmDelete(s._id)}
                      >
                        Delete
                      </Button>
                    )}
                  </div>
                ), 
                align: 'right' 
              },
            ]}
          />
        </CardContent>
      </Card>

      {/* Create/Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>{editingId ? "Edit Shift" : "Create Shift"}</DialogTitle>
            <DialogDescription>{editingId ? "Update the shift details below." : "Fill the details to create a new shift."}</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Shift Name</Label>
              <Input id="name" required name="name" value={form.name} onChange={handleChange} placeholder="Enter shift name" />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="startTime">Start Time</Label>
                <Input id="startTime" required type="time" name="startTime" value={form.startTime} onChange={handleChange} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="endTime">End Time</Label>
                <Input id="endTime" required type="time" name="endTime" value={form.endTime} onChange={handleChange} />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Days</Label>
              <div className="flex flex-wrap gap-2">
                {DAYS.map(day => (
                  <div key={day} className="flex items-center space-x-2">
                    <input type="checkbox" id={`day-${day}`} checked={form.days.includes(day)} onChange={() => toggleDay(day)} className="h-4 w-4 rounded border-gray-300" />
                    <Label htmlFor={`day-${day}`} className="text-sm">{day}</Label>
                  </div>
                ))}
              </div>
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button>
              <Button type="submit" disabled={loading}>{loading ? "Saving..." : editingId ? "Update Shift" : "Create Shift"}</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Confirm Delete</DialogTitle>
            <DialogDescription>Are you sure you want to delete this shift? This action cannot be undone.</DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteDialogOpen(false)}>Cancel</Button>
            <Button variant="destructive" onClick={handleDelete}>Delete</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
