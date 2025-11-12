"use client";

import { useState, useEffect, useMemo } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
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
  DropdownMenuSeparator,
  DropdownMenuCheckboxItem,
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
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  CheckSquare,
  Square,
  Loader2,
} from "lucide-react";

const DataView = ({
  title,
  icon: Icon,
  data = [],
  columns = [],
  loading = false,
  searchable = true,
  filterable = true,
  sortable = true,
  actionable = true,
  bulkActions = false,
  paginated = true,
  itemsPerPageOptions = [5, 10, 25, 50, 100],
  defaultItemsPerPage = 10,
  searchPlaceholder = "Search...",
  className = "",
  mobileView = true,
  // Enhanced props
  filterOptions = [], // Array of { key, label, options: [{ value, label, filterFn }] }
  sortOptions = [], // Array of { key, label }
  onSearch,
  onFilter,
  onSort,
  onView,
  onEdit,
  onDelete,
  onCreate,
  onExport,
  onBulkAction,
  bulkActionOptions = [], // Array of { label, value, action }
  emptyStateMessage = "No data found.",
  showRecordCount = true,
  maxHeight = "max-h-96",
}) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedFilters, setSelectedFilters] = useState({});
  const [sortConfig, setSortConfig] = useState({ key: null, direction: null });
  const [selectedItems, setSelectedItems] = useState([]);
  const [isMobile, setIsMobile] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(defaultItemsPerPage);

  // Check screen size for responsiveness
  useEffect(() => {
    const checkScreenSize = () => {
      setIsMobile(window.innerWidth < 768);
    };

    checkScreenSize();
    window.addEventListener('resize', checkScreenSize);

    return () => window.removeEventListener('resize', checkScreenSize);
  }, []);

  // Reset to page 1 when search/filter/sort changes
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, selectedFilters, sortConfig]);

  // Enhanced search with multiple column support
  const handleSearch = (value) => {
    setSearchQuery(value);
    onSearch?.(value);
  };

  // Enhanced filtering with custom filter functions
  const handleFilter = (filterKey, filterValue) => {
    const newFilters = { ...selectedFilters };
    if (filterValue === null || filterValue === undefined) {
      delete newFilters[filterKey];
    } else {
      newFilters[filterKey] = filterValue;
    }
    setSelectedFilters(newFilters);
    onFilter?.(newFilters);
  };

  // Sorting handler
  const handleSort = (key) => {
    let direction = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
    onSort?.({ key, direction });
  };

  // Clear search
  const clearSearch = () => {
    setSearchQuery("");
    onSearch?.("");
  };

  // Bulk selection handlers
  const handleSelectAll = (checked) => {
    if (checked) {
      setSelectedItems(currentData.map(item => item._id || item.id));
    } else {
      setSelectedItems([]);
    }
  };

  const handleSelectItem = (itemId, checked) => {
    if (checked) {
      setSelectedItems(prev => [...prev, itemId]);
    } else {
      setSelectedItems(prev => prev.filter(id => id !== itemId));
    }
  };

  // Bulk action handler
  const handleBulkAction = (actionValue) => {
    const selectedData = currentData.filter(item =>
      selectedItems.includes(item._id || item.id)
    );
    onBulkAction?.(actionValue, selectedData);
    setSelectedItems([]);
  };

}
