// "use client";

// import { useState, useMemo } from "react";
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

// export default function DataTable({
//   title,
//   icon: Icon,
//   columns,
//   data = [],
//   loading = false,
//   rowsPerPage = 5,
//   searchEnabled = false,
//   filterOptions = [], // Array of { label, value, filterFn }
//   // Server-side options
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

//   // 🧠 Apply Search and Filter (client-side only)
//   const filteredData = useMemo(() => {
//     if (serverSide) return data;
//     let filtered = data;

//     // Apply search if enabled
//     if (searchEnabled && searchQuery.trim()) {
//       filtered = filtered.filter((item) =>
//         columns.some((col) => {
//           const value = col.render ? col.render(item) : item[col.key];
//           try {
//             return String(value).toLowerCase().includes(searchQuery.toLowerCase());
//           } catch (e) {
//             return false;
//           }
//         })
//       );
//     }

//     // Apply filter
//     if (filter !== "all") {
//       const selectedFilter = filterOptions.find((opt) => opt.value === filter);
//       if (selectedFilter && selectedFilter.filterFn) {
//         filtered = filtered.filter(selectedFilter.filterFn);
//       }
//     }

//     return filtered;
//   }, [data, searchQuery, filter, columns, searchEnabled, filterOptions, serverSide]);

//   // 🧮 Pagination logic (client-side)
//   const totalPages = serverSide ? Math.max(1, propTotalPages) : Math.ceil(filteredData.length / rowsPerPage);
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
//       if (serverSide && onPageChange) onPageChange(next);
//       setCurrentPage(next);
//     }
//   };
//   const handleNext = () => {
//     if (currentPage < totalPages) {
//       const next = currentPage + 1;
//       if (serverSide && onPageChange) onPageChange(next);
//       setCurrentPage(next);
//     }
//   };

//   const handleFilter = (type) => {
//     setFilter(type);
//     if (serverSide && onFilterChange) onFilterChange(type);
//     setCurrentPage(1);
//   };

//   const handleSearchChange = (e) => {
//     setSearchQuery(e.target.value);
//     if (serverSide && onSearchChange) onSearchChange(e.target.value);
//     setCurrentPage(1);
//   };

//   return (
//     <motion.div
//       initial="hidden"
//       animate="visible"
//       variants={fadeUp}
//       className="space-y-4 w-full"
//     >
//       {/* Header with Search and Filter */}
//       <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
//         {title && (
//           <h2 className="text-lg sm:text-xl font-semibold flex items-center gap-2">
//             {Icon && <Icon className="h-5 w-5 text-blue-600" />}
//             {title}
//           </h2>
//         )}

//         <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
//           {searchEnabled && (
//             <div className="relative flex-1 sm:flex-initial">
//               <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
//               <Input
//                 type="text"
//                 placeholder="Search..."
//                 value={searchQuery}
//                 onChange={handleSearchChange}
//                 className="pl-10 w-full sm:w-64"
//               />
//             </div>
//           )}

//           {filterOptions.length > 0 && (
//             <DropdownMenu>
//               <DropdownMenuTrigger asChild>
//                 <Button variant="outline" size="sm" className="flex items-center gap-2 w-full sm:w-auto">
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

//       {/* Table Section */}
//           {loading ? (
//         <p className="text-gray-500 text-center sm:text-left">Loading data...</p>
//       ) : (
//         // Outer container keeps horizontal scrolling for wide tables.
//         // Inner container constrains vertical space so vertical scrolling
//         // happens inside the table area (not the whole page). This keeps
//         // the page height stable while allowing the header to be sticky
//         // relative to the inner scroll container.
//         <div className="overflow-x-auto rounded-xl border bg-white">
//           <div
//             className="overflow-x-auto"
//             // constrain table height relative to viewport but also based on rowsPerPage
//             style={{ maxHeight: `min(70vh, ${rowsPerPage * 64 + 160}px)` }}
//           >
//             <table className="min-w-[600px] w-full text-sm">
//               <thead className="bg-gray-50 text-gray-600 sticky top-0">
//                 <tr>
//                   {columns.map((col, i) => (
//                     <th
//                       key={i}
//                       className={`px-4 py-3 font-medium ${
//                         col.align === "right" ? "text-right" : "text-left"
//                       }`}
//                     >
//                       {col.label}
//                     </th>
//                   ))}
//                 </tr>
//               </thead>
//               <tbody>
//                 {currentData.length === 0 ? (
//                   <tr>
//                     <td
//                       colSpan={columns.length}
//                       className="text-center py-6 text-gray-800"
//                     >
//                       No data found.
//                     </td>
//                   </tr>
//                 ) : (
//                   currentData.map((row, index) => (
//                     <motion.tr
//                       key={row._id || index}
//                       custom={index}
//                       initial="hidden"
//                       animate="visible"
//                       variants={fadeUp}
//                       className="border-t hover:bg-gray-50 transition"
//                     >
//                       {columns.map((col, colIndex) => (
//                         <td
//                           key={colIndex}
//                           className={`px-4 py-3 break-words ${
//                             col.align === "right" ? "text-right" : "text-left"
//                           }`}
//                         >
//                           {col.render ? col.render(row) : row[col.key]}
//                         </td>
//                       ))}
//                     </motion.tr>
//                   ))
//                 )}
//               </tbody>
//             </table>
//           </div>

//           {/* Pagination Footer */}
//           {totalPages > 1 && (
//             // Pagination footer — not sticky to avoid layout/scroll issues
//             <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between border-t px-4 py-3 bg-gray-50 text-sm gap-2">
//               <span className="text-gray-600 text-center sm:text-left">
//                 Page <strong>{serverSide ? propCurrentPage : currentPage}</strong> of {totalPages}
//               </span>

//               <div className="flex justify-center sm:justify-end gap-2">
//                 <Button
//                   variant="outline"
//                   size="sm"
//                   disabled={(serverSide ? propCurrentPage : currentPage) === 1}
//                   onClick={() => {
//                     const pageTo = (serverSide ? propCurrentPage : currentPage) - 1;
//                     if (serverSide && onPageChange) onPageChange(pageTo);
//                     setCurrentPage(pageTo);
//                   }}
//                 >
//                   Previous
//                 </Button>
//                 <Button
//                   variant="outline"
//                   size="sm"
//                   disabled={(serverSide ? propCurrentPage : currentPage) === totalPages}
//                   onClick={() => {
//                     const pageTo = (serverSide ? propCurrentPage : currentPage) + 1;
//                     if (serverSide && onPageChange) onPageChange(pageTo);
//                     setCurrentPage(pageTo);
//                   }}
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





"use client";

import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Filter, Search } from "lucide-react";

export default function DataTable({
  title,
  icon: Icon,
  columns,
  data = [],
  loading = false,
  rowsPerPage = 5,
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

  // Filtering + Search (Client Side)
  const filteredData = useMemo(() => {
    if (serverSide) return data;

    let filtered = data;

    if (searchEnabled && searchQuery.trim()) {
      filtered = filtered.filter((item) =>
        columns.some((col) => {
          const value = col.render ? col.render(item) : item[col.key];
          try {
            return String(value).toLowerCase().includes(searchQuery.toLowerCase());
          } catch {
            return false;
          }
        })
      );
    }

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
      if (serverSide) onPageChange?.(next);
      setCurrentPage(next);
    }
  };

  const handleNext = () => {
    if (currentPage < totalPages) {
      const next = currentPage + 1;
      if (serverSide) onPageChange?.(next);
      setCurrentPage(next);
    }
  };

  return (
    <motion.div initial="hidden" animate="visible" variants={fadeUp} className="space-y-4 w-full">

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        {title && (
          <h2 className="text-lg sm:text-xl font-semibold flex items-center gap-2">
            {Icon && <Icon className="h-5 w-5 text-blue-600" />}
            {title}
          </h2>
        )}

        <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
          {/* Search */}
          {searchEnabled && (
            <div className="relative flex-1 sm:flex-initial">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                type="text"
                placeholder="Search..."
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  if (serverSide) onSearchChange?.(e.target.value);
                }}
                className="pl-10 w-full sm:w-64"
              />
            </div>
          )}

          {/* Filter */}
          {filterOptions.length > 0 && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm" className="flex items-center gap-2">
                  <Filter className="w-4 h-4" />
                  Filter
                </Button>
              </DropdownMenuTrigger>

              <DropdownMenuContent align="end" className="w-40">
                <DropdownMenuItem onClick={() => setFilter("all")}>All</DropdownMenuItem>
                {filterOptions.map((option) => (
                  <DropdownMenuItem
                    key={option.value}
                    onClick={() => {
                      setFilter(option.value);
                      if (serverSide) onFilterChange?.(option.value);
                    }}
                  >
                    {option.label}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>
      </div>

      {/* TABLE ========================== */}
      {loading ? (
        <p className="text-center text-gray-500">Loading...</p>
      ) : (
        <div className="w-full rounded-xl border bg-white shadow-sm overflow-hidden">

          {/* Scroll container */}
          <div
            className="overflow-x-auto overflow-y-auto no-scrollbar"
            style={{ maxHeight: `min(70vh, ${rowsPerPage * 68 + 160}px)` }}
          >
            <table className="min-w-[750px] w-full text-sm border-collapse">

              {/* Sticky Header */}
              <thead className="bg-gray-100 sticky top-0 z-10 shadow-sm">
                <tr>
                  {columns.map((col, i) => (
                    <th
                      key={i}
                      className={`px-4 py-3 text-gray-700 font-semibold border-b ${
                        col.align === "right" ? "text-right" : "text-left"
                      }`}
                    >
                      {col.label}
                    </th>
                  ))}
                </tr>
              </thead>

              <tbody className="bg-white">
                {currentData.length === 0 ? (
                  <tr>
                    <td colSpan={columns.length} className="text-center py-8 text-gray-500">
                      No data found.
                    </td>
                  </tr>
                ) : (
                  currentData.map((row, index) => (
                    <motion.tr
                      key={row._id || index}
                      custom={index}
                      initial="hidden"
                      animate="visible"
                      variants={fadeUp}
                      className="border-b hover:bg-gray-50 transition-colors"
                    >
                      {columns.map((col, colIndex) => (
                        <td
                          key={colIndex}
                          className={`px-4 py-3 text-gray-800 break-words ${
                            col.align === "right" ? "text-right" : "text-left"
                          }`}
                        >
                          {col.render ? col.render(row) : row[col.key]}
                        </td>
                      ))}
                    </motion.tr>
                  ))
                )}
              </tbody>

            </table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between border-t px-4 py-3 bg-gray-50 text-sm gap-2">
              <span className="text-gray-600 text-center sm:text-left">
                Page <strong>{serverSide ? propCurrentPage : currentPage}</strong> of {totalPages}
              </span>

              <div className="flex justify-center sm:justify-end gap-2">
                <Button variant="outline" size="sm" disabled={currentPage === 1} onClick={handlePrev}>
                  Previous
                </Button>

                <Button variant="outline" size="sm" disabled={currentPage === totalPages} onClick={handleNext}>
                  Next
                </Button>
              </div>
            </div>
          )}

        </div>
      )}
    </motion.div>
  );
}










