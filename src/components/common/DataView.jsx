// src/components/common/DataView.jsx
"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Search,
  Filter,
  Plus,
  Eye,
  Edit,
  Trash2,
  Download,
  MoreHorizontal,
  X,
} from "lucide-react";

const DataView = ({
  title,
  data = [],
  columns = [],
  loading = false,
  searchable = true,
  filterable = true,
  actionable = true,
  paginated = true, // Enable pagination
  itemsPerPageOptions = [10, 25, 50, 100], // Options for items per page
  onSearch,
  onFilter,
  onView,
  onEdit,
  onDelete,
  onCreate,
  onExport,
  searchPlaceholder = "Search...",
  className = "",
  mobileView = true, // Enable mobile responsive cards
}) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedFilters, setSelectedFilters] = useState({});
  const [isMobile, setIsMobile] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(itemsPerPageOptions[0]);

  // Check screen size for responsiveness
  useEffect(() => {
    const checkScreenSize = () => {
      setIsMobile(window.innerWidth < 768);
    };

    checkScreenSize();
    window.addEventListener('resize', checkScreenSize);
    
    return () => window.removeEventListener('resize', checkScreenSize);
  }, []);

  const handleSearch = (value) => {
    setSearchQuery(value);
    onSearch?.(value);
  };

  const handleFilter = (key, value) => {
    const newFilters = { ...selectedFilters, [key]: value };
    setSelectedFilters(newFilters);
    onFilter?.(newFilters);
  };

  const clearSearch = () => {
    setSearchQuery("");
    onSearch?.("");
  };

  // Pagination logic
  const totalPages = Math.ceil(data.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentData = paginated ? data.slice(startIndex, endIndex) : data;

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  const handleItemsPerPageChange = (value) => {
    setItemsPerPage(Number(value));
    setCurrentPage(1); // Reset to first page
  };

  const fadeUp = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.4, ease: "easeOut" },
    },
  };

  // Mobile Card View
  const MobileCardView = ({ item, index }) => (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={fadeUp}
      custom={index * 0.1}
      className="bg-white border rounded-lg p-4 space-y-3 shadow-sm hover:shadow-md transition-shadow"
    >
      {columns.map((column, colIndex) => (
        <div key={colIndex} className="flex justify-between items-start">
          <span className="text-sm font-medium text-gray-500 min-w-[120px]">
            {column.label}:
          </span>
          <span className="text-sm text-gray-900 text-right flex-1 ml-2">
            {column.render ? column.render(item) : item[column.key]}
          </span>
        </div>
      ))}
      
      {actionable && (
        <div className="flex justify-end gap-2 pt-2 border-t">
          {onView && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onView(item)}
              className="h-8 px-2"
            >
              <Eye className="w-3 h-3" />
              <span className="ml-1 text-xs">View</span>
            </Button>
          )}
          {onEdit && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onEdit(item)}
              className="h-8 px-2"
            >
              <Edit className="w-3 h-3" />
              <span className="ml-1 text-xs">Edit</span>
            </Button>
          )}
          {onDelete && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onDelete(item)}
              className="h-8 px-2 text-red-600 hover:text-red-700"
            >
              <Trash2 className="w-3 h-3" />
              <span className="ml-1 text-xs">Delete</span>
            </Button>
          )}
        </div>
      )}
    </motion.div>
  );

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={fadeUp}
      className={`space-y-4 ${className}`}
    >
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex-1 min-w-0">
          <h2 className="text-xl sm:text-2xl font-bold tracking-tight truncate">
            {title}
          </h2>
          <p className="text-sm sm:text-base text-muted-foreground mt-1">
            {data.length} records found
          </p>
        </div>

        <div className="flex flex-col xs:flex-row gap-2 w-full sm:w-auto">
          {/* Create Button */}
          {onCreate && (
            <Button 
              onClick={onCreate} 
              className="w-full xs:w-auto flex items-center justify-center"
              size={isMobile ? "sm" : "default"}
            >
              <Plus className="w-4 h-4 mr-2" />
              Create New
            </Button>
          )}

          {/* Export Button */}
          {onExport && (
            <Button 
              variant="outline" 
              onClick={onExport} 
              className="w-full xs:w-auto flex items-center justify-center"
              size={isMobile ? "sm" : "default"}
            >
              <Download className="w-4 h-4 mr-2" />
              Export
            </Button>
          )}
        </div>
      </div>

      {/* Search and Filters */}
      {(searchable || filterable) && (
        <div className="flex flex-col sm:flex-row gap-3">
          {/* Search */}
          {searchable && (
            <div className="relative flex-1 min-w-0">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder={searchPlaceholder}
                value={searchQuery}
                onChange={(e) => handleSearch(e.target.value)}
                className="pl-9 pr-9 w-full"
              />
              {searchQuery && (
                <button
                  onClick={clearSearch}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>
          )}

          {/* Filters */}
          {filterable && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button 
                  variant="outline" 
                  className="w-full sm:w-auto flex items-center justify-center"
                  size={isMobile ? "sm" : "default"}
                >
                  <Filter className="w-4 h-4 mr-2" />
                  Filters
                  <ChevronDown className="w-4 h-4 ml-2" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuItem onClick={() => onFilter?.({})}>
                  Clear Filters
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>
      )}

      {/* Data Display */}
      {isMobile && mobileView ? (
        // Mobile Card View
        <div className="space-y-4">
          <div className="max-h-96 overflow-y-auto">
            <div className="space-y-3">
              {currentData.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  No data found.
                </div>
              ) : (
                currentData.map((item, index) => (
                  <MobileCardView key={item._id || index} item={item} index={index} />
                ))
              )}
            </div>
          </div>

          {/* Pagination for Mobile */}
          {paginated && totalPages > 1 && (
            <div className="flex flex-col sm:flex-row justify-between items-center gap-4 pt-4 border-t">
              <div className="flex items-center gap-2">
                <Label htmlFor="items-per-page-mobile" className="text-sm">
                  Show:
                </Label>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" size="sm" className="w-16">
                      {itemsPerPage}
                      <ChevronDown className="w-3 h-3 ml-1" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="start">
                    {itemsPerPageOptions.map((option) => (
                      <DropdownMenuItem
                        key={option}
                        onClick={() => handleItemsPerPageChange(option)}
                      >
                        {option}
                      </DropdownMenuItem>
                    ))}
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>

              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                >
                  <ChevronLeft className="w-4 h-4" />
                  Previous
                </Button>
                <span className="text-sm">
                  Page {currentPage} of {totalPages}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === totalPages}
                >
                  Next
                  <ChevronRight className="w-4 h-4" />
                </Button>
              </div>
            </div>
          )}
        </div>
      ) : (
        // Desktop Table View
        <div className="space-y-4">
          <div className="border rounded-lg overflow-hidden max-h-96 overflow-y-auto">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    {columns.map((column, index) => (
                      <TableHead
                        key={index}
                        className={`
                          ${column.align === "right" ? "text-right" : ""}
                          ${isMobile ? "px-2 py-2" : "px-4 py-3"}
                          whitespace-nowrap
                        `}
                      >
                        {column.label}
                      </TableHead>
                    ))}
                    {actionable && (
                      <TableHead className={`text-right ${isMobile ? "px-2 py-2" : "px-4 py-3"}`}>
                        Actions
                      </TableHead>
                    )}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {currentData.length === 0 ? (
                    <TableRow>
                      <TableCell
                        colSpan={columns.length + (actionable ? 1 : 0)}
                        className="text-center h-24 text-muted-foreground"
                      >
                        No data found.
                      </TableCell>
                    </TableRow>
                  ) : (
                    currentData.map((item, rowIndex) => (
                      <TableRow key={item._id || rowIndex} className="hover:bg-muted/50">
                        {columns.map((column, colIndex) => (
                          <TableCell
                            key={colIndex}
                            className={`
                              ${column.align === "right" ? "text-right" : ""}
                              ${isMobile ? "px-2 py-2" : "px-4 py-3"}
                              whitespace-nowrap
                            `}
                          >
                            {column.render ? column.render(item) : item[column.key]}
                          </TableCell>
                        ))}
                        {actionable && (
                          <TableCell className={`text-right ${isMobile ? "px-2 py-2" : "px-4 py-3"}`}>
                            <div className="flex justify-end gap-1">
                              {onView && (
                                <Button
                                  variant="ghost"
                                  size={isMobile ? "icon" : "sm"}
                                  onClick={() => onView(item)}
                                  title="View"
                                >
                                  <Eye className="w-4 h-4" />
                                  {!isMobile && <span className="ml-1">View</span>}
                                </Button>
                              )}
                              {onEdit && (
                                <Button
                                  variant="ghost"
                                  size={isMobile ? "icon" : "sm"}
                                  onClick={() => onEdit(item)}
                                  title="Edit"
                                >
                                  <Edit className="w-4 h-4" />
                                  {!isMobile && <span className="ml-1">Edit</span>}
                                </Button>
                              )}
                              {onDelete && (
                                <Button
                                  variant="ghost"
                                  size={isMobile ? "icon" : "sm"}
                                  onClick={() => onDelete(item)}
                                  title="Delete"
                                  className="text-red-600 hover:text-red-700"
                                >
                                  <Trash2 className="w-4 h-4" />
                                  {!isMobile && <span className="ml-1">Delete</span>}
                                </Button>
                              )}
                            </div>
                          </TableCell>
                        )}
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </div>

          {/* Pagination for Desktop */}
          {paginated && totalPages > 1 && (
            <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
              <div className="flex items-center gap-2">
                <Label htmlFor="items-per-page" className="text-sm">
                  Show:
                </Label>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" size="sm" className="w-16">
                      {itemsPerPage}
                      <ChevronDown className="w-3 h-3 ml-1" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="start">
                    {itemsPerPageOptions.map((option) => (
                      <DropdownMenuItem
                        key={option}
                        onClick={() => handleItemsPerPageChange(option)}
                      >
                        {option}
                      </DropdownMenuItem>
                    ))}
                  </DropdownMenuContent>
                </DropdownMenu>
                <span className="text-sm text-muted-foreground">
                  entries per page
                </span>
              </div>

              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                >
                  <ChevronLeft className="w-4 h-4" />
                  Previous
                </Button>
                <span className="text-sm">
                  Page {currentPage} of {totalPages}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === totalPages}
                >
                  Next
                  <ChevronRight className="w-4 h-4" />
                </Button>
              </div>
            </div>
          )}
        </div>
      )}
    </motion.div>
  );
};

export default DataView;