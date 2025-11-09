// // components/AdminCreateShift.jsx
// "use client";
// import React, { useEffect, useState } from "react";

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
//   const [search, setSearch] = useState("");
//   const [sortBy, setSortBy] = useState("createdAt");
//   const [sortOrder, setSortOrder] = useState("desc");
//   const [editingId, setEditingId] = useState(null);
//   const [loading, setLoading] = useState(false);
//   const [message, setMessage] = useState("");

//   useEffect(() => {
//     fetchShifts(1);
//   }, []);

//   async function fetchShifts(page = 1, q = search, sBy = sortBy, sOrder = sortOrder) {
//     try {
//       const url = new URL("/api/shifts", location.origin);
//       url.searchParams.set("page", page);
//       url.searchParams.set("limit", LIMIT);
//       url.searchParams.set("sortBy", sBy);
//       url.searchParams.set("sortOrder", sOrder);
//       if (q) url.searchParams.set("q", q);

//       const res = await fetch(url.toString());
//       const json = await res.json();
//       if (json.success) {
//         setShifts(json.data);
//         setMeta(json.meta || { total: 0, totalPages: 0, page, limit: LIMIT });
//       } else {
//         setMessage(json.message || "Failed to load shifts");
//       }
//     } catch (err) {
//       console.error("fetchShifts error", err);
//       setMessage("Server error while fetching shifts");
//     }
//   }

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
//         fetchShifts(meta.page);
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
//       if (json.success) fetchShifts(meta.page);
//     } catch (err) {
//       console.error("delete error", err);
//       setMessage("Server error while deleting");
//     }
//   };

//   const goToPage = (p) => {
//     if (p < 1 || p > (meta.totalPages || 1)) return;
//     fetchShifts(p);
//   };

//   const handleSortChange = (field) => {
//     if (sortBy === field) {
//       const newOrder = sortOrder === "asc" ? "desc" : "asc";
//       setSortOrder(newOrder);
//       fetchShifts(1, search, field, newOrder);
//     } else {
//       setSortBy(field);
//       setSortOrder("desc");
//       fetchShifts(1, search, field, "desc");
//     }
//   };

//   useEffect(() => {
//     const delayDebounce = setTimeout(() => {
//       fetchShifts(1, search);
//     }, 500);
//     return () => clearTimeout(delayDebounce);
//   }, [search]);

//   const dayOptions = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
//   const pageNumbers = Array.from({ length: meta.totalPages || 0 }, (_, i) => i + 1);

//   return (
//     <div className="max-w-6xl mx-auto p-6 space-y-6">
//       <h2 className="text-3xl font-bold text-center text-blue-700 dark:text-blue-400">
//         Manage Shifts
//       </h2>

//       <form
//         onSubmit={handleSubmit}
//         className="bg-white dark:bg-gray-900 p-6 rounded-2xl shadow-lg space-y-6 border border-gray-100 dark:border-gray-700"
//       >
//         <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
//           <input
//             required
//             name="name"
//             value={form.name}
//             onChange={handleChange}
//             placeholder="Shift Name"
//             className="p-3 border rounded-lg dark:bg-gray-800 focus:ring-2 focus:ring-blue-500"
//           />
//           <input
//             required
//             type="time"
//             name="startTime"
//             value={form.startTime}
//             onChange={handleChange}
//             className="p-3 border rounded-lg dark:bg-gray-800 focus:ring-2 focus:ring-blue-500"
//           />
//           <input
//             required
//             type="time"
//             name="endTime"
//             value={form.endTime}
//             onChange={handleChange}
//             className="p-3 border rounded-lg dark:bg-gray-800 focus:ring-2 focus:ring-blue-500"
//           />
//         </div>

//         <div className="p-3 border rounded-lg dark:bg-gray-800">
//           <p className="font-medium mb-2 text-gray-700 dark:text-gray-300">Select Working Days</p>
//           <div className="flex flex-wrap gap-2">
//             {dayOptions.map((d) => {
//               const selected = Array.isArray(form.days) ? form.days.includes(d) : false;
//               return (
//                 <button
//                   type="button"
//                   key={d}
//                   onClick={() => toggleDay(d)}
//                   className={`px-4 py-1 rounded-full border transition-all duration-200 ${
//                     selected
//                       ? "bg-blue-600 text-white border-blue-600"
//                       : "bg-gray-100 dark:bg-gray-700 border-gray-300 dark:border-gray-600"
//                   }`}
//                 >
//                   {d}
//                 </button>
//               );
//             })}
//           </div>
//         </div>

//         <div className="flex gap-3">
//           <button
//             disabled={loading}
//             className="px-5 py-2 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 disabled:opacity-50"
//           >
//             {editingId ? "Update Shift" : "Create Shift"}
//           </button>
//           <button
//             type="button"
//             onClick={() => {
//               resetForm();
//               setEditingId(null);
//             }}
//             className="px-5 py-2 bg-gray-300 text-gray-900 font-semibold rounded-lg hover:bg-gray-400"
//           >
//             Reset
//           </button>
//         </div>

//         {message && (
//           <p className="text-center text-sm text-gray-700 dark:text-gray-300">{message}</p>
//         )}
//       </form>

//       <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
//         <div className="flex gap-2 items-center">
//           <input
//             value={search}
//             onChange={(e) => setSearch(e.target.value)}
//             placeholder="Search name / days"
//             className="p-3 border rounded-lg dark:bg-gray-800"
//           />
//           <button
//             onClick={() => fetchShifts(1, search)}
//             className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
//           >
//             Search
//           </button>
//         </div>

//         <div className="flex gap-2 items-center">
//           <label className="text-sm">Sort:</label>
//           <select
//             value={sortBy}
//             onChange={(e) => handleSortChange(e.target.value)}
//             className="p-3 border rounded-lg dark:bg-gray-800"
//           >
//             <option value="createdAt">Created</option>
//             <option value="name">Name</option>
//           </select>
//           <button
//             onClick={() => {
//               const newOrder = sortOrder === "asc" ? "desc" : "asc";
//               setSortOrder(newOrder);
//               fetchShifts(1, search, sortBy, newOrder);
//             }}
//             className="px-3 py-1 border rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
//           >
//             {sortOrder === "asc" ? "Asc" : "Desc"}
//           </button>
//         </div>
//       </div>

//       <div className="space-y-3">
//         {shifts.length === 0 ? (
//           <p className="text-center text-gray-500">No shifts found.</p>
//         ) : (
//           shifts.map((shift) => (
//             <div
//               key={shift._id}
//               className="flex justify-between items-center p-4 bg-gray-50 dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700"
//             >
//               <div>
//                 <h4 className="font-semibold text-lg text-gray-800 dark:text-gray-100">
//                   {shift.name}
//                 </h4>
//                 <p className="text-sm text-gray-600 dark:text-gray-400">
//                   {shift.startTime} - {shift.endTime} • {shift.days?.join(", ") || "No days"}
//                 </p>
//               </div>
//               <div className="flex gap-2">
//                 <button
//                   onClick={() => startEdit(shift)}
//                   className="px-3 py-1 bg-yellow-400 rounded-lg hover:bg-yellow-500"
//                 >
//                   Edit
//                 </button>
//                 <button
//                   onClick={() => handleDelete(shift._id)}
//                   className="px-3 py-1 bg-red-500 text-white rounded-lg hover:bg-red-600"
//                 >
//                   Delete
//                 </button>
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



"use client";
import React, { useEffect, useState } from "react";
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
  const [search, setSearch] = useState("");
  const [sortBy, setSortBy] = useState("createdAt");
  const [sortOrder, setSortOrder] = useState("desc");
  const [editingId, setEditingId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  // UI states for dialogs
  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deleteId, setDeleteId] = useState(null);

  useEffect(() => {
    fetchShifts(1);
  }, []);

  async function fetchShifts(page = 1, q = search, sBy = sortBy, sOrder = sortOrder) {
    try {
      const url = new URL("/api/shifts", location.origin);
      url.searchParams.set("page", page);
      url.searchParams.set("limit", LIMIT);
      url.searchParams.set("sortBy", sBy);
      url.searchParams.set("sortOrder", sOrder);
      if (q) url.searchParams.set("q", q);

      const res = await fetch(url.toString());
      const json = await res.json();
      if (json.success) {
        setShifts(json.data);
        setMeta(json.meta || { total: 0, totalPages: 0, page, limit: LIMIT });
      } else {
        setMessage(json.message || "Failed to load shifts");
      }
    } catch (err) {
      console.error("fetchShifts error", err);
      setMessage("Server error while fetching shifts");
    }
  }

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
        fetchShifts(meta.page);
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
      if (json.success) fetchShifts(meta.page);
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
    fetchShifts(p);
  };

  const handleSortChange = (field) => {
    if (sortBy === field) {
      const newOrder = sortOrder === "asc" ? "desc" : "asc";
      setSortOrder(newOrder);
      fetchShifts(1, search, field, newOrder);
    } else {
      setSortBy(field);
      setSortOrder("desc");
      fetchShifts(1, search, field, "desc");
    }
  };

  useEffect(() => {
    const delayDebounce = setTimeout(() => {
      fetchShifts(1, search);
    }, 500);
    return () => clearTimeout(delayDebounce);
  }, [search]);

  const dayOptions = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
  const pageNumbers = Array.from({ length: meta.totalPages || 0 }, (_, i) => i + 1);

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
              {/* <Label className="text-sm">Sort:</Label>
              <select
                value={sortBy}
                onChange={(e) => handleSortChange(e.target.value)}
                className="px-3 py-2 border rounded-md dark:bg-transparent"
              >
                <option value="createdAt">Created</option>
                <option value="name">Name</option>
              </select>
              <Button
                variant={"outline"}
                onClick={() => {
                  const newOrder = sortOrder === "asc" ? "desc" : "asc";
                  setSortOrder(newOrder);
                  fetchShifts(1, search, sortBy, newOrder);
                }}
              >
                {sortOrder === "asc" ? "Asc" : "Desc"}
              </Button> */}

              <Button onClick={openCreate}>Create Shift</Button>
            </div>
          </div>

          {message && <p className="text-sm text-muted-foreground">{message}</p>}

          {/* Shifts list */}
          <div className="space-y-3">
            {shifts.length === 0 ? (
              <p className="text-center text-gray-500">No shifts found.</p>
            ) : (
              shifts.map((shift) => (
                <div
                  key={shift._id}
                  className="flex justify-between items-center p-4 bg-gray-50 dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700"
                >
                  <div>
                    <h4 className="font-semibold text-lg text-gray-800 dark:text-gray-100">
                      {shift.name}
                    </h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {shift.startTime} - {shift.endTime}
                    </p>
                    <div className="mt-2 flex gap-2">
                      {(shift.days || []).map((d) => (
                        <Badge key={d}>{d}</Badge>
                      ))}
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <Button variant={"ghost"} onClick={() => startEdit(shift)}>
                      Edit
                    </Button>
                    <Button variant={"destructive"} onClick={() => confirmDelete(shift._id)}>
                      Delete
                    </Button>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Pagination */}
          <div className="flex justify-center mt-4 gap-2 flex-wrap">
            {pageNumbers.length > 0 &&
              pageNumbers.map((p) => (
                <Button
                  key={p}
                  onClick={() => goToPage(p)}
                  className={p === meta.page ? "bg-gray-800 text-white" : ""}
                >
                  {p}
                </Button>
              ))}
          </div>
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
