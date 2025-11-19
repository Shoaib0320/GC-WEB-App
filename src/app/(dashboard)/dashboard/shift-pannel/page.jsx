// src/app/(dashboard)/dashboard/shift-pannel/page.jsx
"use client";
import React, { useState } from "react";
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
import { Checkbox } from "@/components/ui/checkbox";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import GlobalData from "@/components/common/GlobalData";

const LIMIT = 10;

export default function AdminCreateShift() {
  const [form, setForm] = useState({
    name: "",
    startTime: "",
    endTime: "",
    days: [],
  });
  const [shifts, setShifts] = useState([]);
  const [meta, setMeta] = useState({ total: 0, totalPages: 0, page: 1, limit: LIMIT });
  const [reloadKey, setReloadKey] = useState(0);
  const [editingId, setEditingId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  // UI states for dialogs
  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deleteId, setDeleteId] = useState(null);

  // No direct fetchShifts here: GlobalData will handle server-side fetching.

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((s) => ({ ...s, [name]: value }));
  };

  const toggleDay = (d) => {
    setForm((s) => {
      const cur = Array.isArray(s.days) ? s.days : s.days ? [s.days] : [];
      if (cur.includes(d)) return { ...s, days: cur.filter((x) => x !== d) };
      return { ...s, days: [...cur, d] };
    });
  };

  const resetForm = () => setForm({ name: "", startTime: "", endTime: "", days: [] });

  const openCreate = () => {
    resetForm();
    setEditingId(null);
    setDialogOpen(true);
  };

  const handleSubmit = async (e) => {
    e && e.preventDefault();
    setLoading(true);
    setMessage("");

    try {
      const payload = {
        name: form.name,
        startTime: form.startTime,
        endTime: form.endTime,
        days: Array.isArray(form.days) ? form.days : form.days ? [form.days] : [],
      };

      let res;
      if (editingId) {
        res = await fetch(`/api/shifts/${editingId}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
      } else {
        res = await fetch(`/api/shifts`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
      }

      const json = await res.json();
      setMessage(json.message || (json.success ? "Done" : "Error"));

      if (json.success) {
        resetForm();
        setEditingId(null);
        setDialogOpen(false);
        // trigger GlobalData reload
        setReloadKey((k) => k + 1);
      }
    } catch (err) {
      console.error("submit error", err);
      setMessage("Server error while saving");
    } finally {
      setLoading(false);
    }
  };

  const startEdit = (shift) => {
    setEditingId(shift._id);
    setForm({
      name: shift.name,
      startTime: shift.startTime,
      endTime: shift.endTime,
      days: shift.days ?? [],
    });
    setDialogOpen(true);
  };

  const confirmDelete = (id) => {
    setDeleteId(id);
    setDeleteDialogOpen(true);
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    try {
      const res = await fetch(`/api/shifts/${deleteId}`, { method: "DELETE" });
      const json = await res.json();
      setMessage(json.message || (json.success ? "Deleted" : "Error"));
      if (json.success) setReloadKey((k) => k + 1);
    } catch (err) {
      console.error("delete error", err);
      setMessage("Server error while deleting");
    } finally {
      setDeleteDialogOpen(false);
      setDeleteId(null);
    }
  };

  const goToPage = (p) => {
    if (p < 1 || p > (meta.totalPages || 1)) return;
    // GlobalData handles paging
  };
  // remove local sort/search logic; DataTable/GlobalData handle it

  const dayOptions = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
  const pageNumbers = Array.from({ length: meta.totalPages || 0 }, (_, i) => i + 1);

  // Server-side fetcher for GlobalData
  const shiftsFetcher = async (params = {}) => {
    try {
      const url = new URL("/api/shifts", location.origin);
      if (params.page) url.searchParams.set("page", params.page);
      if (params.limit) url.searchParams.set("limit", params.limit);
      if (params.search) url.searchParams.set("q", params.search);
      // allow other filters
      Object.keys(params).forEach((k) => {
        if (["page", "limit", "search"].includes(k)) return;
        const v = params[k];
        if (v === undefined || v === null) return;
        url.searchParams.set(k, v);
      });

      const res = await fetch(url.toString());
      const json = await res.json();
      if (json.success) {
        return { data: json.data || [], meta: json.meta || { total: 0, totalPages: 1, page: params.page || 1, limit: params.limit || LIMIT } };
      }
      return { data: [], meta: { total: 0, totalPages: 1, page: params.page || 1, limit: params.limit || LIMIT } };
    } catch (err) {
      console.error("shiftsFetcher error", err);
      return { data: [], meta: { total: 0, totalPages: 1, page: params.page || 1, limit: params.limit || LIMIT } };
    }
  };

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      <Card>
        <CardHeader>
          {/* <CardTitle className="text-2xl"></CardTitle> */}
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
            <div className="flex gap-2 items-center w-full md:w-1/2">
              <h1 className="text-3xl font-bold">Manage Shifts</h1>
            </div>

            <div className="flex gap-2 items-center">
              <Button onClick={openCreate}>Create Shift</Button>
            </div>
          </div>

          {message && <p className="text-sm text-muted-foreground">{message}</p>}

          {/* Shifts table powered by GlobalData */}
          <GlobalData
            key={reloadKey}
            title="Shifts"
            fetcher={shiftsFetcher}
            serverSide={true}
            rowsPerPage={LIMIT}
            searchEnabled={true}
            columns={[
              { label: "Name", key: "name", render: (s) => <div className="font-semibold">{s.name}</div> },
              { label: "Time", key: "time", render: (s) => `${s.startTime} - ${s.endTime}` },
              { label: "Days", key: "days", render: (s) => (
                  <div className="flex gap-1">{(s.days || []).map(d => <Badge key={d}>{d}</Badge>)}</div>
                ) },
              { label: "Actions", key: "actions", render: (s) => (
                  <div className="flex gap-2">
                    <Button variant="ghost" onClick={() => startEdit(s)}>Edit</Button>
                    <Button variant="destructive" onClick={() => { confirmDelete(s._id); }}>Delete</Button>
                  </div>
                ), align: 'right' },
            ]}
            onDataFetched={(items, metaData) => {
              setShifts(items || []);
              setMeta(metaData || {});
            }}
          />
        </CardContent>
      </Card>

      {/* Create / Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingId ? "Edit Shift" : "Create Shift"}</DialogTitle>
            <DialogDescription>
              {editingId ? "Update the shift details below." : "Fill the details to create a new shift."}
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-4 mt-2">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <Label>Shift Name</Label>
                <Input required name="name" value={form.name} onChange={handleChange} />
              </div>
              <div>
                <Label>Start Time</Label>
                <Input required type="time" name="startTime" value={form.startTime} onChange={handleChange} />
              </div>
              <div>
                <Label>End Time</Label>
                <Input required type="time" name="endTime" value={form.endTime} onChange={handleChange} />
              </div>
            </div>

            <div className="p-3 border rounded-lg">
              <Label className="mb-2 block">Select Working Days</Label>
              <div className="flex flex-wrap gap-2 mt-2">
                {dayOptions.map((d) => {
                  const selected = Array.isArray(form.days) ? form.days.includes(d) : false;
                  return (
                    <label key={d} className="inline-flex items-center gap-2">
                      <Checkbox checked={selected} onCheckedChange={() => toggleDay(d)} />
                      <span>{d}</span>
                    </label>
                  );
                })}
              </div>
            </div>

            <DialogFooter>
              <div className="flex gap-2 justify-end w-full">
                <Button type="button" variant={"ghost"} onClick={() => { setDialogOpen(false); resetForm(); setEditingId(null); }}>
                  Cancel
                </Button>
                <Button type="submit" disabled={loading}>
                  {editingId ? "Update Shift" : "Create Shift"}
                </Button>
              </div>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete AlertDialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Shift</AlertDialogTitle>
          </AlertDialogHeader>
          <div className="py-2">Are you sure? This action will permanently delete the shift.</div>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete}>Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
