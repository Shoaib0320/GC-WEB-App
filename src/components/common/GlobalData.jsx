//src/components/common/GlobalData.jsx
"use client";

import React, { useEffect, useState, useCallback } from "react";
import DataTable from "@/components/common/DataTable";
import { Label } from "@/components/ui/label";
import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { CalendarIcon, X } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";

export default function GlobalData({
  title,
  icon,
  fetcher,
  initialFilters = {},
  columns = [],
  limit = 1000,
  searchEnabled = true,
  filterOptions = [],
  serverSide = false,
  rowsPerPage = 5,
  filterKeys = [],
  filterOptionsMap = {},
  onDataFetched,
  customFilters,
  tableHeight = '60vh',
}) {
  const [data, setData] = useState([]);
  const [allItems, setAllItems] = useState([]);
  const [filters, setFilters] = useState(initialFilters);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [page, setPage] = useState(1);
  const [meta, setMeta] = useState({ total: 0, totalPages: 1, page: 1, limit: rowsPerPage });

  const load = useCallback(
    async (opts = {}) => {
      if (!fetcher) return;
      setLoading(true);
      try {
        const activeFilters = opts.filters ?? filters ?? {};

        // Normalize filters
        const normalizedFilters = {};
        Object.keys(activeFilters || {}).forEach((k) => {
          let v = activeFilters[k];
          if (v === undefined || v === null) return;
          if (typeof v === 'string') v = v.trim();
          if (v === "" || v === "all") return;
          if (v === "true") normalizedFilters[k] = true;
          else if (v === "false") normalizedFilters[k] = false;
          else normalizedFilters[k] = v;
        });

        // Handle date objects - convert to ISO string for API
        if (normalizedFilters.fromDate instanceof Date) {
          normalizedFilters.fromDate = normalizedFilters.fromDate.toISOString().split('T')[0];
        }
        if (normalizedFilters.toDate instanceof Date) {
          normalizedFilters.toDate = normalizedFilters.toDate.toISOString().split('T')[0];
        }

        const activeSearch = (opts.search !== undefined) ? opts.search : searchQuery;

        const params = serverSide
          ? {
              page: opts.page || page,
              limit: opts.limit || rowsPerPage,
              ...normalizedFilters,
              ...(activeSearch ? { search: activeSearch } : {}),
            }
          : {};

        let res;
        if (serverSide) {
          res = await fetcher(params);
        } else {
          if (allItems && allItems.length > 0 && !opts.forceFetch) {
            res = allItems;
          } else {
            res = await fetcher();
          }
        }

        // Normalize response
        let items = [];
        let newMeta = { total: 0, totalPages: 1, page: serverSide ? params.page : 1, limit: serverSide ? params.limit : items.length };

        if (!res) {
          items = [];
        } else if (Array.isArray(res)) {
          items = res;
          newMeta = { total: res.length, totalPages: Math.max(1, Math.ceil(res.length / rowsPerPage)), page: 1, limit: rowsPerPage };
        } else if (res.data && Array.isArray(res.data)) {
          items = res.data;
          newMeta = res.meta || { total: items.length, totalPages: Math.max(1, Math.ceil(items.length / rowsPerPage)), page: res.meta?.page || 1, limit: res.meta?.limit || rowsPerPage };
        } else if (res.success && Array.isArray(res.data)) {
          items = res.data;
          newMeta = res.meta || { total: items.length, totalPages: Math.max(1, Math.ceil(items.length / rowsPerPage)), page: res.meta?.page || 1, limit: res.meta?.limit || rowsPerPage };
        } else if (res.data && res.data.data && Array.isArray(res.data.data)) {
          items = res.data.data;
          newMeta = res.data.meta || { total: items.length, totalPages: Math.max(1, Math.ceil(items.length / rowsPerPage)), page: res.data.meta?.page || 1, limit: res.data.meta?.limit || rowsPerPage };
        } else if (res.items && Array.isArray(res.items)) {
          items = res.items;
          newMeta = res.meta || { total: items.length, totalPages: Math.max(1, Math.ceil(items.length / rowsPerPage)), page: res.meta?.page || 1, limit: res.meta?.limit || rowsPerPage };
        } else {
          items = res.data || res.payload || [];
          if (!Array.isArray(items)) items = [];
          newMeta = res.meta || { total: items.length, totalPages: Math.max(1, Math.ceil(items.length / rowsPerPage)), page: 1, limit: rowsPerPage };
        }

        if (serverSide) {
          // Ensure meta contains normalized pagination fields so DataTable can compute pages
          if (newMeta) {
            // try to fill common alternative keys
            if ((newMeta.total === undefined || newMeta.total === null) && (res.total || res.totalAgents)) {
              newMeta.total = res.total || res.totalAgents;
            }
            if (!newMeta.limit || newMeta.limit === 0) {
              newMeta.limit = params.limit || rowsPerPage;
            }
            if (!newMeta.page) {
              newMeta.page = params.page || page || 1;
            }
            if (newMeta.totalPages === undefined || newMeta.totalPages === null) {
              if (typeof newMeta.total === 'number' && typeof newMeta.limit === 'number' && newMeta.limit > 0) {
                newMeta.totalPages = Math.max(1, Math.ceil(newMeta.total / newMeta.limit));
              } else {
                newMeta.totalPages = 1;
              }
            }
          }

          setData(items);
          setMeta(newMeta);
          setPage(newMeta.page || 1);
        } else {
          setAllItems(items);
          const activeFilters = opts.filters ?? filters ?? {};
          const searchTerm = opts.search !== undefined ? opts.search : searchQuery;

          const filtered = items.filter((item) => {
            for (const k of Object.keys(activeFilters || {})) {
              let v = activeFilters[k];
              if (v === undefined || v === null) continue;
              if (typeof v === 'string') v = v.trim();
              if (v === '' || v === 'all') continue;
              if (v === 'true') v = true;
              else if (v === 'false') v = false;

              const itemVal = item[k];
              if (typeof v === 'boolean') {
                if (Boolean(itemVal) !== v) return false;
                continue;
              }

              if (itemVal === undefined || itemVal === null) return false;
              if (String(itemVal).toLowerCase() !== String(v).toLowerCase()) return false;
            }

            if (searchTerm && String(searchTerm).trim()) {
              const q = String(searchTerm).toLowerCase();
              const found = columns.some((col) => {
                try {
                  const value = col.render ? col.render(item) : item[col.key];
                  return String(value).toLowerCase().includes(q);
                } catch (e) {
                  return false;
                }
              });
              if (!found) return false;
            }

            return true;
          });

          const clientMeta = {
            total: filtered.length,
            totalPages: Math.max(1, Math.ceil(filtered.length / rowsPerPage)),
            page: 1,
            limit: rowsPerPage,
          };

          setData(filtered);
          setMeta(clientMeta);
          setPage(1);
          onDataFetched?.(filtered, clientMeta);
        }
      
      } catch (err) {
        console.error("GlobalData load error:", err);
        setData([]);
      } finally {
        setLoading(false);
      }
    },
    [fetcher, filters, rowsPerPage, searchQuery, onDataFetched, page, serverSide, allItems, columns]
  );

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleFilterChange = (key, value) => {
    const newFilters = { ...(filters || {}), [key]: value };
    setFilters(newFilters);

    if (serverSide) {
      load({ page: 1, filters: newFilters });
    } else {
      load({ filters: newFilters });
    }
  };

  const handleSearchChange = (q) => {
    setSearchQuery(q);
    if (serverSide) {
      load({ page: 1, search: q, filters });
    } else {
      load({ search: q });
    }
  };

  const handlePageChange = (p) => {
    if (!serverSide) return;
    setPage(p);
    load({ page: p, filters });
  };

  // Clear all date filters
  const clearDateFilters = () => {
    const newFilters = { ...filters };
    delete newFilters.fromDate;
    delete newFilters.toDate;
    delete newFilters.month;
    setFilters(newFilters);
    
    if (serverSide) {
      load({ page: 1, filters: newFilters });
    } else {
      load({ filters: newFilters });
    }
  };

  const renderFilters = () => {
    if (!filterKeys || filterKeys.length === 0) return null;

    return (
      <div className="mb-4 flex flex-wrap gap-3 items-end">
        {filterKeys.map((key) => (
          <div key={key} className="space-y-1">
            <Label className="text-sm">{key.charAt(0).toUpperCase() + key.slice(1)}</Label>
            <Select
              value={filters[key] ?? "all"}
              onValueChange={(val) => handleFilterChange(key, val)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Filter" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All</SelectItem>
                {(filterOptionsMap[key] || []).map((opt) => (
                  <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        ))}
      </div>
    );
  };

  const renderCustomFilters = () => {
    if (!customFilters) return null;
    
    // If customFilters is provided, use it with enhanced date pickers
    if (typeof customFilters === 'function') {
      return customFilters(filters, handleFilterChange, {
        // Enhanced custom filters with shadcn date pickers
        renderDateFilters: () => (
          <div className="mb-4 flex flex-wrap gap-3 items-end">
            {/* Month Filter */}
            <div className="space-y-1">
              <Label className="text-sm">Month</Label>
              <input
                type="month"
                value={filters.month ?? ''}
                onChange={(e) => handleFilterChange('month', e.target.value)}
                className="border rounded px-3 py-2 text-sm w-40"
              />
            </div>

            {/* From Date Picker */}
            <div className="space-y-1">
              <Label className="text-sm">From Date</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-40 justify-start text-left font-normal",
                      !filters.fromDate && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {filters.fromDate ? (
                      format(filters.fromDate instanceof Date ? filters.fromDate : new Date(filters.fromDate), "PPP")
                    ) : (
                      <span>Pick a date</span>
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={filters.fromDate instanceof Date ? filters.fromDate : filters.fromDate ? new Date(filters.fromDate) : undefined}
                    onSelect={(date) => handleFilterChange('fromDate', date)}
                    initialFocus
                    disabled={(date) => date > new Date()}
                  />
                </PopoverContent>
              </Popover>
            </div>

            {/* To Date Picker */}
            <div className="space-y-1">
              <Label className="text-sm">To Date</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-40 justify-start text-left font-normal",
                      !filters.toDate && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {filters.toDate ? (
                      format(filters.toDate instanceof Date ? filters.toDate : new Date(filters.toDate), "PPP")
                    ) : (
                      <span>Pick a date</span>
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={filters.toDate instanceof Date ? filters.toDate : filters.toDate ? new Date(filters.toDate) : undefined}
                    onSelect={(date) => handleFilterChange('toDate', date)}
                    initialFocus
                    disabled={(date) => date > new Date()}
                  />
                </PopoverContent>
              </Popover>
            </div>

            {/* Clear Filters Button */}
            {(filters.fromDate || filters.toDate || filters.month) && (
              <Button
                variant="outline"
                size="sm"
                onClick={clearDateFilters}
                className="h-10"
              >
                <X className="h-4 w-4 mr-1" />
                Clear Dates
              </Button>
            )}
          </div>
        )
      });
    }
    
    return customFilters;
  };

return (
  <div className="w-full">
    {renderFilters()}
    {renderCustomFilters()}

    {/* Mobile-friendly table wrapper */}
    <div className="w-full overflow-x-auto -mx-4 px-4 sm:mx-0 sm:px-0">
      <div className="min-w-full sm:min-w-max">
        <DataTable
          title={title}
          icon={icon}
          columns={columns}
          data={data}
          loading={loading}
          rowsPerPage={rowsPerPage}
          searchEnabled={searchEnabled}
          filterOptions={serverSide && filterKeys && filterKeys.length > 0 ? [] : filterOptions}
          serverSide={serverSide}
          currentPage={meta.page || page}
          totalPages={meta.totalPages || 1}
          onPageChange={handlePageChange}
          onSearchChange={handleSearchChange}
          onFilterChange={handleFilterChange}
          tableHeight={tableHeight}
        />
      </div>
    </div>
  </div>
);
}








