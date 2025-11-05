"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Filter } from "lucide-react";

export default function DataTable({
  title,
  icon: Icon,
  columns,
  data = [],
  loading = false,
  rowsPerPage = 5,
}) {
  const [currentPage, setCurrentPage] = useState(1);
  const [filter, setFilter] = useState("all");

  // 🧠 Apply Filter
  const filteredData = data.filter((item) => {
    if (filter === "all") return true;
    if (filter === "confirmed" || filter === "pending" || filter === "cancelled") {
      return item.status === filter;
    }
    if (filter === "thisMonth") {
      const bookingDate = new Date(item.createdAt);
      const now = new Date();
      return (
        bookingDate.getMonth() === now.getMonth() &&
        bookingDate.getFullYear() === now.getFullYear()
      );
    }
    return true;
  });

  // 🧮 Pagination logic
  const totalPages = Math.ceil(filteredData.length / rowsPerPage);
  const startIndex = (currentPage - 1) * rowsPerPage;
  const currentData = filteredData.slice(startIndex, startIndex + rowsPerPage);

  const fadeUp = {
    hidden: { opacity: 0, y: 20 },
    visible: (i = 1) => ({
      opacity: 1,
      y: 0,
      transition: { delay: i * 0.05, duration: 0.3 },
    }),
  };

  const handlePrev = () => {
    if (currentPage > 1) setCurrentPage(currentPage - 1);
  };
  const handleNext = () => {
    if (currentPage < totalPages) setCurrentPage(currentPage + 1);
  };

  const handleFilter = (type) => {
    setFilter(type);
    setCurrentPage(1);
  };

  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={fadeUp}
      className="space-y-4 w-full"
    >
      {/* Header with Filter Button */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        {title && (
          <h2 className="text-lg sm:text-xl font-semibold flex items-center gap-2">
            {Icon && <Icon className="h-5 w-5 text-blue-600" />}
            {title}
          </h2>
        )}

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="sm" className="flex items-center gap-2 w-full sm:w-auto">
              <Filter className="w-4 h-4" />
              Filter
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-40">
            <DropdownMenuItem onClick={() => handleFilter("all")}>All</DropdownMenuItem>
            <DropdownMenuItem onClick={() => handleFilter("confirmed")}>Confirmed</DropdownMenuItem>
            <DropdownMenuItem onClick={() => handleFilter("pending")}>Pending</DropdownMenuItem>
            <DropdownMenuItem onClick={() => handleFilter("cancelled")}>Cancelled</DropdownMenuItem>
            <DropdownMenuItem onClick={() => handleFilter("thisMonth")}>This Month</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Table Section */}
      {loading ? (
        <p className="text-gray-500 text-center sm:text-left">Loading data...</p>
      ) : (
        <div className="overflow-x-auto rounded-xl border bg-white">
          <table className="min-w-[600px] sm:min-w-full text-sm">
            <thead className="bg-gray-50 text-gray-600">
              <tr>
                {columns.map((col, i) => (
                  <th
                    key={i}
                    className={`px-4 py-3 font-medium ${
                      col.align === "right" ? "text-right" : "text-left"
                    }`}
                  >
                    {col.label}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {currentData.length === 0 ? (
                <tr>
                  <td
                    colSpan={columns.length}
                    className="text-center py-6 text-gray-800"
                  >
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
                    className="border-t hover:bg-gray-50 transition"
                  >
                    {columns.map((col, colIndex) => (
                      <td
                        key={colIndex}
                        className={`px-4 py-3 ${
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

          {/* Pagination Footer */}
          {totalPages > 1 && (
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between border-t px-4 py-3 bg-gray-50 text-sm gap-2">
              <span className="text-gray-600 text-center sm:text-left">
                Page <strong>{currentPage}</strong> of {totalPages}
              </span>

              <div className="flex justify-center sm:justify-end gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={currentPage === 1}
                  onClick={handlePrev}
                >
                  Previous
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={currentPage === totalPages}
                  onClick={handleNext}
                >
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
