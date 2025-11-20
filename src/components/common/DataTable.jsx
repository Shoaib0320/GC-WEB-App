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
            <div className="relative flex-1 sm:flex-initial sm:w-64">
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

      {/* TABLE WITH HORIZONTAL SCROLL */}
      {loading ? (
        <div className="flex justify-center items-center py-12">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
            <p className="text-gray-500 mt-2">Loading...</p>
          </div>
        </div>
      ) : (
        <div className="w-full rounded-lg border bg-white shadow-sm overflow-hidden">

          {/* Main Table Container with Horizontal Scroll */}
          <div className="overflow-x-auto w-full">
            <div className="min-w-full inline-block align-middle">
               {/* <div className="inline-block min-w-max align-middle"> */}
              <Table className="w-full min-w-max">
                {/* Table Header */}
                <TableHeader className="bg-gray-50/80 sticky top-0 backdrop-blur-sm">
                  <TableRow className="hover:bg-transparent">
                    {columns.map((col, i) => (
                      <TableHead 
                        key={i}
                        className={`px-4 py-3 text-xs sm:text-sm font-semibold text-gray-700 whitespace-nowrap ${
                          col.align === "right" ? "text-right" : "text-left"
                        } ${col.key === 'actions' ? 'w-20' : ''} ${
                          // col.minWidth ? `min-w-[${col.minWidth}]` : ''
                          `${col.minWidth ? `min-w-[${col.minWidth}px]` : ''}`
                        }`}
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
                        className="text-center py-12 text-gray-500 text-sm"
                      >
                        <div className="flex flex-col items-center justify-center space-y-2">
                          <div className="text-gray-400 text-lg">📊</div>
                          <p className="text-gray-500">No data found</p>
                          {searchQuery && (
                            <p className="text-gray-400 text-xs">
                              Try adjusting your search or filter
                            </p>
                          )}
                        </div>
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
                        className="border-b hover:bg-gray-50/50 transition-colors duration-150"
                      >
                        {columns.map((col, colIndex) => (
                          <TableCell
                            key={colIndex}
                            className={`px-4 py-3 text-xs sm:text-sm text-gray-600 whitespace-nowrap ${
                              col.align === "right" ? "text-right" : "text-left"
                            } ${col.key === 'actions' ? 'w-20' : ''} ${
                              col.className || ''
                            }`}
                          >
                            <div className={`flex items-center ${
                              col.align === "right" ? "justify-end" : "justify-start"
                            } ${col.truncate ? 'truncate max-w-[200px]' : ''}`}>
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
          </div>

          {/* Pagination - Enhanced Responsive */}
          {totalPages > 1 && (
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-t px-4 py-3 bg-gray-50/50 text-xs sm:text-sm">
              {/* Showing info */}
              <div className="text-center sm:text-left text-gray-600 whitespace-nowrap">
                Showing <strong>{showingStart}</strong> to <strong>{showingEnd}</strong> of{" "}
                <strong>{totalItems}</strong> results
              </div>

              {/* Pagination Controls */}
              <div className="flex items-center justify-between sm:justify-end gap-2 flex-wrap">
                {/* Rows per page selector */}
                <div className="flex items-center gap-2 text-gray-600 order-2 sm:order-1">
                  <span className="hidden sm:inline whitespace-nowrap">Rows per page</span>
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
                <div className="flex items-center gap-1 mx-2 text-gray-600 order-1 sm:order-2 whitespace-nowrap">
                  <span className="hidden sm:inline">Page</span>
                  <span className="font-medium">{currentPage}</span>
                  <span>of</span>
                  <span className="font-medium">{totalPages}</span>
                </div>

                {/* Navigation buttons */}
                <div className="flex items-center gap-1 order-3">
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










