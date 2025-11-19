// // src/app/(dashboard)/dashboard/shift-pannel/page.jsx
// "use client";
// import React, { useState } from "react";
// import { Button } from "@/components/ui/button";
// import { Input } from "@/components/ui/input";
// import { Label } from "@/components/ui/label";
// import {
//   Dialog,
//   DialogContent,
//   DialogDescription,
//   DialogFooter,
//   DialogHeader,
//   DialogTitle,
// } from "@/components/ui/dialog";
// import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
// import { Checkbox } from "@/components/ui/checkbox";
// import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
// import { Badge } from "@/components/ui/badge";
// import GlobalData from "@/components/common/GlobalData";

// const LIMIT = 10;

// export default function AdminCreateShift() {
//   const [form, setForm] = useState({
//     name: "",
//     startTime: "",
//     endTime: "",
//     days: "",
//   });
//   const [shifts, setShifts] = useState([]);
//   const [meta, setMeta] = useState({ total: 0, totalPages: 0, page: 1, limit: LIMIT });
//   const [reloadKey, setReloadKey] = useState(0);
//   const [editingId, setEditingId] = useState(null);
//   const [loading, setLoading] = useState(false);
//   const [message, setMessage] = useState("");

//   // UI states for dialogs
//   const [dialogOpen, setDialogOpen] = useState(false);
//   const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
//   const [deleteId, setDeleteId] = useState(null);

//   // No direct fetchShifts here: GlobalData will handle server-side fetching.

//   const handleChange = (e) => {
//     const { name, value } = e.target;
//     setForm((s) => ({ ...s, [name]: value }));
//   };

//   const toggleDay = (d) => {
//     setForm((s) => {
//       const cur = Array.isArray(s.days) ? s.days : s.days ? [s.days] : [];
//       if (cur.includes(d)) return { ...s, days: cur.filter((x) => x !== d) };
//       return { ...s, days: [...cur, d] };
//     });
//   };

//   const resetForm = () => setForm({ name: "", startTime: "", endTime: "", days: [] });

//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     setLoading(true);
//     setMessage("");

//     try {
//       const payload = {
//         name: form.name,
//         startTime: form.startTime,
//         endTime: form.endTime,
//         days: Array.isArray(form.days) ? form.days : form.days ? [form.days] : [],
//       };

//       let res;
//       if (editingId) {
//         res = await fetch(`/api/shifts/${editingId}`, {
//           method: "PUT",
//           headers: { "Content-Type": "application/json" },
//           body: JSON.stringify(payload),
//         });
//       } else {
//         res = await fetch(`/api/shifts`, {
//           method: "POST",
//           headers: { "Content-Type": "application/json" },
//           body: JSON.stringify(payload),
//         });
//       }

//       const json = await res.json();
//       setMessage(json.message || (json.success ? "Done" : "Error"));

//       if (json.success) {
//         resetForm();
//         setEditingId(null);
//         setDialogOpen(false);
//         // trigger GlobalData reload
//         setReloadKey((k) => k + 1);
//       }
//     } catch (err) {
//       console.error("submit error", err);
//       setMessage("Server error while saving");
//     } finally {
//       setLoading(false);
//     }
//   };

//   const startEdit = (shift) => {
//     setEditingId(shift._id);
//     setForm({
//       name: shift.name,
//       startTime: shift.startTime,
//       endTime: shift.endTime,
//       days: shift.days ?? [],
//     });
//     window.scrollTo({ top: 0, behavior: "smooth" });
//   };

//   const handleDelete = async (id) => {
//     if (!confirm("Are you sure? This will delete the shift.")) return;
//     try {
//       const res = await fetch(`/api/shifts/${id}`, { method: "DELETE" });
//       const json = await res.json();
//       setMessage(json.message || (json.success ? "Deleted" : "Error"));
//       if (json.success) setReloadKey((k) => k + 1);
//     } catch (err) {
//       console.error("delete error", err);
//       setMessage("Server error while deleting");
//     }
//   };

//   const goToPage = (p) => {
//     if (p < 1 || p > (meta.totalPages || 1)) return;
//     // GlobalData handles paging
//   };
//   // remove local sort/search logic; DataTable/GlobalData handle it

//   const dayOptions = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
//   const pageNumbers = Array.from({ length: meta.totalPages || 0 }, (_, i) => i + 1);

//   // Server-side fetcher for GlobalData
//   const shiftsFetcher = async (params = {}) => {
//     try {
//       const url = new URL("/api/shifts", location.origin);
//       if (params.page) url.searchParams.set("page", params.page);
//       if (params.limit) url.searchParams.set("limit", params.limit);
//       if (params.search) url.searchParams.set("q", params.search);
//       // allow other filters
//       Object.keys(params).forEach((k) => {
//         if (["page", "limit", "search"].includes(k)) return;
//         const v = params[k];
//         if (v === undefined || v === null) return;
//         url.searchParams.set(k, v);
//       });

//       const res = await fetch(url.toString());
//       const json = await res.json();
//       if (json.success) {
//         return { data: json.data || [], meta: json.meta || { total: 0, totalPages: 1, page: params.page || 1, limit: params.limit || LIMIT } };
//       }
//       return { data: [], meta: { total: 0, totalPages: 1, page: params.page || 1, limit: params.limit || LIMIT } };
//     } catch (err) {
//       console.error("shiftsFetcher error", err);
//       return { data: [], meta: { total: 0, totalPages: 1, page: params.page || 1, limit: params.limit || LIMIT } };
//     }
//   };

//   return (
//     <div className="max-w-6xl mx-auto p-6 space-y-6">
//       <h2 className="text-3xl font-bold text-center text-blue-700 dark:text-blue-400">
//         Manage Shifts
//       </h2>

//             <div className="flex gap-2 items-center">
//               <Button onClick={openCreate}>Create Shift</Button>
//             </div>
//           </div>

//           {message && <p className="text-sm text-muted-foreground">{message}</p>}

//           {/* Shifts table powered by GlobalData */}
//           <GlobalData
//             key={reloadKey}
//             title="Shifts"
//             fetcher={shiftsFetcher}
//             serverSide={true}
//             rowsPerPage={LIMIT}
//             searchEnabled={true}
//             columns={[
//               { label: "Name", key: "name", render: (s) => <div className="font-semibold">{s.name}</div> },
//               { label: "Time", key: "time", render: (s) => `${s.startTime} - ${s.endTime}` },
//               { label: "Days", key: "days", render: (s) => (
//                   <div className="flex gap-1">{(s.days || []).map(d => <Badge key={d}>{d}</Badge>)}</div>
//                 ) },
//               { label: "Actions", key: "actions", render: (s) => (
//                   <div className="flex gap-2">
//                     <Button variant="ghost" onClick={() => startEdit(s)}>Edit</Button>
//                     <Button variant="destructive" onClick={() => { confirmDelete(s._id); }}>Delete</Button>
//                   </div>
//                 ), align: 'right' },
//             ]}
//             onDataFetched={(items, metaData) => {
//               setShifts(items || []);
//               setMeta(metaData || {});
//             }}
//           />
//         </CardContent>
//       </Card>

//       {/* Create / Edit Dialog */}
//       <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
//         <DialogContent>
//           <DialogHeader>
//             <DialogTitle>{editingId ? "Edit Shift" : "Create Shift"}</DialogTitle>
//             <DialogDescription>
//               {editingId ? "Update the shift details below." : "Fill the details to create a new shift."}
//             </DialogDescription>
//           </DialogHeader>

//           <form onSubmit={handleSubmit} className="space-y-4 mt-2">
//             <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
//               <div>
//                 <Label>Shift Name</Label>
//                 <Input required name="name" value={form.name} onChange={handleChange} />
//               </div>
//               <div>
//                 <Label>Start Time</Label>
//                 <Input required type="time" name="startTime" value={form.startTime} onChange={handleChange} />
//               </div>
//               <div>
//                 <Label>End Time</Label>
//                 <Input required type="time" name="endTime" value={form.endTime} onChange={handleChange} />
//               </div>
//             </div>
//           ))
//         )}
//       </div>

//       <div className="flex justify-center mt-4 gap-2 flex-wrap">
//         {pageNumbers.length > 0 &&
//           pageNumbers.map((p) => (
//             <button
//               key={p}
//               onClick={() => goToPage(p)}
//               className={`px-3 py-1 rounded-lg ${
//                 p === meta.page
//                   ? "bg-blue-600 text-white"
//                   : "bg-gray-200 dark:bg-gray-700"
//               }`}
//             >
//               {p}
//             </button>
//           ))}
//       </div>
//     </div>
//   );
// }






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

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((s) => ({ ...s, [name]: value }));
  };

  const toggleDay = (day) => {
    setForm((prev) => {
      const currentDays = Array.isArray(prev.days) ? prev.days : [];
      if (currentDays.includes(day)) {
        return { ...prev, days: currentDays.filter(d => d !== day) };
      } else {
        return { ...prev, days: [...currentDays, day] };
      }
    });
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

  const confirmDelete = (id) => {
    setDeleteId(id);
    setDeleteDialogOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    try {
      const payload = {
        name: form.name,
        startTime: form.startTime,
        endTime: form.endTime,
        days: form.days,
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
      setMessage(json.message || (json.success ? "Operation successful" : "Error occurred"));

      if (json.success) {
        resetForm();
        setEditingId(null);
        setDialogOpen(false);
        setReloadKey((k) => k + 1);
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
        setReloadKey((k) => k + 1);
      }
    } catch (err) {
      console.error("delete error", err);
      setMessage("Server error while deleting");
    } finally {
      setDeleteDialogOpen(false);
      setDeleteId(null);
    }
  };

  const dayOptions = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

  // Server-side fetcher for GlobalData
  const shiftsFetcher = async (params = {}) => {
    try {
      const url = new URL("/api/shifts", window.location.origin);
      if (params.page) url.searchParams.set("page", params.page);
      if (params.limit) url.searchParams.set("limit", params.limit);
      if (params.search) url.searchParams.set("q", params.search);
      
      Object.keys(params).forEach((k) => {
        if (["page", "limit", "search"].includes(k)) return;
        const v = params[k];
        if (v === undefined || v === null) return;
        url.searchParams.set(k, v);
      });

      const res = await fetch(url.toString());
      const json = await res.json();
      if (json.success) {
        return { 
          data: json.data || [], 
          meta: json.meta || { 
            total: 0, 
            totalPages: 1, 
            page: params.page || 1, 
            limit: params.limit || LIMIT 
          } 
        };
      }
      return { 
        data: [], 
        meta: { 
          total: 0, 
          totalPages: 1, 
          page: params.page || 1, 
          limit: params.limit || LIMIT 
        } 
      };
    } catch (err) {
      console.error("shiftsFetcher error", err);
      return { 
        data: [], 
        meta: { 
          total: 0, 
          totalPages: 1, 
          page: params.page || 1, 
          limit: params.limit || LIMIT 
        } 
      };
    }
  };

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      <h2 className="text-3xl font-bold text-center text-blue-700">
        Manage Shifts
      </h2>

      <Card>
        <CardHeader>
          <CardTitle>Shifts Management</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex justify-between items-center mb-4">
            <div className="flex gap-2 items-center">
              <Button onClick={openCreate}>Create Shift</Button>
            </div>
          </div>

          {message && (
            <p className={`text-sm mb-4 ${
              message.includes("error") || message.includes("Error") 
                ? "text-red-600" 
                : "text-green-600"
            }`}>
              {message}
            </p>
          )}

          {/* Shifts table powered by GlobalData */}
          <GlobalData
            key={reloadKey}
            title="Shifts"
            fetcher={shiftsFetcher}
            serverSide={true}
            rowsPerPage={LIMIT}
            searchEnabled={true}
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
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => startEdit(s)}
                    >
                      Edit
                    </Button>
                    <Button 
                      variant="destructive" 
                      size="sm"
                      onClick={() => confirmDelete(s._id)}
                    >
                      Delete
                    </Button>
                  </div>
                ), 
                align: 'right' 
              },
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
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>{editingId ? "Edit Shift" : "Create Shift"}</DialogTitle>
            <DialogDescription>
              {editingId ? "Update the shift details below." : "Fill the details to create a new shift."}
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Shift Name</Label>
              <Input 
                id="name"
                required 
                name="name" 
                value={form.name} 
                onChange={handleChange} 
                placeholder="Enter shift name"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="startTime">Start Time</Label>
                <Input 
                  id="startTime"
                  required 
                  type="time" 
                  name="startTime" 
                  value={form.startTime} 
                  onChange={handleChange} 
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="endTime">End Time</Label>
                <Input 
                  id="endTime"
                  required 
                  type="time" 
                  name="endTime" 
                  value={form.endTime} 
                  onChange={handleChange} 
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Days</Label>
              <div className="flex flex-wrap gap-2">
                {dayOptions.map((day) => (
                  <div key={day} className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id={`day-${day}`}
                      checked={form.days.includes(day)}
                      onChange={() => toggleDay(day)}
                      className="h-4 w-4 rounded border-gray-300"
                    />
                    <Label htmlFor={`day-${day}`} className="text-sm">
                      {day}
                    </Label>
                  </div>
                ))}
              </div>
            </div>

            <DialogFooter>
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => setDialogOpen(false)}
              >
                Cancel
              </Button>
              <Button 
                type="submit" 
                disabled={loading}
              >
                {loading ? "Saving..." : editingId ? "Update Shift" : "Create Shift"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Confirm Delete</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this shift? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => setDeleteDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button 
              variant="destructive" 
              onClick={handleDelete}
            >
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}