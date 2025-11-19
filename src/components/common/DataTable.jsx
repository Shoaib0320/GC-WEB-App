// // "use client";

// // import { useState, useMemo } from "react";
// // import { motion } from "framer-motion";
// // import { Button } from "@/components/ui/button";
// // import { Input } from "@/components/ui/input";
// // import {
// //   DropdownMenu,
// //   DropdownMenuContent,
// //   DropdownMenuItem,
// //   DropdownMenuTrigger,
// // } from "@/components/ui/dropdown-menu";
// // import { Filter, Search } from "lucide-react";

// // export default function DataTable({
// //   title,
// //   icon: Icon,
// //   columns,
// //   data = [],
// //   loading = false,
// //   rowsPerPage = 5,
// //   searchEnabled = false,
// //   filterOptions = [],
// //   serverSide = false,
// //   currentPage: propCurrentPage = 1,
// //   totalPages: propTotalPages = 1,
// //   onPageChange,
// //   onSearchChange,
// //   onFilterChange,
// // }) {
// //   const [currentPage, setCurrentPage] = useState(propCurrentPage);
// //   const [filter, setFilter] = useState("all");
// //   const [searchQuery, setSearchQuery] = useState("");

// //   // Filtering + Search (Client Side)
// //   const filteredData = useMemo(() => {
// //     if (serverSide) return data;

// //     let filtered = data;

// //     // Search filter
// //     if (searchEnabled && searchQuery.trim()) {
// //       filtered = filtered.filter((item) =>
// //         columns.some((col) => {
// //           try {
// //             const value = col.render ? col.render(item) : item[col.key];
// //             return String(value).toLowerCase().includes(searchQuery.toLowerCase());
// //           } catch {
// //             return false;
// //           }
// //         })
// //       );
// //     }

// //     // Custom filter function
// //     if (filter !== "all") {
// //       const selectedFilter = filterOptions.find((opt) => opt.value === filter);
// //       if (selectedFilter?.filterFn) {
// //         filtered = filtered.filter(selectedFilter.filterFn);
// //       }
// //     }

// //     return filtered;
// //   }, [data, searchQuery, filter, columns, searchEnabled, filterOptions, serverSide]);

// //   // Pagination
// //   const totalPages = serverSide ? Math.max(1, propTotalPages) : Math.ceil(filteredData.length / rowsPerPage);
// //   const startIndex = (currentPage - 1) * rowsPerPage;
// //   const currentData = serverSide ? data : filteredData.slice(startIndex, startIndex + rowsPerPage);

// //   const fadeUp = {
// //     hidden: { opacity: 0, y: 20 },
// //     visible: (i = 1) => ({
// //       opacity: 1,
// //       y: 0,
// //       transition: { delay: i * 0.05, duration: 0.3 },
// //     }),
// //   };

// //   const handlePrev = () => {
// //     if (currentPage > 1) {
// //       const next = currentPage - 1;
// //       setCurrentPage(next);
// //       if (serverSide) onPageChange?.(next);
// //     }
// //   };

// //   const handleNext = () => {
// //     if (currentPage < totalPages) {
// //       const next = currentPage + 1;
// //       setCurrentPage(next);
// //       if (serverSide) onPageChange?.(next);
// //     }
// //   };

// //   const handleSearch = (value) => {
// //     setSearchQuery(value);
// //     setCurrentPage(1); // Reset to first page when searching
// //     if (serverSide) onSearchChange?.(value);
// //   };

// //   const handleFilter = (value) => {
// //     setFilter(value);
// //     setCurrentPage(1); // Reset to first page when filtering
// //     if (serverSide) onFilterChange?.(value);
// //   };

// //   return (
// //     <motion.div initial="hidden" animate="visible" variants={fadeUp} className="space-y-4 w-full">

// //       {/* Header */}
// //       <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
// //         {title && (
// //           <h2 className="text-lg sm:text-xl font-semibold flex items-center gap-2">
// //             {Icon && <Icon className="h-5 w-5 text-blue-600" />}
// //             {title}
// //           </h2>
// //         )}

// //         <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
// //           {/* Search */}
// //           {searchEnabled && (
// //             <div className="relative flex-1 sm:flex-initial">
// //               <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 h-4 w-4" />
// //               <Input
// //                 type="text"
// //                 placeholder="Search..."
// //                 value={searchQuery}
// //                 onChange={(e) => handleSearch(e.target.value)}
// //                 className="pl-10 w-full sm:w-64"
// //               />
// //             </div>
// //           )}

// //           {/* Filter */}
// //           {filterOptions.length > 0 && (
// //             <DropdownMenu>
// //               <DropdownMenuTrigger asChild>
// //                 <Button variant="outline" size="sm" className="flex items-center gap-2">
// //                   <Filter className="w-4 h-4" />
// //                   Filter
// //                 </Button>
// //               </DropdownMenuTrigger>

// //               <DropdownMenuContent align="end" className="w-40">
// //                 <DropdownMenuItem onClick={() => handleFilter("all")}>
// //                   All
// //                 </DropdownMenuItem>
// //                 {filterOptions.map((option) => (
// //                   <DropdownMenuItem
// //                     key={option.value}
// //                     onClick={() => handleFilter(option.value)}
// //                   >
// //                     {option.label}
// //                   </DropdownMenuItem>
// //                 ))}
// //               </DropdownMenuContent>
// //             </DropdownMenu>
// //           )}
// //         </div>
// //       </div>

// //       {/* TABLE ========================== */}
// //       {loading ? (
// //         <div className="flex justify-center items-center py-12">
// //           <p className="text-center text-gray-500">Loading...</p>
// //         </div>
// //       ) : (
// //         <div className="w-full rounded-xl border bg-white shadow-sm overflow-hidden">

// //           {/* Scroll container */}
// //           <div
// //             className="overflow-x-auto overflow-y-auto no-scrollbar"
// //             style={{ maxHeight: `min(70vh, ${rowsPerPage * 68 + 160}px)` }}
// //           >
// //             <table className="min-w-[750px] w-full text-sm border-collapse">

// //               {/* Sticky Header */}
// //               <thead className="bg-gray-100 sticky top-0 z-10 shadow-sm">
// //                 <tr>
// //                   {columns.map((col, i) => (
// //                     <th
// //                       key={i}
// //                       className={`px-4 py-3 text-gray-700 font-semibold border-b ${
// //                         col.align === "right" ? "text-right" : "text-left"
// //                       }`}
// //                     >
// //                       {col.label}
// //                     </th>
// //                   ))}
// //                 </tr>
// //               </thead>

// //               <tbody className="bg-white">
// //                 {currentData.length === 0 ? (
// //                   <tr>
// //                     <td colSpan={columns.length} className="text-center py-8 text-gray-500">
// //                       No data found.
// //                     </td>
// //                   </tr>
// //                 ) : (
// //                   currentData.map((row, index) => (
// //                     <motion.tr
// //                       key={row._id || row.id || index}
// //                       custom={index}
// //                       initial="hidden"
// //                       animate="visible"
// //                       variants={fadeUp}
// //                       className="border-b hover:bg-gray-50 transition-colors"
// //                     >
// //                       {columns.map((col, colIndex) => (
// //                         <td
// //                           key={colIndex}
// //                           className={`px-4 py-3 text-gray-800 break-words ${
// //                             col.align === "right" ? "text-right" : "text-left"
// //                           }`}
// //                         >
// //                           {col.render ? col.render(row) : row[col.key]}
// //                         </td>
// //                       ))}
// //                     </motion.tr>
// //                   ))
// //                 )}
// //               </tbody>

// //             </table>
// //           </div>

// //           {/* Pagination */}
// //           {totalPages > 1 && (
// //             <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between border-t px-4 py-3 bg-gray-50 text-sm gap-2">
// //               <span className="text-gray-600 text-center sm:text-left">
// //                 Page <strong>{currentPage}</strong> of {totalPages}
// //               </span>

// //               <div className="flex justify-center sm:justify-end gap-2">
// //                 <Button 
// //                   variant="outline" 
// //                   size="sm" 
// //                   disabled={currentPage === 1} 
// //                   onClick={handlePrev}
// //                 >
// //                   Previous
// //                 </Button>

// //                 <Button 
// //                   variant="outline" 
// //                   size="sm" 
// //                   disabled={currentPage === totalPages} 
// //                   onClick={handleNext}
// //                 >
// //                   Next
// //                 </Button>
// //               </div>
// //             </div>
// //           )}

// //         </div>
// //       )}
// //     </motion.div>
// //   );
// // }








// // ===== File: src/components/common/DataTable.jsx (UPDATED) =====

// "use client";

// import { useState, useMemo, useEffect } from "react";
// import { motion } from "framer-motion";
// import { Button } from "@/components/ui/button";
// import { Input } from "@/components/ui/input";
// import {
//   DropdownMenu,
//   DropdownMenuContent,
//   DropdownMenuItem,
//   DropdownMenuTrigger,
// } from "@/components/ui/dropdown-menu";
// import { Filter, Search } from "lucide-react";

// /**
//  * Improvements in this updated DataTable:
//  * - Fully responsive: on small screens (mobile) the table switches to stacked card/list view.
//  * - Horizontal scrolling made reliable for narrow screens (overflow-x-auto with touch-scrolling).
//  * - Table uses full-width on large screens and allows natural overflow on small screens.
//  * - Keeps server-side pagination behaviour and syncs current page prop with internal state.
//  * - Safe rendering when columns provide render() functions (re-uses those where possible).
//  */

// export default function DataTable({
//   title,
//   icon: Icon,
//   columns,
//   data = [],
//   loading = false,
//   rowsPerPage = 5,
//   searchEnabled = false,
//   filterOptions = [],
//   serverSide = false,
//   currentPage: propCurrentPage = 1,
//   totalPages: propTotalPages = 1,
//   onPageChange,
//   onSearchChange,
//   onFilterChange,
// }) {
//   const [currentPage, setCurrentPage] = useState(propCurrentPage);
//   const [filter, setFilter] = useState("all");
//   const [searchQuery, setSearchQuery] = useState("");
//   const [isSmallScreen, setIsSmallScreen] = useState(false);

//   // Keep internal page in sync with prop
//   useEffect(() => {
//     setCurrentPage(propCurrentPage);
//   }, [propCurrentPage]);

//   // Watch for window resize to switch to card view on small screens
//   useEffect(() => {
//     const check = () => setIsSmallScreen(window.innerWidth < 640);
//     check();
//     window.addEventListener("resize", check);
//     return () => window.removeEventListener("resize", check);
//   }, []);

//   // Filtering + Search (Client Side)
//   const filteredData = useMemo(() => {
//     if (serverSide) return data;

//     let filtered = data;

//     // Search filter
//     if (searchEnabled && searchQuery.trim()) {
//       const q = searchQuery.toLowerCase();
//       filtered = filtered.filter((item) =>
//         columns.some((col) => {
//           try {
//             // If column provides a render function, try to extract a string from it.
//             if (col.render) {
//               // col.render may return JSX; convert by rendering a string fallback using key
//               const val = item[col.key] ?? "";
//               return String(val).toLowerCase().includes(q);
//             }
//             const value = item[col.key];
//             return String(value || "").toLowerCase().includes(q);
//           } catch {
//             return false;
//           }
//         })
//       );
//     }

//     // Custom filter function
//     if (filter !== "all") {
//       const selectedFilter = filterOptions.find((opt) => opt.value === filter);
//       if (selectedFilter?.filterFn) {
//         filtered = filtered.filter(selectedFilter.filterFn);
//       }
//     }

//     return filtered;
//   }, [data, searchQuery, filter, columns, searchEnabled, filterOptions, serverSide]);

//   // Pagination
//   const totalPages = serverSide ? Math.max(1, propTotalPages) : Math.max(1, Math.ceil(filteredData.length / rowsPerPage));
//   const startIndex = (currentPage - 1) * rowsPerPage;
//   const currentData = serverSide ? data : filteredData.slice(startIndex, startIndex + rowsPerPage);

//   const fadeUp = {
//     hidden: { opacity: 0, y: 20 },
//     visible: (i = 1) => ({
//       opacity: 1,
//       y: 0,
//       transition: { delay: i * 0.05, duration: 0.3 },
//     }),
//   };

//   const handlePrev = () => {
//     if (currentPage > 1) {
//       const next = currentPage - 1;
//       setCurrentPage(next);
//       if (serverSide) onPageChange?.(next);
//     }
//   };

//   const handleNext = () => {
//     if (currentPage < totalPages) {
//       const next = currentPage + 1;
//       setCurrentPage(next);
//       if (serverSide) onPageChange?.(next);
//     }
//   };

//   const handleSearch = (value) => {
//     setSearchQuery(value);
//     setCurrentPage(1); // Reset to first page when searching
//     if (serverSide) onSearchChange?.(value);
//   };

//   const handleFilter = (value) => {
//     setFilter(value);
//     setCurrentPage(1);
//     if (serverSide) onFilterChange?.(value);
//   };

//   return (
//     <motion.div initial="hidden" animate="visible" variants={fadeUp} className="space-y-4 w-full">

//       {/* Header */}
//       <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
//         {title && (
//           <h2 className="text-lg sm:text-xl font-semibold flex items-center gap-2">
//             {Icon && <Icon className="h-5 w-5 text-blue-600" />}
//             {title}
//           </h2>
//         )}

//         <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
//           {/* Search */}
//           {searchEnabled && (
//             <div className="relative flex-1 sm:flex-initial">
//               <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 h-4 w-4" />
//               <Input
//                 type="text"
//                 placeholder="Search..."
//                 value={searchQuery}
//                 onChange={(e) => handleSearch(e.target.value)}
//                 className="pl-10 w-full sm:w-64"
//               />
//             </div>
//           )}

//           {/* Filter */}
//           {filterOptions.length > 0 && (
//             <DropdownMenu>
//               <DropdownMenuTrigger asChild>
//                 <Button variant="outline" size="sm" className="flex items-center gap-2">
//                   <Filter className="w-4 h-4" />
//                   Filter
//                 </Button>
//               </DropdownMenuTrigger>

//               <DropdownMenuContent align="end" className="w-40">
//                 <DropdownMenuItem onClick={() => handleFilter("all")}>All</DropdownMenuItem>
//                 {filterOptions.map((option) => (
//                   <DropdownMenuItem key={option.value} onClick={() => handleFilter(option.value)}>
//                     {option.label}
//                   </DropdownMenuItem>
//                 ))}
//               </DropdownMenuContent>
//             </DropdownMenu>
//           )}
//         </div>
//       </div>

//       {/* TABLE or CARD LIST (responsive) */}
//       {loading ? (
//         <div className="flex justify-center items-center py-12">
//           <p className="text-center text-gray-500">Loading...</p>
//         </div>
//       ) : (
//         <div className="w-full rounded-xl border bg-white shadow-sm overflow-hidden">

//           {/* Small screen: stacked cards */}
//           {isSmallScreen ? (
//             <div className="p-3 space-y-3">
//               {currentData.length === 0 ? (
//                 <div className="text-center py-8 text-gray-500">No data found.</div>
//               ) : (
//                 currentData.map((row, idx) => (
//                   <div
//                     key={row._id || row.id || idx}
//                     className="border rounded-lg p-3 bg-white shadow-sm"
//                   >
//                     <div className="flex items-start justify-between gap-3">
//                       <div className="flex-1 min-w-0">
//                         {/* Render first column (usually name) */}
//                         {columns[0] ? (
//                           <div className="font-medium text-gray-900 truncate">
//                             {columns[0].render ? columns[0].render(row) : row[columns[0].key]}
//                           </div>
//                         ) : null}

//                         {/* Secondary: email or message snippet */}
//                         <div className="text-sm text-gray-500 mt-1 truncate">
//                           {(() => {
//                             const msgCol = columns.find((c) => c.key === "message" || c.label?.toLowerCase?.()?.includes("message"));
//                             if (msgCol) return msgCol.render ? msgCol.render(row) : String(row[msgCol.key] || "").slice(0, 120);

//                             const emailCol = columns.find((c) => c.key === "email");
//                             if (emailCol) return emailCol.render ? emailCol.render(row) : row[emailCol.key];

//                             return null;
//                           })()}
//                         </div>

//                         {/* Small meta row: status + date */}
//                         <div className="mt-3 flex items-center gap-2 text-sm">
//                           {(() => {
//                             const statusCol = columns.find((c) => c.key === "status");
//                             if (statusCol) return statusCol.render ? statusCol.render(row) : (row.status || "");
//                             return null;
//                           })()}

//                           <div className="text-gray-400">•</div>

//                           {(() => {
//                             const dateCol = columns.find((c) => c.key === "createdAt" || c.key === "date");
//                             if (dateCol) return dateCol.render ? dateCol.render(row) : (row[dateCol.key] || "");
//                             return null;
//                           })()}
//                         </div>
//                       </div>

//                       <div className="flex-shrink-0 ml-2 flex items-start gap-2">
//                         {/* Actions column (if provided) */}
//                         {columns.map((c, ci) => {
//                           if ((c.key || c.label || "").toLowerCase() === "actions" || c.align === "right") {
//                             return (
//                               <div key={ci} className="flex gap-2">
//                                 {c.render ? c.render(row) : null}
//                               </div>
//                             );
//                           }
//                           return null;
//                         })}
//                       </div>
//                     </div>
//                   </div>
//                 ))
//               )}
//             </div>
//           ) : (
//             /* Desktop / larger screens: regular table with reliable horizontal scrolling */
//             <div
//               className="overflow-x-auto no-scrollbar"
//               style={{ WebkitOverflowScrolling: "touch" }}
//             >
//               <table className="min-w-full w-full text-sm border-collapse">

//                 {/* Sticky Header */}
//                 <thead className="bg-gray-100 sticky top-0 z-10 shadow-sm">
//                   <tr>
//                     {columns.map((col, i) => (
//                       <th
//                         key={i}
//                         className={`px-4 py-3 text-gray-700 font-semibold border-b ${
//                           col.align === "right" ? "text-right" : "text-left"
//                         }`}
//                       >
//                         {col.label}
//                       </th>
//                     ))}
//                   </tr>
//                 </thead>

//                 <tbody className="bg-white">
//                   {currentData.length === 0 ? (
//                     <tr>
//                       <td colSpan={columns.length} className="text-center py-8 text-gray-500">
//                         No data found.
//                       </td>
//                     </tr>
//                   ) : (
//                     currentData.map((row, index) => (
//                       <motion.tr
//                         key={row._id || row.id || index}
//                         custom={index}
//                         initial="hidden"
//                         animate="visible"
//                         variants={fadeUp}
//                         className="border-b hover:bg-gray-50 transition-colors"
//                       >
//                         {columns.map((col, colIndex) => (
//                           <td
//                             key={colIndex}
//                             className={`px-4 py-3 text-gray-800 break-words ${
//                               col.align === "right" ? "text-right" : "text-left"
//                             }`}
//                           >
//                             {col.render ? col.render(row) : row[col.key]}
//                           </td>
//                         ))}
//                       </motion.tr>
//                     ))
//                   )}
//                 </tbody>

//               </table>
//             </div>
//           )}

//           {/* Pagination */}
//           {totalPages > 1 && (
//             <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between border-t px-4 py-3 bg-gray-50 text-sm gap-2">
//               <span className="text-gray-600 text-center sm:text-left">
//                 Page <strong>{currentPage}</strong> of {totalPages}
//               </span>

//               <div className="flex justify-center sm:justify-end gap-2">
//                 <Button 
//                   variant="outline" 
//                   size="sm" 
//                   disabled={currentPage === 1} 
//                   onClick={handlePrev}
//                 >
//                   Previous
//                 </Button>

//                 <Button 
//                   variant="outline" 
//                   size="sm" 
//                   disabled={currentPage === totalPages} 
//                   onClick={handleNext}
//                 >
//                   Next
//                 </Button>
//               </div>
//             </div>
//           )}

//         </div>
//       )}
//     </motion.div>
//   );
// }


// // ===== Notes =====
// // Replace your existing src/components/common/DataTable.jsx with this file.
// // This update intentionally provides a mobile-friendly stacked card list and
// // a desktop table with reliable horizontal scrolling. It avoids forcing a
// // large fixed min-width on the table so the layout won't break on small screens.

// // If you'd like, I can also produce an alternative that keeps the exact table
// // on mobile but forces horizontal scrolling (instead of stacked cards). The
// // stacked card approach typically reads better on mobile and avoids cramped
// // tables.








// File: src/components/common/DataTable.jsx
"use client";

import { useState, useMemo, useEffect } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Filter, Search, ChevronLeft, ChevronRight } from "lucide-react";

export default function DataTable({
  title,
  icon: Icon,
  columns,
  data = [],
  loading = false,
  rowsPerPage = 10,
  searchEnabled = false,
  filterOptions = [],
  serverSide = false,
  currentPage: propCurrentPage = 1,
  totalPages: propTotalPages = 1,
  onPageChange,
  onSearchChange,
  onFilterChange,
}) {
  const [currentPage, setCurrentPage] = useState(propCurrentPage);
  const [filter, setFilter] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");

  // Keep internal page in sync with prop
  useEffect(() => {
    setCurrentPage(propCurrentPage);
  }, [propCurrentPage]);

  // Filtering + Search (Client Side)
  const filteredData = useMemo(() => {
    if (serverSide) return data;

    let filtered = data;

    // Search filter
    if (searchEnabled && searchQuery.trim()) {
      filtered = filtered.filter((item) =>
        columns.some((col) => {
          try {
            const value = col.render ? col.render(item) : item[col.key];
            return String(value).toLowerCase().includes(searchQuery.toLowerCase());
          } catch {
            return false;
          }
        })
      );
    }

    // Custom filter function
    if (filter !== "all") {
      const selectedFilter = filterOptions.find((opt) => opt.value === filter);
      if (selectedFilter?.filterFn) {
        filtered = filtered.filter(selectedFilter.filterFn);
      }
    }

    return filtered;
  }, [data, searchQuery, filter, columns, searchEnabled, filterOptions, serverSide]);

  // Pagination
  const totalPages = serverSide ? Math.max(1, propTotalPages) : Math.ceil(filteredData.length / rowsPerPage);
  const startIndex = (currentPage - 1) * rowsPerPage;
  const currentData = serverSide ? data : filteredData.slice(startIndex, startIndex + rowsPerPage);
  const totalItems = serverSide ? (propTotalPages * rowsPerPage) : filteredData.length;

  const fadeUp = {
    hidden: { opacity: 0, y: 20 },
    visible: (i = 1) => ({
      opacity: 1,
      y: 0,
      transition: { delay: i * 0.05, duration: 0.3 },
    }),
  };

  const handlePrev = () => {
    if (currentPage > 1) {
      const next = currentPage - 1;
      setCurrentPage(next);
      if (serverSide) onPageChange?.(next);
    }
  };

  const handleNext = () => {
    if (currentPage < totalPages) {
      const next = currentPage + 1;
      setCurrentPage(next);
      if (serverSide) onPageChange?.(next);
    }
  };

  const handleSearch = (value) => {
    setSearchQuery(value);
    setCurrentPage(1);
    if (serverSide) onSearchChange?.(value);
  };

  const handleFilter = (value) => {
    setFilter(value);
    setCurrentPage(1);
    if (serverSide) onFilterChange?.(value);
  };

  // Calculate showing range
  const showingStart = (currentPage - 1) * rowsPerPage + 1;
  const showingEnd = Math.min(currentPage * rowsPerPage, totalItems);

  return (
    <motion.div initial="hidden" animate="visible" variants={fadeUp} className="space-y-4 w-full">

      {/* Header - Improved Responsive */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        {title && (
          <h2 className="text-lg sm:text-xl font-semibold flex items-center gap-2 truncate">
            {Icon && <Icon className="h-5 w-5 text-blue-600 flex-shrink-0" />}
            <span className="truncate">{title}</span>
          </h2>
        )}

        <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
          {/* Search - Full width on mobile */}
          {searchEnabled && (
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                type="text"
                placeholder="Search..."
                value={searchQuery}
                onChange={(e) => handleSearch(e.target.value)}
                className="pl-10 w-full"
              />
            </div>
          )}

          {/* Filter */}
          {filterOptions.length > 0 && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm" className="flex items-center gap-2 w-full sm:w-auto">
                  <Filter className="w-4 h-4" />
                  <span>Filter</span>
                </Button>
              </DropdownMenuTrigger>

              <DropdownMenuContent align="end" className="w-40">
                <DropdownMenuItem onClick={() => handleFilter("all")}>
                  All
                </DropdownMenuItem>
                {filterOptions.map((option) => (
                  <DropdownMenuItem
                    key={option.value}
                    onClick={() => handleFilter(option.value)}
                  >
                    {option.label}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>
      </div>

      {/* TABLE WITH SHADCN COMPONENTS */}
      {loading ? (
        <div className="flex justify-center items-center py-12">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
            <p className="text-gray-500 mt-2">Loading...</p>
          </div>
        </div>
      ) : (
        <div className="w-full rounded-lg border bg-white shadow-sm overflow-hidden">

          {/* Table Container with Responsive Scroll */}
          <div className="overflow-x-auto">
            <Table className="w-full">
              {/* Table Header */}
              <TableHeader className="bg-gray-50/80 sticky top-0 backdrop-blur-sm">
                <TableRow className="hover:bg-transparent">
                  {columns.map((col, i) => (
                    <TableHead 
                      key={i}
                      className={`px-3 py-3 text-xs sm:text-sm font-semibold text-gray-700 whitespace-nowrap ${
                        col.align === "right" ? "text-right" : "text-left"
                      } ${col.key === 'actions' ? 'w-20' : ''}`}
                    >
                      {col.label}
                    </TableHead>
                  ))}
                </TableRow>
              </TableHeader>

              {/* Table Body */}
              <TableBody>
                {currentData.length === 0 ? (
                  <TableRow>
                    <TableCell 
                      colSpan={columns.length} 
                      className="text-center py-8 text-gray-500 text-sm"
                    >
                      No data found.
                    </TableCell>
                  </TableRow>
                ) : (
                  currentData.map((row, index) => (
                    <motion.tr
                      key={row._id || row.id || index}
                      custom={index}
                      initial="hidden"
                      animate="visible"
                      variants={fadeUp}
                      as={TableRow}
                      className="border-b hover:bg-gray-50/50 transition-colors"
                    >
                      {columns.map((col, colIndex) => (
                        <TableCell
                          key={colIndex}
                          className={`px-3 py-3 text-xs sm:text-sm text-gray-600 ${
                            col.align === "right" ? "text-right" : "text-left"
                          } ${col.key === 'actions' ? 'w-20' : ''}`}
                        >
                          <div className={`flex items-center ${
                            col.align === "right" ? "justify-end" : "justify-start"
                          }`}>
                            {col.render ? col.render(row) : row[col.key]}
                          </div>
                        </TableCell>
                      ))}
                    </motion.tr>
                  ))
                )}
              </TableBody>
            </Table>
          </div>

          {/* Pagination - Enhanced Responsive */}
          {totalPages > 1 && (
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-t px-3 sm:px-4 py-3 bg-gray-50/50 text-xs sm:text-sm">
              {/* Showing info */}
              <div className="text-center sm:text-left text-gray-600">
                Showing <strong>{showingStart}</strong> to <strong>{showingEnd}</strong> of{" "}
                <strong>{totalItems}</strong> results
              </div>

              {/* Pagination Controls */}
              <div className="flex items-center justify-between sm:justify-end gap-2">
                {/* Rows per page selector */}
                <div className="flex items-center gap-2 text-gray-600">
                  <span className="hidden sm:inline">Rows per page</span>
                  <Select value={rowsPerPage.toString()} disabled>
                    <SelectTrigger className="h-8 w-16">
                      <SelectValue placeholder={rowsPerPage} />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="5">5</SelectItem>
                      <SelectItem value="10">10</SelectItem>
                      <SelectItem value="20">20</SelectItem>
                      <SelectItem value="50">50</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Page info */}
                <div className="flex items-center gap-1 mx-2 text-gray-600">
                  <span className="hidden sm:inline">Page</span>
                  <span className="font-medium">{currentPage}</span>
                  <span>of</span>
                  <span className="font-medium">{totalPages}</span>
                </div>

                {/* Navigation buttons */}
                <div className="flex items-center gap-1">
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={currentPage === 1}
                    onClick={handlePrev}
                    className="h-8 w-8 p-0"
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={currentPage === totalPages}
                    onClick={handleNext}
                    className="h-8 w-8 p-0"
                  >
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </motion.div>
  );
}